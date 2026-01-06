"use client"

import { Button } from "@/components/ui/button"
import { claimSuperAdmin } from "./actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function ClaimAdminButton() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Note: We need to implement toast properly, but for now standard console

    const handleClaim = async () => {
        setLoading(true)
        try {
            const result = await claimSuperAdmin()
            if (result.success) {
                router.push("/admin/dashboard")
                router.refresh()
            } else {
                toast.error(result.message)
            }
        } catch (e) {
            console.error(e)
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button onClick={handleClaim} disabled={loading} className="w-full">
            {loading ? "Claiming..." : "Claim Super Admin Role"}
        </Button>
    )
}
