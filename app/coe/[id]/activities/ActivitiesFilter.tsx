"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"

export default function ActivitiesFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set("search", term)
        } else {
            params.delete("search")
        }
        router.replace(`?${params.toString()}`)
    }, 300)

    const handleTypeChange = (value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value && value !== "ALL") {
            params.set("type", value)
        } else {
            params.delete("type")
        }
        router.replace(`?${params.toString()}`)
    }

    return (
        <div className="flex gap-4 mb-6">
            <div className="w-full max-w-sm">
                <Input
                    placeholder="Search student or title..."
                    defaultValue={searchParams.get("search")?.toString()}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>
            <Select
                defaultValue={searchParams.get("type") || "ALL"}
                onValueChange={handleTypeChange}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="HACKATHON">Hackathon</SelectItem>
                    <SelectItem value="RESEARCH">Research</SelectItem>
                    <SelectItem value="PROJECT">Project</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
