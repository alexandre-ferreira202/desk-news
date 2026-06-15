import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { Moon, Sun } from "lucide-react";

import appCss from "../styles.css?url";
import { AppShell } from "@/components/AppShell";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
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
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  errorComponent: ({ error, reset }) => (
    <div className="p-6 min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--accent-primary)]/30">
      <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-xl p-8 rounded-3xl max-w-2xl w-full shadow-[var(--shadow-2xl)]">
        <div className="text-label text-[var(--status-error)] mb-2">Falha no Aplicativo</div>
        <h2 className="text-h1 font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">Erro de Inicializacao</h2>
        <pre className="bg-[var(--bg-secondary)] p-4 rounded-2xl text-caption font-mono overflow-auto mb-6 border border-[var(--border-light)] whitespace-pre-wrap text-[var(--text-secondary)]">
          {error instanceof Error ? error.message : "Erro desconhecido"}
        </pre>
        <div className="flex gap-4 justify-end">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-2xl bg-[var(--status-error)] hover:bg-[var(--status-error)]/90 text-white text-body-sm font-bold transition-all active:scale-[0.98] shadow-[var(--shadow-lg)]"
          >
            Tentar Novamente
          </button>
          <a href="/" className="px-5 py-2.5 rounded-2xl bg-[var(--bg-overlay)] hover:bg-[var(--bg-overlay-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-body-sm font-bold transition-all active:scale-[0.98] border border-[var(--border-light)] text-center">
            Voltar para o Inicio
          </a>
        </div>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] px-6 text-center">
      <h1 className="text-display-xl font-black tracking-tight text-[var(--text-primary)] [background:linear-gradient(135deg,_var(--text-primary)_0%,_var(--text-secondary)_100%)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] [background-clip:text] mb-4">
        404
      </h1>
      <p className="text-body-lg text-[var(--text-tertiary)] mb-8">Pagina nao encontrada.</p>
      <a href="/" className="px-8 py-3 rounded-2xl bg-[var(--accent-primary)] text-white font-bold text-body transition-all duration-300 hover:shadow-[var(--shadow-xl)] active:scale-[0.98] shadow-[var(--shadow-lg)]">
        Voltar para o Inicio
      </a>
    </div>
  ),
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var stored = localStorage.getItem("desknews-theme");
                  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  var theme = stored || (prefersDark ? "dark" : "light");
                  document.documentElement.setAttribute("data-theme", theme);
                } catch (_) {}
              })();
            `,
          }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// Exporta o toggleTheme para o AppShell usar
export type ThemeContextType = {
  theme: "light" | "dark";
  toggleTheme: () => void;
};

import { createContext, useContext } from "react";
export const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  // Inicia com null para evitar hydration mismatch
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

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

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={{ theme: resolvedTheme, toggleTheme }}>
        <AppShell>
          <Outlet />
        </AppShell>
        <Toaster theme={resolvedTheme} position="top-right" richColors />
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
}
