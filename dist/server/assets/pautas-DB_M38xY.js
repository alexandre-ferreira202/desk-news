import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useCallback, useEffect, useMemo } from "react";
import { d as db } from "./router-NcdNWgek.js";
import { toast } from "sonner";
import { FileText, LayoutGrid, Search, Megaphone, Archive, Rss, Plus, ChevronLeft, ChevronRight, Trash2, Clock, CalendarIcon, MapPin, Pencil, Loader2 } from "lucide-react";
import { B as Button } from "./button-DWfIo_Ug.js";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "@neondatabase/serverless";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
const sanitize = (v) => v.replace(/<[^>]*>?/gm, "").trim();
const TIPOS = ["VT", "Nota", "Nota Pelada", "Giro", "Link"];
const TURNOS = ["Manhã", "Tarde", "Noite"];
const PROGRAMAS_VT = ["Jornal da Manhã", "Edição Meio-Dia", "Jornal da Noite"];
function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function PautasPage() {
  const [tab, setTab] = useState("quadro");
  const [pautaToEdit, setPautaToEdit] = useState(null);
  const [pautaDate, setPautaDate] = useState(/* @__PURE__ */ new Date());
  const tabs = [{
    k: "quadro",
    label: "Quadro Semanal",
    icon: LayoutGrid
  }, {
    k: "form",
    label: "Pauta",
    icon: FileText
  }, {
    k: "search",
    label: "Pesquisar",
    icon: Search
  }, {
    k: "avisos",
    label: "Avisos",
    icon: Megaphone
  }, {
    k: "gaveta",
    label: "Gaveta",
    icon: Archive
  }, {
    k: "portais",
    label: "Portais",
    icon: Rss
  }];
  const handleEdit = (p) => {
    setPautaToEdit(p);
    if (p.data_pauta) setPautaDate(/* @__PURE__ */ new Date(p.data_pauta + "T00:00:00"));
    setTab("form");
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#09090b] text-white p-4 sm:p-6 space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 font-mono uppercase tracking-widest mb-2", children: "Gestão de Conteúdo" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-9 w-9 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/40", children: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5 text-[#22c55e]" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-black tracking-tight font-mono uppercase text-white", children: "PAUTAS" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 border-b border-[#22c55e]/20 pb-5 items-center justify-between", children: [
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3", children: tabs.map(({
        k,
        label,
        icon: Icon
      }) => /* @__PURE__ */ jsxs("button", { onClick: () => setTab(k), className: `flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-body-sm font-sans uppercase tracking-wider font-bold transition-all ${tab === k ? "bg-[#22c55e]/20 border border-[#22c55e] text-[#22c55e]" : "bg-transparent border border-[#22c55e]/30 text-slate-400 hover:border-[#22c55e]/50 hover:text-slate-300"}`, children: [
        /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }),
        label
      ] }, k)) }),
      /* @__PURE__ */ jsxs("button", { onClick: () => {
        setPautaToEdit(null);
        setPautaDate(/* @__PURE__ */ new Date());
        setTab("form");
      }, className: "flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-[#22c55e]/10 border border-[#22c55e] text-[#22c55e] text-xs font-black uppercase tracking-wider transition-all hover:bg-[#22c55e]/20 hover:shadow-lg hover:shadow-[#22c55e]/20 active:scale-95 font-mono", children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-5 w-5" }),
        " Nova Pauta"
      ] })
    ] }),
    tab === "quadro" && /* @__PURE__ */ jsx(QuadroTab, { pautaDate, setPautaDate, onEdit: handleEdit }),
    tab === "form" && /* @__PURE__ */ jsx(FormTab, { pautaToEdit, pautaDate, onSaved: () => {
      setPautaToEdit(null);
      setTab("quadro");
    } }),
    tab === "search" && /* @__PURE__ */ jsx(SearchTab, { onEdit: handleEdit }),
    tab === "avisos" && /* @__PURE__ */ jsx(AvisosTab, {}),
    tab === "gaveta" && /* @__PURE__ */ jsx(GavetaTab, {}),
    tab === "portais" && /* @__PURE__ */ jsx(PortaisTab, {})
  ] });
}
const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
function inicioDaSemana(d) {
  const dt = new Date(d);
  const dow = dt.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  dt.setDate(dt.getDate() + diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
}
function QuadroTab({
  pautaDate,
  setPautaDate,
  onEdit
}) {
  const [semanaInicio, setSemanaInicio] = useState(() => inicioDaSemana(pautaDate));
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novoCard, setNovoCard] = useState(null);
  const [retranca, setRetranca] = useState("");
  const [reporter, setReporter] = useState("");
  const [horario, setHorario] = useState("");
  const [saving, setSaving] = useState(false);
  const semanaStr = ymd(semanaInicio);
  const load = useCallback(async () => {
    setLoading(true);
    const {
      data,
      error
    } = await db.from("quadro_cards").select("*").eq("semana_inicio", semanaStr).order("ordem", {
      ascending: true
    });
    if (error) toast.error(error.message);
    else setCards(data ?? []);
    setLoading(false);
  }, [semanaStr]);
  useEffect(() => {
    load();
  }, [load]);
  const mudarSemana = (delta) => {
    const nova = new Date(semanaInicio);
    nova.setDate(nova.getDate() + delta * 7);
    setSemanaInicio(nova);
  };
  const abrirNovoCard = (dia, turno) => {
    setNovoCard({
      dia,
      turno
    });
    setRetranca("");
    setReporter("");
    setHorario("");
  };
  const salvarCard = async (e) => {
    e.preventDefault();
    if (!novoCard || !sanitize(retranca)) return toast.error("Informe a retranca.");
    setSaving(true);
    const ordemAtual = cards.filter((c) => c.dia_semana === novoCard.dia && c.turno === novoCard.turno).length;
    const {
      error
    } = await db.from("quadro_cards").insert({
      semana_inicio: semanaStr,
      dia_semana: novoCard.dia,
      turno: novoCard.turno,
      retranca: sanitize(retranca),
      reporter: reporter ? sanitize(reporter) : null,
      horario: horario || null,
      ordem: ordemAtual,
      // TODO: quando o login voltar, trocar null por supabase.auth.getUser() -> user.id
      autor_id: null
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Card adicionado!");
      setNovoCard(null);
      load();
    }
  };
  const handleDelete = async (id) => {
    if (!confirm("Remover este card do quadro?")) return;
    const {
      error
    } = await db.from("quadro_cards").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Card removido.");
      load();
    }
  };
  const cardsDe = (dia, turno) => cards.filter((c) => c.dia_semana === dia && c.turno === turno);
  const fimSemana = new Date(semanaInicio);
  fimSemana.setDate(fimSemana.getDate() + 6);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-4 backdrop-blur-lg shadow-2xl", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => mudarSemana(-1), className: "p-2 rounded-md text-slate-400 hover:bg-[#1a1a21] hover:text-[#22c55e] transition-all", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs sm:text-sm font-mono uppercase tracking-widest text-slate-300 font-bold", children: [
        semanaInicio.toLocaleDateString("pt-BR"),
        " — ",
        fimSemana.toLocaleDateString("pt-BR")
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: () => mudarSemana(1), className: "p-2 rounded-md text-slate-400 hover:bg-[#1a1a21] hover:text-[#22c55e] transition-all", children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5" }) })
    ] }),
    loading ? /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-slate-500 italic font-mono text-xs", children: "CARREGANDO..." }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 lg:grid-cols-7 gap-3", children: DIAS_SEMANA.map((nomeDia, dia) => /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-3 backdrop-blur-lg shadow-xl space-y-3", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs font-mono uppercase tracking-widest text-slate-300 font-bold text-center pb-2 border-b border-[#22c55e]/10", children: nomeDia }),
      ["manha", "tarde"].map((turno) => /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase tracking-widest text-slate-600", children: turno === "manha" ? "Manhã" : "Tarde" }),
          /* @__PURE__ */ jsx("button", { onClick: () => abrirNovoCard(dia, turno), className: "p-1 rounded text-slate-500 hover:bg-[#1a1a21] hover:text-[#22c55e] transition-all", title: "Adicionar", children: /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }) })
        ] }),
        cardsDe(dia, turno).map((c) => /* @__PURE__ */ jsxs("div", { className: "group bg-[#141416] border border-[#22c55e]/20 rounded-md p-2 hover:border-[#22c55e]/50 transition-all", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-100 font-mono font-bold leading-snug", children: c.retranca }),
            /* @__PURE__ */ jsx("button", { onClick: () => handleDelete(c.id), className: "opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all shrink-0", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }) })
          ] }),
          (c.reporter || c.horario) && /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-slate-500 font-mono mt-1", children: [
            c.horario && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-0.5", children: [
              /* @__PURE__ */ jsx(Clock, { className: "h-2.5 w-2.5" }),
              c.horario
            ] }),
            c.horario && c.reporter && /* @__PURE__ */ jsx("span", { children: " · " }),
            c.reporter
          ] })
        ] }, c.id)),
        novoCard?.dia === dia && novoCard?.turno === turno && /* @__PURE__ */ jsxs("form", { onSubmit: salvarCard, className: "bg-[#141416] border border-[#22c55e]/40 rounded-md p-2 space-y-2", children: [
          /* @__PURE__ */ jsx("input", { autoFocus: true, value: retranca, onChange: (e) => setRetranca(e.target.value), placeholder: "RETRANCA", className: "w-full px-2 py-1.5 rounded bg-[#09090b] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 text-[10px] focus:outline-none focus:border-[#22c55e] font-mono" }),
          /* @__PURE__ */ jsx("input", { value: reporter, onChange: (e) => setReporter(e.target.value), placeholder: "REPÓRTER", className: "w-full px-2 py-1.5 rounded bg-[#09090b] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 text-[10px] focus:outline-none focus:border-[#22c55e] font-mono" }),
          /* @__PURE__ */ jsx("input", { type: "time", value: horario, onChange: (e) => setHorario(e.target.value), className: "w-full px-2 py-1.5 rounded bg-[#09090b] border border-[#22c55e]/30 text-slate-100 text-[10px] focus:outline-none focus:border-[#22c55e] font-mono" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5", children: [
            /* @__PURE__ */ jsx("button", { type: "submit", disabled: saving, className: "flex-1 px-2 py-1 rounded bg-[#22c55e]/10 border border-[#22c55e] text-[#22c55e] text-[10px] font-mono uppercase font-bold hover:bg-[#22c55e]/20 transition-all disabled:opacity-50", children: saving ? "..." : "OK" }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setNovoCard(null), className: "px-2 py-1 rounded border border-[#22c55e]/20 text-slate-500 text-[10px] font-mono uppercase hover:text-slate-300 transition-all", children: "X" })
          ] })
        ] })
      ] }, turno))
    ] }, dia)) })
  ] });
}
function FormTab({
  pautaToEdit,
  pautaDate,
  onSaved
}) {
  const isEdit = !!pautaToEdit;
  const [titulo, setTitulo] = useState(pautaToEdit?.titulo ?? "");
  const [retranca, setRetranca] = useState(pautaToEdit?.retranca ?? "");
  const [tipo, setTipo] = useState(pautaToEdit?.tipo ?? "");
  const [turno, setTurno] = useState(pautaToEdit?.turno ?? "");
  const [dataPauta, setDataPauta] = useState(pautaToEdit?.data_pauta ?? ymd(pautaDate));
  const [reporter, setReporter] = useState(pautaToEdit?.reporter ?? "");
  const [produtor, setProdutor] = useState(pautaToEdit?.produtor ?? "");
  const [horario, setHorario] = useState(pautaToEdit?.horario ?? "");
  const [local, setLocal] = useState(pautaToEdit?.local ?? "");
  const [sonora, setSonora] = useState(pautaToEdit?.sonora ?? "");
  const [contato, setContato] = useState(pautaToEdit?.contato ?? "");
  const [proposta, setProposta] = useState(pautaToEdit?.proposta ?? "");
  const [encaminhamento, setEncaminhamento] = useState(pautaToEdit?.encaminhamento ?? "");
  const [observacoes, setObservacoes] = useState(pautaToEdit?.observacoes ?? "");
  const [status, setStatus] = useState(pautaToEdit?.status ?? "sugestao");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setTitulo(pautaToEdit?.titulo ?? "");
    setRetranca(pautaToEdit?.retranca ?? "");
    setTipo(pautaToEdit?.tipo ?? "");
    setTurno(pautaToEdit?.turno ?? "");
    setDataPauta(pautaToEdit?.data_pauta ?? ymd(pautaDate));
    setReporter(pautaToEdit?.reporter ?? "");
    setProdutor(pautaToEdit?.produtor ?? "");
    setHorario(pautaToEdit?.horario ?? "");
    setLocal(pautaToEdit?.local ?? "");
    setSonora(pautaToEdit?.sonora ?? "");
    setContato(pautaToEdit?.contato ?? "");
    setProposta(pautaToEdit?.proposta ?? "");
    setEncaminhamento(pautaToEdit?.encaminhamento ?? "");
    setObservacoes(pautaToEdit?.observacoes ?? "");
    setStatus(pautaToEdit?.status ?? "sugestao");
  }, [pautaToEdit, pautaDate]);
  const resetForm = () => {
    setTitulo("");
    setRetranca("");
    setTipo("");
    setTurno("");
    setDataPauta(ymd(pautaDate));
    setReporter("");
    setProdutor("");
    setHorario("");
    setLocal("");
    setSonora("");
    setContato("");
    setProposta("");
    setEncaminhamento("");
    setObservacoes("");
    setStatus("sugestao");
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!sanitize(titulo)) return toast.error("Preencha o título da pauta.");
    setSaving(true);
    const payload = {
      titulo: sanitize(titulo),
      retranca: retranca ? sanitize(retranca) : null,
      tipo: tipo || null,
      turno: turno || null,
      data_pauta: dataPauta || null,
      reporter: reporter ? sanitize(reporter) : null,
      produtor: produtor ? sanitize(produtor) : null,
      horario: horario || null,
      local: local ? sanitize(local) : null,
      sonora: sonora ? sanitize(sonora) : null,
      contato: contato ? sanitize(contato) : null,
      proposta: proposta || null,
      encaminhamento: encaminhamento || null,
      observacoes: observacoes || null,
      status,
      // TODO: quando o login voltar, trocar null por supabase.auth.getUser() -> user.id
      criado_por: pautaToEdit?.criado_por ?? null
    };
    const query = isEdit ? db.from("pautas").update(payload).eq("id", pautaToEdit.id) : db.from("pautas").insert(payload);
    const {
      error
    } = await query;
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(isEdit ? "Pauta atualizada!" : "Pauta criada!");
    if (isEdit) onSaved();
    else resetForm();
  };
  const inputCls = "w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all font-mono";
  const labelCls = "text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2";
  return /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 backdrop-blur-lg shadow-2xl", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest mb-2", children: isEdit ? "EDITANDO PAUTA" : "NOVA PAUTA" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-300 font-mono", children: isEdit ? "Atualize os dados da pauta existente" : "Preencha as informações da nova pauta" })
      ] }),
      isEdit && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => onSaved(), className: "px-4 py-2 rounded-md text-xs font-mono uppercase text-slate-400 border border-slate-400/20 hover:border-slate-400/40 hover:text-slate-300 transition-all", children: "Cancelar" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 backdrop-blur-lg shadow-2xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4 pb-4 border-b border-[#22c55e]/10", children: [
        /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4 text-[#22c55e]" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest", children: "Informações Básicas" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: labelCls, children: "Título *" }),
          /* @__PURE__ */ jsx("input", { required: true, value: titulo, onChange: (e) => setTitulo(e.target.value), placeholder: "Ex: Reportagem sobre obras na BR-101", className: inputCls })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Retranca" }),
            /* @__PURE__ */ jsx("input", { value: retranca, onChange: (e) => setRetranca(e.target.value), placeholder: "Ex: OBRAS-BR101", className: inputCls })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Tipo" }),
            /* @__PURE__ */ jsxs("select", { value: tipo, onChange: (e) => setTipo(e.target.value), className: inputCls + " appearance-none cursor-pointer", children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Selecione" }),
              TIPOS.map((t) => /* @__PURE__ */ jsx("option", { value: t, children: t }, t))
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Turno" }),
            /* @__PURE__ */ jsxs("select", { value: turno, onChange: (e) => setTurno(e.target.value), className: inputCls + " appearance-none cursor-pointer", children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Selecione" }),
              TURNOS.map((t) => /* @__PURE__ */ jsx("option", { value: t, children: t }, t))
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 backdrop-blur-lg shadow-2xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4 pb-4 border-b border-[#22c55e]/10", children: [
        /* @__PURE__ */ jsx(CalendarIcon, { className: "h-4 w-4 text-[#22c55e]" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest", children: "Data e Horário" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: labelCls, children: "Data" }),
          /* @__PURE__ */ jsx("input", { type: "date", value: dataPauta, onChange: (e) => setDataPauta(e.target.value), className: inputCls })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: labelCls, children: "Horário" }),
          /* @__PURE__ */ jsx("input", { type: "time", value: horario, onChange: (e) => setHorario(e.target.value), className: inputCls })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: labelCls, children: "Status" }),
          /* @__PURE__ */ jsxs("select", { value: status, onChange: (e) => setStatus(e.target.value), className: inputCls + " appearance-none cursor-pointer", children: [
            /* @__PURE__ */ jsx("option", { value: "sugestao", children: "Sugestão" }),
            /* @__PURE__ */ jsx("option", { value: "aprovada", children: "Aprovada" }),
            /* @__PURE__ */ jsx("option", { value: "em_producao", children: "Em Produção" }),
            /* @__PURE__ */ jsx("option", { value: "finalizada", children: "Finalizada" }),
            /* @__PURE__ */ jsx("option", { value: "cancelada", children: "Cancelada" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 backdrop-blur-lg shadow-2xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4 pb-4 border-b border-[#22c55e]/10", children: [
        /* @__PURE__ */ jsx(Megaphone, { className: "h-4 w-4 text-[#22c55e]" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest", children: "Equipe" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: labelCls, children: "Repórter" }),
          /* @__PURE__ */ jsx("input", { value: reporter, onChange: (e) => setReporter(e.target.value), placeholder: "Nome do repórter", className: inputCls })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: labelCls, children: "Produtor" }),
          /* @__PURE__ */ jsx("input", { value: produtor, onChange: (e) => setProdutor(e.target.value), placeholder: "Nome do produtor", className: inputCls })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 backdrop-blur-lg shadow-2xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4 pb-4 border-b border-[#22c55e]/10", children: [
        /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-[#22c55e]" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest", children: "Localização e Contatos" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: labelCls, children: "Local" }),
          /* @__PURE__ */ jsx("input", { value: local, onChange: (e) => setLocal(e.target.value), placeholder: "Ex: Av. Getúlio Vargas, 1000", className: inputCls })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: labelCls, children: "Contato" }),
          /* @__PURE__ */ jsx("input", { value: contato, onChange: (e) => setContato(e.target.value), placeholder: "Nome / telefone", className: inputCls })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsx("label", { className: labelCls, children: "Sonora" }),
        /* @__PURE__ */ jsx("input", { value: sonora, onChange: (e) => setSonora(e.target.value), placeholder: "Quem vai dar sonora", className: inputCls })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 backdrop-blur-lg shadow-2xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4 pb-4 border-b border-[#22c55e]/10", children: [
        /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4 text-[#22c55e]" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest", children: "Conteúdo" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: labelCls, children: "Proposta" }),
          /* @__PURE__ */ jsx("textarea", { value: proposta, onChange: (e) => setProposta(e.target.value), placeholder: "Descreva a proposta da pauta", rows: 3, className: inputCls + " resize-none leading-relaxed" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: labelCls, children: "Encaminhamento" }),
          /* @__PURE__ */ jsx("textarea", { value: encaminhamento, onChange: (e) => setEncaminhamento(e.target.value), placeholder: "Como a pauta será desenvolvida", rows: 3, className: inputCls + " resize-none leading-relaxed" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: labelCls, children: "Observações" }),
          /* @__PURE__ */ jsx("textarea", { value: observacoes, onChange: (e) => setObservacoes(e.target.value), placeholder: "Observações adicionais", rows: 2, className: inputCls + " resize-none leading-relaxed" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end gap-3 sticky bottom-0 bg-[#09090b] border-t border-[#22c55e]/20 -mx-6 px-6 py-4", children: /* @__PURE__ */ jsx(Button, { type: "submit", disabled: saving, className: "px-8 py-2.5 rounded-md text-xs font-mono uppercase font-black bg-[#22c55e]/10 border border-[#22c55e] text-[#22c55e] transition-all hover:bg-[#22c55e]/20 hover:shadow-lg hover:shadow-[#22c55e]/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed", children: /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: saving ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
      "SALVANDO..."
    ] }) : isEdit ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }),
      "ATUALIZAR"
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
      "SALVAR"
    ] }) }) }) })
  ] });
}
function SearchTab({
  onEdit
}) {
  const [pautas, setPautas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [termo, setTermo] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const load = useCallback(async () => {
    setLoading(true);
    let query = db.from("pautas").select("*").order("data_pauta", {
      ascending: false
    });
    if (statusFiltro !== "Todos") query = query.eq("status", statusFiltro);
    const {
      data,
      error
    } = await query;
    if (error) toast.error(error.message);
    else setPautas(data ?? []);
    setLoading(false);
  }, [statusFiltro]);
  useEffect(() => {
    load();
  }, [load]);
  const handleDelete = async (id) => {
    if (!confirm("Excluir esta pauta?")) return;
    const {
      error
    } = await db.from("pautas").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Pauta excluída.");
      load();
    }
  };
  const filtradas = useMemo(() => {
    const t = sanitize(termo).toLowerCase();
    if (!t) return pautas;
    return pautas.filter((p) => p.titulo?.toLowerCase().includes(t) || p.retranca?.toLowerCase().includes(t) || p.reporter?.toLowerCase().includes(t));
  }, [pautas, termo]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 backdrop-blur-lg shadow-2xl", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-2 relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-slate-600" }),
        /* @__PURE__ */ jsx("input", { value: termo, onChange: (e) => setTermo(e.target.value), placeholder: "BUSCAR POR TÍTULO, RETRANCA OU REPÓRTER...", className: "w-full pl-9 pr-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all font-mono" })
      ] }),
      /* @__PURE__ */ jsxs("select", { value: statusFiltro, onChange: (e) => setStatusFiltro(e.target.value), className: "w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all appearance-none cursor-pointer font-mono", children: [
        /* @__PURE__ */ jsx("option", { value: "Todos", children: "Todos os status" }),
        /* @__PURE__ */ jsx("option", { value: "sugestao", children: "Sugestão" }),
        /* @__PURE__ */ jsx("option", { value: "aprovada", children: "Aprovada" }),
        /* @__PURE__ */ jsx("option", { value: "em_producao", children: "Em Produção" }),
        /* @__PURE__ */ jsx("option", { value: "finalizada", children: "Finalizada" }),
        /* @__PURE__ */ jsx("option", { value: "cancelada", children: "Cancelada" })
      ] })
    ] }) }),
    loading ? /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-slate-500 italic font-mono text-xs", children: "CARREGANDO..." }) : filtradas.length === 0 ? /* @__PURE__ */ jsx("div", { className: "bg-[#0f0f12] border border-dashed border-[#22c55e]/30 rounded-lg p-12 text-center text-slate-500 text-xs font-mono", children: "NENHUMA PAUTA ENCONTRADA" }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-3", children: filtradas.map((p) => /* @__PURE__ */ jsx("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-4 hover:bg-[#1a1a21] hover:border-[#22c55e]/40 transition-all group backdrop-blur-lg shadow-xl", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap mb-2", children: [
          p.status && /* @__PURE__ */ jsx("span", { className: "bg-[#22c55e]/20 text-[#22c55e] text-xs px-3 py-1 rounded-md border border-[#22c55e]/40 font-mono font-bold uppercase tracking-wider", children: p.status.replace("_", " ") }),
          p.tipo && /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500 font-mono uppercase", children: p.tipo }),
          p.data_pauta && /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-500 flex items-center gap-1 font-mono", children: [
            /* @__PURE__ */ jsx(CalendarIcon, { className: "h-3 w-3" }),
            (/* @__PURE__ */ new Date(p.data_pauta + "T00:00:00")).toLocaleDateString("pt-BR")
          ] })
        ] }),
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-slate-100 font-mono uppercase truncate", children: p.titulo }),
        (p.retranca || p.reporter) && /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500 font-mono mt-1", children: [
          p.retranca && /* @__PURE__ */ jsx("span", { children: p.retranca }),
          p.retranca && p.reporter && /* @__PURE__ */ jsx("span", { children: " · " }),
          p.reporter && /* @__PURE__ */ jsx("span", { children: p.reporter })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => onEdit(p), className: "p-2 rounded-md text-slate-500 hover:bg-[#1a1a21] hover:text-[#22c55e] transition-all", title: "Editar", children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx("button", { onClick: () => handleDelete(p.id), className: "p-2 rounded-md text-slate-500 hover:bg-[#1a1a21] hover:text-red-400 transition-all", title: "Excluir", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
      ] })
    ] }) }, p.id)) })
  ] });
}
function AvisosTab() {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assunto, setAssunto] = useState("");
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    const {
      data,
      error
    } = await db.from("avisos").select("*").order("data", {
      ascending: false
    });
    if (error) toast.error(error.message);
    else setAvisos(data ?? []);
    setLoading(false);
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const submit = async (e) => {
    e.preventDefault();
    if (!sanitize(assunto)) return toast.error("Escreva o aviso.");
    setSaving(true);
    const {
      error
    } = await db.from("avisos").insert({
      assunto: sanitize(assunto),
      data: ymd(/* @__PURE__ */ new Date()),
      // TODO: quando o login voltar, trocar null por supabase.auth.getUser() -> user.id
      autor_id: null
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Aviso publicado!");
      setAssunto("");
      load();
    }
  };
  const handleDelete = async (id) => {
    if (!confirm("Excluir este aviso?")) return;
    const {
      error
    } = await db.from("avisos").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Aviso excluído.");
      load();
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 backdrop-blur-lg shadow-2xl", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest mb-4", children: "Novo aviso" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
        /* @__PURE__ */ jsx("input", { value: assunto, onChange: (e) => setAssunto(e.target.value), placeholder: "ESCREVA O AVISO PARA A REDAÇÃO...", className: "flex-1 px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all font-mono" }),
        /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: saving, className: "inline-flex items-center justify-center gap-2 px-6 py-2 rounded-md bg-[#22c55e]/10 border border-[#22c55e] text-white text-xs font-black uppercase tracking-wider transition-all hover:bg-[#22c55e]/20 hover:shadow-lg hover:shadow-[#22c55e]/20 active:scale-95 font-mono disabled:opacity-50", children: [
          /* @__PURE__ */ jsx(Megaphone, { className: "h-4 w-4" }),
          " ",
          saving ? "PUBLICANDO..." : "PUBLICAR"
        ] })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-slate-500 italic font-mono text-xs", children: "CARREGANDO..." }) : avisos.length === 0 ? /* @__PURE__ */ jsx("div", { className: "bg-[#0f0f12] border border-dashed border-[#22c55e]/30 rounded-lg p-12 text-center text-slate-500 text-xs font-mono", children: "SEM AVISOS" }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-3", children: avisos.map((a) => /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-4 hover:bg-[#1a1a21] hover:border-[#22c55e]/40 transition-all group backdrop-blur-lg shadow-xl flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500 flex items-center gap-1 font-mono mb-1", children: [
          /* @__PURE__ */ jsx(CalendarIcon, { className: "h-3 w-3" }),
          (/* @__PURE__ */ new Date(a.data + "T00:00:00")).toLocaleDateString("pt-BR")
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-100 font-mono", children: a.assunto })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: () => handleDelete(a.id), className: "p-2 rounded-md text-slate-500 hover:bg-[#1a1a21] hover:text-red-400 transition-all shrink-0", title: "Excluir", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
    ] }, a.id)) })
  ] });
}
function GavetaTab() {
  const [vts, setVts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [programaFiltro, setProgramaFiltro] = useState("Todos");
  const [programa, setPrograma] = useState(PROGRAMAS_VT[0]);
  const [retranca, setRetranca] = useState("");
  const [dataPronto, setDataPronto] = useState(ymd(/* @__PURE__ */ new Date()));
  const [observacao, setObservacao] = useState("");
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    let query = db.from("vt_gaveta").select("*").order("data_pronto", {
      ascending: false
    });
    if (programaFiltro !== "Todos") query = query.eq("programa", programaFiltro);
    const {
      data,
      error
    } = await query;
    if (error) toast.error(error.message);
    else setVts(data ?? []);
    setLoading(false);
  }, [programaFiltro]);
  useEffect(() => {
    load();
  }, [load]);
  const submit = async (e) => {
    e.preventDefault();
    if (!sanitize(retranca)) return toast.error("Informe a retranca do VT.");
    setSaving(true);
    const {
      error
    } = await db.from("vt_gaveta").insert({
      programa,
      retranca: sanitize(retranca),
      data_pronto: dataPronto,
      observacao: observacao ? sanitize(observacao) : null,
      // TODO: quando o login voltar, trocar null por supabase.auth.getUser() -> user.id
      autor_id: null
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("VT adicionado à gaveta!");
      setRetranca("");
      setObservacao("");
      setDataPronto(ymd(/* @__PURE__ */ new Date()));
      load();
    }
  };
  const handleDelete = async (id) => {
    if (!confirm("Remover este VT da gaveta?")) return;
    const {
      error
    } = await db.from("vt_gaveta").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("VT removido.");
      load();
    }
  };
  const inputCls = "w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all font-mono";
  const labelCls = "text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2";
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 backdrop-blur-lg shadow-2xl", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest mb-4", children: "Novo VT na gaveta" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: labelCls, children: "Programa" }),
          /* @__PURE__ */ jsx("select", { value: programa, onChange: (e) => setPrograma(e.target.value), className: inputCls + " appearance-none cursor-pointer", children: PROGRAMAS_VT.map((p) => /* @__PURE__ */ jsx("option", { value: p, children: p }, p)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: labelCls, children: "Retranca" }),
          /* @__PURE__ */ jsx("input", { value: retranca, onChange: (e) => setRetranca(e.target.value), placeholder: "Ex: ACIDENTE BR-101", className: inputCls })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: labelCls, children: "Pronto em" }),
          /* @__PURE__ */ jsx("input", { type: "date", value: dataPronto, onChange: (e) => setDataPronto(e.target.value), className: inputCls })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: labelCls, children: "Observação" }),
          /* @__PURE__ */ jsx("input", { value: observacao, onChange: (e) => setObservacao(e.target.value), className: inputCls })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: saving, className: "inline-flex items-center gap-2 px-6 py-2 rounded-md bg-[#22c55e]/10 border border-[#22c55e] text-white text-xs font-black uppercase tracking-wider transition-all hover:bg-[#22c55e]/20 hover:shadow-lg hover:shadow-[#22c55e]/20 active:scale-95 font-mono disabled:opacity-50", children: [
        /* @__PURE__ */ jsx(Archive, { className: "h-4 w-4" }),
        " ",
        saving ? "SALVANDO..." : "ADICIONAR"
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs("select", { value: programaFiltro, onChange: (e) => setProgramaFiltro(e.target.value), className: "px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 text-xs focus:outline-none focus:border-[#22c55e] transition-all appearance-none cursor-pointer font-mono", children: [
      /* @__PURE__ */ jsx("option", { value: "Todos", children: "Todos os programas" }),
      PROGRAMAS_VT.map((p) => /* @__PURE__ */ jsx("option", { value: p, children: p }, p))
    ] }) }),
    loading ? /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-slate-500 italic font-mono text-xs", children: "CARREGANDO..." }) : vts.length === 0 ? /* @__PURE__ */ jsx("div", { className: "bg-[#0f0f12] border border-dashed border-[#22c55e]/30 rounded-lg p-12 text-center text-slate-500 text-xs font-mono", children: "GAVETA VAZIA" }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-3", children: vts.map((v) => /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-4 hover:bg-[#1a1a21] hover:border-[#22c55e]/40 transition-all group backdrop-blur-lg shadow-xl flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "bg-[#22c55e]/20 text-[#22c55e] text-xs px-3 py-1 rounded-md border border-[#22c55e]/40 font-mono font-bold uppercase tracking-wider", children: v.programa }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-500 flex items-center gap-1 font-mono", children: [
            /* @__PURE__ */ jsx(CalendarIcon, { className: "h-3 w-3" }),
            (/* @__PURE__ */ new Date(v.data_pronto + "T00:00:00")).toLocaleDateString("pt-BR")
          ] })
        ] }),
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-slate-100 font-mono uppercase", children: v.retranca }),
        v.observacao && /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 mt-1", children: v.observacao })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: () => handleDelete(v.id), className: "p-2 rounded-md text-slate-500 hover:bg-[#1a1a21] hover:text-red-400 transition-all shrink-0", title: "Remover", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
    ] }, v.id)) })
  ] });
}
function PortaisTab() {
  return /* @__PURE__ */ jsx("div", { className: "p-4 text-slate-400 text-sm font-mono", children: "Portais em desenvolvimento..." });
}
const SplitComponent = () => /* @__PURE__ */ jsx(PautasPage, {});
export {
  SplitComponent as component
};
