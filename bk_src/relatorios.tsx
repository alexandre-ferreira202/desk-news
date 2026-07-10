import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
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
  const { user } = useAuth();
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(true);
  
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
    <div className="min-h-screen p-4 sm:p-6 bg-[#09090b] text-slate-100 font-sans">
      <div className="border-b border-[#22c55e]/20 pb-4 mb-8">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#22c55e] mb-1">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).toUpperCase()}
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/40">
            <ClipboardList className="h-5 w-5 text-[#22c55e]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-mono uppercase text-white">Relatórios</h1>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="hidden sm:block">
          <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Histórico de ocorrências</p>
        </div>
        <Button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#22c55e]/10 border border-[#22c55e] text-white text-xs font-black uppercase tracking-wider transition-all duration-300 hover:bg-[#22c55e]/20 hover:shadow-lg hover:shadow-[#22c55e]/20 active:scale-95 font-mono"
        >
          <Plus className="h-4 w-4" /> Novo
        </Button>
      </div>

      <div className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 mb-8 backdrop-blur-lg shadow-2xl">
        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-4">Filtros</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-500 italic font-mono text-xs">CARREGANDO...</div>
        ) : relatorios.length === 0 ? (
          <div className="bg-[#0f0f12] border border-dashed border-[#22c55e]/30 rounded-lg p-12 text-center text-slate-500 text-xs font-mono">
            SEM REGISTROS
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {relatorios.map((r) => (
              <div key={r.id} className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-4 hover:bg-[#1a1a21] hover:border-[#22c55e]/40 transition-all group backdrop-blur-lg shadow-xl hover:shadow-[0_0_20px_#22c55e10]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="bg-[#22c55e]/20 text-[#22c55e] text-xs px-3 py-1.5 rounded-md border border-[#22c55e]/40 font-mono font-bold uppercase tracking-wider">
                      {r.evento}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                      <CalendarIcon className="h-3 w-3" />
                      {new Date(r.data).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <span className="text-xs text-slate-600 font-mono uppercase tracking-widest">{r.programa}</span>
                </div>
                <h3 className="text-sm font-black text-slate-100 mb-2 font-mono uppercase">{r.retranca}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{r.texto}</p>
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()} 
        className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-[#22c55e]/10 bg-[#0a0e27] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#22c55e]/20 rounded-md border border-[#22c55e]/30">
               <Plus className="h-4 w-4 text-[#22c55e]" />
            </div>
            <h2 className="text-lg font-black tracking-tight text-white font-mono uppercase">Novo Relatório</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-md text-slate-500 hover:bg-[#1a1a21] hover:text-slate-200 transition-all">
             <span className="text-xl font-mono">✕</span>
          </button>
        </div>
        
        <form onSubmit={submit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2">Data</label>
              <input 
                required 
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
                required 
                placeholder="Ex: ACIDENTE BR-101" 
                value={retranca} 
                onChange={(e) => setRetranca(e.target.value)} 
                className="w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all font-mono"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-slate-600 font-mono uppercase tracking-widest">Conteúdo</label>
              <span className={`text-xs font-mono ${texto.length > charLimit ? "text-[#ef4444]" : "text-slate-600"}`}>
                {texto.length} / {charLimit}
              </span>
            </div>
            <textarea 
              required
              placeholder="Descreva o ocorrido..." 
              value={texto} 
              onChange={(e) => setTexto(e.target.value.slice(0, charLimit))} 
              rows={5} 
              className="w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all resize-none leading-relaxed font-mono" 
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-[#22c55e]/10">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2 rounded-md text-xs font-mono uppercase font-bold text-slate-400 bg-transparent border border-[#22c55e]/30 transition-all hover:text-slate-200 hover:bg-[#1a1a21] hover:border-[#22c55e]/50 active:scale-95"
            >
              Cancelar
            </button>
            <Button 
              type="submit" 
              disabled={saving || texto.length > charLimit} 
              className="px-6 py-2 rounded-md text-xs font-mono uppercase font-bold bg-[#22c55e]/10 border border-[#22c55e] text-white transition-all hover:bg-[#22c55e]/20 hover:shadow-lg hover:shadow-[#22c55e]/20 active:scale-95 disabled:opacity-50"
            >
              {saving ? "SALVANDO..." : "SALVAR"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
