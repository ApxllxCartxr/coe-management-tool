'use server'

import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const announcementSchema = z.object({
    title: z.string().min(5),
    content: z.string().min(10),
    isPinned: z.coerce.boolean().optional(),
})

export async function createAnnouncement(coeId: string, formData: FormData) {
    const session = await getAuthSession()
    if (!session) return { success: false, message: "Unauthorized" }

    // Verify membership
    const membership = await prisma.coeHead.findUnique({
        where: { coeId_userId: { coeId, userId: session.user.id } }
    })
    if (!membership && session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
        return { success: false, message: "Unauthorized" }
    }

    const parseResult = announcementSchema.safeParse({
        title: formData.get("title"),
        content: formData.get("content"),
        isPinned: formData.get("isPinned") === "on",
    })

    if (!parseResult.success) return { success: false, message: "Invalid input" }
    const { title, content, isPinned } = parseResult.data

    try {
        await prisma.announcement.create({
            data: {
                coeId,
                createdById: session.user.id,
                title,
                content,
                isPinned: isPinned || false
            }
        })
        revalidatePath(`/coe/${coeId}/announcements`)
        return { success: true }
    } catch (e) {
        return { success: false, message: "Failed to create announcement" }
    }
}

export async function deleteAnnouncement(coeId: string, announcementId: string) {
    const session = await getAuthSession()
    if (!session) return { success: false, message: "Unauthorized" }

    // Verify membership
    const membership = await prisma.coeHead.findUnique({
        where: { coeId_userId: { coeId, userId: session.user.id } }
    })
    if (!membership && session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
        return { success: false, message: "Unauthorized" }
    }

    try {
        await prisma.announcement.delete({ where: { id: announcementId } })
        revalidatePath(`/coe/${coeId}/announcements`)
        return { success: true }
    } catch (e) {
        return { success: false, message: "Failed to delete" }
    }
}
