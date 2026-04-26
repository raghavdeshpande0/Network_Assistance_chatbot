import { Network } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t-4 border-foreground bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border-2 border-background bg-primary">
              <Network className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-background">NetFix</span>
          </div>

          <div className="flex flex-col items-center gap-2 md:flex-row md:gap-6">
            <span className="font-mono text-xs text-background/60">
              Built with Next.js + FastAPI + Hugging Face
            </span>
            <span className="font-mono text-xs text-background/60">
              {"// Network troubleshooting made simple"}
            </span>
          </div>

          <div className="font-mono text-xs text-background/40">
            2026 NetFix
          </div>
        </div>
      </div>
    </footer>
  )
}
