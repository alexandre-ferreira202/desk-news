import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useRouterState, useNavigate, Link, createRootRouteWithContext, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, redirect, createRouter } from "@tanstack/react-router";
import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect, createContext, useContext } from "react";
import { Toaster } from "sonner";
import { Newspaper, X, LayoutGrid, FileText, MonitorPlay, ClipboardList, BarChart3, Film, Sun, Moon, LogOut, Menu } from "lucide-react";
import { Client, neonConfig } from "@neondatabase/serverless";
const appCss = "/assets/styles-Fqq_fQGG.css";
if (typeof process !== "undefined" && process.versions?.node) {
  neonConfig.webSocketConstructor = require("ws");
}
const DATABASE_URL = "postgresql://neondb_owner:npg_Dh7rLgCm2cyW@ep-weathered-pine-ac2fsgd5-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
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
const nav = [
  { to: "/pautas", label: "Pautas", icon: LayoutGrid },
  { to: "/redacao", label: "Reportagens", icon: FileText },
  { to: "/espelho", label: "Espelho", icon: MonitorPlay },
  { to: "/relatorios", label: "Relatorios", icon: ClipboardList },
  { to: "/metricas", label: "Metricas", icon: BarChart3 }
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
const $$splitComponentImporter$a = () => import("./tp-DadWik8I.js");
const Route$b = createFileRoute("/tp")({
  validateSearch: (search) => {
    return {
      date: search.date || void 0,
      programa: search.programa || void 0
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$a, "component"),
  head: () => ({
    meta: [{
      title: "Teleprompter — DeskNews"
    }]
  })
});
const $$splitComponentImporter$9 = () => import("./relatorios-BKugge4W.js");
const Route$a = createFileRoute("/relatorios")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component"),
  head: () => ({
    meta: [{
      title: "Relatórios — Newsdesk"
    }]
  })
});
const $$splitErrorComponentImporter = () => import("./redacao-iGXafnfG.js");
const $$splitComponentImporter$8 = () => import("./redacao-CEfg1vX-.js");
const Route$9 = createFileRoute("/redacao")({
  validateSearch: (search) => {
    return {
      edit: search.edit || void 0
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$8, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
  head: () => ({
    meta: [{
      title: "Redação — DeskNews"
    }]
  })
});
const $$splitComponentImporter$7 = () => import("./playout-hio92ERG.js");
const Route$8 = createFileRoute("/playout")({
  validateSearch: (search) => {
    return {
      date: search.date || void 0,
      programa: search.programa || void 0
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$7, "component"),
  head: () => ({
    meta: [{
      title: "Exibição (PGM) — DeskNews"
    }]
  })
});
const $$splitComponentImporter$6 = () => import("./pesquisa-CYVDF7Vo.js");
const Route$7 = createFileRoute("/pesquisa")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component"),
  head: () => ({
    meta: [{
      title: "Pesquisa Geral - DeskNews"
    }]
  })
});
const $$splitComponentImporter$5 = () => import("./pautas-DB_M38xY.js");
const Route$6 = createFileRoute("/pautas")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component"),
  head: () => ({
    meta: [{
      title: "Pautas — DeskNews"
    }]
  })
});
const $$splitComponentImporter$4 = () => import("./metricas-DbjSYuM8.js");
const Route$5 = createFileRoute("/metricas")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component"),
  head: () => ({
    meta: [{
      title: "Métricas — Newsdesk"
    }]
  })
});
const $$splitComponentImporter$3 = () => import("./login-Bx-G0mk-.js");
const Route$4 = createFileRoute("/login")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component"),
  head: () => ({
    meta: [{
      title: "Entrar - DeskNews"
    }]
  })
});
const $$splitComponentImporter$2 = () => import("./espelho-BynZqV-D.js");
const Route$3 = createFileRoute("/espelho")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component"),
  head: () => ({
    meta: [{
      title: "Espelho — DeskNews"
    }]
  }),
  ssr: false
});
const $$splitComponentImporter$1 = () => import("./dashboard-BWBRzEwR.js");
const Route$2 = createFileRoute("/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component"),
  head: () => ({
    meta: [{
      title: "Dashboard - DeskNews"
    }]
  })
});
const $$splitComponentImporter = () => import("./cadastro-Dua-QYyL.js");
const Route$1 = createFileRoute("/cadastro")({
  component: lazyRouteComponent($$splitComponentImporter, "component"),
  head: () => ({
    meta: [{
      title: "Cadastrar Integrante — DeskNews"
    }]
  })
});
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
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  AppShell as A,
  Route$b as R,
  Route$9 as a,
  Route$8 as b,
  Route$3 as c,
  db as d,
  getSession as g,
  router as r,
  signIn as s
};
