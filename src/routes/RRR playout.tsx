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
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/RRR playout")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      date: (search.date as string) || undefined,
      programa: (search.programa as string) || undefined,
    };
  },
  component: PlayoutPage,
  head: () => ({ meta: [{ title: "Exibição (PGM) — DeskNews" }] }),
});

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
}

interface MateriaDB {
  id: string;
  titulo: string;
  editor_texto: string | null;
  editor_imagem: string | null;
  credito_reporter: string | null;
  estrutura: string | null;
}

interface Sonora {
  nome: string;
  funcao: string;
  texto?: string;
}

interface Passagem {
  nome: string;
  local: string;
  texto?: string;
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

declare global {
  interface FileSystemHandle {
    kind: "file" | "directory";
    name: string;
  }
  interface FileSystemFileHandle extends FileSystemHandle {
    kind: "file";
    getFile(): Promise<File>;
  }
  interface FileSystemDirectoryHandle extends FileSystemHandle {
    kind: "directory";
    getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
    entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
  }
  interface Window {
    showDirectoryPicker: (options?: {
      id?: string;
      startIn?: string;
      mode?: "read" | "readwrite";
    }) => Promise<FileSystemDirectoryHandle>;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

interface ParseResult {
  sonoras: Sonora[];
  passagens: Passagem[];
  producao: string | null;
  itensLauda: ItemLauda[];
}

function parsarSonorasEPassagens(estrutura: string | null): ParseResult {
  const sonoras: Sonora[] = [];
  const passagens: Passagem[] = [];
  const itensLauda: ItemLauda[] = [];
  let producao: string | null = null;
  let ordem = 0;

  if (!estrutura) {
    console.log("⚠️ Estrutura vazia");
    return { sonoras, passagens, producao, itensLauda };
  }

  console.log("📖 Parseando estrutura com NOVO FORMATO:", estrutura);

  const linhas = estrutura.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  let i = 0;
  while (i < linhas.length) {
    const linha = linhas[i];

    // ════ [SONORA] ════
    if (linha.match(/^\[SONORA\]$/i)) {
      console.log("🎤 Encontrado [SONORA]");
      
      let nome = "";
      let funcao = "";

      // Próxima linha: (NOME DO ENTREVISTADO)
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          nome = nomeMatch[1].trim();
          i++;
          
          // Próxima linha: (FUNÇÃO DO ENTREVISTADO)
          if (i + 1 < linhas.length) {
            const funcaoLinha = linhas[i + 1];
            const funcaoMatch = funcaoLinha.match(/^\(([^)]+)\)$/);
            if (funcaoMatch) {
              funcao = funcaoMatch[1].trim();
              i++;
            }
          }
        }
      }

      if (nome) {
        sonoras.push({ nome, funcao });
        itensLauda.push({
          tipo: "SONORA",
          nome: "SONORA",
          valor: `${nome} - ${funcao}`,
          ordem: ordem++
        });
        console.log("✅ Sonora adicionada:", { nome, funcao });
      }
    }

    // ════ [PASSAGEM] ════
    if (linha.match(/^\[PASSAGEM\]$/i)) {
      console.log("🎥 Encontrado [PASSAGEM]");
      
      let nome = "";
      let local = "";

      // Próxima linha: (NOME DO REPORTER)
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          nome = nomeMatch[1].trim();
          i++;
          
          // Próxima linha: (LOCAL)
          if (i + 1 < linhas.length) {
            const localLinha = linhas[i + 1];
            const localMatch = localLinha.match(/^\(([^)]+)\)$/);
            if (localMatch) {
              local = localMatch[1].trim();
              i++;
            }
          }
        }
      }

      if (nome) {
        passagens.push({ nome, local });
        itensLauda.push({
          tipo: "PASSAGEM",
          nome: "PASSAGEM",
          valor: `${nome} - ${local}`,
          ordem: ordem++
        });
        console.log("✅ Passagem adicionada:", { nome, local });
      }
    }

    i++;
  }

  return { sonoras, passagens, producao, itensLauda };
}

