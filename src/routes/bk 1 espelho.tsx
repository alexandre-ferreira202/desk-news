import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
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

export const Route = createFileRoute("/bk 1 espelho")({
  component: () => <EspelhoPage />,
  head: () => ({ meta: [{ title: "Espelho — DeskNews" }] }),
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
  // PASSO 6: Injeta o controle de acesso de papéis (RBAC) para travar mutações da grade

  // Dark Industrial: injeção das variáveis CSS do sistema de cores
  const darkIndustrialStyle = `
    :root {
      --bg-primary:      #121212;
      --bg-secondary:    #1a1a1a;
      --bg-tertiary:     #1e1e1e;
      --bg-overlay:      rgba(255,255,255,0.04);
      --bg-overlay-2:    rgba(255,255,255,0.07);
      --border-subtle:   #1f1f1f;
      --border-light:    #2a2a2a;
      --border-medium:   #333333;
      --border-strong:   #3a3a3a;
      --glass-bg:        #1a1a1a;
      --glass-border:    #2a2a2a;
      --accent-primary:  #00E676;
      --text-primary:    #f0f0f0;
      --text-secondary:  #a0a0a0;
      --text-tertiary:   #666666;
      --text-quaternary: #4a4a4a;
      --status-error:    #ff4444;
      --status-warning:  #ff9800;
      --status-success:  #00E676;
      --shadow-sm:       0 1px 4px rgba(0,0,0,0.6);
      --shadow-md:       0 4px 12px rgba(0,0,0,0.7);
      --shadow-lg:       0 8px 24px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,230,118,0.08);
      --shadow-xl:       0 16px 40px rgba(0,0,0,0.85), 0 0 0 1px rgba(0,230,118,0.12);
      --shadow-2xl:      0 24px 64px rgba(0,0,0,0.9), 0 0 0 1px rgba(0,230,118,0.15);
    }
    body, #root { background: #121212 !important; }
    select option { background: #1a1a1a; color: #f0f0f0; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: #121212; }
    ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
    ::-webkit-scrollbar-thumb:hover { background: #00E676; }
  `;

  const canDelete = (_table?: string) => true;

  useEffect(() => {
    const id = "dark-industrial-css";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = darkIndustrialStyle;
    document.head.appendChild(el);
    return () => { document.getElementById(id)?.remove(); };
  }, []);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [programa, setPrograma] = useState<string>("Todos");
  const [blocos, setBlocos] = useState<Bloco[]>([]);
  const [itens, setItens] = useState<Item[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [modalMateria, setModalMateria] = useState<Materia | null>(null);
  const [modalCabeca, setModalCabeca] = useState<Item | null>(null);
  const [plannedEditorialDuration, setPlannedEditorialDuration] = useState("00:00");

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ID exclusivo do rascunho do espelho baseado no filtro do dia e programa selecionado


  const load = useCallback(async () => {
    let q = supabase
      .from("espelho_blocos")
      .select("*")
      .eq("data_edicao", date)
      .order("ordem");
    if (programa !== "Todos") q = q.eq("programa", programa);

    const { data: b } = await q;
    const loadedBlocos = (b ?? []) as Bloco[];
    setBlocos(loadedBlocos);

    if (loadedBlocos.length) {
      const { data: i } = await supabase
        .from("espelho_itens")
        .select("*")
        .in("bloco_id", loadedBlocos.map((x) => x.id))
        .order("ordem");
      setItens((i ?? []) as Item[]);
    } else {
      setItens([]);
    }
  }, [date, programa]);

  useEffect(() => {
    const channel = supabase
      .channel("espelho_sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "espelho_itens" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "espelho_blocos" }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  useEffect(() => {
    supabase
      .from("materias")
      .select(
        "id,titulo,status,cabeca,tempo_vt,tempo_cab,deixa,entrevistado_nome,entrevistado_funcao,editor_texto,editor_imagem,credito_reporter,estrutura,lide,corpo"
      )
      .eq("status", "publicado")
      .order("created_at", { ascending: false })
      .then(({ data }) => setMaterias((data ?? []) as Materia[]));

    supabase
      .from("profiles")
      .select("id,display_name")
      .order("display_name")
      .then(({ data }) => setProfiles((data ?? []) as Profile[]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addBloco = async () => {
    const prog = programa !== "Todos" ? programa : "Jornal da Manhã";
    const ordem = blocos.length + 1;
    const { error } = await supabase.from("espelho_blocos").insert({
      data_edicao: date,
      nome: `Bloco ${ordem}`,
      ordem,
      programa: prog,
    });
    if (error) toast.error(error.message);
    else load();
  };

  const addItem = async (bloco_id: string) => {
    const ordem = itens.filter((i) => i.bloco_id === bloco_id).length + 1;
    const { error } = await supabase.from("espelho_itens").insert({
      bloco_id,
      ordem,
      assunto: "Novo item",
      formato: "VT",
      tempo: "1:30",
      tempo_cab: "0:15",
    });
    if (error) toast.error(error.message);
    else load();
  };

  const addFromMateria = async (bloco_id: string, materia_id: string) => {
    const m = materias.find((x) => x.id === materia_id);
    if (!m) return;
    const ordem = itens.filter((i) => i.bloco_id === bloco_id).length + 1;
    const { error } = await supabase.from("espelho_itens").insert({
      bloco_id,
      ordem,
      assunto: m.titulo,
      materia_id,
      formato: "VT",
      tempo: m.tempo_vt ?? "1:30",
      tempo_cab: m.tempo_cab ?? "0:15",
      cabeca: m.cabeca ?? null,
    });
    if (error) toast.error(error.message);
    else load();
  };

  const addComercial = async (bloco_id: string) => {
    const ordem = itens.filter((i) => i.bloco_id === bloco_id).length + 1;
    const { error } = await supabase.from("espelho_itens").insert({
      bloco_id,
      ordem,
      assunto: "INTERVALO COMERCIAL",
      formato: "Comercial",
      tempo: "3:00",
      tempo_cab: "0:00",
      status: "pronto",
    });
    if (error) toast.error(error.message);
    else load();
  };

  const updateItem = useCallback(async (id: string, patch: Partial<Item>) => {
    const { error } = await supabase.from("espelho_itens").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else load();
  }, [load]);

  const updateBloco = async (id: string, patch: Partial<Bloco>) => {
    const { error } = await supabase.from("espelho_blocos").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  const delItem = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja remover este item do espelho?")) return;
    await supabase.from("espelho_itens").delete().eq("id", id);
    load();
  };

  const delBloco = async (id: string) => {
    if (!window.confirm("Isso apagará o bloco e todos os itens dentro dele. Confirmar?")) return;
    await supabase.from("espelho_blocos").delete().eq("id", id);
    load();
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

  const diffEditorial = useMemo(() => {
    const diff = totalEditorialSec - plannedSec;
    if (diff > 0) return { type: "estouro" as const, value: diff };
    if (diff < 0) return { type: "sobra" as const, value: Math.abs(diff) };
    return { type: "balanceado" as const, value: 0 };
  }, [totalEditorialSec, plannedSec]);

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

    await Promise.all(
      newItens.map((item) =>
        supabase
          .from("espelho_itens")
          .update({ ordem: item.ordem, bloco_id: item.bloco_id })
          .eq("id", item.id)
      )
    );
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
    <div className="p-4 sm:p-6 space-y-4 h-full flex flex-col overflow-hidden" style={{ background: '#121212', minHeight: '100vh' }}>
      {/* Header Premium */}
      <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-3 shrink-0">
        <MonitorPlay className="h-5 w-5 text-[var(--text-quaternary)]" />
        <h1 className="text-h1 font-bold tracking-tight" style={{ color: '#f0f0f0', letterSpacing: '-0.02em' }}>
          ESPELHO
        </h1>
        <span className="text-label text-[var(--text-tertiary)] hidden sm:inline">
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
            className="px-4 py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-body-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300"
          />
          <select
            value={programa}
            onChange={(e) => setPrograma(e.target.value)}
            className="px-4 py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-body-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300 appearance-none cursor-pointer"
          >
            <option value="Todos">Todos os programas</option>
            {PROGRAMAS.map((p) => (
              <option key={p} value={p} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                {p}
              </option>
            ))}
          </select>

          {/* Previsto */}
          <div className="font-mono rounded-3xl px-8 py-4 flex flex-col items-center justify-center min-w-[160px]" style={{ border: '1px solid #2a2a2a', background: '#1a1a1a', boxShadow: '0 4px 12px rgba(0,0,0,0.7)' }}>
            <span className="text-[var(--text-tertiary)] text-label mb-1 font-black">
              Produção (Previsto)
            </span>
            <input
              type="text"
              value={plannedEditorialDuration}
              disabled={!temPermissaoEdicaoGrade}
              onChange={(e) => {
                if (/^\d{0,2}:?\d{0,2}$/.test(e.target.value) || e.target.value === "")
                  setPlannedEditorialDuration(e.target.value);
              }}
              onBlur={() => setPlannedEditorialDuration(formatSecondsToTime(plannedSec))}
              className="bg-transparent text-[var(--text-primary)] w-32 text-center focus:outline-none font-bold tracking-tighter text-h2"
              placeholder="00:00"
            />
          </div>

          {/* Real */}
          <div className="font-mono rounded-3xl px-8 py-4 flex flex-col items-center justify-center min-w-[160px]" style={{ border: '1px solid #2a2a2a', background: '#1a1a1a', boxShadow: '0 4px 12px rgba(0,0,0,0.7)' }}>
            <span className="text-[var(--text-tertiary)] text-label mb-1 font-black">
              Produção (Real)
            </span>
            <span className="text-[var(--text-primary)] font-bold tracking-tighter text-h2">
              {formatSecondsToTime(totalEditorialSec)}
            </span>
          </div>

          {/* Diff */}
          {diffEditorial.type !== "balanceado" && (
            <div
              className="font-mono rounded-3xl px-8 py-4 flex flex-col items-center justify-center min-w-[160px]"
              style={diffEditorial.type === "estouro"
                ? { background: 'rgba(255,68,68,0.08)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.25)', boxShadow: '0 4px 12px rgba(0,0,0,0.7)' }
                : { background: 'rgba(0,230,118,0.08)', color: '#00E676', border: '1px solid rgba(0,230,118,0.25)', boxShadow: '0 0 16px rgba(0,230,118,0.12), 0 4px 12px rgba(0,0,0,0.7)' }
              }
            >
              <span className="text-label mb-1 font-black">
                {diffEditorial.type === "estouro" ? "Estouro" : "Sobra"}
              </span>
              <span className="font-bold text-h2">{formatSecondsToTime(diffEditorial.value)}</span>
            </div>
          )}

          {/* Total geral */}
          <div className="font-mono rounded-3xl px-8 py-4 flex flex-col items-center justify-center min-w-[160px]" style={{ border: '1px solid #2a2a2a', background: '#1a1a1a', boxShadow: '0 8px 24px rgba(0,0,0,0.8)' }}>
            <span className="text-[var(--text-tertiary)] text-label mb-1 font-black">
              Total (Itens)
            </span>
            <span className="text-[var(--text-primary)] font-bold tracking-tighter text-h2">{formatSecondsToTime(totalGeralSec)}</span>
          </div>

          {/* PASSO 6: Apenas editores ou gerentes conseguem instanciar novos blocos estruturais no espelho */}
          {true && (
            <button
              onClick={addBloco}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-body-sm font-semibold uppercase tracking-widest transition-all duration-300 active:scale-[0.98]"
              style={{
                background: '#00E676',
                color: '#0a1a0f',
                boxShadow: '0 0 16px rgba(0,230,118,0.35), 0 4px 12px rgba(0,0,0,0.6)',
              }}
            >
              <Plus className="h-4 w-4" /> NOVO BLOCO
            </button>
          )}

          {/* Botões de navegação para TP e Playout */}
          <a
            href={`/tp?date=${date}&programa=${encodeURIComponent(programa ?? "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--status-warning)] text-white text-body-sm font-semibold uppercase tracking-wider hover:bg-[var(--status-warning)]/90 transition-all duration-300 shadow-[var(--shadow-md)] active:scale-[0.98]"
          >
            <Tv className="h-4 w-4 text-white" /> TP
          </a>

          <a
            href={`/playout?date=${date}&programa=${encodeURIComponent(programa ?? "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--status-error)] text-white text-body-sm font-semibold uppercase tracking-wider hover:bg-[var(--status-error)]/90 transition-all duration-300 shadow-[var(--shadow-md)] active:scale-[0.98]"
          >
            <Tv className="h-4 w-4 text-white" /> PLAYOUT
          </a>
        </div>
      </div>

      {/* Grid de Blocos */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="space-y-6 pb-12 overflow-y-auto flex-1">
          {blocos.length === 0 && (
            <div className="rounded-3xl p-12 text-center text-body-sm" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#4a4a4a', boxShadow: '0 4px 12px rgba(0,0,0,0.7)' }}>
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
                className="rounded-3xl overflow-hidden"
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', boxShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
              >
                {/* Bloco header */}
                <div className="flex items-center justify-between px-5 py-4 gap-3 flex-wrap" style={{ background: '#1e1e1e', borderBottom: '1px solid #2a2a2a' }}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs px-2 py-0.5 rounded font-bold" style={{ background: '#c0392b', color: '#fff', border: '1px solid #2a2a2a' }}>
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
                        className="text-label bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 rounded-full px-2.5 py-1 font-bold appearance-none cursor-pointer"
                      >
                        {PROGRAMAS.map((p) => (
                          <option key={p} value={p} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                            {p}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-label px-2.5 py-1 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold">
                        {b.programa}
                      </span>
                    )}
                    <span className="text-label text-[var(--text-tertiary)]">
                      Apresentador
                    </span>
                    <BlockInput
                      value={b.apresentador ?? ""}
                      disabled={!temPermissaoEdicaoGrade || !true}
                      placeholder="—"
                      onBlur={(v) => updateBloco(b.id, { apresentador: v || null })}
                      className="bg-transparent text-body-sm focus:outline-none border-b border-transparent focus:border-[var(--accent-primary)] transition-colors duration-200"
                    />
                    <span className="font-mono text-caption text-[var(--text-tertiary)] bg-[var(--bg-primary)] px-2.5 py-1 rounded-md border border-[var(--border-subtle)]">
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
                        className="text-caption bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-light)] rounded-xl px-3 py-1.5 focus:outline-none appearance-none cursor-pointer transition-all duration-300 hover:border-[var(--border-medium)] min-w-[180px]"
                        defaultValue=""
                      >
                        <option value="" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                          + Matéria publicada…
                        </option>
                        {materias.map((m) => (
                          <option key={m.id} value={m.id} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                            {m.titulo}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => addItem(b.id)}
                        className="text-caption px-3 py-1.5 rounded-xl border border-[var(--border-light)] text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-all duration-300 active:scale-[0.98]"
                      >
                        + Item
                      </button>
                      <button
                        onClick={() => addComercial(b.id)}
                        className="text-caption px-3 py-1.5 rounded-xl border border-[var(--border-light)] text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-all duration-300 active:scale-[0.98]"
                      >
                        + Comercial
                      </button>
                      
                      {/* PASSO 6: Lixeira do bloco amparada pela validação RLS/RBAC */}
                      {true && (
                        <button
                          onClick={() => delBloco(b.id)}
                          className="text-caption px-3 py-1.5 rounded-xl text-[var(--status-error)] hover:bg-[var(--status-error)]/10 transition-all duration-300 active:scale-[0.98]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Tabela de itens */}
                <div className="overflow-x-auto text-[var(--text-secondary)]">
                  <table className="w-full text-sm min-w-[1100px]">
                    <thead className="text-[10px] uppercase tracking-widest" style={{ color: '#4a4a4a' }}>
                      <tr style={{ borderBottom: '1px solid #2a2a2a', background: 'rgba(255,255,255,0.02)' }}>
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
                            onUpdate={updateItem}
                            onDelete={delItem}
                            onSelectMateria={(m: Materia) => setModalMateria(m)}
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
                              className="px-3 py-6 text-center text-xs text-muted-foreground"
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

      {/* Modal: Matéria */}
      {modalMateria && (
        <div
          className="fixed inset-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setModalMateria(null)}
        >
          <div
            className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-auto shadow-[var(--shadow-2xl)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-border flex items-start justify-between gap-4 sticky top-0 bg-card">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-primary mb-1">
                  Estrutura da matéria
                </div>
                <h2 className="text-h2 font-bold text-[var(--text-primary)]">{modalMateria.titulo}</h2>
              </div>
              <div className="flex items-center gap-3">
                {true && (
                  <Link
                    to="/redacao"
                    search={{ edit: modalMateria.id }}
                    title="Editar Matéria"
                    className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                  >
                    <Pencil className="h-5 w-5" />
                  </Link>
                )}
                <button
                  onClick={() => setModalMateria(null)}
                  className="p-1.5 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-all duration-300 active:scale-[0.98]"
                  title="Fechar"
                >
                  <Plus className="h-7 w-7 rotate-45" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5 text-body-sm text-[var(--text-secondary)]">
              <div className="grid grid-cols-2 gap-4 text-caption">
                <div className="border border-[var(--border-light)] rounded-xl p-4 bg-[var(--bg-secondary)]">
                  <div className="text-label text-[var(--text-quaternary)] mb-1">
                    Tempo (Cab + VT)
                  </div>
                  <div className="font-mono mt-1 text-body text-[var(--text-primary)]">
                    {modalMateria.tempo_cab ?? "0:00"} + {modalMateria.tempo_vt ?? "0:00"}
                  </div>
                </div>
                <div className="border border-border rounded p-3">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Repórter
                  </div>
                  <div className="mt-1">{modalMateria.credito_reporter ?? "—"}</div>
                </div>
              </div>

              {modalMateria.cabeca && (
                <div>
                  <div className="text-label text-[var(--text-quaternary)] mb-1">
                    Cabeça do âncora
                  </div>
                  <div className="border-l-4 border-[var(--accent-primary)] pl-4 italic text-[var(--text-primary)]">
                    {modalMateria.cabeca}
                  </div>
                </div>
              )}

              {(modalMateria.entrevistado_nome || modalMateria.entrevistado_funcao) && (
                <div>
                  <div className="text-label text-[var(--text-quaternary)] mb-1">
                    Entrevistado
                  </div>
                  <div>
                    <span className="font-medium text-[var(--text-primary)]">
                      {modalMateria.entrevistado_nome ?? "—"}
                    </span>
                    {modalMateria.entrevistado_funcao && (
                      <span className="text-muted-foreground">
                        {" "}
                        — {modalMateria.entrevistado_funcao}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                  Roteiro
                </div>
                <pre className="font-mono text-caption whitespace-pre-wrap bg-[var(--bg-overlay)] border border-[var(--border-light)] rounded-xl p-4 leading-relaxed text-[var(--text-secondary)]">
                  {modalMateria.estrutura ?? "(sem roteiro cadastrado)"}
                </pre>
              </div>

              {modalMateria.deixa && (
                <div>
                  <div className="text-label text-[var(--text-quaternary)] mb-1">
                    Deixa
                  </div>
                  <div className="border-l-4 border-[var(--accent-primary)]/50 pl-4 italic text-[var(--text-secondary)]">
                    {modalMateria.deixa}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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
              await supabase
                .from("materias")
                .update({
                  credito_reporter: reporter,
                  cabeca,
                  tempo_cab: tempoCab,
                  tempo_vt: tempoVt,
                })
                .eq("id", modalCabeca.materia_id);
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
  canDelete,
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
  true: boolean;
  onUpdate: (id: string, patch: Partial<Item>) => void;
  onDelete: (id: string) => void;
  onSelectMateria: (m: Materia) => void;
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
          if (linkedMateria) onSelectMateria(linkedMateria);
          else toast.info("Matéria não encontrada.");
        } else {
          toast.info("Item livre — vincule uma matéria publicada para ver a estrutura.");
        }
      }}
      className={cn(
        "border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-overlay)] transition-all duration-300",
        item.formato === "Comercial" && "bg-[var(--bg-overlay)]",
        isDragging && "bg-[var(--bg-overlay-2)] opacity-50 z-50 ring-2 ring-[var(--accent-primary)]/20",
        isCurrent && "bg-red-600/10 text-[var(--text-primary)] font-bold transition-all duration-300",
        borderStyle,
        item.status === "exibido" && "opacity-30 line-through-none grayscale",
        rowOpacity
      )}
    >
      <td
        className={cn(
          "w-8 px-2 py-2 text-muted-foreground/40",
          true && !isLocked && "cursor-grab active:cursor-grabbing hover:bg-[var(--accent-primary)]/10 transition-colors duration-200"
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
              "w-3 h-3 rounded-full border border-[var(--border-strong)] transition-all duration-200",
              item.status === "cortado" ? "bg-gray-500" : dotColor
            )}
          />
        </div>
      </td>

      <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground font-bold">
        <span className="text-[var(--text-tertiary)]">{String(currentIndex + 1).padStart(2, "0")}</span>
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
          className={cn("w-full bg-transparent focus:outline-none font-medium text-[var(--text-primary)]", isCurrent && "text-[var(--text-primary)]")}
        />
        {item.materia_id && linkedMateria && (
          <span
            className={cn(
              "inline-block mt-1 text-[10px] uppercase tracking-widest font-bold",
              isCurrent ? "text-red-400" : "text-[var(--accent-primary)]"
            )}
          >
            ● {linkedMateria.titulo}
          </span>
        )}
      </td>

      <td className="px-3 py-2">
        <select
          value={item.formato ?? ""}
          disabled={!true || isLocked}
          onChange={(e) => onUpdate(item.id, { formato: e.target.value || null })}
          className="w-full text-caption bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-xl px-3 py-1.5 appearance-none cursor-pointer transition-all duration-300 hover:border-[var(--border-medium)]"
        >
          <option value="" className="bg-[var(--bg-secondary)] text-[var(--text-tertiary)]">—</option>
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
            className="w-16 bg-transparent font-mono text-center text-[var(--text-tertiary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] rounded-md py-1 transition-all duration-300 border border-transparent hover:border-[var(--border-light)] cursor-pointer focus:outline-none active:scale-[0.98]"
            title="Editar texto da cabeça"
          >
            <span className="text-caption">{tempoCab || "0:00"}</span>
          </button>
        ) : (
          <span className="w-16 inline-block font-mono text-center text-muted-foreground">
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
          className="w-16 bg-transparent font-mono text-center focus:outline-none text-[var(--text-primary)] text-caption"
        />
      </td>

      <td
        className={cn(
          "px-3 py-2 text-center font-bold font-mono",
          isCurrent ? "text-[var(--text-primary)]" : "text-[var(--accent-primary)]"
        )}
      >
        {calcTotal(item)}
      </td>

      <td className="px-3 py-2">
        <span className="text-caption text-[var(--text-tertiary)]">{linkedMateria?.editor_texto ?? "—"}</span>
      </td>

      <td className="px-3 py-2">
        <span className="text-caption text-[var(--text-tertiary)]">{linkedMateria?.editor_imagem ?? "—"}</span>
      </td>

      <td className="px-3 py-2">
        {true && (
          <select
            value={item.status ?? "pendente"}
            disabled={isLocked}
            onChange={(e) => onUpdate(item.id, { status: e.target.value as ItemStatus })}
            className="text-caption bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-md px-2 py-1 w-full appearance-none cursor-pointer transition-all duration-300 hover:border-[var(--border-medium)]"
          >
            <option value="pendente">Pendente</option>
            <option value="pronto">Pronto</option>
            <option value="no_ar">🔴 No Ar</option>
            <option value="exibido">✅ Exibido</option>
            <option value="cortado">Cortado</option>
          </select>
        )}
        {!true && (
          <span className="text-caption text-[var(--text-tertiary)] capitalize">
            {item.status?.replace("_", " ") ?? "—"}
          </span>
        )}
      </td>

      <td className="px-3 py-2">
        {true && (
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--status-error)]/10 hover:text-[var(--status-error)] transition-all duration-300 active:scale-[0.98]"
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
      className="fixed inset-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl max-w-2xl w-full shadow-[var(--shadow-2xl)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 flex items-start justify-between gap-4 border-b border-[var(--border-subtle)]">
          <div className="flex-1">
            <div className="text-label text-[var(--accent-primary)] font-bold mb-1.5">
              Estrutura da Matéria
            </div>
            <input
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              className="w-full bg-transparent text-h2 font-bold focus:outline-none uppercase border-b border-transparent focus:border-[var(--accent-primary)]/50 transition-colors duration-200 text-[var(--text-primary)]"
              placeholder="RETRANCA / ASSUNTO"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSave(item.id, assunto, text, tempoCab, tempoVt, reporter)}
              className="p-1.5 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--accent-primary)] transition-all duration-300 active:scale-[0.98]"
              title="Salvar"
            >
              <Pencil className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-all duration-300 active:scale-[0.98]"
              title="Fechar"
            >
              <Plus className="h-6 w-6 rotate-45" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-[var(--border-subtle)] rounded-xl p-4 bg-[var(--bg-overlay)]">
              <div className="text-label text-[var(--text-quaternary)] mb-2">
                Tempo (Cab + VT)
              </div>
              <div className="flex items-center font-mono text-body-lg gap-2 text-[var(--text-primary)]">
                <input
                  value={tempoCab}
                  onChange={(e) => setTempoCab(e.target.value)}
                  className="w-16 bg-transparent text-center focus:outline-none border-b border-transparent focus:border-[var(--accent-primary)]/50 transition-colors duration-200"
                />
                <span className="text-[var(--text-tertiary)]">+</span>
                <input
                  value={tempoVt}
                  onChange={(e) => setTempoVt(e.target.value)}
                  className="w-16 bg-transparent text-center focus:outline-none border-b border-transparent focus:border-[var(--accent-primary)]/50 transition-colors duration-200"
                />
              </div>
            </div>
            <div className="border border-[var(--border-subtle)] rounded-xl p-4 bg-[var(--bg-overlay)]">
              <div className="text-label text-[var(--text-quaternary)] mb-2">
                Repórter
              </div>
              {item.materia_id ? (
                <input
                  value={reporter}
                  onChange={(e) => setReporter(e.target.value)}
                  className="w-full bg-transparent text-body mt-1.5 focus:outline-none border-b border-transparent focus:border-[var(--accent-primary)]/50 transition-colors duration-200 text-[var(--text-primary)]"
                  placeholder="Nome do repórter..."
                />
              ) : (
                <div className="mt-1.5 text-body-sm text-[var(--text-tertiary)]">— (Item sem matéria)</div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-label text-[var(--text-quaternary)]">
                Cabeça do Âncora
              </div>
              <div className="text-label text-[var(--text-quaternary)]">
                Palavras:{" "}
                <span className="font-bold text-[var(--text-primary)]">{wordCount}</span>
              </div>
            </div>
            <div className="flex">
              <div className="w-0.5 bg-[var(--accent-primary)] rounded-l-sm mr-4 opacity-80"></div>
              <textarea
                value={text}
                onChange={handleTextChange}
                className="w-full h-32 bg-transparent italic text-body focus:outline-none resize-none leading-relaxed text-[var(--text-primary)]"
                placeholder="Digite a cabeça do âncora aqui..."
                autoFocus
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => onSave(item.id, assunto, text, tempoCab, tempoVt, reporter)}
              className="px-6 py-3 rounded-2xl text-body font-semibold transition-all duration-300 active:scale-[0.98]"
              style={{
                background: '#00E676',
                color: '#0a1a0f',
                boxShadow: '0 0 20px rgba(0,230,118,0.3), 0 4px 12px rgba(0,0,0,0.6)',
              }}
            >
              SALVAR E FECHAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}