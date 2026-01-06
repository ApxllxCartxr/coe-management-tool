"use client"

import { Button } from "@/components/ui/button"
import { UserMinus } from "lucide-react"
import { removeAdmin } from "./actions"
import { toast } from "sonner"
import { useState } from "react"

export default function RemoveAdminButton({ userId }: { userId: string }) {
    const [loading, setLoading] = useState(false)

    const handleRemove = async () => {
        if (!confirm("Are you sure? This will demote the user to Student role.")) return

        setLoading(true)
        try {
            const result = await removeAdmin(userId)
            if (result.success) {
                toast.success("Admin removed")
            } else {
                toast.error(result.message)
            }
        } catch (e) {
            toast.error("Error removing admin")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button variant="ghost" size="sm" onClick={handleRemove} disabled={loading} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <UserMinus className="w-4 h-4" />
        </Button>
    )
}
