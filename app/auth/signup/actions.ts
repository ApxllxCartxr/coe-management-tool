"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const signupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function registerUser(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries())
    const parseResult = signupSchema.safeParse(rawData)

    if (!parseResult.success) {
        return { error: parseResult.error.issues[0].message }
    }

    const { name, email, password } = parseResult.data

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return { error: "User already exists with this email" }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // First user to sign up becomes the Super Admin
        const userCount = await prisma.user.count()
        const role = userCount === 0 ? "SUPER_ADMIN" : "STUDENT"

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                image: `https://ui-avatars.com/api/?name=${name}&background=random`,
                role: role
            }
        })

        return { success: true }
    } catch (error) {
        console.error("Registration error:", error)
        return { error: "Something went wrong. Please try again." }
    }
}
