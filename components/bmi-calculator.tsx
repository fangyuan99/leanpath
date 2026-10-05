"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Check, Link2 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BmiScale } from "@/components/bmi-scale"
import { MeasureField } from "@/components/measure-field"
import { format, useLanguage } from "@/hooks/use-language"
import { cn } from "@/lib/utils"
import {
  CATEGORIES,
  HEIGHT_RANGE,
  WEIGHT_RANGE,
  type BmiCategory,
  calculateBmi,
  categorize,
  clamp,
  healthyWeightRange,
  roundTo,
  weightForBmi,
} from "@/lib/bmi"

const STORAGE_KEY = "bmi-measurements"

/** Eases a displayed number toward its target so value changes read as motion. */
function useAnimatedNumber(target: number, duration = 220) {
  const [display, setDisplay] = useState(target)
  const displayRef = useRef(target)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      displayRef.current = target
      setDisplay(target)
      return
    }
    const from = displayRef.current
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) ** 3
      displayRef.current = from + (target - from) * eased
      setDisplay(displayRef.current)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return display
}

/** Restores measurements from the URL or localStorage, and keeps both up to date. */
function usePersistedMeasurements(height: number, weight: number, restore: (h: number, w: number) => void) {
  const [restored, setRestored] = useState(false)

  useEffect(() => {
    const valid = (h: number, w: number) =>
      h >= HEIGHT_RANGE.min && h <= HEIGHT_RANGE.max && w >= WEIGHT_RANGE.min && w <= WEIGHT_RANGE.max
    const params = new URLSearchParams(window.location.search)
    const fromUrl = [Number(params.get("h")), Number(params.get("w"))]
    if (valid(fromUrl[0], fromUrl[1])) {
      restore(fromUrl[0], fromUrl[1])
    } else {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")
        if (saved && valid(saved.height, saved.weight)) restore(saved.height, saved.weight)
      } catch {}
    }
    setRestored(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!restored) return
    // Debounced: browsers throttle frequent history updates, and dragging fires many
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ height, weight }))
      } catch {}
      const url = new URL(window.location.href)
      url.searchParams.set("h", String(height))
      url.searchParams.set("w", String(weight))
      window.history.replaceState(null, "", url)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [height, weight, restored])
}

function BmiNumber({ value }: { value: number }) {
  // Each glyph gets a fixed-width cell so the number never jitters while it changes
  return (
    <span aria-hidden className="inline-flex">
      {value
        .toFixed(1)
        .split("")
        .map((char, i) => (
          <span key={i} className={cn("inline-block text-center", char === "." ? "w-[0.2em]" : "w-[0.45em]")}>
            {char}
          </span>
        ))}
    </span>
  )
}

