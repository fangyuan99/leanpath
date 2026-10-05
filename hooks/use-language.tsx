"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "en" | "zh"

type Translations = {
  appName: string
  yourBmi: string
  height: string
  weight: string
  underweight: string
  normal: string
  overweight: string
  obese: string
  healthyWeight: string
  gainToHealthy: string
  loseToHealthy: string
  inHealthyRange: string
  dragHint: string
  scaleLabel: string
  outOfRange: string
  decrease: string
  increase: string
  copyLink: string
  copied: string
  bmiExplanation: string
  whatIsBmi: string
  bmiDefinition: string
  howCalculated: string
  bmiFormula: string
  chineseStandards: string
  limitations: string
  bmiLimitations: string
  standardNote: string
  viewSource: string
  toggleTheme: string
  switchLanguage: string
}

const translations: Record<Language, Translations> = {
  en: {
    appName: "Real-time BMI",
    yourBmi: "Your BMI",
    height: "Height",
    weight: "Weight",
    underweight: "Underweight",
    normal: "Normal",
    overweight: "Overweight",
    obese: "Obese",
    healthyWeight: "Healthy weight at {h} cm",
    gainToHealthy: "Gain {kg} kg to reach a healthy BMI.",
    loseToHealthy: "Lose {kg} kg to reach a healthy BMI.",
    inHealthyRange: "You're within the healthy range.",
    dragHint: "Drag the scale to set a target BMI — weight follows.",
    scaleLabel: "BMI scale",
    outOfRange: "Enter {min}–{max}",
    decrease: "Decrease {label}",
    increase: "Increase {label}",
    copyLink: "Copy link",
    copied: "Copied",
    bmiExplanation: "About BMI",
    whatIsBmi: "What is BMI?",
    bmiDefinition:
      "Body Mass Index (BMI) is a numerical value of your weight in relation to your height. It is used to categorize individuals as underweight, normal weight, overweight, or obese.",
    howCalculated: "How is BMI calculated?",
    bmiFormula: "BMI is calculated by dividing your weight in kilograms by the square of your height in meters:",
    chineseStandards: "Chinese BMI Standards",
    limitations: "Limitations of BMI",
    bmiLimitations:
      "BMI does not directly measure body fat and doesn't account for factors like muscle mass, bone density, and overall body composition. Athletes may have a high BMI due to muscle mass rather than body fat. BMI should be used as one of several tools to assess health.",
    standardNote: "Based on the Chinese adult standard WS/T 428—2013. For reference only, not medical advice.",
    viewSource: "View source on GitHub",
    toggleTheme: "Toggle theme",
    switchLanguage: "切换到中文",
  },
  zh: {
    appName: "实时 BMI",
    yourBmi: "您的 BMI",
    height: "身高",
    weight: "体重",
    underweight: "体重过轻",
    normal: "正常",
    overweight: "超重",
    obese: "肥胖",
    healthyWeight: "身高 {h} cm 的健康体重",
    gainToHealthy: "再增重 {kg} kg 即可达到健康范围。",
    loseToHealthy: "再减重 {kg} kg 即可达到健康范围。",
    inHealthyRange: "您的体重处于健康范围内。",
    dragHint: "拖动标尺设定目标 BMI，体重会随之变化。",
    scaleLabel: "BMI 标尺",
    outOfRange: "请输入 {min}–{max}",
    decrease: "减少{label}",
    increase: "增加{label}",
    copyLink: "复制链接",
    copied: "已复制",
    bmiExplanation: "关于 BMI",
    whatIsBmi: "什么是 BMI？",
    bmiDefinition: "身体质量指数 (BMI) 是您的体重与身高关系的数值。它用于将个体分类为体重过轻、正常体重、超重或肥胖。",
    howCalculated: "BMI 如何计算？",
    bmiFormula: "BMI 的计算方法是用您的体重（公斤）除以身高（米）的平方：",
    chineseStandards: "中国 BMI 标准",
    limitations: "BMI 的局限性",
    bmiLimitations:
      "BMI 不直接测量体脂，也不考虑肌肉质量、骨密度和整体身体成分等因素。运动员可能由于肌肉质量而非体脂而具有较高的 BMI。BMI 应作为评估健康的多种工具之一。",
    standardNote: "依据中国成人体重判定标准 WS/T 428—2013，仅供参考，不构成医疗建议。",
    viewSource: "在 GitHub 上查看源码",
    toggleTheme: "切换主题",
    switchLanguage: "Switch to English",
  },
}

/** Replaces `{name}` placeholders in a translation string. */
export function format(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""))
}

type LanguageContextType = {
  language: Language
  translations: Translations
  toggleLanguage: () => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  // Initialize language from localStorage or browser language
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "zh")) {
      setLanguage(savedLanguage)
    } else {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase()
      if (browserLang.startsWith("zh")) {
        setLanguage("zh")
        localStorage.setItem("language", "zh")
      } else {
        setLanguage("en")
        localStorage.setItem("language", "en")
      }
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en"
  }, [language])

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "zh" : "en"
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  return (
    <LanguageContext.Provider value={{ language, translations: translations[language], toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
