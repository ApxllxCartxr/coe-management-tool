'use server'

import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { SessionType } from "@prisma/client"
import { authenticator } from "otplib"
import crypto from "crypto"

// Configure otplib only when used to avoid top-level side effects
// authenticator.options = { step: 30, window: 1 }

const sessionSchema = z.object({
    sessionDate: z.string().transform(str => new Date(str)),
    sessionType: z.string(), // Simplified from nativeEnum to avoid runtime issues
    durationMinutes: z.coerce.number().min(5).max(480),
    locationLat: z.coerce.number().optional(),
    locationLng: z.coerce.number().optional(),
    locationRadius: z.coerce.number().optional(),
})

export async function createAttendanceSession(coeId: string, formData: FormData) {
    console.log("createAttendanceSession called for COE:", coeId)

    try {
        const session = await getAuthSession()
        if (!session) {
            console.log("No session found")
            return { success: false, message: "Unauthorized" }
        }

        console.log("User:", session.user.id, "Role:", session.user.role)

        // Verify membership
        const membership = await prisma.coeHead.findUnique({
            where: { coeId_userId: { coeId, userId: session.user.id } }
        })

        if (!membership && session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
            console.log("Membership check failed")
            return { success: false, message: "Unauthorized" }
        }

        const rawData = {
            sessionDate: formData.get("sessionDate"),
            sessionType: formData.get("sessionType"),
            durationMinutes: formData.get("durationMinutes"),
            locationLat: formData.get("locationLat"),
            locationLng: formData.get("locationLng"),
            locationRadius: formData.get("locationRadius"),
        }
        console.log("Raw form data:", rawData)

        const parseResult = sessionSchema.safeParse(rawData)

        if (!parseResult.success) {
            console.error("Validation error:", parseResult.error)
            return { success: false, message: "Invalid input: " + parseResult.error.issues[0].message }
        }
        const data = parseResult.data

        // Manual enum validation since we removed nativeEnum
        if (!Object.values(SessionType).includes(data.sessionType as SessionType)) {
            return { success: false, message: "Invalid session type" }
        }

        const startsAt = new Date()
        const endsAt = new Date(startsAt.getTime() + data.durationMinutes * 60000)

        // Generate secrets
        const qrSecret = crypto.randomBytes(32).toString("hex")
        authenticator.options = { step: 30, window: 1 }
        const totpSecret = authenticator.generateSecret()

        // Close any other active sessions for this COE
        await prisma.attendanceSession.updateMany({
            where: { coeId, isActive: true },
            data: { isActive: false }
        })

        const newSession = await prisma.attendanceSession.create({
            data: {
                coeId,
                createdById: session.user.id,
                sessionDate: data.sessionDate,
                sessionType: data.sessionType as SessionType,
                qrSecret,
                totpSecret,
                locationLat: data.locationLat ? Number(data.locationLat) : null,
                locationLng: data.locationLng ? Number(data.locationLng) : null,
                locationRadius: data.locationRadius ? Number(data.locationRadius) : null,
                startsAt,
                endsAt,
                isActive: true
            }
        })

        console.log("Session created successfully:", newSession.id)

        revalidatePath(`/coe/${coeId}/attendance`)
        return { success: true, sessionId: newSession.id }
    } catch (e: any) {
        console.error("Server Action INTERNAL Error:", e)
        // Ensure we strictly return a plain object
        return { success: false, message: e.message || "Failed to create session (Internal)" }
    }
}

export async function endSession(coeId: string, sessionId: string) {
    try {
        await prisma.attendanceSession.update({
            where: { id: sessionId },
            data: { isActive: false }
        })
        revalidatePath(`/coe/${coeId}/attendance`)
        return { success: true }
    } catch (e) {
        return { success: false, message: "Failed to end session" }
    }
}

export async function getLiveAttendance(sessionId: string) {
    try {
        const records = await prisma.attendanceRecord.findMany({
            where: { sessionId },
            include: {
                user: {
                    select: { name: true, email: true, image: true }
                }
            },
            orderBy: { markedAt: 'desc' }
        })
        return { success: true, records }
    } catch (e) {
        return { success: false, records: [] }
    }
}
