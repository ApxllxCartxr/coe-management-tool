"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createAnnouncement } from "./actions"
import { toast } from "sonner"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Megaphone } from "lucide-react"
import { Label } from "@/components/ui/label"

export default function CreateAnnouncementDialog({ coeId }: { coeId: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        try {
            const result = await createAnnouncement(coeId, formData)
            if (result.success) {
                toast.success("Posted!")
                setOpen(false)
            } else {
                toast.error(result.message)
            }
        } catch (e) {
            toast.error("Error creating announcement")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Megaphone className="w-4 h-4 mr-2" />
                    Post Announcement
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>New Announcement</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" placeholder="Important Update..." required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea id="content" name="content" placeholder="Write your message here..." className="min-h-[150px]" required />
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="isPinned" name="isPinned" className="w-4 h-4 text-blue-600 rounded" />
                        <Label htmlFor="isPinned">Pin to top</Label>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Posting..." : "Post Announcement"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
