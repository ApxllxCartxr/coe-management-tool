'use server'

import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { verifySessionToken } from "@/lib/attendance/token"

export async function markAttendance(token: string, lat?: number, lng?: number) {
    const session = await getAuthSession()
    if (!session) return { success: false, message: "Unauthorized" }

    const [sessionId, timestamp] = token.split(':')
    if (!sessionId || !timestamp) return { success: false, message: "Invalid QR code" }

    try {
        // Fetch session
        const attSession = await prisma.attendanceSession.findUnique({
            where: { id: sessionId }
        })

        if (!attSession) return { success: false, message: "Session not found" }
        if (!attSession.isActive) return { success: false, message: "Session has ended" }

        // Verify Token signature && time window
        const isValid = verifySessionToken(token, sessionId, attSession.qrSecret)
        if (!isValid) return { success: false, message: "Invalid or expired QR code. Please scan again." }

        // Check duplications
        const existingRecord = await prisma.attendanceRecord.findUnique({
            where: {
                sessionId_userId: {
                    sessionId,
                    userId: session.user.id
                }
            }
        })
        if (existingRecord) return { success: false, message: "Attendance already marked." }

        // Location Check (Optional)
        if (attSession.locationLat && attSession.locationLng && attSession.locationRadius) {
            if (!lat || !lng) return { success: false, message: "Location permission required for this session." }

            const distance = getDistanceFromLatLonInKm(lat, lng, attSession.locationLat, attSession.locationLng) * 1000 // meters
            if (distance > attSession.locationRadius) {
                return { success: false, message: `You are too far from the session location (${Math.round(distance)}m away).` }
            }
        }

        // Mark Attendance
        await prisma.attendanceRecord.create({
            data: {
                sessionId,
                userId: session.user.id,
                coeId: attSession.coeId,
                status: "PRESENT",
                ipAddress: "0.0.0.0", // In real app, get from headers
                deviceInfo: "Web Browser", // In real app, get from user-agent
                locationLat: lat,
                locationLng: lng
            }
        })

        revalidatePath("/student/dashboard")
        return { success: true }

    } catch (e) {
        console.error(e)
        return { success: false, message: "Verification failed" }
    }
}

// Distance Helper (Haversine)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
}
