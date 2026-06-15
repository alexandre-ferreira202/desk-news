import { createFileRoute } from "@tanstack/react-router";
import GcPanel from "./GcPanel";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/play_antigo_ playout")({
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

    // ════ [IMAGENS] ════
    if (linha.match(/^\[IMAGENS\]$/i)) {
      console.log("🎞️ Encontrado [IMAGENS]");
      
      let cinegrafista = "";

      // Próxima linha: (NOME DO CINEGRAFISTA)
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          cinegrafista = nomeMatch[1].trim();
          i++;
        }
      }

      itensLauda.push({
        tipo: "IMAGENS",
        nome: "IMAGENS",
        valor: cinegrafista,
        ordem: ordem++
      });
      console.log("✅ Imagens adicionado:", cinegrafista);
    }

    // ════ [PRODUÇÃO] ════
    if (linha.match(/^\[PRODUÇÃO\]$/i)) {
      console.log("🎬 Encontrado [PRODUÇÃO]");
      
      // Próxima linha: (NOME DO PRODUTOR)
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          producao = nomeMatch[1].trim();
          i++;
          
          itensLauda.push({
            tipo: "PRODUÇÃO",
            nome: "PRODUÇÃO",
            valor: producao,
            ordem: ordem++
          });
          console.log("✅ Produção adicionada:", producao);
        }
      }
    }

    // ════ [ED. TEXTO] ou [ED_TEXTO] ════
    if (linha.match(/^\[ED[\._\s]*TEXTO\]$/i)) {
      console.log("📝 Encontrado [ED. TEXTO]");
      
      // Próxima linha: (EDITOR DE TEXTO)
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          const edTexto = nomeMatch[1].trim();
          i++;
          
          itensLauda.push({
            tipo: "ED_TEXTO",
            nome: "ED_TEXTO",
            valor: edTexto,
            ordem: ordem++
          });
          console.log("✅ Ed. Texto adicionado:", edTexto);
        }
      }
    }

    // ════ [ED. IMAGENS] ou [ED_IMAGENS] ════
    if (linha.match(/^\[ED[\._\s]*IMAGENS?\]$/i)) {
      console.log("🖼️ Encontrado [ED. IMAGENS]");
      
      // Próxima linha: (EDITOR DE IMAGENS)
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          const edImagem = nomeMatch[1].trim();
          i++;
          
          itensLauda.push({
            tipo: "ED_IMAGEM",
            nome: "ED_IMAGEM",
            valor: edImagem,
            ordem: ordem++
          });
          console.log("✅ Ed. Imagens adicionado:", edImagem);
        }
      }
    }

    i++;
  }

  console.log("📋 Total de sonoras parseadas:", sonoras.length);
  console.log("📋 Total de passagens parseadas:", passagens.length);
  console.log("📋 Total de itens da lauda:", itensLauda.length);
  console.log("📊 Resultado final:", { sonoras, passagens, producao, itensLauda });

  return { sonoras, passagens, producao, itensLauda };
}

async function detectCodec(file: File): Promise<LocalVideoFile["codec"]> {
  try {
    const buffer = await file.slice(0, 512).arrayBuffer();
    const text = String.fromCharCode(...new Uint8Array(buffer));
    if (text.includes("avc1") || text.includes("avc3") || text.includes("h264")) return "H.264";
    if (text.includes("hvc1") || text.includes("hev1") || text.includes("hevc")) return "H.265/HEVC";
    if (text.includes("av01")) return "AV1";
    const blobUrl = URL.createObjectURL(file);
    return new Promise((resolve) => {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.muted = true;
      v.src = blobUrl;
      const t = setTimeout(() => {
        v.src = "";
        v.load();
        resolve("Outro");
      }, 3000);
      v.onloadedmetadata = () => {
        clearTimeout(t);
        v.src = "";
        v.load();
        resolve("H.264");
      };
      v.onerror = () => {
        clearTimeout(t);
        URL.revokeObjectURL(blobUrl);
        v.src = "";
        resolve("Erro");
      };
    });
  } catch {
    return "Erro";
  }
}

function getVideoDuration(blobUrl: string): Promise<number | null> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.src = blobUrl;
    const t = setTimeout(() => {
      v.src = "";
      resolve(null);
    }, 4000);
    v.onloadedmetadata = () => {
      clearTimeout(t);
      const d = isFinite(v.duration) ? v.duration : null;
      v.src = "";
      resolve(d);
    };
    v.onerror = () => {
      clearTimeout(t);
      v.src = "";
      resolve(null);
    };
  });
}

