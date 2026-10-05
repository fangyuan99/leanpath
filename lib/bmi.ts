export type BmiCategory = "under" | "normal" | "over" | "obese"

// Chinese adult standard (WS/T 428—2013)
export const BMI_UNDER = 18.5
export const BMI_OVER = 24
export const BMI_OBESE = 28

// Visible extent of the BMI scale
export const SCALE_MIN = 15
export const SCALE_MAX = 35

export const HEIGHT_RANGE = { min: 100, max: 250 }
export const WEIGHT_RANGE = { min: 20, max: 250 }

export const CATEGORIES: { key: BmiCategory; from: number; to: number; range: string }[] = [
  { key: "under", from: SCALE_MIN, to: BMI_UNDER, range: "< 18.5" },
  { key: "normal", from: BMI_UNDER, to: BMI_OVER, range: "18.5 – 23.9" },
  { key: "over", from: BMI_OVER, to: BMI_OBESE, range: "24 – 27.9" },
  { key: "obese", from: BMI_OBESE, to: SCALE_MAX, range: "≥ 28" },
]

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export const roundTo = (value: number, decimals: number) => {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export function calculateBmi(heightCm: number, weightKg: number) {
  const meters = heightCm / 100
  return weightKg / (meters * meters)
}

export function weightForBmi(heightCm: number, bmi: number) {
  const meters = heightCm / 100
  return bmi * meters * meters
}

/** Lightest and heaviest weights (to 0.1 kg) that put a height in the normal category. */
export function healthyWeightRange(heightCm: number) {
  const min = Math.ceil(roundTo(weightForBmi(heightCm, BMI_UNDER) * 10, 6)) / 10
  const max = (Math.ceil(roundTo(weightForBmi(heightCm, BMI_OVER) * 10, 6)) - 1) / 10
  return { min, max }
}

export function categorize(bmi: number): BmiCategory {
  if (bmi < BMI_UNDER) return "under"
  if (bmi < BMI_OVER) return "normal"
  if (bmi < BMI_OBESE) return "over"
  return "obese"
}

/** Position of a BMI value on the scale, as a 0–100 percentage. */
export function scalePercent(bmi: number) {
  return (clamp(bmi, SCALE_MIN, SCALE_MAX) - SCALE_MIN) / (SCALE_MAX - SCALE_MIN) * 100
}

/** Formats a measurement, dropping the decimal when it is a whole number. */
export function formatMeasure(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}
