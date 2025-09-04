"use client"

import { useEffect, useRef } from "react"
import type { ResultsData } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { encodeResults } from "@/lib/utils-typing"
import { useRouter } from "next/navigation"

export function ResultsPanel({
  data,
  onRetrySame,
  onNewSet,
}: {
  data: ResultsData
  onRetrySame: () => void
  onNewSet: () => void
}) {
  const router = useRouter()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  const link = typeof window !== "undefined" ? `${window.location.origin}/results?d=${encodeResults(data)}` : "/results"

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      aria-live="polite"
      className="mx-auto w-full max-w-3xl rounded-xl border border-neutral-800 bg-neutral-950/90 p-4 shadow-lg outline-none ring-1 ring-cyan-400/20 animate-in fade-in slide-in-from-bottom-4 duration-300"
      role="dialog"
      aria-label="Typing results"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-balance text-base font-semibold text-neutral-200">Session Results</h2>
          <p className="text-xs text-neutral-400">
            WPM {data.adjustedWPM.toFixed(1)} • Accuracy {(data.accuracy * 100).toFixed(1)}%
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onRetrySame} className="bg-cyan-500 text-black hover:bg-cyan-400">
            Retry same
          </Button>
          <Button variant="secondary" onClick={onNewSet}>
            New set
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await navigator.clipboard.writeText(link)
            }}
            title="Copy share link"
          >
            Copy link
          </Button>
          <Button variant="ghost" onClick={() => router.push(link)}>
            Full results
          </Button>
        </div>
      </div>
    </div>
  )
}
