---
name: newsflow-design-system
description: >
  Design system e tokens visuais do projeto Newsflow Studio (DeskNews / Redação).
  Use este skill SEMPRE que o usuário pedir para criar, estilizar, refatorar ou
  modificar qualquer página, componente, tela ou UI do projeto — mesmo que não
  mencione explicitamente "design system". Triggers: "cria uma tela", "faz no
  estilo do projeto", "nova página", "adiciona componente", "aplica o tema",
  "segue o design", "refatora para o estilo da Redação", "igual ao print".
  O output deve sempre seguir os tokens, estrutura e padrões definidos abaixo —
  nunca use cores, fontes ou layouts fora deste sistema sem justificativa explícita.
---

# Newsflow Studio — Design System

Sistema de design para todas as páginas e componentes do **Newsflow Studio** (produto interno de redação jornalística). Este documento é a fonte da verdade para qualquer trabalho de UI no projeto.

---

## 1. Identidade Visual

**Conceito:** Interface de redação profissional. Dark, densa, funcional. Verde néon como único acento — sinal de vida num ambiente escuro. Sem decoração desnecessária; cada pixel serve a uma função editorial.

**Signature element:** Retrancas sempre em `font-mono uppercase font-bold text-[#22c55e]` — o verde monospace é a identidade reconhecível do sistema em qualquer tela.

---

## 2. Tokens de Cor

```
PALETA BASE
──────────────────────────────────────────────
bg-primary      #0f1117   fundo principal de página
bg-surface      white/3   superfície de card / painel (bg-white/3)
bg-overlay      white/5   camada sobre surface (hover, inputs)
bg-hover        white/6   estado hover de itens interativos

BORDAS
──────────────────────────────────────────────
border-default  white/8   borda padrão de containers
border-subtle   white/6   borda entre itens de lista (dividers)
border-input    white/10  borda de inputs e selects
border-active   #22c55e/30  borda quando elemento está selecionado/ativo
border-focus    #22c55e/60  borda no focus de inputs

ACENTO (use APENAS verde — nenhuma outra cor de acento)
──────────────────────────────────────────────
accent          #22c55e   verde principal (labels, ícones, badges, retrancas)
accent-dim      #22c55e/15  fundo de badge / botão ghost verde
accent-hover    #16a34a   hover de botão primário verde
accent-border   #22c55e/25  borda de elementos com acento

TEXTO
──────────────────────────────────────────────
text-primary    white      títulos, retrancas, conteúdo principal
text-secondary  white/70   corpo de texto normal
text-muted      white/40   metadados, labels secundárias
text-faint      white/30   timestamps, contagens, placeholders visuais
text-placeholder white/25  placeholder de inputs

DESTRUTIVO
──────────────────────────────────────────────
destructive     red-400 / red-500  ações de deleção (só no hover)
```

---

## 3. Tipografia

```
FAMÍLIAS
──────────────────────────────────────────────
Display / Identidade   font-mono  (Courier / monospace do sistema)
Corpo / UI             font-sans  (padrão Tailwind)

ESCALA DE TEXTO
──────────────────────────────────────────────
Micro label     text-[10px] uppercase tracking-[.18em] ou tracking-widest
Small           text-xs  (12px)
Body            text-sm  (14px)
Medium          text-base (16px)   — raramente usado
Heading         text-xl font-bold  — apenas em modais

PADRÕES FIXOS
──────────────────────────────────────────────
Retranca        font-mono uppercase font-bold text-sm text-[#22c55e]
Label de seção  font-mono text-[10px] uppercase tracking-[.18em] text-[#22c55e] font-bold
Metadado        font-mono text-xs text-white/30
Título de modal text-sm font-bold font-mono uppercase tracking-widest text-white
Input text      text-sm text-white
Placeholder     text-white/25
```

---

## 4. Componentes Base

### 4.1 Input / Select / Textarea

```tsx
// Classe padrão — use sempre esta variável
const inputCls = [
  "w-full",
  "bg-white/5 border border-white/10 rounded-md",
  "px-3 py-2 text-sm text-white",
  "outline-none",
  "focus:border-[#22c55e]/60 focus:bg-white/8",
  "transition-colors",
  "placeholder:text-white/25",
].join(" ");

// Variante monospace (retrancas, horários, datas)
const inputMonoCls = inputCls + " font-mono uppercase";

// Select herda o mesmo inputCls
// Textarea herda o mesmo inputCls
```

### 4.2 Label

```tsx
// Sempre acima de inputs
const labelCls = "text-[10px] uppercase tracking-[.18em] text-[#22c55e] font-bold mb-1 block font-mono";

function Label({ children }: { children: React.ReactNode }) {
  return <label className={labelCls}>{children}</label>;
}
```

### 4.3 Botões

