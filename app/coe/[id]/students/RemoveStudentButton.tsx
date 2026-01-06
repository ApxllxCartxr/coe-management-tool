"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { removeStudent } from "./actions"
import { toast } from "sonner"
import { useState } from "react"

export default function RemoveStudentButton({ coeId, studentId }: { coeId: string, studentId: string }) {
    const [loading, setLoading] = useState(false)

    const handleRemove = async () => {
        if (!confirm("Are you sure? This will remove the student from the COE.")) return
        setLoading(true)
        try {
            const result = await removeStudent(coeId, studentId)
            if (result.success) {
                toast.success("Student removed")
            } else {
                toast.error(result.message)
            }
        } catch (e) {
            toast.error("Error removing student")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button variant="ghost" size="sm" onClick={handleRemove} disabled={loading} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
        </Button>
    )
}
