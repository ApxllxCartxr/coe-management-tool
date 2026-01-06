import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import CreateAnnouncementDialog from "./CreateAnnouncementDialog"
import DeleteAnnouncementButton from "./DeleteAnnouncementButton"
import { Pin } from "lucide-react"

async function getAnnouncements(coeId: string) {
    return await prisma.announcement.findMany({
        where: { coeId },
        include: { author: true },
        orderBy: [
            { isPinned: 'desc' },
            { createdAt: 'desc' }
        ]
    })
}

export default async function AnnouncementsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const announcements = await getAnnouncements(id)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Announcements</h1>
                <CreateAnnouncementDialog coeId={id} />
            </div>

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
                            <DeleteAnnouncementButton coeId={id} announcementId={announcement.id} />
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                                {announcement.content}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {announcements.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed">
                        It's quiet here. Post an announcement to get started.
                    </div>
                )}
            </div>
        </div>
    )
}
