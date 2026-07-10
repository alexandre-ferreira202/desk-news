import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Plus, Rss, ExternalLink, RefreshCw, Loader2, Printer, Trash2, Clock,
  ChevronLeft, ChevronRight, FileText, LayoutGrid, Search, Megaphone, Archive,
  CalendarIcon, Pencil, Users, MapPin, Radio, Route as RouteIcon, StickyNote,
  Image as ImageIcon, CheckCircle2, Sparkles,
} from "lucide-react";
import { fetchPortais, type PortalFeed, type PortalNews } from "@/lib/portais.functions";
import { useAuth } from "@/lib/auth";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pautas")({
  component: () => <PautasPage />,
  head: () => ({ meta: [{ title: "Pautas — DeskNews" }] }),
});

const sanitize = (v: string) => v.replace(/<[^>]*>?/gm, "").trim();

const TIPOS = ["VT", "Nota", "Nota Pelada", "Giro", "Link"] as const;
const TURNOS = ["Manhã", "Tarde", "Noite"] as const;
const PROGRAMAS_VT = ["Jornal da Manhã", "Edição Meio-Dia", "Jornal da Noite"] as const;

interface Pauta {
  id: string;
  titulo: string;
  retranca: string | null;
  tipo: string | null;
  turno: string | null;
  data_pauta: string | null;
  reporter: string | null;
  imagens: string | null;
  produtor: string | null;
  horario: string | null;
  local: string | null;
  sonora: string | null;
  contato: string | null;
  proposta: string | null;
  encaminhamento: string | null;
  observacoes: string | null;
  status: string;
  criado_por: string;
  created_at?: string;
}

interface QuadroCard {
  id: string;
  semana_inicio: string;
  dia_semana: number;
  turno: "manha" | "tarde";
  retranca: string;
  reporter: string | null;
  horario: string | null;
  ordem: number;
  autor_id: string;
}

interface Aviso { id: string; assunto: string; data: string; autor_id: string; }
interface VtGaveta { id: string; programa: string; retranca: string; data_pronto: string; observacao: string | null; autor_id: string; }

// FIX: removido `const sb: any = supabase` — era um alias desnecessário que contornava tipagem

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type Tab = "quadro" | "form" | "search" | "avisos" | "gaveta" | "portais";

/* ========================= PAGE ========================= */

