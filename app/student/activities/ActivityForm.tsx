"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { logActivity } from "./actions"
import { toast as sonnerToast } from "sonner"
import { useState } from "react"


export default function ActivityForm() {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        try {
            const result = await logActivity(formData)
            if (result.success) {
                sonnerToast.success("Activity logged!")
                    // Optionally reset form
                    (e.target as HTMLFormElement).reset()
            } else {
                sonnerToast.error(result.message)
            }
        } catch (e) {
            sonnerToast.error("Error logging activity")
        } finally {
            setLoading(false)
        }
    }

    // Get current date YYYY-MM-DD for default
    const today = new Date().toISOString().split('T')[0]

    return (
        <Card className="bg-white shadow">
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" name="title" placeholder="e.g. Hackathon Prep" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="activityDate">Date</Label>
                            <Input id="activityDate" name="activityDate" type="date" defaultValue={today} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Select name="type" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HACKATHON">Hackathon</SelectItem>
                                    <SelectItem value="RESEARCH">Research</SelectItem>
                                    <SelectItem value="PROJECT">Project</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hoursSpent">Hours Spent</Label>
                            <Input id="hoursSpent" name="hoursSpent" type="number" step="0.5" min="0.5" placeholder="2.5" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="Describe what you did..." required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="proofUrl">Proof URL (Optional)</Label>
                        <Input id="proofUrl" name="proofUrl" type="url" placeholder="https://github.com/..." />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Logging..." : "Log Activity"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
