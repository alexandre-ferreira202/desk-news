/**
 * DeskNews Design System - Design Tokens & Constants
 * Master Control TV Theme - Signal Green (#22c55e)
 * 
 * Este arquivo centraliza todos os tokens de design para padronização
 * Use essas constantes em todas as páginas para garantir consistência
 */

// ========================================
// CORES (Master Control TV Theme)
// ========================================
export const COLORS = {
  // Backgrounds
  bg: {
    primary: "#09090b",      // Preto profundo (base)
    secondary: "#0f1117",    // Preto+1
    tertiary: "#141416",     // Preto+2
    quaternary: "#1a1a1e",   // Preto+3
    overlay: "#0f0f12",      // Para overlays
    overlay2: "#1a1a21",     // Para overlays secundários
  },

  // Text
  text: {
    primary: "#f1f5f9",      // Branco puro (headings)
    secondary: "#cbd5e1",    // Branco-ish (corpo)
    tertiary: "#94a3b8",     // Cinza claro
    quaternary: "#64748b",   // Cinza médio
    muted: "#475569",        // Cinza escuro
  },

  // Accent - Signal Green
  accent: {
    primary: "#22c55e",      // Verde principal
    light: "#4ade80",        // Verde claro
    dark: "#16a34a",         // Verde escuro
    muted: "#15803d",        // Verde muito escuro
  },

  // Status
  status: {
    success: "#22c55e",      // Verde
    warning: "#f59e0b",      // Laranja
    error: "#ef4444",        // Vermelho
    info: "#3b82f6",         // Azul
  },

  // Borders
  border: {
    subtle: "rgba(34, 197, 94, 0.08)",    // Muito sutil
    light: "rgba(34, 197, 94, 0.15)",     // Leve
    medium: "rgba(34, 197, 94, 0.25)",    // Médio
    strong: "rgba(34, 197, 94, 0.35)",    // Forte
  },

  // White opacity variants (para facilitar uso com Tailwind)
  white: {
    3: "rgba(255, 255, 255, 0.03)",
    5: "rgba(255, 255, 255, 0.05)",
    6: "rgba(255, 255, 255, 0.06)",
    8: "rgba(255, 255, 255, 0.08)",
    10: "rgba(255, 255, 255, 0.10)",
    15: "rgba(255, 255, 255, 0.15)",
    20: "rgba(255, 255, 255, 0.20)",
    25: "rgba(255, 255, 255, 0.25)",
  },
};

// ========================================
// TIPOGRAFIA
// ========================================
export const TYPOGRAPHY = {
  // Font families
  fontFamily: {
    mono: '"JetBrains Mono", "Courier New", monospace',
    sans: 'system-ui, -apple-system, sans-serif',
  },

  // Font sizes
  fontSize: {
    xs: "0.75rem",      // 12px
    sm: "0.875rem",     // 14px
    base: "1rem",       // 16px
    lg: "1.0625rem",    // 17px
    xl: "1.25rem",      // 20px
    "2xl": "1.5rem",    // 24px
    "3xl": "1.875rem",  // 30px
    "4xl": "2.5rem",    // 40px
  },

  // Font weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tight: "-0.02em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
};

// ========================================
// ESPAÇAMENTO
// ========================================
export const SPACING = {
  xs: "0.25rem",  // 4px
  sm: "0.5rem",   // 8px
  md: "1rem",     // 16px
  lg: "1.5rem",   // 24px
  xl: "2rem",     // 32px
  "2xl": "3rem",  // 48px
  "3xl": "4rem",  // 64px
};

// ========================================
// BORDER RADIUS
// ========================================
export const BORDER_RADIUS = {
  none: "0px",
  sm: "0.375rem",  // 6px
  md: "0.5rem",    // 8px
  lg: "0.75rem",   // 12px
  xl: "1rem",      // 16px
  full: "9999px",
};

// ========================================
// SOMBRAS
// ========================================
export const SHADOWS = {
  xs: "0 1px 2px 0 rgba(0, 0, 0, 0.5)",
  sm: "0 1px 3px 0 rgba(0, 0, 0, 0.6), 0 1px 2px 0 rgba(0, 0, 0, 0.5)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.7), 0 2px 4px -1px rgba(0, 0, 0, 0.6)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.8), 0 4px 6px -2px rgba(0, 0, 0, 0.7)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.9), 0 10px 10px -5px rgba(0, 0, 0, 0.8)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 1)",
  glow: "0 0 20px rgba(34, 197, 94, 0.3)",
  glowSm: "0 0 10px rgba(34, 197, 94, 0.2)",
};

// ========================================
// TRANSIÇÕES
// ========================================
export const TRANSITIONS = {
  fast: "150ms ease-in-out",
  normal: "250ms ease-in-out",
  slow: "350ms ease-in-out",
  easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
};

