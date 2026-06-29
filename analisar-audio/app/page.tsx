import { PlayoutHeader } from "@/components/playout/header"
import { PlaylistSidebar } from "@/components/playout/playlist-sidebar"
import { VideoMonitor } from "@/components/playout/video-monitor"
import { FramesPanel } from "@/components/playout/frames-panel"
import { FramesInserter } from "@/components/playout/frames-inserter"
import { GcPanel } from "@/components/playout/gc-panel"
import { Multiview } from "@/components/playout/multiview"
import { SwitcherPanel } from "@/components/playout/switcher-panel"
import { VuMeter } from "@/components/playout/vu-meter"

export default function PlayoutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PlayoutHeader />

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Esquerda: playlist */}
        <div className="border-b border-border lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r">
          <PlaylistSidebar />
        </div>

        {/* Centro: monitores + painéis */}
        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
          {/* Linha de monitores com VU stereo no centro */}
          <div className="flex flex-col gap-6 xl:flex-row xl:items-stretch">
            <div className="min-w-0 flex-1">
              <VideoMonitor label="Preview" variant="preview" src="/feed/ambulance.png" />
            </div>
            <VuMeter />
            <div className="min-w-0 flex-1">
              <VideoMonitor
                label="Program"
                variant="program"
                src="/feed/ambulance.png"
                duration="0:20"
                remaining="2:00"
              />
            </div>
          </div>

          {/* Painéis sob os monitores */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <FramesPanel />
            <GcPanel />
          </div>
        </main>

        {/* Direita: multiview + switcher */}
        <aside className="flex flex-col gap-6 border-t border-border p-4 sm:p-6 lg:w-80 lg:shrink-0 lg:border-l lg:border-t-0 xl:w-96">
          <Multiview />
          <SwitcherPanel />
          <FramesInserter />
        </aside>
      </div>
    </div>
  )
}
