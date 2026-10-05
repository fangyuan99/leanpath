"use client"

import type React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { useLanguage } from "@/hooks/use-language"

type ViewTransition = { ready: Promise<void>; finished: Promise<void> }
type DocumentWithViewTransition = Document & { startViewTransition?: (update: () => void) => ViewTransition }

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const { translations } = useLanguage()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = isDark ? "light" : "dark"
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const doc = document as DocumentWithViewTransition
    if (!doc.startViewTransition || reduceMotion) {
      setTheme(next)
      return
    }

    // Reveal the new theme as a circle growing from the button
    const rect = e.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

    // Element transitions would otherwise fade colors inside the already-revealed area
    const freeze = document.createElement("style")
    freeze.textContent = "*,*::before,*::after{transition:none!important}"

    const transition = doc.startViewTransition(() => {
      document.head.appendChild(freeze)
      const root = document.documentElement
      root.classList.toggle("dark", next === "dark")
      root.classList.toggle("light", next === "light")
      root.style.colorScheme = next
      setTheme(next)
    })
    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 550, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
        )
      })
      .catch(() => {})
    transition.finished.finally(() => freeze.remove())
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={translations.toggleTheme}
      title={translations.toggleTheme}
      className="relative grid size-9 place-items-center overflow-hidden rounded-full border bg-background/60 backdrop-blur transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
    >
      <Sun
        className={`absolute size-4 transition-all duration-500 ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`}
      />
      <Moon
        className={`absolute size-4 transition-all duration-500 ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
      />
    </button>
  )
}
