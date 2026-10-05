"use client"

import type React from "react"
import { useEffect, useState } from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { clamp, formatMeasure, roundTo } from "@/lib/bmi"
import { format, useLanguage } from "@/hooks/use-language"

type MeasureFieldProps = {
  id: string
  label: string
  unit: string
  value: number
  min: number
  max: number
  step: number
  decimals: number
  onChange: (value: number) => void
}

export function MeasureField({ id, label, unit, value, min, max, step, decimals, onChange }: MeasureFieldProps) {
  const { translations } = useLanguage()
  const [draft, setDraft] = useState(formatMeasure(value))
  const [editing, setEditing] = useState(false)

  // Keep the text box in sync with outside changes unless the user is typing in it
  useEffect(() => {
    if (!editing) setDraft(formatMeasure(value))
  }, [value, editing])

  const parsed = Number.parseFloat(draft)
  const invalid = editing && draft !== "" && (Number.isNaN(parsed) || parsed < min || parsed > max)

  const commit = (next: number) => onChange(roundTo(clamp(next, min, max), decimals))

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(",", ".")
    if (!/^\d*\.?\d*$/.test(raw)) return
    setDraft(raw)
    const next = Number.parseFloat(raw)
    if (!Number.isNaN(next) && next >= min && next <= max) onChange(roundTo(next, decimals))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur()
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return
    e.preventDefault()
    const delta = (e.shiftKey ? 10 : 1) * (e.key === "ArrowUp" ? 1 : -1)
    const next = roundTo(clamp(value + delta, min, max), decimals)
    onChange(next)
    setDraft(formatMeasure(next))
  }

  const stepperClass =
    "grid size-10 shrink-0 place-items-center rounded-full border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 active:scale-95"

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <div className="mt-1 flex items-center justify-between gap-4">
        <div className="relative flex items-baseline gap-1.5">
          {/* The invisible mirror sizes the box so the input hugs its text */}
          <div className="relative inline-grid font-display text-6xl leading-none tracking-tight">
            <span aria-hidden className="invisible col-start-1 row-start-1 whitespace-pre pr-px tabular-nums">
              {draft || " "}
            </span>
            <input
              id={id}
              size={1}
              inputMode="decimal"
              autoComplete="off"
              value={draft}
              onChange={handleInput}
              onFocus={(e) => {
                setEditing(true)
                e.currentTarget.select()
              }}
              onBlur={() => setEditing(false)}
              onKeyDown={handleKeyDown}
              aria-invalid={invalid}
              aria-describedby={invalid ? `${id}-error` : undefined}
              className={cn(
                "col-start-1 row-start-1 w-full min-w-0 border-b border-dashed border-transparent bg-transparent tabular-nums outline-none transition-colors",
                "hover:border-foreground/25 focus:border-solid focus:border-foreground",
                invalid && "border-destructive focus:border-destructive",
              )}
            />
          </div>
          <span className="text-base text-muted-foreground">{unit}</span>
          {invalid && (
            <span
              id={`${id}-error`}
              role="alert"
              className="absolute left-0 top-full mt-1.5 whitespace-nowrap text-[11px] text-destructive"
            >
              {format(translations.outOfRange, { min, max })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={stepperClass}
            onClick={() => commit(value - 1)}
            disabled={value <= min}
            aria-label={format(translations.decrease, { label })}
          >
            <Minus className="size-4" />
          </button>
          <button
            type="button"
            className={stepperClass}
            onClick={() => commit(value + 1)}
            disabled={value >= max}
            aria-label={format(translations.increase, { label })}
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <SliderPrimitive.Root
        min={min}
        max={max}
        step={step}
        value={[clamp(value, min, max)]}
        onValueChange={([next]) => onChange(roundTo(next, decimals))}
        aria-label={label}
        className="group relative mt-5 flex h-6 w-full touch-none select-none items-center"
      >
        <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-muted">
          <SliderPrimitive.Range className="absolute h-full bg-foreground" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          aria-label={label}
          className="block size-5 cursor-grab rounded-full border-2 border-foreground bg-background shadow-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 active:scale-110 active:cursor-grabbing"
        />
      </SliderPrimitive.Root>
    </div>
  )
}
