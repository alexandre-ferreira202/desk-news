"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { SlidersVertical } from "lucide-react"
import { cn } from "@/lib/utils"

/* Botão de transição estilo "tecla" brilhante translúcida */
function KeyButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string
  icon?: React.ReactNode
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex h-16 flex-col items-center justify-center gap-1 rounded-md border text-[11px] font-bold uppercase tracking-wider transition-all",
        "bg-gradient-to-b from-zinc-100 to-zinc-300 text-zinc-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_4px_rgba(0,0,0,0.5)]",
        "border-zinc-400 hover:from-white hover:to-zinc-200 active:translate-y-px",
        active && "from-primary/80 to-primary text-primary-foreground border-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_0_16px_-2px_var(--primary)]",
      )}
    >
      {icon}
      {label}
    </button>
  )
}

export function SwitcherPanel() {
  const [fader, setFader] = useState(35) // 0 = topo (PGM), 100 = base (PRV)
  const [transition, setTransition] = useState<"cut" | "auto" | "wipe" | "dissolve">("dissolve")
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const updateFromPointer = useCallback((clientY: number) => {
    const el = trackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = ((clientY - rect.top) / rect.height) * 100
    setFader(Math.min(100, Math.max(0, pct)))
  }, [])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (dragging.current) updateFromPointer(e.clientY)
    }
    const onUp = () => {
      dragging.current = false
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
  }, [updateFromPointer])

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
        <SlidersVertical className="size-4 text-primary" />
        Corte de imagem
      </h3>

      <div className="flex items-stretch gap-4">
        {/* Painel embutido com a alavanca T-bar realista */}
        <div
          className="relative flex w-36 shrink-0 items-stretch justify-center rounded-xl border border-black/60 p-3"
          style={{
            background:
              "radial-gradient(120% 120% at 50% 0%, #2a2a2a 0%, #181818 55%, #0d0d0d 100%)",
            boxShadow:
              "inset 0 2px 6px rgba(0,0,0,0.8), inset 0 -2px 6px rgba(255,255,255,0.04), 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Parafusos nos cantos */}
          {[
            "left-1.5 top-1.5",
            "right-1.5 top-1.5",
            "left-1.5 bottom-1.5",
            "right-1.5 bottom-1.5",
          ].map((pos) => (
            <span
              key={pos}
              className={cn(
                "absolute size-2.5 rounded-full",
                pos,
              )}
              style={{
                background: "radial-gradient(circle at 35% 30%, #888 0%, #444 50%, #222 100%)",
                boxShadow: "inset 0 0 1px rgba(0,0,0,0.8), 0 1px 1px rgba(0,0,0,0.6)",
              }}
            />
          ))}

          {/* Escala graduada vermelho-verde-vermelho */}
          <div className="relative ml-1 flex w-5 flex-col justify-between py-1">
            {/* faixa de cor */}
            <span className="absolute left-1/2 top-1 h-[18%] w-[3px] -translate-x-1/2 rounded-full bg-destructive" />
            <span className="absolute left-1/2 top-[19%] h-[62%] w-[3px] -translate-x-1/2 rounded-full bg-primary" />
            <span className="absolute bottom-1 left-1/2 h-[18%] w-[3px] -translate-x-1/2 rounded-full bg-destructive" />
            {/* traços */}
            {Array.from({ length: 21 }).map((_, i) => (
              <span
                key={i}
                className="ml-auto h-px bg-white/50"
                style={{ width: i % 5 === 0 ? "100%" : "55%" }}
              />
            ))}
          </div>

          {/* Trilho da alavanca */}
          <div
            ref={trackRef}
            onPointerDown={(e) => {
              dragging.current = true
              updateFromPointer(e.clientY)
            }}
            className="relative ml-2 mr-1 w-7 cursor-grab touch-none active:cursor-grabbing"
            role="slider"
            aria-label="Alavanca de corte (T-bar)"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(fader)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") setFader((f) => Math.max(0, f - 4))
              if (e.key === "ArrowDown") setFader((f) => Math.min(100, f + 4))
            }}
          >
            {/* fenda escura central */}
            <span
              className="absolute left-1/2 top-2 bottom-2 w-2 -translate-x-1/2 rounded-full"
              style={{ background: "linear-gradient(90deg, #000, #2a2a2a, #000)", boxShadow: "inset 0 0 3px #000" }}
            />

            {/* LED verde de status */}
            <span
              className="absolute left-1/2 z-10 size-2 -translate-x-1/2 rounded-full bg-primary"
              style={{
                top: `calc(${fader}% + 14px)`,
                boxShadow: "0 0 6px 1px var(--primary)",
              }}
            />

            {/* Cabo cromado da T-bar */}
            <span
              className="absolute left-1/2 z-20 h-9 w-2.5 -translate-x-1/2 rounded-sm"
              style={{
                top: `calc(${fader}% - 18px)`,
                background: "linear-gradient(90deg, #6b6b6b 0%, #f0f0f0 45%, #fff 55%, #777 100%)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.6)",
              }}
            />

            {/* Botão / pega cromada da T-bar */}
            <span
              className="absolute left-1/2 z-30 h-7 w-[52px] -translate-x-1/2 rounded-full border border-black/40"
              style={{
                top: `calc(${fader}% - 6px)`,
                background:
                  "linear-gradient(180deg, #fafafa 0%, #cfcfcf 40%, #9a9a9a 60%, #e8e8e8 100%)",
                boxShadow:
                  "inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -2px 3px rgba(0,0,0,0.4), 0 3px 6px rgba(0,0,0,0.6)",
              }}
            >
              <span className="absolute left-1/2 top-1/2 h-3 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded bg-black/30" />
            </span>
          </div>
        </div>

        {/* Teclas de transição */}
        <div className="grid flex-1 grid-cols-2 content-between gap-2">
          <KeyButton label="Cut" active={transition === "cut"} onClick={() => setTransition("cut")} />
          <KeyButton label="Auto" active={transition === "auto"} onClick={() => setTransition("auto")} />
          <KeyButton
            label="Wipe"
            active={transition === "wipe"}
            onClick={() => setTransition("wipe")}
            icon={
              <span className="size-4 overflow-hidden rounded-[2px] border border-zinc-500">
                <span className="block size-full bg-[linear-gradient(135deg,#fff_50%,#222_50%)]" />
              </span>
            }
          />
          <KeyButton label="Dissolve" active={transition === "dissolve"} onClick={() => setTransition("dissolve")} />
        </div>
      </div>

      <p className="text-center text-[11px] text-muted-foreground">Alavanca de corte de imagem</p>
    </section>
  )
}