function PautasPage() {
  const [tab, setTab] = useState<Tab>("quadro");
  const [pautaToEdit, setPautaToEdit] = useState<Pauta | null>(null);
  const [pautaDate, setPautaDate] = useState<Date>(new Date());

  const tabs: { k: Tab; label: string; icon: React.ElementType }[] = [
    { k: "quadro",  label: "Quadro Semanal", icon: LayoutGrid },
    { k: "form",    label: "Pauta",          icon: FileText   },
    { k: "search",  label: "Pesquisar",      icon: Search     },
    { k: "avisos",  label: "Avisos",         icon: Megaphone  },
    { k: "gaveta",  label: "Gaveta",         icon: Archive    },
    { k: "portais", label: "Portais",        icon: Rss        },
  ];

  const handleEdit = (p: Pauta) => {
    setPautaToEdit(p);
    if (p.data_pauta) setPautaDate(new Date(p.data_pauta + "T00:00:00"));
    setTab("form");
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-6 space-y-4">
      <div className="border-b border-[#22c55e]/20 pb-4 mb-1">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#22c55e] mb-1">Gestão de Conteúdo</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/40">
            <FileText className="h-5 w-5 text-[#22c55e]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-mono">Pautas</h1>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-b border-[#141416] -mx-1 px-1">
        {tabs.map(({ k, label, icon: Icon }) => (
          <button
            key={k}
            onClick={() => {
              setTab(k);
              if (k !== "form") setPautaToEdit(null);
            }}
            className={cn(
              "px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium uppercase tracking-wider border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5",
              tab === k
                ? "border-[#22c55e] text-[#22c55e] bg-[#22c55e]/5"
                : "border-transparent text-[#9ca3af] hover:text-[#22c55e] hover:bg-[#22c55e]/5"
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </nav>

      <div>
        {tab === "quadro"  && <QuadroSemanal />}
        {tab === "form"    && (
          <FormularioPauta
            initialPauta={pautaToEdit}
            initialDate={pautaDate}
            onEditingChange={(p, d) => { setPautaToEdit(p); if (d) setPautaDate(d); }}
          />
        )}
        {tab === "search"  && <SearchPautas onEdit={handleEdit} />}
        {tab === "avisos"  && <AvisosPanel />}
        {tab === "gaveta"  && <GavetaVTs />}
        {tab === "portais" && <PortaisPanel />}
      </div>
    </div>
  );
}

/* ========================= QUADRO SEMANAL ========================= */

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const r = new Date(d);
  r.setDate(d.getDate() + diff);
  r.setHours(0, 0, 0, 0);
  return r;
}

function QuadroSemanal() {
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [cards, setCards] = useState<QuadroCard[]>([]);
  const [editing, setEditing] = useState<{ dia: number; turno: "manha" | "tarde"; card?: QuadroCard } | null>(null);

  // FIX: load com useCallback para estabilizar referência usada no useEffect
  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("quadro_cards")
      .select("*")
      .eq("semana_inicio", ymd(weekStart))
      .order("ordem", { ascending: true });
    if (error) toast.error(error.message);
    else setCards((data ?? []) as QuadroCard[]);
  }, [weekStart]);

  useEffect(() => { load(); }, [load]);

  const remove = async (id: string) => {
    if (!window.confirm("Remover este card?")) return;
    const { error } = await supabase.from("quadro_cards").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  const navWeek = (delta: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(d);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => navWeek(-1)}><ChevronLeft className="h-4 w-4" /></Button>
        <div className="text-sm font-mono text-[#9ca3af]">
          Semana de <strong className="text-white">{weekStart.toLocaleDateString("pt-BR")}</strong>
        </div>
        <Button variant="outline" size="sm" onClick={() => navWeek(1)}><ChevronRight className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>Hoje</Button>
      </div>

      {/* Desktop */}
      <div className="hidden md:grid grid-cols-[120px_1fr_1fr] gap-2">
        <div />
        <div className="text-center text-[10px] uppercase tracking-[0.2em] text-[#22c55e] font-bold py-2 border-b border-[#22c55e]/20">Manhã</div>
        <div className="text-center text-[10px] uppercase tracking-[0.2em] text-[#22c55e] font-bold py-2 border-b border-[#22c55e]/20">Tarde</div>
        {DIAS.map((dia, i) => (
          <DayRow
            key={i}
            dia={dia}
            idx={i}
            cards={cards}
            onRemove={remove}
            onEdit={(c) => setEditing({ dia: i, turno: c.turno, card: c })}
            onAdd={(turno) => setEditing({ dia: i, turno })}
          />
        ))}
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {DIAS.map((dia, i) => (
          <div key={i} className="rounded border border-[#22c55e]/20 bg-[#141416] p-3 border-l-4 border-l-[#22c55e]">
            <div className="font-bold mb-2 uppercase text-sm tracking-wider text-white">{dia}</div>
            {(["manha", "tarde"] as const).map((t) => (
              <div key={t} className="mb-2">
                <div className="text-[10px] uppercase text-[#22c55e] tracking-widest mb-1">
                  {t === "manha" ? "Manhã" : "Tarde"}
                </div>
                <div className="rounded border border-[#22c55e]/10 bg-[#09090b] p-2 space-y-2 min-h-[80px]">
                  {cards.filter((c) => c.dia_semana === i && c.turno === t).map((c) => (
                    <CardMini
                      key={c.id}
                      c={c}
                      onRemove={() => remove(c.id)}
                      onEdit={() => setEditing({ dia: i, turno: t, card: c })}
                    />
                  ))}
                  <button
                    className="text-xs text-[#6b7280] hover:text-[#22c55e] flex items-center gap-1 transition-colors"
                    onClick={() => setEditing({ dia: i, turno: t })}
                  >
                    <Plus className="h-3 w-3" /> adicionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {editing && user && (
        <CardModal
          userId={user.id}
          weekStart={ymd(weekStart)}
          dia={editing.dia}
          turno={editing.turno}
          card={editing.card}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function DayRow({ dia, idx, cards, onAdd, onEdit, onRemove }: {
  dia: string; idx: number; cards: QuadroCard[];
  onAdd: (t: "manha" | "tarde") => void;
  onEdit: (c: QuadroCard) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <>
      <div className="flex items-center font-bold uppercase text-sm tracking-wider px-2 text-white border-l-4 border-l-[#22c55e]">{dia}</div>
      {(["manha", "tarde"] as const).map((t) => (
        <div key={t} className="rounded border border-[#22c55e]/20 bg-[#141416] p-2 space-y-2 min-h-[120px]">
          {cards.filter((c) => c.dia_semana === idx && c.turno === t).map((c) => (
            <CardMini key={c.id} c={c} onRemove={() => onRemove(c.id)} onEdit={() => onEdit(c)} />
          ))}
          <button
            className="text-xs text-[#6b7280] hover:text-[#22c55e] flex items-center gap-1 transition-colors"
            onClick={() => onAdd(t)}
          >
            <Plus className="h-3 w-3" /> adicionar
          </button>
        </div>
      ))}
    </>
  );
}

function CardMini({ c, onRemove, onEdit }: { c: QuadroCard; onRemove: () => void; onEdit: () => void }) {
  return (
    <div className={cn(
      "group rounded border border-[#22c55e]/20 bg-[#09090b] p-3 border-l-2 border-l-[#22c55e]",
      "transition-all duration-300 hover:bg-[#141416] hover:border-[#22c55e]/40",
      "cursor-pointer"
    )}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2 min-w-0">
          <div className="font-mono uppercase font-bold text-sm tracking-wide truncate text-white">{c.retranca}</div>
          {c.horario && <span className="text-[11px] text-[#22c55e] font-mono shrink-0">{c.horario}</span>}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="text-[#6b7280] hover:text-[#22c55e] p-1 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="text-[#6b7280] hover:text-red-500 p-1 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {c.reporter && <div className="text-[11px] text-[#6b7280] truncate mt-1">Prod: {c.reporter}</div>}
    </div>
  );
}

function CardModal({ userId, weekStart, dia, turno, card, onClose, onSaved }: {
  userId: string; weekStart: string; dia: number; turno: "manha" | "tarde";
  card?: QuadroCard;
  onClose: () => void; onSaved: () => void;
}) {
  const [retranca, setRetranca] = useState(card?.retranca ?? "");
  const [horario, setHorario]   = useState(card?.horario  ?? "");
  const [produtor, setProdutor] = useState(card?.reporter ?? "");
  const [saving, setSaving]     = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      semana_inicio: weekStart, dia_semana: dia, turno,
      retranca: retranca.toUpperCase(),
      horario: horario || null,
      reporter: produtor || null,
      autor_id: userId,
    };

    const { error } = card
      ? await supabase.from("quadro_cards").update(payload).eq("id", card.id)
      : await supabase.from("quadro_cards").insert(payload);

    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success(card ? "Card atualizado" : "Card adicionado"); onSaved(); }
  };

  return (
    <div
      className="fixed inset-0 bg-[#141416]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="rounded border border-[#22c55e]/30 bg-[#141416] p-6 w-full max-w-md space-y-3 shadow-xl border-l-4 border-l-[#22c55e]"
      >
        <h2 className="text-lg font-bold text-white">
          {card ? "Editar card" : "Novo card"} — {DIAS[dia]} / {turno === "manha" ? "Manhã" : "Tarde"}
        </h2>
        <div className="grid grid-cols-[1fr_120px] gap-3">
          <div>
            <Label>Retranca</Label>
            <input
              required
              value={retranca}
              onChange={(e) => setRetranca(e.target.value.toUpperCase())}
              className={inputCls + " font-mono uppercase"}
            />
          </div>
          <div>
            <Label>Horário</Label>
            <input
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              placeholder="09:30"
              className={inputCls + " font-mono"}
            />
          </div>
        </div>
        <div>
          <Label>Produtor</Label>
          <input value={produtor} onChange={(e) => setProdutor(e.target.value)} className={inputCls} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? "..." : (card ? "Salvar" : "Adicionar")}</Button>
        </div>
      </form>
    </div>
  );
}

/* ========================= HELPERS / STYLES ========================= */

const inputCls = "w-full px-3 py-2 rounded border border-[#22c55e]/20 bg-[#09090b] text-white text-sm focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-colors";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1.5">{children}</label>;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1.5">
      {children}{required && <span className="text-[#22c55e] ml-0.5">*</span>}
    </label>
  );
}

function SectionBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#22c55e]/20 bg-[#141416] overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[#22c55e]/15 bg-[#22c55e]/[0.03]">
        <Icon className="h-3.5 w-3.5 text-[#22c55e]" />
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9ca3af]">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

// FIX: Block agora aceita um ícone (estilo cards da página Reportagens) e mantém `n`
// como fallback opcional caso algum uso antigo ainda não passe ícone.
function Block({
  n,
  title,
  icon: Icon,
  children,
}: {
  n?: string;
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#22c55e]/15 bg-[#141416] overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[#22c55e]/15 bg-[#22c55e]/[0.03]">
        {Icon
          ? <Icon className="h-3.5 w-3.5 text-[#22c55e]" />
          : <span className="text-xs font-mono font-bold text-[#22c55e]">{n}</span>}
        <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#9ca3af]">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

/* ========================= FORMULÁRIO DE PAUTA ========================= */

function FormularioPauta({ initialPauta, initialDate, onEditingChange }: {
  initialPauta: Pauta | null;
  initialDate: Date;
  onEditingChange: (p: Pauta | null, d?: Date) => void;
}) {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>(initialDate);
  const [pautas, setPautas] = useState<Pauta[]>([]);
  const [editing, setEditing] = useState<Pauta | null>(initialPauta ?? null);

  const isToday = date.toDateString() === new Date().toDateString();

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("pautas")
      .select("*")
      .eq("data_pauta", ymd(date))
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setPautas((data ?? []) as Pauta[]);
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const create = () => {
    setEditing({
      id: "",
      titulo: "",
      retranca: null,
      tipo: null,
      turno: null,
      data_pauta: ymd(date),
      reporter: null,
      imagens: null,
      produtor: null,
      horario: null,
      local: null,
      sonora: null,
      contato: null,
      proposta: null,
      encaminhamento: null,
      observacoes: null,
      status: "rascunho",
      criado_por: user?.id ?? "",
    });
    onEditingChange(null);
  };

  const remove = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Remover?")) return;
    const { error } = await supabase.from("pautas").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
      <aside className="bg-[#141416] rounded-xl border border-[#22c55e]/15 p-4 h-fit">
        <div className="flex items-center justify-between mb-3 gap-2">
          <span className="text-[10px] uppercase tracking-widest text-[#6b7280] font-bold">
            {isToday ? "Pautas de hoje" : "Pautas do dia"}
          </span>
          <Button size="sm" onClick={create}>
            <Plus className="h-3 w-3" /> Nova
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 justify-start font-normal">
                <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                {date.toLocaleDateString("pt-BR")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
          {!isToday && (
            <Button variant="ghost" size="sm" onClick={() => setDate(new Date())}>Hoje</Button>
          )}
        </div>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {pautas.map((p) => (
            <button
              key={p.id}
              onClick={() => { setEditing(p); onEditingChange(p); }}
              className={cn(
                "w-full text-left p-3 rounded-lg border text-sm transition-all",
                editing?.id === p.id
                  ? "border-[#22c55e]/60 bg-[#22c55e]/10 text-white"
                  : "border-[#22c55e]/10 hover:border-[#22c55e]/30 bg-[#09090b] text-[#9ca3af] hover:text-white"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-bold uppercase text-white truncate">
                    {p.titulo || p.retranca || "(sem título)"}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-[#22c55e] mt-1 font-bold">
                    {p.status || "rascunho"}
                  </div>
                </div>
                {!p.retranca && (
                  <button
                    onClick={(e) => remove(p.id, e)}
                    className="p-1 rounded hover:bg-red-500/10 text-[#6b7280] hover:text-red-500 transition-colors shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </button>
          ))}
          {!pautas.length && (
            <div className="text-xs text-[#6b7280] p-2 italic">Nenhuma pauta neste dia.</div>
          )}
        </div>
      </aside>

      <section>
        {editing
          ? <PautaForm key={editing.id || "new"} initial={editing} userId={user?.id ?? ""} onSaved={load} />
          : (
            <div className="rounded-xl border border-[#22c55e]/15 bg-[#141416] p-10 text-center text-[#6b7280]">
              Selecione uma pauta ou crie uma nova.
            </div>
          )
        }
      </section>
    </div>
  );
}

/* ========================= PAUTA FORM ========================= */

// FIX: tipo explícito para evitar erros silenciosos
interface FonteItem { id: number; sonora: string; contato: string; }

function parseFontes(sonora: string | null): FonteItem[] {
  if (!sonora) return [{ id: Date.now(), sonora: "", contato: "" }];
  if (sonora.startsWith("[")) {
    try {
      const parsed = JSON.parse(sonora);
      if (Array.isArray(parsed)) return parsed;
    } catch { /* fallthrough */ }
  }
  return [{ id: Date.now(), sonora, contato: "" }];
}

function PautaForm({ initial, userId, onSaved }: { initial: Pauta; userId: string; onSaved: () => void }) {
  const [p, setP] = useState<Pauta>(initial);
  const [fontes, setFontes] = useState<FonteItem[]>(() => parseFontes(initial.sonora));
  const [saving, setSaving] = useState(false);

  // FIX: referência estável para fontes no autosave — evita re-render em loop
  const fontesRef = useRef(fontes);
  useEffect(() => { fontesRef.current = fontes; }, [fontes]);

  // Autosave local de rascunho
  useEffect(() => {
    if (p.retranca) {
      localStorage.setItem(
        `pauta_draft_${p.id || "new"}`,
        JSON.stringify({ p, fontes: fontesRef.current, ts: Date.now() })
      );
    }
  }, [p]);

  const set = <K extends keyof Pauta>(k: K, v: Pauta[K]) => setP((s) => ({ ...s, [k]: v }));

  const handleAddFonte = () => {
    setFontes((prev) => [...prev, { id: Date.now(), sonora: "", contato: "" }]);
  };

  const handleUpdateFonte = (id: number, field: "sonora" | "contato", value: string) => {
    setFontes((prev) => prev.map((f) => f.id === id ? { ...f, [field]: value } : f));
  };

  const handleRemoveFonte = (id: number) => {
    if (fontes.length > 1 && window.confirm("Remover esta fonte?")) {
      setFontes((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const save = async () => {
    if (!p.retranca?.trim()) { toast.error("Informe a retranca"); return; }
    setSaving(true);

    const sanitizedFontes = fontes.map((f) => ({
      ...f,
      sonora: sanitize(f.sonora),
      contato: sanitize(f.contato),
    }));

    const payload = {
      titulo: sanitize(p.titulo || p.retranca || ""),
      retranca: sanitize(p.retranca || ""),
      tipo: p.tipo,
      turno: p.turno,
      data_pauta: p.data_pauta || null,
      reporter: p.reporter,
      imagens: p.imagens,
      produtor: p.produtor,
      horario: p.horario,
      local: p.local,
      sonora: JSON.stringify(sanitizedFontes),
      contato: "",
      proposta: sanitize(p.proposta || ""),
      encaminhamento: sanitize(p.encaminhamento || ""),
      observacoes: sanitize(p.observacoes || ""),
    };

    if (p.id) {
      const { error } = await supabase.from("pautas").update(payload).eq("id", p.id);
      setSaving(false);
      if (error) toast.error(error.message);
      else { toast.success("Pauta salva"); onSaved(); }
    } else {
      const { data, error } = await supabase.from("pautas").insert({ ...payload, criado_por: userId }).select().single();
      setSaving(false);
      if (error) toast.error(error.message);
      else { toast.success("Pauta criada"); setP(data as Pauta); onSaved(); }
    }
  };

  const gerarPDF = () => window.print();

  const statusOpts = ["rascunho", "sugestao", "aprovada", "em_pauta", "arquivada"];

  return (
    <div className="space-y-3">

      {/* ── Cabeçalho da pauta ── */}
      <div className="rounded-xl border border-[#22c55e]/20 bg-[#141416] overflow-hidden">
        <div className="px-5 py-3 border-b border-[#22c55e]/15">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#22c55e]">
            {p.id ? "Editar Pauta" : "Nova Pauta"}
          </div>
          <div className="text-xs text-[#6b7280] mt-0.5">
            Preencha as informações da nova pauta
          </div>
        </div>
        <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e] shrink-0" />
            <span className="text-[10px] uppercase tracking-widest text-[#6b7280]">Salvo localmente</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={gerarPDF}>
              <Printer className="h-3.5 w-3.5" /> PDF
            </Button>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Salvando…</> : "Salvar Pauta"}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Título em destaque ── */}
      <div className="rounded-xl border border-[#22c55e]/20 bg-[#141416] px-5 py-4">
        <input
          className="w-full bg-transparent text-xl sm:text-2xl font-bold uppercase text-white placeholder:text-[#3f3f46] focus:outline-none tracking-wide"
          value={p.retranca ?? ""}
          onChange={(e) => set("retranca", e.target.value.toUpperCase())}
          placeholder="RETRANCA / TÍTULO DA PAUTA…"
        />
      </div>

      {/* ── Informações Básicas ── */}
      <SectionBlock icon={FileText} title="Informações Básicas">
        <div className="space-y-3">
          <div>
            <FieldLabel required>Título</FieldLabel>
            <input
              className={inputCls}
              value={p.titulo ?? ""}
              onChange={(e) => set("titulo", e.target.value)}
              placeholder="Ex: Reportagem sobre obras na BR-101"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <FieldLabel>Retranca</FieldLabel>
              <input
                className={inputCls + " font-mono uppercase"}
                value={p.retranca ?? ""}
                onChange={(e) => set("retranca", e.target.value.toUpperCase())}
                placeholder="Ex: OBRAS-BR101"
              />
            </div>
            <div>
              <FieldLabel>Tipo</FieldLabel>
              <select className={inputCls} value={p.tipo ?? ""} onChange={(e) => set("tipo", e.target.value || null)}>
                <option value="">Selecione</option>
                {TIPOS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Turno</FieldLabel>
              <select className={inputCls} value={p.turno ?? ""} onChange={(e) => set("turno", e.target.value || null)}>
                <option value="">Selecione</option>
                {TURNOS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
      </SectionBlock>

      {/* ── Data e Horário ── */}
      <SectionBlock icon={CalendarIcon} title="Data e Horário">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <FieldLabel>Data</FieldLabel>
            <input
              type="date"
              className={inputCls}
              value={p.data_pauta ?? ""}
              onChange={(e) => set("data_pauta", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Horário</FieldLabel>
            <input
              className={inputCls + " font-mono"}
              value={p.horario ?? ""}
              onChange={(e) => set("horario", e.target.value || null)}
              placeholder="09:30"
            />
          </div>
          <div>
            <FieldLabel>Status</FieldLabel>
            <select className={inputCls} value={p.status} onChange={(e) => set("status", e.target.value)}>
              {statusOpts.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </SectionBlock>

      {/* ── Equipe ── */}
      <SectionBlock icon={Users} title="Equipe">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <FieldLabel>Repórter / Jornalista</FieldLabel>
            <input
              className={inputCls}
              value={p.reporter ?? ""}
              onChange={(e) => set("reporter", e.target.value || null)}
              placeholder="Nome do repórter"
            />
          </div>
          <div>
            <FieldLabel>Produtor</FieldLabel>
            <input
              className={inputCls}
              value={p.produtor ?? ""}
              onChange={(e) => set("produtor", e.target.value || null)}
              placeholder="Nome do produtor"
            />
          </div>
        </div>
      </SectionBlock>

      {/* ── Local ── */}
      <SectionBlock icon={MapPin} title="Localização">
        <div>
          <FieldLabel>Local / Endereço</FieldLabel>
          <input
            className={inputCls}
            value={p.local ?? ""}
            onChange={(e) => set("local", e.target.value || null)}
            placeholder="Ex: Rua das Flores, 200 — Centro"
          />
        </div>
      </SectionBlock>

      {/* ── Proposta ── */}
      <SectionBlock icon={StickyNote} title="Proposta">
        <textarea
          value={p.proposta ?? ""}
          onChange={(e) => set("proposta", e.target.value || null)}
          className={inputCls + " resize-none h-24"}
          placeholder="Breve descrição da proposta de pauta..."
        />
      </SectionBlock>

      {/* ── Fontes / Sonoras ── */}
      <SectionBlock icon={Radio} title="Fontes / Sonoras">
        <div className="space-y-3">
          {fontes.map((f, idx) => (
            <div key={f.id} className="rounded-lg border border-[#22c55e]/15 bg-[#09090b] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-[#22c55e] font-bold">
                  Fonte {idx + 1}
                </span>
                {fontes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFonte(f.id)}
                    className="text-[10px] text-red-500/70 hover:text-red-500 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" /> Remover
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Sonora / Link</FieldLabel>
                  <input
                    value={f.sonora}
                    onChange={(e) => handleUpdateFonte(f.id, "sonora", e.target.value)}
                    className={inputCls}
                    placeholder="Descrição ou URL"
                  />
                </div>
                <div>
                  <FieldLabel>Contato</FieldLabel>
                  <input
                    value={f.contato}
                    onChange={(e) => handleUpdateFonte(f.id, "contato", e.target.value)}
                    className={inputCls}
                    placeholder="Tel / e-mail"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddFonte}
            className="text-xs text-[#22c55e] hover:text-[#22c55e]/80 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Adicionar fonte
          </button>
        </div>
      </SectionBlock>

      {/* ── Encaminhamento ── */}
      <SectionBlock icon={RouteIcon} title="Encaminhamento">
        <textarea
          value={p.encaminhamento ?? ""}
          onChange={(e) => set("encaminhamento", e.target.value || null)}
          className={inputCls + " resize-none h-20"}
          placeholder="Instruções para execução da pauta..."
        />
      </SectionBlock>

      {/* ── Observações ── */}
      <SectionBlock icon={StickyNote} title="Observações">
        <textarea
          value={p.observacoes ?? ""}
          onChange={(e) => set("observacoes", e.target.value || null)}
          className={inputCls + " resize-none h-20"}
          placeholder="Notas adicionais..."
        />
      </SectionBlock>

      {/* ── Mídia ── */}
      <SectionBlock icon={ImageIcon} title="Mídia">
        <div>
          <FieldLabel>URLs de Imagens / Documentos</FieldLabel>
          <textarea
            value={p.imagens ?? ""}
            onChange={(e) => set("imagens", e.target.value || null)}
            className={inputCls + " resize-none h-16 font-mono text-xs"}
            placeholder="Uma URL por linha"
          />
        </div>
      </SectionBlock>

    </div>
  );
}

/* ========================= SEARCH PAUTAS ========================= */

function SearchPautas({ onEdit }: { onEdit: (p: Pauta) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Pauta[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!q.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("pautas")
      .select("*")
      .or(`retranca.ilike.%${q}%,titulo.ilike.%${q}%`)
      .order("created_at", { ascending: false })
      .limit(50);
    setLoading(false);
    if (error) toast.error(error.message);
    else setResults((data ?? []) as Pauta[]);
  };

  useEffect(() => {
    const timer = setTimeout(search, 500);
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <div className="space-y-4">
      <div className="rounded border border-[#22c55e]/20 bg-[#141416] p-5 border-l-4 border-l-[#22c55e]">
        <Label>Pesquisar Pautas</Label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Retranca ou título..."
          className={inputCls}
        />
        <div className="text-xs text-[#6b7280] mt-2">
          {loading && "Buscando..."}
          {!loading && q && `${results.length} resultado${results.length !== 1 ? "s" : ""}`}
        </div>
      </div>

      <div className="space-y-2">
        {results.map((p) => (
          <button
            key={p.id}
            onClick={() => onEdit(p)}
            className="w-full text-left rounded border border-[#22c55e]/20 bg-[#141416] p-4 hover:bg-[#22c55e]/5 transition-colors border-l-4 border-l-[#22c55e] group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono uppercase text-xs text-[#22c55e] font-bold">{p.retranca || "(sem retranca)"}</div>
                <div className="text-sm text-white mt-1">{p.titulo}</div>
                <div className="text-xs text-[#6b7280] mt-1">
                  {p.data_pauta && new Date(p.data_pauta + "T00:00:00").toLocaleDateString("pt-BR")} · {p.reporter || "—"}
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-[#22c55e]">
                <Pencil className="h-4 w-4" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ========================= AVISOS ========================= */

function AvisosPanel() {
  const { user } = useAuth();
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [newAssunto, setNewAssunto] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("avisos").select("*").order("data", { ascending: false });
    if (error) toast.error(error.message);
    else setAvisos((data ?? []) as Aviso[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!newAssunto.trim() || !user) return;
    setSaving(true);
    const { error } = await supabase.from("avisos").insert({
      assunto: newAssunto,
      data: ymd(new Date()),
      autor_id: user.id,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else { setNewAssunto(""); load(); }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("avisos").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  return (
    <div className="space-y-4">
      <div className="rounded border border-[#22c55e]/20 bg-[#141416] p-5 border-l-4 border-l-[#22c55e]">
        <Label>Novo Aviso</Label>
        <div className="flex gap-2">
          <input
            value={newAssunto}
            onChange={(e) => setNewAssunto(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") add(); }}
            placeholder="Assunto do aviso..."
            className={inputCls}
          />
          <Button onClick={add} disabled={saving || !newAssunto.trim()}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {avisos.map((a) => (
          <div key={a.id} className="rounded border border-[#22c55e]/20 bg-[#141416] p-4 flex items-start justify-between gap-2 border-l-4 border-l-[#22c55e] group">
            <div>
              <div className="font-medium text-white">{a.assunto}</div>
              <div className="text-xs text-[#6b7280] mt-1">{new Date(a.data + "T00:00:00").toLocaleDateString("pt-BR")}</div>
            </div>
            {user?.id === a.autor_id && (
              <button
                onClick={() => remove(a.id)}
                className="opacity-0 group-hover:opacity-100 text-[#6b7280] hover:text-red-500 transition-all p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========================= GAVETA VTs ========================= */

function GavetaVTs() {
  const { user } = useAuth();
  const [vts, setVts] = useState<VtGaveta[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterPrograma, setFilterPrograma] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<VtGaveta | null>(null);
  const [editingItem, setEditingItem] = useState<VtGaveta | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vt_gaveta")
      .select("*")
      .order("data_pronto", { ascending: false });
    setLoading(false);
    if (error) toast.error(error.message);
    else setVts((data ?? []) as VtGaveta[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (id: string) => {
    if (!window.confirm("Remover?")) return;
    const { error } = await supabase.from("vt_gaveta").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  const startEdit = (v: VtGaveta) => {
    setEditingItem(v);
    setPreviewItem(null);
  };

  const filtered = filterPrograma
    ? vts.filter((v) => v.programa === filterPrograma)
    : vts;

  return (
    <div className="space-y-4">
      <div className="rounded border border-[#22c55e]/20 bg-[#141416] p-5 border-l-4 border-l-[#22c55e]">
        <Label>Filtrar por Programa</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            onClick={() => setFilterPrograma(null)}
            className={cn(
              "px-3 py-1 rounded text-xs font-medium uppercase tracking-wider transition-colors",
              !filterPrograma ? "bg-[#22c55e] text-black" : "border border-[#22c55e]/20 text-[#9ca3af] hover:text-[#22c55e]"
            )}
          >
            Todos
          </button>
          {PROGRAMAS_VT.map((p) => (
            <button
              key={p}
              onClick={() => setFilterPrograma(p)}
              className={cn(
                "px-3 py-1 rounded text-xs font-medium uppercase tracking-wider transition-colors",
                filterPrograma === p ? "bg-[#22c55e] text-black" : "border border-[#22c55e]/20 text-[#9ca3af] hover:text-[#22c55e]"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="text-xs text-[#6b7280] mt-3">
          {loading ? "Carregando…" : `${filtered.length} VT${filtered.length !== 1 ? "s" : ""}`}
        </div>
      </div>

      {editingItem && (
        <VtEditModal item={editingItem} onClose={() => setEditingItem(null)} onSaved={() => { setEditingItem(null); load(); }} />
      )}

      <div className="space-y-2">
        {filtered.map((v) => (
          <div
            key={v.id}
            onClick={() => setPreviewItem(v)}
            className="rounded border border-[#22c55e]/20 bg-[#141416] p-4 cursor-pointer hover:bg-[#22c55e]/5 transition-colors border-l-4 border-l-[#22c55e] group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-bold text-white">{v.retranca}</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e]">
                    {v.programa}
                  </span>
                </div>
                {v.observacao && (
                  <div className="text-xs text-[#6b7280] mt-1 whitespace-pre-wrap">{v.observacao}</div>
                )}
                <div className="text-xs font-mono text-[#6b7280] mt-1">
                  Pronto em {new Date(v.data_pronto + "T00:00:00").toLocaleDateString("pt-BR")}
                </div>
              </div>
              {user?.id === v.autor_id && (
                <button
                  onClick={(e) => { e.stopPropagation(); remove(v.id); }}
                  className="opacity-0 group-hover:opacity-100 text-[#6b7280] hover:text-red-500 transition-all p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
        {!filtered.length && (
          <div className="p-8 text-center text-sm text-[#6b7280] italic">Gaveta vazia.</div>
        )}
      </div>

      {previewItem && (
        <VtPreviewModal vt={previewItem} onClose={() => setPreviewItem(null)} onEdit={startEdit} />
      )}
    </div>
  );
}

function VtPreviewModal({ vt, onClose, onEdit }: { vt: VtGaveta; onClose: () => void; onEdit: (v: VtGaveta) => void }) {
  return (
    <div
      className="fixed inset-0 bg-[#141416]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#141416] border border-[#22c55e]/30 rounded max-w-2xl w-full max-h-[85vh] overflow-auto shadow-2xl border-l-4 border-l-[#22c55e]"
      >
        <div className="px-6 py-4 border-b border-[#22c55e]/20 flex items-start justify-between gap-4 sticky top-0 bg-[#141416]">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#22c55e] mb-1 font-bold">Dados do VT Arquivado</div>
            <h2 className="text-xl font-bold text-white">{vt.retranca}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onEdit(vt)}
              title="Editar VT"
              className="p-1.5 rounded hover:bg-[#22c55e]/10 text-[#6b7280] hover:text-[#22c55e] transition-all"
            >
              <Pencil className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="text-[#6b7280] hover:text-[#22c55e] transition-colors p-1"
              title="Fechar"
            >
              <Plus className="h-7 w-7 rotate-45" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-5 text-sm">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="border border-[#22c55e]/20 rounded p-3 bg-[#09090b]">
              <div className="text-[10px] uppercase tracking-widest text-[#6b7280]">Programa</div>
              <div className="mt-1 font-bold text-sm uppercase text-white">{vt.programa}</div>
            </div>
            <div className="border border-[#22c55e]/20 rounded p-3 bg-[#09090b]">
              <div className="text-[10px] uppercase tracking-widest text-[#6b7280]">Ficou pronto em</div>
              <div className="mt-1 font-bold text-sm text-white">
                {new Date(vt.data_pronto + "T00:00:00").toLocaleDateString("pt-BR")}
              </div>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#6b7280] font-bold block mb-2">
              Observações / Detalhes
            </label>
            <div className="bg-[#09090b] border border-[#22c55e]/20 rounded p-4 italic text-[#6b7280] whitespace-pre-wrap min-h-[100px]">
              {vt.observacao || "Nenhuma observação registrada para este VT."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VtEditModal({ item, onClose, onSaved }: { item: VtGaveta; onClose: () => void; onSaved: () => void }) {
  const [retranca, setRetranca] = useState(item.retranca);
  const [programa, setPrograma] = useState(item.programa);
  const [dataPronto, setDataPronto] = useState(item.data_pronto);
  const [observacao, setObservacao] = useState(item.observacao ?? "");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("vt_gaveta").update({
      retranca,
      programa,
      data_pronto: dataPronto,
      observacao: observacao || null,
    }).eq("id", item.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("VT atualizado"); onSaved(); }
  };

  return (
    <div className="fixed inset-0 bg-[#141416]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="rounded border border-[#22c55e]/30 bg-[#141416] p-6 w-full max-w-md space-y-3 shadow-xl border-l-4 border-l-[#22c55e]"
      >
        <h2 className="text-lg font-bold text-white">Editar VT</h2>
        <div>
          <Label>Retranca</Label>
          <input required value={retranca} onChange={(e) => setRetranca(e.target.value)} className={inputCls} />
        </div>
        <div>
          <Label>Programa</Label>
          <select value={programa} onChange={(e) => setPrograma(e.target.value)} className={inputCls}>
            {PROGRAMAS_VT.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <Label>Data Pronto</Label>
          <input type="date" required value={dataPronto} onChange={(e) => setDataPronto(e.target.value)} className={inputCls} />
        </div>
        <div>
          <Label>Observações</Label>
          <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} className={inputCls + " resize-none h-20"} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? "..." : "Salvar"}</Button>
        </div>
      </form>
    </div>
  );
}

/* ========================= PORTAIS ========================= */

function PortaisPanel() {
  const { user } = useAuth();
  const fetchFn = useServerFn(fetchPortais);
  const [feeds, setFeeds]   = useState<PortalFeed[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchFn();
      setFeeds(data);
      if (!active && data.length) setActive(data[0].portal);
    } catch {
      toast.error("Falha ao buscar portais");
    } finally {
      setLoading(false);
    }
  }, [active, fetchFn]);

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addAsPauta = async (item: PortalNews, portal: string) => {
    if (!user) return;
    const { error } = await supabase.from("pautas").insert({
      titulo: item.title,
      retranca: item.title.toUpperCase().slice(0, 50),
      proposta: sanitize(item.description ?? ""),
      local: portal,
      sonora: item.link,
      data_pauta: ymd(new Date()),
      criado_por: user.id,
      status: "sugestao",
    });
    if (error) toast.error(error.message);
    else toast.success("Sugestão adicionada");
  };

  const current = feeds.find((f) => f.portal === active);

  return (
    <div className="rounded border border-[#22c55e]/20 bg-[#141416] overflow-hidden border-l-4 border-l-[#22c55e]">
      <div className="flex items-center justify-between p-3 border-b border-[#22c55e]/20">
        <div className="text-xs text-[#6b7280]">
          {loading ? "Carregando…" : `${feeds.reduce((s, f) => s + f.items.length, 0)} notícias`}
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />} Atualizar
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] min-h-[400px]">
        <div className="border-r border-[#22c55e]/20 p-2 space-y-1 max-h-[600px] overflow-y-auto bg-[#09090b]">
          {feeds.map((f) => (
            <button
              key={f.portal}
              onClick={() => setActive(f.portal)}
              className={cn(
                "w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between transition-all border-l-2",
                active === f.portal
                  ? "bg-[#22c55e]/10 border-l-[#22c55e] text-[#22c55e] font-medium"
                  : "border-l-transparent text-[#9ca3af] hover:text-white hover:bg-[#22c55e]/5"
              )}
            >
              <span className="truncate">{f.portal}</span>
              <span className={cn("text-[10px] ml-2", f.error ? "text-red-500" : "text-[#6b7280]")}>
                {f.error ? "erro" : f.items.length}
              </span>
            </button>
          ))}
        </div>
        <div className="p-3 max-h-[600px] overflow-y-auto space-y-2">
          {current?.items.map((it, i) => (
            <div key={i} className="rounded border border-[#22c55e]/20 bg-[#09090b] p-3 border-l-4 border-l-[#22c55e]">
              <div className="text-sm font-medium text-white">{it.title}</div>
              {it.description && (
                <p className="text-xs text-[#6b7280] mt-1 line-clamp-2">{it.description}</p>
              )}
              <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                <div className="text-[10px] text-[#6b7280]">
                  {it.pubDate ? new Date(it.pubDate).toLocaleString("pt-BR") : ""}
                </div>
                <div className="flex items-center gap-2">
                  {it.link && (
                    <a
                      href={
                        it.link.startsWith("http")
                          ? it.link
                          : it.link.startsWith("//")
                          ? `https:${it.link}`
                          : it.link.startsWith("/")
                          ? it.link  // relativo — abrirá na origem; melhor que "#"
                          : `https://${it.link}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] inline-flex items-center gap-1 text-[#22c55e] hover:text-[#22c55e]/80 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" /> abrir
                    </a>
                  )}
                  <Button size="sm" onClick={() => addAsPauta(it, current!.portal)}>
                    <Plus className="h-3 w-3" /> usar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