function formatDuration(secs: number | null): string {
  if (secs === null || isNaN(secs) || !isFinite(secs)) return "--:--";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────

function PlayoutPage() {
  const { date, programa } = Route.useSearch();

  // Playlist (espelho)
  const [items, setItems] = useState<PlayoutItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // FIX 4: rastreia o item atual por ID para sobreviver a recargas em tempo real.
  // Quando o Supabase notifica uma mudança e load() é chamado de novo, a lista
  // é reconstruída — se usarmos só currentIndex, ele pode apontar para o item
  // errado. Com o ID, recalculamos o índice correto após cada recarga.
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  // Índice global de cada item (ex: item 1, item 2, item 3...) igual ao TP
  const [globalItemIndex, setGlobalItemIndex] = useState<Record<string, number>>({});
  const [fileStatus, setFileStatus] = useState<Record<string, boolean>>({});
  const [isVerifying, setIsVerifying] = useState(false);

  // Pasta local
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [isDirReady, setIsDirReady] = useState(false);
  const [localFiles, setLocalFiles] = useState<LocalVideoFile[]>([]);
  const [isScanningFiles, setIsScanningFiles] = useState(false);

  // Preview / PGM
  const [selectedFile, setSelectedFile] = useState<LocalVideoFile | null>(null);
  const [pgmFile, setPgmFile] = useState<LocalVideoFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pgmProgress, setPgmProgress] = useState(0);
  const [pgmCurrentTime, setPgmCurrentTime] = useState(0);

  // YouTube player
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeInput, setYoutubeInput] = useState("");
  const [youtubeVisible, setYoutubeVisible] = useState(false);

  // Matéria atual (com dados de profissionais e sonoras/passagens)
  const [materiaAtual, setMateriaAtual] = useState<{
    materia_id: string;
    titulo: string;
    editor_texto: string | null;
    editor_imagem: string | null;
    credito_reporter: string | null;
    sonoras: Sonora[];
    passagens: Passagem[];
    producao: string | null;
    itensLauda: ItemLauda[];
  } | null>(null);

  // Modal de boas-vindas
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  // ── GC (Gerador de Caracteres) ──
  const [gcVisible, setGcVisible] = useState(false);
  const [gcLine1, setGcLine1] = useState("");
  const [gcLine2, setGcLine2] = useState("");
  const [gcCreditsQueue, setGcCreditsQueue] = useState<{ line1: string; line2: string }[]>([]);
  const [gcDuration, setGcDuration] = useState(0); // 0 = manual, >0 = segundos até fade out
  const [gcHistory, setGcHistory] = useState<Array<{ line1: string; line2: string }>>([]);
  const [gcPresets, setGcPresets] = useState<Record<string, { line1: string; line2: string }>>({
    "Repórter em Campo": { line1: "", line2: "Repórter em Campo" },
    "Âncora": { line1: "", line2: "Âncora" },
    "Especialista": { line1: "", line2: "Especialista" },
  });
  // Tarja do GcPanel — sincronizada via onTake
  const [gcTarjaPng, setGcTarjaPng] = useState<string | null>(null);
  const [gcTarjaConfig, setGcTarjaConfig] = useState<{
    tarjaX: number; tarjaY: number;
    tarjaScaleX: number; tarjaScaleY: number;
    font1Size: number; font1X: number; font1Y: number;
    font2Size: number; font2X: number; font2Y: number;
  }>({ tarjaX: 50, tarjaY: 85, tarjaScaleX: 80, tarjaScaleY: 80, font1Size: 14, font1X: 8, font1Y: 35, font2Size: 10, font2X: 8, font2Y: 70 });

  // ── TARJA ──
  const [tarjaVisible, setTarjaVisible] = useState(false);
  const [tarjaPanelOpen, setTarjaPanelOpen] = useState(false);
  const [tarjaHue, setTarjaHue] = useState(0);
  const [tarjaSaturation, setTarjaSaturation] = useState(100);
  const [tarjaAlpha, setTarjaAlpha] = useState(90);
  const [tarjaX, setTarjaX] = useState(50); // % horizontal
  const [tarjaY, setTarjaY] = useState(85); // % vertical
  const [tarjaCustomPng, setTarjaCustomPng] = useState<string | null>(null); // base64 do PNG customizado
  // Escala independente
  const [tarjaScaleX, setTarjaScaleX] = useState(100); // %
  const [tarjaScaleY, setTarjaScaleY] = useState(100); // %
  const [tarjaScaleLock, setTarjaScaleLock] = useState(true);
  // Texto e tipografia
  const [tarjaText, setTarjaText] = useState("TARJA");
  const [tarjaFont, setTarjaFont] = useState("sans-serif");
  const [tarjaBold, setTarjaBold] = useState(true);
  const [tarjaItalic, setTarjaItalic] = useState(false);
  // Para arrastar o painel flutuante
  const [tarjaPanelPos, setTarjaPanelPos] = useState({ x: 200, y: 200 });
  const tarjaDragRef = useRef<{ startX: number; startY: number; startPX: number; startPY: number } | null>(null);
  const tarjaFileInputRef = useRef<HTMLInputElement>(null);

  // ── TIMERS (Regressivas) ──
  const [blockRemainingTime, setBlockRemainingTime] = useState(0); // Regressiva do bloco
  const [generalJournalTime, setGeneralJournalTime] = useState(0); // Regressiva geral do jornal
  const [doubleClickCount, setDoubleClickCount] = useState(0); // Para double-click no GC ERASE ALL
  const [transValue, setTransValue] = useState(0); // 0 = PGM puro, 100 = Preview puro (fusão)
  // Opacidade e z-index dos players via estado React (evita re-render sobrescrever inline style)
  const [playerAOpacity, setPlayerAOpacity] = useState(1);
  const [playerBOpacity, setPlayerBOpacity] = useState(0);
  const [playerAZ, setPlayerAZ] = useState(10);
  const [playerBZ, setPlayerBZ] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  // ── Rastreia itens da lauda removidos (para não voltar com reload do banco) ──
  // Chave: materia_id, Valor: Set de "ordens" já creditadas
  const [removedLaudaOrdens, setRemovedLaudaOrdens] = useState<Record<string, Set<number>>>({});

  // ── Dados do Espelho (Coluna Centro) ──
  // Removido - agora usando itensLauda diretamente

  const handleItemFinished = useCallback(() => {
    setIsPlaying(false);
    setPgmProgress(100);

    setTimeout(() => {
      setItems((prev) => {
        const finishedIndex = currentIndex - 1;
        if (finishedIndex >= 0 && prev[finishedIndex]) {
          const itemToRemove = prev[finishedIndex];
          const newList = prev.filter((_, idx) => idx !== finishedIndex);

          const newIndex = Math.max(0, currentIndex - 1);
          setCurrentIndex(newIndex);
          // FIX 4: mantém rastreamento por ID após remoção
          setCurrentItemId(newList[newIndex]?.id ?? null);
          toast.success(`"${itemToRemove.assunto}" exibido e removido.`);
          return newList;
        }
        return prev;
      });
    }, 500);
  }, [items, currentIndex]);

  const pgmRemainingTime = pgmFile?.duration ? Math.max(0, pgmFile.duration - pgmCurrentTime) : 0;
  const isEom = pgmRemainingTime > 0 && pgmRemainingTime <= 10;

  // Relógio
  const [activePlayer, setActivePlayer] = useState<"A" | "B">("A");
  const [clock, setClock] = useState("--:--:--");

  // Refs
  const pvwRef = useRef<HTMLVideoElement>(null);
  const pgmARef = useRef<HTMLVideoElement>(null);
  const pgmBRef = useRef<HTMLVideoElement>(null);
  const blobUrlsRef = useRef<Map<string, string>>(new Map());
  // ── WebSocket para PGM na TV (rede local) ──
  // Troque o IP abaixo pelo IP desta máquina na rede local (ex: 192.168.1.100)
  const WS_URL = "ws://localhost:4242";
  const pgmChannelRef = useRef<WebSocket | null>(null);
  const progressRafRef = useRef<number | null>(null);

  // ── Relógio ──
  useEffect(() => {
    const t = setInterval(() => setClock(new Date().toLocaleTimeString("pt-BR", { hour12: false })), 1000);
    return () => clearInterval(t);
  }, []);

  // ── WebSocket — conecta ao relay server ──
  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(WS_URL);
      pgmChannelRef.current = ws;
      ws.onopen = () => console.log("[WS] Conectado ao relay server");
      ws.onclose = () => {
        console.warn("[WS] Desconectado. Tentando reconectar em 3s...");
        setTimeout(connect, 3000);
      };
      ws.onerror = (err) => console.error("[WS] Erro:", err);
    };
    connect();
    return () => {
      pgmChannelRef.current?.close();
    };
  }, []);

  // Helper para emitir estado atual para a TV
  const broadcastPgmState = useCallback((overrides: Record<string, unknown> = {}) => {
    pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({ type: "pgm_state", ...overrides }));
  }, []);

  // Sync de currentTime para a TV a cada 2s (mantém sincronia fina)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPlaying) return;
      const activeEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
      if (!activeEl || !activeEl.src) return;
      if (pgmChannelRef.current?.readyState === 1)
        pgmChannelRef.current.send(JSON.stringify({ type: "pgm_sync", currentTime: activeEl.currentTime }));
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlaying, activePlayer]);

  // ── Cleanup blob URLs ──
  useEffect(() => () => {
    blobUrlsRef.current.forEach(URL.revokeObjectURL);
  }, []);

  // ── LAUDA: preenchida APENAS via drag & drop manual (não automaticamente) ──

  // ── GC Auto Fade Out ──
  useEffect(() => {
    if (!gcVisible || gcDuration === 0) return;
    const timer = setTimeout(() => setGcVisible(false), gcDuration * 1000);
    return () => clearTimeout(timer);
  }, [gcVisible, gcDuration]);

  // Normalizar texto para comparação
  const normalizeText = useCallback((text: string): string => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .trim();
  }, []);

  // ── Helpers ──
  // FIX: getFileName não deve GERAR nomes, apenas procurar pelos que existem
  // A normalização deve ser idêntica à do scanLocalFiles para matching correto
  const getFileName = useCallback((assunto: string | null | undefined) => {
    if (!assunto) return "";
    const normalized = normalizeText(assunto);
    // Procura no array de arquivos pelo nome normalizado
    const found = localFiles.find((f) => {
      const normalizedFile = normalizeText(f.name.replace(/\.(mp4|mov)$/i, ""));
      return normalizedFile === normalized;
    });
    return found?.name || "";  // Retorna o nome REAL do arquivo, não um gerado
  }, [normalizeText, localFiles]);

  const getFileUrl = useCallback(
    async (assunto: string | null | undefined): Promise<string | null> => {
      if (!assunto) return null;
      const fileName = getFileName(assunto);
      if (dirHandle) {
        if (blobUrlsRef.current.has(fileName)) return blobUrlsRef.current.get(fileName)!;
        try {
          const fh = await dirHandle.getFileHandle(fileName);
          const file = await fh.getFile();
          const url = URL.createObjectURL(file);
          blobUrlsRef.current.set(fileName, url);
          return url;
        } catch {
          return null;
        }
      }
      return `/materias/${fileName}`;
    },
    [dirHandle, getFileName]
  );

  // ── Verify files ──
  const verifyFiles = useCallback(
    async (itemsToVerify: PlayoutItem[], handle?: FileSystemDirectoryHandle | null) => {
      const h = handle ?? dirHandle;
      setIsVerifying(true);
      const upd: Record<string, boolean> = {};
      await Promise.all(
        itemsToVerify.map(async (item) => {
          const fn = getFileName(item.assunto);
          if (h) {
            try {
              await h.getFileHandle(fn);
              upd[item.id] = true;
            } catch {
              upd[item.id] = false;
            }
          } else {
            try {
              const r = await fetch(`/materias/${fn}`, { method: "HEAD" });
              upd[item.id] = r.ok;
            } catch {
              upd[item.id] = false;
            }
          }
        })
      );
      setFileStatus((prev) => ({ ...prev, ...upd }));
      setIsVerifying(false);
    },
    [dirHandle, getFileName]
  );

  // ── Auto-carrega o topo da fila no Preview ──
  useEffect(() => {
    const autoPreview = async () => {
      if (!selectedFile && items.length > 0 && currentIndex < items.length && items[currentIndex]?.assunto) {
        const url = await getFileUrl(items[currentIndex].assunto);
        if (url && pvwRef.current && pvwRef.current.src !== url) {
          pvwRef.current.src = url;
          pvwRef.current.load();
        }
      }
    };
    autoPreview();
  }, [currentIndex, items, getFileUrl, selectedFile]);

  useEffect(() => {
    if (items.length > 0) verifyFiles(items);
  }, [items, verifyFiles]);

  // Re-verifica status dos arquivos quando a pasta local é vinculada/atualizada
  // Isso garante que o ✓ / ✗ na fila do espelho seja correto mesmo que a pasta
  // seja vinculada DEPOIS do espelho já ter carregado.
  useEffect(() => {
    if (items.length > 0 && localFiles.length > 0) verifyFiles(items);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localFiles]);

  // Quando o espelho muda (realtime), reaplica a ordenação nos arquivos locais já carregados.
  // Sem isso, a pasta local fica estática enquanto o espelho muda ao vivo.
  useEffect(() => {
    if (localFiles.length === 0 || items.length === 0) return;

    const reordered = items
      .map((item) => {
        const normalizedItem = normalizeText(item.assunto);
        return localFiles.find((f) => {
          const normalizedFile = normalizeText(f.name.replace(/\.(mp4|mov)$/i, ""));
          return normalizedFile === normalizedItem;
        });
      })
      .filter((f): f is LocalVideoFile => f !== undefined);

    const used = new Set(reordered.map((f) => f.name));
    const remaining = localFiles.filter((f) => !used.has(f.name));
    setLocalFiles([...reordered, ...remaining]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, normalizeText]);

  // ── Load playlist COM SINCRONIZAÇÃO EM TEMPO REAL ──
  const load = useCallback(async () => {
    // FIX 1: usa .ilike() em vez de .eq() para comparação case-insensitive,
    //         igual ao TP — evita lista vazia por diferença de maiúsculas/minúsculas
    // FIX 3: .select("id, ordem") + .order("ordem") para garantir
    //         que os blocos venham na sequência correta do espelho
    const { data: blocks } = await supabase
      .from("espelho_blocos")
      .select("id, ordem")
      .eq("data_edicao", date || new Date().toISOString().slice(0, 10))
      .ilike("programa", programa || "Jornal da Manhã")
      .order("ordem");

    if (blocks?.length) {
      const { data: rawItens } = await supabase
        .from("espelho_itens")
        .select("id, bloco_id, assunto, cabeca, tempo, materia_id, ordem, formato")
        .in("bloco_id", blocks.map((b) => b.id));

      // FIX 2: ordena os itens bloco a bloco, igual ao TP
      // .order("ordem") flat mistura itens de blocos diferentes quando têm a mesma ordem
      // A ordem correta é: todos os itens do bloco 1 em sequência, depois bloco 2, etc.
      const ordenado: PlayoutItem[] = [];
      blocks.forEach((bloco) => {
        const itensDoBloco = (rawItens || [])
          .filter((i) => String(i.bloco_id) === String(bloco.id))
          .sort((a, b) => a.ordem - b.ordem);
        ordenado.push(...(itensDoBloco as PlayoutItem[]));
      });

      // Filtra apenas itens que possuem arquivo de vídeo associado (VTs):
      // formato "VT", "VT AO VIVO", "MATÉRIA", "MAT" ou qualquer variação.
      // Itens sem formato ou com formato de ao vivo puro (NOTA, AO VIVO, OFF) são ignorados.
      const FORMATOS_VT = /^(VT|MAT|MATÉRIA|MATERIA|REPORTAGEM|REP|NOTA\s*VT|VT\s*AO\s*VIVO)/i;
      const apenasVTs = ordenado.filter((item) => {
        if (!item.formato) return false;
        return FORMATOS_VT.test(item.formato.trim());
      });

      setItems(apenasVTs);
      if (apenasVTs.length) verifyFiles(apenasVTs);
    } else {
      setItems([]);
    }
  }, [date, programa, verifyFiles]);

  useEffect(() => {
    load();
  }, [load]);

  // Calcula o índice global de cada item (como faz o TP)
  // Isso permite mostrar "1. ITEM 1", "2. ITEM 2" etc na mesma ordem do TP
  useEffect(() => {
    const indexMap: Record<string, number> = {};
    items.forEach((item, idx) => {
      indexMap[item.id] = idx + 1;  // +1 para começar em 1 ao invés de 0
    });
    setGlobalItemIndex(indexMap);
  }, [items]);

  // FIX 4 (cont.): quando a lista é recarregada pelo realtime, re-sincroniza
  // o currentIndex usando o ID do item que estava "NEXT", evitando salto de posição
  useEffect(() => {
    if (currentItemId) {
      const idx = items.findIndex((i) => i.id === currentItemId);
      if (idx !== -1 && idx !== currentIndex) {
        setCurrentIndex(idx);
      }
    }
  }, [items, currentItemId, currentIndex]);

  // ── Inscrever em mudanças do espelho em TEMPO REAL ──
  useEffect(() => {
    const channel = supabase
      .channel("espelho_sync_playout")
      .on("postgres_changes", { event: "*", schema: "public", table: "espelho_itens" }, () => {
        load();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "espelho_blocos" }, () => {
        load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  // 🧹 MONITORA LAUDA VAZIA E LIMPA CACHE DE CRÉDITOS
  useEffect(() => {
    if (materiaAtual?.itensLauda?.length === 0) {
      console.log("🧹 LAUDA VAZIA - Limpando cache de créditos...");
      setGcCreditsQueue([]);
      setGcLine1("");
      setGcLine2("");
      if (gcVisible) setGcVisible(false);
    }
  }, [materiaAtual?.itensLauda?.length]);

  // ── Scan local files ──
  const scanLocalFiles = useCallback(async (handle: FileSystemDirectoryHandle) => {
    setIsScanningFiles(true);
    setLocalFiles([]);
    const found: LocalVideoFile[] = [];

    for await (const [name, entry] of (handle as any).entries()) {
      if (entry.kind === "file" && (name.endsWith(".mp4") || name.endsWith(".mov"))) {
        const fileHandle = entry as FileSystemFileHandle;
        const file = await fileHandle.getFile();
        const codec = await detectCodec(file);
        const sizeMB = file.size / 1024 / 1024;
        const blobUrl = URL.createObjectURL(file);
        const duration = await getVideoDuration(blobUrl);

        found.push({
          name,
          codec,
          sizeMB: Math.round(sizeMB * 100) / 100,
          lastModified: new Date(file.lastModified).toLocaleString("pt-BR"),
          blobUrl,
          duration,
        });
      }
    }

    // Reordenar arquivos conforme a ordem do espelho
    if (items.length > 0) {
      const reordered = items
        .map(item => {
          const normalizedItem = normalizeText(item.assunto);
          return found.find(f => {
            const normalizedFile = normalizeText(f.name.replace(/\.(mp4|mov)$/i, ""));
            return normalizedFile === normalizedItem;
          });
        })
        .filter((f): f is LocalVideoFile => f !== undefined);

      // Adicionar arquivos que sobraram (não estão no espelho)
      const used = new Set(reordered.map(f => f.name));
      const remaining = found.filter(f => !used.has(f.name));

      setLocalFiles([...reordered, ...remaining]);
    } else {
      setLocalFiles(found);
    }

    setIsScanningFiles(false);
  }, [items, normalizeText]);

  // ── Handle select directory ──
  const handleSelectDir = async () => {
    // Verifica se a API existe no navegador
    if (typeof window === 'undefined' || !window.showDirectoryPicker) {
      toast.error(
        "Seu navegador não suporta a seleção de pastas ou o site não está em HTTPS. " +
        "Certifique-se de usar Chrome ou Edge e acessar via HTTPS ou localhost."
      );
      return;
    }

    try {
      const handle = await window.showDirectoryPicker({ mode: "read" });
      setDirHandle(handle);
      setIsDirReady(true);
      setShowWelcomeModal(false);
      await scanLocalFiles(handle);
      toast.success("Pasta vinculada com sucesso!");
    } catch (err: any) {
      if (err.name === 'AbortError') return; // Usuário cancelou a seleção
      
      console.error("Erro ao selecionar pasta:", err);
      toast.error("Erro ao selecionar pasta");
    }
  };

  // ── Pré-carrega player B no primeiro frame (sem tocar) para evitar black no TRANS ──
  // Pré-carrega o arquivo no player INATIVO (não no que está no ar)
  // Se activePlayer === "A", o inativo é B. Se for "B", o inativo é A.
  const preloadInactivePlayer = useCallback((blobUrl: string, currentActivePlayer: "A" | "B") => {
    const inactiveEl = currentActivePlayer === "A" ? pgmBRef.current : pgmARef.current;
    if (!inactiveEl) return;
    inactiveEl.pause();
    inactiveEl.src = blobUrl;
    inactiveEl.muted = true;
    inactiveEl.preload = "auto";
    const onReady = () => {
      inactiveEl.pause();
      inactiveEl.currentTime = 0;
      inactiveEl.muted = false;
      inactiveEl.removeEventListener("canplay", onReady);
    };
    inactiveEl.addEventListener("canplay", onReady);
    inactiveEl.load();
  }, []);

  // ── Handle select file from sidebar ──
  const handleSelectFile = (file: LocalVideoFile) => {
    setSelectedFile(file);
    if (pvwRef.current) {
      pvwRef.current.src = file.blobUrl;
      pvwRef.current.load();
    }
    // Pré-carrega no player INATIVO para TRANS sem black
    preloadInactivePlayer(file.blobUrl, activePlayer);
  };

  // ── Handle select from playlist ──
  const handleSelectFromPlaylist = async (assunto: string) => {
    const url = await getFileUrl(assunto);
    if (url && pvwRef.current && pvwRef.current.src !== url) {
      pvwRef.current.src = url;
      pvwRef.current.load();
    }

    const expectedFileName = getFileName(assunto);
    const file = localFiles.find((f) => f.name === expectedFileName);
    if (file) {
      setSelectedFile(file);
      // Pré-carrega B para que o TRANS não tenha black
      preloadInactivePlayer(file.blobUrl, activePlayer);
    }
  };

  // ── Drag & Drop LAUDA ──
  const [dragOverLauda, setDragOverLauda] = useState(false);
  const [draggedFromLauda, setDraggedFromLauda] = useState<ItemLauda | null>(null);
  const [draggedLaudaIndex, setDraggedLaudaIndex] = useState<number | null>(null);

  // 🔄 Função para reordenar itens da LAUDA
  const handleReorderLauda = (fromIndex: number, toIndex: number) => {
    if (!materiaAtual) return;
    
    const novaLauda = [...materiaAtual.itensLauda];
    const [removed] = novaLauda.splice(fromIndex, 1);
    novaLauda.splice(toIndex, 0, removed);
    
    setMateriaAtual((prev) => prev ? { ...prev, itensLauda: novaLauda } : null);
  };

  const handleDropNaLauda = async (item: PlayoutItem) => {
    setDragOverLauda(false);
    
    console.log("🎬 DEBUG: VT arrastado para LAUDA", { item, materia_id: item.materia_id });
    
    if (!item.materia_id) {
      toast.error("❌ Este item não tem matéria vinculada.");
      console.warn("⚠️ materia_id vazio:", item);
      return;
    }
    try {
      console.log("🔍 Buscando matéria com ID:", item.materia_id);
      
      const { data, error } = await supabase
        .from("materias")
        .select("id, titulo, editor_texto, editor_imagem, credito_reporter, estrutura")
        .eq("id", item.materia_id)
        .single();

      if (error) {
        console.error("❌ Erro ao buscar matéria:", error);
        toast.error(`❌ Erro ao buscar: ${error.message}`);
        return;
      }
      
      if (!data) {
        console.error("❌ Matéria não encontrada com ID:", item.materia_id);
        toast.error("❌ Matéria não encontrada no banco.");
        return;
      }

      console.log("✅ Matéria encontrada:", data);
      console.log("📄 Estrutura/Lauda:", data.estrutura);

      const { sonoras, passagens, producao, itensLauda } = parsarSonorasEPassagens(data.estrutura);

      console.log("📋 Itens parseados:", { sonoras, passagens, producao, itensLauda });

      // 🆕 Limpar cache ao carregar nova matéria
      setGcLine1("");
      setGcLine2("");
      setGcCreditsQueue([]);
      setGcVisible(false);

      // Limpa removedLaudaOrdens para essa matéria (nova carga intencional)
      setRemovedLaudaOrdens(prev => {
        const novo = { ...prev };
        delete novo[data.id];
        return novo;
      });

      // 🆕 Montar fila de créditos baseado nos dados da matéria
      const creditsList = [];
      if (data.editor_texto) creditsList.push({ line1: data.editor_texto, line2: "ED. TEXTO" });
      if (data.editor_imagem) creditsList.push({ line1: data.editor_imagem, line2: "ED. IMAGEM" });
      if (data.credito_reporter) creditsList.push({ line1: data.credito_reporter, line2: "REPÓRTER" });

      console.log("📋 Créditos carregados:", { editor_texto: data.editor_texto, editor_imagem: data.editor_imagem, credito_reporter: data.credito_reporter, creditsList });

      // Popula a fila e pré-carrega o primeiro no input
      setGcCreditsQueue(creditsList);
      if (creditsList.length > 0) {
        setGcLine1(creditsList[0].line1);
        setGcLine2(creditsList[0].line2);
      }

      setMateriaAtual({
        materia_id: data.id,
        titulo: data.titulo,
        editor_texto: data.editor_texto,
        editor_imagem: data.editor_imagem,
        credito_reporter: data.credito_reporter,
        sonoras,
        passagens,
        producao,
        itensLauda,
      });
      
      console.log("✅ LAUDA carregada com", itensLauda.length, "itens");
      toast.success(`✅ Lauda carregada: ${data.titulo} (${itensLauda.length} itens)`);
    } catch (err) {
      console.error("❌ Erro ao carregar créditos:", err);
      toast.error(`❌ Erro: ${err instanceof Error ? err.message : "Desconhecido"}`);
    }
  };

  // ── Transport controls ──
  const handlePlayPausePgm = async () => {
    if (!pgmFile) return;
    const pgmVideoEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!pgmVideoEl) return;

    try {
      if (isPlaying) {
        pgmVideoEl.pause();
        setIsPlaying(false);
        pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({ type: "pgm_pause", currentTime: pgmVideoEl.currentTime }));
      } else {
        await pgmVideoEl.play();
        setIsPlaying(true);
        pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({ type: "pgm_play", currentTime: pgmVideoEl.currentTime }));
      }
    } catch (err) {
      toast.error("Erro ao reproduzir vídeo");
    }
  };

  const handleStop = () => {
    const pgmVideoEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!pgmVideoEl) return;
    pgmVideoEl.pause();
    pgmVideoEl.currentTime = 0;
    setIsPlaying(false);
    setPgmProgress(0);
    setPgmCurrentTime(0);
    pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({ type: "pgm_stop" }));
  };

  const handleCue = () => {
    const pgmVideoEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!pgmVideoEl) return;
    pgmVideoEl.currentTime = 0;
    setPgmProgress(0);
    setPgmCurrentTime(0);
  };

  const handleTake = () => {
    if (!selectedFile) {
      toast.error("Selecione um arquivo no preview");
      return;
    }

    setPgmFile(selectedFile);

    // Sempre reseta para player A como ativo
    const aEl = pgmARef.current;
    const bEl = pgmBRef.current;

    if (aEl) {
      aEl.src = selectedFile.blobUrl;
      aEl.load();
    }
    if (bEl) {
      bEl.pause();
      bEl.src = "";
    }

    // Restaura estado visual via setState (não inline style)
    setPlayerAOpacity(1);
    setPlayerAZ(10);
    setPlayerBOpacity(0);
    setPlayerBZ(0);

    setActivePlayer("A");
    setPgmProgress(0);
    setPgmCurrentTime(0);
    setIsPlaying(false);
    // Notifica a página PGM na TV
    if (pgmChannelRef.current?.readyState === 1)
      pgmChannelRef.current.send(JSON.stringify({ type: "pgm_take", fileName: selectedFile.name }));
    toast.success(`"${selectedFile.name}" enviado para o ar!`);
  };

  // Fusão suave: crossfade entre player ativo (sai) e inativo (entra)
  const applyTransOpacity = useCallback((value: number, currentActivePlayer: "A" | "B" = "A") => {
    const incomingOpacity = value / 100;
    const outgoingOpacity = 1 - incomingOpacity;
    if (currentActivePlayer === "A") {
      // A sai, B entra
      setPlayerAOpacity(outgoingOpacity);
      setPlayerBOpacity(incomingOpacity);
    } else {
      // B sai, A entra
      setPlayerBOpacity(outgoingOpacity);
      setPlayerAOpacity(incomingOpacity);
    }
  }, []);

  const handleTransition = () => {
    if (!selectedFile) {
      toast.error("Selecione um arquivo no preview");
      return;
    }
    // Usa o player INATIVO (oposto ao que está no ar) para a fusão
    const inactiveEl = activePlayer === "A" ? pgmBRef.current : pgmARef.current;
    if (inactiveEl) {
      if (!inactiveEl.src || inactiveEl.src === window.location.href) {
        inactiveEl.src = selectedFile.blobUrl;
        inactiveEl.load();
      }
      inactiveEl.currentTime = 0;
      // Garante que o inativo começa invisível
      if (activePlayer === "A") { setPlayerBOpacity(0); setPlayerBZ(0); }
      else { setPlayerAOpacity(0); setPlayerAZ(0); }
      inactiveEl.play().catch(() => {});
    }
  };

  // Chamado quando o slider TRANS chega em 100 — confirma a transição
  const handleTransComplete = () => {
    if (!selectedFile) return;
    setPgmFile(selectedFile);

    const activeEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    const inactiveEl = activePlayer === "A" ? pgmBRef.current : pgmARef.current;
    const nextPlayer = activePlayer === "A" ? "B" : "A";

    // Para o player que estava no ar
    if (activeEl) {
      activeEl.pause();
      activeEl.src = "";
    }

    // Inativo vira o ativo — via estado React (não inline style)
    if (nextPlayer === "B") {
      setPlayerAOpacity(0); setPlayerAZ(0);
      setPlayerBOpacity(1); setPlayerBZ(10);
    } else {
      setPlayerBOpacity(0); setPlayerBZ(0);
      setPlayerAOpacity(1); setPlayerAZ(10);
    }

    setActivePlayer(nextPlayer);
    setIsPlaying(true);
    setTransValue(0);

    // Notifica TV sobre a fusão concluída
    if (pgmChannelRef.current?.readyState === 1)
      pgmChannelRef.current.send(JSON.stringify({ type: "pgm_take", fileName: selectedFile.name }));

    toast.success(`Fusão concluída: "${selectedFile.name}"`);
  };

  const handleSkip = () => {
    if (currentIndex < items.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      // FIX 4: mantém rastreamento por ID
      setCurrentItemId(items[nextIndex]?.id ?? null);
    } else {
      toast.warning("Fim da playlist");
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const pgmVideoEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!pgmVideoEl || !pgmFile?.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * pgmFile.duration;

    pgmVideoEl.currentTime = time;
    setPgmCurrentTime(time);
    setPgmProgress((percent * 100) % 100);
  };

  // ── Stats ──
  const h264Count = localFiles.filter((f) => f.codec === "H.264").length;
  const otherCount = localFiles.filter((f) => f.codec !== "H.264").length;
  const totalSizeMB = localFiles.reduce((sum, f) => sum + f.sizeMB, 0);

  // ── Funções do GC ──
  const handleGcTake = () => {
    // Exibe na tela o que está atualmente nos inputs (gcLine1/gcLine2)
    setGcVisible(true);
    pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({ type: "gc_show", line1: gcLine1, line2: gcLine2 }));

    if (gcLine1 || gcLine2) {
      setGcHistory((prev) => [{ line1: gcLine1, line2: gcLine2 }, ...prev].slice(0, 2));
    }

    // O crédito exibido agora é o índice 0 da fila.
    // Remove ele e pré-carrega o próximo nos inputs.
    if (gcCreditsQueue.length > 0) {
      const novaFila = gcCreditsQueue.slice(1); // descarta o que acabou de ir ao ar
      setGcCreditsQueue(novaFila);

      if (novaFila.length > 0) {
        // Pré-carrega o próximo nos inputs (vai ao ar no próximo TAKE)
        setGcLine1(novaFila[0].line1);
        setGcLine2(novaFila[0].line2);
      } else {
        // Era o último — limpa inputs; o GC ainda está visível na tela
        setGcLine1("");
        setGcLine2("");
        toast.success("✓ Todos os créditos foram exibidos!");
      }
    }
  };

  const handleGcClear = () => {
    setGcVisible(false);
    setGcLine1("");
    setGcLine2("");
    setGcCreditsQueue([]);
    pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({ type: "gc_hide" }));
  };

  // Pula o crédito do topo da fila sem exibi-lo na tela
  const handleGcSkip = () => {
    if (gcCreditsQueue.length === 0) return;
    const novaFila = gcCreditsQueue.slice(1);
    setGcCreditsQueue(novaFila);
    if (novaFila.length > 0) {
      setGcLine1(novaFila[0].line1);
      setGcLine2(novaFila[0].line2);
      toast("⏭ Crédito pulado");
    } else {
      setGcLine1("");
      setGcLine2("");
      toast("⏭ Fila de créditos esvaziada");
    }
  };

  const handleGcAutoFill = () => {
    // Auto-preencher com dados do item atual
    const currentItem = items[currentIndex];
    if (currentItem) {
      setGcLine1(currentItem.cabeca || currentItem.assunto || "");
      setGcLine2(currentItem.formato || "");
    }
  };

  const handleApplyPreset = (presetName: string) => {
    const preset = gcPresets[presetName];
    if (preset) {
      setGcLine1(preset.line1);
      setGcLine2(preset.line2);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#05070A] text-white flex flex-col overflow-hidden font-sans" style={{ backgroundColor: '#05070A', color: 'white' }}>

      {/* ── Modal de boas-vindas — Vincular Pasta ── */}
      {showWelcomeModal && !isDirReady && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl p-8 flex flex-col items-center gap-6 w-[420px] shadow-[var(--shadow-2xl)]">
            <div className="p-3 bg-[var(--status-error)] rounded-xl">
              <MonitorPlay className="h-8 w-8 text-[var(--text-primary)]" />
            </div>
            <div className="text-center">
              <h2 className="text-h2 font-bold tracking-tight text-[var(--text-primary)]">DeskNews Exibição</h2>
              <p className="text-body-sm text-[var(--text-tertiary)] mt-2">Selecione a pasta onde estão os VTs para iniciar o playout.</p>
            </div>
            <button
              onClick={handleSelectDir}
              disabled={isScanningFiles}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-[var(--status-warning)] text-black font-bold text-body-sm uppercase tracking-widest shadow-[var(--shadow-lg)] transition-all duration-300 hover:shadow-[var(--shadow-xl)] active:scale-[0.98] w-full justify-center"
            >
              <FolderOpen className="h-5 w-5" />
              Vincular Pasta de VTs
            </button>
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="text-caption text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] uppercase tracking-widest transition-colors"
            >
              Pular por agora
            </button>
          </div>
        </div>
      )}
      {/* ── Header ── */}
      <header className="h-24 border-b border-[var(--border-subtle)] bg-[var(--glass-bg)] backdrop-blur-xl flex items-center justify-between px-6 sm:px-8 shrink-0 relative z-30 shadow-[var(--shadow-md)]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--status-error)] rounded-xl shadow-[var(--shadow-md)]">
            <MonitorPlay className="h-4 w-4 text-[var(--text-primary)]" />
          </div>
          <h1 className="text-h2 font-bold tracking-tight" style={{
            background: "linear-gradient(135deg, #e879f9 0%, #c084fc 50%, #7c3aed 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            color: "#e879f9",
          }}>
            DESKNEWS PLAYOUT
          </h1>
          {isDirReady && dirHandle && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--status-success)]/10 border border-[var(--status-success)]/20 ml-2">
              <FolderOpen className="h-3 w-3 text-[var(--status-success)]" />
              <span className="text-caption font-mono text-[var(--status-success)] uppercase font-semibold">{dirHandle.name}</span>
            </div>
          )}
        </div>

        {/* Três Contadores Regressivos Centralizados */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-12 pointer-events-none">
          {/* Esquerda: REGRESSIVA DO TEMPO do bloco */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-1">Bloco</span>
            <div className="text-[40px] font-mono font-bold tabular-nums leading-none text-zinc-500">
              {formatDuration(blockRemainingTime)}
            </div>
          </div>

          {/* Centro: REGRESSIVA DO TEMPO DE VT EM FONT BOLD */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-1">VT</span>
            <div className={cn(
              "text-[40px] font-mono font-bold tabular-nums leading-none tracking-tighter transition-colors duration-300",
              pgmRemainingTime <= 5 ? "text-[var(--status-error)] animate-pulse" : pgmRemainingTime <= 10 ? "text-[var(--status-error)]" : "text-[var(--status-success)]"
            )}>
              {formatDuration(pgmRemainingTime)}
            </div>
          </div>

          {/* Direita: REGRESSIVA DO TEMPO GERAL DO JORNAL */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-1">Jornal</span>
            <div className="text-[40px] font-mono font-bold tabular-nums leading-none text-zinc-500">
              {formatDuration(generalJournalTime)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Botões de controle global premium */}
          <button onClick={handleSelectDir} disabled={isScanningFiles}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-2xl border text-caption font-bold uppercase tracking-widest transition-all active:scale-[0.98] duration-300",
              isDirReady
                ? "bg-[var(--bg-overlay)] text-[var(--text-tertiary)] hover:bg-[var(--bg-overlay-2)] border-[var(--border-light)]"
                : "bg-[var(--status-warning)]/10 text-[var(--status-warning)] border-[var(--status-warning)]/30 animate-pulse shadow-[var(--shadow-md)]"
            )}>
            <FolderOpen className="h-3 w-3" />
            {isDirReady ? "TROCAR PASTA" : "VINCULAR PASTA"}
          </button>

          <button onClick={() => verifyFiles(items)} disabled={isVerifying}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--bg-overlay)] hover:bg-[var(--bg-overlay-2)] border border-[var(--border-light)] text-caption font-bold uppercase tracking-widest text-[var(--text-tertiary)] transition-all active:scale-[0.98] duration-300">
            <RefreshCw className={cn("h-3 w-3", isVerifying && "animate-spin")} />
            IMPORTAR
          </button>

          {isDirReady && dirHandle && (
            <button onClick={() => scanLocalFiles(dirHandle)} disabled={isScanningFiles}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--accent-secondary)]/10 hover:bg-[var(--accent-secondary)]/20 border border-[var(--accent-secondary)]/20 text-caption font-bold uppercase tracking-widest text-[var(--accent-secondary)] transition-all duration-300 active:scale-[0.98]">
              <Film className={cn("h-3 w-3", isScanningFiles && "animate-spin")} />
              {isScanningFiles ? "SCANEANDO..." : "SCAN"}
            </button>
          )}

          {/* Relógio */}
          <div className="text-right pl-4 border-l border-white/5">
            <span className="text-label text-[var(--text-tertiary)] font-bold uppercase tracking-widest block">ON AIR</span>
            <span className="text-h2 font-mono font-bold text-[var(--status-success)] tabular-nums leading-none">{clock}</span>
          </div>
        </div>
      </header>

      {/* ── Layout principal: esquerda + direita ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ════════════════════════════════════════
            COLUNA ESQUERDA — Lista de VTs
        ════════════════════════════════════════ */}
        <div className="w-[420px] shrink-0 border-r border-[var(--border-subtle)] flex flex-col overflow-hidden bg-[var(--bg-secondary)] rounded-r-3xl shadow-[var(--shadow-lg)]">
          {/* Cabeçalho da lista */}
          <div className="px-4 py-4 bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div>
              <h2 className="text-label font-bold uppercase tracking-widest text-[var(--text-tertiary)]">VTs do Jornal</h2>
              <p className="text-caption text-[var(--text-quaternary)] mt-0.5">
                {items.length} matérias · {localFiles.length} arquivos locais
              </p>
            </div>
            {localFiles.length > 0 && (
              <div className="flex items-center gap-3 text-caption font-mono">
                <span className="text-[var(--status-success)] flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {h264Count} H.264
                </span>
                {otherCount > 0 && (
                  <span className="text-yellow-400 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {otherCount} outro
                  </span>
                )}
                <span className="text-[var(--text-tertiary)] flex items-center gap-1">
                  <HardDrive className="h-3 w-3 text-[var(--text-quaternary)]" />
                  {(totalSizeMB / 1024).toFixed(1)}GB
                </span>
              </div>
            )}
          </div>



          {/* ── Seção 1: Arquivos locais ── */}
          {localFiles.length > 0 && (
            <div className="border-b border-[var(--border-subtle)]">
              <div className="px-4 py-2 bg-[var(--bg-tertiary)]">
                <span className="text-label text-[var(--text-tertiary)] font-bold uppercase tracking-widest">
                  ARQUIVOS NA PASTA LOCAL
                </span>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: "40vh" }}>
                {localFiles.map((f) => {
                  const isSelected = selectedFile?.name === f.name;
                  const isOnAir = pgmFile?.name === f.name;
                  const isH264 = f.codec === "H.264";

                  return (
                    <button
                      key={f.name}
                      onClick={() => handleSelectFile(f)}
                      className={cn(
                        "w-full text-left px-4 py-3 border-b border-white/[0.03] transition-all flex items-center gap-3",
                        isOnAir ? "bg-[var(--status-error)]/10 border-l-2 border-l-[var(--status-error)]" :
                        isSelected ? "bg-[var(--accent-primary)]/10 border-l-2 border-l-[var(--accent-primary)]" :
                        "hover:bg-[var(--bg-overlay)] border-l-2 border-l-transparent"
                      )}
                      style={{ borderColor: isSelected ? 'var(--accent-primary)' : isOnAir ? 'var(--status-error)' : 'transparent' }}

                    >
                      {/* Ícone de estado */}
                      <div className="shrink-0">
                        {isOnAir ? (
                          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        ) : isSelected ? (
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        ) : (
                          <Film className={cn("h-3.5 w-3.5", isH264 ? "text-[var(--text-tertiary)]" : "text-[var(--status-warning)]")} />
                        )}
                      </div>

                      {/* Nome e info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-xs font-mono truncate leading-tight",
                            isOnAir ? "text-[var(--status-error)] font-bold" :
                            isSelected ? "text-[var(--accent-primary)] font-bold" : "text-[var(--text-primary)]"
                          )}
                          style={{
                            color: isSelected ? 'var(--accent-primary)' : isOnAir ? 'var(--status-error)' : 'var(--text-primary)'
                          }}
                        >
                          {f.name.replace(".mp4", "")}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={cn(
                              "text-[9px] px-1.5 py-0 rounded border font-bold uppercase",
                              codecBadgeClass(f.codec)
                            )}
                          >
                            {f.codec === "Verificando..." ? "..." : f.codec}
                          </span>
                          <span className="text-caption text-[var(--text-tertiary)] font-mono">
                            {formatDuration(f.duration)} · {f.sizeMB}MB
                          </span>
                        </div>
                      </div>

                      {/* Indicador no ar */}
                      {isOnAir && (
                        <span className="shrink-0 text-caption text-[var(--status-error)] font-bold uppercase animate-pulse">
                          NO AR
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Seção 2: Espelho do dia ── */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-secondary)]">
            <div className="px-4 py-2 bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)]">
              <span className="text-label text-[var(--text-tertiary)] font-bold uppercase tracking-widest">
                ESPELHO — FILA DO DIA
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-[var(--text-secondary)]">
                <tbody className="text-sm font-mono divide-y divide-white/5">
                  {items.map((item, idx) => {
                    const isOnAir = idx === currentIndex - 1;
                    const isNext = idx === currentIndex;
                    const isDone = idx < currentIndex - 1;
                    const exists = fileStatus[item.id];
                    const expectedFileName = getFileName(item.assunto);
                    const localMatch = localFiles.find((f) => f.name === expectedFileName);

                    const handleDeleteItem = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      setItems((prev) => prev.filter((_, i) => i !== idx));
                      if (currentIndex > idx) {
                        setCurrentIndex((prev) => Math.max(0, prev - 1));
                      }
                      toast.info(`"${item.assunto}" removido da fila`);
                    };

                    return (
                      <tr
                        key={item.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("materia_id", item.materia_id || "");
                          e.dataTransfer.setData("item_index", String(idx));
                          e.dataTransfer.setData("drag_source", "espelho");
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const source = e.dataTransfer.getData("drag_source");
                          if (source === "espelho") {
                            const fromIdx = Number(e.dataTransfer.getData("item_index"));
                            if (fromIdx !== idx) {
                              setItems((prevItems) => {
                                const novaOrdem = [...prevItems];
                                const [draggedItem] = novaOrdem.splice(fromIdx, 1);
                                novaOrdem.splice(idx, 0, draggedItem);
                                return novaOrdem;
                              });
                            }
                          }
                        }}
                        onClick={() => handleSelectFromPlaylist(item.assunto)}
                        className={cn(
                          "transition-colors duration-300 cursor-grab active:cursor-grabbing group",
                          isOnAir ? "bg-[var(--status-error)]/10" : "hover:bg-[var(--bg-overlay)]",
                          isDone && "opacity-30"
                        )}
                      >
                        <td className="px-4 py-4 w-20 text-center font-bold">
                          {isOnAir ? (
                            <span className="text-[var(--status-error)] animate-pulse text-caption">● AR</span>
                          ) : isNext ? (
                            <span className="text-[var(--status-success)] text-caption">NEXT</span>
                          ) : (
                            <span className="text-zinc-500">{globalItemIndex[item.id] || idx + 1}</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center w-12">
                          {exists ? (
                            <FileCheck className="h-4 w-4 text-emerald-500 mx-auto" />
                          ) : ( /* Premium file status icons */
                            <FileX className="h-4 w-4 text-[var(--status-error)] mx-auto" />
                          )}
                        </td>
                        <td className={cn("px-4 py-4 font-bold text-body-sm", isOnAir ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>
                          <span className="opacity-30 mr-2">{globalItemIndex[item.id] || idx + 1}.</span>
                          {item.assunto}
                        </td>
                        <td className="px-4 py-4 text-right text-[var(--text-tertiary)] text-caption">{item.tempo || "0:00"}</td>
                        <td className="px-4 py-4 text-right text-caption">
                          <button
                            onClick={handleDeleteItem}
                            className="text-zinc-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-xs font-bold uppercase"
                            title="Remover da fila"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {items.length === 0 && (
                <div className="px-4 py-12 text-center text-[var(--text-tertiary)] text-body-sm italic">
                  Nenhuma matéria publicada para hoje.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            COLUNA DIREITA — Monitores + Controle
        ════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col overflow-y-auto p-5 gap-5">
          {/* ── Linha de monitores PVW + PGM + YTB ── */}
          <div className="grid grid-cols-3 gap-4">
            {/* PREVIEW premium */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--status-success)]" />
                  <span className="text-label font-bold uppercase tracking-widest text-[var(--status-success)]">Preview</span>
                </div>
                <span className="text-caption font-mono text-[var(--text-tertiary)] truncate max-w-[160px]">
                  {selectedFile ? selectedFile.name.replace(".mp4", "") : "Nenhum arquivo"}
                </span>
              </div>

              <div className="relative aspect-video bg-zinc-950 rounded-lg overflow-hidden border-2 border-emerald-500/30">
                <video ref={pvwRef} className="w-full h-full object-contain" muted playsInline preload="metadata" />

                {!selectedFile && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--text-quaternary)]">
                    <Film className="h-8 w-8 text-[var(--text-muted)]" />
                    <span className="text-[10px] uppercase tracking-widest">Clique em um VT H.264</span>
                  </div>
                )}

                {selectedFile && (
                  <div className="absolute top-2 left-2">
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase", codecBadgeClass(selectedFile.codec))}>
                      {selectedFile.codec === "Verificando..." ? "..." : selectedFile.codec}
                    </span>
                  </div>
                )}

                {selectedFile?.duration && (
                  <div className="absolute bottom-2 right-2 text-[10px] font-mono text-zinc-400 bg-black/60 px-1.5 py-0.5 rounded">
                    {formatDuration(selectedFile.duration)}
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/pvw:opacity-100 transition-all duration-500 bg-black/40 backdrop-blur-sm">
                  <button
                    onClick={handleTake}
                    className="bg-[var(--status-warning)] hover:scale-110 text-black font-bold text-h2 px-10 py-4 rounded-2xl shadow-[var(--shadow-2xl)] transition-all active:scale-[0.98]"
                  >
                    TAKE
                  </button>
                </div>
              </div>
            </div>
            
            {/* PROGRAM premium */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("h-1.5 w-1.5 rounded-full bg-[var(--status-error)]", isPlaying && "animate-pulse")} />
                  <span className="text-label font-bold uppercase tracking-widest text-[var(--status-error)]">Program</span>
                </div>
                <span className="text-caption font-mono text-[var(--text-tertiary)] truncate max-w-[160px]">
                  {pgmFile ? pgmFile.name.replace(".mp4", "") : "IDLE"}
                </span>
              </div>

              <div
                className="relative aspect-video bg-zinc-950 rounded-lg overflow-hidden border-2 border-red-600/60"
                style={{ boxShadow: isPlaying ? "0 0 24px rgba(220,38,38,0.2)" : "none" }}
              >
                <video
                  ref={pgmARef}
                  className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
                  style={{ opacity: playerAOpacity, zIndex: playerAZ }}
                  playsInline
                  preload="auto"
                  onTimeUpdate={(e) => {
                    const el = e.currentTarget;
                    setPgmCurrentTime(el.currentTime);
                    if (el.duration) {
                      setPgmProgress((el.currentTime / el.duration) * 100);
                    }
                  }}
                  onEnded={handleItemFinished}
                />
                <video
                  ref={pgmBRef}
                  className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
                  style={{ opacity: playerBOpacity, zIndex: playerBZ }}
                  playsInline
                  preload="auto"
                  onTimeUpdate={(e) => {
                    // Só atualiza progresso se B for o player ativo
                    if (activePlayer !== "B") return;
                    const el = e.currentTarget;
                    setPgmCurrentTime(el.currentTime);
                    if (el.duration) {
                      setPgmProgress((el.currentTime / el.duration) * 100);
                    }
                  }}
                  onEnded={() => {
                    if (activePlayer !== "B") return;
                    handleItemFinished();
                  }}
                />

                {!pgmFile && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-700">
                    <div className="h-2 w-2 rounded-full bg-[var(--status-error)]/30" />
                    <span className="text-[10px] uppercase tracking-widest">IDLE</span>
                  </div>
                )}

                {isPlaying && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[var(--status-error)] px-2.5 py-1 rounded-full text-caption font-bold uppercase tracking-widest animate-pulse shadow-[var(--shadow-md)]">
                    <div className="h-2 w-2 rounded-full bg-white animate-pulse" /> NO AR
                  </div>
                )}

                {pgmFile && items[currentIndex - 1]?.cabeca && (
                  <div className="absolute bottom-6 left-6 right-6 z-30 animate-in slide-in-from-left duration-500">
                    <div className="bg-black/90 border-l-4 border-red-600 px-4 py-2">
                      <div className="text-sm font-bold uppercase italic tracking-tight">REPORTER DESKNEWS</div>
                      <div className="text-caption text-[var(--text-tertiary)]">{items[currentIndex - 1]?.assunto}</div>
                    </div>
                  </div>
                )}

                {/* ── GC Overlay (Lower Third) ── */}
                {gcVisible && (gcLine1 || gcLine2) && (
                  <>
                    {gcTarjaPng ? (
                      /* ── Tarja PNG: posicionada exatamente como configurado no GcPanel ── */
                      /* O container do PGM é position:relative — usamos left/top % direto  */
                      <div
                        className="absolute z-40 pointer-events-none"
                        style={{
                          left: `${gcTarjaConfig.tarjaX}%`,
                          top: `${gcTarjaConfig.tarjaY}%`,
                          /* centraliza horizontalmente pelo ponto de ancoragem configurado */
                          transform: "translateX(-50%)",
                          width: `${gcTarjaConfig.tarjaScaleX}%`,
                        }}
                      >
                        <div style={{ position: "relative", lineHeight: 0 }}>
                          <img
                            src={gcTarjaPng}
                            alt="tarja"
                            style={{ width: "100%", display: "block", height: "auto" }}
                          />
                          {gcLine1 && (
                            <div style={{
                              position: "absolute",
                              left: `${gcTarjaConfig.font1X}%`,
                              top: `${gcTarjaConfig.font1Y}%`,
                              fontSize: gcTarjaConfig.font1Size,
                              fontWeight: 900,
                              color: "#fff",
                              textTransform: "uppercase",
                              whiteSpace: "nowrap",
                              textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                              transform: "translateY(-50%)",
                              fontFamily: "sans-serif",
                            }}>
                              {gcLine1}
                            </div>
                          )}
                          {gcLine2 && (
                            <div style={{
                              position: "absolute",
                              left: `${gcTarjaConfig.font2X}%`,
                              top: `${gcTarjaConfig.font2Y}%`,
                              fontSize: gcTarjaConfig.font2Size,
                              fontWeight: 500,
                              color: "#d4d4d8",
                              textTransform: "uppercase",
                              whiteSpace: "nowrap",
                              textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                              transform: "translateY(-50%)",
                              fontFamily: "sans-serif",
                            }}>
                              {gcLine2}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* ── Tarja preta padrão — faixa na parte inferior ── */
                      <div
                        className="absolute bottom-0 left-0 right-0 z-40 px-3 pb-3 animate-in slide-in-from-bottom duration-300 pointer-events-none"
                      >
                        <div className="flex items-stretch overflow-hidden rounded-md shadow-[var(--shadow-2xl)]">
                          <div className="w-1 bg-[var(--status-error)] shrink-0" />
                          <div className="bg-black/90 px-3 py-2 flex-1 min-w-0 backdrop-blur-sm border border-[var(--glass-border)]">
                            {gcLine1 && (
                              <div className="text-[var(--text-primary)] font-bold text-body-sm uppercase tracking-wide leading-tight truncate">
                                {gcLine1}
                              </div>
                            )}
                            {gcLine2 && (
                              <div className="text-zinc-300 text-[10px] uppercase tracking-widest truncate mt-0.5">
                                {gcLine2}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ── TARJA Overlay no PGM ── */}
                {tarjaVisible && (
                  <div
                    className="absolute z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ left: `${tarjaX}%`, top: `${tarjaY}%` }}
                  >
                    {tarjaCustomPng ? (
                      <img
                        src={tarjaCustomPng}
                        alt="Tarja"
                        style={{
                          opacity: tarjaAlpha / 100,
                          width: `${tarjaScaleX * 1.2}px`,
                          height: `${tarjaScaleY * 0.4}px`,
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <div
                        className="px-3 py-1 rounded-sm shadow-lg"
                        style={{
                          backgroundColor: `hsla(${tarjaHue},${tarjaSaturation}%,35%,${tarjaAlpha/100})`,
                          borderLeft: `3px solid hsla(${tarjaHue},${tarjaSaturation}%,70%,0.9)`,
                          fontFamily: tarjaFont,
                          fontWeight: tarjaBold ? "bold" : "normal",
                          fontStyle: tarjaItalic ? "italic" : "normal",
                          fontSize: `${Math.round(tarjaScaleY * 0.12)}px`,
                          color: `hsl(${tarjaHue},${tarjaSaturation}%,88%)`,
                          whiteSpace: "nowrap",
                          transform: `scaleX(${tarjaScaleX / 100})`,
                          transformOrigin: "left center",
                        }}
                      >
                        {tarjaText || "TARJA"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* YOUTUBE premium */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Youtube className="h-3.5 w-3.5 text-[var(--status-error)]" />
                  <span className="text-label font-bold uppercase tracking-widest text-[var(--status-error)]">YouTube</span>
                </div>
                {youtubeVisible && (
                  <button
                    onClick={() => {
                      setYoutubeVisible(false);
                      setYoutubeUrl("");
                      setYoutubeInput("");
                    }}
                    className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 hover:text-red-400 transition-colors flex items-center gap-1"
                  >
                    <X className="h-3 w-3" /> Fechar
                  </button>
                )}
              </div>

              <div
                className="relative aspect-video bg-black rounded-2xl overflow-hidden border-2 border-[var(--status-error)]/30 shadow-[var(--shadow-lg)]"
                style={{ boxShadow: youtubeVisible ? "0 0 24px var(--status-error-shadow)" : "none" }}
              >
                {youtubeVisible && youtubeUrl ? (
                  <>
                    <iframe
                      key={youtubeUrl}
                      src={youtubeUrl}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="YouTube Monitor"
                      style={{ border: "none" }}
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-700/90 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest pointer-events-none z-10 animate-pulse">
                      <Youtube className="h-3 w-3 text-white" /> AO VIVO
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[var(--text-quaternary)]">
                    <Youtube className="h-8 w-8 text-[var(--text-muted)]" />
                    <span className="text-caption uppercase tracking-widest text-center px-4">Cole o link abaixo e clique em Abrir</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 relative">
                  <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-600 pointer-events-none" />
                  <input
                    type="text"
                    value={youtubeInput}
                    onChange={(e) => setYoutubeInput(e.target.value)} 
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const id = extractYoutubeId(youtubeInput);
                        if (id) {
                          setYoutubeUrl(`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`);
                          setYoutubeVisible(true);
                        } else {
                          toast.error("Link do YouTube inválido.");
                        }
                      }
                    }}
                    placeholder="youtube.com/watch?v=..." 
                    className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-body-sm text-[var(--text-primary)] placeholder-[var(--text-quaternary)] focus:outline-none focus:border-[var(--status-error)] focus:ring-4 focus:ring-[var(--status-error)]/10 transition-all duration-300 pl-10"
                  />
                </div>
                <button
                  onClick={() => {
                    const id = extractYoutubeId(youtubeInput);
                    if (id) {
                      setYoutubeUrl(`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`);
                      setYoutubeVisible(true);
                    } else {
                      toast.error("Link do YouTube inválido.");
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[var(--status-error)] hover:bg-[var(--status-error)]/90 border border-[var(--status-error)]/50 text-caption font-bold uppercase tracking-widest text-white transition-all duration-300 active:scale-[0.98] shrink-0"
                >
                  <Play className="h-3 w-3" />
                  Abrir
                </button>
              </div>
            </div>
          </div>

          {/* ── Transport Controls + LAUDA + GC + AJUSTES (4 Colunas) ── */}
          <div className="grid grid-cols-[1fr_2fr_1.5fr_1fr] gap-4"> {/* Premium transport controls container */}
            {/* ─ ESQUERDA: Transport Controls ─ */}
            <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl p-6 flex flex-col gap-5 shadow-[var(--shadow-xl)]">
              {/* Barra de progresso */}
              <div className="flex items-center gap-3">
                <span className="text-caption font-mono text-[var(--text-tertiary)] w-10 text-right tabular-nums">
                  {formatDuration(pgmCurrentTime)}
                </span>
                <div
                  className="flex-1 h-2 bg-zinc-800 rounded-full cursor-pointer relative overflow-hidden group"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full bg-red-600 rounded-full transition-none relative"
                    style={{ width: `${pgmProgress}%`, backgroundColor: 'var(--status-error)' }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 bg-white rounded-full -mr-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow" />
                  </div>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 w-10 tabular-nums">
                  {formatDuration(pgmFile?.duration ?? null)}
                </span>
              </div>

              {/* Nome do arquivo no PGM */}
              <div className="text-center -mt-1">
                <p className="text-caption font-mono text-[var(--text-tertiary)] truncate">
                  {pgmFile?.name.replace(".mp4", "") || "Nenhum arquivo no PGM"}
                </p>
              </div>

              {/* Botões */}
              <div className="flex items-center justify-center gap-3">
                {/* CUE — Voltar ao início */}
                <button
                  onClick={handleCue}
                  title="CUE — Voltar ao início"
                  className="flex flex-col items-center gap-1 px-5 py-3.5 rounded-2xl bg-[var(--bg-overlay)] hover:bg-[var(--bg-overlay-2)] border border-[var(--border-light)] transition-all duration-300 active:scale-[0.98] group"
                >
                  <SkipBack className="h-5 w-5 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400">
                    CUE
                  </span>
                </button>

                {/* STOP */}
                <button
                  onClick={handleStop}
                  title="STOP"
                  className="flex flex-col items-center gap-1 px-5 py-3.5 rounded-2xl bg-[var(--bg-overlay)] hover:bg-[var(--status-error)]/10 border border-[var(--border-light)] hover:border-[var(--status-error)]/30 transition-all duration-300 active:scale-[0.98] group"
                >
                  <Square className="h-5 w-5 text-[var(--text-tertiary)] group-hover:text-[var(--status-error)] transition-colors" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-red-400">
                    STOP
                  </span>
                </button>

                <button
                  onClick={handlePlayPausePgm}
                  title={isPlaying ? "PAUSE" : "PLAY"}
                  className={cn( /* Premium play/pause button */
                    "flex flex-col items-center gap-1 px-10 py-3.5 rounded-2xl border transition-all duration-500 active:scale-[0.98] group",
                    isPlaying
                      ? "bg-[var(--status-warning)]/10 hover:bg-[var(--status-warning)]/20 border-[var(--status-warning)]/30"
                      : "bg-[var(--status-success)] hover:bg-[var(--status-success)]/90 border-[var(--status-success)]/50 shadow-[var(--shadow-lg)]"
                  )}
                >
                  {isPlaying ? <Pause className="h-6 w-6 text-[var(--status-warning)]" /> : <Play className="h-6 w-6 text-[var(--text-primary)]" />}
                  <span
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-widest",
                      isPlaying ? "text-yellow-400" : "text-emerald-100"
                    )}
                  >
                    {isPlaying ? "PAUSE" : "PLAY"}
                  </span>
                </button>

                {/* TAKE */}
                <button
                  onClick={handleTake}
                  title="TAKE — Enviar preview para o ar"
                  className="flex flex-col items-center gap-1 px-8 py-3.5 rounded-2xl bg-[var(--status-warning)] hover:bg-[var(--status-warning)]/90 border border-[var(--status-warning)]/50 transition-all duration-300 active:scale-[0.98] group shadow-[var(--shadow-lg)]"
                >
                  <MonitorPlay className="h-5 w-5 text-black" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-black">TAKE</span>
                </button>

                {/* SKIP — Próximo */}
                <button
                  onClick={handleSkip}
                  title="SKIP — Carregar próximo na fila"
                  className="flex flex-col items-center gap-1 px-5 py-3.5 rounded-2xl bg-[var(--bg-overlay)] hover:bg-[var(--bg-overlay-2)] border border-[var(--border-light)] transition-all duration-300 active:scale-[0.98] group"
                >
                  <SkipForward className="h-5 w-5 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400">
                    SKIP
                  </span>
                </button>
              </div>

              {/* Legenda dos controles premium */}
              <div className="flex items-center justify-center gap-6 pt-2 border-t border-[var(--border-subtle)]/50">
                <span className="text-caption text-[var(--text-tertiary)] uppercase tracking-widest">CUE = Reinicia</span>
                <span className="text-[9px] text-zinc-700 uppercase tracking-widest">TAKE [Espaço] = Preview → Ar</span>
                <span className="text-[9px] text-zinc-700 uppercase tracking-widest">SKIP = Próximo na fila</span>
              </div>
            </div>

            {/* ─ CENTRO: LAUDA COLORIDA (DOBRO DA LARGURA) ─ */}
            <div
              className={cn(
                "bg-zinc-900/50 border rounded-xl p-4 flex flex-col overflow-hidden transition-all duration-200",
                dragOverLauda
                  ? "border-[var(--accent-secondary)] shadow-[0_0_20px_rgba(236,72,153,0.2)]"
                  : "border-white/5"
              )}
              onDragOver={(e) => { e.preventDefault(); setDragOverLauda(true); }}
              onDragLeave={() => setDragOverLauda(false)}
              onDrop={(e) => {
                e.preventDefault();
                const idx = Number(e.dataTransfer.getData("item_index"));
                const droppedItem = items[idx];
                if (droppedItem) handleDropNaLauda(droppedItem);
                else setDragOverLauda(false);
              }}
            >
              <div className="pb-2.5 border-b-2 border-[var(--accent-secondary)] mb-4 flex items-center gap-2">
                <span className="text-label font-bold uppercase tracking-widest text-[var(--accent-secondary)]">📋 LAUDA</span>
                {dragOverLauda && (
                  <span className="text-[10px] font-bold text-[var(--accent-secondary)] animate-pulse ml-1">⬇ Solte aqui</span>
                )}
                <span className="text-caption font-bold bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)] px-2 py-0.5 rounded-full ml-auto">
                  {materiaAtual?.itensLauda?.length ?? 0} ITENS
                </span>
              </div>

              <div className="flex flex-col gap-1 overflow-y-auto flex-1">
                {materiaAtual?.itensLauda && materiaAtual.itensLauda.length > 0 ? (
                  materiaAtual.itensLauda.map((item, idx) => {
                    let bgColor = "bg-zinc-700";
                    let borderColor = "border-zinc-600";
                    let textColor = "text-white";
                    let hoverColor = "hover:bg-zinc-600";
                    let icon = "📌";

                    switch (item.tipo) {
                      case "SONORA":
                        bgColor = "bg-emerald-600";
                        borderColor = "border-emerald-500";
                        textColor = "text-white";
                        hoverColor = "hover:bg-emerald-700";
                        icon = "🎤";
                        break;
                      case "PASSAGEM":
                        bgColor = "bg-amber-600";
                        borderColor = "border-amber-500";
                        textColor = "text-white";
                        hoverColor = "hover:bg-amber-700";
                        icon = "🎥";
                        break;
                      case "PRODUÇÃO":
                        bgColor = "bg-orange-600";
                        borderColor = "border-orange-500";
                        textColor = "text-white";
                        hoverColor = "hover:bg-orange-700";
                        icon = "🎬";
                        break;
                      case "ED_TEXTO":
                        bgColor = "bg-blue-600";
                        borderColor = "border-blue-500";
                        textColor = "text-white";
                        hoverColor = "hover:bg-blue-700";
                        icon = "📝";
                        break;
                      case "ED_IMAGEM":
                        bgColor = "bg-pink-600";
                        borderColor = "border-pink-500";
                        textColor = "text-white";
                        hoverColor = "hover:bg-pink-700";
                        icon = "🖼️";
                        break;
                      case "REPÓRTER":
                        bgColor = "bg-cyan-600";
                        borderColor = "border-cyan-500";
                        textColor = "text-white";
                        hoverColor = "hover:bg-cyan-700";
                        icon = "🎙️";
                        break;
                      case "IMAGENS":
                        bgColor = "bg-purple-600";
                        borderColor = "border-purple-500";
                        textColor = "text-white";
                        hoverColor = "hover:bg-purple-700";
                        icon = "🎞️";
                        break;
                    }

                    return (
                      <button
                        key={idx}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("drag_source", "lauda");
                          e.dataTransfer.setData("lauda_index", String(idx));
                          e.dataTransfer.effectAllowed = "move";
                          setDraggedFromLauda(item);
                          setDraggedLaudaIndex(idx);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const source = e.dataTransfer.getData("drag_source");
                          if (source === "lauda") {
                            const fromIdx = Number(e.dataTransfer.getData("lauda_index"));
                            if (fromIdx !== idx) {
                              handleReorderLauda(fromIdx, idx);
                            }
                          }
                          setDraggedFromLauda(null);
                          setDraggedLaudaIndex(null);
                        }}
                        onDragEnd={() => {
                          setDraggedFromLauda(null);
                          setDraggedLaudaIndex(null);
                        }}
                        onClick={() => {
                          const valor = item.valor || "";
                          let line1 = "";
                          let line2 = "";

                          if ((item.tipo === "SONORA" || item.tipo === "PASSAGEM") && valor.includes(" - ")) {
                            const partes = valor.split(" - ");
                            line1 = partes[0]?.trim() || valor;
                            line2 = partes[1]?.trim() || "";
                          } else {
                            line1 = valor;
                            line2 = item.tipo?.replace("_", " ") || "";
                          }

                          // Sempre sobrescreve os campos — limpa o anterior e insere o novo crédito
                          setGcLine1(line1);
                          setGcLine2(line2);
                          setGcCreditsQueue([{ line1, line2 }]);

                          if (materiaAtual?.materia_id) {
                            setRemovedLaudaOrdens(prev => {
                              const novoSet = new Set(prev[materiaAtual.materia_id] || []);
                              novoSet.add(item.ordem);
                              return { ...prev, [materiaAtual.materia_id]: novoSet };
                            });
                            setMateriaAtual(prev => {
                              if (!prev) return null;
                              const novaLauda = prev.itensLauda.filter(it => it.ordem !== item.ordem);
                              return { ...prev, itensLauda: novaLauda };
                            });
                          }

                          toast.success(`GC ← ${line1}${line2 ? ` | ${line2}` : ""}`);
                        }}
                        className={cn(
                          `${bgColor} ${hoverColor} border ${borderColor} rounded-lg px-3 py-2.5 transition-all flex items-center justify-between gap-3 min-w-0 cursor-grab active:cursor-grabbing font-bold text-sm uppercase tracking-wide`,
                          draggedLaudaIndex === idx && "opacity-50 scale-95",
                          `${textColor} shadow-md hover:shadow-lg active:shadow-sm`
                        )}
                        title={`Clique para enviar ao GC: ${item.valor}`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-lg shrink-0">{icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[9px] font-black opacity-80 leading-none">
                              [{item.tipo.replace("_", ". ")}]
                            </div>
                            <div className="text-[11px] font-bold truncate text-white">
                              {item.valor}
                            </div>
                          </div>
                        </div>
                        <span className="shrink-0 text-[10px] font-black bg-white/20 px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/10">
                          GC
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[var(--text-quaternary)] border-2 border-dashed border-white/10 rounded-xl">
                    <span className="text-3xl">🎬</span>
                    <span className="text-[11px] uppercase tracking-widest text-center px-4">
                      Arraste uma matéria da fila aqui
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ─ DIREITA: GC Painel ─ */}
          <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl shadow-[var(--shadow-xl)] overflow-hidden">
            <GcPanel
              externalLine1={gcLine1}
              externalLine2={gcLine2}
              onTake={({ line1, line2, tarjaPng, tarjaX: tx, tarjaY: ty, tarjaScaleX: tsx, tarjaScaleY: tsy, font1Size: f1s, font1X: f1x, font1Y: f1y, font2Size: f2s, font2X: f2x, font2Y: f2y }: {
                line1: string; line2: string; tarjaPng: string | null;
                tarjaX: number; tarjaY: number; tarjaScaleX: number; tarjaScaleY: number;
                font1Size: number; font1X: number; font1Y: number;
                font2Size: number; font2X: number; font2Y: number;
              }) => {
                setGcLine1(line1);
                setGcLine2(line2);
                setGcVisible(true);
                setGcTarjaPng(tarjaPng);
                setGcTarjaConfig({ tarjaX: tx, tarjaY: ty, tarjaScaleX: tsx, tarjaScaleY: tsy, font1Size: f1s, font1X: f1x, font1Y: f1y, font2Size: f2s, font2X: f2x, font2Y: f2y });
                pgmChannelRef.current?.readyState === 1 &&
                  pgmChannelRef.current.send(
                    JSON.stringify({ type: "gc_show", line1, line2 })
                  );
                if (line1 || line2) {
                  setGcHistory((prev) =>
                    [{ line1, line2 }, ...prev].slice(0, 20)
                  );
                }
              }}
              onClear={() => {
                setGcVisible(false);
                setGcLine1("");
                setGcLine2("");
                setGcTarjaPng(null);
                pgmChannelRef.current?.readyState === 1 &&
                  pgmChannelRef.current.send(
                    JSON.stringify({ type: "gc_hide" })
                  );
              }}
            />
          </div>

            {/* ─ COLUNA 4: AJUSTES & EFEITOS ─ */}
          <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl p-6 flex flex-col gap-5 shadow-[var(--shadow-xl)]">
            {/* Header */}
            <div className="flex items-center gap-2">
              <span className="text-label font-bold uppercase tracking-widest text-[var(--text-tertiary)]">⚙️ AJUSTES & EFEITOS</span>
            </div>

            {/* Grid de 4 botões */}
            <div className="grid grid-cols-2 gap-2 flex-1">
              {/* Botão TARJA (movido para cá) */}
              <button
                onClick={() => setTarjaPanelOpen((v) => !v)}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-3 py-3 rounded-2xl border text-caption font-bold uppercase tracking-widest transition-all active:scale-[0.98] shadow-[var(--shadow-md)]",
                  tarjaPanelOpen
                    ? "bg-zinc-500 border-zinc-400/50 text-white"
                    : "bg-zinc-700 hover:bg-zinc-600 border-zinc-500/50 text-zinc-200"
                )}
                title="Abrir controles da tarja"
              >
                🎞 TARJA
              </button>

              {/* TRANS — Alavanca de fusão estilo mesa de direção */}
              <div className="flex flex-col items-center justify-center px-3 py-3 rounded-2xl bg-[var(--status-warning)]/10 border border-[var(--status-warning)]/30 shadow-[var(--shadow-md)] gap-2 select-none">
                <span className="text-[8px] font-black uppercase tracking-widest text-[var(--status-warning)]">TRANS</span>

                {/* Trilho da alavanca */}
                <div
                  className="relative flex items-center w-full"
                  style={{ height: 56 }}
                  onMouseDown={(e) => {
                    // Inicia a transição ao começar a arrastar
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
                  onTouchStart={(e) => {
                    handleTransition();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const onMove = (ev: TouchEvent) => {
                      const touch = ev.touches[0];
                      const pct = Math.min(100, Math.max(0, ((touch.clientX - rect.left) / rect.width) * 100));
                      setTransValue(Math.round(pct));
                      applyTransOpacity(Math.round(pct), activePlayer);
                    };
                    const onEnd = (ev: TouchEvent) => {
                      const touch = ev.changedTouches[0];
                      const pct = Math.min(100, Math.max(0, ((touch.clientX - rect.left) / rect.width) * 100));
                      window.removeEventListener("touchmove", onMove);
                      window.removeEventListener("touchend", onEnd);
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
                    window.addEventListener("touchmove", onMove);
                    window.addEventListener("touchend", onEnd);
                  }}
                  style={{ cursor: "ew-resize" }}
                  title="Arraste para fazer fusão — solte no fim para confirmar"
                >
                  {/* Base do trilho */}
                  <div className="absolute inset-x-0 rounded-full" style={{ top: "50%", transform: "translateY(-50%)", height: 8, background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.25)" }} />

                  {/* Preenchimento do trilho */}
                  <div
                    className="absolute rounded-full transition-none"
                    style={{
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      height: 8,
                      width: `${transValue}%`,
                      background: "rgba(234,179,8,0.45)",
                    }}
                  />

                  {/* Marcações no trilho */}
                  {[0, 25, 50, 75, 100].map((tick) => (
                    <div
                      key={tick}
                      className="absolute"
                      style={{
                        left: `${tick}%`,
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        width: tick === 0 || tick === 100 ? 2 : 1,
                        height: tick === 0 || tick === 100 ? 16 : 10,
                        background: "rgba(234,179,8,0.3)",
                        borderRadius: 1,
                      }}
                    />
                  ))}

                  {/* Alavanca — cabo estilo mesa de direção */}
                  <div
                    className="absolute flex flex-col items-center"
                    style={{
                      left: `${transValue}%`,
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      zIndex: 10,
                      pointerEvents: "none",
                    }}
                  >
                    {/* Bolão superior — só a metade de baixo aparece */}
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: transValue > 0
                        ? "radial-gradient(circle at 35% 35%, #fde68a, #d97706)"
                        : "radial-gradient(circle at 35% 35%, #6b7280, #374151)",
                      boxShadow: transValue > 0
                        ? "0 3px 10px rgba(217,119,6,0.7), inset 0 -2px 4px rgba(0,0,0,0.3)"
                        : "0 3px 8px rgba(0,0,0,0.5), inset 0 -2px 4px rgba(0,0,0,0.3)",
                      border: transValue > 0 ? "1.5px solid rgba(253,230,138,0.5)" : "1.5px solid rgba(107,114,128,0.4)",
                      transition: "background 0.2s, box-shadow 0.2s",
                      marginBottom: -10,
                      overflow: "hidden",
                    }} />

                    {/* Haste larga e achatada com detalhe de profundidade */}
                    <div style={{
                      width: 26,
                      height: 32,
                      background: "linear-gradient(90deg, #8b7355 0%, #a0826d 40%, #9a7d68 50%, #8b7355 60%, #7a6245 100%)",
                      borderRadius: "8px 8px 0 0",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.1), inset 1px 0 3px rgba(0,0,0,0.4)",
                      position: "relative",
                      overflow: "visible",
                    }}>
                      {/* Groove de profundidade no centro */}
                      <div style={{
                        position: "absolute",
                        top: "40%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "60%",
                        height: 2,
                        background: "linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.3) 100%)",
                        borderRadius: 1,
                        boxShadow: "inset 0 1px 1px rgba(0,0,0,0.4)",
                      }} />
                      {/* Reflexo de luz na haste */}
                      <div style={{
                        position: "absolute",
                        top: 0,
                        left: "25%",
                        width: "20%",
                        height: "40%",
                        background: "linear-gradient(90deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)",
                        borderRadius: "4px 0 0 0",
                      }} />
                    </div>

                    {/* Bolão inferior — só a metade de cima aparece */}
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: transValue > 0
                        ? "radial-gradient(circle at 35% 35%, #fde68a, #d97706)"
                        : "radial-gradient(circle at 35% 35%, #6b7280, #374151)",
                      boxShadow: transValue > 0
                        ? "0 3px 10px rgba(217,119,6,0.7), inset 0 -2px 4px rgba(0,0,0,0.3)"
                        : "0 3px 8px rgba(0,0,0,0.5), inset 0 -2px 4px rgba(0,0,0,0.3)",
                      border: transValue > 0 ? "1.5px solid rgba(253,230,138,0.5)" : "1.5px solid rgba(107,114,128,0.4)",
                      transition: "background 0.2s, box-shadow 0.2s",
                      marginTop: -10,
                      overflow: "hidden",
                    }} />
                  </div>
                </div>

                {/* Labels PGM / PVW */}
                <div className="flex justify-between w-full px-0.5">
                  <span className="text-[7px] font-mono font-bold text-zinc-600">PGM</span>
                  <span className="text-[7px] font-mono text-[var(--status-warning)]" style={{ opacity: transValue > 0 ? 1 : 0.3 }}>{transValue}%</span>
                  <span className="text-[7px] font-mono font-bold text-zinc-600">PVW</span>
                </div>
              </div>

              {/* Botão cinza vazio 2 */}
              <button
                className="flex items-center justify-center gap-1.5 px-3 py-3 rounded-2xl bg-zinc-800/40 border border-zinc-600/30 text-caption font-bold uppercase tracking-widest text-zinc-500 transition-all active:scale-[0.98] shadow-[var(--shadow-md)] cursor-default opacity-40"
                disabled
                title="Reservado"
              >
                —
              </button>

              {/* GC ERASE ALL (Double-click para deletar lauda) */}
              <button
                onClick={() => {
                  const now = Date.now();
                  if (now - lastClickTime < 300) {
                    // Double-click detectado - deletar lauda
                    if (materiaAtual?.materia_id) {
                      setMateriaAtual({
                        ...materiaAtual,
                        itensLauda: []
                      });
                      toast.success("Lauda limpa!");
                    }
                    setDoubleClickCount(0);
                    setLastClickTime(0);
                  } else {
                    setDoubleClickCount(1);
                    setLastClickTime(now);
                  }
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-3 rounded-2xl bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 text-caption font-bold uppercase tracking-widest text-red-400 transition-all active:scale-[0.98] shadow-[var(--shadow-md)]"
                title="Clique 2x para deletar toda a lauda"
              >
                🗑️ ERASE
              </button>
            </div>
          </div>

            {/* ── PAINEL FLUTUANTE DA TARJA ── */}
            {tarjaPanelOpen && (
              <div
                className="fixed z-[9999] bg-zinc-900 border border-zinc-600/60 rounded-2xl shadow-2xl w-96 select-none"
                style={{ left: tarjaPanelPos.x, top: tarjaPanelPos.y }}
              >
                {/* Header arrastável */}
                <div
                  className="flex items-center justify-between px-4 py-3 bg-zinc-800 rounded-t-2xl cursor-grab active:cursor-grabbing border-b border-zinc-700"
                  onMouseDown={(e) => {
                    tarjaDragRef.current = {
                      startX: e.clientX, startY: e.clientY,
                      startPX: tarjaPanelPos.x, startPY: tarjaPanelPos.y,
                    };
                    const onMove = (ev: MouseEvent) => {
                      if (!tarjaDragRef.current) return;
                      setTarjaPanelPos({
                        x: tarjaDragRef.current.startPX + ev.clientX - tarjaDragRef.current.startX,
                        y: tarjaDragRef.current.startPY + ev.clientY - tarjaDragRef.current.startY,
                      });
                    };
                    const onUp = () => {
                      tarjaDragRef.current = null;
                      window.removeEventListener("mousemove", onMove);
                      window.removeEventListener("mouseup", onUp);
                    };
                    window.addEventListener("mousemove", onMove);
                    window.addEventListener("mouseup", onUp);
                  }}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">🎞 Controles da Tarja</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const next = !tarjaVisible;
                        setTarjaVisible(next);
                        pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({ type: next ? "tarja_show" : "tarja_hide" }));
                      }}
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border transition-all",
                        tarjaVisible
                          ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-400"
                          : "bg-zinc-700 border-zinc-600 text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      {tarjaVisible ? "● ON" : "○ OFF"}
                    </button>
                    <button onClick={() => setTarjaPanelOpen(false)} className="text-zinc-500 hover:text-red-400 text-[11px] font-bold transition-colors">✕</button>
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">

                  {/* ── TEXTO & TIPOGRAFIA ── */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Caractere / Texto</span>

                    {/* Input de texto */}
                    <input
                      type="text"
                      value={tarjaText}
                      onChange={(e) => setTarjaText(e.target.value)}
                      placeholder="Nome da tarja..."
                      className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-[11px] font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/60 transition-all"
                    />

                    {/* Fonte + Bold + Italic */}
                    <div className="flex gap-2 items-center">
                      <select
                        value={tarjaFont}
                        onChange={(e) => setTarjaFont(e.target.value)}
                        className="flex-1 bg-zinc-800 border border-zinc-600 rounded-lg px-2 py-1.5 text-[10px] text-zinc-200 focus:outline-none focus:border-pink-500/60 transition-all"
                      >
                        <option value="sans-serif">Sans-Serif</option>
                        <option value="serif">Serif</option>
                        <option value="monospace">Monospace</option>
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="'Times New Roman', serif">Times New Roman</option>
                        <option value="'Courier New', monospace">Courier New</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="Impact, sans-serif">Impact</option>
                        <option value="Verdana, sans-serif">Verdana</option>
                      </select>
                      <button
                        onClick={() => setTarjaBold((v) => !v)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border text-[11px] font-black tracking-widest transition-all",
                          tarjaBold
                            ? "bg-pink-600/30 border-pink-500/60 text-pink-300"
                            : "bg-zinc-800 border-zinc-600 text-zinc-500 hover:text-zinc-300"
                        )}
                      >B</button>
                      <button
                        onClick={() => setTarjaItalic((v) => !v)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border text-[11px] italic font-bold tracking-widest transition-all",
                          tarjaItalic
                            ? "bg-pink-600/30 border-pink-500/60 text-pink-300"
                            : "bg-zinc-800 border-zinc-600 text-zinc-500 hover:text-zinc-300"
                        )}
                      >I</button>
                    </div>

                    {/* Preview do texto */}
                    <div
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-center truncate text-[13px]"
                      style={{
                        fontFamily: tarjaFont,
                        fontWeight: tarjaBold ? "bold" : "normal",
                        fontStyle: tarjaItalic ? "italic" : "normal",
                        color: `hsl(${tarjaHue}, ${tarjaSaturation}%, 80%)`,
                      }}
                    >
                      {tarjaText || "Prévia do texto"}
                    </div>
                  </div>

                  {/* ── COR ── */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Cor da Tarja</span>
                    <div className="flex items-center gap-2">
                      <label className="text-[9px] text-zinc-500 w-16 shrink-0">Hue</label>
                      <input type="range" min={0} max={360} value={tarjaHue}
                        onChange={(e) => setTarjaHue(Number(e.target.value))}
                        className="flex-1 h-1.5 accent-pink-500"
                        style={{ background: `linear-gradient(to right,hsl(0,100%,50%),hsl(60,100%,50%),hsl(120,100%,50%),hsl(180,100%,50%),hsl(240,100%,50%),hsl(300,100%,50%),hsl(360,100%,50%))` }}
                      />
                      <span className="text-[9px] font-mono text-zinc-400 w-8 text-right">{tarjaHue}°</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[9px] text-zinc-500 w-16 shrink-0">Saturação</label>
                      <input type="range" min={0} max={100} value={tarjaSaturation}
                        onChange={(e) => setTarjaSaturation(Number(e.target.value))}
                        className="flex-1 h-1.5 accent-pink-500"
                      />
                      <span className="text-[9px] font-mono text-zinc-400 w-8 text-right">{tarjaSaturation}%</span>
                    </div>
                    <div className="w-full h-5 rounded-md border border-zinc-700"
                      style={{ backgroundColor: `hsla(${tarjaHue},${tarjaSaturation}%,40%,${tarjaAlpha/100})` }} />
                  </div>

                  {/* ── OPACIDADE ── */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Opacidade (Alpha)</span>
                    <div className="flex items-center gap-2">
                      <input type="range" min={0} max={100} value={tarjaAlpha}
                        onChange={(e) => setTarjaAlpha(Number(e.target.value))}
                        className="flex-1 h-1.5 accent-pink-500"
                      />
                      <span className="text-[9px] font-mono text-zinc-400 w-8 text-right">{tarjaAlpha}%</span>
                    </div>
                  </div>

                  {/* ── ESCALA X / Y com LOCK ── */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Escala</span>
                      <button
                        onClick={() => setTarjaScaleLock((v) => !v)}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-widest transition-all",
                          tarjaScaleLock
                            ? "bg-pink-600/20 border-pink-500/50 text-pink-400"
                            : "bg-zinc-800 border-zinc-600 text-zinc-500 hover:text-zinc-300"
                        )}
                      >
                        {tarjaScaleLock ? "🔒 LOCK" : "🔓 FREE"}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[9px] text-zinc-500 w-16 shrink-0">Largura X</label>
                      <input type="range" min={10} max={400} value={tarjaScaleX}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (tarjaScaleLock) {
                            setTarjaScaleX(v);
                            setTarjaScaleY(v);
                          } else {
                            setTarjaScaleX(v);
                          }
                        }}
                        className="flex-1 h-1.5 accent-pink-500"
                      />
                      <span className="text-[9px] font-mono text-zinc-400 w-8 text-right">{tarjaScaleX}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[9px] text-zinc-500 w-16 shrink-0">Altura Y</label>
                      <input type="range" min={10} max={400} value={tarjaScaleY}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (tarjaScaleLock) {
                            setTarjaScaleX(v);
                            setTarjaScaleY(v);
                          } else {
                            setTarjaScaleY(v);
                          }
                        }}
                        className="flex-1 h-1.5 accent-pink-500"
                      />
                      <span className="text-[9px] font-mono text-zinc-400 w-8 text-right">{tarjaScaleY}%</span>
                    </div>
                  </div>

                  {/* ── POSIÇÃO X / Y ── */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Posição na Tela</span>
                    <div className="flex items-center gap-2">
                      <label className="text-[9px] text-zinc-500 w-16 shrink-0">X (horiz.)</label>
                      <input type="range" min={0} max={100} value={tarjaX}
                        onChange={(e) => setTarjaX(Number(e.target.value))}
                        className="flex-1 h-1.5 accent-pink-500"
                      />
                      <span className="text-[9px] font-mono text-zinc-400 w-8 text-right">{tarjaX}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[9px] text-zinc-500 w-16 shrink-0">Y (vert.)</label>
                      <input type="range" min={0} max={100} value={tarjaY}
                        onChange={(e) => setTarjaY(Number(e.target.value))}
                        className="flex-1 h-1.5 accent-pink-500"
                      />
                      <span className="text-[9px] font-mono text-zinc-400 w-8 text-right">{tarjaY}%</span>
                    </div>
                    {/* Mini mapa */}
                    <div className="relative w-full h-16 bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
                      <div
                        className="absolute w-3 h-3 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 shadow-lg transition-all duration-75"
                        style={{
                          left: `${tarjaX}%`, top: `${tarjaY}%`,
                          backgroundColor: `hsla(${tarjaHue},${tarjaSaturation}%,50%,0.8)`
                        }}
                      />
                    </div>
                  </div>

                  {/* ── PNG PERSONALIZADO ── */}
                  <div className="flex flex-col gap-2 border-t border-zinc-700 pt-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">PNG Personalizado</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => tarjaFileInputRef.current?.click()}
                        className="flex-1 px-3 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600 border border-zinc-600/60 text-[9px] font-bold uppercase tracking-widest text-zinc-200 transition-all active:scale-95"
                      >
                        📁 PERSONALIZAR
                      </button>
                      {tarjaCustomPng && (
                        <button
                          onClick={() => setTarjaCustomPng(null)}
                          className="px-3 py-2 rounded-xl bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 text-[9px] font-bold text-red-400 transition-all active:scale-95"
                        >✕ Remover</button>
                      )}
                    </div>
                    {/* Preview do PNG ajustado à área da tarja */}
                    {tarjaCustomPng && (
                      <div
                        className="w-full overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 flex items-center justify-center"
                        style={{ aspectRatio: `${tarjaScaleX} / ${tarjaScaleY}` }}
                      >
                        <img
                          src={tarjaCustomPng}
                          alt="Tarja custom"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <input
                      ref={tarjaFileInputRef}
                      type="file"
                      accept="image/png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => setTarjaCustomPng(reader.result as string);
                        reader.readAsDataURL(file);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e1e1e; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #2a2a2a; }
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `,
        }}
      />
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
