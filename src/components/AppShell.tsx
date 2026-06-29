import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutGrid, FileText, MonitorPlay, BarChart3, LogOut,
  Newspaper, ClipboardList, Menu, X, Sun, Moon, Film,
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { useTheme } from "@/routes/__root";
import { getSession, signOut } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";

const nav = [
  { to: "/pautas",     label: "Pautas",       icon: LayoutGrid },
  { to: "/redacao",    label: "Reportagens",   icon: FileText },
  { to: "/espelho",    label: "Espelho",       icon: MonitorPlay },
  { to: "/relatorios", label: "Relatorios",    icon: ClipboardList },
  { to: "/metricas",   label: "Metricas",      icon: BarChart3 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const session = getSession();
    // Guard: redireciona para login se não autenticado (exceto na própria /login)
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

  const sidebar = (
    <>
      <div className="px-5 py-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20">
              <Newspaper className="h-4 w-4 text-[var(--accent-primary)]" />
            </div>
            <span className="font-mono uppercase tracking-widest text-body-sm text-[var(--text-primary)]">DeskNews</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-label text-[var(--text-tertiary)]">
            <span className="live-dot" /> Ao vivo
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="md:hidden p-1.5 rounded-xl text-[var(--text-tertiary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-all"
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const active = path.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-body-sm transition-all duration-300 active:scale-[0.98] ${
                active
                  ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 shadow-[var(--shadow-sm)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] border border-transparent"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Editor de Mídia */}
        <button
          onClick={() => { window.open("/DeskNews_Media_Editor_12.html", "_blank", "noopener,noreferrer"); setOpen(false); }}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-body-sm transition-all duration-300 active:scale-[0.98] text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] border border-transparent"
        >
          <Film className="h-4 w-4" />
          <span>Edição</span>
        </button>
      </nav>

      <div className="p-3 border-t border-[var(--border-subtle)]">
        <div className="px-2 pb-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-body-sm font-medium truncate text-[var(--text-primary)]">
              {user?.nome ?? "—"}
            </div>
            <div className="text-label text-[var(--text-tertiary)] truncate">
              {user?.papel?.replace("_", " ").toUpperCase() ?? "SEM PAPEL"}
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xl text-[var(--text-tertiary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-all shrink-0"
            aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
          >
            {theme === "dark"
              ? <Sun className="h-4 w-4 text-[var(--status-warning)]" />
              : <Moon className="h-4 w-4 text-[var(--accent-primary)]" />
            }
          </button>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-body-sm text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-all active:scale-[0.98]"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>

        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] px-2 flex flex-col gap-0.5">
          <span className="text-[9px] uppercase tracking-widest text-[var(--text-quaternary)] font-mono">Desenvolvido por</span>
          <span className="text-caption font-mono uppercase tracking-widest text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors">
            Alexandre Ferreira
          </span>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex w-full bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <aside className="hidden md:flex w-64 shrink-0 bg-[var(--glass-bg)] backdrop-blur-xl border-r border-[var(--glass-border)] flex-col shadow-[var(--shadow-lg)]">
        {sidebar}
      </aside>

      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-[var(--bg-primary)]/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative w-64 max-w-[80vw] bg-[var(--glass-bg)] backdrop-blur-xl border-r border-[var(--glass-border)] flex flex-col animate-in slide-in-from-left">
            {sidebar}
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b border-[var(--border-subtle)] flex items-center px-3 sm:px-6 gap-3 sm:gap-4 bg-[var(--glass-bg)] backdrop-blur-xl">
          <button
            onClick={() => setOpen(true)}
            className="md:hidden p-1.5 -ml-1 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="font-mono text-caption uppercase tracking-widest text-[var(--text-tertiary)] truncate">
            <span className="hidden sm:inline">
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
            </span>
            <span className="sm:hidden">{new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
          </div>
          <div className="flex-1 ticker-line h-px" />
          <div className="font-mono text-caption uppercase tracking-widest text-[var(--accent-primary)]">redacao</div>
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
