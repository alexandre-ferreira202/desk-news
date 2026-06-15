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

export const Route = createFileRoute("/TTT playout")({
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

      setItems(ordenado);
      if (ordenado.length) verifyFiles(ordenado);
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
    <div className="fixed inset-0 text-white flex flex-col overflow-hidden font-sans" style={{ backgroundColor: '#121212', color: 'white' }}>

      {/* ── Modal de boas-vindas — Vincular Pasta ── */}
      {showWelcomeModal && !isDirReady && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
          <div className="border rounded-2xl p-8 flex flex-col items-center gap-6 w-[420px]" style={{ backgroundColor: '#1a1a1a', borderColor: '#00E676' }}>
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#00E67620' }}>
              <MonitorPlay className="h-8 w-8" style={{ color: '#00E676' }} />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold tracking-tight text-white">DeskNews Exibição</h2>
              <p className="text-sm text-zinc-400 mt-2">Selecione a pasta onde estão os VTs para iniciar o playout.</p>
            </div>
            <button
              onClick={handleSelectDir}
              disabled={isScanningFiles}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-300 active:scale-[0.98] w-full justify-center text-black"
              style={{ backgroundColor: '#00E676' }}
            >
              <FolderOpen className="h-5 w-5" />
              Vincular Pasta de VTs
            </button>
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="text-xs text-zinc-500 hover:text-zinc-300 uppercase tracking-widest transition-colors"
            >
              Pular por agora
            </button>
          </div>
        </div>
      )}
      {/* ── Header ── */}
      <header className="h-14 border-b flex items-center justify-between px-4 shrink-0 relative z-30" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        {/* Logo + pasta */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#00E67615' }}>
            <MonitorPlay className="h-4 w-4" style={{ color: '#00E676' }} />
          </div>
          <h1 className="text-sm font-black tracking-[0.2em] uppercase" style={{ color: '#00E676' }}>
            DESKNEWS PLAYOUT
          </h1>
          {isDirReady && dirHandle && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border ml-1" style={{ backgroundColor: '#00E67610', borderColor: '#00E67630' }}>
              <FolderOpen className="h-2.5 w-2.5" style={{ color: '#00E676' }} />
              <span className="text-[10px] font-mono uppercase font-semibold" style={{ color: '#00E676' }}>{dirHandle.name}</span>
            </div>
          )}
        </div>

        {/* Contadores Regressivos Centralizados */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-10 pointer-events-none">
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-0.5">Bloco</span>
            <div className="text-[28px] font-mono font-bold tabular-nums leading-none text-zinc-500">
              {formatDuration(blockRemainingTime)}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-0.5">VT</span>
            <div className={cn(
              "text-[28px] font-mono font-bold tabular-nums leading-none tracking-tighter transition-colors duration-300",
              pgmRemainingTime <= 5 ? "text-red-500 animate-pulse" : pgmRemainingTime <= 10 ? "text-red-500" : ""
            )} style={{ color: pgmRemainingTime > 10 ? '#00E676' : undefined }}>
              {formatDuration(pgmRemainingTime)}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-0.5">Jornal</span>
            <div className="text-[28px] font-mono font-bold tabular-nums leading-none text-zinc-500">
              {formatDuration(generalJournalTime)}
            </div>
          </div>
        </div>

        {/* Controles + Relógio */}
        <div className="flex items-center gap-2">
          <button onClick={handleSelectDir} disabled={isScanningFiles}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all active:scale-[0.98]",
              isDirReady
                ? "border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500"
                : "animate-pulse text-black font-bold"
            )}
            style={!isDirReady ? { backgroundColor: '#00E676', borderColor: '#00E676' } : { backgroundColor: 'transparent' }}
          >
            <FolderOpen className="h-3 w-3" />
            {isDirReady ? "TROCAR" : "VINCULAR"}
          </button>

          <button onClick={() => verifyFiles(items)} disabled={isVerifying}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-all active:scale-[0.98]">
            <RefreshCw className={cn("h-3 w-3", isVerifying && "animate-spin")} />
            IMP.
          </button>

          {isDirReady && dirHandle && (
            <button onClick={() => scanLocalFiles(dirHandle)} disabled={isScanningFiles}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all active:scale-[0.98]"
              style={{ borderColor: '#00E67640', color: '#00E676', backgroundColor: '#00E67610' }}>
              <Film className={cn("h-3 w-3", isScanningFiles && "animate-spin")} />
              {isScanningFiles ? "SCAN..." : "SCAN"}
            </button>
          )}

          <div className="pl-3 border-l border-zinc-800 ml-1">
            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest block">ON AIR</span>
            <span className="text-base font-mono font-bold tabular-nums leading-none" style={{ color: '#00E676' }}>{clock}</span>
          </div>
        </div>
      </header>

      {/* ── Layout principal: 3 colunas ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ════════════════════════════════════════
            COL ESQUERDA — Sidebar de Navegação
        ════════════════════════════════════════ */}
        <div className="w-[260px] shrink-0 border-r flex flex-col overflow-hidden" style={{ backgroundColor: '#181818', borderColor: '#2a2a2a' }}>
          {/* Cabeçalho da lista */}
          <div className="px-3 py-2.5 border-b flex items-center justify-between" style={{ backgroundColor: '#1f1f1f', borderColor: '#2a2a2a' }}>
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">VTs do Jornal</h2>
              <p className="text-[9px] text-zinc-600 mt-0.5">
                {items.length} matérias · {localFiles.length} arquivos
              </p>
            </div>
            {localFiles.length > 0 && (
              <div className="flex flex-col items-end gap-0.5 text-[9px] font-mono">
                <span className="flex items-center gap-1" style={{ color: '#00E676' }}>
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  {h264Count} H.264
                </span>
                <span className="text-zinc-600 flex items-center gap-1">
                  <HardDrive className="h-2.5 w-2.5" />
                  {(totalSizeMB / 1024).toFixed(1)}GB
                </span>
              </div>
            )}
          </div>



          {/* ── Seção 1: Arquivos locais ── */}
          {localFiles.length > 0 && (
            <div className="border-b" style={{ borderColor: '#2a2a2a' }}>
              <div className="px-3 py-1.5" style={{ backgroundColor: '#1f1f1f' }}>
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                  PASTA LOCAL
                </span>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: "36vh" }}>
                {localFiles.map((f) => {
                  const isSelected = selectedFile?.name === f.name;
                  const isOnAir = pgmFile?.name === f.name;
                  const isH264 = f.codec === "H.264";

                  return (
                    <button
                      key={f.name}
                      onClick={() => handleSelectFile(f)}
                      className={cn(
                        "w-full text-left px-3 py-2 border-b border-white/[0.03] transition-all flex items-center gap-2",
                        isOnAir ? "border-l-2" :
                        isSelected ? "border-l-2" :
                        "border-l-2 border-l-transparent"
                      )}
                      style={{
                        backgroundColor: isOnAir ? '#ff000015' : isSelected ? '#00E67610' : 'transparent',
                        borderLeftColor: isOnAir ? '#ef4444' : isSelected ? '#00E676' : 'transparent',
                      }}
                    >
                      <div className="shrink-0">
                        {isOnAir ? (
                          <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        ) : isSelected ? (
                          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#00E676' }} />
                        ) : (
                          <Film className={cn("h-3 w-3", isH264 ? "text-zinc-600" : "text-yellow-500")} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-mono truncate leading-tight"
                          style={{ color: isOnAir ? '#ef4444' : isSelected ? '#00E676' : '#e4e4e7' }}>
                          {f.name.replace(".mp4", "")}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={cn("text-[8px] px-1 py-0 rounded border font-bold uppercase", codecBadgeClass(f.codec))}>
                            {f.codec === "Verificando..." ? "..." : f.codec}
                          </span>
                          <span className="text-[9px] text-zinc-600 font-mono">
                            {formatDuration(f.duration)} · {f.sizeMB}MB
                          </span>
                        </div>
                      </div>
                      {isOnAir && (
                        <span className="shrink-0 text-[8px] text-red-500 font-bold uppercase animate-pulse">AR</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Seção 2: Espelho do dia ── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-3 py-1.5 border-b" style={{ backgroundColor: '#1f1f1f', borderColor: '#2a2a2a' }}>
              <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                ESPELHO — FILA DO DIA
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-zinc-400">
                <tbody className="text-xs font-mono divide-y divide-white/5">
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
                          "transition-colors duration-200 cursor-grab active:cursor-grabbing group",
                          isDone && "opacity-30"
                        )}
                        style={{ backgroundColor: isOnAir ? '#ff000010' : undefined }}
                      >
                        <td className="px-2 py-2 w-12 text-center font-bold">
                          {isOnAir ? (
                            <span className="text-red-500 animate-pulse text-[9px]">● AR</span>
                          ) : isNext ? (
                            <span className="text-[9px] font-bold" style={{ color: '#00E676' }}>NEXT</span>
                          ) : (
                            <span className="text-zinc-600 text-[9px]">{globalItemIndex[item.id] || idx + 1}</span>
                          )}
                        </td>
                        <td className="px-1 py-2 w-6 text-center">
                          {exists ? (
                            <FileCheck className="h-3 w-3 mx-auto" style={{ color: '#00E676' }} />
                          ) : (
                            <FileX className="h-3 w-3 text-red-500 mx-auto" />
                          )}
                        </td>
                        <td className={cn("px-2 py-2 font-bold text-[10px]", isOnAir ? "text-white" : "text-zinc-400")}>
                          {item.assunto}
                        </td>
                        <td className="px-2 py-2 text-right text-zinc-600 text-[9px]">{item.tempo || "0:00"}</td>
                        <td className="px-2 py-2 text-right text-[9px]">
                          <button
                            onClick={handleDeleteItem}
                            className="text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 font-bold"
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
                <div className="px-3 py-8 text-center text-zinc-600 text-xs italic">
                  Nenhuma matéria publicada para hoje.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            COL CENTRO — Monitoramento + Controles
        ════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col overflow-y-auto p-3 gap-3" style={{ backgroundColor: '#121212' }}>

          {/* ── Linha de monitores PVW + PGM + YTB ── */}
          <div className="grid grid-cols-3 gap-3">
            {/* PREVIEW */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#00E676' }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#00E676' }}>Preview</span>
                </div>
                <span className="text-[9px] font-mono text-zinc-600 truncate max-w-[120px]">
                  {selectedFile ? selectedFile.name.replace(".mp4", "") : "Nenhum arquivo"}
                </span>
              </div>
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden border" style={{ borderColor: '#00E67630' }}>
                <video ref={pvwRef} className="w-full h-full object-contain" muted playsInline preload="metadata" />
                {!selectedFile && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-700">
                    <Film className="h-7 w-7" />
                    <span className="text-[9px] uppercase tracking-widest">Clique em um VT H.264</span>
                  </div>
                )}
                {selectedFile && (
                  <div className="absolute top-1.5 left-1.5">
                    <span className={cn("text-[8px] font-bold px-1 py-0.5 rounded border uppercase", codecBadgeClass(selectedFile.codec))}>
                      {selectedFile.codec === "Verificando..." ? "..." : selectedFile.codec}
                    </span>
                  </div>
                )}
                {selectedFile?.duration && (
                  <div className="absolute bottom-1.5 right-1.5 text-[9px] font-mono text-zinc-400 bg-black/70 px-1 py-0.5 rounded">
                    {formatDuration(selectedFile.duration)}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 bg-black/50">
                  <button
                    onClick={handleTake}
                    className="text-black font-bold text-sm px-6 py-2 rounded-xl transition-all active:scale-[0.98]"
                    style={{ backgroundColor: '#00E676' }}
                  >
                    TAKE
                  </button>
                </div>
              </div>
            </div>

            {/* PROGRAM */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className={cn("h-1.5 w-1.5 rounded-full bg-red-500", isPlaying && "animate-pulse")} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Program</span>
                </div>
                <span className="text-[9px] font-mono text-zinc-600 truncate max-w-[120px]">
                  {pgmFile ? pgmFile.name.replace(".mp4", "") : "IDLE"}
                </span>
              </div>
              <div
                className="relative aspect-video bg-black rounded-lg overflow-hidden border-2"
                style={{ borderColor: isPlaying ? '#ef4444' : '#ef444430', boxShadow: isPlaying ? "0 0 20px rgba(239,68,68,0.2)" : "none" }}
              >
                <video
                  ref={pgmARef}
                  className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
                  style={{ opacity: playerAOpacity, zIndex: playerAZ }}
                  playsInline preload="auto"
                  onTimeUpdate={(e) => {
                    const el = e.currentTarget;
                    setPgmCurrentTime(el.currentTime);
                    if (el.duration) setPgmProgress((el.currentTime / el.duration) * 100);
                  }}
                  onEnded={handleItemFinished}
                />
                <video
                  ref={pgmBRef}
                  className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
                  style={{ opacity: playerBOpacity, zIndex: playerBZ }}
                  playsInline preload="auto"
                  onTimeUpdate={(e) => {
                    if (activePlayer !== "B") return;
                    const el = e.currentTarget;
                    setPgmCurrentTime(el.currentTime);
                    if (el.duration) setPgmProgress((el.currentTime / el.duration) * 100);
                  }}
                  onEnded={() => { if (activePlayer !== "B") return; handleItemFinished(); }}
                />
                {!pgmFile && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-700">
                    <div className="h-2 w-2 rounded-full bg-red-900" />
                    <span className="text-[9px] uppercase tracking-widest">IDLE</span>
                  </div>
                )}
                {isPlaying && (
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase animate-pulse">
                    <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> NO AR
                  </div>
                )}
                {pgmFile && items[currentIndex - 1]?.cabeca && (
                  <div className="absolute bottom-4 left-4 right-4 z-30">
                    <div className="bg-black/90 border-l-4 border-red-600 px-3 py-1.5">
                      <div className="text-xs font-bold uppercase italic">REPORTER DESKNEWS</div>
                      <div className="text-[9px] text-zinc-400">{items[currentIndex - 1]?.assunto}</div>
                    </div>
                  </div>
                )}
                {/* GC Overlay */}
                {gcVisible && (gcLine1 || gcLine2) && (
                  <div className="absolute bottom-0 left-0 right-0 z-40 px-2 pb-2 animate-in slide-in-from-bottom duration-300">
                    <div className="flex items-stretch overflow-hidden rounded">
                      <div className="w-1 bg-red-600 shrink-0" />
                      <div className="bg-black/90 px-2 py-1.5 flex-1 min-w-0">
                        {gcLine1 && <div className="text-white font-bold text-[10px] uppercase tracking-wide leading-tight truncate">{gcLine1}</div>}
                        {gcLine2 && <div className="text-zinc-400 text-[8px] uppercase tracking-widest truncate mt-0.5">{gcLine2}</div>}
                      </div>
                    </div>
                  </div>
                )}
                {/* TARJA Overlay */}
                {tarjaVisible && (
                  <div
                    className="absolute z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ left: `${tarjaX}%`, top: `${tarjaY}%` }}
                  >
                    {tarjaCustomPng ? (
                      <img src={tarjaCustomPng} alt="Tarja"
                        style={{ opacity: tarjaAlpha / 100, width: `${tarjaScaleX * 1.2}px`, height: `${tarjaScaleY * 0.4}px`, objectFit: "contain" }}
                      />
                    ) : (
                      <div className="px-3 py-1 rounded-sm shadow-lg"
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

            {/* YOUTUBE */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Youtube className="h-3 w-3 text-red-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">YouTube</span>
                </div>
                {youtubeVisible && (
                  <button
                    onClick={() => { setYoutubeVisible(false); setYoutubeUrl(""); setYoutubeInput(""); }}
                    className="text-[8px] font-bold uppercase text-zinc-600 hover:text-red-400 flex items-center gap-1"
                  >
                    <X className="h-2.5 w-2.5" /> Fechar
                  </button>
                )}
              </div>
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-red-600/20"
                style={{ boxShadow: youtubeVisible ? "0 0 20px rgba(239,68,68,0.15)" : "none" }}>
                {youtubeVisible && youtubeUrl ? (
                  <>
                    <iframe key={youtubeUrl} src={youtubeUrl}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen title="YouTube Monitor" style={{ border: "none" }}
                    />
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-red-700/90 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase pointer-events-none z-10 animate-pulse">
                      <Youtube className="h-2.5 w-2.5 text-white" /> AO VIVO
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-700">
                    <Youtube className="h-7 w-7" />
                    <span className="text-[9px] uppercase tracking-widest text-center px-3">Cole o link e clique em Abrir</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <input
                  type="text"
                  value={youtubeInput}
                  onChange={(e) => setYoutubeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const id = extractYoutubeId(youtubeInput);
                      if (id) { setYoutubeUrl(`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`); setYoutubeVisible(true); }
                      else toast.error("Link do YouTube inválido.");
                    }
                  }}
                  placeholder="youtube.com/watch?v=..."
                  className="flex-1 px-2 py-1.5 rounded-lg border text-[10px] text-zinc-300 placeholder-zinc-700 focus:outline-none transition-all"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
                />
                <button
                  onClick={() => {
                    const id = extractYoutubeId(youtubeInput);
                    if (id) { setYoutubeUrl(`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`); setYoutubeVisible(true); }
                    else toast.error("Link do YouTube inválido.");
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase text-white border border-red-600/50 transition-all active:scale-[0.98] shrink-0"
                  style={{ backgroundColor: '#ef4444' }}
                >
                  <Play className="h-2.5 w-2.5" />Abrir
                </button>
              </div>
            </div>
          </div>

          {/* ── Transport Controls + LAUDA (2 colunas) ── */}
          <div className="grid grid-cols-[auto_1fr] gap-3 flex-1">
            {/* ─ Transport Controls ─ */}
            <div className="border rounded-xl p-4 flex flex-col gap-3 w-[300px]" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
              {/* Barra de progresso */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-zinc-600 w-8 text-right tabular-nums">{formatDuration(pgmCurrentTime)}</span>
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full cursor-pointer relative overflow-hidden group" onClick={handleSeek}>
                  <div className="h-full rounded-full transition-none relative" style={{ width: `${pgmProgress}%`, backgroundColor: '#00E676' }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-white rounded-full -mr-1 opacity-0 group-hover:opacity-100 transition-opacity shadow" />
                  </div>
                </div>
                <span className="text-[9px] font-mono text-zinc-600 w-8 tabular-nums">{formatDuration(pgmFile?.duration ?? null)}</span>
              </div>
              <h3 className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider truncate text-center">
                {pgmFile?.name.replace(".mp4", "") || "Nenhum arquivo no PGM"}
              </h3>

              {/* Alavanca de Transição (Botões) */}
              <div className="flex items-center justify-center gap-2">
                <button onClick={handleCue} title="CUE"
                  className="p-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-slate-300 rounded transition-all active:scale-95">
                  <SkipBack size={18} />
                </button>
                <button onClick={handleStop} title="STOP"
                  className="p-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-slate-300 rounded transition-all active:scale-95">
                  <Square size={18} />
                </button>
                <button onClick={handlePlayPausePgm} title={isPlaying ? "PAUSE" : "PLAY"}
                  className="p-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-slate-300 rounded transition-all active:scale-95">
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>

                {/* Botão TAKE (O destaque Ciano) */}
                <button onClick={handleTake} title="TAKE"
                  className="px-8 py-3 bg-[#00E676] hover:bg-[#00c865] text-black font-black text-sm rounded shadow-[0_0_15px_rgba(0,230,118,0.3)] transition-all transform active:scale-95">
                  TAKE
                </button>
                <button onClick={handleSkip} title="SKIP"
                  className="p-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-slate-300 rounded transition-all active:scale-95">
                  <SkipForward size={18} />
                </button>
              </div>
            </div>

            {/* ─ LAUDA COLORIDA ─ */}
            <div
              className={cn(
                "border rounded-xl p-3 flex flex-col overflow-hidden transition-all duration-200",
                dragOverLauda ? "border-pink-500" : ""
              )}
              style={{ backgroundColor: '#1a1a1a', borderColor: dragOverLauda ? '#ec4899' : '#2a2a2a', boxShadow: dragOverLauda ? "0 0 16px rgba(236,72,153,0.2)" : "none" }}
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
              <div className="pb-2 border-b-2 border-pink-500 mb-3 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400">📋 LAUDA</span>
                {dragOverLauda && <span className="text-[9px] font-bold text-pink-400 animate-pulse ml-1">⬇ Solte aqui</span>}
                <span className="text-[9px] font-bold bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded-full ml-auto border border-pink-500/20">
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
                      case "SONORA": bgColor = "bg-emerald-600"; borderColor = "border-emerald-500"; hoverColor = "hover:bg-emerald-700"; icon = "🎤"; break;
                      case "PASSAGEM": bgColor = "bg-amber-600"; borderColor = "border-amber-500"; hoverColor = "hover:bg-amber-700"; icon = "🎥"; break;
                      case "PRODUÇÃO": bgColor = "bg-orange-600"; borderColor = "border-orange-500"; hoverColor = "hover:bg-orange-700"; icon = "🎬"; break;
                      case "ED_TEXTO": bgColor = "bg-blue-600"; borderColor = "border-blue-500"; hoverColor = "hover:bg-blue-700"; icon = "📝"; break;
                      case "ED_IMAGEM": bgColor = "bg-pink-600"; borderColor = "border-pink-500"; hoverColor = "hover:bg-pink-700"; icon = "🖼️"; break;
                      case "REPÓRTER": bgColor = "bg-cyan-600"; borderColor = "border-cyan-500"; hoverColor = "hover:bg-cyan-700"; icon = "🎙️"; break;
                      case "IMAGENS": bgColor = "bg-purple-600"; borderColor = "border-purple-500"; hoverColor = "hover:bg-purple-700"; icon = "🎞️"; break;
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
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const source = e.dataTransfer.getData("drag_source");
                          if (source === "lauda") {
                            const fromIdx = Number(e.dataTransfer.getData("lauda_index"));
                            if (fromIdx !== idx) handleReorderLauda(fromIdx, idx);
                          }
                          setDraggedFromLauda(null);
                          setDraggedLaudaIndex(null);
                        }}
                        onDragEnd={() => { setDraggedFromLauda(null); setDraggedLaudaIndex(null); }}
                        onClick={() => {
                          const valor = item.valor || "";
                          const novoCredito = { line1: "", line2: "" };
                          if ((item.tipo === "SONORA" || item.tipo === "PASSAGEM") && valor.includes(" - ")) {
                            const partes = valor.split(" - ");
                            novoCredito.line1 = partes[0]?.trim() || valor;
                            novoCredito.line2 = partes[1]?.trim() || "";
                          } else {
                            novoCredito.line1 = valor;
                            novoCredito.line2 = item.tipo?.replace("_", " ") || "";
                          }
                          setGcCreditsQueue((prev) => {
                            const novaFila = [...prev, novoCredito];
                            if (novaFila.length === 1) { setGcLine1(novoCredito.line1); setGcLine2(novoCredito.line2); }
                            return novaFila;
                          });
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
                          toast.success(`"${valor}" → GC`);
                        }}
                        className={cn(
                          `${bgColor} ${hoverColor} border ${borderColor} rounded-lg px-2.5 py-2 transition-all flex items-center justify-between gap-2 min-w-0 cursor-grab active:cursor-grabbing font-bold text-xs uppercase tracking-wide`,
                          draggedLaudaIndex === idx && "opacity-50 scale-95",
                          `${textColor} shadow-md hover:shadow-lg`
                        )}
                        title={`Clique para enviar ao GC: ${item.valor}`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-base shrink-0">{icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[8px] font-black opacity-80 leading-none">[{item.tipo.replace("_", ". ")}]</div>
                            <div className="text-[10px] font-bold truncate text-white">{item.valor}</div>
                          </div>
                        </div>
                        <span className="shrink-0 text-[9px] font-black bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">GC</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-2 text-zinc-700 border-2 border-dashed border-white/5 rounded-xl">
                    <span className="text-2xl">🎬</span>
                    <span className="text-[10px] uppercase tracking-widest text-center px-3">Arraste uma matéria da fila aqui</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            COL DIREITA — Painel GC + Ajustes
        ════════════════════════════════════════ */}
        <div className="w-[280px] shrink-0 border-l flex flex-col overflow-y-auto p-3 gap-3" style={{ backgroundColor: '#181818', borderColor: '#2a2a2a' }}>

          {/* ── GC — Gerador de Caracteres ── */}
          <div className="border rounded-xl p-3 flex flex-col gap-3" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <div className="flex items-center gap-2">
              <Type className="h-3 w-3 text-zinc-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">GC — Gerador</span>
            </div>

            {/* Campos + Preview */}
            <div className="grid grid-cols-[2fr_1fr] gap-2">
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-col gap-0.5">
                  <label className="text-[8px] uppercase tracking-widest text-zinc-600">Linha 1 — Nome</label>
                  <input type="text" value={gcLine1} onChange={(e) => setGcLine1(e.target.value)}
                    placeholder="Nome / Título"
                    className="w-full border rounded px-2 py-1 text-[10px] font-mono text-zinc-200 placeholder:text-zinc-700 focus:outline-none transition-all"
                    style={{ backgroundColor: '#252525', borderColor: '#333' }}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[8px] uppercase tracking-widest text-zinc-600">Linha 2 — Cargo</label>
                  <input type="text" value={gcLine2} onChange={(e) => setGcLine2(e.target.value)}
                    placeholder="Cargo / Informação"
                    className="w-full border rounded px-2 py-1 text-[10px] font-mono text-zinc-200 placeholder:text-zinc-700 focus:outline-none transition-all"
                    style={{ backgroundColor: '#252525', borderColor: '#333' }}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <label className="text-[8px] uppercase tracking-widest text-zinc-600 shrink-0">Dur.:</label>
                  <select value={gcDuration} onChange={(e) => setGcDuration(Number(e.target.value))}
                    className="flex-1 border rounded px-1.5 py-1 text-[9px] font-mono text-zinc-200 focus:outline-none transition-all"
                    style={{ backgroundColor: '#252525', borderColor: '#333' }}>
                    <option value={0}>Manual</option>
                    <option value={3}>3s</option>
                    <option value={5}>5s</option>
                    <option value={10}>10s</option>
                  </select>
                </div>
              </div>
              {/* Preview miniatura */}
              <div className="relative w-full aspect-video bg-black rounded border border-zinc-800 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-zinc-800 text-[6px] uppercase tracking-widest">GC Prev</div>
                {(gcLine1 || gcLine2) ? (
                  <div className="absolute bottom-0 left-0 right-0 px-0.5 pb-0.5">
                    <div className="flex items-stretch overflow-hidden rounded-sm">
                      <div className="w-0.5 bg-red-600 shrink-0" />
                      <div className="bg-black/90 px-1 py-0.5 flex-1 min-w-0">
                        {gcLine1 && <div className="text-white font-bold text-[6px] uppercase truncate">{gcLine1}</div>}
                        {gcLine2 && <div className="text-zinc-400 text-[5px] uppercase truncate">{gcLine2}</div>}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Botões GC */}
            <div className="flex gap-1.5">
              <button onClick={handleGcTake}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-widest text-white transition-all active:scale-[0.98]"
                style={{ backgroundColor: '#00E67620', borderColor: '#00E67640', color: '#00E676' }}>
                GC TAKE
              </button>
              <button onClick={handleGcClear}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-red-500/30 text-[9px] font-bold uppercase tracking-widest text-red-400 transition-all active:scale-[0.98]"
                style={{ backgroundColor: '#ef444420' }}>
                GC CLR
              </button>
              <button onClick={handleGcSkip} disabled={gcCreditsQueue.length === 0}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-zinc-600 text-[9px] font-bold uppercase tracking-widest text-zinc-400 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#252525' }}>
                PULAR
              </button>
            </div>

            {/* Presets */}
            <div className="border-t pt-2 flex flex-col gap-1.5" style={{ borderColor: '#2a2a2a' }}>
              <label className="text-[8px] uppercase tracking-widest text-zinc-600">Presets Rápidos:</label>
              <div className="flex flex-col gap-1">
                {Object.keys(gcPresets).map((presetName) => (
                  <button key={presetName} onClick={() => handleApplyPreset(presetName)}
                    className="w-full px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-all active:scale-95"
                    style={{ backgroundColor: '#252525' }}>
                    {presetName}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── AJUSTES & EFEITOS ── */}
          <div className="border rounded-xl p-3 flex flex-col gap-3" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">⚙️ AJUSTES & EFEITOS</span>

            <div className="grid grid-cols-2 gap-2">
              {/* Botão TARJA */}
              <button onClick={() => setTarjaPanelOpen((v) => !v)}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl border text-[9px] font-bold uppercase tracking-widest transition-all active:scale-[0.98]",
                  tarjaPanelOpen ? "border-zinc-500 text-white" : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                )}
                style={{ backgroundColor: tarjaPanelOpen ? '#3f3f46' : '#252525' }}
                title="Abrir controles da tarja">
                🎞 TARJA
              </button>

              {/* Botão TARJA ON/OFF */}
              <button
                onClick={() => {
                  const next = !tarjaVisible;
                  setTarjaVisible(next);
                  pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({ type: next ? "tarja_show" : "tarja_hide" }));
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl border text-[9px] font-bold uppercase tracking-widest transition-all active:scale-[0.98]"
                )}
                style={{
                  backgroundColor: tarjaVisible ? '#00E67620' : '#252525',
                  borderColor: tarjaVisible ? '#00E67640' : '#3f3f46',
                  color: tarjaVisible ? '#00E676' : '#71717a',
                }}>
                {tarjaVisible ? "● TARJA ON" : "○ TARJA OFF"}
              </button>

              {/* Placeholder */}
              <button disabled
                className="flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl border border-zinc-800 text-[9px] font-bold text-zinc-700 transition-all opacity-40 cursor-default"
                style={{ backgroundColor: '#1a1a1a' }}>
                —
              </button>

              {/* GC ERASE ALL */}
              <button
                onClick={() => {
                  const now = Date.now();
                  if (now - lastClickTime < 300) {
                    if (materiaAtual?.materia_id) {
                      setMateriaAtual({ ...materiaAtual, itensLauda: [] });
                      toast.success("Lauda limpa!");
                    }
                    setDoubleClickCount(0);
                    setLastClickTime(0);
                  } else {
                    setDoubleClickCount(1);
                    setLastClickTime(now);
                  }
                }}
                className="flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl border border-red-500/20 text-[9px] font-bold uppercase text-red-400 transition-all active:scale-[0.98]"
                style={{ backgroundColor: '#7f1d1d30' }}
                title="Clique 2x para deletar toda a lauda">
                🗑️ ERASE
              </button>
            </div>
          </div>

          {/* ── PAINEL FLUTUANTE DA TARJA ── */}
          {tarjaPanelOpen && (
            <div
              className="fixed z-[9999] border rounded-2xl shadow-2xl w-80 select-none"
              style={{ left: tarjaPanelPos.x, top: tarjaPanelPos.y, backgroundColor: '#1a1a1a', borderColor: '#3a3a3a' }}
            >
              {/* Header arrastável */}
              <div
                className="flex items-center justify-between px-4 py-3 rounded-t-2xl cursor-grab active:cursor-grabbing border-b"
                style={{ backgroundColor: '#252525', borderColor: '#333' }}
                onMouseDown={(e) => {
                  tarjaDragRef.current = { startX: e.clientX, startY: e.clientY, startPX: tarjaPanelPos.x, startPY: tarjaPanelPos.y };
                  const onMove = (ev: MouseEvent) => {
                    if (!tarjaDragRef.current) return;
                    setTarjaPanelPos({ x: tarjaDragRef.current.startPX + ev.clientX - tarjaDragRef.current.startX, y: tarjaDragRef.current.startPY + ev.clientY - tarjaDragRef.current.startY });
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
                    className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border transition-all"
                    style={{
                      backgroundColor: tarjaVisible ? '#00E67620' : '#252525',
                      borderColor: tarjaVisible ? '#00E67640' : '#3f3f46',
                      color: tarjaVisible ? '#00E676' : '#71717a',
                    }}
                  >
                    {tarjaVisible ? "● ON" : "○ OFF"}
                  </button>
                  <button onClick={() => setTarjaPanelOpen(false)} className="text-zinc-500 hover:text-red-400 font-bold transition-colors">✕</button>
                </div>
              </div>

              <div className="p-4 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
                {/* TEXTO & TIPOGRAFIA */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Caractere / Texto</span>
                  <input type="text" value={tarjaText} onChange={(e) => setTarjaText(e.target.value)}
                    placeholder="Nome da tarja..."
                    className="w-full border rounded-lg px-3 py-2 text-[11px] font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none transition-all"
                    style={{ backgroundColor: '#252525', borderColor: '#3a3a3a' }}
                  />
                  <div className="flex gap-2 items-center">
                    <select value={tarjaFont} onChange={(e) => setTarjaFont(e.target.value)}
                      className="flex-1 border rounded-lg px-2 py-1.5 text-[10px] text-zinc-200 focus:outline-none transition-all"
                      style={{ backgroundColor: '#252525', borderColor: '#3a3a3a' }}>
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
                    <button onClick={() => setTarjaBold((v) => !v)}
                      className="px-3 py-1.5 rounded-lg border text-[11px] font-black tracking-widest transition-all"
                      style={{ backgroundColor: tarjaBold ? '#00E67620' : '#252525', borderColor: tarjaBold ? '#00E67640' : '#3a3a3a', color: tarjaBold ? '#00E676' : '#71717a' }}>B</button>
                    <button onClick={() => setTarjaItalic((v) => !v)}
                      className="px-3 py-1.5 rounded-lg border text-[11px] italic font-bold tracking-widest transition-all"
                      style={{ backgroundColor: tarjaItalic ? '#00E67620' : '#252525', borderColor: tarjaItalic ? '#00E67640' : '#3a3a3a', color: tarjaItalic ? '#00E676' : '#71717a' }}>I</button>
                  </div>
                  <div className="w-full px-3 py-2 rounded-lg border text-center truncate text-[13px]"
                    style={{ backgroundColor: '#0a0a0a', borderColor: '#2a2a2a', fontFamily: tarjaFont, fontWeight: tarjaBold ? "bold" : "normal", fontStyle: tarjaItalic ? "italic" : "normal", color: `hsl(${tarjaHue}, ${tarjaSaturation}%, 80%)` }}>
                    {tarjaText || "Prévia do texto"}
                  </div>
                </div>

                {/* COR */}
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

                {/* OPACIDADE */}
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

                {/* ESCALA */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Escala</span>
                    <button onClick={() => setTarjaScaleLock((v) => !v)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-widest transition-all"
                      style={{
                        backgroundColor: tarjaScaleLock ? '#00E67620' : '#252525',
                        borderColor: tarjaScaleLock ? '#00E67450' : '#3f3f46',
                        color: tarjaScaleLock ? '#00E676' : '#71717a',
                      }}>
                      {tarjaScaleLock ? "🔒 LOCK" : "🔓 FREE"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[9px] text-zinc-500 w-16 shrink-0">Largura X</label>
                    <input type="range" min={10} max={400} value={tarjaScaleX}
                      onChange={(e) => { const v = Number(e.target.value); if (tarjaScaleLock) { setTarjaScaleX(v); setTarjaScaleY(v); } else setTarjaScaleX(v); }}
                      className="flex-1 h-1.5 accent-pink-500"
                    />
                    <span className="text-[9px] font-mono text-zinc-400 w-8 text-right">{tarjaScaleX}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[9px] text-zinc-500 w-16 shrink-0">Altura Y</label>
                    <input type="range" min={10} max={400} value={tarjaScaleY}
                      onChange={(e) => { const v = Number(e.target.value); if (tarjaScaleLock) { setTarjaScaleX(v); setTarjaScaleY(v); } else setTarjaScaleY(v); }}
                      className="flex-1 h-1.5 accent-pink-500"
                    />
                    <span className="text-[9px] font-mono text-zinc-400 w-8 text-right">{tarjaScaleY}%</span>
                  </div>
                </div>

                {/* POSIÇÃO */}
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
                  <div className="relative w-full h-14 rounded-lg border border-zinc-700 overflow-hidden" style={{ backgroundColor: '#252525' }}>
                    <div
                      className="absolute w-2.5 h-2.5 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 shadow-lg transition-all duration-75"
                      style={{ left: `${tarjaX}%`, top: `${tarjaY}%`, backgroundColor: `hsla(${tarjaHue},${tarjaSaturation}%,50%,0.8)` }}
                    />
                  </div>
                </div>

                {/* PNG PERSONALIZADO */}
                <div className="flex flex-col gap-2 border-t border-zinc-700 pt-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">PNG Personalizado</span>
                  <div className="flex gap-2">
                    <button onClick={() => tarjaFileInputRef.current?.click()}
                      className="flex-1 px-3 py-2 rounded-xl border text-[9px] font-bold uppercase tracking-widest text-zinc-200 transition-all active:scale-95"
                      style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
                      📁 PERSONALIZAR
                    </button>
                    {tarjaCustomPng && (
                      <button onClick={() => setTarjaCustomPng(null)}
                        className="px-3 py-2 rounded-xl border border-red-500/30 text-[9px] font-bold text-red-400 transition-all active:scale-95"
                        style={{ backgroundColor: '#7f1d1d40' }}>✕ Remover</button>
                    )}
                  </div>
                  {tarjaCustomPng && (
                    <div className="w-full overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 flex items-center justify-center"
                      style={{ aspectRatio: `${tarjaScaleX} / ${tarjaScaleY}` }}>
                      <img src={tarjaCustomPng} alt="Tarja custom" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <input ref={tarjaFileInputRef} type="file" accept="image/png" className="hidden"
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

      <style
        dangerouslySetInnerHTML={{
          __html: `
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #3a3a3a; }
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
