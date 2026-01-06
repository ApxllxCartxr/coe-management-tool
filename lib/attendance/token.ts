import crypto from 'crypto'

export function generateSessionToken(sessionId: string, secret: string) {
    const timestamp = Date.now()
    const payload = `${sessionId}:${timestamp}`
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    return `${payload}:${signature}`
}

export function verifySessionToken(token: string, sessionId: string, secret: string, windowSeconds = 30) {
    const [tid, ts, sig] = token.split(':')

    if (tid !== sessionId) return false

    // check signature
    const payload = `${tid}:${ts}`
    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig)) === false) return false

    // check time window
    const tokenTime = parseInt(ts)
    const now = Date.now()
    // Allow token if generated within last X seconds
    // We don't want future tokens (clock skew tolerant slightly)
    if (tokenTime > now + 5000) return false // 5s future tolerance
    if (tokenTime < now - (windowSeconds * 1000)) return false

    return true
}
