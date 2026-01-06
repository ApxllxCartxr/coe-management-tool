import { getAuthSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSessionToken } from "@/lib/attendance/token"
import { NextResponse } from "next/server"

// GET /api/attendance/token?sessionId=...
export async function GET(request: Request) {
    const session = await getAuthSession()
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) return new NextResponse("Missing sessionId", { status: 400 })

    // Verify access (Head or Admin)
    const attSession = await prisma.attendanceSession.findUnique({
        where: { id: sessionId },
        include: { coe: true }
    })

    if (!attSession) return new NextResponse("Session not found", { status: 404 })

    const isHead = await prisma.coeHead.findUnique({
        where: { coeId_userId: { coeId: attSession.coeId, userId: session.user.id } }
    })
    if (!isHead && session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 403 })
    }

    // Generate token
    if (!attSession.qrSecret) return new NextResponse("QR Secret not set for this session", { status: 400 })

    const token = generateSessionToken(sessionId, attSession.qrSecret)

    return NextResponse.json({ token, expiresAt: Date.now() + 15000 }) // Client should refresh in 15s
}
