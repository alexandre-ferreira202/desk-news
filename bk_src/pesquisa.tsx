import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/Protected";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Loader2, CalendarIcon, Clock, User, Tag, Plus } from "lucide-react";
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
    <div className="p-4 sm:p-6 space-y-6 bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-primary)]/30">
      <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-3 shrink-0">
        <Search className="h-5 w-5 text-[var(--text-quaternary)]" />
        <h1 className="text-h1 font-bold tracking-tight text-[var(--text-primary)] [background:linear-gradient(135deg,_var(--text-primary)_0%,_var(--text-secondary)_100%)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] [background-clip:text]">
          PESQUISA GERAL
        </h1>
        <span className="text-label text-[var(--text-tertiary)] hidden sm:inline">Acervo historico · pautas</span>
      </div>

      <div className="rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl p-6 space-y-4 shadow-[var(--shadow-xl)]">
        <label className="text-label text-[var(--text-quaternary)] font-bold">Filtrar Acervo</label>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px_200px_auto] gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-quaternary)]" />
            <input
              type="text"
              className="w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-quaternary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300 pl-10 text-body-sm"
              placeholder="Retranca, produtor, reporter..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
            />
          </div>
          <DateField label="De" value={from} onChange={setFrom} />
          <DateField label="Ate" value={to} onChange={setTo} />
          <Button onClick={search} disabled={loading} className="px-8 py-3 rounded-2xl text-body-sm font-semibold text-white bg-[var(--accent-primary)] shadow-[var(--shadow-lg)] transition-all duration-300 hover:shadow-[var(--shadow-xl)] active:scale-[0.98] relative overflow-hidden group/btn">
            <span className="relative z-10 flex items-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Buscar
            </span>
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl overflow-hidden shadow-[var(--shadow-2xl)]">
        {results.length === 0 && !loading && (
          <div className="p-12 text-center text-body-sm text-[var(--text-tertiary)] italic">
            Nenhuma reportagem encontrada para os termos ou periodo selecionados.
          </div>
        )}
        <div className="divide-y divide-[var(--border-subtle)] overflow-y-auto max-h-[calc(100vh-18rem)]">
          <div className="px-4 py-3 bg-[var(--bg-overlay-2)] text-label text-[var(--text-tertiary)] font-bold">
            {results.length} resultado(s)
          </div>

          {results.map((p) => (
            <div key={p.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[var(--bg-overlay)] transition-all cursor-pointer group active:scale-[0.995]" onClick={() => setSelected(p)}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-mono uppercase font-bold text-body-sm text-[var(--accent-primary)]">{p.retranca || "(SEM RETRANCA)"}</div>
                  {p.tipo && <span className="text-label px-1.5 py-0.5 rounded bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 uppercase font-bold">{p.tipo}</span>}
                </div>
                <div className="text-body-sm line-clamp-1 font-medium text-[var(--text-primary)]">{p.titulo}</div>
                <div className="flex items-center gap-3 mt-2 text-caption text-[var(--text-tertiary)] font-mono">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" /> {p.produtor ?? "-"}</span>
                  <span className="flex items-center gap-1"><Tag className="h-3 w-3 text-[var(--text-quaternary)]" /> {p.reporter ?? "-"}</span>
                </div>
              </div>
              <div className="text-caption font-mono text-[var(--text-tertiary)] shrink-0">
                {p.data_pauta ? new Date(p.data_pauta + "T00:00:00").toLocaleDateString("pt-BR") : "-"}
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
        <Button variant="outline" className="justify-start font-normal h-12 w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] hover:border-[var(--accent-primary)]/30 transition-all duration-300">
          <CalendarIcon className="h-4 w-4 mr-2 text-[var(--accent-primary)]" />
          <span className="text-label text-[var(--text-quaternary)] font-bold mr-2">{label}:</span>
          {value ? value.toLocaleDateString("pt-BR") : "-"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl shadow-[var(--shadow-2xl)]" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-2xl shadow-[var(--shadow-2xl)]" />
      </PopoverContent>
    </Popover>
  );
}

function PreviewModal({ pauta, onClose }: { pauta: Pauta; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-xl flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl w-full max-w-2xl overflow-hidden shadow-[var(--shadow-2xl)] animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-overlay-2)] backdrop-blur-sm flex items-center justify-between">
          <div>
            <div className="text-label text-[var(--text-quaternary)] font-bold mb-1">Visualizacao de Acervo</div>
            <h2 className="text-h2 font-bold tracking-tight text-[var(--text-primary)] uppercase">{pauta.retranca || "(Sem Retranca)"}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-all duration-300">
            <Plus className="h-7 w-7 rotate-45" />
          </button>
        </div>
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-2xl bg-[var(--bg-overlay)] border border-[var(--border-light)] shadow-inner">
              <span className="text-label text-[var(--text-quaternary)] block mb-1">Data</span>
              <div className="text-body-sm font-mono flex items-center gap-2 text-[var(--text-primary)]"><Clock className="h-3 w-3 text-[var(--text-tertiary)]" /> {pauta.data_pauta ? new Date(pauta.data_pauta + "T00:00:00").toLocaleDateString("pt-BR") : "-"}</div>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--bg-overlay)] border border-[var(--border-light)] shadow-inner">
              <span className="text-label text-[var(--text-quaternary)] block mb-1">Produtor</span>
              <div className="text-body-sm font-medium text-[var(--text-primary)]">{pauta.produtor || "-"}</div>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--bg-overlay)] border border-[var(--border-light)] shadow-inner">
              <span className="text-label text-[var(--text-quaternary)] block mb-1">Reporter</span>
              <div className="text-body-sm font-medium text-[var(--text-primary)]">{pauta.reporter || "-"}</div>
            </div>
          </div>
          <div className="space-y-4">
            <section className="bg-[var(--bg-overlay)] border border-[var(--border-light)] rounded-2xl p-4 shadow-inner">
              <span className="text-label text-[var(--accent-primary)] font-bold block mb-2">Proposta de Pauta</span>
              <p className="text-body-sm leading-relaxed whitespace-pre-wrap text-[var(--text-secondary)] italic">{pauta.proposta || "-"}</p>
            </section>
            {pauta.encaminhamento && (
              <section className="bg-[var(--bg-overlay)] border border-[var(--border-light)] rounded-2xl p-4 shadow-inner">
                <span className="text-label text-[var(--text-quaternary)] font-bold block mb-2">Encaminhamento</span>
                <p className="text-caption leading-relaxed whitespace-pre-wrap text-[var(--text-secondary)] font-mono">{pauta.encaminhamento}</p>
              </section>
            )}
          </div>
        </div>
        <div className="p-6 bg-[var(--bg-overlay-2)] backdrop-blur-sm border-t border-[var(--border-subtle)] flex justify-end">
          <Button onClick={onClose} className="px-8 py-3 rounded-2xl bg-[var(--accent-primary)] text-white font-bold text-body-sm transition-all duration-300 hover:shadow-[var(--shadow-xl)] active:scale-[0.98] shadow-[var(--shadow-lg)]">FECHAR</Button>
        </div>
      </div>
    </div>
  );
}
