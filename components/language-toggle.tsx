"use client"

import { useLanguage } from "@/hooks/use-language"
import { cn } from "@/lib/utils"

export function LanguageToggle() {
  const { language, toggleLanguage, translations } = useLanguage()

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={translations.switchLanguage}
      title={translations.switchLanguage}
      className="relative flex h-9 items-center rounded-full border bg-background/60 p-0.5 text-xs font-medium backdrop-blur transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0.5 left-0.5 w-8 rounded-full bg-foreground transition-transform duration-300 ease-out",
          language === "zh" && "translate-x-8",
        )}
      />
      {(["en", "zh"] as const).map((lang) => (
        <span
          key={lang}
          aria-hidden
          className={cn(
            "relative z-10 grid h-full w-8 place-items-center transition-colors duration-300",
            language === lang ? "text-background" : "text-muted-foreground",
          )}
        >
          {lang === "en" ? "EN" : "中"}
        </span>
      ))}
    </button>
  )
}
