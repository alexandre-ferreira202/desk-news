import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useRouter, isRedirect, useRouterState, useNavigate, Link, createRootRouteWithContext, Outlet, HeadContent, Scripts, createFileRoute, ErrorComponent, Navigate, redirect, createRouter } from "@tanstack/react-router";
import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import * as React from "react";
import React__default, { useState, useEffect, useCallback, createContext, useContext, useRef, useMemo } from "react";
import { Toaster, toast } from "sonner";
import { X, LayoutGrid, FileText, Newspaper, MonitorPlay, ClipboardList, BarChart3, Film, Sun, Moon, LogOut, Menu, Timer, Type, MoveVertical, FlipHorizontal, RotateCcw, Pause, Play, Maximize, HelpCircle, BookOpen, Minimize, Keyboard, Touchpad, Zap, Plus, Calendar as Calendar$1, Loader2, CheckCircle2, Cloud, PenTool, Search, Sparkles, Undo2, Redo2, Trash2, FolderOpen, GripHorizontal, RefreshCw, HardDrive, FileCheck, FileX, VolumeX, Volume2, PowerOff, Youtube, Grid2X2, SkipBack, Square, SkipForward, Sliders, Image, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, CalendarIcon, Megaphone, Archive, Rss, ChevronLeft, ChevronRight, Pencil, ExternalLink, Printer, Users, MapPin, StickyNote, Radio, Route as Route$d, Tv, GripVertical, ShieldAlert } from "lucide-react";
import { Client, neonConfig } from "@neondatabase/serverless";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from "./server-BacCHfls.js";
import { z } from "zod";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { getDefaultClassNames, DayPicker } from "react-day-picker";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell } from "recharts";
import { Centrifuge } from "centrifuge";
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
const appCss = "/assets/styles-DoT9UyLA.css";
if (typeof process !== "undefined" && process.versions?.node) {
  const { default: ws } = await import("ws");
  neonConfig.webSocketConstructor = ws;
}
const DATABASE_URL = "postgresql://neondb_owner:npg_pv4jLNOVg0Dl@ep-weathered-pine-ac2fsgd5-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
async function runQuery(q, params) {
  const client = new Client(DATABASE_URL);
  await client.connect();
  try {
    const result = await client.query(q, params);
    return result.rows;
  } finally {
    await client.end();
  }
}
class QueryBuilder {
  _table;
  _columns = "*";
  _filters = [];
  _orders = [];
  _limit = null;
  _single = false;
  _mode = "select";
  _payload = null;
  _onConflict = null;
  constructor(table) {
    this._table = table;
  }
  select(columns = "*") {
    this._mode = "select";
    this._columns = columns;
    return this;
  }
  insert(payload) {
    this._mode = "insert";
    this._payload = payload;
    return this;
  }
  update(payload) {
    this._mode = "update";
    this._payload = payload;
    return this;
  }
  delete() {
    this._mode = "delete";
    return this;
  }
  upsert(payload, options) {
    this._mode = "upsert";
    this._payload = payload;
    this._onConflict = options?.onConflict ?? "id";
    return this;
  }
  eq(col, val) {
    this._filters.push({ col, op: "=", val });
    return this;
  }
  neq(col, val) {
    this._filters.push({ col, op: "!=", val });
    return this;
  }
  gt(col, val) {
    this._filters.push({ col, op: ">", val });
    return this;
  }
  gte(col, val) {
    this._filters.push({ col, op: ">=", val });
    return this;
  }
  lt(col, val) {
    this._filters.push({ col, op: "<", val });
    return this;
  }
  lte(col, val) {
    this._filters.push({ col, op: "<=", val });
    return this;
  }
  like(col, val) {
    this._filters.push({ col, op: "LIKE", val });
    return this;
  }
  ilike(col, val) {
    this._filters.push({ col, op: "ILIKE", val });
    return this;
  }
  is(col, val) {
    this._filters.push({ col, op: "IS", val });
    return this;
  }
  in(col, vals) {
    this._filters.push({ col, op: "IN", val: vals });
    return this;
  }
  contains(col, val) {
    this._filters.push({ col, op: "@>", val: JSON.stringify(val) });
    return this;
  }
  order(col, options) {
    this._orders.push({ col, asc: options?.ascending ?? true });
    return this;
  }
  limit(n) {
    this._limit = n;
    return this;
  }
  single() {
    this._single = true;
    this._limit = 1;
    return this;
  }
  then(resolve, reject) {
    return this._run().then(resolve, reject);
  }
  async _run() {
    try {
      let rows = [];
      if (this._mode === "select") rows = await this._execSelect();
      else if (this._mode === "insert") rows = await this._execInsert();
      else if (this._mode === "update") rows = await this._execUpdate();
      else if (this._mode === "delete") rows = await this._execDelete();
      else if (this._mode === "upsert") rows = await this._execUpsert();
      if (this._single) return { data: rows[0] ?? null, error: null };
      return { data: rows, error: null };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`[db] ${this._mode} ${this._table}:`, message);
      return { data: null, error: { message } };
    }
  }
  _lit(v) {
    if (v === null || v === void 0) return "NULL";
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    return `'${String(v).replace(/'/g, "''")}'`;
  }
  _whereClause() {
    if (this._filters.length === 0) return "";
    const parts = this._filters.map((f) => {
      if (f.op === "IN") {
        const list = f.val.map((v) => this._lit(v)).join(", ");
        return `"${f.col}" IN (${list})`;
      }
      if (f.op === "IS") return `"${f.col}" IS ${f.val === null ? "NULL" : f.val ? "TRUE" : "FALSE"}`;
      return `"${f.col}" ${f.op} ${this._lit(f.val)}`;
    });
    return "WHERE " + parts.join(" AND ");
  }
  _orderClause() {
    if (this._orders.length === 0) return "";
    return "ORDER BY " + this._orders.map((o) => `"${o.col}" ${o.asc ? "ASC" : "DESC"}`).join(", ");
  }
  _limitClause() {
    return this._limit !== null ? `LIMIT ${this._limit}` : "";
  }
  async _execSelect() {
    const q = [`SELECT ${this._columns} FROM "${this._table}"`, this._whereClause(), this._orderClause(), this._limitClause()].filter(Boolean).join(" ");
    return runQuery(q);
  }
  async _execInsert() {
    const rows = Array.isArray(this._payload) ? this._payload : [this._payload];
    const cols = Object.keys(rows[0]);
    const colList = cols.map((c) => `"${c}"`).join(", ");
    const valRows = rows.map((r) => `(${cols.map((c) => this._lit(r[c])).join(", ")})`).join(", ");
    const q = `INSERT INTO "${this._table}" (${colList}) VALUES ${valRows} RETURNING *`;
    return runQuery(q);
  }
  async _execUpdate() {
    const payload = this._payload;
    const sets = Object.keys(payload).map((c) => `"${c}" = ${this._lit(payload[c])}`).join(", ");
    const q = [`UPDATE "${this._table}" SET ${sets}`, this._whereClause(), "RETURNING *"].filter(Boolean).join(" ");
    return runQuery(q);
  }
  async _execDelete() {
    const q = [`DELETE FROM "${this._table}"`, this._whereClause(), "RETURNING *"].filter(Boolean).join(" ");
    return runQuery(q);
  }
  async _execUpsert() {
    const rows = Array.isArray(this._payload) ? this._payload : [this._payload];
    const cols = Object.keys(rows[0]);
    const colList = cols.map((c) => `"${c}"`).join(", ");
    const valRows = rows.map((r) => `(${cols.map((c) => this._lit(r[c])).join(", ")})`).join(", ");
    const conflict = this._onConflict ?? "id";
    const sets = cols.filter((c) => c !== conflict).map((c) => `"${c}" = EXCLUDED."${c}"`).join(", ");
    const q = `INSERT INTO "${this._table}" (${colList}) VALUES ${valRows} ON CONFLICT ("${conflict}") DO UPDATE SET ${sets} RETURNING *`;
    return runQuery(q);
  }
}
const db = {
  from(table) {
    return new QueryBuilder(table);
  },
  async query(queryStr, params) {
    try {
      const rows = await runQuery(queryStr, params);
      return { rows, data: rows, error: null };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("[db] query error:", message);
      return { rows: [], data: [], error: { message } };
    }
  }
};
const SESSION_KEY = "desknews-session";
function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
async function signIn(email, password) {
  try {
    const { rows } = await db.query(
      `SELECT id, email, nome, papel, senha_hash, pode_acessar_pautas
       FROM users WHERE email = $1 LIMIT 1`,
      [email.toLowerCase().trim()]
    );
    const user = rows?.[0];
    if (!user) return { user: null, error: "Usuário não encontrado." };
    const senhaHash = user.senha_hash;
    let senhaOk = false;
    if (senhaHash) {
      if (senhaHash.startsWith("$2")) {
        senhaOk = await verificarBcrypt(password, senhaHash);
      } else {
        senhaOk = senhaHash === password;
      }
    }
    if (!senhaOk) return { user: null, error: "Senha incorreta." };
    if (!user.pode_acessar_pautas) {
      return { user: null, error: "Sem permissão de acesso. Contate a chefia." };
    }
    const sessionUser = {
      id: String(user.id),
      email: String(user.email),
      nome: String(user.nome || user.email),
      papel: String(user.papel || "repórter"),
      pode_acessar_pautas: Boolean(user.pode_acessar_pautas)
    };
    saveSession(sessionUser);
    return { user: sessionUser, error: null };
  } catch (err) {
    console.error("[auth] signIn error:", err);
    return { user: null, error: "Erro ao conectar com o banco." };
  }
}
async function signOut() {
  clearSession();
}
async function verificarBcrypt(senha, hash) {
  return hash === senha;
}
function useAuth() {
  const [user, setUser] = useState(() => getSession());
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === SESSION_KEY) setUser(e.newValue ? JSON.parse(e.newValue) : null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const login = useCallback(async (email, password) => {
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.user) setUser(result.user);
    return result;
  }, []);
  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);
  return { user, loading, login, logout };
}
const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/pautas", label: "Pautas", icon: FileText },
  { to: "/redacao", label: "Reportagens", icon: Newspaper },
  { to: "/espelho", label: "Espelho", icon: MonitorPlay },
  { to: "/relatorios", label: "Relatórios", icon: ClipboardList },
  { to: "/metricas", label: "Métricas", icon: BarChart3 }
];
function AppShell({ children }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const session = getSession();
    if (!session && path !== "/login") {
      navigate({ to: "/login" });
      return;
    }
    setUser(session);
  }, [path]);
  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };
  const sidebar = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "px-4 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx("img", { src: "/logo1.png", alt: "DeskNews", className: "h-9 opacity-90" }) }),
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
    /* @__PURE__ */ jsxs("nav", { className: "flex-1 p-2 space-y-1 overflow-y-auto", children: [
      nav.map((item) => {
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
      }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => {
            window.open("/DeskNews_Media_Editor_12.html", "_blank", "noopener,noreferrer");
            setOpen(false);
          },
          className: "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-body-sm transition-all duration-300 active:scale-[0.98] text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] border border-transparent",
          children: [
            /* @__PURE__ */ jsx(Film, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { children: "Edição" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-3 border-t border-[var(--border-subtle)]", children: [
      /* @__PURE__ */ jsxs("div", { className: "px-2 pb-2 flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("div", { className: "text-body-sm font-medium truncate text-[var(--text-primary)]", children: user?.nome ?? "—" }),
          /* @__PURE__ */ jsx("div", { className: "text-label text-[var(--text-tertiary)] truncate", children: user?.papel?.replace("_", " ").toUpperCase() ?? "SEM PAPEL" })
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
    /* @__PURE__ */ jsx("aside", { className: "hidden md:flex w-[220px] shrink-0 bg-[var(--glass-bg)] backdrop-blur-xl border-r border-[var(--glass-border)] flex-col shadow-[var(--shadow-lg)]", children: sidebar }),
    open && /* @__PURE__ */ jsxs("div", { className: "md:hidden fixed inset-0 z-50 flex", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[var(--bg-primary)]/70 backdrop-blur-sm", onClick: () => setOpen(false) }),
      /* @__PURE__ */ jsx("aside", { className: "relative w-[220px] max-w-[80vw] bg-[var(--glass-bg)] backdrop-blur-xl border-r border-[var(--glass-border)] flex flex-col animate-in slide-in-from-left", children: sidebar })
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
const ItemStatusSchema = z.enum(["pendente", "pronto", "no_ar", "exibido", "cortado"]);
const LoadEspelhoSchema = z.object({
  date: z.string(),
  programa: z.string()
});
const AddBlocoSchema = z.object({
  date: z.string(),
  nome: z.string(),
  ordem: z.number().int(),
  programa: z.string()
});
const AddItemSchema = z.object({
  blocoId: z.string(),
  ordem: z.number().int(),
  assunto: z.string(),
  formato: z.string(),
  tempo: z.string(),
  tempoCab: z.string()
});
const AddFromMateriaSchema = z.object({
  blocoId: z.string(),
  ordem: z.number().int(),
  assunto: z.string(),
  materiaId: z.string(),
  formato: z.string(),
  tempo: z.string(),
  tempoCab: z.string(),
  cabeca: z.string().nullable()
});
const UpdateItemSchema = z.object({
  id: z.string(),
  patch: z.object({
    assunto: z.string(),
    formato: z.string().nullable(),
    tempo: z.string().nullable(),
    tempo_cab: z.string().nullable(),
    tempo_total: z.string().nullable(),
    status: ItemStatusSchema,
    materia_id: z.string().nullable(),
    editor_texto_id: z.string().nullable(),
    editor_imagem_id: z.string().nullable(),
    cabeca: z.string().nullable(),
    bloco_id: z.string(),
    ordem: z.number().int()
  }).partial()
});
const UpdateBlocoSchema = z.object({
  id: z.string(),
  patch: z.object({
    nome: z.string(),
    ordem: z.number().int(),
    apresentador: z.string().nullable(),
    programa: z.string()
  }).partial()
});
const DelByIdSchema = z.object({
  id: z.string()
});
const ReorderItemSchema = z.object({
  id: z.string(),
  ordem: z.number().int(),
  bloco_id: z.string()
});
const ReorderSchema = z.object({
  itens: z.array(ReorderItemSchema)
});
const UpdateMateriaCabecaSchema = z.object({
  materiaId: z.string(),
  creditoReporter: z.string(),
  cabeca: z.string(),
  tempoCab: z.string(),
  tempoVt: z.string()
});
const UpdateMateriaSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  titulo: z.string(),
  cabeca: z.string().nullable(),
  tempoVt: z.string().nullable(),
  tempoCab: z.string().nullable(),
  deixa: z.string().nullable(),
  estrutura: z.string().nullable(),
  corpo: z.string().nullable(),
  creditoReporter: z.string().nullable()
});
const loadEspelho = createServerFn({
  method: "GET"
}).validator(LoadEspelhoSchema).handler(createSsrRpc("43cce26e2d9c7d7236c79f7189b57e0301d0bfdf4db0018bb7aacebb767ee4ad"));
const loadMaterias = createServerFn({
  method: "GET"
}).handler(createSsrRpc("ad2fc5518f7239326e3f3a0014c6f45b5ab402d4edc4959403c81d196c966beb"));
const addBloco = createServerFn({
  method: "POST"
}).validator(AddBlocoSchema).handler(createSsrRpc("6535f7b9b94bb8e973875c63a5ec85ddceca0579fc9e2286b926d6706e83f4e9"));
const addItem = createServerFn({
  method: "POST"
}).validator(AddItemSchema).handler(createSsrRpc("c7b0f794176848649130066b4ca4f5e76b7ec7f2789bcea8c15d21d2fa33f465"));
const addFromMateria = createServerFn({
  method: "POST"
}).validator(AddFromMateriaSchema).handler(createSsrRpc("569d48dd3002cdf42ee23072ec5c032b99dce65d5ab3b7541e5e35250267b272"));
const addComercial = createServerFn({
  method: "POST"
}).validator(z.object({
  blocoId: z.string(),
  ordem: z.number().int()
})).handler(createSsrRpc("4c8755d3d99eca613e3e71e4d5b9474154e21982b56b52eedc1770c0fad09431"));
const updateItem = createServerFn({
  method: "POST"
}).validator(UpdateItemSchema).handler(createSsrRpc("884a019b0675dc4500b80314145702afebb87b89cb76241817016da28b5c01c2"));
const updateBloco = createServerFn({
  method: "POST"
}).validator(UpdateBlocoSchema).handler(createSsrRpc("a96ac18cb419a723a0f4800ac8e5cc5974752c47500bbf49b78ca4e27297a018"));
const delItem = createServerFn({
  method: "POST"
}).validator(DelByIdSchema).handler(createSsrRpc("750da42b80265ce82c347f2dd53a36328a71128f315f1e899f628d76f31910b4"));
const delBloco = createServerFn({
  method: "POST"
}).validator(DelByIdSchema).handler(createSsrRpc("d8ca7de4792b1cb7cb60e38e9707eb843bc68895044e007e4ef3707b9a9a7daa"));
const reorderItens = createServerFn({
  method: "POST"
}).validator(ReorderSchema).handler(createSsrRpc("a16ed97afda1647cb228bc144676893695ecfa5039f79d6d0d6adb86d7254391"));
const updateMateriaEItem = createServerFn({
  method: "POST"
}).validator(UpdateMateriaSchema).handler(createSsrRpc("901abf35ed427a78ae718dbfcd63e1e3a16327ca38bc35011a0bd895f29fb182"));
const updateMateriaCabeca = createServerFn({
  method: "POST"
}).validator(UpdateMateriaCabecaSchema).handler(createSsrRpc("c5fde7026c8577aec8eccb352826fea710d1f3ec475d04a5873672a718e0dee6"));
const broadcastEditando = createServerFn({
  method: "POST"
}).validator(z.object({
  itemId: z.string(),
  editando: z.boolean()
})).handler(createSsrRpc("c8f3229b6fc13b6377288ce4e334b48d97871bff593728663ba6244afcebfa9b"));
const broadcastProducao = createServerFn({
  method: "POST"
}).validator(z.object({
  valor: z.string()
})).handler(createSsrRpc("b7b6deffab0d610de331893c033da16fb3c7c1a93806f97cbefc567e0e8ca0a4"));
const broadcastMaster = createServerFn({
  method: "POST"
}).validator(z.object({
  valor: z.string()
})).handler(createSsrRpc("f45e228d1f674f40ad9099b74933bc7f0b19577f51673eacad4852455b9ed645"));
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
function ReadingMonitor({
  isOpen,
  onClose,
  content
}) {
  const monitorScrollRef = useRef(null);
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxs("div", { className: "fixed bottom-4 left-4 z-[200] w-96 h-64 bg-zinc-900/90 backdrop-blur-md border border-zinc-700 rounded-xl shadow-2xl flex flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 bg-zinc-950/50 border-b border-zinc-800", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(BookOpen, { className: "h-4 w-4 text-primary" }),
        /* @__PURE__ */ jsx("h3", { className: "text-xs font-bold uppercase tracking-wider", children: "Monitor de Leitura" })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "p-1.5 hover:bg-zinc-800 rounded-md transition-colors", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsx(
      "div",
      {
        ref: monitorScrollRef,
        className: "flex-1 overflow-y-auto p-4 no-scrollbar",
        style: { lineHeight: 1.5, textAlign: "center", scrollBehavior: "smooth" },
        children: content ? /* @__PURE__ */ jsx(
          "div",
          {
            className: "whitespace-pre-wrap text-xs uppercase font-bold tracking-wider",
            children: content
          }
        ) : /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full text-zinc-600 italic text-sm", children: "Aguardando texto..." })
      }
    )
  ] });
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
  const [showReadingMonitor, setShowReadingMonitor] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const lastBroadcastTimeRef = useRef(0);
  const rodaTvRef = useRef(null);
  const scrollRef = useRef(null);
  const requestRef = useRef();
  const isRemoteUpdateRef = useRef(false);
  const rodaTvFiredRef = useRef(null);
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
    const { data: allBlocks, error: bErr } = await db.from("espelho_blocos").select("id, nome, ordem, apresentador, programa").eq("data_edicao", date).order("ordem");
    if (bErr) {
      toast.error("Erro ao carregar blocos: " + bErr.message);
      return;
    }
    const blocks = programaNorm === "todos" ? allBlocks ?? [] : (allBlocks ?? []).filter((b) => (b.programa ?? "").toLowerCase().trim() === programaNorm);
    if (blocks.length > 0) {
      setBlocos(blocks);
      const { data: rawItens, error: iErr } = await db.from("espelho_itens").select("id, bloco_id, assunto, cabeca, ordem, status, tempo_cab, materia_id").in("bloco_id", blocks.map((b) => b.id)).order("ordem");
      if (iErr) toast.error("Erro ao carregar matérias: " + iErr.message);
      const seq = [];
      blocks.forEach((block) => {
        (rawItens || []).filter((i) => i.bloco_id === block.id).sort((a, b) => a.ordem - b.ordem).forEach((i) => seq.push(i));
      });
      const materiaIds = seq.filter((i) => i.materia_id && !i.cabeca).map((i) => i.materia_id);
      if (materiaIds.length > 0) {
        const { data: mats } = await db.from("materias").select("id, cabeca").in("id", materiaIds);
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
    const interval = setInterval(() => {
      loadItems();
    }, 3e4);
    return () => clearInterval(interval);
  }, [loadItems]);
  useEffect(() => {
  }, []);
  useEffect(() => {
    loadItems();
  }, [date, programa]);
  useEffect(() => {
    if (syncMode !== "camera") return;
    setIsConnected(true);
    const interval = setInterval(async () => {
      const key = `tp-sync-${programa || "geral"}`;
      const { data, error } = await db.from("tp_master_state").select("*").eq("canal", key).maybeSingle();
      if (error || !data) return;
      const payload = data.state;
      isRemoteUpdateRef.current = true;
      if (payload.selectedItemId !== void 0 && payload.selectedItemId !== selectedItemId)
        setSelectedItemId(payload.selectedItemId);
      if (payload.isScrolling !== void 0) setIsScrolling(payload.isScrolling);
      if (payload.fontSize !== void 0) setFontSize(payload.fontSize);
      if (payload.scrollSpeed !== void 0) setScrollSpeed(payload.scrollSpeed);
      if (payload.mirrored !== void 0) setMirrored(payload.mirrored);
      if (payload.scrollTop !== void 0 && scrollRef.current)
        scrollRef.current.scrollTop = payload.scrollTop;
      setTimeout(() => {
        isRemoteUpdateRef.current = false;
      }, 100);
    }, 1500);
    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [syncMode, programa, selectedItemId]);
  const syncStateRef = useRef({ selectedItemId, isScrolling, fontSize, scrollSpeed, mirrored, syncMode, programa });
  useEffect(() => {
    syncStateRef.current = { selectedItemId, isScrolling, fontSize, scrollSpeed, mirrored, syncMode, programa };
  }, [selectedItemId, isScrolling, fontSize, scrollSpeed, mirrored, syncMode, programa]);
  const doUpsert = useCallback(async () => {
    const s = syncStateRef.current;
    if (s.syncMode !== "master") return;
    const now = Date.now();
    if (now - lastBroadcastTimeRef.current < 2e3) return;
    lastBroadcastTimeRef.current = now;
    const key = `tp-sync-${s.programa || "geral"}`;
    await db.from("tp_master_state").upsert({
      canal: key,
      state: {
        selectedItemId: s.selectedItemId,
        isScrolling: s.isScrolling,
        fontSize: s.fontSize,
        scrollSpeed: s.scrollSpeed,
        mirrored: s.mirrored,
        scrollTop: scrollRef.current?.scrollTop || 0
      },
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }, { onConflict: "canal" });
  }, []);
  useEffect(() => {
    lastBroadcastTimeRef.current = 0;
    doUpsert();
  }, [selectedItemId, isScrolling, fontSize, scrollSpeed, mirrored, doUpsert]);
  useEffect(() => {
    if (syncMode !== "master" || !isScrolling) return;
    const interval = setInterval(() => {
      doUpsert();
    }, 3e3);
    return () => clearInterval(interval);
  }, [syncMode, isScrolling, doUpsert]);
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
        rodaTvFiredRef.current = null;
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
    try {
      await updateItem({ data: { id: itemId, patch: { status: newStatus } } });
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
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
          if (currentItem2 && rodaTvFiredRef.current !== currentItem2.id) {
            rodaTvFiredRef.current = currentItem2.id;
            db.from("tp_playout_events").insert({
              event: "RODA_VT",
              materia_id: currentItem2.materia_id ?? null,
              assunto: currentItem2.assunto,
              item_id: currentItem2.id,
              created_at: (/* @__PURE__ */ new Date()).toISOString()
            }).then(({ error }) => {
              if (error) console.error("Erro ao enviar RODA_VT:", error.message);
            });
          }
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
    /* @__PURE__ */ jsx(
      ReadingMonitor,
      {
        isOpen: showReadingMonitor,
        onClose: () => setShowReadingMonitor(false),
        content: currentItem?.cabeca ?? null
      }
    ),
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
          /* @__PURE__ */ jsx(Button, { size: "icon", variant: "outline", onClick: () => setShowInstructions(true), className: "h-8 w-8", title: "Guia de Atalhos", children: /* @__PURE__ */ jsx(HelpCircle, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(Button, { size: "icon", variant: showReadingMonitor ? "default" : "outline", onClick: () => setShowReadingMonitor((p) => !p), className: "h-8 w-8", title: "Monitor de Leitura", children: /* @__PURE__ */ jsx(BookOpen, { className: "h-4 w-4" }) })
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
          children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto uppercase font-bold text-center", children: [
            currentItem ? /* @__PURE__ */ jsxs("div", { className: "space-y-16", children: [
              /* @__PURE__ */ jsx("div", { className: "text-emerald-400 text-5xl tracking-wider text-center border-b-2 border-emerald-500/20 pb-6 mb-12", children: currentItem.assunto }),
              (() => {
                const bl = blocos.find((b) => b.id === currentItem.bloco_id);
                return bl?.apresentador && /* @__PURE__ */ jsxs("div", { className: "text-amber-400 text-center mb-12 text-6xl font-black border-2 border-amber-500/20 py-4 rounded-xl bg-amber-500/10", children: [
                  "[",
                  bl.apresentador,
                  "]"
                ] });
              })(),
              currentItem.cabeca ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("div", { className: "whitespace-pre-wrap leading-[1.25]", children: currentItem.cabeca }),
                /* @__PURE__ */ jsx("div", { ref: rodaTvRef, className: "text-emerald-400 text-center mt-16 text-6xl font-black border-4 border-emerald-500/30 py-6 rounded-2xl bg-emerald-500/10", children: "[RODA TV]" })
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
  const { user } = useAuth();
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState(format(/* @__PURE__ */ new Date(), "yyyy-MM-01"));
  const [dataFim, setDataFim] = useState(format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
  const [programa, setPrograma] = useState("Todos");
  const [eventoFiltro, setEventoFiltro] = useState("Todos");
  const [showNew, setShowNew] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    let query = db.from("relatorios").select("*").order("data", { ascending: false });
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
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen p-4 sm:p-6 bg-[#09090b] text-slate-100 font-sans", children: [
    /* @__PURE__ */ jsxs("div", { className: "border-b border-[#22c55e]/20 pb-4 mb-8", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono uppercase tracking-[0.2em] text-[#22c55e] mb-1", children: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).toUpperCase() }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-10 w-10 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/40", children: /* @__PURE__ */ jsx(ClipboardList, { className: "h-5 w-5 text-[#22c55e]" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl sm:text-4xl font-black tracking-tight font-mono uppercase text-white", children: "Relatórios" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-8", children: [
      /* @__PURE__ */ jsx("div", { className: "hidden sm:block", children: /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest", children: "Histórico de ocorrências" }) }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          onClick: () => setShowNew(true),
          className: "inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#22c55e]/10 border border-[#22c55e] text-white text-xs font-black uppercase tracking-wider transition-all duration-300 hover:bg-[#22c55e]/20 hover:shadow-lg hover:shadow-[#22c55e]/20 active:scale-95 font-mono",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            " Novo"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 mb-8 backdrop-blur-lg shadow-2xl", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest mb-4", children: "Filtros" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2", children: "Data Inicial" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              value: dataInicio,
              onChange: (e) => setDataInicio(e.target.value),
              className: "w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all font-mono"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2", children: "Data Final" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              value: dataFim,
              onChange: (e) => setDataFim(e.target.value),
              className: "w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all font-mono"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2", children: "Programa" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: programa,
              onChange: (e) => setPrograma(e.target.value),
              className: "w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all appearance-none cursor-pointer font-mono",
              children: [
                /* @__PURE__ */ jsx("option", { value: "Todos", children: "Todos" }),
                /* @__PURE__ */ jsx("option", { value: "Jornal da Manhã", children: "Jornal da Manhã" }),
                /* @__PURE__ */ jsx("option", { value: "Edição Meio-Dia", children: "Edição Meio-Dia" }),
                /* @__PURE__ */ jsx("option", { value: "Jornal da Noite", children: "Jornal da Noite" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2", children: "Eventos" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: eventoFiltro,
              onChange: (e) => setEventoFiltro(e.target.value),
              className: "w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all appearance-none cursor-pointer font-mono",
              children: [
                /* @__PURE__ */ jsx("option", { value: "Todos", children: "Mostrar Tudo" }),
                /* @__PURE__ */ jsx("option", { value: "Pautas Caídas", children: "Pautas Caídas" }),
                /* @__PURE__ */ jsx("option", { value: "Relatórios", children: "Relatórios" }),
                /* @__PURE__ */ jsx("option", { value: "Outros", children: "Outros" })
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4", children: loading ? /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-slate-500 italic font-mono text-xs", children: "CARREGANDO..." }) : relatorios.length === 0 ? /* @__PURE__ */ jsx("div", { className: "bg-[#0f0f12] border border-dashed border-[#22c55e]/30 rounded-lg p-12 text-center text-slate-500 text-xs font-mono", children: "SEM REGISTROS" }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4", children: relatorios.map((r) => /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-4 hover:bg-[#1a1a21] hover:border-[#22c55e]/40 transition-all group backdrop-blur-lg shadow-xl hover:shadow-[0_0_20px_#22c55e10]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsx("span", { className: "bg-[#22c55e]/20 text-[#22c55e] text-xs px-3 py-1.5 rounded-md border border-[#22c55e]/40 font-mono font-bold uppercase tracking-wider", children: r.evento }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-500 flex items-center gap-1 font-mono", children: [
            /* @__PURE__ */ jsx(Calendar$1, { className: "h-3 w-3" }),
            new Date(r.data).toLocaleDateString("pt-BR")
          ] })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-600 font-mono uppercase tracking-widest", children: r.programa })
      ] }),
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-slate-100 mb-2 font-mono uppercase", children: r.retranca }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 line-clamp-2 leading-relaxed", children: r.texto })
    ] }, r.id)) }) }),
    showNew && user && /* @__PURE__ */ jsx(
      NewRelatorioModal,
      {
        userId: user.id,
        onClose: () => setShowNew(false),
        onSaved: () => {
          setShowNew(false);
          load();
        }
      }
    )
  ] });
}
function NewRelatorioModal({ userId, onClose, onSaved }) {
  const [data, setData] = useState(format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
  const [retranca, setRetranca] = useState("");
  const [evento, setEvento] = useState("Relatórios");
  const [programa, setPrograma] = useState("Jornal da Manhã");
  const [texto, setTexto] = useState("");
  const [saving, setSaving] = useState(false);
  const charLimit = 2100;
  const submit = async (e) => {
    e.preventDefault();
    if (!retranca || !texto) return toast.error("Preencha todos os campos obrigatórios.");
    setSaving(true);
    const { error } = await db.from("relatorios").insert({
      data,
      retranca,
      evento,
      programa,
      texto,
      autor_id: userId
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Relatório salvo com sucesso!");
      onSaved();
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4 z-50", onClick: onClose, children: /* @__PURE__ */ jsxs(
    "div",
    {
      onClick: (e) => e.stopPropagation(),
      className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "p-6 border-b border-[#22c55e]/10 bg-[#0a0e27] flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 bg-[#22c55e]/20 rounded-md border border-[#22c55e]/30", children: /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 text-[#22c55e]" }) }),
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-black tracking-tight text-white font-mono uppercase", children: "Novo Relatório" })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: onClose, className: "p-2 rounded-md text-slate-500 hover:bg-[#1a1a21] hover:text-slate-200 transition-all", children: /* @__PURE__ */ jsx("span", { className: "text-xl font-mono", children: "✕" }) })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "p-6 space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2", children: "Data" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  required: true,
                  type: "date",
                  value: data,
                  onChange: (e) => setData(e.target.value),
                  className: "w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all font-mono"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2", children: "Programa" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: programa,
                  onChange: (e) => setPrograma(e.target.value),
                  className: "w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all appearance-none cursor-pointer font-mono",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "Jornal da Manhã", children: "Jornal da Manhã" }),
                    /* @__PURE__ */ jsx("option", { value: "Edição Meio-Dia", children: "Edição Meio-Dia" }),
                    /* @__PURE__ */ jsx("option", { value: "Jornal da Noite", children: "Jornal da Noite" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2", children: "Evento" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: evento,
                  onChange: (e) => setEvento(e.target.value),
                  className: "w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all appearance-none cursor-pointer font-mono",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "Pautas Caídas", children: "Pautas Caídas" }),
                    /* @__PURE__ */ jsx("option", { value: "Relatórios", children: "Relatórios" }),
                    /* @__PURE__ */ jsx("option", { value: "Outros", children: "Outros" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs text-slate-600 font-mono uppercase tracking-widest block mb-2", children: "Retranca" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  required: true,
                  placeholder: "Ex: ACIDENTE BR-101",
                  value: retranca,
                  onChange: (e) => setRetranca(e.target.value),
                  className: "w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all font-mono"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs text-slate-600 font-mono uppercase tracking-widest", children: "Conteúdo" }),
              /* @__PURE__ */ jsxs("span", { className: `text-xs font-mono ${texto.length > charLimit ? "text-[#ef4444]" : "text-slate-600"}`, children: [
                texto.length,
                " / ",
                charLimit
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                required: true,
                placeholder: "Descreva o ocorrido...",
                value: texto,
                onChange: (e) => setTexto(e.target.value.slice(0, charLimit)),
                rows: 5,
                className: "w-full px-4 py-2 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all resize-none leading-relaxed font-mono"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t border-[#22c55e]/10", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: onClose,
                className: "px-6 py-2 rounded-md text-xs font-mono uppercase font-bold text-slate-400 bg-transparent border border-[#22c55e]/30 transition-all hover:text-slate-200 hover:bg-[#1a1a21] hover:border-[#22c55e]/50 active:scale-95",
                children: "Cancelar"
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "submit",
                disabled: saving || texto.length > charLimit,
                className: "px-6 py-2 rounded-md text-xs font-mono uppercase font-bold bg-[#22c55e]/10 border border-[#22c55e] text-white transition-all hover:bg-[#22c55e]/20 hover:shadow-lg hover:shadow-[#22c55e]/20 active:scale-95 disabled:opacity-50",
                children: saving ? "SALVANDO..." : "SALVAR"
              }
            )
          ] })
        ] })
      ]
    }
  ) });
}
const DB_NAME = "desknews_drafts";
const STORE_NAME = "drafts";
const openDB = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});
async function autosave(id, feature, data) {
  const db2 = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db2.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(data, `${feature}_${id}`);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function restoreDraft(id, feature) {
  const db2 = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db2.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(`${feature}_${id}`);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function useAutosave(draftId, feature, data, delay = 1500) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const timeoutRef = useRef();
  useEffect(() => {
    if (!draftId) return;
    setIsSaving(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      await autosave(draftId, feature, data);
      setLastSaved(/* @__PURE__ */ new Date());
      setIsSaving(false);
    }, delay);
  }, [draftId, feature, JSON.stringify(data), delay]);
  return { isSaving, lastSaved };
}
function AutosaveIndicator({ isSaving, lastSaved }) {
  return /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 text-xs font-mono", children: isSaving ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-yellow-500", children: [
    /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }),
    "Salvando rascunho..."
  ] }) : lastSaved ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-emerald-500", children: [
    /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }),
    "Salvo localmente"
  ] }) : /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-[var(--text-tertiary)]", children: [
    /* @__PURE__ */ jsx(Cloud, { className: "h-3.5 w-3.5" }),
    "Nuvem"
  ] }) });
}
class GroqService {
  apiKey;
  baseURL = "https://api.groq.com/openai/v1";
  requestTimeout = 1e4;
  // 10s timeout
  constructor(apiKey) {
    if (!apiKey) throw new Error("Groq API Key não configurada");
    this.apiKey = apiKey;
  }
  async makeRequest(messages, maxTokens = 500, temperature = 0.3) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature,
          max_tokens: maxTokens
        }),
        signal: controller.signal
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Groq API error: ${response.status} - ${errorData.error?.message || response.statusText}`
        );
      }
      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } finally {
      clearTimeout(timeoutId);
    }
  }
  /**
   * Extrai créditos de uma lauda estruturada
   * Ideal para: SONORA, PASSAGEM, EDITOR TEXTO, REPÓRTER
   */
  async extractCreditsFromLauda(estrutura, editorTexto, creditoReporter) {
    if (!estrutura || estrutura.length < 10) {
      return [];
    }
    const prompt = `Você é assistente de edição de TV. Extraia NOMES PRÓPRIOS de pessoas desta LAUDA.

