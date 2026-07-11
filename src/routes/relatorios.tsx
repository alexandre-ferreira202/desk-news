import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  Plus, ClipboardList, Calendar as CalendarIcon,
  Search, Edit2, Trash2, X, ChevronDown, ChevronUp, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/relatorios")({
  component: () => <RelatoriosPage />,
  head: () => ({ meta: [{ title: "Relatórios — Newsdesk" }] }),
});

type EventoType = "Pautas Caídas" | "Relatórios" | "Outros";

interface Relatorio {
  id: string;
  data: string;
  retranca: string;
  evento: string;
  programa: string;
  texto: string;
  criado_em: string;
  autor_id: string;
  autor_nome?: string;
}

const PAGE_SIZE = 30;

// ─── Skeleton loader ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="border-l-4 border-[#22c55e]/20 bg-[#0f0f12] border border-[#22c55e]/10 rounded-lg p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-7 w-24 bg-[#22c55e]/10 rounded-md" />
          <div className="h-4 w-20 bg-slate-800 rounded" />
        </div>
        <div className="h-4 w-28 bg-slate-800 rounded" />
      </div>
      <div className="h-4 w-2/3 bg-slate-800 rounded mb-2" />
      <div className="h-3 w-full bg-slate-800/60 rounded mb-1" />
      <div className="h-3 w-4/5 bg-slate-800/60 rounded" />
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
function RelatoriosPage() {
  const { user } = useAuth();
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filtros
  const [dataInicio, setDataInicio] = useState(format(new Date(), "yyyy-MM-01"));
  const [dataFim, setDataFim] = useState(format(new Date(), "yyyy-MM-dd"));
  const [programa, setPrograma] = useState("Todos");
  const [eventoFiltro, setEventoFiltro] = useState<EventoType | "Todos">("Todos");
  const [busca, setBusca] = useState("");
  const [buscaAtiva, setBuscaAtiva] = useState("");
  const buscaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estado UI
  const [showNew, setShowNew] = useState(false);
  const [editando, setEditando] = useState<Relatorio | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Busca com debounce
  const handleBusca = (val: string) => {
    setBusca(val);
    if (buscaTimer.current) clearTimeout(buscaTimer.current);
    buscaTimer.current = setTimeout(() => setBuscaAtiva(val), 350);
  };

  // Carregamento com paginação e contagem total
  const load = useCallback(async (resetPage = false) => {
    setLoading(true);
    const currentPage = resetPage ? 0 : page;
    if (resetPage) setPage(0);

    let query = supabase
      .from("relatorios")
      .select("*", { count: "exact" })
      .order("data", { ascending: false })
      .range(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE - 1);

    if (dataInicio) query = query.gte("data", dataInicio);
    if (dataFim) query = query.lte("data", dataFim);
    if (programa !== "Todos") query = query.eq("programa", programa);
    if (eventoFiltro !== "Todos") query = query.eq("evento", eventoFiltro);
    if (buscaAtiva.trim()) {
      const termo = buscaAtiva.trim();
      query = query.or(
        `retranca.ilike."%${termo}%",texto.ilike."%${termo}%"`
      );
    }

    const { data, error, count } = await query;
    if (error) {
      toast.error(error.message);
      setRelatorios([]);
      setTotal(0);
    } else {
      setRelatorios((data ?? []) as Relatorio[]);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [dataInicio, dataFim, programa, eventoFiltro, buscaAtiva, page]);

  useEffect(() => { load(true); }, [dataInicio, dataFim, programa, eventoFiltro, buscaAtiva]);
  useEffect(() => { if (page > 0) load(); }, [page]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("relatorios").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Relatório excluído.");
      setConfirmDelete(null);
      setExpandido(null);
      load(true);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-[#09090b] text-slate-100 font-sans">

      {/* Cabeçalho */}
      <div className="border-b border-[#22c55e]/20 pb-4 mb-8">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#22c55e] mb-1">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).toUpperCase()}
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/40">
            <ClipboardList className="h-5 w-5 text-[#22c55e]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-mono uppercase text-white">
            Relatórios
          </h1>
        </div>
      </div>

      {/* Barra de ações */}
      <div className="flex items-center justify-between mb-6">
        <p className="hidden sm:block text-xs text-slate-500 font-mono uppercase tracking-widest">
          Histórico de ocorrências
        </p>
        <Button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#22c55e]/10 border border-[#22c55e] text-white text-xs font-black uppercase tracking-wider transition-all duration-300 hover:bg-[#22c55e]/20 hover:shadow-lg hover:shadow-[#22c55e]/20 active:scale-95 font-mono"
        >
          <Plus className="h-4 w-4" /> Novo
        </Button>
      </div>

      {/* Painel de filtros */}
      <div className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 mb-6 backdrop-blur-lg shadow-2xl">
        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-4">Filtros</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2">Data Inicial</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2">Data Final</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2">Programa</label>
            <select
              value={programa}
              onChange={(e) => setPrograma(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all appearance-none cursor-pointer font-mono"
            >
              <option value="Todos">Todos</option>
              <option value="Jornal da Manhã">Jornal da Manhã</option>
              <option value="Edição Meio-Dia">Edição Meio-Dia</option>
              <option value="Jornal da Noite">Jornal da Noite</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2">Eventos</label>
            <select
              value={eventoFiltro}
              onChange={(e) => setEventoFiltro(e.target.value as EventoType | "Todos")}
              className="w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all appearance-none cursor-pointer font-mono"
            >
              <option value="Todos">Mostrar Tudo</option>
              <option value="Pautas Caídas">Pautas Caídas</option>
              <option value="Relatórios">Relatórios</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
        </div>

        {/* Busca textual com debounce */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por retranca ou conteúdo..."
            value={busca}
            onChange={(e) => handleBusca(e.target.value)}
            className="w-full pl-9 pr-9 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all font-mono"
          />
          {busca && (
            <button
              onClick={() => { setBusca(""); setBuscaAtiva(""); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Contador de resultados */}
      {!loading && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-500 font-mono">
            {total === 0
              ? "Nenhum registro encontrado"
              : `${total} registro${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`}
            {buscaAtiva && (
              <span className="text-[#22c55e]"> · busca: "{buscaAtiva}"</span>
            )}
          </p>
          {totalPages > 1 && (
            <p className="text-xs text-slate-600 font-mono">
              Página {page + 1} de {totalPages}
            </p>
          )}
        </div>
      )}

      {/* Lista de relatórios */}
      <div className="space-y-3">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : relatorios.length === 0 ? (
          <div className="bg-[#0f0f12] border border-dashed border-[#22c55e]/30 rounded-lg p-12 text-center">
            <p className="text-slate-500 text-xs font-mono mb-1">SEM REGISTROS</p>
            {(buscaAtiva || eventoFiltro !== "Todos" || programa !== "Todos") && (
              <p className="text-slate-600 text-xs font-mono">Tente ajustar os filtros</p>
            )}
          </div>
        ) : (
          relatorios.map((r) => {
            const isExpanded = expandido === r.id;
            const isConfirming = confirmDelete === r.id;
            // Corrige offset UTC — interpreta data como horário local (ex: Fortaleza UTC-3)
            const dataLocal = new Date(r.data + "T00:00:00");

            return (
              <div
                key={r.id}
                className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg transition-all backdrop-blur-lg shadow-xl hover:border-[#22c55e]/40 hover:shadow-[0_0_20px_#22c55e10]"
              >
                {/* Cabeçalho clicável do card */}
                <div
                  className="p-4 cursor-pointer select-none"
                  onClick={() => {
                    setExpandido(isExpanded ? null : r.id);
                    setConfirmDelete(null);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-[#22c55e]/20 text-[#22c55e] text-xs px-3 py-1 rounded-md border border-[#22c55e]/40 font-mono font-bold uppercase tracking-wider">
                        {r.evento}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                        <CalendarIcon className="h-3 w-3" />
                        {dataLocal.toLocaleDateString("pt-BR")}
                      </span>
                      {r.autor_nome && (
                        <span className="text-xs text-slate-600 font-mono">· {r.autor_nome}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-600 font-mono uppercase tracking-widest hidden sm:block">
                        {r.programa}
                      </span>
                      {isExpanded
                        ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
                        : <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                      }
                    </div>
                  </div>
                  <h3 className="text-sm font-black text-slate-100 font-mono uppercase">{r.retranca}</h3>
                  {!isExpanded && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mt-1">{r.texto}</p>
                  )}
                </div>

                {/* Conteúdo expandido */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-[#22c55e]/10 pt-3">
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{r.texto}</p>

                    {/* Ações — editar / excluir */}
                    {!isConfirming ? (
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditando(r);
                            setExpandido(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#22c55e]/30 text-slate-400 text-xs font-mono uppercase tracking-wider hover:border-[#22c55e]/60 hover:text-slate-200 transition-all"
                        >
                          <Edit2 className="h-3 w-3" /> Editar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(r.id);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-500/30 text-red-400/70 text-xs font-mono uppercase tracking-wider hover:border-red-500/60 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="h-3 w-3" /> Excluir
                        </button>
                      </div>
                    ) : (
                      /* Confirmação de exclusão inline */
                      <div className="flex items-center gap-3 mt-4 p-3 rounded-md bg-red-500/10 border border-red-500/30">
                        <p className="text-xs text-red-400 font-mono flex-1">Confirmar exclusão permanente?</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                          className="px-3 py-1 rounded-md bg-red-500/20 border border-red-500/50 text-red-300 text-xs font-mono uppercase font-bold hover:bg-red-500/30 transition-all"
                        >
                          Excluir
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }}
                          className="px-3 py-1 rounded-md border border-slate-700 text-slate-400 text-xs font-mono uppercase hover:text-slate-200 transition-all"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Paginação */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-md border border-[#22c55e]/30 text-slate-400 text-xs font-mono uppercase disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#22c55e]/60 hover:text-slate-200 transition-all"
          >
            ← Anterior
          </button>

          {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
            const pageNum =
              totalPages <= 7 ? i
              : page < 4 ? i
              : page > totalPages - 4 ? totalPages - 7 + i
              : page - 3 + i;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-8 h-8 rounded-md text-xs font-mono transition-all ${
                  pageNum === page
                    ? "bg-[#22c55e]/20 border border-[#22c55e] text-[#22c55e]"
                    : "border border-[#22c55e]/20 text-slate-500 hover:border-[#22c55e]/40 hover:text-slate-300"
                }`}
              >
                {pageNum + 1}
              </button>
            );
          })}

          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-md border border-[#22c55e]/30 text-slate-400 text-xs font-mono uppercase disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#22c55e]/60 hover:text-slate-200 transition-all"
          >
            Próxima →
          </button>
        </div>
      )}

      {/* Modal — novo */}
      {showNew && user && (
        <RelatorioModal
          userId={user.id}
          onClose={() => setShowNew(false)}
          onSaved={() => { setShowNew(false); load(true); }}
        />
      )}

      {/* Modal — editar */}
      {editando && user && (
        <RelatorioModal
          userId={user.id}
          relatorio={editando}
          onClose={() => setEditando(null)}
          onSaved={() => { setEditando(null); load(true); }}
        />
      )}
    </div>
  );
}

// ─── Modal unificado (criar / editar) ─────────────────────────────────────────
interface RelatorioModalProps {
  userId: string;
  relatorio?: Relatorio;
  onClose: () => void;
  onSaved: () => void;
}

function RelatorioModal({ userId, relatorio, onClose, onSaved }: RelatorioModalProps) {
  const isEdit = !!relatorio;

  const [data, setData] = useState(relatorio?.data ?? format(new Date(), "yyyy-MM-dd"));
  const [retranca, setRetranca] = useState(relatorio?.retranca ?? "");
  const [evento, setEvento] = useState<EventoType>((relatorio?.evento as EventoType) ?? "Relatórios");
  const [programa, setPrograma] = useState(relatorio?.programa ?? "Jornal da Manhã");
  const [texto, setTexto] = useState(relatorio?.texto ?? "");
  const [saving, setSaving] = useState(false);

  const charLimit = 2100;
  const charPct = Math.round((texto.length / charLimit) * 100);
  const charColor = charPct >= 100 ? "text-[#ef4444]" : charPct >= 80 ? "text-yellow-400" : "text-slate-600";
  const barColor  = charPct >= 100 ? "bg-[#ef4444]"   : charPct >= 80 ? "bg-yellow-400"   : "bg-[#22c55e]";

  const canSubmit = retranca.trim() && texto.trim() && texto.length <= charLimit;

  const submit = async () => {
    if (!canSubmit) return toast.error("Preencha todos os campos obrigatórios.");
    setSaving(true);

    if (isEdit && relatorio) {
      const { error } = await supabase
        .from("relatorios")
        .update({ data, retranca: retranca.trim(), evento, programa, texto })
        .eq("id", relatorio.id);
      setSaving(false);
      if (error) toast.error(error.message);
      else { toast.success("Relatório atualizado!"); onSaved(); }
    } else {
      const { error } = await supabase
        .from("relatorios")
        .insert({ data, retranca: retranca.trim(), evento, programa, texto, autor_id: userId });
      setSaving(false);
      if (error) toast.error(error.message);
      else { toast.success("Relatório salvo!"); onSaved(); }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        {/* Cabeçalho */}
        <div className="p-6 border-b border-[#22c55e]/10 bg-[#0a0e27] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#22c55e]/20 rounded-md border border-[#22c55e]/30">
              {isEdit
                ? <Edit2 className="h-4 w-4 text-[#22c55e]" />
                : <Plus className="h-4 w-4 text-[#22c55e]" />
              }
            </div>
            <h2 className="text-lg font-black tracking-tight text-white font-mono uppercase">
              {isEdit ? "Editar Relatório" : "Novo Relatório"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-slate-500 hover:bg-[#1a1a21] hover:text-slate-200 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2">Data</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2">Programa</label>
              <select
                value={programa}
                onChange={(e) => setPrograma(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all appearance-none cursor-pointer font-mono"
              >
                <option value="Jornal da Manhã">Jornal da Manhã</option>
                <option value="Edição Meio-Dia">Edição Meio-Dia</option>
                <option value="Jornal da Noite">Jornal da Noite</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2">Evento</label>
              <select
                value={evento}
                onChange={(e) => setEvento(e.target.value as EventoType)}
                className="w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all appearance-none cursor-pointer font-mono"
              >
                <option value="Pautas Caídas">Pautas Caídas</option>
                <option value="Relatórios">Relatórios</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2">Retranca</label>
              <input
                placeholder="Ex: ACIDENTE BR-101"
                value={retranca}
                onChange={(e) => setRetranca(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all font-mono"
              />
            </div>
          </div>

          {/* Textarea com barra de progresso */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-slate-600 font-mono uppercase tracking-widest">
                Conteúdo
                <span className="text-slate-700 normal-case font-normal"> — máx. {charLimit} caracteres</span>
              </label>
              <span className={`text-xs font-mono ${charColor}`}>
                {texto.length} / {charLimit}
              </span>
            </div>
            {/* Barra de progresso */}
            <div className="h-0.5 w-full bg-[#1a1a21] rounded-full mb-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                style={{ width: `${Math.min(charPct, 100)}%` }}
              />
            </div>
            <textarea
              placeholder="Descreva o ocorrido..."
              value={texto}
              onChange={(e) => setTexto(e.target.value.slice(0, charLimit))}
              rows={5}
              className="w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all resize-none leading-relaxed font-mono"
            />
          </div>

          {/* Rodapé */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#22c55e]/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-md text-xs font-mono uppercase font-bold text-slate-400 border border-[#22c55e]/30 transition-all hover:text-slate-200 hover:bg-[#1a1a21] hover:border-[#22c55e]/50 active:scale-95"
            >
              Cancelar
            </button>
            <Button
              onClick={submit}
              disabled={saving || !canSubmit}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-md text-xs font-mono uppercase font-bold bg-[#22c55e]/10 border border-[#22c55e] text-white transition-all hover:bg-[#22c55e]/20 hover:shadow-lg hover:shadow-[#22c55e]/20 active:scale-95 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-3 w-3 animate-spin" />}
              {saving ? "SALVANDO..." : isEdit ? "ATUALIZAR" : "SALVAR"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
