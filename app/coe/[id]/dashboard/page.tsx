import { prisma } from "@/lib/prisma"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Users, Megaphone, CalendarCheck, Clock } from "lucide-react"

async function getCoeStats(coeId: string) {
    const [studentCount, announcementCount, attendanceCount] = await Promise.all([
        prisma.coeStudent.count({ where: { coeId } }),
        prisma.announcement.count({ where: { coeId } }),
        prisma.attendanceSession.count({ where: { coeId, isActive: true } })
    ])
    return { studentCount, announcementCount, attendanceCount }
}

export default async function CoeDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const stats = await getCoeStats(id)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.studentCount}</div>
                        <p className="text-xs text-muted-foreground">Enrolled in this COE</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Attendance</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.attendanceCount}</div>
                        <p className="text-xs text-muted-foreground">Sessions running now</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Messages</CardTitle>
                        <Megaphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.announcementCount}</div>
                        <p className="text-xs text-muted-foreground">Announcements posted</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