REGRAS ESTRITAS:
1. Retorne APENAS um JSON array válido
2. Inclua pessoas que têm nome próprio claramente identificável
3. Tipos: SONORA (entrevistado), PASSAGEM (repórter), ED_TEXTO (editor), REPÓRTER
4. Se não encontrar nomes, retorne: []
5. Deduplicar nomes automáticos

EXEMPLO DE SAÍDA:
[
  { "nome": "JOÃO SILVA", "tipo": "PASSAGEM", "funcao": "repórter" },
  { "nome": "MARIA SANTOS", "tipo": "SONORA", "funcao": "diretora" }
]

LAUDA A ANALISAR:
${estrutura}

${editorTexto ? `EDITOR TEXTO: ${editorTexto}` : ""}
${creditoReporter ? `CRÉDITO REPORTER: ${creditoReporter}` : ""}

RESPONDA APENAS COM O JSON, SEM OUTROS TEXTOS.`;
    try {
      const content = await this.makeRequest(
        [{ role: "user", content: prompt }],
        300,
        0.2
      );
      const cleanedContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedContent);
      if (!Array.isArray(parsed)) {
        return [];
      }
      const seen = /* @__PURE__ */ new Set();
      return parsed.filter((item) => {
        if (typeof item.nome !== "string" || item.nome.length < 2) {
          return false;
        }
        const key = item.nome.toUpperCase().trim();
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
    } catch (error) {
      console.error("Erro ao extrair créditos:", error);
      return [];
    }
  }
  /**
   * Gera legendas em tempo real baseado em texto
   */
  async generateCaptions(texto, duracao) {
    if (!texto || texto.length < 10) {
      return [];
    }
    const prompt = `Gere legendas para TV em português baseado neste texto.

REGRAS:
1. Máximo 42 caracteres por linha (TV 16:9)
2. Intervalo de 2-5 segundos entre legendas
3. Quebras naturais de frase
4. SEM pontuação final
5. Retorne APENAS um JSON array válido
6. Se não conseguir, retorne: []

FORMATO:
[
  { "offset_seconds": 0, "text": "primeira legenda" },
  { "offset_seconds": 3, "text": "segunda legenda" }
]

TEXTO:
${texto}

Duração estimada: ${duracao || 30} segundos

RESPONDA APENAS COM O JSON.`;
    try {
      const content = await this.makeRequest(
        [{ role: "user", content: prompt }],
        500,
        0.3
      );
      const cleanedContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedContent);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter(
        (item) => typeof item.offset_seconds === "number" && typeof item.text === "string"
      );
    } catch (error) {
      console.error("Erro ao gerar legendas:", error);
      return [];
    }
  }
  /**
   * Sugestiona completamentos para um crédito parcial
   * Útil para autocomplete
   */
  async suggestCredit(contextText, userInput) {
    if (!userInput || userInput.length < 1) {
      return [];
    }
    const prompt = `Contexto de TV: "${contextText}"
Usuário digitou: "${userInput}"

Sugira 3 completamentos CURTOS (máx 30 chars cada) que façam sentido.
Retorne APENAS um JSON array de strings:
["sugestão1", "sugestão2", "sugestão3"]`;
    try {
      const content = await this.makeRequest(
        [{ role: "user", content: prompt }],
        200,
        0.5
      );
      const cleanedContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedContent);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter((item) => typeof item === "string" && item.length > 0).slice(0, 3);
    } catch (error) {
      console.error("Erro ao sugerir crédito:", error);
      return [];
    }
  }
  /**
   * Valida se um texto é um nome próprio válido para crédito
   */
  async validateCredit(text) {
    const prompt = `É este um nome próprio válido para crédito de TV?
    
"${text}"

