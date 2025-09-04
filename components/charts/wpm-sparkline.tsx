"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function WPMSparkline({ data }: { data: { t: number; wpm: number }[] }) {
  return (
    <div className="h-32 w-full rounded-md border border-neutral-800 p-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="t" hide />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{ background: "#0a0a0a", border: "1px solid #262626" }}
            labelFormatter={(v) => `t=${v}s`}
            formatter={(val: number) => [`${val.toFixed(1)} wpm`, "WPM"]}
          />
          <Line type="monotone" dataKey="wpm" stroke="#22d3ee" strokeWidth={2} dot={false} isAnimationActive={true} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
