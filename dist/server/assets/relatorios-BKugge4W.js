import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from "react";
import { d as db } from "./router-NcdNWgek.js";
import { toast } from "sonner";
import { ClipboardList, Plus, Calendar } from "lucide-react";
import { B as Button } from "./button-DWfIo_Ug.js";
import { format } from "date-fns";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "@neondatabase/serverless";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
function RelatoriosPage() {
  const user = null;
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState(format(/* @__PURE__ */ new Date(), "yyyy-MM-01"));
  const [dataFim, setDataFim] = useState(format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
  const [programa, setPrograma] = useState("Todos");
  const [eventoFiltro, setEventoFiltro] = useState("Todos");
  const [showNew, setShowNew] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    let query = db.from("relatorio").select("*").order("data", {
      ascending: false
    });
    if (dataInicio) query = query.gte("data", dataInicio);
    if (dataFim) query = query.lte("data", dataFim);
    if (programa !== "Todos") query = query.eq("programa", programa);
    if (eventoFiltro !== "Todos") query = query.eq("evento", eventoFiltro);
    const {
      data,
      error
    } = await query;
    if (error) toast.error(error.message);
    else setRelatorios(data ?? []);
    setLoading(false);
  }, [dataInicio, dataFim, programa, eventoFiltro]);
  useEffect(() => {
    load();
  }, [dataInicio, dataFim, programa, eventoFiltro]);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen p-4 sm:p-6 bg-[#09090b] text-slate-100 font-sans", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border-b border-[#22c55e]/20 pb-4 mb-8", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-9 w-9 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/40", children: /* @__PURE__ */ jsx(ClipboardList, { className: "h-5 w-5 text-[#22c55e]" }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black tracking-tight font-mono uppercase text-white", children: "Relatórios" }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500 hidden sm:inline font-mono uppercase ml-auto", children: "Gestão Editorial" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-8", children: [
      /* @__PURE__ */ jsx("div", { className: "hidden sm:block", children: /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest", children: "Histórico de ocorrências" }) }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => setShowNew(true), className: "inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#22c55e]/10 border border-[#22c55e] text-white text-xs font-black uppercase tracking-wider transition-all duration-300 hover:bg-[#22c55e]/20 hover:shadow-lg hover:shadow-[#22c55e]/20 active:scale-95 font-mono", children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        " Novo"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 mb-8 backdrop-blur-lg shadow-2xl", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest mb-4", children: "Filtros" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2", children: "Data Inicial" }),
          /* @__PURE__ */ jsx("input", { type: "date", value: dataInicio, onChange: (e) => setDataInicio(e.target.value), className: "w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all font-mono" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2", children: "Data Final" }),
          /* @__PURE__ */ jsx("input", { type: "date", value: dataFim, onChange: (e) => setDataFim(e.target.value), className: "w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all font-mono" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2", children: "Programa" }),
          /* @__PURE__ */ jsxs("select", { value: programa, onChange: (e) => setPrograma(e.target.value), className: "w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all appearance-none cursor-pointer font-mono", children: [
            /* @__PURE__ */ jsx("option", { value: "Todos", children: "Todos" }),
            /* @__PURE__ */ jsx("option", { value: "Jornal da Manhã", children: "Jornal da Manhã" }),
            /* @__PURE__ */ jsx("option", { value: "Edição Meio-Dia", children: "Edição Meio-Dia" }),
            /* @__PURE__ */ jsx("option", { value: "Jornal da Noite", children: "Jornal da Noite" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2", children: "Eventos" }),
          /* @__PURE__ */ jsxs("select", { value: eventoFiltro, onChange: (e) => setEventoFiltro(e.target.value), className: "w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all appearance-none cursor-pointer font-mono", children: [
            /* @__PURE__ */ jsx("option", { value: "Todos", children: "Mostrar Tudo" }),
            /* @__PURE__ */ jsx("option", { value: "Pautas Caídas", children: "Pautas Caídas" }),
            /* @__PURE__ */ jsx("option", { value: "Relatórios", children: "Relatórios" }),
            /* @__PURE__ */ jsx("option", { value: "Outros", children: "Outros" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4", children: loading ? /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-slate-500 italic font-mono text-xs", children: "CARREGANDO..." }) : relatorios.length === 0 ? /* @__PURE__ */ jsx("div", { className: "bg-[#0f0f12] border border-dashed border-[#22c55e]/30 rounded-lg p-12 text-center text-slate-500 text-xs font-mono", children: "SEM REGISTROS" }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4", children: relatorios.map((r) => /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-4 hover:bg-[#1a1a21] hover:border-[#22c55e]/40 transition-all group backdrop-blur-lg shadow-xl hover:shadow-[0_0_20px_#22c55e10]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsx("span", { className: "bg-[#22c55e]/20 text-[#22c55e] text-xs px-3 py-1.5 rounded-md border border-[#22c55e]/40 font-mono font-bold uppercase tracking-wider", children: r.evento }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-500 flex items-center gap-1 font-mono", children: [
            /* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3" }),
            new Date(r.data).toLocaleDateString("pt-BR")
          ] })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-600 font-mono uppercase tracking-widest", children: r.programa })
      ] }),
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-slate-100 mb-2 font-mono uppercase", children: r.retranca }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 line-clamp-2 leading-relaxed", children: r.texto })
    ] }, r.id)) }) }),
    showNew && user
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsx(RelatoriosPage, {});
export {
  SplitComponent as component
};