```tsx
// Primário (ação principal da tela)
"bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold font-mono text-xs uppercase tracking-wider"

// Secundário / outline
"bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white text-xs font-mono uppercase tracking-wider"

// Ghost verde (ex: "+ Nova matéria" sidebar)
// fundo verde sólido, texto preto — é o CTA primário da sidebar
"bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold w-full"

// Ghost sutil (cancelar, fechar)
"text-white/40 hover:text-white text-xs font-mono"

// Destrutivo (só no hover, nunca visível de início)
"opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-opacity"

// Ícone de ação (editar)
"p-1.5 rounded-md hover:bg-white/10 text-white/40 hover:text-[#22c55e] transition-all"
```

### 4.4 Block (Seção de formulário numerada)

```tsx
// Componente padrão para agrupar campos relacionados
// n = número da seção ("1", "2", etc)
// Faixa verde vertical à esquerda é a signature visual
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

### 4.5 Card de item em lista (sidebar / resultados)

```tsx
// Estado normal
"w-full text-left p-2.5 rounded-lg border border-white/6 hover:border-white/15 bg-white/3 hover:bg-white/6 transition-all"

// Estado ativo/selecionado
"border-[#22c55e]/50 bg-[#22c55e]/8"

// Dentro do card:
// Linha 1: retranca
<div className="font-mono uppercase text-xs text-[#22c55e] truncate font-bold">{retranca}</div>
// Linha 2: título / subtítulo
<div className="text-xs text-white/40 truncate mt-0.5">{titulo}</div>
// Linha 3: meta (data, status)
<div className="text-[10px] text-white/30 font-mono mt-0.5">{meta}</div>
```

### 4.6 Badge / Tag de status

```tsx
// Status (PUBLICADO, RASCUNHO, etc.)
// Verde para publicado:
"text-[10px] font-mono uppercase tracking-widest text-[#22c55e]"
// Neutro (outros status):
"text-[10px] font-mono uppercase tracking-widest text-white/35"

// Badge de programa/tipo (pill pequeno)
"text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/8 text-white/40 font-mono"
```

### 4.7 Divider entre itens de lista

```tsx
// Use divide-y para listas densas
"divide-y divide-white/5"

// Ou border-b para itens individuais
"border-b border-white/6 pb-2"
```

### 4.8 Modal / Overlay

```tsx
// Backdrop
"fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"

// Container do modal
"bg-[#0f1117] border border-white/10 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-auto shadow-2xl"

// Header do modal (sticky)
"px-6 py-4 border-b border-white/8 flex items-start justify-between gap-4 sticky top-0 bg-[#0f1117]"

// Título do modal
"text-sm font-bold font-mono uppercase tracking-widest text-white"

