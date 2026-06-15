import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, FileText, Users, Clock, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/metricas")({
  component: () => <MetricasPage />,
  head: () => ({ meta: [{ title: "Métricas — Newsdesk" }] }),
});

interface MateriaMetric { id: string; titulo: string; status: string; cliques: number; tempo_medio: number }

function MetricasPage() {
  const [data, setData] = useState<MateriaMetric[]>([]);
  const [stats, setStats] = useState({ pautas: 0, materias: 0, publicadas: 0, autores: 0 });

  useEffect(() => {
    (async () => {
      const [m, mt, p, profs] = await Promise.all([
        supabase.from("materias").select("id, titulo, status, autor_id").order("created_at", { ascending: false }).limit(50),
        supabase.from("metricas").select("materia_id, cliques, tempo_medio_seg"),
        supabase.from("pautas").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      const metrics = (mt.data ?? []) as { materia_id: string | null; cliques: number; tempo_medio_seg: number }[];
      const byMat = new Map<string, { cliques: number; tempo: number; count: number }>();
      metrics.forEach((x) => {
        if (!x.materia_id) return;
        const cur = byMat.get(x.materia_id) ?? { cliques: 0, tempo: 0, count: 0 };
        cur.cliques += x.cliques; cur.tempo += x.tempo_medio_seg; cur.count += 1;
        byMat.set(x.materia_id, cur);
      });
      const materias = (m.data ?? []) as { id: string; titulo: string; status: string; autor_id: string }[];
      setData(materias.map((mt) => {
        const x = byMat.get(mt.id);
        return { id: mt.id, titulo: mt.titulo, status: mt.status, cliques: x?.cliques ?? 0, tempo_medio: x ? Math.round(x.tempo / x.count) : 0 };
      }));
      setStats({
        pautas: p.count ?? 0,
        materias: materias.length,
        publicadas: materias.filter((x) => x.status === "publicado").length,
        autores: profs.count ?? 0,
      });
    })();
  }, []);

  const top = [...data].sort((a, b) => b.cliques - a.cliques).slice(0, 10);

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-primary)]/30">
      <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-3 shrink-0">
        <BarChart3 className="h-5 w-5 text-[var(--text-quaternary)]" />
        <h1 className="text-h1 font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">MÉTRICAS</h1>
        <span className="text-label text-[var(--text-tertiary)] hidden sm:inline">Análise · Dados Gerais</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={FileText} label="Pautas totais" value={stats.pautas} />
        <KpiCard icon={TrendingUp} label="Matérias" value={stats.materias} />
        <KpiCard icon={Clock} label="Publicadas" value={stats.publicadas} />
        <KpiCard icon={Users} label="Autores Ativos" value={stats.autores} />
      </div>

      <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-xl rounded-3xl p-6 mb-6 shadow-[var(--shadow-2xl)]">
        <h2 className="text-label text-[var(--text-tertiary)] mb-4">Top 10 matérias por cliques</h2>
        {top.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-body-sm text-[var(--text-tertiary)]">
            Sem dados de métricas ainda. Insira registros em <span className="font-mono mx-1 text-[var(--accent-primary)]">metricas</span> para ver o gráfico.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={top}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-medium)" />
              <XAxis dataKey="titulo" stroke="var(--text-tertiary)" fontSize={11} angle={-20} textAnchor="end" height={70} />
              <YAxis stroke="var(--text-tertiary)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "0.75rem", boxShadow: "var(--shadow-md)" }} />
              <Bar dataKey="cliques" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-xl rounded-3xl overflow-hidden shadow-[var(--shadow-2xl)]">
        <table className="w-full text-body-sm">
          <thead className="text-label text-[var(--text-tertiary)] bg-[var(--bg-overlay-2)]">
            <tr className="border-b border-[var(--border-subtle)]">
              <th className="text-left px-4 py-3.5">Matéria</th>
              <th className="text-left px-4 py-3.5 w-32">Status</th>
              <th className="text-right px-4 py-3.5 w-32">Cliques</th>
              <th className="text-right px-4 py-3.5 w-32">Tempo médio</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m) => (
              <tr key={m.id} className="border-t border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)] transition-colors duration-200">
                <td className="px-4 py-3 text-[var(--text-primary)]">{m.titulo}</td>
                <td className="px-4 py-3 text-caption text-[var(--text-tertiary)]">{m.status}</td>
                <td className="px-4 py-3 text-right font-mono text-[var(--text-secondary)]">{m.cliques.toLocaleString("pt-BR")}</td>
                <td className="px-4 py-3 text-right font-mono text-[var(--text-secondary)]">{Math.floor(m.tempo_medio / 60)}:{String(m.tempo_medio % 60).padStart(2, "0")}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-[var(--text-tertiary)] text-body-sm">Sem matérias ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl p-6 shadow-[var(--shadow-lg)] transition-all duration-300 hover:shadow-[var(--shadow-xl)]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-label text-[var(--text-tertiary)]">{label}</span>
        <Icon className="h-5 w-5 text-[var(--text-quaternary)]" />
      </div>
      <div className="text-display-lg font-bold font-mono text-[var(--text-primary)]">{value}</div>
    </div>
  );
}