function PlayoutPage() {
  // MONITORES + TRANSIÇÃO
  const [activePlayer, setActivePlayer] = useState<"A" | "B">("A");
  const [transValue, setTransValue] = useState(0);
  const pgmARef = useRef<HTMLVideoElement>(null);
  const pgmBRef = useRef<HTMLVideoElement>(null);
  const [playerAOpacity, setPlayerAOpacity] = useState(1);
  const [playerAZ, setPlayerAZ] = useState(10);
  const [playerBOpacity, setPlayerBOpacity] = useState(0);
  const [playerBZ, setPlayerBZ] = useState(0);

  // GC - GERADOR DE CARACTERES
  const [gcLine1, setGcLine1] = useState("");
  const [gcLine2, setGcLine2] = useState("");
  const [gcVisible, setGcVisible] = useState(false);
  const [gcDuration, setGcDuration] = useState(0);
  const [gcCreditsQueue, setGcCreditsQueue] = useState<Array<{ line1: string; line2: string }>>([]);
  
  // GC - Tarja customization
  const [tarjaCustomPng, setTarjaCustomPng] = useState<string | null>(null);
  const [tarjaScaleX, setTarjaScaleX] = useState(100);
  const [tarjaScaleY, setTarjaScaleY] = useState(100);
  const [tarjaScaleLock, setTarjaScaleLock] = useState(true);
  const [tarjaX, setTarjaX] = useState(50);
  const [tarjaY, setTarjaY] = useState(80);
  const [font1Size, setFont1Size] = useState(36);
  const [font1X, setFont1X] = useState(20);
  const [font1Y, setFont1Y] = useState(50);
  const [font2Size, setFont2Size] = useState(24);
  const [font2X, setFont2X] = useState(20);
  const [font2Y, setFont2Y] = useState(70);

  // LAUDA
  const [materiaAtual, setMateriaAtual] = useState<MateriaComLauda | null>(null);
  const [dragOverLauda, setDragOverLauda] = useState(false);
  const [draggedLaudaIndex, setDraggedLaudaIndex] = useState<number | null>(null);

  const handleTransition = () => {
    // Lógica de transição
  };

  const applyTransOpacity = (pct: number, player: "A" | "B") => {
    if (player === "A") {
      setPlayerAOpacity(1 - (pct / 100));
      setPlayerBOpacity(pct / 100);
    } else {
      setPlayerBOpacity(1 - (pct / 100));
      setPlayerAOpacity(pct / 100);
    }
  };

  const handleTransComplete = () => {
    setTransValue(0);
    setActivePlayer(activePlayer === "A" ? "B" : "A");
  };

  const handleDropNaLauda = (item: PlayoutItem) => {
    // Lógica de drop na lauda
  };

  const handleReorderLauda = (fromIdx: number, toIdx: number) => {
    // Lógica de reordenação
  };

  return (
    <div className="h-screen flex flex-col bg-black" style={{ backgroundColor: '#0a0a0a' }}>
      
      {/* ════════════════════════════════════════════════════════════════
          LAYOUT PRINCIPAL: 3 COLUNAS EQUILIBRADAS
      ════════════════════════════════════════════════════════════════ */}
      
      <div className="flex-1 flex gap-3 p-3 overflow-hidden">
        
        {/* ───────────────────────────────────────────────────────────
            COL 1: MONITORS + TRANSIÇÃO (FLEX-1)
        ─────────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          
          {/* Monitores PGM / PVW */}
          <div className="flex gap-3 flex-1 min-h-0">
            {/* Monitor PGM */}
            <div className="flex-1 flex flex-col gap-2 min-w-0">
              <div className="text-[8px] font-bold uppercase tracking-wider text-zinc-600">🔴 PGM (On Air)</div>
              <div className="flex-1 rounded-xl overflow-hidden border" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
                <video ref={pgmARef} className="w-full h-full object-contain" style={{ opacity: playerAOpacity, zIndex: playerAZ }} />
              </div>
            </div>

            {/* Monitor PVW */}
            <div className="flex-1 flex flex-col gap-2 min-w-0">
              <div className="text-[8px] font-bold uppercase tracking-wider text-zinc-600">🔵 PVW (Preview)</div>
              <div className="flex-1 rounded-xl overflow-hidden border" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
                <video ref={pgmBRef} className="w-full h-full object-contain" style={{ opacity: playerBOpacity, zIndex: playerBZ }} />
              </div>
            </div>
          </div>

          {/* ALAVANCA DE TRANSIÇÃO MODERNA */}
          <div className="flex flex-col gap-2 p-3 rounded-xl border" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">⚙️ Transição</span>
              <span className="text-[10px] font-mono font-bold" style={{ color: transValue > 0 ? '#fbbf24' : '#71717a' }}>{transValue}%</span>
            </div>

            {/* Alavanca com design 3D moderno */}
            <div
              className="relative w-full h-16 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing group"
              style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid #2a2a2a',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)',
              }}
              onMouseDown={(e) => {
                handleTransition();
                const rect = e.currentTarget.getBoundingClientRect();
                const onMove = (ev: MouseEvent) => {
                  const pct = Math.min(100, Math.max(0, ((ev.clientX - rect.left) / rect.width) * 100));
                  setTransValue(Math.round(pct));
                  applyTransOpacity(Math.round(pct), activePlayer);
                };
                const onUp = (ev: MouseEvent) => {
                  const pct = Math.min(100, Math.max(0, ((ev.clientX - rect.left) / rect.width) * 100));
                  window.removeEventListener("mousemove", onMove);
                  window.removeEventListener("mouseup", onUp);
                  if (pct >= 95) {
                    handleTransComplete();
                  } else {
                    setTransValue(0);
                    setPlayerAOpacity(activePlayer === "A" ? 1 : 0);
                    setPlayerAZ(activePlayer === "A" ? 10 : 0);
                    setPlayerBOpacity(activePlayer === "B" ? 1 : 0);
                    setPlayerBZ(activePlayer === "B" ? 10 : 0);
                    const inactiveEl = activePlayer === "A" ? pgmBRef.current : pgmARef.current;
                    if (inactiveEl) { inactiveEl.pause(); inactiveEl.src = ""; }
                  }
                };
                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
              }}
              title="Arraste para transição — solte no final para confirmar"
            >
              {/* Fundo gradiente */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(90deg, rgba(20,83,138,0.1) 0%, rgba(59,130,246,0.05) 50%, rgba(34,197,94,0.1) 100%)',
              }} />

              {/* Trilha de progresso */}
              <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-zinc-800 rounded-full" />
              <div 
                className="absolute top-1/2 h-1 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-none"
                style={{ left: 0, width: `${transValue}%` }}
              />

              {/* Marcas de referência */}
              {[0, 25, 50, 75, 100].map((tick) => (
                <div 
                  key={tick}
                  className="absolute top-1/2 -translate-y-1/2 bg-zinc-700 rounded-full"
                  style={{
                    left: `${tick}%`,
                    transform: 'translate(-50%, -50%)',
                    width: tick === 50 ? 3 : 2,
                    height: tick === 50 ? 20 : 12,
                  }}
                />
              ))}

              {/* Slider handle com estilo moderno */}
              <div
                className="absolute top-1/2 w-14 h-14 -translate-y-1/2 -translate-x-1/2 group-hover:scale-110 transition-transform"
                style={{ left: `${transValue}%`, zIndex: 10, pointerEvents: 'none' }}
              >
                {/* Glow effect */}
                <div 
                  className="absolute inset-0 rounded-full blur-xl opacity-60"
                  style={{
                    background: transValue > 0 ? 'radial-gradient(circle, rgba(59,130,246,0.6) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(71,85,105,0.3) 0%, transparent 70%)',
                  }}
                />

                {/* Handle principal */}
                <div
                  className="absolute inset-2 rounded-full shadow-lg border-2"
                  style={{
                    background: transValue > 0 
                      ? 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)'
                      : 'linear-gradient(135deg, #52525b 0%, #3f3f46 100%)',
                    borderColor: transValue > 0 ? 'rgba(59,130,246,0.6)' : 'rgba(113,113,122,0.4)',
                    boxShadow: transValue > 0 ? '0 0 16px rgba(59,130,246,0.5)' : '0 4px 12px rgba(0,0,0,0.5)',
                  }}
                />

                {/* Ícone dentro do handle */}
                <div className="absolute inset-0 flex items-center justify-center text-sm">
                  {transValue > 50 ? '▶' : '◀'}
                </div>
              </div>

              {/* Labels laterais */}
              <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none text-[8px] font-bold uppercase tracking-widest">
                <span style={{ color: '#3f3f46' }}>PGM</span>
                <span style={{ color: '#a1a1aa' }}>TRANS</span>
                <span style={{ color: '#3f3f46' }}>PVW</span>
              </div>
            </div>

            {/* Info de status */}
            {transValue > 0 && (
              <div className="text-[8px] text-center font-mono text-blue-400 mt-1">
                Transição ativa: {transValue}% — Solte em 95%+ para confirmar
              </div>
            )}
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────
            COL 2: LAUDA COLORIDA (FLEX-1)
        ─────────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 border rounded-xl p-3 gap-2"
          style={{
            backgroundColor: '#1a1a1a',
            borderColor: dragOverLauda ? '#ec4899' : '#2a2a2a',
            boxShadow: dragOverLauda ? "0 0 16px rgba(236,72,153,0.2)" : "none",
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOverLauda(true); }}
          onDragLeave={() => setDragOverLauda(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOverLauda(false);
          }}
        >
          <div className="flex items-center gap-2 pb-2 border-b-2" style={{ borderColor: '#ec4899' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400">📋 LAUDA</span>
            {dragOverLauda && <span className="text-[9px] font-bold text-pink-400 animate-pulse">⬇ Solte</span>}
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full ml-auto border" 
              style={{ 
                background: 'rgba(236,72,153,0.1)',
                borderColor: 'rgba(236,72,153,0.2)',
                color: '#ec4899'
              }}>
              {materiaAtual?.itensLauda?.length ?? 0} ITENS
            </span>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-1">
            {materiaAtual?.itensLauda && materiaAtual.itensLauda.length > 0 ? (
              materiaAtual.itensLauda.map((item, idx) => {
                let bgColor = "#52525b";
                let icon = "📌";
                switch (item.tipo) {
                  case "SONORA": bgColor = "#059669"; icon = "🎤"; break;
                  case "PASSAGEM": bgColor = "#b45309"; icon = "🎥"; break;
                  case "PRODUÇÃO": bgColor = "#ea580c"; icon = "🎬"; break;
                  case "ED_TEXTO": bgColor = "#2563eb"; icon = "📝"; break;
                  case "ED_IMAGEM": bgColor = "#db2777"; icon = "🖼️"; break;
                  case "REPÓRTER": bgColor = "#0891b2"; icon = "🎙️"; break;
                  case "IMAGENS": bgColor = "#7c3aed"; icon = "🎞️"; break;
                }
                return (
                  <button
                    key={idx}
                    className="px-2.5 py-2 rounded-lg border transition-all flex items-center justify-between gap-2 text-white font-bold text-xs uppercase tracking-wide cursor-pointer hover:opacity-90 active:scale-95"
                    style={{
                      backgroundColor: bgColor,
                      borderColor: 'rgba(255,255,255,0.1)',
                      opacity: draggedLaudaIndex === idx ? 0.5 : 1,
                      transform: draggedLaudaIndex === idx ? 'scale(0.95)' : 'scale(1)',
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-base shrink-0">{icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[8px] opacity-80 leading-none">[{item.tipo.replace("_", ".")}]</div>
                        <div className="text-[10px] font-bold truncate">{item.valor}</div>
                      </div>
                    </div>
                    <span className="shrink-0 text-[9px] font-black bg-white/20 px-2 py-0.5 rounded">GC</span>
                  </button>
                );
              })
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-zinc-700 border-2 border-dashed rounded-xl" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-2xl">🎬</span>
                <span className="text-[10px] uppercase tracking-widest text-center px-3">Arraste uma matéria aqui</span>
              </div>
            )}
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────
            COL 3: GC PANEL (FLEX-1)
        ─────────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 border rounded-xl p-3 gap-3 overflow-y-auto"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          {/* Header GC */}
          <div className="flex items-center gap-2 pb-2 border-b-2" style={{ borderColor: '#ec4899' }}>
            <Type className="h-3.5 w-3.5" style={{ color: '#71717a' }} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">GC — Gerador</span>
          </div>

          {/* Inputs de Linha 1 e 2 */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[8px] uppercase tracking-widest text-zinc-600">Linha 1 — Nome</label>
              <input 
                type="text" 
                value={gcLine1} 
                onChange={(e) => setGcLine1(e.target.value)}
                placeholder="Nome / Título"
                className="px-2 py-1.5 rounded-lg border text-[11px] font-mono"
                style={{ backgroundColor: '#0a0a0a', borderColor: '#2a2a2a', color: '#e4e4e7' }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[8px] uppercase tracking-widest text-zinc-600">Linha 2 — Info</label>
              <input 
                type="text" 
                value={gcLine2} 
                onChange={(e) => setGcLine2(e.target.value)}
                placeholder="Função / Descrição"
                className="px-2 py-1.5 rounded-lg border text-[11px] font-mono"
                style={{ backgroundColor: '#0a0a0a', borderColor: '#2a2a2a', color: '#e4e4e7' }}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col gap-2 p-2 rounded-lg border" style={{ backgroundColor: '#0a0a0a', borderColor: '#2a2a2a' }}>
            <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-600">Preview</span>
            <div className="w-full aspect-video rounded bg-black border" style={{ borderColor: '#2a2a2a', position: 'relative', overflow: 'hidden' }}>
              {tarjaCustomPng ? (
                <div style={{ position: "relative", lineHeight: 0 }}>
                  <img src={tarjaCustomPng} alt="tarja" style={{ width: "100%" }} />
                  {gcLine1 && (
                    <div style={{
                      position: "absolute",
                      left: `${font1X}%`,
                      top: `${font1Y}%`,
                      fontSize: Math.max(4, font1Size * 0.25),
                      fontWeight: 900,
                      color: "#fff",
                      whiteSpace: "nowrap",
                      transform: "translateY(-50%)",
                      textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                    }}>
                      {gcLine1}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#71717a", fontSize: "12px" }}>
                  {gcLine1 || gcLine2 ? `${gcLine1} ${gcLine2}` : "Preview"}
                </div>
              )}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 flex-col">
            <button
              onClick={() => { setGcVisible(true); setGcDuration(3); }}
              className="w-full py-2 rounded-lg border font-bold text-[10px] uppercase tracking-widest transition-all"
              style={{
                backgroundColor: '#16a34a',
                borderColor: 'rgba(34,197,74,0.3)',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
              }}
            >
              ✓ GC TAKE
            </button>
            <button
              onClick={() => { setGcVisible(false); setGcLine1(""); setGcLine2(""); }}
              className="w-full py-2 rounded-lg border font-bold text-[10px] uppercase tracking-widest transition-all"
              style={{
                backgroundColor: '#dc2626',
                borderColor: 'rgba(220,38,38,0.3)',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(220,38,38,0.3)',
              }}
            >
              ✕ GC CLEAR
            </button>
          </div>

          {/* Status Indicator */}
          {gcVisible && (
            <div className="p-2 rounded-lg border flex items-center gap-2" style={{ backgroundColor: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)' }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "pulse 1s infinite" }} />
              <span style={{ fontSize: 8, color: "#22c55e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                GC ATIVO
              </span>
              {gcDuration > 0 && (
                <span style={{ marginLeft: "auto", fontSize: 9, color: "#4ade80", fontFamily: "monospace" }}>
                  {gcDuration}s
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: #3a3a3a; }
        `,
      }} />
    </div>
  );
}

function codecBadgeClass(codec: LocalVideoFile["codec"]): string {
  switch (codec) {
    case "H.264":
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    case "H.265/HEVC":
      return "text-blue-400 bg-blue-500/10 border-blue-500/30";
    case "AV1":
      return "text-purple-400 bg-purple-500/10 border-purple-500/30";
    case "Verificando...":
      return "text-zinc-400 bg-zinc-700/40 border-zinc-600/30";
    case "Erro":
      return "text-red-400 bg-red-500/10 border-red-500/30";
    default:
      return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
  }
}
