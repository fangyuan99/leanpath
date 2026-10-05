import { BMICalculator } from "@/components/bmi-calculator"
import { SiteFooter, SiteHeader } from "@/components/site-chrome"

export default function Home() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-16 pt-6 sm:px-8 lg:pt-16">
        <BMICalculator />
      </main>
      <SiteFooter />
    </div>
  )
}
