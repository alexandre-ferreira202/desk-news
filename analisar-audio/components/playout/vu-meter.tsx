"use client"

import { useEffect, useRef, useState } from "react"

const SEGMENTS = 24

function channelColor(index: number, total: number) {
  const ratio = index / total
  if (ratio > 0.85) return "var(--destructive)"
  if (ratio > 0.62) return "oklch(0.82 0.17 85)"
  return "var(--primary)"
}

function VuChannel({ label, level, peak }: { label: string; level: number; peak: number }) {
  const litCount = Math.round(level * SEGMENTS)
  const peakIndex = Math.round(peak * SEGMENTS)

  return (
    <div className="flex h-full flex-col items-center gap-2">
      <div className="flex flex-1 flex-col-reverse gap-[3px]">
        {Array.from({ length: SEGMENTS }).map((_, i) => {
          const lit = i < litCount
          const isPeak = i === peakIndex - 1
          const color = channelColor(i, SEGMENTS)
          return (
            <span
              key={i}
              className="w-3 rounded-[2px] transition-[opacity,background-color] duration-75 sm:w-3.5"
              style={{
                height: 6,
                backgroundColor: lit || isPeak ? color : "var(--muted)",
                opacity: lit ? 1 : isPeak ? 0.9 : 0.18,
                boxShadow: lit && i > SEGMENTS * 0.62 ? `0 0 6px -1px ${color}` : "none",
              }}
            />
          )
        })}
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  )
}

export function VuMeter() {
  const [levels, setLevels] = useState({ l: 0.4, r: 0.45 })
  const peaksRef = useRef({ l: 0.4, r: 0.45 })
  const [, force] = useState(0)

  useEffect(() => {
    let raf: number
    let last = performance.now()
    const tick = (now: number) => {
      if (now - last > 90) {
        last = now
        setLevels((prev) => {
          const drift = (base: number) => {
            const target = 0.35 + Math.random() * 0.55
            const next = base + (target - base) * 0.5
            return Math.min(1, Math.max(0.05, next))
          }
          const l = drift(prev.l)
          const r = drift(prev.r)
          peaksRef.current = {
            l: Math.max(l, peaksRef.current.l - 0.02),
            r: Math.max(r, peaksRef.current.r - 0.02),
          }
          return { l, r }
        })
        force((n) => n + 1)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const db = Math.round(-48 + Math.max(levels.l, levels.r) * 48)

  return (
    <div className="flex w-full flex-row items-stretch gap-4 rounded-xl border border-border bg-card p-4 xl:h-full xl:w-auto xl:flex-col">
      <div className="flex items-center justify-between gap-2 xl:flex-col xl:items-center">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">VU</span>
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-foreground">
          {db} dB
        </span>
      </div>

      <div className="flex flex-1 justify-center gap-3 xl:flex-col-reverse xl:gap-2">
        {/* dB scale */}
        <div className="hidden flex-col justify-between py-0.5 text-[8px] font-medium tabular-nums text-muted-foreground xl:flex">
          <span>0</span>
          <span>-12</span>
          <span>-24</span>
          <span>-48</span>
        </div>
        <div className="flex flex-1 gap-2.5">
          <VuChannel label="L" level={levels.l} peak={peaksRef.current.l} />
          <VuChannel label="R" level={levels.r} peak={peaksRef.current.r} />
        </div>
      </div>
    </div>
  )
}
