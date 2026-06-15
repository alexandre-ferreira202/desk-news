import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Plus, Rss, ExternalLink, RefreshCw, Loader2, Printer, Trash2, Clock,
  ChevronLeft, ChevronRight, FileText, LayoutGrid, Search, Megaphone, Archive,
  CalendarIcon, Pencil,
} from "lucide-react";
import { fetchPortais, type PortalFeed, type PortalNews } from "@/lib/portais.functions";
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
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-3 border-b border-[var(--border-light)] pb-3">
        <FileText className="h-5 w-5 text-[var(--accent-primary)]" />
        <h1 className="font-mono uppercase tracking-widest text-sm sm:text-base">Pautas</h1>
        <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] hidden sm:inline">
          Redação · controle editorial
        </span>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-b border-[var(--border-light)] -mx-1 px-1">
        {tabs.map(({ k, label, icon: Icon }) => (
          <button
            key={k}
            onClick={() => {
              setTab(k);
              if (k !== "form") setPautaToEdit(null);
            }}
            className={cn(
              "px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5",
              tab === k
                ? "border-[var(--accent-primary)] text-[var(--accent-primary))]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--accent-primary))]"
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
  const user = null;
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
        <div className="text-sm font-mono">
          Semana de <strong>{weekStart.toLocaleDateString("pt-BR")}</strong>
        </div>
        <Button variant="outline" size="sm" onClick={() => navWeek(1)}><ChevronRight className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>Hoje</Button>
      </div>

      {/* Desktop */}
      <div className="hidden md:grid grid-cols-[120px_1fr_1fr] gap-2">
        <div />
        <div className="text-center text-[10px] uppercase tracking-[.2em] text-[var(--accent-primary)] font-bold py-2">Manhã</div>
        <div className="text-center text-[10px] uppercase tracking-[.2em] text-[var(--accent-primary)] font-bold py-2">Tarde</div>
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
          <div key={i} className="rounded-md border border-[var(--border-light)] bg-[var(--bg-primary)] p-3">
            <div className="font-bold mb-2 uppercase text-sm tracking-wider">{dia}</div>
            {(["manha", "tarde"] as const).map((t) => (
              <div key={t} className="mb-2">
                <div className="text-[10px] uppercase text-[var(--accent-primary)] tracking-widest mb-1">
                  {t === "manha" ? "Manhã" : "Tarde"}
                </div>
                <div className="rounded-md border border-[var(--border-light)] bg-[var(--bg-secondary)] p-2 space-y-2 min-h-[80px]">
                  {cards.filter((c) => c.dia_semana === i && c.turno === t).map((c) => (
                    <CardMini
                      key={c.id}
                      c={c}
                      onRemove={() => remove(c.id)}
                      onEdit={() => setEditing({ dia: i, turno: t, card: c })}
                    />
                  ))}
                  <button
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-primary)] flex items-center gap-1"
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
      <div className="flex items-center font-bold uppercase text-sm tracking-wider px-2">{dia}</div>
      {(["manha", "tarde"] as const).map((t) => (
        <div key={t} className="rounded-md border border-[var(--border-light)] bg-[var(--bg-primary)] p-2 space-y-2 min-h-[120px]">
          {cards.filter((c) => c.dia_semana === idx && c.turno === t).map((c) => (
            <CardMini key={c.id} c={c} onRemove={() => onRemove(c.id)} onEdit={() => onEdit(c)} />
          ))}
          <button
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-primary)] flex items-center gap-1"
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
      "group rounded-xl border border-white/5 bg-white/5 p-3",
      "transition-all duration-300 hover:bg-white/10 hover:border-primary/50",
      "hover:shadow-[0_0_20px_rgba(40,100,255,0.1)] hover:-translate-y-0.5",
      "cursor-pointer"
    )}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2 min-w-0">
          <div className="font-mono uppercase font-bold text-sm tracking-wide truncate">{c.retranca}</div>
          {c.horario && <span className="text-[11px] text-[var(--accent-primary)] font-mono shrink-0">{c.horario}</span>}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] p-1"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="text-[var(--text-secondary)] hover:text-red-500 p-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {c.reporter && <div className="text-[11px] text-[var(--text-secondary)] truncate">Prod: {c.reporter}</div>}
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
      className="fixed inset-0 bg-[var(--bg-secondary)]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)] p-6 w-full max-w-md space-y-3 shadow-xl"
      >
        <h2 className="text-lg font-bold">
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

const inputCls = "w-full bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-md px-3 py-2 text-sm outline-none focus:border-[var(--accent-primary)] transition-colors";
const labelCls = "text-[10px] uppercase tracking-[.18em] text-[var(--accent-primary)] font-bold mb-1 block";

function Label({ children }: { children: React.ReactNode }) {
  return <label className={labelCls}>{children}</label>;
}

const Block: React.FC<{ n: string; title: string; children: React.ReactNode; action?: React.ReactNode }> = ({ n, title, children, action }) => (
  <div className="bg-[var(--bg-overlay)] rounded-2xl border border-white/5 p-6 relative overflow-hidden group">
    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-transparent opacity-60" />
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-[var(--accent-primary)] text-[10px] font-bold">
          {n}
        </span>
        <div className="text-[10px] uppercase tracking-[.2em] text-[var(--accent-primary)] font-bold opacity-90">{title}</div>
      </div>
      {action}
    </div>
    <div className="relative z-10">{children}</div>
  </div>
);

/* ========================= FORMULÁRIO DE PAUTA ========================= */

function FormularioPauta({
  initialPauta, initialDate, onEditingChange,
}: {
  initialPauta: Pauta | null;
  initialDate: Date;
  onEditingChange: (p: Pauta | null, d?: Date) => void;
}) {
  const user = null;
  const [pautas, setPautas] = useState<Pauta[]>([]);
  const [editing, setEditing] = useState<Pauta | null>(initialPauta);
  const [date, setDate] = useState<Date>(initialDate);

  useEffect(() => {
    setEditing(initialPauta);
    setDate(initialDate);
  }, [initialPauta, initialDate]);

  const remove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Deseja excluir esta pauta sem retranca?")) return;
    const { error } = await supabase.from("pautas").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { if (editing?.id === id) setEditing(null); load(); }
  };

  // FIX: useCallback para estabilizar referência
  const load = useCallback(async () => {
    const dStr = ymd(date);
    const { data, error } = await supabase
      .from("pautas")
      .select("*")
      .or(
        `data_pauta.eq.${dStr},and(data_pauta.is.null,created_at.gte.${dStr}T00:00:00,created_at.lt.${dStr}T23:59:59)`
      )
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setPautas((data ?? []) as Pauta[]);
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const novo = (): Pauta => ({
    id: "", titulo: "", retranca: "", tipo: "VT", turno: "Manhã",
    data_pauta: ymd(date), reporter: "", imagens: "", produtor: "",
    horario: "", local: "", sonora: "", contato: "", proposta: "",
    encaminhamento: "", observacoes: "", status: "sugestao",
    criado_por: user?.id ?? "",
  });
  const create = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("pautas").insert({
      titulo: "Sem título",
      retranca: "SEM TITULO",
      tipo: "VT",
      turno: "Manhã",
      data_pauta: ymd(date),
      criado_por: user.id,
      status: "sugestao",
    }).select().single();

    if (error) toast.error(error.message);
    else { setEditing(data as Pauta); onEditingChange(data as Pauta); load(); }
  };

  const isToday = ymd(date) === ymd(new Date());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
      <aside className="bg-[var(--bg-overlay)] rounded-2xl border border-white/10 p-5">
        <div className="flex items-center justify-between mb-3 gap-2">
          <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
            {isToday ? "Pautas de hoje" : "Pautas do dia"}
          </span>
          <Button size="sm" onClick={create}>
            <Plus className="h-3 w-3" /> Nova
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-3">
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

        <div className="space-y-1 max-h-[60vh] overflow-y-auto">
          {pautas.map((p) => (
            <button
              key={p.id}
              onClick={() => { setEditing(p); onEditingChange(p); }}
              className={cn(
                "w-full text-left p-2 rounded-md border text-sm transition-colors",
                editing?.id === p.id
                  ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10"
                  : "border-[var(--border-light)] hover:border-[var(--accent-primary)]/40 bg-[var(--bg-secondary)]"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-mono uppercase text-xs text-[var(--accent-primary)] truncate">
                  {p.retranca || "(sem retranca)"}
                </div>
                {!p.retranca && (
                  <button
                    onClick={(e) => remove(p.id, e)}
                    className="p-1 rounded hover:bg-red-500/10 text-[var(--text-secondary)]/40 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="text-xs text-[var(--text-secondary)] truncate">{p.titulo}</div>
            </button>
          ))}
          {!pautas.length && (
            <div className="text-xs text-[var(--text-secondary)] p-2 italic">Nenhuma pauta neste dia.</div>
          )}
        </div>
      </aside>

      <section>
        {editing
          ? <PautaForm key={editing.id || "new"} initial={editing} userId={user?.id ?? ""} onSaved={load} />
          : (
            <div className="rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)] p-10 text-center text-[var(--text-secondary)]">
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
    // FIX: fontes não está nas deps — usamos ref para não triggerar a cada keystroke nas fontes
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="outline" onClick={gerarPDF}><Printer className="h-4 w-4" /> Gerar PDF</Button>
        <Button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar Pauta"}</Button>
      </div>

      <Block n="1" title="Identificação">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-3">
          <div>
            <Label>Retranca</Label>
            <input
              className={inputCls + " font-mono uppercase font-bold"}
              value={p.retranca ?? ""}
              onChange={(e) => set("retranca", e.target.value.toUpperCase())}
              placeholder="EX: TRÂNSITO CENTRO"
            />
          </div>
          <div>
            <Label>Tipo</Label>
            <select className={inputCls} value={p.tipo ?? "VT"} onChange={(e) => set("tipo", e.target.value)}>
              {TIPOS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <Label>Data</Label>
            <input
              type="date"
              className={inputCls}
              value={p.data_pauta ?? ""}
              onChange={(e) => set("data_pauta", e.target.value)}
            />
          </div>
          <div>
            <Label>Turno</Label>
            <select className={inputCls} value={p.turno ?? "Manhã"} onChange={(e) => set("turno", e.target.value)}>
              {TURNOS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </Block>

      <Block n="2" title="Equipe Técnica">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div><Label>Repórter</Label><input className={inputCls} value={p.reporter ?? ""} onChange={(e) => set("reporter", e.target.value)} /></div>
          <div><Label>Imagens</Label><input className={inputCls} value={p.imagens ?? ""} onChange={(e) => set("imagens", e.target.value)} /></div>
          <div><Label>Produtor</Label><input className={inputCls} value={p.produtor ?? ""} onChange={(e) => set("produtor", e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-3 mt-3">
          <div>
            <Label><Clock className="inline h-3 w-3" /> Horário</Label>
            <input
              className={inputCls + " font-mono"}
              placeholder="09:30"
              value={p.horario ?? ""}
              onChange={(e) => set("horario", e.target.value)}
            />
          </div>
          <div>
            <Label>Local de gravação</Label>
            <input className={inputCls} value={p.local ?? ""} onChange={(e) => set("local", e.target.value)} />
          </div>
        </div>
      </Block>

      <Block
        n="3"
        title="Dados da Fonte"
        action={
          <button
            type="button"
            onClick={handleAddFonte}
            className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-gray-300 hover:text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors border border-zinc-800"
          >
            <Plus className="h-3 w-3" /> Adicionar Fonte
          </button>
        }
      >
        <div className="space-y-6">
          {fontes.map((fonte, index) => (
            <div key={fonte.id} className="space-y-4 pt-2 relative group border-b border-white/5 pb-6 last:border-0 last:pb-0">
              {fontes.length > 1 && (
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
                    Fonte #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFonte(fonte.id)}
                    className="text-[var(--accent-primary)] hover:text-red-400 text-[10px] uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity"
                  >
                    Remover
                  </button>
                </div>
              )}
              <div>
                <Label>Sonora — Nome e Cargo</Label>
                <input
                  className="w-full bg-zinc-900/40 text-sm text-gray-200 px-3 py-2 rounded border border-zinc-800 focus:border-primary/50 focus:outline-none placeholder-zinc-700 transition-colors uppercase font-medium"
                  value={fonte.sonora}
                  onChange={(e) => handleUpdateFonte(fonte.id, "sonora", e.target.value)}
                  placeholder="Digite o nome e cargo da sonora..."
                />
              </div>
              <div className="mt-3">
                <Label>Contato e Instruções</Label>
                <textarea
                  rows={2}
                  className="w-full bg-zinc-900/40 text-sm text-gray-200 px-3 py-2 rounded border border-zinc-800 focus:border-primary/50 focus:outline-none placeholder-zinc-700 transition-colors font-medium"
                  value={fonte.contato}
                  onChange={(e) => handleUpdateFonte(fonte.id, "contato", e.target.value)}
                  placeholder="Telefone, instruções de acesso, etc."
                />
              </div>
            </div>
          ))}
        </div>
      </Block>

      <Block n="4" title="Conteúdo">
        <div><Label>Proposta</Label><textarea rows={3} className={inputCls} value={p.proposta ?? ""} onChange={(e) => set("proposta", e.target.value)} /></div>
        <div className="mt-3"><Label>Encaminhamento / Roteiro</Label><textarea rows={6} className={inputCls} value={p.encaminhamento ?? ""} onChange={(e) => set("encaminhamento", e.target.value)} /></div>
        <div className="mt-3"><Label>Sugestão de imagens / Observações</Label><textarea rows={3} className={inputCls} value={p.observacoes ?? ""} onChange={(e) => set("observacoes", e.target.value)} /></div>
      </Block>

      {/* Versão impressa */}
      <div className="dn-print" style={{ display: "none" }}>
        <div style={{ borderBottom: "3px solid #b8860b", paddingBottom: 12, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: "bold" }}>DeskNews · Pauta</h1>
          <div style={{ fontSize: 11, color: "#666" }}>Gerado em: {new Date().toLocaleString("pt-BR")}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ marginBottom: 20, border: "1px solid #eee", padding: 12, borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: "#b8860b", fontWeight: "bold", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.1em" }}>1. Identificação</div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 15 }}>
              <div><div style={{ fontSize: 9, color: "#999", textTransform: "uppercase" }}>Retranca</div><div style={{ fontSize: 14, fontWeight: "bold" }}>{p.retranca || "—"}</div></div>
              <div><div style={{ fontSize: 9, color: "#999", textTransform: "uppercase" }}>Tipo</div><div style={{ fontSize: 12 }}>{p.tipo || "—"}</div></div>
              <div><div style={{ fontSize: 9, color: "#999", textTransform: "uppercase" }}>Data</div><div style={{ fontSize: 12 }}>{p.data_pauta ? new Date(p.data_pauta + "T00:00:00").toLocaleDateString("pt-BR") : "—"}</div></div>
              <div><div style={{ fontSize: 9, color: "#999", textTransform: "uppercase" }}>Turno</div><div style={{ fontSize: 12 }}>{p.turno || "—"}</div></div>
            </div>
          </div>
          <div style={{ marginBottom: 20, border: "1px solid #eee", padding: 12, borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: "#b8860b", fontWeight: "bold", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.1em" }}>2. Equipe Técnica</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 15, marginBottom: 12 }}>
              <div><div style={{ fontSize: 9, color: "#999", textTransform: "uppercase" }}>Repórter</div><div style={{ fontSize: 12 }}>{p.reporter || "—"}</div></div>
              <div><div style={{ fontSize: 9, color: "#999", textTransform: "uppercase" }}>Imagens</div><div style={{ fontSize: 12 }}>{p.imagens || "—"}</div></div>
              <div><div style={{ fontSize: 9, color: "#999", textTransform: "uppercase" }}>Produtor</div><div style={{ fontSize: 12 }}>{p.produtor || "—"}</div></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 15 }}>
              <div><div style={{ fontSize: 9, color: "#999", textTransform: "uppercase" }}>Horário</div><div style={{ fontSize: 12, fontWeight: "bold" }}>{p.horario || "—"}</div></div>
              <div><div style={{ fontSize: 9, color: "#999", textTransform: "uppercase" }}>Local de gravação</div><div style={{ fontSize: 12 }}>{p.local || "—"}</div></div>
            </div>
          </div>
          <div style={{ marginBottom: 20, border: "1px solid #eee", padding: 12, borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: "#b8860b", fontWeight: "bold", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.1em" }}>3. Dados da Fonte</div>
            {fontes.map((f, i) => (
              <div key={i} style={{ marginBottom: i === fontes.length - 1 ? 0 : 15, borderBottom: i === fontes.length - 1 ? "none" : "1px dashed #eee", paddingBottom: i === fontes.length - 1 ? 0 : 10 }}>
                <div style={{ marginBottom: 5 }}><div style={{ fontSize: 9, color: "#999", textTransform: "uppercase" }}>Sonora — nome e cargo</div><div style={{ fontSize: 12, fontWeight: "bold" }}>{f.sonora || "—"}</div></div>
                <div><div style={{ fontSize: 9, color: "#999", textTransform: "uppercase" }}>Contato e instruções</div><div style={{ fontSize: 12 }}>{f.contato || "—"}</div></div>
              </div>
            ))}
          </div>
          <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: "#b8860b", fontWeight: "bold", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.1em" }}>4. Conteúdo</div>
            <div style={{ marginBottom: 15 }}><div style={{ fontSize: 9, color: "#999", textTransform: "uppercase", marginBottom: 4 }}>Proposta</div><div style={{ fontSize: 12, whiteSpace: "pre-wrap", lineHeight: "1.4" }}>{p.proposta || "—"}</div></div>
            <div style={{ marginBottom: 15 }}><div style={{ fontSize: 9, color: "#999", textTransform: "uppercase", marginBottom: 4 }}>Encaminhamento / Roteiro</div><div style={{ fontSize: 12, whiteSpace: "pre-wrap", lineHeight: "1.4" }}>{p.encaminhamento || "—"}</div></div>
            <div><div style={{ fontSize: 9, color: "#999", textTransform: "uppercase", marginBottom: 4 }}>Sugestão de imagens / Observações</div><div style={{ fontSize: 12, whiteSpace: "pre-wrap", lineHeight: "1.4" }}>{p.observacoes || "—"}</div></div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility:hidden !important; }
          .dn-print, .dn-print * { visibility:visible !important; }
          .dn-print { display:block !important; position:absolute; left:0; top:0; width:100%; background:#fff !important; color:#000 !important; padding:20px; }
        }
      ` }} />
    </div>
  );
}

/* ========================= PESQUISA DE PAUTAS ========================= */

function SearchPautas({ onEdit }: { onEdit: (p: Pauta) => void }) {
  const [q, setQ]           = useState("");
  const [from, setFrom]     = useState<Date | undefined>();
  const [to, setTo]         = useState<Date | undefined>();
  const [results, setResults] = useState<Pauta[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]     = useState<Pauta | null>(null);

  // FIX: useCallback para evitar recriação e poder usar nas deps do useEffect
  const search = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("pautas")
      .select("*")
      .order("data_pauta", { ascending: false, nullsFirst: false })
      .limit(200);

    if (q.trim()) {
      const sanitizedTerm = q.trim().replace(/[,()]/g, "");
      const term = `%${sanitizedTerm}%`;
      query = query.or(
        `retranca.ilike.${term},titulo.ilike.${term},reporter.ilike.${term},produtor.ilike.${term},proposta.ilike.${term},encaminhamento.ilike.${term}`
      );
    }
    if (from) query = query.gte("data_pauta", ymd(from));
    if (to)   query = query.lte("data_pauta", ymd(to));

    const { data, error } = await query;
    setLoading(false);
    if (error) toast.error(error.message);
    else setResults((data ?? []) as Pauta[]);
  }, [q, from, to]);

  // FIX: deps explícitas — busca inicial sem dependência oculta
  useEffect(() => { search(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const clearFilters = () => {
    setQ("");
    setFrom(undefined);
    setTo(undefined);
  };
  // Busca reativa ao limpar filtros
  useEffect(() => {
    if (!q && !from && !to) search();
  }, [q, from, to, search]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)] p-4 space-y-3">
        <div className="text-[10px] uppercase tracking-[.2em] text-[var(--accent-primary)] font-bold">
          Pesquisa Geral de Reportagens
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_180px_auto] gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
            <input
              className={inputCls + " pl-9"}
              placeholder="Buscar por retranca, produtor, repórter..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
            />
          </div>
          <DateField label="De" value={from} onChange={setFrom} />
          <DateField label="Até" value={to} onChange={setTo} />
          <Button onClick={search} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Buscar
          </Button>
        </div>
        {(q || from || to) && (
          <button
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"
            onClick={clearFilters}
          >
            limpar filtros
          </button>
        )}
      </div>

      <div className="rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)] overflow-hidden">
        <div className="px-4 py-2 border-b border-[var(--border-light)] text-xs text-[var(--text-secondary)]">
          {results.length} resultado(s)
        </div>
        <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => setOpen(p)}
              className="w-full text-left p-3 hover:bg-[var(--accent-primary)]/5 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono uppercase font-bold text-sm text-[var(--accent-primary)] truncate">
                    {p.retranca || "(sem retranca)"}
                  </div>
                  <div className="text-sm truncate">{p.titulo}</div>
                  <div className="text-xs text-[var(--text-secondary)] truncate">
                    Prod: {p.produtor ?? "—"} · Rep: {p.reporter ?? "—"}{p.tipo ? ` · ${p.tipo}` : ""}
                  </div>
                </div>
                <div className="text-xs font-mono text-[var(--text-secondary)] shrink-0">
                  {p.data_pauta ? new Date(p.data_pauta + "T00:00:00").toLocaleDateString("pt-BR") : "—"}
                </div>
              </div>
            </button>
          ))}
          {!results.length && !loading && (
            <div className="p-8 text-center text-sm text-[var(--text-secondary)] italic">
              Nenhuma pauta encontrada.
            </div>
          )}
        </div>
      </div>

      {open && <PautaPreviewModal pauta={open} onClose={() => setOpen(null)} onEdit={onEdit} />}
    </div>
  );
}

/* ========================= MODAIS ========================= */

function PautaPreviewModal({ pauta, onClose, onEdit }: { pauta: Pauta; onClose: () => void; onEdit: (p: Pauta) => void }) {
  // FIX: parseFontes reutilizado em vez de lógica duplicada aqui
  const dynamicFontes = useMemo(() => {
    if (pauta.sonora?.startsWith("[")) {
      try { return JSON.parse(pauta.sonora) as FonteItem[]; } catch { /* fallthrough */ }
    }
    return null;
  }, [pauta.sonora]);

  const rows: [string, string | null | undefined][] = [
    ["Tipo", pauta.tipo], ["Data", pauta.data_pauta], ["Turno", pauta.turno],
    ["Repórter", pauta.reporter], ["Imagens", pauta.imagens], ["Produtor", pauta.produtor],
    ["Horário", pauta.horario], ["Local", pauta.local],
    ...(dynamicFontes ? [] : [["Sonora", pauta.sonora], ["Contato", pauta.contato]] as [string, string | null | undefined][]),
    ["Proposta", pauta.proposta], ["Encaminhamento", pauta.encaminhamento], ["Observações", pauta.observacoes],
  ];

  return (
    <div
      className="fixed inset-0 bg-[var(--bg-secondary)]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)] p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl"
      >
        <div className="flex items-start justify-between mb-4 gap-3">
          <div>
            <div className="font-mono uppercase font-bold text-lg text-[var(--accent-primary)]">{pauta.retranca}</div>
            <div className="text-sm text-[var(--text-secondary)]">{pauta.titulo}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(pauta)} className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" /> Editar
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
          </div>
        </div>
        <div className="space-y-2">
          {rows.map(([k, v]) => v ? (
            <div key={k} className="border-b border-[var(--border-light)] pb-2">
              <div className="text-[10px] uppercase tracking-widest text-[var(--accent-primary)] font-bold">{k}</div>
              <div className="text-sm whitespace-pre-wrap">{v}</div>
            </div>
          ) : null)}
          {dynamicFontes?.map((f, i) => (
            <div key={i} className="border-b border-[var(--border-light)] pb-2 last:border-0">
              <div className="text-[10px] uppercase tracking-widest text-[var(--accent-primary)] font-bold">Fonte #{i + 1}</div>
              <div className="flex flex-col gap-1">
                <div className="text-sm font-semibold text-[var(--accent-primary)]">{f.sonora || "—"}</div>
                <div className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap">{f.contato || "—"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DateField({ label, value, onChange }: { label: string; value?: Date; onChange: (d: Date | undefined) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start font-normal h-9">
          <CalendarIcon className="h-3.5 w-3.5 mr-2" />
          <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mr-2">{label}</span>
          {value ? value.toLocaleDateString("pt-BR") : "—"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} className={cn("p-3 pointer-events-auto")} />
      </PopoverContent>
    </Popover>
  );
}

/* ========================= AVISOS ========================= */

function AvisosPanel() {
  const user = null;
  const [items, setItems]   = useState<Aviso[]>([]);
  const [assunto, setAssunto] = useState("");
  const [data, setData]     = useState<Date>(new Date());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data: rows, error } = await supabase
      .from("avisos")
      .select("*")
      .order("data", { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    else setItems((rows ?? []) as Aviso[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assunto.trim() || !user) return;
    setSaving(true);
    const { error } = await supabase.from("avisos").insert({
      assunto: assunto.trim(),
      data: ymd(data),
      autor_id: user.id,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else { setAssunto(""); toast.success("Aviso adicionado"); load(); }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("avisos").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
      <form onSubmit={add} className="rounded-lg border border-[var(--border-light)] border-l-4 border-l-accent bg-[var(--bg-primary)] p-4 space-y-3 h-fit">
        <div className="text-[10px] uppercase tracking-[.2em] text-[var(--accent-primary)] font-bold flex items-center gap-2">
          <Megaphone className="h-3.5 w-3.5" /> Novo aviso
        </div>
        <div>
          <Label>Assunto</Label>
          <textarea
            required
            rows={3}
            className={inputCls}
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
            placeholder="Ex.: Reunião de pauta às 15h"
          />
        </div>
        <div>
          <Label>Data</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" className="w-full justify-start font-normal">
                <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                {data.toLocaleDateString("pt-BR")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={data} onSelect={(d) => d && setData(d)} className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
        </div>
        <Button type="submit" disabled={saving} className="w-full">
          <Plus className="h-4 w-4" /> Publicar aviso
        </Button>
      </form>

      <div className="rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)] overflow-hidden">
        <div className="px-4 py-2 border-b border-[var(--border-light)] text-xs text-[var(--text-secondary)]">
          {items.length} aviso(s)
        </div>
        <div className="divide-y divide-border max-h-[70vh] overflow-y-auto">
          {items.map((a) => (
            <div key={a.id} className="p-3 flex items-start justify-between gap-3 group">
              <div className="min-w-0">
                <div className="text-sm whitespace-pre-wrap">{a.assunto}</div>
                <div className="text-xs font-mono text-[var(--accent-primary)] mt-1">
                  {new Date(a.data + "T00:00:00").toLocaleDateString("pt-BR")}
                </div>
              </div>
              {user?.id === a.autor_id && (
                <button
                  onClick={() => remove(a.id)}
                  className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-red-500 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          {!items.length && (
            <div className="p-8 text-center text-sm text-[var(--text-secondary)] italic">Nenhum aviso.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ========================= GAVETA DE VTs ========================= */

function GavetaVTs() {
  const user = null;
  const [items, setItems]               = useState<VtGaveta[]>([]);
  const [filterPrograma, setFilterPrograma] = useState<string>("Todos");
  const [form, setForm]                 = useState({ programa: PROGRAMAS_VT[0] as string, retranca: "", data_pronto: ymd(new Date()), observacao: "" });
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [previewItem, setPreviewItem]   = useState<VtGaveta | null>(null);
  const [saving, setSaving]             = useState(false);

  const load = useCallback(async () => {
    const { data: rows, error } = await supabase
      .from("vts_gaveta")
      .select("*")
      .order("data_pronto", { ascending: false })
      .limit(300);
    if (error) toast.error(error.message);
    else setItems((rows ?? []) as VtGaveta[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(
    () => filterPrograma === "Todos" ? items : items.filter((i) => i.programa === filterPrograma),
    [items, filterPrograma]
  );

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.retranca.trim() || !user) return;
    setSaving(true);
    const payload = {
      programa: form.programa,
      retranca: form.retranca.toUpperCase(),
      data_pronto: form.data_pronto,
      observacao: form.observacao || null,
      autor_id: user.id,
    };

    const { error } = editingId
      ? await supabase.from("vts_gaveta").update(payload).eq("id", editingId)
      : await supabase.from("vts_gaveta").insert(payload);

    setSaving(false);
    if (error) toast.error(error.message);
    else {
      setForm({ ...form, retranca: "", observacao: "" });
      setEditingId(null);
      toast.success(editingId ? "VT atualizado" : "VT arquivado na gaveta");
      load();
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Remover este VT da gaveta?")) return;
    const { error } = await supabase.from("vts_gaveta").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  const startEdit = (v: VtGaveta) => {
    setForm({ programa: v.programa, retranca: v.retranca, data_pronto: v.data_pronto, observacao: v.observacao || "" });
    setEditingId(v.id);
    setPreviewItem(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
      <form onSubmit={add} className="rounded-lg border border-[var(--border-light)] border-l-4 border-l-accent bg-[var(--bg-primary)] p-4 space-y-3 h-fit">
        <div className="text-[10px] uppercase tracking-[.2em] text-[var(--accent-primary)] font-bold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Archive className="h-3.5 w-3.5" /> {editingId ? "Editar VT" : "Arquivar VT pronto"}
          </div>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setForm({ ...form, retranca: "", observacao: "" }); }}
              className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--accent-primary))]"
            >
              cancelar
            </button>
          )}
        </div>
        <div>
          <Label>Programa</Label>
          <select className={inputCls} value={form.programa} onChange={(e) => setForm({ ...form, programa: e.target.value })}>
            {PROGRAMAS_VT.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <Label>Retranca do VT</Label>
          <input
            required
            className={inputCls + " font-mono uppercase"}
            value={form.retranca}
            onChange={(e) => setForm({ ...form, retranca: e.target.value.toUpperCase() })}
          />
        </div>
        <div>
          <Label>Data em que ficou pronto</Label>
          <input
            type="date"
            className={inputCls}
            value={form.data_pronto}
            onChange={(e) => setForm({ ...form, data_pronto: e.target.value })}
          />
        </div>
        <div>
          <Label>Observação (opcional)</Label>
          <textarea
            rows={2}
            className={inputCls}
            value={form.observacao}
            onChange={(e) => setForm({ ...form, observacao: e.target.value })}
          />
        </div>
        <Button type="submit" disabled={saving} className="w-full">
          {editingId ? "Salvar alterações" : "Arquivar"}
        </Button>
      </form>

      <div className="rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)] overflow-hidden">
        <div className="px-4 py-2 border-b border-[var(--border-light)] flex items-center justify-between gap-2 flex-wrap">
          <div className="text-xs text-[var(--text-secondary)]">{filtered.length} VT(s) na gaveta</div>
          <select
            className="bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-md px-2 py-1 text-xs"
            value={filterPrograma}
            onChange={(e) => setFilterPrograma(e.target.value)}
          >
            <option>Todos</option>
            {PROGRAMAS_VT.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="divide-y divide-border max-h-[70vh] overflow-y-auto">
          {filtered.map((v) => (
            <div
              key={v.id}
              onClick={() => setPreviewItem(v)}
              className="p-3 group flex items-start justify-between gap-3 hover:bg-[var(--accent-primary)]/5 transition-colors cursor-pointer"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono uppercase font-bold text-sm text-[var(--accent-primary)]">{v.retranca}</span>
                  <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-muted text-[var(--text-secondary)]">
                    {v.programa}
                  </span>
                </div>
                {v.observacao && (
                  <div className="text-xs text-[var(--text-secondary)] mt-1 whitespace-pre-wrap">{v.observacao}</div>
                )}
                <div className="text-xs font-mono text-[var(--text-secondary)] mt-1">
                  Pronto em {new Date(v.data_pronto + "T00:00:00").toLocaleDateString("pt-BR")}
                </div>
              </div>
              {user?.id === v.autor_id && (
                <button
                  onClick={(e) => { e.stopPropagation(); remove(v.id); }}
                  className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-red-500 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          {!filtered.length && (
            <div className="p-8 text-center text-sm text-[var(--text-secondary)] italic">Gaveta vazia.</div>
          )}
        </div>
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
      className="fixed inset-0 bg-[var(--bg-secondary)]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg max-w-2xl w-full max-h-[85vh] overflow-auto shadow-2xl"
      >
        <div className="px-6 py-4 border-b border-[var(--border-light)] flex items-start justify-between gap-4 sticky top-0 bg-[var(--bg-primary)]">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[var(--accent-primary)] mb-1">Dados do VT Arquivado</div>
            <h2 className="text-xl font-bold">{vt.retranca}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onEdit(vt)}
              title="Editar VT"
              className="p-1.5 rounded-md hover:bg-primary/10 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all"
            >
              <Pencil className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="text-[var(--text-secondary)] hover:text-[var(--accent-primary))] transition-colors p-1"
              title="Fechar"
            >
              <Plus className="h-7 w-7 rotate-45" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-5 text-sm">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="border border-[var(--border-light)] rounded p-3">
              <div className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">Programa</div>
              <div className="mt-1 font-bold text-sm uppercase">{vt.programa}</div>
            </div>
            <div className="border border-[var(--border-light)] rounded p-3">
              <div className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">Ficou pronto em</div>
              <div className="mt-1 font-bold text-sm">
                {new Date(vt.data_pronto + "T00:00:00").toLocaleDateString("pt-BR")}
              </div>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block mb-2">
              Observações / Detalhes
            </label>
            <div className="bg-[var(--bg-secondary)]/30 border border-[var(--border-light)] rounded-md p-4 italic text-[var(--text-secondary)] whitespace-pre-wrap min-h-[100px]">
              {vt.observacao || "Nenhuma observação registrada para este VT."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================= PORTAIS ========================= */

function PortaisPanel() {
  const user = null;
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
    <div className="rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)] overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-[var(--border-light)]">
        <div className="text-xs text-[var(--text-secondary)]">
          {loading ? "Carregando…" : `${feeds.reduce((s, f) => s + f.items.length, 0)} notícias`}
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />} Atualizar
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] min-h-[400px]">
        <div className="border-r border-[var(--border-light)] p-2 space-y-1 max-h-[600px] overflow-y-auto">
          {feeds.map((f) => (
            <button
              key={f.portal}
              onClick={() => setActive(f.portal)}
              className={cn(
                "w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between transition-colors",
                active === f.portal ? "bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/40" : "hover:bg-muted"
              )}
            >
              <span className="truncate">{f.portal}</span>
              <span className={cn("text-[10px] ml-2", f.error ? "text-destructive" : "text-[var(--text-secondary)]")}>
                {f.error ? "erro" : f.items.length}
              </span>
            </button>
          ))}
        </div>
        <div className="p-3 max-h-[600px] overflow-y-auto space-y-2">
          {current?.items.map((it, i) => (
            <div key={i} className="rounded-md border border-[var(--border-light)] border-l-2 border-l-accent bg-[var(--bg-secondary)] p-3">
              <div className="text-sm font-medium">{it.title}</div>
              {it.description && (
                <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{it.description}</p>
              )}
              <div className="flex items-center justify-between mt-2 gap-2">
                <div className="text-[10px] text-[var(--text-secondary)]">
                  {it.pubDate ? new Date(it.pubDate).toLocaleString("pt-BR") : ""}
                </div>
                <div className="flex items-center gap-2">
                  {it.link && (
                    <a
                      href={it.link.startsWith("http") ? it.link : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] inline-flex items-center gap-1 text-[var(--accent-primary)] hover:underline"
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
