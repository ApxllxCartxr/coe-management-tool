"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { createAttendanceSession } from "./actions"
import { toast } from "sonner"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Play } from "lucide-react"

export default function CreateSessionDialog({ coeId }: { coeId: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [enableGeo, setEnableGeo] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        // Add dummy geolocation if enabled (In real app, we'd get current pos)
        if (enableGeo) {
            // We'd use navigator.geolocation here
            // For simplified implementation, we'll mimic "current location" or ask for it
            // Since we can't easily wait for async callback in onSubmit without blocking state,
            // we should get it before submitting.
        }

        try {
            if (enableGeo) {
                await new Promise<void>((resolve, reject) => {
                    if (!navigator.geolocation) {
                        toast.error("Geolocation is not supported by your browser")
                        reject(null)
                        return
                    }

                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            formData.append("locationLat", pos.coords.latitude.toString())
                            formData.append("locationLng", pos.coords.longitude.toString())
                            formData.append("locationRadius", "50") // 50 meters default
                            resolve()
                        },
                        (err) => {
                            console.error("Geolocation error:", err)
                            toast.error(`Location Error: ${err.message}. Try disabling geofencing.`)
                            setLoading(false)
                            reject(null) // Reject with null to signal "already handled"
                        },
                        {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 0
                        }
                    )
                })
            }

            const result = await createAttendanceSession(coeId, formData)
            if (result.success) {
                toast.success("Session started!")
                setOpen(false)
            } else {
                toast.error(result.message)
            }
        } catch (e: any) {
            if (e === null) return // Error was handled in the promise
            console.error("Session creation error:", e)
            toast.error(e?.message || "An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    const today = new Date().toISOString().split('T')[0]

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Play className="w-4 h-4 mr-2" />
                    Start Session
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Start Attendance Session</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sessionDate">Date</Label>
                            <Input id="sessionDate" name="sessionDate" type="date" defaultValue={today} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sessionType">Type</Label>
                            <Select name="sessionType" defaultValue="QR">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="QR">Dynamic QR Code</SelectItem>
                                    <SelectItem value="TOTP">TOTP Code (No Camera)</SelectItem>
                                    <SelectItem value="MANUAL">Manual Entry</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="durationMinutes">Duration (Minutes)</Label>
                        <Input id="durationMinutes" name="durationMinutes" type="number" defaultValue={60} min={5} required />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="enableGeo"
                            className="w-4 h-4"
                            checked={enableGeo}
                            onChange={(e) => setEnableGeo(e.target.checked)}
                        />
                        <Label htmlFor="enableGeo">Restrict to my current location (Geofencing)</Label>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Starting..." : "Start Session"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
