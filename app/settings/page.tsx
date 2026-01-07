import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import ProfileForm from "./ProfileForm"
import PasswordForm from "./PasswordForm"
import { prisma } from "@/lib/prisma"

export default async function SettingsPage() {
    const session = await getAuthSession()

    if (!session?.user?.email) {
        redirect("/api/auth/signin")
    }

    // Refresh user data to get roles etc or just name (session data might be stale if updated recently but NextAuth handles this via strategy)
    // But updateProfile updates DB, session update requires re-login or trigger. 
    // We'll fetch fresh data from DB to populate the form.
    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) {
        return <div>User not found</div>
    }

    return (
        <div className="container max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

            <div className="grid gap-8">
                <ProfileForm
                    initialName={user.name || ""}
                    email={user.email}
                />

                <PasswordForm />
            </div>
        </div>
    )
}
