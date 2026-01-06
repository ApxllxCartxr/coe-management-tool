import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Megaphone, CalendarCheck, Trophy } from "lucide-react"

async function getStudentStats(userId: string) {
    const [activities, attendanceCount, announcements] = await Promise.all([
        prisma.activity.findMany({
            where: { userId },
            orderBy: { activityDate: 'desc' },
            take: 3
        }),
        prisma.attendanceRecord.count({
            where: { userId }
        }),
        prisma.coeStudent.findUnique({
            where: { userId },
            select: {
                coe: {
                    select: {
                        announcements: {
                            orderBy: [
                                { isPinned: 'desc' },
                                { createdAt: 'desc' }
                            ],
                            take: 3
                        }
                    }
                }
            }
        })
    ])
    return { activities, attendanceCount, announcements: announcements?.coe.announcements || [] }
}

export default async function StudentDashboardPage() {
    const session = await getAuthSession()
    if (!session) return null

    const stats = await getStudentStats(session.user.id)

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Hello, {session.user.name}</h1>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.attendanceCount}</div>
                        <p className="text-xs text-muted-foreground">Days present</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {stats.activities.length > 0 ? (
                            <div className="text-sm font-medium truncate">{stats.activities[0].title}</div>
                        ) : (
                            <div className="text-sm text-gray-500">No activities yet</div>
                        )}
                        <p className="text-xs text-muted-foreground">Last logged</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Announcements */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Megaphone className="w-5 h-5 text-blue-600" />
                            Announcements
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.announcements.map((announcement: any) => (
                                <div key={announcement.id} className="border-b pb-3 last:border-0 last:pb-0">
                                    <h3 className="font-semibold text-sm">{announcement.title}</h3>
                                    <p className="text-xs text-gray-500 mb-1">{format(new Date(announcement.createdAt), "MMM d, h:mm a")}</p>
                                    <p className="text-sm text-gray-600 line-clamp-2">{announcement.content}</p>
                                </div>
                            ))}
                            {stats.announcements.length === 0 && (
                                <p className="text-sm text-gray-500">No new announcements.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activities List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-600" />
                            Your Activities
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.activities.map((activity: any) => (
                                <div key={activity.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                    <div>
                                        <h3 className="font-semibold text-sm">{activity.title}</h3>
                                        <p className="text-xs text-gray-500">{format(new Date(activity.activityDate), "MMM d")}</p>
                                    </div>
                                    <Badge variant="outline">{activity.type}</Badge>
                                </div>
                            ))}
                            {stats.activities.length === 0 && (
                                <p className="text-sm text-gray-500">You haven't logged any activities yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
