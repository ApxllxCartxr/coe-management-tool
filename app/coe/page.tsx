import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Building2 } from "lucide-react"

async function getMyCoes(userId: string) {
    return await prisma.coeHead.findMany({
        where: { userId },
        include: {
            coe: {
                include: {
                    _count: {
                        select: { students: true }
                    }
                }
            }
        }
    })
}

export default async function CoeLandingPage() {
    const session = await getAuthSession()
    if (!session) redirect("/api/auth/signin")

    const myCoes = await getMyCoes(session.user.id)

    if (myCoes.length === 1) {
        redirect(`/coe/${myCoes[0].coeId}/dashboard`)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20 px-4">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome, {session.user.name}</h1>
                <p className="text-gray-500">Select a Centre of Excellence to manage</p>
            </div>

            <div className="grid gap-6 w-full max-w-4xl md:grid-cols-2 lg:grid-cols-3">
                {myCoes.map(({ coe }) => (
                    <Link key={coe.id} href={`/coe/${coe.id}/dashboard`} className="block group">
                        <Card className="h-full transition-shadow hover:shadow-md border-blue-100 hover:border-blue-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                                    <Building2 className="w-5 h-5" />
                                    {coe.name}
                                </CardTitle>
                                <CardDescription>{coe.code}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-end">
                                    <div className="text-sm text-gray-500">
                                        {coe._count.students} Students
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
                {myCoes.length === 0 && (
                    <Card className="col-span-full py-12 text-center">
                        <CardContent>
                            <p className="text-gray-500">You have not been appointed as a Head for any COE yet.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
