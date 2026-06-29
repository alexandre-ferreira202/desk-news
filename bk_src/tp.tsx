import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  MonitorPlay, 
  Play, 
  Pause, 
  RotateCcw, 
  Type, 
  MoveVertical, 
  FlipHorizontal,
  Maximize,
  Minimize,
  X,
  Timer,
  Clock,
  Settings as SettingsIcon,
  HelpCircle,
  Keyboard,
  Touchpad,
  Zap
} from "lucide-react"; // Adicionado BookOpen
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { parseTimeToSeconds } from "@/lib/time";

export const Route = createFileRoute("/tp")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      date: (search.date as string) || undefined,
      programa: (search.programa as string) || undefined,
    };
  },
  component: () => <TeleprompterPage />,
  head: () => ({ meta: [{ title: "Teleprompter — DeskNews" }] }),
});

interface TPItem {
  id: string;
  bloco_id: string;
  assunto: string;
  cabeca: string | null;
  ordem: number;
  status: string;
  tempo_cab: string | null;
  materia_id: string | null;
}

interface Bloco {
  id: string;
  nome: string;
  ordem: number;
  apresentador: string | null;
  programa?: string;
}

const PROGRAMAS = ["Todos", "Jornal da Manhã", "Edição Meio-Dia", "Jornal da Noite"] as const;

// ─────────────────────────────────────────────────────────────────────────────
// MODAL DE INSTRUÇÕES
// ─────────────────────────────────────────────────────────────────────────────
function InstructionsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-white">Guia de Atalhos</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-8">
          {/* SEÇÃO: TECLADO */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Keyboard className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Atalhos de Teclado</h3>
            </div>
            <div className="space-y-3 bg-zinc-800/30 rounded-lg p-4 border border-zinc-700">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit">
                  F
                </div>
                <div>
                  <p className="text-white font-semibold">Fullscreen</p>
                  <p className="text-zinc-400 text-sm">Ativa/desativa tela cheia</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit">
                  C
                </div>
                <div>
                  <p className="text-white font-semibold">Camera (Câmera)</p>
                  <p className="text-zinc-400 text-sm">Alterna para modo câmera</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit">
                  M
                </div>
                <div>
                  <p className="text-white font-semibold">Master</p>
                  <p className="text-zinc-400 text-sm">Alterna para modo master</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit">
                  Espaço
                </div>
                <div>
                  <p className="text-white font-semibold">Play / Pause</p>
                  <p className="text-zinc-400 text-sm">Inicia ou pausa o scroll automático</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit">
                  E
                </div>
                <div>
                  <p className="text-white font-semibold">Espelhar</p>
                  <p className="text-zinc-400 text-sm">Inverte a imagem horizontalmente</p>
                </div>
              </div>

              <div className="border-t border-zinc-700 pt-3 mt-3">
                <p className="text-zinc-300 text-xs mb-3 font-semibold">AJUSTES RÁPIDOS:</p>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit">
                  ← 
                </div>
                <div>
                  <p className="text-white font-semibold">Diminuir Fonte</p>
                  <p className="text-zinc-400 text-sm">Reduz -5px (mín: 50px)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit">
                  → 
                </div>
                <div>
                  <p className="text-white font-semibold">Aumentar Fonte</p>
                  <p className="text-zinc-400 text-sm">Aumenta +5px (máx: 180px)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit">
                  ↑ 
                </div>
                <div>
                  <p className="text-white font-semibold">Diminuir Velocidade</p>
                  <p className="text-zinc-400 text-sm">Reduz -0.5 (mín: 0.5)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit">
                  ↓ 
                </div>
                <div>
                  <p className="text-white font-semibold">Aumentar Velocidade</p>
                  <p className="text-zinc-400 text-sm">Aumenta +0.5 (máx: 15)</p>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO: GESTOS TOUCH */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Touchpad className="h-5 w-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Gestos no Celular</h3>
            </div>
            <div className="space-y-3 bg-zinc-800/30 rounded-lg p-4 border border-zinc-700">
              <div className="flex items-start gap-4">
                <div className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit">
                  👆 Duplo
                </div>
                <div>
                  <p className="text-white font-semibold">Fullscreen</p>
                  <p className="text-zinc-400 text-sm">Duplo toque para ativar/desativar</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit">
                  ↗️ Diagonal ↑
                </div>
                <div>
                  <p className="text-white font-semibold">Master</p>
                  <p className="text-zinc-400 text-sm">Deslizar diagonal para cima</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit">
                  ↙️ Diagonal ↓
                </div>
                <div>
                  <p className="text-white font-semibold">Camera (Câmera)</p>
                  <p className="text-zinc-400 text-sm">Deslizar diagonal para baixo</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit">
                  👇 Toque
                </div>
                <div>
                  <p className="text-white font-semibold">Play / Pause</p>
                  <p className="text-zinc-400 text-sm">Toque simples na tela</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit">
                  ↔️ Arrastar
                </div>
                <div>
                  <p className="text-white font-semibold">Espelhar</p>
                  <p className="text-zinc-400 text-sm">Toque + arrastar para a esquerda</p>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO: DICAS */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-yellow-400" />
              <h3 className="text-lg font-bold text-white">💡 Dicas Rápidas</h3>
            </div>
            <div className="space-y-2 bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
              <p className="text-yellow-200 text-sm">
                📊 <strong>Barra de progresso</strong> mostra o andamento do programa
              </p>
              <p className="text-yellow-200 text-sm">
                📱 <strong>Totalmente responsivo</strong> — funciona perfeitamente em celular
              </p>
              <p className="text-yellow-200 text-sm">
                ⚡ <strong>Use as setas</strong> para ajustar fonte e velocidade rapidamente
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-zinc-950 border-t border-zinc-800 p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function ReadingMonitor({
  isOpen,
  onClose,
  content,
}: {
  isOpen: boolean;
  onClose: () => void;
  content: string | null;
}) {
  const monitorScrollRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[200] w-96 h-64 bg-zinc-900/90 backdrop-blur-md border border-zinc-700 rounded-xl shadow-2xl flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-zinc-950/50 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider">Monitor de Leitura</h3>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={monitorScrollRef}
        className="flex-1 overflow-y-auto p-4 no-scrollbar"
        style={{ lineHeight: 1.5, textAlign: "center", scrollBehavior: 'smooth' }}
      >
        {content ? (
          <div
            className="whitespace-pre-wrap text-xs uppercase font-bold tracking-wider"
            // O texto aqui não é espelhado e agora segue o padrão da sidebar
          >
            {content}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-600 italic text-sm">
            Aguardando texto...
          </div>
        )}
      </div>
    </div>
  );
}

