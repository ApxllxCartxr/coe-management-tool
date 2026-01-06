import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Role } from "@prisma/client"

import ActivitiesFilter from "./ActivitiesFilter"
import { ActivityType } from "@prisma/client"

async function getCoeActivities(coeId: string, search?: string, type?: string) {
    const whereClause: any = { coeId }

    if (type && type !== "ALL") {
        whereClause.type = type as ActivityType
    }

    if (search) {
        whereClause.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { user: { email: { contains: search, mode: 'insensitive' } } }
        ]
    }

    return await prisma.activity.findMany({
        where: whereClause,
        include: {
            user: {
                select: { name: true, email: true, image: true }
            }
        },
        orderBy: { activityDate: 'desc' }
    })
}

export default async function CoeActivitiesPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ search?: string, type?: string }>
}) {
    const { id } = await params
    const { search, type } = await searchParams

    const session = await getAuthSession()
    if (!session) redirect("/api/auth/signin")

    // Auth Check
    const membership = await prisma.coeHead.findUnique({
        where: { coeId_userId: { coeId: id, userId: session.user.id } }
    })
    const isAdmin = session.user.role === Role.SUPER_ADMIN || session.user.role === Role.ADMIN

    if (!membership && !isAdmin) {
        return <div>Unauthorized</div>
    }

    const activities = await getCoeActivities(id, search, type)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Student Activities</h1>
            </div>

            <ActivitiesFilter />

            <Card>
                <CardHeader>
                    <CardTitle>Activity Logs</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Hours</TableHead>
                                <TableHead>Proof</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activities.map((activity: any) => (
                                <TableRow key={activity.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{activity.user.name}</p>
                                            <p className="text-xs text-muted-foreground">{activity.user.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{format(new Date(activity.activityDate), "MMM d, yyyy")}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{activity.type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <p className="truncate max-w-[200px]" title={activity.title}>{activity.title}</p>
                                        {activity.description && (
                                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{activity.description}</p>
                                        )}
                                    </TableCell>
                                    <TableCell>{Number(activity.hoursSpent)}</TableCell>
                                    <TableCell>
                                        {activity.proofUrl ? (
                                            <a
                                                href={activity.proofUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-sm"
                                            >
                                                View
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 text-sm">-</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {activities.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        No activities logged yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
