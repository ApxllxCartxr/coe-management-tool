import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const pathname = req.nextUrl.pathname

        if (!token) return NextResponse.redirect(new URL("/api/auth/signin", req.url))

        // Protect Admin Routes
        if (pathname.startsWith("/admin") && token.role !== "SUPER_ADMIN" && token.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url))
        }

        // Protect COE Head Routes
        // Allow Admins to access COE routes as well
        if (pathname.startsWith("/coe") && token.role !== "COE_HEAD" && token.role !== "SUPER_ADMIN" && token.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url))
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
)

export const config = {
    matcher: ["/admin/:path*", "/coe/:path*", "/student/:path*", "/dashboard/:path*", "/settings/:path*"],
}
