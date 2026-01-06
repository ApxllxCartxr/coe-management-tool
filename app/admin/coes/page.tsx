import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import CreateCOEDialog from "./CreateCOEDialog"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Trash } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import DeleteCOEButton from "./DeleteCOEButton"

async function getCoes() {
    return await prisma.coe.findMany({
        include: {
            _count: {
                select: { students: true, heads: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export default async function CoesPage() {
    const coes = await getCoes()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Centres of Excellence</h1>
                <CreateCOEDialog />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All COEs</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Heads</TableHead>
                                <TableHead>Students</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coes.map((coe: any) => (
                                <TableRow key={coe.id}>
                                    <TableCell className="font-mono">{coe.code}</TableCell>
                                    <TableCell className="font-medium">
                                        <Link href={`/admin/coes/${coe.id}`} className="hover:underline text-blue-600">
                                            {coe.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{coe._count.heads}</TableCell>
                                    <TableCell>{coe._count.students}</TableCell>
                                    <TableCell>
                                        <Badge variant={coe.active ? "default" : "secondary"}>
                                            {coe.active ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DeleteCOEButton id={coe.id} />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {coes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        No COEs found. Create one to get started.
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
