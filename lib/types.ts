// Shared types for typing and results

export type Settings = {
  allowBackspacePrev: boolean
  theme: "light" | "dark" | "system"
  font: "sans" | "mono" | "serif"
  duration: number // seconds
}

export type WordStatus = "pending" | "correct" | "incorrect"

export type KeystrokeEvent = {
  t: number // ms since start
  correct: boolean
}

export type ErrorSlice = {
  tStart: number // ms bin start
  errors: number
  correct: number
}

export type ResultsData = {
  seed: number
  duration: number // seconds
  startedAt: number // epoch ms
  endedAt: number // epoch ms
  totalChars: number
  correctChars: number
  errorChars: number
  wordsCompleted: number
  wordsCorrect: number
  wordsIncorrect: number
  missedChars: number
  extraChars: number
  accuracy: number // 0..1
  rawWPM: number
  adjustedWPM: number
  wpmTimeline: { t: number; wpm: number }[] // sampled per second
  errorSlices10s: ErrorSlice[] // 10s slices
  settings: Settings
  consistency?: number // add consistency (std dev of WPM over 10s bins)
}
