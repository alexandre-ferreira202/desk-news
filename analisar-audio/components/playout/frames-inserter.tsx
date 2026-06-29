"use client"

import { useState } from "react"
import { Layers } from "lucide-react"
import { cn } from "@/lib/utils"

function FrameButton({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-14 items-center justify-center rounded-lg border text-sm font-semibold uppercase tracking-wide transition-all",
        active
          ? "border-primary bg-primary/15 text-primary shadow-[0_0_20px_-6px] shadow-primary/60"
          : "border-border bg-secondary text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  )
}

export function FramesInserter() {
  const [activeFrame, setActiveFrame] = useState(1)
  const frames = [1, 2, 3, 4, 5, 6]

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Layers className="size-4 text-primary" />
        Frames para inserir
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {frames.map((n) => (
          <FrameButton key={n} label={`Frame ${n}`} active={activeFrame === n} onClick={() => setActiveFrame(n)} />
        ))}
      </div>
    </div>
  )
}
