"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SignInPage() {
    const [email, setEmail] = useState("")
    const [role, setRole] = useState("STUDENT")

    const handleGoogleSignIn = () => {
        signIn("google", { callbackUrl: "/" })
    }

    const handleDevLogin = () => {
        if (!email) return
        signIn("credentials", {
            email,
            role,
            callbackUrl: "/"
        })
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 relative overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full opacity-30 animate-pulse pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-full max-w-md space-y-8">

                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>

                <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="text-center space-y-4 pb-2">
                        <div className="mx-auto w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-2">
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                height="24"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                width="24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                            </svg>
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">Sign in to your account</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Welcome back! Please sign in to continue.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 pt-6">
                        <Button
                            variant="outline"
                            className="w-full h-12 bg-white text-black hover:bg-zinc-200 border-0 font-medium text-base rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                            onClick={handleGoogleSignIn}
                        >
                            <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                            Continue with Google
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#0a0a0a] px-2 text-zinc-500">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <div className="grid gap-1">
                                <Label htmlFor="email" className="text-zinc-400">Email</Label>
                                <Input
                                    id="email"
                                    placeholder="name@example.com"
                                    type="email"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-blue-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-1">
                                <Label htmlFor="role" className="text-zinc-400">Role</Label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-blue-500">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                        <SelectItem value="STUDENT">Student</SelectItem>
                                        <SelectItem value="COE_HEAD">COE Head</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                        <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={handleDevLogin}
                                disabled={!email}
                            >
                                Dev Login
                            </Button>
                        </div>

                        <div className="text-center text-xs text-zinc-500">
                            By clicking continue, you agree to our <span className="underline hover:text-zinc-300 cursor-pointer">Terms of Service</span> and <span className="underline hover:text-zinc-300 cursor-pointer">Privacy Policy</span>.
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
