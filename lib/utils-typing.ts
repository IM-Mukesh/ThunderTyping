import type { ResultsData, KeystrokeEvent, ErrorSlice } from "./types"

export function computeWpmTimeline(correctBySecond: number[], seconds: number) {
  const out: { t: number; wpm: number }[] = []
  let cum = 0
  for (let s = 0; s < seconds; s++) {
    cum += correctBySecond[s] ?? 0
    const minutes = (s + 1) / 60
    const wpm = minutes > 0 ? cum / 5 / minutes : 0
    out.push({ t: s + 1, wpm: Number(wpm.toFixed(2)) })
  }
  return out
}

export function stddev(values: number[]) {
  if (values.length === 0) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

export function compute10sErrorSlices(events: KeystrokeEvent[], duration: number): ErrorSlice[] {
  const bins = Math.ceil(duration / 10)
  const slices: ErrorSlice[] = []
  for (let i = 0; i < bins; i++) {
    const start = i * 10000
    const end = Math.min((i + 1) * 10000, duration * 1000)
    const inBin = events.filter((e) => e.t >= start && e.t < end)
    slices.push({
      tStart: start,
      errors: inBin.filter((e) => !e.correct).length,
      correct: inBin.filter((e) => e.correct).length,
    })
  }
  return slices
}

export function encodeResults(data: ResultsData) {
  const json = JSON.stringify(data)
  return typeof window === "undefined" ? Buffer.from(json).toString("base64") : btoa(unescape(encodeURIComponent(json)))
}

export function decodeResults(b64: string): ResultsData | null {
  try {
    const json =
      typeof window === "undefined"
        ? Buffer.from(b64, "base64").toString("utf-8")
        : decodeURIComponent(escape(atob(b64)))
    return JSON.parse(json) as ResultsData
  } catch {
    return null
  }
}
