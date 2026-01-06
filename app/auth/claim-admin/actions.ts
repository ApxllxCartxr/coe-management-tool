'use server'

import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function claimSuperAdmin() {
    const session = await getAuthSession()

    if (!session?.user?.email) {
        return { success: false, message: "Not authenticated" }
    }

    // Double check if any super admin exists
    const superAdminCount = await prisma.user.count({
        where: { role: Role.SUPER_ADMIN }
    })

    if (superAdminCount > 0) {
        return { success: false, message: "Super Admin already exists" }
    }

    // Update current user
    await prisma.user.update({
        where: { email: session.user.email },
        data: { role: Role.SUPER_ADMIN }
    })

    revalidatePath('/')
    return { success: true }
}

export async function checkCanClaim() {
    const superAdminCount = await prisma.user.count({
        where: { role: Role.SUPER_ADMIN }
    })
    return superAdminCount === 0
}
