"use client"

import { Network, Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function Header() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("theme")
    const html = document.documentElement
    const isDarkMode = saved === "dark" || (!saved && html.classList.contains("dark"))
    setIsDark(isDarkMode)
    if (isDarkMode) html.classList.add("dark")
    else html.classList.remove("dark")
  }, [])

  const toggleTheme = () => {
    const html = document.documentElement
    const newDark = !isDark
    setIsDark(newDark)
    localStorage.setItem("theme", newDark ? "dark" : "light")
    newDark ? html.classList.add("dark") : html.classList.remove("dark")
  }

  return (
    <header className="border-b-4 border-foreground bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border-3 border-foreground bg-primary">
            <Network className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground">
            NetFix
          </span>
        </div>
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#chat"
            className="border-b-3 border-transparent text-sm font-bold uppercase tracking-wider text-foreground bg-transparent hover:bg-primary hover:bg-opacity-10 px-3 py-2 transition-colors"
          >
            Chat
          </a>
        </nav>
        {mounted && (
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center border-3 border-foreground bg-secondary hover:bg-primary transition-colors"
            aria-label="Toggle dark theme"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-secondary-foreground" />
            ) : (
              <Moon className="h-5 w-5 text-foreground" />
            )}
          </button>
        )}
      </div>
    </header>
  )
}
