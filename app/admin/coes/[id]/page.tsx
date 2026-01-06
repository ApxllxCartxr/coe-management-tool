import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Calendar, UserCheck } from "lucide-react"
import Link from "next/link"
import AppointHeadDialog from "./AppointHeadDialog"
import RemoveHeadButton from "./RemoveHeadButton"

async function getCoe(id: string) {
    return await prisma.coe.findUnique({
        where: { id },
        include: {
            heads: {
                include: { user: true }
            },
            students: {
                include: { user: true }
            },
            _count: {
                select: {
                    announcements: true,
                    activities: true,
                    attendanceSessions: true
                }
            }
        }
    })
}

export default async function CoeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const coe = await getCoe(id)

    if (!coe) {
        return <div>COE not found</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/coes">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                        {coe.name}
                        <Badge variant={coe.active ? "default" : "secondary"}>
                            {coe.code}
                        </Badge>
                    </h1>
                    <p className="text-gray-500">{coe.description || "No description provided."}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Heads Section */}
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-blue-600" />
                            COE Heads
                        </CardTitle>
                        <AppointHeadDialog coeId={coe.id} />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {coe.heads.map((head) => (
                                <div key={head.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                            {head.user.name?.[0] || "H"}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{head.user.name}</p>
                                            <p className="text-xs text-gray-500">{head.user.email}</p>
                                        </div>
                                    </div>
                                    <RemoveHeadButton coeId={coe.id} userId={head.user.id} />
                                </div>
                            ))}
                            {coe.heads.length === 0 && (
                                <p className="text-center text-gray-500 py-4 italic">No heads appointed yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Stats / Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-sm text-gray-500 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Students
                                </span>
                                <span className="font-bold">{coe.students.length}</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-sm text-gray-500">Announcements</span>
                                <span className="font-bold">{coe._count.announcements}</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-sm text-gray-500">Activities</span>
                                <span className="font-bold">{coe._count.activities}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Attendance Sessions</span>
                                <span className="font-bold">{coe._count.attendanceSessions}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start">
                                View All Students
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                Generate Report
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
