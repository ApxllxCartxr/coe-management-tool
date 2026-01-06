"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authenticator } from "otplib"
import { Keyboard } from "lucide-react"

// Note: In real app, we shouldn't expose secret to client directly in a real way.
// But calling authenticator on client requires it. 
// A safer way is to fetch the "current code" from API every 30s.

export default function LiveTOTPDisplay({ sessionId }: { sessionId: string }) {
    const [code, setCode] = useState("Loading...")
    const [timeLeft, setTimeLeft] = useState(30)

    useEffect(() => {
        const fetchCode = async () => {
            try {
                // We'll reuse the token API but ask for TOTP code instead?
                // Or just create a new endpoint. 
                // For speed, let's create a specialized action or hook.
                // Actually, let's just make a new API route /api/attendance/totp
                const res = await fetch(`/api/attendance/totp?sessionId=${sessionId}`)
                if (res.ok) {
                    const data = await res.json()
                    setCode(data.code)
                    setTimeLeft(data.timeLeft)
                }
            } catch (e) { }
        }
        fetchCode()
        const interval = setInterval(fetchCode, 5000)
        return () => clearInterval(interval)
    }, [sessionId])

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Keyboard className="w-5 h-5 text-purple-600" />
                    Manual Code
                </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <div className="text-6xl font-mono font-bold tracking-widest text-gray-800">
                    {code}
                </div>
                <p className="text-sm text-gray-500 mt-2">Refreshes in {timeLeft}s</p>
            </CardContent>
        </Card>
    )
}
