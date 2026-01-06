import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AddAdminForm from "./AddAdminForm"
import RemoveAdminButton from "./RemoveAdminButton"

async function getAdmins() {
    return await prisma.user.findMany({
        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
        orderBy: { createdAt: 'desc' }
    })
}

export default async function AdminsPage() {
    const session = await getAuthSession()
    const admins = await getAdmins()
    const isSuperAdmin = session?.user?.role === "SUPER_ADMIN"

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Administrators</h1>
                {isSuperAdmin && (
                    <AddAdminForm />
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>System Admins</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {admins.map((admin) => (
                                <TableRow key={admin.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                {admin.name?.[0] || "U"}
                                            </div>
                                            {admin.name || "Unknown"}
                                        </div>
                                    </TableCell>
                                    <TableCell>{admin.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={admin.role === "SUPER_ADMIN" ? "default" : "outline"}>
                                            {admin.role.replace("_", " ")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {isSuperAdmin && admin.role !== "SUPER_ADMIN" && (
                                            <RemoveAdminButton userId={admin.id} />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
