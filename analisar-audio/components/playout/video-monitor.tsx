import Image from "next/image"
import { cn } from "@/lib/utils"

interface VideoMonitorProps {
  label: string
  variant: "preview" | "program"
  src: string
  duration?: string
  remaining?: string
}

export function VideoMonitor({ label, variant, src, duration, remaining }: VideoMonitorProps) {
  const isProgram = variant === "program"

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="flex items-center justify-between px-0.5">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
          <span
            className={cn(
              "size-2 rounded-full",
              isProgram ? "animate-pulse bg-destructive" : "bg-primary",
            )}
          />
          {label}
        </span>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Colapso Hospitais
        </span>
      </figcaption>

      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden rounded-xl border bg-black",
          isProgram ? "border-destructive/50 ring-1 ring-destructive/30" : "border-border",
        )}
      >
        <Image src={src || "/placeholder.svg"} alt={`Sinal ${label}`} fill className="object-cover" priority />

        {/* On-air tally */}
        {isProgram && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-destructive px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            <span className="size-1.5 rounded-full bg-white" />
            On Air
          </span>
        )}

        {/* Top-right badges (program) */}
        {isProgram && (duration || remaining) && (
          <div className="absolute right-3 top-3 flex gap-2">
            {duration && (
              <span className="rounded-md bg-black/70 px-2 py-1 font-mono text-[11px] font-medium text-white backdrop-blur">
                {duration}
              </span>
            )}
            {remaining && (
              <span className="rounded-md bg-primary/90 px-2 py-1 font-mono text-[11px] font-semibold text-primary-foreground backdrop-blur">
                {remaining}
              </span>
            )}
          </div>
        )}

        {/* Bottom timecode */}
        <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-1 font-mono text-[11px] text-white backdrop-blur">
          3:27
        </span>
      </div>
    </figure>
  )
}
