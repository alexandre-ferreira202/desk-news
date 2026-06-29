import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { BarChart3 } from "lucide-react";

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
    <div className="min-h-screen p-4 sm:p-6 bg-[#09090b] text-slate-100 font-sans">
      <div className="mb-8">
        <p className="text-xs text-slate-600 font-mono uppercase tracking-widest mb-2">Sistema de Análise</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/40">
            <BarChart3 className="h-5 w-5 text-[#22c55e]" />
          </div>
          <h1 className="text-3xl font-black tracking-tight font-mono uppercase text-white">MÉTRICAS</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Pautas" value={stats.pautas} />
        <KpiCard label="Matérias" value={stats.materias} />
        <KpiCard label="Publicadas" value={stats.publicadas} />
        <KpiCard label="Autores" value={stats.autores} />
      </div>

      <div className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 mb-8 backdrop-blur-lg shadow-2xl">
        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-4">TOP 10 CLIQUES</p>
        {top.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-xs text-slate-500 font-mono">
            SEM DADOS
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={top}>
              <CartesianGrid strokeDasharray="3 3" stroke="#22c55e20" />
              <XAxis dataKey="titulo" stroke="#64748b" fontSize={11} angle={-20} textAnchor="end" height={70} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ background: "#0f0f12", border: "1px solid #22c55e40", borderRadius: "0.5rem" }} />
              <Bar dataKey="cliques" fill="#22c55e" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg overflow-hidden backdrop-blur-lg shadow-2xl">
        <table className="w-full text-xs">
          <thead className="text-slate-500 bg-[#0a0e27] font-mono uppercase">
            <tr className="border-b border-[#22c55e]/10">
              <th className="text-left px-4 py-3 tracking-wider">Matéria</th>
              <th className="text-left px-4 py-3 w-24 tracking-wider">Status</th>
              <th className="text-right px-4 py-3 w-24 tracking-wider">Cliques</th>
              <th className="text-right px-4 py-3 w-32 tracking-wider">Tempo Médio</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m) => (
              <tr key={m.id} className="border-t border-[#22c55e]/10 hover:bg-[#1a1a21] transition-colors border-l-2 border-l-transparent hover:border-l-[#22c55e]">
                <td className="px-4 py-3 text-slate-200 font-mono">{m.titulo}</td>
                <td className="px-4 py-3 text-slate-500 font-mono">{m.status}</td>
                <td className="px-4 py-3 text-right font-mono text-[#22c55e]">{m.cliques.toLocaleString("pt-BR")}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-400">{Math.floor(m.tempo_medio / 60)}:{String(m.tempo_medio % 60).padStart(2, "0")}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-500 text-xs font-mono">SEM DADOS</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-5 backdrop-blur-lg shadow-xl hover:shadow-[0_0_20px_#22c55e20] transition-all duration-300">
      <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-3">{label}</p>
      <div className="text-3xl font-black font-mono text-[#22c55e]">{value}</div>
    </div>
  );
}