function TeleprompterPage() {
  const searchParams = Route.useSearch();
  const [date, setDate] = useState(searchParams.date || "");
  const [programa, setPrograma] = useState(
    searchParams.programa ? decodeURIComponent(searchParams.programa) : "Todos"
  );
  const [items, setItems] = useState<TPItem[]>([]);
  const [blocos, setBlocos] = useState<Bloco[]>([]);
  const [fontSize, setFontSize] = useState(90);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const [isScrolling, setIsScrolling] = useState(false);
  const [mirrored, setMirrored] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalProgress, setTotalProgress] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [syncMode, setSyncMode] = useState<"master" | "camera">("master");
  const [showReadingMonitor, setShowReadingMonitor] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastBroadcastTime, setLastBroadcastTime] = useState(0);
  const rodaTvRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const channelRef = useRef<any>(null);
  const isRemoteUpdateRef = useRef(false);
  // ── Supabase Broadcast: sinal RODA_VT → Playout (cross-machine) ──────────
  const playoutChannelRef = useRef<any>(null);
  const rodaTvFiredRef = useRef<string | null>(null); // dispara apenas 1x por matéria
  const touchStartRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const doubleClickTimerRef = useRef<NodeJS.Timeout>();

  // ── Abre canal Supabase Broadcast dedicado ao sinal RODA_VT ──────────────
  useEffect(() => {
    const ch = supabase.channel("desknews_playout_sync");
    playoutChannelRef.current = ch;
    ch.subscribe();
    return () => {
      supabase.removeChannel(ch);
      playoutChannelRef.current = null;
    };
  }, []);

  // Garante data local correta após hidratação (SSR usa UTC, browser usa fuso local)
  useEffect(() => {
    if (searchParams.date) {
      setDate(searchParams.date);
    } else if (!date) {
      const n = new Date();
      setDate(`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`);
    }
    if (searchParams.programa) setPrograma(decodeURIComponent(searchParams.programa));
  }, [searchParams.date, searchParams.programa]);

  const loadItems = useCallback(async () => {
    if (!date) return;

    const programaNorm = decodeURIComponent(programa || "Todos").trim().toLowerCase();

    // Busca todos os blocos da data e filtra em memória (evita problema de collation com acentos)
    const { data: allBlocks, error: bErr } = await supabase
      .from("espelho_blocos")
      .select("id, nome, ordem, apresentador, programa")
      .eq("data_edicao", date)
      .order("ordem");

    if (bErr) { toast.error("Erro ao carregar blocos: " + bErr.message); return; }

    const blocks = programaNorm === "todos"
      ? (allBlocks ?? [])
      : (allBlocks ?? []).filter(b => (b.programa ?? "").toLowerCase().trim() === programaNorm);

    if (blocks.length > 0) {
      setBlocos(blocks as Bloco[]);

      const { data: rawItens, error: iErr } = await supabase
        .from("espelho_itens")
        .select("id, bloco_id, assunto, cabeca, ordem, status, tempo_cab, materia_id")
        .in("bloco_id", blocks.map(b => b.id))
        .order("ordem");

      if (iErr) toast.error("Erro ao carregar matérias: " + iErr.message);

      // Sequência global respeitando ordem dos blocos → ordem dos itens dentro de cada bloco
      const seq: TPItem[] = [];
      blocks.forEach(block => {
        (rawItens || [])
          .filter(i => i.bloco_id === block.id)
          .sort((a, b) => a.ordem - b.ordem)
          .forEach(i => seq.push(i as TPItem));
      });

      // Buscar cabeças das matérias vinculadas que ainda não têm texto
      const materiaIds = seq.filter(i => i.materia_id && !i.cabeca).map(i => i.materia_id as string);
      if (materiaIds.length > 0) {
        const { data: mats } = await supabase.from("materias").select("id, cabeca").in("id", materiaIds);
        if (mats) {
          const map = Object.fromEntries(mats.map(m => [m.id, m.cabeca]));
          seq.forEach(item => {
            if (item.materia_id && !item.cabeca && map[item.materia_id])
              item.cabeca = map[item.materia_id];
          });
        }
      }

      setItems(seq);
    } else {
      setItems([]);
      setBlocos([]);
    }
  }, [date, programa]);

  // Sincroniza a seleção: seleciona a primeira SOMENTE se nada estiver marcado ou o item sumiu
  // NÃO reseta se o item ainda existe (evita perder posição no reload do realtime)
  useEffect(() => {
    if (items.length === 0) {
      setSelectedItemId(null);
    } else {
      setSelectedItemId(prev => {
        if (!prev || !items.some(i => i.id === prev)) return items[0].id;
        return prev; // mantém o item atual
      });
    }
  }, [items]);

  // Realtime cirúrgico — atualiza só o que mudou, sem recarregar tudo
  useEffect(() => {
    const channel = supabase.channel('tp_sync')
      // UPDATE de item: patch só o campo que mudou, sem mexer no resto
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'espelho_itens' }, ({ new: row }) => {
        setItems(prev => {
          const idx = prev.findIndex(i => i.id === row.id);
          if (idx === -1) return prev; // item não pertence a este programa/data
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            assunto:   row.assunto   ?? next[idx].assunto,
            cabeca:    row.cabeca    ?? next[idx].cabeca,
            status:    row.status    ?? next[idx].status,
            tempo_cab: row.tempo_cab ?? next[idx].tempo_cab,
            ordem:     row.ordem     ?? next[idx].ordem,
          };
          return next;
        });
        // Se ficou no_ar no espelho → avança o TP para ele sem resetar scroll
        if (row.status === 'no_ar') {
          setSelectedItemId(prev => prev === row.id ? prev : row.id);
        }
      })
      // INSERT / DELETE / mudança de bloco → recarrega estrutura completa
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'espelho_itens' }, () => loadItems())
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'espelho_itens' }, () => loadItems())
      .on('postgres_changes', { event: '*',      schema: 'public', table: 'espelho_blocos' }, () => loadItems())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadItems]);

  // Canal espelho_sync: broadcast imediato quando modal do Espelho salva (< 100ms)
  useEffect(() => {
    const ch = supabase.channel('espelho_sync')
      .on('broadcast', { event: 'cabeca_atualizada' }, ({ payload }) => {
        const { itemId, cabeca, assunto, tempo_cab } = payload as {
          itemId: string; cabeca: string; assunto: string; tempo_cab: string;
        };
        setItems(prev => {
          const idx = prev.findIndex(i => i.id === itemId);
          if (idx === -1) return prev;
          const next = [...prev];
          next[idx] = { ...next[idx], cabeca, assunto, tempo_cab };
          return next;
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  useEffect(() => {
    loadItems();
  }, [date, programa]);

  // ─────────────────────────────────────────────────────────────────────────
  // BROADCAST MASTER → CAMERA (SUPABASE REALTIME)
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canalNome = `tp-sync-${programa || "geral"}`;
    const canal = supabase.channel(canalNome);
    channelRef.current = canal;

    canal
      .on("broadcast", { event: "tp-state" }, ({ payload }) => {
        // CAMERA: aplica estado recebido do MASTER
        if (syncMode === "camera" && payload) {
          isRemoteUpdateRef.current = true;

          if (
            payload.selectedItemId !== undefined &&
            payload.selectedItemId !== selectedItemId
          )
            setSelectedItemId(payload.selectedItemId);

          if (payload.isScrolling !== undefined)
            setIsScrolling(payload.isScrolling);
          if (payload.fontSize !== undefined) setFontSize(payload.fontSize);
          if (payload.scrollSpeed !== undefined)
            setScrollSpeed(payload.scrollSpeed);
          if (payload.mirrored !== undefined) setMirrored(payload.mirrored);
          if (payload.scrollTop !== undefined && scrollRef.current) {
            scrollRef.current.scrollTop = payload.scrollTop;
          }

          setTimeout(() => {
            isRemoteUpdateRef.current = false;
          }, 100);
        }
      })
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(canal);
    };
  }, [syncMode, selectedItemId, programa]);

  // ─────────────────────────────────────────────────────────────────────────
  // BROADCAST DO MASTER PARA OS CAMERAS
  // ─────────────────────────────────────────────────────────────────────────
  const broadcastState = useCallback(() => {
    if (syncMode !== "master" || !channelRef.current) return;

    const now = Date.now();
    if (now - lastBroadcastTime < 50) return; // throttle

    setLastBroadcastTime(now);

    channelRef.current.send({
      type: "broadcast",
      event: "tp-state",
      payload: {
        selectedItemId,
        isScrolling,
        fontSize,
        scrollSpeed,
        mirrored,
        scrollTop: scrollRef.current?.scrollTop || 0,
      },
    });
  }, [syncMode, selectedItemId, isScrolling, fontSize, scrollSpeed, mirrored, lastBroadcastTime]);

  // Broadcast quando estado muda
  useEffect(() => {
    broadcastState();
  }, [isScrolling, fontSize, scrollSpeed, mirrored, selectedItemId, broadcastState]);

  // 🔧 FIX ÚNICO: Broadcast contínuo durante scroll automático (NÃO MEXEU EM MAIS NADA!)
  useEffect(() => {
    if (syncMode !== "master" || !isScrolling) {
      return;
    }

    let animationFrameId: number;
    let lastScrollTop = scrollRef.current?.scrollTop || 0;

    const broadcastContinuous = () => {
      const currentScrollTop = scrollRef.current?.scrollTop || 0;
      if (currentScrollTop !== lastScrollTop) {
        lastScrollTop = currentScrollTop;
        broadcastState();
      }

      animationFrameId = requestAnimationFrame(broadcastContinuous);
    };

    animationFrameId = requestAnimationFrame(broadcastContinuous);

    return () => cancelAnimationFrame(animationFrameId);
  }, [syncMode, isScrolling, broadcastState]);

  const currentItem = items.find(i => i.id === selectedItemId);

  // Índice Global Absoluto da matéria ativa
  const materiaAtivaIndexGlobal = useMemo(() => 
    items.findIndex(i => i.id === selectedItemId), 
  [items, selectedItemId]);

  // Atualiza o tempo restante quando a matéria selecionada muda
  const lastSelectedId = useRef<string | null>(null);
  useEffect(() => {
    if (currentItem) {
      setTimeLeft(parseTimeToSeconds(currentItem.tempo_cab)); // Use imported utility

      // Só reseta a posição e para a rolagem se o ID da matéria mudar (troca de matéria)
      // Se for apenas uma edição de texto na mesma matéria, o texto atualiza sem resetar o scroll
      if (selectedItemId !== lastSelectedId.current) {
        setIsScrolling(false);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
        lastSelectedId.current = selectedItemId;
        // Reset do gatilho RODA_VT para a nova matéria
        rodaTvFiredRef.current = null;
      }
    }
  }, [selectedItemId, currentItem]);

  // Lógica para calcular o progresso total do programa
  const calculateTotalProgress = useCallback(() => {
    if (!scrollRef.current || items.length === 0 || !selectedItemId) {
      setTotalProgress(0);
      return;
    }
    
    const scrollEl = scrollRef.current;
    const currentIndex = items.findIndex(i => i.id === selectedItemId);
    if (currentIndex === -1) return;

    // Calcula o percentual de scroll da lauda atual
    const scrollableHeight = scrollEl.scrollHeight - scrollEl.clientHeight;
    const scrollPct = scrollableHeight > 0 ? scrollEl.scrollTop / scrollableHeight : 1;
    
    // O progresso é a soma das matérias completas + a parcial da atual, dividido pelo total
    const progress = ((currentIndex + scrollPct) / items.length) * 100;
    setTotalProgress(progress);
  }, [items, selectedItemId]);

  // Lógica do cronômetro regressivo baseada na rolagem
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isScrolling && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isScrolling, timeLeft]);

  // Atualiza o progresso quando a matéria selecionada muda (clique manual)
  useEffect(() => {
    calculateTotalProgress();
  }, [selectedItemId, calculateTotalProgress]);

  const updateItemStatus = async (itemId: string, newStatus: string) => {
    const { error } = await supabase.from("espelho_itens").update({ status: newStatus }).eq("id", itemId);
    if (error) console.error("Erro ao atualizar status:", error.message);
  };

  // Gerenciar Status Automático
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
    const currentItem = items.find(i => i.id === selectedItemId);

    if (isScrolling) {
      let shouldStopScrolling = false;

      if (currentItem?.cabeca && rodaTvEl) {
        const scrollRect = scrollEl.getBoundingClientRect();
        const rodaTvRect = rodaTvEl.getBoundingClientRect();
        const centerLine = scrollRect.top + scrollRect.height / 2;

        // Stop when the top of [RODA TV] reaches the center of the prompter viewport
        if (rodaTvRect.top <= centerLine) {
          if (
            playoutChannelRef.current &&
            currentItem &&
            rodaTvFiredRef.current !== currentItem.id
          ) {
            rodaTvFiredRef.current = currentItem.id;
            playoutChannelRef.current.send({
              type: "broadcast",
              event: "RODA_VT",
              payload: {
                materiaId: currentItem.materia_id ?? null,
                assunto: currentItem.assunto,
                itemId: currentItem.id,
              },
            });
          }
          
          // A rolagem só deve parar DEPOIS de enviar o comando RODA_VT
          shouldStopScrolling = true;
        }
      } else {
        // If no cabeca or no [RODA TV] element, stop when the general content is at the bottom
        const isAtAbsoluteBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight;
        if (isAtAbsoluteBottom) {
            shouldStopScrolling = true;
        }
      }

      if (shouldStopScrolling) {
        setIsScrolling(false);
        if (selectedItemId) {
          // Garante a transição de status antes de pular para o próximo item
          updateItemStatus(selectedItemId, "exibido").then(() => {
          const currentIndex = items.findIndex(i => i.id === selectedItemId);
          if (currentIndex !== -1 && currentIndex < items.length - 1) {
            setSelectedItemId(items[currentIndex + 1].id);
          }
          });
        }
      } else {
        scrollEl.scrollTop += scrollSpeed;
      }
      
      // GATILHO DE AVANÇO: Atualiza o percentual a cada frame de animação
      calculateTotalProgress();
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isScrolling, scrollSpeed, selectedItemId, items]); // Added items to dependencies

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Espaço = Play/Pause
      if (e.code === "Space") {
        e.preventDefault();
        setIsScrolling(prev => !prev);
      }

      // F = Fullscreen
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setIsFullscreen(prev => !prev);
      }

      // C = Camera (Slave)
      if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        setSyncMode("camera");
      }

      // M = Master
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setSyncMode("master");
      }

      // E = Espelhar
      if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        setMirrored(prev => !prev);
      }

      // Seta Esquerda = Diminuir Fonte
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setFontSize((prev) => {
          const newSize = Math.max(50, prev - 5);
          return newSize;
        });
      }

      // Seta Direita = Aumentar Fonte
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setFontSize((prev) => {
          const newSize = Math.min(180, prev + 5);
          return newSize;
        });
      }

      // Seta Cima = Diminuir Velocidade
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setScrollSpeed((prev) => {
          const newSpeed = Math.max(0.5, prev - 0.5);
          return newSpeed;
        });
      }

      // Seta Baixo = Aumentar Velocidade
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

  // ─────────────────────────────────────────────────────────────────────────────
  // GESTOS TOUCH
  // ─────────────────────────────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const duration = Date.now() - touchStartRef.current.time;

    // Duplo toque = Fullscreen
    if (duration < 300 && distance < 30) {
      if (doubleClickTimerRef.current) {
        clearTimeout(doubleClickTimerRef.current);
        setIsFullscreen(prev => !prev);
        doubleClickTimerRef.current = undefined;
      } else {
        doubleClickTimerRef.current = setTimeout(() => {
          doubleClickTimerRef.current = undefined;
        }, 300);
      }
      return;
    }

    // Diagonal para cima (Master)
    if (dx > 50 && dy < -50) {
      setSyncMode("master");
      return;
    }

    // Diagonal para baixo (Camera)
    if (dx > 50 && dy > 50) {
      setSyncMode("camera");
      return;
    }

    // Arrastar esquerda = Espelhar
    if (dx < -50 && Math.abs(dy) < 30) {
      setMirrored(prev => !prev);
      return;
    }

    // Toque simples = Play/Pause
    if (distance < 30) {
      setIsScrolling(prev => !prev);
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col overflow-hidden select-none z-[100] font-mono">
      {/* Modal de Instruções */}
      <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} />

      {/* Toolbar de Controle */}
      <ReadingMonitor
        isOpen={showReadingMonitor}
        onClose={() => setShowReadingMonitor(false)}
        content={currentItem?.cabeca ?? null}
      />

      {/* Toolbar de Controle */}
      {!isFullscreen && (
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between z-50 shrink-0 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MonitorPlay className="h-5 w-5 text-primary" />
              <h1 className="uppercase text-xs font-bold tracking-widest text-primary">TP Studio</h1>
            </div>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} 
              className="bg-black border border-zinc-700 rounded px-2 py-1 text-xs" />
            <select value={programa} onChange={e => setPrograma(e.target.value)}
              className="bg-black border border-zinc-700 rounded px-2 py-1 text-xs">
              {PROGRAMAS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            
            {/* Badge Status Master/Camera */}
            <div className={cn(
              "px-2 py-1 rounded text-[11px] font-bold border",
              syncMode === "master" 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                : "bg-blue-500/10 border-blue-500/30 text-blue-400"
            )}>
              {syncMode === "master" ? "🎙️ MASTER" : "🎥 CÂMERA"}
            </div>
            
            {/* Status Sincronização */}
            {syncMode === "camera" && (
              <div className={cn(
                "px-2 py-1 rounded text-[11px] font-bold border",
                isConnected
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              )}>
                {isConnected ? "✓ Sync" : "✗ Offline"}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded border border-white/5 shadow-inner">
              <Timer className={cn("h-4 w-4", timeLeft <= 5 && timeLeft > 0 ? "text-red-500 animate-pulse" : "text-primary")} />
              <span className={cn("text-xl font-bold tabular-nums", timeLeft <= 5 && timeLeft > 0 ? "text-red-500" : "text-white")}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-zinc-500" />
              <input type="range" min="50" max="180" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-20 accent-primary" />
            </div>
            <div className="flex items-center gap-2">
              <MoveVertical className="h-4 w-4 text-zinc-500" />
              <input type="range" min="0.5" max="15" step="0.5" value={scrollSpeed} onChange={e => setScrollSpeed(Number(e.target.value))} className="w-20 accent-primary" />
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant={mirrored ? "default" : "outline"} onClick={() => setMirrored(!mirrored)} className="h-8 w-8">
                <FlipHorizontal className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={() => { if(scrollRef.current) scrollRef.current.scrollTop = 0; setIsScrolling(false); }} className="h-8 w-8" title="Reiniciar">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button size="icon" onClick={() => setIsScrolling(!isScrolling)} className="h-9 w-9 rounded-full bg-primary">
                {isScrolling ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
              </Button>
              <Button size="icon" variant="outline" onClick={() => setIsFullscreen(true)} className="h-8 w-8">
                <Maximize className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={() => setShowInstructions(true)} className="h-8 w-8" title="Guia de Atalhos">
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button size="icon" variant={showReadingMonitor ? "default" : "outline"} onClick={() => setShowReadingMonitor(p => !p)} className="h-8 w-8" title="Monitor de Leitura">
                <BookOpen className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {isFullscreen && (
        <div className="absolute top-6 left-6 z-[110] opacity-0 hover:opacity-100 transition-opacity">
           <Button variant="secondary" size="sm" onClick={() => setIsFullscreen(false)} className="bg-zinc-900/80 backdrop-blur"><Minimize className="h-4 w-4 mr-2" /> SAIR TELA CHEIA</Button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Roteiro de Retrancas */}
        {!isFullscreen && (
          <aside className="w-80 bg-zinc-950 border-r border-zinc-800 overflow-y-auto flex flex-col shrink-0">
            <div className="p-4 border-b border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Roteiro do Jornal</div>
            
            {blocos.length === 0 && (
              <div className="p-8 text-center text-zinc-600 text-xs italic">Nenhum bloco encontrado para {programa} nesta data.</div>
            )}

            <div className="flex-1 divide-y divide-zinc-900">
              {(() => {
                let globalCounter = 0;
                return blocos.map((b) => {
                  const blockItems = items.filter(i => i.bloco_id === b.id);
                  
                  // Capturamos o valor atual para este bloco antes de incrementar para o próximo
                  const startIdx = globalCounter;
                  globalCounter += blockItems.length;

                  return (
                    <div key={b.id} className="p-2">
                      <div className="px-3 py-1 text-[9px] text-primary/40 uppercase font-bold sticky top-0 bg-zinc-950/90 backdrop-blur-sm z-10">BLOCO {b.ordem} — {b.nome}</div>
                      {blockItems.map((item, idx) => {
                        const absoluteIndex = startIdx + idx;
                        const isPast = absoluteIndex < materiaAtivaIndexGlobal;
                        const isCurrent = absoluteIndex === materiaAtivaIndexGlobal;
                        const isLocked = absoluteIndex <= materiaAtivaIndexGlobal;

                        return (
                          <button
                            key={item.id}
                            disabled={isPast}
                            onClick={() => { setSelectedItemId(item.id); if(scrollRef.current) scrollRef.current.scrollTop = 0; setIsScrolling(false); }}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-md transition-all text-xs uppercase font-bold tracking-wider flex items-center justify-between group",
                              isCurrent ? "bg-primary/20 text-primary border border-primary/30" : "text-zinc-400 hover:bg-zinc-900",
                              item.status === "no_ar" && "text-red-500 bg-red-500/5",
                              (item.status === "exibido" || isPast) && "text-emerald-500/40 opacity-40 grayscale pointer-events-none cursor-not-allowed",
                              isCurrent && "cursor-pointer"
                            )}
                          >
                            <span className="truncate flex-1"><span className="opacity-30 mr-2">{absoluteIndex + 1}.</span>{item.assunto}</span>
                            {!item.cabeca && <span className="text-[8px] text-zinc-600 ml-2">(SEM TEXTO)</span>}
                          </button>
                        );
                      })}
                      {blockItems.length === 0 && (
                        <div className="px-3 py-2 text-[10px] text-zinc-700 italic">Bloco sem matérias vinculadas</div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </aside>
        )}

        {/* Prompter Area */}
        <div 
          ref={scrollRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={cn(
            "flex-1 overflow-y-auto px-10 sm:px-20 py-[45vh] cursor-pointer no-scrollbar relative",
            mirrored && "scale-x-[-1]"
          )}
          onClick={() => setIsScrolling(!isScrolling)}
          style={{ fontSize: `${fontSize}px`, scrollBehavior: 'auto' }}
        >
          <div className="max-w-5xl mx-auto uppercase font-bold text-center">
            {currentItem ? (
              <div className="space-y-16">
                <div className="text-emerald-400 text-5xl tracking-wider text-center border-b-2 border-emerald-500/20 pb-6 mb-12">
                   {currentItem.assunto}
                </div>

                {/* Nome do apresentador antes da cabeça */}
                {(() => {
                  const bl = blocos.find(b => b.id === currentItem.bloco_id);
                  return bl?.apresentador && (
                    <div className="text-amber-400 text-center mb-12 text-6xl font-black border-2 border-amber-500/20 py-4 rounded-xl bg-amber-500/10">
                      [{bl.apresentador}]
                    </div>
                  );
                })()}

                {currentItem.cabeca ? (
                  <>
                    <div className="whitespace-pre-wrap leading-[1.25]">
                      {currentItem.cabeca}
                    </div>
                    <div ref={rodaTvRef} className="text-emerald-400 text-center mt-16 text-6xl font-black border-4 border-emerald-500/30 py-6 rounded-2xl bg-emerald-500/10">
                      [RODA TV]
                    </div>
                  </>
                ) : (
                  <div className="text-zinc-700 italic text-2xl text-center py-20">Matéria sem texto de cabeça cadastrado.</div>
                )}
              </div>
            ) : (
              <div className="text-zinc-700 italic text-2xl font-mono text-center">
                {items.length === 0 ? "Aguardando textos do espelho..." : "Selecione uma matéria no roteiro lateral."}
              </div>
            )}
            {items.length > 0 && (
              <div className="h-[50vh] flex items-center justify-center text-zinc-900 font-mono text-sm uppercase tracking-widest">
                Fim do programa
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guide Line (Center Marker) */}
      <div className="fixed left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-between px-2 z-40 opacity-50">
        <div className="w-6 h-1.5 bg-primary/60 rounded-r-full"></div>
        <div className="w-6 h-1.5 bg-primary/60 rounded-l-full"></div>
      </div>
      
      {/* BARRA DE PROGRESSO DINÂMICA (RODAPÉ) */}
      <div className="fixed bottom-0 left-0 w-full h-2 bg-zinc-900/80 backdrop-blur-sm z-[110] border-t border-white/5">
        {/* Preenchimento do Progresso */}
        <div 
          className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-100 ease-out"
          style={{ width: `${totalProgress}%` }}
        />
        
        {/* DIVISORES DE BLOCO: 
            O número de divisões é injetado dinamicamente com base no array 'blocos' 
        */}
        <div className="absolute inset-0 flex pointer-events-none">
          {blocos.map((b, i) => (
            <div 
              key={b.id} 
              className="flex-1 border-r border-white/20 last:border-r-0 h-full" 
            />
          ))}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}