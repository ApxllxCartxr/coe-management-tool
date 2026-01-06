'use server'

import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createCoeSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    code: z.string().min(2).toUpperCase(),
})

export async function createCoe(formData: FormData) {
    const session = await getAuthSession()
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
        return { success: false, message: "Unauthorized" }
    }

    const parseResult = createCoeSchema.safeParse({
        name: formData.get("name"),
        description: formData.get("description"),
        code: formData.get("code"),
    })

    if (!parseResult.success) {
        return { success: false, message: "Invalid input" }
    }

    const { name, description, code } = parseResult.data

    try {
        await prisma.coe.create({
            data: {
                name,
                description,
                code,
                createdBy: session.user.id,
            },
        })
        revalidatePath("/admin/coes")
        return { success: true }
    } catch (error) {
        console.error(error)
        return { success: false, message: "Failed to create COE. Code might be duplicate." }
    }
}

export async function deleteCoe(id: string) {
    const session = await getAuthSession()
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
        return { success: false, message: "Unauthorized" }
    }

    try {
        await prisma.coe.delete({ where: { id } })
        revalidatePath("/admin/coes")
        return { success: true }
    } catch (error) {
        return { success: false, message: "Failed to delete COE" }
    }
}
