'use server'

import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { ActivityType } from "@prisma/client"

const activitySchema = z.object({
    title: z.string().min(3),
    activityDate: z.string().transform((str) => new Date(str)),
    type: z.nativeEnum(ActivityType),
    description: z.string().optional(),
    hoursSpent: z.coerce.number().min(0.5).max(24),
    proofUrl: z.string().url().optional().or(z.literal('')),
})

export async function logActivity(formData: FormData) {
    const session = await getAuthSession()
    if (!session) return { success: false, message: "Unauthorized" }

    // Get COE ID
    const student = await prisma.coeStudent.findUnique({
        where: { userId: session.user.id }
    })

    if (!student) {
        return { success: false, message: "You are not enrolled in a COE" }
    }

    const parseResult = activitySchema.safeParse({
        title: formData.get("title"),
        activityDate: formData.get("activityDate"),
        type: formData.get("type"),
        description: formData.get("description"),
        hoursSpent: formData.get("hoursSpent"),
        proofUrl: formData.get("proofUrl"),
    })

    if (!parseResult.success) {
        return { success: false, message: "Invalid input" }
    }

    const data = parseResult.data

    try {
        await prisma.activity.create({
            data: {
                userId: session.user.id,
                coeId: student.coeId,
                title: data.title,
                activityDate: data.activityDate,
                type: data.type,
                description: data.description,
                hoursSpent: data.hoursSpent,
                proofUrl: data.proofUrl || null
            }
        })
        revalidatePath("/student/activities")
        revalidatePath("/student/dashboard") // Update recent activities stats
        return { success: true }
    } catch (e) {
        console.error(e)
        return { success: false, message: "Failed to log activity" }
    }
}
