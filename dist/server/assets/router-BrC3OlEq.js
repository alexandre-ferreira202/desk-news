import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useRouter, isRedirect, useRouterState, Link, createRootRouteWithContext, Outlet, HeadContent, Scripts, createFileRoute, ErrorComponent, Navigate, useNavigate, redirect, createRouter } from "@tanstack/react-router";
import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import * as React from "react";
import React__default, { useState, useEffect, createContext, useContext, useRef, useCallback, useMemo } from "react";
import { Toaster, toast } from "sonner";
import { Newspaper, X, LayoutGrid, FileText, MonitorPlay, ClipboardList, BarChart3, Sun, Moon, LogOut, Menu, Timer, Type, MoveVertical, FlipHorizontal, RotateCcw, Pause, Play, Maximize, HelpCircle, Minimize, Keyboard, Touchpad, Zap, Plus, Calendar as Calendar$1, Search, Undo2, Redo2, PenTool, FolderOpen, RefreshCw, Film, CheckCircle2, HardDrive, FileCheck, FileX, VolumeX, Volume2, PowerOff, Youtube, Grid2X2, SkipBack, Square, SkipForward, Image, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, Loader2, User, Tag, CalendarIcon, Clock, Megaphone, Archive, Rss, ChevronLeft, ChevronRight, Trash2, ExternalLink, Pencil, Printer, TrendingUp, Users, Tv, GripVertical, Radio, CheckCircle, Award, Globe, Sparkles, ShieldAlert } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getDefaultClassNames, DayPicker } from "react-day-picker";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from "./server-BqZ-7n4X.js";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell } from "recharts";
import { useSensors, useSensor, MouseSensor, TouchSensor, KeyboardSensor, DndContext, closestCorners } from "@dnd-kit/core";
import { sortableKeyboardCoordinates, SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
function useServerFn(serverFn) {
  const router = useRouter();
  return React.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router.stores.location.get();
        return router.navigate(router.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router, serverFn]);
}
const appCss = "/assets/styles-BdP8Lb9P.css";
const nav = [
  { to: "/pautas", label: "Pautas", icon: LayoutGrid },
  { to: "/redacao", label: "Reportagens", icon: FileText },
  { to: "/espelho", label: "Espelho", icon: MonitorPlay },
  { to: "/relatorios", label: "Relatorios", icon: ClipboardList },
  { to: "/metricas", label: "Metricas", icon: BarChart3 }
];
function AppShell({ children }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const displayName = "Usuário";
  const signOut = async () => {
  };
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const handleSignOut = async () => {
    await signOut();
  };
  const sidebar = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "px-5 py-5 border-b border-[var(--border-subtle)] flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20", children: /* @__PURE__ */ jsx(Newspaper, { className: "h-4 w-4 text-[var(--accent-primary)]" }) }),
          /* @__PURE__ */ jsx("span", { className: "font-mono uppercase tracking-widest text-body-sm text-[var(--text-primary)]", children: "DeskNews" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-2 text-label text-[var(--text-tertiary)]", children: [
          /* @__PURE__ */ jsx("span", { className: "live-dot" }),
          " Ao vivo"
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setOpen(false),
          className: "md:hidden p-1.5 rounded-xl text-[var(--text-tertiary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-all",
          "aria-label": "Fechar menu",
          children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("nav", { className: "flex-1 p-2 space-y-1 overflow-y-auto", children: nav.map((item) => {
      const active = path.startsWith(item.to);
      const Icon = item.icon;
      return /* @__PURE__ */ jsxs(
        Link,
        {
          to: item.to,
          onClick: () => setOpen(false),
          className: `flex items-center gap-3 rounded-xl px-3 py-2.5 text-body-sm transition-all duration-300 active:scale-[0.98] ${active ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 shadow-[var(--shadow-sm)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] border border-transparent"}`,
          children: [
            /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { children: item.label })
          ]
        },
        item.to
      );
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "p-3 border-t border-[var(--border-subtle)]", children: [
      /* @__PURE__ */ jsxs("div", { className: "px-2 pb-2 flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("div", { className: "text-body-sm font-medium truncate text-[var(--text-primary)]", children: displayName }),
          /* @__PURE__ */ jsx("div", { className: "text-label text-[var(--text-tertiary)] truncate", children: "SEM PAPEL" })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: toggleTheme,
            className: "p-1.5 rounded-xl text-[var(--text-tertiary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-all shrink-0",
            "aria-label": theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro",
            title: theme === "dark" ? "Modo claro" : "Modo escuro",
            children: theme === "dark" ? /* @__PURE__ */ jsx(Sun, { className: "h-4 w-4 text-[var(--status-warning)]" }) : /* @__PURE__ */ jsx(Moon, { className: "h-4 w-4 text-[var(--accent-primary)]" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleSignOut,
          className: "w-full flex items-center gap-2 rounded-xl px-3 py-2 text-body-sm text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-all active:scale-[0.98]",
          children: [
            /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
            " Sair"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t border-[var(--border-subtle)] px-2 flex flex-col gap-0.5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[9px] uppercase tracking-widest text-[var(--text-quaternary)] font-mono", children: "Desenvolvido por" }),
        /* @__PURE__ */ jsx("span", { className: "text-caption font-mono uppercase tracking-widest text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors", children: "Alexandre Ferreira" })
      ] })
    ] })
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex w-full bg-[var(--bg-primary)] text-[var(--text-primary)]", children: [
    /* @__PURE__ */ jsx("aside", { className: "hidden md:flex w-64 shrink-0 bg-[var(--glass-bg)] backdrop-blur-xl border-r border-[var(--glass-border)] flex-col shadow-[var(--shadow-lg)]", children: sidebar }),
    open && /* @__PURE__ */ jsxs("div", { className: "md:hidden fixed inset-0 z-50 flex", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[var(--bg-primary)]/70 backdrop-blur-sm", onClick: () => setOpen(false) }),
      /* @__PURE__ */ jsx("aside", { className: "relative w-64 max-w-[80vw] bg-[var(--glass-bg)] backdrop-blur-xl border-r border-[var(--glass-border)] flex flex-col animate-in slide-in-from-left", children: sidebar })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "flex-1 min-w-0 flex flex-col", children: [
      /* @__PURE__ */ jsxs("header", { className: "h-14 border-b border-[var(--border-subtle)] flex items-center px-3 sm:px-6 gap-3 sm:gap-4 bg-[var(--glass-bg)] backdrop-blur-xl", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setOpen(true),
            className: "md:hidden p-1.5 -ml-1 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]",
            "aria-label": "Abrir menu",
            children: /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "font-mono text-caption uppercase tracking-widest text-[var(--text-tertiary)] truncate", children: [
          /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }) }),
          /* @__PURE__ */ jsx("span", { className: "sm:hidden", children: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 ticker-line h-px" }),
        /* @__PURE__ */ jsx("div", { className: "font-mono text-caption uppercase tracking-widest text-[var(--accent-primary)]", children: "redacao" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto", children })
    ] })
  ] });
}
const Route$c = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "DeskNews - sistema de jornal" },
      { name: "description", content: "Pautas, redacao, espelho e metricas para sua redacao." },
      { property: "og:title", content: "DeskNews - sistema de jornal" },
      { name: "twitter:title", content: "DeskNews - sistema de jornal" },
      { property: "og:description", content: "Pautas, redacao, espelho e metricas para sua redacao." },
      { name: "twitter:description", content: "Pautas, redacao, espelho e metricas para sua redacao." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e71ff10a-f7bf-4950-be10-4f52fd022444/id-preview-8ed03129--ff1e0871-da04-4399-bd6a-0bd185fe6709.lovable.app-1778814456692.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e71ff10a-f7bf-4950-be10-4f52fd022444/id-preview-8ed03129--ff1e0871-da04-4399-bd6a-0bd185fe6709.lovable.app-1778814456692.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  errorComponent: ({ error, reset }) => /* @__PURE__ */ jsx("div", { className: "p-6 min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--accent-primary)]/30", children: /* @__PURE__ */ jsxs("div", { className: "bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-xl p-8 rounded-3xl max-w-2xl w-full shadow-[var(--shadow-2xl)]", children: [
    /* @__PURE__ */ jsx("div", { className: "text-label text-[var(--status-error)] mb-2", children: "Falha no Aplicativo" }),
    /* @__PURE__ */ jsx("h2", { className: "text-h1 font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4", children: "Erro de Inicializacao" }),
    /* @__PURE__ */ jsx("pre", { className: "bg-[var(--bg-secondary)] p-4 rounded-2xl text-caption font-mono overflow-auto mb-6 border border-[var(--border-light)] whitespace-pre-wrap text-[var(--text-secondary)]", children: error instanceof Error ? error.message : "Erro desconhecido" }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-4 justify-end", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => reset(),
          className: "px-5 py-2.5 rounded-2xl bg-[var(--status-error)] hover:bg-[var(--status-error)]/90 text-white text-body-sm font-bold transition-all active:scale-[0.98] shadow-[var(--shadow-lg)]",
          children: "Tentar Novamente"
        }
      ),
      /* @__PURE__ */ jsx("a", { href: "/", className: "px-5 py-2.5 rounded-2xl bg-[var(--bg-overlay)] hover:bg-[var(--bg-overlay-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-body-sm font-bold transition-all active:scale-[0.98] border border-[var(--border-light)] text-center", children: "Voltar para o Inicio" })
    ] })
  ] }) }),
  notFoundComponent: () => /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] px-6 text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-display-xl font-black tracking-tight text-[var(--text-primary)] [background:linear-gradient(135deg,_var(--text-primary)_0%,_var(--text-secondary)_100%)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] [background-clip:text] mb-4", children: "404" }),
    /* @__PURE__ */ jsx("p", { className: "text-body-lg text-[var(--text-tertiary)] mb-8", children: "Pagina nao encontrada." }),
    /* @__PURE__ */ jsx("a", { href: "/", className: "px-8 py-3 rounded-2xl bg-[var(--accent-primary)] text-white font-bold text-body transition-all duration-300 hover:shadow-[var(--shadow-xl)] active:scale-[0.98] shadow-[var(--shadow-lg)]", children: "Voltar para o Inicio" })
  ] })
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "pt-BR", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx(
        "script",
        {
          dangerouslySetInnerHTML: {
            __html: `
              (function () {
                try {
                  var stored = localStorage.getItem("desknews-theme");
                  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  var theme = stored || (prefersDark ? "dark" : "light");
                  document.documentElement.setAttribute("data-theme", theme);
                } catch (_) {}
              })();
            `
          }
        }
      ),
      /* @__PURE__ */ jsx(HeadContent, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {
  }
});
function useTheme() {
  return useContext(ThemeContext);
}
function RootComponent() {
  const { queryClient } = Route$c.useRouteContext();
  const [theme, setTheme] = useState(null);
  useEffect(() => {
    const stored = window.localStorage.getItem("desknews-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme = stored === "light" || stored === "dark" ? stored : prefersDark ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  }, []);
  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    window.localStorage.setItem("desknews-theme", nextTheme);
  };
  const resolvedTheme = theme ?? "dark";
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxs(ThemeContext.Provider, { value: { theme: resolvedTheme, toggleTheme }, children: [
    /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsx(Outlet, {}) }),
    /* @__PURE__ */ jsx(Toaster, { theme: resolvedTheme, position: "top-right", richColors: true })
  ] }) });
}
const supabaseUrl = "https://zxopxmcwoakdvxwvmufy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4b3B4bWN3b2FrZHZ4d3ZtdWZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMzY5MDYsImV4cCI6MjA5MzkxMjkwNn0.N9E1sg2GF_Q17IvxMkCWAPEq05697lvHp7sUDFiYEs0";
const noopQuery = new Proxy({}, {
  get: (_target, prop) => {
    if (prop === "then") return void 0;
    if (prop === Symbol.iterator) return void 0;
    return (..._args) => noopQuery;
  }
});
const noopQueryWithPromise = new Proxy(
  Promise.resolve({ data: null, error: null }),
  {
    get: (target, prop) => {
      if (prop === "then" || prop === "catch" || prop === "finally") {
        return target[prop].bind(target);
      }
      return (..._args) => noopQueryWithPromise;
    }
  }
);
function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    realtime: { params: { eventsPerSecond: 10 } }
  });
}
const supabase = createSupabaseClient();
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
function parseTimeToSeconds(time) {
  if (!time) return 0;
  const [minutes, seconds] = time.split(":").map(Number);
  return (minutes || 0) * 60 + (seconds || 0);
}
function formatSecondsToTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
const Route$b = createFileRoute("/tp")({
  validateSearch: (search) => {
    return {
      date: search.date || void 0,
      programa: search.programa || void 0
    };
  },
  component: () => /* @__PURE__ */ jsx(TeleprompterPage, {}),
  head: () => ({ meta: [{ title: "Teleprompter — DeskNews" }] })
});
const PROGRAMAS$1 = ["Todos", "Jornal da Manhã", "Edição Meio-Dia", "Jornal da Noite"];
function InstructionsModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-zinc-900 rounded-2xl border border-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "sticky top-0 bg-zinc-950 border-b border-zinc-800 p-6 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(HelpCircle, { className: "h-6 w-6 text-primary" }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-white", children: "Guia de Atalhos" })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "p-2 hover:bg-zinc-800 rounded-lg transition-colors",
          children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsx(Keyboard, { className: "h-5 w-5 text-blue-400" }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-white", children: "Atalhos de Teclado" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3 bg-zinc-800/30 rounded-lg p-4 border border-zinc-700", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-blue-500/20 text-blue-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "F" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Fullscreen" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Ativa/desativa tela cheia" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-purple-500/20 text-purple-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "C" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Camera (Câmera)" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Alterna para modo câmera" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "M" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Master" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Alterna para modo master" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "Espaço" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Play / Pause" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Inicia ou pausa o scroll automático" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-orange-500/20 text-orange-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "E" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Espelhar" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Inverte a imagem horizontalmente" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "border-t border-zinc-700 pt-3 mt-3", children: /* @__PURE__ */ jsx("p", { className: "text-zinc-300 text-xs mb-3 font-semibold", children: "AJUSTES RÁPIDOS:" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "←" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Diminuir Fonte" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Reduz -5px (mín: 50px)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "→" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Aumentar Fonte" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Aumenta +5px (máx: 180px)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "↑" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Diminuir Velocidade" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Reduz -0.5 (mín: 0.5)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "↓" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Aumentar Velocidade" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Aumenta +0.5 (máx: 15)" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsx(Touchpad, { className: "h-5 w-5 text-cyan-400" }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-white", children: "Gestos no Celular" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3 bg-zinc-800/30 rounded-lg p-4 border border-zinc-700", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "👆 Duplo" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Fullscreen" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Duplo toque para ativar/desativar" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-purple-500/20 text-purple-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "↗️ Diagonal ↑" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Master" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Deslizar diagonal para cima" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "↙️ Diagonal ↓" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Camera (Câmera)" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Deslizar diagonal para baixo" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "👇 Toque" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Play / Pause" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Toque simples na tela" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded font-mono text-sm font-bold min-w-fit", children: "↔️ Arrastar" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: "Espelhar" }),
              /* @__PURE__ */ jsx("p", { className: "text-zinc-400 text-sm", children: "Toque + arrastar para a esquerda" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsx(Zap, { className: "h-5 w-5 text-yellow-400" }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-white", children: "💡 Dicas Rápidas" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-yellow-200 text-sm", children: [
            "📊 ",
            /* @__PURE__ */ jsx("strong", { children: "Barra de progresso" }),
            " mostra o andamento do programa"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-yellow-200 text-sm", children: [
            "📱 ",
            /* @__PURE__ */ jsx("strong", { children: "Totalmente responsivo" }),
            " — funciona perfeitamente em celular"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-yellow-200 text-sm", children: [
            "⚡ ",
            /* @__PURE__ */ jsx("strong", { children: "Use as setas" }),
            " para ajustar fonte e velocidade rapidamente"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "sticky bottom-0 bg-zinc-950 border-t border-zinc-800 p-4 flex justify-end gap-3", children: /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onClose,
        className: "px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold transition-colors",
        children: "Fechar"
      }
    ) })
  ] }) });
}
function TeleprompterPage() {
  const searchParams = Route$b.useSearch();
  const [date, setDate] = useState(searchParams.date || "");
  const [programa, setPrograma] = useState(
    searchParams.programa ? decodeURIComponent(searchParams.programa) : "Todos"
  );
  const [items, setItems] = useState([]);
  const [blocos, setBlocos] = useState([]);
  const [fontSize, setFontSize] = useState(90);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const [isScrolling, setIsScrolling] = useState(false);
  const [mirrored, setMirrored] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalProgress, setTotalProgress] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [syncMode, setSyncMode] = useState("master");
  const [isConnected, setIsConnected] = useState(false);
  const [lastBroadcastTime, setLastBroadcastTime] = useState(0);
  const rodaTvRef = useRef(null);
  const scrollRef = useRef(null);
  const requestRef = useRef();
  const channelRef = useRef(null);
  const isRemoteUpdateRef = useRef(false);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const doubleClickTimerRef = useRef();
  useEffect(() => {
    if (searchParams.date) {
      setDate(searchParams.date);
    } else if (!date) {
      const n = /* @__PURE__ */ new Date();
      setDate(`${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`);
    }
    if (searchParams.programa) setPrograma(decodeURIComponent(searchParams.programa));
  }, [searchParams.date, searchParams.programa]);
  const loadItems = useCallback(async () => {
    if (!date) return;
    const programaNorm = decodeURIComponent(programa || "Todos").trim().toLowerCase();
    const { data: allBlocks, error: bErr } = await supabase.from("espelho_blocos").select("id, nome, ordem, apresentador, programa").eq("data_edicao", date).order("ordem");
    if (bErr) {
      toast.error("Erro ao carregar blocos: " + bErr.message);
      return;
    }
    const blocks = programaNorm === "todos" ? allBlocks ?? [] : (allBlocks ?? []).filter((b) => (b.programa ?? "").toLowerCase().trim() === programaNorm);
    if (blocks.length > 0) {
      setBlocos(blocks);
      const { data: rawItens, error: iErr } = await supabase.from("espelho_itens").select("id, bloco_id, assunto, cabeca, ordem, status, tempo_cab, materia_id").in("bloco_id", blocks.map((b) => b.id)).order("ordem");
      if (iErr) toast.error("Erro ao carregar matérias: " + iErr.message);
      const seq = [];
      blocks.forEach((block) => {
        (rawItens || []).filter((i) => i.bloco_id === block.id).sort((a, b) => a.ordem - b.ordem).forEach((i) => seq.push(i));
      });
      const materiaIds = seq.filter((i) => i.materia_id && !i.cabeca).map((i) => i.materia_id);
      if (materiaIds.length > 0) {
        const { data: mats } = await supabase.from("materias").select("id, cabeca").in("id", materiaIds);
        if (mats) {
          const map = Object.fromEntries(mats.map((m) => [m.id, m.cabeca]));
          seq.forEach((item) => {
            if (item.materia_id && !item.cabeca && map[item.materia_id])
              item.cabeca = map[item.materia_id];
          });
        }
      }
      setItems(seq);
    } else {
      setItems([]);
      setBlocos([]);
    }
  }, [date, programa]);
  useEffect(() => {
    if (items.length === 0) {
      setSelectedItemId(null);
    } else {
      setSelectedItemId((prev) => {
        if (!prev || !items.some((i) => i.id === prev)) return items[0].id;
        return prev;
      });
    }
  }, [items]);
  useEffect(() => {
    const channel = supabase.channel("tp_sync").on("postgres_changes", { event: "UPDATE", schema: "public", table: "espelho_itens" }, ({ new: row }) => {
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.id === row.id);
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          assunto: row.assunto ?? next[idx].assunto,
          cabeca: row.cabeca ?? next[idx].cabeca,
          status: row.status ?? next[idx].status,
          tempo_cab: row.tempo_cab ?? next[idx].tempo_cab,
          ordem: row.ordem ?? next[idx].ordem
        };
        return next;
      });
      if (row.status === "no_ar") {
        setSelectedItemId((prev) => prev === row.id ? prev : row.id);
      }
    }).on("postgres_changes", { event: "INSERT", schema: "public", table: "espelho_itens" }, () => loadItems()).on("postgres_changes", { event: "DELETE", schema: "public", table: "espelho_itens" }, () => loadItems()).on("postgres_changes", { event: "*", schema: "public", table: "espelho_blocos" }, () => loadItems()).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadItems]);
  useEffect(() => {
    const ch = supabase.channel("espelho_sync").on("broadcast", { event: "cabeca_atualizada" }, ({ payload }) => {
      const { itemId, cabeca, assunto, tempo_cab } = payload;
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.id === itemId);
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], cabeca, assunto, tempo_cab };
        return next;
      });
    }).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);
  useEffect(() => {
    loadItems();
  }, [date, programa]);
  useEffect(() => {
    const canalNome = `tp-sync-${programa || "geral"}`;
    const canal = supabase.channel(canalNome);
    channelRef.current = canal;
    canal.on("broadcast", { event: "tp-state" }, ({ payload }) => {
      if (syncMode === "camera" && payload) {
        isRemoteUpdateRef.current = true;
        if (payload.selectedItemId !== void 0 && payload.selectedItemId !== selectedItemId)
          setSelectedItemId(payload.selectedItemId);
        if (payload.isScrolling !== void 0)
          setIsScrolling(payload.isScrolling);
        if (payload.fontSize !== void 0) setFontSize(payload.fontSize);
        if (payload.scrollSpeed !== void 0)
          setScrollSpeed(payload.scrollSpeed);
        if (payload.mirrored !== void 0) setMirrored(payload.mirrored);
        if (payload.scrollTop !== void 0 && scrollRef.current) {
          scrollRef.current.scrollTop = payload.scrollTop;
        }
        setTimeout(() => {
          isRemoteUpdateRef.current = false;
        }, 100);
      }
    }).subscribe((status) => {
      setIsConnected(status === "SUBSCRIBED");
    });
    return () => {
      supabase.removeChannel(canal);
    };
  }, [syncMode, selectedItemId, programa]);
  const broadcastState = useCallback(() => {
    if (syncMode !== "master" || !channelRef.current) return;
    const now = Date.now();
    if (now - lastBroadcastTime < 50) return;
    setLastBroadcastTime(now);
    channelRef.current.send({
      type: "broadcast",
      event: "tp-state",
      payload: {
        selectedItemId,
        isScrolling,
        fontSize,
        scrollSpeed,
        mirrored,
        scrollTop: scrollRef.current?.scrollTop || 0
      }
    });
  }, [syncMode, selectedItemId, isScrolling, fontSize, scrollSpeed, mirrored, lastBroadcastTime]);
  useEffect(() => {
    broadcastState();
  }, [isScrolling, fontSize, scrollSpeed, mirrored, selectedItemId, broadcastState]);
  useEffect(() => {
    if (syncMode !== "master" || !isScrolling) {
      return;
    }
    let animationFrameId;
    let lastScrollTop = scrollRef.current?.scrollTop || 0;
    const broadcastContinuous = () => {
      const currentScrollTop = scrollRef.current?.scrollTop || 0;
      if (currentScrollTop !== lastScrollTop) {
        lastScrollTop = currentScrollTop;
        broadcastState();
      }
      animationFrameId = requestAnimationFrame(broadcastContinuous);
    };
    animationFrameId = requestAnimationFrame(broadcastContinuous);
    return () => cancelAnimationFrame(animationFrameId);
  }, [syncMode, isScrolling, broadcastState]);
  const currentItem = items.find((i) => i.id === selectedItemId);
  const materiaAtivaIndexGlobal = useMemo(
    () => items.findIndex((i) => i.id === selectedItemId),
    [items, selectedItemId]
  );
  const lastSelectedId = useRef(null);
  useEffect(() => {
    if (currentItem) {
      setTimeLeft(parseTimeToSeconds(currentItem.tempo_cab));
      if (selectedItemId !== lastSelectedId.current) {
        setIsScrolling(false);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
        lastSelectedId.current = selectedItemId;
      }
    }
  }, [selectedItemId, currentItem]);
  const calculateTotalProgress = useCallback(() => {
    if (!scrollRef.current || items.length === 0 || !selectedItemId) {
      setTotalProgress(0);
      return;
    }
    const scrollEl = scrollRef.current;
    const currentIndex = items.findIndex((i) => i.id === selectedItemId);
    if (currentIndex === -1) return;
    const scrollableHeight = scrollEl.scrollHeight - scrollEl.clientHeight;
    const scrollPct = scrollableHeight > 0 ? scrollEl.scrollTop / scrollableHeight : 1;
    const progress = (currentIndex + scrollPct) / items.length * 100;
    setTotalProgress(progress);
  }, [items, selectedItemId]);
  useEffect(() => {
    let timer;
    if (isScrolling && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1e3);
    }
    return () => clearInterval(timer);
  }, [isScrolling, timeLeft]);
  useEffect(() => {
    calculateTotalProgress();
  }, [selectedItemId, calculateTotalProgress]);
  const updateItemStatus = async (itemId, newStatus) => {
    const { error } = await supabase.from("espelho_itens").update({ status: newStatus }).eq("id", itemId);
    if (error) console.error("Erro ao atualizar status:", error.message);
  };
  useEffect(() => {
    if (!selectedItemId) return;
    if (isScrolling) {
      updateItemStatus(selectedItemId, "no_ar");
    }
  }, [isScrolling, selectedItemId]);
  const animate = () => {
    if (!scrollRef.current || !selectedItemId) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }
    const scrollEl = scrollRef.current;
    const rodaTvEl = rodaTvRef.current;
    const currentItem2 = items.find((i) => i.id === selectedItemId);
    if (isScrolling) {
      let shouldStopScrolling = false;
      if (currentItem2?.cabeca && rodaTvEl) {
        const scrollRect = scrollEl.getBoundingClientRect();
        const rodaTvRect = rodaTvEl.getBoundingClientRect();
        const centerLine = scrollRect.top + scrollRect.height / 2;
        if (rodaTvRect.top <= centerLine) {
          shouldStopScrolling = true;
        }
      } else {
        const isAtAbsoluteBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight;
        if (isAtAbsoluteBottom) {
          shouldStopScrolling = true;
        }
      }
      if (shouldStopScrolling) {
        setIsScrolling(false);
        if (selectedItemId) {
          updateItemStatus(selectedItemId, "exibido").then(() => {
            const currentIndex = items.findIndex((i) => i.id === selectedItemId);
            if (currentIndex !== -1 && currentIndex < items.length - 1) {
              setSelectedItemId(items[currentIndex + 1].id);
            }
          });
        }
      } else {
        scrollEl.scrollTop += scrollSpeed;
      }
      calculateTotalProgress();
    }
    requestRef.current = requestAnimationFrame(animate);
  };
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isScrolling, scrollSpeed, selectedItemId, items]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsScrolling((prev) => !prev);
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setIsFullscreen((prev) => !prev);
      }
      if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        setSyncMode("camera");
      }
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setSyncMode("master");
      }
      if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        setMirrored((prev) => !prev);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setFontSize((prev) => {
          const newSize = Math.max(50, prev - 5);
          return newSize;
        });
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setFontSize((prev) => {
          const newSize = Math.min(180, prev + 5);
          return newSize;
        });
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setScrollSpeed((prev) => {
          const newSpeed = Math.max(0.5, prev - 0.5);
          return newSpeed;
        });
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setScrollSpeed((prev) => {
          const newSpeed = Math.min(15, prev + 0.5);
          return newSpeed;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mirrored]);
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    }
  };
  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const duration = Date.now() - touchStartRef.current.time;
    if (duration < 300 && distance < 30) {
      if (doubleClickTimerRef.current) {
        clearTimeout(doubleClickTimerRef.current);
        setIsFullscreen((prev) => !prev);
        doubleClickTimerRef.current = void 0;
      } else {
        doubleClickTimerRef.current = setTimeout(() => {
          doubleClickTimerRef.current = void 0;
        }, 300);
      }
      return;
    }
    if (dx > 50 && dy < -50) {
      setSyncMode("master");
      return;
    }
    if (dx > 50 && dy > 50) {
      setSyncMode("camera");
      return;
    }
    if (dx < -50 && Math.abs(dy) < 30) {
      setMirrored((prev) => !prev);
      return;
    }
    if (distance < 30) {
      setIsScrolling((prev) => !prev);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 bg-black text-white flex flex-col overflow-hidden select-none z-[100] font-mono", children: [
    /* @__PURE__ */ jsx(InstructionsModal, { isOpen: showInstructions, onClose: () => setShowInstructions(false) }),
    !isFullscreen && /* @__PURE__ */ jsxs("div", { className: "p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between z-50 shrink-0 flex-wrap gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(MonitorPlay, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsx("h1", { className: "uppercase text-xs font-bold tracking-widest text-primary", children: "TP Studio" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            value: date,
            onChange: (e) => setDate(e.target.value),
            className: "bg-black border border-zinc-700 rounded px-2 py-1 text-xs"
          }
        ),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: programa,
            onChange: (e) => setPrograma(e.target.value),
            className: "bg-black border border-zinc-700 rounded px-2 py-1 text-xs",
            children: PROGRAMAS$1.map((p) => /* @__PURE__ */ jsx("option", { value: p, children: p }, p))
          }
        ),
        /* @__PURE__ */ jsx("div", { className: cn(
          "px-2 py-1 rounded text-[11px] font-bold border",
          syncMode === "master" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-blue-500/10 border-blue-500/30 text-blue-400"
        ), children: syncMode === "master" ? "🎙️ MASTER" : "🎥 CÂMERA" }),
        syncMode === "camera" && /* @__PURE__ */ jsx("div", { className: cn(
          "px-2 py-1 rounded text-[11px] font-bold border",
          isConnected ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
        ), children: isConnected ? "✓ Sync" : "✗ Offline" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 bg-black/40 px-3 py-1 rounded border border-white/5 shadow-inner", children: [
          /* @__PURE__ */ jsx(Timer, { className: cn("h-4 w-4", timeLeft <= 5 && timeLeft > 0 ? "text-red-500 animate-pulse" : "text-primary") }),
          /* @__PURE__ */ jsxs("span", { className: cn("text-xl font-bold tabular-nums", timeLeft <= 5 && timeLeft > 0 ? "text-red-500" : "text-white"), children: [
            Math.floor(timeLeft / 60),
            ":",
            String(timeLeft % 60).padStart(2, "0")
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Type, { className: "h-4 w-4 text-zinc-500" }),
          /* @__PURE__ */ jsx("input", { type: "range", min: "50", max: "180", value: fontSize, onChange: (e) => setFontSize(Number(e.target.value)), className: "w-20 accent-primary" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(MoveVertical, { className: "h-4 w-4 text-zinc-500" }),
          /* @__PURE__ */ jsx("input", { type: "range", min: "0.5", max: "15", step: "0.5", value: scrollSpeed, onChange: (e) => setScrollSpeed(Number(e.target.value)), className: "w-20 accent-primary" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Button, { size: "icon", variant: mirrored ? "default" : "outline", onClick: () => setMirrored(!mirrored), className: "h-8 w-8", children: /* @__PURE__ */ jsx(FlipHorizontal, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(Button, { size: "icon", variant: "outline", onClick: () => {
            if (scrollRef.current) scrollRef.current.scrollTop = 0;
            setIsScrolling(false);
          }, className: "h-8 w-8", title: "Reiniciar", children: /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(Button, { size: "icon", onClick: () => setIsScrolling(!isScrolling), className: "h-9 w-9 rounded-full bg-primary", children: isScrolling ? /* @__PURE__ */ jsx(Pause, { className: "h-5 w-5 fill-current" }) : /* @__PURE__ */ jsx(Play, { className: "h-5 w-5 fill-current ml-0.5" }) }),
          /* @__PURE__ */ jsx(Button, { size: "icon", variant: "outline", onClick: () => setIsFullscreen(true), className: "h-8 w-8", children: /* @__PURE__ */ jsx(Maximize, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(Button, { size: "icon", variant: "outline", onClick: () => setShowInstructions(true), className: "h-8 w-8", title: "Guia de Atalhos", children: /* @__PURE__ */ jsx(HelpCircle, { className: "h-4 w-4" }) })
        ] })
      ] })
    ] }),
    isFullscreen && /* @__PURE__ */ jsx("div", { className: "absolute top-6 left-6 z-[110] opacity-0 hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", onClick: () => setIsFullscreen(false), className: "bg-zinc-900/80 backdrop-blur", children: [
      /* @__PURE__ */ jsx(Minimize, { className: "h-4 w-4 mr-2" }),
      " SAIR TELA CHEIA"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex overflow-hidden", children: [
      !isFullscreen && /* @__PURE__ */ jsxs("aside", { className: "w-80 bg-zinc-950 border-r border-zinc-800 overflow-y-auto flex flex-col shrink-0", children: [
        /* @__PURE__ */ jsx("div", { className: "p-4 border-b border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 font-bold", children: "Roteiro do Jornal" }),
        blocos.length === 0 && /* @__PURE__ */ jsxs("div", { className: "p-8 text-center text-zinc-600 text-xs italic", children: [
          "Nenhum bloco encontrado para ",
          programa,
          " nesta data."
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 divide-y divide-zinc-900", children: (() => {
          let globalCounter = 0;
          return blocos.map((b) => {
            const blockItems = items.filter((i) => i.bloco_id === b.id);
            const startIdx = globalCounter;
            globalCounter += blockItems.length;
            return /* @__PURE__ */ jsxs("div", { className: "p-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "px-3 py-1 text-[9px] text-primary/40 uppercase font-bold sticky top-0 bg-zinc-950/90 backdrop-blur-sm z-10", children: [
                "BLOCO ",
                b.ordem,
                " — ",
                b.nome
              ] }),
              blockItems.map((item, idx) => {
                const absoluteIndex = startIdx + idx;
                const isPast = absoluteIndex < materiaAtivaIndexGlobal;
                const isCurrent = absoluteIndex === materiaAtivaIndexGlobal;
                return /* @__PURE__ */ jsxs(
                  "button",
                  {
                    disabled: isPast,
                    onClick: () => {
                      setSelectedItemId(item.id);
                      if (scrollRef.current) scrollRef.current.scrollTop = 0;
                      setIsScrolling(false);
                    },
                    className: cn(
                      "w-full text-left px-3 py-2 rounded-md transition-all text-xs uppercase font-bold tracking-wider flex items-center justify-between group",
                      isCurrent ? "bg-primary/20 text-primary border border-primary/30" : "text-zinc-400 hover:bg-zinc-900",
                      item.status === "no_ar" && "text-red-500 bg-red-500/5",
                      (item.status === "exibido" || isPast) && "text-emerald-500/40 opacity-40 grayscale pointer-events-none cursor-not-allowed",
                      isCurrent && "cursor-pointer"
                    ),
                    children: [
                      /* @__PURE__ */ jsxs("span", { className: "truncate flex-1", children: [
                        /* @__PURE__ */ jsxs("span", { className: "opacity-30 mr-2", children: [
                          absoluteIndex + 1,
                          "."
                        ] }),
                        item.assunto
                      ] }),
                      !item.cabeca && /* @__PURE__ */ jsx("span", { className: "text-[8px] text-zinc-600 ml-2", children: "(SEM TEXTO)" })
                    ]
                  },
                  item.id
                );
              }),
              blockItems.length === 0 && /* @__PURE__ */ jsx("div", { className: "px-3 py-2 text-[10px] text-zinc-700 italic", children: "Bloco sem matérias vinculadas" })
            ] }, b.id);
          });
        })() })
      ] }),
      /* @__PURE__ */ jsx(
        "div",
        {
          ref: scrollRef,
          onTouchStart: handleTouchStart,
          onTouchEnd: handleTouchEnd,
          className: cn(
            "flex-1 overflow-y-auto px-10 sm:px-20 py-[45vh] cursor-pointer no-scrollbar relative",
            mirrored && "scale-x-[-1]"
          ),
          onClick: () => setIsScrolling(!isScrolling),
          style: { fontSize: `${fontSize}px`, scrollBehavior: "auto" },
          children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto uppercase font-bold", children: [
            currentItem ? /* @__PURE__ */ jsxs("div", { className: "space-y-12", children: [
              /* @__PURE__ */ jsx("div", { className: "text-primary/20 text-sm tracking-[0.5em] text-center border-b border-primary/10 pb-4 mb-8", children: currentItem.assunto }),
              (() => {
                const bl = blocos.find((b) => b.id === currentItem.bloco_id);
                return bl?.apresentador && /* @__PURE__ */ jsxs("div", { className: "text-emerald-500 text-center mb-8 text-4xl border-2 border-emerald-500/20 py-4 rounded-xl bg-emerald-500/5", children: [
                  "[",
                  bl.apresentador,
                  "]"
                ] });
              })(),
              currentItem.cabeca ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("div", { className: "whitespace-pre-wrap leading-[1.25]", children: currentItem.cabeca }),
                /* @__PURE__ */ jsx("div", { ref: rodaTvRef, className: "text-emerald-500 text-center mt-12 text-4xl border-2 border-emerald-500/20 py-4 rounded-xl bg-emerald-500/5", children: "[RODA TV]" })
              ] }) : /* @__PURE__ */ jsx("div", { className: "text-zinc-700 italic text-2xl text-center py-20", children: "Matéria sem texto de cabeça cadastrado." })
            ] }) : /* @__PURE__ */ jsx("div", { className: "text-zinc-700 italic text-2xl font-mono text-center", children: items.length === 0 ? "Aguardando textos do espelho..." : "Selecione uma matéria no roteiro lateral." }),
            items.length > 0 && /* @__PURE__ */ jsx("div", { className: "h-[50vh] flex items-center justify-center text-zinc-900 font-mono text-sm uppercase tracking-widest", children: "Fim do programa" })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "fixed left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-between px-2 z-40 opacity-50", children: [
      /* @__PURE__ */ jsx("div", { className: "w-6 h-1.5 bg-primary/60 rounded-r-full" }),
      /* @__PURE__ */ jsx("div", { className: "w-6 h-1.5 bg-primary/60 rounded-l-full" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "fixed bottom-0 left-0 w-full h-2 bg-zinc-900/80 backdrop-blur-sm z-[110] border-t border-white/5", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-100 ease-out",
          style: { width: `${totalProgress}%` }
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex pointer-events-none", children: blocos.map((b, i) => /* @__PURE__ */ jsx(
        "div",
        {
          className: "flex-1 border-r border-white/20 last:border-r-0 h-full"
        },
        b.id
      )) })
    ] }),
    /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      ` } })
  ] });
}
const Route$a = createFileRoute("/relatorios")({
  component: () => /* @__PURE__ */ jsx(RelatoriosPage, {}),
  head: () => ({ meta: [{ title: "Relatórios — Newsdesk" }] })
});
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
    let query = supabase.from("relatorios").select("*").order("data", { ascending: false });
    if (dataInicio) query = query.gte("data", dataInicio);
    if (dataFim) query = query.lte("data", dataFim);
    if (programa !== "Todos") query = query.eq("programa", programa);
    if (eventoFiltro !== "Todos") query = query.eq("evento", eventoFiltro);
    const { data, error } = await query;
    if (error) toast.error(error.message);
    else setRelatorios(data ?? []);
    setLoading(false);
  }, [dataInicio, dataFim, programa, eventoFiltro]);
  useEffect(() => {
    load();
  }, [dataInicio, dataFim, programa, eventoFiltro]);
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 space-y-6 bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-primary)]/30", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border-b border-[var(--border-subtle)] pb-3 shrink-0", children: [
      /* @__PURE__ */ jsx(ClipboardList, { className: "h-5 w-5 text-[var(--text-quaternary)]" }),
      /* @__PURE__ */ jsx("h1", { className: "text-h1 font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent", children: "RELATÓRIOS" }),
      /* @__PURE__ */ jsx("span", { className: "text-label text-[var(--text-tertiary)] hidden sm:inline", children: "Gestão · Eventos & Pautas Caídas" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("div", { className: "hidden sm:block", children: /* @__PURE__ */ jsx("p", { className: "text-body-sm text-[var(--text-tertiary)]", children: "Histórico de ocorrências e controle editorial da redação." }) }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          onClick: () => setShowNew(true),
          className: "inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-[var(--accent-primary)] text-white text-body-sm font-semibold uppercase tracking-widest shadow-[var(--shadow-lg)] transition-all duration-300 hover:shadow-[var(--shadow-xl)] active:scale-[0.98]",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            " Novo Relatório"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl p-6 shadow-[var(--shadow-xl)]", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx("label", { className: "text-label text-[var(--text-quaternary)] font-bold", children: "Data Inicial" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            value: dataInicio,
            onChange: (e) => setDataInicio(e.target.value),
            className: "w-full px-4 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-body-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx("label", { className: "text-label text-[var(--text-quaternary)] font-bold", children: "Data Final" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            value: dataFim,
            onChange: (e) => setDataFim(e.target.value),
            className: "w-full px-4 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-body-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx("label", { className: "text-label text-[var(--text-quaternary)] font-bold", children: "Programa" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: programa,
            onChange: (e) => setPrograma(e.target.value),
            className: "w-full px-4 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-body-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300 appearance-none cursor-pointer",
            children: [
              /* @__PURE__ */ jsx("option", { value: "Todos", children: "Todos os Programas" }),
              /* @__PURE__ */ jsx("option", { value: "Jornal da Manhã", children: "Jornal da Manhã" }),
              /* @__PURE__ */ jsx("option", { value: "Edição Meio-Dia", children: "Edição Meio-Dia" }),
              /* @__PURE__ */ jsx("option", { value: "Jornal da Noite", children: "Jornal da Noite" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx("label", { className: "text-label text-[var(--text-quaternary)] font-bold", children: "EVENTOS" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: eventoFiltro,
            onChange: (e) => setEventoFiltro(e.target.value),
            className: "w-full px-4 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-body-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300 appearance-none cursor-pointer",
            children: [
              /* @__PURE__ */ jsx("option", { value: "Todos", children: "MOSTRAR TUDO" }),
              /* @__PURE__ */ jsx("option", { value: "Pautas Caídas", children: "Pautas Caídas" }),
              /* @__PURE__ */ jsx("option", { value: "Relatórios", children: "Relatórios" }),
              /* @__PURE__ */ jsx("option", { value: "Outros", children: "Outros" })
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4", children: loading ? /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-[var(--text-tertiary)] italic", children: "Carregando relatórios..." }) : relatorios.length === 0 ? /* @__PURE__ */ jsx("div", { className: "bg-[var(--bg-secondary)] border border-dashed border-[var(--border-light)] rounded-3xl p-12 text-center text-[var(--text-tertiary)] text-body-sm shadow-[var(--shadow-md)]", children: "Nenhum relatório encontrado para os filtros selecionados." }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4", children: relatorios.map((r) => /* @__PURE__ */ jsxs("div", { className: "bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-[2rem] p-6 hover:bg-[var(--bg-overlay)] hover:border-[var(--accent-primary)]/30 transition-all duration-300 group shadow-[var(--shadow-md)]", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between mb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsx("span", { className: "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-label px-2.5 py-1 rounded-full border border-[var(--accent-primary)]/20", children: r.evento }),
        /* @__PURE__ */ jsxs("span", { className: "text-caption text-[var(--text-tertiary)] flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Calendar$1, { className: "h-3.5 w-3.5 text-[var(--text-quaternary)]" }),
          format(/* @__PURE__ */ new Date(r.data + "T12:00:00"), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-caption font-bold text-[var(--accent-secondary)]", children: r.programa })
      ] }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-h3 font-bold mb-2 text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors uppercase tracking-tight", children: r.retranca }),
      /* @__PURE__ */ jsx("p", { className: "text-body-sm text-[var(--text-secondary)] line-clamp-3 whitespace-pre-wrap leading-relaxed", children: r.texto })
    ] }, r.id)) }) }),
    showNew && user
  ] });
}
function RouteErrorComponent({ error }) {
  const isModuleError = error instanceof Error && (error.message.includes("Failed to fetch dynamically imported module") || error.message.includes("Importing a module script failed") || error.message.includes("error loading dynamically imported module"));
  if (isModuleError) {
    return /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center justify-center h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-6", children: /* @__PURE__ */ jsxs("div", { className: "bg-[var(--bg-overlay)] p-8 rounded-2xl border border-[var(--border-light)] shadow-xl max-w-md text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-h2 font-bold mb-3", children: "Atualização Disponível" }),
      /* @__PURE__ */ jsx("p", { className: "text-[var(--text-secondary)] mb-6 text-body-sm", children: "Uma nova versão do DeskNews foi detectada ou houve uma interrupção na conexão. Recarregue a página para continuar editando." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => window.location.reload(),
          className: "w-full py-3 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white rounded-xl font-bold transition-all active:scale-[0.98]",
          children: "Recarregar Página"
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsx(ErrorComponent, { error });
}
const Route$9 = createFileRoute("/redacao")({
  validateSearch: (search) => {
    return {
      edit: search.edit || void 0
    };
  },
  component: () => /* @__PURE__ */ jsx(RedacaoPage, {}),
  errorComponent: RouteErrorComponent,
  head: () => ({ meta: [{ title: "Redação — DeskNews" }] })
});
function RedacaoPage() {
  const { edit } = Route$9.useSearch();
  const navigate = Route$9.useNavigate();
  const [materias, setMaterias] = useState([]);
  const [pautas, setPautas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [selecionada, setSelecionada] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [corpo, setCorpo] = useState("");
  const [estrutura, setEstrutura] = useState("");
  const [status, setStatus] = useState("rascunho");
  const [pautaId, setPautaId] = useState("");
  const [cabeca, setCabeca] = useState("");
  const [tempoVt, setTempoVt] = useState("");
  const [tempoCab, setTempoCab] = useState("");
  const [deixa, setDeixa] = useState("");
  const [editorTexto, setEditorTexto] = useState("");
  const [editorImagem, setEditorImagem] = useState("");
  const [creditoReporter, setCreditoReporter] = useState("");
  const [historico, setHistorico] = useState([]);
  const [indexHistorico, setIndexHistorico] = useState(-1);
  const estruturaRef = useRef(null);
  selecionada ? selecionada.id : "nova-materia-temp";
  const inserirNoEstrutura = (texto) => {
    if (!estruturaRef.current) return;
    const textarea = estruturaRef.current;
    const inicio = textarea.selectionStart;
    const fim = textarea.selectionEnd;
    const novaEstrutura = estrutura.substring(0, inicio) + texto + estrutura.substring(fim);
    setEstrutura(novaEstrutura);
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = inicio + texto.length;
      textarea.focus();
    }, 0);
    adicionarAoHistorico(titulo, corpo, novaEstrutura);
  };
  async function carregarDados() {
    try {
      setLoading(true);
      const [mRes, pRes] = await Promise.all([
        supabase.from("materias").select("*").order("updated_at", { ascending: false }),
        supabase.from("pautas").select("id, titulo").order("created_at", { ascending: false })
      ]);
      if (mRes.error) throw mRes.error;
      if (pRes.error) throw pRes.error;
      setMaterias(mRes.data || []);
      setPautas(pRes.data || []);
    } catch (err) {
      toast.error("Erro ao carregar dados: " + err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    carregarDados();
  }, []);
  useEffect(() => {
    if (edit) {
      const mat = materias.find((m) => m.id === edit);
      if (mat && (!selecionada || selecionada.id !== edit)) {
        abrirMateria(mat);
      }
    }
  }, [edit, materias, selecionada]);
  async function abrirMateria(m) {
    setSelecionada(m);
    setTitulo(m.titulo);
    setCorpo(m.corpo || "");
    setEstrutura(m.estrutura || "");
    setStatus(m.status);
    setPautaId(m.pauta_id || "");
    setCabeca(m.cabeca || "");
    setTempoVt(m.tempo_vt || "");
    setTempoCab(m.tempo_cab || "");
    setDeixa(m.deixa || "");
    setEditorTexto(m.editor_texto || "");
    setEditorImagem(m.editor_imagem || "");
    setCreditoReporter(m.credito_reporter || "");
    setHistorico([{ titulo: m.titulo, corpo: m.corpo || "", estrutura: m.estrutura || "" }]);
    setIndexHistorico(0);
  }
  function novaMateria() {
    setSelecionada(null);
    setTitulo("");
    setCorpo("");
    setEstrutura("");
    setStatus("rascunho");
    setPautaId("");
    setCabeca("");
    setTempoVt("");
    setTempoCab("");
    setDeixa("");
    setEditorTexto("");
    setEditorImagem("");
    setCreditoReporter("");
    setHistorico([]);
    setIndexHistorico(-1);
    navigate({ search: { edit: void 0 } });
  }
  function adicionarAoHistorico(t, c, e) {
    setHistorico((prev) => {
      const novoHistorico = [...prev.slice(0, indexHistorico + 1), { titulo: t, corpo: c, estrutura: e }];
      if (novoHistorico.length > 30) novoHistorico.shift();
      return novoHistorico;
    });
    setIndexHistorico((prev) => Math.min(prev + 1, 29));
  }
  function handleUndo() {
    if (indexHistorico > 0) {
      const entry = historico[indexHistorico - 1];
      setTitulo(entry.titulo);
      setCorpo(entry.corpo);
      setEstrutura(entry.estrutura);
      setIndexHistorico(indexHistorico - 1);
    }
  }
  function handleRedo() {
    if (indexHistorico < historico.length - 1) {
      const entry = historico[indexHistorico + 1];
      setTitulo(entry.titulo);
      setCorpo(entry.corpo);
      setEstrutura(entry.estrutura);
      setIndexHistorico(indexHistorico + 1);
    }
  }
  async function handleSalvar(e) {
    e.preventDefault();
    try {
      if (selecionada) {
        const { error } = await supabase.from("materias").update({
          titulo,
          corpo,
          estrutura,
          status,
          pauta_id: pautaId || null,
          cabeca,
          tempo_vt: tempoVt,
          tempo_cab: tempoCab,
          deixa,
          editor_texto: editorTexto,
          editor_imagem: editorImagem,
          credito_reporter: creditoReporter,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", selecionada.id);
        if (error) throw error;
        toast.success("Matéria atualizada!");
        await carregarDados();
      } else {
        const { data, error } = await supabase.from("materias").insert({
          titulo,
          corpo,
          estrutura,
          status,
          pauta_id: pautaId || null,
          autor_id: null,
          cabeca,
          tempo_vt: tempoVt,
          tempo_cab: tempoCab,
          deixa,
          editor_texto: editorTexto,
          editor_imagem: editorImagem,
          credito_reporter: creditoReporter
        }).select().single();
        if (error) throw error;
        toast.success("Matéria criada!");
        await carregarDados();
        if (data) {
          navigate({ search: { edit: data.id } });
        }
      }
    } catch (err) {
      toast.error("Erro: " + err.message);
    }
  }
  const filtered = materias.filter(
    (m) => m.titulo.toLowerCase().includes(busca.toLowerCase())
  );
  if (loading) return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-screen", children: "Carregando..." });
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]", children: [
    /* @__PURE__ */ jsxs("div", { className: "hidden md:flex w-72 border-r border-[var(--border-light)] bg-[var(--bg-overlay)] flex-col", children: [
      /* @__PURE__ */ jsx("div", { className: "p-4 border-b border-[var(--border-light)]", children: /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: novaMateria,
          className: "w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white rounded-xl font-bold text-body-sm transition-all active:scale-[0.98]",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            " Nova Matéria"
          ]
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: "p-3 border-b border-[var(--border-light)]", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Buscar matérias...",
            value: busca,
            onChange: (e) => setBusca(e.target.value),
            className: "w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-quaternary)] text-body-sm focus:outline-none focus:border-[var(--accent-primary)] transition-all"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 md:flex-1 overflow-y-auto max-h-48 md:max-h-none", children: filtered.map((m) => /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => navigate({ search: { edit: m.id } }),
          className: `w-full px-4 py-3 text-left border-b border-[var(--border-light)] transition-all hover:bg-[var(--bg-secondary)] ${selecionada?.id === m.id ? "bg-[var(--accent-primary)]/10 border-l-4 border-l-[var(--accent-primary)]" : ""}`,
          children: [
            /* @__PURE__ */ jsx("div", { className: "font-bold text-body-sm text-[var(--text-primary)] truncate", children: m.titulo || "Sem título" }),
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-[var(--text-tertiary)] mt-1 capitalize", children: m.status })
          ]
        },
        m.id
      )) })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSalvar, className: "w-full flex-1 flex flex-col h-auto md:h-full bg-[var(--bg-secondary)] overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "md:hidden p-4 bg-[var(--bg-primary)] border-b border-[var(--border-light)]", children: /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: novaMateria,
          className: "w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white rounded-xl font-bold text-body-sm transition-all active:scale-[0.98]",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            " Nova Matéria"
          ]
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "px-6 py-3.5 bg-[var(--bg-primary)] border-b border-[var(--border-light)] flex items-center justify-between shrink-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: handleUndo, disabled: indexHistorico <= 0, className: "p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] disabled:opacity-30 disabled:hover:bg-transparent transition-all", children: /* @__PURE__ */ jsx(Undo2, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: handleRedo, disabled: indexHistorico >= historico.length - 1, className: "p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] disabled:opacity-30 disabled:hover:bg-transparent transition-all", children: /* @__PURE__ */ jsx(Redo2, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx("div", { className: "w-[1px] h-4 bg-[var(--border-light)] mx-1" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs("select", { value: status, onChange: (e) => setStatus(e.target.value), className: "px-3 py-1.5 text-body-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] font-medium", children: [
            /* @__PURE__ */ jsx("option", { value: "rascunho", children: "📝 Rascunho" }),
            /* @__PURE__ */ jsx("option", { value: "revisao", children: "🧐 Revisão" }),
            /* @__PURE__ */ jsx("option", { value: "publicado", children: "🚀 Publicado" })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "px-4 py-1.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white font-bold text-body-sm shadow-[var(--shadow-md)] transition-all active:scale-[0.98]", children: selecionada ? "Atualizar Matéria" : "Salvar Matéria" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto p-6 space-y-6 flex flex-col items-center w-full", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-5xl space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4 bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-light)] shadow-[var(--shadow-xs)]", children: [
          /* @__PURE__ */ jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5", children: "Vincular a uma Pauta" }),
            /* @__PURE__ */ jsxs("select", { value: pautaId, onChange: (e) => setPautaId(e.target.value), className: "w-full px-3 py-2 text-body-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all", children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Matéria Avulsa (Sem pauta)" }),
              pautas.map((p) => /* @__PURE__ */ jsx("option", { value: p.id, children: p.titulo }, p.id))
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5", children: "Crédito do Repórter" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: creditoReporter, onChange: (e) => setCreditoReporter(e.target.value), placeholder: "Ex: João Silva", className: "w-full px-3 py-2 text-body-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-quaternary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: titulo,
            onChange: (e) => setTitulo(e.target.value),
            onBlur: () => adicionarAoHistorico(titulo, corpo, estrutura),
            placeholder: "Título principal da matéria...",
            className: "w-full bg-transparent border-none text-[var(--text-primary)] placeholder-[var(--text-quaternary)] font-bold tracking-tight text-h1 focus:outline-none p-0 resize-none",
            style: { lineHeight: "1.2" }
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-4 bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-light)] shadow-[var(--shadow-xs)]", children: [
          /* @__PURE__ */ jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5", children: "Deixa (Últimas palavras do VT)" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: deixa, onChange: (e) => setDeixa(e.target.value), placeholder: "...na reportagem de hoje.", className: "w-full px-3 py-2 text-body-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5", children: "Tempo Cabeça" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: tempoCab, onChange: (e) => setTempoCab(e.target.value), placeholder: "0:15", className: "w-full px-3 py-2 text-body-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] font-mono text-center focus:outline-none focus:border-[var(--accent-primary)] transition-all" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5", children: "Tempo VT" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: tempoVt, onChange: (e) => setTempoVt(e.target.value), placeholder: "1:30", className: "w-full px-3 py-2 text-body-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] font-mono text-center focus:outline-none focus:border-[var(--accent-primary)] transition-all" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5", children: "Editor de Texto" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: editorTexto, onChange: (e) => setEditorTexto(e.target.value), placeholder: "Nome do editor", className: "w-full px-3 py-2 text-body-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5", children: "Editor de Imagem" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: editorImagem, onChange: (e) => setEditorImagem(e.target.value), placeholder: "Nome do editor", className: "w-full px-3 py-2 text-body-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center gap-2 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider bg-[var(--bg-primary)] border border-[var(--border-light)] px-3 py-1 rounded-full shadow-[var(--shadow-xs)]", children: [
            /* @__PURE__ */ jsx(MonitorPlay, { className: "h-3.5 w-3.5 text-purple-500" }),
            " Texto da Cabeça (Apresentador)"
          ] }),
          /* @__PURE__ */ jsx("textarea", { value: cabeca, onChange: (e) => setCabeca(e.target.value), placeholder: "Texto que o apresentador vai ler na abertura da matéria...", rows: 3, className: "w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-quaternary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300 resize-none text-body" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center gap-2 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider bg-[var(--bg-primary)] border border-[var(--border-light)] px-3 py-1 rounded-full shadow-[var(--shadow-xs)]", children: [
              /* @__PURE__ */ jsx(PenTool, { className: "h-3.5 w-3.5 text-blue-500" }),
              " Roteiro Técnico / Decupagem (VT)"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1 bg-[var(--bg-primary)] border border-[var(--border-light)] p-1 rounded-xl shadow-[var(--shadow-xs)]", children: [
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => inserirNoEstrutura("\n[OFF]\n"), className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all duration-200", children: "[OFF]" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => inserirNoEstrutura("\n[SONORA]\n(NOME DO ENTREVISTADO)\n(FUNÇÃO DO ENTREVISTADO)\n"), className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all duration-200", children: "[SONORA]" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => inserirNoEstrutura("\n[PASSAGEM]\n(NOME DO REPORTER)\n(LOCAL)\n"), className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all duration-200", children: "[PASSAGEM]" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => inserirNoEstrutura("\n[IMAGENS]\n(NOME DO CINEGRAFISTA)\n"), className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all duration-200", children: "[IMAGENS]" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => inserirNoEstrutura("\n[PRODUÇÃO]\n(NOME DO PRODUTOR)\n"), className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all duration-200", children: "[PRODUÇÃO]" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => inserirNoEstrutura("\n[ED. TEXTO]\n(EDITOR DE TEXTO)\n"), className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all duration-200", children: "[ED. TEXTO]" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => inserirNoEstrutura("\n[ED. IMAGENS]\n(EDITOR DE IMAGENS)\n"), className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all duration-200", children: "[ED. IMAGENS]" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              ref: estruturaRef,
              value: estrutura,
              onChange: (e) => setEstrutura(e.target.value),
              onBlur: () => adicionarAoHistorico(titulo, corpo, estrutura),
              rows: 10,
              placeholder: "OFF 1 / APRESENTADOR FAZ ABERTURA\n\n[SONORA] NOME / FUNÇÃO\n\nOFF 2 / CONTINUA COM MAIS INFORMAÇÕES\n\n[PASSAGEM] REPÓRTER // LOCAL",
              className: "w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-quaternary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300 resize-none whitespace-pre-wrap break-words text-body-sm leading-relaxed font-mono text-justify overflow-y-auto",
              style: {
                fontFamily: "'Segoe UI', 'Roboto Mono', 'Courier New', monospace",
                letterSpacing: "0.5px"
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center gap-2 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider bg-[var(--bg-primary)] border border-[var(--border-light)] px-3 py-1 rounded-full shadow-[var(--shadow-xs)]", children: [
            /* @__PURE__ */ jsx(FileText, { className: "h-3.5 w-3.5 text-emerald-500" }),
            " Matéria Escrita / Texto Web Corrido"
          ] }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: corpo,
              onChange: (e) => setCorpo(e.target.value),
              onBlur: () => adicionarAoHistorico(titulo, corpo, estrutura),
              placeholder: "Texto corrido / matéria web...",
              rows: 10,
              className: "w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-quaternary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300 resize-none text-body"
            }
          )
        ] })
      ] }) })
    ] })
  ] });
}
const Route$8 = createFileRoute("/playouT")({
  validateSearch: (search) => {
    return {
      date: search.date || void 0,
      programa: search.programa || void 0
    };
  },
  component: PlayoutPage,
  head: () => ({ meta: [{ title: "Exibição (PGM) — DeskNews" }] })
});
function parsarSonorasEPassagens(estrutura) {
  const sonoras = [];
  const passagens = [];
  const itensLauda = [];
  let producao = null;
  let ordem = 0;
  if (!estrutura) {
    console.log("⚠️ Estrutura vazia");
    return { sonoras, passagens, producao, itensLauda };
  }
  console.log("📖 Parseando estrutura com NOVO FORMATO:", estrutura);
  const linhas = estrutura.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  let i = 0;
  while (i < linhas.length) {
    const linha = linhas[i];
    if (linha.match(/^\[SONORA\]$/i)) {
      console.log("🎤 Encontrado [SONORA]");
      let nome = "";
      let funcao = "";
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          nome = nomeMatch[1].trim();
          i++;
          if (i + 1 < linhas.length) {
            const funcaoLinha = linhas[i + 1];
            const funcaoMatch = funcaoLinha.match(/^\(([^)]+)\)$/);
            if (funcaoMatch) {
              funcao = funcaoMatch[1].trim();
              i++;
            }
          }
        }
      }
      if (nome) {
        sonoras.push({ nome, funcao });
        itensLauda.push({
          tipo: "SONORA",
          nome: "SONORA",
          valor: `${nome} - ${funcao}`,
          ordem: ordem++
        });
        console.log("✅ Sonora adicionada:", { nome, funcao });
      }
    }
    if (linha.match(/^\[PASSAGEM\]$/i)) {
      console.log("🎥 Encontrado [PASSAGEM]");
      let nome = "";
      let local = "";
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          nome = nomeMatch[1].trim();
          i++;
          if (i + 1 < linhas.length) {
            const localLinha = linhas[i + 1];
            const localMatch = localLinha.match(/^\(([^)]+)\)$/);
            if (localMatch) {
              local = localMatch[1].trim();
              i++;
            }
          }
        }
      }
      if (nome) {
        passagens.push({ nome, local });
        itensLauda.push({
          tipo: "PASSAGEM",
          nome: "PASSAGEM",
          valor: `${nome} - ${local}`,
          ordem: ordem++
        });
        console.log("✅ Passagem adicionada:", { nome, local });
      }
    }
    if (linha.match(/^\[IMAGENS\]$/i)) {
      console.log("🎞️ Encontrado [IMAGENS]");
      let cinegrafista = "";
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          cinegrafista = nomeMatch[1].trim();
          i++;
        }
      }
      itensLauda.push({
        tipo: "IMAGENS",
        nome: "IMAGENS",
        valor: cinegrafista,
        ordem: ordem++
      });
      console.log("✅ Imagens adicionado:", cinegrafista);
    }
    if (linha.match(/^\[PRODUÇÃO\]$/i)) {
      console.log("🎬 Encontrado [PRODUÇÃO]");
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          producao = nomeMatch[1].trim();
          i++;
          itensLauda.push({
            tipo: "PRODUÇÃO",
            nome: "PRODUÇÃO",
            valor: producao,
            ordem: ordem++
          });
          console.log("✅ Produção adicionada:", producao);
        }
      }
    }
    if (linha.match(/^\[ED[\._\s]*TEXTO\]$/i)) {
      console.log("📝 Encontrado [ED. TEXTO]");
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          const edTexto = nomeMatch[1].trim();
          i++;
          itensLauda.push({
            tipo: "ED_TEXTO",
            nome: "ED_TEXTO",
            valor: edTexto,
            ordem: ordem++
          });
          console.log("✅ Ed. Texto adicionado:", edTexto);
        }
      }
    }
    if (linha.match(/^\[ED[\._\s]*IMAGENS?\]$/i)) {
      console.log("🖼️ Encontrado [ED. IMAGENS]");
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          const edImagem = nomeMatch[1].trim();
          i++;
          itensLauda.push({
            tipo: "ED_IMAGEM",
            nome: "ED_IMAGEM",
            valor: edImagem,
            ordem: ordem++
          });
          console.log("✅ Ed. Imagens adicionado:", edImagem);
        }
      }
    }
    i++;
  }
  console.log("📋 Total de sonoras parseadas:", sonoras.length);
  console.log("📋 Total de passagens parseadas:", passagens.length);
  console.log("📋 Total de itens da lauda:", itensLauda.length);
  console.log("📊 Resultado final:", { sonoras, passagens, producao, itensLauda });
  return { sonoras, passagens, producao, itensLauda };
}
async function detectCodec(file) {
  try {
    const buffer = await file.slice(0, 512).arrayBuffer();
    const text = String.fromCharCode(...new Uint8Array(buffer));
    if (text.includes("avc1") || text.includes("avc3") || text.includes("h264")) return "H.264";
    if (text.includes("hvc1") || text.includes("hev1") || text.includes("hevc")) return "H.265/HEVC";
    if (text.includes("av01")) return "AV1";
    const blobUrl = URL.createObjectURL(file);
    return new Promise((resolve) => {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.muted = true;
      v.src = blobUrl;
      const t = setTimeout(() => {
        v.src = "";
        v.load();
        resolve("Outro");
      }, 3e3);
      v.onloadedmetadata = () => {
        clearTimeout(t);
        v.src = "";
        v.load();
        resolve("H.264");
      };
      v.onerror = () => {
        clearTimeout(t);
        URL.revokeObjectURL(blobUrl);
        v.src = "";
        resolve("Erro");
      };
    });
  } catch {
    return "Erro";
  }
}
function getVideoDuration(blobUrl) {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.src = blobUrl;
    const t = setTimeout(() => {
      v.src = "";
      resolve(null);
    }, 4e3);
    v.onloadedmetadata = () => {
      clearTimeout(t);
      const d = isFinite(v.duration) ? v.duration : null;
      v.src = "";
      resolve(d);
    };
    v.onerror = () => {
      clearTimeout(t);
      v.src = "";
      resolve(null);
    };
  });
}
function formatDuration(secs) {
  if (secs === null || isNaN(secs) || !isFinite(secs)) return "--:--";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function extractYoutubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
function buildCamEmbedUrl(rawUrl, opts = { mute: true }) {
  const ytId = extractYoutubeId(rawUrl);
  if (ytId) {
    const params = new URLSearchParams({
      autoplay: "1",
      mute: opts.mute ? "1" : "0",
      rel: "0",
      playsinline: "1"
    });
    if (opts.enableApi) {
      params.set("enablejsapi", "1");
      if (typeof window !== "undefined") params.set("origin", window.location.origin);
    }
    return { url: `https://www.youtube.com/embed/${ytId}?${params.toString()}`, isYoutube: true };
  }
  return { url: rawUrl, isYoutube: false };
}
function PlayoutPage() {
  const { date, programa } = Route$8.useSearch();
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [globalItemIndex, setGlobalItemIndex] = useState({});
  const [fileStatus, setFileStatus] = useState({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [dirHandle, setDirHandle] = useState(null);
  const [isDirReady, setIsDirReady] = useState(false);
  const [localFiles, setLocalFiles] = useState([]);
  const [isScanningFiles, setIsScanningFiles] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pgmFile, setPgmFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pgmProgress, setPgmProgress] = useState(0);
  const [pgmCurrentTime, setPgmCurrentTime] = useState(0);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeInput, setYoutubeInput] = useState("");
  const [youtubeVisible, setYoutubeVisible] = useState(false);
  const [multiviewActive, setMultiviewActive] = useState(false);
  const [activeCam, setActiveCam] = useState(null);
  const [camSources, setCamSources] = useState([null, null, null, null]);
  const [camSourceTypes, setCamSourceTypes] = useState([null, null, null, null]);
  const [isCamPreview, setIsCamPreview] = useState(false);
  const [previewCamIdx, setPreviewCamIdx] = useState(null);
  const [pgmCamUrl, setPgmCamUrl] = useState(null);
  const [pgmCamVolume, setPgmCamVolume] = useState(100);
  const [pgmCamMuted, setPgmCamMuted] = useState(false);
  const [pgmCamIsYoutube, setPgmCamIsYoutube] = useState(false);
  const [materiaAtual, setMateriaAtual] = useState(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [gcVisible, setGcVisible] = useState(false);
  const [gcLine1, setGcLine1] = useState("");
  const [gcLine2, setGcLine2] = useState("");
  const [gcCreditsQueue, setGcCreditsQueue] = useState([]);
  const [gcDuration, setGcDuration] = useState(0);
  const [gcHistory, setGcHistory] = useState([]);
  const [gcPresets, setGcPresets] = useState({
    "Repórter em Campo": { line1: "", line2: "Repórter em Campo" },
    "Âncora": { line1: "", line2: "Âncora" },
    "Especialista": { line1: "", line2: "Especialista" }
  });
  const [tarjaVisible, setTarjaVisible] = useState(false);
  const [tarjaPanelOpen, setTarjaPanelOpen] = useState(false);
  const [tarjaHue, setTarjaHue] = useState(0);
  const [tarjaSaturation, setTarjaSaturation] = useState(100);
  const [tarjaAlpha, setTarjaAlpha] = useState(90);
  const [tarjaX, setTarjaX] = useState(50);
  const [tarjaY, setTarjaY] = useState(85);
  const [tarjaCustomPng, setTarjaCustomPng] = useState(null);
  const [tarjaScaleX, setTarjaScaleX] = useState(100);
  const [tarjaScaleY, setTarjaScaleY] = useState(100);
  const [tarjaScaleLock, setTarjaScaleLock] = useState(true);
  const [tarjaText, setTarjaText] = useState("TARJA");
  const [tarjaFont, setTarjaFont] = useState("sans-serif");
  const [tarjaBold, setTarjaBold] = useState(true);
  const [tarjaItalic, setTarjaItalic] = useState(false);
  const [tarjaPanelPos, setTarjaPanelPos] = useState({ x: 200, y: 200 });
  const tarjaDragRef = useRef(null);
  const tarjaFileInputRef = useRef(null);
  const [meFrames, setMeFrames] = useState([null, null, null, null]);
  const [meActiveFrame, setMeActiveFrame] = useState(null);
  const meFileInputRefs = useRef([null, null, null, null]);
  const handleMeFrameLoad = (id, file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setMeFrames((prev) => {
        const next = [...prev];
        next[id] = reader.result;
        return next;
      });
    };
    reader.readAsDataURL(file);
  };
  const handleMeFrameClick = (id) => {
    if (!meFrames[id]) {
      meFileInputRefs.current[id]?.click();
      return;
    }
    setMeActiveFrame((prev) => {
      const next = prev === id ? null : id;
      if (pgmChannelRef.current?.readyState === 1) {
        pgmChannelRef.current.send(JSON.stringify({
          type: next !== null ? "me_frame_show" : "me_frame_hide",
          frame: next !== null ? meFrames[id] : null
        }));
      }
      return next;
    });
  };
  const handleMeFrameClear = (id, e) => {
    e.stopPropagation();
    setMeFrames((prev) => {
      const next = [...prev];
      next[id] = null;
      return next;
    });
    if (meActiveFrame === id) {
      setMeActiveFrame(null);
      if (pgmChannelRef.current?.readyState === 1) {
        pgmChannelRef.current.send(JSON.stringify({ type: "me_frame_hide" }));
      }
    }
  };
  const [vuLevelL, setVuLevelL] = useState(0);
  const [vuLevelR, setVuLevelR] = useState(0);
  const vuAudioCtxRef = useRef(null);
  const vuSplitterRef = useRef(null);
  const vuAnalyserLRef = useRef(null);
  const vuAnalyserRRef = useRef(null);
  const vuRafRef = useRef(null);
  const [blockRemainingTime, setBlockRemainingTime] = useState(0);
  const [generalJournalTime, setGeneralJournalTime] = useState(0);
  const [doubleClickCount, setDoubleClickCount] = useState(0);
  const [transValue, setTransValue] = useState(0);
  const [playerAOpacity, setPlayerAOpacity] = useState(1);
  const [playerBOpacity, setPlayerBOpacity] = useState(0);
  const [playerAZ, setPlayerAZ] = useState(10);
  const [playerBZ, setPlayerBZ] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [removedLaudaOrdens, setRemovedLaudaOrdens] = useState({});
  const handleItemFinished = useCallback(() => {
    setIsPlaying(false);
    setPgmProgress(100);
    setTimeout(() => {
      setItems((prev) => {
        const finishedIndex = currentIndex - 1;
        if (finishedIndex >= 0 && prev[finishedIndex]) {
          const itemToRemove = prev[finishedIndex];
          const newList = prev.filter((_, idx) => idx !== finishedIndex);
          const newIndex = Math.max(0, currentIndex - 1);
          setCurrentIndex(newIndex);
          setCurrentItemId(newList[newIndex]?.id ?? null);
          toast.success(`"${itemToRemove.assunto}" exibido e removido.`);
          return newList;
        }
        return prev;
      });
    }, 500);
  }, [items, currentIndex]);
  const pgmRemainingTime = pgmFile?.duration ? Math.max(0, pgmFile.duration - pgmCurrentTime) : 0;
  const [activePlayer, setActivePlayer] = useState("A");
  const [clock, setClock] = useState("--:--:--");
  const pvwRef = useRef(null);
  const camVideoRefs = useRef([null, null, null, null]);
  const pgmARef = useRef(null);
  const pgmBRef = useRef(null);
  const pgmCamIframeRef = useRef(null);
  const blobUrlsRef = useRef(/* @__PURE__ */ new Map());
  const WS_URL = "ws://localhost:4242";
  const pgmChannelRef = useRef(null);
  useRef(null);
  useEffect(() => {
    const t = setInterval(() => setClock((/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR", { hour12: false })), 1e3);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const el = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!el) return;
    let ctx = vuAudioCtxRef.current;
    if (!ctx) {
      ctx = new AudioContext();
      vuAudioCtxRef.current = ctx;
    }
    let splitter = vuSplitterRef.current;
    let analyserL = vuAnalyserLRef.current;
    let analyserR = vuAnalyserRRef.current;
    if (!splitter || !analyserL || !analyserR) {
      splitter = ctx.createChannelSplitter(2);
      analyserL = ctx.createAnalyser();
      analyserR = ctx.createAnalyser();
      analyserL.fftSize = 256;
      analyserR.fftSize = 256;
      splitter.connect(analyserL, 0);
      splitter.connect(analyserR, 1);
      vuSplitterRef.current = splitter;
      vuAnalyserLRef.current = analyserL;
      vuAnalyserRRef.current = analyserR;
    }
    try {
      const source = ctx.createMediaElementSource(el);
      source.connect(splitter);
      source.connect(ctx.destination);
    } catch {
    }
    const dataL = new Uint8Array(analyserL.frequencyBinCount);
    const dataR = new Uint8Array(analyserR.frequencyBinCount);
    const tick = () => {
      analyserL.getByteFrequencyData(dataL);
      analyserR.getByteFrequencyData(dataR);
      const avgL = dataL.reduce((a, b) => a + b, 0) / dataL.length;
      const avgR = dataR.reduce((a, b) => a + b, 0) / dataR.length;
      setVuLevelL(Math.min(100, Math.round(avgL / 255 * 100)));
      setVuLevelR(Math.min(100, Math.round(avgR / 255 * 100)));
      vuRafRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      if (vuRafRef.current) cancelAnimationFrame(vuRafRef.current);
    };
  }, [activePlayer, pgmFile]);
  const sendPgmCamCommand = useCallback((func, args = []) => {
    const win = pgmCamIframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(JSON.stringify({ event: "command", func, args }), "*");
  }, []);
  useEffect(() => {
    if (!pgmCamUrl || !pgmCamIsYoutube) return;
    const t = setTimeout(() => {
      sendPgmCamCommand(pgmCamMuted ? "mute" : "unMute");
      sendPgmCamCommand("setVolume", [pgmCamVolume]);
    }, 350);
    return () => clearTimeout(t);
  }, [pgmCamUrl, pgmCamIsYoutube, pgmCamVolume, pgmCamMuted, sendPgmCamCommand]);
  const handleCamOffAir = useCallback(() => {
    if (!pgmCamUrl) return;
    sendPgmCamCommand("stopVideo");
    setPgmCamUrl(null);
    setPgmCamIsYoutube(false);
    setPgmCamMuted(false);
    setPgmCamVolume(100);
    setPgmFile(null);
    setIsPlaying(false);
    if (pgmChannelRef.current?.readyState === 1)
      pgmChannelRef.current.send(JSON.stringify({ type: "cam_off" }));
    toast.info("CAM retirada do ar — vídeo e áudio encerrados");
  }, [pgmCamUrl, sendPgmCamCommand]);
  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(WS_URL);
      pgmChannelRef.current = ws;
      ws.onopen = () => console.log("[WS] Conectado ao relay server");
      ws.onclose = () => {
        console.warn("[WS] Desconectado. Tentando reconectar em 3s...");
        setTimeout(connect, 3e3);
      };
      ws.onerror = (err) => console.error("[WS] Erro:", err);
    };
    connect();
    return () => {
      pgmChannelRef.current?.close();
    };
  }, []);
  useCallback((overrides = {}) => {
    pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({ type: "pgm_state", ...overrides }));
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPlaying) return;
      const activeEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
      if (!activeEl || !activeEl.src) return;
      if (pgmChannelRef.current?.readyState === 1)
        pgmChannelRef.current.send(JSON.stringify({ type: "pgm_sync", currentTime: activeEl.currentTime }));
    }, 2e3);
    return () => clearInterval(interval);
  }, [isPlaying, activePlayer]);
  useEffect(() => () => {
    blobUrlsRef.current.forEach(URL.revokeObjectURL);
  }, []);
  useEffect(() => {
    if (!gcVisible || gcDuration === 0) return;
    const timer = setTimeout(() => setGcVisible(false), gcDuration * 1e3);
    return () => clearTimeout(timer);
  }, [gcVisible, gcDuration]);
  const normalizeText = useCallback((text) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "").trim();
  }, []);
  const getFileName = useCallback((assunto) => {
    if (!assunto) return "";
    const normalized = normalizeText(assunto);
    const found = localFiles.find((f) => {
      const normalizedFile = normalizeText(f.name.replace(/\.(mp4|mov)$/i, ""));
      return normalizedFile === normalized;
    });
    return found?.name || "";
  }, [normalizeText, localFiles]);
  const getFileUrl = useCallback(
    async (assunto) => {
      if (!assunto) return null;
      const fileName = getFileName(assunto);
      if (dirHandle) {
        if (blobUrlsRef.current.has(fileName)) return blobUrlsRef.current.get(fileName);
        try {
          const fh = await dirHandle.getFileHandle(fileName);
          const file = await fh.getFile();
          const url = URL.createObjectURL(file);
          blobUrlsRef.current.set(fileName, url);
          return url;
        } catch {
          return null;
        }
      }
      return `/materias/${fileName}`;
    },
    [dirHandle, getFileName]
  );
  const verifyFiles = useCallback(
    async (itemsToVerify, handle) => {
      const h = handle ?? dirHandle;
      setIsVerifying(true);
      const upd = {};
      await Promise.all(
        itemsToVerify.map(async (item) => {
          const fn = getFileName(item.assunto);
          if (h) {
            try {
              await h.getFileHandle(fn);
              upd[item.id] = true;
            } catch {
              upd[item.id] = false;
            }
          } else {
            try {
              const r = await fetch(`/materias/${fn}`, { method: "HEAD" });
              upd[item.id] = r.ok;
            } catch {
              upd[item.id] = false;
            }
          }
        })
      );
      setFileStatus((prev) => ({ ...prev, ...upd }));
      setIsVerifying(false);
    },
    [dirHandle, getFileName]
  );
  useEffect(() => {
    const autoPreview = async () => {
      if (!selectedFile && items.length > 0 && currentIndex < items.length && items[currentIndex]?.assunto) {
        const url = await getFileUrl(items[currentIndex].assunto);
        if (url && pvwRef.current && pvwRef.current.src !== url) {
          pvwRef.current.src = url;
          pvwRef.current.load();
        }
      }
    };
    autoPreview();
  }, [currentIndex, items, getFileUrl, selectedFile]);
  useEffect(() => {
    if (items.length > 0) verifyFiles(items);
  }, [items, verifyFiles]);
  useEffect(() => {
    if (localFiles.length === 0 || items.length === 0) return;
    const reordered = items.map((item) => {
      const normalizedItem = normalizeText(item.assunto);
      return localFiles.find((f) => {
        const normalizedFile = normalizeText(f.name.replace(/\.(mp4|mov)$/i, ""));
        return normalizedFile === normalizedItem;
      });
    }).filter((f) => f !== void 0);
    const used = new Set(reordered.map((f) => f.name));
    const remaining = localFiles.filter((f) => !used.has(f.name));
    setLocalFiles([...reordered, ...remaining]);
  }, [items, normalizeText]);
  const load = useCallback(async () => {
    const { data: blocks } = await supabase.from("espelho_blocos").select("id, ordem").eq("data_edicao", date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)).ilike("programa", programa || "Jornal da Manhã").order("ordem");
    if (blocks?.length) {
      const { data: rawItens } = await supabase.from("espelho_itens").select("id, bloco_id, assunto, cabeca, tempo, materia_id, ordem, formato").in("bloco_id", blocks.map((b) => b.id));
      const ordenado = [];
      blocks.forEach((bloco) => {
        const itensDoBloco = (rawItens || []).filter((i) => String(i.bloco_id) === String(bloco.id)).sort((a, b) => a.ordem - b.ordem);
        ordenado.push(...itensDoBloco);
      });
      setItems(ordenado);
      if (ordenado.length) verifyFiles(ordenado);
    } else {
      setItems([]);
    }
  }, [date, programa, verifyFiles]);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    const indexMap = {};
    items.forEach((item, idx) => {
      indexMap[item.id] = idx + 1;
    });
    setGlobalItemIndex(indexMap);
  }, [items]);
  useEffect(() => {
    if (currentItemId) {
      const idx = items.findIndex((i) => i.id === currentItemId);
      if (idx !== -1 && idx !== currentIndex) {
        setCurrentIndex(idx);
      }
    }
  }, [items, currentItemId, currentIndex]);
  useEffect(() => {
    const channel = supabase.channel("espelho_sync_playout").on("postgres_changes", { event: "*", schema: "public", table: "espelho_itens" }, () => {
      load();
    }).on("postgres_changes", { event: "*", schema: "public", table: "espelho_blocos" }, () => {
      load();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);
  useEffect(() => {
    if (materiaAtual?.itensLauda?.length === 0) {
      console.log("🧹 LAUDA VAZIA - Limpando cache de créditos...");
      setGcCreditsQueue([]);
      setGcLine1("");
      setGcLine2("");
      if (gcVisible) setGcVisible(false);
    }
  }, [materiaAtual?.itensLauda?.length]);
  const scanLocalFiles = useCallback(async (handle) => {
    setIsScanningFiles(true);
    setLocalFiles([]);
    const found = [];
    for await (const [name, entry] of handle.entries()) {
      if (entry.kind === "file" && (name.endsWith(".mp4") || name.endsWith(".mov"))) {
        const fileHandle = entry;
        const file = await fileHandle.getFile();
        const codec = await detectCodec(file);
        const sizeMB = file.size / 1024 / 1024;
        const blobUrl = URL.createObjectURL(file);
        const duration = await getVideoDuration(blobUrl);
        found.push({
          name,
          codec,
          sizeMB: Math.round(sizeMB * 100) / 100,
          lastModified: new Date(file.lastModified).toLocaleString("pt-BR"),
          blobUrl,
          duration
        });
      }
    }
    if (items.length > 0) {
      const reordered = items.map((item) => {
        const normalizedItem = normalizeText(item.assunto);
        return found.find((f) => {
          const normalizedFile = normalizeText(f.name.replace(/\.(mp4|mov)$/i, ""));
          return normalizedFile === normalizedItem;
        });
      }).filter((f) => f !== void 0);
      const used = new Set(reordered.map((f) => f.name));
      const remaining = found.filter((f) => !used.has(f.name));
      setLocalFiles([...reordered, ...remaining]);
    } else {
      setLocalFiles(found);
    }
    setIsScanningFiles(false);
  }, [items, normalizeText]);
  const handleSelectDir = async () => {
    if (typeof window === "undefined" || !window.showDirectoryPicker) {
      toast.error(
        "Seu navegador não suporta a seleção de pastas ou o site não está em HTTPS. Certifique-se de usar Chrome ou Edge e acessar via HTTPS ou localhost."
      );
      return;
    }
    try {
      const handle = await window.showDirectoryPicker({ mode: "read" });
      setDirHandle(handle);
      setIsDirReady(true);
      setShowWelcomeModal(false);
      await scanLocalFiles(handle);
      toast.success("Pasta vinculada com sucesso!");
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Erro ao selecionar pasta:", err);
      toast.error("Erro ao selecionar pasta");
    }
  };
  const preloadInactivePlayer = useCallback((blobUrl, currentActivePlayer) => {
    const inactiveEl = currentActivePlayer === "A" ? pgmBRef.current : pgmARef.current;
    if (!inactiveEl) return;
    inactiveEl.pause();
    inactiveEl.src = blobUrl;
    inactiveEl.muted = true;
    inactiveEl.preload = "auto";
    const onReady = () => {
      inactiveEl.pause();
      inactiveEl.currentTime = 0;
      inactiveEl.muted = false;
      inactiveEl.removeEventListener("canplay", onReady);
    };
    inactiveEl.addEventListener("canplay", onReady);
    inactiveEl.load();
  }, []);
  const handleSelectFile = (file) => {
    setSelectedFile(file);
    if (pvwRef.current) {
      pvwRef.current.src = file.blobUrl;
      pvwRef.current.load();
    }
    preloadInactivePlayer(file.blobUrl, activePlayer);
  };
  const sendCamToPreview = (camIndex) => {
    const camEl = camVideoRefs.current[camIndex];
    const pvw = pvwRef.current;
    if (!pvw) return;
    if (!camEl || !camEl.src) {
      setIsCamPreview(true);
      setPreviewCamIdx(camIndex);
      setSelectedFile(null);
      return;
    }
    const src = camEl.src;
    const time = camEl.currentTime;
    if (pvw.src !== src) {
      pvw.src = src;
      pvw.load();
      pvw.addEventListener("loadedmetadata", () => {
        pvw.currentTime = time;
        pvw.play().catch(() => {
        });
      }, { once: true });
    } else {
      pvw.currentTime = time;
    }
    setIsCamPreview(true);
    setPreviewCamIdx(camIndex);
    setSelectedFile(null);
  };
  const handleSelectFromPlaylist = async (assunto) => {
    const url = await getFileUrl(assunto);
    if (url && pvwRef.current && pvwRef.current.src !== url) {
      pvwRef.current.src = url;
      pvwRef.current.load();
    }
    const expectedFileName = getFileName(assunto);
    const file = localFiles.find((f) => f.name === expectedFileName);
    if (file) {
      setSelectedFile(file);
      preloadInactivePlayer(file.blobUrl, activePlayer);
    }
  };
  const [dragOverLauda, setDragOverLauda] = useState(false);
  const [draggedFromLauda, setDraggedFromLauda] = useState(null);
  const [draggedLaudaIndex, setDraggedLaudaIndex] = useState(null);
  const handleReorderLauda = (fromIndex, toIndex) => {
    if (!materiaAtual) return;
    const novaLauda = [...materiaAtual.itensLauda];
    const [removed] = novaLauda.splice(fromIndex, 1);
    novaLauda.splice(toIndex, 0, removed);
    setMateriaAtual((prev) => prev ? { ...prev, itensLauda: novaLauda } : null);
  };
  const handleDropNaLauda = async (item) => {
    setDragOverLauda(false);
    console.log("🎬 DEBUG: VT arrastado para LAUDA", { item, materia_id: item.materia_id });
    if (!item.materia_id) {
      toast.error("❌ Este item não tem matéria vinculada.");
      console.warn("⚠️ materia_id vazio:", item);
      return;
    }
    try {
      console.log("🔍 Buscando matéria com ID:", item.materia_id);
      const { data, error } = await supabase.from("materias").select("id, titulo, editor_texto, editor_imagem, credito_reporter, estrutura").eq("id", item.materia_id).single();
      if (error) {
        console.error("❌ Erro ao buscar matéria:", error);
        toast.error(`❌ Erro ao buscar: ${error.message}`);
        return;
      }
      if (!data) {
        console.error("❌ Matéria não encontrada com ID:", item.materia_id);
        toast.error("❌ Matéria não encontrada no banco.");
        return;
      }
      console.log("✅ Matéria encontrada:", data);
      console.log("📄 Estrutura/Lauda:", data.estrutura);
      const { sonoras, passagens, producao, itensLauda } = parsarSonorasEPassagens(data.estrutura);
      console.log("📋 Itens parseados:", { sonoras, passagens, producao, itensLauda });
      setGcLine1("");
      setGcLine2("");
      setGcCreditsQueue([]);
      setGcVisible(false);
      setRemovedLaudaOrdens((prev) => {
        const novo = { ...prev };
        delete novo[data.id];
        return novo;
      });
      const creditsList = [];
      if (data.editor_texto) creditsList.push({ line1: data.editor_texto, line2: "ED. TEXTO" });
      if (data.editor_imagem) creditsList.push({ line1: data.editor_imagem, line2: "ED. IMAGEM" });
      if (data.credito_reporter) creditsList.push({ line1: data.credito_reporter, line2: "REPÓRTER" });
      console.log("📋 Créditos carregados:", { editor_texto: data.editor_texto, editor_imagem: data.editor_imagem, credito_reporter: data.credito_reporter, creditsList });
      setGcCreditsQueue(creditsList);
      if (creditsList.length > 0) {
        setGcLine1(creditsList[0].line1);
        setGcLine2(creditsList[0].line2);
      }
      setMateriaAtual({
        materia_id: data.id,
        titulo: data.titulo,
        editor_texto: data.editor_texto,
        editor_imagem: data.editor_imagem,
        credito_reporter: data.credito_reporter,
        sonoras,
        passagens,
        producao,
        itensLauda
      });
      console.log("✅ LAUDA carregada com", itensLauda.length, "itens");
      toast.success(`✅ Lauda carregada: ${data.titulo} (${itensLauda.length} itens)`);
    } catch (err) {
      console.error("❌ Erro ao carregar créditos:", err);
      toast.error(`❌ Erro: ${err instanceof Error ? err.message : "Desconhecido"}`);
    }
  };
  const handlePlayPausePgm = async () => {
    if (!pgmFile) return;
    const pgmVideoEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!pgmVideoEl) return;
    try {
      if (isPlaying) {
        pgmVideoEl.pause();
        setIsPlaying(false);
        pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({ type: "pgm_pause", currentTime: pgmVideoEl.currentTime }));
      } else {
        await pgmVideoEl.play();
        setIsPlaying(true);
        pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({ type: "pgm_play", currentTime: pgmVideoEl.currentTime }));
      }
    } catch (err) {
      toast.error("Erro ao reproduzir vídeo");
    }
  };
  const handleStop = () => {
    const pgmVideoEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!pgmVideoEl) return;
    pgmVideoEl.pause();
    pgmVideoEl.currentTime = 0;
    setIsPlaying(false);
    setPgmProgress(0);
    setPgmCurrentTime(0);
    pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({ type: "pgm_stop" }));
  };
  const handleCue = () => {
    const pgmVideoEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!pgmVideoEl) return;
    pgmVideoEl.currentTime = 0;
    setPgmProgress(0);
    setPgmCurrentTime(0);
  };
  const handleTake = () => {
    if (isCamPreview && previewCamIdx !== null) {
      const srcType = camSourceTypes[previewCamIdx];
      const rawUrl = camSources[previewCamIdx];
      const camEl = camVideoRefs.current[previewCamIdx];
      const camNum = previewCamIdx + 1;
      if (srcType === "url" && rawUrl) {
        const { url: embedUrl, isYoutube } = buildCamEmbedUrl(rawUrl, { mute: false, enableApi: true });
        if (pgmCamUrl) sendPgmCamCommand("stopVideo");
        setPgmCamUrl(embedUrl);
        setPgmCamIsYoutube(isYoutube);
        setPgmCamVolume(100);
        setPgmCamMuted(false);
        setIsPlaying(true);
        const camFile = { name: `CAM ${camNum}`, sizeMB: 0, lastModified: "", codec: "H.264", blobUrl: "", duration: null };
        setPgmFile(camFile);
        toast.success(`CAM ${camNum} → PROGRAM`);
      } else if (srcType === "file" && camEl && camEl.src) {
        const src = camEl.src;
        const time = camEl.currentTime;
        const aEl2 = pgmARef.current;
        const bEl2 = pgmBRef.current;
        if (aEl2) {
          if (pgmCamUrl) sendPgmCamCommand("stopVideo");
          if (bEl2) {
            bEl2.pause();
            bEl2.src = "";
          }
          setPgmCamUrl(null);
          setPgmCamIsYoutube(false);
          setPgmCamMuted(false);
          setPgmCamVolume(100);
          aEl2.src = src;
          aEl2.load();
          aEl2.addEventListener("loadedmetadata", () => {
            aEl2.currentTime = time;
            aEl2.muted = false;
            aEl2.volume = 1;
            aEl2.play().catch(() => {
            });
          }, { once: true });
          setPlayerAOpacity(1);
          setPlayerAZ(10);
          setPlayerBOpacity(0);
          setPlayerBZ(0);
          setActivePlayer("A");
          setIsPlaying(true);
          const camFile = { name: `CAM ${camNum}`, sizeMB: 0, lastModified: "", codec: "H.264", blobUrl: src, duration: camEl.duration || null };
          setPgmFile(camFile);
          toast.success(`CAM ${camNum} → PROGRAM`);
        }
      }
      if (pgmChannelRef.current?.readyState === 1)
        pgmChannelRef.current.send(JSON.stringify({ type: "cam_pgm", cam: camNum }));
      return;
    }
    if (!selectedFile) {
      toast.error("Selecione um arquivo no preview");
      return;
    }
    if (pgmCamUrl) sendPgmCamCommand("stopVideo");
    setPgmCamUrl(null);
    setPgmCamIsYoutube(false);
    setPgmCamMuted(false);
    setPgmCamVolume(100);
    setPgmFile(selectedFile);
    const aEl = pgmARef.current;
    const bEl = pgmBRef.current;
    if (aEl) {
      aEl.src = selectedFile.blobUrl;
      aEl.load();
    }
    if (bEl) {
      bEl.pause();
      bEl.src = "";
    }
    setPlayerAOpacity(1);
    setPlayerAZ(10);
    setPlayerBOpacity(0);
    setPlayerBZ(0);
    setActivePlayer("A");
    setPgmProgress(0);
    setPgmCurrentTime(0);
    setIsPlaying(false);
    if (pgmChannelRef.current?.readyState === 1)
      pgmChannelRef.current.send(JSON.stringify({ type: "pgm_take", fileName: selectedFile.name }));
    toast.success(`"${selectedFile.name}" enviado para o ar!`);
  };
  const applyTransOpacity = useCallback((value, currentActivePlayer = "A") => {
    const incomingOpacity = value / 100;
    const outgoingOpacity = 1 - incomingOpacity;
    if (currentActivePlayer === "A") {
      setPlayerAOpacity(outgoingOpacity);
      setPlayerBOpacity(incomingOpacity);
    } else {
      setPlayerBOpacity(outgoingOpacity);
      setPlayerAOpacity(incomingOpacity);
    }
  }, []);
  const handleTransition = () => {
    if (!selectedFile) {
      toast.error("Selecione um arquivo no preview");
      return;
    }
    const inactiveEl = activePlayer === "A" ? pgmBRef.current : pgmARef.current;
    if (inactiveEl) {
      if (!inactiveEl.src || inactiveEl.src === window.location.href) {
        inactiveEl.src = selectedFile.blobUrl;
        inactiveEl.load();
      }
      inactiveEl.currentTime = 0;
      if (activePlayer === "A") {
        setPlayerBOpacity(0);
        setPlayerBZ(0);
      } else {
        setPlayerAOpacity(0);
        setPlayerAZ(0);
      }
      inactiveEl.play().catch(() => {
      });
    }
  };
  const handleTransComplete = () => {
    if (!selectedFile) return;
    setPgmFile(selectedFile);
    const activeEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    activePlayer === "A" ? pgmBRef.current : pgmARef.current;
    const nextPlayer = activePlayer === "A" ? "B" : "A";
    if (activeEl) {
      activeEl.pause();
      activeEl.src = "";
    }
    if (nextPlayer === "B") {
      setPlayerAOpacity(0);
      setPlayerAZ(0);
      setPlayerBOpacity(1);
      setPlayerBZ(10);
    } else {
      setPlayerBOpacity(0);
      setPlayerBZ(0);
      setPlayerAOpacity(1);
      setPlayerAZ(10);
    }
    setActivePlayer(nextPlayer);
    setIsPlaying(true);
    setTransValue(0);
    if (pgmChannelRef.current?.readyState === 1)
      pgmChannelRef.current.send(JSON.stringify({ type: "pgm_take", fileName: selectedFile.name }));
    toast.success(`Fusão concluída: "${selectedFile.name}"`);
  };
  const handleSkip = () => {
    if (currentIndex < items.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentItemId(items[nextIndex]?.id ?? null);
    } else {
      toast.warning("Fim da playlist");
    }
  };
  const handleSeek = (e) => {
    const pgmVideoEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!pgmVideoEl || !pgmFile?.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * pgmFile.duration;
    pgmVideoEl.currentTime = time;
    setPgmCurrentTime(time);
    setPgmProgress(percent * 100 % 100);
  };
  const h264Count = localFiles.filter((f) => f.codec === "H.264").length;
  localFiles.filter((f) => f.codec !== "H.264").length;
  const totalSizeMB = localFiles.reduce((sum, f) => sum + f.sizeMB, 0);
  const handleGcTake = () => {
    setGcVisible(true);
    pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({ type: "gc_show", line1: gcLine1, line2: gcLine2 }));
    if (gcLine1 || gcLine2) {
      setGcHistory((prev) => [{ line1: gcLine1, line2: gcLine2 }, ...prev].slice(0, 2));
    }
    if (gcCreditsQueue.length > 0) {
      const novaFila = gcCreditsQueue.slice(1);
      setGcCreditsQueue(novaFila);
      if (novaFila.length > 0) {
        setGcLine1(novaFila[0].line1);
        setGcLine2(novaFila[0].line2);
      } else {
        setGcLine1("");
        setGcLine2("");
        toast.success("✓ Todos os créditos foram exibidos!");
      }
    }
  };
  const handleGcClear = () => {
    setGcVisible(false);
    setGcLine1("");
    setGcLine2("");
    setGcCreditsQueue([]);
    pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({ type: "gc_hide" }));
  };
  const handleGcSkip = () => {
    if (gcCreditsQueue.length === 0) return;
    const novaFila = gcCreditsQueue.slice(1);
    setGcCreditsQueue(novaFila);
    if (novaFila.length > 0) {
      setGcLine1(novaFila[0].line1);
      setGcLine2(novaFila[0].line2);
      toast("⏭ Crédito pulado");
    } else {
      setGcLine1("");
      setGcLine2("");
      toast("⏭ Fila de créditos esvaziada");
    }
  };
  const handleApplyPreset = (presetName) => {
    const preset = gcPresets[presetName];
    if (preset) {
      setGcLine1(preset.line1);
      setGcLine2(preset.line2);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 text-white flex flex-col overflow-hidden font-sans", style: { backgroundColor: "#121212", color: "white" }, children: [
    showWelcomeModal && !isDirReady && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "border rounded-2xl p-8 flex flex-col items-center gap-6 w-[420px]", style: { backgroundColor: "#1a1a1a", borderColor: "#00E676" }, children: [
      /* @__PURE__ */ jsx("div", { className: "p-3 rounded-xl", style: { backgroundColor: "#00E67620" }, children: /* @__PURE__ */ jsx(MonitorPlay, { className: "h-8 w-8", style: { color: "#00E676" } }) }),
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold tracking-tight text-white", children: "DeskNews Exibição" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-400 mt-2", children: "Selecione a pasta onde estão os VTs para iniciar o playout." })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleSelectDir,
          disabled: isScanningFiles,
          className: "flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-300 active:scale-[0.98] w-full justify-center text-black",
          style: { backgroundColor: "#00E676" },
          children: [
            /* @__PURE__ */ jsx(FolderOpen, { className: "h-5 w-5" }),
            "Vincular Pasta de VTs"
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowWelcomeModal(false),
          className: "text-xs text-zinc-500 hover:text-zinc-300 uppercase tracking-widest transition-colors",
          children: "Pular por agora"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs("header", { className: "h-14 border-b flex items-center justify-between px-4 shrink-0 relative z-30", style: { backgroundColor: "#1a1a1a", borderColor: "#2a2a2a" }, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-1.5 rounded-lg", style: { backgroundColor: "#00E67615" }, children: /* @__PURE__ */ jsx(MonitorPlay, { className: "h-4 w-4", style: { color: "#00E676" } }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-sm font-black tracking-[0.2em] uppercase", style: { color: "#00E676" }, children: "DESKNEWS" }),
        isDirReady && dirHandle && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 px-2 py-0.5 rounded-full border ml-1", style: { backgroundColor: "#00E67610", borderColor: "#00E67630" }, children: [
          /* @__PURE__ */ jsx(FolderOpen, { className: "h-2.5 w-2.5", style: { color: "#00E676" } }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase font-semibold", style: { color: "#00E676" }, children: dirHandle.name })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-10 pointer-events-none", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-0.5", children: "Bloco" }),
          /* @__PURE__ */ jsx("div", { className: "text-[28px] font-mono font-bold tabular-nums leading-none text-zinc-500", children: formatDuration(blockRemainingTime) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[8px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-0.5", children: "VT" }),
          /* @__PURE__ */ jsx("div", { className: cn(
            "text-[28px] font-mono font-bold tabular-nums leading-none tracking-tighter transition-colors duration-300",
            pgmRemainingTime <= 5 ? "text-red-500 animate-pulse" : pgmRemainingTime <= 10 ? "text-red-500" : ""
          ), style: { color: pgmRemainingTime > 10 ? "#00E676" : void 0 }, children: formatDuration(pgmRemainingTime) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-0.5", children: "Jornal" }),
          /* @__PURE__ */ jsx("div", { className: "text-[28px] font-mono font-bold tabular-nums leading-none text-zinc-500", children: formatDuration(generalJournalTime) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleSelectDir,
            disabled: isScanningFiles,
            className: cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all active:scale-[0.98]",
              isDirReady ? "border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500" : "animate-pulse text-black font-bold"
            ),
            style: !isDirReady ? { backgroundColor: "#00E676", borderColor: "#00E676" } : { backgroundColor: "transparent" },
            children: [
              /* @__PURE__ */ jsx(FolderOpen, { className: "h-3 w-3" }),
              isDirReady ? "TROCAR" : "VINCULAR"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => verifyFiles(items),
            disabled: isVerifying,
            className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-all active:scale-[0.98]",
            children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: cn("h-3 w-3", isVerifying && "animate-spin") }),
              "IMP."
            ]
          }
        ),
        isDirReady && dirHandle && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => scanLocalFiles(dirHandle),
            disabled: isScanningFiles,
            className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all active:scale-[0.98]",
            style: { borderColor: "#00E67640", color: "#00E676", backgroundColor: "#00E67610" },
            children: [
              /* @__PURE__ */ jsx(Film, { className: cn("h-3 w-3", isScanningFiles && "animate-spin") }),
              isScanningFiles ? "SCAN..." : "SCAN"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "pl-3 border-l border-zinc-800 ml-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[9px] text-zinc-600 font-bold uppercase tracking-widest block", children: "ON AIR" }),
          /* @__PURE__ */ jsx("span", { className: "text-base font-mono font-bold tabular-nums leading-none", style: { color: "#00E676" }, children: clock })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "w-[260px] shrink-0 border-r flex flex-col overflow-hidden", style: { backgroundColor: "#181818", borderColor: "#2a2a2a" }, children: [
        /* @__PURE__ */ jsxs("div", { className: "px-3 py-2.5 border-b flex items-center justify-between", style: { backgroundColor: "#1f1f1f", borderColor: "#2a2a2a" }, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-[10px] font-black uppercase tracking-widest text-zinc-400", children: "VTs do Jornal" }),
            /* @__PURE__ */ jsxs("p", { className: "text-[9px] text-zinc-600 mt-0.5", children: [
              items.length,
              " matérias · ",
              localFiles.length,
              " arquivos"
            ] })
          ] }),
          localFiles.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-0.5 text-[9px] font-mono", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", style: { color: "#00E676" }, children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-2.5 w-2.5" }),
              h264Count,
              " H.264"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-zinc-600 flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(HardDrive, { className: "h-2.5 w-2.5" }),
              (totalSizeMB / 1024).toFixed(1),
              "GB"
            ] })
          ] })
        ] }),
        localFiles.length > 0 && /* @__PURE__ */ jsxs("div", { className: "border-b", style: { borderColor: "#2a2a2a" }, children: [
          /* @__PURE__ */ jsx("div", { className: "px-3 py-1.5", style: { backgroundColor: "#1f1f1f" }, children: /* @__PURE__ */ jsx("span", { className: "text-[9px] text-zinc-500 font-black uppercase tracking-widest", children: "PASTA LOCAL" }) }),
          /* @__PURE__ */ jsx("div", { className: "overflow-y-auto", style: { maxHeight: "36vh" }, children: localFiles.map((f) => {
            const isSelected = selectedFile?.name === f.name;
            const isOnAir = pgmFile?.name === f.name;
            const isH264 = f.codec === "H.264";
            return /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => handleSelectFile(f),
                className: cn(
                  "w-full text-left px-3 py-2 border-b border-white/[0.03] transition-all flex items-center gap-2",
                  isOnAir ? "border-l-2" : isSelected ? "border-l-2" : "border-l-2 border-l-transparent"
                ),
                style: {
                  backgroundColor: isOnAir ? "#ff000015" : isSelected ? "#00E67610" : "transparent",
                  borderLeftColor: isOnAir ? "#ef4444" : isSelected ? "#00E676" : "transparent"
                },
                children: [
                  /* @__PURE__ */ jsx("div", { className: "shrink-0", children: isOnAir ? /* @__PURE__ */ jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" }) : isSelected ? /* @__PURE__ */ jsx("div", { className: "h-1.5 w-1.5 rounded-full", style: { backgroundColor: "#00E676" } }) : /* @__PURE__ */ jsx(Film, { className: cn("h-3 w-3", isH264 ? "text-zinc-600" : "text-yellow-500") }) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsx(
                      "p",
                      {
                        className: "text-[10px] font-mono truncate leading-tight",
                        style: { color: isOnAir ? "#ef4444" : isSelected ? "#00E676" : "#e4e4e7" },
                        children: f.name.replace(".mp4", "")
                      }
                    ),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mt-0.5", children: [
                      /* @__PURE__ */ jsx("span", { className: cn("text-[8px] px-1 py-0 rounded border font-bold uppercase", codecBadgeClass(f.codec)), children: f.codec === "Verificando..." ? "..." : f.codec }),
                      /* @__PURE__ */ jsxs("span", { className: "text-[9px] text-zinc-600 font-mono", children: [
                        formatDuration(f.duration),
                        " · ",
                        f.sizeMB,
                        "MB"
                      ] })
                    ] })
                  ] }),
                  isOnAir && /* @__PURE__ */ jsx("span", { className: "shrink-0 text-[8px] text-red-500 font-bold uppercase animate-pulse", children: "AR" })
                ]
              },
              f.name
            );
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "px-3 py-1.5 border-b", style: { backgroundColor: "#1f1f1f", borderColor: "#2a2a2a" }, children: /* @__PURE__ */ jsx("span", { className: "text-[9px] text-zinc-500 font-black uppercase tracking-widest", children: "ESPELHO — FILA DO DIA" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto", children: [
            /* @__PURE__ */ jsx("table", { className: "w-full text-left text-zinc-400", children: /* @__PURE__ */ jsx("tbody", { className: "text-xs font-mono divide-y divide-white/5", children: items.map((item, idx) => {
              const isOnAir = idx === currentIndex - 1;
              const isNext = idx === currentIndex;
              const isDone = idx < currentIndex - 1;
              const exists = fileStatus[item.id];
              const expectedFileName = getFileName(item.assunto);
              localFiles.find((f) => f.name === expectedFileName);
              const handleDeleteItem = (e) => {
                e.stopPropagation();
                setItems((prev) => prev.filter((_, i) => i !== idx));
                if (currentIndex > idx) {
                  setCurrentIndex((prev) => Math.max(0, prev - 1));
                }
                toast.info(`"${item.assunto}" removido da fila`);
              };
              return /* @__PURE__ */ jsxs(
                "tr",
                {
                  draggable: true,
                  onDragStart: (e) => {
                    e.dataTransfer.setData("materia_id", item.materia_id || "");
                    e.dataTransfer.setData("item_index", String(idx));
                    e.dataTransfer.setData("drag_source", "espelho");
                    e.dataTransfer.effectAllowed = "move";
                  },
                  onDragOver: (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  },
                  onDrop: (e) => {
                    e.preventDefault();
                    const source = e.dataTransfer.getData("drag_source");
                    if (source === "espelho") {
                      const fromIdx = Number(e.dataTransfer.getData("item_index"));
                      if (fromIdx !== idx) {
                        setItems((prevItems) => {
                          const novaOrdem = [...prevItems];
                          const [draggedItem] = novaOrdem.splice(fromIdx, 1);
                          novaOrdem.splice(idx, 0, draggedItem);
                          return novaOrdem;
                        });
                      }
                    }
                  },
                  onClick: () => handleSelectFromPlaylist(item.assunto),
                  className: cn(
                    "transition-colors duration-200 cursor-grab active:cursor-grabbing group",
                    isDone && "opacity-30"
                  ),
                  style: { backgroundColor: isOnAir ? "#ff000010" : void 0 },
                  children: [
                    /* @__PURE__ */ jsx("td", { className: "px-2 py-2 w-12 text-center font-bold", children: isOnAir ? /* @__PURE__ */ jsx("span", { className: "text-red-500 animate-pulse text-[9px]", children: "● AR" }) : isNext ? /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold", style: { color: "#00E676" }, children: "NEXT" }) : /* @__PURE__ */ jsx("span", { className: "text-zinc-600 text-[9px]", children: globalItemIndex[item.id] || idx + 1 }) }),
                    /* @__PURE__ */ jsx("td", { className: "px-1 py-2 w-6 text-center", children: exists ? /* @__PURE__ */ jsx(FileCheck, { className: "h-3 w-3 mx-auto", style: { color: "#00E676" } }) : /* @__PURE__ */ jsx(FileX, { className: "h-3 w-3 text-red-500 mx-auto" }) }),
                    /* @__PURE__ */ jsx("td", { className: cn("px-2 py-2 font-bold text-[10px]", isOnAir ? "text-white" : "text-zinc-400"), children: item.assunto }),
                    /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-right text-zinc-600 text-[9px]", children: item.tempo || "0:00" }),
                    /* @__PURE__ */ jsx("td", { className: "px-2 py-2 text-right text-[9px]", children: /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: handleDeleteItem,
                        className: "text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 font-bold",
                        title: "Remover da fila",
                        children: "✕"
                      }
                    ) })
                  ]
                },
                item.id
              );
            }) }) }),
            items.length === 0 && /* @__PURE__ */ jsx("div", { className: "px-3 py-8 text-center text-zinc-600 text-xs italic", children: "Nenhuma matéria publicada para hoje." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col overflow-y-auto p-3 gap-3", style: { backgroundColor: "#121212" }, children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx("div", { className: "h-1.5 w-1.5 rounded-full", style: { backgroundColor: "#00E676" } }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest", style: { color: "#00E676" }, children: "Preview" })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-[9px] font-mono text-zinc-600 truncate max-w-[120px]", children: selectedFile ? selectedFile.name.replace(".mp4", "") : "Nenhum arquivo" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative aspect-video bg-black rounded-lg overflow-hidden border", style: { borderColor: isCamPreview ? "#f97316" : "#00E67630" }, children: [
              /* @__PURE__ */ jsx(
                "video",
                {
                  ref: pvwRef,
                  className: "w-full h-full object-contain",
                  muted: true,
                  playsInline: true,
                  preload: "metadata",
                  style: { display: isCamPreview && previewCamIdx !== null && camSourceTypes[previewCamIdx] === "url" ? "none" : "block" }
                }
              ),
              isCamPreview && previewCamIdx !== null && camSourceTypes[previewCamIdx] === "url" && camSources[previewCamIdx] && (() => {
                const rawUrl = camSources[previewCamIdx];
                const { url: embedUrl } = buildCamEmbedUrl(rawUrl, { mute: true });
                return /* @__PURE__ */ jsx(
                  "iframe",
                  {
                    src: embedUrl,
                    className: "absolute inset-0 w-full h-full",
                    allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
                    allowFullScreen: true,
                    style: { border: "none" }
                  },
                  embedUrl
                );
              })(),
              isCamPreview && previewCamIdx !== null && camSourceTypes[previewCamIdx] === "url" && /* @__PURE__ */ jsxs("div", { className: "absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/70 text-zinc-400 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest z-10 pointer-events-none", children: [
                /* @__PURE__ */ jsx(VolumeX, { className: "h-2.5 w-2.5" }),
                " mudo"
              ] }),
              isCamPreview && previewCamIdx !== null && /* @__PURE__ */ jsxs("div", { className: "absolute top-1.5 left-1.5 bg-orange-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest z-10 pointer-events-none", children: [
                "CAM ",
                previewCamIdx + 1
              ] }),
              !selectedFile && !isCamPreview && /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-700", children: [
                /* @__PURE__ */ jsx(Film, { className: "h-7 w-7" }),
                /* @__PURE__ */ jsx("span", { className: "text-[9px] uppercase tracking-widest", children: "Clique em um VT H.264" })
              ] }),
              selectedFile && /* @__PURE__ */ jsx("div", { className: "absolute top-1.5 left-1.5", children: /* @__PURE__ */ jsx("span", { className: cn("text-[8px] font-bold px-1 py-0.5 rounded border uppercase", codecBadgeClass(selectedFile.codec)), children: selectedFile.codec === "Verificando..." ? "..." : selectedFile.codec }) }),
              selectedFile?.duration && /* @__PURE__ */ jsx("div", { className: "absolute bottom-1.5 right-1.5 text-[9px] font-mono text-zinc-400 bg-black/70 px-1 py-0.5 rounded", children: formatDuration(selectedFile.duration) }),
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 bg-black/50", children: /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: handleTake,
                  className: "text-black font-bold text-sm px-6 py-2 rounded-xl transition-all active:scale-[0.98]",
                  style: { backgroundColor: "#00E676" },
                  children: "TAKE"
                }
              ) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx("div", { className: cn("h-1.5 w-1.5 rounded-full bg-red-500", isPlaying && "animate-pulse") }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-red-500", children: "Program" })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-[9px] font-mono text-zinc-600 truncate max-w-[120px]", children: pgmFile ? pgmFile.name.replace(".mp4", "") : "IDLE" })
            ] }),
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: "relative aspect-video bg-black rounded-lg overflow-hidden border-2",
                style: {
                  borderColor: meActiveFrame !== null ? "#00E676" : isPlaying ? "#ef4444" : "#ef444430",
                  boxShadow: meActiveFrame !== null ? "0 0 20px rgba(0,230,118,0.5)" : isPlaying ? "0 0 20px rgba(239,68,68,0.2)" : "none"
                },
                children: [
                  /* @__PURE__ */ jsx(
                    "video",
                    {
                      ref: pgmARef,
                      className: "absolute inset-0 w-full h-full object-contain transition-opacity duration-300",
                      style: { opacity: playerAOpacity, zIndex: playerAZ },
                      playsInline: true,
                      preload: "auto",
                      onTimeUpdate: (e) => {
                        const el = e.currentTarget;
                        setPgmCurrentTime(el.currentTime);
                        if (el.duration) setPgmProgress(el.currentTime / el.duration * 100);
                      },
                      onEnded: handleItemFinished
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "video",
                    {
                      ref: pgmBRef,
                      className: "absolute inset-0 w-full h-full object-contain transition-opacity duration-300",
                      style: { opacity: playerBOpacity, zIndex: playerBZ },
                      playsInline: true,
                      preload: "auto",
                      onTimeUpdate: (e) => {
                        if (activePlayer !== "B") return;
                        const el = e.currentTarget;
                        setPgmCurrentTime(el.currentTime);
                        if (el.duration) setPgmProgress(el.currentTime / el.duration * 100);
                      },
                      onEnded: () => {
                        if (activePlayer !== "B") return;
                        handleItemFinished();
                      }
                    }
                  ),
                  pgmCamUrl && /* @__PURE__ */ jsx(
                    "iframe",
                    {
                      ref: pgmCamIframeRef,
                      src: pgmCamUrl,
                      className: "absolute inset-0 w-full h-full",
                      allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
                      allowFullScreen: true,
                      style: { border: "none", zIndex: 5 }
                    },
                    pgmCamUrl
                  ),
                  !pgmFile && !pgmCamUrl && /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-700", children: [
                    /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-red-900" }),
                    /* @__PURE__ */ jsx("span", { className: "text-[9px] uppercase tracking-widest", children: "IDLE" })
                  ] }),
                  isPlaying && /* @__PURE__ */ jsxs("div", { className: "absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase animate-pulse", children: [
                    /* @__PURE__ */ jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-white animate-pulse" }),
                    " NO AR"
                  ] }),
                  pgmFile && items[currentIndex - 1]?.cabeca && /* @__PURE__ */ jsx("div", { className: "absolute bottom-4 left-4 right-4 z-30", children: /* @__PURE__ */ jsxs("div", { className: "bg-black/90 border-l-4 border-red-600 px-3 py-1.5", children: [
                    "//",
                    /* @__PURE__ */ jsx("div", { className: "text-[9px] text-zinc-400", children: items[currentIndex - 1]?.assunto })
                  ] }) }),
                  gcVisible && (gcLine1 || gcLine2) && /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 right-0 z-40 px-2 pb-2 animate-in slide-in-from-bottom duration-300", children: /* @__PURE__ */ jsxs("div", { className: "flex items-stretch overflow-hidden rounded", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-1 bg-red-600 shrink-0" }),
                    /* @__PURE__ */ jsxs("div", { className: "bg-black/90 px-2 py-1.5 flex-1 min-w-0", children: [
                      gcLine1 && /* @__PURE__ */ jsx("div", { className: "text-white font-bold text-[10px] uppercase tracking-wide leading-tight truncate", children: gcLine1 }),
                      gcLine2 && /* @__PURE__ */ jsx("div", { className: "text-zinc-400 text-[8px] uppercase tracking-widest truncate mt-0.5", children: gcLine2 })
                    ] })
                  ] }) }),
                  tarjaVisible && /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "absolute z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none",
                      style: { left: `${tarjaX}%`, top: `${tarjaY}%` },
                      children: tarjaCustomPng ? /* @__PURE__ */ jsx(
                        "img",
                        {
                          src: tarjaCustomPng,
                          alt: "Tarja",
                          style: { opacity: tarjaAlpha / 100, width: `${tarjaScaleX * 1.2}px`, height: `${tarjaScaleY * 0.4}px`, objectFit: "contain" }
                        }
                      ) : /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: "px-3 py-1 rounded-sm shadow-lg",
                          style: {
                            backgroundColor: `hsla(${tarjaHue},${tarjaSaturation}%,35%,${tarjaAlpha / 100})`,
                            borderLeft: `3px solid hsla(${tarjaHue},${tarjaSaturation}%,70%,0.9)`,
                            fontFamily: tarjaFont,
                            fontWeight: tarjaBold ? "bold" : "normal",
                            fontStyle: tarjaItalic ? "italic" : "normal",
                            fontSize: `${Math.round(tarjaScaleY * 0.12)}px`,
                            color: `hsl(${tarjaHue},${tarjaSaturation}%,88%)`,
                            whiteSpace: "nowrap",
                            transform: `scaleX(${tarjaScaleX / 100})`,
                            transformOrigin: "left center"
                          },
                          children: tarjaText || "TARJA"
                        }
                      )
                    }
                  ),
                  meActiveFrame !== null && meFrames[meActiveFrame] && /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: meFrames[meActiveFrame],
                      alt: `Frame ${meActiveFrame + 1}`,
                      className: "absolute inset-0 w-full h-full object-contain z-50 pointer-events-none"
                    }
                  )
                ]
              }
            ),
            pgmCamUrl && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mt-1 px-1.5 py-1 rounded-lg border border-red-600/30", style: { backgroundColor: "#1a0a0a" }, children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setPgmCamMuted((m) => !m),
                  title: pgmCamMuted ? "Reativar áudio da CAM" : "Mutar áudio da CAM",
                  className: "text-zinc-400 hover:text-white transition-colors shrink-0",
                  children: pgmCamMuted || pgmCamVolume === 0 ? /* @__PURE__ */ jsx(VolumeX, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(Volume2, { className: "h-3 w-3" })
                }
              ),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "range",
                  min: 0,
                  max: 100,
                  value: pgmCamMuted ? 0 : pgmCamVolume,
                  disabled: !pgmCamIsYoutube,
                  onChange: (e) => {
                    const v = Number(e.target.value);
                    setPgmCamVolume(v);
                    setPgmCamMuted(v === 0);
                  },
                  className: "flex-1 h-1 accent-red-500 disabled:opacity-30",
                  title: pgmCamIsYoutube ? "Volume da CAM (PGM)" : "Volume controlado pela plataforma de origem"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-[8px] font-mono text-zinc-500 w-8 text-right shrink-0", children: pgmCamMuted ? "MUDO" : `${pgmCamVolume}%` }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: handleCamOffAir,
                  title: "Tirar CAM do ar (encerra vídeo e áudio)",
                  className: "flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase text-red-400 border border-red-700/50 hover:bg-red-600/20 transition-all active:scale-[0.97] shrink-0",
                  children: [
                    /* @__PURE__ */ jsx(PowerOff, { className: "h-2.5 w-2.5" }),
                    " off"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-1 mt-1.5", children: [{ label: "L", level: vuLevelL }, { label: "R", level: vuLevelR }].map(({ label, level }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[8px] font-mono font-bold text-zinc-600 w-2.5", children: label }),
              /* @__PURE__ */ jsx("div", { className: "flex-1 h-1.5 rounded-full overflow-hidden", style: { backgroundColor: "#0f0f0f", border: "1px solid #2a2a2a" }, children: /* @__PURE__ */ jsx("div", { className: "flex gap-[2px] h-full items-center px-0.5", children: Array.from({ length: 50 }).map((_, i) => {
                const active = i < Math.round(level / 100 * 50);
                const color = i < 35 ? "#22c55e" : i < 45 ? "#eab308" : "#ef4444";
                return /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "h-full w-full rounded-[1px] transition-opacity",
                    style: { backgroundColor: color, opacity: active ? 1 : 0.15 }
                  },
                  i
                );
              }) }) })
            ] }, label)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Youtube, { className: "h-3 w-3 text-red-500" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-red-500", children: multiviewActive ? "MULTIVIEW" : "YouTube" })
              ] }),
              youtubeVisible && /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    setYoutubeVisible(false);
                    setYoutubeUrl("");
                    setYoutubeInput("");
                  },
                  className: "text-[8px] font-bold uppercase text-zinc-600 hover:text-red-400 flex items-center gap-1",
                  children: [
                    /* @__PURE__ */ jsx(X, { className: "h-2.5 w-2.5" }),
                    " Fechar"
                  ]
                }
              )
            ] }),
            multiviewActive ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-1 aspect-video bg-black rounded-lg overflow-hidden border border-cyan-600/20", children: [1, 2, 3, 4].map((cam) => {
              const idx = cam - 1;
              const src = camSources[idx];
              const srcType = camSourceTypes[idx];
              const hasSrc = !!src;
              const isActive = activeCam === cam;
              const handleCamSelect = () => {
                setActiveCam(cam);
                sendCamToPreview(idx);
                if (pgmChannelRef.current?.readyState === 1) {
                  pgmChannelRef.current.send(JSON.stringify({ type: "cam_take", cam }));
                }
                toast.success(`CAM ${cam} → PREVIEW`);
              };
              const getEmbedUrl = (rawUrl) => buildCamEmbedUrl(rawUrl, { mute: true }).url;
              return /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "relative bg-black flex items-center justify-center cursor-pointer transition-all duration-150 group",
                  style: { border: isActive ? "2px solid #f97316" : "1px solid rgba(8,145,178,0.3)" },
                  onClick: handleCamSelect,
                  onDoubleClick: handleCamSelect,
                  children: [
                    hasSrc && srcType === "file" && /* @__PURE__ */ jsx(
                      "video",
                      {
                        ref: (el) => {
                          camVideoRefs.current[idx] = el;
                        },
                        src: src ?? void 0,
                        className: "absolute inset-0 w-full h-full object-cover",
                        muted: true,
                        loop: true,
                        autoPlay: true,
                        playsInline: true,
                        preload: "auto"
                      }
                    ),
                    hasSrc && srcType === "url" && /* @__PURE__ */ jsx(
                      "iframe",
                      {
                        src: getEmbedUrl(src),
                        className: "absolute inset-0 w-full h-full",
                        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
                        allowFullScreen: true,
                        style: { border: "none", pointerEvents: "none" }
                      },
                      src
                    ),
                    !hasSrc && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1.5 text-zinc-700 group-hover:text-zinc-500 transition-colors px-2 text-center", children: [
                      /* @__PURE__ */ jsxs("div", { className: "text-[10px] font-bold", children: [
                        "CAM ",
                        cam
                      ] }),
                      /* @__PURE__ */ jsx("div", { className: "text-[7px] opacity-60 leading-tight", children: "📂 arquivo ou 🔗 link" })
                    ] }),
                    isActive && /* @__PURE__ */ jsx("div", { className: "absolute top-1 left-1 bg-orange-500 text-black text-[7px] font-black px-1 py-0.5 rounded uppercase tracking-widest z-10 pointer-events-none", children: "PVW" }),
                    /* @__PURE__ */ jsxs("div", { className: "absolute bottom-1 right-1 z-20 flex gap-0.5", onClick: (e) => e.stopPropagation(), children: [
                      /* @__PURE__ */ jsxs(
                        "label",
                        {
                          className: "bg-black/80 border border-zinc-600 text-zinc-400 hover:text-white hover:border-zinc-300 rounded px-1 py-0.5 text-[7px] font-bold cursor-pointer transition-all",
                          title: "Carregar arquivo de vídeo",
                          children: [
                            "📂",
                            /* @__PURE__ */ jsx(
                              "input",
                              {
                                type: "file",
                                accept: "video/*",
                                className: "hidden",
                                onChange: (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const url = URL.createObjectURL(file);
                                  setCamSources((prev) => {
                                    const n = [...prev];
                                    n[idx] = url;
                                    return n;
                                  });
                                  setCamSourceTypes((prev) => {
                                    const n = [...prev];
                                    n[idx] = "file";
                                    return n;
                                  });
                                  e.target.value = "";
                                }
                              }
                            )
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          className: "bg-black/80 border border-zinc-600 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500 rounded px-1 py-0.5 text-[7px] font-bold cursor-pointer transition-all",
                          title: "Colar link (YouTube, Instagram, Facebook...)",
                          onClick: (e) => {
                            e.stopPropagation();
                            const link = window.prompt(`CAM ${cam} — cole o link (YouTube, Instagram, Facebook, etc):`);
                            if (!link?.trim()) return;
                            setCamSources((prev) => {
                              const n = [...prev];
                              n[idx] = link.trim();
                              return n;
                            });
                            setCamSourceTypes((prev) => {
                              const n = [...prev];
                              n[idx] = "url";
                              return n;
                            });
                          },
                          children: "🔗"
                        }
                      ),
                      hasSrc && /* @__PURE__ */ jsx(
                        "button",
                        {
                          className: "bg-black/80 border border-red-800 text-red-500 hover:text-red-300 hover:border-red-400 rounded px-1 py-0.5 text-[7px] font-bold cursor-pointer transition-all",
                          title: "Remover fonte",
                          onClick: (e) => {
                            e.stopPropagation();
                            setCamSources((prev) => {
                              const n = [...prev];
                              n[idx] = null;
                              return n;
                            });
                            setCamSourceTypes((prev) => {
                              const n = [...prev];
                              n[idx] = null;
                              return n;
                            });
                            if (activeCam === cam) {
                              setActiveCam(null);
                              setIsCamPreview(false);
                              setPreviewCamIdx(null);
                            }
                          },
                          children: "✕"
                        }
                      )
                    ] })
                  ]
                },
                cam
              );
            }) }) : /* @__PURE__ */ jsx(
              "div",
              {
                className: "relative aspect-video bg-black rounded-lg overflow-hidden border border-red-600/20",
                style: { boxShadow: youtubeVisible ? "0 0 20px rgba(239,68,68,0.15)" : "none" },
                children: youtubeVisible && youtubeUrl ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(
                    "iframe",
                    {
                      src: youtubeUrl,
                      className: "absolute inset-0 w-full h-full",
                      allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
                      allowFullScreen: true,
                      title: "YouTube Monitor",
                      style: { border: "none" }
                    },
                    youtubeUrl
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "absolute top-1.5 left-1.5 flex items-center gap-1 bg-red-700/90 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase pointer-events-none z-10 animate-pulse", children: [
                    /* @__PURE__ */ jsx(Youtube, { className: "h-2.5 w-2.5 text-white" }),
                    " AO VIVO"
                  ] })
                ] }) : /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-700", children: [
                  /* @__PURE__ */ jsx(Youtube, { className: "h-7 w-7" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[9px] uppercase tracking-widest text-center px-3", children: "Cole o link e clique em Abrir" })
                ] })
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mt-0.5", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: youtubeInput,
                  onChange: (e) => setYoutubeInput(e.target.value),
                  onKeyDown: (e) => {
                    if (e.key === "Enter") {
                      if (multiviewActive && activeCam !== null) {
                        const idx = activeCam - 1;
                        setCamSources((prev) => {
                          const n = [...prev];
                          n[idx] = youtubeInput.trim();
                          return n;
                        });
                        setCamSourceTypes((prev) => {
                          const n = [...prev];
                          n[idx] = "url";
                          return n;
                        });
                        toast.success(`Link → CAM ${activeCam}`);
                        setYoutubeInput("");
                      } else {
                        const id = extractYoutubeId(youtubeInput);
                        if (id) {
                          setYoutubeUrl(`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`);
                          setYoutubeVisible(true);
                        } else toast.error("Link do YouTube inválido.");
                      }
                    }
                  },
                  placeholder: multiviewActive && activeCam !== null ? `Link para CAM ${activeCam}...` : "youtube.com/watch?v=...",
                  className: "flex-1 px-2 py-1.5 rounded-lg border text-[10px] text-zinc-300 placeholder-zinc-700 focus:outline-none transition-all",
                  style: { backgroundColor: "#1a1a1a", borderColor: multiviewActive && activeCam !== null ? "#f97316" : "#2a2a2a" }
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    if (multiviewActive && activeCam !== null) {
                      const idx = activeCam - 1;
                      const link = youtubeInput.trim();
                      if (!link) return;
                      setCamSources((prev) => {
                        const n = [...prev];
                        n[idx] = link;
                        return n;
                      });
                      setCamSourceTypes((prev) => {
                        const n = [...prev];
                        n[idx] = "url";
                        return n;
                      });
                      toast.success(`Link → CAM ${activeCam}`);
                      setYoutubeInput("");
                    } else {
                      const id = extractYoutubeId(youtubeInput);
                      if (id) {
                        setYoutubeUrl(`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`);
                        setYoutubeVisible(true);
                      } else toast.error("Link do YouTube inválido.");
                    }
                  },
                  className: "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase text-white border border-red-600/50 transition-all active:scale-[0.98] shrink-0",
                  style: { backgroundColor: multiviewActive && activeCam !== null ? "#f97316" : "#ef4444", borderColor: multiviewActive && activeCam !== null ? "#fb923c" : void 0 },
                  children: [
                    /* @__PURE__ */ jsx(Play, { className: "h-2.5 w-2.5" }),
                    multiviewActive && activeCam !== null ? `CAM ${activeCam}` : "Abrir"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    setMultiviewActive(!multiviewActive);
                    if (multiviewActive) {
                      setActiveCam(null);
                      setIsCamPreview(false);
                      setPreviewCamIdx(null);
                    }
                  },
                  className: "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase text-white border border-cyan-600/50 transition-all active:scale-[0.98] shrink-0",
                  style: { backgroundColor: "#0891b2" },
                  title: "4 Câmeras",
                  children: [
                    /* @__PURE__ */ jsx(Grid2X2, { className: "h-2.5 w-2.5" }),
                    "Multi"
                  ]
                }
              )
            ] }),
            multiviewActive && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 mt-1", children: [1, 2, 3, 4].map((cam) => /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => {
                  setActiveCam(cam);
                  sendCamToPreview(cam - 1);
                  if (pgmChannelRef.current?.readyState === 1) {
                    pgmChannelRef.current.send(JSON.stringify({ type: "cam_take", cam }));
                  }
                  toast.success(`CAM ${cam} → PREVIEW`);
                },
                className: "flex-1 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all active:scale-[0.97]",
                style: {
                  backgroundColor: activeCam === cam ? "#f97316" : "#00E676",
                  borderColor: activeCam === cam ? "#fb923c" : "#00E67650",
                  color: "#000"
                },
                children: [
                  "CAM ",
                  cam
                ]
              },
              cam
            )) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[auto_1fr_auto_1fr_auto_auto] gap-0 flex-1 min-h-0", children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: cn(
                "border rounded-xl p-3 flex flex-col overflow-hidden transition-all duration-200",
                dragOverLauda ? "border-pink-500" : ""
              ),
              style: { backgroundColor: "#1a1a1a", borderColor: dragOverLauda ? "#ec4899" : "#2a2a2a", boxShadow: dragOverLauda ? "0 0 16px rgba(236,72,153,0.2)" : "none" },
              onDragOver: (e) => {
                e.preventDefault();
                setDragOverLauda(true);
              },
              onDragLeave: () => setDragOverLauda(false),
              onDrop: (e) => {
                e.preventDefault();
                const idx = Number(e.dataTransfer.getData("item_index"));
                const droppedItem = items[idx];
                if (droppedItem) handleDropNaLauda(droppedItem);
                else setDragOverLauda(false);
              },
              children: [
                /* @__PURE__ */ jsxs("div", { className: "pb-2 border-b-2 border-pink-500 mb-3 flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-pink-400", children: "📋 LAUDA" }),
                  dragOverLauda && /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold text-pink-400 animate-pulse ml-1", children: "⬇ Solte aqui" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-bold bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded-full ml-auto border border-pink-500/20", children: [
                    materiaAtual?.itensLauda?.length ?? 0,
                    " ITENS"
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-1 overflow-y-auto flex-1", children: materiaAtual?.itensLauda && materiaAtual.itensLauda.length > 0 ? materiaAtual.itensLauda.map((item, idx) => {
                  let bgColor = "bg-zinc-700";
                  let borderColor = "border-zinc-600";
                  let textColor = "text-white";
                  let hoverColor = "hover:bg-zinc-600";
                  let icon = "📌";
                  switch (item.tipo) {
                    case "SONORA":
                      bgColor = "bg-emerald-600";
                      borderColor = "border-emerald-500";
                      hoverColor = "hover:bg-emerald-700";
                      icon = "🎤";
                      break;
                    case "PASSAGEM":
                      bgColor = "bg-amber-600";
                      borderColor = "border-amber-500";
                      hoverColor = "hover:bg-amber-700";
                      icon = "🎥";
                      break;
                    case "PRODUÇÃO":
                      bgColor = "bg-orange-600";
                      borderColor = "border-orange-500";
                      hoverColor = "hover:bg-orange-700";
                      icon = "🎬";
                      break;
                    case "ED_TEXTO":
                      bgColor = "bg-blue-600";
                      borderColor = "border-blue-500";
                      hoverColor = "hover:bg-blue-700";
                      icon = "📝";
                      break;
                    case "ED_IMAGEM":
                      bgColor = "bg-pink-600";
                      borderColor = "border-pink-500";
                      hoverColor = "hover:bg-pink-700";
                      icon = "🖼️";
                      break;
                    case "REPÓRTER":
                      bgColor = "bg-cyan-600";
                      borderColor = "border-cyan-500";
                      hoverColor = "hover:bg-cyan-700";
                      icon = "🎙️";
                      break;
                    case "IMAGENS":
                      bgColor = "bg-purple-600";
                      borderColor = "border-purple-500";
                      hoverColor = "hover:bg-purple-700";
                      icon = "🎞️";
                      break;
                  }
                  return /* @__PURE__ */ jsxs(
                    "button",
                    {
                      draggable: true,
                      onDragStart: (e) => {
                        e.dataTransfer.setData("drag_source", "lauda");
                        e.dataTransfer.setData("lauda_index", String(idx));
                        e.dataTransfer.effectAllowed = "move";
                        setDraggedFromLauda(item);
                        setDraggedLaudaIndex(idx);
                      },
                      onDragOver: (e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                      },
                      onDrop: (e) => {
                        e.preventDefault();
                        const source = e.dataTransfer.getData("drag_source");
                        if (source === "lauda") {
                          const fromIdx = Number(e.dataTransfer.getData("lauda_index"));
                          if (fromIdx !== idx) handleReorderLauda(fromIdx, idx);
                        }
                        setDraggedFromLauda(null);
                        setDraggedLaudaIndex(null);
                      },
                      onDragEnd: () => {
                        setDraggedFromLauda(null);
                        setDraggedLaudaIndex(null);
                      },
                      onClick: () => {
                        const valor = item.valor || "";
                        const novoCredito = { line1: "", line2: "" };
                        if ((item.tipo === "SONORA" || item.tipo === "PASSAGEM") && valor.includes(" - ")) {
                          const partes = valor.split(" - ");
                          novoCredito.line1 = partes[0]?.trim() || valor;
                          novoCredito.line2 = partes[1]?.trim() || "";
                        } else {
                          novoCredito.line1 = valor;
                          novoCredito.line2 = item.tipo?.replace("_", " ") || "";
                        }
                        setGcCreditsQueue((prev) => {
                          const novaFila = [...prev, novoCredito];
                          if (novaFila.length === 1) {
                            setGcLine1(novoCredito.line1);
                            setGcLine2(novoCredito.line2);
                          }
                          return novaFila;
                        });
                        if (materiaAtual?.materia_id) {
                          setRemovedLaudaOrdens((prev) => {
                            const novoSet = new Set(prev[materiaAtual.materia_id] || []);
                            novoSet.add(item.ordem);
                            return { ...prev, [materiaAtual.materia_id]: novoSet };
                          });
                          setMateriaAtual((prev) => {
                            if (!prev) return null;
                            const novaLauda = prev.itensLauda.filter((it) => it.ordem !== item.ordem);
                            return { ...prev, itensLauda: novaLauda };
                          });
                        }
                        toast.success(`"${valor}" → GC`);
                      },
                      className: cn(
                        `${bgColor} ${hoverColor} border ${borderColor} rounded-lg px-2.5 py-2 transition-all flex items-center justify-between gap-2 min-w-0 cursor-grab active:cursor-grabbing font-bold text-xs uppercase tracking-wide`,
                        draggedLaudaIndex === idx && "opacity-50 scale-95",
                        `${textColor} shadow-md hover:shadow-lg`
                      ),
                      title: `Clique para enviar ao GC: ${item.valor}`,
                      children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0 flex-1", children: [
                          /* @__PURE__ */ jsx("span", { className: "text-base shrink-0", children: icon }),
                          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                            /* @__PURE__ */ jsxs("div", { className: "text-[8px] font-black opacity-80 leading-none", children: [
                              "[",
                              item.tipo.replace("_", ". "),
                              "]"
                            ] }),
                            /* @__PURE__ */ jsx("div", { className: "text-[10px] font-bold truncate text-white", children: item.valor })
                          ] })
                        ] }),
                        /* @__PURE__ */ jsx("span", { className: "shrink-0 text-[9px] font-black bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10", children: "GC" })
                      ]
                    },
                    idx
                  );
                }) : /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center justify-center gap-2 text-zinc-700 border-2 border-dashed border-white/5 rounded-xl", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🎬" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-widest text-center px-3", children: "Arraste uma matéria da fila aqui" })
                ] }) })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "border rounded-xl p-4 flex flex-col gap-3 w-[380px]", style: { backgroundColor: "#1a1a1a", borderColor: "#2a2a2a" }, children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[9px] font-mono text-zinc-600 w-8 text-right tabular-nums", children: formatDuration(pgmCurrentTime) }),
              /* @__PURE__ */ jsx("div", { className: "flex-1 h-1.5 bg-zinc-800 rounded-full cursor-pointer relative overflow-hidden group", onClick: handleSeek, children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full transition-none relative", style: { width: `${pgmProgress}%`, backgroundColor: "#ef4444" }, children: /* @__PURE__ */ jsx("div", { className: "absolute right-0 top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-white rounded-full -mr-1 opacity-0 group-hover:opacity-100 transition-opacity shadow" }) }) }),
              /* @__PURE__ */ jsx("span", { className: "text-[9px] font-mono text-zinc-600 w-8 tabular-nums", children: formatDuration(pgmFile?.duration ?? null) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-center", children: /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono text-zinc-600 truncate", children: pgmFile?.name.replace(".mp4", "") || "Nenhum arquivo no PGM" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-1.5", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: handleCue,
                  title: "CUE",
                  className: "flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 transition-all active:scale-[0.98] group",
                  style: { backgroundColor: "#1f1f1f" },
                  children: [
                    /* @__PURE__ */ jsx(SkipBack, { className: "h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" }),
                    /* @__PURE__ */ jsx("span", { className: "text-[8px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400", children: "CUE" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: handleStop,
                  title: "STOP",
                  className: "flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl border border-zinc-700 hover:border-red-500/30 transition-all active:scale-[0.98] group",
                  style: { backgroundColor: "#1f1f1f" },
                  children: [
                    /* @__PURE__ */ jsx(Square, { className: "h-4 w-4 text-zinc-500 group-hover:text-red-500 transition-colors" }),
                    /* @__PURE__ */ jsx("span", { className: "text-[8px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-red-400", children: "STOP" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: handlePlayPausePgm,
                  title: isPlaying ? "PAUSE" : "PLAY",
                  className: cn(
                    "flex flex-col items-center gap-0.5 px-5 py-2.5 rounded-xl border transition-all active:scale-[0.98]",
                    isPlaying ? "border-yellow-500/30 text-yellow-400" : "text-black font-bold border-transparent"
                  ),
                  style: { backgroundColor: isPlaying ? "#78350f20" : "#00E676" },
                  children: [
                    isPlaying ? /* @__PURE__ */ jsx(Pause, { className: "h-4 w-4 text-yellow-400" }) : /* @__PURE__ */ jsx(Play, { className: "h-4 w-4 text-black" }),
                    /* @__PURE__ */ jsx("span", { className: cn("text-[8px] font-bold uppercase tracking-widest", isPlaying ? "text-yellow-400" : "text-black"), children: isPlaying ? "PAUSE" : "PLAY" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: handleTake,
                  title: "TAKE",
                  className: "flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-xl border transition-all active:scale-[0.98]",
                  style: { backgroundColor: "#00E676", borderColor: "#00E67650" },
                  children: [
                    /* @__PURE__ */ jsx(MonitorPlay, { className: "h-4 w-4 text-black" }),
                    /* @__PURE__ */ jsx("span", { className: "text-[8px] font-bold uppercase tracking-widest text-black", children: "TAKE" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: handleSkip,
                  title: "SKIP",
                  className: "flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 transition-all active:scale-[0.98] group",
                  style: { backgroundColor: "#1f1f1f" },
                  children: [
                    /* @__PURE__ */ jsx(SkipForward, { className: "h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" }),
                    /* @__PURE__ */ jsx("span", { className: "text-[8px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400", children: "SKIP" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border-t pt-3 flex flex-col gap-2", style: { borderColor: "#2a2a2a" }, children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-1", children: [
                /* @__PURE__ */ jsx("span", { className: "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-400", children: "⚙ TRANSIÇÃO" }),
                /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-mono font-bold", style: { color: transValue > 0 ? "#facc15" : "#52525b" }, children: [
                  transValue,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "relative flex items-center w-full rounded-xl overflow-hidden",
                  style: { height: 48, cursor: "ew-resize", backgroundColor: "#0a0a0a", border: "1px solid #2a2a2a" },
                  onMouseDown: (e) => {
                    handleTransition();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const onMove = (ev) => {
                      const pct = Math.min(100, Math.max(0, (ev.clientX - rect.left) / rect.width * 100));
                      setTransValue(Math.round(pct));
                      applyTransOpacity(Math.round(pct), activePlayer);
                    };
                    const onUp = (ev) => {
                      const pct = Math.min(100, Math.max(0, (ev.clientX - rect.left) / rect.width * 100));
                      window.removeEventListener("mousemove", onMove);
                      window.removeEventListener("mouseup", onUp);
                      if (pct >= 95) {
                        handleTransComplete();
                      } else {
                        setTransValue(0);
                        setPlayerAOpacity(activePlayer === "A" ? 1 : 0);
                        setPlayerAZ(activePlayer === "A" ? 10 : 0);
                        setPlayerBOpacity(activePlayer === "B" ? 1 : 0);
                        setPlayerBZ(activePlayer === "B" ? 10 : 0);
                        const inactiveEl = activePlayer === "A" ? pgmBRef.current : pgmARef.current;
                        if (inactiveEl) {
                          inactiveEl.pause();
                          inactiveEl.src = "";
                        }
                      }
                    };
                    window.addEventListener("mousemove", onMove);
                    window.addEventListener("mouseup", onUp);
                  },
                  onTouchStart: (e) => {
                    handleTransition();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const onMove = (ev) => {
                      const touch = ev.touches[0];
                      const pct = Math.min(100, Math.max(0, (touch.clientX - rect.left) / rect.width * 100));
                      setTransValue(Math.round(pct));
                      applyTransOpacity(Math.round(pct), activePlayer);
                    };
                    const onEnd = (ev) => {
                      const touch = ev.changedTouches[0];
                      const pct = Math.min(100, Math.max(0, (touch.clientX - rect.left) / rect.width * 100));
                      window.removeEventListener("touchmove", onMove);
                      window.removeEventListener("touchend", onEnd);
                      if (pct >= 95) {
                        handleTransComplete();
                      } else {
                        setTransValue(0);
                        setPlayerAOpacity(activePlayer === "A" ? 1 : 0);
                        setPlayerAZ(activePlayer === "A" ? 10 : 0);
                        setPlayerBOpacity(activePlayer === "B" ? 1 : 0);
                        setPlayerBZ(activePlayer === "B" ? 10 : 0);
                        const inactiveEl = activePlayer === "A" ? pgmBRef.current : pgmARef.current;
                        if (inactiveEl) {
                          inactiveEl.pause();
                          inactiveEl.src = "";
                        }
                      }
                    };
                    window.addEventListener("touchmove", onMove);
                    window.addEventListener("touchend", onEnd);
                  },
                  title: "Arraste para fazer fusão — solte no fim para confirmar",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0", style: { top: "50%", transform: "translateY(-50%)", height: 3, background: "#27272a" } }),
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "absolute",
                        style: {
                          left: 0,
                          top: "50%",
                          transform: "translateY(-50%)",
                          height: 3,
                          width: `${transValue}%`,
                          background: "linear-gradient(90deg, #3b82f6, #00E676)",
                          boxShadow: transValue > 0 ? "0 0 8px rgba(0,230,118,0.6)" : "none"
                        }
                      }
                    ),
                    [25, 50, 75].map((tick) => /* @__PURE__ */ jsx("div", { className: "absolute", style: { left: `${tick}%`, top: "50%", transform: "translate(-50%, -50%)", width: 1, height: 14, background: "rgba(255,255,255,0.12)" } }, tick)),
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "absolute rounded-full flex items-center justify-center transition-shadow",
                        style: {
                          left: `${transValue}%`,
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                          width: 34,
                          height: 34,
                          zIndex: 10,
                          background: transValue > 0 ? "radial-gradient(circle at 35% 35%, #60a5fa, #2563eb)" : "radial-gradient(circle at 35% 35%, #52525b, #27272a)",
                          boxShadow: transValue > 0 ? "0 0 16px rgba(37,99,235,0.7)" : "0 2px 6px rgba(0,0,0,0.5)",
                          border: "2px solid rgba(255,255,255,0.15)"
                        },
                        children: /* @__PURE__ */ jsx(Play, { className: "h-3.5 w-3.5 text-white fill-white" })
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between px-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[8px] font-mono font-bold", style: { color: "#3b82f6" }, children: "PGM" }),
                /* @__PURE__ */ jsx("span", { className: "text-[8px] font-mono font-bold text-zinc-600", children: "PVW" })
              ] }),
              transValue > 0 && /* @__PURE__ */ jsxs("p", { className: "text-center text-[9px] font-mono", style: { color: "#00E676" }, children: [
                "Transição ativa: ",
                transValue,
                "% — Solte em 95%+ para confirmar"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 w-[480px] overflow-y-auto", style: { backgroundColor: "#121212" }, children: [
            /* @__PURE__ */ jsxs("div", { className: "border rounded-xl p-3 flex flex-col gap-3", style: { backgroundColor: "#1a1a1a", borderColor: "#2a2a2a" }, children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Type, { className: "h-3 w-3 text-zinc-500" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-zinc-400", children: "GC — Gerador" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[2fr_1fr] gap-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-[8px] uppercase tracking-widest text-zinc-600", children: "Linha 1 — Nome" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        value: gcLine1,
                        onChange: (e) => setGcLine1(e.target.value),
                        placeholder: "Nome / Título",
                        className: "w-full border rounded px-2 py-1 text-[10px] font-mono text-zinc-200 placeholder:text-zinc-700 focus:outline-none transition-all",
                        style: { backgroundColor: "#252525", borderColor: "#333" }
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-[8px] uppercase tracking-widest text-zinc-600", children: "Linha 2 — Cargo" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        value: gcLine2,
                        onChange: (e) => setGcLine2(e.target.value),
                        placeholder: "Cargo / Informação",
                        className: "w-full border rounded px-2 py-1 text-[10px] font-mono text-zinc-200 placeholder:text-zinc-700 focus:outline-none transition-all",
                        style: { backgroundColor: "#252525", borderColor: "#333" }
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-[8px] uppercase tracking-widest text-zinc-600 shrink-0", children: "Dur.:" }),
                    /* @__PURE__ */ jsxs(
                      "select",
                      {
                        value: gcDuration,
                        onChange: (e) => setGcDuration(Number(e.target.value)),
                        className: "flex-1 border rounded px-1.5 py-1 text-[9px] font-mono text-zinc-200 focus:outline-none transition-all",
                        style: { backgroundColor: "#252525", borderColor: "#333" },
                        children: [
                          /* @__PURE__ */ jsx("option", { value: 0, children: "Manual" }),
                          /* @__PURE__ */ jsx("option", { value: 3, children: "3s" }),
                          /* @__PURE__ */ jsx("option", { value: 5, children: "5s" }),
                          /* @__PURE__ */ jsx("option", { value: 10, children: "10s" })
                        ]
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "relative w-full aspect-video bg-black rounded border border-zinc-800 overflow-hidden", children: [
                  /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center text-zinc-800 text-[6px] uppercase tracking-widest", children: "GC Prev" }),
                  gcLine1 || gcLine2 ? /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 right-0 px-0.5 pb-0.5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-stretch overflow-hidden rounded-sm", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-0.5 bg-red-600 shrink-0" }),
                    /* @__PURE__ */ jsxs("div", { className: "bg-black/90 px-1 py-0.5 flex-1 min-w-0", children: [
                      gcLine1 && /* @__PURE__ */ jsx("div", { className: "text-white font-bold text-[6px] uppercase truncate", children: gcLine1 }),
                      gcLine2 && /* @__PURE__ */ jsx("div", { className: "text-zinc-400 text-[5px] uppercase truncate", children: gcLine2 })
                    ] })
                  ] }) }) : null
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: handleGcTake,
                    className: "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-widest text-white transition-all active:scale-[0.98]",
                    style: { backgroundColor: "#00E67620", borderColor: "#00E67640", color: "#00E676" },
                    children: "GC TAKE"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: handleGcClear,
                    className: "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-red-500/30 text-[9px] font-bold uppercase tracking-widest text-red-400 transition-all active:scale-[0.98]",
                    style: { backgroundColor: "#ef444420" },
                    children: "GC CLR"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: handleGcSkip,
                    disabled: gcCreditsQueue.length === 0,
                    className: "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-zinc-600 text-[9px] font-bold uppercase tracking-widest text-zinc-400 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed",
                    style: { backgroundColor: "#252525" },
                    children: "PULAR"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "border-t pt-2 flex flex-col gap-1.5", style: { borderColor: "#2a2a2a" }, children: [
                /* @__PURE__ */ jsx("label", { className: "text-[8px] uppercase tracking-widest text-zinc-600", children: "Presets Rápidos:" }),
                /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-1", children: Object.keys(gcPresets).map((presetName) => /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => handleApplyPreset(presetName),
                    className: "w-full px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-all active:scale-95",
                    style: { backgroundColor: "#252525" },
                    children: presetName
                  },
                  presetName
                )) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border rounded-xl p-3 flex flex-col gap-3", style: { backgroundColor: "#1a1a1a", borderColor: "#2a2a2a" }, children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-zinc-400", children: "⚙️ AJUSTES & EFEITOS" }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setTarjaPanelOpen((v) => !v),
                    className: cn(
                      "flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl border text-[9px] font-bold uppercase tracking-widest transition-all active:scale-[0.98]",
                      tarjaPanelOpen ? "border-zinc-500 text-white" : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                    ),
                    style: { backgroundColor: tarjaPanelOpen ? "#3f3f46" : "#252525" },
                    title: "Abrir controles da tarja",
                    children: "🎞 TARJA"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => {
                      const next = !tarjaVisible;
                      setTarjaVisible(next);
                      pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({ type: next ? "tarja_show" : "tarja_hide" }));
                    },
                    className: cn(
                      "flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl border text-[9px] font-bold uppercase tracking-widest transition-all active:scale-[0.98]"
                    ),
                    style: {
                      backgroundColor: tarjaVisible ? "#00E67620" : "#252525",
                      borderColor: tarjaVisible ? "#00E67640" : "#3f3f46",
                      color: tarjaVisible ? "#00E676" : "#71717a"
                    },
                    children: tarjaVisible ? "● TARJA ON" : "○ TARJA OFF"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    disabled: true,
                    className: "flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl border border-zinc-800 text-[9px] font-bold text-zinc-700 transition-all opacity-40 cursor-default",
                    style: { backgroundColor: "#1a1a1a" },
                    children: "—"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => {
                      const now = Date.now();
                      if (now - lastClickTime < 300) {
                        if (materiaAtual?.materia_id) {
                          setMateriaAtual({ ...materiaAtual, itensLauda: [] });
                          toast.success("Lauda limpa!");
                        }
                        setDoubleClickCount(0);
                        setLastClickTime(0);
                      } else {
                        setDoubleClickCount(1);
                        setLastClickTime(now);
                      }
                    },
                    className: "flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl border border-red-500/20 text-[9px] font-bold uppercase text-red-400 transition-all active:scale-[0.98]",
                    style: { backgroundColor: "#7f1d1d30" },
                    title: "Clique 2x para deletar toda a lauda",
                    children: "🗑️ ERASE"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border rounded-xl p-3 flex flex-col gap-2", style: { backgroundColor: "#1a1a1a", borderColor: "#2a2a2a" }, children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-zinc-400", children: "🖼️ FRAMES & OVERLAY" }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-2 p-3 bg-[#1a1a1a] rounded border border-[#2a2a2a]", children: [0, 1, 2, 3].map((id) => /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => handleMeFrameClick(id),
                  className: cn(
                    "aspect-square bg-[#121212] border-2 rounded flex flex-col items-center justify-center transition-all group overflow-hidden relative",
                    meActiveFrame === id ? "border-[#00E676] shadow-[0_0_12px_rgba(0,230,118,0.5)]" : "border-[#2a2a2a] hover:border-[#00E676]"
                  ),
                  title: meFrames[id] ? `FRAME ${id + 1}` : "Carregar PNG",
                  children: [
                    meFrames[id] ? /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx("img", { src: meFrames[id], alt: `Frame ${id + 1}`, className: "absolute inset-0 w-full h-full object-contain p-1" }),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: (e) => handleMeFrameClear(id, e),
                          title: "Remover imagem",
                          className: "absolute top-0.5 right-0.5 z-20 flex items-center justify-center w-4 h-4 rounded-full bg-black/70 border border-zinc-600 text-zinc-400 hover:text-red-400 hover:border-red-400 transition-all",
                          children: /* @__PURE__ */ jsx(X, { className: "h-2.5 w-2.5" })
                        }
                      )
                    ] }) : /* @__PURE__ */ jsx(Image, { className: "text-slate-600 group-hover:text-[#00E676]", size: 18 }),
                    /* @__PURE__ */ jsxs("span", { className: cn(
                      "text-[9px] mt-1 z-10 px-1 rounded",
                      meActiveFrame === id ? "text-[#00E676] font-bold bg-black/60" : "text-slate-500 bg-black/60"
                    ), children: [
                      "FRAME ",
                      id + 1
                    ] }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        ref: (el) => {
                          meFileInputRefs.current[id] = el;
                        },
                        type: "file",
                        accept: "image/png",
                        className: "hidden",
                        onChange: (e) => {
                          const file = e.target.files?.[0];
                          if (file) handleMeFrameLoad(id, file);
                          e.target.value = "";
                        }
                      }
                    )
                  ]
                },
                id
              )) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border rounded-xl p-3 flex flex-col overflow-hidden", style: { backgroundColor: "#1a1a1a", borderColor: "#2a2a2a" }, children: [
              /* @__PURE__ */ jsx("div", { className: "pb-2 border-b-2 border-zinc-700 mb-3 flex items-center gap-2", children: /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-zinc-600", children: "— VAGA" }) }),
              /* @__PURE__ */ jsx("div", { className: "flex-1 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/5 rounded-xl", children: /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-widest text-center px-3 text-zinc-700", children: "Disponível" }) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "border rounded-xl p-3 flex flex-col overflow-hidden", style: { backgroundColor: "#1a1a1a", borderColor: "#2a2a2a" }, children: /* @__PURE__ */ jsx("div", { className: "flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl" }) }),
            /* @__PURE__ */ jsx("div", { className: "border rounded-xl p-3 flex flex-col overflow-hidden", style: { backgroundColor: "#1a1a1a", borderColor: "#2a2a2a" }, children: /* @__PURE__ */ jsx("div", { className: "flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl" }) })
          ] })
        ] }),
        tarjaPanelOpen && /* @__PURE__ */ jsxs(
          "div",
          {
            className: "fixed z-[9999] border rounded-2xl shadow-2xl w-80 select-none",
            style: { left: tarjaPanelPos.x, top: tarjaPanelPos.y, backgroundColor: "#1a1a1a", borderColor: "#3a3a3a" },
            children: [
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "flex items-center justify-between px-4 py-3 rounded-t-2xl cursor-grab active:cursor-grabbing border-b",
                  style: { backgroundColor: "#252525", borderColor: "#333" },
                  onMouseDown: (e) => {
                    tarjaDragRef.current = { startX: e.clientX, startY: e.clientY, startPX: tarjaPanelPos.x, startPY: tarjaPanelPos.y };
                    const onMove = (ev) => {
                      if (!tarjaDragRef.current) return;
                      setTarjaPanelPos({ x: tarjaDragRef.current.startPX + ev.clientX - tarjaDragRef.current.startX, y: tarjaDragRef.current.startPY + ev.clientY - tarjaDragRef.current.startY });
                    };
                    const onUp = () => {
                      tarjaDragRef.current = null;
                      window.removeEventListener("mousemove", onMove);
                      window.removeEventListener("mouseup", onUp);
                    };
                    window.addEventListener("mousemove", onMove);
                    window.addEventListener("mouseup", onUp);
                  },
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-zinc-300", children: "🎞 Controles da Tarja" }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: () => {
                            const next = !tarjaVisible;
                            setTarjaVisible(next);
                            pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({ type: next ? "tarja_show" : "tarja_hide" }));
                          },
                          className: "text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border transition-all",
                          style: {
                            backgroundColor: tarjaVisible ? "#00E67620" : "#252525",
                            borderColor: tarjaVisible ? "#00E67640" : "#3f3f46",
                            color: tarjaVisible ? "#00E676" : "#71717a"
                          },
                          children: tarjaVisible ? "● ON" : "○ OFF"
                        }
                      ),
                      /* @__PURE__ */ jsx("button", { onClick: () => setTarjaPanelOpen(false), className: "text-zinc-500 hover:text-red-400 font-bold transition-colors", children: "✕" })
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "p-4 flex flex-col gap-4 max-h-[80vh] overflow-y-auto", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black uppercase tracking-widest text-zinc-500", children: "Caractere / Texto" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: tarjaText,
                      onChange: (e) => setTarjaText(e.target.value),
                      placeholder: "Nome da tarja...",
                      className: "w-full border rounded-lg px-3 py-2 text-[11px] font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none transition-all",
                      style: { backgroundColor: "#252525", borderColor: "#3a3a3a" }
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center", children: [
                    /* @__PURE__ */ jsxs(
                      "select",
                      {
                        value: tarjaFont,
                        onChange: (e) => setTarjaFont(e.target.value),
                        className: "flex-1 border rounded-lg px-2 py-1.5 text-[10px] text-zinc-200 focus:outline-none transition-all",
                        style: { backgroundColor: "#252525", borderColor: "#3a3a3a" },
                        children: [
                          /* @__PURE__ */ jsx("option", { value: "sans-serif", children: "Sans-Serif" }),
                          /* @__PURE__ */ jsx("option", { value: "serif", children: "Serif" }),
                          /* @__PURE__ */ jsx("option", { value: "monospace", children: "Monospace" }),
                          /* @__PURE__ */ jsx("option", { value: "Arial, sans-serif", children: "Arial" }),
                          /* @__PURE__ */ jsx("option", { value: "'Times New Roman', serif", children: "Times New Roman" }),
                          /* @__PURE__ */ jsx("option", { value: "'Courier New', monospace", children: "Courier New" }),
                          /* @__PURE__ */ jsx("option", { value: "Georgia, serif", children: "Georgia" }),
                          /* @__PURE__ */ jsx("option", { value: "Impact, sans-serif", children: "Impact" }),
                          /* @__PURE__ */ jsx("option", { value: "Verdana, sans-serif", children: "Verdana" })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => setTarjaBold((v) => !v),
                        className: "px-3 py-1.5 rounded-lg border text-[11px] font-black tracking-widest transition-all",
                        style: { backgroundColor: tarjaBold ? "#00E67620" : "#252525", borderColor: tarjaBold ? "#00E67640" : "#3a3a3a", color: tarjaBold ? "#00E676" : "#71717a" },
                        children: "B"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => setTarjaItalic((v) => !v),
                        className: "px-3 py-1.5 rounded-lg border text-[11px] italic font-bold tracking-widest transition-all",
                        style: { backgroundColor: tarjaItalic ? "#00E67620" : "#252525", borderColor: tarjaItalic ? "#00E67640" : "#3a3a3a", color: tarjaItalic ? "#00E676" : "#71717a" },
                        children: "I"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "w-full px-3 py-2 rounded-lg border text-center truncate text-[13px]",
                      style: { backgroundColor: "#0a0a0a", borderColor: "#2a2a2a", fontFamily: tarjaFont, fontWeight: tarjaBold ? "bold" : "normal", fontStyle: tarjaItalic ? "italic" : "normal", color: `hsl(${tarjaHue}, ${tarjaSaturation}%, 80%)` },
                      children: tarjaText || "Prévia do texto"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black uppercase tracking-widest text-zinc-500", children: "Cor da Tarja" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-[9px] text-zinc-500 w-16 shrink-0", children: "Hue" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "range",
                        min: 0,
                        max: 360,
                        value: tarjaHue,
                        onChange: (e) => setTarjaHue(Number(e.target.value)),
                        className: "flex-1 h-1.5 accent-pink-500",
                        style: { background: `linear-gradient(to right,hsl(0,100%,50%),hsl(60,100%,50%),hsl(120,100%,50%),hsl(180,100%,50%),hsl(240,100%,50%),hsl(300,100%,50%),hsl(360,100%,50%))` }
                      }
                    ),
                    /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-mono text-zinc-400 w-8 text-right", children: [
                      tarjaHue,
                      "°"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-[9px] text-zinc-500 w-16 shrink-0", children: "Saturação" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "range",
                        min: 0,
                        max: 100,
                        value: tarjaSaturation,
                        onChange: (e) => setTarjaSaturation(Number(e.target.value)),
                        className: "flex-1 h-1.5 accent-pink-500"
                      }
                    ),
                    /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-mono text-zinc-400 w-8 text-right", children: [
                      tarjaSaturation,
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "w-full h-5 rounded-md border border-zinc-700",
                      style: { backgroundColor: `hsla(${tarjaHue},${tarjaSaturation}%,40%,${tarjaAlpha / 100})` }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black uppercase tracking-widest text-zinc-500", children: "Opacidade (Alpha)" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "range",
                        min: 0,
                        max: 100,
                        value: tarjaAlpha,
                        onChange: (e) => setTarjaAlpha(Number(e.target.value)),
                        className: "flex-1 h-1.5 accent-pink-500"
                      }
                    ),
                    /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-mono text-zinc-400 w-8 text-right", children: [
                      tarjaAlpha,
                      "%"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black uppercase tracking-widest text-zinc-500", children: "Escala" }),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => setTarjaScaleLock((v) => !v),
                        className: "flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-widest transition-all",
                        style: {
                          backgroundColor: tarjaScaleLock ? "#00E67620" : "#252525",
                          borderColor: tarjaScaleLock ? "#00E67450" : "#3f3f46",
                          color: tarjaScaleLock ? "#00E676" : "#71717a"
                        },
                        children: tarjaScaleLock ? "🔒 LOCK" : "🔓 FREE"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-[9px] text-zinc-500 w-16 shrink-0", children: "Largura X" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "range",
                        min: 10,
                        max: 400,
                        value: tarjaScaleX,
                        onChange: (e) => {
                          const v = Number(e.target.value);
                          if (tarjaScaleLock) {
                            setTarjaScaleX(v);
                            setTarjaScaleY(v);
                          } else setTarjaScaleX(v);
                        },
                        className: "flex-1 h-1.5 accent-pink-500"
                      }
                    ),
                    /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-mono text-zinc-400 w-8 text-right", children: [
                      tarjaScaleX,
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-[9px] text-zinc-500 w-16 shrink-0", children: "Altura Y" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "range",
                        min: 10,
                        max: 400,
                        value: tarjaScaleY,
                        onChange: (e) => {
                          const v = Number(e.target.value);
                          if (tarjaScaleLock) {
                            setTarjaScaleX(v);
                            setTarjaScaleY(v);
                          } else setTarjaScaleY(v);
                        },
                        className: "flex-1 h-1.5 accent-pink-500"
                      }
                    ),
                    /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-mono text-zinc-400 w-8 text-right", children: [
                      tarjaScaleY,
                      "%"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black uppercase tracking-widest text-zinc-500", children: "Posição na Tela" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-[9px] text-zinc-500 w-16 shrink-0", children: "X (horiz.)" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "range",
                        min: 0,
                        max: 100,
                        value: tarjaX,
                        onChange: (e) => setTarjaX(Number(e.target.value)),
                        className: "flex-1 h-1.5 accent-pink-500"
                      }
                    ),
                    /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-mono text-zinc-400 w-8 text-right", children: [
                      tarjaX,
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-[9px] text-zinc-500 w-16 shrink-0", children: "Y (vert.)" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "range",
                        min: 0,
                        max: 100,
                        value: tarjaY,
                        onChange: (e) => setTarjaY(Number(e.target.value)),
                        className: "flex-1 h-1.5 accent-pink-500"
                      }
                    ),
                    /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-mono text-zinc-400 w-8 text-right", children: [
                      tarjaY,
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "relative w-full h-14 rounded-lg border border-zinc-700 overflow-hidden", style: { backgroundColor: "#252525" }, children: /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "absolute w-2.5 h-2.5 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 shadow-lg transition-all duration-75",
                      style: { left: `${tarjaX}%`, top: `${tarjaY}%`, backgroundColor: `hsla(${tarjaHue},${tarjaSaturation}%,50%,0.8)` }
                    }
                  ) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 border-t border-zinc-700 pt-3", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black uppercase tracking-widest text-zinc-500", children: "PNG Personalizado" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => tarjaFileInputRef.current?.click(),
                        className: "flex-1 px-3 py-2 rounded-xl border text-[9px] font-bold uppercase tracking-widest text-zinc-200 transition-all active:scale-95",
                        style: { backgroundColor: "#2a2a2a", borderColor: "#3a3a3a" },
                        children: "📁 PERSONALIZAR"
                      }
                    ),
                    tarjaCustomPng && /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => setTarjaCustomPng(null),
                        className: "px-3 py-2 rounded-xl border border-red-500/30 text-[9px] font-bold text-red-400 transition-all active:scale-95",
                        style: { backgroundColor: "#7f1d1d40" },
                        children: "✕ Remover"
                      }
                    )
                  ] }),
                  tarjaCustomPng && /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "w-full overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 flex items-center justify-center",
                      style: { aspectRatio: `${tarjaScaleX} / ${tarjaScaleY}` },
                      children: /* @__PURE__ */ jsx("img", { src: tarjaCustomPng, alt: "Tarja custom", className: "w-full h-full object-contain" })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      ref: tarjaFileInputRef,
                      type: "file",
                      accept: "image/png",
                      className: "hidden",
                      onChange: (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => setTarjaCustomPng(reader.result);
                        reader.readAsDataURL(file);
                        e.target.value = "";
                      }
                    }
                  )
                ] })
              ] })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "style",
      {
        dangerouslySetInnerHTML: {
          __html: `
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #3a3a3a; }
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `
        }
      }
    )
  ] });
}
function codecBadgeClass(codec) {
  switch (codec) {
    case "H.264":
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    case "H.265/HEVC":
      return "text-blue-400 bg-blue-500/10 border-blue-500/30";
    case "AV1":
      return "text-purple-400 bg-purple-500/10 border-purple-500/30";
    case "Verificando...":
      return "text-zinc-400 bg-zinc-700/40 border-zinc-600/30";
    case "Erro":
      return "text-red-400 bg-red-500/10 border-red-500/30";
    default:
      return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
  }
}
const ROLE_PERMISSIONS = {
  reporter: {
    name: "reporter",
    description: "Repórter de redação",
    permissions: [
      { action: "create", resource: "pauta", description: "Criar pautas" },
      { action: "read", resource: "pauta", description: "Ler pautas" },
      { action: "update", resource: "pauta", description: "Editar suas próprias pautas" },
      { action: "read", resource: "redacao", description: "Acessar redação" },
      { action: "create", resource: "redacao", description: "Escrever matérias" },
      { action: "read", resource: "metrics", description: "Ver métricas públicas" }
    ]
  },
  editor: {
    name: "editor",
    description: "Editor de conteúdo",
    permissions: [
      { action: "create", resource: "pauta", description: "Criar pautas" },
      { action: "read", resource: "pauta", description: "Ler todas as pautas" },
      { action: "update", resource: "pauta", description: "Editar todas as pautas" },
      { action: "delete", resource: "pauta", description: "Deletar pautas" },
      { action: "read", resource: "redacao", description: "Acessar redação" },
      { action: "update", resource: "redacao", description: "Editar matérias" },
      { action: "publish", resource: "redacao", description: "Publicar matérias" },
      { action: "read", resource: "espelho", description: "Acessar espelho" },
      { action: "update", resource: "espelho", description: "Editar espelho" },
      { action: "read", resource: "metrics", description: "Ver todas as métricas" }
    ]
  },
  chefe_redacao: {
    name: "chefe_redacao",
    description: "Editor-chefe/Chefe de Redação",
    permissions: [
      { action: "create", resource: "pauta", description: "Criar pautas" },
      { action: "read", resource: "pauta", description: "Ler todas as pautas" },
      { action: "update", resource: "pauta", description: "Editar todas as pautas" },
      { action: "delete", resource: "pauta", description: "Deletar pautas" },
      { action: "read", resource: "redacao", description: "Acessar redação" },
      { action: "update", resource: "redacao", description: "Editar matérias" },
      { action: "delete", resource: "redacao", description: "Deletar matérias" },
      { action: "publish", resource: "redacao", description: "Publicar matérias" },
      { action: "read", resource: "espelho", description: "Acessar espelho" },
      { action: "update", resource: "espelho", description: "Editar espelho" },
      { action: "delete", resource: "espelho", description: "Deletar espelho" },
      { action: "read", resource: "metrics", description: "Ver todas as métricas" },
      { action: "read", resource: "reports", description: "Ver relatórios" },
      { action: "manage", resource: "users", description: "Gerenciar usuários" }
    ]
  },
  admin: {
    name: "admin",
    description: "Administrador do sistema",
    permissions: [
      { action: "*", resource: "*", description: "Acesso total ao sistema" }
    ]
  }
};
class RBACManager {
  userRole = null;
  // ✅ FIX: cache do userId para uso síncrono em canEdit()
  userId = null;
  async initUser() {
    if (typeof window === "undefined") return null;
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.id) {
          this.userId = user.id;
          this.userRole = user.role || "reporter";
          return this.userRole;
        }
      } catch (e) {
        console.error("Erro ao processar usuário do localStorage", e);
      }
    }
    try {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        this.userId = data.user.id;
        this.userRole = data.user.user_metadata?.role || "reporter";
        return this.userRole;
      }
      return null;
    } catch (error) {
      console.error("Erro ao inicializar usuário RBAC:", error);
      return null;
    }
  }
  getCurrentRole() {
    return this.userRole;
  }
  canAccess(action, resource) {
    if (!this.userRole) return false;
    const roleDef = ROLE_PERMISSIONS[this.userRole];
    if (!roleDef) return false;
    return roleDef.permissions.some(
      (perm) => (perm.action === "*" || perm.action === action) && (perm.resource === "*" || perm.resource === resource)
    );
  }
  canEdit(resource, ownerId) {
    if (!this.userRole) return false;
    if (ownerId) {
      const isOwner = this.userId === ownerId;
      if (isOwner && this.canAccess("update", resource)) {
        return true;
      }
    }
    return this.canAccess("update", resource);
  }
  canDelete(resource, ownerId) {
    if (!this.userRole) return false;
    if (!["editor", "chefe_redacao", "admin"].includes(this.userRole)) {
      return false;
    }
    if (ownerId && this.userRole === "editor") {
      return false;
    }
    return this.canAccess("delete", resource);
  }
  getPermissions() {
    if (!this.userRole) return [];
    return ROLE_PERMISSIONS[this.userRole]?.permissions || [];
  }
  getRoleDescription() {
    if (!this.userRole) return "";
    return ROLE_PERMISSIONS[this.userRole]?.description || "";
  }
  // Validar no servidor antes de operações críticas
  async validateServerAccess(action, resource) {
    try {
      const { data, error } = await supabase.rpc("check_user_permission", {
        p_action: action,
        p_resource: resource
      });
      if (error) {
        console.error("Erro ao validar acesso no servidor:", error);
        return false;
      }
      return data === true;
    } catch (error) {
      console.error("Erro ao chamar RPC de validação:", error);
      return false;
    }
  }
}
const rbac = new RBACManager();
function useRBAC() {
  const [role, setRole] = React__default.useState(null);
  const [loading, setLoading] = React__default.useState(true);
  React__default.useEffect(() => {
    (async () => {
      const userRole = await rbac.initUser();
      setRole(userRole);
      setLoading(false);
    })();
  }, []);
  return {
    role,
    loading,
    can: (action, resource) => rbac.canAccess(action, resource),
    canEdit: (resource, ownerId) => rbac.canEdit(resource, ownerId),
    canDelete: (resource, ownerId) => rbac.canDelete(resource, ownerId),
    permissions: rbac.getPermissions()
  };
}
function Protected({ children }) {
  const { role, loading } = useRBAC();
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center text-muted-foreground text-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" }),
      /* @__PURE__ */ jsx("span", { children: "Autenticando acesso..." })
    ] }) });
  }
  if (!role) {
    return /* @__PURE__ */ jsx(Navigate, { to: "/login" });
  }
  return /* @__PURE__ */ jsx(AppShell, { children });
}
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
const Route$7 = createFileRoute("/pesquisa")({
  component: () => /* @__PURE__ */ jsx(Protected, { children: /* @__PURE__ */ jsx(PesquisaGeralPage, {}) }),
  head: () => ({ meta: [{ title: "Pesquisa Geral - DeskNews" }] })
});
function ymd$1(d) {
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
    let query = supabase.from("pautas").select("*").order("data_pauta", { ascending: false, nullsFirst: false }).limit(200);
    if (q.trim()) {
      const term = `%${q.trim()}%`;
      query = query.or(`retranca.ilike.${term},titulo.ilike.${term},reporter.ilike.${term},produtor.ilike.${term},proposta.ilike.${term},encaminhamento.ilike.${term}`);
    }
    if (from) query = query.gte("data_pauta", ymd$1(from));
    if (to) query = query.lte("data_pauta", ymd$1(to));
    const { data, error } = await query;
    setLoading(false);
    if (error) toast.error(error.message);
    else setResults(data ?? []);
  };
  useEffect(() => {
    search();
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 space-y-6 bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-primary)]/30", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border-b border-[var(--border-subtle)] pb-3 shrink-0", children: [
      /* @__PURE__ */ jsx(Search, { className: "h-5 w-5 text-[var(--text-quaternary)]" }),
      /* @__PURE__ */ jsx("h1", { className: "text-h1 font-bold tracking-tight text-[var(--text-primary)] [background:linear-gradient(135deg,_var(--text-primary)_0%,_var(--text-secondary)_100%)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] [background-clip:text]", children: "PESQUISA GERAL" }),
      /* @__PURE__ */ jsx("span", { className: "text-label text-[var(--text-tertiary)] hidden sm:inline", children: "Acervo historico · pautas" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl p-6 space-y-4 shadow-[var(--shadow-xl)]", children: [
      /* @__PURE__ */ jsx("label", { className: "text-label text-[var(--text-quaternary)] font-bold", children: "Filtrar Acervo" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-[1fr_200px_200px_auto] gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-quaternary)]" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              className: "w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-quaternary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300 pl-10 text-body-sm",
              placeholder: "Retranca, produtor, reporter...",
              value: q,
              onChange: (e) => setQ(e.target.value),
              onKeyDown: (e) => e.key === "Enter" && search()
            }
          )
        ] }),
        /* @__PURE__ */ jsx(DateField$1, { label: "De", value: from, onChange: setFrom }),
        /* @__PURE__ */ jsx(DateField$1, { label: "Ate", value: to, onChange: setTo }),
        /* @__PURE__ */ jsx(Button, { onClick: search, disabled: loading, className: "px-8 py-3 rounded-2xl text-body-sm font-semibold text-white bg-[var(--accent-primary)] shadow-[var(--shadow-lg)] transition-all duration-300 hover:shadow-[var(--shadow-xl)] active:scale-[0.98] relative overflow-hidden group/btn", children: /* @__PURE__ */ jsxs("span", { className: "relative z-10 flex items-center gap-2", children: [
          loading ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }),
          " Buscar"
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl overflow-hidden shadow-[var(--shadow-2xl)]", children: [
      results.length === 0 && !loading && /* @__PURE__ */ jsx("div", { className: "p-12 text-center text-body-sm text-[var(--text-tertiary)] italic", children: "Nenhuma reportagem encontrada para os termos ou periodo selecionados." }),
      /* @__PURE__ */ jsxs("div", { className: "divide-y divide-[var(--border-subtle)] overflow-y-auto max-h-[calc(100vh-18rem)]", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 bg-[var(--bg-overlay-2)] text-label text-[var(--text-tertiary)] font-bold", children: [
          results.length,
          " resultado(s)"
        ] }),
        results.map((p) => /* @__PURE__ */ jsxs("div", { className: "p-4 flex items-center justify-between gap-4 hover:bg-[var(--bg-overlay)] transition-all cursor-pointer group active:scale-[0.995]", onClick: () => setSelected(p), children: [
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsx("div", { className: "font-mono uppercase font-bold text-body-sm text-[var(--accent-primary)]", children: p.retranca || "(SEM RETRANCA)" }),
              p.tipo && /* @__PURE__ */ jsx("span", { className: "text-label px-1.5 py-0.5 rounded bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 uppercase font-bold", children: p.tipo })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-body-sm line-clamp-1 font-medium text-[var(--text-primary)]", children: p.titulo }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-2 text-caption text-[var(--text-tertiary)] font-mono", children: [
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(User, { className: "h-3 w-3" }),
                " ",
                p.produtor ?? "-"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Tag, { className: "h-3 w-3 text-[var(--text-quaternary)]" }),
                " ",
                p.reporter ?? "-"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-caption font-mono text-[var(--text-tertiary)] shrink-0", children: p.data_pauta ? (/* @__PURE__ */ new Date(p.data_pauta + "T00:00:00")).toLocaleDateString("pt-BR") : "-" })
        ] }, p.id))
      ] })
    ] }),
    selected && /* @__PURE__ */ jsx(PreviewModal, { pauta: selected, onClose: () => setSelected(null) })
  ] });
}
function DateField$1({ label, value, onChange }) {
  return /* @__PURE__ */ jsxs(Popover, { children: [
    /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, className: "w-full", children: /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "justify-start font-normal h-12 w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] hover:border-[var(--accent-primary)]/30 transition-all duration-300", children: [
      /* @__PURE__ */ jsx(CalendarIcon, { className: "h-4 w-4 mr-2 text-[var(--accent-primary)]" }),
      /* @__PURE__ */ jsxs("span", { className: "text-label text-[var(--text-quaternary)] font-bold mr-2", children: [
        label,
        ":"
      ] }),
      value ? value.toLocaleDateString("pt-BR") : "-"
    ] }) }),
    /* @__PURE__ */ jsx(PopoverContent, { className: "w-auto p-0 rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl shadow-[var(--shadow-2xl)]", align: "start", children: /* @__PURE__ */ jsx(Calendar, { mode: "single", selected: value, onSelect: onChange, className: "p-3 bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-2xl shadow-[var(--shadow-2xl)]" }) })
  ] });
}
function PreviewModal({ pauta, onClose }) {
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-xl flex items-center justify-center p-4 z-50", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { onClick: (e) => e.stopPropagation(), className: "bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl w-full max-w-2xl overflow-hidden shadow-[var(--shadow-2xl)] animate-in zoom-in-95 duration-200", children: [
    /* @__PURE__ */ jsxs("div", { className: "p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-overlay-2)] backdrop-blur-sm flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-label text-[var(--text-quaternary)] font-bold mb-1", children: "Visualizacao de Acervo" }),
        /* @__PURE__ */ jsx("h2", { className: "text-h2 font-bold tracking-tight text-[var(--text-primary)] uppercase", children: pauta.retranca || "(Sem Retranca)" })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "p-1.5 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-all duration-300", children: /* @__PURE__ */ jsx(Plus, { className: "h-7 w-7 rotate-45" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6 max-h-[70vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-2xl bg-[var(--bg-overlay)] border border-[var(--border-light)] shadow-inner", children: [
          /* @__PURE__ */ jsx("span", { className: "text-label text-[var(--text-quaternary)] block mb-1", children: "Data" }),
          /* @__PURE__ */ jsxs("div", { className: "text-body-sm font-mono flex items-center gap-2 text-[var(--text-primary)]", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3 text-[var(--text-tertiary)]" }),
            " ",
            pauta.data_pauta ? (/* @__PURE__ */ new Date(pauta.data_pauta + "T00:00:00")).toLocaleDateString("pt-BR") : "-"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-2xl bg-[var(--bg-overlay)] border border-[var(--border-light)] shadow-inner", children: [
          /* @__PURE__ */ jsx("span", { className: "text-label text-[var(--text-quaternary)] block mb-1", children: "Produtor" }),
          /* @__PURE__ */ jsx("div", { className: "text-body-sm font-medium text-[var(--text-primary)]", children: pauta.produtor || "-" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-2xl bg-[var(--bg-overlay)] border border-[var(--border-light)] shadow-inner", children: [
          /* @__PURE__ */ jsx("span", { className: "text-label text-[var(--text-quaternary)] block mb-1", children: "Reporter" }),
          /* @__PURE__ */ jsx("div", { className: "text-body-sm font-medium text-[var(--text-primary)]", children: pauta.reporter || "-" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("section", { className: "bg-[var(--bg-overlay)] border border-[var(--border-light)] rounded-2xl p-4 shadow-inner", children: [
          /* @__PURE__ */ jsx("span", { className: "text-label text-[var(--accent-primary)] font-bold block mb-2", children: "Proposta de Pauta" }),
          /* @__PURE__ */ jsx("p", { className: "text-body-sm leading-relaxed whitespace-pre-wrap text-[var(--text-secondary)] italic", children: pauta.proposta || "-" })
        ] }),
        pauta.encaminhamento && /* @__PURE__ */ jsxs("section", { className: "bg-[var(--bg-overlay)] border border-[var(--border-light)] rounded-2xl p-4 shadow-inner", children: [
          /* @__PURE__ */ jsx("span", { className: "text-label text-[var(--text-quaternary)] font-bold block mb-2", children: "Encaminhamento" }),
          /* @__PURE__ */ jsx("p", { className: "text-caption leading-relaxed whitespace-pre-wrap text-[var(--text-secondary)] font-mono", children: pauta.encaminhamento })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "p-6 bg-[var(--bg-overlay-2)] backdrop-blur-sm border-t border-[var(--border-subtle)] flex justify-end", children: /* @__PURE__ */ jsx(Button, { onClick: onClose, className: "px-8 py-3 rounded-2xl bg-[var(--accent-primary)] text-white font-bold text-body-sm transition-all duration-300 hover:shadow-[var(--shadow-xl)] active:scale-[0.98] shadow-[var(--shadow-lg)]", children: "FECHAR" }) })
  ] }) });
}
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const fetchPortais = createServerFn({
  method: "GET"
}).handler(createSsrRpc("5b84dd6bae09f625244fad5fee7756a6109e2c06693485ab5f78995fc67389e4"));
const Route$6 = createFileRoute("/pautas")({
  component: () => /* @__PURE__ */ jsx(PautasPage, {}),
  head: () => ({ meta: [{ title: "Pautas — DeskNews" }] })
});
const sanitize$1 = (v) => v.replace(/<[^>]*>?/gm, "").trim();
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
  const tabs = [
    { k: "quadro", label: "Quadro Semanal", icon: LayoutGrid },
    { k: "form", label: "Pauta", icon: FileText },
    { k: "search", label: "Pesquisar", icon: Search },
    { k: "avisos", label: "Avisos", icon: Megaphone },
    { k: "gaveta", label: "Gaveta", icon: Archive },
    { k: "portais", label: "Portais", icon: Rss }
  ];
  const handleEdit = (p) => {
    setPautaToEdit(p);
    if (p.data_pauta) setPautaDate(/* @__PURE__ */ new Date(p.data_pauta + "T00:00:00"));
    setTab("form");
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border-b border-[var(--border-light)] pb-3", children: [
      /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5 text-[var(--accent-primary)]" }),
      /* @__PURE__ */ jsx("h1", { className: "font-mono uppercase tracking-widest text-sm sm:text-base", children: "Pautas" }),
      /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-widest text-[var(--text-secondary)] hidden sm:inline", children: "Redação · controle editorial" })
    ] }),
    /* @__PURE__ */ jsx("nav", { className: "flex gap-1 overflow-x-auto border-b border-[var(--border-light)] -mx-1 px-1", children: tabs.map(({ k, label, icon: Icon }) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => {
          setTab(k);
          if (k !== "form") setPautaToEdit(null);
        },
        className: cn(
          "px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5",
          tab === k ? "border-[var(--accent-primary)] text-[var(--accent-primary))]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--accent-primary))]"
        ),
        children: [
          /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }),
          " ",
          label
        ]
      },
      k
    )) }),
    /* @__PURE__ */ jsxs("div", { children: [
      tab === "quadro" && /* @__PURE__ */ jsx(QuadroSemanal, {}),
      tab === "form" && /* @__PURE__ */ jsx(
        FormularioPauta,
        {
          initialPauta: pautaToEdit,
          initialDate: pautaDate,
          onEditingChange: (p, d) => {
            setPautaToEdit(p);
            if (d) setPautaDate(d);
          }
        }
      ),
      tab === "search" && /* @__PURE__ */ jsx(SearchPautas, { onEdit: handleEdit }),
      tab === "avisos" && /* @__PURE__ */ jsx(AvisosPanel, {}),
      tab === "gaveta" && /* @__PURE__ */ jsx(GavetaVTs, {}),
      tab === "portais" && /* @__PURE__ */ jsx(PortaisPanel, {})
    ] })
  ] });
}
const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
function startOfWeek(d) {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const r = new Date(d);
  r.setDate(d.getDate() + diff);
  r.setHours(0, 0, 0, 0);
  return r;
}
function QuadroSemanal() {
  const user = null;
  const [weekStart, setWeekStart] = useState(() => startOfWeek(/* @__PURE__ */ new Date()));
  const [cards, setCards] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = useCallback(async () => {
    const { data, error } = await supabase.from("quadro_cards").select("*").eq("semana_inicio", ymd(weekStart)).order("ordem", { ascending: true });
    if (error) toast.error(error.message);
    else setCards(data ?? []);
  }, [weekStart]);
  useEffect(() => {
    load();
  }, [load]);
  const remove = async (id) => {
    if (!window.confirm("Remover este card?")) return;
    const { error } = await supabase.from("quadro_cards").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };
  const navWeek = (delta) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(d);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => navWeek(-1), children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm font-mono", children: [
        "Semana de ",
        /* @__PURE__ */ jsx("strong", { children: weekStart.toLocaleDateString("pt-BR") })
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => navWeek(1), children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setWeekStart(startOfWeek(/* @__PURE__ */ new Date())), children: "Hoje" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "hidden md:grid grid-cols-[120px_1fr_1fr] gap-2", children: [
      /* @__PURE__ */ jsx("div", {}),
      /* @__PURE__ */ jsx("div", { className: "text-center text-[10px] uppercase tracking-[.2em] text-[var(--accent-primary)] font-bold py-2", children: "Manhã" }),
      /* @__PURE__ */ jsx("div", { className: "text-center text-[10px] uppercase tracking-[.2em] text-[var(--accent-primary)] font-bold py-2", children: "Tarde" }),
      DIAS.map((dia, i) => /* @__PURE__ */ jsx(
        DayRow,
        {
          dia,
          idx: i,
          cards,
          onRemove: remove,
          onEdit: (c) => setEditing({ dia: i, turno: c.turno, card: c }),
          onAdd: (turno) => setEditing({ dia: i, turno })
        },
        i
      ))
    ] }),
    /* @__PURE__ */ jsx("div", { className: "md:hidden space-y-3", children: DIAS.map((dia, i) => /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-[var(--border-light)] bg-[var(--bg-primary)] p-3", children: [
      /* @__PURE__ */ jsx("div", { className: "font-bold mb-2 uppercase text-sm tracking-wider", children: dia }),
      ["manha", "tarde"].map((t) => /* @__PURE__ */ jsxs("div", { className: "mb-2", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase text-[var(--accent-primary)] tracking-widest mb-1", children: t === "manha" ? "Manhã" : "Tarde" }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-[var(--border-light)] bg-[var(--bg-secondary)] p-2 space-y-2 min-h-[80px]", children: [
          cards.filter((c) => c.dia_semana === i && c.turno === t).map((c) => /* @__PURE__ */ jsx(
            CardMini,
            {
              c,
              onRemove: () => remove(c.id),
              onEdit: () => setEditing({ dia: i, turno: t, card: c })
            },
            c.id
          )),
          /* @__PURE__ */ jsxs(
            "button",
            {
              className: "text-xs text-[var(--text-secondary)] hover:text-[var(--accent-primary)] flex items-center gap-1",
              onClick: () => setEditing({ dia: i, turno: t }),
              children: [
                /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" }),
                " adicionar"
              ]
            }
          )
        ] })
      ] }, t))
    ] }, i)) }),
    editing && user
  ] });
}
function DayRow({ dia, idx, cards, onAdd, onEdit, onRemove }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center font-bold uppercase text-sm tracking-wider px-2", children: dia }),
    ["manha", "tarde"].map((t) => /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-[var(--border-light)] bg-[var(--bg-primary)] p-2 space-y-2 min-h-[120px]", children: [
      cards.filter((c) => c.dia_semana === idx && c.turno === t).map((c) => /* @__PURE__ */ jsx(CardMini, { c, onRemove: () => onRemove(c.id), onEdit: () => onEdit(c) }, c.id)),
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: "text-xs text-[var(--text-secondary)] hover:text-[var(--accent-primary)] flex items-center gap-1",
          onClick: () => onAdd(t),
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" }),
            " adicionar"
          ]
        }
      )
    ] }, t))
  ] });
}
function CardMini({ c, onRemove, onEdit }) {
  return /* @__PURE__ */ jsxs("div", { className: cn(
    "group rounded-xl border border-white/5 bg-white/5 p-3",
    "transition-all duration-300 hover:bg-white/10 hover:border-primary/50",
    "hover:shadow-[0_0_20px_rgba(40,100,255,0.1)] hover:-translate-y-0.5",
    "cursor-pointer"
  ), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2 min-w-0", children: [
        /* @__PURE__ */ jsx("div", { className: "font-mono uppercase font-bold text-sm tracking-wide truncate", children: c.retranca }),
        c.horario && /* @__PURE__ */ jsx("span", { className: "text-[11px] text-[var(--accent-primary)] font-mono shrink-0", children: c.horario })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              onEdit();
            },
            className: "text-[var(--text-secondary)] hover:text-[var(--accent-primary)] p-1",
            children: /* @__PURE__ */ jsx(Pencil, { className: "h-3.5 w-3.5" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              onRemove();
            },
            className: "text-[var(--text-secondary)] hover:text-red-500 p-1",
            children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" })
          }
        )
      ] })
    ] }),
    c.reporter && /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-[var(--text-secondary)] truncate", children: [
      "Prod: ",
      c.reporter
    ] })
  ] });
}
const inputCls = "w-full bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-md px-3 py-2 text-sm outline-none focus:border-[var(--accent-primary)] transition-colors";
const labelCls = "text-[10px] uppercase tracking-[.18em] text-[var(--accent-primary)] font-bold mb-1 block";
function Label({ children }) {
  return /* @__PURE__ */ jsx("label", { className: labelCls, children });
}
const Block = ({ n, title, children, action }) => /* @__PURE__ */ jsxs("div", { className: "bg-[var(--bg-overlay)] rounded-2xl border border-white/5 p-6 relative overflow-hidden group", children: [
  /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-transparent opacity-60" }),
  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-[var(--accent-primary)] text-[10px] font-bold", children: n }),
      /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[.2em] text-[var(--accent-primary)] font-bold opacity-90", children: title })
    ] }),
    action
  ] }),
  /* @__PURE__ */ jsx("div", { className: "relative z-10", children })
] });
function FormularioPauta({
  initialPauta,
  initialDate,
  onEditingChange
}) {
  const [pautas, setPautas] = useState([]);
  const [editing, setEditing] = useState(initialPauta);
  const [date, setDate] = useState(initialDate);
  useEffect(() => {
    setEditing(initialPauta);
    setDate(initialDate);
  }, [initialPauta, initialDate]);
  const remove = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Deseja excluir esta pauta sem retranca?")) return;
    const { error } = await supabase.from("pautas").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      if (editing?.id === id) setEditing(null);
      load();
    }
  };
  const load = useCallback(async () => {
    const dStr = ymd(date);
    const { data, error } = await supabase.from("pautas").select("*").or(
      `data_pauta.eq.${dStr},and(data_pauta.is.null,created_at.gte.${dStr}T00:00:00,created_at.lt.${dStr}T23:59:59)`
    ).order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setPautas(data ?? []);
  }, [date]);
  useEffect(() => {
    load();
  }, [load]);
  const create = async () => {
    return;
  };
  const isToday = ymd(date) === ymd(/* @__PURE__ */ new Date());
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6", children: [
    /* @__PURE__ */ jsxs("aside", { className: "bg-[var(--bg-overlay)] rounded-2xl border border-white/10 p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3 gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-widest text-[var(--text-secondary)]", children: isToday ? "Pautas de hoje" : "Pautas do dia" }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: create, children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" }),
          " Nova"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxs(Popover, { children: [
          /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "flex-1 justify-start font-normal", children: [
            /* @__PURE__ */ jsx(CalendarIcon, { className: "h-3.5 w-3.5 mr-2" }),
            date.toLocaleDateString("pt-BR")
          ] }) }),
          /* @__PURE__ */ jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: /* @__PURE__ */ jsx(Calendar, { mode: "single", selected: date, onSelect: (d) => d && setDate(d), className: cn("p-3 pointer-events-auto") }) })
        ] }),
        !isToday && /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => setDate(/* @__PURE__ */ new Date()), children: "Hoje" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1 max-h-[60vh] overflow-y-auto", children: [
        pautas.map((p) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              setEditing(p);
              onEditingChange(p);
            },
            className: cn(
              "w-full text-left p-2 rounded-md border text-sm transition-colors",
              editing?.id === p.id ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10" : "border-[var(--border-light)] hover:border-[var(--accent-primary)]/40 bg-[var(--bg-secondary)]"
            ),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsx("div", { className: "font-mono uppercase text-xs text-[var(--accent-primary)] truncate", children: p.retranca || "(sem retranca)" }),
                !p.retranca && /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: (e) => remove(p.id, e),
                    className: "p-1 rounded hover:bg-red-500/10 text-[var(--text-secondary)]/40 hover:text-red-500 transition-colors",
                    children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-[var(--text-secondary)] truncate", children: p.titulo })
            ]
          },
          p.id
        )),
        !pautas.length && /* @__PURE__ */ jsx("div", { className: "text-xs text-[var(--text-secondary)] p-2 italic", children: "Nenhuma pauta neste dia." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("section", { children: editing ? /* @__PURE__ */ jsx(PautaForm, { initial: editing, userId: "", onSaved: load }, editing.id || "new") : /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)] p-10 text-center text-[var(--text-secondary)]", children: "Selecione uma pauta ou crie uma nova." }) })
  ] });
}
function parseFontes(sonora) {
  if (!sonora) return [{ id: Date.now(), sonora: "", contato: "" }];
  if (sonora.startsWith("[")) {
    try {
      const parsed = JSON.parse(sonora);
      if (Array.isArray(parsed)) return parsed;
    } catch {
    }
  }
  return [{ id: Date.now(), sonora, contato: "" }];
}
function PautaForm({ initial, userId, onSaved }) {
  const [p, setP] = useState(initial);
  const [fontes, setFontes] = useState(() => parseFontes(initial.sonora));
  const [saving, setSaving] = useState(false);
  const fontesRef = useRef(fontes);
  useEffect(() => {
    fontesRef.current = fontes;
  }, [fontes]);
  useEffect(() => {
    if (p.retranca) {
      localStorage.setItem(
        `pauta_draft_${p.id || "new"}`,
        JSON.stringify({ p, fontes: fontesRef.current, ts: Date.now() })
      );
    }
  }, [p]);
  const set = (k, v) => setP((s) => ({ ...s, [k]: v }));
  const handleAddFonte = () => {
    setFontes((prev) => [...prev, { id: Date.now(), sonora: "", contato: "" }]);
  };
  const handleUpdateFonte = (id, field, value) => {
    setFontes((prev) => prev.map((f) => f.id === id ? { ...f, [field]: value } : f));
  };
  const handleRemoveFonte = (id) => {
    if (fontes.length > 1 && window.confirm("Remover esta fonte?")) {
      setFontes((prev) => prev.filter((f) => f.id !== id));
    }
  };
  const save = async () => {
    if (!p.retranca?.trim()) {
      toast.error("Informe a retranca");
      return;
    }
    setSaving(true);
    const sanitizedFontes = fontes.map((f) => ({
      ...f,
      sonora: sanitize$1(f.sonora),
      contato: sanitize$1(f.contato)
    }));
    const payload = {
      titulo: sanitize$1(p.titulo || p.retranca || ""),
      retranca: sanitize$1(p.retranca || ""),
      tipo: p.tipo,
      turno: p.turno,
      data_pauta: p.data_pauta || null,
      reporter: p.reporter,
      imagens: p.imagens,
      produtor: p.produtor,
      horario: p.horario,
      local: p.local,
      sonora: JSON.stringify(sanitizedFontes),
      contato: "",
      proposta: sanitize$1(p.proposta || ""),
      encaminhamento: sanitize$1(p.encaminhamento || ""),
      observacoes: sanitize$1(p.observacoes || "")
    };
    if (p.id) {
      const { error } = await supabase.from("pautas").update(payload).eq("id", p.id);
      setSaving(false);
      if (error) toast.error(error.message);
      else {
        toast.success("Pauta salva");
        onSaved();
      }
    } else {
      const { data, error } = await supabase.from("pautas").insert({ ...payload, criado_por: userId }).select().single();
      setSaving(false);
      if (error) toast.error(error.message);
      else {
        toast.success("Pauta criada");
        setP(data);
        onSaved();
      }
    }
  };
  const gerarPDF = () => window.print();
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 justify-end", children: [
      /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: gerarPDF, children: [
        /* @__PURE__ */ jsx(Printer, { className: "h-4 w-4" }),
        " Gerar PDF"
      ] }),
      /* @__PURE__ */ jsx(Button, { onClick: save, disabled: saving, children: saving ? "Salvando..." : "Salvar Pauta" })
    ] }),
    /* @__PURE__ */ jsx(Block, { n: "1", title: "Identificação", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Retranca" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: inputCls + " font-mono uppercase font-bold",
            value: p.retranca ?? "",
            onChange: (e) => set("retranca", e.target.value.toUpperCase()),
            placeholder: "EX: TRÂNSITO CENTRO"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Tipo" }),
        /* @__PURE__ */ jsx("select", { className: inputCls, value: p.tipo ?? "VT", onChange: (e) => set("tipo", e.target.value), children: TIPOS.map((t) => /* @__PURE__ */ jsx("option", { children: t }, t)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Data" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            className: inputCls,
            value: p.data_pauta ?? "",
            onChange: (e) => set("data_pauta", e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Turno" }),
        /* @__PURE__ */ jsx("select", { className: inputCls, value: p.turno ?? "Manhã", onChange: (e) => set("turno", e.target.value), children: TURNOS.map((t) => /* @__PURE__ */ jsx("option", { children: t }, t)) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(Block, { n: "2", title: "Equipe Técnica", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Repórter" }),
          /* @__PURE__ */ jsx("input", { className: inputCls, value: p.reporter ?? "", onChange: (e) => set("reporter", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Imagens" }),
          /* @__PURE__ */ jsx("input", { className: inputCls, value: p.imagens ?? "", onChange: (e) => set("imagens", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Produtor" }),
          /* @__PURE__ */ jsx("input", { className: inputCls, value: p.produtor ?? "", onChange: (e) => set("produtor", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-[180px_1fr] gap-3 mt-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(Label, { children: [
            /* @__PURE__ */ jsx(Clock, { className: "inline h-3 w-3" }),
            " Horário"
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: inputCls + " font-mono",
              placeholder: "09:30",
              value: p.horario ?? "",
              onChange: (e) => set("horario", e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Local de gravação" }),
          /* @__PURE__ */ jsx("input", { className: inputCls, value: p.local ?? "", onChange: (e) => set("local", e.target.value) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      Block,
      {
        n: "3",
        title: "Dados da Fonte",
        action: /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: handleAddFonte,
            className: "flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-gray-300 hover:text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors border border-zinc-800",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" }),
              " Adicionar Fonte"
            ]
          }
        ),
        children: /* @__PURE__ */ jsx("div", { className: "space-y-6", children: fontes.map((fonte, index) => /* @__PURE__ */ jsxs("div", { className: "space-y-4 pt-2 relative group border-b border-white/5 pb-6 last:border-0 last:pb-0", children: [
          fontes.length > 1 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold", children: [
              "Fonte #",
              index + 1
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => handleRemoveFonte(fonte.id),
                className: "text-[var(--accent-primary)] hover:text-red-400 text-[10px] uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity",
                children: "Remover"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Sonora — Nome e Cargo" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: "w-full bg-zinc-900/40 text-sm text-gray-200 px-3 py-2 rounded border border-zinc-800 focus:border-primary/50 focus:outline-none placeholder-zinc-700 transition-colors uppercase font-medium",
                value: fonte.sonora,
                onChange: (e) => handleUpdateFonte(fonte.id, "sonora", e.target.value),
                placeholder: "Digite o nome e cargo da sonora..."
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3", children: [
            /* @__PURE__ */ jsx(Label, { children: "Contato e Instruções" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                rows: 2,
                className: "w-full bg-zinc-900/40 text-sm text-gray-200 px-3 py-2 rounded border border-zinc-800 focus:border-primary/50 focus:outline-none placeholder-zinc-700 transition-colors font-medium",
                value: fonte.contato,
                onChange: (e) => handleUpdateFonte(fonte.id, "contato", e.target.value),
                placeholder: "Telefone, instruções de acesso, etc."
              }
            )
          ] })
        ] }, fonte.id)) })
      }
    ),
    /* @__PURE__ */ jsxs(Block, { n: "4", title: "Conteúdo", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Proposta" }),
        /* @__PURE__ */ jsx("textarea", { rows: 3, className: inputCls, value: p.proposta ?? "", onChange: (e) => set("proposta", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-3", children: [
        /* @__PURE__ */ jsx(Label, { children: "Encaminhamento / Roteiro" }),
        /* @__PURE__ */ jsx("textarea", { rows: 6, className: inputCls, value: p.encaminhamento ?? "", onChange: (e) => set("encaminhamento", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-3", children: [
        /* @__PURE__ */ jsx(Label, { children: "Sugestão de imagens / Observações" }),
        /* @__PURE__ */ jsx("textarea", { rows: 3, className: inputCls, value: p.observacoes ?? "", onChange: (e) => set("observacoes", e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "dn-print", style: { display: "none" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { borderBottom: "3px solid #b8860b", paddingBottom: 12, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
        /* @__PURE__ */ jsx("h1", { style: { margin: 0, fontSize: 24, fontWeight: "bold" }, children: "DeskNews · Pauta" }),
        /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: "#666" }, children: [
          "Gerado em: ",
          (/* @__PURE__ */ new Date()).toLocaleString("pt-BR")
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "20px" }, children: [
        /* @__PURE__ */ jsxs("div", { style: { marginBottom: 20, border: "1px solid #eee", padding: 12, borderRadius: 4 }, children: [
          /* @__PURE__ */ jsx("div", { style: { fontSize: 10, color: "#b8860b", fontWeight: "bold", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.1em" }, children: "1. Identificação" }),
          /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 15 }, children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 9, color: "#999", textTransform: "uppercase" }, children: "Retranca" }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 14, fontWeight: "bold" }, children: p.retranca || "—" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 9, color: "#999", textTransform: "uppercase" }, children: "Tipo" }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12 }, children: p.tipo || "—" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 9, color: "#999", textTransform: "uppercase" }, children: "Data" }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12 }, children: p.data_pauta ? (/* @__PURE__ */ new Date(p.data_pauta + "T00:00:00")).toLocaleDateString("pt-BR") : "—" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 9, color: "#999", textTransform: "uppercase" }, children: "Turno" }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12 }, children: p.turno || "—" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { marginBottom: 20, border: "1px solid #eee", padding: 12, borderRadius: 4 }, children: [
          /* @__PURE__ */ jsx("div", { style: { fontSize: 10, color: "#b8860b", fontWeight: "bold", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.1em" }, children: "2. Equipe Técnica" }),
          /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 15, marginBottom: 12 }, children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 9, color: "#999", textTransform: "uppercase" }, children: "Repórter" }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12 }, children: p.reporter || "—" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 9, color: "#999", textTransform: "uppercase" }, children: "Imagens" }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12 }, children: p.imagens || "—" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 9, color: "#999", textTransform: "uppercase" }, children: "Produtor" }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12 }, children: p.produtor || "—" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "120px 1fr", gap: 15 }, children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 9, color: "#999", textTransform: "uppercase" }, children: "Horário" }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: "bold" }, children: p.horario || "—" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 9, color: "#999", textTransform: "uppercase" }, children: "Local de gravação" }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12 }, children: p.local || "—" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { marginBottom: 20, border: "1px solid #eee", padding: 12, borderRadius: 4 }, children: [
          /* @__PURE__ */ jsx("div", { style: { fontSize: 10, color: "#b8860b", fontWeight: "bold", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.1em" }, children: "3. Dados da Fonte" }),
          fontes.map((f, i) => /* @__PURE__ */ jsxs("div", { style: { marginBottom: i === fontes.length - 1 ? 0 : 15, borderBottom: i === fontes.length - 1 ? "none" : "1px dashed #eee", paddingBottom: i === fontes.length - 1 ? 0 : 10 }, children: [
            /* @__PURE__ */ jsxs("div", { style: { marginBottom: 5 }, children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 9, color: "#999", textTransform: "uppercase" }, children: "Sonora — nome e cargo" }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12, fontWeight: "bold" }, children: f.sonora || "—" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 9, color: "#999", textTransform: "uppercase" }, children: "Contato e instruções" }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12 }, children: f.contato || "—" })
            ] })
          ] }, i))
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { border: "1px solid #eee", padding: 12, borderRadius: 4 }, children: [
          /* @__PURE__ */ jsx("div", { style: { fontSize: 10, color: "#b8860b", fontWeight: "bold", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.1em" }, children: "4. Conteúdo" }),
          /* @__PURE__ */ jsxs("div", { style: { marginBottom: 15 }, children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 9, color: "#999", textTransform: "uppercase", marginBottom: 4 }, children: "Proposta" }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 12, whiteSpace: "pre-wrap", lineHeight: "1.4" }, children: p.proposta || "—" })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { marginBottom: 15 }, children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 9, color: "#999", textTransform: "uppercase", marginBottom: 4 }, children: "Encaminhamento / Roteiro" }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 12, whiteSpace: "pre-wrap", lineHeight: "1.4" }, children: p.encaminhamento || "—" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 9, color: "#999", textTransform: "uppercase", marginBottom: 4 }, children: "Sugestão de imagens / Observações" }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 12, whiteSpace: "pre-wrap", lineHeight: "1.4" }, children: p.observacoes || "—" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: `
        @media print {
          body * { visibility:hidden !important; }
          .dn-print, .dn-print * { visibility:visible !important; }
          .dn-print { display:block !important; position:absolute; left:0; top:0; width:100%; background:#fff !important; color:#000 !important; padding:20px; }
        }
      ` } })
  ] });
}
function SearchPautas({ onEdit }) {
  const [q, setQ] = useState("");
  const [from, setFrom] = useState();
  const [to, setTo] = useState();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(null);
  const search = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("pautas").select("*").order("data_pauta", { ascending: false, nullsFirst: false }).limit(200);
    if (q.trim()) {
      const sanitizedTerm = q.trim().replace(/[,()]/g, "");
      const term = `%${sanitizedTerm}%`;
      query = query.or(
        `retranca.ilike.${term},titulo.ilike.${term},reporter.ilike.${term},produtor.ilike.${term},proposta.ilike.${term},encaminhamento.ilike.${term}`
      );
    }
    if (from) query = query.gte("data_pauta", ymd(from));
    if (to) query = query.lte("data_pauta", ymd(to));
    const { data, error } = await query;
    setLoading(false);
    if (error) toast.error(error.message);
    else setResults(data ?? []);
  }, [q, from, to]);
  useEffect(() => {
    search();
  }, []);
  const clearFilters = () => {
    setQ("");
    setFrom(void 0);
    setTo(void 0);
  };
  useEffect(() => {
    if (!q && !from && !to) search();
  }, [q, from, to, search]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)] p-4 space-y-3", children: [
      /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[.2em] text-[var(--accent-primary)] font-bold", children: "Pesquisa Geral de Reportagens" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-[1fr_180px_180px_auto] gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: inputCls + " pl-9",
              placeholder: "Buscar por retranca, produtor, repórter...",
              value: q,
              onChange: (e) => setQ(e.target.value),
              onKeyDown: (e) => e.key === "Enter" && search()
            }
          )
        ] }),
        /* @__PURE__ */ jsx(DateField, { label: "De", value: from, onChange: setFrom }),
        /* @__PURE__ */ jsx(DateField, { label: "Até", value: to, onChange: setTo }),
        /* @__PURE__ */ jsxs(Button, { onClick: search, disabled: loading, children: [
          loading ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }),
          " Buscar"
        ] })
      ] }),
      (q || from || to) && /* @__PURE__ */ jsx(
        "button",
        {
          className: "text-xs text-[var(--text-secondary)] hover:text-[var(--accent-primary)]",
          onClick: clearFilters,
          children: "limpar filtros"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)] overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "px-4 py-2 border-b border-[var(--border-light)] text-xs text-[var(--text-secondary)]", children: [
        results.length,
        " resultado(s)"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "divide-y divide-border max-h-[60vh] overflow-y-auto", children: [
        results.map((p) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setOpen(p),
            className: "w-full text-left p-3 hover:bg-[var(--accent-primary)]/5 transition-colors",
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("div", { className: "font-mono uppercase font-bold text-sm text-[var(--accent-primary)] truncate", children: p.retranca || "(sem retranca)" }),
                /* @__PURE__ */ jsx("div", { className: "text-sm truncate", children: p.titulo }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs text-[var(--text-secondary)] truncate", children: [
                  "Prod: ",
                  p.produtor ?? "—",
                  " · Rep: ",
                  p.reporter ?? "—",
                  p.tipo ? ` · ${p.tipo}` : ""
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-xs font-mono text-[var(--text-secondary)] shrink-0", children: p.data_pauta ? (/* @__PURE__ */ new Date(p.data_pauta + "T00:00:00")).toLocaleDateString("pt-BR") : "—" })
            ] })
          },
          p.id
        )),
        !results.length && !loading && /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-sm text-[var(--text-secondary)] italic", children: "Nenhuma pauta encontrada." })
      ] })
    ] }),
    open && /* @__PURE__ */ jsx(PautaPreviewModal, { pauta: open, onClose: () => setOpen(null), onEdit })
  ] });
}
function PautaPreviewModal({ pauta, onClose, onEdit }) {
  const dynamicFontes = useMemo(() => {
    if (pauta.sonora?.startsWith("[")) {
      try {
        return JSON.parse(pauta.sonora);
      } catch {
      }
    }
    return null;
  }, [pauta.sonora]);
  const rows = [
    ["Tipo", pauta.tipo],
    ["Data", pauta.data_pauta],
    ["Turno", pauta.turno],
    ["Repórter", pauta.reporter],
    ["Imagens", pauta.imagens],
    ["Produtor", pauta.produtor],
    ["Horário", pauta.horario],
    ["Local", pauta.local],
    ...dynamicFontes ? [] : [["Sonora", pauta.sonora], ["Contato", pauta.contato]],
    ["Proposta", pauta.proposta],
    ["Encaminhamento", pauta.encaminhamento],
    ["Observações", pauta.observacoes]
  ];
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 bg-[var(--bg-secondary)]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50",
      onClick: onClose,
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          onClick: (e) => e.stopPropagation(),
          className: "rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)] p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-4 gap-3", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "font-mono uppercase font-bold text-lg text-[var(--accent-primary)]", children: pauta.retranca }),
                /* @__PURE__ */ jsx("div", { className: "text-sm text-[var(--text-secondary)]", children: pauta.titulo })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => onEdit(pauta), className: "gap-1.5", children: [
                  /* @__PURE__ */ jsx(Pencil, { className: "h-3.5 w-3.5" }),
                  " Editar"
                ] }),
                /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, children: "Fechar" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              rows.map(([k, v]) => v ? /* @__PURE__ */ jsxs("div", { className: "border-b border-[var(--border-light)] pb-2", children: [
                /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-widest text-[var(--accent-primary)] font-bold", children: k }),
                /* @__PURE__ */ jsx("div", { className: "text-sm whitespace-pre-wrap", children: v })
              ] }, k) : null),
              dynamicFontes?.map((f, i) => /* @__PURE__ */ jsxs("div", { className: "border-b border-[var(--border-light)] pb-2 last:border-0", children: [
                /* @__PURE__ */ jsxs("div", { className: "text-[10px] uppercase tracking-widest text-[var(--accent-primary)] font-bold", children: [
                  "Fonte #",
                  i + 1
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-[var(--accent-primary)]", children: f.sonora || "—" }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-[var(--text-secondary)] whitespace-pre-wrap", children: f.contato || "—" })
                ] })
              ] }, i))
            ] })
          ]
        }
      )
    }
  );
}
function DateField({ label, value, onChange }) {
  return /* @__PURE__ */ jsxs(Popover, { children: [
    /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "justify-start font-normal h-9", children: [
      /* @__PURE__ */ jsx(CalendarIcon, { className: "h-3.5 w-3.5 mr-2" }),
      /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-wider text-[var(--text-secondary)] mr-2", children: label }),
      value ? value.toLocaleDateString("pt-BR") : "—"
    ] }) }),
    /* @__PURE__ */ jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: /* @__PURE__ */ jsx(Calendar, { mode: "single", selected: value, onSelect: onChange, className: cn("p-3 pointer-events-auto") }) })
  ] });
}
function AvisosPanel() {
  const user = null;
  const [items, setItems] = useState([]);
  const [assunto, setAssunto] = useState("");
  const [data, setData] = useState(/* @__PURE__ */ new Date());
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    const { data: rows, error } = await supabase.from("avisos").select("*").order("data", { ascending: false }).limit(200);
    if (error) toast.error(error.message);
    else setItems(rows ?? []);
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const add = async (e) => {
    e.preventDefault();
    if (!assunto.trim() || !user) return;
  };
  const remove = async (id) => {
    const { error } = await supabase.from("avisos").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4", children: [
    /* @__PURE__ */ jsxs("form", { onSubmit: add, className: "rounded-lg border border-[var(--border-light)] border-l-4 border-l-accent bg-[var(--bg-primary)] p-4 space-y-3 h-fit", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-[10px] uppercase tracking-[.2em] text-[var(--accent-primary)] font-bold flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Megaphone, { className: "h-3.5 w-3.5" }),
        " Novo aviso"
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Assunto" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            required: true,
            rows: 3,
            className: inputCls,
            value: assunto,
            onChange: (e) => setAssunto(e.target.value),
            placeholder: "Ex.: Reunião de pauta às 15h"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Data" }),
        /* @__PURE__ */ jsxs(Popover, { children: [
          /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { type: "button", variant: "outline", className: "w-full justify-start font-normal", children: [
            /* @__PURE__ */ jsx(CalendarIcon, { className: "h-3.5 w-3.5 mr-2" }),
            data.toLocaleDateString("pt-BR")
          ] }) }),
          /* @__PURE__ */ jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: /* @__PURE__ */ jsx(Calendar, { mode: "single", selected: data, onSelect: (d) => d && setData(d), className: cn("p-3 pointer-events-auto") }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: saving, className: "w-full", children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        " Publicar aviso"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)] overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "px-4 py-2 border-b border-[var(--border-light)] text-xs text-[var(--text-secondary)]", children: [
        items.length,
        " aviso(s)"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "divide-y divide-border max-h-[70vh] overflow-y-auto", children: [
        items.map((a) => /* @__PURE__ */ jsxs("div", { className: "p-3 flex items-start justify-between gap-3 group", children: [
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm whitespace-pre-wrap", children: a.assunto }),
            /* @__PURE__ */ jsx("div", { className: "text-xs font-mono text-[var(--accent-primary)] mt-1", children: (/* @__PURE__ */ new Date(a.data + "T00:00:00")).toLocaleDateString("pt-BR") })
          ] }),
          user?.id === a.autor_id && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => remove(a.id),
              className: "opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-red-500 transition-opacity",
              children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
            }
          )
        ] }, a.id)),
        !items.length && /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-sm text-[var(--text-secondary)] italic", children: "Nenhum aviso." })
      ] })
    ] })
  ] });
}
function GavetaVTs() {
  const user = null;
  const [items, setItems] = useState([]);
  const [filterPrograma, setFilterPrograma] = useState("Todos");
  const [form, setForm] = useState({ programa: PROGRAMAS_VT[0], retranca: "", data_pronto: ymd(/* @__PURE__ */ new Date()), observacao: "" });
  const [editingId, setEditingId] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    const { data: rows, error } = await supabase.from("vts_gaveta").select("*").order("data_pronto", { ascending: false }).limit(300);
    if (error) toast.error(error.message);
    else setItems(rows ?? []);
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const filtered = useMemo(
    () => filterPrograma === "Todos" ? items : items.filter((i) => i.programa === filterPrograma),
    [items, filterPrograma]
  );
  const add = async (e) => {
    e.preventDefault();
    if (!form.retranca.trim() || !user) return;
  };
  const remove = async (id) => {
    if (!window.confirm("Remover este VT da gaveta?")) return;
    const { error } = await supabase.from("vts_gaveta").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };
  const startEdit = (v) => {
    setForm({ programa: v.programa, retranca: v.retranca, data_pronto: v.data_pronto, observacao: v.observacao || "" });
    setEditingId(v.id);
    setPreviewItem(null);
  };
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4", children: [
    /* @__PURE__ */ jsxs("form", { onSubmit: add, className: "rounded-lg border border-[var(--border-light)] border-l-4 border-l-accent bg-[var(--bg-primary)] p-4 space-y-3 h-fit", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-[10px] uppercase tracking-[.2em] text-[var(--accent-primary)] font-bold flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Archive, { className: "h-3.5 w-3.5" }),
          " ",
          editingId ? "Editar VT" : "Arquivar VT pronto"
        ] }),
        editingId && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              setEditingId(null);
              setForm({ ...form, retranca: "", observacao: "" });
            },
            className: "text-[10px] text-[var(--text-secondary)] hover:text-[var(--accent-primary))]",
            children: "cancelar"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Programa" }),
        /* @__PURE__ */ jsx("select", { className: inputCls, value: form.programa, onChange: (e) => setForm({ ...form, programa: e.target.value }), children: PROGRAMAS_VT.map((p) => /* @__PURE__ */ jsx("option", { children: p }, p)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Retranca do VT" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            required: true,
            className: inputCls + " font-mono uppercase",
            value: form.retranca,
            onChange: (e) => setForm({ ...form, retranca: e.target.value.toUpperCase() })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Data em que ficou pronto" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            className: inputCls,
            value: form.data_pronto,
            onChange: (e) => setForm({ ...form, data_pronto: e.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Observação (opcional)" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            rows: 2,
            className: inputCls,
            value: form.observacao,
            onChange: (e) => setForm({ ...form, observacao: e.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ jsx(Button, { type: "submit", disabled: saving, className: "w-full", children: editingId ? "Salvar alterações" : "Arquivar" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)] overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "px-4 py-2 border-b border-[var(--border-light)] flex items-center justify-between gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-[var(--text-secondary)]", children: [
          filtered.length,
          " VT(s) na gaveta"
        ] }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            className: "bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-md px-2 py-1 text-xs",
            value: filterPrograma,
            onChange: (e) => setFilterPrograma(e.target.value),
            children: [
              /* @__PURE__ */ jsx("option", { children: "Todos" }),
              PROGRAMAS_VT.map((p) => /* @__PURE__ */ jsx("option", { children: p }, p))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "divide-y divide-border max-h-[70vh] overflow-y-auto", children: [
        filtered.map((v) => /* @__PURE__ */ jsxs(
          "div",
          {
            onClick: () => setPreviewItem(v),
            className: "p-3 group flex items-start justify-between gap-3 hover:bg-[var(--accent-primary)]/5 transition-colors cursor-pointer",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-mono uppercase font-bold text-sm text-[var(--accent-primary)]", children: v.retranca }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-muted text-[var(--text-secondary)]", children: v.programa })
                ] }),
                v.observacao && /* @__PURE__ */ jsx("div", { className: "text-xs text-[var(--text-secondary)] mt-1 whitespace-pre-wrap", children: v.observacao }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs font-mono text-[var(--text-secondary)] mt-1", children: [
                  "Pronto em ",
                  (/* @__PURE__ */ new Date(v.data_pronto + "T00:00:00")).toLocaleDateString("pt-BR")
                ] })
              ] }),
              user?.id === v.autor_id && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: (e) => {
                    e.stopPropagation();
                    remove(v.id);
                  },
                  className: "opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-red-500 transition-opacity",
                  children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
                }
              )
            ]
          },
          v.id
        )),
        !filtered.length && /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-sm text-[var(--text-secondary)] italic", children: "Gaveta vazia." })
      ] })
    ] }),
    previewItem && /* @__PURE__ */ jsx(VtPreviewModal, { vt: previewItem, onClose: () => setPreviewItem(null), onEdit: startEdit })
  ] });
}
function VtPreviewModal({ vt, onClose, onEdit }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 bg-[var(--bg-secondary)]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50",
      onClick: onClose,
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          onClick: (e) => e.stopPropagation(),
          className: "bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg max-w-2xl w-full max-h-[85vh] overflow-auto shadow-2xl",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-b border-[var(--border-light)] flex items-start justify-between gap-4 sticky top-0 bg-[var(--bg-primary)]", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-widest text-[var(--accent-primary)] mb-1", children: "Dados do VT Arquivado" }),
                /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold", children: vt.retranca })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => onEdit(vt),
                    title: "Editar VT",
                    className: "p-1.5 rounded-md hover:bg-primary/10 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-all",
                    children: /* @__PURE__ */ jsx(Pencil, { className: "h-5 w-5" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: onClose,
                    className: "text-[var(--text-secondary)] hover:text-[var(--accent-primary))] transition-colors p-1",
                    title: "Fechar",
                    children: /* @__PURE__ */ jsx(Plus, { className: "h-7 w-7 rotate-45" })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-5 text-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 text-xs", children: [
                /* @__PURE__ */ jsxs("div", { className: "border border-[var(--border-light)] rounded p-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-widest text-[var(--text-secondary)]", children: "Programa" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-1 font-bold text-sm uppercase", children: vt.programa })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "border border-[var(--border-light)] rounded p-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-widest text-[var(--text-secondary)]", children: "Ficou pronto em" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-1 font-bold text-sm", children: (/* @__PURE__ */ new Date(vt.data_pronto + "T00:00:00")).toLocaleDateString("pt-BR") })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block mb-2", children: "Observações / Detalhes" }),
                /* @__PURE__ */ jsx("div", { className: "bg-[var(--bg-secondary)]/30 border border-[var(--border-light)] rounded-md p-4 italic text-[var(--text-secondary)] whitespace-pre-wrap min-h-[100px]", children: vt.observacao || "Nenhuma observação registrada para este VT." })
              ] })
            ] })
          ]
        }
      )
    }
  );
}
function PortaisPanel() {
  const fetchFn = useServerFn(fetchPortais);
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchFn();
      setFeeds(data);
      if (!active && data.length) setActive(data[0].portal);
    } catch {
      toast.error("Falha ao buscar portais");
    } finally {
      setLoading(false);
    }
  }, [active, fetchFn]);
  useEffect(() => {
    load();
  }, []);
  const addAsPauta = async (item, portal) => {
    return;
  };
  const current = feeds.find((f) => f.portal === active);
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)] overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 border-b border-[var(--border-light)]", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs text-[var(--text-secondary)]", children: loading ? "Carregando…" : `${feeds.reduce((s, f) => s + f.items.length, 0)} notícias` }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: load, disabled: loading, children: [
        loading ? /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsx(RefreshCw, { className: "h-3 w-3" }),
        " Atualizar"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-[220px_1fr] min-h-[400px]", children: [
      /* @__PURE__ */ jsx("div", { className: "border-r border-[var(--border-light)] p-2 space-y-1 max-h-[600px] overflow-y-auto", children: feeds.map((f) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActive(f.portal),
          className: cn(
            "w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between transition-colors",
            active === f.portal ? "bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/40" : "hover:bg-muted"
          ),
          children: [
            /* @__PURE__ */ jsx("span", { className: "truncate", children: f.portal }),
            /* @__PURE__ */ jsx("span", { className: cn("text-[10px] ml-2", f.error ? "text-destructive" : "text-[var(--text-secondary)]"), children: f.error ? "erro" : f.items.length })
          ]
        },
        f.portal
      )) }),
      /* @__PURE__ */ jsx("div", { className: "p-3 max-h-[600px] overflow-y-auto space-y-2", children: current?.items.map((it, i) => /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-[var(--border-light)] border-l-2 border-l-accent bg-[var(--bg-secondary)] p-3", children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: it.title }),
        it.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-[var(--text-secondary)] mt-1 line-clamp-2", children: it.description }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-2 gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-[var(--text-secondary)]", children: it.pubDate ? new Date(it.pubDate).toLocaleString("pt-BR") : "" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            it.link && /* @__PURE__ */ jsxs(
              "a",
              {
                href: it.link.startsWith("http") ? it.link : "#",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "text-[11px] inline-flex items-center gap-1 text-[var(--accent-primary)] hover:underline",
                children: [
                  /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3" }),
                  " abrir"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: () => addAsPauta(it, current.portal), children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" }),
              " usar"
            ] })
          ] })
        ] })
      ] }, i)) })
    ] })
  ] });
}
const Route$5 = createFileRoute("/metricas")({
  component: () => /* @__PURE__ */ jsx(MetricasPage, {}),
  head: () => ({ meta: [{ title: "Métricas — Newsdesk" }] })
});
function MetricasPage() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ pautas: 0, materias: 0, publicadas: 0, autores: 0 });
  useEffect(() => {
    (async () => {
      const [m, mt, p, profs] = await Promise.all([
        supabase.from("materias").select("id, titulo, status, autor_id").order("created_at", { ascending: false }).limit(50),
        supabase.from("metricas").select("materia_id, cliques, tempo_medio_seg"),
        supabase.from("pautas").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true })
      ]);
      const metrics = mt.data ?? [];
      const byMat = /* @__PURE__ */ new Map();
      metrics.forEach((x) => {
        if (!x.materia_id) return;
        const cur = byMat.get(x.materia_id) ?? { cliques: 0, tempo: 0, count: 0 };
        cur.cliques += x.cliques;
        cur.tempo += x.tempo_medio_seg;
        cur.count += 1;
        byMat.set(x.materia_id, cur);
      });
      const materias = m.data ?? [];
      setData(materias.map((mt2) => {
        const x = byMat.get(mt2.id);
        return { id: mt2.id, titulo: mt2.titulo, status: mt2.status, cliques: x?.cliques ?? 0, tempo_medio: x ? Math.round(x.tempo / x.count) : 0 };
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
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 space-y-6 bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-primary)]/30", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border-b border-[var(--border-subtle)] pb-3 shrink-0", children: [
      /* @__PURE__ */ jsx(BarChart3, { className: "h-5 w-5 text-[var(--text-quaternary)]" }),
      /* @__PURE__ */ jsx("h1", { className: "text-h1 font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent", children: "MÉTRICAS" }),
      /* @__PURE__ */ jsx("span", { className: "text-label text-[var(--text-tertiary)] hidden sm:inline", children: "Análise · Dados Gerais" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [
      /* @__PURE__ */ jsx(KpiCard, { icon: FileText, label: "Pautas totais", value: stats.pautas }),
      /* @__PURE__ */ jsx(KpiCard, { icon: TrendingUp, label: "Matérias", value: stats.materias }),
      /* @__PURE__ */ jsx(KpiCard, { icon: Clock, label: "Publicadas", value: stats.publicadas }),
      /* @__PURE__ */ jsx(KpiCard, { icon: Users, label: "Autores Ativos", value: stats.autores })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-xl rounded-3xl p-6 mb-6 shadow-[var(--shadow-2xl)]", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-label text-[var(--text-tertiary)] mb-4", children: "Top 10 matérias por cliques" }),
      top.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "h-[300px] flex items-center justify-center text-body-sm text-[var(--text-tertiary)]", children: [
        "Sem dados de métricas ainda. Insira registros em ",
        /* @__PURE__ */ jsx("span", { className: "font-mono mx-1 text-[var(--accent-primary)]", children: "metricas" }),
        " para ver o gráfico."
      ] }) : /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxs(BarChart, { data: top, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border-medium)" }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "titulo", stroke: "var(--text-tertiary)", fontSize: 11, angle: -20, textAnchor: "end", height: 70 }),
        /* @__PURE__ */ jsx(YAxis, { stroke: "var(--text-tertiary)", fontSize: 11 }),
        /* @__PURE__ */ jsx(Tooltip, { contentStyle: { background: "var(--bg-secondary)", border: "1px solid var(--border-light)", borderRadius: "0.75rem", boxShadow: "var(--shadow-md)" } }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "cliques", fill: "var(--accent-primary)", radius: [4, 4, 0, 0] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-xl rounded-3xl overflow-hidden shadow-[var(--shadow-2xl)]", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-body-sm", children: [
      /* @__PURE__ */ jsx("thead", { className: "text-label text-[var(--text-tertiary)] bg-[var(--bg-overlay-2)]", children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-[var(--border-subtle)]", children: [
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3.5", children: "Matéria" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3.5 w-32", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3.5 w-32", children: "Cliques" }),
        /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3.5 w-32", children: "Tempo médio" })
      ] }) }),
      /* @__PURE__ */ jsxs("tbody", { children: [
        data.map((m) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)] transition-colors duration-200", children: [
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-[var(--text-primary)]", children: m.titulo }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-caption text-[var(--text-tertiary)]", children: m.status }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right font-mono text-[var(--text-secondary)]", children: m.cliques.toLocaleString("pt-BR") }),
          /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-right font-mono text-[var(--text-secondary)]", children: [
            Math.floor(m.tempo_medio / 60),
            ":",
            String(m.tempo_medio % 60).padStart(2, "0")
          ] })
        ] }, m.id)),
        data.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 4, className: "px-4 py-12 text-center text-[var(--text-tertiary)] text-body-sm", children: "Sem matérias ainda." }) })
      ] })
    ] }) })
  ] });
}
function KpiCard({ icon: Icon, label, value }) {
  return /* @__PURE__ */ jsxs("div", { className: "bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl p-6 shadow-[var(--shadow-lg)] transition-all duration-300 hover:shadow-[var(--shadow-xl)]", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsx("span", { className: "text-label text-[var(--text-tertiary)]", children: label }),
      /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5 text-[var(--text-quaternary)]" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-display-lg font-bold font-mono text-[var(--text-primary)]", children: value })
  ] });
}
const Route$4 = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Entrar - DeskNews" }] })
});
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    } else {
      setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        toast.error("Credenciais inválidas.");
        setLoading(false);
        return;
      }
      if (!data.user) {
        toast.error("Erro ao fazer login.");
        setLoading(false);
        return;
      }
      const { data: userData, error: permError } = await supabase.from("users").select("id, email, pode_acessar_pautas").eq("email", data.user.email).single();
      if (permError || !userData) {
        toast.error("Usuário não encontrado no sistema. Contate a chefia de redação.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
      if (!userData.pode_acessar_pautas) {
        toast.error("Você não tem permissão para acessar pautas. Contate a chefia de redação.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
      toast.success("Login realizado com sucesso!");
      navigate({ to: "/pautas" });
    } catch (err) {
      toast.error("Erro inesperado ao conectar com o servidor.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: `min-h-screen flex items-center justify-center transition-colors duration-300 px-4 font-sans ${isDarkMode ? "bg-[var(--bg-primary)] text-[var(--text-primary)]" : "bg-gray-50 text-gray-900"} selection:bg-[var(--accent-primary)]/30`, children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: toggleTheme,
        className: `fixed top-6 right-6 p-3 rounded-full transition-all duration-300 ${isDarkMode ? "bg-gray-800 hover:bg-gray-700 text-yellow-400" : "bg-gray-200 hover:bg-gray-300 text-blue-600"}`,
        "aria-label": "Alternar tema",
        children: isDarkMode ? /* @__PURE__ */ jsx(Sun, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Moon, { className: "h-5 w-5" })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm animate-slide-up", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3 mb-10 justify-center group", children: /* @__PURE__ */ jsx("div", { className: "p-3 rounded-3xl transition-all duration-300", children: /* @__PURE__ */ jsx(
        "img",
        {
          src: isDarkMode ? "/logo1.png" : "/logo2.png",
          className: "h-10 w-65 transition-transform duration-500"
        }
      ) }) }),
      /* @__PURE__ */ jsxs("div", { className: `rounded-3xl p-8 sm:p-10 transition-all duration-300 ${isDarkMode ? "bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-xl shadow-[var(--shadow-2xl)] hover:border-[var(--border-medium)]" : "bg-white border border-gray-200 shadow-lg hover:shadow-xl hover:border-gray-300"}`, children: [
        /* @__PURE__ */ jsx("h1", { className: `text-h1 font-bold tracking-tight transition-colors duration-300 ${isDarkMode ? "text-[var(--text-primary)]" : "text-gray-900"}`, children: "Entrar na redação" }),
        /* @__PURE__ */ jsx("p", { className: `text-body-sm mt-2 mb-8 transition-colors duration-300 ${isDarkMode ? "text-[var(--text-tertiary)]" : "text-gray-600"}`, children: "Acesse com seu e-mail corporativo." }),
        /* @__PURE__ */ jsxs("form", { onSubmit, className: "mt-6 space-y-5", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "email",
              required: true,
              value: email,
              onChange: (e) => setEmail(e.target.value),
              placeholder: "email@jornal.com",
              className: `w-full px-4 py-3.5 rounded-2xl transition-all duration-300 ${isDarkMode ? "bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10" : "bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200"}`
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "password",
              required: true,
              value: password,
              onChange: (e) => setPassword(e.target.value),
              placeholder: "senha",
              className: `w-full px-4 py-3.5 rounded-2xl transition-all duration-300 ${isDarkMode ? "bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10" : "bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200"}`
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: loading,
              className: `w-full py-3.5 mt-6 rounded-2xl text-white font-bold transition-all duration-300 active:scale-[0.98] disabled:opacity-50 ${isDarkMode ? "bg-[var(--accent-primary)] hover:shadow-[var(--shadow-xl)] shadow-[var(--shadow-lg)]" : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg shadow-md"}`,
              children: loading ? "Entrando..." : "Entrar"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: `text-caption mt-6 text-center italic transition-colors duration-300 ${isDarkMode ? "text-[var(--text-tertiary)]" : "text-gray-500"}`, children: "Contas de novos jornalistas devem ser solicitadas à chefia de redação." })
      ] })
    ] })
  ] });
}
const Route$3 = createFileRoute("/espelho")({
  component: () => /* @__PURE__ */ jsx(EspelhoPage, {}),
  head: () => ({ meta: [{ title: "Espelho — DeskNews" }] }),
  ssr: false
});
const PROGRAMAS = ["Jornal da Manhã", "Edição Meio-Dia", "Jornal da Noite"];
const FORMATOS = [
  "Nota Seca",
  "Nota Coberta",
  "VT",
  "Vivo",
  "Link",
  "Stand-up",
  "Estúdio",
  "Cabeça",
  "Gráfico",
  "Croma",
  "Comercial"
];
const sanitize = (v) => v.replace(/<[^>]*>?/gm, "").trim();
function EspelhoPage() {
  const [date, setDate] = useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [programa, setPrograma] = useState("Todos");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("espelho_programa");
      if (saved) setPrograma(saved);
    }
  }, []);
  const [blocos, setBlocos] = useState([]);
  const [itens, setItens] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [modalMateria, setModalMateria] = useState(null);
  const [modalCabeca, setModalCabeca] = useState(null);
  const [plannedEditorialDuration, setPlannedEditorialDuration] = useState("00:00");
  const [masterDuration, setMasterDuration] = useState("00:00");
  const [editingItemIds, setEditingItemIds] = useState(/* @__PURE__ */ new Set());
  const broadcastChannelRef = useRef(null);
  const broadcastEditing = useCallback((itemId, editando) => {
    broadcastChannelRef.current?.send({
      type: "broadcast",
      event: "editando",
      payload: { itemId, editando }
    });
  }, []);
  const broadcastProducao = useCallback((valor) => {
    broadcastChannelRef.current?.send({
      type: "broadcast",
      event: "producao",
      payload: { valor }
    });
  }, []);
  const broadcastMaster = useCallback((valor) => {
    broadcastChannelRef.current?.send({
      type: "broadcast",
      event: "master",
      payload: { valor }
    });
  }, []);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const load = useCallback(async () => {
    let q = supabase.from("espelho_blocos").select("*").eq("data_edicao", date).order("ordem");
    if (programa !== "Todos") q = q.eq("programa", programa);
    const { data: b } = await q;
    const loadedBlocos = b ?? [];
    setBlocos(loadedBlocos);
    if (loadedBlocos.length) {
      const { data: i } = await supabase.from("espelho_itens").select("*").in("bloco_id", loadedBlocos.map((x) => x.id)).order("ordem");
      setItens(i ?? []);
    } else {
      setItens([]);
    }
  }, [date, programa]);
  useEffect(() => {
    const channel = supabase.channel("espelho_sync").on("postgres_changes", { event: "*", schema: "public", table: "espelho_itens" }, load).on("postgres_changes", { event: "*", schema: "public", table: "espelho_blocos" }, load).on("broadcast", { event: "editando" }, ({ payload }) => {
      const { itemId, editando } = payload;
      setEditingItemIds((prev) => {
        const next = new Set(prev);
        if (editando) next.add(itemId);
        else next.delete(itemId);
        return next;
      });
    }).on("broadcast", { event: "producao" }, ({ payload }) => {
      const { valor } = payload;
      setPlannedEditorialDuration(valor);
    }).on("broadcast", { event: "master" }, ({ payload }) => {
      const { valor } = payload;
      setMasterDuration(valor);
    }).subscribe();
    broadcastChannelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);
  useEffect(() => {
    supabase.from("materias").select(
      "id,titulo,status,cabeca,tempo_vt,tempo_cab,deixa,entrevistado_nome,entrevistado_funcao,editor_texto,editor_imagem,credito_reporter,estrutura,lide,corpo"
    ).eq("status", "publicado").order("created_at", { ascending: false }).then(({ data }) => setMaterias(data ?? []));
    supabase.from("profiles").select("id,display_name").order("display_name").then(({ data }) => setProfiles(data ?? []));
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const addBloco = async () => {
    const prog = programa !== "Todos" ? programa : "Jornal da Manhã";
    const ordem = blocos.length + 1;
    const { error } = await supabase.from("espelho_blocos").insert({
      data_edicao: date,
      nome: `Bloco ${ordem}`,
      ordem,
      programa: prog
    });
    if (error) toast.error(error.message);
    else load();
  };
  const addItem = async (bloco_id) => {
    const ordem = itens.filter((i) => i.bloco_id === bloco_id).length + 1;
    const { error } = await supabase.from("espelho_itens").insert({
      bloco_id,
      ordem,
      assunto: "Novo item",
      formato: "VT",
      tempo: "1:30",
      tempo_cab: "0:15"
    });
    if (error) toast.error(error.message);
    else load();
  };
  const addFromMateria = async (bloco_id, materia_id) => {
    const m = materias.find((x) => x.id === materia_id);
    if (!m) return;
    const ordem = itens.filter((i) => i.bloco_id === bloco_id).length + 1;
    const { error } = await supabase.from("espelho_itens").insert({
      bloco_id,
      ordem,
      assunto: m.titulo,
      materia_id,
      formato: "VT",
      tempo: m.tempo_vt ?? "1:30",
      tempo_cab: m.tempo_cab ?? "0:15",
      cabeca: m.cabeca ?? null
    });
    if (error) toast.error(error.message);
    else load();
  };
  const addComercial = async (bloco_id) => {
    const ordem = itens.filter((i) => i.bloco_id === bloco_id).length + 1;
    const { error } = await supabase.from("espelho_itens").insert({
      bloco_id,
      ordem,
      assunto: "INTERVALO COMERCIAL",
      formato: "Comercial",
      tempo: "3:00",
      tempo_cab: "0:00",
      status: "pronto"
    });
    if (error) toast.error(error.message);
    else load();
  };
  const updateItem = useCallback(async (id, patch) => {
    const { error } = await supabase.from("espelho_itens").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else load();
  }, [load]);
  const updateBloco = async (id, patch) => {
    const { error } = await supabase.from("espelho_blocos").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };
  const delItem = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover este item do espelho?")) return;
    await supabase.from("espelho_itens").delete().eq("id", id);
    load();
  };
  const delBloco = async (id) => {
    if (!window.confirm("Isso apagará o bloco e todos os itens dentro dele. Confirmar?")) return;
    await supabase.from("espelho_blocos").delete().eq("id", id);
    load();
  };
  const activeGlobalIndex = useMemo(() => {
    let counter = 0;
    let found = -1;
    blocos.forEach((block) => {
      itens.filter((i) => i.bloco_id === block.id).sort((a, b) => a.ordem - b.ordem).forEach((item) => {
        const s = String(item.status ?? "").toLowerCase();
        if (s === "no_ar" || s === "no ar") found = counter;
        counter++;
      });
    });
    return found;
  }, [itens, blocos]);
  const calcTotal = useCallback(
    (i) => formatSecondsToTime(
      parseTimeToSeconds(i.tempo) + parseTimeToSeconds(i.tempo_cab)
    ),
    []
  );
  const totalEditorialSec = useMemo(
    () => itens.filter((i) => i.formato !== "Comercial").reduce((a, i) => a + parseTimeToSeconds(i.tempo) + parseTimeToSeconds(i.tempo_cab), 0),
    [itens]
  );
  const totalGeralSec = useMemo(
    () => itens.reduce(
      (acc, i) => acc + parseTimeToSeconds(i.tempo) + parseTimeToSeconds(i.tempo_cab),
      0
    ),
    [itens]
  );
  const plannedSec = useMemo(
    () => parseTimeToSeconds(plannedEditorialDuration),
    [plannedEditorialDuration]
  );
  const masterSec = useMemo(
    () => parseTimeToSeconds(masterDuration),
    [masterDuration]
  );
  const diffEditorial = useMemo(() => {
    const base = masterSec || totalEditorialSec;
    const diff = base - plannedSec;
    if (diff > 0) return { type: "estouro", value: diff };
    if (diff < 0) return { type: "sobra", value: Math.abs(diff) };
    return { type: "balanceado", value: 0 };
  }, [masterSec, totalEditorialSec, plannedSec]);
  const profileName = useCallback(
    (id) => id ? profiles.find((p) => p.id === id)?.display_name ?? "—" : "—",
    [profiles]
  );
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;
    const activeItem = itens.find((i) => i.id === activeId);
    if (!activeItem) return;
    const overItem = itens.find((i) => i.id === overId);
    const destinationBlocoId = overItem?.bloco_id ?? blocos.find((b) => b.id === overId)?.id ?? "";
    if (!destinationBlocoId) return;
    const sourceBlocoId = activeItem.bloco_id;
    let newItens = structuredClone(itens);
    const target = newItens.find((i) => i.id === activeId);
    if (sourceBlocoId === destinationBlocoId) {
      const blockItens = newItens.filter((i) => i.bloco_id === sourceBlocoId).sort((a, b) => a.ordem - b.ordem);
      const oldIdx = blockItens.findIndex((i) => i.id === activeId);
      const newIdx = blockItens.findIndex((i) => i.id === overId);
      const reordered = arrayMove(blockItens, oldIdx, newIdx);
      reordered.forEach((item, idx) => {
        const x = newItens.find((z) => z.id === item.id);
        if (x) x.ordem = idx + 1;
      });
    } else {
      target.bloco_id = destinationBlocoId;
      const sourceItens = newItens.filter((i) => i.bloco_id === sourceBlocoId && i.id !== activeId).sort((a, b) => a.ordem - b.ordem);
      sourceItens.forEach((item, idx) => {
        const x = newItens.find((z) => z.id === item.id);
        if (x) x.ordem = idx + 1;
      });
      const destItens = newItens.filter((i) => i.bloco_id === destinationBlocoId && i.id !== activeId).sort((a, b) => a.ordem - b.ordem);
      const overIdx = destItens.findIndex((i) => i.id === overId);
      overIdx >= 0 ? destItens.splice(overIdx, 0, target) : destItens.push(target);
      destItens.forEach((item, idx) => {
        const x = newItens.find((z) => z.id === item.id);
        if (x) {
          x.ordem = idx + 1;
          x.bloco_id = destinationBlocoId;
        }
      });
    }
    setItens(newItens);
    await Promise.all(
      newItens.map(
        (item) => supabase.from("espelho_itens").update({ ordem: item.ordem, bloco_id: item.bloco_id }).eq("id", item.id)
      )
    );
    load();
  };
  const blockStartIndices = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    let counter = 0;
    blocos.forEach((b) => {
      map.set(b.id, counter);
      counter += itens.filter((i) => i.bloco_id === b.id).length;
    });
    return map;
  }, [blocos, itens]);
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 space-y-4 h-full flex flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border-b border-[var(--border-subtle)] pb-3 shrink-0", children: [
      /* @__PURE__ */ jsx(MonitorPlay, { className: "h-5 w-5 text-[var(--text-quaternary)]" }),
      /* @__PURE__ */ jsx("h1", { className: "text-h1 font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent", children: "ESPELHO" }),
      /* @__PURE__ */ jsx("span", { className: "text-label text-[var(--text-tertiary)] hidden sm:inline", children: "Exibição · controle de tempo" }),
      /* @__PURE__ */ jsx("div", { className: "ml-auto flex items-center gap-2" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-6 flex-wrap gap-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 sm:gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "date",
          value: date,
          onChange: (e) => setDate(e.target.value),
          className: "px-4 py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-body-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300"
        }
      ),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: programa,
          onChange: (e) => {
            setPrograma(e.target.value);
            try {
              localStorage.setItem("espelho_programa", e.target.value);
            } catch {
            }
          },
          className: "px-4 py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-body-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300 appearance-none cursor-pointer",
          children: [
            /* @__PURE__ */ jsx("option", { value: "Todos", children: "Todos os programas" }),
            PROGRAMAS.map((p) => /* @__PURE__ */ jsx("option", { value: p, className: "bg-[var(--bg-secondary)] text-[var(--text-primary)]", children: p }, p))
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "font-mono text-display-lg border border-[var(--glass-border)] rounded-3xl px-8 py-4 bg-[var(--glass-bg)] backdrop-blur-xl shadow-[var(--shadow-xl)] flex flex-col items-center justify-center min-w-[160px]", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[var(--text-tertiary)] text-label mb-1 font-black", children: "PRODUÇÃO" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: plannedEditorialDuration,
            disabled: false,
            onChange: (e) => {
              if (/^\d{0,2}:?\d{0,2}$/.test(e.target.value) || e.target.value === "") {
                setPlannedEditorialDuration(e.target.value);
                broadcastProducao(e.target.value);
              }
            },
            onBlur: () => {
              const formatted = formatSecondsToTime(plannedSec);
              setPlannedEditorialDuration(formatted);
              broadcastProducao(formatted);
            },
            className: "bg-transparent text-[var(--text-primary)] w-32 text-center focus:outline-none font-bold tracking-tighter text-h2",
            placeholder: "00:00"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "font-mono text-display-lg border border-[var(--glass-border)] rounded-3xl px-8 py-4 bg-[var(--glass-bg)] backdrop-blur-xl shadow-[var(--shadow-xl)] flex flex-col items-center justify-center min-w-[160px]", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[var(--text-tertiary)] text-label mb-1 font-black", children: "MASTER" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: masterDuration,
            disabled: false,
            onChange: (e) => {
              if (/^\d{0,2}:?\d{0,2}$/.test(e.target.value) || e.target.value === "") {
                setMasterDuration(e.target.value);
                broadcastMaster(e.target.value);
              }
            },
            onBlur: () => {
              const formatted = formatSecondsToTime(masterSec);
              setMasterDuration(formatted);
              broadcastMaster(formatted);
            },
            className: "bg-transparent text-[var(--text-primary)] w-32 text-center focus:outline-none font-bold tracking-tighter text-h2 tabular-nums",
            placeholder: "00:00"
          }
        )
      ] }),
      diffEditorial.type !== "balanceado" && /* @__PURE__ */ jsxs("div", { className: cn(
        "font-mono text-display-lg border rounded-3xl px-8 py-4 flex flex-col items-center justify-center min-w-[160px] shadow-[var(--shadow-xl)]",
        diffEditorial.type === "estouro" ? "bg-[var(--status-error)]/10 text-[var(--status-error)] border-[var(--status-error)]/30" : "bg-[var(--status-success)]/10 text-[var(--status-success)] border-[var(--status-success)]/30"
      ), children: [
        /* @__PURE__ */ jsx("span", { className: "text-label mb-1 font-black", children: diffEditorial.type === "estouro" ? "Estouro" : "Sobra" }),
        /* @__PURE__ */ jsx("span", { className: "font-bold text-h2 tabular-nums", children: formatSecondsToTime(diffEditorial.value) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "font-mono text-display-lg border border-[var(--glass-border)] rounded-3xl px-8 py-4 bg-[var(--glass-bg)] backdrop-blur-xl flex flex-col items-center justify-center min-w-[160px] shadow-[var(--shadow-2xl)]", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[var(--text-tertiary)] text-label mb-1 font-black", children: "TOTAL" }),
        /* @__PURE__ */ jsx("span", { className: "text-[var(--text-primary)] font-bold tracking-tighter text-h2 tabular-nums", children: formatSecondsToTime(totalGeralSec) })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: addBloco,
          className: "inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--accent-primary)] text-white text-body-sm font-semibold uppercase tracking-widest shadow-[var(--shadow-lg)] transition-all duration-300 hover:shadow-[var(--shadow-xl)] active:scale-[0.98]",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            " NOVO BLOCO"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: `/tp?date=${date}&programa=${encodeURIComponent(programa ?? "")}`,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--status-warning)] text-white text-body-sm font-semibold uppercase tracking-wider hover:bg-[var(--status-warning)]/90 transition-all duration-300 shadow-[var(--shadow-md)] active:scale-[0.98]",
          children: [
            /* @__PURE__ */ jsx(Tv, { className: "h-4 w-4 text-white" }),
            " TP"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: `/playout?date=${date}&programa=${encodeURIComponent(programa ?? "")}`,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--status-error)] text-white text-body-sm font-semibold uppercase tracking-wider hover:bg-[var(--status-error)]/90 transition-all duration-300 shadow-[var(--shadow-md)] active:scale-[0.98]",
          children: [
            /* @__PURE__ */ jsx(Tv, { className: "h-4 w-4 text-white" }),
            " PLAYOUT"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx(DndContext, { sensors, collisionDetection: closestCorners, onDragEnd: handleDragEnd, children: /* @__PURE__ */ jsxs("div", { className: "space-y-6 pb-12 overflow-y-auto flex-1", children: [
      blocos.length === 0 && /* @__PURE__ */ jsxs("div", { className: "bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-3xl p-12 text-center text-[var(--text-tertiary)] text-body-sm shadow-[var(--shadow-md)]", children: [
        "Nenhum bloco para esta data.",
        " Crie um bloco para começar."
      ] }),
      blocos.map((b) => {
        const itensB = itens.filter((i) => i.bloco_id === b.id).sort((a, b2) => a.ordem - b2.ordem);
        const tempoB = itensB.reduce(
          (a, i) => a + parseTimeToSeconds(i.tempo) + parseTimeToSeconds(i.tempo_cab),
          0
        );
        const startIdx = blockStartIndices.get(b.id) ?? 0;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            id: b.id,
            className: "bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-3xl overflow-hidden shadow-[var(--shadow-sm)]",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-5 py-4 bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)] gap-3 flex-wrap", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
                  /* @__PURE__ */ jsxs("span", { className: "font-mono text-xs px-2 py-0.5 bg-red-600 text-white rounded font-bold", children: [
                    "B",
                    String(b.ordem).padStart(2, "0")
                  ] }),
                  /* @__PURE__ */ jsx(
                    BlockInput,
                    {
                      value: b.nome,
                      onBlur: (v) => updateBloco(b.id, { nome: v }),
                      className: "bg-transparent font-semibold focus:outline-none"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "select",
                    {
                      value: b.programa,
                      onChange: (e) => updateBloco(b.id, { programa: e.target.value }),
                      className: "text-label bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 rounded-full px-2.5 py-1 font-bold appearance-none cursor-pointer",
                      children: PROGRAMAS.map((p) => /* @__PURE__ */ jsx("option", { value: p, className: "bg-[var(--bg-secondary)] text-[var(--text-primary)]", children: p }, p))
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "text-label text-[var(--text-tertiary)]", children: "Apresentador" }),
                  /* @__PURE__ */ jsx(
                    BlockInput,
                    {
                      value: b.apresentador ?? "",
                      disabled: false,
                      placeholder: "—",
                      onBlur: (v) => updateBloco(b.id, { apresentador: v || null }),
                      className: "bg-transparent text-body-sm focus:outline-none border-b border-transparent focus:border-[var(--accent-primary)] transition-colors duration-200"
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "font-mono text-caption text-[var(--text-tertiary)] bg-[var(--bg-primary)] px-2.5 py-1 rounded-md border border-[var(--border-subtle)]", children: formatSecondsToTime(tempoB) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                  /* @__PURE__ */ jsxs(
                    "select",
                    {
                      onChange: (e) => {
                        if (e.target.value) {
                          addFromMateria(b.id, e.target.value);
                          e.target.value = "";
                        }
                      },
                      className: "text-caption bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-light)] rounded-xl px-3 py-1.5 focus:outline-none appearance-none cursor-pointer transition-all duration-300 hover:border-[var(--border-medium)] min-w-[180px]",
                      defaultValue: "",
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "", className: "bg-[var(--bg-secondary)] text-[var(--text-primary)]", children: "+ Matéria publicada…" }),
                        materias.map((m) => /* @__PURE__ */ jsx("option", { value: m.id, className: "bg-[var(--bg-secondary)] text-[var(--text-primary)]", children: m.titulo }, m.id))
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => addItem(b.id),
                      className: "text-caption px-3 py-1.5 rounded-xl border border-[var(--border-light)] text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-all duration-300 active:scale-[0.98]",
                      children: "+ Item"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => addComercial(b.id),
                      className: "text-caption px-3 py-1.5 rounded-xl border border-[var(--border-light)] text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-all duration-300 active:scale-[0.98]",
                      children: "+ Comercial"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => delBloco(b.id),
                      className: "text-caption px-3 py-1.5 rounded-xl text-[var(--status-error)] hover:bg-[var(--status-error)]/10 transition-all duration-300 active:scale-[0.98]",
                      children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "overflow-x-auto text-[var(--text-secondary)]", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm min-w-[1100px]", children: [
                /* @__PURE__ */ jsx("thead", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border bg-muted/20", children: [
                  /* @__PURE__ */ jsx("th", { className: "w-8" }),
                  /* @__PURE__ */ jsx("th", { className: "text-center px-2 py-2 w-10", children: "Status" }),
                  /* @__PURE__ */ jsx("th", { className: "text-left px-3 py-2 w-12", children: "#" }),
                  /* @__PURE__ */ jsx("th", { className: "text-left px-3 py-2 min-w-[300px] w-[450px]", children: "Assunto / Cabeça" }),
                  /* @__PURE__ */ jsx("th", { className: "text-left px-3 py-2 w-32", children: "Formato" }),
                  /* @__PURE__ */ jsx("th", { className: "text-center px-3 py-2 w-20 font-mono", children: "Cab." }),
                  /* @__PURE__ */ jsx("th", { className: "text-center px-3 py-2 w-20 font-mono", children: "VT" }),
                  /* @__PURE__ */ jsx("th", { className: "text-center px-3 py-2 w-20 font-mono text-primary", children: "Total" }),
                  /* @__PURE__ */ jsx("th", { className: "text-left px-3 py-2 w-40", children: "Editor texto" }),
                  /* @__PURE__ */ jsx("th", { className: "text-left px-3 py-2 w-40", children: "Editor imagem" }),
                  /* @__PURE__ */ jsx("th", { className: "text-left px-3 py-2 w-28", children: "Estado" }),
                  /* @__PURE__ */ jsx("th", { className: "w-8" })
                ] }) }),
                /* @__PURE__ */ jsx(
                  SortableContext,
                  {
                    items: itensB.map((i) => i.id),
                    strategy: verticalListSortingStrategy,
                    children: /* @__PURE__ */ jsxs("tbody", { children: [
                      itensB.map((item, idx) => /* @__PURE__ */ jsx(
                        SortableRow,
                        {
                          item,
                          currentIndex: startIdx + idx,
                          activeGlobalIndex,
                          index: idx,
                          canDelete: true,
                          isEditing: editingItemIds.has(item.id),
                          onUpdate: updateItem,
                          onDelete: delItem,
                          onSelectMateria: (m, i) => {
                            broadcastEditing(i.id, true);
                            setEditingItemIds((prev) => new Set(prev).add(i.id));
                            setModalMateria({ materia: m, item: i });
                          },
                          onSelectCabeca: (i) => setModalCabeca(i),
                          materias,
                          profiles,
                          profileName,
                          calcTotal
                        },
                        item.id
                      )),
                      itensB.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx(
                        "td",
                        {
                          colSpan: 12,
                          className: "px-3 py-6 text-center text-xs text-muted-foreground",
                          children: "Sem itens. Adicione uma matéria publicada ou um item livre."
                        }
                      ) })
                    ] })
                  }
                )
              ] }) })
            ]
          },
          b.id
        );
      })
    ] }) }),
    modalMateria && /* @__PURE__ */ jsx(
      MateriaEditModal,
      {
        materia: modalMateria.materia,
        item: modalMateria.item,
        onClose: () => setModalMateria(null),
        onSave: async (updated) => {
          await supabase.from("materias").update({
            titulo: updated.titulo,
            cabeca: updated.cabeca,
            tempo_vt: updated.tempo_vt,
            tempo_cab: updated.tempo_cab,
            deixa: updated.deixa,
            estrutura: updated.estrutura,
            corpo: updated.corpo,
            credito_reporter: updated.credito_reporter
          }).eq("id", updated.id);
          await updateItem(modalMateria.item.id, {
            assunto: updated.titulo,
            cabeca: updated.cabeca,
            tempo_cab: updated.tempo_cab,
            tempo: updated.tempo_vt,
            status: "pronto"
          });
          broadcastChannelRef.current?.send({
            type: "broadcast",
            event: "cabeca_atualizada",
            payload: {
              itemId: modalMateria.item.id,
              cabeca: updated.cabeca ?? "",
              assunto: updated.titulo,
              tempo_cab: updated.tempo_cab ?? "0:00"
            }
          });
          broadcastEditing(modalMateria.item.id, false);
          setEditingItemIds((prev) => {
            const next = new Set(prev);
            next.delete(modalMateria.item.id);
            return next;
          });
          setModalMateria(null);
          toast.success("Matéria salva!");
        }
      }
    ),
    modalCabeca && /* @__PURE__ */ jsx(
      CabecaEditorModal,
      {
        item: modalCabeca,
        materia: materias.find((m) => m.id === modalCabeca.materia_id),
        onClose: () => setModalCabeca(null),
        onSave: async (id, assunto, cabeca, tempoCab, tempoVt, reporter) => {
          await updateItem(id, { assunto, cabeca, tempo_cab: tempoCab, tempo: tempoVt });
          if (modalCabeca.materia_id) {
            await supabase.from("materias").update({
              credito_reporter: reporter,
              cabeca,
              tempo_cab: tempoCab,
              tempo_vt: tempoVt
            }).eq("id", modalCabeca.materia_id);
          }
          setModalCabeca(null);
        }
      }
    )
  ] });
}
function SortableRow({
  item,
  currentIndex,
  activeGlobalIndex,
  isEditing,
  onUpdate,
  onDelete,
  onSelectMateria,
  onSelectCabeca,
  materias,
  profileName,
  calcTotal
}) {
  const [assunto, setAssunto] = useState(item.assunto);
  const [tempoCab, setTempoCab] = useState(item.tempo_cab ?? "0:00");
  const [tempo, setTempo] = useState(item.tempo ?? "0:00");
  useEffect(() => {
    setAssunto(item.assunto);
    setTempoCab(item.tempo_cab ?? "0:00");
    setTempo(item.tempo ?? "0:00");
  }, [item.assunto, item.tempo_cab, item.tempo]);
  let dotColor = "bg-green-500";
  let rowOpacity = "opacity-100";
  if (item.status === "exibido") rowOpacity = "opacity-30 grayscale";
  let borderStyle = "border-l-4 border-transparent";
  if (item.status === "no_ar" || activeGlobalIndex !== -1 && currentIndex === activeGlobalIndex) {
    dotColor = "bg-red-600";
    borderStyle = "border-l-4 border-red-600";
  } else if (currentIndex < activeGlobalIndex) {
    dotColor = "bg-yellow-500";
  }
  const isLocked = item.status === "exibido" || item.status === "no_ar" || activeGlobalIndex !== -1 && currentIndex < activeGlobalIndex;
  const isCurrent = item.status === "no_ar" || activeGlobalIndex !== -1 && currentIndex === activeGlobalIndex;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: isLocked
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    position: "relative",
    pointerEvents: isLocked && !isCurrent ? "none" : "auto"
  };
  const linkedMateria = materias.find((x) => x.id === item.materia_id);
  return /* @__PURE__ */ jsxs(
    "tr",
    {
      ref: setNodeRef,
      style,
      onDoubleClick: () => {
        if (isLocked && !isCurrent) return;
        if (item.materia_id) {
          if (linkedMateria) onSelectMateria(linkedMateria, item);
          else toast.info("Matéria não encontrada.");
        } else {
          toast.info("Item livre — vincule uma matéria publicada para ver a estrutura.");
        }
      },
      className: cn(
        "border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-overlay)] transition-all duration-300",
        item.formato === "Comercial" && "bg-[var(--bg-overlay)]",
        isDragging && "bg-[var(--bg-overlay-2)] opacity-50 z-50 ring-2 ring-[var(--accent-primary)]/20",
        isCurrent && "bg-red-600/10 text-[var(--text-primary)] font-bold",
        isEditing && !isCurrent && "border-l-4 border-yellow-400 bg-yellow-400/10",
        !isEditing && !isCurrent && borderStyle,
        item.status === "exibido" && "opacity-30 grayscale",
        rowOpacity
      ),
      children: [
        /* @__PURE__ */ jsx(
          "td",
          {
            className: cn(
              "w-8 px-2 py-2 text-muted-foreground/40",
              !isLocked && "cursor-grab active:cursor-grabbing hover:bg-[var(--accent-primary)]/10 transition-colors duration-200"
            ),
            ...!isLocked ? attributes : {},
            ...!isLocked ? listeners : {},
            children: /* @__PURE__ */ jsx(GripVertical, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "w-3 h-3 rounded-full border border-[var(--border-strong)] transition-all duration-200",
              isEditing && !isCurrent ? "bg-yellow-400 animate-pulse" : item.status === "cortado" ? "bg-gray-500" : dotColor
            )
          }
        ) }) }),
        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-mono text-[10px] text-muted-foreground font-bold", children: /* @__PURE__ */ jsx("span", { className: "text-[var(--text-tertiary)]", children: String(currentIndex + 1).padStart(2, "0") }) }),
        /* @__PURE__ */ jsxs("td", { className: "px-3 py-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              value: assunto,
              disabled: isLocked,
              onChange: (e) => setAssunto(e.target.value),
              onBlur: () => {
                const s = sanitize(assunto);
                setAssunto(s);
                onUpdate(item.id, { assunto: s });
              },
              className: cn("w-full bg-transparent focus:outline-none font-medium text-[var(--text-primary)]", isCurrent && "text-[var(--text-primary)]")
            }
          ),
          item.materia_id && linkedMateria && /* @__PURE__ */ jsxs(
            "span",
            {
              className: cn(
                "inline-block mt-1 text-[10px] uppercase tracking-widest font-bold",
                isCurrent ? "text-red-400" : "text-[var(--accent-primary)]"
              ),
              children: [
                "● ",
                linkedMateria.titulo
              ]
            }
          ),
          isEditing && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-1 mt-0.5 ml-2 text-[10px] uppercase tracking-widest font-bold text-yellow-500 animate-pulse", children: "✏ Editando" })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxs(
          "select",
          {
            value: item.formato ?? "",
            disabled: isLocked,
            onChange: (e) => onUpdate(item.id, { formato: e.target.value || null }),
            className: "w-full text-caption bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-xl px-3 py-1.5 appearance-none cursor-pointer transition-all duration-300 hover:border-[var(--border-medium)]",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", className: "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]", children: "—" }),
              FORMATOS.map((f) => /* @__PURE__ */ jsx("option", { value: f, children: f }, f))
            ]
          }
        ) }),
        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: !isLocked ? /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => onSelectCabeca(item),
            className: "w-16 bg-transparent font-mono text-center text-[var(--text-tertiary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] rounded-md py-1 transition-all duration-300 border border-transparent hover:border-[var(--border-light)] cursor-pointer focus:outline-none active:scale-[0.98]",
            title: "Editar texto da cabeça",
            children: /* @__PURE__ */ jsx("span", { className: "text-caption", children: tempoCab || "0:00" })
          }
        ) : /* @__PURE__ */ jsx("span", { className: "w-16 inline-block font-mono text-center text-muted-foreground", children: tempoCab || "0:00" }) }),
        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: /* @__PURE__ */ jsx(
          "input",
          {
            value: tempo,
            placeholder: "0:00",
            disabled: isLocked,
            onChange: (e) => setTempo(e.target.value),
            onBlur: () => onUpdate(item.id, { tempo: tempo || null }),
            className: "w-16 bg-transparent font-mono text-center focus:outline-none text-[var(--text-primary)] text-caption"
          }
        ) }),
        /* @__PURE__ */ jsx(
          "td",
          {
            className: cn(
              "px-3 py-2 text-center font-bold font-mono",
              isCurrent ? "text-[var(--text-primary)]" : "text-[var(--accent-primary)]"
            ),
            children: calcTotal(item)
          }
        ),
        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsx("span", { className: "text-caption text-[var(--text-tertiary)]", children: linkedMateria?.editor_texto ?? "—" }) }),
        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsx("span", { className: "text-caption text-[var(--text-tertiary)]", children: linkedMateria?.editor_imagem ?? "—" }) }),
        /* @__PURE__ */ jsxs("td", { className: "px-3 py-2", children: [
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: item.status ?? "pendente",
              disabled: isLocked,
              onChange: (e) => onUpdate(item.id, { status: e.target.value }),
              className: "text-caption bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-md px-2 py-1 w-full appearance-none cursor-pointer transition-all duration-300 hover:border-[var(--border-medium)]",
              children: [
                /* @__PURE__ */ jsx("option", { value: "pendente", children: "Pendente" }),
                /* @__PURE__ */ jsx("option", { value: "pronto", children: "Pronto" }),
                /* @__PURE__ */ jsx("option", { value: "no_ar", children: "🔴 No Ar" }),
                /* @__PURE__ */ jsx("option", { value: "exibido", children: "✅ Exibido" }),
                /* @__PURE__ */ jsx("option", { value: "cortado", children: "Cortado" })
              ]
            }
          ),
          false
        ] }),
        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onDelete(item.id),
            className: "p-1.5 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--status-error)]/10 hover:text-[var(--status-error)] transition-all duration-300 active:scale-[0.98]",
            children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" })
          }
        ) })
      ]
    }
  );
}
function BlockInput({
  value,
  onBlur,
  ...props
}) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return /* @__PURE__ */ jsx("input", { ...props, value: v, onChange: (e) => setV(e.target.value), onBlur: () => onBlur(v) });
}
function MateriaEditModal({
  materia,
  item,
  onClose,
  onSave
}) {
  const navigate = Route$3.useNavigate();
  const [titulo, setTitulo] = useState(materia.titulo);
  const [cabeca, setCabeca] = useState(materia.cabeca ?? "");
  const [tempoCab, setTempoCab] = useState(materia.tempo_cab ?? "0:00");
  const [tempoVt, setTempoVt] = useState(materia.tempo_vt ?? "0:00");
  const [deixa, setDeixa] = useState(materia.deixa ?? "");
  const [estrutura, setEstrutura] = useState(materia.estrutura ?? "");
  const [corpo, setCorpo] = useState(materia.corpo ?? "");
  const [reporter, setReporter] = useState(materia.credito_reporter ?? "");
  const wordCount = cabeca.trim().split(/\s+/).filter((w) => w.length > 0).length;
  const handleCabecaChange = (e) => {
    const v = e.target.value;
    setCabeca(v);
    const words = v.trim().split(/\s+/).filter((w) => w.length > 0).length;
    const sec = Math.ceil(words / 130 * 60);
    setTempoCab(`${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`);
  };
  const handleSave = () => onSave({
    ...materia,
    titulo,
    cabeca: cabeca || null,
    tempo_cab: tempoCab || null,
    tempo_vt: tempoVt || null,
    deixa: deixa || null,
    estrutura: estrutura || null,
    corpo: corpo || null,
    credito_reporter: reporter || null
  });
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-xl flex items-center justify-center p-4",
      onClick: onClose,
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-[var(--glass-bg)] border border-yellow-400/30 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-[var(--shadow-2xl)] flex flex-col",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxs("div", { className: "px-6 py-5 flex items-start justify-between gap-4 border-b border-yellow-400/20 sticky top-0 bg-[var(--glass-bg)] z-10", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-yellow-500 mb-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-yellow-400 animate-pulse inline-block" }),
                  "Editando Matéria"
                ] }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: titulo,
                    onChange: (e) => setTitulo(e.target.value),
                    className: "w-full bg-transparent text-h2 font-bold focus:outline-none border-b border-transparent focus:border-yellow-400/50 transition-colors text-[var(--text-primary)]",
                    placeholder: "TÍTULO DA MATÉRIA"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 shrink-0 mt-6", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    title: "Abrir lauda completa",
                    onClick: () => navigate({ to: "/redacao", search: { edit: materia.id } }),
                    className: "p-2 rounded-xl text-[var(--text-tertiary)] hover:bg-yellow-400/10 hover:text-yellow-400 transition-all duration-200 active:scale-[0.98]",
                    children: /* @__PURE__ */ jsx(Pencil, { className: "h-5 w-5" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: onClose,
                    title: "Fechar",
                    className: "p-2 rounded-xl text-[var(--text-tertiary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-all duration-200 active:scale-[0.98]",
                    children: /* @__PURE__ */ jsx(Plus, { className: "h-6 w-6 rotate-45" })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "border border-[var(--border-subtle)] rounded-xl p-4 bg-[var(--bg-overlay)]", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-label text-[var(--text-quaternary)] mb-2", children: "Tempo Cabeça" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      value: tempoCab,
                      onChange: (e) => setTempoCab(e.target.value),
                      className: "w-full bg-transparent font-mono text-body text-center focus:outline-none border-b border-transparent focus:border-[var(--accent-primary)]/50 text-[var(--text-primary)]"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "border border-[var(--border-subtle)] rounded-xl p-4 bg-[var(--bg-overlay)]", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-label text-[var(--text-quaternary)] mb-2", children: "Tempo VT" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      value: tempoVt,
                      onChange: (e) => setTempoVt(e.target.value),
                      className: "w-full bg-transparent font-mono text-body text-center focus:outline-none border-b border-transparent focus:border-[var(--accent-primary)]/50 text-[var(--text-primary)]"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "border border-[var(--border-subtle)] rounded-xl p-4 bg-[var(--bg-overlay)]", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-label text-[var(--text-quaternary)] mb-2", children: "Repórter" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      value: reporter,
                      onChange: (e) => setReporter(e.target.value),
                      className: "w-full bg-transparent text-body focus:outline-none border-b border-transparent focus:border-[var(--accent-primary)]/50 text-[var(--text-primary)]",
                      placeholder: "Nome..."
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-label text-[var(--text-quaternary)]", children: "Cabeça do Âncora" }),
                  /* @__PURE__ */ jsxs("div", { className: "text-label text-[var(--text-quaternary)]", children: [
                    "Palavras: ",
                    /* @__PURE__ */ jsx("span", { className: "font-bold text-[var(--text-primary)]", children: wordCount })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-0.5 bg-[var(--accent-primary)] rounded-full mr-4 opacity-70 shrink-0" }),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      value: cabeca,
                      onChange: handleCabecaChange,
                      rows: 4,
                      autoFocus: true,
                      className: "w-full bg-transparent italic text-body focus:outline-none resize-none leading-relaxed text-[var(--text-primary)] placeholder-[var(--text-quaternary)]",
                      placeholder: "Texto da cabeça do âncora..."
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-label text-[var(--text-quaternary)] mb-2", children: "Deixa (últimas palavras do VT)" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: deixa,
                    onChange: (e) => setDeixa(e.target.value),
                    className: "w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all text-body-sm",
                    placeholder: "...na reportagem de hoje."
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-label text-[var(--text-quaternary)] mb-2", children: "Roteiro / Decupagem (VT)" }),
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    value: estrutura,
                    onChange: (e) => setEstrutura(e.target.value),
                    rows: 7,
                    className: "w-full px-4 py-3 rounded-2xl bg-[var(--bg-overlay)] border border-[var(--border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all resize-none font-mono text-caption leading-relaxed whitespace-pre-wrap placeholder-[var(--text-quaternary)]",
                    placeholder: "[OFF]\n\n[SONORA] NOME / FUNÇÃO\n\n[PASSAGEM] REPÓRTER // LOCAL"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-label text-[var(--text-quaternary)] mb-2", children: "Matéria Web (texto corrido)" }),
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    value: corpo,
                    onChange: (e) => setCorpo(e.target.value),
                    rows: 4,
                    className: "w-full px-4 py-3 rounded-2xl bg-[var(--bg-overlay)] border border-[var(--border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all resize-none text-body-sm placeholder-[var(--text-quaternary)]",
                    placeholder: "Texto corrido para publicação web..."
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-t border-[var(--border-subtle)] flex justify-end sticky bottom-0 bg-[var(--glass-bg)]", children: /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: handleSave,
                className: "px-8 py-3 rounded-2xl text-body font-bold text-white bg-[var(--accent-primary)] shadow-[var(--shadow-lg)] hover:shadow-[var(--shadow-xl)] transition-all duration-300 active:scale-[0.98]",
                children: "SALVAR E FECHAR"
              }
            ) })
          ]
        }
      )
    }
  );
}
function CabecaEditorModal({
  item,
  materia,
  onClose,
  onSave
}) {
  const [assunto, setAssunto] = useState(item.assunto || "");
  const [text, setText] = useState(item.cabeca || "");
  const [tempoCab, setTempoCab] = useState(item.tempo_cab || "0:00");
  const [tempoVt, setTempoVt] = useState(item.tempo || "0:00");
  const [reporter, setReporter] = useState(materia?.credito_reporter || "");
  const wordCount = text.trim().split(/\s+/).filter((w) => w.length > 0).length;
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    const words = newText.trim().split(/\s+/).filter((w) => w.length > 0).length;
    const sec = Math.ceil(words / 130 * 60);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    setTempoCab(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-xl flex items-center justify-center p-4",
      onClick: onClose,
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl max-w-2xl w-full shadow-[var(--shadow-2xl)] flex flex-col",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxs("div", { className: "px-6 py-5 flex items-start justify-between gap-4 border-b border-[var(--border-subtle)]", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx("div", { className: "text-label text-[var(--accent-primary)] font-bold mb-1.5", children: "Estrutura da Matéria" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: assunto,
                    onChange: (e) => setAssunto(e.target.value),
                    className: "w-full bg-transparent text-h2 font-bold focus:outline-none uppercase border-b border-transparent focus:border-[var(--accent-primary)]/50 transition-colors duration-200 text-[var(--text-primary)]",
                    placeholder: "RETRANCA / ASSUNTO"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => onSave(item.id, assunto, text, tempoCab, tempoVt, reporter),
                    className: "p-1.5 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--accent-primary)] transition-all duration-300 active:scale-[0.98]",
                    title: "Salvar",
                    children: /* @__PURE__ */ jsx(Pencil, { className: "h-5 w-5" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: onClose,
                    className: "p-1.5 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-all duration-300 active:scale-[0.98]",
                    title: "Fechar",
                    children: /* @__PURE__ */ jsx(Plus, { className: "h-6 w-6 rotate-45" })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "border border-[var(--border-subtle)] rounded-xl p-4 bg-[var(--bg-overlay)]", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-label text-[var(--text-quaternary)] mb-2", children: "Tempo (Cab + VT)" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center font-mono text-body-lg gap-2 text-[var(--text-primary)]", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        value: tempoCab,
                        onChange: (e) => setTempoCab(e.target.value),
                        className: "w-16 bg-transparent text-center focus:outline-none border-b border-transparent focus:border-[var(--accent-primary)]/50 transition-colors duration-200"
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { className: "text-[var(--text-tertiary)]", children: "+" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        value: tempoVt,
                        onChange: (e) => setTempoVt(e.target.value),
                        className: "w-16 bg-transparent text-center focus:outline-none border-b border-transparent focus:border-[var(--accent-primary)]/50 transition-colors duration-200"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "border border-[var(--border-subtle)] rounded-xl p-4 bg-[var(--bg-overlay)]", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-label text-[var(--text-quaternary)] mb-2", children: "Repórter" }),
                  item.materia_id ? /* @__PURE__ */ jsx(
                    "input",
                    {
                      value: reporter,
                      onChange: (e) => setReporter(e.target.value),
                      className: "w-full bg-transparent text-body mt-1.5 focus:outline-none border-b border-transparent focus:border-[var(--accent-primary)]/50 transition-colors duration-200 text-[var(--text-primary)]",
                      placeholder: "Nome do repórter..."
                    }
                  ) : /* @__PURE__ */ jsx("div", { className: "mt-1.5 text-body-sm text-[var(--text-tertiary)]", children: "— (Item sem matéria)" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-label text-[var(--text-quaternary)]", children: "Cabeça do Âncora" }),
                  /* @__PURE__ */ jsxs("div", { className: "text-label text-[var(--text-quaternary)]", children: [
                    "Palavras:",
                    " ",
                    /* @__PURE__ */ jsx("span", { className: "font-bold text-[var(--text-primary)]", children: wordCount })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-0.5 bg-[var(--accent-primary)] rounded-l-sm mr-4 opacity-80" }),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      value: text,
                      onChange: handleTextChange,
                      className: "w-full h-32 bg-transparent italic text-body focus:outline-none resize-none leading-relaxed text-[var(--text-primary)]",
                      placeholder: "Digite a cabeça do âncora aqui...",
                      autoFocus: true
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "pt-2 flex justify-end", children: /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => onSave(item.id, assunto, text, tempoCab, tempoVt, reporter),
                  className: "px-6 py-3 rounded-2xl text-body font-semibold text-white bg-[var(--accent-primary)] shadow-[var(--shadow-lg)] transition-all duration-300 hover:shadow-[var(--shadow-xl)] active:scale-[0.98]",
                  children: "SALVAR E FECHAR"
                }
              ) })
            ] })
          ]
        }
      )
    }
  );
}
const Route$2 = createFileRoute("/dashboard")({
  component: () => /* @__PURE__ */ jsx(Dashboard, {}),
  head: () => ({ meta: [{ title: "Dashboard - DeskNews" }] })
});
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
        const { data: pautasData } = await supabase.from("pautas").select("*").order("created_at", { ascending: false }).limit(100);
        const { data: materiasData } = await supabase.from("materias").select("*").order("created_at", { ascending: false }).limit(100);
        const { data: espelhosData } = await supabase.from("espelho_blocos").select("*").limit(50);
        const { data: profilesData } = await supabase.from("profiles").select("id").limit(100);
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
        setStatusData([
          { name: "Publicado", value: materias.filter((m) => m.status === "publicado").length },
          { name: "Rascunho", value: materias.filter((m) => m.status === "rascunho").length },
          { name: "Revisão", value: materias.filter((m) => m.status === "revisao").length }
        ]);
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
          const dayStr = date.toLocaleDateString("pt-BR", { weekday: "short" });
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
  const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899"];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#0a0e27] text-[#e2e8f0] font-sans", children: [
    /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 pointer-events-none overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/15 to-purple-500/15 rounded-full blur-3xl animate-pulse" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse", style: { animationDelay: "1s" } }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 right-1/3 w-80 h-80 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse", style: { animationDelay: "2s" } })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "relative z-10 p-8 max-w-7xl mx-auto", children: loading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-96", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "w-12 h-12 animate-spin text-blue-400" }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-400", children: "Carregando dashboard..." })
    ] }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4 mb-4", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: "/logo1.png",
            alt: "DeskNews",
            className: "h-10 object-contain"
          }
        ) }),
        /* @__PURE__ */ jsx("h1", { className: "text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2", children: "Dashboard" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-400", children: "Visão em tempo real do seu newsroom" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8", children: [
        /* @__PURE__ */ jsx(
          MetricCard,
          {
            icon: FileText,
            label: "Pautas",
            value: metrics.pautas,
            trend: "up"
          }
        ),
        /* @__PURE__ */ jsx(
          MetricCard,
          {
            icon: Radio,
            label: "Matérias",
            value: metrics.materias,
            trend: "up"
          }
        ),
        /* @__PURE__ */ jsx(
          MetricCard,
          {
            icon: CheckCircle,
            label: "Publicadas",
            value: metrics.publicadas,
            color: "emerald",
            trend: "up"
          }
        ),
        /* @__PURE__ */ jsx(
          MetricCard,
          {
            icon: Clock,
            label: "Em Produção",
            value: metrics.em_producao,
            color: "amber",
            trend: "up"
          }
        ),
        /* @__PURE__ */ jsx(
          MetricCard,
          {
            icon: BarChart3,
            label: "Espelhos",
            value: metrics.espelhos,
            color: "purple",
            trend: "up"
          }
        ),
        /* @__PURE__ */ jsx(
          MetricCard,
          {
            icon: Users,
            label: "Usuários",
            value: metrics.usuarios,
            color: "pink",
            trend: "up"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8", children: [
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsx(PremiumCard, { title: "Produção - Últimos 7 Dias", icon: TrendingUp, children: /* @__PURE__ */ jsx("div", { className: "h-80", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: productionData, margin: { top: 20, right: 30, left: 0, bottom: 20 }, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(148, 163, 184, 0.1)" }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "day", stroke: "#94a3b8" }),
          /* @__PURE__ */ jsx(YAxis, { stroke: "#94a3b8" }),
          /* @__PURE__ */ jsx(
            Tooltip,
            {
              contentStyle: {
                background: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "12px",
                backdropFilter: "blur(8px)"
              }
            }
          ),
          /* @__PURE__ */ jsx(Bar, { dataKey: "producao", fill: "#3b82f6", radius: [8, 8, 0, 0] })
        ] }) }) }) }) }),
        /* @__PURE__ */ jsx(PremiumCard, { title: "Status das Matérias", icon: FileText, children: /* @__PURE__ */ jsx("div", { className: "h-80", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
          /* @__PURE__ */ jsx(
            Pie,
            {
              data: statusData,
              cx: "50%",
              cy: "50%",
              innerRadius: 60,
              outerRadius: 100,
              paddingAngle: 2,
              dataKey: "value",
              children: statusData.map((entry, index) => /* @__PURE__ */ jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))
            }
          ),
          /* @__PURE__ */ jsx(Tooltip, { formatter: (value) => `${value} matérias` })
        ] }) }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8", children: [
        /* @__PURE__ */ jsx(PremiumCard, { title: "Distribuição por Turno", icon: Clock, children: /* @__PURE__ */ jsx("div", { className: "space-y-4", children: turnoData.map((turno, idx) => /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-slate-300 font-medium", children: turno.turno }),
            /* @__PURE__ */ jsxs("span", { className: "text-slate-400", children: [
              turno.quantidade,
              " pautas"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "w-full bg-white/5 rounded-full h-2.5 overflow-hidden", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: `h-full transition-all duration-500 ${idx === 0 ? "bg-blue-500" : idx === 1 ? "bg-purple-500" : "bg-pink-500"}`,
              style: { width: `${turno.percentual}%` }
            }
          ) }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500", children: [
            turno.percentual,
            "%"
          ] })
        ] }, idx)) }) }),
        /* @__PURE__ */ jsx(PremiumCard, { title: "Top Repórteres", icon: Award, children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: topReporters.map((reporter, idx) => /* @__PURE__ */ jsx(
          "div",
          {
            className: "p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all",
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${idx === 0 ? "bg-yellow-500/30 border border-yellow-500/50" : idx === 1 ? "bg-slate-500/30 border border-slate-500/50" : idx === 2 ? "bg-orange-500/30 border border-orange-500/50" : "bg-blue-500/30 border border-blue-500/50"}`, children: idx + 1 }),
                /* @__PURE__ */ jsx("p", { className: "font-semibold text-sm", children: reporter.name })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-xs bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-lg", children: reporter.materias })
            ] })
          },
          idx
        )) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8", children: [
        /* @__PURE__ */ jsx(PremiumCard, { title: "Últimas Matérias", icon: FileText, children: /* @__PURE__ */ jsx("div", { className: "space-y-3 max-h-96 overflow-y-auto", children: ultimasMaterias.map((materia, idx) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: `p-3.5 rounded-xl border transition-all duration-300 hover:scale-105 cursor-pointer ${materia.status === "publicado" ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/40" : materia.status === "rascunho" ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/40" : "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/40"}`,
            children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-white line-clamp-2", children: materia.titulo || "Sem título" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400", children: new Date(materia.created_at).toLocaleDateString("pt-BR") }),
                /* @__PURE__ */ jsx("span", { className: `text-xs font-bold px-2.5 py-1 rounded-lg ${materia.status === "publicado" ? "bg-emerald-500/20 text-emerald-300" : materia.status === "rascunho" ? "bg-amber-500/20 text-amber-300" : "bg-blue-500/20 text-blue-300"}`, children: materia.status })
              ] })
            ]
          },
          idx
        )) }) }),
        /* @__PURE__ */ jsx(PremiumCard, { title: "Últimas Pautas", icon: Play, children: /* @__PURE__ */ jsx("div", { className: "space-y-3 max-h-96 overflow-y-auto", children: ultimasPautas.map((pauta, idx) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 hover:bg-white/10 cursor-pointer",
            children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-white truncate", children: pauta.titulo || pauta.retranca || "Sem título" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-2 text-xs text-slate-400", children: [
                /* @__PURE__ */ jsx("span", { children: pauta.tipo || "Pauta" }),
                /* @__PURE__ */ jsx("span", { children: "•" }),
                /* @__PURE__ */ jsx("span", { children: pauta.turno || "-" })
              ] })
            ]
          },
          idx
        )) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-black mb-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Globe, { className: "w-6 h-6 text-blue-400" }),
          /* @__PURE__ */ jsx("span", { className: "bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent", children: "Acontecendo no Mundo" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 lg:grid-cols-5 gap-4", children: portalNews.length > 0 ? portalNews.map((portal, pidx) => /* @__PURE__ */ jsx(PremiumCard, { title: portal.portal, className: "h-full", children: /* @__PURE__ */ jsx("div", { className: "space-y-3 max-h-96 overflow-y-auto", children: portal.items && portal.items.slice(0, 3).map((news, nidx) => /* @__PURE__ */ jsxs(
          "a",
          {
            href: news.link,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block p-3 rounded-lg bg-white/5 border border-white/10 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all group",
            children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-200 line-clamp-2 group-hover:text-blue-300 transition-colors", children: news.title }),
              news.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mt-2 line-clamp-2", children: news.description }),
              news.pubDate && /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-600 mt-2 flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Calendar$1, { size: 12 }),
                new Date(news.pubDate).toLocaleDateString("pt-BR")
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 mt-3 text-blue-400 group-hover:text-blue-300", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold", children: "Acessar" }),
                /* @__PURE__ */ jsx(ExternalLink, { size: 12 })
              ] })
            ]
          },
          nidx
        )) }) }, pidx)) : /* @__PURE__ */ jsxs("div", { className: "col-span-5 text-center py-8 text-slate-400", children: [
          /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin mx-auto mb-2 opacity-50" }),
          /* @__PURE__ */ jsx("p", { children: "Carregando notícias dos portais..." })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-12 relative px-6 py-4 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 text-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 mb-1", children: [
          /* @__PURE__ */ jsx(Sparkles, { size: 16, className: "text-purple-400" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-300 font-semibold", children: "Dashboard DeskNews" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500", children: [
          "Atualizado em ",
          (/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR")
        ] })
      ] })
    ] }) })
  ] });
}
function MetricCard({ icon: Icon, label, value, color = "blue", trend = "up" }) {
  const colorClasses = {
    blue: "from-blue-500/10 to-blue-500/5 border-blue-500/30 group-hover:border-blue-500/60",
    emerald: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/30 group-hover:border-emerald-500/60",
    amber: "from-amber-500/10 to-amber-500/5 border-amber-500/30 group-hover:border-amber-500/60",
    purple: "from-purple-500/10 to-purple-500/5 border-purple-500/30 group-hover:border-purple-500/60",
    pink: "from-pink-500/10 to-pink-500/5 border-pink-500/30 group-hover:border-pink-500/60"
  };
  const iconColors = {
    blue: "text-blue-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    purple: "text-purple-400",
    pink: "text-pink-400"
  };
  return /* @__PURE__ */ jsx("div", { className: "group relative cursor-pointer h-full", children: /* @__PURE__ */ jsxs("div", { className: `relative h-full bg-gradient-to-br ${colorClasses[color]} backdrop-blur-xl border rounded-xl p-4 transition-all duration-300 hover:shadow-xl flex flex-col justify-between`, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-slate-400 uppercase tracking-widest", children: label }),
      /* @__PURE__ */ jsx(Icon, { className: `w-5 h-5 ${iconColors[color]} opacity-70` })
    ] }),
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("div", { className: "text-3xl font-black text-white tabular-nums", children: value }) })
  ] }) });
}
function PremiumCard({ title, icon: Icon, children, className = "" }) {
  return /* @__PURE__ */ jsxs("div", { className: `relative group ${className}`, children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" }),
    /* @__PURE__ */ jsxs("div", { className: "relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 group-hover:border-white/20 rounded-2xl p-6 transition-all duration-300 h-full", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
        Icon && /* @__PURE__ */ jsx(Icon, { size: 20, className: "text-blue-400 opacity-80" }),
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold bg-gradient-to-r from-slate-200 to-slate-300 bg-clip-text text-transparent", children: title })
      ] }),
      children
    ] })
  ] });
}
const Route$1 = createFileRoute("/cadastro")({
  component: () => /* @__PURE__ */ jsx(Protected, { children: /* @__PURE__ */ jsx(SignupPage, {}) }),
  head: () => ({ meta: [{ title: "Cadastrar Integrante — DeskNews" }] })
});
function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleSelection, setRoleSelection] = useState("reporter");
  const [loading, setLoading] = useState(false);
  useNavigate();
  const { role } = useRBAC();
  const podeCadastrarMembros = role === "editor" || role === "chefe_redacao" || role === "admin";
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!podeCadastrarMembros) {
      toast.error("Você não tem permissão para registrar integrantes.");
      return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Por favor, insira um e-mail válido.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/pautas`,
        data: { display_name: name, role: roleSelection }
      }
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Integrante registrado com sucesso! Um e-mail de confirmação foi enviado.");
      setName("");
      setEmail("");
      setPassword("");
    }
  };
  if (!podeCadastrarMembros) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] px-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md text-center bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl p-10 backdrop-blur-xl shadow-[var(--shadow-2xl)]", children: [
      /* @__PURE__ */ jsx(ShieldAlert, { className: "h-12 w-12 text-[var(--status-error)] mx-auto mb-4" }),
      /* @__PURE__ */ jsx("h1", { className: "text-h2 font-bold tracking-tight text-[var(--text-primary)]", children: "Acesso Restrito" }),
      /* @__PURE__ */ jsx("p", { className: "text-body-sm text-[var(--text-tertiary)] mt-3 mb-6", children: "Apenas Editores ou Editores-chefe autorizados podem cadastrar e definir funções de novos colaboradores no DeskNews." }),
      /* @__PURE__ */ jsx(Link, { to: "/pautas", className: "inline-flex justify-center w-full py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] font-semibold text-body-sm transition-all hover:bg-[var(--bg-overlay)]", children: "Voltar para as Pautas" })
    ] }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 font-sans selection:bg-[var(--accent-primary)]/30", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm animate-slide-up", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-10 justify-center group", children: [
      /* @__PURE__ */ jsx("div", { className: "p-3 rounded-3xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 shadow-[var(--shadow-lg)]", children: /* @__PURE__ */ jsx(Newspaper, { className: "h-7 w-7 text-[var(--accent-primary)] transition-transform duration-500 group-hover:rotate-12" }) }),
      /* @__PURE__ */ jsx("span", { className: "text-label text-[var(--text-primary)] tracking-[0.3em]", children: "DeskNews" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-xl shadow-[var(--shadow-2xl)] rounded-3xl p-8 sm:p-10 transition-all duration-300 hover:border-[var(--border-medium)]", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-h1 font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent", children: "Novo integrante" }),
      /* @__PURE__ */ jsx("p", { className: "text-body-sm text-[var(--text-tertiary)] mt-2 mb-8", children: "Defina os dados e a função na redação." }),
      /* @__PURE__ */ jsxs("form", { onSubmit, className: "mt-6 space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "text-label text-[var(--text-quaternary)]", children: "Nome" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              required: true,
              value: name,
              onChange: (e) => setName(e.target.value),
              placeholder: "Nome completo do colaborador",
              id: "name",
              className: "w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "text-label text-[var(--text-quaternary)]", children: "E-mail Corporativo" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "email",
              required: true,
              value: email,
              onChange: (e) => setEmail(e.target.value),
              placeholder: "colaborador@jornal.com",
              id: "email",
              className: "w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "text-label text-[var(--text-quaternary)]", children: "Senha Inicial" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "password",
              required: true,
              minLength: 6,
              value: password,
              onChange: (e) => setPassword(e.target.value),
              placeholder: "Mínimo 6 caracteres",
              id: "password",
              className: "w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "role", className: "text-label text-[var(--text-quaternary)]", children: "Função Editorial" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: roleSelection,
              onChange: (e) => setRoleSelection(e.target.value),
              id: "role",
              className: "w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300 appearance-none cursor-pointer",
              children: [
                /* @__PURE__ */ jsx("option", { value: "reporter", children: "Repórter" }),
                /* @__PURE__ */ jsx("option", { value: "editor", children: "Editor de Bloco" }),
                /* @__PURE__ */ jsx("option", { value: "chefe_redacao", children: "Editor-chefe" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "w-full py-3.5 mt-6 rounded-2xl bg-[var(--accent-primary)] text-white font-bold hover:shadow-[var(--shadow-xl)] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 shadow-[var(--shadow-lg)]",
            children: loading ? "Registrando..." : "Cadastrar Membro"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-caption text-[var(--text-tertiary)] mt-6 text-center", children: /* @__PURE__ */ jsx(Link, { to: "/pautas", className: "text-[var(--accent-primary)] hover:underline font-semibold", children: "Voltar ao Painel Principal" }) })
    ] })
  ] }) });
}
const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({
      to: "/pautas"
    });
  }
});
const TpRoute = Route$b.update({
  id: "/tp",
  path: "/tp",
  getParentRoute: () => Route$c
});
const RelatoriosRoute = Route$a.update({
  id: "/relatorios",
  path: "/relatorios",
  getParentRoute: () => Route$c
});
const RedacaoRoute = Route$9.update({
  id: "/redacao",
  path: "/redacao",
  getParentRoute: () => Route$c
});
const PlayouTRoute = Route$8.update({
  id: "/playouT",
  path: "/playouT",
  getParentRoute: () => Route$c
});
const PesquisaRoute = Route$7.update({
  id: "/pesquisa",
  path: "/pesquisa",
  getParentRoute: () => Route$c
});
const PautasRoute = Route$6.update({
  id: "/pautas",
  path: "/pautas",
  getParentRoute: () => Route$c
});
const MetricasRoute = Route$5.update({
  id: "/metricas",
  path: "/metricas",
  getParentRoute: () => Route$c
});
const LoginRoute = Route$4.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$c
});
const EspelhoRoute = Route$3.update({
  id: "/espelho",
  path: "/espelho",
  getParentRoute: () => Route$c
});
const DashboardRoute = Route$2.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => Route$c
});
const CadastroRoute = Route$1.update({
  id: "/cadastro",
  path: "/cadastro",
  getParentRoute: () => Route$c
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$c
});
const rootRouteChildren = {
  IndexRoute,
  CadastroRoute,
  DashboardRoute,
  EspelhoRoute,
  LoginRoute,
  MetricasRoute,
  PautasRoute,
  PesquisaRoute,
  PlayouTRoute,
  RedacaoRoute,
  RelatoriosRoute,
  TpRoute
};
const routeTree = Route$c._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router;
};
export {
  getRouter
};
