import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Plus, Rss, ExternalLink, RefreshCw, Loader2, Printer, Trash2, Clock,
  ChevronLeft, ChevronRight, FileText, LayoutGrid, Search, Megaphone, Archive,
  CalendarIcon, Pencil, MapPin,
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

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type Tab = "quadro" | "form" | "search" | "avisos" | "gaveta" | "portais";

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
    <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-6 space-y-6">
      <div className="mb-8">
        <p className="text-xs text-slate-600 font-mono uppercase tracking-widest mb-2">Gestão de Conteúdo</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/40">
            <FileText className="h-5 w-5 text-[#22c55e]" />
          </div>
          <h1 className="text-3xl font-black tracking-tight font-mono uppercase text-white">PAUTAS</h1>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-b border-[#22c55e]/20 pb-5 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {tabs.map(({ k, label, icon: Icon }) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-body-sm font-sans uppercase tracking-wider font-bold transition-all ${
                tab === k
                  ? "bg-[#22c55e]/20 border border-[#22c55e] text-[#22c55e]"
                  : "bg-transparent border border-[#22c55e]/30 text-slate-400 hover:border-[#22c55e]/50 hover:text-slate-300"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setPautaToEdit(null);
            setPautaDate(new Date());
            setTab("form");
          }}
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-[#22c55e]/10 border border-[#22c55e] text-[#22c55e] text-xs font-black uppercase tracking-wider transition-all hover:bg-[#22c55e]/20 hover:shadow-lg hover:shadow-[#22c55e]/20 active:scale-95 font-mono"
        >
          <Plus className="h-5 w-5" /> Nova Pauta
        </button>
      </div>

      {tab === "quadro" && <QuadroTab pautaDate={pautaDate} setPautaDate={setPautaDate} onEdit={handleEdit} />}
      {tab === "form" && <FormTab pautaToEdit={pautaToEdit} pautaDate={pautaDate} onSaved={() => { setPautaToEdit(null); setTab("quadro"); }} />}
      {tab === "search" && <SearchTab onEdit={handleEdit} />}
      {tab === "avisos" && <AvisosTab />}
      {tab === "gaveta" && <GavetaTab />}
      {tab === "portais" && <PortaisTab />}
    </div>
  );
}

const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

