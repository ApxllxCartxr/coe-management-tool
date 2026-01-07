"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { registerUser } from "./actions"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        const formData = new FormData(e.currentTarget)
        const result = await registerUser(formData)

        if (result.error) {
            setError(result.error)
            setIsLoading(false)
        } else if (result.success) {
            // Redirect to sign in page with success parameter if desired, or just push
            router.push("/auth/signin")
        }
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
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <line x1="20" x2="20" y1="8" y2="14" />
                                <line x1="23" x2="17" y1="11" y2="11" />
                            </svg>
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">Create an account</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Enter your details to create your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="John Doe"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-blue-500"
                                    required
                                    minLength={6}
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-500 text-center">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-11"
                                disabled={isLoading}
                            >
                                {isLoading ? "Creating account..." : "Sign Up"}
                            </Button>
                        </form>

                        <p className="text-center text-sm text-zinc-500 pt-2">
                            Already have an account?{" "}
                            <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300 hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
