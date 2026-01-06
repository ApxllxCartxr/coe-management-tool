"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { markAttendance } from "./actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function QRScanner() {
    const [scanning, setScanning] = useState(false)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<string | null>(null)

    // Ref to hold the scanner instance
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)

    useEffect(() => {
        // Only init cleaner if we want to scan
        // But Html5QrcodeScanner automatically creates UI.
        // Let's create it conditionally or on mount.

        // We render a div with id "reader".
        // Init logic needs to be careful about re-renders.

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err))
            }
        }
    }, [])

    const startScan = () => {
        setScanning(true)
        // Small timeout to ensure DOM is ready
        setTimeout(() => {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
              /* verbose= */ false
            )
            scannerRef.current = scanner

            scanner.render(onScanSuccess, onScanFailure)
        }, 100)
    }

    const onScanSuccess = async (decodedText: string) => {
        if (loading) return // Prevent multiple calls

        // Stop scanning immediately
        if (scannerRef.current) {
            scannerRef.current.clear()
            setScanning(false)
        }

        setLoading(true)
        setResult(decodedText)

        try {
            // Get Location
            let lat, lng;
            try {
                const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject)
                })
                lat = pos.coords.latitude
                lng = pos.coords.longitude
            } catch (e) {
                console.log("Loc unavailable")
            }

            const res = await markAttendance(decodedText, lat, lng)
            if (res.success) {
                toast.success("Attendance Marked Successfully!")
            } else {
                toast.error(res.message)
                // Optionally restart scan?
            }
        } catch (e) {
            toast.error("Error processing attendance")
        } finally {
            setLoading(false)
        }
    }

    const onScanFailure = (error: any) => {
        // Create noise, ignore
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-white">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p>Verifying...</p>
            </div>
        )
    }

    if (!scanning && !result) {
        return (
            <div className="flex items-center justify-center p-8 w-full h-full">
                <Button onClick={startScan}>Start Camera</Button>
            </div>
        )
    }

    return (
        <div className="w-full">
            {!result && <div id="reader" className="w-full"></div>}
            {result && (
                <div className="text-center p-4 text-white">
                    <p>Processed</p>
                    <Button onClick={() => { setResult(null); startScan() }} variant="outline" className="mt-2">Scan Again</Button>
                </div>
            )}
        </div>
    )
}