function inicioDaSemana(d: Date) {
  const dt = new Date(d);
  const dow = dt.getDay(); // 0=Domingo
  const diff = dow === 0 ? -6 : 1 - dow; // volta até segunda
  dt.setDate(dt.getDate() + diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function QuadroTab({ pautaDate, setPautaDate, onEdit }: { pautaDate: Date; setPautaDate: (d: Date) => void; onEdit: (p: Pauta) => void }) {
  const [semanaInicio, setSemanaInicio] = useState<Date>(() => inicioDaSemana(pautaDate));
  const [cards, setCards] = useState<QuadroCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoCard, setNovoCard] = useState<{ dia: number; turno: "manha" | "tarde" } | null>(null);
  const [retranca, setRetranca] = useState("");
  const [reporter, setReporter] = useState("");
  const [horario, setHorario] = useState("");
  const [saving, setSaving] = useState(false);

  const semanaStr = ymd(semanaInicio);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quadro_cards")
      .select("*")
      .eq("semana_inicio", semanaStr)
      .order("ordem", { ascending: true });
    if (error) toast.error(error.message);
    else setCards((data ?? []) as QuadroCard[]);
    setLoading(false);
  }, [semanaStr]);

  useEffect(() => { load(); }, [load]);

  const mudarSemana = (delta: number) => {
    const nova = new Date(semanaInicio);
    nova.setDate(nova.getDate() + delta * 7);
    setSemanaInicio(nova);
  };

  const abrirNovoCard = (dia: number, turno: "manha" | "tarde") => {
    setNovoCard({ dia, turno });
    setRetranca(""); setReporter(""); setHorario("");
  };

  const salvarCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoCard || !sanitize(retranca)) return toast.error("Informe a retranca.");
    setSaving(true);
    const ordemAtual = cards.filter((c) => c.dia_semana === novoCard.dia && c.turno === novoCard.turno).length;
    const { error } = await supabase.from("quadro_cards").insert({
      semana_inicio: semanaStr,
      dia_semana: novoCard.dia,
      turno: novoCard.turno,
      retranca: sanitize(retranca),
      reporter: reporter ? sanitize(reporter) : null,
      horario: horario || null,
      ordem: ordemAtual,
      // TODO: quando o login voltar, trocar null por supabase.auth.getUser() -> user.id
      autor_id: null,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Card adicionado!");
      setNovoCard(null);
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este card do quadro?")) return;
    const { error } = await supabase.from("quadro_cards").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Card removido."); load(); }
  };

  const cardsDe = (dia: number, turno: "manha" | "tarde") =>
    cards.filter((c) => c.dia_semana === dia && c.turno === turno);

  const fimSemana = new Date(semanaInicio);
  fimSemana.setDate(fimSemana.getDate() + 6);

  const inputCls = "w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all font-mono";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-4 backdrop-blur-lg shadow-2xl">
        <button onClick={() => mudarSemana(-1)} className="p-2 rounded-md text-slate-400 hover:bg-[#1a1a21] hover:text-[#22c55e] transition-all">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-xs sm:text-sm font-mono uppercase tracking-widest text-slate-300 font-bold">
          {semanaInicio.toLocaleDateString("pt-BR")} — {fimSemana.toLocaleDateString("pt-BR")}
        </p>
        <button onClick={() => mudarSemana(1)} className="p-2 rounded-md text-slate-400 hover:bg-[#1a1a21] hover:text-[#22c55e] transition-all">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 italic font-mono text-xs">CARREGANDO...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
          {DIAS_SEMANA.map((nomeDia, dia) => (
            <div key={dia} className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-3 backdrop-blur-lg shadow-xl space-y-3">
              <p className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold text-center pb-2 border-b border-[#22c55e]/10">
                {nomeDia}
              </p>

              {(["manha", "tarde"] as const).map((turno) => (
                <div key={turno} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600">
                      {turno === "manha" ? "Manhã" : "Tarde"}
                    </span>
                    <button
                      onClick={() => abrirNovoCard(dia, turno)}
                      className="p-1 rounded text-slate-500 hover:bg-[#1a1a21] hover:text-[#22c55e] transition-all"
                      title="Adicionar"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {cardsDe(dia, turno).map((c) => (
                    <div
                      key={c.id}
                      className="group bg-[#141416] border border-[#22c55e]/20 rounded-md p-2 hover:border-[#22c55e]/50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-xs text-slate-100 font-mono font-bold leading-snug">{c.retranca}</p>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      {(c.reporter || c.horario) && (
                        <p className="text-[10px] text-slate-500 font-mono mt-1">
                          {c.horario && <span className="inline-flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{c.horario}</span>}
                          {c.horario && c.reporter && <span> · </span>}
                          {c.reporter}
                        </p>
                      )}
                    </div>
                  ))}

                  {novoCard?.dia === dia && novoCard?.turno === turno && (
                    <form onSubmit={salvarCard} className="bg-[#141416] border border-[#22c55e]/40 rounded-md p-2 space-y-2">
                      <input
                        autoFocus
                        value={retranca}
                        onChange={(e) => setRetranca(e.target.value)}
                        placeholder="RETRANCA"
                        className="w-full px-2 py-1.5 rounded bg-[#09090b] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 text-[10px] focus:outline-none focus:border-[#22c55e] font-mono"
                      />
                      <input
                        value={reporter}
                        onChange={(e) => setReporter(e.target.value)}
                        placeholder="REPÓRTER"
                        className="w-full px-2 py-1.5 rounded bg-[#09090b] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 text-[10px] focus:outline-none focus:border-[#22c55e] font-mono"
                      />
                      <input
                        type="time"
                        value={horario}
                        onChange={(e) => setHorario(e.target.value)}
                        className="w-full px-2 py-1.5 rounded bg-[#09090b] border border-[#22c55e]/30 text-slate-100 text-[10px] focus:outline-none focus:border-[#22c55e] font-mono"
                      />
                      <div className="flex gap-1.5">
                        <button
                          type="submit"
                          disabled={saving}
                          className="flex-1 px-2 py-1 rounded bg-[#22c55e]/10 border border-[#22c55e] text-[#22c55e] text-[10px] font-mono uppercase font-bold hover:bg-[#22c55e]/20 transition-all disabled:opacity-50"
                        >
                          {saving ? "..." : "OK"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setNovoCard(null)}
                          className="px-2 py-1 rounded border border-[#22c55e]/20 text-slate-500 text-[10px] font-mono uppercase hover:text-slate-300 transition-all"
                        >
                          X
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FormTab({ pautaToEdit, pautaDate, onSaved }: { pautaToEdit: Pauta | null; pautaDate: Date; onSaved: () => void }) {
  const isEdit = !!pautaToEdit;

  const [titulo, setTitulo] = useState(pautaToEdit?.titulo ?? "");
  const [retranca, setRetranca] = useState(pautaToEdit?.retranca ?? "");
  const [tipo, setTipo] = useState(pautaToEdit?.tipo ?? "");
  const [turno, setTurno] = useState(pautaToEdit?.turno ?? "");
  const [dataPauta, setDataPauta] = useState(pautaToEdit?.data_pauta ?? ymd(pautaDate));
  const [reporter, setReporter] = useState(pautaToEdit?.reporter ?? "");
  const [produtor, setProdutor] = useState(pautaToEdit?.produtor ?? "");
  const [horario, setHorario] = useState(pautaToEdit?.horario ?? "");
  const [local, setLocal] = useState(pautaToEdit?.local ?? "");
  const [sonora, setSonora] = useState(pautaToEdit?.sonora ?? "");
  const [contato, setContato] = useState(pautaToEdit?.contato ?? "");
  const [proposta, setProposta] = useState(pautaToEdit?.proposta ?? "");
  const [encaminhamento, setEncaminhamento] = useState(pautaToEdit?.encaminhamento ?? "");
  const [observacoes, setObservacoes] = useState(pautaToEdit?.observacoes ?? "");
  const [status, setStatus] = useState(pautaToEdit?.status ?? "sugestao");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitulo(pautaToEdit?.titulo ?? "");
    setRetranca(pautaToEdit?.retranca ?? "");
    setTipo(pautaToEdit?.tipo ?? "");
    setTurno(pautaToEdit?.turno ?? "");
    setDataPauta(pautaToEdit?.data_pauta ?? ymd(pautaDate));
    setReporter(pautaToEdit?.reporter ?? "");
    setProdutor(pautaToEdit?.produtor ?? "");
    setHorario(pautaToEdit?.horario ?? "");
    setLocal(pautaToEdit?.local ?? "");
    setSonora(pautaToEdit?.sonora ?? "");
    setContato(pautaToEdit?.contato ?? "");
    setProposta(pautaToEdit?.proposta ?? "");
    setEncaminhamento(pautaToEdit?.encaminhamento ?? "");
    setObservacoes(pautaToEdit?.observacoes ?? "");
    setStatus(pautaToEdit?.status ?? "sugestao");
  }, [pautaToEdit, pautaDate]);

  const resetForm = () => {
    setTitulo(""); setRetranca(""); setTipo(""); setTurno("");
    setDataPauta(ymd(pautaDate)); setReporter(""); setProdutor(""); setHorario("");
    setLocal(""); setSonora(""); setContato(""); setProposta("");
    setEncaminhamento(""); setObservacoes(""); setStatus("sugestao");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sanitize(titulo)) return toast.error("Preencha o título da pauta.");

    setSaving(true);
    const payload = {
      titulo: sanitize(titulo),
      retranca: retranca ? sanitize(retranca) : null,
      tipo: tipo || null,
      turno: turno || null,
      data_pauta: dataPauta || null,
      reporter: reporter ? sanitize(reporter) : null,
      produtor: produtor ? sanitize(produtor) : null,
      horario: horario || null,
      local: local ? sanitize(local) : null,
      sonora: sonora ? sanitize(sonora) : null,
      contato: contato ? sanitize(contato) : null,
      proposta: proposta || null,
      encaminhamento: encaminhamento || null,
      observacoes: observacoes || null,
      status,
      // TODO: quando o login voltar, trocar null por supabase.auth.getUser() -> user.id
      criado_por: pautaToEdit?.criado_por ?? null,
    };

    const query = isEdit
      ? supabase.from("pautas").update(payload).eq("id", pautaToEdit!.id)
      : supabase.from("pautas").insert(payload);

    const { error } = await query;
    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(isEdit ? "Pauta atualizada!" : "Pauta criada!");
    if (isEdit) onSaved();
    else resetForm();
  };

  const inputCls = "w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all font-mono";
  const labelCls = "text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2";

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Cabeçalho do Formulário */}
      <div className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 backdrop-blur-lg shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-2">
              {isEdit ? "EDITANDO PAUTA" : "NOVA PAUTA"}
            </p>
            <p className="text-sm text-slate-300 font-mono">
              {isEdit ? "Atualize os dados da pauta existente" : "Preencha as informações da nova pauta"}
            </p>
          </div>
          {isEdit && (
            <button
              type="button"
              onClick={() => onSaved()}
              className="px-4 py-2 rounded-md text-xs font-mono uppercase text-slate-400 border border-slate-400/20 hover:border-slate-400/40 hover:text-slate-300 transition-all"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Seção Informações Básicas */}
      <div className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 backdrop-blur-lg shadow-2xl">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#22c55e]/10">
          <FileText className="h-4 w-4 text-[#22c55e]" />
          <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
            Informações Básicas
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Título *</label>
            <input 
              required 
              value={titulo} 
              onChange={(e) => setTitulo(e.target.value)} 
              placeholder="Ex: Reportagem sobre obras na BR-101" 
              className={inputCls} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Retranca</label>
              <input 
                value={retranca} 
                onChange={(e) => setRetranca(e.target.value)} 
                placeholder="Ex: OBRAS-BR101" 
                className={inputCls} 
              />
            </div>
            <div>
              <label className={labelCls}>Tipo</label>
              <select 
                value={tipo} 
                onChange={(e) => setTipo(e.target.value)} 
                className={inputCls + " appearance-none cursor-pointer"}
              >
                <option value="">Selecione</option>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Turno</label>
              <select 
                value={turno} 
                onChange={(e) => setTurno(e.target.value)} 
                className={inputCls + " appearance-none cursor-pointer"}
              >
                <option value="">Selecione</option>
                {TURNOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Seção Data e Horário */}
      <div className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 backdrop-blur-lg shadow-2xl">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#22c55e]/10">
          <CalendarIcon className="h-4 w-4 text-[#22c55e]" />
          <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
            Data e Horário
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Data</label>
            <input 
              type="date" 
              value={dataPauta} 
              onChange={(e) => setDataPauta(e.target.value)} 
              className={inputCls} 
            />
          </div>
          <div>
            <label className={labelCls}>Horário</label>
            <input 
              type="time" 
              value={horario} 
              onChange={(e) => setHorario(e.target.value)} 
              className={inputCls} 
            />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)} 
              className={inputCls + " appearance-none cursor-pointer"}
            >
              <option value="sugestao">Sugestão</option>
              <option value="aprovada">Aprovada</option>
              <option value="em_producao">Em Produção</option>
              <option value="finalizada">Finalizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Seção Equipe */}
      <div className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 backdrop-blur-lg shadow-2xl">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#22c55e]/10">
          <Megaphone className="h-4 w-4 text-[#22c55e]" />
          <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
            Equipe
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Repórter</label>
            <input 
              value={reporter} 
              onChange={(e) => setReporter(e.target.value)} 
              placeholder="Nome do repórter"
              className={inputCls} 
            />
          </div>
          <div>
            <label className={labelCls}>Produtor</label>
            <input 
              value={produtor} 
              onChange={(e) => setProdutor(e.target.value)} 
              placeholder="Nome do produtor"
              className={inputCls} 
            />
          </div>
        </div>
      </div>

      {/* Seção Localização e Contato */}
      <div className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 backdrop-blur-lg shadow-2xl">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#22c55e]/10">
          <MapPin className="h-4 w-4 text-[#22c55e]" />
          <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
            Localização e Contatos
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Local</label>
            <input 
              value={local} 
              onChange={(e) => setLocal(e.target.value)} 
              placeholder="Ex: Av. Getúlio Vargas, 1000"
              className={inputCls} 
            />
          </div>
          <div>
            <label className={labelCls}>Contato</label>
            <input 
              value={contato} 
              onChange={(e) => setContato(e.target.value)} 
              placeholder="Nome / telefone"
              className={inputCls} 
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelCls}>Sonora</label>
          <input 
            value={sonora} 
            onChange={(e) => setSonora(e.target.value)} 
            placeholder="Quem vai dar sonora"
            className={inputCls} 
          />
        </div>
      </div>

      {/* Seção Conteúdo e Detalhes */}
      <div className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 backdrop-blur-lg shadow-2xl">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#22c55e]/10">
          <Pencil className="h-4 w-4 text-[#22c55e]" />
          <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
            Conteúdo
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Proposta</label>
            <textarea 
              value={proposta} 
              onChange={(e) => setProposta(e.target.value)} 
              placeholder="Descreva a proposta da pauta"
              rows={3} 
              className={inputCls + " resize-none leading-relaxed"} 
            />
          </div>

          <div>
            <label className={labelCls}>Encaminhamento</label>
            <textarea 
              value={encaminhamento} 
              onChange={(e) => setEncaminhamento(e.target.value)} 
              placeholder="Como a pauta será desenvolvida"
              rows={3} 
              className={inputCls + " resize-none leading-relaxed"} 
            />
          </div>

          <div>
            <label className={labelCls}>Observações</label>
            <textarea 
              value={observacoes} 
              onChange={(e) => setObservacoes(e.target.value)} 
              placeholder="Observações adicionais"
              rows={2} 
              className={inputCls + " resize-none leading-relaxed"} 
            />
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-[#09090b] border-t border-[#22c55e]/20 -mx-6 px-6 py-4">
        <Button
          type="submit"
          disabled={saving}
          className="px-8 py-2.5 rounded-md text-xs font-mono uppercase font-black bg-[#22c55e]/10 border border-[#22c55e] text-[#22c55e] transition-all hover:bg-[#22c55e]/20 hover:shadow-lg hover:shadow-[#22c55e]/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                SALVANDO...
              </>
            ) : isEdit ? (
              <>
                <Pencil className="h-4 w-4" />
                ATUALIZAR
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                SALVAR
              </>
            )}
          </div>
        </Button>
      </div>
    </form>
  );
}

function SearchTab({ onEdit }: { onEdit: (p: Pauta) => void }) {
  const [pautas, setPautas] = useState<Pauta[]>([]);
  const [loading, setLoading] = useState(true);
  const [termo, setTermo] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("Todos");

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("pautas").select("*").order("data_pauta", { ascending: false });
    if (statusFiltro !== "Todos") query = query.eq("status", statusFiltro);
    const { data, error } = await query;
    if (error) toast.error(error.message);
    else setPautas((data ?? []) as Pauta[]);
    setLoading(false);
  }, [statusFiltro]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta pauta?")) return;
    const { error } = await supabase.from("pautas").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Pauta excluída."); load(); }
  };

  const filtradas = useMemo(() => {
    const t = sanitize(termo).toLowerCase();
    if (!t) return pautas;
    return pautas.filter((p) =>
      p.titulo?.toLowerCase().includes(t) ||
      p.retranca?.toLowerCase().includes(t) ||
      p.reporter?.toLowerCase().includes(t)
    );
  }, [pautas, termo]);

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 backdrop-blur-lg shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
            <input
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="BUSCAR POR TÍTULO, RETRANCA OU REPÓRTER..."
              className="w-full pl-9 pr-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all font-mono"
            />
          </div>
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all appearance-none cursor-pointer font-mono"
          >
            <option value="Todos">Todos os status</option>
            <option value="sugestao">Sugestão</option>
            <option value="aprovada">Aprovada</option>
            <option value="em_producao">Em Produção</option>
            <option value="finalizada">Finalizada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 italic font-mono text-xs">CARREGANDO...</div>
      ) : filtradas.length === 0 ? (
        <div className="bg-[#0f0f12] border border-dashed border-[#22c55e]/30 rounded-lg p-12 text-center text-slate-500 text-xs font-mono">
          NENHUMA PAUTA ENCONTRADA
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtradas.map((p) => (
            <div
              key={p.id}
              className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-4 hover:bg-[#1a1a21] hover:border-[#22c55e]/40 transition-all group backdrop-blur-lg shadow-xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    {p.status && (
                      <span className="bg-[#22c55e]/20 text-[#22c55e] text-xs px-3 py-1 rounded-md border border-[#22c55e]/40 font-mono font-bold uppercase tracking-wider">
                        {p.status.replace("_", " ")}
                      </span>
                    )}
                    {p.tipo && <span className="text-xs text-slate-500 font-mono uppercase">{p.tipo}</span>}
                    {p.data_pauta && (
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                        <CalendarIcon className="h-3 w-3" />
                        {new Date(p.data_pauta + "T00:00:00").toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-black text-slate-100 font-mono uppercase truncate">{p.titulo}</h3>
                  {(p.retranca || p.reporter) && (
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      {p.retranca && <span>{p.retranca}</span>}
                      {p.retranca && p.reporter && <span> · </span>}
                      {p.reporter && <span>{p.reporter}</span>}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onEdit(p)}
                    className="p-2 rounded-md text-slate-500 hover:bg-[#1a1a21] hover:text-[#22c55e] transition-all"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 rounded-md text-slate-500 hover:bg-[#1a1a21] hover:text-red-400 transition-all"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AvisosTab() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);
  const [assunto, setAssunto] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("avisos").select("*").order("data", { ascending: false });
    if (error) toast.error(error.message);
    else setAvisos((data ?? []) as Aviso[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sanitize(assunto)) return toast.error("Escreva o aviso.");
    setSaving(true);
    const { error } = await supabase.from("avisos").insert({
      assunto: sanitize(assunto),
      data: ymd(new Date()),
      // TODO: quando o login voltar, trocar null por supabase.auth.getUser() -> user.id
      autor_id: null,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Aviso publicado!");
      setAssunto("");
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este aviso?")) return;
    const { error } = await supabase.from("avisos").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Aviso excluído."); load(); }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 backdrop-blur-lg shadow-2xl">
        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-4">Novo aviso</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
            placeholder="ESCREVA O AVISO PARA A REDAÇÃO..."
            className="flex-1 px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all font-mono"
          />
          <Button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-md bg-[#22c55e]/10 border border-[#22c55e] text-white text-xs font-black uppercase tracking-wider transition-all hover:bg-[#22c55e]/20 hover:shadow-lg hover:shadow-[#22c55e]/20 active:scale-95 font-mono disabled:opacity-50"
          >
            <Megaphone className="h-4 w-4" /> {saving ? "PUBLICANDO..." : "PUBLICAR"}
          </Button>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-12 text-slate-500 italic font-mono text-xs">CARREGANDO...</div>
      ) : avisos.length === 0 ? (
        <div className="bg-[#0f0f12] border border-dashed border-[#22c55e]/30 rounded-lg p-12 text-center text-slate-500 text-xs font-mono">
          SEM AVISOS
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {avisos.map((a) => (
            <div
              key={a.id}
              className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-4 hover:bg-[#1a1a21] hover:border-[#22c55e]/40 transition-all group backdrop-blur-lg shadow-xl flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 flex items-center gap-1 font-mono mb-1">
                  <CalendarIcon className="h-3 w-3" />
                  {new Date(a.data + "T00:00:00").toLocaleDateString("pt-BR")}
                </p>
                <p className="text-sm text-slate-100 font-mono">{a.assunto}</p>
              </div>
              <button
                onClick={() => handleDelete(a.id)}
                className="p-2 rounded-md text-slate-500 hover:bg-[#1a1a21] hover:text-red-400 transition-all shrink-0"
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GavetaTab() {
  const [vts, setVts] = useState<VtGaveta[]>([]);
  const [loading, setLoading] = useState(true);
  const [programaFiltro, setProgramaFiltro] = useState("Todos");

  const [programa, setPrograma] = useState<string>(PROGRAMAS_VT[0]);
  const [retranca, setRetranca] = useState("");
  const [dataPronto, setDataPronto] = useState(ymd(new Date()));
  const [observacao, setObservacao] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("vt_gaveta").select("*").order("data_pronto", { ascending: false });
    if (programaFiltro !== "Todos") query = query.eq("programa", programaFiltro);
    const { data, error } = await query;
    if (error) toast.error(error.message);
    else setVts((data ?? []) as VtGaveta[]);
    setLoading(false);
  }, [programaFiltro]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sanitize(retranca)) return toast.error("Informe a retranca do VT.");
    setSaving(true);
    const { error } = await supabase.from("vt_gaveta").insert({
      programa,
      retranca: sanitize(retranca),
      data_pronto: dataPronto,
      observacao: observacao ? sanitize(observacao) : null,
      // TODO: quando o login voltar, trocar null por supabase.auth.getUser() -> user.id
      autor_id: null,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("VT adicionado à gaveta!");
      setRetranca(""); setObservacao(""); setDataPronto(ymd(new Date()));
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este VT da gaveta?")) return;
    const { error } = await supabase.from("vt_gaveta").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("VT removido."); load(); }
  };

  const inputCls = "w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all font-mono";
  const labelCls = "text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2";

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 backdrop-blur-lg shadow-2xl">
        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-4">Novo VT na gaveta</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={labelCls}>Programa</label>
            <select value={programa} onChange={(e) => setPrograma(e.target.value)} className={inputCls + " appearance-none cursor-pointer"}>
              {PROGRAMAS_VT.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Retranca</label>
            <input value={retranca} onChange={(e) => setRetranca(e.target.value)} placeholder="Ex: ACIDENTE BR-101" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Pronto em</label>
            <input type="date" value={dataPronto} onChange={(e) => setDataPronto(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Observação</label>
            <input value={observacao} onChange={(e) => setObservacao(e.target.value)} className={inputCls} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-[#22c55e]/10 border border-[#22c55e] text-white text-xs font-black uppercase tracking-wider transition-all hover:bg-[#22c55e]/20 hover:shadow-lg hover:shadow-[#22c55e]/20 active:scale-95 font-mono disabled:opacity-50"
          >
            <Archive className="h-4 w-4" /> {saving ? "SALVANDO..." : "ADICIONAR"}
          </Button>
        </div>
      </form>

      <div className="flex justify-end">
        <select
          value={programaFiltro}
          onChange={(e) => setProgramaFiltro(e.target.value)}
          className="px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 text-xs focus:outline-none focus:border-[#22c55e] transition-all appearance-none cursor-pointer font-mono"
        >
          <option value="Todos">Todos os programas</option>
          {PROGRAMAS_VT.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 italic font-mono text-xs">CARREGANDO...</div>
      ) : vts.length === 0 ? (
        <div className="bg-[#0f0f12] border border-dashed border-[#22c55e]/30 rounded-lg p-12 text-center text-slate-500 text-xs font-mono">
          GAVETA VAZIA
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {vts.map((v) => (
            <div
              key={v.id}
              className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-4 hover:bg-[#1a1a21] hover:border-[#22c55e]/40 transition-all group backdrop-blur-lg shadow-xl flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <span className="bg-[#22c55e]/20 text-[#22c55e] text-xs px-3 py-1 rounded-md border border-[#22c55e]/40 font-mono font-bold uppercase tracking-wider">
                    {v.programa}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                    <CalendarIcon className="h-3 w-3" />
                    {new Date(v.data_pronto + "T00:00:00").toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-100 font-mono uppercase">{v.retranca}</h3>
                {v.observacao && <p className="text-xs text-slate-400 mt-1">{v.observacao}</p>}
              </div>
              <button
                onClick={() => handleDelete(v.id)}
                className="p-2 rounded-md text-slate-500 hover:bg-[#1a1a21] hover:text-red-400 transition-all shrink-0"
                title="Remover"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PortaisTab() {
  return <div className="p-4 text-slate-400 text-sm font-mono">Portais em desenvolvimento...</div>;
}
