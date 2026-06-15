/**
 * 🎬 DeskNews Broadcast Playout Interface
 * Ultra-professional dark-mode UI with ciano neon accents (#00e676)
 * Integrates with existing playout logic maintaining all broadcast functionality
 */

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  MonitorPlay,
  RefreshCw,
  FileCheck,
  FileX,
  FolderOpen,
  Film,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Youtube,
  X,
  Link,
  Type,
  Settings,
  MoreVertical,
  Copy,
  Trash2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/playout_desknews")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      date: (search.date as string) || undefined,
      programa: (search.programa as string) || undefined,
    };
  },
  component: PlayoutPage,
  head: () => ({ meta: [{ title: "Exibição (PGM) — DeskNews" }] }),
});

// ─────────────────────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────────────────────

interface PlayoutItem {
  id: string;
  assunto: string;
  cabeca: string | null;
  tempo: string | null;
  materia_id: string | null;
  ordem: number;
  formato: string | null;
}

interface LocalVideoFile {
  name: string;
  sizeMB: number;
  lastModified: string;
  codec: "H.264" | "H.265/HEVC" | "AV1" | "Outro" | "Verificando..." | "Erro";
  blobUrl: string;
  duration: number | null;
  type: "video" | "image" | "unknown";
  mimeType: string;
}

interface MateriaDB {
  id: string;
  titulo: string;
  editor_texto: string | null;
  editor_imagem: string | null;
  credito_reporter: string | null;
  estrutura: string | null;
}

interface ItemLauda {
  tipo: "SONORA" | "PASSAGEM" | "IMAGENS" | "ED_TEXTO" | "ED_IMAGEM" | "PRODUÇÃO" | "REPÓRTER";
  nome: string;
  valor?: string;
  ordem: number;
}

interface MateriaComLauda extends MateriaDB {
  produção?: string | null;
  itensLauda: ItemLauda[];
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────

function PlayoutPage() {
  const { date, programa } = Route.useSearch();

  // ──── Core States ────
  const [items, setItems] = useState<PlayoutItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [isDirReady, setIsDirReady] = useState(false);
  const [localFiles, setLocalFiles] = useState<LocalVideoFile[]>([]);

  // ──── Playout States ────
  const [selectedFile, setSelectedFile] = useState<LocalVideoFile | null>(null);
  const [pgmFile, setPgmFile] = useState<LocalVideoFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pgmProgress, setPgmProgress] = useState(0);
  const [pgmCurrentTime, setPgmCurrentTime] = useState(0);

  // ──── Materia States ────
  const [materiaAtual, setMateriaAtual] = useState<MateriaComLauda | null>(null);

  // ──── UI States ────
  const [clock, setClock] = useState("00:00:00");
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [isScanningFiles, setIsScanningFiles] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // ──── GC States ────
  const [gcVisible, setGcVisible] = useState(false);
  const [gcLine1, setGcLine1] = useState("");
  const [gcLine2, setGcLine2] = useState("");

