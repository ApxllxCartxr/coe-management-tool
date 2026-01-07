"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { updateProfile } from "./actions"
import { useRouter } from "next/navigation"

export default function ProfileForm({
    initialName,
    email
}: {
    initialName: string
    email: string
}) {
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        const result = await updateProfile(formData)

        if (result.error) {
            setMessage({ type: 'error', text: result.error })
        } else if (result.success) {
            setMessage({ type: 'success', text: result.success as string })
            router.refresh()
        }
        setIsLoading(false)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account details.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            disabled
                            className="bg-gray-100 dark:bg-zinc-800 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={initialName}
                            required
                        />
                    </div>

                    {message && (
                        <div className={`p-3 rounded-md text-sm ${message.type === 'success'
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
