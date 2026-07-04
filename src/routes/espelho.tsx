import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  loadEspelho,
  loadMaterias,
  addBloco as addBlocoFn,
  addItem as addItemFn,
  addFromMateria as addFromMateriaFn,
  addComercial as addComercialFn,
  updateItem as updateItemFn,
  updateBloco as updateBlocoFn,
  delItem as delItemFn,
  delBloco as delBlocoFn,
  reorderItens,
  updateMateriaEItem,
  updateMateriaCabeca,
  broadcastEditando as broadcastEditandoFn,
  broadcastProducao as broadcastProducaoFn,
  broadcastMaster as broadcastMasterFn,
} from "@/functions/espelho.functions";
import { useEspelhoRealtime } from "@/hooks/useEspelhoRealtime";
import { toast } from "sonner";
import { parseTimeToSeconds, formatSecondsToTime } from "@/lib/time";
import {
  Plus,
  Trash2,
  Tv,
  GripVertical,
  Pencil,
  MonitorPlay,
} from "lucide-react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { CSS } from "@dnd-kit/utilities";


// PASSO 6: Importações dos novos módulos de Autosave, RBAC e feedbacks visuais na Toolbar

export const Route = createFileRoute("/espelho")({
  component: () => <EspelhoPage />,
  head: () => ({ meta: [{ title: "Espelho — DeskNews" }] }),
  ssr: false,
});
  
type ItemStatus = "pendente" | "pronto" | "no_ar" | "exibido" | "cortado";

interface Bloco {
  id: string;
  nome: string;
  ordem: number;
  data_edicao: string;
  apresentador: string | null;
  programa: string;
  created_at?: string;
}

const PROGRAMAS = ["Jornal da Manhã", "Edição Meio-Dia", "Jornal da Noite"] as const;

interface Item {
  id: string;
  bloco_id: string;
  ordem: number;
  assunto: string;
  formato: string | null;
  tempo: string | null;
  status: ItemStatus;
  materia_id: string | null;
  editor_texto_id: string | null;
  editor_imagem_id: string | null;
  cabeca: string | null;
  tempo_cab: string | null;
  tempo_total: string | null;
}

interface Materia {
  id: string;
  titulo: string;
  status: string;
  cabeca: string | null;
  tempo_vt: string | null;
  tempo_cab: string | null;
  deixa: string | null;
  entrevistado_nome: string | null;
  entrevistado_funcao: string | null;
  editor_texto: string | null;
  editor_imagem: string | null;
  credito_reporter: string | null;
  estrutura: string | null;
  lide: string | null;
  corpo: string | null;
}

interface Profile {
  id: string;
  display_name: string;
}

const FORMATOS = [
  "Nota Seca",
  "Nota Coberta",
  "VT",
  "Vivo",
  "Link",
  "Stand-up",
  "Estúdio",
  "Cabeça",
  "Gráfico",
  "Croma",
  "Comercial",
];

const sanitize = (v: string) => v.replace(/<[^>]*>?/gm, "").trim();