export function BMICalculator() {
  const [height, setHeight] = useState<number>(170)
  const [weight, setWeight] = useState<number>(65)
  const [copied, setCopied] = useState(false)
  const { translations } = useLanguage()

  usePersistedMeasurements(height, weight, (h, w) => {
    setHeight(h)
    setWeight(w)
  })

  const bmi = calculateBmi(height, weight)
  const category = categorize(bmi)
  const animatedBmi = useAnimatedNumber(bmi)
  const categoryLabel: Record<BmiCategory, string> = {
    under: translations.underweight,
    normal: translations.normal,
    over: translations.overweight,
    obese: translations.obese,
  }

  const { min: healthyMin, max: healthyMax } = healthyWeightRange(height)
  let insight = translations.inHealthyRange
  if (category === "under") insight = format(translations.gainToHealthy, { kg: (healthyMin - weight).toFixed(1) })
  if (category === "over" || category === "obese")
    insight = format(translations.loseToHealthy, { kg: (weight - healthyMax).toFixed(1) })

  const handleBmiChange = (target: number) => {
    const next = roundTo(clamp(weightForBmi(height, target), WEIGHT_RANGE.min, WEIGHT_RANGE.max), 1)
    if (categorize(calculateBmi(height, next)) !== category) navigator.vibrate?.(8)
    setWeight(next)
  }

  const copyLink = async () => {
    const url = new URL(window.location.href)
    url.searchParams.set("h", String(height))
    url.searchParams.set("w", String(weight))
    try {
      await navigator.clipboard.writeText(url.toString())
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {}
  }

  return (
    <div
      className="relative"
      style={
        {
          "--tone": `var(--tone-${category})`,
          "--ink": `var(--ink-${category})`,
        } as React.CSSProperties
      }
    >
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        {/* Result */}
        <section aria-labelledby="bmi-result-label" className="relative animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 -top-32 -z-10 size-[28rem] rounded-full opacity-[0.22] blur-3xl transition-colors duration-700 dark:opacity-[0.16] lg:size-[36rem]"
            style={{ backgroundColor: "hsl(var(--tone))" }}
          />

          <p
            id="bmi-result-label"
            className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"
          >
            {translations.yourBmi}
          </p>

          <div aria-live="polite" aria-atomic className="mt-2">
            <span className="sr-only">
              {bmi.toFixed(1)}, {categoryLabel[category]}
            </span>
            <div className="-ml-[0.04em] font-display text-[7.5rem] leading-[0.9] tracking-tight sm:text-[9rem] lg:text-[11rem]">
              <BmiNumber value={animatedBmi} />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span
              key={category}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium transition-colors duration-500 animate-in fade-in slide-in-from-bottom-1"
              style={{
                color: "hsl(var(--ink))",
                borderColor: "hsl(var(--tone) / 0.35)",
                backgroundColor: "hsl(var(--tone) / 0.1)",
              }}
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: "hsl(var(--tone))" }} />
              {categoryLabel[category]}
            </span>
            <p className="text-sm text-muted-foreground">{insight}</p>
          </div>

          <div className="mt-10">
            <BmiScale
              value={bmi}
              category={category}
              label={translations.scaleLabel}
              valueText={`${bmi.toFixed(1)}, ${categoryLabel[category]}`}
              onChange={handleBmiChange}
            />
            <p className="mt-3 text-xs text-muted-foreground">{translations.dragHint}</p>
          </div>

          <ul className="mt-8 grid grid-cols-4 gap-1.5 sm:gap-2">
            {CATEGORIES.map((c) => {
              const active = c.key === category
              return (
                <li
                  key={c.key}
                  aria-current={active || undefined}
                  className={cn(
                    "rounded-xl border px-2 py-2.5 text-center transition-all duration-500 sm:px-3",
                    active ? "shadow-sm" : "border-transparent",
                  )}
                  style={
                    active
                      ? {
                          borderColor: `hsl(var(--tone-${c.key}) / 0.35)`,
                          backgroundColor: `hsl(var(--tone-${c.key}) / 0.08)`,
                        }
                      : undefined
                  }
                >
                  <div
                    className="text-xs font-medium sm:text-sm"
                    style={{ color: active ? `hsl(var(--ink-${c.key}))` : undefined }}
                  >
                    {categoryLabel[c.key]}
                  </div>
                  <div className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">{c.range}</div>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Inputs */}
        <section className="animate-in fade-in slide-in-from-bottom-6 delay-150 duration-1000 fill-mode-both rounded-[1.75rem] border bg-card/70 p-6 shadow-[0_1px_0_0_hsl(var(--foreground)/0.04),0_24px_60px_-28px_rgb(0_0_0/0.25)] backdrop-blur-xl sm:p-8">
          <MeasureField
            id="height"
            label={translations.height}
            unit="cm"
            value={height}
            min={HEIGHT_RANGE.min}
            max={HEIGHT_RANGE.max}
            step={1}
            decimals={1}
            onChange={setHeight}
          />
          <div className="my-7 h-px bg-border" />
          <MeasureField
            id="weight"
            label={translations.weight}
            unit="kg"
            value={weight}
            min={WEIGHT_RANGE.min}
            max={WEIGHT_RANGE.max}
            step={0.1}
            decimals={1}
            onChange={setWeight}
          />

          <div className="mt-8 flex items-end justify-between gap-4 rounded-2xl bg-muted/60 px-4 py-3.5">
            <div>
              <div className="text-xs text-muted-foreground">
                {format(translations.healthyWeight, { h: height })}
              </div>
              <div className="mt-1 text-lg font-medium tabular-nums">
                {healthyMin.toFixed(1)} – {healthyMax.toFixed(1)}{" "}
                <span className="text-sm font-normal text-muted-foreground">kg</span>
              </div>
            </div>
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
            >
              {copied ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
              <span aria-live="polite">{copied ? translations.copied : translations.copyLink}</span>
            </button>
          </div>
        </section>
      </div>

      {/* Explanation */}
      <Accordion type="single" collapsible className="mt-16 border-t animate-in fade-in delay-300 duration-1000 fill-mode-both lg:mt-24">
        <AccordionItem value="explanation" className="border-b">
          <AccordionTrigger className="py-5 text-left font-display text-2xl font-normal hover:no-underline">
            {translations.bmiExplanation}
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-8 pb-4 text-sm leading-relaxed text-muted-foreground md:grid-cols-2">
              <div>
                <h3 className="mb-1.5 font-medium text-foreground">{translations.whatIsBmi}</h3>
                <p>{translations.bmiDefinition}</p>
              </div>
              <div>
                <h3 className="mb-1.5 font-medium text-foreground">{translations.howCalculated}</h3>
                <p>{translations.bmiFormula}</p>
                <div className="mt-3 rounded-xl bg-muted px-4 py-3 text-center font-medium text-foreground">
                  BMI = {translations.weight} (kg) / [{translations.height} (m)]²
                </div>
              </div>
              <div>
                <h3 className="mb-1.5 font-medium text-foreground">{translations.chineseStandards}</h3>
                <ul className="space-y-1.5">
                  {CATEGORIES.map((c) => (
                    <li key={c.key} className="flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ backgroundColor: `hsl(var(--tone-${c.key}))` }} />
                      <span className="font-medium text-foreground">{categoryLabel[c.key]}</span>
                      <span className="tabular-nums">{c.range}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-1.5 font-medium text-foreground">{translations.limitations}</h3>
                <p>{translations.bmiLimitations}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
