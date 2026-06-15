import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";

export const Route = createFileRoute("/playout-pgm")({
  component: PlayoutPgmPage,
  head: () => ({ meta: [{ title: "PGM OUT — DeskNews" }] }),
});

declare global {
  interface FileSystemHandle { kind: "file" | "directory"; name: string; }
  interface FileSystemFileHandle extends FileSystemHandle {
    kind: "file";
    getFile(): Promise<File>;
  }
  interface FileSystemDirectoryHandle extends FileSystemHandle {
    kind: "directory";
    getFileHandle(name: string): Promise<FileSystemFileHandle>;
    entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
  }
  interface Window {
    showDirectoryPicker: (opts?: { mode?: "read" | "readwrite" }) => Promise<FileSystemDirectoryHandle>;
  }
}

interface GcState {
  visible: boolean;
  line1: string;
  line2: string;
}

interface TarjaState {
  visible: boolean;
}

// ── Troque pelo IP do PC do operador na rede local ──────────────────────────
// Exemplos:
//   "ws://192.168.1.100:4242"
//   "ws://10.0.0.5:4242"
// Se estiver testando na mesma máquina, pode deixar "ws://localhost:4242"
const WS_URL = "ws://localhost:4242";
// ────────────────────────────────────────────────────────────────────────────

function PlayoutPgmPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dirHandleRef = useRef<FileSystemDirectoryHandle | null>(null);
  const blobUrlCacheRef = useRef<Map<string, string>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);

  const [dirReady, setDirReady] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gc, setGc] = useState<GcState>({ visible: false, line1: "", line2: "" });
  const [tarja, setTarja] = useState<TarjaState>({ visible: false });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "playing">("idle");
  const [connected, setConnected] = useState(false);

  // ── Vincular pasta ──
  const handleSelectDir = async () => {
    try {
      const handle = await window.showDirectoryPicker({ mode: "read" });
      dirHandleRef.current = handle;
      setDirReady(true);
    } catch (err: any) {
      if (err.name !== "AbortError") console.error(err);
    }
  };

  // ── Carregar arquivo por nome ──
  const loadFile = useCallback(async (fileName: string) => {
    if (!dirHandleRef.current) return;
    setStatus("loading");
    setCurrentFileName(fileName);

    try {
      let blobUrl = blobUrlCacheRef.current.get(fileName);
      if (!blobUrl) {
        const fh = await dirHandleRef.current.getFileHandle(fileName);
        const file = await fh.getFile();
        blobUrl = URL.createObjectURL(file);
        blobUrlCacheRef.current.set(fileName, blobUrl);
      }

      const v = videoRef.current;
      if (!v) return;
      v.src = blobUrl;
      v.load();
      v.oncanplay = () => {
        setStatus("ready");
        v.play().then(() => {
          setIsPlaying(true);
          setStatus("playing");
        }).catch(() => {});
        v.oncanplay = null;
      };
    } catch (err) {
      console.error("Erro ao carregar arquivo:", err);
      setStatus("idle");
    }
  }, []);

  // ── WebSocket — recebe eventos do playout principal ──
  useEffect(() => {
    let retryTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        console.log("[WS] Conectado ao relay server");
      };

      ws.onclose = () => {
        setConnected(false);
        console.warn("[WS] Desconectado. Tentando reconectar em 3s...");
        retryTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error("[WS] Erro:", err);
      };

      ws.onmessage = (e) => {
        let msg: Record<string, any>;
        try {
          msg = JSON.parse(e.data);
        } catch {
          return;
        }

        const v = videoRef.current;

        switch (msg.type) {
          case "pgm_take":
            if (dirHandleRef.current && msg.fileName) {
              loadFile(msg.fileName);
            }
            setIsPlaying(true);
            setStatus("playing");
            break;

          case "pgm_play":
            if (v) {
              if (msg.currentTime !== undefined && Math.abs(v.currentTime - msg.currentTime) > 1) {
                v.currentTime = msg.currentTime;
              }
              v.play().catch(() => {});
            }
            setIsPlaying(true);
            setStatus("playing");
            break;

          case "pgm_pause":
            if (v) v.pause();
            setIsPlaying(false);
            setStatus("ready");
            break;

          case "pgm_stop":
            if (v) { v.pause(); v.currentTime = 0; }
            setIsPlaying(false);
            setStatus("ready");
            break;

          case "pgm_sync":
            if (v && msg.currentTime !== undefined && Math.abs(v.currentTime - msg.currentTime) > 1.5) {
              v.currentTime = msg.currentTime;
            }
            break;

          case "gc_show":
            setGc({ visible: true, line1: msg.line1 || "", line2: msg.line2 || "" });
            break;

          case "gc_hide":
            setGc({ visible: false, line1: "", line2: "" });
            break;

          case "tarja_show":
            setTarja({ visible: true });
            break;

          case "tarja_hide":
            setTarja({ visible: false });
            break;
        }
      };
    };

    connect();

    return () => {
      clearTimeout(retryTimeout);
      wsRef.current?.close();
      setConnected(false);
    };
  }, [loadFile]);

  // ── Fullscreen ──
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") toggleFullscreen();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#000", color: "#fff" }}
    >
      {/* ── Vídeo principal fullscreen ── */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-contain"
        playsInline
        preload="auto"
        onEnded={() => { setIsPlaying(false); setStatus("ready"); }}
      />

      {/* ── GC — Lower Third ── */}
      {gc.visible && (gc.line1 || gc.line2) && (
        <div
          className="absolute bottom-0 left-0 right-0 z-40 px-6 pb-8"
          style={{ animation: "slideUp 0.3s ease-out" }}
        >
          <div className="flex items-stretch overflow-hidden rounded-md max-w-2xl shadow-2xl">
            <div className="w-1.5 shrink-0" style={{ backgroundColor: "#dc2626" }} />
            <div className="px-5 py-3 flex-1 min-w-0" style={{ backgroundColor: "rgba(0,0,0,0.92)" }}>
              {gc.line1 && (
                <div className="font-bold uppercase tracking-wide leading-tight truncate" style={{ fontSize: "18px", color: "#fff" }}>
                  {gc.line1}
                </div>
              )}
              {gc.line2 && (
                <div className="uppercase tracking-widest truncate mt-0.5" style={{ fontSize: "12px", color: "#a1a1aa" }}>
                  {gc.line2}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tarja (quando ativo) ── */}
      {tarja.visible && (
        <div className="absolute bottom-24 left-6 z-50 px-4 py-1.5 rounded-sm" style={{ backgroundColor: "rgba(220,38,38,0.85)", borderLeft: "3px solid #fff" }}>
          <span className="font-bold uppercase tracking-widest text-white" style={{ fontSize: "14px" }}>● AO VIVO</span>
        </div>
      )}

      {/* ── UI de controle (some no fullscreen) ── */}
      {!isFullscreen && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          {/* Header de status */}
          <div
            className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 pointer-events-auto"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: connected ? "#22c55e" : "#71717a",
                    boxShadow: connected ? "0 0 8px #22c55e" : "none",
                    animation: connected && isPlaying ? "pulse 2s infinite" : "none",
                  }}
                />
                <span className="font-mono font-bold uppercase tracking-widest" style={{ fontSize: "11px", color: "#a1a1aa" }}>
                  DESKNEWS · PGM OUT
                </span>
              </div>

              {currentFileName && (
                <span className="font-mono" style={{ fontSize: "10px", color: "#52525b" }}>
                  {currentFileName.replace(/\.(mp4|mov)$/i, "")}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Status de conexão WS */}
              <div
                className="px-3 py-1 rounded-full font-bold uppercase tracking-widest"
                style={{
                  fontSize: "9px",
                  backgroundColor: connected ? "rgba(34,197,94,0.12)" : "rgba(113,113,122,0.15)",
                  border: `1px solid ${connected ? "rgba(34,197,94,0.3)" : "rgba(113,113,122,0.3)"}`,
                  color: connected ? "#22c55e" : "#71717a",
                }}
              >
                {connected ? "⬤ WS ONLINE" : "○ WS OFFLINE"}
              </div>

              {/* Status pill */}
              <div
                className="px-3 py-1 rounded-full font-bold uppercase tracking-widest"
                style={{
                  fontSize: "9px",
                  backgroundColor: isPlaying ? "rgba(220,38,38,0.15)" : "rgba(113,113,122,0.15)",
                  border: `1px solid ${isPlaying ? "rgba(220,38,38,0.4)" : "rgba(113,113,122,0.3)"}`,
                  color: isPlaying ? "#dc2626" : "#71717a",
                  animation: isPlaying ? "pulse 2s infinite" : "none",
                }}
              >
                {isPlaying ? "● NO AR" : status === "loading" ? "CARREGANDO..." : "IDLE"}
              </div>

              {/* Fullscreen button */}
              <button
                onClick={toggleFullscreen}
                className="px-4 py-2 rounded-xl font-bold uppercase tracking-widest transition-all active:scale-95"
                style={{
                  fontSize: "10px",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#e4e4e7",
                }}
              >
                ⛶ FULLSCREEN (F)
              </button>
            </div>
          </div>

          {/* Overlay central quando idle */}
          {!currentFileName && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 pointer-events-auto">
              {!dirReady ? (
                <>
                  <div style={{ textAlign: "center" }}>
                    <div className="font-mono font-bold uppercase tracking-widest mb-2" style={{ fontSize: "13px", color: "#52525b" }}>
                      PGM OUT — MONITOR DA TV
                    </div>
                    <div className="font-mono" style={{ fontSize: "11px", color: "#3f3f46" }}>
                      Vincule a mesma pasta de VTs do playout principal
                    </div>
                    <div className="font-mono mt-2" style={{ fontSize: "10px", color: "#27272a" }}>
                      Relay WS: <span style={{ color: connected ? "#22c55e" : "#ef4444" }}>{WS_URL}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleSelectDir}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold uppercase tracking-widest transition-all active:scale-95"
                    style={{
                      fontSize: "12px",
                      backgroundColor: "rgba(234,179,8,0.15)",
                      border: "1px solid rgba(234,179,8,0.3)",
                      color: "#eab308",
                    }}
                  >
                    📁 VINCULAR PASTA DE VTs
                  </button>
                  <div style={{ fontSize: "10px", color: "#27272a", fontFamily: "monospace", textAlign: "center" }}>
                    Abra esta página na TV · pressione F para fullscreen
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div
                    className="font-mono font-bold uppercase tracking-widest"
                    style={{ fontSize: "13px", color: "#52525b" }}
                  >
                    {connected ? "Aguardando sinal do playout..." : "Conectando ao relay server..."}
                  </div>
                  <div className="font-mono mt-2" style={{ fontSize: "10px", color: "#3f3f46" }}>
                    {connected ? "Acione TAKE ou TRANS no playout principal" : WS_URL}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botão vincular/trocar pasta */}
          <div className="absolute bottom-6 left-6 pointer-events-auto">
            <button
              onClick={handleSelectDir}
              className="px-4 py-2 rounded-xl font-bold uppercase tracking-widest transition-all"
              style={{ fontSize: "9px", color: dirReady ? "#3f3f46" : "#52525b", border: "1px solid #27272a", backgroundColor: "transparent" }}
            >
              📁 {dirReady ? "Trocar pasta" : "Vincular Pasta"}
            </button>
          </div>
        </div>
      )}

      {/* NO AR badge no fullscreen */}
      {isFullscreen && isPlaying && (
        <div
          className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full font-bold uppercase tracking-widest"
          style={{
            fontSize: "10px",
            backgroundColor: "rgba(220,38,38,0.9)",
            color: "#fff",
            animation: "pulse 2s infinite",
          }}
        >
          <span className="h-2 w-2 rounded-full bg-white inline-block" style={{ animation: "pulse 1s infinite" }} />
          NO AR
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
        ::-webkit-scrollbar { display: none; }
      ` }} />
    </div>
  );
}
