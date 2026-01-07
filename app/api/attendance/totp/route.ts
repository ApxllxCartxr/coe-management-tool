import { getAuthSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { authenticator } from "otplib"

// GET /api/attendance/totp?sessionId=...
export const dynamic = "force-dynamic"
export async function GET(request: Request) {
    const session = await getAuthSession()
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) return new NextResponse("Missing sessionId", { status: 400 })

    const attSession = await prisma.attendanceSession.findUnique({
        where: { id: sessionId },
    })

    // Auth check... (simplified)
    if (!attSession) return new NextResponse("Session not found", { status: 404 })

    if (!attSession.totpSecret) return new NextResponse("TOTP Secret not set", { status: 400 })
    const code = authenticator.generate(attSession.totpSecret)
    const timeLeft = authenticator.timeRemaining()

    return NextResponse.json({ code, timeLeft })
}
