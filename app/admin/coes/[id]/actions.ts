'use server'

import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"

export async function appointHead(coeId: string, email: string) {
    const session = await getAuthSession()
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
        return { success: false, message: "Unauthorized" }
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            return { success: false, message: "User not found. They must sign in first." }
        }

        // Check if already head of THIS COE
        const existingHead = await prisma.coeHead.findUnique({
            where: {
                coeId_userId: {
                    coeId,
                    userId: user.id
                }
            }
        })

        if (existingHead) {
            return { success: false, message: "User is already a head of this COE" }
        }

        // Transaction: Update user role and create CoeHead record
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { role: Role.COE_HEAD } // Upgrade role
            }),
            prisma.coeHead.create({
                data: {
                    coeId,
                    userId: user.id,
                    appointedBy: session.user.id
                }
            })
        ])

        revalidatePath(`/admin/coes/${coeId}`)
        return { success: true }
    } catch (error) {
        console.error(error)
        return { success: false, message: "Failed to appoint head" }
    }
}

export async function removeHead(coeId: string, userId: string) {
    const session = await getAuthSession()
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
        return { success: false, message: "Unauthorized" }
    }

    try {
        await prisma.coeHead.delete({
            where: {
                coeId_userId: {
                    coeId,
                    userId
                }
            }
        })

        // Optional: Check if user is head of ANY other COE. If not, maybe demote?
        // For simplicity, we keep them as COE_HEAD role or check count.
        const otherHeadRoles = await prisma.coeHead.count({ where: { userId } })
        if (otherHeadRoles === 0) {
            await prisma.user.update({
                where: { id: userId },
                data: { role: Role.STUDENT }
            })
        }

        revalidatePath(`/admin/coes/${coeId}`)
        return { success: true }
    } catch (error) {
        return { success: false, message: "Failed to remove head" }
    }
}
