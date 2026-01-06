import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import QRScanner from "./QRScanner"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import TOTPInput from "./TOTPInput"

async function getData(userId: string) {
    const student = await prisma.coeStudent.findUnique({
        where: { userId },
        select: { coeId: true }
    })

    // Get active sessions for this student's COE
    const activeSessions = student ? await prisma.attendanceSession.findMany({
        where: { coeId: student.coeId, isActive: true },
        include: { coe: true }
    }) : []

    const history = await prisma.attendanceRecord.findMany({
        where: { userId },
        include: { session: { include: { coe: true } } },
        orderBy: { markedAt: 'desc' },
        take: 20
    })

    return { activeSessions, history }
}

export default async function StudentAttendancePage() {
    const session = await getAuthSession()
    if (!session) return null

    const { activeSessions, history } = await getData(session.user.id)

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Actions Section */}
                <div className="space-y-6 order-first md:order-last">
                    {activeSessions.length > 0 ? (
                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-blue-800">Active Session Found</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {activeSessions.map(s => (
                                    <div key={s.id} className="flex flex-col gap-4">
                                        <p className="font-medium">{s.coe.name} - {s.sessionType}</p>
                                        <div className="flex gap-2">
                                            {/* We show scanner by default, but also TOTP option */}
                                            {/* Since scanner is active by default in other card, we act here as info */}
                                            <TOTPInput sessionId={s.id} />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="py-6 text-center text-gray-500">
                                No active sessions at the moment.
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Scan QR Code</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-black min-h-[300px] rounded-lg overflow-hidden relative flex items-center justify-center">
                                <QRScanner />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* History Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">History</h2>
                    {history.map((record) => (
                        <Card key={record.id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base">{record.session.coe.name}</CardTitle>
                                        <p className="text-xs text-gray-500">{format(new Date(record.markedAt), "PPpp")}</p>
                                    </div>
                                    <Badge className="bg-green-600">Present</Badge>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
