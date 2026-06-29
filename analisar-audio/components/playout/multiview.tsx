import Image from "next/image"
import { Grid2X2 } from "lucide-react"
import { cn } from "@/lib/utils"

const cams = [
  { id: 1, src: "/cams/cam1.png", live: true },
  { id: 2, src: "/cams/cam2.png", live: false },
  { id: 3, src: "/cams/cam3.png", live: false },
  { id: 4, src: "/cams/cam4.png", live: false },
]

export function Multiview() {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="flex items-center gap-2 px-0.5 text-xs font-semibold uppercase tracking-wider">
        <Grid2X2 className="size-4 text-primary" />
        Multiview — 4 câmeras
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {cams.map((cam) => (
          <div
            key={cam.id}
            className={cn(
              "relative aspect-video overflow-hidden rounded-lg border bg-black",
              cam.live ? "border-destructive ring-1 ring-destructive/40" : "border-border",
            )}
          >
            <Image src={cam.src || "/placeholder.svg"} alt={`Câmera ${cam.id}`} fill className="object-cover" />
            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
              Cam {cam.id}
            </span>
            {cam.live && (
              <span className="absolute left-1.5 top-1.5 size-2 animate-pulse rounded-full bg-destructive" />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
