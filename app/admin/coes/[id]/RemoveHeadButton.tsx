"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { removeHead } from "./actions"
import { toast } from "sonner"
import { useState } from "react"

export default function RemoveHeadButton({ coeId, userId }: { coeId: string, userId: string }) {
    const [loading, setLoading] = useState(false)

    const handleRemove = async () => {
        if (!confirm("Are you sure? This user will be removed as head of this COE.")) return

        setLoading(true)
        try {
            const result = await removeHead(coeId, userId)
            if (result.success) {
                toast.success("Head removed")
            } else {
                toast.error(result.message)
            }
        } catch (e) {
            toast.error("Error removing head")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button variant="ghost" size="sm" onClick={handleRemove} disabled={loading} className="text-gray-400 hover:text-red-600 hover:bg-red-50">
            <X className="w-4 h-4" />
        </Button>
    )
}
