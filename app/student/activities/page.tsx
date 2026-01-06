import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import ActivityForm from "./ActivityForm"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

async function getActivities(userId: string) {
    return await prisma.activity.findMany({
        where: { userId },
        orderBy: { activityDate: 'desc' }
    })
}

export default async function ActivitiesPage() {
    const session = await getAuthSession()
    if (!session) return null

    const activities = await getActivities(session.user.id)

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Log Activity Form */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">Log Activity</h1>
                    <ActivityForm />
                </div>

                {/* History */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">History</h2>
                    {activities.map((activity) => (
                        <Card key={activity.id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base">{activity.title}</CardTitle>
                                        <p className="text-xs text-gray-500">{format(new Date(activity.activityDate), "PPP")}</p>
                                    </div>
                                    <Badge variant="outline">{activity.type}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-700">{activity.description}</p>
                                <div className="mt-2 text-xs text-gray-500 flex gap-4">
                                    <span>{Number(activity.hoursSpent)} hours</span>
                                    {activity.proofUrl && (
                                        <a href={activity.proofUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            View Proof
                                        </a>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {activities.length === 0 && (
                        <p className="text-gray-500 text-sm">No activities logged yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
