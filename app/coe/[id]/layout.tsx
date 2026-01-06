import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, LayoutDashboard, Megaphone, CalendarCheck, FileText, LogOut, Settings, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"

export default async function CoeDashboardLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const session = await getAuthSession()
    if (!session) redirect("/api/auth/signin")

    // Verify access
    const membership = await prisma.coeHead.findUnique({
        where: {
            coeId_userId: {
                coeId: id,
                userId: session.user.id
            }
        },
        include: { coe: true }
    })

    // Also allow admins to view/manage
    const isAdmin = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN"

    if (!membership && !isAdmin) {
        redirect("/dashboard")
    }

    const coe = membership?.coe || await prisma.coe.findUnique({ where: { id } })
    if (!coe) redirect("/dashboard")

    const baseUrl = `/coe/${id}`

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r hidden md:flex flex-col">
                <div className="p-6 border-b">
                    <Link href="/coe" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 text-sm">
                        <ArrowLeft className="w-4 h-4" /> Switch COE
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 truncate" title={coe.name}>
                        {coe.name}
                    </h1>
                    <p className="text-xs text-blue-600 font-mono mt-1">{coe.code}</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <Link href={`${baseUrl}/dashboard`} className="flex items-center px-4 py-2.5 text-gray-700 rounded-lg hover:bg-gray-100 group">
                        <LayoutDashboard className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600" />
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link href={`${baseUrl}/students`} className="flex items-center px-4 py-2.5 text-gray-700 rounded-lg hover:bg-gray-100 group">
                        <Users className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600" />
                        <span className="font-medium">Students</span>
                    </Link>
                    <Link href={`${baseUrl}/announcements`} className="flex items-center px-4 py-2.5 text-gray-700 rounded-lg hover:bg-gray-100 group">
                        <Megaphone className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600" />
                        <span className="font-medium">Announcements</span>
                    </Link>
                    <Link href={`${baseUrl}/attendance`} className="flex items-center px-4 py-2.5 text-gray-700 rounded-lg hover:bg-gray-100 group">
                        <CalendarCheck className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600" />
                        <span className="font-medium">Attendance</span>
                    </Link>
                    <Link href={`${baseUrl}/activities`} className="flex items-center px-4 py-2.5 text-gray-700 rounded-lg hover:bg-gray-100 group">
                        <FileText className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600" />
                        <span className="font-medium">Activities</span>
                    </Link>
                </nav>

                <div className="p-4 border-t">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {session.user.name?.[0] || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{session.user.name}</p>
                            <p className="text-xs text-gray-500 font-medium">{session.user.role.replace("_", " ")}</p>
                        </div>
                    </div>
                    <Link href="/api/auth/signout">
                        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-700">
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-10">
                    <h1 className="font-bold truncate max-w-[200px]">{coe.name}</h1>
                    {/* Mobile menu trigger would go here */}
                </header>
                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
