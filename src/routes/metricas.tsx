import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/db";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { BarChart3, RefreshCw, Download, ArrowUp, ArrowDown, Minus } from "lucide-react";

export const Route = createFileRoute("/metricas")({
  component: () => <MetricasPage />,
  head: () => ({ meta: [{ title: "Métricas — Newsdesk" }] }),
});

interface MateriaMetric { id: string; titulo: string; status: string; cliques: number; tempo_medio: number }

type Periodo = "hoje" | "7d" | "30d" | "tudo";

const PERIODOS: { key: Periodo; label: string }[] = [
  { key: "hoje", label: "Hoje" },
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "tudo", label: "Tudo" },
];

// Calcula início do período atual e do período anterior de mesma duração,
// para permitir comparação "vs período anterior" (padrão em dashboards de audiência).
function getRange(periodo: Periodo): { start: string | null; prevStart: string | null; prevEnd: string | null } {
  if (periodo === "tudo") return { start: null, prevStart: null, prevEnd: null };
  const now = new Date();
  const start = new Date(now);
  const days = periodo === "hoje" ? 1 : periodo === "7d" ? 7 : 30;
  if (periodo === "hoje") {
    start.setHours(0, 0, 0, 0);
  } else {
    start.setDate(start.getDate() - days);
  }
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - days);
  return { start: start.toISOString(), prevStart: prevStart.toISOString(), prevEnd: start.toISOString() };
}

function pctDelta(cur: number, prev: number): number | null {
  if (prev === 0) return cur === 0 ? 0 : null; // null = "sem base de comparação"
  return Math.round(((cur - prev) / prev) * 1000) / 10;
}

