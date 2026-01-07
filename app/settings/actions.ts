"use server"

import { getAuthSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
    const session = await getAuthSession()
    if (!session?.user?.email) return { error: "Unauthorized" }

    const name = formData.get("name") as string

    if (!name) return { error: "Name is required" }

    try {
        await prisma.user.update({
            where: { email: session.user.email },
            data: { name }
        })

        revalidatePath("/settings")
        return { success: "Profile updated successfully" }
    } catch (error) {
        return { error: "Failed to update profile" }
    }
}

export async function changePassword(formData: FormData) {
    const session = await getAuthSession()
    if (!session?.user?.email) return { error: "Unauthorized" }

    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: "All fields are required" }
    }

    if (newPassword !== confirmPassword) {
        return { error: "New passwords do not match" }
    }

    if (newPassword.length < 6) {
        return { error: "Password must be at least 6 characters" }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user || !user.password) {
            return { error: "User not found" }
        }

        const isValid = await bcrypt.compare(currentPassword, user.password)

        if (!isValid) {
            return { error: "Incorrect current password" }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.user.update({
            where: { email: session.user.email },
            data: { password: hashedPassword }
        })

        return { success: "Password changed successfully" }
    } catch (error) {
        return { error: "Failed to change password" }
    }
}
