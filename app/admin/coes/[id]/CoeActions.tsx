"use client"

import { Button } from "@/components/ui/button"
import { FileText, Users } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface CoeActionsProps {
    coeId: string
    coeName: string
}

export default function CoeActions({ coeId, coeName }: CoeActionsProps) {
    const handleGenerateReport = () => {
        toast.info(`Generating Report for ${coeName}...`, {
            description: "Gathering attendance, activity, and performance data.",
        })

        setTimeout(() => {
            toast.success("Report Generated", {
                description: `${coeName}_report_${new Date().toISOString().split('T')[0]}.pdf ready`,
                action: {
                    label: "Download",
                    onClick: () => toast.message("Download started"),
                },
            })
        }, 1500)
    }

    return (
        <>
            <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/admin/coes/${coeId}/students`}>
                    <Users className="mr-2 h-4 w-4" />
                    View All Students
                </Link>
            </Button>
            <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleGenerateReport}
            >
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
            </Button>
        </>
    )
}
