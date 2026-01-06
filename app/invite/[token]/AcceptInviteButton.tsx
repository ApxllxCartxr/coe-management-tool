"use client"

import { Button } from "@/components/ui/button"
import { acceptInvitation } from "../actions"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AcceptInviteButton({ token }: { token: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleAccept = async () => {
        setLoading(true)
        try {
            const result = await acceptInvitation(token)
            if (result.success) {
                toast.success("Joined COE successfully!")
                router.push("/student/dashboard") // Redirect to Student Dashboard
            } else {
                toast.error(result.message)
            }
        } catch (e) {
            toast.error("Error joining COE")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button onClick={handleAccept} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
            {loading ? "Joining..." : "Accept Invitation"}
        </Button>
    )
}
