import { ArrowDown } from "lucide-react"

export function Hero() {
  return (
    <section className="border-b-4 border-foreground bg-background">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32 lg:py-40">
        <div className="flex flex-col gap-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl flex-1">
            <div className="mb-6 inline-block border-3 border-foreground bg-primary px-4 py-2">
              <span className="font-mono text-base font-bold uppercase text-primary-foreground">
                AI-Powered Diagnostics
              </span>
            </div>
            <h1 className="mb-8 text-balance text-6xl font-bold leading-tight tracking-tight text-foreground md:text-7xl lg:text-8xl">
              Network
              <br />
              Troubleshooter
            </h1>
            <p className="max-w-xl text-pretty text-xl leading-relaxed text-muted-foreground mb-8">
              Diagnose and resolve network issues instantly with our intelligent
              AI assistant. Powered by Hugging Face models and connected to
              real-time diagnostic tools.
            </p>
          </div>

          <div className="flex flex-col gap-6 flex-shrink-0">
            <a
              href="#chat"
              className="flex items-center justify-center gap-3 border-4 border-foreground bg-primary px-10 py-6 text-center font-bold uppercase text-primary-foreground shadow-[8px_8px_0px_0px_var(--foreground)] transition-shadow hover:shadow-[4px_4px_0px_0px_var(--foreground)]"
            >
              Start Diagnosing
              <ArrowDown className="h-6 w-6" />
            </a>
            <a
              href="#tools"
              className="flex items-center justify-center gap-3 border-4 border-foreground bg-background px-10 py-6 text-center font-bold uppercase text-foreground shadow-[8px_8px_0px_0px_var(--foreground)] transition-shadow hover:shadow-[4px_4px_0px_0px_var(--foreground)]"
            >
              View Tools
            </a>
          </div>
        </div>

        {/* Terminal-style status bar */}
        <div className="mt-16 border-4 border-foreground bg-foreground p-6 shadow-[8px_8px_0px_0px_var(--primary)]">
          <div className="flex flex-wrap items-center gap-6 font-mono text-sm text-background">
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 bg-green-400 rounded-full" />
              System Online
            </span>
            <span className="text-background/40">|</span>
            <span className="text-background/60">
              Model: HuggingFace/DialoGPT
            </span>
            <span className="text-background/40">|</span>
            <span className="text-background/60">
              Backend: FastAPI
            </span>
            <span className="text-background/40">|</span>
            <span className="text-background/60">
              Latency: {"<"}50ms
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