Responda APENAS com JSON:
{ "isValid": true/false, "suggestion": "nome corrigido se necessário" }`;
    try {
      const content = await this.makeRequest(
        [{ role: "user", content: prompt }],
        150,
        0.2
      );
      const cleanedContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleanedContent);
    } catch (error) {
      return { isValid: false };
    }
  }
}
const useAutoCredits = (options) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const groqRef = useRef(null);
  if (groqRef.current === null && options.apiKey) {
    try {
      groqRef.current = new GroqService(options.apiKey);
    } catch (err) {
      console.error("[useAutoCredits] Falha ao iniciar GroqService:", err);
    }
  }
  const extractCredits = useCallback(
    async (estrutura, editorTexto, creditoReporter) => {
      if (!estrutura) return [];
      if (!groqRef.current) {
        console.warn("[useAutoCredits] VITE_GROQ_API_KEY ausente — pulando extração automática.");
        return [];
      }
      setIsLoading(true);
      try {
        const credits = await groqRef.current.extractCreditsFromLauda(
          estrutura,
          editorTexto,
          creditoReporter
        );
        setSuggestions(credits);
        const gcCredits = credits.map((c) => ({
          line1: c.nome.toUpperCase(),
          line2: [
            c.tipo === "SONORA" ? "🎤" : c.tipo === "PASSAGEM" ? "🎥" : c.tipo === "REPÓRTER" ? "🎙️" : "📝",
            c.funcao || ""
          ].filter(Boolean).join(" ").trim()
        }));
        if (options.deduplicate) {
          return gcCredits.filter(
            (item, idx, arr) => arr.findIndex((x) => x.line1 === item.line1) === idx
          );
        }
        return gcCredits;
      } catch (error) {
        console.error("Erro ao extrair créditos:", error);
        toast.error("Erro ao processar créditos");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [options.deduplicate]
  );
  const suggestCredit = useCallback(
    async (contextText, userInput) => {
      if (!userInput || userInput.length < 2 || !groqRef.current) return [];
      try {
        return await groqRef.current.suggestCredit(contextText, userInput);
      } catch (error) {
        console.error("Erro ao sugerir crédito:", error);
        return [];
      }
    },
    []
  );
  const validateCredit = useCallback(async (text) => {
    if (!text || text.length < 2 || !groqRef.current) {
      return { isValid: false };
    }
    try {
      return await groqRef.current.validateCredit(text);
    } catch (error) {
      return { isValid: false };
    }
  }, []);
  return {
    isLoading,
    suggestions,
    extractCredits,
    suggestCredit,
    validateCredit
  };
};
function RouteErrorComponent({ error }) {
  const isModuleError = error instanceof Error && (error.message.includes("Failed to fetch dynamically imported module") || error.message.includes("Importing a module script failed") || error.message.includes("error loading dynamically imported module"));
  if (isModuleError) {
    return /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center justify-center h-screen bg-[#09090b] text-white p-6", children: /* @__PURE__ */ jsxs("div", { className: "bg-[#141416] p-8 rounded-2xl border border-[#22c55e]/20 shadow-xl max-w-md text-center border-l-[3px] border-l-[#22c55e]", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-h2 font-bold mb-3 text-white", children: "ATUALIZAÇÃO DISPONÍVEL" }),
      /* @__PURE__ */ jsx("p", { className: "text-[#9ca3af] mb-6 text-body-sm", children: "UMA NOVA VERSÃO DO DESKNEWS FOI DETECTADA OU HOUVE UMA INTERRUPÇÃO NA CONEXÃO// RECARREGUE A PÁGINA PARA CONTINUAR EDITANDO." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => window.location.reload(),
          className: "w-full py-3 bg-[#22c55e] hover:bg-[#22c55e]/90 text-black rounded-xl font-bold transition-all active:scale-[0.98]",
          children: "RECARREGAR PÁGINA"
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
function formatarTextoRedacao(texto) {
  return texto.toUpperCase();
}
function inserirNoCursor(textareaRef, mascara) {
  if (!textareaRef) return;
  const inicio = textareaRef.selectionStart;
  const fim = textareaRef.selectionEnd;
  const texto = textareaRef.value;
  const novoTexto = texto.substring(0, inicio) + mascara + texto.substring(fim);
  return novoTexto;
}
function RedacaoPage() {
  const user = null;
  const { edit } = Route$9.useSearch();
  Route$9.useNavigate();
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
  const [duracaoVt, setDuracaoVt] = useState(null);
  const [timelineJson, setTimelineJson] = useState(null);
  const [revisarOpen, setRevisarOpen] = useState(false);
  const [revisarVideoUrl, setRevisarVideoUrl] = useState(null);
  const [revisarDirHandle, setRevisarDirHandle] = useState(null);
  const [revisarCreditos, setRevisarCreditos] = useState([]);
  const [revisarDuracao, setRevisarDuracao] = useState(120);
  const [revisarCurrentTime, setRevisarCurrentTime] = useState(0);
  const revisarVideoRef = useRef(null);
  const revisarTimelineRef = useRef(null);
  const draggingCreditRef = useRef(null);
  const parsearCreditosRevisao = useCallback((estruturaAtual, dur) => {
    const linhas = estruturaAtual.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    const items = [];
    let totalPalavras = 0;
    linhas.forEach((linha) => {
      const upper = linha.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (upper.startsWith("[SONORA]")) {
        const v = linha.replace(/\[SONORA\]/i, "").trim();
        items.push({ tipo: "SONORA", valor: v, palavras: 3 });
        totalPalavras += 3;
      } else if (upper.startsWith("[PASSAGEM]")) {
        const v = linha.replace(/\[PASSAGEM\]/i, "").trim();
        items.push({ tipo: "PASSAGEM", valor: v, palavras: 4 });
        totalPalavras += 4;
      } else if (upper.startsWith("[IMAGENS]")) {
        const v = linha.replace(/\[IMAGENS\]/i, "").trim();
        items.push({ tipo: "IMAGENS", valor: v, palavras: 3 });
        totalPalavras += 3;
      } else if (!upper.startsWith("[")) {
        const p = linha.split(/\s+/).length;
        items.push({ tipo: "OFF", valor: "", palavras: p });
        totalPalavras += p;
      }
    });
    const creditos = [];
    let acum = 0;
    const corMap = { SONORA: "#22c55e", PASSAGEM: "#f59e0b", ED_TEXTO: "#3b82f6", ED_IMAGEM: "#ec4899", REPÓRTER: "#06b6d4", IMAGENS: "#a855f7" };
    const iconMap = { SONORA: "🎤", PASSAGEM: "🎥", ED_TEXTO: "📝", ED_IMAGEM: "🖼️", REPÓRTER: "🎙️", IMAGENS: "📷" };
    items.forEach((it, idx) => {
      const pos = totalPalavras > 0 ? acum / totalPalavras : 0;
      if (it.tipo !== "OFF") {
        creditos.push({ id: `${it.tipo}-${idx}`, tipo: it.tipo, valor: it.valor, cor: corMap[it.tipo] || "#888", icon: iconMap[it.tipo] || "📌", timecode: Math.round(pos * dur), duracao: 5 });
      }
      acum += it.palavras;
    });
    if (editorTexto) creditos.push({ id: "ED_TEXTO", tipo: "ED_TEXTO", valor: editorTexto, cor: corMap.ED_TEXTO, icon: "📝", timecode: Math.round(0.82 * dur), duracao: 5 });
    if (editorImagem) creditos.push({ id: "ED_IMAGEM", tipo: "ED_IMAGEM", valor: editorImagem, cor: corMap.ED_IMAGEM, icon: "🖼️", timecode: Math.round(0.88 * dur), duracao: 5 });
    return creditos.sort((a, b) => a.timecode - b.timecode);
  }, [editorTexto, editorImagem, creditoReporter]);
  const abrirRevisar = async () => {
    if (!estrutura || estrutura.trim().length < 10) {
      toast.warning("Adicione a estrutura/lauda antes de revisar.");
      return;
    }
    if (!window.showDirectoryPicker) {
      toast.error("Seu navegador não suporta seleção de pasta. Use Chrome/Edge.");
      return;
    }
    try {
      const handle = await window.showDirectoryPicker({ mode: "read" });
      setRevisarDirHandle(handle);
      const dur = duracaoVt || 120;
      setRevisarDuracao(dur);
      setRevisarCreditos(parsearCreditosRevisao(estrutura, dur));
      setRevisarCurrentTime(0);
      setRevisarVideoUrl(null);
      if (titulo) {
        const normalize = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
        const normTitulo = normalize(titulo);
        for await (const [name, entry] of handle.entries()) {
          if (entry.kind === "file" && (name.endsWith(".mp4") || name.endsWith(".mov"))) {
            const normName = normalize(name.replace(/\.(mp4|mov)$/i, ""));
            if (normName === normTitulo || normName.includes(normTitulo.slice(0, 8))) {
              const fh = entry;
              const file = await fh.getFile();
              const url = URL.createObjectURL(file);
              setRevisarVideoUrl(url);
              break;
            }
          }
        }
      }
      setRevisarOpen(true);
    } catch (err) {
      if (err.name !== "AbortError") toast.error("Erro ao abrir pasta");
    }
  };
  const handleTimelineDragStart = (e, creditoId, timecodeAtual) => {
    e.preventDefault();
    draggingCreditRef.current = { id: creditoId, startX: e.clientX, startTimecode: timecodeAtual };
    const onMove = (ev) => {
      if (!draggingCreditRef.current || !revisarTimelineRef.current) return;
      const rect = revisarTimelineRef.current.getBoundingClientRect();
      const dx = ev.clientX - draggingCreditRef.current.startX;
      const dSecs = dx / rect.width * revisarDuracao;
      const novoTc = Math.max(0, Math.min(revisarDuracao - 1, Math.round(draggingCreditRef.current.startTimecode + dSecs)));
      setRevisarCreditos((prev) => prev.map((c) => c.id === draggingCreditRef.current.id ? { ...c, timecode: novoTc } : c));
    };
    const onUp = () => {
      draggingCreditRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };
  const salvarTimecodes = async () => {
    const json = JSON.stringify(revisarCreditos);
    const dur = revisarDuracao;
    setDuracaoVt(dur);
    setTimelineJson(json);
    if (selecionada) {
      await db.query(
        `UPDATE materias SET timeline_json = $1, duracao_vt = $2 WHERE id = $3`,
        [json, dur, selecionada.id]
      );
    }
    toast.success("Timecodes salvos!");
    setRevisarOpen(false);
  };
  const { extractCredits, isLoading: isLoadingAutoCredits } = useAutoCredits({
    apiKey: "gsk_RecCHZh5dHY6zNJLlTAWGyt3FYekwzlSYmsXzYIl8ZtKM0d9Zf7",
    autoPopulate: true,
    deduplicate: true
  });
  async function sugerirCreditosComIA() {
    if (!estrutura || estrutura.length < 10) {
      toast.warning("Escreva a estrutura/lauda da matéria antes de sugerir créditos.");
      return;
    }
    try {
      const sugeridos = await extractCredits(estrutura, editorTexto || void 0, creditoReporter || void 0);
      if (sugeridos.length === 0) {
        toast.info("Nenhum crédito identificado automaticamente.");
        return;
      }
      if (!creditoReporter) {
        const reporter = sugeridos.find((c) => c.line2.toLowerCase().includes("repórter") || c.line2.includes("🎥") || c.line2.includes("🎙️"));
        if (reporter) setCreditoReporter(reporter.line1);
      }
      toast.success(`${sugeridos.length} créditos sugeridos pela IA`);
    } catch (err) {
      console.error("[Redação] Erro ao sugerir créditos:", err);
      toast.error("Erro ao sugerir créditos com IA");
    }
  }
  const [historico, setHistorico] = useState([]);
  const [indexHistorico, setIndexHistorico] = useState(-1);
  const cabecaRef = useRef(null);
  const estruturaRef = useRef(null);
  const draftId = selecionada ? selecionada.id : "nova-materia-temp";
  const { isSaving, lastSaved } = useAutosave(
    draftId,
    "redacao",
    {
      titulo,
      corpo,
      estrutura,
      cabeca,
      tempoVt,
      tempoCab,
      deixa,
      editorTexto,
      editorImagem,
      creditoReporter,
      pauta_id: pautaId || null,
      status,
      duracao_vt: duracaoVt
    },
    1500
  );
  async function carregarDados() {
    try {
      setLoading(true);
      const [mRes, pRes] = await Promise.all([
        db.query(`SELECT * FROM materias ORDER BY updated_at DESC`),
        db.query(`SELECT id, titulo FROM pautas ORDER BY created_at DESC`)
      ]);
      setMaterias(mRes.rows || []);
      setPautas(pRes.rows || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar matérias e pautas");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    carregarDados();
    if (edit) {
      const materia = materias.find((m) => m.id === edit);
      if (materia) {
        setSelecionada(materia);
        setTitulo(materia.titulo || "");
        setCorpo(materia.corpo || "");
        setEstrutura(materia.estrutura || "");
        setCabeca(materia.cabeca || "");
        setTempoVt(materia.tempo_vt || "");
        setTempoCab(materia.tempo_cab || "");
        setDeixa(materia.deixa || "");
        setEditorTexto(materia.editor_texto || "");
        setEditorImagem(materia.editor_imagem || "");
        setCreditoReporter(materia.credito_reporter || "");
        setPautaId(materia.pauta_id || "");
        setStatus(materia.status);
      }
    } else {
      const draft = restoreDraft("nova-materia-temp", "redacao");
      if (draft) {
        setTitulo(draft.titulo || "");
        setCorpo(draft.corpo || "");
        setEstrutura(draft.estrutura || "");
        setCabeca(draft.cabeca || "");
        setTempoVt(draft.tempoVt || "");
        setTempoCab(draft.tempoCab || "");
        setDeixa(draft.deixa || "");
        setEditorTexto(draft.editorTexto || "");
        setEditorImagem(draft.editorImagem || "");
        setCreditoReporter(draft.creditoReporter || "");
        setPautaId(draft.pauta_id || "");
      }
    }
  }, []);
  function adicionarAoHistorico(novoTitulo, novoCorpo, novaEstrutura) {
    const novaEntrada = {
      titulo: novoTitulo,
      corpo: novoCorpo,
      estrutura: novaEstrutura
    };
    const novoHistorico = historico.slice(0, indexHistorico + 1);
    novoHistorico.push(novaEntrada);
    setHistorico(novoHistorico);
    setIndexHistorico(novoHistorico.length - 1);
  }
  function desfazer() {
    if (indexHistorico > 0) {
      const novoIndex = indexHistorico - 1;
      const entrada = historico[novoIndex];
      setTitulo(entrada.titulo);
      setCorpo(entrada.corpo);
      setEstrutura(entrada.estrutura);
      setIndexHistorico(novoIndex);
    }
  }
  function refazer() {
    if (indexHistorico < historico.length - 1) {
      const novoIndex = indexHistorico + 1;
      const entrada = historico[novoIndex];
      setTitulo(entrada.titulo);
      setCorpo(entrada.corpo);
      setEstrutura(entrada.estrutura);
      setIndexHistorico(novoIndex);
    }
  }
  async function salvarMateria(e) {
    e.preventDefault();
    if (!titulo.trim()) {
      toast.error("O título é obrigatório");
      return;
    }
    try {
      if (selecionada) {
        await db.query(
          `UPDATE materias SET
             titulo = $1, corpo = $2, estrutura = $3, cabeca = $4,
             tempo_vt = $5, tempo_cab = $6, deixa = $7,
             editor_texto = $8, editor_imagem = $9, credito_reporter = $10,
             pauta_id = $11, status = $12, duracao_vt = $13, updated_at = $14
           WHERE id = $15`,
          [
            titulo,
            corpo,
            estrutura,
            cabeca,
            tempoVt,
            tempoCab,
            deixa,
            editorTexto,
            editorImagem,
            creditoReporter,
            pautaId || null,
            status,
            duracaoVt,
            (/* @__PURE__ */ new Date()).toISOString(),
            selecionada.id
          ]
        );
        toast.success("Matéria atualizada com sucesso!");
      } else {
        const { rows } = await db.query(
          `INSERT INTO materias
             (titulo, corpo, estrutura, cabeca, tempo_vt, tempo_cab, deixa,
              editor_texto, editor_imagem, credito_reporter, pauta_id, status, autor_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING *`,
          [
            titulo,
            corpo,
            estrutura,
            cabeca,
            tempoVt,
            tempoCab,
            deixa,
            editorTexto,
            editorImagem,
            creditoReporter,
            pautaId || null,
            status,
            user?.id
          ]
        );
        toast.success("Matéria criada com sucesso!");
        if (rows && rows[0]) setSelecionada(rows[0]);
      }
      carregarDados();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar matéria");
    }
  }
  async function deletarMateria() {
    if (!selecionada) return;
    if (!window.confirm("Tem certeza que deseja deletar esta matéria?")) return;
    try {
      await db.query(`DELETE FROM materias WHERE id = $1`, [selecionada.id]);
      toast.success("Matéria deletada!");
      setSelecionada(null);
      setTitulo("");
      setCorpo("");
      setEstrutura("");
      setCabeca("");
      setTempoVt("");
      setTempoCab("");
      setDeixa("");
      setEditorTexto("");
      setEditorImagem("");
      setCreditoReporter("");
      setPautaId("");
      carregarDados();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast.error("Erro ao deletar matéria");
    }
  }
  const inserirSonora = () => {
    const mascara = "[SONORA] NOME / FUNÇÃO\n";
    const novoEstrutura = inserirNoCursor(estruturaRef.current, mascara);
    if (novoEstrutura) setEstrutura(novoEstrutura);
  };
  const inserirPassagem = () => {
    const mascara = "[PASSAGEM] REPÓRTER // LOCAL\n";
    const novoEstrutura = inserirNoCursor(estruturaRef.current, mascara);
    if (novoEstrutura) setEstrutura(novoEstrutura);
  };
  const inserirOff = () => {
    const mascara = "[OFF n]\n";
    const novoEstrutura = inserirNoCursor(estruturaRef.current, mascara);
    if (novoEstrutura) setEstrutura(novoEstrutura);
  };
  const inserirProducao = () => {
    const mascara = "[PRODUÇÃO] NOME\n";
    const novoEstrutura = inserirNoCursor(estruturaRef.current, mascara);
    if (novoEstrutura) setEstrutura(novoEstrutura);
  };
  const inserirEdTexto = () => {
    const mascara = "[ED// TEXTO] NOME\n";
    const novoEstrutura = inserirNoCursor(estruturaRef.current, mascara);
    if (novoEstrutura) setEstrutura(novoEstrutura);
  };
  const inserirEdImagens = () => {
    const mascara = "[ED// IMAGENS] NOME\n";
    const novoEstrutura = inserirNoCursor(estruturaRef.current, mascara);
    if (novoEstrutura) setEstrutura(novoEstrutura);
  };
  const inserirImagens = () => {
    const mascara = "[IMAGENS] NOME\n";
    const novoEstrutura = inserirNoCursor(estruturaRef.current, mascara);
    if (novoEstrutura) setEstrutura(novoEstrutura);
  };
  const inserirSonoraCapeca = () => {
    const mascara = "[SONORA] NOME / FUNÇÃO\n";
    const novaCabeca = inserirNoCursor(cabecaRef.current, mascara);
    if (novaCabeca) setCabeca(novaCabeca);
  };
  const inserirPassagemCabeca = () => {
    const mascara = "[PASSAGEM] REPÓRTER // LOCAL\n";
    const novaCabeca = inserirNoCursor(cabecaRef.current, mascara);
    if (novaCabeca) setCabeca(novaCabeca);
  };
  const inserirOffCabeca = () => {
    const mascara = "[OFF n]\n";
    const novaCabeca = inserirNoCursor(cabecaRef.current, mascara);
    if (novaCabeca) setCabeca(novaCabeca);
  };
  const inserirProducaoCabeca = () => {
    const mascara = "[PRODUÇÃO] NOME\n";
    const novaCabeca = inserirNoCursor(cabecaRef.current, mascara);
    if (novaCabeca) setCabeca(novaCabeca);
  };
  const inserirEdTextoCabeca = () => {
    const mascara = "[ED// TEXTO] NOME\n";
    const novaCabeca = inserirNoCursor(cabecaRef.current, mascara);
    if (novaCabeca) setCabeca(novaCabeca);
  };
  const inserirEdImagensCabeca = () => {
    const mascara = "[ED// IMAGENS] NOME\n";
    const novaCabeca = inserirNoCursor(cabecaRef.current, mascara);
    if (novaCabeca) setCabeca(novaCabeca);
  };
  const inserirImagensCabeca = () => {
    const mascara = "[IMAGENS] NOME\n";
    const novaCabeca = inserirNoCursor(cabecaRef.current, mascara);
    if (novaCabeca) setCabeca(novaCabeca);
  };
  const [gerandoSugestao, setGerandoSugestao] = useState(false);
  async function gerarSugestaoWeb() {
    if (!estrutura.trim()) {
      toast.error("O campo ROTEIRO TÉCNICO // DECUPAGEM (VT) está vazio.");
      return;
    }
    setGerandoSugestao(true);
    try {
      const prompt = `Você é um redator jornalístico sênior especializado em jornalismo digital para portal de notícias.
Sua missão: transformar roteiros técnicos de TV em artigos web profissionais, otimizados e prontos para publicação.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 COMO LER O ROTEIRO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- [OFF n] = narração principal do repórter/apresentador
- [SONORA] NOME / FUNÇÃO = declaração de entrevistado (use como citação)
- [PASSAGEM] REPÓRTER // LOCAL = contexto do repórter em campo
- IGNORE: [PRODUÇÃO], [ED//], [IMAGENS], ///, //, parênteses ()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ESTRUTURA OBRIGATÓRIA (siga esta ordem exata):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ TÍTULO (Headline)
   → Máximo 80 caracteres
   → Direto, chamativo, contém palavra-chave
   → Sem ponto final
   → Prefixo: "TÍTULO: "

2️⃣ SUBTÍTULO (Linha Fina)
   → Uma única frase (máx. 150 caracteres)
   → Resume a situação + traz dado relevante
   → Complementa o título sem repetir
   → Prefixo: "SUBTÍTULO: "

3️⃣ LIDE (1º parágrafo - CRÍTICO)
   → MÁXIMO 3 linhas
   → Começa com a informação mais importante
   → Responde: Quem? O quê? Onde? Quando? Por quê?
   → Direto e impactante

4️⃣ CORPO DO TEXTO
   → Parágrafos: máximo 4 linhas cada
   → PIRÂMIDE INVERTIDA: informação mais importante primeiro
   → Organize por temas com subtítulos: << Tema >>
   → Integre sonoras como citações naturais
   → Use bullet points (•) APENAS quando listar 3+ itens

5️⃣ FECHAMENTO
   → Parágrafo final com próximas ações ou reflexão
   → 2-3 linhas máximo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 RETORNE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APENAS o texto estruturado, pronto para publicação.
Sem explicações, sem markdown, sem advertências.
Texto claro, profissional, otimizado para web.

ROTEIRO TÉCNICO:
${estrutura}`;
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2e3,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      if (!response.ok) {
        const errorMsg = data.error?.message || "Erro desconhecido na API";
        console.error("API error details:", data);
        throw new Error(errorMsg);
      }
      const textoGerado = data.content?.[0]?.text || "";
      if (textoGerado.trim()) {
        setCorpo(textoGerado.trim());
        toast.success("Sugestão gerada! Revise e edite o texto conforme necessário.");
      } else {
        toast.error("Não foi possível gerar a sugestão. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao gerar sugestão:", error);
      const errorMsg = error instanceof Error ? error.message : "Erro ao gerar sugestão";
      toast.error(errorMsg);
    } finally {
      setGerandoSugestao(false);
    }
  }
  const aplicarFormatacaoCabeca = () => {
    setCabeca(formatarTextoRedacao(cabeca));
  };
  const aplicarFormatacaoEstrutura = () => {
    setEstrutura(formatarTextoRedacao(estrutura));
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex h-screen bg-[#09090b]", children: [
    /* @__PURE__ */ jsx("style", { children: `
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #141416;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: #2a2a2e;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #3a3a3e;
        }
      ` }),
    /* @__PURE__ */ jsxs("aside", { className: "w-80 bg-[#141416] border-r border-[#22c55e]/20 overflow-y-auto flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "sticky top-0 bg-[#09090b] border-b border-[#22c55e]/20 p-4 space-y-3 z-10", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono uppercase tracking-[0.2em] text-[#22c55e] mb-1", children: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).toUpperCase() }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-10 w-10 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/40", children: /* @__PURE__ */ jsx(PenTool, { className: "h-5 w-5 text-[#22c55e]" }) }),
            /* @__PURE__ */ jsx("h1", { className: "text-3xl font-black tracking-tight font-mono uppercase text-white", children: "REDAÇÃO" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-[#6b7280]" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: busca,
              onChange: (e) => setBusca(e.target.value),
              placeholder: "BUSCAR MATÉRIA...",
              className: "w-full pl-9 pr-3 py-2 bg-[#141416] border border-[#22c55e]/20 rounded-xl text-white placeholder-[#4b5563] text-body-sm focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setSelecionada(null);
              setTitulo("");
              setCorpo("");
              setEstrutura("");
              setCabeca("");
              setTempoVt("");
              setTempoCab("");
              setDeixa("");
              setEditorTexto("");
              setEditorImagem("");
              setCreditoReporter("");
              setPautaId("");
              setTimelineJson(null);
              setDuracaoVt(null);
            },
            className: "w-full py-2 px-3 rounded-xl bg-[#22c55e] hover:bg-[#22c55e]/90 text-black font-bold text-body-sm transition-all active:scale-[0.98]",
            children: "+ NOVA MATÉRIA"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto px-3 py-4 space-y-2", children: materias.filter((m) => m.titulo?.toLowerCase().includes(busca.toLowerCase())).map((materia) => /* @__PURE__ */ jsxs(
        "div",
        {
          onClick: () => {
            setSelecionada(materia);
            setTitulo(materia.titulo || "");
            setCorpo(materia.corpo || "");
            setEstrutura(materia.estrutura || "");
            setCabeca(materia.cabeca || "");
            setTempoVt(materia.tempo_vt || "");
            setTempoCab(materia.tempo_cab || "");
            setDeixa(materia.deixa || "");
            setEditorTexto(materia.editor_texto || "");
            setEditorImagem(materia.editor_imagem || "");
            setCreditoReporter(materia.credito_reporter || "");
            setPautaId(materia.pauta_id || "");
            setStatus(materia.status);
            setDuracaoVt(materia.duracao_vt ?? null);
            setTimelineJson(materia.timeline_json ?? null);
          },
          className: `p-3 rounded-lg cursor-pointer border transition-all border-l-[3px] ${selecionada?.id === materia.id ? "bg-[#22c55e]/10 border-[#22c55e]/50 border-l-[#22c55e]" : "bg-[#141416] border-[#22c55e]/20 border-l-[#22c55e]/30 hover:border-[#22c55e]/40"}`,
          children: [
            /* @__PURE__ */ jsx("h3", { className: "font-bold text-white text-body-sm truncate", children: materia.titulo }),
            /* @__PURE__ */ jsx("p", { className: "text-[#6b7280] text-[11px] mt-1", children: materia.status.toUpperCase() }),
            /* @__PURE__ */ jsx("p", { className: "text-[#4b5563] text-[10px] mt-0.5", children: new Date(materia.updated_at).toLocaleDateString("pt-BR") })
          ]
        },
        materia.id
      )) })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: salvarMateria, className: "flex-1 flex flex-col overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "sticky top-0 z-20 bg-[#141416] border-b border-[#22c55e]/20 p-4 shadow-lg", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 max-w-5xl mx-auto", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx("p", { className: "text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1", children: selecionada ? "Editando" : "Nova Matéria" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(AutosaveIndicator, { isSaving, lastSaved }),
          /* @__PURE__ */ jsxs("select", { value: status, onChange: (e) => setStatus(e.target.value), className: "px-3 py-1.5 rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 text-body-sm font-bold", children: [
            /* @__PURE__ */ jsx("option", { value: "rascunho", children: "RASCUNHO" }),
            /* @__PURE__ */ jsx("option", { value: "revisao", children: "REVISÃO" }),
            /* @__PURE__ */ jsx("option", { value: "publicado", children: "PUBLICADO" })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "px-4 py-1.5 rounded-xl bg-[#22c55e] hover:bg-[#22c55e]/90 text-black font-bold text-body-sm shadow-lg transition-all active:scale-[0.98]", children: selecionada ? "ATUALIZAR" : "SALVAR" }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: abrirRevisar,
              className: "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold text-body-sm transition-all active:scale-[0.98] border",
              style: { backgroundColor: "#7c3aed20", borderColor: "#7c3aed50", color: "#c084fc" },
              children: [
                /* @__PURE__ */ jsx(Film, { className: "h-3.5 w-3.5" }),
                " REVISAR"
              ]
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl w-full mx-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4 bg-[#141416] p-4 rounded-lg border border-[#22c55e]/20 border-l-[3px] border-l-[#22c55e] shadow-lg", children: [
          /* @__PURE__ */ jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1.5", children: "VINCULAR A UMA PAUTA" }),
            /* @__PURE__ */ jsxs("select", { value: pautaId, onChange: (e) => setPautaId(e.target.value), className: "w-full px-3 py-2 text-body-sm rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all", children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "MATÉRIA AVULSA (SEM PAUTA)" }),
              pautas.map((p) => /* @__PURE__ */ jsx("option", { value: p.id, children: p.titulo }, p.id))
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1.5", children: "CRÉDITO DO REPÓRTER" }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx("input", { type: "text", value: creditoReporter, onChange: (e) => setCreditoReporter(e.target.value), placeholder: "EX: JOÃO SILVA", className: "w-full px-3 py-2 text-body-sm rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white placeholder-[#4b5563] focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: sugerirCreditosComIA, disabled: isLoadingAutoCredits, title: "Sugerir créditos com IA", className: "shrink-0 px-3 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e]/20 disabled:opacity-50 transition-all flex items-center justify-center", children: /* @__PURE__ */ jsx(Sparkles, { className: `w-4 h-4 ${isLoadingAutoCredits ? "animate-pulse" : ""}` }) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: titulo,
            onChange: (e) => setTitulo(e.target.value),
            onBlur: () => adicionarAoHistorico(titulo, corpo, estrutura),
            placeholder: "TÍTULO PRINCIPAL DA MATÉRIA...",
            className: "w-full bg-transparent border-none text-white placeholder-[#4b5563] font-bold tracking-tight text-h1 focus:outline-none p-0 resize-none",
            style: { lineHeight: "1.2" }
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-4 bg-[#141416] p-4 rounded-lg border border-[#22c55e]/20 border-l-[3px] border-l-[#22c55e] shadow-lg", children: [
          /* @__PURE__ */ jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1.5", children: "DEIXA (ÚLTIMAS PALAVRAS DO VT)" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: deixa, onChange: (e) => setDeixa(e.target.value), placeholder: "///NA REPORTAGEM DE HOJE//", className: "w-full px-3 py-2 text-body-sm rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1.5", children: "TEMPO CABEÇA" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: tempoCab, onChange: (e) => setTempoCab(e.target.value), placeholder: "0:15", className: "w-full px-3 py-2 text-body-sm rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white font-mono text-center focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1.5", children: "TEMPO VT" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: tempoVt, onChange: (e) => setTempoVt(e.target.value), placeholder: "1:30", className: "w-full px-3 py-2 text-body-sm rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white font-mono text-center focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1.5", children: "EDITOR DE TEXTO" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: editorTexto, onChange: (e) => setEditorTexto(e.target.value), placeholder: "NOME DO EDITOR", className: "w-full px-3 py-2 text-body-sm rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1.5", children: "EDITOR DE IMAGEM" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: editorImagem, onChange: (e) => setEditorImagem(e.target.value), placeholder: "NOME DO EDITOR", className: "w-full px-3 py-2 text-body-sm rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center gap-2 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider bg-[#141416] border border-[#22c55e]/20 px-3 py-1 rounded shadow-lg border-l-[3px] border-l-[#22c55e]", children: [
              /* @__PURE__ */ jsx(MonitorPlay, { className: "h-3.5 w-3.5 text-[#22c55e]" }),
              " TEXTO DA CABEÇA (APRESENTADOR)"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-1 opacity-0 hover:opacity-100 transition-opacity", children: [
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirSonoraCapeca, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+SONORA" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirPassagemCabeca, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+PASSAGEM" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirOffCabeca, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+OFF" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirProducaoCabeca, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+PRODUÇÃO" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirEdTextoCabeca, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+ED// TEXTO" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirEdImagensCabeca, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+ED// IMAGENS" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirImagensCabeca, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+IMAGENS" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              ref: cabecaRef,
              value: cabeca,
              onChange: (e) => setCabeca(e.target.value),
              onBlur: aplicarFormatacaoCabeca,
              placeholder: "TEXTO QUE O APRESENTADOR VAI LER NA ABERTURA DA MATÉRIA///",
              rows: 3,
              className: "w-full px-4 py-3.5 rounded-md bg-[#141416] border border-[#22c55e]/20 text-white placeholder-[#4b5563] focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all duration-300 resize-none text-body"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center gap-2 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider bg-[#141416] border border-[#22c55e]/20 px-3 py-1 rounded shadow-lg border-l-[3px] border-l-[#22c55e]", children: [
              /* @__PURE__ */ jsx(PenTool, { className: "h-3.5 w-3.5 text-[#22c55e]" }),
              " ROTEIRO TÉCNICO // DECUPAGEM (VT)"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-1 opacity-0 hover:opacity-100 transition-opacity", children: [
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirSonora, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+SONORA" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirPassagem, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+PASSAGEM" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirOff, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+OFF" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirProducao, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+PRODUÇÃO" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirEdTexto, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+ED// TEXTO" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirEdImagens, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+ED// IMAGENS" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirImagens, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+IMAGENS" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative rounded-lg overflow-hidden border border-[#22c55e]/20 bg-[#141416] border-l-[3px] border-l-[#22c55e]", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 px-3 py-1.5 border-b border-[#22c55e]/10 bg-[#09090b]", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: desfazer,
                  disabled: indexHistorico <= 0,
                  title: "Desfazer (Ctrl+Z)",
                  className: "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold text-[#6b7280] hover:text-[#22c55e] hover:bg-[#22c55e]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all",
                  children: [
                    /* @__PURE__ */ jsx(Undo2, { className: "h-3 w-3" }),
                    " DESFAZER"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: refazer,
                  disabled: indexHistorico >= historico.length - 1,
                  title: "Refazer (Ctrl+Shift+Z)",
                  className: "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold text-[#6b7280] hover:text-[#22c55e] hover:bg-[#22c55e]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all",
                  children: [
                    /* @__PURE__ */ jsx(Redo2, { className: "h-3 w-3" }),
                    " REFAZER"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex", children: [
              /* @__PURE__ */ jsx("div", { className: "bg-[#09090b] text-[#6b7280] text-[10px] font-mono p-3 select-none border-r border-[#22c55e]/20 text-right min-w-[3rem] overflow-hidden", children: estrutura.split("\n").map((_, idx) => /* @__PURE__ */ jsx("div", { className: "h-5 leading-5", children: idx + 1 }, idx)) }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  ref: estruturaRef,
                  value: estrutura,
                  onChange: (e) => setEstrutura(e.target.value),
                  onBlur: aplicarFormatacaoEstrutura,
                  onKeyDown: (e) => {
                    if (e.ctrlKey && !e.shiftKey && e.key === "z") {
                      e.preventDefault();
                      desfazer();
                    }
                    if (e.ctrlKey && e.shiftKey && e.key === "Z") {
                      e.preventDefault();
                      refazer();
                    }
                  },
                  rows: 10,
                  placeholder: "[OFF 1]\n///ABERTURA DO APRESENTADOR COM A NOTÍCIA PRINCIPAL///\n\n[SONORA] JOÃO SILVA / ESPECIALISTA\n///OPINIÃO DO ESPECIALISTA SOBRE O TEMA///\n\n[OFF 2]\n///CONTINUAÇÃO DA NARRAÇÃO COM MAIS DETALHES///\n\n[PASSAGEM] MARIA SANTOS // SÃO PAULO\n///POSICIONAMENTO DO REPÓRTER EM CAMPO///\n\n[OFF 3] FINAL\n///ENCERRAMENTO E DESPEDIDA///",
                  className: "flex-1 px-4 py-3.5 bg-[#141416] text-white placeholder-[#4b5563] focus:outline-none focus:ring-4 focus:ring-[#22c55e]/30 transition-all duration-300 resize-none whitespace-pre-wrap break-words text-body-sm leading-relaxed font-mono text-justify overflow-y-auto",
                  style: { fontFamily: "'Segoe UI', 'Roboto Mono', 'Courier New', monospace", letterSpacing: "0.5px" }
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center gap-2 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider bg-[#141416] border border-[#22c55e]/20 px-3 py-1 rounded shadow-lg border-l-[3px] border-l-[#22c55e]", children: [
              /* @__PURE__ */ jsx(FileText, { className: "h-3.5 w-3.5 text-[#22c55e]" }),
              " MATÉRIA ESCRITA // TEXTO WEB CORRIDO"
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: gerarSugestaoWeb,
                disabled: gerandoSugestao,
                className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e]/20 hover:border-[#22c55e]/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]",
                children: gerandoSugestao ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsxs("svg", { className: "animate-spin h-3 w-3", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [
                    /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                    /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8v8z" })
                  ] }),
                  "GERANDO..."
                ] }) : /* @__PURE__ */ jsx(Fragment, { children: "✦ SUGESTÃO" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: corpo,
              onChange: (e) => setCorpo(e.target.value),
              onBlur: () => adicionarAoHistorico(titulo, corpo, estrutura),
              placeholder: "TEXTO CORRIDO // MATÉRIA WEB///",
              rows: 10,
              className: "w-full px-4 py-3.5 rounded-md bg-[#141416] border border-[#22c55e]/20 text-white placeholder-[#4b5563] focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all duration-300 resize-none text-body"
            }
          )
        ] }),
        estrutura && estrutura.trim().length > 10 && /* @__PURE__ */ jsxs("div", { className: "space-y-3 border-t border-[#22c55e]/10 pt-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("label", { className: "inline-flex items-center gap-2 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider bg-[#141416] border border-[#22c55e]/20 px-3 py-1 rounded shadow-lg border-l-[3px] border-l-[#22c55e]", children: "📹 TIMELINE DE CRÉDITOS // SINCRONIZAÇÃO VT" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[11px] font-bold text-[#6b7280] uppercase tracking-wider", children: "DURAÇÃO DO VT (s):" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: 0,
                  max: 3600,
                  value: duracaoVt ?? "",
                  onChange: (e) => setDuracaoVt(e.target.value ? Number(e.target.value) : null),
                  placeholder: "ex: 120",
                  className: "w-20 px-2 py-1 text-body-sm rounded-lg bg-[#09090b] border border-[#22c55e]/20 text-white font-mono text-center focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all"
                }
              )
            ] })
          ] }),
          (() => {
            const duracao = duracaoVt || 120;
            const corMap = { SONORA: "#22c55e", PASSAGEM: "#f59e0b", IMAGENS: "#a855f7", ED_TEXTO: "#3b82f6", ED_IMAGEM: "#ec4899", REPÓRTER: "#06b6d4" };
            const iconMap = { SONORA: "🎤", PASSAGEM: "🎥", IMAGENS: "📷", ED_TEXTO: "📝", ED_IMAGEM: "🖼️", REPÓRTER: "🎙️" };
            let creditos = [];
            if (timelineJson) {
              try {
                const saved = JSON.parse(timelineJson);
                creditos = saved.map((c) => ({
                  tipo: c.tipo,
                  valor: c.valor,
                  cor: corMap[c.tipo] || "#888",
                  icon: iconMap[c.tipo] || "📌",
                  posicao: duracao > 0 ? c.timecode / duracao : 0
                }));
              } catch {
              }
            }
            if (creditos.length === 0) {
              const linhas = estrutura.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
              let totalPalavras = 0;
              const wordsPerItem = [];
              linhas.forEach((linha) => {
                const upper = linha.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                if (upper.startsWith("[SONORA]")) {
                  const partes = linha.replace(/\[SONORA\]/i, "").trim();
                  const palavras = partes.split(/\s+/).length || 3;
                  totalPalavras += palavras;
                  wordsPerItem.push({ tipo: "SONORA", valor: partes || "SONORA", palavras });
                } else if (upper.startsWith("[PASSAGEM]")) {
                  const partes = linha.replace(/\[PASSAGEM\]/i, "").trim();
                  totalPalavras += 4;
                  wordsPerItem.push({ tipo: "PASSAGEM", valor: partes || "PASSAGEM", palavras: 4 });
                } else if (upper.startsWith("[IMAGENS]")) {
                  const partes = linha.replace(/\[IMAGENS\]/i, "").trim();
                  totalPalavras += 3;
                  wordsPerItem.push({ tipo: "IMAGENS", valor: partes || "CINEGRAFISTA", palavras: 3 });
                } else if (!upper.startsWith("[")) {
                  const palavras = linha.split(/\s+/).length;
                  totalPalavras += palavras;
                  wordsPerItem.push({ tipo: "OFF", valor: "", palavras });
                }
              });
              let acumulado = 0;
              wordsPerItem.forEach((item) => {
                const pos = totalPalavras > 0 ? acumulado / totalPalavras : 0;
                if (item.tipo !== "OFF") {
                  creditos.push({ tipo: item.tipo, valor: item.valor, cor: corMap[item.tipo] || "#888", icon: iconMap[item.tipo] || "📌", posicao: pos });
                }
                acumulado += item.palavras;
              });
              if (editorTexto) creditos.push({ tipo: "ED_TEXTO", valor: editorTexto, cor: "#3b82f6", icon: "📝", posicao: 0.82 });
              if (editorImagem) creditos.push({ tipo: "ED_IMAGEM", valor: editorImagem, cor: "#ec4899", icon: "🖼️", posicao: 0.88 });
            }
            if (creditos.length === 0) return /* @__PURE__ */ jsx("div", { className: "text-[#4b5563] text-[11px] italic text-center py-4", children: "Adicione [SONORA] ou [PASSAGEM] na estrutura para ver a timeline de créditos." });
            return /* @__PURE__ */ jsxs("div", { className: "bg-[#141416] border border-[#22c55e]/20 rounded-xl p-4 space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative h-8 bg-[#09090b] rounded-lg overflow-visible border border-[#22c55e]/10", children: [
                [0.25, 0.5, 0.75].map((pos) => /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "absolute top-0 bottom-0 w-px bg-[#22c55e]/10",
                    style: { left: `${pos * 100}%` },
                    children: /* @__PURE__ */ jsxs("span", { className: "absolute top-1 text-[8px] font-mono text-[#4b5563] -translate-x-1/2 whitespace-nowrap", children: [
                      Math.round(pos * duracao),
                      "s"
                    ] })
                  },
                  pos
                )),
                creditos.map((cred, idx) => /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center",
                    style: { left: `${Math.min(95, Math.max(2, cred.posicao * 100))}%` },
                    title: `${cred.tipo}: ${cred.valor} (~${Math.round(cred.posicao * duracao)}s)`,
                    children: /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "w-2 h-5 rounded-sm cursor-pointer transition-all hover:scale-110",
                        style: { backgroundColor: cred.cor, boxShadow: `0 0 6px ${cred.cor}60` }
                      }
                    )
                  },
                  idx
                ))
              ] }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: creditos.map((cred, idx) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "flex items-center gap-2 px-2 py-1.5 rounded-lg border",
                  style: { backgroundColor: `${cred.cor}10`, borderColor: `${cred.cor}30` },
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "text-base shrink-0", children: cred.icon }),
                    /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                      /* @__PURE__ */ jsx("div", { className: "text-[8px] font-black uppercase tracking-widest", style: { color: cred.cor }, children: cred.tipo.replace("_", " ") }),
                      /* @__PURE__ */ jsx("div", { className: "text-[10px] font-bold text-white truncate", children: cred.valor })
                    ] }),
                    /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-mono shrink-0", style: { color: cred.cor }, children: [
                      "~",
                      Math.round(cred.posicao * duracao),
                      "s"
                    ] })
                  ]
                },
                idx
              )) }),
              /* @__PURE__ */ jsxs("p", { className: "text-[9px] text-[#4b5563] text-center", children: [
                "Timecodes estimados por posição na lauda. Duração do VT: ",
                /* @__PURE__ */ jsxs("strong", { className: "text-[#22c55e]", children: [
                  duracao,
                  "s"
                ] }),
                ".",
                !duracaoVt && " Defina a duração acima para maior precisão."
              ] })
            ] });
          })()
        ] }),
        selecionada && /* @__PURE__ */ jsx("div", { className: "border-t border-red-500/10 pt-6 pb-4 flex justify-end", children: /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: deletarMateria,
            className: "flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 font-bold text-body-sm transition-all active:scale-[0.98]",
            children: [
              /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
              "DELETAR MATÉRIA"
            ]
          }
        ) })
      ] })
    ] }),
    revisarOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center", style: { backgroundColor: "rgba(0,0,0,0.85)" }, children: /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex flex-col rounded-2xl border shadow-2xl overflow-hidden",
        style: { backgroundColor: "#0d0d0d", borderColor: "#7c3aed50", width: "860px", maxWidth: "95vw", maxHeight: "90vh" },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-5 py-3 border-b shrink-0", style: { borderColor: "#7c3aed30", backgroundColor: "#141416" }, children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Film, { className: "h-4 w-4", style: { color: "#c084fc" } }),
              /* @__PURE__ */ jsx("span", { className: "font-black uppercase tracking-widest text-sm", style: { color: "#c084fc" }, children: "REVISAR VT" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-zinc-600 font-mono truncate max-w-xs", children: titulo })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: async () => {
                    if (!revisarDirHandle) return;
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "video/mp4,video/quicktime";
                    input.onchange = () => {
                      const file = input.files?.[0];
                      if (!file) return;
                      setRevisarVideoUrl(URL.createObjectURL(file));
                    };
                    input.click();
                  },
                  className: "flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all",
                  style: { backgroundColor: "#1a1a1a", borderColor: "#3a3a3a", color: "#9ca3af" },
                  children: [
                    /* @__PURE__ */ jsx(FolderOpen, { className: "h-3 w-3" }),
                    " Trocar VT"
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: salvarTimecodes,
                  className: "flex items-center gap-1 px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all active:scale-[0.97]",
                  style: { backgroundColor: "#7c3aed20", borderColor: "#7c3aed50", color: "#c084fc" },
                  children: "✓ SALVAR TIMECODES"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setRevisarOpen(false),
                  className: "p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all",
                  children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col overflow-hidden flex-1 min-h-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative bg-black shrink-0", style: { aspectRatio: "16/9", maxHeight: "320px" }, children: [
              revisarVideoUrl ? /* @__PURE__ */ jsx(
                "video",
                {
                  ref: revisarVideoRef,
                  src: revisarVideoUrl,
                  className: "w-full h-full object-contain",
                  controls: true,
                  onTimeUpdate: (e) => {
                    const t = e.currentTarget.currentTime;
                    setRevisarCurrentTime(t);
                    if (e.currentTarget.duration && !isNaN(e.currentTarget.duration)) {
                      setRevisarDuracao(Math.round(e.currentTarget.duration));
                    }
                  },
                  onLoadedMetadata: (e) => {
                    const dur = Math.round(e.currentTarget.duration);
                    setRevisarDuracao(dur);
                    setRevisarCreditos(parsearCreditosRevisao(estrutura, dur));
                  }
                }
              ) : /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-700", children: [
                /* @__PURE__ */ jsx(Film, { className: "h-10 w-10" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest", children: "Nenhum VT encontrado na pasta" }),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "video/mp4,video/quicktime";
                      input.onchange = () => {
                        const file = input.files?.[0];
                        if (!file) return;
                        setRevisarVideoUrl(URL.createObjectURL(file));
                      };
                      input.click();
                    },
                    className: "flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all",
                    style: { backgroundColor: "#1a1a1a", borderColor: "#3a3a3a", color: "#9ca3af" },
                    children: [
                      /* @__PURE__ */ jsx(FolderOpen, { className: "h-4 w-4" }),
                      " Selecionar VT manualmente"
                    ]
                  }
                )
              ] }),
              (() => {
                const ativo = revisarCreditos.find((c) => revisarCurrentTime >= c.timecode && revisarCurrentTime < c.timecode + c.duracao);
                if (!ativo) return null;
                return /* @__PURE__ */ jsx("div", { className: "absolute bottom-3 left-3 right-3 pointer-events-none", children: /* @__PURE__ */ jsxs("div", { className: "flex items-stretch overflow-hidden rounded-sm shadow-xl max-w-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-1 shrink-0", style: { backgroundColor: ativo.cor } }),
                  /* @__PURE__ */ jsxs("div", { className: "px-3 py-1.5 flex-1", style: { backgroundColor: "rgba(0,0,0,0.92)" }, children: [
                    /* @__PURE__ */ jsx("div", { className: "text-white font-bold text-xs uppercase tracking-wide", children: ativo.valor }),
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-widest", style: { color: ativo.cor }, children: ativo.tipo.replace("_", " ") })
                  ] })
                ] }) });
              })()
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto px-5 py-4 space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-zinc-500", children: "Timeline de Créditos" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-mono text-zinc-600", children: [
                    String(Math.floor(revisarCurrentTime / 60)).padStart(2, "0"),
                    ":",
                    String(Math.round(revisarCurrentTime % 60)).padStart(2, "0"),
                    " / ",
                    String(Math.floor(revisarDuracao / 60)).padStart(2, "0"),
                    ":",
                    String(revisarDuracao % 60).padStart(2, "0")
                  ] })
                ] }),
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    ref: revisarTimelineRef,
                    className: "relative rounded-xl overflow-visible",
                    style: { height: "56px", backgroundColor: "#0a0a0a", border: "1px solid #2a2a2a" },
                    onClick: (e) => {
                      if (!revisarVideoRef.current || draggingCreditRef.current) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pct = (e.clientX - rect.left) / rect.width;
                      const t = Math.max(0, Math.min(revisarDuracao, pct * revisarDuracao));
                      revisarVideoRef.current.currentTime = t;
                      setRevisarCurrentTime(t);
                    },
                    children: [
                      /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: "absolute inset-y-0 left-0 rounded-l-xl",
                          style: { width: `${revisarCurrentTime / revisarDuracao * 100}%`, backgroundColor: "#ffffff08" }
                        }
                      ),
                      [0.25, 0.5, 0.75].map((p) => /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 w-px", style: { left: `${p * 100}%`, backgroundColor: "#2a2a2a" }, children: /* @__PURE__ */ jsxs("span", { className: "absolute bottom-1 text-[8px] font-mono text-zinc-700 -translate-x-1/2", children: [
                        Math.round(p * revisarDuracao),
                        "s"
                      ] }) }, p)),
                      /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: "absolute inset-y-0 w-0.5 pointer-events-none",
                          style: { left: `${revisarCurrentTime / revisarDuracao * 100}%`, backgroundColor: "#ef4444", boxShadow: "0 0 6px rgba(239,68,68,0.8)", zIndex: 20 }
                        }
                      ),
                      revisarCreditos.map((cred) => {
                        const pct = Math.min(98, Math.max(1, cred.timecode / revisarDuracao * 100));
                        const ativo = revisarCurrentTime >= cred.timecode && revisarCurrentTime < cred.timecode + cred.duracao;
                        return /* @__PURE__ */ jsxs(
                          "div",
                          {
                            className: "absolute top-0 bottom-0 flex flex-col items-center justify-center cursor-ew-resize select-none group",
                            style: { left: `${pct}%`, transform: "translateX(-50%)", zIndex: 10 },
                            onMouseDown: (e) => handleTimelineDragStart(e, cred.id, cred.timecode),
                            title: `${cred.icon} ${cred.valor} — ${cred.timecode}s  |  Arraste para ajustar`,
                            children: [
                              /* @__PURE__ */ jsx(
                                "div",
                                {
                                  className: "absolute inset-y-0 w-0.5 transition-all",
                                  style: { backgroundColor: cred.cor, opacity: ativo ? 1 : 0.7, boxShadow: ativo ? `0 0 8px ${cred.cor}` : "none" }
                                }
                              ),
                              /* @__PURE__ */ jsxs(
                                "div",
                                {
                                  className: "relative px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest whitespace-nowrap shadow-lg border transition-all group-hover:scale-110",
                                  style: {
                                    backgroundColor: `${cred.cor}22`,
                                    borderColor: cred.cor,
                                    color: cred.cor,
                                    fontSize: "7px",
                                    marginTop: "-4px"
                                  },
                                  children: [
                                    /* @__PURE__ */ jsx(GripHorizontal, { className: "inline h-2 w-2 mr-0.5 opacity-60" }),
                                    cred.icon,
                                    " ",
                                    cred.timecode,
                                    "s"
                                  ]
                                }
                              )
                            ]
                          },
                          cred.id
                        );
                      })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-zinc-500", children: "Ajuste Fino dos Timecodes" }),
                /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: revisarCreditos.map((cred) => /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
                    style: { backgroundColor: `${cred.cor}0d`, borderColor: `${cred.cor}30` },
                    children: [
                      /* @__PURE__ */ jsx("span", { className: "text-base shrink-0", children: cred.icon }),
                      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                        /* @__PURE__ */ jsx("div", { className: "text-[8px] font-black uppercase tracking-widest truncate", style: { color: cred.cor }, children: cred.tipo.replace("_", " ") }),
                        /* @__PURE__ */ jsx("div", { className: "text-[10px] font-bold text-white truncate", children: cred.valor })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            type: "number",
                            min: 0,
                            max: revisarDuracao,
                            value: cred.timecode,
                            onChange: (e) => {
                              const v = Math.max(0, Math.min(revisarDuracao, Number(e.target.value)));
                              setRevisarCreditos((prev) => prev.map((c) => c.id === cred.id ? { ...c, timecode: v } : c));
                            },
                            onClick: () => {
                              if (revisarVideoRef.current) {
                                revisarVideoRef.current.currentTime = cred.timecode;
                                setRevisarCurrentTime(cred.timecode);
                              }
                            },
                            className: "w-14 px-2 py-1 rounded-lg border text-[10px] font-mono text-center focus:outline-none transition-all",
                            style: { backgroundColor: "#0a0a0a", borderColor: `${cred.cor}40`, color: cred.cor }
                          }
                        ),
                        /* @__PURE__ */ jsx("span", { className: "text-[9px] text-zinc-600", children: "s" })
                      ] })
                    ]
                  },
                  cred.id
                )) })
              ] })
            ] })
          ] })
        ]
      }
    ) })
  ] });
}
function SliderRow({ label, min, max, value, onChange, unit = "", accentColor = "#ec4899" }) {
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
    /* @__PURE__ */ jsx("label", { style: { fontSize: 9, color: "#71717a", width: 72, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.1em" }, children: label }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "range",
        min,
        max,
        value,
        onChange: (e) => onChange(Number(e.target.value)),
        style: { flex: 1, height: 4, accentColor, cursor: "pointer" }
      }
    ),
    /* @__PURE__ */ jsxs("span", { style: { fontSize: 9, fontFamily: "monospace", color: "#a1a1aa", width: 36, textAlign: "right" }, children: [
      value,
      unit
    ] })
  ] });
}
function SectionLabel({ children }) {
  return /* @__PURE__ */ jsx("span", { style: {
    fontSize: 9,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#52525b"
  }, children });
}
function ConfigTarjaModal({
  open,
  onClose,
  // Tarja PNG
  tarjaCustomPng,
  setTarjaCustomPng,
  // Scale
  tarjaScaleX,
  setTarjaScaleX,
  tarjaScaleY,
  setTarjaScaleY,
  tarjaScaleLock,
  setTarjaScaleLock,
  // Position
  tarjaX,
  setTarjaX,
  tarjaY,
  setTarjaY,
  // Font Line 1
  font1Size,
  setFont1Size,
  font1X,
  setFont1X,
  font1Y,
  setFont1Y,
  // Font Line 2
  font2Size,
  setFont2Size,
  font2X,
  setFont2X,
  font2Y,
  setFont2Y,
  // Preview text
  gcLine1,
  gcLine2
}) {
  const fileInputRef = useRef(null);
  const presetImportRef = useRef(null);
  const [presetMenuOpen, setPresetMenuOpen] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [savedPresets, setSavedPresets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("gc_tarja_presets") || "{}");
    } catch {
      return {};
    }
  });
  const handleFile = (file) => {
    if (!file || !file.type.includes("png")) return;
    const reader = new FileReader();
    reader.onload = () => setTarjaCustomPng(reader.result);
    reader.readAsDataURL(file);
  };
  const handleSavePreset = () => {
    const name = presetNameInput.trim();
    if (!name) return;
    const preset = {
      tarjaCustomPng,
      tarjaScaleX,
      tarjaScaleY,
      tarjaScaleLock,
      tarjaX,
      tarjaY,
      font1Size,
      font1X,
      font1Y,
      font2Size,
      font2X,
      font2Y
    };
    const updated = { ...savedPresets, [name]: preset };
    setSavedPresets(updated);
    localStorage.setItem("gc_tarja_presets", JSON.stringify(updated));
    setShowSaveDialog(false);
    setPresetNameInput("");
    setPresetMenuOpen(false);
  };
  const handleApplyPreset = (name) => {
    const p = savedPresets[name];
    if (!p) return;
    if (p.tarjaCustomPng !== void 0) setTarjaCustomPng(p.tarjaCustomPng);
    if (p.tarjaScaleX !== void 0) setTarjaScaleX(p.tarjaScaleX);
    if (p.tarjaScaleY !== void 0) setTarjaScaleY(p.tarjaScaleY);
    if (p.tarjaScaleLock !== void 0) setTarjaScaleLock(p.tarjaScaleLock);
    if (p.tarjaX !== void 0) setTarjaX(p.tarjaX);
    if (p.tarjaY !== void 0) setTarjaY(p.tarjaY);
    if (p.font1Size !== void 0) setFont1Size(p.font1Size);
    if (p.font1X !== void 0) setFont1X(p.font1X);
    if (p.font1Y !== void 0) setFont1Y(p.font1Y);
    if (p.font2Size !== void 0) setFont2Size(p.font2Size);
    if (p.font2X !== void 0) setFont2X(p.font2X);
    if (p.font2Y !== void 0) setFont2Y(p.font2Y);
    setPresetMenuOpen(false);
  };
  const handleDeletePreset = (name, e) => {
    e.stopPropagation();
    const updated = { ...savedPresets };
    delete updated[name];
    setSavedPresets(updated);
    localStorage.setItem("gc_tarja_presets", JSON.stringify(updated));
  };
  const handleExportPreset = () => {
    const name = presetNameInput.trim() || "preset_gc";
    const preset = {
      tarjaCustomPng,
      tarjaScaleX,
      tarjaScaleY,
      tarjaScaleLock,
      tarjaX,
      tarjaY,
      font1Size,
      font1X,
      font1Y,
      font2Size,
      font2X,
      font2Y
    };
    const blob = new Blob([JSON.stringify(preset, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.gcpreset.json`;
    a.click();
    URL.revokeObjectURL(url);
    setPresetMenuOpen(false);
  };
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const p = JSON.parse(ev.target.result);
        handleApplyPresetObj(p);
      } catch {
        alert("Arquivo de preset inválido.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
    setPresetMenuOpen(false);
  };
  const handleApplyPresetObj = (p) => {
    if (p.tarjaCustomPng !== void 0) setTarjaCustomPng(p.tarjaCustomPng);
    if (p.tarjaScaleX !== void 0) setTarjaScaleX(p.tarjaScaleX);
    if (p.tarjaScaleY !== void 0) setTarjaScaleY(p.tarjaScaleY);
    if (p.tarjaScaleLock !== void 0) setTarjaScaleLock(p.tarjaScaleLock);
    if (p.tarjaX !== void 0) setTarjaX(p.tarjaX);
    if (p.tarjaY !== void 0) setTarjaY(p.tarjaY);
    if (p.font1Size !== void 0) setFont1Size(p.font1Size);
    if (p.font1X !== void 0) setFont1X(p.font1X);
    if (p.font1Y !== void 0) setFont1Y(p.font1Y);
    if (p.font2Size !== void 0) setFont2Size(p.font2Size);
    if (p.font2X !== void 0) setFont2X(p.font2X);
    if (p.font2Y !== void 0) setFont2Y(p.font2Y);
  };
  if (!open) return null;
  const presetNames = Object.keys(savedPresets);
  return /* @__PURE__ */ jsx("div", { style: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(0,0,0,0.72)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16
  }, children: /* @__PURE__ */ jsxs("div", { style: {
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: 20,
    width: "100%",
    maxWidth: 640,
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
    display: "flex",
    flexDirection: "column",
    gap: 0
  }, children: [
    /* @__PURE__ */ jsxs("div", { style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 20px",
      borderBottom: "1px solid #27272a"
    }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsx("span", { style: { fontSize: 16 }, children: "🎞" }),
        /* @__PURE__ */ jsx("span", { style: { fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "#e4e4e7" }, children: "Config Layer / Tarja" })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, position: "relative" }, children: [
        /* @__PURE__ */ jsxs("div", { style: { position: "relative" }, children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => {
                setPresetMenuOpen((v) => !v);
                setShowSaveDialog(false);
              },
              style: {
                background: presetMenuOpen ? "#3f3f46" : "#27272a",
                border: "1px solid #3f3f46",
                borderRadius: 8,
                padding: "4px 12px",
                color: "#a78bfa",
                fontSize: 11,
                cursor: "pointer",
                fontWeight: 900,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 6
              },
              onMouseEnter: (e) => e.currentTarget.style.background = "#3f3f46",
              onMouseLeave: (e) => e.currentTarget.style.background = presetMenuOpen ? "#3f3f46" : "#27272a",
              children: [
                /* @__PURE__ */ jsx("span", { children: "💾" }),
                " PRESET ",
                /* @__PURE__ */ jsx("span", { style: { fontSize: 8 }, children: presetMenuOpen ? "▲" : "▼" })
              ]
            }
          ),
          presetMenuOpen && /* @__PURE__ */ jsxs("div", { style: {
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 100,
            background: "#18181b",
            border: "1px solid #3f3f46",
            borderRadius: 12,
            minWidth: 260,
            boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
            overflow: "hidden"
          }, children: [
            !showSaveDialog ? /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setShowSaveDialog(true),
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "11px 16px",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid #27272a",
                  color: "#a78bfa",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  textAlign: "left"
                },
                onMouseEnter: (e) => e.currentTarget.style.background = "#27272a",
                onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
                children: "💾 Salvar config atual como preset"
              }
            ) : /* @__PURE__ */ jsxs("div", { style: { padding: "12px 16px", borderBottom: "1px solid #27272a", display: "flex", flexDirection: "column", gap: 8 }, children: [
              /* @__PURE__ */ jsx("span", { style: { fontSize: 9, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }, children: "Nome do programa / preset" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  autoFocus: true,
                  value: presetNameInput,
                  onChange: (e) => setPresetNameInput(e.target.value),
                  onKeyDown: (e) => {
                    if (e.key === "Enter") handleSavePreset();
                    if (e.key === "Escape") setShowSaveDialog(false);
                  },
                  placeholder: "Ex: Jornal da Manhã",
                  style: {
                    background: "#09090b",
                    border: "1px solid #3f3f46",
                    borderRadius: 6,
                    padding: "6px 10px",
                    color: "#e4e4e7",
                    fontSize: 11,
                    fontFamily: "monospace",
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box"
                  }
                }
              ),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 6 }, children: [
                /* @__PURE__ */ jsx("button", { onClick: handleSavePreset, style: { flex: 1, padding: "7px 0", borderRadius: 6, background: "#7c3aed", border: "none", color: "#fff", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }, children: "✓ Salvar" }),
                /* @__PURE__ */ jsx("button", { onClick: () => setShowSaveDialog(false), style: { flex: 1, padding: "7px 0", borderRadius: 6, background: "#27272a", border: "1px solid #3f3f46", color: "#a1a1aa", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }, children: "Cancelar" })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleExportPreset,
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "11px 16px",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid #27272a",
                  color: "#34d399",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  textAlign: "left"
                },
                onMouseEnter: (e) => e.currentTarget.style.background = "#27272a",
                onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
                children: "📤 Exportar preset (.json)"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => presetImportRef.current?.click(),
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "11px 16px",
                  background: "transparent",
                  border: "none",
                  borderBottom: presetNames.length > 0 ? "1px solid #27272a" : "none",
                  color: "#60a5fa",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  textAlign: "left"
                },
                onMouseEnter: (e) => e.currentTarget.style.background = "#27272a",
                onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
                children: "📥 Importar preset (.json)"
              }
            ),
            /* @__PURE__ */ jsx("input", { ref: presetImportRef, type: "file", accept: ".json,.gcpreset.json", style: { display: "none" }, onChange: handleImportFile }),
            presetNames.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { style: { padding: "8px 16px 4px", fontSize: 9, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }, children: "PRESETS SALVOS" }),
              presetNames.map((name) => /* @__PURE__ */ jsxs(
                "div",
                {
                  style: { display: "flex", alignItems: "center", borderTop: "1px solid #1f1f23" },
                  children: [
                    /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: () => handleApplyPreset(name),
                        style: {
                          flex: 1,
                          padding: "10px 16px",
                          background: "transparent",
                          border: "none",
                          color: "#e4e4e7",
                          fontSize: 11,
                          fontWeight: 600,
                          textAlign: "left",
                          cursor: "pointer",
                          textTransform: "none",
                          letterSpacing: 0
                        },
                        onMouseEnter: (e) => e.currentTarget.style.background = "#27272a",
                        onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
                        children: [
                          savedPresets[name]?.tarjaCustomPng ? "🖼 " : "⚙️ ",
                          name
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: (e) => handleDeletePreset(name, e),
                        style: {
                          padding: "10px 14px",
                          background: "transparent",
                          border: "none",
                          color: "#52525b",
                          fontSize: 12,
                          cursor: "pointer"
                        },
                        onMouseEnter: (e) => e.currentTarget.style.color = "#ef4444",
                        onMouseLeave: (e) => e.currentTarget.style.color = "#52525b",
                        title: "Remover preset",
                        children: "✕"
                      }
                    )
                  ]
                },
                name
              ))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onClose,
            style: {
              background: "#27272a",
              border: "1px solid #3f3f46",
              borderRadius: 8,
              padding: "4px 10px",
              color: "#a1a1aa",
              fontSize: 11,
              cursor: "pointer",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase"
            },
            onMouseEnter: (e) => e.currentTarget.style.background = "#3f3f46",
            onMouseLeave: (e) => e.currentTarget.style.background = "#27272a",
            children: "✕ Fechar"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { padding: 20, display: "flex", flexDirection: "column", gap: 20 }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
        /* @__PURE__ */ jsx(SectionLabel, { children: "Preview ao Vivo" }),
        /* @__PURE__ */ jsxs("div", { style: {
          position: "relative",
          width: "100%",
          aspectRatio: "16/9",
          background: "#000",
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid #3f3f46"
        }, children: [
          /* @__PURE__ */ jsx("div", { style: {
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }, children: /* @__PURE__ */ jsx("span", { style: { color: "#ffffff18", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.3em" }, children: "SINAL DE VÍDEO" }) }),
          (gcLine1 || gcLine2) && /* @__PURE__ */ jsx("div", { style: {
            position: "absolute",
            left: `${tarjaX}%`,
            top: `${tarjaY}%`,
            transform: "translate(-50%, -50%)",
            width: `${tarjaScaleX}%`
          }, children: tarjaCustomPng ? /* @__PURE__ */ jsxs("div", { style: { position: "relative" }, children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: tarjaCustomPng,
                alt: "tarja",
                style: { width: "100%", display: "block", height: "auto" }
              }
            ),
            gcLine1 && /* @__PURE__ */ jsx("div", { style: {
              position: "absolute",
              left: `${font1X}%`,
              top: `${font1Y}%`,
              fontSize: font1Size,
              fontWeight: 900,
              color: "#fff",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              textShadow: "0 1px 4px rgba(0,0,0,0.8)",
              transform: "translateY(-50%)",
              fontFamily: "sans-serif"
            }, children: gcLine1 }),
            gcLine2 && /* @__PURE__ */ jsx("div", { style: {
              position: "absolute",
              left: `${font2X}%`,
              top: `${font2Y}%`,
              fontSize: font2Size,
              fontWeight: 500,
              color: "#d4d4d8",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              textShadow: "0 1px 4px rgba(0,0,0,0.8)",
              transform: "translateY(-50%)",
              fontFamily: "sans-serif"
            }, children: gcLine2 })
          ] }) : (
            /* Fallback: tarja com faixa escura */
            /* @__PURE__ */ jsxs("div", { style: {
              display: "flex",
              alignItems: "stretch",
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.6)"
            }, children: [
              /* @__PURE__ */ jsx("div", { style: { width: 4, background: "#dc2626", flexShrink: 0 } }),
              /* @__PURE__ */ jsxs("div", { style: { background: "rgba(0,0,0,0.88)", padding: "6px 10px", flex: 1, minWidth: 0 }, children: [
                gcLine1 && /* @__PURE__ */ jsx("div", { style: {
                  fontSize: font1Size,
                  fontWeight: 900,
                  color: "#fff",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  fontFamily: "sans-serif",
                  lineHeight: 1.2
                }, children: gcLine1 }),
                gcLine2 && /* @__PURE__ */ jsx("div", { style: {
                  fontSize: font2Size,
                  fontWeight: 400,
                  color: "#a1a1aa",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  fontFamily: "sans-serif",
                  lineHeight: 1.2
                }, children: gcLine2 })
              ] })
            ] })
          ) }),
          !gcLine1 && !gcLine2 && /* @__PURE__ */ jsx("div", { style: {
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }, children: /* @__PURE__ */ jsx("span", { style: { color: "#52525b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em" }, children: "Digite nas linhas do GC para ver o preview" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
        /* @__PURE__ */ jsx(SectionLabel, { children: "PNG Personalizado (Tarja)" }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => fileInputRef.current?.click(),
              style: {
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                background: "#27272a",
                border: "1px solid #3f3f46",
                color: "#e4e4e7",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
                transition: "background 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 8
              },
              onMouseEnter: (e) => e.currentTarget.style.background = "#3f3f46",
              onMouseLeave: (e) => e.currentTarget.style.background = "#27272a",
              children: "📁 Buscar arquivo .PNG"
            }
          ),
          tarjaCustomPng && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setTarjaCustomPng(null),
              style: {
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer"
              },
              onMouseEnter: (e) => e.currentTarget.style.background = "rgba(239,68,68,0.2)",
              onMouseLeave: (e) => e.currentTarget.style.background = "rgba(239,68,68,0.1)",
              children: "✕ Remover"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            ref: fileInputRef,
            type: "file",
            accept: "image/png",
            style: { display: "none" },
            onChange: (e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }
          }
        ),
        tarjaCustomPng && /* @__PURE__ */ jsx("div", { style: {
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid #3f3f46",
          background: "#09090b"
        }, children: /* @__PURE__ */ jsx("img", { src: tarjaCustomPng, alt: "Tarja PNG", style: { width: "100%", display: "block", maxHeight: 80, objectFit: "contain" } }) }),
        !tarjaCustomPng && /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              border: "2px dashed #3f3f46",
              borderRadius: 8,
              padding: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "#52525b",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              cursor: "pointer"
            },
            onClick: () => fileInputRef.current?.click(),
            onDragOver: (e) => e.preventDefault(),
            onDrop: (e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            },
            children: "🖼 Arraste um PNG aqui ou clique para buscar"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
          /* @__PURE__ */ jsx(SectionLabel, { children: "Escala da Tarja" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setTarjaScaleLock((v) => !v),
              style: {
                padding: "3px 10px",
                borderRadius: 6,
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
                transition: "all 0.15s",
                background: tarjaScaleLock ? "rgba(236,72,153,0.12)" : "#27272a",
                border: tarjaScaleLock ? "1px solid rgba(236,72,153,0.4)" : "1px solid #3f3f46",
                color: tarjaScaleLock ? "#f472b6" : "#71717a"
              },
              children: tarjaScaleLock ? "🔒 PROPORCIONAL" : "🔓 LIVRE"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(SliderRow, { label: "Largura X", min: 10, max: 200, value: tarjaScaleX, unit: "%", onChange: (v) => {
          setTarjaScaleX(v);
          if (tarjaScaleLock) setTarjaScaleY(v);
        } }),
        /* @__PURE__ */ jsx(SliderRow, { label: "Altura Y", min: 10, max: 200, value: tarjaScaleY, unit: "%", onChange: (v) => {
          setTarjaScaleY(v);
          if (tarjaScaleLock) setTarjaScaleX(v);
        } })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
        /* @__PURE__ */ jsx(SectionLabel, { children: "Posição na Tela" }),
        /* @__PURE__ */ jsx(SliderRow, { label: "Posição X", min: 0, max: 100, value: tarjaX, unit: "%", onChange: setTarjaX }),
        /* @__PURE__ */ jsx(SliderRow, { label: "Posição Y", min: 0, max: 100, value: tarjaY, unit: "%", onChange: setTarjaY }),
        /* @__PURE__ */ jsx("div", { style: { position: "relative", width: "100%", height: 56, background: "#09090b", borderRadius: 8, border: "1px solid #27272a", overflow: "hidden" }, children: /* @__PURE__ */ jsx("div", { style: {
          position: "absolute",
          left: `${tarjaX}%`,
          top: `${tarjaY}%`,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "#ec4899",
          border: "2px solid #fff",
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 8px rgba(236,72,153,0.8)",
          transition: "all 0.05s"
        } }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 16 }, children: [
        /* @__PURE__ */ jsxs("div", { style: { flex: 1, display: "flex", flexDirection: "column", gap: 10, background: "#0f0f0f", borderRadius: 10, padding: 14, border: "1px solid #27272a" }, children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
            /* @__PURE__ */ jsx("div", { style: { width: 8, height: 8, borderRadius: "50%", background: "#22c55e" } }),
            /* @__PURE__ */ jsx(SectionLabel, { children: "Fonte — Linha 1" })
          ] }),
          /* @__PURE__ */ jsx(SliderRow, { label: "Tamanho", min: 6, max: 48, value: font1Size, unit: "px", onChange: setFont1Size, accentColor: "#22c55e" }),
          /* @__PURE__ */ jsx(SliderRow, { label: "Pos. X", min: 0, max: 100, value: font1X, unit: "%", onChange: setFont1X, accentColor: "#22c55e" }),
          /* @__PURE__ */ jsx(SliderRow, { label: "Pos. Y", min: 0, max: 100, value: font1Y, unit: "%", onChange: setFont1Y, accentColor: "#22c55e" })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { flex: 1, display: "flex", flexDirection: "column", gap: 10, background: "#0f0f0f", borderRadius: 10, padding: 14, border: "1px solid #27272a" }, children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
            /* @__PURE__ */ jsx("div", { style: { width: 8, height: 8, borderRadius: "50%", background: "#3b82f6" } }),
            /* @__PURE__ */ jsx(SectionLabel, { children: "Fonte — Linha 2" })
          ] }),
          /* @__PURE__ */ jsx(SliderRow, { label: "Tamanho", min: 6, max: 40, value: font2Size, unit: "px", onChange: setFont2Size, accentColor: "#3b82f6" }),
          /* @__PURE__ */ jsx(SliderRow, { label: "Pos. X", min: 0, max: 100, value: font2X, unit: "%", onChange: setFont2X, accentColor: "#3b82f6" }),
          /* @__PURE__ */ jsx(SliderRow, { label: "Pos. Y", min: 0, max: 100, value: font2Y, unit: "%", onChange: setFont2Y, accentColor: "#3b82f6" })
        ] })
      ] })
    ] })
  ] }) });
}
function GcPanel({
  // Opcional: receber callbacks externos
  onTake,
  onClear,
  // Props controlled: quando definidas, o painel reflete os valores externos
  externalLine1,
  externalLine2
}) {
  const [gcLine1, setGcLine1] = useState(externalLine1 || "");
  const [gcLine2, setGcLine2] = useState(externalLine2 || "");
  const [gcDuration, setGcDuration] = useState(0);
  const [gcVisible, setGcVisible] = useState(false);
  useEffect(() => {
    if (externalLine1 !== void 0) setGcLine1(externalLine1);
  }, [externalLine1]);
  useEffect(() => {
    if (externalLine2 !== void 0) setGcLine2(externalLine2);
  }, [externalLine2]);
  const [layerOpen, setLayerOpen] = useState(false);
  const [tarjaCustomPng, setTarjaCustomPng] = useState(null);
  const [tarjaScaleX, setTarjaScaleX] = useState(80);
  const [tarjaScaleY, setTarjaScaleY] = useState(80);
  const [tarjaScaleLock, setTarjaScaleLock] = useState(true);
  const [tarjaX, setTarjaX] = useState(50);
  const [tarjaY, setTarjaY] = useState(85);
  const [font1Size, setFont1Size] = useState(14);
  const [font1X, setFont1X] = useState(8);
  const [font1Y, setFont1Y] = useState(35);
  const [font2Size, setFont2Size] = useState(10);
  const [font2X, setFont2X] = useState(8);
  const [font2Y, setFont2Y] = useState(70);
  useEffect(() => {
    if (!gcVisible || gcDuration === 0) return;
    const timer = setTimeout(() => setGcVisible(false), gcDuration * 1e3);
    return () => clearTimeout(timer);
  }, [gcVisible, gcDuration]);
  const handleTake = useCallback(() => {
    if (!gcLine1 && !gcLine2) return;
    setGcVisible(true);
    onTake?.({
      line1: gcLine1,
      line2: gcLine2,
      tarjaPng: tarjaCustomPng || null,
      tarjaX,
      tarjaY,
      tarjaScaleX,
      tarjaScaleY,
      font1Size,
      font1X,
      font1Y,
      font2Size,
      font2X,
      font2Y
    });
  }, [gcLine1, gcLine2, tarjaCustomPng, tarjaX, tarjaY, tarjaScaleX, tarjaScaleY, font1Size, font1X, font1Y, font2Size, font2X, font2Y, onTake]);
  const handleClear = useCallback(() => {
    setGcVisible(false);
    onClear?.();
  }, [onClear]);
  const handleSkip = useCallback(() => {
    setGcLine1("");
    setGcLine2("");
    setGcVisible(false);
  }, []);
  const panelStyle = {
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: 24,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    minWidth: 320,
    maxWidth: 420,
    position: "relative"
  };
  const inputStyle = {
    width: "100%",
    background: "rgba(39,39,42,0.6)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 8,
    padding: "7px 12px",
    fontSize: 11,
    fontFamily: "monospace",
    color: "#e4e4e7",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box"
  };
  const labelStyle = {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#52525b",
    fontWeight: 700
  };
  const selectStyle = {
    flex: 1,
    background: "rgba(39,39,42,0.6)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 8,
    padding: "7px 10px",
    fontSize: 10,
    fontFamily: "monospace",
    color: "#e4e4e7",
    outline: "none",
    cursor: "pointer"
  };
  const btnBase = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "9px 16px",
    borderRadius: 99,
    fontSize: 10,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    cursor: "pointer",
    transition: "all 0.15s",
    border: "none",
    outline: "none"
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { style: panelStyle, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsx("div", { style: {
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: gcVisible ? "#22c55e" : "#52525b",
          boxShadow: gcVisible ? "0 0 8px #22c55e" : "none",
          transition: "all 0.3s"
        } }),
        /* @__PURE__ */ jsx("span", { style: { fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#71717a" }, children: "GC — Gerador de Caracteres" }),
        gcVisible && /* @__PURE__ */ jsx("span", { style: {
          marginLeft: "auto",
          fontSize: 8,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "#22c55e",
          background: "rgba(34,197,94,0.1)",
          border: "1px solid rgba(34,197,94,0.3)",
          padding: "2px 8px",
          borderRadius: 99,
          animation: "pulse 1.5s infinite"
        }, children: "● NO AR" })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "3fr 1fr", gap: 12 }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 4 }, children: [
            /* @__PURE__ */ jsx("label", { style: labelStyle, children: "Linha 1 — Nome / Título" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: gcLine1,
                onChange: (e) => setGcLine1(e.target.value),
                placeholder: "Nome / Título",
                style: inputStyle,
                onFocus: (e) => e.target.style.borderColor = "rgba(239,68,68,0.4)",
                onBlur: (e) => e.target.style.borderColor = "rgba(255,255,255,0.05)"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 4 }, children: [
            /* @__PURE__ */ jsx("label", { style: labelStyle, children: "Linha 2 — Cargo / Informação" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: gcLine2,
                onChange: (e) => setGcLine2(e.target.value),
                placeholder: "Cargo / Informação",
                style: inputStyle,
                onFocus: (e) => e.target.style.borderColor = "rgba(239,68,68,0.4)",
                onBlur: (e) => e.target.style.borderColor = "rgba(255,255,255,0.05)"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsx("label", { style: labelStyle, children: "Duração:" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: gcDuration,
                onChange: (e) => setGcDuration(Number(e.target.value)),
                style: selectStyle,
                children: [
                  /* @__PURE__ */ jsx("option", { value: 0, children: "Manual" }),
                  /* @__PURE__ */ jsx("option", { value: 3, children: "3s" }),
                  /* @__PURE__ */ jsx("option", { value: 5, children: "5s" }),
                  /* @__PURE__ */ jsx("option", { value: 10, children: "10s" }),
                  /* @__PURE__ */ jsx("option", { value: 15, children: "15s" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: {
          position: "relative",
          background: "#09090b",
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.05)",
          aspectRatio: "16/9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }, children: [
          /* @__PURE__ */ jsx("span", { style: { position: "absolute", fontSize: 7, color: "#3f3f46", textTransform: "uppercase", letterSpacing: "0.1em", top: 4, left: 0, right: 0, textAlign: "center" }, children: "GC LIVE PREV" }),
          gcLine1 || gcLine2 ? /* @__PURE__ */ jsx("div", { style: {
            position: "absolute",
            bottom: 4,
            left: 4,
            right: 4
          }, children: tarjaCustomPng ? /* @__PURE__ */ jsxs("div", { style: { position: "relative", lineHeight: 0 }, children: [
            /* @__PURE__ */ jsx("img", { src: tarjaCustomPng, alt: "tarja", style: { width: "100%", borderRadius: 2 } }),
            gcLine1 && /* @__PURE__ */ jsx("div", { style: {
              position: "absolute",
              left: `${font1X}%`,
              top: `${font1Y}%`,
              fontSize: Math.max(4, font1Size * 0.35),
              fontWeight: 900,
              color: "#fff",
              whiteSpace: "nowrap",
              transform: "translateY(-50%)",
              fontFamily: "sans-serif",
              textShadow: "0 1px 3px rgba(0,0,0,0.9)"
            }, children: gcLine1 }),
            gcLine2 && /* @__PURE__ */ jsx("div", { style: {
              position: "absolute",
              left: `${font2X}%`,
              top: `${font2Y}%`,
              fontSize: Math.max(3, font2Size * 0.35),
              color: "#d4d4d8",
              whiteSpace: "nowrap",
              transform: "translateY(-50%)",
              fontFamily: "sans-serif",
              textShadow: "0 1px 3px rgba(0,0,0,0.9)"
            }, children: gcLine2 })
          ] }) : /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "stretch", borderRadius: 2, overflow: "hidden" }, children: [
            /* @__PURE__ */ jsx("div", { style: { width: 2, background: "#dc2626", flexShrink: 0 } }),
            /* @__PURE__ */ jsxs("div", { style: { background: "rgba(0,0,0,0.88)", padding: "3px 5px", flex: 1, minWidth: 0 }, children: [
              gcLine1 && /* @__PURE__ */ jsx("div", { style: { color: "#fff", fontWeight: 900, fontSize: 7, textTransform: "uppercase", overflow: "hidden", whiteSpace: "nowrap", lineHeight: 1.3 }, children: gcLine1 }),
              gcLine2 && /* @__PURE__ */ jsx("div", { style: { color: "#a1a1aa", fontSize: 6, textTransform: "uppercase", overflow: "hidden", whiteSpace: "nowrap", lineHeight: 1.3 }, children: gcLine2 })
            ] })
          ] }) }) : null
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleTake,
            style: {
              ...btnBase,
              background: "#16a34a",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(22,163,74,0.35)"
            },
            onMouseEnter: (e) => {
              e.currentTarget.style.background = "#15803d";
              e.currentTarget.style.transform = "translateY(-1px)";
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.background = "#16a34a";
              e.currentTarget.style.transform = "translateY(0)";
            },
            onMouseDown: (e) => e.currentTarget.style.transform = "scale(0.97)",
            onMouseUp: (e) => e.currentTarget.style.transform = "translateY(-1px)",
            children: "GC TAKE"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleClear,
            style: {
              ...btnBase,
              background: "#dc2626",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(220,38,38,0.3)"
            },
            onMouseEnter: (e) => {
              e.currentTarget.style.background = "#b91c1c";
              e.currentTarget.style.transform = "translateY(-1px)";
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.background = "#dc2626";
              e.currentTarget.style.transform = "translateY(0)";
            },
            onMouseDown: (e) => e.currentTarget.style.transform = "scale(0.97)",
            onMouseUp: (e) => e.currentTarget.style.transform = "translateY(-1px)",
            children: "GC CLEAR"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleSkip,
            style: {
              ...btnBase,
              background: "#3f3f46",
              color: "#d4d4d8"
            },
            onMouseEnter: (e) => {
              e.currentTarget.style.background = "#52525b";
              e.currentTarget.style.transform = "translateY(-1px)";
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.background = "#3f3f46";
              e.currentTarget.style.transform = "translateY(0)";
            },
            onMouseDown: (e) => e.currentTarget.style.transform = "scale(0.97)",
            onMouseUp: (e) => e.currentTarget.style.transform = "translateY(-1px)",
            children: "PULAR"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { borderTop: "1px solid #27272a", paddingTop: 16 }, children: [
        /* @__PURE__ */ jsx("div", { style: { marginBottom: 10 }, children: /* @__PURE__ */ jsx("span", { style: {
          fontSize: 9,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "#52525b"
        }, children: "⚙️ Ajustes & Efeitos" }) }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setLayerOpen(true),
            style: {
              width: "100%",
              padding: "11px 16px",
              borderRadius: 14,
              background: layerOpen ? "#3f3f46" : "#27272a",
              border: "1px solid #3f3f46",
              color: "#e4e4e7",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              cursor: "pointer",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
            },
            onMouseEnter: (e) => {
              e.currentTarget.style.background = "#3f3f46";
              e.currentTarget.style.borderColor = "#52525b";
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.background = layerOpen ? "#3f3f46" : "#27272a";
              e.currentTarget.style.borderColor = "#3f3f46";
            },
            children: [
              /* @__PURE__ */ jsx("span", { children: "🎞" }),
              "LAYER — Config Tarja",
              tarjaCustomPng && /* @__PURE__ */ jsx("span", { style: {
                marginLeft: "auto",
                fontSize: 8,
                fontWeight: 900,
                background: "rgba(236,72,153,0.15)",
                border: "1px solid rgba(236,72,153,0.4)",
                color: "#f472b6",
                padding: "2px 8px",
                borderRadius: 99,
                textTransform: "uppercase",
                letterSpacing: "0.1em"
              }, children: "PNG ativo" })
            ]
          }
        )
      ] }),
      gcVisible && /* @__PURE__ */ jsxs("div", { style: {
        background: "rgba(34,197,94,0.06)",
        border: "1px solid rgba(34,197,94,0.2)",
        borderRadius: 12,
        padding: "8px 14px",
        display: "flex",
        alignItems: "center",
        gap: 8
      }, children: [
        /* @__PURE__ */ jsx("div", { style: { width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "gcPulse 1s infinite" } }),
        /* @__PURE__ */ jsxs("span", { style: { fontSize: 9, color: "#22c55e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }, children: [
          "GC Ativo — ",
          gcLine1,
          gcLine2 ? ` | ${gcLine2}` : ""
        ] }),
        gcDuration > 0 && /* @__PURE__ */ jsxs("span", { style: { marginLeft: "auto", fontSize: 9, color: "#4ade80", fontFamily: "monospace" }, children: [
          gcDuration,
          "s"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      ConfigTarjaModal,
      {
        open: layerOpen,
        onClose: () => setLayerOpen(false),
        tarjaCustomPng,
        setTarjaCustomPng,
        tarjaScaleX,
        setTarjaScaleX,
        tarjaScaleY,
        setTarjaScaleY,
        tarjaScaleLock,
        setTarjaScaleLock,
        tarjaX,
        setTarjaX,
        tarjaY,
        setTarjaY,
        font1Size,
        setFont1Size,
        font1X,
        setFont1X,
        font1Y,
        setFont1Y,
        font2Size,
        setFont2Size,
        font2X,
        setFont2X,
        font2Y,
        setFont2Y,
        gcLine1,
        gcLine2
      }
    ),
    /* @__PURE__ */ jsx("style", { children: `
        @keyframes gcPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      ` })
  ] });
}
const Route$8 = createFileRoute("/playout")({
  validateSearch: (search) => {
    return {
      date: search.date || void 0,
      programa: search.programa || void 0
    };
  },
  component: PlayoutPage,
  head: () => ({ meta: [{ title: "Exibição (PGM) — DeskNews" }] })
});
function calcularDuracaoEstimada(texto) {
  if (!texto) return 0;
  const palavras = texto.trim().split(/\s+/).length;
  return Math.ceil(palavras / 2.5);
}
function formatarTimecode(segundos) {
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
}
function normalizarTag(linha) {
  const m = linha.match(/^\[(.+)\]$/);
  if (!m) return null;
  return m[1].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "").trim();
}
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
    const tag = normalizarTag(linha);
    if (tag === "SONORA") {
      console.log("🎤 Encontrado [SONORA] (tag raw:", linha, "→", tag, ")");
      let nome = "";
      let funcao = "";
      let texto = "";
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
      let timecodeManual = void 0;
      if (i + 1 < linhas.length) {
        const tcLinha = linhas[i + 1];
        const tcMatch = tcLinha.match(/^\((\d{1,2}):(\d{2})\)$/);
        if (tcMatch) {
          timecodeManual = parseInt(tcMatch[1]) * 60 + parseInt(tcMatch[2]);
          i++;
          console.log(`⏱️ Timecode manual encontrado: ${timecodeManual}s`);
        }
      }
      while (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        if (normalizarTag(proximaLinha) !== null) {
          break;
        }
        const textoMatch = proximaLinha.match(/^"(.+)"$/);
        if (textoMatch) {
          texto += (texto ? " " : "") + textoMatch[1];
          i++;
        } else {
          break;
        }
      }
      if (nome) {
        const duracaoEstimada = calcularDuracaoEstimada(texto);
        sonoras.push({ nome, funcao, texto, duracaoEstimada, timecodeInicio: timecodeManual });
        itensLauda.push({
          tipo: "SONORA",
          nome: "SONORA",
          valor: `${nome} - ${funcao}`,
          ordem: ordem++
        });
        console.log("✅ Sonora adicionada:", { nome, funcao, duracao: duracaoEstimada + "s", timecode: timecodeManual !== void 0 ? timecodeManual + "s" : "automático" });
      }
    }
    if (tag === "PASSAGEM") {
      console.log("🎥 Encontrado [PASSAGEM] (raw:", linha, "→", tag, ")");
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
    if (tag === "IMAGENS") {
      console.log("🎞️ Encontrado [IMAGENS] (raw:", linha, "→", tag, ")");
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
    if (tag === "PRODUCAO") {
      console.log("🎬 Encontrado [PRODUÇÃO] (raw:", linha, "→", tag, ")");
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
    if (tag === "EDTEXTO") {
      console.log("📝 Encontrado [ED. TEXTO] (raw:", linha, "→", tag, ")");
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
    if (tag === "EDIMAGEM" || tag === "EDIMAGENS") {
      console.log("🖼️ Encontrado [ED. IMAGEM] (raw:", linha, "→", tag, ")");
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
async function calcularTimecodesViaIA(estrutura, itensLauda, duracaoRealVT, sonorasManuais) {
  const creditosParaCalcuar = itensLauda.filter(
    (it) => ["SONORA", "PASSAGEM", "ED_TEXTO", "ED_IMAGEM", "REPÓRTER"].includes(it.tipo)
  );
  if (!creditosParaCalcuar.length) return [];
  creditosParaCalcuar.filter((it) => it.tipo === "SONORA").every((it) => {
    const sepIdx = it.valor?.indexOf(" - ") ?? -1;
    const nome = sepIdx >= 0 ? it.valor.slice(0, sepIdx).trim() : (it.valor || "").trim();
    return sonorasManuais.some(
      (s) => s.nome.trim().toUpperCase() === nome.toUpperCase() && s.timecodeInicio !== void 0
    );
  });
  const creditosDescricao = creditosParaCalcuar.map((it, idx) => {
    const sepIdx = it.valor?.indexOf(" - ") ?? -1;
    const nome = sepIdx >= 0 ? it.valor.slice(0, sepIdx).trim() : (it.valor || "").trim();
    const complemento = sepIdx >= 0 ? it.valor.slice(sepIdx + 3).trim() : "";
    const manualSonora = it.tipo === "SONORA" ? sonorasManuais.find((s) => s.nome.trim().toUpperCase() === nome.toUpperCase()) : void 0;
    const tcManual = manualSonora?.timecodeInicio !== void 0 ? `timecode_manual=${manualSonora.timecodeInicio}s` : "sem_timecode_manual";
    return `${idx + 1}. tipo=${it.tipo} nome="${nome}" complemento="${complemento}" ${tcManual}`;
  }).join("\n");
  const prompt = `Você é um assistente de playout de telejornalismo. Analise a lauda abaixo e calcule o timecode exato (em segundos) em que cada crédito deve aparecer na tela durante a exibição do VT.

DURAÇÃO TOTAL DO VT: ${duracaoRealVT} segundos

LAUDA COMPLETA:
${estrutura}

CRÉDITOS QUE PRECISAM DE TIMECODE:
${creditosDescricao}

REGRAS PARA CALCULAR:
- Velocidade de locução em português brasileiro: ~150 palavras por minuto (2,5 palavras/segundo)
- Cada SONORA começa quando o texto antes dela termina de ser lido
- A duração de uma SONORA é estimada pelo número de palavras entre aspas (mesma taxa 2,5 p/s), mínimo 4s
- PASSAGEM: aparece quando o repórter entra em cena (após o off anterior terminar)
- ED_TEXTO e ED_IMAGEM: aparecem nos últimos 20% do VT, respeitando a ordem
- REPÓRTER: aparece nos primeiros 3 segundos do VT
- Se houver timecode_manual, USE EXATAMENTE esse valor para o início
- Todos os timecodes devem estar entre 1 e ${duracaoRealVT - 1} segundos
- Distribua os créditos de forma que não se sobreponham (respeite duracao + 1s de gap)

Responda APENAS com JSON válido, sem markdown, neste formato exato:
{
  "timecodes": [
    {"index": 1, "inicio": 12, "duracao": 8},
    {"index": 2, "inicio": 35, "duracao": 5}
  ]
}`;
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1e3,
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    const text = data.content?.map((b) => b.type === "text" ? b.text : "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    console.log("🤖 Timecodes calculados pela IA:", parsed.timecodes);
    const timeline = [];
    creditosParaCalcuar.forEach((it, idx) => {
      const tc = parsed.timecodes.find((t) => t.index === idx + 1);
      if (!tc) return;
      const sepIdx = it.valor?.indexOf(" - ") ?? -1;
      const nome = sepIdx >= 0 ? it.valor.slice(0, sepIdx).trim() : (it.valor || "").trim();
      const complemento = sepIdx >= 0 ? it.valor.slice(sepIdx + 3).trim() : "";
      let line1 = "";
      let line2 = "";
      if (it.tipo === "SONORA") {
        line1 = nome;
        line2 = complemento;
      } else if (it.tipo === "PASSAGEM") {
        line1 = nome;
        line2 = "REPÓRTER" + (complemento ? ` — ${complemento}` : "");
      } else if (it.tipo === "ED_TEXTO") {
        line1 = it.valor || "";
        line2 = "ED. TEXTO";
      } else if (it.tipo === "ED_IMAGEM") {
        line1 = it.valor || "";
        line2 = "ED. IMAGEM";
      } else if (it.tipo === "REPÓRTER") {
        line1 = it.valor || "";
        line2 = "REPÓRTER";
      }
      if (line1) {
        timeline.push({
          line1,
          line2,
          inicio: Math.max(1, Math.min(tc.inicio, duracaoRealVT - 1)),
          duracao: Math.max(3, tc.duracao)
        });
      }
    });
    return timeline.sort((a, b) => a.inicio - b.inicio);
  } catch (err) {
    console.error("⚠️ Erro na API de timecodes — fallback para contagem de palavras:", err);
    return construirTimelineFallback(itensLauda, duracaoRealVT, sonorasManuais);
  }
}
function construirTimelineFallback(itensLauda, duracaoRealVT, sonorasManuais) {
  if (!itensLauda.length || !duracaoRealVT) return [];
  const totalPalavras = itensLauda.reduce(
    (acc, it) => acc + (it.valor ? it.valor.split(/\s+/).length : 0),
    0
  );
  let palavrasAcumuladas = 0;
  const timeline = [];
  itensLauda.forEach((it) => {
    const palavrasItem = it.valor ? it.valor.split(/\s+/).length : 0;
    const posicaoAntes = totalPalavras > 0 ? palavrasAcumuladas / totalPalavras : 0;
    palavrasAcumuladas += palavrasItem;
    if (!["SONORA", "PASSAGEM", "ED_TEXTO", "ED_IMAGEM", "REPÓRTER"].includes(it.tipo)) return;
    let inicio = Math.min(Math.round(posicaoAntes * duracaoRealVT), Math.max(0, duracaoRealVT - 1));
    let duracao = 4;
    let line1 = "";
    let line2 = "";
    if (it.tipo === "SONORA") {
      const sepIdx = it.valor?.indexOf(" - ") ?? -1;
      line1 = sepIdx >= 0 ? it.valor.slice(0, sepIdx).trim() : (it.valor || "").trim();
      line2 = sepIdx >= 0 ? it.valor.slice(sepIdx + 3).trim() : "";
      const normLine1 = line1.toUpperCase().trim();
      const manual = sonorasManuais.find((s) => s.nome.trim().toUpperCase() === normLine1);
      if (manual?.timecodeInicio !== void 0) inicio = manual.timecodeInicio;
      if (manual?.duracaoEstimada) duracao = manual.duracaoEstimada;
    } else if (it.tipo === "PASSAGEM") {
      const sepIdx = it.valor?.indexOf(" - ") ?? -1;
      line1 = sepIdx >= 0 ? it.valor.slice(0, sepIdx).trim() : (it.valor || "").trim();
      const local = sepIdx >= 0 ? it.valor.slice(sepIdx + 3).trim() : "";
      line2 = "REPÓRTER" + (local ? ` — ${local}` : "");
    } else if (it.tipo === "ED_TEXTO") {
      line1 = it.valor || "";
      line2 = "ED. TEXTO";
    } else if (it.tipo === "ED_IMAGEM") {
      line1 = it.valor || "";
      line2 = "ED. IMAGEM";
    } else if (it.tipo === "REPÓRTER") {
      line1 = it.valor || "";
      line2 = "REPÓRTER";
    }
    if (line1) timeline.push({ line1, line2, inicio, duracao });
  });
  return timeline.sort((a, b) => a.inicio - b.inicio);
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
  const sonorasMapRef = useRef(/* @__PURE__ */ new Map());
  const sonorasDisparadosRef = useRef(/* @__PURE__ */ new Set());
  const [sonorasTimeline, setSonorasTimeline] = useState([]);
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
  const [gcPanelOpen, setGcPanelOpen] = useState(false);
  const { extractCredits } = useAutoCredits({
    apiKey: "gsk_RecCHZh5dHY6zNJLlTAWGyt3FYekwzlSYmsXzYIl8ZtKM0d9Zf7",
    autoPopulate: true,
    deduplicate: true
  });
  const [tarjaVisible, setTarjaVisible] = useState(false);
  const [legendasAtivas, setLegendasAtivas] = useState(false);
  const [legendaTexto, setLegendaTexto] = useState("");
  const [legendaFinal, setLegendaFinal] = useState("");
  useRef(null);
  const whisperMediaRecorderRef = useRef(null);
  const whisperStreamDestRef = useRef(null);
  const whisperIsRunningRef = useRef(false);
  const legendaTimeoutRef = useRef(null);
  const [ccSegmentos, setCcSegmentos] = useState([]);
  const [ccTextoAtual, setCcTextoAtual] = useState("");
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
  const vuLevelLRef = useRef(0);
  const vuLevelRRef = useRef(0);
  const vuCanvasRef = useRef(null);
  const vuAudioCtxRef = useRef(null);
  const vuSplitterRef = useRef(null);
  const vuAnalyserLRef = useRef(null);
  const vuAnalyserRRef = useRef(null);
  const vuRafRef = useRef(null);
  const vuStreamDestRef = useRef(null);
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
  const progressBarRef = useRef(null);
  const progressTimeRef = useRef(null);
  useRef(null);
  const laudaSnapshotRef = useRef([]);
  const sonorasSnapshotRef = useRef([]);
  const estruturaSnapshotRef = useRef("");
  const timelineJsonRef = useRef(null);
  useEffect(() => {
    if (!materiaAtual?.materia_id || !pgmFile?.duration) {
      sonorasMapRef.current.clear();
      sonorasDisparadosRef.current.clear();
      setSonorasTimeline([]);
      timelineJsonRef.current = null;
      return;
    }
    laudaSnapshotRef.current = materiaAtual.itensLauda;
    sonorasSnapshotRef.current = materiaAtual.sonoras || [];
    estruturaSnapshotRef.current = materiaAtual._estrutura || "";
    if (timelineJsonRef.current && timelineJsonRef.current.length > 0) {
      const map = /* @__PURE__ */ new Map();
      const timeline = [];
      timelineJsonRef.current.forEach((c) => {
        const funcao = c.tipo.replace("ED_TEXTO", "ED. TEXTO").replace("ED_IMAGEM", "ED. IMAGEM");
        const key = `${c.valor}|${funcao}`;
        map.set(key, { inicio: c.timecode, duracao: c.duracao ?? 5 });
        timeline.push({ nome: c.valor, funcao, timecodeInicio: c.timecode, duracao: c.duracao ?? 5 });
      });
      sonorasMapRef.current = map;
      sonorasDisparadosRef.current.clear();
      setSonorasTimeline(timeline);
      console.log(`⏱️ useEffect: ${timeline.length} timecode(s) do timeline_json aplicados (VT=${pgmFile.duration}s)`);
      return;
    }
    const aplicarTimeline = (creditosTimeline, resetDisparados = true) => {
      const map = /* @__PURE__ */ new Map();
      const timeline = [];
      creditosTimeline.forEach((cred) => {
        const key = `${cred.line1}|${cred.line2}`;
        map.set(key, { inicio: cred.inicio, duracao: cred.duracao });
        timeline.push({
          nome: cred.line1,
          funcao: cred.line2,
          timecodeInicio: cred.inicio,
          duracao: cred.duracao
        });
        console.log(`⏱️ CRÉDITO (VT=${pgmFile.duration}s): ${cred.line1} → ${cred.inicio}s por ${cred.duracao}s`);
      });
      sonorasMapRef.current = map;
      if (resetDisparados) sonorasDisparadosRef.current.clear();
      setSonorasTimeline(timeline);
    };
    const fallback = construirTimelineFallback(
      laudaSnapshotRef.current,
      pgmFile.duration,
      sonorasSnapshotRef.current
    );
    aplicarTimeline(fallback);
    if (estruturaSnapshotRef.current) {
      console.log("🤖 Calculando timecodes via IA...");
      calcularTimecodesViaIA(
        estruturaSnapshotRef.current,
        laudaSnapshotRef.current,
        pgmFile.duration,
        sonorasSnapshotRef.current
      ).then((creditosIA) => {
        if (creditosIA.length > 0) {
          console.log("✅ Timecodes da IA aplicados:", creditosIA);
          aplicarTimeline(creditosIA, false);
          toast.success(`⏱ ${creditosIA.length} timecode(s) calculado(s) pela IA`, { duration: 2500 });
        }
      }).catch((err) => {
        console.warn("⚠️ IA de timecodes falhou, mantendo fallback:", err);
      });
    }
  }, [materiaAtual?.materia_id, pgmFile?.duration]);
  useEffect(() => {
    if (!isPlaying || sonorasTimeline.length === 0) return;
    sonorasMapRef.current.forEach((timing, sonoraKey) => {
      if (sonorasDisparadosRef.current.has(sonoraKey)) return;
      if (pgmCurrentTime >= timing.inicio) {
        const pipeIdx = sonoraKey.indexOf("|");
        const nome = pipeIdx >= 0 ? sonoraKey.slice(0, pipeIdx) : sonoraKey;
        const funcao = pipeIdx >= 0 ? sonoraKey.slice(pipeIdx + 1) : "";
        console.log(`🎤 AUTO-CRÉDITO: ${nome} (${funcao}) | previsto=${timing.inicio}s | real=${pgmCurrentTime.toFixed(2)}s`);
        sonorasDisparadosRef.current.add(sonoraKey);
        handleGcTake(nome.trim(), funcao.trim(), timing.duracao);
      }
    });
  }, [pgmCurrentTime, isPlaying]);
  useEffect(() => {
    if (!isPlaying) {
      sonorasDisparadosRef.current.clear();
    }
  }, [isPlaying]);
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
    if (!vuStreamDestRef.current) {
      vuStreamDestRef.current = ctx.createMediaStreamDestination();
    }
    const sharedDest = vuStreamDestRef.current;
    try {
      const source = ctx.createMediaElementSource(el);
      source.connect(splitter);
      source.connect(ctx.destination);
      source.connect(sharedDest);
    } catch {
    }
    const dataL = new Uint8Array(analyserL.frequencyBinCount);
    const dataR = new Uint8Array(analyserR.frequencyBinCount);
    const tick = () => {
      analyserL.getByteFrequencyData(dataL);
      analyserR.getByteFrequencyData(dataR);
      const avgL = dataL.reduce((a, b) => a + b, 0) / dataL.length;
      const avgR = dataR.reduce((a, b) => a + b, 0) / dataR.length;
      vuLevelLRef.current = Math.min(100, Math.round(avgL / 255 * 100));
      vuLevelRRef.current = Math.min(100, Math.round(avgR / 255 * 100));
      const canvas = vuCanvasRef.current;
      if (canvas) {
        const ctx2d = canvas.getContext("2d");
        if (ctx2d) {
          const W = canvas.width, H = canvas.height;
          const rowH = Math.floor(H / 2) - 2;
          const BARS = 50;
          const barW = Math.floor((W - (BARS - 1)) / BARS);
          ctx2d.clearRect(0, 0, W, H);
          [vuLevelLRef.current, vuLevelRRef.current].forEach((level, row) => {
            const yOff = row * (rowH + 4);
            const active = Math.round(level / 100 * BARS);
            for (let i = 0; i < BARS; i++) {
              const x = i * (barW + 1);
              ctx2d.fillStyle = i < active ? i < 35 ? "#22c55e" : i < 45 ? "#eab308" : "#ef4444" : "rgba(255,255,255,0.08)";
              ctx2d.fillRect(x, yOff, barW, rowH);
            }
          });
        }
      }
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
  useEffect(() => {
    const estrutura = estruturaSnapshotRef.current || materiaAtual?._estrutura || "";
    const duracao = pgmFile?.duration;
    if (!estrutura || !duracao) {
      setCcSegmentos([]);
      setCcTextoAtual("");
      return;
    }
    const linhas = estrutura.split("\n").map((l) => l.trim()).filter((l) => l.length > 1);
    const blocos = [];
    let i = 0;
    while (i < linhas.length) {
      const linha = linhas[i];
      if (/^\[SONORA\]/i.test(linha) || /^\[SONORA\]/.test(linha.toUpperCase())) {
        let nomeSonora = "";
        let textoSonora = "";
        i++;
        while (i < linhas.length && !/^\[/.test(linhas[i])) {
          if (/^\(.+\)$/.test(linhas[i])) {
            if (!nomeSonora) nomeSonora = linhas[i].slice(1, -1);
          } else if (/^".+"$/.test(linhas[i])) {
            textoSonora += (textoSonora ? " " : "") + linhas[i].slice(1, -1);
          }
          i++;
        }
        if (textoSonora) blocos.push({ tipo: "SONORA", texto: textoSonora, nomeSonora });
        continue;
      }
      if (/^\[.+\]$/.test(linha) || /^\(.+\)$/.test(linha)) {
        i++;
        continue;
      }
      if (linha.length > 3) blocos.push({ tipo: "OFF", texto: linha });
      i++;
    }
    const PALAVRAS_POR_SEG = 2.5;
    const MAX_PALAVRAS = 7;
    const blocosDuracao = blocos.map((b) => {
      const palavras = b.texto.split(/\s+/).length;
      return Math.max(1, palavras / PALAVRAS_POR_SEG);
    });
    const totalEstimado = blocosDuracao.reduce((a, b) => a + b, 0);
    const escala = duracao / Math.max(totalEstimado, 1);
    const segmentos = [];
    let cursor = 0;
    blocos.forEach((bloco, idx) => {
      const duracaoBloco = blocosDuracao[idx] * escala;
      const palavras = bloco.texto.split(/\s+/).filter(Boolean);
      const totalPalavrasBloco = palavras.length;
      for (let w = 0; w < palavras.length; w += MAX_PALAVRAS) {
        const chunk = palavras.slice(w, w + MAX_PALAVRAS).join(" ");
        const posInicio = cursor + w / totalPalavrasBloco * duracaoBloco;
        const posFim = cursor + (w + MAX_PALAVRAS) / totalPalavrasBloco * duracaoBloco;
        segmentos.push({
          texto: chunk,
          inicio: Math.round(posInicio * 10) / 10,
          fim: Math.min(Math.round(posFim * 10) / 10, duracao)
        });
      }
      cursor += duracaoBloco;
    });
    setCcSegmentos(segmentos);
    setCcTextoAtual("");
    console.log(`[CC] ${segmentos.length} segmentos · escala=${escala.toFixed(2)}x · ${duracao}s`);
  }, [materiaAtual?.materia_id, pgmFile?.duration]);
  useEffect(() => {
    if (!legendasAtivas || !isPlaying || !ccSegmentos.length) return;
    let atual;
    for (const s of ccSegmentos) {
      if (pgmCurrentTime >= s.inicio) atual = s;
      else break;
    }
    const texto = atual?.texto ?? "";
    setCcTextoAtual((prev) => prev !== texto ? texto : prev);
  }, [pgmCurrentTime, legendasAtivas, isPlaying, ccSegmentos]);
  useEffect(() => {
    if (!legendasAtivas || !isPlaying) setCcTextoAtual("");
  }, [legendasAtivas, isPlaying]);
  useEffect(() => {
    if (!legendasAtivas) {
      whisperIsRunningRef.current = false;
      if (whisperMediaRecorderRef.current && whisperMediaRecorderRef.current.state !== "inactive") {
        try {
          whisperMediaRecorderRef.current.stop();
        } catch {
        }
      }
      whisperMediaRecorderRef.current = null;
      whisperStreamDestRef.current = null;
      setLegendaFinal("");
      if (legendaTimeoutRef.current) clearTimeout(legendaTimeoutRef.current);
      return;
    }
    const groqKey = "gsk_RecCHZh5dHY6zNJLlTAWGyt3FYekwzlSYmsXzYIl8ZtKM0d9Zf7";
    const videoEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!videoEl) {
      console.warn("[CC] Nenhum elemento de vídeo disponível");
      return;
    }
    let mediaStream;
    try {
      mediaStream = videoEl.captureStream ? videoEl.captureStream() : videoEl.mozCaptureStream?.();
      if (!mediaStream) throw new Error("captureStream não suportado");
    } catch (e) {
      console.warn("[CC] captureStream falhou:", e);
      toast.error("CC: browser não suporta captureStream");
      return;
    }
    const audioTracks = mediaStream.getAudioTracks();
    if (audioTracks.length === 0) {
      console.warn("[CC] Nenhuma track de áudio no stream — vídeo está tocando?");
      toast.error("CC: sem áudio no VT (está tocando?)");
      return;
    }
    const audioOnlyStream = new MediaStream(audioTracks);
    whisperIsRunningRef.current = true;
    console.log("[CC] captureStream OK —", audioTracks.length, "track(s) de áudio");
    const CHUNK_MS = 5e3;
    const recordChunk = () => {
      if (!whisperIsRunningRef.current) return;
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t)) ?? "audio/webm";
      let recorder;
      try {
        recorder = new MediaRecorder(audioOnlyStream, { mimeType });
      } catch (e) {
        console.warn("[CC] MediaRecorder falhou:", e);
        return;
      }
      whisperMediaRecorderRef.current = recorder;
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = async () => {
        if (!whisperIsRunningRef.current) return;
        const blob = new Blob(chunks, { type: mimeType });
        console.log("[CC] chunk:", blob.size, "bytes, mime:", mimeType);
        if (blob.size < 500) {
          console.log("[CC] chunk vazio/silêncio, pulando");
          recordChunk();
          return;
        }
        try {
          const formData = new FormData();
          formData.append("file", blob, "audio.webm");
          formData.append("model", "whisper-large-v3-turbo");
          formData.append("language", "pt");
          formData.append("response_format", "text");
          const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
            method: "POST",
            headers: { Authorization: `Bearer ${groqKey}` },
            body: formData
          });
          if (res.ok) {
            const text = (await res.text()).trim();
            console.log("[CC] transcrição:", text);
            if (text && text.length > 2) {
              setLegendaFinal(text);
              if (legendaTimeoutRef.current) clearTimeout(legendaTimeoutRef.current);
              legendaTimeoutRef.current = setTimeout(() => setLegendaFinal(""), 5e3);
            }
          } else {
            const err = await res.text().catch(() => "");
            console.warn("[CC] Groq erro", res.status, err);
          }
        } catch (err) {
          console.warn("[CC] fetch erro:", err);
        }
        if (whisperIsRunningRef.current) recordChunk();
      };
      recorder.start();
      setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, CHUNK_MS);
    };
    recordChunk();
    return () => {
      whisperIsRunningRef.current = false;
      if (whisperMediaRecorderRef.current && whisperMediaRecorderRef.current.state !== "inactive") {
        try {
          whisperMediaRecorderRef.current.stop();
        } catch {
        }
      }
      whisperMediaRecorderRef.current = null;
      setLegendaFinal("");
      if (legendaTimeoutRef.current) clearTimeout(legendaTimeoutRef.current);
    };
  }, [legendasAtivas, activePlayer, isPlaying]);
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
    const { rows: blocks } = await db.query(
      `SELECT id, ordem FROM espelho_blocos
       WHERE data_edicao = $1 AND programa ILIKE $2
       ORDER BY ordem`,
      [date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), programa || "Jornal da Manhã"]
    );
    if (blocks?.length) {
      const blocoIds = blocks.map((b) => b.id);
      const placeholders = blocoIds.map((_, idx) => `$${idx + 1}`).join(", ");
      const { rows: rawItens } = await db.query(
        `SELECT id, bloco_id, assunto, cabeca, tempo, materia_id, ordem, formato
         FROM espelho_itens
         WHERE bloco_id IN (${placeholders})`,
        blocoIds
      );
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
    const interval = setInterval(() => {
      load();
    }, 4e3);
    return () => {
      clearInterval(interval);
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
  const itemsRef = useRef(items);
  const localFilesRef = useRef(localFiles);
  const activePlayerRef = useRef(activePlayer);
  const pgmCamUrlRef = useRef(pgmCamUrl);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => {
    localFilesRef.current = localFiles;
  }, [localFiles]);
  useEffect(() => {
    activePlayerRef.current = activePlayer;
  }, [activePlayer]);
  useEffect(() => {
    pgmCamUrlRef.current = pgmCamUrl;
  }, [pgmCamUrl]);
  const getFileUrlRef = useRef(getFileUrl);
  const getFileNameRef = useRef(getFileName);
  const preloadInactivePlayerRef = useRef(preloadInactivePlayer);
  const sendPgmCamCommandRef = useRef(sendPgmCamCommand);
  useEffect(() => {
    getFileUrlRef.current = getFileUrl;
  }, [getFileUrl]);
  useEffect(() => {
    getFileNameRef.current = getFileName;
  }, [getFileName]);
  useEffect(() => {
    preloadInactivePlayerRef.current = preloadInactivePlayer;
  }, [preloadInactivePlayer]);
  useEffect(() => {
    sendPgmCamCommandRef.current = sendPgmCamCommand;
  }, [sendPgmCamCommand]);
  useEffect(() => {
    const ch = new BroadcastChannel("desknews_playout_sync");
    ch.onmessage = async (event) => {
      if (event.data?.type !== "RODA_VT") return;
      const { materiaId, assunto, itemId } = event.data?.payload ?? {};
      console.log("[Playout] RODA_VT recebido →", { materiaId, assunto, itemId });
      const currentItems = itemsRef.current;
      const targetItem = currentItems.find(
        (i) => i.id === itemId || materiaId && i.materia_id === materiaId || i.assunto === assunto
      );
      if (targetItem) {
        const idx = currentItems.findIndex((i) => i.id === targetItem.id);
        if (idx !== -1) {
          setCurrentIndex(idx);
          setCurrentItemId(targetItem.id);
        }
      }
      const currentLocalFiles = localFilesRef.current;
      const currentActivePlayer = activePlayerRef.current;
      const currentPgmCamUrl = pgmCamUrlRef.current;
      const expectedFileName = getFileNameRef.current(assunto);
      const file = currentLocalFiles.find((f) => f.name === expectedFileName);
      const url = file?.blobUrl ?? await getFileUrlRef.current(assunto);
      if (url && file) {
        if (pvwRef.current) {
          pvwRef.current.src = url;
          pvwRef.current.load();
        }
        setSelectedFile(file);
        preloadInactivePlayerRef.current(file.blobUrl, currentActivePlayer);
        if (currentPgmCamUrl) sendPgmCamCommandRef.current("stopVideo");
        const aEl = pgmARef.current;
        const bEl = pgmBRef.current;
        if (bEl) {
          bEl.pause();
          bEl.src = "";
        }
        if (aEl) {
          aEl.pause();
          aEl.oncanplay = null;
          const rodaVtAC = new AbortController();
          const startPlay = () => {
            aEl.play().then(() => {
              setPgmCamUrl(null);
              setPgmCamIsYoutube(false);
              setPgmCamMuted(false);
              setPgmCamVolume(100);
              setPgmFile(file);
              setIsPlaying(true);
              setPlayerAOpacity(1);
              setPlayerAZ(10);
              setPlayerBOpacity(0);
              setPlayerBZ(0);
              setActivePlayer("A");
              setPgmProgress(0);
              setPgmCurrentTime(0);
            }).catch(() => {
            });
          };
          const isSameSrc = aEl.src === file.blobUrl;
          if (isSameSrc && aEl.readyState >= 3) {
            aEl.currentTime = 0;
            startPlay();
          } else {
            aEl.addEventListener("canplay", () => {
              rodaVtAC.abort();
              startPlay();
            }, { once: true, signal: rodaVtAC.signal });
            aEl.src = file.blobUrl;
            aEl.load();
          }
        }
        if (pgmChannelRef.current?.readyState === 1)
          pgmChannelRef.current.send(JSON.stringify({ type: "pgm_take", fileName: file.name }));
        toast.success(`▶ AUTO-PLAY: "${assunto}"`, { duration: 3e3 });
      } else {
        console.warn("[Playout] RODA_VT: arquivo não encontrado →", assunto);
        toast.warning(`⚠ VT não encontrado na pasta: "${assunto}"`, { duration: 4e3 });
      }
      if (materiaId) {
        try {
          const [{ rows }, { rows: itemRows }] = await Promise.all([
            db.query(
              `SELECT id, titulo, editor_texto, editor_imagem, credito_reporter, estrutura, timeline_json, duracao_vt
                 FROM materias WHERE id = $1`,
              [materiaId]
            ),
            itemId ? db.query(`SELECT tempo FROM espelho_itens WHERE id = $1`, [itemId]) : Promise.resolve({ rows: [] })
          ]);
          const data = rows?.[0];
          if (data) {
            const { sonoras, passagens, producao, itensLauda: itensEstrutura } = parsarSonorasEPassagens(data.estrutura);
            setGcLine1("");
            setGcLine2("");
            setGcCreditsQueue([]);
            setGcVisible(false);
            setRemovedLaudaOrdens((prev) => {
              const n = { ...prev };
              delete n[data.id];
              return n;
            });
            let creditsList = [];
            let itensLauda = itensEstrutura;
            let timelineJsonParsed = null;
            if (data.timeline_json) {
              try {
                timelineJsonParsed = JSON.parse(data.timeline_json);
              } catch {
                timelineJsonParsed = null;
              }
            }
            if (timelineJsonParsed && timelineJsonParsed.length > 0) {
              timelineJsonRef.current = timelineJsonParsed;
              itensLauda = timelineJsonParsed.map((c, idx) => ({
                tipo: c.tipo,
                nome: c.tipo,
                valor: c.valor,
                ordem: idx
              }));
              creditsList = timelineJsonParsed.map((c) => ({
                line1: c.valor,
                line2: c.tipo.replace("ED_TEXTO", "ED. TEXTO").replace("ED_IMAGEM", "ED. IMAGEM")
              }));
              console.log("[Playout] RODA_VT: usando timeline_json da Redação →", creditsList.length, "créditos");
            } else {
              if (data.editor_texto) creditsList.push({ line1: data.editor_texto, line2: "ED. TEXTO" });
              if (data.editor_imagem) creditsList.push({ line1: data.editor_imagem, line2: "ED. IMAGEM" });
              if (data.credito_reporter) creditsList.push({ line1: data.credito_reporter, line2: "REPÓRTER" });
              let laudaOrdem = itensLauda.length;
              if (data.editor_texto && !itensLauda.some((it) => it.tipo === "ED_TEXTO"))
                itensLauda.push({ tipo: "ED_TEXTO", nome: "ED_TEXTO", valor: data.editor_texto, ordem: laudaOrdem++ });
              if (data.editor_imagem && !itensLauda.some((it) => it.tipo === "ED_IMAGEM"))
                itensLauda.push({ tipo: "ED_IMAGEM", nome: "ED_IMAGEM", valor: data.editor_imagem, ordem: laudaOrdem++ });
              if (data.credito_reporter && !itensLauda.some((it) => it.tipo === "REPÓRTER"))
                itensLauda.push({ tipo: "REPÓRTER", nome: "REPÓRTER", valor: data.credito_reporter, ordem: laudaOrdem++ });
              console.log("[Playout] RODA_VT: timeline_json ausente, usando campos da matéria →", creditsList.length, "créditos");
            }
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
              itensLauda,
              _estrutura: data.estrutura
            });
            console.log("[Playout] RODA_VT: lauda carregada →", data.titulo);
            if (timelineJsonParsed && timelineJsonParsed.length > 0) {
              const map = /* @__PURE__ */ new Map();
              const tl = [];
              timelineJsonParsed.forEach((c) => {
                const key = `${c.valor}|${c.tipo.replace("ED_TEXTO", "ED. TEXTO").replace("ED_IMAGEM", "ED. IMAGEM")}`;
                map.set(key, { inicio: c.timecode, duracao: c.duracao ?? 5 });
                tl.push({ nome: c.valor, funcao: c.tipo.replace("ED_TEXTO", "ED. TEXTO").replace("ED_IMAGEM", "ED. IMAGEM"), timecodeInicio: c.timecode, duracao: c.duracao ?? 5 });
              });
              laudaSnapshotRef.current = itensLauda;
              sonorasSnapshotRef.current = sonoras;
              estruturaSnapshotRef.current = data.estrutura;
              sonorasMapRef.current = map;
              sonorasDisparadosRef.current.clear();
              setSonorasTimeline(tl);
              console.log(`[Playout] RODA_VT: ${tl.length} timecode(s) do timeline_json aplicados diretamente`);
            } else if (data.estrutura && itensLauda.length > 0) {
              const tempoEspelho = itemRows?.[0]?.tempo;
              let duracaoPrevia = 90;
              if (tempoEspelho) {
                const partes = tempoEspelho.split(":").map(Number);
                if (partes.length === 2) duracaoPrevia = partes[0] * 60 + partes[1];
                else if (partes.length === 1) duracaoPrevia = partes[0];
              }
              console.log(`[Playout] RODA_VT: calculando timecodes via IA (duração prevista: ${duracaoPrevia}s)`);
              laudaSnapshotRef.current = itensLauda;
              sonorasSnapshotRef.current = sonoras;
              estruturaSnapshotRef.current = data.estrutura;
              const timelineFallback = construirTimelineFallback(itensLauda, duracaoPrevia, sonoras);
              if (timelineFallback.length > 0) {
                const map = /* @__PURE__ */ new Map();
                const tl = [];
                timelineFallback.forEach((cred) => {
                  map.set(`${cred.line1}|${cred.line2}`, { inicio: cred.inicio, duracao: cred.duracao });
                  tl.push({ nome: cred.line1, funcao: cred.line2, timecodeInicio: cred.inicio, duracao: cred.duracao });
                });
                sonorasMapRef.current = map;
                sonorasDisparadosRef.current.clear();
                setSonorasTimeline(tl);
                console.log(`[Playout] RODA_VT: ${tl.length} crédito(s) posicionados (fallback) com ${duracaoPrevia}s`);
              }
              calcularTimecodesViaIA(data.estrutura, itensLauda, duracaoPrevia, sonoras).then((creditosIA) => {
                if (creditosIA.length === 0) return;
                const map = /* @__PURE__ */ new Map();
                const tl = [];
                creditosIA.forEach((cred) => {
                  map.set(`${cred.line1}|${cred.line2}`, { inicio: cred.inicio, duracao: cred.duracao });
                  tl.push({ nome: cred.line1, funcao: cred.line2, timecodeInicio: cred.inicio, duracao: cred.duracao });
                });
                sonorasMapRef.current = map;
                setSonorasTimeline(tl);
                console.log(`[Playout] RODA_VT: ${tl.length} timecode(s) calculado(s) pela IA (${duracaoPrevia}s)`);
                toast.success(`⏱ ${creditosIA.length} crédito(s) posicionados pela IA`, { duration: 2500 });
              }).catch((err) => console.warn("[Playout] RODA_VT: IA de timecodes falhou:", err));
            }
            if (data.estrutura) {
              extractCredits(data.estrutura, data.editor_texto || void 0, data.credito_reporter || void 0).then((autoCredits) => {
                if (autoCredits.length === 0) return;
                setGcCreditsQueue((prev) => {
                  const existing = new Set(prev.map((c) => c.line1.toUpperCase()));
                  const novos = autoCredits.filter((c) => !existing.has(c.line1.toUpperCase()));
                  if (novos.length === 0) return prev;
                  const novaFila = [...prev, ...novos];
                  if (prev.length === 0 && novaFila.length > 0) {
                    setGcLine1(novaFila[0].line1);
                    setGcLine2(novaFila[0].line2);
                  }
                  return novaFila;
                });
                toast.success(`+${autoCredits.length} créditos sugeridos pela IA`);
              }).catch((err) => console.error("[Playout] Groq auto-credits erro:", err));
            }
          }
        } catch (err) {
          console.error("[Playout] RODA_VT: erro ao carregar lauda →", err);
        }
      }
    };
    return () => {
      ch.close();
    };
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
      const { rows: materiaRows } = await db.query(
        `SELECT id, titulo, editor_texto, editor_imagem, credito_reporter, estrutura, timeline_json, duracao_vt
         FROM materias WHERE id = $1`,
        [item.materia_id]
      );
      const data = materiaRows?.[0];
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
      let creditsList = [];
      let timelineJsonParsed = null;
      if (data.timeline_json) {
        try {
          timelineJsonParsed = JSON.parse(data.timeline_json);
        } catch {
          timelineJsonParsed = null;
        }
      }
      if (timelineJsonParsed && timelineJsonParsed.length > 0) {
        timelineJsonRef.current = timelineJsonParsed;
        itensLauda.length = 0;
        timelineJsonParsed.forEach((c, idx) => {
          itensLauda.push({ tipo: c.tipo, nome: c.tipo, valor: c.valor, ordem: idx });
        });
        creditsList = timelineJsonParsed.map((c) => ({
          line1: c.valor,
          line2: c.tipo.replace("ED_TEXTO", "ED. TEXTO").replace("ED_IMAGEM", "ED. IMAGEM")
        }));
        console.log("[Playout] Drag: usando timeline_json da Redação →", creditsList.length, "créditos");
      } else {
        timelineJsonRef.current = null;
        if (data.editor_texto) creditsList.push({ line1: data.editor_texto, line2: "ED. TEXTO" });
        if (data.editor_imagem) creditsList.push({ line1: data.editor_imagem, line2: "ED. IMAGEM" });
        if (data.credito_reporter) creditsList.push({ line1: data.credito_reporter, line2: "REPÓRTER" });
        let laudaOrdem = itensLauda.length;
        creditsList.forEach((cred) => {
          itensLauda.push({ tipo: cred.line2.replace("ED. ", "ED_"), nome: cred.line2, valor: cred.line1, ordem: laudaOrdem++ });
        });
        console.log("[Playout] Drag: timeline_json ausente, usando campos da matéria →", creditsList.length, "créditos");
      }
      console.log("📋 Créditos carregados:", creditsList);
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
        itensLauda,
        _estrutura: data.estrutura
      });
      console.log("✅ LAUDA carregada com", itensLauda.length, "itens");
      if (data.estrutura) {
        extractCredits(data.estrutura, data.editor_texto || void 0, data.credito_reporter || void 0).then((autoCredits) => {
          if (autoCredits.length === 0) return;
          setGcCreditsQueue((prev) => {
            const existing = new Set(prev.map((c) => c.line1.toUpperCase()));
            const novos = autoCredits.filter((c) => !existing.has(c.line1.toUpperCase()));
            if (novos.length === 0) return prev;
            const novaFila = [...prev, ...novos];
            if (prev.length === 0 && novaFila.length > 0) {
              setGcLine1(novaFila[0].line1);
              setGcLine2(novaFila[0].line2);
            }
            return novaFila;
          });
          toast.success(`+${autoCredits.length} créditos sugeridos pela IA`);
        }).catch((err) => console.error("[Playout] Groq auto-credits erro:", err));
      }
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
    const aEl = pgmARef.current;
    const bEl = pgmBRef.current;
    const fileToPlay = selectedFile;
    if (!aEl) return;
    if (bEl) {
      bEl.pause();
      bEl.src = "";
    }
    aEl.pause();
    aEl.oncanplay = null;
    const canplayAC = new AbortController();
    const startPlay = () => {
      aEl.play().then(() => {
        setPgmFile(fileToPlay);
        setIsPlaying(true);
        setPgmCamUrl(null);
        setPgmCamIsYoutube(false);
        setPgmCamMuted(false);
        setPgmCamVolume(100);
        setPlayerAOpacity(1);
        setPlayerAZ(10);
        setPlayerBOpacity(0);
        setPlayerBZ(0);
        setActivePlayer("A");
        setPgmProgress(0);
        setPgmCurrentTime(0);
        if (progressBarRef.current) progressBarRef.current.style.width = "0%";
        if (progressTimeRef.current) progressTimeRef.current.textContent = "0:00";
      }).catch((err) => {
        console.error("Erro ao dar play no PGM:", err);
        toast.error("Erro ao reproduzir vídeo");
      });
    };
    if (pgmCamUrl) sendPgmCamCommand("stopVideo");
    const isSameSrc = aEl.src === fileToPlay.blobUrl;
    if (isSameSrc && aEl.readyState >= 3) {
      aEl.currentTime = 0;
      startPlay();
    } else {
      aEl.addEventListener("canplay", () => {
        canplayAC.abort();
        startPlay();
      }, { once: true, signal: canplayAC.signal });
      aEl.src = fileToPlay.blobUrl;
      aEl.load();
    }
    if (pgmChannelRef.current?.readyState === 1)
      pgmChannelRef.current.send(JSON.stringify({ type: "pgm_take", fileName: fileToPlay.name }));
    toast.success(`"${fileToPlay.name}" enviado para o ar!`);
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
  const removerItemDaLaudaPorNome = useCallback((nome) => {
    setMateriaAtual((prev) => {
      if (!prev) return null;
      const nomeLower = nome.trim().toUpperCase();
      const novaLauda = prev.itensLauda.filter((it) => {
        const sepIdx = it.valor?.indexOf(" - ") ?? -1;
        const itemNome = sepIdx >= 0 ? it.valor.slice(0, sepIdx).trim().toUpperCase() : (it.valor || "").trim().toUpperCase();
        return itemNome !== nomeLower;
      });
      if (novaLauda.length === prev.itensLauda.length) return prev;
      return { ...prev, itensLauda: novaLauda };
    });
  }, []);
  const removerItemDaLaudaPorNomeRef = useRef(removerItemDaLaudaPorNome);
  useEffect(() => {
    removerItemDaLaudaPorNomeRef.current = removerItemDaLaudaPorNome;
  }, [removerItemDaLaudaPorNome]);
  const handleGcTake = useCallback(
    (nome, funcao, autoDuration) => {
      setGcLine1(nome.toUpperCase());
      setGcLine2(funcao.toUpperCase());
      setGcVisible(true);
      removerItemDaLaudaPorNomeRef.current(nome);
      if (autoDuration && autoDuration > 0) {
        setGcDuration(autoDuration);
        console.log(`✅ GC: "${nome}" por ${autoDuration}s`);
        setTimeout(() => {
          setGcVisible(false);
        }, autoDuration * 1e3);
      } else {
        setGcDuration(0);
      }
      setGcHistory((prev) => [...prev, { line1: nome, line2: funcao }]);
    },
    []
    // deps vazio — usa refs para tudo que muda
  );
  const handleGcTakeQueue = () => {
    setGcVisible(true);
    pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({ type: "gc_show", line1: gcLine1, line2: gcLine2 }));
    if (gcLine1) removerItemDaLaudaPorNome(gcLine1);
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
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => setLegendasAtivas((v) => !v),
                    title: legendasAtivas ? "Desligar legendas" : "Ligar legendas — teleprompter sincronizado com a lauda",
                    className: "flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest transition-all",
                    style: {
                      backgroundColor: legendasAtivas ? ccTextoAtual ? "#00E67630" : "#1a3a1a" : "#252525",
                      borderColor: legendasAtivas ? ccTextoAtual ? "#00E676" : "#00E67440" : "#3a3a3a",
                      color: legendasAtivas ? "#00E676" : "#52525b"
                    },
                    children: [
                      legendasAtivas ? /* @__PURE__ */ jsx("span", { className: `h-1.5 w-1.5 rounded-full animate-pulse inline-block mr-0.5 ${ccTextoAtual ? "bg-emerald-400" : "bg-emerald-700"}` }) : null,
                      "CC",
                      legendasAtivas && /* @__PURE__ */ jsx("span", { className: "text-[7px] opacity-60 ml-0.5", children: ccTextoAtual ? "AO VIVO" : "LAUDA" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "text-[9px] font-mono text-zinc-600 truncate max-w-[120px]", children: pgmFile ? pgmFile.name.replace(".mp4", "") : "IDLE" })
              ] })
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
                        if (activePlayer !== "A") return;
                        const el = e.currentTarget;
                        const t = el.currentTime;
                        const d = el.duration;
                        setPgmCurrentTime(t);
                        if (d) setPgmProgress(t / d * 100);
                        if (progressBarRef.current) progressBarRef.current.style.width = d ? `${t / d * 100}%` : "0%";
                        if (progressTimeRef.current) progressTimeRef.current.textContent = formatDuration(t);
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
                        const t = el.currentTime;
                        const d = el.duration;
                        setPgmCurrentTime(t);
                        if (d) setPgmProgress(t / d * 100);
                        if (progressBarRef.current) progressBarRef.current.style.width = d ? `${t / d * 100}%` : "0%";
                        if (progressTimeRef.current) progressTimeRef.current.textContent = formatDuration(t);
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
                  legendasAtivas && /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none",
                      style: { zIndex: 45 },
                      children: ccTextoAtual ? /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: "w-full text-center px-4 py-2",
                          style: {
                            backgroundColor: "rgba(0,0,0,0.92)",
                            borderBottom: "3px solid #00E676",
                            borderTop: "1px solid rgba(0,230,118,0.2)"
                          },
                          children: /* @__PURE__ */ jsx(
                            "span",
                            {
                              className: "text-white font-bold leading-snug block",
                              style: { fontSize: "14px", letterSpacing: "0.02em", textShadow: "0 1px 4px rgba(0,0,0,0.9)" },
                              children: ccTextoAtual
                            }
                          )
                        }
                      ) : /* @__PURE__ */ jsxs(
                        "div",
                        {
                          className: "px-4 py-1.5 flex items-center gap-2",
                          style: {
                            backgroundColor: "rgba(0,18,6,0.93)",
                            borderBottom: "3px solid #00E676",
                            borderTop: "1px solid rgba(0,230,118,0.2)",
                            width: "100%",
                            justifyContent: "center"
                          },
                          children: [
                            /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-400 animate-pulse inline-block shrink-0" }),
                            /* @__PURE__ */ jsx(
                              "span",
                              {
                                className: "font-bold uppercase",
                                style: { color: "#00E676", fontSize: "12px", letterSpacing: "0.14em" },
                                children: "CC — AGUARDANDO ÁUDIO..."
                              }
                            )
                          ]
                        }
                      )
                    }
                  ),
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
            /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-0.5 mt-1.5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-[3px] text-[8px] font-mono font-bold text-zinc-600", children: [
                /* @__PURE__ */ jsx("span", { children: "L" }),
                /* @__PURE__ */ jsx("span", { children: "R" })
              ] }),
              /* @__PURE__ */ jsx(
                "canvas",
                {
                  ref: vuCanvasRef,
                  width: 200,
                  height: 16,
                  className: "flex-1 rounded-sm",
                  style: { imageRendering: "pixelated", height: "16px", width: "100%" }
                }
              )
            ] }) })
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
              /* @__PURE__ */ jsx("span", { ref: progressTimeRef, className: "text-[9px] font-mono text-zinc-600 w-8 text-right tabular-nums", children: formatDuration(pgmCurrentTime) }),
              /* @__PURE__ */ jsx("div", { className: "flex-1 h-1.5 bg-zinc-800 rounded-full cursor-pointer relative overflow-hidden group", onClick: handleSeek, children: /* @__PURE__ */ jsx("div", { ref: progressBarRef, className: "h-full rounded-full transition-none relative", style: { width: `${pgmProgress}%`, backgroundColor: "#ef4444" }, children: /* @__PURE__ */ jsx("div", { className: "absolute right-0 top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-white rounded-full -mr-1 opacity-0 group-hover:opacity-100 transition-opacity shadow" }) }) }),
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
          materiaAtual && sonorasTimeline.length > 0 && pgmFile?.duration && /* @__PURE__ */ jsxs("div", { className: "border rounded-xl p-3 flex flex-col gap-2 mt-0", style: { backgroundColor: "#1a1a1a", borderColor: "#2a2a2a" }, children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-1 border-b", style: { borderColor: "#2a2a2a" }, children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest", style: { color: "#00E676" }, children: "⏱ TIMELINE VT" }),
              /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-mono text-zinc-600", children: [
                formatarTimecode(Math.round(pgmCurrentTime)),
                " / ",
                formatarTimecode(Math.round(pgmFile.duration))
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative h-5 rounded-full overflow-hidden", style: { backgroundColor: "#0a0a0a", border: "1px solid #2a2a2a" }, children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "absolute inset-y-0 left-0 rounded-full transition-none",
                  style: {
                    width: `${pgmCurrentTime / pgmFile.duration * 100}%`,
                    backgroundColor: isPlaying ? "#ef4444" : "#3f3f46"
                  }
                }
              ),
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "absolute top-0 bottom-0 w-0.5",
                  style: {
                    left: `${pgmCurrentTime / pgmFile.duration * 100}%`,
                    backgroundColor: "#ffffff",
                    boxShadow: "0 0 4px rgba(255,255,255,0.8)"
                  }
                }
              ),
              sonorasTimeline.map((cr, idx) => {
                const pct = Math.min(99, cr.timecodeInicio / pgmFile.duration * 100);
                const jaPAssou = pgmCurrentTime >= cr.timecodeInicio;
                return /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "absolute top-0 bottom-0 w-0.5 transition-colors",
                    style: {
                      left: `${pct}%`,
                      backgroundColor: jaPAssou ? "#22c55e" : "#facc15",
                      opacity: jaPAssou ? 0.5 : 1
                    },
                    title: `${cr.nome} (${cr.funcao}) — ${formatarTimecode(cr.timecodeInicio)}`
                  },
                  idx
                );
              })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-1 max-h-28 overflow-y-auto", children: sonorasTimeline.map((cr, idx) => {
              const jaPassou = pgmCurrentTime >= cr.timecodeInicio + cr.duracao;
              const ativo = pgmCurrentTime >= cr.timecodeInicio && pgmCurrentTime < cr.timecodeInicio + cr.duracao;
              const proximo = !jaPassou && !ativo && sonorasTimeline.findIndex((c) => !(pgmCurrentTime >= c.timecodeInicio + c.duracao)) === idx;
              return /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "flex items-center gap-2 px-2 py-1 rounded-lg transition-all",
                  style: {
                    backgroundColor: ativo ? "#00E67615" : jaPassou ? "#1a1a1a" : "#252525",
                    border: `1px solid ${ativo ? "#00E676" : jaPassou ? "#2a2a2a" : proximo ? "#facc1550" : "#2a2a2a"}`
                  },
                  children: [
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "h-1.5 w-1.5 rounded-full shrink-0",
                        style: { backgroundColor: ativo ? "#00E676" : jaPassou ? "#3f3f46" : "#facc15" }
                      }
                    ),
                    /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                      /* @__PURE__ */ jsx("div", { className: "text-[9px] font-bold text-white truncate", children: cr.nome }),
                      /* @__PURE__ */ jsx("div", { className: "text-[8px] text-zinc-500 truncate", children: cr.funcao })
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: "text-[8px] font-mono shrink-0", style: { color: ativo ? "#00E676" : "#52525b" }, children: formatarTimecode(cr.timecodeInicio) }),
                    ativo && /* @__PURE__ */ jsx("span", { className: "text-[7px] font-black uppercase tracking-widest animate-pulse shrink-0", style: { color: "#00E676" }, children: "NO AR" }),
                    jaPassou && /* @__PURE__ */ jsx("span", { className: "text-[7px] font-bold uppercase tracking-widest shrink-0 text-zinc-600", children: "✓" })
                  ]
                },
                idx
              );
            }) })
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
                    onClick: handleGcTakeQueue,
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
                ),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => setGcPanelOpen(true),
                    className: "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-widest transition-all active:scale-[0.98]",
                    style: { backgroundColor: "#7c3aed20", borderColor: "#7c3aed40", color: "#c084fc" },
                    children: [
                      /* @__PURE__ */ jsx(Sliders, { className: "h-3 w-3" }),
                      "Personalizar"
                    ]
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
    ),
    gcPanelOpen && /* @__PURE__ */ jsx(
      GcPanel,
      {
        open: gcPanelOpen,
        onClose: () => setGcPanelOpen(false),
        gcLine1,
        setGcLine1,
        gcLine2,
        setGcLine2,
        gcDuration,
        setGcDuration,
        gcVisible,
        setGcVisible,
        gcCreditsQueue,
        setGcCreditsQueue,
        onTake: handleGcTakeQueue,
        onClear: handleGcClear,
        onSkip: handleGcSkip
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
      const { data, error } = await db.auth.getUser();
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
      const { data, error } = await db.rpc("check_user_permission", {
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
    let query = db.from("pautas").select("*").order("data_pauta", { ascending: false, nullsFirst: false }).limit(200);
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
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              className: "w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all duration-200 pl-10 font-mono text-sm",
              placeholder: "Retranca, produtor...",
              value: q,
              onChange: (e) => setQ(e.target.value),
              onKeyDown: (e) => e.key === "Enter" && search()
            }
          )
        ] }),
        /* @__PURE__ */ jsx(DateField, { label: "De", value: from, onChange: setFrom }),
        /* @__PURE__ */ jsx(DateField, { label: "Até", value: to, onChange: setTo }),
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: search,
            disabled: loading,
            className: "px-6 py-3 rounded-md text-white bg-[#22c55e]/10 border border-[#22c55e] hover:bg-[#22c55e]/20 font-mono text-xs uppercase font-bold tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-[#22c55e]/20 active:scale-95",
            children: loading ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Search, { className: "h-4 w-4" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg overflow-hidden backdrop-blur-lg shadow-2xl", children: [
      results.length === 0 && !loading && /* @__PURE__ */ jsx("div", { className: "p-12 text-center text-xs text-slate-500 font-mono", children: "SEM RESULTADOS" }),
      /* @__PURE__ */ jsxs("div", { className: "divide-y divide-[#22c55e]/10 overflow-y-auto max-h-[calc(100vh-18rem)]", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 bg-[#0a0e27] text-xs text-slate-500 font-mono uppercase tracking-widest border-b border-[#22c55e]/10", children: [
          results.length,
          " REGISTRO(S)"
        ] }),
        results.map((p) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "p-4 flex items-center justify-between gap-4 hover:bg-[#1a1a21] transition-all cursor-pointer border-l-2 border-l-transparent hover:border-l-[#22c55e]",
            onClick: () => setSelected(p),
            children: [
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
            ]
          },
          p.id
        ))
      ] })
    ] }),
    selected && /* @__PURE__ */ jsx(PreviewModal, { pauta: selected, onClose: () => setSelected(null) })
  ] });
}
function DateField({ label, value, onChange }) {
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
function PreviewModal({ pauta, onClose }) {
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
const fetchPortais = createServerFn({
  method: "GET"
}).handler(createSsrRpc("dafc0fb272624072473a05a2711d169e092bd7f206b135db7baec57591afd2ae"));
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
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#09090b] text-white p-4 sm:p-6 space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "border-b border-[#22c55e]/20 pb-4 mb-1", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono uppercase tracking-[0.2em] text-[#22c55e] mb-1", children: "Gestão de Conteúdo" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-10 w-10 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/40", children: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5 text-[#22c55e]" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-mono", children: "Pautas" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("nav", { className: "flex gap-1 overflow-x-auto border-b border-[#141416] -mx-1 px-1", children: tabs.map(({ k, label, icon: Icon }) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => {
          setTab(k);
          if (k !== "form") setPautaToEdit(null);
        },
        className: cn(
          "px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium uppercase tracking-wider border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5",
          tab === k ? "border-[#22c55e] text-[#22c55e] bg-[#22c55e]/5" : "border-transparent text-[#9ca3af] hover:text-[#22c55e] hover:bg-[#22c55e]/5"
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
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(/* @__PURE__ */ new Date()));
  const [cards, setCards] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = useCallback(async () => {
    const { data, error } = await db.from("quadro_cards").select("*").eq("semana_inicio", ymd(weekStart)).order("ordem", { ascending: true });
    if (error) toast.error(error.message);
    else setCards(data ?? []);
  }, [weekStart]);
  useEffect(() => {
    load();
  }, [load]);
  const remove = async (id) => {
    if (!window.confirm("Remover este card?")) return;
    const { error } = await db.from("quadro_cards").delete().eq("id", id);
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
      /* @__PURE__ */ jsxs("div", { className: "text-sm font-mono text-[#9ca3af]", children: [
        "Semana de ",
        /* @__PURE__ */ jsx("strong", { className: "text-white", children: weekStart.toLocaleDateString("pt-BR") })
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => navWeek(1), children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setWeekStart(startOfWeek(/* @__PURE__ */ new Date())), children: "Hoje" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "hidden md:grid grid-cols-[120px_1fr_1fr] gap-2", children: [
      /* @__PURE__ */ jsx("div", {}),
      /* @__PURE__ */ jsx("div", { className: "text-center text-[10px] uppercase tracking-[0.2em] text-[#22c55e] font-bold py-2 border-b border-[#22c55e]/20", children: "Manhã" }),
      /* @__PURE__ */ jsx("div", { className: "text-center text-[10px] uppercase tracking-[0.2em] text-[#22c55e] font-bold py-2 border-b border-[#22c55e]/20", children: "Tarde" }),
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
    /* @__PURE__ */ jsx("div", { className: "md:hidden space-y-3", children: DIAS.map((dia, i) => /* @__PURE__ */ jsxs("div", { className: "rounded border border-[#22c55e]/20 bg-[#141416] p-3 border-l-4 border-l-[#22c55e]", children: [
      /* @__PURE__ */ jsx("div", { className: "font-bold mb-2 uppercase text-sm tracking-wider text-white", children: dia }),
      ["manha", "tarde"].map((t) => /* @__PURE__ */ jsxs("div", { className: "mb-2", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase text-[#22c55e] tracking-widest mb-1", children: t === "manha" ? "Manhã" : "Tarde" }),
        /* @__PURE__ */ jsxs("div", { className: "rounded border border-[#22c55e]/10 bg-[#09090b] p-2 space-y-2 min-h-[80px]", children: [
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
              className: "text-xs text-[#6b7280] hover:text-[#22c55e] flex items-center gap-1 transition-colors",
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
    editing && user && /* @__PURE__ */ jsx(
      CardModal,
      {
        userId: user.id,
        weekStart: ymd(weekStart),
        dia: editing.dia,
        turno: editing.turno,
        card: editing.card,
        onClose: () => setEditing(null),
        onSaved: () => {
          setEditing(null);
          load();
        }
      }
    )
  ] });
}
function DayRow({ dia, idx, cards, onAdd, onEdit, onRemove }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center font-bold uppercase text-sm tracking-wider px-2 text-white border-l-4 border-l-[#22c55e]", children: dia }),
    ["manha", "tarde"].map((t) => /* @__PURE__ */ jsxs("div", { className: "rounded border border-[#22c55e]/20 bg-[#141416] p-2 space-y-2 min-h-[120px]", children: [
      cards.filter((c) => c.dia_semana === idx && c.turno === t).map((c) => /* @__PURE__ */ jsx(CardMini, { c, onRemove: () => onRemove(c.id), onEdit: () => onEdit(c) }, c.id)),
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: "text-xs text-[#6b7280] hover:text-[#22c55e] flex items-center gap-1 transition-colors",
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
    "group rounded border border-[#22c55e]/20 bg-[#09090b] p-3 border-l-2 border-l-[#22c55e]",
    "transition-all duration-300 hover:bg-[#141416] hover:border-[#22c55e]/40",
    "cursor-pointer"
  ), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2 min-w-0", children: [
        /* @__PURE__ */ jsx("div", { className: "font-mono uppercase font-bold text-sm tracking-wide truncate text-white", children: c.retranca }),
        c.horario && /* @__PURE__ */ jsx("span", { className: "text-[11px] text-[#22c55e] font-mono shrink-0", children: c.horario })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              onEdit();
            },
            className: "text-[#6b7280] hover:text-[#22c55e] p-1 transition-colors",
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
            className: "text-[#6b7280] hover:text-red-500 p-1 transition-colors",
            children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" })
          }
        )
      ] })
    ] }),
    c.reporter && /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-[#6b7280] truncate mt-1", children: [
      "Prod: ",
      c.reporter
    ] })
  ] });
}
function CardModal({ userId, weekStart, dia, turno, card, onClose, onSaved }) {
  const [retranca, setRetranca] = useState(card?.retranca ?? "");
  const [horario, setHorario] = useState(card?.horario ?? "");
  const [produtor, setProdutor] = useState(card?.reporter ?? "");
  const [saving, setSaving] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      semana_inicio: weekStart,
      dia_semana: dia,
      turno,
      retranca: retranca.toUpperCase(),
      horario: horario || null,
      reporter: produtor || null,
      autor_id: userId
    };
    const { error } = card ? await db.from("quadro_cards").update(payload).eq("id", card.id) : await db.from("quadro_cards").insert(payload);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success(card ? "Card atualizado" : "Card adicionado");
      onSaved();
    }
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 bg-[#141416]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50",
      onClick: onClose,
      children: /* @__PURE__ */ jsxs(
        "form",
        {
          onClick: (e) => e.stopPropagation(),
          onSubmit: submit,
          className: "rounded border border-[#22c55e]/30 bg-[#141416] p-6 w-full max-w-md space-y-3 shadow-xl border-l-4 border-l-[#22c55e]",
          children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-lg font-bold text-white", children: [
              card ? "Editar card" : "Novo card",
              " — ",
              DIAS[dia],
              " / ",
              turno === "manha" ? "Manhã" : "Tarde"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[1fr_120px] gap-3", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { children: "Retranca" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    required: true,
                    value: retranca,
                    onChange: (e) => setRetranca(e.target.value.toUpperCase()),
                    className: inputCls + " font-mono uppercase"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(Label, { children: "Horário" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: horario,
                    onChange: (e) => setHorario(e.target.value),
                    placeholder: "09:30",
                    className: inputCls + " font-mono"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "Produtor" }),
              /* @__PURE__ */ jsx("input", { value: produtor, onChange: (e) => setProdutor(e.target.value), className: inputCls })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
              /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "Cancelar" }),
              /* @__PURE__ */ jsx(Button, { type: "submit", disabled: saving, children: saving ? "..." : card ? "Salvar" : "Adicionar" })
            ] })
          ]
        }
      )
    }
  );
}
const inputCls = "w-full px-3 py-2 rounded border border-[#22c55e]/20 bg-[#09090b] text-white text-sm focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-colors";
function Label({ children }) {
  return /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1.5", children });
}
function FieldLabel({ children, required }) {
  return /* @__PURE__ */ jsxs("label", { className: "block text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1.5", children: [
    children,
    required && /* @__PURE__ */ jsx("span", { className: "text-[#22c55e] ml-0.5", children: "*" })
  ] });
}
function SectionBlock({
  icon: Icon,
  title,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-[#22c55e]/20 bg-[#141416] overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-5 py-3 border-b border-[#22c55e]/15 bg-[#22c55e]/[0.03]", children: [
      /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5 text-[#22c55e]" }),
      /* @__PURE__ */ jsx("h2", { className: "text-[10px] font-bold uppercase tracking-[0.2em] text-[#9ca3af]", children: title })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "p-5 space-y-4", children })
  ] });
}
function FormularioPauta({ initialPauta, initialDate, onEditingChange }) {
  const { user } = useAuth();
  const [date, setDate] = useState(initialDate);
  const [pautas, setPautas] = useState([]);
  const [editing, setEditing] = useState(initialPauta ?? null);
  const isToday = date.toDateString() === (/* @__PURE__ */ new Date()).toDateString();
  const load = useCallback(async () => {
    const { data, error } = await db.from("pautas").select("*").eq("data_pauta", ymd(date)).order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setPautas(data ?? []);
  }, [date]);
  useEffect(() => {
    load();
  }, [load]);
  const create = () => {
    setEditing({
      id: "",
      titulo: "",
      retranca: null,
      tipo: null,
      turno: null,
      data_pauta: ymd(date),
      reporter: null,
      imagens: null,
      produtor: null,
      horario: null,
      local: null,
      sonora: null,
      contato: null,
      proposta: null,
      encaminhamento: null,
      observacoes: null,
      status: "rascunho",
      criado_por: user?.id ?? ""
    });
    onEditingChange(null);
  };
  const remove = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Remover?")) return;
    const { error } = await db.from("pautas").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6", children: [
    /* @__PURE__ */ jsxs("aside", { className: "bg-[#141416] rounded-xl border border-[#22c55e]/15 p-4 h-fit", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3 gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-widest text-[#6b7280] font-bold", children: isToday ? "Pautas de hoje" : "Pautas do dia" }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: create, children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" }),
          " Nova"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsxs(Popover, { children: [
          /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "flex-1 justify-start font-normal", children: [
            /* @__PURE__ */ jsx(CalendarIcon, { className: "h-3.5 w-3.5 mr-2" }),
            date.toLocaleDateString("pt-BR")
          ] }) }),
          /* @__PURE__ */ jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: /* @__PURE__ */ jsx(Calendar, { mode: "single", selected: date, onSelect: (d) => d && setDate(d), className: cn("p-3 pointer-events-auto") }) })
        ] }),
        !isToday && /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => setDate(/* @__PURE__ */ new Date()), children: "Hoje" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2 max-h-[60vh] overflow-y-auto", children: [
        pautas.map((p) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setEditing(p);
              onEditingChange(p);
            },
            className: cn(
              "w-full text-left p-3 rounded-lg border text-sm transition-all",
              editing?.id === p.id ? "border-[#22c55e]/60 bg-[#22c55e]/10 text-white" : "border-[#22c55e]/10 hover:border-[#22c55e]/30 bg-[#09090b] text-[#9ca3af] hover:text-white"
            ),
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm font-bold uppercase text-white truncate", children: p.titulo || p.retranca || "(sem título)" }),
                /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wider text-[#22c55e] mt-1 font-bold", children: p.status || "rascunho" })
              ] }),
              !p.retranca && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: (e) => remove(p.id, e),
                  className: "p-1 rounded hover:bg-red-500/10 text-[#6b7280] hover:text-red-500 transition-colors shrink-0",
                  children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" })
                }
              )
            ] })
          },
          p.id
        )),
        !pautas.length && /* @__PURE__ */ jsx("div", { className: "text-xs text-[#6b7280] p-2 italic", children: "Nenhuma pauta neste dia." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("section", { children: editing ? /* @__PURE__ */ jsx(PautaForm, { initial: editing, userId: user?.id ?? "", onSaved: load }, editing.id || "new") : /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-[#22c55e]/15 bg-[#141416] p-10 text-center text-[#6b7280]", children: "Selecione uma pauta ou crie uma nova." }) })
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
      const { error } = await db.from("pautas").update(payload).eq("id", p.id);
      setSaving(false);
      if (error) toast.error(error.message);
      else {
        toast.success("Pauta salva");
        onSaved();
      }
    } else {
      const { data, error } = await db.from("pautas").insert({ ...payload, criado_por: userId }).select().single();
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
  const statusOpts = ["rascunho", "sugestao", "aprovada", "em_pauta", "arquivada"];
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-[#22c55e]/20 bg-[#141416] overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "px-5 py-3 border-b border-[#22c55e]/15", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] font-bold uppercase tracking-[0.2em] text-[#22c55e]", children: p.id ? "Editar Pauta" : "Nova Pauta" }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-[#6b7280] mt-0.5", children: "Preencha as informações da nova pauta" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "px-5 py-4 flex items-center justify-between gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
          /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-[#22c55e] shrink-0" }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-widest text-[#6b7280]", children: "Salvo localmente" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
          /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: gerarPDF, children: [
            /* @__PURE__ */ jsx(Printer, { className: "h-3.5 w-3.5" }),
            " PDF"
          ] }),
          /* @__PURE__ */ jsx(Button, { size: "sm", onClick: save, disabled: saving, children: saving ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }),
            " Salvando…"
          ] }) : "Salvar Pauta" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-[#22c55e]/20 bg-[#141416] px-5 py-4", children: /* @__PURE__ */ jsx(
      "input",
      {
        className: "w-full bg-transparent text-xl sm:text-2xl font-bold uppercase text-white placeholder:text-[#3f3f46] focus:outline-none tracking-wide",
        value: p.retranca ?? "",
        onChange: (e) => set("retranca", e.target.value.toUpperCase()),
        placeholder: "RETRANCA / TÍTULO DA PAUTA…"
      }
    ) }),
    /* @__PURE__ */ jsx(SectionBlock, { icon: FileText, title: "Informações Básicas", children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(FieldLabel, { required: true, children: "Título" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: inputCls,
            value: p.titulo ?? "",
            onChange: (e) => set("titulo", e.target.value),
            placeholder: "Ex: Reportagem sobre obras na BR-101"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(FieldLabel, { children: "Retranca" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: inputCls + " font-mono uppercase",
              value: p.retranca ?? "",
              onChange: (e) => set("retranca", e.target.value.toUpperCase()),
              placeholder: "Ex: OBRAS-BR101"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(FieldLabel, { children: "Tipo" }),
          /* @__PURE__ */ jsxs("select", { className: inputCls, value: p.tipo ?? "", onChange: (e) => set("tipo", e.target.value || null), children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Selecione" }),
            TIPOS.map((t) => /* @__PURE__ */ jsx("option", { children: t }, t))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(FieldLabel, { children: "Turno" }),
          /* @__PURE__ */ jsxs("select", { className: inputCls, value: p.turno ?? "", onChange: (e) => set("turno", e.target.value || null), children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Selecione" }),
            TURNOS.map((t) => /* @__PURE__ */ jsx("option", { children: t }, t))
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(SectionBlock, { icon: CalendarIcon, title: "Data e Horário", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(FieldLabel, { children: "Data" }),
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
        /* @__PURE__ */ jsx(FieldLabel, { children: "Horário" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: inputCls + " font-mono",
            value: p.horario ?? "",
            onChange: (e) => set("horario", e.target.value || null),
            placeholder: "09:30"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(FieldLabel, { children: "Status" }),
        /* @__PURE__ */ jsx("select", { className: inputCls, value: p.status, onChange: (e) => set("status", e.target.value), children: statusOpts.map((s) => /* @__PURE__ */ jsx("option", { value: s, children: s }, s)) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(SectionBlock, { icon: Users, title: "Equipe", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(FieldLabel, { children: "Repórter / Jornalista" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: inputCls,
            value: p.reporter ?? "",
            onChange: (e) => set("reporter", e.target.value || null),
            placeholder: "Nome do repórter"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(FieldLabel, { children: "Produtor" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: inputCls,
            value: p.produtor ?? "",
            onChange: (e) => set("produtor", e.target.value || null),
            placeholder: "Nome do produtor"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(SectionBlock, { icon: MapPin, title: "Localização", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(FieldLabel, { children: "Local / Endereço" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          className: inputCls,
          value: p.local ?? "",
          onChange: (e) => set("local", e.target.value || null),
          placeholder: "Ex: Rua das Flores, 200 — Centro"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx(SectionBlock, { icon: StickyNote, title: "Proposta", children: /* @__PURE__ */ jsx(
      "textarea",
      {
        value: p.proposta ?? "",
        onChange: (e) => set("proposta", e.target.value || null),
        className: inputCls + " resize-none h-24",
        placeholder: "Breve descrição da proposta de pauta..."
      }
    ) }),
    /* @__PURE__ */ jsx(SectionBlock, { icon: Radio, title: "Fontes / Sonoras", children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      fontes.map((f, idx) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-[#22c55e]/15 bg-[#09090b] p-4 space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-[10px] uppercase tracking-widest text-[#22c55e] font-bold", children: [
            "Fonte ",
            idx + 1
          ] }),
          fontes.length > 1 && /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => handleRemoveFonte(f.id),
              className: "text-[10px] text-red-500/70 hover:text-red-500 flex items-center gap-1 transition-colors",
              children: [
                /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }),
                " Remover"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(FieldLabel, { children: "Sonora / Link" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: f.sonora,
                onChange: (e) => handleUpdateFonte(f.id, "sonora", e.target.value),
                className: inputCls,
                placeholder: "Descrição ou URL"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(FieldLabel, { children: "Contato" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: f.contato,
                onChange: (e) => handleUpdateFonte(f.id, "contato", e.target.value),
                className: inputCls,
                placeholder: "Tel / e-mail"
              }
            )
          ] })
        ] })
      ] }, f.id)),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: handleAddFonte,
          className: "text-xs text-[#22c55e] hover:text-[#22c55e]/80 flex items-center gap-1.5 transition-colors",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }),
            " Adicionar fonte"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx(SectionBlock, { icon: Route$d, title: "Encaminhamento", children: /* @__PURE__ */ jsx(
      "textarea",
      {
        value: p.encaminhamento ?? "",
        onChange: (e) => set("encaminhamento", e.target.value || null),
        className: inputCls + " resize-none h-20",
        placeholder: "Instruções para execução da pauta..."
      }
    ) }),
    /* @__PURE__ */ jsx(SectionBlock, { icon: StickyNote, title: "Observações", children: /* @__PURE__ */ jsx(
      "textarea",
      {
        value: p.observacoes ?? "",
        onChange: (e) => set("observacoes", e.target.value || null),
        className: inputCls + " resize-none h-20",
        placeholder: "Notas adicionais..."
      }
    ) }),
    /* @__PURE__ */ jsx(SectionBlock, { icon: Image, title: "Mídia", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(FieldLabel, { children: "URLs de Imagens / Documentos" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          value: p.imagens ?? "",
          onChange: (e) => set("imagens", e.target.value || null),
          className: inputCls + " resize-none h-16 font-mono text-xs",
          placeholder: "Uma URL por linha"
        }
      )
    ] }) })
  ] });
}
function SearchPautas({ onEdit }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const search = async () => {
    if (!q.trim()) return;
    setLoading(true);
    const { data, error } = await db.from("pautas").select("*").or(`retranca.ilike.%${q}%,titulo.ilike.%${q}%`).order("created_at", { ascending: false }).limit(50);
    setLoading(false);
    if (error) toast.error(error.message);
    else setResults(data ?? []);
  };
  useEffect(() => {
    const timer = setTimeout(search, 500);
    return () => clearTimeout(timer);
  }, [q]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded border border-[#22c55e]/20 bg-[#141416] p-5 border-l-4 border-l-[#22c55e]", children: [
      /* @__PURE__ */ jsx(Label, { children: "Pesquisar Pautas" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          value: q,
          onChange: (e) => setQ(e.target.value),
          placeholder: "Retranca ou título...",
          className: inputCls
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "text-xs text-[#6b7280] mt-2", children: [
        loading && "Buscando...",
        !loading && q && `${results.length} resultado${results.length !== 1 ? "s" : ""}`
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-2", children: results.map((p) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => onEdit(p),
        className: "w-full text-left rounded border border-[#22c55e]/20 bg-[#141416] p-4 hover:bg-[#22c55e]/5 transition-colors border-l-4 border-l-[#22c55e] group",
        children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("div", { className: "font-mono uppercase text-xs text-[#22c55e] font-bold", children: p.retranca || "(sem retranca)" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-white mt-1", children: p.titulo }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-[#6b7280] mt-1", children: [
              p.data_pauta && (/* @__PURE__ */ new Date(p.data_pauta + "T00:00:00")).toLocaleDateString("pt-BR"),
              " · ",
              p.reporter || "—"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-[#22c55e]", children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) })
        ] })
      },
      p.id
    )) })
  ] });
}
function AvisosPanel() {
  const { user } = useAuth();
  const [avisos, setAvisos] = useState([]);
  const [newAssunto, setNewAssunto] = useState("");
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    const { data, error } = await db.from("avisos").select("*").order("data", { ascending: false });
    if (error) toast.error(error.message);
    else setAvisos(data ?? []);
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const add = async () => {
    if (!newAssunto.trim() || !user) return;
    setSaving(true);
    const { error } = await db.from("avisos").insert({
      assunto: newAssunto,
      data: ymd(/* @__PURE__ */ new Date()),
      autor_id: user.id
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      setNewAssunto("");
      load();
    }
  };
  const remove = async (id) => {
    const { error } = await db.from("avisos").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded border border-[#22c55e]/20 bg-[#141416] p-5 border-l-4 border-l-[#22c55e]", children: [
      /* @__PURE__ */ jsx(Label, { children: "Novo Aviso" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            value: newAssunto,
            onChange: (e) => setNewAssunto(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") add();
            },
            placeholder: "Assunto do aviso...",
            className: inputCls
          }
        ),
        /* @__PURE__ */ jsx(Button, { onClick: add, disabled: saving || !newAssunto.trim(), children: saving ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-2", children: avisos.map((a) => /* @__PURE__ */ jsxs("div", { className: "rounded border border-[#22c55e]/20 bg-[#141416] p-4 flex items-start justify-between gap-2 border-l-4 border-l-[#22c55e] group", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium text-white", children: a.assunto }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-[#6b7280] mt-1", children: (/* @__PURE__ */ new Date(a.data + "T00:00:00")).toLocaleDateString("pt-BR") })
      ] }),
      user?.id === a.autor_id && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => remove(a.id),
          className: "opacity-0 group-hover:opacity-100 text-[#6b7280] hover:text-red-500 transition-all p-1",
          children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
        }
      )
    ] }, a.id)) })
  ] });
}
function GavetaVTs() {
  const { user } = useAuth();
  const [vts, setVts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterPrograma, setFilterPrograma] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await db.from("vt_gaveta").select("*").order("data_pronto", { ascending: false });
    setLoading(false);
    if (error) toast.error(error.message);
    else setVts(data ?? []);
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const remove = async (id) => {
    if (!window.confirm("Remover?")) return;
    const { error } = await db.from("vt_gaveta").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };
  const startEdit = (v) => {
    setEditingItem(v);
    setPreviewItem(null);
  };
  const filtered = filterPrograma ? vts.filter((v) => v.programa === filterPrograma) : vts;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded border border-[#22c55e]/20 bg-[#141416] p-5 border-l-4 border-l-[#22c55e]", children: [
      /* @__PURE__ */ jsx(Label, { children: "Filtrar por Programa" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 mt-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setFilterPrograma(null),
            className: cn(
              "px-3 py-1 rounded text-xs font-medium uppercase tracking-wider transition-colors",
              !filterPrograma ? "bg-[#22c55e] text-black" : "border border-[#22c55e]/20 text-[#9ca3af] hover:text-[#22c55e]"
            ),
            children: "Todos"
          }
        ),
        PROGRAMAS_VT.map((p) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setFilterPrograma(p),
            className: cn(
              "px-3 py-1 rounded text-xs font-medium uppercase tracking-wider transition-colors",
              filterPrograma === p ? "bg-[#22c55e] text-black" : "border border-[#22c55e]/20 text-[#9ca3af] hover:text-[#22c55e]"
            ),
            children: p
          },
          p
        ))
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-xs text-[#6b7280] mt-3", children: loading ? "Carregando…" : `${filtered.length} VT${filtered.length !== 1 ? "s" : ""}` })
    ] }),
    editingItem && /* @__PURE__ */ jsx(VtEditModal, { item: editingItem, onClose: () => setEditingItem(null), onSaved: () => {
      setEditingItem(null);
      load();
    } }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      filtered.map((v) => /* @__PURE__ */ jsx(
        "div",
        {
          onClick: () => setPreviewItem(v),
          className: "rounded border border-[#22c55e]/20 bg-[#141416] p-4 cursor-pointer hover:bg-[#22c55e]/5 transition-colors border-l-4 border-l-[#22c55e] group",
          children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsx("div", { className: "font-bold text-white", children: v.retranca }),
              /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mt-1 flex-wrap", children: /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e]", children: v.programa }) }),
              v.observacao && /* @__PURE__ */ jsx("div", { className: "text-xs text-[#6b7280] mt-1 whitespace-pre-wrap", children: v.observacao }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs font-mono text-[#6b7280] mt-1", children: [
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
                className: "opacity-0 group-hover:opacity-100 text-[#6b7280] hover:text-red-500 transition-all p-1",
                children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
              }
            )
          ] })
        },
        v.id
      )),
      !filtered.length && /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-sm text-[#6b7280] italic", children: "Gaveta vazia." })
    ] }),
    previewItem && /* @__PURE__ */ jsx(VtPreviewModal, { vt: previewItem, onClose: () => setPreviewItem(null), onEdit: startEdit })
  ] });
}
function VtPreviewModal({ vt, onClose, onEdit }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 bg-[#141416]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50",
      onClick: onClose,
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          onClick: (e) => e.stopPropagation(),
          className: "bg-[#141416] border border-[#22c55e]/30 rounded max-w-2xl w-full max-h-[85vh] overflow-auto shadow-2xl border-l-4 border-l-[#22c55e]",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-b border-[#22c55e]/20 flex items-start justify-between gap-4 sticky top-0 bg-[#141416]", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-widest text-[#22c55e] mb-1 font-bold", children: "Dados do VT Arquivado" }),
                /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-white", children: vt.retranca })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => onEdit(vt),
                    title: "Editar VT",
                    className: "p-1.5 rounded hover:bg-[#22c55e]/10 text-[#6b7280] hover:text-[#22c55e] transition-all",
                    children: /* @__PURE__ */ jsx(Pencil, { className: "h-5 w-5" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: onClose,
                    className: "text-[#6b7280] hover:text-[#22c55e] transition-colors p-1",
                    title: "Fechar",
                    children: /* @__PURE__ */ jsx(Plus, { className: "h-7 w-7 rotate-45" })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-5 text-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 text-xs", children: [
                /* @__PURE__ */ jsxs("div", { className: "border border-[#22c55e]/20 rounded p-3 bg-[#09090b]", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-widest text-[#6b7280]", children: "Programa" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-1 font-bold text-sm uppercase text-white", children: vt.programa })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "border border-[#22c55e]/20 rounded p-3 bg-[#09090b]", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-widest text-[#6b7280]", children: "Ficou pronto em" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-1 font-bold text-sm text-white", children: (/* @__PURE__ */ new Date(vt.data_pronto + "T00:00:00")).toLocaleDateString("pt-BR") })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase tracking-widest text-[#6b7280] font-bold block mb-2", children: "Observações / Detalhes" }),
                /* @__PURE__ */ jsx("div", { className: "bg-[#09090b] border border-[#22c55e]/20 rounded p-4 italic text-[#6b7280] whitespace-pre-wrap min-h-[100px]", children: vt.observacao || "Nenhuma observação registrada para este VT." })
              ] })
            ] })
          ]
        }
      )
    }
  );
}
function VtEditModal({ item, onClose, onSaved }) {
  const [retranca, setRetranca] = useState(item.retranca);
  const [programa, setPrograma] = useState(item.programa);
  const [dataPronto, setDataPronto] = useState(item.data_pronto);
  const [observacao, setObservacao] = useState(item.observacao ?? "");
  const [saving, setSaving] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await db.from("vt_gaveta").update({
      retranca,
      programa,
      data_pronto: dataPronto,
      observacao: observacao || null
    }).eq("id", item.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("VT atualizado");
      onSaved();
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-[#141416]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50", onClick: onClose, children: /* @__PURE__ */ jsxs(
    "form",
    {
      onClick: (e) => e.stopPropagation(),
      onSubmit: submit,
      className: "rounded border border-[#22c55e]/30 bg-[#141416] p-6 w-full max-w-md space-y-3 shadow-xl border-l-4 border-l-[#22c55e]",
      children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-white", children: "Editar VT" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Retranca" }),
          /* @__PURE__ */ jsx("input", { required: true, value: retranca, onChange: (e) => setRetranca(e.target.value), className: inputCls })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Programa" }),
          /* @__PURE__ */ jsx("select", { value: programa, onChange: (e) => setPrograma(e.target.value), className: inputCls, children: PROGRAMAS_VT.map((p) => /* @__PURE__ */ jsx("option", { children: p }, p)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Data Pronto" }),
          /* @__PURE__ */ jsx("input", { type: "date", required: true, value: dataPronto, onChange: (e) => setDataPronto(e.target.value), className: inputCls })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Observações" }),
          /* @__PURE__ */ jsx("textarea", { value: observacao, onChange: (e) => setObservacao(e.target.value), className: inputCls + " resize-none h-20" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "Cancelar" }),
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: saving, children: saving ? "..." : "Salvar" })
        ] })
      ]
    }
  ) });
}
function PortaisPanel() {
  const { user } = useAuth();
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
    if (!user) return;
    const { error } = await db.from("pautas").insert({
      titulo: item.title,
      retranca: item.title.toUpperCase().slice(0, 50),
      proposta: sanitize$1(item.description ?? ""),
      local: portal,
      sonora: item.link,
      data_pauta: ymd(/* @__PURE__ */ new Date()),
      criado_por: user.id,
      status: "sugestao"
    });
    if (error) toast.error(error.message);
    else toast.success("Sugestão adicionada");
  };
  const current = feeds.find((f) => f.portal === active);
  return /* @__PURE__ */ jsxs("div", { className: "rounded border border-[#22c55e]/20 bg-[#141416] overflow-hidden border-l-4 border-l-[#22c55e]", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 border-b border-[#22c55e]/20", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs text-[#6b7280]", children: loading ? "Carregando…" : `${feeds.reduce((s, f) => s + f.items.length, 0)} notícias` }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: load, disabled: loading, children: [
        loading ? /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsx(RefreshCw, { className: "h-3 w-3" }),
        " Atualizar"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-[220px_1fr] min-h-[400px]", children: [
      /* @__PURE__ */ jsx("div", { className: "border-r border-[#22c55e]/20 p-2 space-y-1 max-h-[600px] overflow-y-auto bg-[#09090b]", children: feeds.map((f) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActive(f.portal),
          className: cn(
            "w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between transition-all border-l-2",
            active === f.portal ? "bg-[#22c55e]/10 border-l-[#22c55e] text-[#22c55e] font-medium" : "border-l-transparent text-[#9ca3af] hover:text-white hover:bg-[#22c55e]/5"
          ),
          children: [
            /* @__PURE__ */ jsx("span", { className: "truncate", children: f.portal }),
            /* @__PURE__ */ jsx("span", { className: cn("text-[10px] ml-2", f.error ? "text-red-500" : "text-[#6b7280]"), children: f.error ? "erro" : f.items.length })
          ]
        },
        f.portal
      )) }),
      /* @__PURE__ */ jsx("div", { className: "p-3 max-h-[600px] overflow-y-auto space-y-2", children: current?.items.map((it, i) => /* @__PURE__ */ jsxs("div", { className: "rounded border border-[#22c55e]/20 bg-[#09090b] p-3 border-l-4 border-l-[#22c55e]", children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-white", children: it.title }),
        it.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-[#6b7280] mt-1 line-clamp-2", children: it.description }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-2 gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-[#6b7280]", children: it.pubDate ? new Date(it.pubDate).toLocaleString("pt-BR") : "" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            it.link && /* @__PURE__ */ jsxs(
              "a",
              {
                href: it.link.startsWith("http") ? it.link : it.link.startsWith("//") ? `https:${it.link}` : it.link.startsWith("/") ? it.link : `https://${it.link}`,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "text-[11px] inline-flex items-center gap-1 text-[#22c55e] hover:text-[#22c55e]/80 transition-colors",
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
        db.from("materias").select("id, titulo, status, autor_id").order("created_at", { ascending: false }).limit(50),
        db.from("metricas").select("materia_id, cliques, tempo_medio_seg"),
        db.from("pautas").select("id", { count: "exact", head: true }),
        db.from("profiles").select("id", { count: "exact", head: true })
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
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen p-4 sm:p-6 bg-[#09090b] text-slate-100 font-sans", children: [
    /* @__PURE__ */ jsxs("div", { className: "border-b border-[#22c55e]/20 pb-4 mb-8", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono uppercase tracking-[0.2em] text-[#22c55e] mb-1", children: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).toUpperCase() }),
      /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono uppercase tracking-[0.2em] text-[#6b7280] mb-2", children: "Sistema de Análise" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-10 w-10 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/40", children: /* @__PURE__ */ jsx(BarChart3, { className: "h-5 w-5 text-[#22c55e]" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl sm:text-4xl font-black tracking-tight font-mono uppercase text-white", children: "MÉTRICAS" })
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
        /* @__PURE__ */ jsx(Tooltip, { contentStyle: { background: "#0f0f12", border: "1px solid #22c55e40", borderRadius: "0.5rem" } }),
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
function KpiCard({ label, value }) {
  return /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-5 backdrop-blur-lg shadow-xl hover:shadow-[0_0_20px_#22c55e20] transition-all duration-300", children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest mb-3", children: label }),
    /* @__PURE__ */ jsx("div", { className: "text-3xl font-black font-mono text-[#22c55e]", children: value })
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
    if (getSession()) navigate({ to: "/pautas" });
  }, []);
  useEffect(() => {
    const savedTheme = localStorage.getItem("desknews-theme");
    if (savedTheme) setIsDarkMode(savedTheme === "dark");
    else setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
    localStorage.setItem("desknews-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    const { user, error } = await signIn(email, password);
    setLoading(false);
    if (error || !user) {
      toast.error(error ?? "Erro ao fazer login.");
      return;
    }
    toast.success(`Bem-vindo, ${user.nome}!`);
    navigate({ to: "/pautas" });
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#09090b] text-slate-100 font-sans flex items-center justify-center px-4", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setIsDarkMode(!isDarkMode),
        className: "fixed top-6 right-6 p-3 rounded-lg border border-[#22c55e]/30 bg-[#0f0f12] hover:bg-[#1a1a21] text-[#22c55e] transition-all duration-300",
        "aria-label": "Alternar tema",
        children: isDarkMode ? /* @__PURE__ */ jsx(Sun, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Moon, { className: "h-5 w-5" })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-12 justify-center", children: [
        /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-mono uppercase tracking-[0.2em] text-slate-400", children: "On Air" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-8 sm:p-10 backdrop-blur-lg shadow-2xl", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black tracking-tight text-white mb-1 font-mono", children: "REDAÇÃO" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mb-8 uppercase tracking-widest", children: "Acesso Remoto" }),
        /* @__PURE__ */ jsxs("form", { onSubmit, className: "mt-8 space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                required: true,
                value: email,
                onChange: (e) => setEmail(e.target.value),
                placeholder: "email@jornal.com",
                className: "w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all duration-200 font-mono text-sm"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 right-0 w-px bg-gradient-to-b from-[#22c55e]/0 via-[#22c55e] to-[#22c55e]/0 opacity-50" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "password",
                required: true,
                value: password,
                onChange: (e) => setPassword(e.target.value),
                placeholder: "senha",
                className: "w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all duration-200 font-mono text-sm"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 right-0 w-px bg-gradient-to-b from-[#22c55e]/0 via-[#22c55e] to-[#22c55e]/0 opacity-50" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: loading,
              className: "w-full py-3 mt-8 rounded-md text-white font-bold uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50 font-mono text-sm bg-[#22c55e]/10 border border-[#22c55e] hover:bg-[#22c55e]/20 hover:shadow-lg hover:shadow-[#22c55e]/20",
              children: loading ? "Entrando..." : "ENTRAR AO VIVO"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-xs mt-8 text-center text-slate-600 font-mono uppercase tracking-widest", children: "Solicitar acesso: chefia.redacao@tv.br" })
      ] })
    ] })
  ] });
}
function useEspelhoRealtime(options) {
  const {
    onEspelhoAlterado,
    onCabecaAtualizada,
    onProducaoAlterada,
    onMasterAlterado,
    onItemStatusAlterado,
    url,
    token,
    debug = false
  } = options;
  const [editingItemIds, setEditingItemIds] = useState(/* @__PURE__ */ new Set());
  const [connected, setConnected] = useState(false);
  const callbacksRef = useRef(options);
  callbacksRef.current = options;
  const log = useCallback(
    (msg, data) => {
      if (debug) console.log(`[Espelho Realtime] ${msg}`, data ?? "");
    },
    [debug]
  );
  useEffect(() => {
    if (!url) {
      log("URL do Centrifugo não fornecida — realtime desabilitado, espelho não atualizará sozinho.");
      return;
    }
    const centrifuge = new Centrifuge(url, { token, debug });
    const sub = centrifuge.newSubscription("playout_events");
    centrifuge.on("connected", () => {
      log("✅ Conectado");
      setConnected(true);
    });
    centrifuge.on("disconnected", (ctx) => {
      log("❌ Desconectado", ctx);
      setConnected(false);
    });
    centrifuge.on("error", (ctx) => {
      log("Erro de conexão", ctx);
    });
    sub.on("publication", (ctx) => {
      const { type, payload } = ctx.data;
      log(`Evento recebido: ${type}`, payload);
      switch (type) {
        case "ESPELHO_ALTERADO": {
          callbacksRef.current.onEspelhoAlterado?.();
          break;
        }
        case "CABECA_ATUALIZADA": {
          callbacksRef.current.onCabecaAtualizada?.(payload);
          break;
        }
        case "PRODUCAO_ALTERADA": {
          callbacksRef.current.onProducaoAlterada?.(payload);
          break;
        }
        case "MASTER_ALTERADO": {
          callbacksRef.current.onMasterAlterado?.(payload);
          break;
        }
        case "ITEM_STATUS_ALTERADO": {
          callbacksRef.current.onItemStatusAlterado?.(payload);
          break;
        }
        case "EDITANDO": {
          const { itemId, editando } = payload;
          setEditingItemIds((prev) => {
            const next = new Set(prev);
            if (editando) next.add(itemId);
            else next.delete(itemId);
            return next;
          });
          break;
        }
        default:
          log(`Tipo de evento desconhecido: ${type}`);
      }
    });
    sub.on("subscribed", () => log("📡 Inscrito em playout_events"));
    sub.on("error", (ctx) => log("Erro na subscrição", ctx));
    sub.subscribe();
    centrifuge.connect();
    return () => {
      sub.unsubscribe();
      centrifuge.disconnect();
    };
  }, [url, token, debug]);
  return { editingItemIds, connected };
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
  const { editingItemIds, connected: realtimeConnected } = useEspelhoRealtime({
    url: "wss://centrifugo-production-449f.up.railway.app/connection/websocket",
    onEspelhoAlterado: () => load(),
    onCabecaAtualizada: (payload) => {
      setItens(
        (prev) => prev.map(
          (it) => it.id === payload.itemId ? { ...it, cabeca: payload.cabeca, assunto: payload.assunto, tempo_cab: payload.tempo_cab } : it
        )
      );
    },
    onProducaoAlterada: (payload) => setPlannedEditorialDuration(payload.valor),
    onMasterAlterado: (payload) => setMasterDuration(payload.valor),
    onItemStatusAlterado: (payload) => {
      setItens(
        (prev) => prev.map(
          (it) => it.id === payload.itemId ? { ...it, status: payload.status } : it
        )
      );
    }
  });
  const broadcastEditing = useCallback((itemId, editando) => {
    broadcastEditando({ data: { itemId, editando } }).catch(
      (err) => console.error("Falha ao avisar edição em andamento:", err)
    );
  }, []);
  const broadcastProducao$1 = useCallback((valor) => {
    broadcastProducao({ data: { valor } }).catch(
      (err) => console.error("Falha ao avisar mudança de produção:", err)
    );
  }, []);
  const broadcastMaster$1 = useCallback((valor) => {
    broadcastMaster({ data: { valor } }).catch(
      (err) => console.error("Falha ao avisar mudança de master:", err)
    );
  }, []);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const load = useCallback(async () => {
    try {
      const { blocos: loadedBlocos, itens: loadedItens } = await loadEspelho({
        data: { date, programa }
      });
      setBlocos(loadedBlocos);
      setItens(loadedItens);
    } catch (err) {
      toast.error(err.message);
    }
  }, [date, programa]);
  useEffect(() => {
    if (realtimeConnected) return;
    const interval = setInterval(() => {
      load();
    }, 15e3);
    return () => clearInterval(interval);
  }, [load, realtimeConnected]);
  useEffect(() => {
    loadMaterias().then((rows) => setMaterias(rows)).catch((err) => toast.error(err.message));
    setProfiles([]);
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const addBloco$1 = async () => {
    const prog = programa !== "Todos" ? programa : "Jornal da Manhã";
    const ordem = blocos.length + 1;
    try {
      await addBloco({ data: { date, nome: `Bloco ${ordem}`, ordem, programa: prog } });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };
  const addItem$1 = async (bloco_id) => {
    const ordem = itens.filter((i) => i.bloco_id === bloco_id).length + 1;
    try {
      await addItem({
        data: {
          blocoId: bloco_id,
          ordem,
          assunto: "Novo item",
          formato: "VT",
          tempo: "1:30",
          tempoCab: "0:15"
        }
      });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };
  const addFromMateria$1 = async (bloco_id, materia_id) => {
    const m = materias.find((x) => x.id === materia_id);
    if (!m) return;
    const ordem = itens.filter((i) => i.bloco_id === bloco_id).length + 1;
    try {
      await addFromMateria({
        data: {
          blocoId: bloco_id,
          ordem,
          assunto: m.titulo,
          materiaId: materia_id,
          formato: "VT",
          tempo: m.tempo_vt ?? "1:30",
          tempoCab: m.tempo_cab ?? "0:15",
          cabeca: m.cabeca ?? null
        }
      });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };
  const addComercial$1 = async (bloco_id) => {
    const ordem = itens.filter((i) => i.bloco_id === bloco_id).length + 1;
    try {
      await addComercial({ data: { blocoId: bloco_id, ordem } });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };
  const updateItem$1 = useCallback(async (id, patch) => {
    if (!Object.keys(patch).length) return;
    try {
      await updateItem({ data: { id, patch } });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }, [load]);
  const updateBloco$1 = async (id, patch) => {
    if (!Object.keys(patch).length) return;
    try {
      await updateBloco({ data: { id, patch } });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };
  const delItem$1 = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover este item do espelho?")) return;
    try {
      await delItem({ data: { id } });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };
  const delBloco$1 = async (id) => {
    if (!window.confirm("Isso apagará o bloco e todos os itens dentro dele. Confirmar?")) return;
    try {
      await delBloco({ data: { id } });
      load();
    } catch (err) {
      toast.error(err.message);
    }
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
        const x = newItens.find((z2) => z2.id === item.id);
        if (x) x.ordem = idx + 1;
      });
    } else {
      target.bloco_id = destinationBlocoId;
      const sourceItens = newItens.filter((i) => i.bloco_id === sourceBlocoId && i.id !== activeId).sort((a, b) => a.ordem - b.ordem);
      sourceItens.forEach((item, idx) => {
        const x = newItens.find((z2) => z2.id === item.id);
        if (x) x.ordem = idx + 1;
      });
      const destItens = newItens.filter((i) => i.bloco_id === destinationBlocoId && i.id !== activeId).sort((a, b) => a.ordem - b.ordem);
      const overIdx = destItens.findIndex((i) => i.id === overId);
      overIdx >= 0 ? destItens.splice(overIdx, 0, target) : destItens.push(target);
      destItens.forEach((item, idx) => {
        const x = newItens.find((z2) => z2.id === item.id);
        if (x) {
          x.ordem = idx + 1;
          x.bloco_id = destinationBlocoId;
        }
      });
    }
    setItens(newItens);
    try {
      await reorderItens({
        data: {
          itens: newItens.map((item) => ({
            id: item.id,
            ordem: item.ordem,
            bloco_id: item.bloco_id
          }))
        }
      });
    } catch (err) {
      toast.error(err.message);
    }
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
    /* @__PURE__ */ jsxs("div", { className: "border-b border-[#22c55e]/10 pb-4 shrink-0", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono uppercase tracking-[0.2em] text-[#22c55e] mb-1", children: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).toUpperCase() }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-10 w-10 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/40 shrink-0", children: /* @__PURE__ */ jsx(MonitorPlay, { className: "h-5 w-5 text-[#22c55e]" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl sm:text-4xl font-black tracking-tight font-mono uppercase text-white", children: "ESPELHO" }),
        /* @__PURE__ */ jsx("span", { className: "text-[11px] font-mono uppercase tracking-widest text-[#6b7280] hidden sm:inline", children: "Exibição · Controle de Tempo" }),
        /* @__PURE__ */ jsx("div", { className: "ml-auto flex items-center gap-2" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-6 flex-wrap gap-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 sm:gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "date",
          value: date,
          onChange: (e) => setDate(e.target.value),
          className: "px-4 py-3.5 rounded-md bg-[#141416] border border-[#22c55e]/20 text-body-sm text-[#ffffff] focus:outline-none focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10 transition-all duration-300"
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
          className: "px-4 py-3.5 rounded-md bg-[#141416] border border-[#22c55e]/20 text-body-sm font-bold text-[#ffffff] focus:outline-none focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10 transition-all duration-300 appearance-none cursor-pointer",
          children: [
            /* @__PURE__ */ jsx("option", { value: "Todos", children: "Todos os programas" }),
            PROGRAMAS.map((p) => /* @__PURE__ */ jsx("option", { value: p, className: "bg-[#141416] text-[#ffffff]", children: p }, p))
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "font-mono text-display-lg border border-[#22c55e]/20 rounded-lg px-8 py-4 bg-[#141416] backdrop-blur-xl shadow-xl flex flex-col items-center justify-center min-w-[160px]", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[#6b7280] text-label mb-1 font-black", children: "PRODUÇÃO" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: plannedEditorialDuration,
            disabled: false,
            onChange: (e) => {
              if (/^\d{0,2}:?\d{0,2}$/.test(e.target.value) || e.target.value === "") {
                setPlannedEditorialDuration(e.target.value);
                broadcastProducao$1(e.target.value);
              }
            },
            onBlur: () => {
              const formatted = formatSecondsToTime(plannedSec);
              setPlannedEditorialDuration(formatted);
              broadcastProducao$1(formatted);
            },
            className: "bg-transparent text-[#ffffff] w-32 text-center focus:outline-none font-bold tracking-tighter text-h2",
            placeholder: "00:00"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "font-mono text-display-lg border border-[#22c55e]/20 rounded-lg px-8 py-4 bg-[#141416] backdrop-blur-xl shadow-xl flex flex-col items-center justify-center min-w-[160px]", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[#6b7280] text-label mb-1 font-black", children: "MASTER" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: masterDuration,
            disabled: false,
            onChange: (e) => {
              if (/^\d{0,2}:?\d{0,2}$/.test(e.target.value) || e.target.value === "") {
                setMasterDuration(e.target.value);
                broadcastMaster$1(e.target.value);
              }
            },
            onBlur: () => {
              const formatted = formatSecondsToTime(masterSec);
              setMasterDuration(formatted);
              broadcastMaster$1(formatted);
            },
            className: "bg-transparent text-[#ffffff] w-32 text-center focus:outline-none font-bold tracking-tighter text-h2 tabular-nums",
            placeholder: "00:00"
          }
        )
      ] }),
      diffEditorial.type !== "balanceado" && /* @__PURE__ */ jsxs("div", { className: cn(
        "font-mono text-display-lg border rounded-lg px-8 py-4 flex flex-col items-center justify-center min-w-[160px] shadow-xl",
        diffEditorial.type === "estouro" ? "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30" : "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30"
      ), children: [
        /* @__PURE__ */ jsx("span", { className: "text-label mb-1 font-black", children: diffEditorial.type === "estouro" ? "Estouro" : "Sobra" }),
        /* @__PURE__ */ jsx("span", { className: "font-bold text-h2 tabular-nums", children: formatSecondsToTime(diffEditorial.value) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "font-mono text-display-lg border border-[#22c55e]/20 rounded-lg px-8 py-4 bg-[#141416] backdrop-blur-xl flex flex-col items-center justify-center min-w-[160px] shadow-2xl", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[#6b7280] text-label mb-1 font-black", children: "TOTAL" }),
        /* @__PURE__ */ jsx("span", { className: "text-[#ffffff] font-bold tracking-tighter text-h2 tabular-nums", children: formatSecondsToTime(totalGeralSec) })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: addBloco$1,
          className: "inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#22c55e] text-white text-body-sm font-semibold uppercase tracking-widest shadow-lg transition-all duration-300 hover:shadow-xl active:scale-[0.98]",
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
          className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#141416] border border-[#22c55e]/20 text-white text-body-sm font-semibold uppercase tracking-wider hover:border-[#22c55e] hover:ring-4 hover:ring-[#22c55e]/10 transition-all duration-300 shadow-md active:scale-[0.98]",
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
          className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#141416] border border-[#22c55e]/20 text-white text-body-sm font-semibold uppercase tracking-wider hover:border-[#22c55e] hover:ring-4 hover:ring-[#22c55e]/10 transition-all duration-300 shadow-md active:scale-[0.98]",
          children: [
            /* @__PURE__ */ jsx(Tv, { className: "h-4 w-4 text-white" }),
            " PLAYOUT"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx(DndContext, { sensors, collisionDetection: closestCorners, onDragEnd: handleDragEnd, children: /* @__PURE__ */ jsxs("div", { className: "space-y-6 pb-12 overflow-y-auto flex-1", children: [
      blocos.length === 0 && /* @__PURE__ */ jsxs("div", { className: "bg-[#141416] border border-[#22c55e]/20 rounded-lg p-12 text-center text-[#6b7280] text-body-sm shadow-md", children: [
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
            className: "group bg-[#141416] border border-[#22c55e]/20 rounded-lg overflow-hidden shadow-sm",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-5 py-4 bg-[#1c1c1f] border-b border-[#22c55e]/10 gap-3 flex-wrap", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
                  /* @__PURE__ */ jsxs("span", { className: "font-mono text-xs px-2 py-0.5 bg-red-600 text-white rounded font-bold", children: [
                    "B",
                    String(b.ordem).padStart(2, "0")
                  ] }),
                  /* @__PURE__ */ jsx(
                    BlockInput,
                    {
                      value: b.nome,
                      onBlur: (v) => updateBloco$1(b.id, { nome: v }),
                      className: "bg-transparent font-semibold focus:outline-none"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "select",
                    {
                      value: b.programa,
                      onChange: (e) => updateBloco$1(b.id, { programa: e.target.value }),
                      className: "text-label bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20 rounded-full px-2.5 py-1 font-bold appearance-none cursor-pointer",
                      children: PROGRAMAS.map((p) => /* @__PURE__ */ jsx("option", { value: p, className: "bg-[#141416] text-[#ffffff]", children: p }, p))
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "text-label text-[#6b7280]", children: "Apresentador" }),
                  /* @__PURE__ */ jsx(
                    BlockInput,
                    {
                      value: b.apresentador ?? "",
                      disabled: false,
                      placeholder: "—",
                      onBlur: (v) => updateBloco$1(b.id, { apresentador: v || null }),
                      className: "bg-transparent text-body-sm focus:outline-none border-b border-transparent focus:border-[#22c55e] transition-colors duration-200"
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "font-mono text-caption text-[#6b7280] bg-[#09090b] px-2.5 py-1 rounded-md border border-[#22c55e]/10", children: formatSecondsToTime(tempoB) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                  /* @__PURE__ */ jsxs(
                    "select",
                    {
                      onChange: (e) => {
                        if (e.target.value) {
                          addFromMateria$1(b.id, e.target.value);
                          e.target.value = "";
                        }
                      },
                      className: "text-caption bg-[#141416] text-[#ffffff] border border-[#22c55e]/20 rounded-xl px-3 py-1.5 focus:outline-none appearance-none cursor-pointer transition-all duration-300 hover:border-[#22c55e]/30 min-w-[180px]",
                      defaultValue: "",
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "", className: "bg-[#141416] text-[#ffffff]", children: "+ Matéria publicada…" }),
                        materias.map((m) => /* @__PURE__ */ jsx("option", { value: m.id, className: "bg-[#141416] text-[#ffffff]", children: m.titulo }, m.id))
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => addItem$1(b.id),
                      className: "text-caption px-3 py-1.5 rounded-xl border border-[#22c55e]/20 text-[#9ca3af] hover:bg-[#141416] hover:text-[#ffffff] transition-all duration-300 active:scale-[0.98]",
                      children: "+ Item"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => addComercial$1(b.id),
                      className: "text-caption px-3 py-1.5 rounded-xl border border-[#22c55e]/20 text-[#9ca3af] hover:bg-[#141416] hover:text-[#ffffff] transition-all duration-300 active:scale-[0.98]",
                      children: "+ Comercial"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => delBloco$1(b.id),
                      className: "text-caption px-3 py-1.5 rounded-md text-[#ef4444] hover:bg-[#ef4444]/10 transition-all duration-300 active:scale-[0.98] opacity-0 group-hover:opacity-100",
                      children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "overflow-x-auto text-[#9ca3af]", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm min-w-[1100px]", children: [
                /* @__PURE__ */ jsx("thead", { className: "text-[10px] uppercase tracking-widest text-[#6b7280]", children: /* @__PURE__ */ jsxs("tr", { className: "border-b [#22c55e]/10 bg-[#1c1c1f]", children: [
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
                          onUpdate: updateItem$1,
                          onDelete: delItem$1,
                          onSelectMateria: (m, i) => {
                            broadcastEditing(i.id, true);
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
                          className: "px-3 py-6 text-center text-xs text-[#6b7280]",
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
          try {
            await updateMateriaEItem({
              data: {
                id: updated.id,
                itemId: modalMateria.item.id,
                titulo: updated.titulo,
                cabeca: updated.cabeca,
                tempoVt: updated.tempo_vt,
                tempoCab: updated.tempo_cab,
                deixa: updated.deixa,
                estrutura: updated.estrutura,
                corpo: updated.corpo,
                creditoReporter: updated.credito_reporter
              }
            });
            broadcastEditing(modalMateria.item.id, false);
            setModalMateria(null);
            toast.success("Matéria salva!");
          } catch (err) {
            toast.error(err.message);
          }
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
          await updateItem$1(id, { assunto, cabeca, tempo_cab: tempoCab, tempo: tempoVt });
          if (modalCabeca.materia_id) {
            try {
              await updateMateriaCabeca({
                data: {
                  materiaId: modalCabeca.materia_id,
                  creditoReporter: reporter,
                  cabeca,
                  tempoCab,
                  tempoVt
                }
              });
            } catch (err) {
              toast.error(err.message);
            }
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
        "group border-b border-[#22c55e]/10 last:border-0 hover:bg-[#141416] transition-all duration-300",
        item.formato === "Comercial" && "bg-[#141416]",
        isDragging && "bg-[#1c1c1f] opacity-50 z-50 ring-2 ring-[#22c55e]/20",
        isCurrent && "bg-red-600/10 text-[#ffffff] font-bold",
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
              "w-8 px-2 py-2 text-[#4b5563]",
              !isLocked && "cursor-grab active:cursor-grabbing hover:bg-[#22c55e]/10 transition-colors duration-200"
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
              "w-3 h-3 rounded-full border border-[#22c55e]/50 transition-all duration-200",
              isEditing && !isCurrent ? "bg-yellow-400 animate-pulse" : item.status === "cortado" ? "bg-gray-500" : dotColor
            )
          }
        ) }) }),
        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-mono text-[10px] text-[#6b7280] font-bold", children: /* @__PURE__ */ jsx("span", { className: "text-[#6b7280]", children: String(currentIndex + 1).padStart(2, "0") }) }),
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
              className: cn("w-full bg-transparent focus:outline-none font-medium text-[#ffffff]", isCurrent && "text-[#ffffff]")
            }
          ),
          item.materia_id && linkedMateria && /* @__PURE__ */ jsxs(
            "span",
            {
              className: cn(
                "inline-block mt-1 text-[10px] uppercase tracking-widest font-bold",
                isCurrent ? "text-red-400" : "text-[#22c55e]"
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
            className: "w-full text-caption bg-[#141416] border border-[#22c55e]/20 rounded-xl px-3 py-1.5 appearance-none cursor-pointer transition-all duration-300 hover:border-[#22c55e]/30",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", className: "bg-[#141416] text-[#6b7280]", children: "—" }),
              FORMATOS.map((f) => /* @__PURE__ */ jsx("option", { value: f, children: f }, f))
            ]
          }
        ) }),
        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: !isLocked ? /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => onSelectCabeca(item),
            className: "w-16 bg-transparent font-mono text-center text-[#6b7280] hover:bg-[#141416] hover:text-[#ffffff] rounded-md py-1 transition-all duration-300 border border-transparent hover:border-[#22c55e]/20 cursor-pointer focus:outline-none active:scale-[0.98]",
            title: "Editar texto da cabeça",
            children: /* @__PURE__ */ jsx("span", { className: "text-caption", children: tempoCab || "0:00" })
          }
        ) : /* @__PURE__ */ jsx("span", { className: "w-16 inline-block font-mono text-center text-[#6b7280]", children: tempoCab || "0:00" }) }),
        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: /* @__PURE__ */ jsx(
          "input",
          {
            value: tempo,
            placeholder: "0:00",
            disabled: isLocked,
            onChange: (e) => setTempo(e.target.value),
            onBlur: () => onUpdate(item.id, { tempo: tempo || null }),
            className: "w-16 bg-transparent font-mono text-center focus:outline-none text-[#ffffff] text-caption"
          }
        ) }),
        /* @__PURE__ */ jsx(
          "td",
          {
            className: cn(
              "px-3 py-2 text-center font-bold font-mono",
              isCurrent ? "text-[#ffffff]" : "text-[#22c55e]"
            ),
            children: calcTotal(item)
          }
        ),
        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsx("span", { className: "text-caption text-[#6b7280]", children: linkedMateria?.editor_texto ?? "—" }) }),
        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsx("span", { className: "text-caption text-[#6b7280]", children: linkedMateria?.editor_imagem ?? "—" }) }),
        /* @__PURE__ */ jsxs("td", { className: "px-3 py-2", children: [
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: item.status ?? "pendente",
              disabled: isLocked,
              onChange: (e) => onUpdate(item.id, { status: e.target.value }),
              className: "text-caption bg-[#141416] border border-[#22c55e]/20 rounded-md px-2 py-1 w-full appearance-none cursor-pointer transition-all duration-300 hover:border-[#22c55e]/30",
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
            className: "p-1.5 rounded-full text-[#6b7280] hover:bg-[#ef4444]/10 hover:text-[#ef4444] transition-all duration-300 active:scale-[0.98] opacity-0 group-hover:opacity-100",
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
      className: "fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-xl flex items-center justify-center p-4",
      onClick: onClose,
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-[#141416] border border-yellow-400/30 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl flex flex-col",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxs("div", { className: "px-6 py-5 flex items-start justify-between gap-4 border-b border-yellow-400/20 sticky top-0 bg-[#141416] z-10", children: [
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
                    className: "w-full bg-transparent text-h2 font-bold focus:outline-none border-b border-transparent focus:border-yellow-400/50 transition-colors text-[#ffffff]",
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
                    className: "p-2 rounded-xl text-[#6b7280] hover:bg-yellow-400/10 hover:text-yellow-400 transition-all duration-200 active:scale-[0.98]",
                    children: /* @__PURE__ */ jsx(Pencil, { className: "h-5 w-5" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: onClose,
                    title: "Fechar",
                    className: "p-2 rounded-xl text-[#6b7280] hover:bg-[#141416] hover:text-[#ffffff] transition-all duration-200 active:scale-[0.98]",
                    children: /* @__PURE__ */ jsx(Plus, { className: "h-6 w-6 rotate-45" })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "border border-[#22c55e]/10 rounded-xl p-4 bg-[#141416]", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-label text-[#4b5563] mb-2", children: "Tempo Cabeça" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      value: tempoCab,
                      onChange: (e) => setTempoCab(e.target.value),
                      className: "w-full bg-transparent font-mono text-body text-center focus:outline-none border-b border-transparent focus:border-[#22c55e]/50 text-[#ffffff]"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "border border-[#22c55e]/10 rounded-xl p-4 bg-[#141416]", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-label text-[#4b5563] mb-2", children: "Tempo VT" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      value: tempoVt,
                      onChange: (e) => setTempoVt(e.target.value),
                      className: "w-full bg-transparent font-mono text-body text-center focus:outline-none border-b border-transparent focus:border-[#22c55e]/50 text-[#ffffff]"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "border border-[#22c55e]/10 rounded-xl p-4 bg-[#141416]", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-label text-[#4b5563] mb-2", children: "Repórter" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      value: reporter,
                      onChange: (e) => setReporter(e.target.value),
                      className: "w-full bg-transparent text-body focus:outline-none border-b border-transparent focus:border-[#22c55e]/50 text-[#ffffff]",
                      placeholder: "Nome..."
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-label text-[#4b5563]", children: "Cabeça do Âncora" }),
                  /* @__PURE__ */ jsxs("div", { className: "text-label text-[#4b5563]", children: [
                    "Palavras: ",
                    /* @__PURE__ */ jsx("span", { className: "font-bold text-[#ffffff]", children: wordCount })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-0.5 bg-[#22c55e] rounded-full mr-4 opacity-70 shrink-0" }),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      value: cabeca,
                      onChange: handleCabecaChange,
                      rows: 4,
                      autoFocus: true,
                      className: "w-full bg-transparent italic text-body focus:outline-none resize-none leading-relaxed text-[#ffffff] placeholder-[#4b5563]",
                      placeholder: "Texto da cabeça do âncora..."
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-label text-[#4b5563] mb-2", children: "Deixa (últimas palavras do VT)" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: deixa,
                    onChange: (e) => setDeixa(e.target.value),
                    className: "w-full px-3 py-2 rounded-xl bg-[#141416] border border-[#22c55e]/20 text-[#ffffff] focus:outline-none focus:border-[#22c55e] transition-all text-body-sm",
                    placeholder: "...na reportagem de hoje."
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-label text-[#4b5563] mb-2", children: "Roteiro / Decupagem (VT)" }),
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    value: estrutura,
                    onChange: (e) => setEstrutura(e.target.value),
                    rows: 7,
                    className: "w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/20 text-[#ffffff] focus:outline-none focus:border-[#22c55e] transition-all resize-none font-mono text-caption leading-relaxed whitespace-pre-wrap placeholder-[#4b5563]",
                    placeholder: "[OFF]\n\n[SONORA] NOME / FUNÇÃO\n\n[PASSAGEM] REPÓRTER // LOCAL"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-label text-[#4b5563] mb-2", children: "Matéria Web (texto corrido)" }),
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    value: corpo,
                    onChange: (e) => setCorpo(e.target.value),
                    rows: 4,
                    className: "w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/20 text-[#ffffff] focus:outline-none focus:border-[#22c55e] transition-all resize-none text-body-sm placeholder-[#4b5563]",
                    placeholder: "Texto corrido para publicação web..."
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-t border-[#22c55e]/10 flex justify-end sticky bottom-0 bg-[#141416]", children: /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: handleSave,
                className: "px-8 py-3 rounded-md text-body font-bold text-white bg-[#22c55e] shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98]",
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
      className: "fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-xl flex items-center justify-center p-4",
      onClick: onClose,
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-[#141416] border border-[#22c55e]/20 rounded-lg max-w-2xl w-full shadow-2xl flex flex-col",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxs("div", { className: "px-6 py-5 flex items-start justify-between gap-4 border-b border-[#22c55e]/10", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx("div", { className: "text-label text-[#22c55e] font-bold mb-1.5", children: "Estrutura da Matéria" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: assunto,
                    onChange: (e) => setAssunto(e.target.value),
                    className: "w-full bg-transparent text-h2 font-bold focus:outline-none uppercase border-b border-transparent focus:border-[#22c55e]/50 transition-colors duration-200 text-[#ffffff]",
                    placeholder: "RETRANCA / ASSUNTO"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => onSave(item.id, assunto, text, tempoCab, tempoVt, reporter),
                    className: "p-1.5 rounded-full text-[#6b7280] hover:bg-[#141416] hover:text-[#22c55e] transition-all duration-300 active:scale-[0.98]",
                    title: "Salvar",
                    children: /* @__PURE__ */ jsx(Pencil, { className: "h-5 w-5" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: onClose,
                    className: "p-1.5 rounded-full text-[#6b7280] hover:bg-[#141416] hover:text-[#ffffff] transition-all duration-300 active:scale-[0.98]",
                    title: "Fechar",
                    children: /* @__PURE__ */ jsx(Plus, { className: "h-6 w-6 rotate-45" })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "border border-[#22c55e]/10 rounded-xl p-4 bg-[#141416]", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-label text-[#4b5563] mb-2", children: "Tempo (Cab + VT)" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center font-mono text-body-lg gap-2 text-[#ffffff]", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        value: tempoCab,
                        onChange: (e) => setTempoCab(e.target.value),
                        className: "w-16 bg-transparent text-center focus:outline-none border-b border-transparent focus:border-[#22c55e]/50 transition-colors duration-200"
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { className: "text-[#6b7280]", children: "+" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        value: tempoVt,
                        onChange: (e) => setTempoVt(e.target.value),
                        className: "w-16 bg-transparent text-center focus:outline-none border-b border-transparent focus:border-[#22c55e]/50 transition-colors duration-200"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "border border-[#22c55e]/10 rounded-xl p-4 bg-[#141416]", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-label text-[#4b5563] mb-2", children: "Repórter" }),
                  item.materia_id ? /* @__PURE__ */ jsx(
                    "input",
                    {
                      value: reporter,
                      onChange: (e) => setReporter(e.target.value),
                      className: "w-full bg-transparent text-body mt-1.5 focus:outline-none border-b border-transparent focus:border-[#22c55e]/50 transition-colors duration-200 text-[#ffffff]",
                      placeholder: "Nome do repórter..."
                    }
                  ) : /* @__PURE__ */ jsx("div", { className: "mt-1.5 text-body-sm text-[#6b7280]", children: "— (Item sem matéria)" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-label text-[#4b5563]", children: "Cabeça do Âncora" }),
                  /* @__PURE__ */ jsxs("div", { className: "text-label text-[#4b5563]", children: [
                    "Palavras:",
                    " ",
                    /* @__PURE__ */ jsx("span", { className: "font-bold text-[#ffffff]", children: wordCount })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-0.5 bg-[#22c55e] rounded-l-sm mr-4 opacity-80" }),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      value: text,
                      onChange: handleTextChange,
                      className: "w-full h-32 bg-transparent italic text-body focus:outline-none resize-none leading-relaxed text-[#ffffff]",
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
                  className: "px-6 py-3 rounded-md text-body font-semibold text-white bg-[#22c55e] shadow-lg transition-all duration-300 hover:shadow-xl active:scale-[0.98]",
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
        const { data: pautasData } = await db.from("pautas").select("*").order("created_at", { ascending: false }).limit(100);
        const { data: materiasData } = await db.from("materias").select("*").order("created_at", { ascending: false }).limit(100);
        const { data: espelhosData } = await db.from("espelho_blocos").select("*").limit(50);
        const { data: profilesData } = await db.from("profiles").select("id").limit(100);
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
  const COLORS = ["#22c55e", "#ef4444", "#3b82f6"];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#09090b] text-slate-100 font-sans", children: [
    /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 pointer-events-none overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#22c55e]/10 to-blue-500/5 rounded-full blur-3xl animate-pulse opacity-50" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl opacity-50", style: { animationDelay: "1s" } })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 p-4 md:p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "border-b border-[#22c55e]/20 pb-4 mb-8", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono uppercase tracking-[0.2em] text-[#22c55e] mb-1", children: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).toUpperCase() }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-[#22c55e] animate-pulse shrink-0" }),
          /* @__PURE__ */ jsx("h1", { className: "text-3xl md:text-4xl font-black tracking-tight font-mono uppercase text-white", children: "Dashboard" }),
          /* @__PURE__ */ jsx("span", { className: "text-[#6b7280] font-mono text-2xl font-light select-none", children: "—" }),
          /* @__PURE__ */ jsx("img", { src: "/logo1.png", alt: "DeskNews", className: "h-6 opacity-80" })
        ] })
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
            /* @__PURE__ */ jsx(Tooltip, { contentStyle: { background: "#0f0f12", border: "1px solid #22c55e40", borderRadius: "0.5rem" } }),
            /* @__PURE__ */ jsx(Bar, { dataKey: "producao", fill: "#22c55e", radius: [2, 2, 0, 0] })
          ] }) }) : /* @__PURE__ */ jsx("div", { className: "h-64 flex items-center justify-center text-slate-500 text-xs", children: "SEM DADOS" }) }),
          /* @__PURE__ */ jsx(PremiumCard, { title: "Status das Matérias", children: statusData.length > 0 ? /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 250, children: /* @__PURE__ */ jsxs(PieChart, { children: [
            /* @__PURE__ */ jsx(Pie, { data: statusData, cx: "50%", cy: "50%", labelLine: false, label: { fill: "#e2e8f0", fontSize: 11 }, outerRadius: 80, fill: "#22c55e", dataKey: "value", children: COLORS.map((color, index) => /* @__PURE__ */ jsx(Cell, { fill: color }, `cell-${index}`)) }),
            /* @__PURE__ */ jsx(Tooltip, { contentStyle: { background: "#0f0f12", border: "1px solid #22c55e40" } })
          ] }) }) : /* @__PURE__ */ jsx("div", { className: "h-64 flex items-center justify-center text-slate-500 text-xs", children: "SEM DADOS" }) }),
          /* @__PURE__ */ jsx(PremiumCard, { title: "Top Repórteres", children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: topReporters.length > 0 ? topReporters.map((reporter, idx) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 bg-[#1a1a21] rounded-md border border-[#22c55e]/20 hover:border-[#22c55e]/40 transition-all", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-mono text-slate-300", children: reporter.name }),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-black text-[#22c55e] font-mono", children: reporter.materias })
          ] }, idx)) : /* @__PURE__ */ jsx("div", { className: "text-center text-slate-500 text-xs", children: "SEM DADOS" }) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8", children: [
          /* @__PURE__ */ jsx(PremiumCard, { title: "Últimas Matérias", children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: ultimasMaterias.length > 0 ? ultimasMaterias.map((materia, idx) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: `p-3 rounded-md border border-l-4 transition-all ${materia.status === "publicado" ? "border-[#22c55e] border-l-[#22c55e] bg-[#22c55e]/5" : materia.status === "rascunho" ? "border-[#f59e0b]/30 border-l-[#f59e0b] bg-[#f59e0b]/5" : "border-[#3b82f6]/30 border-l-[#3b82f6] bg-[#3b82f6]/5"}`,
              children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-200 line-clamp-1 font-mono", children: materia.titulo || "---" }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-600 font-mono", children: new Date(materia.created_at).toLocaleDateString("pt-BR") }),
                  /* @__PURE__ */ jsx("span", { className: `text-xs font-bold px-2 py-0.5 rounded font-mono uppercase text-xs tracking-wider ${materia.status === "publicado" ? "bg-[#22c55e]/30 text-[#22c55e]" : materia.status === "rascunho" ? "bg-[#f59e0b]/30 text-[#f59e0b]" : "bg-[#3b82f6]/30 text-[#3b82f6]"}`, children: materia.status })
                ] })
              ]
            },
            idx
          )) : /* @__PURE__ */ jsx("div", { className: "text-center text-slate-500 text-xs", children: "SEM DADOS" }) }) }),
          /* @__PURE__ */ jsx(PremiumCard, { title: "Últimas Pautas", children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: ultimasPautas.length > 0 ? ultimasPautas.map((pauta, idx) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "p-3 rounded-md bg-[#1a1a21] border border-[#22c55e]/20 hover:border-[#22c55e]/40 transition-all border-l-2 border-l-[#22c55e]",
              children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-200 truncate font-mono", children: pauta.titulo || pauta.retranca || "---" }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-2 text-xs text-slate-600 font-mono", children: [
                  /* @__PURE__ */ jsx("span", { children: pauta.tipo || "PAUTA" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[#22c55e]", children: "•" }),
                  /* @__PURE__ */ jsx("span", { children: pauta.turno || "---" })
                ] })
              ]
            },
            idx
          )) : /* @__PURE__ */ jsx("div", { className: "text-center text-slate-500 text-xs", children: "SEM DADOS" }) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6 border-b border-[#22c55e]/20 pb-4", children: [
            /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-[#22c55e]" }),
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-black font-mono uppercase", children: "Mundo" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 lg:grid-cols-5 gap-4", children: portalNews.length > 0 ? portalNews.map((portal, pidx) => /* @__PURE__ */ jsx(PremiumCard, { title: portal.portal, children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: portal.items && portal.items.slice(0, 3).map((news, nidx) => /* @__PURE__ */ jsxs(
            "a",
            {
              href: news.link,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "block p-3 rounded-md bg-[#1a1a21] border border-[#22c55e]/20 hover:border-[#22c55e]/40 hover:bg-[#1a1a21]/80 transition-all group",
              children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-300 line-clamp-2 group-hover:text-[#22c55e] transition-colors font-mono", children: news.title }),
                news.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 mt-2 line-clamp-1 font-mono", children: news.description }),
                news.pubDate && /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-700 mt-2 flex items-center gap-1 font-mono", children: new Date(news.pubDate).toLocaleDateString("pt-BR") }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 mt-3 text-[#22c55e] group-hover:text-[#16a34a]", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold font-mono", children: "Ir" }),
                  /* @__PURE__ */ jsx(ExternalLink, { size: 11 })
                ] })
              ]
            },
            nidx
          )) }) }, pidx)) : /* @__PURE__ */ jsxs("div", { className: "col-span-5 text-center py-8 text-slate-500 font-mono text-xs", children: [
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
function MetricCard({ label, value }) {
  return /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-4 backdrop-blur-lg shadow-xl hover:shadow-[0_0_20px_#22c55e20] transition-all duration-300", children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 font-mono uppercase tracking-widest mb-2", children: label }),
    /* @__PURE__ */ jsx("div", { className: "text-2xl font-black text-[#22c55e] font-mono", children: value })
  ] });
}
function PremiumCard({ title, children }) {
  return /* @__PURE__ */ jsx("div", { className: "relative group", children: /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-6 backdrop-blur-lg shadow-xl hover:shadow-[0_0_20px_#22c55e20] transition-all duration-300 h-full", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-sm font-black mb-4 text-white font-mono uppercase tracking-widest", children: title }),
    children
  ] }) });
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
    const { error } = await db.auth.signUp({
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
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-[#09090b] text-slate-100 px-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md text-center border-l-4 border-[#ef4444] bg-[#0f0f12] border border-[#ef4444]/20 rounded-lg p-10 backdrop-blur-lg shadow-2xl", children: [
      /* @__PURE__ */ jsx(ShieldAlert, { className: "h-12 w-12 text-[#ef4444] mx-auto mb-4" }),
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-black tracking-tight text-white font-mono mb-2", children: "ACESSO NEGADO" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 mt-4 mb-6 uppercase tracking-widest", children: "Permissões insuficientes para cadastrar integrantes." }),
      /* @__PURE__ */ jsx(Link, { to: "/pautas", className: "inline-flex justify-center w-full py-3 rounded-md bg-[#ef4444]/10 border border-[#ef4444]/30 text-slate-100 font-mono uppercase text-xs tracking-wider transition-all hover:bg-[#ef4444]/20", children: "Voltar ao Painel" })
    ] }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-[#09090b] text-slate-100 px-4 font-sans", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-12 justify-center", children: [
      /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" }),
      /* @__PURE__ */ jsx("span", { className: "text-xs font-mono uppercase tracking-[0.2em] text-slate-400", children: "Cadastro" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "border-l-4 border-[#22c55e] bg-[#0f0f12] border border-[#22c55e]/20 rounded-lg p-8 sm:p-10 backdrop-blur-lg shadow-2xl", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black tracking-tight text-white mb-1 font-mono", children: "NOVO MEMBRO" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mb-8 uppercase tracking-widest", children: "Redação · Registro" }),
      /* @__PURE__ */ jsxs("form", { onSubmit, className: "mt-8 space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest mb-2 block", children: "Nome" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              required: true,
              value: name,
              onChange: (e) => setName(e.target.value),
              placeholder: "Nome completo",
              className: "w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all duration-200 font-mono text-sm"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 right-0 h-px w-0 bg-[#22c55e] transition-all duration-500 group-focus-within:w-full" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest mb-2 block", children: "E-mail" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "email",
              required: true,
              value: email,
              onChange: (e) => setEmail(e.target.value),
              placeholder: "user@jornal.com",
              className: "w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all duration-200 font-mono text-sm"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 right-0 w-px bg-gradient-to-b from-[#22c55e]/0 via-[#22c55e] to-[#22c55e]/0 opacity-50" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest mb-2 block", children: "Senha" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "password",
              required: true,
              minLength: 6,
              value: password,
              onChange: (e) => setPassword(e.target.value),
              placeholder: "Mínimo 6 caracteres",
              className: "w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all duration-200 font-mono text-sm"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 right-0 w-px bg-gradient-to-b from-[#22c55e]/0 via-[#22c55e] to-[#22c55e]/0 opacity-50" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-slate-500 font-mono uppercase tracking-widest mb-2 block", children: "Função" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: roleSelection,
              onChange: (e) => setRoleSelection(e.target.value),
              className: "w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/30 text-slate-100 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/50 transition-all duration-200 appearance-none cursor-pointer font-mono text-sm",
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
            className: "w-full py-3 mt-8 rounded-md text-white font-black uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50 font-mono text-sm bg-[#22c55e]/10 border border-[#22c55e] hover:bg-[#22c55e]/20 hover:shadow-lg hover:shadow-[#22c55e]/20",
            children: loading ? "Registrando..." : "CADASTRAR"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-xs text-slate-500 mt-6 text-center font-mono uppercase tracking-widest", children: /* @__PURE__ */ jsx(Link, { to: "/pautas", className: "text-[#22c55e] hover:text-[#16a34a] transition-colors", children: "Voltar ao Painel" }) })
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
const PlayoutRoute = Route$8.update({
  id: "/playout",
  path: "/playout",
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
  PlayoutRoute,
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
