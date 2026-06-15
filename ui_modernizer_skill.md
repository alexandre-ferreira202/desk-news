# SKILL: DeskNews UI Modernizer

## Objetivo

Modernizar interfaces do DeskNews como produto operacional de redação: rápido de escanear, elegante, responsivo, acessível e consistente em light/dark mode. Priorize clareza editorial, densidade organizada, status visíveis, tempo, autoria, prioridade e ações previsíveis.

O resultado deve parecer uma ferramenta profissional de newsroom, não uma landing page. Use sofisticação discreta: tipografia forte, superfícies limpas, microinterações úteis e hierarquia visual clara.

## Regras Obrigatórias Para React/TSX

- Modernize somente arquivos em `src/routes/` e componentes compartilhados necessários, salvo instrução explícita.
- Preserve lógica, queries Supabase, mutations, permissões, rotas e contratos existentes.
- Preserve e teste a opção de tema claro/escuro. O tema deve usar `data-theme` no `<html>` e persistir em `localStorage`.
- Nunca coloque comentários JSX dentro da abertura de uma tag, entre atributos, ou logo depois de `(` em callbacks.
- Evite comentários decorativos como `{/* Premium button */}` quando classes/componentes já explicam a intenção.
- Não use SVG manual quando houver ícone equivalente em `lucide-react`.
- Depois de alterar rotas, rode `npm.cmd run build`.

Exemplos:

```tsx
// Correto
{items.map((item) => (
  <Card key={item.id} item={item} />
))}

// Incorreto
{items.map((item) => ( {/* comment */}<Card /> ))}

// Incorreto
<button {/* comment */} onClick={fn}>
```

## Direção Visual

### Produto Editorial, Não SaaS Genérico

- Pautas, Redação, Espelho, Playout e TP são telas de operação: compacte sem apertar.
- Use layout denso para listas, tabelas, timelines, blocos e controles de playout.
- Evite hero grande, cards ornamentais demais e textos explicativos dentro do app.
- Mostre informação útil primeiro: retranca, status, horário, programa, responsável, duração e próxima ação.

### Superfícies

- `glassmorphism` apenas em shell, modais, filtros principais e painéis de destaque.
- Listas operacionais devem usar fundo sólido ou semi-sólido com bordas discretas.
- Não coloque cards dentro de cards. Use divisores, bandas, painéis ou tabelas.

### Raios

- Botões, inputs e selects: `rounded-xl`.
- Painéis, filtros e cards repetidos: `rounded-2xl`.
- Modais, login/cadastro e wrappers principais: `rounded-3xl`.
- Evite `rounded-[2.5rem]` salvo em telas de autenticação ou splash.

### Cores

Use sempre tokens semânticos:

```css
--bg-primary
--bg-secondary
--bg-tertiary
--bg-overlay
--bg-overlay-2
--text-primary
--text-secondary
--text-tertiary
--text-quaternary
--border-subtle
--border-light
--border-medium
--accent-primary
--accent-secondary
--accent-tertiary
--status-success
--status-warning
--status-error
--status-info
--glass-bg
--glass-border
--shadow-sm
--shadow-md
--shadow-lg
--shadow-xl
--shadow-2xl
```

Evite:

- `bg-zinc-*`, `text-zinc-*`, `border-white/*`, `bg-black`, `bg-white`, hex direto.
- Paleta dominada por roxo/azul. Azul é ação; vermelho é urgente/ao vivo; âmbar é atenção; verde é sucesso; ciano é informação secundária.
- Gradientes decorativos grandes. Use gradiente só em títulos especiais, CTA principal ou indicador de progresso.

### Tema Claro/Escuro

- Sempre mantenha os dois temas legíveis.
- O controle de tema deve ser icon-only com `Sun`/`Moon` de `lucide-react`, `aria-label` e `title`.
- Não use texto fixo `text-white`, `bg-black`, `bg-white` fora de CTAs onde o contraste é intencional.
- `Toaster`, modais, popovers e menus devem seguir o tema ativo.
- Ao alterar tokens, confira `:root`, `[data-theme="light"]` e `[data-theme="dark"]`.

## Tipografia

Use a hierarquia:

```css
.text-display-xl /* contadores grandes, 404, timers */
.text-display-lg /* KPIs grandes */
.text-h1         /* título de página */
.text-h2         /* título de modal/painel */
.text-h3         /* seção ou card importante */
.text-body-lg
.text-body
.text-body-sm
.text-caption
.text-label
```

Regras:

- Não use letter spacing negativo.
- Use `font-mono` para horários, retrancas, contadores, duração e códigos.
- Labels operacionais podem ser uppercase, mas corpo de texto deve permanecer legível.

## Padrões TSX Reutilizáveis

### Page Header

```tsx
<header className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-3">
  <Icon className="h-5 w-5 text-[var(--text-quaternary)]" />
  <h1 className="text-h1 font-bold text-[var(--text-primary)]">Título</h1>
  <span className="hidden sm:inline text-label text-[var(--text-tertiary)]">Contexto</span>
</header>
```

### Painel

```tsx
<section className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-secondary)] p-5 shadow-[var(--shadow-md)]">
  {children}
</section>
```

Use `bg-[var(--glass-bg)] backdrop-blur-xl border-[var(--glass-border)]` somente para modais, shell e filtros principais.

### Campo

```tsx
<label className="text-label text-[var(--text-quaternary)]">Programa</label>
<select className="w-full rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)] px-4 py-3 text-body-sm text-[var(--text-primary)] transition-all duration-300 focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10">
  {options}
</select>
```

### Botão Primário

```tsx
<button className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-primary)] px-5 py-3 text-body-sm font-semibold text-white shadow-[var(--shadow-md)] transition-all duration-300 hover:shadow-[var(--shadow-lg)] active:scale-[0.98] disabled:opacity-50">
  <Icon className="h-4 w-4" />
  Ação
</button>
```

### Badge De Status

```tsx
<span className="rounded-full border border-[var(--status-success)]/20 bg-[var(--status-success)]/10 px-2.5 py-1 text-label text-[var(--status-success)]">
  Publicado
</span>
```

## Densidade Por Tela

- Login/Cadastro: mais espaço, painel central, `rounded-3xl`, uma ação primária.
- Pautas: grid/listas escaneáveis, cards compactos, filtros claros, formulários por seções.
- Redação: sidebar densa, editor com painéis sólidos, ações fixas e estados evidentes.
- Espelho: tabelas e blocos compactos, tempo editorial em destaque, botões de operação visíveis.
- Playout: interface de controle; priorize contraste, timers, preview/program, estados on-air e botões grandes.
- TP: alto contraste e legibilidade; modernize chrome/controles, mas não sacrifique leitura.
- Métricas/Relatórios/Pesquisa: filtros em painel, cards/tabelas limpos, estados vazios úteis.

## Acessibilidade E Interação

- Todo botão ícone-only precisa de `aria-label`.
- Inputs e selects precisam de `label` visível ou `aria-label`.
- Estados `hover`, `focus-visible`, `disabled`, loading e vazio devem ser tratados.
- Use `active:scale-[0.98]` em ações clicáveis.
- Não esconda informação essencial apenas em hover.

## Checklist De Entrega

- Build passou com `npm.cmd run build`.
- Não há comentários JSX inválidos.
- Não há novos hardcoded colors em rotas.
- A tela funciona em mobile e desktop.
- Textos não estouram botões, badges ou cards.
- Light/dark mode continuam legíveis.
- O padrão visual favorece operação editorial, não decoração.
