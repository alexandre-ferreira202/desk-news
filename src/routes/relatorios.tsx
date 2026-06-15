import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Plus, ClipboardList, Calendar as CalendarIcon } from "lucide-react";
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
}

function RelatoriosPage() {
  const user = null;
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [dataInicio, setDataInicio] = useState(format(new Date(), "yyyy-MM-01"));
  const [dataFim, setDataFim] = useState(format(new Date(), "yyyy-MM-dd"));
  const [programa, setPrograma] = useState("Todos");
  const [eventoFiltro, setEventoFiltro] = useState<EventoType | "Todos">("Todos");
  
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("relatorios").select("*").order("data", { ascending: false });
    
    if (dataInicio) query = query.gte("data", dataInicio);
    if (dataFim) query = query.lte("data", dataFim);
    if (programa !== "Todos") query = query.eq("programa", programa);
    if (eventoFiltro !== "Todos") query = query.eq("evento", eventoFiltro);
    
    const { data, error } = await query;
    if (error) toast.error(error.message);
    else setRelatorios((data ?? []) as Relatorio[]);
    setLoading(false);
  }, [dataInicio, dataFim, programa, eventoFiltro]);

  useEffect(() => { load(); }, [dataInicio, dataFim, programa, eventoFiltro]);

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-primary)]/30">
      {/* Header Premium */}
      <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-3 shrink-0">
        <ClipboardList className="h-5 w-5 text-[var(--text-quaternary)]" />
        <h1 className="text-h1 font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          RELATÓRIOS
        </h1>
        <span className="text-label text-[var(--text-tertiary)] hidden sm:inline">Gestão · Eventos & Pautas Caídas</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="hidden sm:block">
          <p className="text-body-sm text-[var(--text-tertiary)]">Histórico de ocorrências e controle editorial da redação.</p>
        </div>
        <Button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-[var(--accent-primary)] text-white text-body-sm font-semibold uppercase tracking-widest shadow-[var(--shadow-lg)] transition-all duration-300 hover:shadow-[var(--shadow-xl)] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" /> Novo Relatório
        </Button>
      </div>

      {/* Filters Glassmorphism */}
      <div className="rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl p-6 shadow-[var(--shadow-xl)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-label text-[var(--text-quaternary)] font-bold">Data Inicial</label>
            <input 
              type="date" 
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-body-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-label text-[var(--text-quaternary)] font-bold">Data Final</label>
            <input 
              type="date" 
              value={dataFim} 
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-body-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-label text-[var(--text-quaternary)] font-bold">Programa</label>
            <select 
              value={programa} 
              onChange={(e) => setPrograma(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-body-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300 appearance-none cursor-pointer"
            >
              <option value="Todos">Todos os Programas</option>
              <option value="Jornal da Manhã">Jornal da Manhã</option>
              <option value="Edição Meio-Dia">Edição Meio-Dia</option>
              <option value="Jornal da Noite">Jornal da Noite</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-label text-[var(--text-quaternary)] font-bold">EVENTOS</label>
            <select 
              value={eventoFiltro} 
              onChange={(e) => setEventoFiltro(e.target.value as EventoType | "Todos")}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-body-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300 appearance-none cursor-pointer"
            >
              <option value="Todos">MOSTRAR TUDO</option>
              <option value="Pautas Caídas">Pautas Caídas</option>
              <option value="Relatórios">Relatórios</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-[var(--text-tertiary)] italic">Carregando relatórios...</div>
        ) : relatorios.length === 0 ? (
          <div className="bg-[var(--bg-secondary)] border border-dashed border-[var(--border-light)] rounded-3xl p-12 text-center text-[var(--text-tertiary)] text-body-sm shadow-[var(--shadow-md)]">
            Nenhum relatório encontrado para os filtros selecionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {relatorios.map((r) => (
              <div key={r.id} className="bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-[2rem] p-6 hover:bg-[var(--bg-overlay)] hover:border-[var(--accent-primary)]/30 transition-all duration-300 group shadow-[var(--shadow-md)]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-label px-2.5 py-1 rounded-full border border-[var(--accent-primary)]/20">
                      {r.evento}
                    </span>
                    <span className="text-caption text-[var(--text-tertiary)] flex items-center gap-1">
                      <CalendarIcon className="h-3.5 w-3.5 text-[var(--text-quaternary)]" />
                      {format(new Date(r.data + "T12:00:00"), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                    <span className="text-caption font-bold text-[var(--accent-secondary)]">
                      {r.programa}
                    </span>
                  </div>
                </div>
                <h3 className="text-h3 font-bold mb-2 text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors uppercase tracking-tight">{r.retranca}</h3>
                <p className="text-body-sm text-[var(--text-secondary)] line-clamp-3 whitespace-pre-wrap leading-relaxed">{r.texto}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNew && user && (
        <NewRelatorioModal
          userId={user.id}
          onClose={() => setShowNew(false)}
          onSaved={() => { setShowNew(false); load(); }}
        />
      )}
    </div>
  );
}

function NewRelatorioModal({ userId, onClose, onSaved }: { userId: string; onClose: () => void; onSaved: () => void }) {
  const [data, setData] = useState(format(new Date(), "yyyy-MM-dd"));
  const [retranca, setRetranca] = useState("");
  const [evento, setEvento] = useState<EventoType>("Relatórios");
  const [programa, setPrograma] = useState("Jornal da Manhã");
  const [texto, setTexto] = useState("");
  const [saving, setSaving] = useState(false);

  const charLimit = 2100;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retranca || !texto) return toast.error("Preencha todos os campos obrigatórios.");
    
    setSaving(true);
    const { error } = await supabase.from("relatorios").insert({
      data,
      retranca,
      evento,
      programa,
      texto,
      autor_id: userId
    });
    
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Relatório salvo com sucesso!");
      onSaved();
    }
  };

  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-in fade-in duration-300" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()} 
        className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[2.5rem] shadow-[var(--shadow-2xl)] w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="p-8 border-b border-[var(--border-subtle)] bg-[var(--bg-overlay-2)] backdrop-blur-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--accent-primary)]/10 rounded-xl">
               <Plus className="h-5 w-5 text-[var(--accent-primary)]" />
            </div>
            <h2 className="text-h2 font-bold tracking-tight text-[var(--text-primary)]">Novo Relatório</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-all duration-300">
             <Plus className="h-7 w-7 rotate-45" />
          </button>
        </div>
        
        <form onSubmit={submit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-label text-[var(--text-quaternary)] font-bold">Data</label>
              <input 
                required 
                type="date" 
                value={data} 
                onChange={(e) => setData(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-label text-[var(--text-quaternary)] font-bold">Programa</label>
              <select 
                value={programa} 
                onChange={(e) => setPrograma(e.target.value)} 
                className="w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="Jornal da Manhã">Jornal da Manhã</option>
                <option value="Edição Meio-Dia">Edição Meio-Dia</option>
                <option value="Jornal da Noite">Jornal da Noite</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-label text-[var(--text-quaternary)] font-bold">Evento</label>
              <select 
                value={evento} 
                onChange={(e) => setEvento(e.target.value as EventoType)} 
                className="w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="Pautas Caídas">Pautas Caídas</option>
                <option value="Relatórios">Relatórios</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-label text-[var(--text-quaternary)] font-bold">Retranca / Assunto</label>
              <input 
                required 
                placeholder="Ex: ACIDENTE BR-101" 
                value={retranca} 
                onChange={(e) => setRetranca(e.target.value)} 
                className="w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-quaternary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-label text-[var(--text-quaternary)] font-bold">Conteúdo do Relatório</label>
              <span className={`text-caption font-mono ${texto.length > charLimit ? "text-[var(--status-error)]" : "text-[var(--text-tertiary)]"}`}>
                {texto.length} / {charLimit}
              </span>
            </div>
            <textarea 
              required
              placeholder="Descreva o ocorrido ou motivo da pauta ter caído..." 
              value={texto} 
              onChange={(e) => setTexto(e.target.value.slice(0, charLimit))} 
              rows={6} 
              className="w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-quaternary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300 resize-none leading-relaxed text-body-sm" 
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <button type="button" onClick={onClose} className="px-8 py-3 rounded-2xl text-body-sm font-medium text-[var(--text-secondary)] bg-transparent border border-[var(--border-light)] transition-all duration-300 hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] hover:border-[var(--border-medium)] active:scale-[0.98]">
              Cancelar
            </button>
            <Button 
              type="submit" 
              disabled={saving || texto.length > charLimit} 
              className="px-10 py-3 rounded-2xl text-body-sm font-bold bg-[var(--accent-primary)] text-white shadow-[var(--shadow-lg)] transition-all duration-300 hover:shadow-[var(--shadow-xl)] active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar Relatório"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
