'use server'

import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"

export async function acceptInvitation(token: string) {
    const session = await getAuthSession()
    if (!session || !session.user.email) {
        return { success: false, message: "Please sign in first" }
    }

    try {
        const invitation = await prisma.invitation.findUnique({
            where: { token },
            include: { coe: true }
        })

        if (!invitation) return { success: false, message: "Invalid invitation" }
        if (invitation.usedAt) return { success: false, message: "Invitation already used" }
        if (new Date() > invitation.expiresAt) return { success: false, message: "Invitation expired" }

        // Security check: Email must match (or be strictly allowed?)
        // If the invited email is different from logged in email, we could block or warn.
        // For now, let's enforce exact match to prevent link stealing.
        if (invitation.invitedEmail.toLowerCase() !== session.user.email.toLowerCase()) {
            return { success: false, message: `This invitation is for ${invitation.invitedEmail}, but you are signed in as ${session.user.email}. Please sign in with the correct account.` }
        }

        // Create CoeStudent record
        await prisma.$transaction([
            prisma.coeStudent.create({
                data: {
                    coeId: invitation.coeId,
                    userId: session.user.id,
                    invitedBy: invitation.invitedById
                }
            }),
            prisma.invitation.update({
                where: { id: invitation.id },
                data: { usedAt: new Date() }
            }),
            // Ensure user has STUDENT role (or keep current if higher?)
            // If they are Admin/Head elsewhere, we don't downgrade.
            // If they are just STUDENT/User, fine.
        ])

        return { success: true, coeId: invitation.coeId }
    } catch (e) {
        console.error(e)
        return { success: false, message: "Failed to join COE. You might already be a member of another COE." }
    }
}