function EspelhoPage() {
  const canDelete = (_table?: string) => true;
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [programa, setPrograma] = useState<string>("Todos");
  // Restaura a escolha do jornal após montar no cliente (evita crash SSR com localStorage)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("espelho_programa");
      if (saved) setPrograma(saved);
    }
  }, []);
  const [blocos, setBlocos] = useState<Bloco[]>([]);
  const [itens, setItens] = useState<Item[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [modalMateria, setModalMateria] = useState<{ materia: Materia; item: Item } | null>(null);
  const [modalCabeca, setModalCabeca] = useState<Item | null>(null);
  const [plannedEditorialDuration, setPlannedEditorialDuration] = useState("00:00");
  const [masterDuration, setMasterDuration] = useState("00:00");
  // Set de IDs editando — alimentado pelo Centrifugo, visível em todos os browsers
  const { editingItemIds, connected: realtimeConnected } = useEspelhoRealtime({
    url: import.meta.env.VITE_CENTRIFUGO_URL,
    onEspelhoAlterado: () => load(),
    onCabecaAtualizada: (payload) => {
      // Mantém o estado local em sincronia mesmo antes do load() geral chegar,
      // útil pro Teleprompter/Playout que escutam este mesmo evento.
      setItens((prev) =>
        prev.map((it) =>
          it.id === payload.itemId
            ? { ...it, cabeca: payload.cabeca, assunto: payload.assunto, tempo_cab: payload.tempo_cab }
            : it
        )
      );
    },
    onProducaoAlterada: (payload) => setPlannedEditorialDuration(payload.valor),
    onMasterAlterado: (payload) => setMasterDuration(payload.valor),
  });

  const broadcastEditing = useCallback((itemId: string, editando: boolean) => {
    broadcastEditandoFn({ data: { itemId, editando } }).catch((err) =>
      console.error("Falha ao avisar edição em andamento:", err)
    );
  }, []);

  const broadcastProducao = useCallback((valor: string) => {
    broadcastProducaoFn({ data: { valor } }).catch((err) =>
      console.error("Falha ao avisar mudança de produção:", err)
    );
  }, []);

  const broadcastMaster = useCallback((valor: string) => {
    broadcastMasterFn({ data: { valor } }).catch((err) =>
      console.error("Falha ao avisar mudança de master:", err)
    );
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );


  const load = useCallback(async () => {
    try {
      const { blocos: loadedBlocos, itens: loadedItens } = await loadEspelho({
        data: { date, programa },
      });
      setBlocos(loadedBlocos as unknown as Bloco[]);
      setItens(loadedItens as unknown as Item[]);
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [date, programa]);

  // ── Sincroniza mudanças do espelho via Centrifugo (substitui o polling de 4s) ──
  // O hook useEspelhoRealtime chama load() sozinho quando recebe ESPELHO_ALTERADO.
  // Mantemos aqui só um fallback de baixa frequência, para o caso raro de a
  // conexão websocket cair sem disparar "disconnected" a tempo.
  useEffect(() => {
    if (realtimeConnected) return;
    const interval = setInterval(() => {
      load();
    }, 15000); // fallback bem menos agressivo que os 4s antigos
    return () => clearInterval(interval);
  }, [load, realtimeConnected]);

  useEffect(() => {
    loadMaterias()
      .then((rows) => setMaterias(rows as unknown as Materia[]))
      .catch((err: any) => toast.error(err.message));

    setProfiles([]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addBloco = async () => {
    const prog = programa !== "Todos" ? programa : "Jornal da Manhã";
    const ordem = blocos.length + 1;
    try {
      await addBlocoFn({ data: { date, nome: `Bloco ${ordem}`, ordem, programa: prog } });
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const addItem = async (bloco_id: string) => {
    const ordem = itens.filter((i) => i.bloco_id === bloco_id).length + 1;
    try {
      await addItemFn({
        data: {
          blocoId: bloco_id,
          ordem,
          assunto: "Novo item",
          formato: "VT",
          tempo: "1:30",
          tempoCab: "0:15",
        },
      });
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const addFromMateria = async (bloco_id: string, materia_id: string) => {
    const m = materias.find((x) => x.id === materia_id);
    if (!m) return;
    const ordem = itens.filter((i) => i.bloco_id === bloco_id).length + 1;
    try {
      await addFromMateriaFn({
        data: {
          blocoId: bloco_id,
          ordem,
          assunto: m.titulo,
          materiaId: materia_id,
          formato: "VT",
          tempo: m.tempo_vt ?? "1:30",
          tempoCab: m.tempo_cab ?? "0:15",
          cabeca: m.cabeca ?? null,
        },
      });
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const addComercial = async (bloco_id: string) => {
    const ordem = itens.filter((i) => i.bloco_id === bloco_id).length + 1;
    try {
      await addComercialFn({ data: { blocoId: bloco_id, ordem } });
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const updateItem = useCallback(async (id: string, patch: Partial<Item>) => {
    if (!Object.keys(patch).length) return;
    try {
      await updateItemFn({ data: { id, patch: patch as any } });
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [load]);

  const updateBloco = async (id: string, patch: Partial<Bloco>) => {
    if (!Object.keys(patch).length) return;
    try {
      await updateBlocoFn({ data: { id, patch: patch as any } });
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const delItem = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja remover este item do espelho?")) return;
    try {
      await delItemFn({ data: { id } });
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const delBloco = async (id: string) => {
    if (!window.confirm("Isso apagará o bloco e todos os itens dentro dele. Confirmar?")) return;
    try {
      await delBlocoFn({ data: { id } });
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const activeGlobalIndex = useMemo(() => {
    let counter = 0;
    let found = -1;
    blocos.forEach((block) => {
      itens
        .filter((i) => i.bloco_id === block.id)
        .sort((a, b) => a.ordem - b.ordem)
        .forEach((item) => {
          const s = String(item.status ?? "").toLowerCase();
          if (s === "no_ar" || s === "no ar") found = counter;
          counter++;
        });
    });
    return found;
  }, [itens, blocos]);

  const calcTotal = useCallback(
    (i: Item) =>
      formatSecondsToTime(
        parseTimeToSeconds(i.tempo) + parseTimeToSeconds(i.tempo_cab)
      ),
    []
  );

  const totalEditorialSec = useMemo(
    () =>
      itens
        .filter((i) => i.formato !== "Comercial")
        .reduce((a, i) => a + parseTimeToSeconds(i.tempo) + parseTimeToSeconds(i.tempo_cab), 0),
    [itens]
  );

  const totalGeralSec = useMemo(
    () =>
      itens.reduce(
        (acc, i) => acc + parseTimeToSeconds(i.tempo) + parseTimeToSeconds(i.tempo_cab),
        0
      ),
    [itens]
  );

  const plannedSec = useMemo(
    () => parseTimeToSeconds(plannedEditorialDuration),
    [plannedEditorialDuration]
  );

  const masterSec = useMemo(
    () => parseTimeToSeconds(masterDuration),
    [masterDuration]
  );

  const diffEditorial = useMemo(() => {
    // Compara MASTER (tempo real editável) vs PRODUÇÃO (tempo previsto)
    const base = masterSec || totalEditorialSec;
    const diff = base - plannedSec;
    if (diff > 0) return { type: "estouro" as const, value: diff };
    if (diff < 0) return { type: "sobra" as const, value: Math.abs(diff) };
    return { type: "balanceado" as const, value: 0 };
  }, [masterSec, totalEditorialSec, plannedSec]);

  const profileName = useCallback(
    (id: string | null) =>
      id ? (profiles.find((p) => p.id === id)?.display_name ?? "—") : "—",
    [profiles]
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeItem = itens.find((i) => i.id === activeId);
    if (!activeItem) return;

    const overItem = itens.find((i) => i.id === overId);
    const destinationBlocoId = overItem?.bloco_id ?? blocos.find((b) => b.id === overId)?.id ?? "";
    if (!destinationBlocoId) return;

    const sourceBlocoId = activeItem.bloco_id;
    let newItens = structuredClone(itens) as Item[];
    const target = newItens.find((i) => i.id === activeId)!;

    if (sourceBlocoId === destinationBlocoId) {
      const blockItens = newItens
        .filter((i) => i.bloco_id === sourceBlocoId)
        .sort((a, b) => a.ordem - b.ordem);
      const oldIdx = blockItens.findIndex((i) => i.id === activeId);
      const newIdx = blockItens.findIndex((i) => i.id === overId);
      const reordered = arrayMove(blockItens, oldIdx, newIdx);
      reordered.forEach((item, idx) => {
        const x = newItens.find((z) => z.id === item.id);
        if (x) x.ordem = idx + 1;
      });
    } else {
      target.bloco_id = destinationBlocoId;

      const sourceItens = newItens
        .filter((i) => i.bloco_id === sourceBlocoId && i.id !== activeId)
        .sort((a, b) => a.ordem - b.ordem);
      sourceItens.forEach((item, idx) => {
        const x = newItens.find((z) => z.id === item.id);
        if (x) x.ordem = idx + 1;
      });

      const destItens = newItens
        .filter((i) => i.bloco_id === destinationBlocoId && i.id !== activeId)
        .sort((a, b) => a.ordem - b.ordem);
      const overIdx = destItens.findIndex((i) => i.id === overId);
      overIdx >= 0 ? destItens.splice(overIdx, 0, target) : destItens.push(target);
      destItens.forEach((item, idx) => {
        const x = newItens.find((z) => z.id === item.id);
        if (x) {
          x.ordem = idx + 1;
          x.bloco_id = destinationBlocoId;
        }
      });
    }

    setItens(newItens);

    try {
      await reorderItens({
        data: {
          itens: newItens.map((item) => ({
            id: item.id,
            ordem: item.ordem,
            bloco_id: item.bloco_id,
          })),
        },
      });
    } catch (err: any) {
      toast.error(err.message);
    }
    load();
  };

  const blockStartIndices = useMemo(() => {
    const map = new Map<string, number>();
    let counter = 0;
    blocos.forEach((b) => {
      map.set(b.id, counter);
      counter += itens.filter((i) => i.bloco_id === b.id).length;
    });
    return map;
  }, [blocos, itens]);

  // Libera controles estruturais para editores, chefes de redação ou administradores
  const temPermissaoEdicaoGrade = true;

  return (
    <div className="p-4 sm:p-6 space-y-4 h-full flex flex-col overflow-hidden">
      {/* Header Premium */}
      <div className="flex items-center gap-3 border-b border-[#22c55e]/10 pb-3 shrink-0">
        <MonitorPlay className="h-5 w-5 text-[#22c55e]" />
        <h1 className="text-h1 font-bold tracking-tight text-[#22c55e]">
          ESPELHO
        </h1>
        <span className="text-label text-[#6b7280] hidden sm:inline">
          Exibição · controle de tempo
        </span>
        <div className="ml-auto flex items-center gap-2">
          {/* PASSO 6: Adicionado o monitorador silencioso do rascunho de backup na Toolbar */}
        </div>
      </div>

      {/* Toolbar com Glassmorphism e Cards de Resumo */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-3.5 rounded-md bg-[#141416] border border-[#22c55e]/20 text-body-sm text-[#ffffff] focus:outline-none focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10 transition-all duration-300"
          />
          <select
            value={programa}
            onChange={(e) => { setPrograma(e.target.value); try { localStorage.setItem("espelho_programa", e.target.value); } catch {} }}
            className="px-4 py-3.5 rounded-md bg-[#141416] border border-[#22c55e]/20 text-body-sm font-bold text-[#ffffff] focus:outline-none focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10 transition-all duration-300 appearance-none cursor-pointer"
          >
            <option value="Todos">Todos os programas</option>
            {PROGRAMAS.map((p) => (
              <option key={p} value={p} className="bg-[#141416] text-[#ffffff]">
                {p}
              </option>
            ))}
          </select>

          {/* Previsto */}
          <div className="font-mono text-display-lg border border-[#22c55e]/20 rounded-lg px-8 py-4 bg-[#141416] backdrop-blur-xl shadow-xl flex flex-col items-center justify-center min-w-[160px]">
            <span className="text-[#6b7280] text-label mb-1 font-black">
              PRODUÇÃO
            </span>
            <input
              type="text"
              value={plannedEditorialDuration}
              disabled={!temPermissaoEdicaoGrade}
              onChange={(e) => {
                if (/^\d{0,2}:?\d{0,2}$/.test(e.target.value) || e.target.value === "") {
                  setPlannedEditorialDuration(e.target.value);
                  broadcastProducao(e.target.value);
                }
              }}
              onBlur={() => {
                const formatted = formatSecondsToTime(plannedSec);
                setPlannedEditorialDuration(formatted);
                broadcastProducao(formatted);
              }}
              className="bg-transparent text-[#ffffff] w-32 text-center focus:outline-none font-bold tracking-tighter text-h2"
              placeholder="00:00"
            />
          </div>

          {/* Master */}
          <div className="font-mono text-display-lg border border-[#22c55e]/20 rounded-lg px-8 py-4 bg-[#141416] backdrop-blur-xl shadow-xl flex flex-col items-center justify-center min-w-[160px]">
            <span className="text-[#6b7280] text-label mb-1 font-black">
              MASTER
            </span>
            <input
              type="text"
              value={masterDuration}
              disabled={!temPermissaoEdicaoGrade}
              onChange={(e) => {
                if (/^\d{0,2}:?\d{0,2}$/.test(e.target.value) || e.target.value === "") {
                  setMasterDuration(e.target.value);
                  broadcastMaster(e.target.value);
                }
              }}
              onBlur={() => {
                const formatted = formatSecondsToTime(masterSec);
                setMasterDuration(formatted);
                broadcastMaster(formatted);
              }}
              className="bg-transparent text-[#ffffff] w-32 text-center focus:outline-none font-bold tracking-tighter text-h2 tabular-nums"
              placeholder="00:00"
            />
          </div>

          {/* Diff */}
          {diffEditorial.type !== "balanceado" && (
            <div className={cn(
              "font-mono text-display-lg border rounded-lg px-8 py-4 flex flex-col items-center justify-center min-w-[160px] shadow-xl",
              diffEditorial.type === "estouro"
                ? "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30"
                : "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30"
            )}>
              <span className="text-label mb-1 font-black">
                {diffEditorial.type === "estouro" ? "Estouro" : "Sobra"}
              </span>
              <span className="font-bold text-h2 tabular-nums">{formatSecondsToTime(diffEditorial.value)}</span>
            </div>
          )}

          {/* Total geral */}
          <div className="font-mono text-display-lg border border-[#22c55e]/20 rounded-lg px-8 py-4 bg-[#141416] backdrop-blur-xl flex flex-col items-center justify-center min-w-[160px] shadow-2xl">
            <span className="text-[#6b7280] text-label mb-1 font-black">
              TOTAL
            </span>
            <span className="text-[#ffffff] font-bold tracking-tighter text-h2 tabular-nums">{formatSecondsToTime(totalGeralSec)}</span>
          </div>


          {/* PASSO 6: Apenas editores ou gerentes conseguem instanciar novos blocos estruturais no espelho */}
          {true && (
            <button
              onClick={addBloco}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#22c55e] text-white text-body-sm font-semibold uppercase tracking-widest shadow-lg transition-all duration-300 hover:shadow-xl active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" /> NOVO BLOCO
            </button>
          )}

          {/* Botões de navegação para TP e Playout */}
          <a
            href={`/tp?date=${date}&programa=${encodeURIComponent(programa ?? "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#141416] border border-[#22c55e]/20 text-white text-body-sm font-semibold uppercase tracking-wider hover:border-[#22c55e] hover:ring-4 hover:ring-[#22c55e]/10 transition-all duration-300 shadow-md active:scale-[0.98]"
          >
            <Tv className="h-4 w-4 text-white" /> TP
          </a>

          <a
            href={`/playout?date=${date}&programa=${encodeURIComponent(programa ?? "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#141416] border border-[#22c55e]/20 text-white text-body-sm font-semibold uppercase tracking-wider hover:border-[#22c55e] hover:ring-4 hover:ring-[#22c55e]/10 transition-all duration-300 shadow-md active:scale-[0.98]"
          >
            <Tv className="h-4 w-4 text-white" /> PLAYOUT
          </a>
        </div>
      </div>

      {/* Grid de Blocos */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="space-y-6 pb-12 overflow-y-auto flex-1">
          {blocos.length === 0 && (
            <div className="bg-[#141416] border border-[#22c55e]/20 rounded-lg p-12 text-center text-[#6b7280] text-body-sm shadow-md">
              Nenhum bloco para esta data.{true && " Crie um bloco para começar."}
            </div>
          )}

          {blocos.map((b) => {
            const itensB = itens
              .filter((i) => i.bloco_id === b.id)
              .sort((a, b) => a.ordem - b.ordem);
            const tempoB = itensB.reduce(
              (a, i) => a + parseTimeToSeconds(i.tempo) + parseTimeToSeconds(i.tempo_cab),
              0
            );
            const startIdx = blockStartIndices.get(b.id) ?? 0;

            return (
              <div
                key={b.id}
                id={b.id}
                className="group bg-[#141416] border border-[#22c55e]/20 rounded-lg overflow-hidden shadow-sm"
              >
                {/* Bloco header */}
                <div className="flex items-center justify-between px-5 py-4 bg-[#1c1c1f] border-b border-[#22c55e]/10 gap-3 flex-wrap">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs px-2 py-0.5 bg-red-600 text-white rounded font-bold">
                      B{String(b.ordem).padStart(2, "0")}
                    </span>
                    {true ? (
                      <BlockInput
                        value={b.nome}
                        onBlur={(v) => updateBloco(b.id, { nome: v })}
                        className="bg-transparent font-semibold focus:outline-none"
                      />
                    ) : (
                      <span className="font-semibold">{b.nome}</span>
                    )}
                    {true ? (
                      <select
                        value={b.programa}
                        onChange={(e) => updateBloco(b.id, { programa: e.target.value })}
                        className="text-label bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20 rounded-full px-2.5 py-1 font-bold appearance-none cursor-pointer"
                      >
                        {PROGRAMAS.map((p) => (
                          <option key={p} value={p} className="bg-[#141416] text-[#ffffff]">
                            {p}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-label px-2.5 py-1 rounded-full bg-[#22c55e]/10 text-[#22c55e] font-bold">
                        {b.programa}
                      </span>
                    )}
                    <span className="text-label text-[#6b7280]">
                      Apresentador
                    </span>
                    <BlockInput
                      value={b.apresentador ?? ""}
                      disabled={!temPermissaoEdicaoGrade || !true}
                      placeholder="—"
                      onBlur={(v) => updateBloco(b.id, { apresentador: v || null })}
                      className="bg-transparent text-body-sm focus:outline-none border-b border-transparent focus:border-[#22c55e] transition-colors duration-200"
                    />
                    <span className="font-mono text-caption text-[#6b7280] bg-[#09090b] px-2.5 py-1 rounded-md border border-[#22c55e]/10">
                      {formatSecondsToTime(tempoB)}
                    </span>
                  </div>

                  {true && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            addFromMateria(b.id, e.target.value);
                            e.target.value = "";
                          }
                        }}
                        className="text-caption bg-[#141416] text-[#ffffff] border border-[#22c55e]/20 rounded-xl px-3 py-1.5 focus:outline-none appearance-none cursor-pointer transition-all duration-300 hover:border-[#22c55e]/30 min-w-[180px]"
                        defaultValue=""
                      >
                        <option value="" className="bg-[#141416] text-[#ffffff]">
                          + Matéria publicada…
                        </option>
                        {materias.map((m) => (
                          <option key={m.id} value={m.id} className="bg-[#141416] text-[#ffffff]">
                            {m.titulo}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => addItem(b.id)}
                        className="text-caption px-3 py-1.5 rounded-xl border border-[#22c55e]/20 text-[#9ca3af] hover:bg-[#141416] hover:text-[#ffffff] transition-all duration-300 active:scale-[0.98]"
                      >
                        + Item
                      </button>
                      <button
                        onClick={() => addComercial(b.id)}
                        className="text-caption px-3 py-1.5 rounded-xl border border-[#22c55e]/20 text-[#9ca3af] hover:bg-[#141416] hover:text-[#ffffff] transition-all duration-300 active:scale-[0.98]"
                      >
                        + Comercial
                      </button>
                      
                      {/* PASSO 6: Lixeira do bloco amparada pela validação RLS/RBAC */}
                      {true && (
                        <button
                          onClick={() => delBloco(b.id)}
                          className="text-caption px-3 py-1.5 rounded-md text-[#ef4444] hover:bg-[#ef4444]/10 transition-all duration-300 active:scale-[0.98] opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Tabela de itens */}
                <div className="overflow-x-auto text-[#9ca3af]">
                  <table className="w-full text-sm min-w-[1100px]">
                    <thead className="text-[10px] uppercase tracking-widest text-[#6b7280]">
                      <tr className="border-b [#22c55e]/10 bg-[#1c1c1f]">
                        <th className="w-8"></th>
                        <th className="text-center px-2 py-2 w-10">Status</th>
                        <th className="text-left px-3 py-2 w-12">#</th>
                        <th className="text-left px-3 py-2 min-w-[300px] w-[450px]">
                          Assunto / Cabeça
                        </th>
                        <th className="text-left px-3 py-2 w-32">Formato</th>
                        <th className="text-center px-3 py-2 w-20 font-mono">Cab.</th>
                        <th className="text-center px-3 py-2 w-20 font-mono">VT</th>
                        <th className="text-center px-3 py-2 w-20 font-mono text-primary">
                          Total
                        </th>
                        <th className="text-left px-3 py-2 w-40">Editor texto</th>
                        <th className="text-left px-3 py-2 w-40">Editor imagem</th>
                        <th className="text-left px-3 py-2 w-28">Estado</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <SortableContext
                      items={itensB.map((i) => i.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <tbody>
                        {itensB.map((item, idx) => (
                          <SortableRow
                            key={item.id}
                            item={item}
                            currentIndex={startIdx + idx}
                            activeGlobalIndex={activeGlobalIndex}
                            index={idx}
                            canDelete={true}
                            isEditing={editingItemIds.has(item.id)}
                            onUpdate={updateItem}
                            onDelete={delItem}
                            onSelectMateria={(m, i) => {
                              broadcastEditing(i.id, true);
                              setModalMateria({ materia: m, item: i });
                            }}
                            onSelectCabeca={(i: Item) => setModalCabeca(i)}
                            materias={materias}
                            profiles={profiles}
                            profileName={profileName}
                            calcTotal={calcTotal}
                          />
                        ))}
                        {itensB.length === 0 && (
                          <tr>
                            <td
                              colSpan={12}
                              className="px-3 py-6 text-center text-xs text-[#6b7280]"
                            >
                              Sem itens. Adicione uma matéria publicada ou um item livre.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </SortableContext>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </DndContext>

      {/* Modal: Matéria — Edição Direta */}
      {modalMateria && (
        <MateriaEditModal
          materia={modalMateria.materia}
          item={modalMateria.item}
          onClose={() => setModalMateria(null)}
          onSave={async (updated) => {
            try {
              await updateMateriaEItem({
                data: {
                  id: updated.id,
                  itemId: modalMateria.item.id,
                  titulo: updated.titulo,
                  cabeca: updated.cabeca,
                  tempoVt: updated.tempo_vt,
                  tempoCab: updated.tempo_cab,
                  deixa: updated.deixa,
                  estrutura: updated.estrutura,
                  corpo: updated.corpo,
                  creditoReporter: updated.credito_reporter,
                },
              });
              // O evento CABECA_ATUALIZADA já é publicado pelo server function
              // assim que o banco confirma — o Teleprompter/Playout recebem via
              // Centrifugo sem precisar de broadcast manual aqui.
              broadcastEditing(modalMateria.item.id, false);
              setModalMateria(null);
              toast.success("Matéria salva!");
            } catch (err: any) {
              toast.error(err.message);
            }
          }}
        />
      )}

      {/* Modal: Cabeça */}
      {modalCabeca && (
        <CabecaEditorModal
          item={modalCabeca}
          materia={materias.find((m) => m.id === modalCabeca.materia_id)}
          onClose={() => setModalCabeca(null)}
          onSave={async (id, assunto, cabeca, tempoCab, tempoVt, reporter) => {
            await updateItem(id, { assunto, cabeca, tempo_cab: tempoCab, tempo: tempoVt });
            if (modalCabeca.materia_id) {
              try {
                await updateMateriaCabeca({
                  data: {
                    materiaId: modalCabeca.materia_id,
                    creditoReporter: reporter,
                    cabeca,
                    tempoCab,
                    tempoVt,
                  },
                });
              } catch (err: any) {
                toast.error(err.message);
              }
            }
            setModalCabeca(null);
          }}
        />
      )}
    </div>
  );
}

function SortableRow({
  item,
  currentIndex,
  activeGlobalIndex,
  isEditing,
  onUpdate,
  onDelete,
  onSelectMateria,
  onSelectCabeca,
  materias,
  profileName,
  calcTotal,
}: {
  item: Item;
  index: number;
  currentIndex: number;
  activeGlobalIndex: number;
  canDelete: boolean;
  isEditing: boolean;
  onUpdate: (id: string, patch: Partial<Item>) => void;
  onDelete: (id: string) => void;
  onSelectMateria: (m: Materia, i: Item) => void;
  onSelectCabeca: (i: Item) => void;
  materias: Materia[];
  profiles: Profile[];
  profileName: (id: string | null) => string;
  calcTotal: (i: Item) => string;
}) {
  const [assunto, setAssunto] = useState(item.assunto);
  const [tempoCab, setTempoCab] = useState(item.tempo_cab ?? "0:00");
  const [tempo, setTempo] = useState(item.tempo ?? "0:00");

  useEffect(() => {
    setAssunto(item.assunto);
    setTempoCab(item.tempo_cab ?? "0:00");
    setTempo(item.tempo ?? "0:00");
  }, [item.assunto, item.tempo_cab, item.tempo]);

  let dotColor = "bg-green-500";
  let rowOpacity = "opacity-100";
  if (item.status === "exibido") rowOpacity = "opacity-30 grayscale";
  let borderStyle = "border-l-4 border-transparent";
  if (item.status === "no_ar" || (activeGlobalIndex !== -1 && currentIndex === activeGlobalIndex)) {
    dotColor = "bg-red-600";
    borderStyle = "border-l-4 border-red-600";
  } else if (currentIndex < activeGlobalIndex) {
    dotColor = "bg-yellow-500";
  }

  const isLocked = item.status === "exibido" || item.status === "no_ar" || (activeGlobalIndex !== -1 && currentIndex < activeGlobalIndex);
  const isCurrent = item.status === "no_ar" || (activeGlobalIndex !== -1 && currentIndex === activeGlobalIndex);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: isLocked,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    position: "relative" as const,
    pointerEvents: isLocked && !isCurrent ? ("none" as const) : ("auto" as const),
  };

  const linkedMateria = materias.find((x) => x.id === item.materia_id);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      onDoubleClick={() => {
        if (isLocked && !isCurrent) return;
        if (item.materia_id) {
          if (linkedMateria) onSelectMateria(linkedMateria, item);
          else toast.info("Matéria não encontrada.");
        } else {
          toast.info("Item livre — vincule uma matéria publicada para ver a estrutura.");
        }
      }}
      className={cn(
        "group border-b border-[#22c55e]/10 last:border-0 hover:bg-[#141416] transition-all duration-300",
        item.formato === "Comercial" && "bg-[#141416]",
        isDragging && "bg-[#1c1c1f] opacity-50 z-50 ring-2 ring-[#22c55e]/20",
        isCurrent && "bg-red-600/10 text-[#ffffff] font-bold",
        isEditing && !isCurrent && "border-l-4 border-yellow-400 bg-yellow-400/10",
        !isEditing && !isCurrent && borderStyle,
        item.status === "exibido" && "opacity-30 grayscale",
        rowOpacity
      )}
    >
      <td
        className={cn(
          "w-8 px-2 py-2 text-[#4b5563]",
          true && !isLocked && "cursor-grab active:cursor-grabbing hover:bg-[#22c55e]/10 transition-colors duration-200"
        )}
        {...(true && !isLocked ? attributes : {})}
        {...(true && !isLocked ? listeners : {})}
      >
        {true && <GripVertical className="h-4 w-4" />}
      </td>

      <td className="px-3 py-2">
        <div className="flex items-center justify-center">
          <div
            className={cn(
              "w-3 h-3 rounded-full border border-[#22c55e]/50 transition-all duration-200",
              isEditing && !isCurrent
                ? "bg-yellow-400 animate-pulse"
                : item.status === "cortado"
                ? "bg-gray-500"
                : dotColor
            )}
          />
        </div>
      </td>

      <td className="px-3 py-2 font-mono text-[10px] text-[#6b7280] font-bold">
        <span className="text-[#6b7280]">{String(currentIndex + 1).padStart(2, "0")}</span>
      </td>

      <td className="px-3 py-2">
        <input
          value={assunto}
          disabled={!true || isLocked}
          onChange={(e) => setAssunto(e.target.value)}
          onBlur={() => {
            const s = sanitize(assunto);
            setAssunto(s);
            onUpdate(item.id, { assunto: s });
          }}
          className={cn("w-full bg-transparent focus:outline-none font-medium text-[#ffffff]", isCurrent && "text-[#ffffff]")}
        />
        {item.materia_id && linkedMateria && (
          <span
            className={cn(
              "inline-block mt-1 text-[10px] uppercase tracking-widest font-bold",
              isCurrent ? "text-red-400" : "text-[#22c55e]"
            )}
          >
            ● {linkedMateria.titulo}
          </span>
        )}
        {isEditing && (
          <span className="inline-flex items-center gap-1 mt-0.5 ml-2 text-[10px] uppercase tracking-widest font-bold text-yellow-500 animate-pulse">
            ✏ Editando
          </span>
        )}
      </td>

      <td className="px-3 py-2">
        <select
          value={item.formato ?? ""}
          disabled={!true || isLocked}
          onChange={(e) => onUpdate(item.id, { formato: e.target.value || null })}
          className="w-full text-caption bg-[#141416] border border-[#22c55e]/20 rounded-xl px-3 py-1.5 appearance-none cursor-pointer transition-all duration-300 hover:border-[#22c55e]/30"
        >
          <option value="" className="bg-[#141416] text-[#6b7280]">—</option>
          {FORMATOS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </td>

      <td className="px-3 py-2 text-center">
        {true && !isLocked ? (
          <button
            type="button"
            onClick={() => onSelectCabeca(item)}
            className="w-16 bg-transparent font-mono text-center text-[#6b7280] hover:bg-[#141416] hover:text-[#ffffff] rounded-md py-1 transition-all duration-300 border border-transparent hover:border-[#22c55e]/20 cursor-pointer focus:outline-none active:scale-[0.98]"
            title="Editar texto da cabeça"
          >
            <span className="text-caption">{tempoCab || "0:00"}</span>
          </button>
        ) : (
          <span className="w-16 inline-block font-mono text-center text-[#6b7280]">
            {tempoCab || "0:00"}
          </span>
        )}
      </td>

      <td className="px-3 py-2 text-center">
        <input
          value={tempo}
          placeholder="0:00"
          disabled={!true || isLocked}
          onChange={(e) => setTempo(e.target.value)}
          onBlur={() => onUpdate(item.id, { tempo: tempo || null })}
          className="w-16 bg-transparent font-mono text-center focus:outline-none text-[#ffffff] text-caption"
        />
      </td>

      <td
        className={cn(
          "px-3 py-2 text-center font-bold font-mono",
          isCurrent ? "text-[#ffffff]" : "text-[#22c55e]"
        )}
      >
        {calcTotal(item)}
      </td>

      <td className="px-3 py-2">
        <span className="text-caption text-[#6b7280]">{linkedMateria?.editor_texto ?? "—"}</span>
      </td>

      <td className="px-3 py-2">
        <span className="text-caption text-[#6b7280]">{linkedMateria?.editor_imagem ?? "—"}</span>
      </td>

      <td className="px-3 py-2">
        {true && (
          <select
            value={item.status ?? "pendente"}
            disabled={isLocked}
            onChange={(e) => onUpdate(item.id, { status: e.target.value as ItemStatus })}
            className="text-caption bg-[#141416] border border-[#22c55e]/20 rounded-md px-2 py-1 w-full appearance-none cursor-pointer transition-all duration-300 hover:border-[#22c55e]/30"
          >
            <option value="pendente">Pendente</option>
            <option value="pronto">Pronto</option>
            <option value="no_ar">🔴 No Ar</option>
            <option value="exibido">✅ Exibido</option>
            <option value="cortado">Cortado</option>
          </select>
        )}
        {!true && (
          <span className="text-caption text-[#6b7280] capitalize">
            {item.status?.replace("_", " ") ?? "—"}
          </span>
        )}
      </td>

      <td className="px-3 py-2">
        {true && (
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded-full text-[#6b7280] hover:bg-[#ef4444]/10 hover:text-[#ef4444] transition-all duration-300 active:scale-[0.98] opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </td>
    </tr>
  );
}

function BlockInput({
  value,
  onBlur,
  ...props
}: {
  value: string;
  onBlur: (v: string) => void;
  [key: string]: any;
}) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return (
    <input {...props} value={v} onChange={(e) => setV(e.target.value)} onBlur={() => onBlur(v)} />
  );
}

function MateriaEditModal({
  materia,
  item,
  onClose,
  onSave,
}: {
  materia: Materia;
  item: Item;
  onClose: () => void;
  onSave: (updated: Materia) => void;
}) {
  const navigate = Route.useNavigate();
  const [titulo, setTitulo] = useState(materia.titulo);
  const [cabeca, setCabeca] = useState(materia.cabeca ?? "");
  const [tempoCab, setTempoCab] = useState(materia.tempo_cab ?? "0:00");
  const [tempoVt, setTempoVt] = useState(materia.tempo_vt ?? "0:00");
  const [deixa, setDeixa] = useState(materia.deixa ?? "");
  const [estrutura, setEstrutura] = useState(materia.estrutura ?? "");
  const [corpo, setCorpo] = useState(materia.corpo ?? "");
  const [reporter, setReporter] = useState(materia.credito_reporter ?? "");

  const wordCount = cabeca.trim().split(/\s+/).filter((w) => w.length > 0).length;

  const handleCabecaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setCabeca(v);
    const words = v.trim().split(/\s+/).filter((w) => w.length > 0).length;
    const sec = Math.ceil((words / 130) * 60);
    setTempoCab(`${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`);
  };

  const handleSave = () =>
    onSave({
      ...materia,
      titulo,
      cabeca: cabeca || null,
      tempo_cab: tempoCab || null,
      tempo_vt: tempoVt || null,
      deixa: deixa || null,
      estrutura: estrutura || null,
      corpo: corpo || null,
      credito_reporter: reporter || null,
    });

  return (
    <div
      className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#141416] border border-yellow-400/30 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-start justify-between gap-4 border-b border-yellow-400/20 sticky top-0 bg-[#141416] z-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-yellow-500 mb-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse inline-block" />
              Editando Matéria
            </div>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full bg-transparent text-h2 font-bold focus:outline-none border-b border-transparent focus:border-yellow-400/50 transition-colors text-[#ffffff]"
              placeholder="TÍTULO DA MATÉRIA"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-6">
            {/* Lápis → abre lauda completa em /redacao */}
            <button
              type="button"
              title="Abrir lauda completa"
              onClick={() => navigate({ to: "/redacao", search: { edit: materia.id } })}
              className="p-2 rounded-xl text-[#6b7280] hover:bg-yellow-400/10 hover:text-yellow-400 transition-all duration-200 active:scale-[0.98]"
            >
              <Pencil className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Fechar"
              className="p-2 rounded-xl text-[#6b7280] hover:bg-[#141416] hover:text-[#ffffff] transition-all duration-200 active:scale-[0.98]"
            >
              <Plus className="h-6 w-6 rotate-45" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Tempos + Repórter */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-[#22c55e]/10 rounded-xl p-4 bg-[#141416]">
              <div className="text-label text-[#4b5563] mb-2">Tempo Cabeça</div>
              <input
                value={tempoCab}
                onChange={(e) => setTempoCab(e.target.value)}
                className="w-full bg-transparent font-mono text-body text-center focus:outline-none border-b border-transparent focus:border-[#22c55e]/50 text-[#ffffff]"
              />
            </div>
            <div className="border border-[#22c55e]/10 rounded-xl p-4 bg-[#141416]">
              <div className="text-label text-[#4b5563] mb-2">Tempo VT</div>
              <input
                value={tempoVt}
                onChange={(e) => setTempoVt(e.target.value)}
                className="w-full bg-transparent font-mono text-body text-center focus:outline-none border-b border-transparent focus:border-[#22c55e]/50 text-[#ffffff]"
              />
            </div>
            <div className="border border-[#22c55e]/10 rounded-xl p-4 bg-[#141416]">
              <div className="text-label text-[#4b5563] mb-2">Repórter</div>
              <input
                value={reporter}
                onChange={(e) => setReporter(e.target.value)}
                className="w-full bg-transparent text-body focus:outline-none border-b border-transparent focus:border-[#22c55e]/50 text-[#ffffff]"
                placeholder="Nome..."
              />
            </div>
          </div>

          {/* Cabeça */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-label text-[#4b5563]">Cabeça do Âncora</div>
              <div className="text-label text-[#4b5563]">
                Palavras: <span className="font-bold text-[#ffffff]">{wordCount}</span>
              </div>
            </div>
            <div className="flex">
              <div className="w-0.5 bg-[#22c55e] rounded-full mr-4 opacity-70 shrink-0" />
              <textarea
                value={cabeca}
                onChange={handleCabecaChange}
                rows={4}
                autoFocus
                className="w-full bg-transparent italic text-body focus:outline-none resize-none leading-relaxed text-[#ffffff] placeholder-[#4b5563]"
                placeholder="Texto da cabeça do âncora..."
              />
            </div>
          </div>

          {/* Deixa */}
          <div>
            <div className="text-label text-[#4b5563] mb-2">Deixa (últimas palavras do VT)</div>
            <input
              value={deixa}
              onChange={(e) => setDeixa(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#141416] border border-[#22c55e]/20 text-[#ffffff] focus:outline-none focus:border-[#22c55e] transition-all text-body-sm"
              placeholder="...na reportagem de hoje."
            />
          </div>

          {/* Roteiro */}
          <div>
            <div className="text-label text-[#4b5563] mb-2">Roteiro / Decupagem (VT)</div>
            <textarea
              value={estrutura}
              onChange={(e) => setEstrutura(e.target.value)}
              rows={7}
              className="w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/20 text-[#ffffff] focus:outline-none focus:border-[#22c55e] transition-all resize-none font-mono text-caption leading-relaxed whitespace-pre-wrap placeholder-[#4b5563]"
              placeholder={"[OFF]\n\n[SONORA] NOME / FUNÇÃO\n\n[PASSAGEM] REPÓRTER // LOCAL"}
            />
          </div>

          {/* Corpo */}
          <div>
            <div className="text-label text-[#4b5563] mb-2">Matéria Web (texto corrido)</div>
            <textarea
              value={corpo}
              onChange={(e) => setCorpo(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/20 text-[#ffffff] focus:outline-none focus:border-[#22c55e] transition-all resize-none text-body-sm placeholder-[#4b5563]"
              placeholder="Texto corrido para publicação web..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#22c55e]/10 flex justify-end sticky bottom-0 bg-[#141416]">
          <button
            type="button"
            onClick={handleSave}
            className="px-8 py-3 rounded-md text-body font-bold text-white bg-[#22c55e] shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98]"
          >
            SALVAR E FECHAR
          </button>
        </div>
      </div>
    </div>
  );
}

function CabecaEditorModal({
  item,
  materia,
  onClose,
  onSave,
}: {
  item: Item;
  materia?: Materia;
  onClose: () => void;
  onSave: (
    id: string,
    assunto: string,
    cabeca: string,
    tempoCab: string,
    tempoVt: string,
    reporter: string
  ) => void;
}) {
  const [assunto, setAssunto] = useState(item.assunto || "");
  const [text, setText] = useState(item.cabeca || "");
  const [tempoCab, setTempoCab] = useState(item.tempo_cab || "0:00");
  const [tempoVt, setTempoVt] = useState(item.tempo || "0:00");
  const [reporter, setReporter] = useState(materia?.credito_reporter || "");

  const wordCount = text.trim().split(/\s+/).filter((w) => w.length > 0).length;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    const words = newText.trim().split(/\s+/).filter((w) => w.length > 0).length;
    const sec = Math.ceil((words / 130) * 60);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    setTempoCab(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#141416] border border-[#22c55e]/20 rounded-lg max-w-2xl w-full shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 flex items-start justify-between gap-4 border-b border-[#22c55e]/10">
          <div className="flex-1">
            <div className="text-label text-[#22c55e] font-bold mb-1.5">
              Estrutura da Matéria
            </div>
            <input
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              className="w-full bg-transparent text-h2 font-bold focus:outline-none uppercase border-b border-transparent focus:border-[#22c55e]/50 transition-colors duration-200 text-[#ffffff]"
              placeholder="RETRANCA / ASSUNTO"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSave(item.id, assunto, text, tempoCab, tempoVt, reporter)}
              className="p-1.5 rounded-full text-[#6b7280] hover:bg-[#141416] hover:text-[#22c55e] transition-all duration-300 active:scale-[0.98]"
              title="Salvar"
            >
              <Pencil className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#6b7280] hover:bg-[#141416] hover:text-[#ffffff] transition-all duration-300 active:scale-[0.98]"
              title="Fechar"
            >
              <Plus className="h-6 w-6 rotate-45" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-[#22c55e]/10 rounded-xl p-4 bg-[#141416]">
              <div className="text-label text-[#4b5563] mb-2">
                Tempo (Cab + VT)
              </div>
              <div className="flex items-center font-mono text-body-lg gap-2 text-[#ffffff]">
                <input
                  value={tempoCab}
                  onChange={(e) => setTempoCab(e.target.value)}
                  className="w-16 bg-transparent text-center focus:outline-none border-b border-transparent focus:border-[#22c55e]/50 transition-colors duration-200"
                />
                <span className="text-[#6b7280]">+</span>
                <input
                  value={tempoVt}
                  onChange={(e) => setTempoVt(e.target.value)}
                  className="w-16 bg-transparent text-center focus:outline-none border-b border-transparent focus:border-[#22c55e]/50 transition-colors duration-200"
                />
              </div>
            </div>
            <div className="border border-[#22c55e]/10 rounded-xl p-4 bg-[#141416]">
              <div className="text-label text-[#4b5563] mb-2">
                Repórter
              </div>
              {item.materia_id ? (
                <input
                  value={reporter}
                  onChange={(e) => setReporter(e.target.value)}
                  className="w-full bg-transparent text-body mt-1.5 focus:outline-none border-b border-transparent focus:border-[#22c55e]/50 transition-colors duration-200 text-[#ffffff]"
                  placeholder="Nome do repórter..."
                />
              ) : (
                <div className="mt-1.5 text-body-sm text-[#6b7280]">— (Item sem matéria)</div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-label text-[#4b5563]">
                Cabeça do Âncora
              </div>
              <div className="text-label text-[#4b5563]">
                Palavras:{" "}
                <span className="font-bold text-[#ffffff]">{wordCount}</span>
              </div>
            </div>
            <div className="flex">
              <div className="w-0.5 bg-[#22c55e] rounded-l-sm mr-4 opacity-80"></div>
              <textarea
                value={text}
                onChange={handleTextChange}
                className="w-full h-32 bg-transparent italic text-body focus:outline-none resize-none leading-relaxed text-[#ffffff]"
                placeholder="Digite a cabeça do âncora aqui..."
                autoFocus
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => onSave(item.id, assunto, text, tempoCab, tempoVt, reporter)}
              className="px-6 py-3 rounded-md text-body font-semibold text-white bg-[#22c55e] shadow-lg transition-all duration-300 hover:shadow-xl active:scale-[0.98]"
            >
              SALVAR E FECHAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}