"use client"

import { Button } from "@/components/ui/button"
import { endSession } from "./actions"
import { toast } from "sonner"
import { useState } from "react"
import { Square } from "lucide-react"

export default function EndSessionButton({ coeId, sessionId }: { coeId: string, sessionId: string }) {
    const [loading, setLoading] = useState(false)

    const handleEnd = async () => {
        if (!confirm("End this session? Students will no longer be able to mark attendance.")) return
        setLoading(true)
        try {
            const result = await endSession(coeId, sessionId)
            if (result.success) {
                toast.success("Session ended")
            } else {
                toast.error(result.message)
            }
        } catch (e) {
            toast.error("Error ending session")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button variant="destructive" onClick={handleEnd} disabled={loading}>
            <Square className="w-4 h-4 mr-2 fill-current" />
            End Session
        </Button>
    )
}
