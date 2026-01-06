'use server'

import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"

export async function addAdmin(formData: FormData) {
    const session = await getAuthSession()
    if (!session || session.user.role !== "SUPER_ADMIN") {
        return { success: false, message: "Only Super Admins can add other admins" }
    }

    const email = formData.get("email") as string

    if (!email) return { success: false, message: "Email required" }

    try {
        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            // In a real system, we might create an invite record. 
            // For now, checks if user exists. If not, we can't assign role yet (Cold Start limitation).
            // Alternatively, create a "User" record with email only?
            return { success: false, message: "User not found. They must sign in once first." }
        }

        await prisma.user.update({
            where: { email },
            data: { role: Role.ADMIN }
        })

        revalidatePath("/admin/admins")
        return { success: true }
    } catch (error) {
        return { success: false, message: "Failed to add admin" }
    }
}

export async function removeAdmin(userId: string) {
    const session = await getAuthSession()
    if (!session || session.user.role !== "SUPER_ADMIN") {
        return { success: false, message: "Unauthorized" }
    }

    if (userId === session.user.id) {
        return { success: false, message: "Cannot remove yourself" }
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: Role.STUDENT } // Demote to student/default
        })
        revalidatePath("/admin/admins")
        return { success: true }
    } catch (error) {
        return { success: false, message: "Failed to remove admin" }
    }
}
