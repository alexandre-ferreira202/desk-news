# Newsflow Studio — Contexto do Projeto

## Stack
- React + TypeScript
- TanStack Router (file-based routing em `src/routes/`)
- TanStack Start (SSR)
- Supabase (banco de dados + auth)
- Tailwind CSS
- Lucide React (ícones)
- Sonner (toasts)
- shadcn/ui (componentes base: Button, Calendar, Popover)

---

## Design System — Regras obrigatórias

Todo código de UI gerado deve seguir este sistema. Nunca usar `var(--)`, `bg-gray-*`, `bg-zinc-*`, `border-gray-*` ou qualquer cor fora dos tokens abaixo.

### Cores

```
Fundo de página       bg-[#0f1117]
Superfície (card)     bg-white/3
Hover de superfície   bg-white/6
Input / select        bg-white/5
Borda padrão          border-white/8
Borda de input        border-white/10
Borda ativa/seleção   border-[#22c55e]/50
Foco de input         focus:border-[#22c55e]/60

Acento (ÚNICO)        #22c55e   (verde — nunca azul, laranja, roxo)
Acento dim            bg-[#22c55e]/15
Acento hover          bg-[#16a34a]

Texto principal       text-white
Texto secundário      text-white/70
Texto muted           text-white/40
Texto faint           text-white/30
Placeholder           text-white/25

Destrutivo (hover)    hover:text-red-400
```

### Tipografia

```
Retranca / ID         font-mono uppercase font-bold text-sm text-[#22c55e]
Label de campo        text-[10px] uppercase tracking-[.18em] font-mono text-[#22c55e] font-bold
Metadado / data       text-xs font-mono text-white/30
Título de modal       text-sm font-bold font-mono uppercase tracking-widest text-white
Micro badge           text-[10px] uppercase tracking-widest font-mono
```

### Classes reutilizáveis

```tsx
// Input padrão
const inputCls = "w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-[#22c55e]/60 focus:bg-white/8 transition-colors placeholder:text-white/25";

// Label padrão
const labelCls = "text-[10px] uppercase tracking-[.18em] text-[#22c55e] font-bold mb-1 block font-mono";

// Botão primário
"bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold font-mono text-xs uppercase tracking-wider"

// Botão secundário
"bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white text-xs font-mono"

// Card de lista (normal)
"w-full text-left p-2.5 rounded-lg border border-white/6 hover:border-white/15 bg-white/3 hover:bg-white/6 transition-all"

// Card de lista (ativo/selecionado)
"border-[#22c55e]/50 bg-[#22c55e]/8"

// Container / painel
"bg-white/3 rounded-xl border border-white/8"

// Backdrop de modal
"fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"

// Modal container
"bg-[#0f1117] border border-white/10 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-auto shadow-2xl"
```

### Componente Block (seção de formulário)

```tsx
const Block = ({ n, title, children, action }) => (
  <div className="bg-white/3 rounded-xl border border-white/8 p-5 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-[#22c55e] to-transparent opacity-70" />
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <span className="flex items-center justify-center w-5 h-5 rounded bg-[#22c55e]/15 text-[#22c55e] text-[10px] font-bold font-mono border border-[#22c55e]/25">
          {n}
        </span>
        <div className="text-[10px] uppercase tracking-[.2em] text-[#22c55e] font-bold font-mono">{title}</div>
      </div>
      {action}
    </div>
    <div className="relative z-10">{children}</div>
  </div>
);
```

### Header de página (padrão)

```tsx
<div className="border-b border-white/8 bg-[#0f1117]/95 backdrop-blur-sm sticky top-0 z-40">
  <div className="px-4 sm:px-6 py-3 flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center">
      <Icon className="h-4 w-4 text-[#22c55e]" />
    </div>
    <div>
      <h1 className="font-mono font-bold uppercase tracking-[.25em] text-sm text-white leading-none">{titulo}</h1>
      <span className="text-[10px] uppercase tracking-widest text-white/30 font-mono">{subtitulo}</span>
    </div>
  </div>
  {/* tabs opcionais */}
  <nav className="flex gap-0 overflow-x-auto px-4 sm:px-6">
    <button className="border-b-2 border-[#22c55e] text-[#22c55e] px-4 py-2.5 text-[11px] font-mono uppercase tracking-[.15em]">
      Tab ativa
    </button>
    <button className="border-b-2 border-transparent text-white/40 hover:text-white/70 px-4 py-2.5 text-[11px] font-mono uppercase tracking-[.15em]">
      Tab inativa
    </button>
  </nav>
</div>
```

### Wrapper de página

```tsx
// Todo arquivo de rota começa assim:
<div className="min-h-screen bg-[#0f1117] text-white">
  {/* header */}
  <div className="p-4 sm:p-6">
    {/* conteúdo */}
  </div>
</div>
```

### Layouts disponíveis

```
A — Sidebar + detalhe:    grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5
B — Form lateral + lista: grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4
C — Grid de colunas:      grid grid-cols-[120px_1fr_1fr] gap-2
D — Formulário em blocos: space-y-4 com componentes <Block>
```

---

## Estrutura de rotas

```
src/routes/
├── __root.tsx         layout raiz (sidebar global)
├── index.tsx          dashboard / home
├── pautas.tsx         controle de pautas
├── reportagens.tsx    editor de matérias
├── relatorios.tsx     relatórios
├── metricas.tsx       métricas
└── espelho.tsx        espelho do jornal
```

## Convenções de código

- Sempre `createFileRoute` do TanStack Router para novas rotas
- Estado local com `useState` + `useCallback` para funções assíncronas
- Queries ao Supabase sempre com tratamento de erro via `toast.error()`
- Formulários sem `<form>` nativa quando possível — usar `onClick` handlers
- Autosave via `localStorage` para rascunhos (chave: `draft_${id}`)
- Datas sempre formatadas com `toLocaleDateString("pt-BR")`
- Helper `ymd(date)` para formatar datas no padrão Supabase (`YYYY-MM-DD`)
