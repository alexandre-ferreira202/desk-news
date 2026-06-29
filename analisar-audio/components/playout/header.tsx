"use client"

import { useEffect, useState } from "react"
import { MonitorPlay, Printer, Power, Radio } from "lucide-react"

function Timer({ label, value, active }: { label: string; value: string; active?: boolean }) {
  return (
    <div className="flex flex-col items-center leading-none">
      <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{label}</span>
      <span
        className={
          "font-mono text-xl font-semibold tabular-nums sm:text-2xl " +
          (active ? "text-primary" : "text-foreground")
        }
      >
        {value}
      </span>
    </div>
  )
}

export function PlayoutHeader() {
  const [clock, setClock] = useState("--:--:--")

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-card px-4 py-3 sm:px-6">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <MonitorPlay className="size-5" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold uppercase tracking-wider">DeskNews</span>
          <span className="text-[11px] text-muted-foreground">Exibição (PGM)</span>
        </div>
        <span className="ml-1 hidden items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary sm:inline-flex">
          <Radio className="size-3" />
          No ar
        </span>
      </div>

      {/* Timers */}
      <div className="flex items-center gap-5 sm:gap-8">
        <Timer label="Pré" value="0:00" />
        <Timer label="Atual" value="1:47" active />
        <Timer label="Restante" value="0:00" />
      </div>

      {/* Actions + clock */}
      <div className="flex items-center gap-2">
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent">
          <MonitorPlay className="size-4" />
          <span className="hidden sm:inline">Câmeras</span>
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent">
          <Printer className="size-4" />
          <span className="hidden sm:inline">Imprimir</span>
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          <Power className="size-4" />
          <span className="hidden sm:inline">Encerrar</span>
        </button>
        <div className="ml-1 rounded-lg border border-border bg-secondary px-3 py-2 font-mono text-sm font-semibold tabular-nums text-foreground">
          {clock}
        </div>
      </div>
    </header>
  )
}
