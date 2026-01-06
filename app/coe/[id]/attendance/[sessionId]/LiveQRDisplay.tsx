"use client"

import { useEffect, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function LiveQRDisplay({ sessionId }: { sessionId: string }) {
    const [token, setToken] = useState<string | null>(null)

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const res = await fetch(`/api/attendance/token?sessionId=${sessionId}`)
                if (res.ok) {
                    const data = await res.json()
                    setToken(data.token)
                }
            } catch (e) {
                console.error("Failed to fetch token", e)
            }
        }

        fetchToken()
        const interval = setInterval(fetchToken, 10000) // Refresh every 10s
        return () => clearInterval(interval)
    }, [sessionId])

    return (
        <Card className="aspect-square flex items-center justify-center p-8 border-4 border-black">
            {token ? (
                <QRCodeSVG value={token} size={300} level="H" includeMargin />
            ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p>Generating QR...</p>
                </div>
            )}
        </Card>
    )
}
