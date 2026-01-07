"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { FileText, Users } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export function AdminActions() {
    const handleGenerateReport = () => {
        // Show immediate feedback
        toast.info("Generating System Report...", {
            description: "Aggregating data from all COEs and students. Please wait.",
        })

        // Mocking a process
        setTimeout(() => {
            toast.success("Report Generated Successfully", {
                description: "The quarterly comprehensive report is ready for download.",
                action: {
                    label: "Download",
                    onClick: () => toast.message("Download started"),
                },
            })
        }, 1500)
    }

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
                <Button
                    className="flex-1"
                    size="lg"
                    onClick={handleGenerateReport}
                >
                    <FileText className="mr-2 h-5 w-5" />
                    Generate Reports
                </Button>

                <Button asChild className="flex-1" variant="secondary" size="lg">
                    <Link href="/admin/students">
                        <Users className="mr-2 h-5 w-5" />
                        View All Students
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}
