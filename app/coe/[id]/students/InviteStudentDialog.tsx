"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createInvitation } from "./actions"
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
import { UserPlus, Copy, Check } from "lucide-react"

export default function InviteStudentDialog({ coeId }: { coeId: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [inviteLink, setInviteLink] = useState("")
    const [copied, setCopied] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string

        try {
            const result = await createInvitation(coeId, email)
            if (result.success && result.token) {
                const link = `${window.location.origin}/invite/${result.token}`
                setInviteLink(link)
                toast.success("Invitation created!")
            } else {
                toast.error(result.message)
            }
        } catch (e) {
            toast.error("Error creating invitation")
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteLink)
        setCopied(true)
        toast.success("Copied to clipboard")
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (!val) setInviteLink("") // Reset on close
        }}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Student
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite Student</DialogTitle>
                    <DialogDescription>
                        Enter the student's email. This will generate a unique link for them to join this COE.
                    </DialogDescription>
                </DialogHeader>

                {!inviteLink ? (
                    <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
                        <Input name="email" type="email" placeholder="student@university.edu" required />
                        <Button type="submit" disabled={loading}>
                            {loading ? "Generating..." : "Generate Link"}
                        </Button>
                    </form>
                ) : (
                    <div className="mt-4 space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg border break-all font-mono text-sm text-gray-600">
                            {inviteLink}
                        </div>
                        <Button onClick={copyToClipboard} className="w-full" variant="outline">
                            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                            {copied ? "Copied" : "Copy Link"}
                        </Button>
                        <p className="text-xs text-gray-500 text-center">
                            Share this link with the student. They must log in to accept.
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
