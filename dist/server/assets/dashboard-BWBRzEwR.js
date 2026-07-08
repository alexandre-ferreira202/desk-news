import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { d as db } from "./router-NcdNWgek.js";
import { c as createSsrRpc } from "./createSsrRpc-bvl1gotf.js";
import { a as createServerFn } from "./server-BA6c70hh.js";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell } from "recharts";
import { Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "@neondatabase/serverless";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
const fetchPortais = createServerFn({
  method: "GET"
}).handler(createSsrRpc("6034dd0900db6c82937769838ab5d6fdcc8e82e37dc57b0b4272a29ebbfcc5a2"));
function Dashboard() {
  const [metrics, setMetrics] = useState({
    pautas: 0,
    materias: 0,
    publicadas: 0,
    em_producao: 0,
    espelhos: 0,
    usuarios: 0
  });
  const [statusData, setStatusData] = useState([]);
  const [topReporters, setTopReporters] = useState([]);
  const [ultimasMaterias, setUltimasMaterias] = useState([]);
  const [ultimasPautas, setUltimasPautas] = useState([]);
  const [productionData, setProductionData] = useState([]);
  const [turnoData, setTurnoData] = useState([]);
  const [portalNews, setPortalNews] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const {
          data: pautasData
        } = await db.from("pautas").select("*").order("created_at", {
          ascending: false
        }).limit(100);
        const {
          data: materiasData
        } = await db.from("materias").select("*").order("created_at", {
          ascending: false
        }).limit(100);
        const {
          data: espelhosData
        } = await db.from("espelho_blocos").select("*").limit(50);
        const {
          data: profilesData
        } = await db.from("profiles").select("id").limit(100);
        const pautas = pautasData || [];
        const materias = materiasData || [];
        const espelhos = espelhosData || [];
        const publicadas = materias.filter((m) => m.status === "publicado").length;
        const em_producao = materias.filter((m) => m.status === "rascunho" || m.status === "revisao").length;
        setMetrics({
          pautas: pautas.length,
          materias: materias.length,
          publicadas,
          em_producao,
          espelhos: espelhos.length,
          usuarios: profilesData?.length || 0
        });
        setStatusData([{
          name: "Publicado",
          value: materias.filter((m) => m.status === "publicado").length
        }, {
          name: "Rascunho",
          value: materias.filter((m) => m.status === "rascunho").length
        }, {
          name: "Revisão",
          value: materias.filter((m) => m.status === "revisao").length
        }]);
        const reporterMap = {};
        pautas.forEach((p) => {
          if (p.reporter) {
            reporterMap[p.reporter] = (reporterMap[p.reporter] || 0) + 1;
          }
        });
        const reporters = Object.entries(reporterMap).sort(([, a], [, b]) => b - a).slice(0, 5).map(([name, count]) => ({
          name: name.substring(0, 20),
          materias: count
        }));
        setTopReporters(reporters);
        setUltimasMaterias(materias.slice(0, 5));
        setUltimasPautas(pautas.slice(0, 5));
        const turnoMap = {
          "Manhã": 0,
          "Tarde": 0,
          "Noite": 0
        };
        pautas.forEach((p) => {
          if (p.turno && turnoMap[p.turno] !== void 0) {
            turnoMap[p.turno]++;
          }
        });
        const totalPautas = pautas.length || 1;
        const turnoDataFormatted = Object.entries(turnoMap).map(([turno, quantidade]) => ({
          turno,
          quantidade,
          percentual: Math.round(quantidade / totalPautas * 100)
        }));
        setTurnoData(turnoDataFormatted);
        const lastWeek = [];
        for (let i = 6; i >= 0; i--) {
          const date = /* @__PURE__ */ new Date();
          date.setDate(date.getDate() - i);
          const dayStr = date.toLocaleDateString("pt-BR", {
            weekday: "short"
          });
          const dayStart = new Date(date);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(date);
          dayEnd.setHours(23, 59, 59, 999);
          const producao = materias.filter((m) => {
            const created = new Date(m.created_at);
            return created >= dayStart && created <= dayEnd;
          }).length;
          lastWeek.push({
            day: dayStr.substring(0, 3).toUpperCase(),
            producao,
            date: date.toLocaleDateString("pt-BR")
          });
        }
        setProductionData(lastWeek);
        try {
          const feeds = await fetchPortais();
          const topFeeds = feeds.filter((f) => f.items && f.items.length > 0).slice(0, 5);
          setPortalNews(topFeeds);
        } catch (err) {
          console.error("Erro ao buscar portais:", err);
        }
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast.error("Erro ao carregar dashboard");
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const COLORS = ["#22c55e", "#ef4444", "#3b82f6"];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#09090b] text-slate-100 font-sans", children: [
    /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 pointer-events-none overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#22c55e]/10 to-blue-500/5 rounded-full blur-3xl animate-pulse opacity-50" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl opacity-50", style: {
        animationDelay: "1s"
      } })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 p-4 md:p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-8 border-b border-[#22c55e]/20 pb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl md:text-3xl font-black tracking-tight font-mono uppercase", children: "Dashboard" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500 font-mono ml-auto hidden md:inline", children: "ON AIR" })
      ] }),
      loading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-96", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx(Loader2, { className: "w-12 h-12 animate-spin text-[#22c55e] mx-auto mb-4" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 font-mono text-xs uppercase tracking-widest", children: "INICIALIZANDO..." })
      ] }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8", children: [
          /* @__PURE__ */ jsx(MetricCard, { label: "Pautas", value: metrics.pautas }),
          /* @__PURE__ */ jsx(MetricCard, { label: "Matérias", value: metrics.materias }),
          /* @__PURE__ */ jsx(MetricCard, { label: "Publicadas", value: metrics.publicadas }),
          /* @__PURE__ */ jsx(MetricCard, { label: "Produção", value: metrics.em_producao }),
          /* @__PURE__ */ jsx(MetricCard, { label: "Espelhos", value: metrics.espelhos }),
          /* @__PURE__ */ jsx(MetricCard, { label: "Autores", value: metrics.usuarios })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8", children: [
          /* @__PURE__ */ jsx(PremiumCard, { title: "Produção 7 dias", children: productionData.length > 0 ? /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 250, children: /* @__PURE__ */ jsxs(BarChart, { data: productionData, children: [
            /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#22c55e20" }),
            /* @__PURE__ */ jsx(XAxis, { dataKey: "day", stroke: "#64748b", fontSize: 11 }),
            /* @__PURE__ */ jsx(YAxis, { stroke: "#64748b", fontSize: 11 }),
            /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
              background: "#0f0f12",
              border: "1px solid #22c55e40",
              borderRadius: "0.5rem"
            } }),
            /* @__PURE__ */ jsx(Bar, { dataKey: "producao", fill: "#22c55e", radius: [2, 2, 0, 0] })
          ] }) }) : /* @__PURE__ */ jsx("div", { className: "h-64 flex items-center justify-center text-slate-500 text-xs", children: "SEM DADOS" }) }),
          /* @__PURE__ */ jsx(PremiumCard, { title: "Status das Matérias", children: statusData.length > 0 ? /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 250, children: /* @__PURE__ */ jsxs(PieChart, { children: [
            /* @__PURE__ */ jsx(Pie, { data: statusData, cx: "50%", cy: "50%", labelLine: false, label: {
              fill: "#e2e8f0",
              fontSize: 11
            }, outerRadius: 80, fill: "#22c55e", dataKey: "value", children: COLORS.map((color, index) => /* @__PURE__ */ jsx(Cell, { fill: color }, `cell-${index}`)) }),
            /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
              background: "#0f0f12",
              border: "1px solid #22c55e40"
            } })
          ] }) }) : /* @__PURE__ */ jsx("div", { className: "h-64 flex items-center justify-center text-slate-500 text-xs", children: "SEM DADOS" }) }),
          /* @__PURE__ */ jsx(PremiumCard, { title: "Top Repórteres", children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: topReporters.length > 0 ? topReporters.map((reporter, idx) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 bg-[#1a1a21] rounded-md border border-[#22c55e]/20 hover:border-[#22c55e]/40 transition-all", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-mono text-slate-300", children: reporter.name }),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-black text-[#22c55e] font-mono", children: reporter.materias })
          ] }, idx)) : /* @__PURE__ */ jsx("div", { className: "text-center text-slate-500 text-xs", children: "SEM DADOS" }) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8", children: [
          /* @__PURE__ */ jsx(PremiumCard, { title: "Últimas Matérias", children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: ultimasMaterias.length > 0 ? ultimasMaterias.map((materia, idx) => /* @__PURE__ */ jsxs("div", { className: `p-3 rounded-md border border-l-4 transition-all ${materia.status === "publicado" ? "border-[#22c55e] border-l-[#22c55e] bg-[#22c55e]/5" : materia.status === "rascunho" ? "border-[#f59e0b]/30 border-l-[#f59e0b] bg-[#f59e0b]/5" : "border-[#3b82f6]/30 border-l-[#3b82f6] bg-[#3b82f6]/5"}`, children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-200 line-clamp-1 font-mono", children: materia.titulo || "---" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-600 font-mono", children: new Date(materia.created_at).toLocaleDateString("pt-BR") }),
              /* @__PURE__ */ jsx("span", { className: `text-xs font-bold px-2 py-0.5 rounded font-mono uppercase text-xs tracking-wider ${materia.status === "publicado" ? "bg-[#22c55e]/30 text-[#22c55e]" : materia.status === "rascunho" ? "bg-[#f59e0b]/30 text-[#f59e0b]" : "bg-[#3b82f6]/30 text-[#3b82f6]"}`, children: materia.status })
            ] })
          ] }, idx)) : /* @__PURE__ */ jsx("div", { className: "text-center text-slate-500 text-xs", children: "SEM DADOS" }) }) }),
          /* @__PURE__ */ jsx(PremiumCard, { title: "Últimas Pautas", children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: ultimasPautas.length > 0 ? ultimasPautas.map((pauta, idx) => /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-md bg-[#1a1a21] border border-[#22c55e]/20 hover:border-[#22c55e]/40 transition-all border-l-2 border-l-[#22c55e]", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-200 truncate font-mono", children: pauta.titulo || pauta.retranca || "---" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-2 text-xs text-slate-600 font-mono", children: [
              /* @__PURE__ */ jsx("span", { children: pauta.tipo || "PAUTA" }),
              /* @__PURE__ */ jsx("span", { className: "text-[#22c55e]", children: "•" }),
              /* @__PURE__ */ jsx("span", { children: pauta.turno || "---" })
            ] })
          ] }, idx)) : /* @__PURE__ */ jsx("div", { className: "text-center text-slate-500 text-xs", children: "SEM DADOS" }) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6 border-b border-[#22c55e]/20 pb-4", children: [
            /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-[#22c55e]" }),
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-black font-mono uppercase", children: "Mundo" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 lg:grid-cols-5 gap-4", children: portalNews.length > 0 ? portalNews.map((portal, pidx) => /* @__PURE__ */ jsx(PremiumCard, { title: portal.portal, children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: portal.items && portal.items.slice(0, 3).map((news, nidx) => /* @__PURE__ */ jsxs("a", { href: news.link, target: "_blank", rel: "noopener noreferrer", className: "block p-3 rounded-md bg-[#1a1a21] border border-[#22c55e]/20 hover:border-[#22c55e]/40 hover:bg-[#1a1a21]/80 transition-all group", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-300 line-clamp-2 group-hover:text-[#22c55e] transition-colors font-mono", children: news.title }),
            news.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 mt-2 line-clamp-1 font-mono", children: news.description }),
            news.pubDate && /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-700 mt-2 flex items-center gap-1 font-mono", children: new Date(news.pubDate).toLocaleDateString("pt-BR") }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 mt-3 text-[#22c55e] group-hover:text-[#16a34a]", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold font-mono", children: "Ir" }),
              /* @__PURE__ */ jsx(ExternalLink, { size: 11 })
            ] })
          ] }, nidx)) }) }, pidx)) : /* @__PURE__ */ jsxs("div", { className: "col-span-5 text-center py-8 text-slate-500 font-mono text-xs", children: [
            /* @__PURE__ */ jsx(Loader2, { className: "w-6 h-6 animate-spin mx-auto mb-2 opacity-50" }),
            "CARREGANDO..."
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-12 border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-4 text-center backdrop-blur-lg", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 font-mono uppercase tracking-widest", children: "Dashboard DeskNews" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 font-mono mt-1", children: (/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR") })
        ] })
      ] })
    ] })
  ] });
}
function MetricCard({
  label,
  value
}) {
  return /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-4 backdrop-blur-lg shadow-xl hover:shadow-[0_0_20px_#22c55e20] transition-all duration-300", children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 font-mono uppercase tracking-widest mb-2", children: label }),
    /* @__PURE__ */ jsx("div", { className: "text-2xl font-black text-[#22c55e] font-mono", children: value })
  ] });
}
function PremiumCard({
  title,
  children
}) {
  return /* @__PURE__ */ jsx("div", { className: "relative group", children: /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 backdrop-blur-lg shadow-xl hover:shadow-[0_0_20px_#22c55e20] transition-all duration-300 h-full", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-sm font-black mb-4 text-white font-mono uppercase tracking-widest", children: title }),
    children
  ] }) });
}
const SplitComponent = () => /* @__PURE__ */ jsx(Dashboard, {});
export {
  SplitComponent as component
};
