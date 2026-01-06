import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowRight, CheckCircle2, ShieldCheck, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const session = await getAuthSession()

  if (session) {
    if (session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN") {
      redirect("/admin/dashboard")
    } else if (session.user.role === "COE_HEAD") {
      redirect("/coe")
    } else {
      redirect("/student/dashboard")
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-blue-500/30">

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 relative overflow-hidden">

        {/* Abstract Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full opacity-50 animate-pulse pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-4xl w-full text-center space-y-8">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-blue-200 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            System Operational
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 pb-2">
            Centre of Excellence Management Tool
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Streamline operations, track attendance, and manage student activities with a unified platform designed for efficiency.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/api/auth/signin">
              <Button size="lg" className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 h-12 text-base font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            {/* Reserved for secondary CTA if needed */}
          </div>
        </div>

        {/* Feature Grid Mini Preview */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left">
          {[
            { icon: ShieldCheck, title: "Secure Access", desc: "Role-based authentication ensuring data privacy and control." },
            { icon: Users, title: "Student Tracking", desc: "Real-time attendance and activity monitoring for all COEs." },
            { icon: CheckCircle2, title: "Easy Management", desc: "User-friendly dashboards for Admins and COE Heads." }
          ].map((feature, i) => (
            <div key={i} className="group p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <feature.icon className="w-8 h-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-zinc-400">{feature.desc}</p>
            </div>
          ))}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-sm text-zinc-500">
        <p>&copy; {new Date().getFullYear()} COE Management Tool. All rights reserved.</p>
      </footer>
    </div>
  )
}
