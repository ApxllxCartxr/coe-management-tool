"use client"

import { useEffect, useState } from "react"
import { getLiveAttendance } from "../actions" // Adjust path if needed, likely "../actions" relative to [sessionId] folder
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { Users, RefreshCw } from "lucide-react"

interface Record {
    id: string
    markedAt: Date
    user: {
        name: string | null
        email: string
        image: string | null
    }
    locationLat?: number | null
    locationLng?: number | null
}

export default function LiveAttendanceList({ sessionId }: { sessionId: string }) {
    const [records, setRecords] = useState<Record[]>([])
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

    useEffect(() => {
        const fetchAttendance = async () => {
            const result = await getLiveAttendance(sessionId)
            if (result.success) {
                setRecords(result.records as unknown as Record[]) // fast type assertion
                setLastUpdated(new Date())
            }
        }

        // Initial fetch
        fetchAttendance()

        // Poll every 3 seconds
        const interval = setInterval(fetchAttendance, 3000)

        return () => clearInterval(interval)
    }, [sessionId])

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Live Attendance
                </CardTitle>
                <div className="flex items-center text-xs text-muted-foreground gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Live
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                    {records.length} students present
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {records.map((record) => (
                        <div key={record.id} className="flex items-center justify-between bg-secondary/20 p-3 rounded-lg animate-in slide-in-from-left-2 duration-300">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={record.user.image || ""} />
                                    <AvatarFallback>{record.user.name?.[0] || "?"}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium leading-none">{record.user.name}</p>
                                    <p className="text-xs text-muted-foreground">{record.user.email}</p>
                                </div>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                                <p>{format(new Date(record.markedAt), "h:mm:ss a")}</p>
                                {record.locationLat && (
                                    <p className="text-[10px] text-blue-500">📍 Verified</p>
                                )}
                            </div>
                        </div>
                    ))}
                    {records.length === 0 && (
                        <div className="text-center py-8 text-gray-400 italic">
                            Waiting for students to scan...
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
