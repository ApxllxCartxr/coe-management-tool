"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addAdmin } from "./actions"
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

export default function AddAdminForm() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        try {
            const result = await addAdmin(formData)
            if (result.success) {
                toast.success("Admin added")
                setOpen(false)
            } else {
                toast.error(result.message)
            }
        } catch (e) {
            toast.error("Error adding admin")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Admin
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Administrator</DialogTitle>
                    <DialogDescription>
                        Enter the email of an existing user to promote them to Admin.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
                    <Input name="email" type="email" placeholder="user@example.com" required />
                    <Button type="submit" disabled={loading}>
                        {loading ? "Adding..." : "Add"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
