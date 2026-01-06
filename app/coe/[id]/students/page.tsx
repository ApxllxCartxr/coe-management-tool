import { prisma } from "@/lib/prisma"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import InviteStudentDialog from "./InviteStudentDialog"
import BulkImportStudentsDialog from "./BulkImportStudentsDialog"
import RemoveStudentButton from "./RemoveStudentButton"

async function getStudents(coeId: string) {
    return await prisma.coeStudent.findMany({
        where: { coeId },
        include: { user: true },
        orderBy: { joinedAt: 'desc' }
    })
}

export default async function CoeStudentsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const students = await getStudents(id)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Students</h1>
                <div className="flex items-center gap-2">
                    <BulkImportStudentsDialog coeId={id} />
                    <InviteStudentDialog coeId={id} />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Enrolled Students</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Joined Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student: any) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                {student.user.name?.[0] || "S"}
                                            </div>
                                            {student.user.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{student.user.email}</TableCell>
                                    <TableCell>{format(new Date(student.joinedAt), "MMM d, yyyy")}</TableCell>
                                    <TableCell className="text-right">
                                        <RemoveStudentButton coeId={id} studentId={student.id} />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {students.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                        No students enrolled yet. Invite some to get started.
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
