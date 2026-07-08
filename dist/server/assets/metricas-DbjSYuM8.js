import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { d as db } from "./router-NcdNWgek.js";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { BarChart3 } from "lucide-react";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "sonner";
import "@neondatabase/serverless";
function MetricasPage() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({
    pautas: 0,
    materias: 0,
    publicadas: 0,
    autores: 0
  });
  useEffect(() => {
    (async () => {
      const [m, mt, p, profs] = await Promise.all([db.from("materias").select("id, titulo, status, autor_id").order("created_at", {
        ascending: false
      }).limit(50), db.from("metricas").select("materia_id, cliques, tempo_medio_seg"), db.from("pautas").select("id", {
        count: "exact",
        head: true
      }), db.from("profiles").select("id", {
        count: "exact",
        head: true
      })]);
      const metrics = mt.data ?? [];
      const byMat = /* @__PURE__ */ new Map();
      metrics.forEach((x) => {
        if (!x.materia_id) return;
        const cur = byMat.get(x.materia_id) ?? {
          cliques: 0,
          tempo: 0,
          count: 0
        };
        cur.cliques += x.cliques;
        cur.tempo += x.tempo_medio_seg;
        cur.count += 1;
        byMat.set(x.materia_id, cur);
      });
      const materias = m.data ?? [];
      setData(materias.map((mt2) => {
        const x = byMat.get(mt2.id);
        return {
          id: mt2.id,
          titulo: mt2.titulo,
          status: mt2.status,
          cliques: x?.cliques ?? 0,
          tempo_medio: x ? Math.round(x.tempo / x.count) : 0
        };
      }));
      setStats({
        pautas: p.count ?? 0,
        materias: materias.length,
        publicadas: materias.filter((x) => x.status === "publicado").length,
        autores: profs.count ?? 0
      });
    })();
  }, []);
  const top = [...data].sort((a, b) => b.cliques - a.cliques).slice(0, 10);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen p-4 sm:p-6 bg-[#09090b] text-slate-100 font-sans", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 font-mono uppercase tracking-widest mb-2", children: "Sistema de Análise" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-9 w-9 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/40", children: /* @__PURE__ */ jsx(BarChart3, { className: "h-5 w-5 text-[#22c55e]" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-black tracking-tight font-mono uppercase text-white", children: "MÉTRICAS" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8", children: [
      /* @__PURE__ */ jsx(KpiCard, { label: "Pautas", value: stats.pautas }),
      /* @__PURE__ */ jsx(KpiCard, { label: "Matérias", value: stats.materias }),
      /* @__PURE__ */ jsx(KpiCard, { label: "Publicadas", value: stats.publicadas }),
      /* @__PURE__ */ jsx(KpiCard, { label: "Autores", value: stats.autores })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 mb-8 backdrop-blur-lg shadow-2xl", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest mb-4", children: "TOP 10 CLIQUES" }),
      top.length === 0 ? /* @__PURE__ */ jsx("div", { className: "h-[300px] flex items-center justify-center text-xs text-slate-500 font-mono", children: "SEM DADOS" }) : /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxs(BarChart, { data: top, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#22c55e20" }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "titulo", stroke: "#64748b", fontSize: 11, angle: -20, textAnchor: "end", height: 70 }),
        /* @__PURE__ */ jsx(YAxis, { stroke: "#64748b", fontSize: 11 }),
        /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
          background: "#0f0f12",
          border: "1px solid #22c55e40",
          borderRadius: "0.5rem"
        } }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "cliques", fill: "#22c55e", radius: [2, 2, 0, 0] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg overflow-hidden backdrop-blur-lg shadow-2xl", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs", children: [
      /* @__PURE__ */ jsx("thead", { className: "text-slate-500 bg-[#0a0e27] font-mono uppercase", children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-[#22c55e]/10", children: [
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 tracking-wider", children: "Matéria" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 w-24 tracking-wider", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 w-24 tracking-wider", children: "Cliques" }),
        /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 w-32 tracking-wider", children: "Tempo Médio" })
      ] }) }),
      /* @__PURE__ */ jsxs("tbody", { children: [
        data.map((m) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-[#22c55e]/10 hover:bg-[#1a1a21] transition-colors border-l-2 border-l-transparent hover:border-l-[#22c55e]", children: [
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-slate-200 font-mono", children: m.titulo }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-slate-500 font-mono", children: m.status }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right font-mono text-[#22c55e]", children: m.cliques.toLocaleString("pt-BR") }),
          /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-right font-mono text-slate-400", children: [
            Math.floor(m.tempo_medio / 60),
            ":",
            String(m.tempo_medio % 60).padStart(2, "0")
          ] })
        ] }, m.id)),
        data.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 4, className: "px-4 py-12 text-center text-slate-500 text-xs font-mono", children: "SEM DADOS" }) })
      ] })
    ] }) })
  ] });
}
function KpiCard({
  label,
  value
}) {
  return /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-5 backdrop-blur-lg shadow-xl hover:shadow-[0_0_20px_#22c55e20] transition-all duration-300", children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest mb-3", children: label }),
    /* @__PURE__ */ jsx("div", { className: "text-3xl font-black font-mono text-[#22c55e]", children: value })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsx(MetricasPage, {});
export {
  SplitComponent as component
};
