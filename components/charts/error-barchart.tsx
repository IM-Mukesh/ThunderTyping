"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { ErrorSlice } from "@/lib/types"

export function ErrorBarChart({ data }: { data: ErrorSlice[] }) {
  const rows = data.map((s) => ({
    name: `${Math.round(s.tStart / 1000)}-${Math.round((s.tStart + 10000) / 1000)}s`,
    errors: s.errors,
    correct: s.correct,
  }))
  return (
    <div className="h-40 w-full rounded-md border border-neutral-800 p-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows}>
          <XAxis dataKey="name" tick={{ fill: "#a3a3a3", fontSize: 12 }} />
          <YAxis tick={{ fill: "#a3a3a3", fontSize: 12 }} />
          <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #262626" }} />
          <Bar dataKey="errors" stackId="a" fill="#f59e0b" />
          <Bar dataKey="correct" stackId="a" fill="#22d3ee" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
