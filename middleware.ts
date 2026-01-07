import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
    const token = await getToken({ req })
    const pathname = req.nextUrl.pathname

    // Explicitly allow public files (Backup check in case matcher leaks)
    if (
        pathname === "/manifest.json" ||
        pathname === "/sw.js" ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") || // APIs handle their own auth usually
        pathname === "/favicon.ico"
    ) {
        return NextResponse.next()
    }

    // Role-based Access Control
    // 1. Admin Routes
    if (pathname.startsWith("/admin")) {
        if (!token) return NextResponse.redirect(new URL("/api/auth/signin", req.url))
        if (token.role !== "SUPER_ADMIN" && token.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url))
        }
    }

    // 2. COE Head Routes
    if (pathname.startsWith("/coe")) {
        if (!token) return NextResponse.redirect(new URL("/api/auth/signin", req.url))
        if (token.role !== "COE_HEAD" && token.role !== "SUPER_ADMIN" && token.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url))
        }
    }

    // 3. Student Routes (Example)
    if (pathname.startsWith("/student")) {
        if (!token) return NextResponse.redirect(new URL("/api/auth/signin", req.url))
    }

    // 4. Dashboard/Settings
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/settings")) {
        if (!token) return NextResponse.redirect(new URL("/api/auth/signin", req.url))
    }

    return NextResponse.next()
}

export const config = {
    // Matcher to filter what runs the middleware.
    // We explicitly exclude manifest.json, sw.js, and other static assets
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.png$).*)"],
}
