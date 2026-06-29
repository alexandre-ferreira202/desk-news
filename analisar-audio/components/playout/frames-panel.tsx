"use client"

import { SkipBack, SkipForward, Play, Square, ChevronRight } from "lucide-react"

export function FramesPanel() {
  return (
    <section className="grid grid-cols-1 gap-4">
      {/* Lauda / transport */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
            <span className="size-2 rounded-full bg-destructive" />
            Lauda
          </h3>
          <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Tela cheia
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
            <span>0:00</span>
            <span className="text-foreground">Colapso Hospitais</span>
            <span>1:47</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/3 rounded-full bg-primary" />
          </div>
        </div>

        {/* Transport controls */}
        <div className="flex items-center justify-center gap-2">
          <button className="flex size-11 items-center justify-center rounded-lg border border-border bg-secondary text-foreground transition-colors hover:bg-accent">
            <SkipBack className="size-4" />
          </button>
          <button className="flex size-11 items-center justify-center rounded-lg border border-border bg-secondary text-foreground transition-colors hover:bg-accent">
            <Square className="size-4" />
          </button>
          <button className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90">
            <Play className="size-5 fill-current" />
          </button>
          <button className="flex size-11 items-center justify-center rounded-lg border border-border bg-secondary text-foreground transition-colors hover:bg-accent">
            <SkipForward className="size-4" />
          </button>
        </div>

        {/* Transition */}
        <div className="space-y-2 rounded-lg bg-secondary/60 p-3">
          <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ChevronRight className="size-3.5" />
              Transição
            </span>
            <span className="font-mono text-foreground">1.0s</span>
          </div>
          <input type="range" min={0} max={100} defaultValue={50} className="range-slider" aria-label="Duração da transição" />
        </div>
      </div>
    </section>
  )
}
