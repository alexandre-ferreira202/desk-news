"use client"

import { useState } from "react"
import { Film, HardDrive, FolderOpen, ChevronRight, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface VtItem {
  id: string
  title: string
  format: string
  time: string
  size: string
}

const localFiles: VtItem[] = [
  { id: "1", title: "Colapso Hospitais", format: "HD", time: "0:37", size: "50 MB" },
  { id: "2", title: "Reforço na Saúde", format: "HD", time: "0:37", size: "52 MB" },
  { id: "3", title: "Binossauro PA", format: "HD", time: "0:27", size: "20 MB" },
  { id: "4", title: "Reportagem Especial", format: "UHD", time: "0:34", size: "30 MB" },
  { id: "5", title: "Atualiza Araguaína", format: "HD", time: "0:44", size: "556 MB" },
  { id: "6", title: "Andamento Geral", format: "HD", time: "0:35", size: "55 MB" },
  { id: "7", title: "Cobertura Petição", format: "HD", time: "0:06", size: "252 MB" },
  { id: "8", title: "Gabarito Consedi", format: "HD", time: "0:12", size: "18 MB" },
]

const queue: { id: string; title: string; time: string }[] = [
  { id: "q1", title: "Colapso Hospitais", time: "0:37" },
  { id: "q2", title: "Diário Giorto Porto", time: "0:00" },
  { id: "q3", title: "Encerramento MD", time: "0:00" },
  { id: "q4", title: "Maecronizatuba", time: "0:00" },
]

export function PlaylistSidebar() {
  const [active, setActive] = useState("1")

  return (
    <aside className="flex h-full flex-col gap-4 overflow-y-auto bg-sidebar p-4">
      {/* Header card */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold">VTs do Jornal</span>
            <span className="mt-1 text-[11px] text-muted-foreground">13 materiais</span>
          </div>
          <span className="rounded-md bg-primary/15 px-2 py-1 font-mono text-xs font-semibold text-primary">
            04:00
          </span>
        </div>
      </div>

      {/* Local folder */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <FolderOpen className="size-3.5" />
          Pasta local
        </div>
        <ul className="flex flex-col gap-1.5">
          {localFiles.map((f) => {
            const isActive = active === f.id
            return (
              <li key={f.id}>
                <button
                  onClick={() => setActive(f.id)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                    isActive
                      ? "border-primary/40 bg-primary/10"
                      : "border-transparent bg-card hover:bg-accent",
                  )}
                >
                  <Film
                    className={cn(
                      "size-4 shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm font-medium",
                        isActive && "text-primary",
                      )}
                    >
                      {f.title}
                    </p>
                    <p className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="rounded bg-muted px-1.5 py-px font-mono text-[10px]">{f.format}</span>
                      <span className="font-mono">{f.time}</span>
                      <span>·</span>
                      <span>{f.size}</span>
                    </p>
                  </div>
                  {isActive && <Link2 className="size-3.5 shrink-0 text-primary" />}
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Queue / Espelho */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <HardDrive className="size-3.5" />
          Espelho — Fila no ar
        </div>
        <ul className="flex flex-col gap-1.5">
          {queue.map((q, i) => (
            <li key={q.id}>
              <button className="flex w-full items-center gap-3 rounded-lg border border-transparent bg-card px-3 py-2.5 text-left transition-colors hover:bg-accent">
                <span className="flex size-5 shrink-0 items-center justify-center rounded bg-muted font-mono text-[11px] text-muted-foreground">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{q.title}</span>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{q.time}</span>
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
