import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const pathname = req.nextUrl.pathname

        // Role-based redirects for authenticated users accessing protected routes
        // Role-based redirects for authenticated users accessing protected routes
        // Note: 'authorized' callback handles the generic "is logged in" check.
        // We only need to handle role-specific logic here.

        // Protect Admin Routes
        if (pathname.startsWith("/admin") && token?.role !== "SUPER_ADMIN" && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url))
        }

        // Protect COE Head Routes
        if (pathname.startsWith("/coe") && token?.role !== "COE_HEAD" && token?.role !== "SUPER_ADMIN" && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url))
        }
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const pathname = req.nextUrl.pathname

                // Define protected paths
                const protectedPaths = ["/admin", "/coe", "/student", "/dashboard", "/settings"]
                const isProtected = protectedPaths.some(p => pathname.startsWith(p))

                // If path is protected, require token. Otherwise allow (e.g. /, /auth, /manifest.json)
                if (isProtected) {
                    return !!token
                }

                // Allow all other paths
                return true
            },
        },
    }
)

export const config = {
    // Match everything EXCEPT static files and APIs (APIs usually have their own auth, but we can include them if needed)
    // We explicitly exclude manifest.json, sw.js, and other static assets
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.png$).*)"],
}
