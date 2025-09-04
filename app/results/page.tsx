"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { decodeResults } from "@/lib/utils-typing"
import type { ResultsData } from "@/lib/types"
import { WPMSparkline } from "@/components/charts/wpm-sparkline"
import { ErrorBarChart } from "@/components/charts/error-barchart"
import { Button } from "@/components/ui/button"

export default function ResultsPage() {
  const params = useSearchParams()
  const router = useRouter()
  const [data, setData] = useState<ResultsData | null>(null)

  useEffect(() => {
    const encoded = params.get("d")
    if (encoded) {
      const parsed = decodeResults(encoded)
      if (parsed) {
        setData(parsed)
        return
      }
    }
    try {
      const last = sessionStorage.getItem("typing.lastResults")
      if (last) {
        setData(JSON.parse(last))
        return
      }
    } catch {}
  }, [params])

  const accuracyPct = useMemo(() => (data ? (data.accuracy * 100).toFixed(1) : "0.0"), [data])

  if (!data) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 text-neutral-200">
        <h1 className="text-lg font-semibold">No results available</h1>
        <p className="mt-2 text-neutral-400">Complete a typing test to see results.</p>
        <Button className="mt-4 bg-cyan-500 text-black hover:bg-cyan-400" onClick={() => router.push("/")}>
          Start typing
        </Button>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 text-neutral-200">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-balance text-xl font-semibold">Results</h1>
            <p className="text-sm text-neutral-400">
              Duration {data.duration}s • Seed {data.seed}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button className="bg-cyan-500 text-black hover:bg-cyan-400" onClick={() => router.push("/")}>
              New set
            </Button>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-md border border-neutral-800 p-4">
            <div className="text-xs text-neutral-400">Adjusted WPM</div>
            <div className="mt-1 text-2xl font-semibold">{data.adjustedWPM.toFixed(1)}</div>
          </div>
          <div className="rounded-md border border-neutral-800 p-4">
            <div className="text-xs text-neutral-400">Raw WPM</div>
            <div className="mt-1 text-2xl font-semibold">{data.rawWPM.toFixed(1)}</div>
          </div>
          <div className="rounded-md border border-neutral-800 p-4">
            <div className="text-xs text-neutral-400">Accuracy</div>
            <div className="mt-1 text-2xl font-semibold">{accuracyPct}%</div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-md border border-neutral-800 p-4">
            <div className="text-xs text-neutral-400">Consistency (10s std dev)</div>
            <div className="mt-1 text-2xl font-semibold">
              {typeof data.consistency === "number" ? data.consistency.toFixed(2) : "—"}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-md border border-neutral-800 p-4">
            <div className="text-sm font-medium text-neutral-300">WPM over time</div>
            <p className="mb-2 text-xs text-neutral-500">Sparkline</p>
            <WPMSparkline data={data.wpmTimeline} />
          </div>
          <div className="rounded-md border border-neutral-800 p-4">
            <div className="text-sm font-medium text-neutral-300">Errors by time slice</div>
            <p className="mb-2 text-xs text-neutral-500">10-second bins</p>
            <ErrorBarChart data={data.errorSlices10s} />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-md border border-neutral-800 p-4">
            <div className="text-xs text-neutral-400">Correct / Incorrect words</div>
            <div className="mt-1 text-lg">
              {data.wordsCorrect} / {data.wordsIncorrect}
            </div>
          </div>
          <div className="rounded-md border border-neutral-800 p-4">
            <div className="text-xs text-neutral-400">Keystrokes</div>
            <div className="mt-1 text-lg">
              {data.correctChars} correct • {data.errorChars} error
            </div>
          </div>
          <div className="rounded-md border border-neutral-800 p-4">
            <div className="text-xs text-neutral-400">Extra / Missed</div>
            <div className="mt-1 text-lg">
              {data.extraChars} extra • {data.missedChars} missed
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
