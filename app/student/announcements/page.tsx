import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { Pin } from "lucide-react"

async function getAnnouncements(userId: string) {
    const student = await prisma.coeStudent.findUnique({
        where: { userId },
        select: { coeId: true }
    })

    if (!student) return []

    return await prisma.announcement.findMany({
        where: { coeId: student.coeId },
        include: { author: true },
        orderBy: [
            { isPinned: 'desc' },
            { createdAt: 'desc' }
        ]
    })
}

export default async function StudentAnnouncementsPage() {
    const session = await getAuthSession()
    if (!session) return null

    const announcements = await getAnnouncements(session.user.id)

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Announcements</h1>

            <div className="space-y-4">
                {announcements.map((announcement) => (
                    <Card key={announcement.id} className={announcement.isPinned ? "border-blue-200 bg-blue-50/30" : ""}>
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    {announcement.isPinned && <Pin className="w-4 h-4 text-blue-600 fill-blue-600 transform rotate-45" />}
                                    {announcement.title}
                                </CardTitle>
                                <p className="text-xs text-gray-500">
                                    Posted by {announcement.author.name} on {format(new Date(announcement.createdAt), "PPP p")}
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                                {announcement.content}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {announcements.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No announcements yet.
                    </div>
                )}
            </div>
        </div>
    )
}
