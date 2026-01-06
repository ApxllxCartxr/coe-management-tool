"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteAnnouncement } from "./actions"
import { toast } from "sonner"
import { useState } from "react"

export default function DeleteAnnouncementButton({ coeId, announcementId }: { coeId: string, announcementId: string }) {
    const [loading, setLoading] = useState(false)

    const handleRemove = async () => {
        if (!confirm("Delete this announcement?")) return
        setLoading(true)
        try {
            const result = await deleteAnnouncement(coeId, announcementId)
            if (result.success) {
                toast.success("Deleted")
            } else {
                toast.error(result.message)
            }
        } catch (e) {
            toast.error("Error deleting")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button variant="ghost" size="sm" onClick={handleRemove} disabled={loading} className="text-gray-400 hover:text-red-500">
            <Trash2 className="w-4 h-4" />
        </Button>
    )
}
