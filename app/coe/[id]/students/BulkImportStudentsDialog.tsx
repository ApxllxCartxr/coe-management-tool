"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { bulkImportStudents } from "./actions"
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
import { Upload, FileText } from "lucide-react"

export default function BulkImportStudentsDialog({ coeId }: { coeId: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [emails, setEmails] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await bulkImportStudents(coeId, emails)
            if (result.success) {
                toast.success(result.message)
                setOpen(false)
                setEmails("")
            } else {
                toast.error(result.message)
            }
        } catch (e) {
            toast.error("Error processing import")
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const text = event.target?.result as string
            setEmails(text)
        }
        reader.readAsText(file)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Bulk Import
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Bulk Import Students</DialogTitle>
                    <DialogDescription>
                        Paste a list of emails (separated by commas or newlines) or upload a CSV file.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Button variant="secondary" className="relative cursor-pointer" asChild>
                            <label>
                                <FileText className="w-4 h-4 mr-2" />
                                {emails ? "Replace File" : "Upload CSV / Text File"}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".csv,.txt"
                                    onChange={handleFileUpload}
                                />
                            </label>
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or paste emails
                            </span>
                        </div>
                    </div>

                    <Textarea
                        placeholder="student1@example.com, student2@example.com..."
                        className="min-h-[150px] font-mono text-sm"
                        value={emails}
                        onChange={(e) => setEmails(e.target.value)}
                    />

                    <p className="text-xs text-muted-foreground">
                        {emails.split(/[\n,]/).filter(e => e.trim()).length} emails detected.
                    </p>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading || !emails.trim()}>
                        {loading ? "Importing..." : "Start Import"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
