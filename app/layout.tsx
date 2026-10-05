import type React from "react"
import "@/app/globals.css"
import type { Metadata, Viewport } from "next"
import { Geist, Instrument_Serif } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/hooks/use-language"

const sans = Geist({ subsets: ["latin"], variable: "--font-sans" })
const display = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-display" })

export const metadata: Metadata = {
  title: "Real-time BMI Calculator · 实时 BMI 计算器",
  description:
    "Calculate your BMI in real time based on Chinese standards, and see the healthy weight range for your height.",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0e" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={`${sans.variable} ${display.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="bmi-theme">
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
