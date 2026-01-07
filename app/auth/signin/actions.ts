"use server"

import { prisma } from "@/lib/prisma"

export async function resetDatabase() {
    try {
        await prisma.$transaction([
            // Leaf nodes (depend on others)
            prisma.attendanceRecord.deleteMany(),
            prisma.activity.deleteMany(),
            prisma.announcement.deleteMany(),
            prisma.invitation.deleteMany(),

            // Junction tables / Dependent entities
            prisma.coeStudent.deleteMany(),
            prisma.coeHead.deleteMany(),
            prisma.attendanceSession.deleteMany(),

            // Core entities
            prisma.coe.deleteMany(),

            // Auth & Users
            prisma.account.deleteMany(),
            prisma.session.deleteMany(),
            prisma.user.deleteMany(),
            prisma.verificationToken.deleteMany(),
        ])

        return { success: true }
    } catch (error) {
        console.error("Failed to reset database:", error)
        return { success: false, error: "Failed to reset database" }
    }
}
