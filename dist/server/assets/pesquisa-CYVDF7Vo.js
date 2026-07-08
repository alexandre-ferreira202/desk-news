import { jsx, jsxs } from "react/jsx-runtime";
import { P as Protected } from "./Protected-qIYr_dhg.js";
import * as React from "react";
import { useState, useEffect } from "react";
import { d as db } from "./router-NcdNWgek.js";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, Search, Loader2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { b as buttonVariants, B as Button } from "./button-DWfIo_Ug.js";
import { getDefaultClassNames, DayPicker } from "react-day-picker";
import { c as cn } from "./utils-H80jjgLf.js";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import "@tanstack/react-router";
import "@tanstack/react-query";
import "@neondatabase/serverless";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();
  return /* @__PURE__ */ jsx(
    DayPicker,
    {
      showOutsideDays,
      className: cn(
        "bg-background group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      ),
      captionLayout,
      formatters: {
        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
        ...formatters
      },
      classNames: {
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn("bg-popover absolute inset-0 opacity-0", defaultClassNames.dropdown),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label" ? "text-sm" : "[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn("w-(--cell-size) select-none", defaultClassNames.week_number_header),
        week_number: cn(
          "text-muted-foreground select-none text-[0.8rem]",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          defaultClassNames.day
        ),
        range_start: cn("bg-accent rounded-l-md", defaultClassNames.range_start),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("bg-accent rounded-r-md", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames
      },
      components: {
        Root: ({ className: className2, rootRef, ...props2 }) => {
          return /* @__PURE__ */ jsx("div", { "data-slot": "calendar", ref: rootRef, className: cn(className2), ...props2 });
        },
        Chevron: ({ className: className2, orientation, ...props2 }) => {
          if (orientation === "left") {
            return /* @__PURE__ */ jsx(ChevronLeftIcon, { className: cn("size-4", className2), ...props2 });
          }
          if (orientation === "right") {
            return /* @__PURE__ */ jsx(ChevronRightIcon, { className: cn("size-4", className2), ...props2 });
          }
          return /* @__PURE__ */ jsx(ChevronDownIcon, { className: cn("size-4", className2), ...props2 });
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props2 }) => {
          return /* @__PURE__ */ jsx("td", { ...props2, children: /* @__PURE__ */ jsx("div", { className: "flex size-(--cell-size) items-center justify-center text-center", children }) });
        },
        ...components
      },
      ...props
    }
  );
}
function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);
  return /* @__PURE__ */ jsx(
    Button,
    {
      ref,
      variant: "ghost",
      size: "icon",
      "data-day": day.date.toLocaleDateString(),
      "data-selected-single": modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle,
      "data-range-start": modifiers.range_start,
      "data-range-end": modifiers.range_end,
      "data-range-middle": modifiers.range_middle,
      className: cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-(--cell-size) flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      ),
      ...props
    }
  );
}
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  PopoverPrimitive.Content,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function PesquisaGeralPage() {
  const [q, setQ] = useState("");
  const [from, setFrom] = useState();
  const [to, setTo] = useState();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const search = async () => {
    setLoading(true);
    let query = db.from("pautas").select("*").order("data_pauta", {
      ascending: false,
      nullsFirst: false
    }).limit(200);
    if (q.trim()) {
      const term = `%${q.trim()}%`;
      query = query.or(`retranca.ilike.${term},titulo.ilike.${term},reporter.ilike.${term},produtor.ilike.${term},proposta.ilike.${term},encaminhamento.ilike.${term}`);
    }
    if (from) query = query.gte("data_pauta", ymd(from));
    if (to) query = query.lte("data_pauta", ymd(to));
    const {
      data,
      error
    } = await query;
    setLoading(false);
    if (error) toast.error(error.message);
    else setResults(data ?? []);
  };
  useEffect(() => {
    search();
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen p-4 sm:p-6 bg-[#09090b] text-slate-100 font-sans", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border-b border-[#22c55e]/20 pb-4 mb-8", children: [
      /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-[#22c55e]" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black tracking-tight font-mono uppercase", children: "PESQUISA GERAL" }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500 hidden sm:inline font-mono uppercase ml-auto", children: "Acervo Histórico" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 mb-8 backdrop-blur-lg shadow-2xl", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest mb-4", children: "Filtros" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-[1fr_140px_140px_auto] gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#22c55e]" }),
          /* @__PURE__ */ jsx("input", { type: "text", className: "w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all duration-200 pl-10 font-mono text-sm", placeholder: "Retranca, produtor...", value: q, onChange: (e) => setQ(e.target.value), onKeyDown: (e) => e.key === "Enter" && search() })
        ] }),
        /* @__PURE__ */ jsx(DateField, { label: "De", value: from, onChange: setFrom }),
        /* @__PURE__ */ jsx(DateField, { label: "Até", value: to, onChange: setTo }),
        /* @__PURE__ */ jsx(Button, { onClick: search, disabled: loading, className: "px-6 py-3 rounded-md text-white bg-[#22c55e]/10 border border-[#22c55e] hover:bg-[#22c55e]/20 font-mono text-xs uppercase font-bold tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-[#22c55e]/20 active:scale-95", children: loading ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg overflow-hidden backdrop-blur-lg shadow-2xl", children: [
      results.length === 0 && !loading && /* @__PURE__ */ jsx("div", { className: "p-12 text-center text-xs text-slate-500 font-mono", children: "SEM RESULTADOS" }),
      /* @__PURE__ */ jsxs("div", { className: "divide-y divide-[#22c55e]/10 overflow-y-auto max-h-[calc(100vh-18rem)]", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 bg-[#0a0e27] text-xs text-slate-500 font-mono uppercase tracking-widest border-b border-[#22c55e]/10", children: [
          results.length,
          " REGISTRO(S)"
        ] }),
        results.map((p) => /* @__PURE__ */ jsxs("div", { className: "p-4 flex items-center justify-between gap-4 hover:bg-[#1a1a21] transition-all cursor-pointer border-l-2 border-l-transparent hover:border-l-[#22c55e]", onClick: () => setSelected(p), children: [
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsx("div", { className: "font-mono uppercase font-black text-sm text-[#22c55e]", children: p.retranca || "---" }),
              p.tipo && /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-1 rounded bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30 font-mono uppercase font-bold", children: p.tipo })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-slate-200 line-clamp-1", children: p.titulo }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-2 text-xs text-slate-500 font-mono", children: [
              /* @__PURE__ */ jsx("span", { children: p.produtor ?? "---" }),
              /* @__PURE__ */ jsx("span", { className: "text-[#22c55e]", children: "•" }),
              /* @__PURE__ */ jsx("span", { children: p.reporter ?? "---" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-xs font-mono text-slate-500 shrink-0", children: p.data_pauta ? (/* @__PURE__ */ new Date(p.data_pauta + "T00:00:00")).toLocaleDateString("pt-BR") : "---" })
        ] }, p.id))
      ] })
    ] }),
    selected && /* @__PURE__ */ jsx(PreviewModal, { pauta: selected, onClose: () => setSelected(null) })
  ] });
}
function DateField({
  label,
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxs(Popover, { children: [
    /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, className: "w-full", children: /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "justify-start font-normal h-11 px-3 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 hover:border-[#22c55e]/50 transition-all font-mono text-xs uppercase", children: [
      /* @__PURE__ */ jsx(CalendarIcon, { className: "h-4 w-4 mr-2 text-[#22c55e]" }),
      /* @__PURE__ */ jsxs("span", { className: "text-slate-500", children: [
        label,
        ":"
      ] }),
      /* @__PURE__ */ jsx("span", { className: "ml-2", children: value ? value.toLocaleDateString("pt-BR") : "---" })
    ] }) }),
    /* @__PURE__ */ jsx(PopoverContent, { className: "w-auto p-0 rounded-lg border border-[#22c55e]/30 bg-[#0f0f12] backdrop-blur-lg shadow-2xl", align: "start", children: /* @__PURE__ */ jsx(Calendar, { mode: "single", selected: value, onSelect: onChange, className: "p-3 bg-[#141416]" }) })
  ] });
}
function PreviewModal({
  pauta,
  onClose
}) {
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4 z-50", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { onClick: (e) => e.stopPropagation(), className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg w-full max-w-2xl overflow-hidden shadow-2xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "p-6 border-b border-[#22c55e]/10 bg-[#0a0e27] flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest mb-1", children: "Visualização" }),
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-black tracking-tight text-white font-mono uppercase", children: pauta.retranca || "---" })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "p-2 rounded-md text-slate-500 hover:bg-[#1a1a21] hover:text-slate-200 transition-all", children: /* @__PURE__ */ jsx("span", { className: "text-xl font-mono", children: "✕" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6 max-h-[70vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-md bg-[#141416] border border-[#22c55e]/20", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500 font-mono uppercase block mb-2", children: "Data" }),
          /* @__PURE__ */ jsx("div", { className: "text-sm font-mono text-slate-200", children: pauta.data_pauta ? (/* @__PURE__ */ new Date(pauta.data_pauta + "T00:00:00")).toLocaleDateString("pt-BR") : "---" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-md bg-[#141416] border border-[#22c55e]/20", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500 font-mono uppercase block mb-2", children: "Produtor" }),
          /* @__PURE__ */ jsx("div", { className: "text-sm font-mono text-slate-200", children: pauta.produtor || "---" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-md bg-[#141416] border border-[#22c55e]/20", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500 font-mono uppercase block mb-2", children: "Reporter" }),
          /* @__PURE__ */ jsx("div", { className: "text-sm font-mono text-slate-200", children: pauta.reporter || "---" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        pauta.proposta && /* @__PURE__ */ jsxs("div", { className: "bg-[#141416] border border-[#22c55e]/20 rounded-md p-4", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-[#22c55e] font-mono uppercase font-bold block mb-2", children: "Proposta" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed whitespace-pre-wrap text-slate-300 font-mono", children: pauta.proposta })
        ] }),
        pauta.encaminhamento && /* @__PURE__ */ jsxs("div", { className: "bg-[#141416] border border-[#22c55e]/20 rounded-md p-4", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500 font-mono uppercase font-bold block mb-2", children: "Encaminhamento" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs leading-relaxed whitespace-pre-wrap text-slate-400 font-mono", children: pauta.encaminhamento })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "p-6 bg-[#0a0e27] border-t border-[#22c55e]/10 flex justify-end", children: /* @__PURE__ */ jsx(Button, { onClick: onClose, className: "px-6 py-2 rounded-md bg-[#22c55e]/10 border border-[#22c55e] text-white font-mono uppercase text-xs font-bold tracking-wider transition-all hover:bg-[#22c55e]/20 hover:shadow-lg hover:shadow-[#22c55e]/20 active:scale-95", children: "FECHAR" }) })
  ] }) });
}
const SplitComponent = () => /* @__PURE__ */ jsx(Protected, { children: /* @__PURE__ */ jsx(PesquisaGeralPage, {}) });
export {
  SplitComponent as component
};
