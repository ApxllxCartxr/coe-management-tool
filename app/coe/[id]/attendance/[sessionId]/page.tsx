import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import LiveQRDisplay from "./LiveQRDisplay"
import LiveTOTPDisplay from "./LiveTOTPDisplay"
import LiveAttendanceList from "./LiveAttendanceList"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { MapPin, Clock } from "lucide-react"

export default async function LiveSessionPage({ params }: { params: Promise<{ id: string, sessionId: string }> }) {
    const { id, sessionId } = await params
    const session = await getAuthSession()
    if (!session) redirect("/api/auth/signin")

    const attSession = await prisma.attendanceSession.findUnique({
        where: { id: sessionId },
        include: {
            coe: true,
            _count: { select: { records: true } }
        }
    })

    if (!attSession) return <div>Session not found</div>
    if (!attSession.isActive) return <div>Session has ended</div>

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold text-gray-900">{attSession.coe.name}</h1>
                <p className="text-xl text-gray-500">Scan to mark attendance</p>
            </div>

            <div className="w-full max-w-md space-y-4">
                <LiveQRDisplay sessionId={attSession.id} />
                {/* Show TOTP only if session type allows or as fallback */}
                <LiveTOTPDisplay sessionId={attSession.id} />
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl text-center">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-center items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            Time Remaining
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-mono text-2xl font-bold">
                            {Math.max(0, Math.ceil((new Date(attSession.endsAt).getTime() - Date.now()) / 60000))} min
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-center items-center gap-2">
                            <MapPin className="w-5 h-5 text-red-600" />
                            Present
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-mono text-2xl font-bold">{attSession._count.records}</p>
                    </CardContent>
                </Card>
            </div>

            <LiveAttendanceList sessionId={attSession.id} />
        </div>
    )
}
