import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { R as Route, d as db } from "./router-NcdNWgek.js";
import { toast } from "sonner";
import { MonitorPlay, Timer, Type, MoveVertical, FlipHorizontal, RotateCcw, Pause, Play, Maximize, HelpCircle, BookOpen, Minimize, X, Keyboard, Touchpad, Zap } from "lucide-react";
import { B as Button } from "./button-DWfIo_Ug.js";
import { c as cn } from "./utils-H80jjgLf.js";
import { p as parseTimeToSeconds } from "./time-Cm8BP1Rm.js";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "@neondatabase/serverless";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
const PROGRAMAS = ["Todos", "Jornal da Manhã", "Edição Meio-Dia", "Jornal da Noite"];
function InstructionsModal({
  isOpen,
  onClose
}) {
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 rounded-2xl border border-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "sticky top-0 bg-zinc-950 border-b border-zinc-800 p-6 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(HelpCircle, { className: "h-6 w-6 text-primary" }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-white", children: "Guia de Atalhos" })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "p-2 hover:bg-zinc-800 rounded-lg transition-colors", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsx(Keyboard, { className: "h-5 w-5 text-blue-400" }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-white", children: "Atalhos de Teclado" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3 bg-zinc-800/30 rounded-lg p-4 border border-zinc-700", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-blue-500/20 text-blue-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "F" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Fullscreen" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Ativa/desativa tela cheia" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-purple-500/20 text-purple-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "C" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Camera (Câmera)" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Alterna para modo câmera" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "M" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Master" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Alterna para modo master" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "Espaço" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Play / Pause" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Inicia ou pausa o scroll automático" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-orange-500/20 text-orange-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "E" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Espelhar" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Inverte a imagem horizontalmente" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "border-t border-zinc-700 pt-3 mt-3", children: /* @__PURE__ */ jsx("p", { className: "text-zinc-300 text-xs mb-3 font-semibold", children: "AJUSTES RÁPIDOS:" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "←" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Diminuir Fonte" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Reduz -5px (mín: 50px)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "→" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Aumentar Fonte" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Aumenta +5px (máx: 180px)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "↑" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Diminuir Velocidade" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Reduz -0.5 (mín: 0.5)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "↓" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Aumentar Velocidade" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Aumenta +0.5 (máx: 15)" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsx(Touchpad, { className: "h-5 w-5 text-cyan-400" }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-white", children: "Gestos no Celular" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3 bg-zinc-800/30 rounded-lg p-4 border border-zinc-700", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "👆 Duplo" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Fullscreen" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Duplo toque para ativar/desativar" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-purple-500/20 text-purple-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "↗️ Diagonal ↑" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Master" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Deslizar diagonal para cima" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "↙️ Diagonal ↓" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Camera (Câmera)" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Deslizar diagonal para baixo" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "👇 Toque" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Play / Pause" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Toque simples na tela" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "↔️ Arrastar" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Espelhar" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Toque + arrastar para a esquerda" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsx(Zap, { className: "h-5 w-5 text-yellow-400" }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-white", children: "💡 Dicas Rápidas" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-yellow-200 text-sm", children: [
            "📊 ",
            /* @__PURE__ */ jsx("strong", { children: "Barra de progresso" }),
            " mostra o andamento do programa"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-yellow-200 text-sm", children: [
            "📱 ",
            /* @__PURE__ */ jsx("strong", { children: "Totalmente responsivo" }),
            " — funciona perfeitamente em celular"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-yellow-200 text-sm", children: [
            "⚡ ",
            /* @__PURE__ */ jsx("strong", { children: "Use as setas" }),
            " para ajustar fonte e velocidade rapidamente"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "sticky bottom-0 bg-zinc-950 border-t border-zinc-800 p-4 flex justify-end gap-3", children: /* @__PURE__ */ jsx("button", { onClick: onClose, className: "px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold transition-colors", children: "Fechar" }) })
  ] }) });
}
function ReadingMonitor({
  isOpen,
  onClose,
  content
}) {
  const monitorScrollRef = useRef(null);
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxs("div", { className: "fixed bottom-4 left-4 z-[200] w-96 h-64 bg-zinc-900/90 backdrop-blur-md border border-zinc-700 rounded-xl shadow-2xl flex flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 bg-zinc-950/50 border-b border-zinc-800", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(BookOpen, { className: "h-4 w-4 text-primary" }),
        /* @__PURE__ */ jsx("h3", { className: "text-xs font-bold uppercase tracking-wider", children: "Monitor de Leitura" })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "p-1.5 hover:bg-zinc-800 rounded-md transition-colors", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsx("div", { ref: monitorScrollRef, className: "flex-1 overflow-y-auto p-4 no-scrollbar", style: {
      lineHeight: 1.5,
      textAlign: "center",
      scrollBehavior: "smooth"
    }, children: content ? /* @__PURE__ */ jsx(
      "div",
      {
        className: "whitespace-pre-wrap text-xs uppercase font-bold tracking-wider",
        children: content
      }
    ) : /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full text-zinc-600 italic text-sm", children: "Aguardando texto..." }) })
  ] });
}
function TeleprompterPage() {
  const searchParams = Route.useSearch();
  const [date, setDate] = useState(searchParams.date || "");
  const [programa, setPrograma] = useState(searchParams.programa ? decodeURIComponent(searchParams.programa) : "Todos");
  const [items, setItems] = useState([]);
  const [blocos, setBlocos] = useState([]);
  const [fontSize, setFontSize] = useState(90);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const [isScrolling, setIsScrolling] = useState(false);
  const [mirrored, setMirrored] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalProgress, setTotalProgress] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [syncMode, setSyncMode] = useState("master");
  const [showReadingMonitor, setShowReadingMonitor] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const lastBroadcastTimeRef = useRef(0);
  const rodaTvRef = useRef(null);
  const scrollRef = useRef(null);
  const requestRef = useRef();
  const isRemoteUpdateRef = useRef(false);
  const rodaTvFiredRef = useRef(null);
  const touchStartRef = useRef({
    x: 0,
    y: 0,
    time: 0
  });
  const doubleClickTimerRef = useRef();
  useEffect(() => {
    if (searchParams.date) {
      setDate(searchParams.date);
    } else if (!date) {
      const n = /* @__PURE__ */ new Date();
      setDate(`${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`);
    }
    if (searchParams.programa) setPrograma(decodeURIComponent(searchParams.programa));
  }, [searchParams.date, searchParams.programa]);
  const loadItems = useCallback(async () => {
    if (!date) return;
    const programaNorm = decodeURIComponent(programa || "Todos").trim().toLowerCase();
    const {
      data: allBlocks,
      error: bErr
    } = await db.from("espelho_blocos").select("id, nome, ordem, apresentador, programa").eq("data_edicao", date).order("ordem");
    if (bErr) {
      toast.error("Erro ao carregar blocos: " + bErr.message);
      return;
    }
    const blocks = programaNorm === "todos" ? allBlocks ?? [] : (allBlocks ?? []).filter((b) => (b.programa ?? "").toLowerCase().trim() === programaNorm);
    if (blocks.length > 0) {
      setBlocos(blocks);
      const {
        data: rawItens,
        error: iErr
      } = await db.from("espelho_itens").select("id, bloco_id, assunto, cabeca, ordem, status, tempo_cab, materia_id").in("bloco_id", blocks.map((b) => b.id)).order("ordem");
      if (iErr) toast.error("Erro ao carregar matérias: " + iErr.message);
      const seq = [];
      blocks.forEach((block) => {
        (rawItens || []).filter((i) => i.bloco_id === block.id).sort((a, b) => a.ordem - b.ordem).forEach((i) => seq.push(i));
      });
      const materiaIds = seq.filter((i) => i.materia_id && !i.cabeca).map((i) => i.materia_id);
      if (materiaIds.length > 0) {
        const {
          data: mats
        } = await db.from("materias").select("id, cabeca").in("id", materiaIds);
        if (mats) {
          const map = Object.fromEntries(mats.map((m) => [m.id, m.cabeca]));
          seq.forEach((item) => {
            if (item.materia_id && !item.cabeca && map[item.materia_id]) item.cabeca = map[item.materia_id];
          });
        }
      }
      setItems(seq);
    } else {
      setItems([]);
      setBlocos([]);
    }
  }, [date, programa]);
  useEffect(() => {
    if (items.length === 0) {
      setSelectedItemId(null);
    } else {
      setSelectedItemId((prev) => {
        if (!prev || !items.some((i) => i.id === prev)) return items[0].id;
        return prev;
      });
    }
  }, [items]);
  useEffect(() => {
    const interval = setInterval(() => {
      loadItems();
    }, 3e4);
    return () => clearInterval(interval);
  }, [loadItems]);
  useEffect(() => {
  }, []);
  useEffect(() => {
    loadItems();
  }, [date, programa]);
  useEffect(() => {
    if (syncMode !== "camera") return;
    setIsConnected(true);
    const interval = setInterval(async () => {
      const key = `tp-sync-${programa || "geral"}`;
      const {
        data,
        error
      } = await db.from("tp_master_state").select("*").eq("canal", key).maybeSingle();
      if (error || !data) return;
      const payload = data.state;
      isRemoteUpdateRef.current = true;
      if (payload.selectedItemId !== void 0 && payload.selectedItemId !== selectedItemId) setSelectedItemId(payload.selectedItemId);
      if (payload.isScrolling !== void 0) setIsScrolling(payload.isScrolling);
      if (payload.fontSize !== void 0) setFontSize(payload.fontSize);
      if (payload.scrollSpeed !== void 0) setScrollSpeed(payload.scrollSpeed);
      if (payload.mirrored !== void 0) setMirrored(payload.mirrored);
      if (payload.scrollTop !== void 0 && scrollRef.current) scrollRef.current.scrollTop = payload.scrollTop;
      setTimeout(() => {
        isRemoteUpdateRef.current = false;
      }, 100);
    }, 1500);
    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [syncMode, programa, selectedItemId]);
  const syncStateRef = useRef({
    selectedItemId,
    isScrolling,
    fontSize,
    scrollSpeed,
    mirrored,
    syncMode,
    programa
  });
  useEffect(() => {
    syncStateRef.current = {
      selectedItemId,
      isScrolling,
      fontSize,
      scrollSpeed,
      mirrored,
      syncMode,
      programa
    };
  }, [selectedItemId, isScrolling, fontSize, scrollSpeed, mirrored, syncMode, programa]);
  const doUpsert = useCallback(async () => {
    const s = syncStateRef.current;
    if (s.syncMode !== "master") return;
    const now = Date.now();
    if (now - lastBroadcastTimeRef.current < 2e3) return;
    lastBroadcastTimeRef.current = now;
    const key = `tp-sync-${s.programa || "geral"}`;
    await db.from("tp_master_state").upsert({
      canal: key,
      state: {
        selectedItemId: s.selectedItemId,
        isScrolling: s.isScrolling,
        fontSize: s.fontSize,
        scrollSpeed: s.scrollSpeed,
        mirrored: s.mirrored,
        scrollTop: scrollRef.current?.scrollTop || 0
      },
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }, {
      onConflict: "canal"
    });
  }, []);
  useEffect(() => {
    lastBroadcastTimeRef.current = 0;
    doUpsert();
  }, [selectedItemId, isScrolling, fontSize, scrollSpeed, mirrored, doUpsert]);
  useEffect(() => {
    if (syncMode !== "master" || !isScrolling) return;
    const interval = setInterval(() => {
      doUpsert();
    }, 3e3);
    return () => clearInterval(interval);
  }, [syncMode, isScrolling, doUpsert]);
  const currentItem = items.find((i) => i.id === selectedItemId);
  const materiaAtivaIndexGlobal = useMemo(() => items.findIndex((i) => i.id === selectedItemId), [items, selectedItemId]);
  const lastSelectedId = useRef(null);
  useEffect(() => {
    if (currentItem) {
      setTimeLeft(parseTimeToSeconds(currentItem.tempo_cab));
      if (selectedItemId !== lastSelectedId.current) {
        setIsScrolling(false);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
        lastSelectedId.current = selectedItemId;
        rodaTvFiredRef.current = null;
      }
    }
  }, [selectedItemId, currentItem]);
  const calculateTotalProgress = useCallback(() => {
    if (!scrollRef.current || items.length === 0 || !selectedItemId) {
      setTotalProgress(0);
      return;
    }
    const scrollEl = scrollRef.current;
    const currentIndex = items.findIndex((i) => i.id === selectedItemId);
    if (currentIndex === -1) return;
    const scrollableHeight = scrollEl.scrollHeight - scrollEl.clientHeight;
    const scrollPct = scrollableHeight > 0 ? scrollEl.scrollTop / scrollableHeight : 1;
    const progress = (currentIndex + scrollPct) / items.length * 100;
    setTotalProgress(progress);
  }, [items, selectedItemId]);
  useEffect(() => {
    let timer;
    if (isScrolling && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1e3);
    }
    return () => clearInterval(timer);
  }, [isScrolling, timeLeft]);
  useEffect(() => {
    calculateTotalProgress();
  }, [selectedItemId, calculateTotalProgress]);
  const updateItemStatus = async (itemId, newStatus) => {
    const {
      error
    } = await db.from("espelho_itens").update({
      status: newStatus
    }).eq("id", itemId);
    if (error) console.error("Erro ao atualizar status:", error.message);
  };
  useEffect(() => {
    if (!selectedItemId) return;
    if (isScrolling) {
      updateItemStatus(selectedItemId, "no_ar");
    }
  }, [isScrolling, selectedItemId]);
  const animate = () => {
    if (!scrollRef.current || !selectedItemId) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }
    const scrollEl = scrollRef.current;
    const rodaTvEl = rodaTvRef.current;
    const currentItem2 = items.find((i) => i.id === selectedItemId);
    if (isScrolling) {
      let shouldStopScrolling = false;
      if (currentItem2?.cabeca && rodaTvEl) {
        const scrollRect = scrollEl.getBoundingClientRect();
        const rodaTvRect = rodaTvEl.getBoundingClientRect();
        const centerLine = scrollRect.top + scrollRect.height / 2;
        if (rodaTvRect.top <= centerLine) {
          if (currentItem2 && rodaTvFiredRef.current !== currentItem2.id) {
            rodaTvFiredRef.current = currentItem2.id;
            db.from("tp_playout_events").insert({
              event: "RODA_VT",
              materia_id: currentItem2.materia_id ?? null,
              assunto: currentItem2.assunto,
              item_id: currentItem2.id,
              created_at: (/* @__PURE__ */ new Date()).toISOString()
            }).then(({
              error
            }) => {
              if (error) console.error("Erro ao enviar RODA_VT:", error.message);
            });
          }
          shouldStopScrolling = true;
        }
      } else {
        const isAtAbsoluteBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight;
        if (isAtAbsoluteBottom) {
          shouldStopScrolling = true;
        }
      }
      if (shouldStopScrolling) {
        setIsScrolling(false);
        if (selectedItemId) {
          updateItemStatus(selectedItemId, "exibido").then(() => {
            const currentIndex = items.findIndex((i) => i.id === selectedItemId);
            if (currentIndex !== -1 && currentIndex < items.length - 1) {
              setSelectedItemId(items[currentIndex + 1].id);
            }
          });
        }
      } else {
        scrollEl.scrollTop += scrollSpeed;
      }
      calculateTotalProgress();
    }
    requestRef.current = requestAnimationFrame(animate);
  };
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isScrolling, scrollSpeed, selectedItemId, items]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsScrolling((prev) => !prev);
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setIsFullscreen((prev) => !prev);
      }
      if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        setSyncMode("camera");
      }
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setSyncMode("master");
      }
      if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        setMirrored((prev) => !prev);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setFontSize((prev) => {
          const newSize = Math.max(50, prev - 5);
          return newSize;
        });
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setFontSize((prev) => {
          const newSize = Math.min(180, prev + 5);
          return newSize;
        });
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setScrollSpeed((prev) => {
          const newSpeed = Math.max(0.5, prev - 0.5);
          return newSpeed;
        });
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setScrollSpeed((prev) => {
          const newSpeed = Math.min(15, prev + 0.5);
          return newSpeed;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mirrored]);
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    }
  };
  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const duration = Date.now() - touchStartRef.current.time;
    if (duration < 300 && distance < 30) {
      if (doubleClickTimerRef.current) {
        clearTimeout(doubleClickTimerRef.current);
        setIsFullscreen((prev) => !prev);
        doubleClickTimerRef.current = void 0;
      } else {
        doubleClickTimerRef.current = setTimeout(() => {
          doubleClickTimerRef.current = void 0;
        }, 300);
      }
      return;
    }
    if (dx > 50 && dy < -50) {
      setSyncMode("master");
      return;
    }
    if (dx > 50 && dy > 50) {
      setSyncMode("camera");
      return;
    }
    if (dx < -50 && Math.abs(dy) < 30) {
      setMirrored((prev) => !prev);
      return;
    }
    if (distance < 30) {
      setIsScrolling((prev) => !prev);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 bg-black text-white flex flex-col overflow-hidden select-none z-[100] font-mono", children: [
    /* @__PURE__ */ jsx(InstructionsModal, { isOpen: showInstructions, onClose: () => setShowInstructions(false) }),
    /* @__PURE__ */ jsx(ReadingMonitor, { isOpen: showReadingMonitor, onClose: () => setShowReadingMonitor(false), content: currentItem?.cabeca ?? null }),
    !isFullscreen && /* @__PURE__ */ jsxs("div", { className: "p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between z-50 shrink-0 flex-wrap gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(MonitorPlay, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsx("h1", { className: "uppercase text-xs font-bold tracking-widest text-primary", children: "TP Studio" })
        ] }),
        /* @__PURE__ */ jsx("input", { type: "date", value: date, onChange: (e) => setDate(e.target.value), className: "bg-black border border-zinc-700 rounded px-2 py-1 text-xs" }),
        /* @__PURE__ */ jsx("select", { value: programa, onChange: (e) => setPrograma(e.target.value), className: "bg-black border border-zinc-700 rounded px-2 py-1 text-xs", children: PROGRAMAS.map((p) => /* @__PURE__ */ jsx("option", { value: p, children: p }, p)) }),
        /* @__PURE__ */ jsx("div", { className: cn("px-2 py-1 rounded text-[11px] font-bold border", syncMode === "master" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-blue-500/10 border-blue-500/30 text-blue-400"), children: syncMode === "master" ? "🎙️ MASTER" : "🎥 CÂMERA" }),
        syncMode === "camera" && /* @__PURE__ */ jsx("div", { className: cn("px-2 py-1 rounded text-[11px] font-bold border", isConnected ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"), children: isConnected ? "✓ Sync" : "✗ Offline" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 bg-black/40 px-3 py-1 rounded border border-white/5 shadow-inner", children: [
          /* @__PURE__ */ jsx(Timer, { className: cn("h-4 w-4", timeLeft <= 5 && timeLeft > 0 ? "text-red-500 animate-pulse" : "text-primary") }),
          /* @__PURE__ */ jsxs("span", { className: cn("text-xl font-bold tabular-nums", timeLeft <= 5 && timeLeft > 0 ? "text-red-500" : "text-white"), children: [
            Math.floor(timeLeft / 60),
            ":",
            String(timeLeft % 60).padStart(2, "0")
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Type, { className: "h-4 w-4 text-zinc-500" }),
          /* @__PURE__ */ jsx("input", { type: "range", min: "50", max: "180", value: fontSize, onChange: (e) => setFontSize(Number(e.target.value)), className: "w-20 accent-primary" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(MoveVertical, { className: "h-4 w-4 text-zinc-500" }),
          /* @__PURE__ */ jsx("input", { type: "range", min: "0.5", max: "15", step: "0.5", value: scrollSpeed, onChange: (e) => setScrollSpeed(Number(e.target.value)), className: "w-20 accent-primary" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Button, { size: "icon", variant: mirrored ? "default" : "outline", onClick: () => setMirrored(!mirrored), className: "h-8 w-8", children: /* @__PURE__ */ jsx(FlipHorizontal, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(Button, { size: "icon", variant: "outline", onClick: () => {
            if (scrollRef.current) scrollRef.current.scrollTop = 0;
            setIsScrolling(false);
          }, className: "h-8 w-8", title: "Reiniciar", children: /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(Button, { size: "icon", onClick: () => setIsScrolling(!isScrolling), className: "h-9 w-9 rounded-full bg-primary", children: isScrolling ? /* @__PURE__ */ jsx(Pause, { className: "h-5 w-5 fill-current" }) : /* @__PURE__ */ jsx(Play, { className: "h-5 w-5 fill-current ml-0.5" }) }),
          /* @__PURE__ */ jsx(Button, { size: "icon", variant: "outline", onClick: () => setIsFullscreen(true), className: "h-8 w-8", children: /* @__PURE__ */ jsx(Maximize, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(Button, { size: "icon", variant: "outline", onClick: () => setShowInstructions(true), className: "h-8 w-8", title: "Guia de Atalhos", children: /* @__PURE__ */ jsx(HelpCircle, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(Button, { size: "icon", variant: showReadingMonitor ? "default" : "outline", onClick: () => setShowReadingMonitor((p) => !p), className: "h-8 w-8", title: "Monitor de Leitura", children: /* @__PURE__ */ jsx(BookOpen, { className: "h-4 w-4" }) })
        ] })
      ] })
    ] }),
    isFullscreen && /* @__PURE__ */ jsx("div", { className: "absolute top-6 left-6 z-[110] opacity-0 hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", onClick: () => setIsFullscreen(false), className: "bg-zinc-900/80 backdrop-blur", children: [
      /* @__PURE__ */ jsx(Minimize, { className: "h-4 w-4 mr-2" }),
      " SAIR TELA CHEIA"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex overflow-hidden", children: [
      !isFullscreen && /* @__PURE__ */ jsxs("aside", { className: "w-80 bg-zinc-950 border-r border-zinc-800 overflow-y-auto flex flex-col shrink-0", children: [
        /* @__PURE__ */ jsx("div", { className: "p-4 border-b border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 font-bold", children: "Roteiro do Jornal" }),
        blocos.length === 0 && /* @__PURE__ */ jsxs("div", { className: "p-8 text-center text-zinc-600 text-xs italic", children: [
          "Nenhum bloco encontrado para ",
          programa,
          " nesta data."
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 divide-y divide-zinc-900", children: (() => {
          let globalCounter = 0;
          return blocos.map((b) => {
            const blockItems = items.filter((i) => i.bloco_id === b.id);
            const startIdx = globalCounter;
            globalCounter += blockItems.length;
            return /* @__PURE__ */ jsxs("div", { className: "p-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "px-3 py-1 text-[9px] text-primary/40 uppercase font-bold sticky top-0 bg-zinc-950/90 backdrop-blur-sm z-10", children: [
                "BLOCO ",
                b.ordem,
                " — ",
                b.nome
              ] }),
              blockItems.map((item, idx) => {
                const absoluteIndex = startIdx + idx;
                const isPast = absoluteIndex < materiaAtivaIndexGlobal;
                const isCurrent = absoluteIndex === materiaAtivaIndexGlobal;
                return /* @__PURE__ */ jsxs("button", { disabled: isPast, onClick: () => {
                  setSelectedItemId(item.id);
                  if (scrollRef.current) scrollRef.current.scrollTop = 0;
                  setIsScrolling(false);
                }, className: cn("w-full text-left px-3 py-2 rounded-md transition-all text-xs uppercase font-bold tracking-wider flex items-center justify-between group", isCurrent ? "bg-primary/20 text-primary border border-primary/30" : "text-zinc-400 hover:bg-zinc-900", item.status === "no_ar" && "text-red-500 bg-red-500/5", (item.status === "exibido" || isPast) && "text-emerald-500/40 opacity-40 grayscale pointer-events-none cursor-not-allowed", isCurrent && "cursor-pointer"), children: [
                  /* @__PURE__ */ jsxs("span", { className: "truncate flex-1", children: [
                    /* @__PURE__ */ jsxs("span", { className: "opacity-30 mr-2", children: [
                      absoluteIndex + 1,
                      "."
                    ] }),
                    item.assunto
                  ] }),
                  !item.cabeca && /* @__PURE__ */ jsx("span", { className: "text-[8px] text-zinc-600 ml-2", children: "(SEM TEXTO)" })
                ] }, item.id);
              }),
              blockItems.length === 0 && /* @__PURE__ */ jsx("div", { className: "px-3 py-2 text-[10px] text-zinc-700 italic", children: "Bloco sem matérias vinculadas" })
            ] }, b.id);
          });
        })() })
      ] }),
      /* @__PURE__ */ jsx("div", { ref: scrollRef, onTouchStart: handleTouchStart, onTouchEnd: handleTouchEnd, className: cn("flex-1 overflow-y-auto px-10 sm:px-20 py-[45vh] cursor-pointer no-scrollbar relative", mirrored && "scale-x-[-1]"), onClick: () => setIsScrolling(!isScrolling), style: {
        fontSize: `${fontSize}px`,
        scrollBehavior: "auto"
      }, children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto uppercase font-bold text-center", children: [
        currentItem ? /* @__PURE__ */ jsxs("div", { className: "space-y-16", children: [
          /* @__PURE__ */ jsx("div", { className: "text-emerald-400 text-5xl tracking-wider text-center border-b-2 border-emerald-500/20 pb-6 mb-12", children: currentItem.assunto }),
          (() => {
            const bl = blocos.find((b) => b.id === currentItem.bloco_id);
            return bl?.apresentador && /* @__PURE__ */ jsxs("div", { className: "text-amber-400 text-center mb-12 text-6xl font-black border-2 border-amber-500/20 py-4 rounded-xl bg-amber-500/10", children: [
              "[",
              bl.apresentador,
              "]"
            ] });
          })(),
          currentItem.cabeca ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { className: "whitespace-pre-wrap leading-[1.25]", children: currentItem.cabeca }),
            /* @__PURE__ */ jsx("div", { ref: rodaTvRef, className: "text-emerald-400 text-center mt-16 text-6xl font-black border-4 border-emerald-500/30 py-6 rounded-2xl bg-emerald-500/10", children: "[RODA TV]" })
          ] }) : /* @__PURE__ */ jsx("div", { className: "text-zinc-700 italic text-2xl text-center py-20", children: "Matéria sem texto de cabeça cadastrado." })
        ] }) : /* @__PURE__ */ jsx("div", { className: "text-zinc-700 italic text-2xl font-mono text-center", children: items.length === 0 ? "Aguardando textos do espelho..." : "Selecione uma matéria no roteiro lateral." }),
        items.length > 0 && /* @__PURE__ */ jsx("div", { className: "h-[50vh] flex items-center justify-center text-zinc-900 font-mono text-sm uppercase tracking-widest", children: "Fim do programa" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "fixed left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-between px-2 z-40 opacity-50", children: [
      /* @__PURE__ */ jsx("div", { className: "w-6 h-1.5 bg-primary/60 rounded-r-full" }),
      /* @__PURE__ */ jsx("div", { className: "w-6 h-1.5 bg-primary/60 rounded-l-full" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "fixed bottom-0 left-0 w-full h-2 bg-zinc-900/80 backdrop-blur-sm z-[110] border-t border-white/5", children: [
      /* @__PURE__ */ jsx("div", { className: "h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-100 ease-out", style: {
        width: `${totalProgress}%`
      } }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex pointer-events-none", children: blocos.map((b, i) => /* @__PURE__ */ jsx("div", { className: "flex-1 border-r border-white/20 last:border-r-0 h-full" }, b.id)) })
    ] }),
    /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: {
      __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `
    } })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsx(TeleprompterPage, {});
export {
  SplitComponent as component
};
