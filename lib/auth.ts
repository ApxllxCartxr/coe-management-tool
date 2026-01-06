import { NextAuthOptions, getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/signin",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        // Placeholder "Dev Login" Provider
        CredentialsProvider({
            name: "Dev Login",
            credentials: {
                email: { label: "Email", type: "text" },
                role: { label: "Role", type: "text" },
            },
            async authorize(credentials: any) {
                if (!credentials?.email) return null

                const { email, role } = credentials
                const userRole = (role as any) || "STUDENT"

                // Upsert user: create if new, update role if exists (for testing flexibility)
                const user = await prisma.user.upsert({
                    where: { email },
                    update: { role: userRole },
                    create: {
                        email,
                        name: email.split("@")[0], // Default name from email part
                        role: userRole,
                        image: `https://ui-avatars.com/api/?name=${email}&background=random`,
                    },
                })

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
                }
            },
        }),
    ],
    callbacks: {
        async session({ token, session }) {
            if (token) {
                session.user.id = token.id
                session.user.name = token.name
                session.user.email = token.email
                session.user.image = token.picture
                session.user.role = token.role
            }
            return session
        },
        async jwt({ token, user }) {
            if (!token.email) return token

            const dbUser = await prisma.user.findFirst({
                where: {
                    email: token.email,
                },
            })

            if (!dbUser) {
                if (user) {
                    token.id = user.id
                }
                return token
            }

            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                picture: dbUser.image,
                role: dbUser.role,
            }
        },
    },
}

export const getAuthSession = () => getServerSession(authOptions)
