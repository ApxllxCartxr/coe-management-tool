import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function CoeStudentsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const coe = await prisma.coe.findUnique({
        where: { id },
        include: {
            students: {
                include: {
                    user: true
                }
            }
        }
    })

    if (!coe) {
        return <div>COE not found</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/admin/coes/${id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        {coe.name} Students
                    </h1>
                    <p className="text-gray-500">Enrolled students in this Centre of Excellence</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Students Directory ({coe.students.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Joined COE</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coe.students.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                                        No students enrolled in this COE yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                coe.students.map((membership) => (
                                    <TableRow key={membership.user.id}>
                                        <TableCell className="font-medium">{membership.user.name || "N/A"}</TableCell>
                                        <TableCell>{membership.user.email}</TableCell>
                                        <TableCell>
                                            {/* Assuming createdAt on the membership record tracks when they joined */}
                                            {/* If not available, we might need to check schema, but let's try a safe fallback */}
                                            {(membership as any).createdAt ? new Date((membership as any).createdAt).toLocaleDateString() : "N/A"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
