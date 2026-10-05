"use client"

import { GitHubLink, GitHubMark, REPO_URL } from "@/components/github-link"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { useLanguage } from "@/hooks/use-language"

export function SiteHeader() {
  const { translations } = useLanguage()

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <div className="flex items-center gap-2.5">
        <svg aria-hidden viewBox="0 0 64 64" className="size-8">
          <rect width="64" height="64" rx="32" className="fill-foreground" />
          <rect x="10" y="27" width="12" height="10" rx="5" fill="hsl(var(--tone-under))" />
          <rect x="18" y="27" width="16" height="10" fill="hsl(var(--tone-normal))" />
          <rect x="34" y="27" width="10" height="10" fill="hsl(var(--tone-over))" />
          <rect x="42" y="27" width="12" height="10" rx="5" fill="hsl(var(--tone-obese))" />
          <circle cx="28" cy="32" r="9" strokeWidth="4" className="fill-background" stroke="hsl(var(--tone-normal))" />
        </svg>
        <span className="text-sm font-medium tracking-tight">{translations.appName}</span>
      </div>
      <nav className="flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
        <GitHubLink />
      </nav>
    </header>
  )
}

export function SiteFooter() {
  const { translations } = useLanguage()

  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 pb-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <p>{translations.standardNote}</p>
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        <GitHubMark className="size-3.5" />
        fangyuan99/leanpath
      </a>
    </footer>
  )
}
