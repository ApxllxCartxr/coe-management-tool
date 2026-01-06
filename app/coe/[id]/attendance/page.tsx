import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import CreateSessionDialog from "./CreateSessionDialog"
import Link from "next/link"
import { Play, Square } from "lucide-react"
import EndSessionButton from "./EndSessionButton"

async function getSessions(coeId: string) {
    return await prisma.attendanceSession.findMany({
        where: { coeId },
        include: {
            _count: {
                select: { records: true }
            }
        },
        orderBy: { startsAt: 'desc' }
    })
}

export default async function AttendancePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const sessions = await getSessions(id)
    const activeSession = sessions.find(s => s.isActive)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Attendance</h1>
                {/* Only allow creating if no active session */}
                {!activeSession && <CreateSessionDialog coeId={id} />}
            </div>

            {activeSession && (
                <Card className="border-green-500 border-2 bg-green-50/20">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-green-700 flex items-center gap-2">
                                <Play className="w-5 h-5 fill-green-700" />
                                Active Session Running
                            </CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                                Started at {format(new Date(activeSession.startsAt), "p")} • Ends at {format(new Date(activeSession.endsAt), "p")}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link href={`./attendance/${activeSession.id}`}>
                                <Button variant="default">View Live Dashboard</Button>
                            </Link>
                            <EndSessionButton coeId={id} sessionId={activeSession.id} />
                        </div>
                    </CardHeader>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Session History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {sessions.filter(s => !s.isActive).map(session => (
                            <div key={session.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div>
                                    <div className="font-semibold">{format(new Date(session.sessionDate), "PPP")}</div>
                                    <div className="text-xs text-gray-500">
                                        {format(new Date(session.startsAt), "p")} - {format(new Date(session.endsAt), "p")}
                                    </div>
                                    <Badge variant="outline" className="mt-1">{session.sessionType}</Badge>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold">{session._count.records}</div>
                                    <div className="text-xs text-gray-500">Present</div>
                                </div>
                            </div>
                        ))}
                        {sessions.filter(s => !s.isActive).length === 0 && (
                            <p className="text-gray-500 text-sm">No past sessions.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
