"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { appointHead } from "./actions"
import { toast } from "sonner"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { UserPlus } from "lucide-react"

export default function AppointHeadDialog({ coeId }: { coeId: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string

        try {
            const result = await appointHead(coeId, email)
            if (result.success) {
                toast.success("Head appointed successfully")
                setOpen(false)
            } else {
                toast.error(result.message)
            }
        } catch (e) {
            toast.error("Error appointing head")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Appoint Head
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Appoint COE Head</DialogTitle>
                    <DialogDescription>
                        Enter the email of an existing user to appoint them as a Head for this COE.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
                    <Input name="email" type="email" placeholder="user@example.com" required />
                    <Button type="submit" disabled={loading}>
                        {loading ? "Appointing..." : "Appoint"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
