import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, LayoutDashboard, Building2, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getAuthSession()

    if (!session) {
        redirect("/api/auth/signin")
    }

    // Double check role
    if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
        redirect("/dashboard")
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r hidden md:flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        COE Manager
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <Link href="/admin/dashboard" className="flex items-center px-4 py-2.5 text-gray-700 rounded-lg hover:bg-gray-100 group transition-colors">
                        <LayoutDashboard className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600" />
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link href="/admin/coes" className="flex items-center px-4 py-2.5 text-gray-700 rounded-lg hover:bg-gray-100 group transition-colors">
                        <Building2 className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600" />
                        <span className="font-medium">Centres (COEs)</span>
                    </Link>
                    <Link href="/admin/admins" className="flex items-center px-4 py-2.5 text-gray-700 rounded-lg hover:bg-gray-100 group transition-colors">
                        <Users className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600" />
                        <span className="font-medium">Administrators</span>
                    </Link>
                    <Link href="/admin/settings" className="flex items-center px-4 py-2.5 text-gray-700 rounded-lg hover:bg-gray-100 group transition-colors">
                        <Settings className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600" />
                        <span className="font-medium">Settings</span>
                    </Link>
                </nav>

                <div className="p-4 border-t">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {session.user.name?.[0] || "A"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{session.user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                        </div>
                    </div>
                    <Link href="/api/auth/signout">
                        <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-10">
                    <h1 className="font-bold">COE Manager</h1>
                    {/* Mobile menu trigger would go here */}
                </header>
                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