// Micro-label dentro do modal
"text-[10px] uppercase tracking-widest text-[#22c55e] mb-1 font-mono"
```

### 4.9 Painel vazio (empty state)

```tsx
"rounded-xl border border-white/8 bg-white/3 p-12 text-center text-white/25 font-mono text-sm"
// Mensagem direta, sem emoção: "Selecione um item ou crie um novo."
```

---

## 5. Layout de Página

### 5.1 Estrutura geral

```
┌─────────────────────────────────────────────────────────┐
│  HEADER STICKY (bg-[#0f1117]/95 backdrop-blur border-b) │
│  ┌──────────────────┐  ┌──────────────────────────────┐ │
│  │ ícone + título   │  │ tabs de navegação            │ │
│  └──────────────────┘  └──────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  CONTENT  p-4 sm:p-6                                    │
│  (varia por layout — ver abaixo)                        │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Header padrão de página

```tsx
<div className="border-b border-white/8 bg-[#0f1117]/95 backdrop-blur-sm sticky top-0 z-40">
  {/* Identidade */}
  <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center">
        <Icon className="h-4 w-4 text-[#22c55e]" />
      </div>
      <div>
        <h1 className="font-mono font-bold uppercase tracking-[.25em] text-sm text-white leading-none">
          {titulo}
        </h1>
        <span className="text-[10px] uppercase tracking-widest text-white/30 font-mono">
          {subtitulo}
        </span>
      </div>
    </div>
    {/* Ações opcionais no header */}
  </div>

  {/* Tabs de navegação */}
  <nav className="flex gap-0 overflow-x-auto px-4 sm:px-6">
    {tabs.map(({ k, label, icon: Icon }) => (
      <button
        key={k}
        onClick={() => setTab(k)}
        className={cn(
          "flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-[11px] font-mono uppercase tracking-[.15em] border-b-2 transition-all whitespace-nowrap",
          tab === k
            ? "border-[#22c55e] text-[#22c55e]"
            : "border-transparent text-white/40 hover:text-white/70 hover:border-white/20"
        )}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden sm:inline">{label}</span>
      </button>
    ))}
  </nav>
</div>
```

### 5.3 Layouts de conteúdo

**Layout A — Sidebar + detalhe** (ex: lista de matérias + editor)
```
grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5
├── aside  (bg-white/3 rounded-xl border border-white/8 p-4)
└── section (conteúdo principal)
```

**Layout B — Formulário lateral + lista** (ex: novo aviso + lista)
```
grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4
├── form   (bg-white/3 rounded-xl border border-white/8 border-l-2 border-l-[#22c55e] p-4)
└── div    (lista de itens)
```

**Layout C — Grid de colunas** (ex: quadro semanal)
```
grid grid-cols-[120px_1fr_1fr] gap-2
```

**Layout D — Página inteira com seções** (ex: formulário de pauta)
```
space-y-4
├── Block n="1" title="Identificação"
├── Block n="2" title="Equipe Técnica"
├── Block n="3" title="Dados da Fonte"
└── Block n="4" title="Conteúdo"
```

---

## 6. Sidebar de Navegação Global

```
┌─────────────────────────────┐
│ [ícone]  REDAÇÃO            │  ← font-mono bold uppercase
├─────────────────────────────┤
│ 🔍 BUSCAR MATÉRIA...        │  ← input bg-white/5 border-white/10
├─────────────────────────────┤
│ [+ NOVA MATÉRIA]            │  ← btn bg-[#22c55e] text-black w-full
├─────────────────────────────┤
│ TÍTULO DA MATÉRIA...        │  ← card ativo: border-l-2 border-[#22c55e]
│ RASCUNHO  23/06/2026        │    card normal: border-white/6
│                             │
│ ESTUPRO IDOSA               │
│ PUBLICADO  23/06/2026       │
└─────────────────────────────┘
```

**Card de matéria na sidebar:**
```tsx
<div className={cn(
  "border-l-2 p-3 cursor-pointer transition-all",
  ativo
    ? "border-l-[#22c55e] bg-white/5"
    : "border-l-transparent hover:border-l-white/20 hover:bg-white/3"
)}>
  <div className="font-mono uppercase font-bold text-sm text-white truncate">{titulo}</div>
  <div className="text-[10px] font-mono uppercase text-[#22c55e] mt-0.5">{status}</div>
  <div className="text-[10px] font-mono text-white/30 mt-0.5">{data}</div>
</div>
```

---

## 7. Regras de Aplicação

### O que SEMPRE fazer
- Fundo de página: `bg-[#0f1117]` — nunca branco, cinza claro, ou `var(--bg-primary)`
- Retrancas e identificadores: `font-mono uppercase font-bold text-[#22c55e]`
- Labels de campo: `text-[10px] uppercase tracking-[.18em] font-mono text-[#22c55e]`
- Inputs: sempre `bg-white/5 border-white/10` com focus verde
- Bordas de containers: `border-white/8` (nunca `border-gray-*` ou `border-zinc-*`)
- Botão primário: `bg-[#22c55e] text-black font-bold`
- Espaço de seção: `rounded-xl` (não `rounded-md` nem `rounded-lg` para containers principais)
- Sticky header com `backdrop-blur-sm`

### O que NUNCA fazer
- Usar `var(--accent-primary)`, `var(--bg-secondary)`, `var(--border-light)` ou qualquer CSS custom property do tema global
- Usar cores de acento que não sejam `#22c55e` (sem azul, laranja, roxo, etc.)
- Usar `bg-zinc-*`, `bg-gray-*`, `bg-neutral-*` para superfícies
- Usar `border-gray-*`, `border-zinc-*` para bordas
- Usar `text-gray-*` para texto (use `text-white/XX` com opacidade)
- `rounded-2xl` em cards pequenos (reservado apenas para contextos especiais)
- Fontes bold sem `font-mono` em retrancas
- Emojis ou ícones coloridos (ícones sempre `text-[#22c55e]` ou `text-white/40`)
- Shadows excessivas (apenas `shadow-2xl` em modais)

---

## 8. Padrão de Tela Nova

Ao criar uma nova página/tela, siga esta ordem:

1. **Wrapper:** `<div className="min-h-screen bg-[#0f1117] text-white">`
2. **Header sticky** com ícone + título monospace + subtítulo apagado
3. **Tabs de nav** (se a tela tiver sub-seções)
4. **Content:** `<div className="p-4 sm:p-6">`
5. **Layout** adequado (A, B, C ou D conforme a necessidade)
6. **Containers** com `bg-white/3 rounded-xl border border-white/8`
7. **Seções de formulário** usando `<Block>` com faixa verde lateral
8. **Botão primário** verde em posição de destaque (topo direito ou rodapé do form)

---

## 9. Checklist antes de entregar

- [ ] Fundo da página é `#0f1117`?
- [ ] Nenhum `var(--)` restante no código?
- [ ] Retrancas em `font-mono uppercase text-[#22c55e]`?
- [ ] Labels em `text-[10px] tracking-[.18em] font-mono`?
- [ ] Inputs com `bg-white/5 border-white/10 focus:border-[#22c55e]/60`?
- [ ] Botão primário com `bg-[#22c55e] text-black font-bold`?
- [ ] Containers com `rounded-xl border-white/8`?
- [ ] Modais com backdrop `bg-black/70`?
- [ ] Nenhuma cor de acento além de verde `#22c55e`?
- [ ] Textos secundários com `text-white/40` ou `text-white/30`?