function SkeletonKpi() {
  return (
    <div className="border-l-4 border-[#22c55e]/20 bg-[#0f0f12] border border-[#22c55e]/10 rounded-lg p-5 animate-pulse">
      <div className="h-3 w-16 bg-slate-800 rounded mb-4" />
      <div className="h-8 w-20 bg-slate-800 rounded" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-t border-[#22c55e]/10">
      <td className="px-4 py-3"><div className="h-3 w-40 bg-slate-800 rounded animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-3 w-16 bg-slate-800 rounded animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-3 w-10 bg-slate-800 rounded animate-pulse ml-auto" /></td>
      <td className="px-4 py-3"><div className="h-3 w-12 bg-slate-800 rounded animate-pulse ml-auto" /></td>
    </tr>
  );
}

function MetricasPage() {
  const [data, setData] = useState<MateriaMetric[]>([]);
  const [stats, setStats] = useState({ pautas: 0, materias: 0, publicadas: 0, autores: 0 });
  const [deltas, setDeltas] = useState<{ materias: number | null; publicadas: number | null; cliques: number | null }>({
    materias: null, publicadas: null, cliques: null,
  });
  const [statusBreakdown, setStatusBreakdown] = useState<{ status: string; count: number }[]>([]);
  const [periodo, setPeriodo] = useState<Periodo>("7d");
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [secsAgo, setSecsAgo] = useState(0);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { start, prevStart, prevEnd } = getRange(periodo);

    let materiasQuery = supabase
      .from("materias")
      .select("id, titulo, status, autor_id, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (start) materiasQuery = materiasQuery.gte("created_at", start);

    const queries: Promise<any>[] = [
      materiasQuery,
      supabase.from("metricas").select("materia_id, cliques, tempo_medio_seg"),
      supabase.from("pautas").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ];

    // Período anterior — só buscamos se houver um período definido (não faz sentido para "Tudo")
    const temComparacao = start !== null && prevStart !== null && prevEnd !== null;
    if (temComparacao) {
      queries.push(
        supabase.from("materias").select("id, status")
          .gte("created_at", prevStart as string)
          .lt("created_at", prevEnd as string)
      );
    }

    const [m, mt, p, profs, mPrev] = await Promise.all(queries);

    const metrics = (mt.data ?? []) as { materia_id: string | null; cliques: number; tempo_medio_seg: number }[];
    const byMat = new Map<string, { cliques: number; tempo: number; count: number }>();
    metrics.forEach((x) => {
      if (!x.materia_id) return;
      const cur = byMat.get(x.materia_id) ?? { cliques: 0, tempo: 0, count: 0 };
      cur.cliques += x.cliques; cur.tempo += x.tempo_medio_seg; cur.count += 1;
      byMat.set(x.materia_id, cur);
    });

    const materias = (m.data ?? []) as { id: string; titulo: string; status: string; autor_id: string }[];
    setData(materias.map((row) => {
      const x = byMat.get(row.id);
      return { id: row.id, titulo: row.titulo, status: row.status, cliques: x?.cliques ?? 0, tempo_medio: x ? Math.round(x.tempo / x.count) : 0 };
    }));

    const totalCliques = materias.reduce((acc, row) => acc + (byMat.get(row.id)?.cliques ?? 0), 0);
    const publicadasCount = materias.filter((x) => x.status === "publicado").length;

    setStats({
      pautas: p.count ?? 0,
      materias: materias.length,
      publicadas: publicadasCount,
      autores: profs.count ?? 0,
    });

    // Distribuição por status (barra empilhada simples)
    const statusMap = new Map<string, number>();
    materias.forEach((x) => statusMap.set(x.status, (statusMap.get(x.status) ?? 0) + 1));
    setStatusBreakdown([...statusMap.entries()].map(([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count));

    if (temComparacao && mPrev) {
      const prevMaterias = (mPrev.data ?? []) as { id: string; status: string }[];
      const prevCliques = prevMaterias.reduce((acc, row) => acc + (byMat.get(row.id)?.cliques ?? 0), 0);
      const prevPublicadas = prevMaterias.filter((x) => x.status === "publicado").length;
      setDeltas({
        materias: pctDelta(materias.length, prevMaterias.length),
        publicadas: pctDelta(publicadasCount, prevPublicadas),
        cliques: pctDelta(totalCliques, prevCliques),
      });
    } else {
      setDeltas({ materias: null, publicadas: null, cliques: null });
    }

    setLastUpdated(new Date());
    setLoading(false);
  }, [periodo]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh (padrão em painéis de audiência ao vivo tipo Chartbeat/Parse.ly)
  useEffect(() => {
    if (autoRefresh) {
      refreshTimer.current = setInterval(load, 60_000);
    }
    return () => { if (refreshTimer.current) clearInterval(refreshTimer.current); };
  }, [autoRefresh, load]);

  // Contador "atualizado há Xs"
  useEffect(() => {
    const t = setInterval(() => {
      if (lastUpdated) setSecsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [lastUpdated]);

  const top = [...data].sort((a, b) => b.cliques - a.cliques).slice(0, 10);

  const exportCsv = () => {
    const header = "titulo,status,cliques,tempo_medio_seg";
    const rows = data.map((m) => `"${m.titulo.replace(/"/g, '""')}",${m.status},${m.cliques},${m.tempo_medio}`);
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `metricas_${periodo}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-[#09090b] text-slate-100 font-sans">
      <div className="border-b border-[#22c55e]/20 pb-4 mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#22c55e] mb-1">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).toUpperCase()}
          </p>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#6b7280] mb-2">Sistema de Análise</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/40">
              <BarChart3 className="h-5 w-5 text-[#22c55e]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-mono uppercase text-white">MÉTRICAS</h1>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-mono uppercase tracking-wider transition-all ${
                autoRefresh
                  ? "border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]"
                  : "border-[#22c55e]/30 text-slate-500 hover:text-slate-300"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${autoRefresh ? "bg-[#22c55e] animate-pulse" : "bg-slate-600"}`} />
              {autoRefresh ? "Ao vivo" : "Ativar ao vivo"}
            </button>
            <button
              onClick={load}
              disabled={loading}
              className="p-2 rounded-md border border-[#22c55e]/30 text-slate-400 hover:text-slate-200 hover:border-[#22c55e]/60 transition-all disabled:opacity-40"
              title="Atualizar agora"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={exportCsv}
              disabled={data.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#22c55e]/30 text-slate-400 text-xs font-mono uppercase tracking-wider hover:text-slate-200 hover:border-[#22c55e]/60 transition-all disabled:opacity-40"
            >
              <Download className="h-3 w-3" /> CSV
            </button>
          </div>
          {lastUpdated && (
            <p className="text-[10px] text-slate-600 font-mono">
              atualizado há {secsAgo < 60 ? `${secsAgo}s` : `${Math.floor(secsAgo / 60)}min`}
            </p>
          )}
        </div>
      </div>

      {/* Filtro de período */}
      <div className="flex items-center gap-2 mb-6">
        {PERIODOS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriodo(p.key)}
            className={`px-4 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider border transition-all ${
              periodo === p.key
                ? "bg-[#22c55e]/20 border-[#22c55e] text-[#22c55e]"
                : "border-[#22c55e]/20 text-slate-500 hover:border-[#22c55e]/40 hover:text-slate-300"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <>
            <SkeletonKpi /><SkeletonKpi /><SkeletonKpi /><SkeletonKpi />
          </>
        ) : (
          <>
            <KpiCard label="Pautas" value={stats.pautas} />
            <KpiCard label="Matérias" value={stats.materias} delta={deltas.materias} />
            <KpiCard label="Publicadas" value={stats.publicadas} delta={deltas.publicadas} />
            <KpiCard label="Autores" value={stats.autores} />
          </>
        )}
      </div>

      {/* Distribuição por status */}
      {!loading && statusBreakdown.length > 0 && (
        <div className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 mb-8 backdrop-blur-lg shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Distribuição por status</p>
            {deltas.cliques !== null && (
              <p className="text-xs text-slate-600 font-mono">
                <DeltaBadge value={deltas.cliques} suffix=" cliques vs período anterior" />
              </p>
            )}
          </div>
          <div className="flex h-3 w-full rounded-full overflow-hidden bg-[#141416]">
            {statusBreakdown.map((s, i) => (
              <div
                key={s.status}
                className={i % 2 === 0 ? "bg-[#22c55e]" : "bg-[#22c55e]/40"}
                style={{ width: `${(s.count / data.length) * 100}%` }}
                title={`${s.status}: ${s.count}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            {statusBreakdown.map((s, i) => (
              <span key={s.status} className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${i % 2 === 0 ? "bg-[#22c55e]" : "bg-[#22c55e]/40"}`} />
                {s.status} · {s.count}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 mb-8 backdrop-blur-lg shadow-2xl">
        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-4">TOP 10 CLIQUES</p>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-xs text-slate-500 font-mono">
            CARREGANDO...
          </div>
        ) : top.length === 0 ? (
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
            {loading ? (
              <>
                <SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow />
              </>
            ) : (
              <>
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
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DeltaBadge({ value, suffix = "" }: { value: number; suffix?: string }) {
  const isUp = value > 0;
  const isFlat = value === 0;
  const Icon = isFlat ? Minus : isUp ? ArrowUp : ArrowDown;
  const color = isFlat ? "text-slate-500" : isUp ? "text-[#22c55e]" : "text-red-400";
  return (
    <span className={`inline-flex items-center gap-0.5 font-mono ${color}`}>
      <Icon className="h-3 w-3" />
      {Math.abs(value)}%{suffix}
    </span>
  );
}

function KpiCard({ label, value, delta }: { label: string; value: number; delta?: number | null }) {
  return (
    <div className="border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-5 backdrop-blur-lg shadow-xl hover:shadow-[0_0_20px_#22c55e20] transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">{label}</p>
        {delta !== null && delta !== undefined && <DeltaBadge value={delta} />}
      </div>
      <div className="text-3xl font-black font-mono text-[#22c55e]">{value}</div>
    </div>
  );
}
