import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/Protected";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Loader2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const Route = createFileRoute("/pesquisa")({
  component: () => <Protected><PesquisaGeralPage /></Protected>,
  head: () => ({ meta: [{ title: "Pesquisa Geral - DeskNews" }] }),
});

interface Pauta {
  id: string;
  titulo: string;
  retranca: string | null;
  tipo: string | null;
  turno: string | null;
  data_pauta: string | null;
  reporter: string | null;
  produtor: string | null;
  proposta: string | null;
  encaminhamento: string | null;
  observacoes: string | null;
  status: string;
  created_at?: string;
}

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function PesquisaGeralPage() {
  const [q, setQ] = useState("");
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();
  const [results, setResults] = useState<Pauta[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Pauta | null>(null);

  const search = async () => {
    setLoading(true);
    let query = supabase.from("pautas").select("*").order("data_pauta", { ascending: false, nullsFirst: false }).limit(200);

    if (q.trim()) {
      const term = `%${q.trim()}%`;
      query = query.or(`retranca.ilike.${term},titulo.ilike.${term},reporter.ilike.${term},produtor.ilike.${term},proposta.ilike.${term},encaminhamento.ilike.${term}`);
    }

    if (from) query = query.gte("data_pauta", ymd(from));
    if (to) query = query.lte("data_pauta", ymd(to));

    const { data, error } = await query;
    setLoading(false);
    if (error) toast.error(error.message);
    else setResults((data ?? []) as Pauta[]);
  };

  useEffect(() => { search(); }, []);

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-[#09090b] text-slate-100 font-sans">
      <div className="flex items-center gap-3 border-b border-[#22c55e]/20 pb-4 mb-8">
        <div className="h-2 w-2 rounded-full bg-[#22c55e]"></div>
        <h1 className="text-2xl font-black tracking-tight font-mono uppercase">PESQUISA GERAL</h1>
        <span className="text-xs text-slate-500 hidden sm:inline font-mono uppercase ml-auto">Acervo Histórico</span>
      </div>

      <div className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 mb-8 backdrop-blur-lg shadow-2xl">
        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-4">Filtros</p>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_140px_140px_auto] gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#22c55e]" />
            <input
              type="text"
              className="w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all duration-200 pl-10 font-mono text-sm"
              placeholder="Retranca, produtor..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
            />
          </div>
          <DateField label="De" value={from} onChange={setFrom} />
          <DateField label="Até" value={to} onChange={setTo} />
          <Button 
            onClick={search} 
            disabled={loading} 
            className="px-6 py-3 rounded-md text-white bg-[#22c55e]/10 border border-[#22c55e] hover:bg-[#22c55e]/20 font-mono text-xs uppercase font-bold tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-[#22c55e]/20 active:scale-95"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg overflow-hidden backdrop-blur-lg shadow-2xl">
        {results.length === 0 && !loading && (
          <div className="p-12 text-center text-xs text-slate-500 font-mono">
            SEM RESULTADOS
          </div>
        )}
        <div className="divide-y divide-[#22c55e]/10 overflow-y-auto max-h-[calc(100vh-18rem)]">
          <div className="px-4 py-3 bg-[#0a0e27] text-xs text-slate-500 font-mono uppercase tracking-widest border-b border-[#22c55e]/10">
            {results.length} REGISTRO(S)
          </div>

          {results.map((p) => (
            <div 
              key={p.id} 
              className="p-4 flex items-center justify-between gap-4 hover:bg-[#1a1a21] transition-all cursor-pointer border-l-2 border-l-transparent hover:border-l-[#22c55e]" 
              onClick={() => setSelected(p)}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="font-mono uppercase font-black text-sm text-[#22c55e]">{p.retranca || "---"}</div>
                  {p.tipo && <span className="text-xs px-2 py-1 rounded bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30 font-mono uppercase font-bold">{p.tipo}</span>}
                </div>
                <div className="text-sm font-semibold text-slate-200 line-clamp-1">{p.titulo}</div>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-mono">
                  <span>{p.produtor ?? "---"}</span>
                  <span className="text-[#22c55e]">•</span>
                  <span>{p.reporter ?? "---"}</span>
                </div>
              </div>
              <div className="text-xs font-mono text-slate-500 shrink-0">
                {p.data_pauta ? new Date(p.data_pauta + "T00:00:00").toLocaleDateString("pt-BR") : "---"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && <PreviewModal pauta={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function DateField({ label, value, onChange }: { label: string; value?: Date; onChange: (d: Date | undefined) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild className="w-full">
        <Button variant="outline" className="justify-start font-normal h-11 px-3 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 hover:border-[#22c55e]/50 transition-all font-mono text-xs uppercase">
          <CalendarIcon className="h-4 w-4 mr-2 text-[#22c55e]" />
          <span className="text-slate-500">{label}:</span>
          <span className="ml-2">{value ? value.toLocaleDateString("pt-BR") : "---"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-lg border border-[#22c55e]/30 bg-[#0f0f12] backdrop-blur-lg shadow-2xl" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} className="p-3 bg-[#141416]" />
      </PopoverContent>
    </Popover>
  );
}

function PreviewModal({ pauta, onClose }: { pauta: Pauta; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#22c55e]/10 bg-[#0a0e27] flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-1">Visualização</div>
            <h2 className="text-xl font-black tracking-tight text-white font-mono uppercase">{pauta.retranca || "---"}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-md text-slate-500 hover:bg-[#1a1a21] hover:text-slate-200 transition-all">
            <span className="text-xl font-mono">✕</span>
          </button>
        </div>
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-md bg-[#141416] border border-[#22c55e]/20">
              <span className="text-xs text-slate-500 font-mono uppercase block mb-2">Data</span>
              <div className="text-sm font-mono text-slate-200">{pauta.data_pauta ? new Date(pauta.data_pauta + "T00:00:00").toLocaleDateString("pt-BR") : "---"}</div>
            </div>
            <div className="p-3 rounded-md bg-[#141416] border border-[#22c55e]/20">
              <span className="text-xs text-slate-500 font-mono uppercase block mb-2">Produtor</span>
              <div className="text-sm font-mono text-slate-200">{pauta.produtor || "---"}</div>
            </div>
            <div className="p-3 rounded-md bg-[#141416] border border-[#22c55e]/20">
              <span className="text-xs text-slate-500 font-mono uppercase block mb-2">Reporter</span>
              <div className="text-sm font-mono text-slate-200">{pauta.reporter || "---"}</div>
            </div>
          </div>
          <div className="space-y-3">
            {pauta.proposta && (
              <div className="bg-[#141416] border border-[#22c55e]/20 rounded-md p-4">
                <span className="text-xs text-[#22c55e] font-mono uppercase font-bold block mb-2">Proposta</span>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-300 font-mono">{pauta.proposta}</p>
              </div>
            )}
            {pauta.encaminhamento && (
              <div className="bg-[#141416] border border-[#22c55e]/20 rounded-md p-4">
                <span className="text-xs text-slate-500 font-mono uppercase font-bold block mb-2">Encaminhamento</span>
                <p className="text-xs leading-relaxed whitespace-pre-wrap text-slate-400 font-mono">{pauta.encaminhamento}</p>
              </div>
            )}
          </div>
        </div>
        <div className="p-6 bg-[#0a0e27] border-t border-[#22c55e]/10 flex justify-end">
          <Button onClick={onClose} className="px-6 py-2 rounded-md bg-[#22c55e]/10 border border-[#22c55e] text-white font-mono uppercase text-xs font-bold tracking-wider transition-all hover:bg-[#22c55e]/20 hover:shadow-lg hover:shadow-[#22c55e]/20 active:scale-95">FECHAR</Button>
        </div>
      </div>
    </div>
  );
}
