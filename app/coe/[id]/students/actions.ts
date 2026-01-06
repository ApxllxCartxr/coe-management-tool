'use server'

import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"
import crypto from "crypto"

export async function createInvitation(coeId: string, email: string) {
    const session = await getAuthSession()
    if (!session) return { success: false, message: "Unauthorized" }

    // Check auth
    const membership = await prisma.coeHead.findUnique({
        where: { coeId_userId: { coeId, userId: session.user.id } }
    })
    const isAdmin = session.user.role === Role.SUPER_ADMIN || session.user.role === Role.ADMIN

    if (!membership && !isAdmin) {
        return { success: false, message: "Unauthorized" }
    }

    try {
        // Check if already student
        const user = await prisma.user.findUnique({ where: { email } })
        if (user) {
            const student = await prisma.coeStudent.findUnique({ where: { userId: user.id } })
            if (student) {
                return { success: false, message: "User is already a student in a COE" }
            }
        }

        const token = crypto.randomBytes(32).toString("hex")
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

        await prisma.invitation.create({
            data: {
                coeId,
                invitedEmail: email,
                invitedById: session.user.id,
                role: Role.STUDENT,
                token,
                expiresAt
            }
        })

        return { success: true, token }
    } catch (e) {
        console.error(e)
        return { success: false, message: "Failed to create invitation" }
    }
}

export async function removeStudent(coeId: string, studentId: string) {
    const session = await getAuthSession()
    if (!session) return { success: false, message: "Unauthorized" }

    // Check auth
    const membership = await prisma.coeHead.findUnique({
        where: { coeId_userId: { coeId, userId: session.user.id } }
    })
    const isAdmin = session.user.role === Role.SUPER_ADMIN || session.user.role === Role.ADMIN

    if (!membership && !isAdmin) {
        return { success: false, message: "Unauthorized" }
    }

    try {
        await prisma.coeStudent.delete({
            where: { id: studentId } // Assuming we pass the CoeStudent ID
        })
        revalidatePath(`/coe/${coeId}/students`)
        return { success: true }
    } catch (e) {
        return { success: false, message: "Failed to remove student" }
    }
}

export async function bulkImportStudents(coeId: string, emailList: string) {
    const session = await getAuthSession()
    if (!session) return { success: false, message: "Unauthorized" }

    // Check auth
    const membership = await prisma.coeHead.findUnique({
        where: { coeId_userId: { coeId, userId: session.user.id } }
    })
    const isAdmin = session.user.role === Role.SUPER_ADMIN || session.user.role === Role.ADMIN

    if (!membership && !isAdmin) {
        return { success: false, message: "Unauthorized" }
    }

    const emails = emailList
        .split(/[\n,]/) // Split by newline or comma
        .map(e => e.trim())
        .filter(e => e && e.includes('@')) // Basic validation

    if (emails.length === 0) {
        return { success: false, message: "No valid emails found" }
    }

    let successCount = 0
    let failCount = 0

    for (const email of emails) {
        try {
            // Upsert user
            const user = await prisma.user.upsert({
                where: { email },
                update: {}, // Don't change existing users
                create: {
                    email,
                    name: email.split("@")[0],
                    role: Role.STUDENT,
                    image: `https://ui-avatars.com/api/?name=${email}&background=random`,
                }
            })

            // Check if already enrolled in ANY COE (Student can strictly be in only one COE)
            const existingStudent = await prisma.coeStudent.findUnique({
                where: { userId: user.id }
            })

            if (existingStudent) {
                if (existingStudent.coeId === coeId) {
                    successCount++ // Already in this COE, count as success
                } else {
                    console.warn(`${email} is already in another COE`)
                    failCount++
                }
            } else {
                await prisma.coeStudent.create({
                    data: {
                        coeId,
                        userId: user.id
                    }
                })
                successCount++
            }
        } catch (error) {
            console.error(`Failed to import ${email}:`, error)
            failCount++
        }
    }

    revalidatePath(`/coe/${coeId}/students`)
    return {
        success: true,
        message: `Imported ${successCount} students. Failed: ${failCount}`,
        count: successCount
    }
}