// ========================================
// BREAKPOINTS (Responsive)
// ========================================
export const BREAKPOINTS = {
  xs: "0px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

// ========================================
// COMPONENTES - CLASSES REUTILIZÁVEIS
// ========================================

/**
 * INPUT CLASSES
 * Use para inputs, textareas e selects
 */
export const INPUT_CLASSES = {
  base: "w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-[#22c55e]/60 focus:bg-white/8 transition-colors placeholder:text-white/25",
  small: "px-2.5 py-1.5 text-xs",
  large: "px-4 py-3 text-base",
  error: "border-red-500 bg-red-500/5 focus:border-red-500",
};

/**
 * LABEL CLASSES
 * Use para labels de formulários
 */
export const LABEL_CLASSES = {
  base: "text-[10px] uppercase tracking-[.18em] text-[#22c55e] font-bold mb-1 block font-mono",
  secondary: "text-[10px] uppercase tracking-widest text-white/35 font-mono",
};

/**
 * BOTÃO CLASSES
 */
export const BUTTON_CLASSES = {
  primary: "bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold font-mono text-xs uppercase tracking-wider",
  secondary: "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white text-xs font-mono uppercase tracking-wider",
  tertiary: "bg-transparent border border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e]/10 text-xs font-mono uppercase tracking-wider",
  ghost: "bg-transparent text-white/70 hover:text-white hover:bg-white/5 text-xs font-mono uppercase tracking-wider",
  danger: "bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-xs font-mono uppercase tracking-wider",
  success: "bg-[#22c55e]/20 hover:bg-[#22c55e]/30 border border-[#22c55e]/30 text-[#22c55e] text-xs font-mono uppercase tracking-wider",
};

/**
 * CARD CLASSES
 * Use para cards e containers
 */
export const CARD_CLASSES = {
  base: "bg-white/3 rounded-xl border border-white/8",
  elevated: "bg-white/5 rounded-xl border border-white/10 shadow-lg",
  interactive: "bg-white/3 rounded-lg border border-white/6 hover:border-white/15 hover:bg-white/6 transition-all",
  header: "px-6 py-4 border-b border-white/8",
  body: "p-6 space-y-5",
};

/**
 * CONTAINER CLASSES
 */
export const CONTAINER_CLASSES = {
  page: "min-h-screen bg-[#0f1117] text-white",
  section: "px-4 sm:px-6 py-3",
  content: "p-4 sm:p-6",
};

/**
 * MODAL CLASSES
 */
export const MODAL_CLASSES = {
  backdrop: "fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50",
  container: "bg-[#0f1117] border border-white/10 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-auto shadow-2xl",
  header: "px-6 py-4 border-b border-white/8 flex items-start justify-between gap-4 sticky top-0 bg-[#0f1117]",
};

/**
 * GRID/LAYOUT CLASSES
 */
export const LAYOUT_CLASSES = {
  tabBar: "flex gap-0 overflow-x-auto px-4 sm:px-6",
  tabButton: "flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-[11px] font-mono uppercase tracking-[.15em] border-b-2 transition-all whitespace-nowrap",
  tabButtonActive: "border-[#22c55e] text-[#22c55e]",
  tabButtonInactive: "border-transparent text-white/40 hover:text-white/70 hover:border-white/20",
};

/**
 * BLOCK COMPONENT (Seção numerada)
 */
export const BLOCK_CLASSES = {
  container: "bg-white/3 rounded-xl border border-white/8 p-5 relative overflow-hidden",
  header: "flex items-center justify-between mb-4",
  number: "flex items-center justify-center w-5 h-5 rounded bg-[#22c55e]/15 text-[#22c55e] text-[10px] font-bold font-mono border border-[#22c55e]/25",
  title: "text-[10px] uppercase tracking-[.2em] text-[#22c55e] font-bold font-mono",
};

// ========================================
// UTILITÁRIOS
// ========================================

/**
 * Combinar classes com segurança (tipo clsx)
 */
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Gerar classe de animação padrão
 */
export function getTransitionClass(property: "all" | "color" | "bg" | "border" = "all"): string {
  return `transition-${property} ${TRANSITIONS.normal}`;
}

/**
 * Gerar classe de focus ring (padrão)
 */
export const FOCUS_CLASSES = "outline-none focus:border-[#22c55e]/60 focus:bg-white/8 focus:ring-2 focus:ring-[#22c55e]/20";

/**
 * Variantes de bordas coloridas (lado esquerdo)
 */
export const BORDER_LEFT_ACCENT = "border-l-4 border-l-[#22c55e]";

/**
 * Animação de pulsação (padrão DeskNews)
 */
export const PULSE_ANIMATION = "animate-pulse opacity-100 hover:opacity-75 transition-opacity";
