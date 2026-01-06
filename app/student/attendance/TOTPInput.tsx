"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { markManualAttendance } from "./manual-action"
import { toast } from "sonner"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Keyboard } from "lucide-react"

export default function TOTPInput({ sessionId }: { sessionId: string }) { // Note: Student needs to know Session ID?
    // Problem: How does student know Session ID if they can't scan?
    // Option A: Active Session List on Student Dashboard (if in COE).
    // Option B: Head displays a short "Session Code" (Not implemented).
    // Option C: We list "Active Sessions" in the Attendance Page.

    // Implemented Option C in logic below: The parent page will pass session ID from the list of active sessions.

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [code, setCode] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Get location
        let lat, lng
        try {
            if (navigator.geolocation) {
                const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    })
                })
                lat = pos.coords.latitude
                lng = pos.coords.longitude
            }
        } catch (e: any) {
            console.log("Location fetch failed:", e.message)
            toast.warning("Could not get location. If this session requires it, attendance may fail.")
        }

        try {
            const result = await markManualAttendance(sessionId, code, lat, lng)
            if (result.success) {
                toast.success("Attendance Marked!")
                setOpen(false)
            } else {
                toast.error(result.message)
            }
        } catch (e) {
            toast.error("Error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Keyboard className="w-4 h-4 mr-2" />
                    Enter Code
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enter Attendance Code</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="text-center">
                        <Input
                            name="code"
                            placeholder="000000"
                            className="text-center text-3xl tracking-[1em] font-mono h-16"
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />
                        <p className="text-sm text-gray-500 mt-2">Enter the 6-digit code displayed by your COE Head</p>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
                        {loading ? "Verifying..." : "Submit Code"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
