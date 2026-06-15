import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/Protected";
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

export const Route = createFileRoute("/playout")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      date: (search.date as string) || undefined,
      programa: (search.programa as string) || undefined,
    };
  },
  component: () => (
    <Protected>
      <PlayoutPage />
    </Protected>
  ),
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
      v.onerror = () => { clearTimeout(t); URL.revokeObjectURL(blobUrl); v.src = ""; resolve("Erro"); };
    });
  } catch { return "Erro"; }
}

function getVideoDuration(blobUrl: string): Promise<number | null> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.preload = "metadata"; v.muted = true; v.src = blobUrl;
    const t = setTimeout(() => { v.src = ""; resolve(null); }, 4000);
    v.onloadedmetadata = () => { clearTimeout(t); const d = isFinite(v.duration) ? v.duration : null; v.src = ""; resolve(d); };
    v.onerror = () => { clearTimeout(t); v.src = ""; resolve(null); };
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
  const [pgmProgress, setPgmProgress] = useState(0);        // 0-100
  const [pgmCurrentTime, setPgmCurrentTime] = useState(0);  // segundos

  // YouTube player
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeInput, setYoutubeInput] = useState("");
  const [youtubeVisible, setYoutubeVisible] = useState(false);

  const handleItemFinished = useCallback(() => {
    setIsPlaying(false);
    setPgmProgress(100);
    
    // Remove o item que ACABOU de passar (currentIndex - 1)
    setTimeout(() => {
      setItems(prev => {
        const finishedIndex = currentIndex - 1;
        if (finishedIndex >= 0 && prev[finishedIndex]) {
          const itemToRemove = prev[finishedIndex];
          const newList = prev.filter((_, idx) => idx !== finishedIndex);
          
          // Ajusta o índice para a nova realidade da lista
          setCurrentIndex(curr => Math.max(0, curr - 1));
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
  const progressRafRef = useRef<number | null>(null);

  // ── Relógio ──
  useEffect(() => {
    const t = setInterval(() => setClock(new Date().toLocaleTimeString("pt-BR", { hour12: false })), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Cleanup blob URLs ──
  useEffect(() => () => { blobUrlsRef.current.forEach(URL.revokeObjectURL); }, []);

  // ── Helpers ──
  const getFileName = useCallback((assunto: string | null | undefined) =>
    !assunto ? "" :
    assunto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "_") + ".mp4"
  , []);

  const getFileUrl = useCallback(async (assunto: string | null | undefined): Promise<string | null> => {
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
      } catch { return null; }
    }
    return `/materias/${fileName}`;
  }, [dirHandle, getFileName]);

  // ── Verify files ──
  const verifyFiles = useCallback(async (
    itemsToVerify: PlayoutItem[],
    handle?: FileSystemDirectoryHandle | null
  ) => {
    const h = handle ?? dirHandle;
    setIsVerifying(true);
    const upd: Record<string, boolean> = {};
    await Promise.all(itemsToVerify.map(async (item) => {
      const fn = getFileName(item.assunto);
      if (h) {
        try { await h.getFileHandle(fn); upd[item.id] = true; } catch { upd[item.id] = false; }
      } else {
        try { const r = await fetch(`/materias/${fn}`, { method: "HEAD" }); upd[item.id] = r.ok; } catch { upd[item.id] = false; }
      }
    }));
    setFileStatus(prev => ({ ...prev, ...upd }));
    setIsVerifying(false);
  }, [dirHandle, getFileName]);

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

  useEffect(() => { if (items.length > 0) verifyFiles(items); }, [items, verifyFiles]);

  // ── Load playlist ──
  const load = useCallback(async () => {
    const { data: blocks } = await supabase
      .from("espelho_blocos").select("id")
      .eq("data_edicao", date || new Date().toISOString().slice(0, 10))
      .eq("programa", programa || "Jornal da Manhã");
    if (blocks?.length) {
      const { data: itens } = await supabase
        .from("espelho_itens")
        .select("id, assunto, cabeca, tempo, materia_id, ordem, formato")
        .in("bloco_id", blocks.map(b => b.id))
        .order("ordem");
      setItems((itens || []) as PlayoutItem[]);
      if (itens?.length) verifyFiles(itens as PlayoutItem[]);
    }
  }, [date, programa, verifyFiles]);

  useEffect(() => { load(); }, [load]);

  // ── Scan local files ──
  const scanLocalFiles = useCallback(async (handle: FileSystemDirectoryHandle) => {
    setIsScanningFiles(true);
    setLocalFiles([]);
    const found: LocalVideoFile[] = [];

    for await (const [name, entry] of handle.entries()) {
      if (entry.kind === "file" && name.toLowerCase().endsWith(".mp4")) {
        const file: File = await (entry as FileSystemFileHandle).getFile();
        const blobUrl = URL.createObjectURL(file);
        blobUrlsRef.current.set(name, blobUrl);
        const row: LocalVideoFile = {
          name, sizeMB: parseFloat((file.size / 1024 / 1024).toFixed(1)),
          lastModified: new Date(file.lastModified).toLocaleString("pt-BR"),
          codec: "Verificando...", blobUrl, duration: null,
        };
        found.push(row);
        setLocalFiles(prev => [...prev, row]);
      }
    }

    const BATCH = 4;
    for (let i = 0; i < found.length; i += BATCH) {
      await Promise.all(found.slice(i, i + BATCH).map(async (f) => {
        const file = await handle.getFileHandle(f.name).then(fh => fh.getFile());
        const [codec, duration] = await Promise.all([detectCodec(file), getVideoDuration(f.blobUrl)]);
        setLocalFiles(prev => prev.map(p => p.name === f.name ? { ...p, codec, duration } : p));
      }));
    }
    setIsScanningFiles(false);
    toast.success(`${found.length} arquivo(s) MP4 encontrado(s)`);
  }, []);

  // ── Vincular pasta ──
  const handleVincularPasta = useCallback(async () => {
    if (!("showDirectoryPicker" in window)) {
      toast.error("Use Chrome ou Edge para acesso a pastas locais.");
      return;
    }
    try {
      const handle = await window.showDirectoryPicker({ id: "playout-folder", startIn: "desktop", mode: "read" });
      setDirHandle(handle);
      setIsDirReady(true);
      blobUrlsRef.current.forEach(URL.revokeObjectURL);
      blobUrlsRef.current.clear();
      await load();
      await verifyFiles(items, handle);
      await scanLocalFiles(handle);
      toast.success(`✓ Pasta "${handle.name}" vinculada!`);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") toast.error("Falha ao acessar pasta local.");
    }
  }, [load, verifyFiles, scanLocalFiles]);

  // ── Preview: clique na lista ──
  const handleSelectFile = useCallback((f: LocalVideoFile) => {
    setSelectedFile(f);
    if (pvwRef.current) {
      pvwRef.current.src = f.blobUrl;
      pvwRef.current.load();
    }
  }, []);

  // Função pra carregar arquivo pelo assunto (do espelho)
  const handleSelectFromPlaylist = useCallback(async (assunto: string | null | undefined) => {
    if (!assunto) {
      toast.error("Assunto inválido");
      return;
    }

    const url = await getFileUrl(assunto);
    if (!url) {
      toast.error(`Arquivo não encontrado para: "${assunto}"`);
      return;
    }

    const file = localFiles.find(f => f.blobUrl === url);
    if (file) {
      setSelectedFile(file);
      if (pvwRef.current) {
        pvwRef.current.src = file.blobUrl;
        pvwRef.current.load();
        toast.success(`"${assunto}" carregado no preview`);
      }
    }
  }, [localFiles, getFileUrl]);

  // ── Controles de transporte ──

  // TAKE: envia preview para PGM
  const handleTake = useCallback(async () => {
    let targetFile = selectedFile;
    let isFromPlaylist = false;

    // Se não houver seleção manual (selectedFile), pega o próximo automático da playlist
    if (!targetFile && currentIndex < items.length) {
      const nextItem = items[currentIndex];
      const url = await getFileUrl(nextItem.assunto);
      if (url) {
        targetFile = localFiles.find(f => f.blobUrl === url) || {
          name: getFileName(nextItem.assunto),
          sizeMB: 0, lastModified: "", codec: "H.264",
          blobUrl: url, duration: null,
        };
        isFromPlaylist = true;
      }
    }

    if (!targetFile) { 
      toast.error("Nenhum arquivo pronto para o ar. Selecione um vídeo ou verifique a pasta."); 
      return; 
    }

    const incoming = activePlayer === "A" ? pgmBRef.current : pgmARef.current;
    const outgoing = activePlayer === "A" ? pgmARef.current : pgmBRef.current;

    if (incoming && outgoing) {
      setPgmFile(targetFile);
      setIsPlaying(true);
      setPgmProgress(0);
      setPgmCurrentTime(0);

      incoming.src = targetFile.blobUrl;
      incoming.style.opacity = "1";
      incoming.style.zIndex = "20";
      incoming.play().catch(() => toast.error("Erro ao reproduzir vídeo no PGM."));

      outgoing.style.opacity = "0";
      outgoing.style.zIndex = "10";
      setTimeout(() => outgoing.pause(), 300);

      // Se veio da playlist, avança o índice
      if (isFromPlaylist) {
        setCurrentIndex(prev => prev + 1);
      }

      setActivePlayer(activePlayer === "A" ? "B" : "A");
      setSelectedFile(null); // Limpa seleção manual após o corte
    }
  }, [selectedFile, currentIndex, items, localFiles, getFileUrl, getFileName, activePlayer, pgmARef, pgmBRef]);

  const handlePlayPausePgm = useCallback(() => {
    const active = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!active) return;
    if (isPlaying) { active.pause(); setIsPlaying(false); }
    else { active.play(); setIsPlaying(true); }
  }, [isPlaying, activePlayer]);

  const handleStop = useCallback(() => {
    const active = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!active) return;
    active.pause();
    active.currentTime = 0;
    setIsPlaying(false);
    setPgmProgress(0);
    setPgmCurrentTime(0);
  }, [activePlayer]);

  const handleCue = useCallback(() => {
    const active = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!active) return;
    active.currentTime = 0;
    setPgmProgress(0);
    setPgmCurrentTime(0);
  }, [activePlayer]);

  const handleSkip = useCallback(() => {
    if (currentIndex >= items.length) {
      toast.info("Fim da playlist.");
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setSelectedFile(null);
    toast.info("Matéria pulada.");
  }, [currentIndex, items.length]);

  // ── Atalhos de Teclado ──
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Evita disparar se o usuário estiver digitando em algum input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space") {
        e.preventDefault(); // Impede o scroll da página
        if (!e.repeat) {
          handleTake();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleTake]);

  // Progress bar atualizada via requestAnimationFrame
  useEffect(() => {
    const videoA = pgmARef.current;
    const videoB = pgmBRef.current;

    const updateProgress = () => {
      const video = activePlayer === "A" ? videoA : videoB;
      if (video && video.duration) {
        setPgmProgress((video.currentTime / video.duration) * 100);
        setPgmCurrentTime(video.currentTime);
      }
      progressRafRef.current = requestAnimationFrame(updateProgress);
    };

    const onPlay = () => { 
      if (progressRafRef.current) cancelAnimationFrame(progressRafRef.current);
      progressRafRef.current = requestAnimationFrame(updateProgress); 
      setIsPlaying(true); 
    };
    const onPause = () => { 
      if (progressRafRef.current) cancelAnimationFrame(progressRafRef.current); 
      setIsPlaying(false); 
    };
    const onEnded = () => handleItemFinished();
    
    [videoA, videoB].forEach(v => {
      if (v) {
        v.addEventListener("play", onPlay);
        v.addEventListener("pause", onPause);
        v.addEventListener("ended", onEnded);
      }
    });

    return () => {
      [videoA, videoB].forEach(v => {
        if (v) {
          v.removeEventListener("play", onPlay);
          v.removeEventListener("pause", onPause);
          v.removeEventListener("ended", onEnded);
        }
      });
      if (progressRafRef.current) cancelAnimationFrame(progressRafRef.current);
    };
  }, [activePlayer, handleItemFinished]);

  // Seek via clique na barra
  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const active = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!active || !active.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    active.currentTime = ratio * active.duration;
  }, [activePlayer]);

  // Stats
  const totalSizeMB = localFiles.reduce((a, f) => a + f.sizeMB, 0);
  const h264Count = localFiles.filter(f => f.codec === "H.264").length;
  const otherCount = localFiles.filter(f => !["H.264","Verificando...","Erro"].includes(f.codec)).length;

  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col overflow-hidden font-sans selection:bg-[var(--accent-primary)]/30">

      {/* ── Header ── */}
      <header className="h-24 border-b border-[var(--border-subtle)] bg-[var(--glass-bg)] backdrop-blur-xl flex items-center justify-between px-6 shrink-0 relative z-30">
        <div className="flex items-center gap-4">
          <div className="p-1.5 bg-red-600 rounded">
            <MonitorPlay className="h-4 w-4 text-white" />
          </div>
          <h1 className="font-mono font-bold tracking-tighter uppercase text-sm">
            DeskNews <span className="text-red-500">Exibição</span>
          </h1>
          {isDirReady && dirHandle && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--status-success)]/10 border border-[var(--status-success)]/20 ml-2">
              <FolderOpen className="h-3 w-3 text-[var(--status-success)]" />
              <span className="text-[10px] font-mono text-[var(--status-success)] uppercase font-semibold">{dirHandle.name}</span>
            </div>
          )}
        </div>

        {/* Contador Regressivo Centralizado (GIGANTE) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-1">Tempo Restante VT</span>
          <div className={cn(
            "text-7xl font-mono font-bold tabular-nums leading-none tracking-tighter transition-colors duration-300",
            isEom ? "text-[var(--status-error)] animate-pulse" : "text-[var(--status-success)]"
          )}>
            {formatDuration(pgmRemainingTime)}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Botões de controle global */}
          <button onClick={handleVincularPasta} disabled={isVerifying || isScanningFiles}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all duration-300 active:scale-[0.95]",
              isDirReady
                ? "bg-[var(--bg-overlay)] text-[var(--text-tertiary)] hover:bg-[var(--bg-overlay-2)] border-[var(--border-light)]"
                : "bg-[var(--status-warning)]/10 text-[var(--status-warning)] border-[var(--status-warning)]/30 animate-pulse"
            )}>
            <FolderOpen className="h-3 w-3" />
            {isDirReady ? "TROCAR PASTA" : "VINCULAR PASTA"}
          </button>

          <button onClick={load} disabled={isVerifying}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-overlay)] hover:bg-[var(--bg-overlay-2)] border border-[var(--border-light)] text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] transition-all duration-300 active:scale-[0.95]">
            <RefreshCw className={cn("h-3 w-3", isVerifying && "animate-spin")} />
            IMPORTAR
          </button>

          {isDirReady && dirHandle && (
            <button onClick={() => scanLocalFiles(dirHandle)} disabled={isScanningFiles}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent-secondary)]/10 hover:bg-[var(--accent-secondary)]/20 border border-[var(--accent-secondary)]/20 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-secondary)] transition-all duration-300 active:scale-[0.95]">
              <Film className={cn("h-3 w-3", isScanningFiles && "animate-spin")} />
              {isScanningFiles ? "SCANEANDO..." : "SCAN"}
            </button>
          )}

          {/* Relógio */}
          <div className="text-right pl-4 border-l border-[var(--border-subtle)]">
            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest block">ON AIR</span>
            <span className="text-2xl font-mono font-bold text-[var(--status-success)] tabular-nums leading-none">{clock}</span>
          </div>
        </div>
      </header>

      {/* ── Layout principal: esquerda + direita ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ════════════════════════════════════════
            COLUNA ESQUERDA — Lista de VTs
        ════════════════════════════════════════ */}
        <div className="w-[420px] shrink-0 border-r border-[var(--border-subtle)] flex flex-col overflow-hidden bg-[var(--bg-secondary)]/30">

          {/* Cabeçalho da lista */}
          <div className="px-4 py-4 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                VTs do Jornal
              </h2>
              <p className="text-[9px] text-zinc-600 mt-0.5">
                {items.length} matérias · {localFiles.length} arquivos locais
              </p>
            </div>
            {localFiles.length > 0 && (
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />{h264Count} H.264
                </span>
                {otherCount > 0 && (
                  <span className="text-yellow-400 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />{otherCount} outro
                  </span>
                )}
                <span className="text-zinc-600 flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />{(totalSizeMB / 1024).toFixed(1)}GB
                </span>
              </div>
            )}
          </div>

          {/* ── Seção 1: Arquivos locais ── */}
          {localFiles.length > 0 && (
            <div className="border-b border-[var(--border-subtle)]">
              <div className="px-4 py-2 bg-[var(--bg-tertiary)]/50">
                <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                  Arquivos na Pasta Local
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
                        "w-full text-left px-4 py-3 border-b border-[var(--border-subtle)]/30 transition-all duration-300 flex items-center gap-3",
                        isOnAir ? "bg-[var(--status-error)]/10 border-l-2 border-l-[var(--status-error)]" :
                        isSelected ? "bg-[var(--accent-primary)]/10 border-l-2 border-l-[var(--accent-primary)]" :
                        "hover:bg-[var(--bg-overlay)] border-l-2 border-l-transparent"
                      )}
                    >
                      {/* Ícone de estado */}
                      <div className="shrink-0">
                        {isOnAir ? (
                          <div className="h-2 w-2 rounded-full bg-[var(--status-error)] animate-pulse" />
                        ) : isSelected ? (
                          <div className="h-2 w-2 rounded-full bg-[var(--accent-primary)]" />
                        ) : (
                          <Film className={cn("h-3.5 w-3.5", isH264 ? "text-zinc-500" : "text-yellow-600")} />
                        )}
                      </div>

                      {/* Nome e info */}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-xs font-mono truncate leading-tight",
                          isOnAir ? "text-[var(--status-error)] font-bold" :
                          isSelected ? "text-[var(--accent-primary)] font-bold" : "text-[var(--text-secondary)]"
                        )}>
                          {f.name.replace(".mp4", "")}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={cn(
                            "text-[9px] px-1.5 py-0 rounded border font-bold uppercase",
                            codecBadgeClass(f.codec)
                          )}>
                            {f.codec === "Verificando..." ? "..." : f.codec}
                          </span>
                          <span className="text-[10px] text-zinc-600 font-mono">
                            {formatDuration(f.duration)} · {f.sizeMB}MB
                          </span>
                        </div>
                      </div>

                      {/* Indicador no ar */}
                      {isOnAir && (
                        <span className="shrink-0 text-[9px] text-[var(--status-error)] font-bold uppercase animate-pulse">
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
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-2 bg-[var(--bg-tertiary)]/50 border-b border-[var(--border-subtle)]">
              <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                Espelho — Fila do Dia
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left">
                <tbody className="text-sm font-mono divide-y divide-[var(--border-subtle)]/30">
                  {items.map((item, idx) => {
                    const isOnAir = idx === currentIndex - 1;
                    const isNext = idx === currentIndex;
                    const isDone = idx < currentIndex - 1;
                    const exists = fileStatus[item.id];
                    const expectedFileName = getFileName(item.assunto);
                    const localMatch = localFiles.find(f => f.name === expectedFileName);

                    const handleDeleteItem = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      setItems(prev => prev.filter((_, i) => i !== idx));
                      if (currentIndex > idx) {
                        setCurrentIndex(prev => Math.max(0, prev - 1));
                      }
                      toast.info(`"${item.assunto}" removido da fila`);
                    };

                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleSelectFromPlaylist(item.assunto)}
                        className={cn(
                          "transition-all duration-300 cursor-pointer group",
                          isOnAir ? "bg-[var(--status-error)]/10" : "hover:bg-[var(--bg-overlay)]",
                          isDone && "opacity-30"
                        )}
                      >
                        <td className="px-4 py-4 w-20">
                          {isOnAir ? (
                            <span className="text-[var(--status-error)] font-bold animate-pulse text-[10px]">● AR</span>
                          ) : isNext ? (
                            <span className="text-[var(--status-success)] font-bold text-[10px]">NEXT</span>
                          ) : "FILA"}
                        </td>
                        <td className="px-4 py-4 text-center w-12">
                          {exists ? (
                            <FileCheck className="h-4 w-4 text-[var(--status-success)] mx-auto" />
                          ) : (
                            <FileX className="h-4 w-4 text-[var(--status-error)] mx-auto" />
                          )}
                        </td>
                        <td className={cn("px-4 py-4 font-bold", isOnAir ? "text-white" : "text-zinc-400")}>
                          {item.assunto}
                        </td>
                        <td className="px-4 py-4 text-right text-zinc-500">
                          {item.tempo || "0:00"}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={handleDeleteItem}
                            className="text-zinc-500 hover:text-[var(--status-error)] transition-colors opacity-0 group-hover:opacity-100 text-xs font-bold uppercase"
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
                <div className="px-4 py-12 text-center text-zinc-700 text-xs italic">
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

            {/* PREVIEW */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--status-success)]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--status-success)]">
                    Preview
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-quaternary)] truncate max-w-[160px]">
                  {selectedFile ? selectedFile.name.replace(".mp4","") : "—"}
                </span>
              </div>

              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border-2 border-[var(--status-success)]/30 shadow-[var(--shadow-lg)] group/pvw">
                <video ref={pvwRef} className="w-full h-full object-contain" muted playsInline preload="metadata" />

                {!selectedFile && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-800">
                    <Film className="h-8 w-8" />
                    <span className="text-[10px] uppercase tracking-widest">
                      Clique em um VT H.264
                    </span>
                  </div>
                )}

                {/* Badge codec (agora para o item do PVW) */}
                {selectedFile && (
                  <div className="absolute top-2 left-2">
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase",
                      codecBadgeClass(selectedFile.codec)
                    )}>
                      {selectedFile.codec}
                    </span>
                  </div>
                )}

                {/* Duração (agora para o item do PVW) */}
                {selectedFile?.duration && (
                  <div className="absolute bottom-2 right-2 text-[10px] font-mono text-zinc-400 bg-black/60 px-1.5 py-0.5 rounded">
                    {formatDuration(selectedFile.duration)}
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/pvw:opacity-100 transition-all duration-500 bg-black/40 backdrop-blur-sm">
                  <button
                    onClick={handleTake}
                    className="bg-[var(--status-warning)] hover:scale-110 text-black font-black text-xl px-10 py-4 rounded-2xl shadow-2xl transition-all active:scale-95"
                  >
                    TAKE
                  </button>
                </div>
              </div>
            </div>

            {/* PROGRAM */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("h-1.5 w-1.5 rounded-full bg-[var(--status-error)]", isPlaying && "animate-pulse")} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--status-error)]">
                    Program
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-quaternary)] truncate max-w-[160px]">
                  {pgmFile ? pgmFile.name.replace(".mp4","") : "IDLE"}
                </span>
              </div>

              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border-2 border-[var(--status-error)]/60"
                style={{ boxShadow: isPlaying ? "0 0 24px rgba(220,38,38,0.2)" : "none" }}>
                <video 
                  ref={pgmARef} 
                  className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 z-10"
                  playsInline
                  preload="auto"
                />
                <video 
                  ref={pgmBRef} 
                  className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 z-0 opacity-0"
                  playsInline
                  preload="auto"
                />

                {/* IDLE overlay */}
                {!pgmFile && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-800">
                    <div className="h-2 w-2 rounded-full bg-zinc-900" />
                    <span className="text-[10px] uppercase tracking-widest">IDLE</span>
                  </div>
                )}

                {/* ON AIR badge */}
                {isPlaying && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[var(--status-error)] px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest animate-pulse shadow-glow">
                    ● NO AR
                  </div>
                )}

                {/* GC — Lower third */}
                {pgmFile && items[currentIndex - 1]?.cabeca && (
                  <div className="absolute bottom-6 left-6 right-6 z-30 animate-in slide-in-from-left duration-700">
                    <div className="bg-black/80 backdrop-blur-md border-l-4 border-[var(--status-error)] px-4 py-2 shadow-2xl">
                      <div className="text-sm font-bold uppercase italic tracking-tight text-white">REPORTER DESKNEWS</div>
                      <div className="text-[10px] text-zinc-400">{items[currentIndex - 1]?.assunto}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* YOUTUBE */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Youtube className="h-3.5 w-3.5 text-[var(--status-error)]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--status-error)]/80">
                    YouTube
                  </span>
                </div>
                {youtubeVisible && (
                  <button
                    onClick={() => { setYoutubeVisible(false); setYoutubeUrl(""); setYoutubeInput(""); }}
                    className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 hover:text-[var(--status-error)] transition-colors flex items-center gap-1"
                  >
                    <X className="h-3 w-3" /> Fechar
                  </button>
                )}
              </div>

              {/* Tela do monitor YouTube */}
              <div
                className="relative aspect-video bg-black rounded-2xl overflow-hidden border-2 border-[var(--border-light)]"
                style={{ boxShadow: youtubeVisible ? "0 0 24px rgba(239,68,68,0.15)" : "none" }}
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
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-[var(--status-error)]/90 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest pointer-events-none z-10 animate-pulse">
                      <Youtube className="h-3 w-3" /> AO VIVO
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-800">
                    <Youtube className="h-8 w-8 opacity-20" />
                    <span className="text-[10px] uppercase tracking-widest text-center px-4 opacity-40">
                      Cole o link abaixo e clique em Abrir
                    </span>
                  </div>
                )}
              </div>

              {/* Input de link — fica embaixo do monitor */}
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-600 pointer-events-none" />
                  <input
                    type="text"
                    value={youtubeInput}
                    onChange={e => setYoutubeInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        const id = extractYoutubeId(youtubeInput);
                        if (id) {
                          setYoutubeUrl(`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`);
                          setYoutubeVisible(true);
                        } else {
                          toast.error("URL não reconhecida.");
                        }
                      }
                    }}
                    placeholder="Link do YouTube..."
                    className="w-full bg-zinc-800/60 border border-white/5 rounded-lg pl-7 pr-3 py-1.5 text-[10px] font-mono text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-red-500/40 focus:bg-zinc-800 transition-all"
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--status-error)] hover:bg-red-500 border border-red-500/50 text-[10px] font-bold uppercase tracking-widest text-white transition-all duration-300 active:scale-[0.95] shrink-0"
                >
                  <Play className="h-3 w-3" />
                  Abrir
                </button>
              </div>
            </div>
          </div>

          {/* ── Transport Controls ── */}
          <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-xl rounded-3xl p-6 flex flex-col gap-5 shadow-[var(--shadow-2xl)] relative z-10">

            {/* Barra de progresso */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-[var(--text-tertiary)] w-10 text-right tabular-nums">
                {formatDuration(pgmCurrentTime)}
              </span>
              <div
                className="flex-1 h-2 bg-[var(--bg-overlay-2)] rounded-full cursor-pointer relative overflow-hidden group"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-[var(--status-error)] rounded-full transition-none relative"
                  style={{ width: `${pgmProgress}%` }}
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
              <p className="text-[10px] font-mono text-zinc-600 truncate">
                {pgmFile?.name || "Nenhum arquivo no PGM"}
              </p>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-center gap-3">

              {/* CUE — Voltar ao início */}
              <button
                onClick={handleCue}
                title="CUE — Voltar ao início"
                className="flex flex-col items-center gap-1 px-5 py-3.5 rounded-2xl bg-[var(--bg-overlay)] hover:bg-[var(--bg-overlay-2)] border border-[var(--border-light)] transition-all duration-300 active:scale-[0.95] group"
              >
                <SkipBack className="h-5 w-5 text-zinc-400 group-hover:text-white transition-colors" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400">CUE</span>
              </button>

              {/* STOP */}
              <button
                onClick={handleStop}
                title="STOP"
                className="flex flex-col items-center gap-1 px-5 py-3.5 rounded-2xl bg-[var(--bg-overlay)] hover:bg-[var(--status-error)]/10 border border-[var(--border-light)] hover:border-[var(--status-error)]/30 transition-all duration-300 active:scale-[0.95] group"
              >
                <Square className="h-5 w-5 text-zinc-400 group-hover:text-red-400 transition-colors" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-red-400">STOP</span>
              </button>

              <button
                onClick={handlePlayPausePgm}
                title={isPlaying ? "PAUSE" : "PLAY"}
                className={cn(
                  "flex flex-col items-center gap-1 px-10 py-3.5 rounded-2xl border transition-all duration-500 active:scale-[0.95] group",
                  isPlaying
                    ? "bg-[var(--status-warning)]/10 hover:bg-[var(--status-warning)]/20 border-[var(--status-warning)]/30"
                    : "bg-[var(--status-success)] hover:bg-[var(--status-success)]/90 border-[var(--status-success)]/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                )}
              >
                {isPlaying
                  ? <Pause className="h-6 w-6 text-yellow-400" />
                  : <Play className="h-6 w-6 text-white" />
                }
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-widest",
                  isPlaying ? "text-[var(--status-warning)]" : "text-white"
                )}>
                  {isPlaying ? "PAUSE" : "PLAY"}
                </span>
              </button>

              {/* TAKE */}
              <button
                onClick={handleTake}
                title="TAKE — Enviar preview para o ar"
                className="flex flex-col items-center gap-1 px-8 py-3.5 rounded-2xl bg-[var(--status-warning)] hover:bg-[var(--status-warning)]/90 border border-[var(--status-warning)]/50 transition-all duration-300 active:scale-[0.95] group shadow-[0_0_20px_rgba(234,179,8,0.15)]"
              >
                <MonitorPlay className="h-5 w-5 text-black" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-black">TAKE</span>
              </button>

              {/* SKIP — Próximo */}
              <button
                onClick={handleSkip}
                title="SKIP — Carregar próximo na fila"
                className="flex flex-col items-center gap-1 px-5 py-3.5 rounded-2xl bg-[var(--bg-overlay)] hover:bg-[var(--bg-overlay-2)] border border-[var(--border-light)] transition-all duration-300 active:scale-[0.95] group"
              >
                <SkipForward className="h-5 w-5 text-zinc-400 group-hover:text-white transition-colors" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400">SKIP</span>
              </button>
            </div>

            {/* Legenda dos controles */}
            <div className="flex items-center justify-center gap-6 pt-2 border-t border-[var(--border-subtle)]/50">
              <span className="text-[9px] text-zinc-700 uppercase tracking-widest">CUE = Início</span>
              <span className="text-[9px] text-zinc-700 uppercase tracking-widest font-bold">TAKE [Espaço] = Preview → Ar</span>
              <span className="text-[9px] text-zinc-700 uppercase tracking-widest">SKIP = Próximo na fila</span>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{ __html: `
            ::-webkit-scrollbar { width: 5px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: #1e1e1e; border-radius: 10px; }
            ::-webkit-scrollbar-thumb:hover { background: var(--border-medium); }
          `}} />
        </div>
      </div>
    </div>
  );
}

function codecBadgeClass(codec: LocalVideoFile["codec"]): string {
  switch (codec) {
    case "H.264":          return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    case "H.265/HEVC":     return "text-blue-400 bg-blue-500/10 border-blue-500/30";
    case "AV1":            return "text-purple-400 bg-purple-500/10 border-purple-500/30";
    case "Verificando...": return "text-zinc-400 bg-zinc-700/40 border-zinc-600/30";
    case "Erro":           return "text-red-400 bg-red-500/10 border-red-500/30";
    default:               return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
  }
}