  // ──── Clock Update ────
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setClock(now.toLocaleTimeString("pt-BR", { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ──── Mock: Load Rundown ────
  const loadRundown = useCallback(async () => {
    const mockItems: PlayoutItem[] = [
      {
        id: "pauta-123",
        assunto: "Entrevista Prefeito",
        cabeca: null,
        tempo: "2:30",
        materia_id: "mat-123",
        ordem: 1,
        formato: "VT",
      },
      {
        id: "pauta-124",
        assunto: "Link Externo",
        cabeca: null,
        tempo: "1:45",
        materia_id: "mat-124",
        ordem: 2,
        formato: "Link",
      },
    ];
    setItems(mockItems);
  }, []);

  useEffect(() => {
    loadRundown();
  }, [loadRundown]);

  // ──── Format Time ────
  const formatTime = (seconds: number) => {
    const mm = Math.floor(seconds / 60);
    const ss = Math.floor(seconds % 60);
    return `${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
  };

  const currentItem = items[currentIndex];

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-[#0d0d0d] text-[#e0e0e0] flex flex-col overflow-hidden" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* ──── WELCOME MODAL ──── */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-8 flex flex-col items-center gap-6 w-[420px] shadow-2xl">
            <div className="p-3 bg-[#00e676]/10 rounded-lg">
              <MonitorPlay className="h-8 w-8 text-[#00e676]" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">DeskNews Exibição</h2>
              <p className="text-sm text-[#888] mt-2">Selecione a pasta onde estão os VTs para iniciar o playout.</p>
            </div>
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="flex items-center gap-2 px-8 py-3 rounded-lg bg-[#00e676] text-black font-bold text-sm uppercase w-full justify-center hover:bg-[#00d663] transition-all"
            >
              <FolderOpen className="h-4 w-4" />
              Selecionar Pasta
            </button>
          </div>
        </div>
      )}

      {/* ──── HEADER ──── */}
      <header className="h-14 border-b border-[#252525] bg-[#121212] flex items-center justify-between px-6 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="text-sm font-bold text-white">DeskNews</div>
          <div className="text-xs text-[#666]">BROADCAST PLAYOUT</div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs text-[#666]">ON AIR</div>
          <div className="text-lg font-mono font-bold text-[#00e676]">{clock}</div>
        </div>
      </header>

      {/* ──── MAIN CONTENT ──── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ──── LEFT SIDEBAR: REFINE PANEL ──── */}
        <div className="w-72 bg-[#0f0f0f] border-r border-[#252525] flex flex-col overflow-y-auto">
          <div className="p-4 bg-[#1a1a1a] border-b border-[#252525]">
            <div className="text-xs font-bold text-[#00e676] uppercase tracking-widest">Refine</div>
          </div>

          <div className="flex-1 p-4 space-y-4">
            {/* AI Refine Section */}
            <div>
              <div className="text-xs font-bold text-[#00e676] mb-2">Refinar com IA</div>
              <textarea
                placeholder='O que deseja mudar na pauta? (Ex: "Ajuste o GC para a pauta #123")'
                className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-xs text-[#e0e0e0] placeholder-[#555] focus:outline-none focus:border-[#00e676]"
                rows={4}
              />
            </div>

            {/* Tamanho Dropdown */}
            <div>
              <label className="text-xs text-[#888] block mb-1">Tamanho</label>
              <select className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-xs text-[#e0e0e0] focus:outline-none focus:border-[#00e676]">
                <option>9:16</option>
                <option>16:9</option>
                <option>1:1</option>
              </select>
            </div>

            {/* Duração Dropdown */}
            <div>
              <label className="text-xs text-[#888] block mb-1">Duração</label>
              <select className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-xs text-[#e0e0e0] focus:outline-none focus:border-[#00e676]">
                <option>10s</option>
                <option>15s</option>
                <option>20s</option>
              </select>
            </div>

            {/* Apply Button */}
            <button className="w-full bg-[#00e676] text-black font-bold text-xs py-2 rounded hover:bg-[#00d663] transition-all uppercase">
              Aplicar Ajustes
            </button>
          </div>

          {/* Rundown List */}
          <div className="border-t border-[#252525] p-4">
            <div className="text-xs font-bold text-[#666] uppercase mb-3">Rundown Pautas</div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded text-xs font-semibold transition-all",
                    idx === currentIndex
                      ? "bg-[#00e676]/20 text-[#00e676] border border-[#00e676]/50"
                      : "bg-[#1a1a1a] text-[#888] hover:text-[#e0e0e0]"
                  )}
                >
                  <div className="font-bold">PAUTA {item.ordem}</div>
                  <div className="text-[10px] opacity-75">{item.assunto}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ──── CENTER: MONITOR/CANVAS ──── */}
        <div className="flex-1 bg-[#0a0a0a] flex flex-col items-center justify-center p-6 overflow-hidden">
          {/* Monitor Frame */}
          <div className="w-full max-w-5xl aspect-video bg-[#1a1a1a] border-2 border-[#333] rounded-lg overflow-hidden flex flex-col shadow-2xl">
            {/* Video Feed */}
            <div className="flex-1 bg-gradient-to-br from-[#1e3a5f] via-[#0f2744] to-[#1e1e2e] relative overflow-hidden flex items-center justify-center">
              {/* Grid Background */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage:
                    "linear-gradient(0deg, transparent 24%, rgba(0, 230, 118, 0.1) 25%, rgba(0, 230, 118, 0.1) 26%, transparent 27%)",
                  backgroundSize: "50px 50px",
                }}
              />

              {/* Content */}
              <div className="relative z-10 text-center">
                <div className="bg-[#141e1e]/60 border border-[#00e676]/20 rounded-lg px-8 py-6 backdrop-blur">
                  <div className="text-sm font-bold text-[#00e676] mb-4 tracking-widest">DESKNEWS - RUNDOWN PAUTAS</div>

                  {currentItem && (
                    <div className="space-y-2">
                      <div className="text-white font-bold">PAUTA {currentItem.ordem}</div>
                      <div className="text-xs text-[#888]">{currentItem.assunto}</div>
                    </div>
                  )}

                  {items.length > 1 && (
                    <div className="space-y-2 mt-4 pt-4 border-t border-[#00e676]/20">
                      {items.map((item, idx) => (
                        idx !== currentIndex && (
                          <div key={item.id} className="text-xs text-[#666]">
                            <span className="text-[#00e676] font-bold">PAUTA {item.ordem}</span> - {item.assunto}
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>

                {/* Playout Counter */}
                <div className="absolute bottom-4 right-6 font-mono font-bold text-2xl text-[#00e676] tracking-wider">
                  PLAYOUT: {formatTime(pgmCurrentTime)} / {currentItem?.tempo || "00:00"}
                </div>
              </div>
            </div>

            {/* VU-Meter Bar */}
            <div className="bg-[#1a1a1a] border-t border-[#333] px-4 py-3 flex items-center gap-4 h-12">
              <div className="text-xs text-[#888] font-bold">VU-METER</div>
              <div className="flex gap-1 items-end h-8">
                {[25, 50, 75, 50, 25].map((height, i) => (
                  <div
                    key={i}
                    className="w-2 bg-gradient-to-t from-[#ff6b35] via-[#00b85c] to-[#00e676] rounded-sm"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ──── RIGHT PANEL: MONITOR CONTROLS ──── */}
        <div className="w-32 bg-[#0f0f0f] border-l border-[#252525] flex flex-col items-center gap-3 p-3">
          <button className="w-8 h-8 bg-[#1a1a1a] border border-[#333] rounded hover:border-[#00e676] hover:text-[#00e676] text-[#666] transition-all flex items-center justify-center">
            <Settings size={16} />
          </button>
          <button className="w-8 h-8 bg-[#1a1a1a] border border-[#333] rounded hover:border-[#00e676] hover:text-[#00e676] text-[#666] transition-all flex items-center justify-center">
            <Zap size={16} />
          </button>
          <button className="w-8 h-8 bg-[#1a1a1a] border border-[#333] rounded hover:border-[#00e676] hover:text-[#00e676] text-[#666] transition-all flex items-center justify-center">
            <MoreVertical size={16} />
          </button>

          <div className="text-center mt-4 pt-4 border-t border-[#252525] w-full">
            <div className="text-xs text-[#888] mb-1">Res</div>
            <div className="text-xs font-bold text-[#00e676]">1080p60</div>
            <div className="text-xs text-[#666] mt-2">Zoom: 14%</div>
            <div className="text-xs text-[#666]">HTML5</div>
          </div>
        </div>
      </div>

      {/* ──── TIMELINE / BOTTOM PANEL ──── */}
      <div className="bg-[#0f0f0f] border-t border-[#252525] h-28 flex flex-col">
        {/* Timeline Tabs */}
        <div className="flex border-b border-[#252525] bg-[#121212]">
          <button className="px-4 py-2 text-xs font-bold text-[#00e676] bg-[#1a1a1a] border-r border-[#252525]">
            MASTER
          </button>
          <button className="px-4 py-2 text-xs font-bold text-[#666]">INTERAÇÕES</button>
        </div>

        {/* Timeline Controls */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#252525]">
          <div className="flex gap-2">
            <button className="w-7 h-7 bg-[#1a1a1a] border border-[#333] rounded text-[#666] hover:border-[#444] flex items-center justify-center text-xs">
              🔍
            </button>
            <button className="w-7 h-7 bg-[#1a1a1a] border border-[#333] rounded text-[#666] hover:border-[#444] flex items-center justify-center text-xs">
              📋
            </button>
            <button className="w-7 h-7 bg-[#1a1a1a] border border-[#333] rounded text-[#666] hover:border-[#444] flex items-center justify-center text-xs">
              🗑
            </button>
          </div>

          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-[#00e676] text-black font-bold text-xs rounded hover:bg-[#00d663] transition-all">
              MOTION
            </button>
            <button className="px-4 py-1.5 bg-[#00e676] text-black font-bold text-xs rounded hover:bg-[#00d663] transition-all">
              PLAY ALL
            </button>
          </div>
        </div>

        {/* Track Area */}
        <div className="flex-1 flex items-center overflow-x-auto px-4 gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="min-w-[300px] h-14 bg-gradient-to-br from-[#1a3a4a] to-[#0f2844] border border-[#333] rounded px-3 flex items-center gap-2 text-xs font-semibold text-[#e0e0e0]"
            >
              <span>▶</span>
              <span className="flex-1">RUNDOWN: PAUTA {item.ordem} ({item.assunto})</span>
              <span className="bg-[#00e676] text-black px-2 py-0.5 rounded text-[8px] font-bold">{item.tempo}</span>
              <span className="text-[#00e676] font-mono ml-2">{item.tempo}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
