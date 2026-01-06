import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import AcceptInviteButton from "./AcceptInviteButton"
import Link from "next/link"

async function getInvitation(token: string) {
    return await prisma.invitation.findUnique({
        where: { token },
        include: { coe: true, inviter: true }
    })
}

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params
    const session = await getAuthSession()
    const invitation = await getInvitation(token)

    if (!invitation) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Card className="w-[400px]">
                    <CardHeader>
                        <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
                        <CardDescription>This invitation link is invalid or expired.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Link href="/">
                            <Button variant="outline">Go Home</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    // Auto-redirect to login if not signed in
    if (!session) {
        redirect(`/api/auth/signin?callbackUrl=/invite/${token}`)
    }

    const isExpired = new Date() > invitation.expiresAt
    const isUsed = !!invitation.usedAt
    const emailMismatch = session.user.email?.toLowerCase() !== invitation.invitedEmail.toLowerCase()

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle>Join {invitation.coe.name}</CardTitle>
                    <CardDescription>
                        You have been invited to join <strong>{invitation.coe.name}</strong> as a Student.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                        <p><strong>Invited Email:</strong> {invitation.invitedEmail}</p>
                        <p><strong>Invited By:</strong> {invitation.inviter.name}</p>
                    </div>

                    {isExpired && <p className="text-red-600 text-center font-medium">This invitation has expired.</p>}
                    {isUsed && <p className="text-yellow-600 text-center font-medium">This invitation has already been used.</p>}
                    {emailMismatch && (
                        <div className="text-red-600 text-sm text-center">
                            <p>You are signed in as <strong>{session.user.email}</strong>.</p>
                            <p>This invitation is for <strong>{invitation.invitedEmail}</strong>.</p>
                            <p>Please sign out and sign in with the correct account.</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    {!isExpired && !isUsed && !emailMismatch && (
                        <AcceptInviteButton token={token} />
                    )}
                    {emailMismatch && (
                        <Link href="/api/auth/signout" className="w-full">
                            <Button variant="outline" className="w-full">Sign Out</Button>
                        </Link>
                    )}
                    <Link href="/" className="w-full">
                        <Button variant="ghost" className="w-full">Cancel</Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
