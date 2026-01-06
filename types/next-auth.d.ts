import { Role } from "@prisma/client"
import type { User } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: User & {
            id: string
            role: Role
        }
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: Role
    }
}
