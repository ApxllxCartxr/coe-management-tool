import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, CalendarCheck, FileText, Megaphone, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"

export default async function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getAuthSession()
    if (!session) redirect("/api/auth/signin")

    // Verify student role or if they are in a COE
    const studentRecord = await prisma.coeStudent.findUnique({
        where: { userId: session.user.id },
        include: { coe: true }
    })

    // If not a student in any COE, redirect to home or some 'Not Enrolled' page
    // But wait, if they have STUDENT role but no COE, they should probably see a 'Join a COE' screen?
    if (!studentRecord) {
        // Allow access to base /student? Or redirect to main landing
        // For now, let's assume they might be here to join or view status.
        // But layout depends on COE context usually.
        // If no COE, maybe show a minimal layout?
        // Let's render children, but sidebar might be empty/generic.
    }

    const coeName = studentRecord?.coe.name || "Student Portal"

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r hidden md:flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-gray-900 truncate" title={coeName}>
                        {coeName}
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">Student Portal</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <Link href="/student/dashboard" className="flex items-center px-4 py-2.5 text-gray-700 rounded-lg hover:bg-gray-100 group">
                        <LayoutDashboard className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600" />
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link href="/student/attendance" className="flex items-center px-4 py-2.5 text-gray-700 rounded-lg hover:bg-gray-100 group">
                        <CalendarCheck className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600" />
                        <span className="font-medium">Attendance</span>
                    </Link>
                    <Link href="/student/activities" className="flex items-center px-4 py-2.5 text-gray-700 rounded-lg hover:bg-gray-100 group">
                        <FileText className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600" />
                        <span className="font-medium">Activities</span>
                    </Link>
                    <Link href="/student/announcements" className="flex items-center px-4 py-2.5 text-gray-700 rounded-lg hover:bg-gray-100 group">
                        <Megaphone className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600" />
                        <span className="font-medium">Announcements</span>
                    </Link>
                    <Link href="/settings" className="flex items-center px-4 py-2.5 text-gray-700 rounded-lg hover:bg-gray-100 group">
                        <Settings className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600" />
                        <span className="font-medium">Settings</span>
                    </Link>
                </nav>

                <div className="p-4 border-t">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {session.user.name?.[0] || "S"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{session.user.name}</p>
                            <p className="text-xs text-gray-500">{session.user.email}</p>
                        </div>
                    </div>
                    <Link href="/api/auth/signout">
                        <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700">
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
                {/* Added bottom padding for mobile nav if needed */}
                <header className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-10">
                    <h1 className="font-bold truncate max-w-[200px]">{coeName}</h1>
                </header>
                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    {!studentRecord ? (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                            <p className="text-sm text-yellow-700">
                                You are not enrolled in any Centre of Excellence. Ask your COE Head for an invitation link.
                            </p>
                        </div>
                    ) : children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 z-50">
                <Link href="/student/dashboard" className="flex flex-col items-center p-2 text-xs text-gray-600 hover:text-blue-600">
                    <LayoutDashboard className="w-5 h-5 mb-1" />
                    Home
                </Link>
                <Link href="/student/attendance" className="flex flex-col items-center p-2 text-xs text-gray-600 hover:text-blue-600">
                    <CalendarCheck className="w-5 h-5 mb-1" />
                    Attend
                </Link>
                <Link href="/student/activities" className="flex flex-col items-center p-2 text-xs text-gray-600 hover:text-blue-600">
                    <FileText className="w-5 h-5 mb-1" />
                    Log
                </Link>
                <Link href="/student/announcements" className="flex flex-col items-center p-2 text-xs text-gray-600 hover:text-blue-600">
                    <Megaphone className="w-5 h-5 mb-1" />
                    News
                </Link>
            </div>
        </div>
    )
}
