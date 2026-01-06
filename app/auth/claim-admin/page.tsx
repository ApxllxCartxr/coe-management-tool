import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { checkCanClaim } from "./actions"
import ClaimAdminButton from "./ClaimAdminButton"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default async function ClaimAdminPage() {
    const session = await getAuthSession()

    if (!session) {
        redirect("/api/auth/signin")
    }

    const canClaim = await checkCanClaim()

    if (!canClaim) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Card className="w-[400px]">
                    <CardHeader>
                        <CardTitle>Super Admin Already Exists</CardTitle>
                        <CardDescription>
                            A super admin has already been claimed for this system. Please contact them for access.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <Card className="w-[400px] shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Welcome to COE Manager</CardTitle>
                    <CardDescription className="text-center">
                        System Initialization
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 text-center">
                            No administrators exist in the system yet. As the first user, you can claim the Super Admin role.
                        </p>
                        <div className="flex justify-center">
                            <ClaimAdminButton />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
