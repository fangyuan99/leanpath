"use client"

import type React from "react"
import { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import {
  BMI_OBESE,
  BMI_OVER,
  BMI_UNDER,
  CATEGORIES,
  SCALE_MAX,
  SCALE_MIN,
  type BmiCategory,
  clamp,
  roundTo,
  scalePercent,
} from "@/lib/bmi"

type BmiScaleProps = {
  value: number
  category: BmiCategory
  label: string
  valueText: string
  onChange: (bmi: number) => void
}

const TICKS = [BMI_UNDER, BMI_OVER, BMI_OBESE]

export function BmiScale({ value, category, label, valueText, onChange }: BmiScaleProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const percent = scalePercent(value)

  const setFromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1)
    onChange(roundTo(SCALE_MIN + ratio * (SCALE_MAX - SCALE_MIN), 1))
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    e.currentTarget.focus({ preventScroll: true })
    setDragging(true)
    setFromPointer(e.clientX)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging) setFromPointer(e.clientX)
  }

  const endDrag = () => setDragging(false)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 1 : 0.1
    const current = clamp(value, SCALE_MIN, SCALE_MAX)
    let next: number | null = null
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = current + step
        break
      case "ArrowLeft":
      case "ArrowDown":
        next = current - step
        break
      case "PageUp":
        next = current + 1
        break
      case "PageDown":
        next = current - 1
        break
      case "Home":
        next = SCALE_MIN
        break
      case "End":
        next = SCALE_MAX
        break
    }
    if (next === null) return
    e.preventDefault()
    onChange(roundTo(clamp(next, SCALE_MIN, SCALE_MAX), 1))
  }

  return (
    <div className="select-none">
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={SCALE_MIN}
        aria-valuemax={SCALE_MAX}
        aria-valuenow={roundTo(clamp(value, SCALE_MIN, SCALE_MAX), 1)}
        aria-valuetext={valueText}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={handleKeyDown}
        className={cn(
          "group relative h-14 touch-none rounded-full outline-none",
          dragging ? "cursor-grabbing" : "cursor-grab",
        )}
      >
        <div ref={trackRef} className="absolute inset-x-0 top-1/2 flex h-3 -translate-y-1/2 gap-[3px]">
          {CATEGORIES.map((c, i) => (
            <div
              key={c.key}
              className={cn(
                "h-full transition-opacity duration-500",
                i === 0 && "rounded-l-full",
                i === CATEGORIES.length - 1 && "rounded-r-full",
                c.key === category ? "opacity-100" : "opacity-30 dark:opacity-40",
              )}
              style={{
                width: `${((c.to - c.from) / (SCALE_MAX - SCALE_MIN)) * 100}%`,
                backgroundColor: `hsl(var(--tone-${c.key}))`,
              }}
            />
          ))}
        </div>

        <div
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2",
            !dragging && "transition-[left] duration-300 ease-out",
          )}
          style={{ left: `${percent}%` }}
        >
          <div
            className={cn(
              "absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium tabular-nums text-background shadow-lg transition-all duration-200",
              dragging
                ? "translate-y-0 opacity-100"
                : "translate-y-1 opacity-0 group-focus-visible:translate-y-0 group-focus-visible:opacity-100",
            )}
          >
            {value.toFixed(1)}
          </div>
          <div
            className={cn(
              "size-7 rounded-full border-[3px] bg-background shadow-[0_2px_10px_-2px_rgb(0_0_0/0.35)] transition-[transform,border-color,box-shadow] duration-300",
              "group-hover:scale-110 group-focus-visible:ring-4 group-focus-visible:ring-[hsl(var(--tone)/0.35)]",
              dragging && "scale-[1.2] group-hover:scale-[1.2]",
            )}
            style={{ borderColor: "hsl(var(--tone))" }}
          />
        </div>
      </div>

      <div className="relative h-4 text-[11px] tabular-nums text-muted-foreground">
        <span className="absolute left-0">{SCALE_MIN}</span>
        {TICKS.map((tick) => (
          <span key={tick} className="absolute -translate-x-1/2" style={{ left: `${scalePercent(tick)}%` }}>
            {tick}
          </span>
        ))}
        <span className="absolute right-0">{SCALE_MAX}</span>
      </div>
    </div>
  )
}
