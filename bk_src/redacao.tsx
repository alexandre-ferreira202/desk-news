import { createFileRoute, ErrorComponent } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
// CORREÇÃO: Removido o 'Trash2' que estava a causar erro de linter por não ser utilizado
import { Plus, FileText, MonitorPlay, Search, PenTool, Undo2, Redo2 } from "lucide-react";


type Status = "rascunho" | "revisao" | "publicado";

interface Materia {
  id: string;
  titulo: string;
  lide: string | null;
  corpo: string | null;
  status: Status;
  autor_id: string;
  pauta_id: string | null;
  updated_at: string;
  cabeca: string | null;
  tempo_vt: string | null;
  tempo_cab: string | null;
  deixa: string | null;
  editor_texto: string | null;
  editor_imagem: string | null;
  credito_reporter: string | null;
  estrutura: string | null;
  created_at?: string;
}

interface Pauta { 
  id: string; 
  titulo: string; 
}

interface HistoricoEntry {
  titulo: string;
  corpo: string;
  estrutura: string;
}

// CORREÇÃO: Tipo 'any' no erro evita quebras de compilação em diferentes versões do TanStack Router
function RouteErrorComponent({ error }: { error: any }) {
  const isModuleError = 
    error instanceof Error && 
    (error.message.includes('Failed to fetch dynamically imported module') || 
     error.message.includes('Importing a module script failed') ||
     error.message.includes('error loading dynamically imported module'));

  if (isModuleError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-6">
        <div className="bg-[var(--bg-overlay)] p-8 rounded-2xl border border-[var(--border-light)] shadow-xl max-w-md text-center">
          <h2 className="text-h2 font-bold mb-3">Atualização Disponível</h2>
          <p className="text-[var(--text-secondary)] mb-6 text-body-sm">
            Uma nova versão do DeskNews foi detectada ou houve uma interrupção na conexão. 
            Recarregue a página para continuar editando.
          </p>
          <button 
            type="button"
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white rounded-xl font-bold transition-all active:scale-[0.98]"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    );
  }

  return <ErrorComponent error={error} />;
}

export const Route = createFileRoute("/redacao")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      edit: (search.edit as string) || undefined,
    };
  },
  component: () => <RedacaoPage />,
  errorComponent: RouteErrorComponent,
  head: () => ({ meta: [{ title: "Redação — DeskNews" }] }),
});

function RedacaoPage() {
  const user = null;
  const { edit } = Route.useSearch();
  const navigate = Route.useNavigate();

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [pautas, setPautas] = useState<Pauta[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  const [selecionada, setSelecionada] = useState<Materia | null>(null);
  const [titulo, setTitulo] = useState("");
  const [corpo, setCorpo] = useState("");
  const [estrutura, setEstrutura] = useState("");
  const [status, setStatus] = useState<Status>("rascunho");
  const [pautaId, setPautaId] = useState<string>("");

  const [cabeca, setCabeca] = useState("");
  const [tempoVt, setTempoVt] = useState("");
  const [tempoCab, setTempoCab] = useState("");
  const [deixa, setDeixa] = useState("");
  const [editorTexto, setEditorTexto] = useState("");
  const [editorImagem, setEditorImagem] = useState("");
  const [creditoReporter, setCreditoReporter] = useState("");

  const [historico, setHistorico] = useState<HistoricoEntry[]>([]);
  const [indexHistorico, setIndexHistorico] = useState(-1);

  const estruturaRef = useRef<HTMLTextAreaElement>(null);

  const draftId = selecionada ? selecionada.id : "nova-materia-temp";

  // Função para inserir texto no cursor
  const inserirNoEstrutura = (texto: string) => {
    if (!estruturaRef.current) return;
    
    const textarea = estruturaRef.current;
    const inicio = textarea.selectionStart;
    const fim = textarea.selectionEnd;
    const novaEstrutura = estrutura.substring(0, inicio) + texto + estrutura.substring(fim);
    
    setEstrutura(novaEstrutura);
    
    // Reposiciona o cursor após o texto inserido
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
        supabase.from("pautas").select("id, titulo").order("created_at", { ascending: false }),
      ]);
      if (mRes.error) throw mRes.error;
      if (pRes.error) throw pRes.error;
      setMaterias(mRes.data || []);
      setPautas(pRes.data || []);
    } catch (err: any) {
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

  async function abrirMateria(m: Materia) {
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
    
    // CORREÇÃO: Formato seguro para TS limpar parâmetros de pesquisa
    navigate({ search: { edit: undefined } });
  }

  function adicionarAoHistorico(t: string, c: string, e: string) {
    setHistorico((prev) => {
      const novoHistorico = [...prev.slice(0, indexHistorico + 1), { titulo: t, corpo: c, estrutura: e }];
      if (novoHistorico.length > 30) novoHistorico.shift();
      return novoHistorico;
    });
    // CORREÇÃO: Índice máximo agora é devidamente limitado ao tamanho real da array de 30 itens (0 a 29)
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

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (selecionada) {
        const { error } = await supabase
          .from("materias")
          .update({
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
            updated_at: new Date().toISOString(),
          })
          .eq("id", selecionada.id);
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
          credito_reporter: creditoReporter,
        }).select().single();

        if (error) throw error;
        toast.success("Matéria criada!");
        await carregarDados();
        
        if (data) {
          navigate({ search: { edit: data.id } });
        }
      }
    } catch (err: any) {
      toast.error("Erro: " + err.message);
    }
  }

  const filtered = materias.filter((m) =>
    m.titulo.toLowerCase().includes(busca.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Painel Lateral */}
      <div className="hidden md:flex w-72 border-r border-[var(--border-light)] bg-[var(--bg-overlay)] flex-col">
        <div className="p-4 border-b border-[var(--border-light)]">
          <button
            type="button"
            onClick={novaMateria}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white rounded-xl font-bold text-body-sm transition-all active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" /> Nova Matéria
          </button>
        </div>

        <div className="p-3 border-b border-[var(--border-light)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Buscar matérias..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-quaternary)] text-body-sm focus:outline-none focus:border-[var(--accent-primary)] transition-all"
            />
          </div>
        </div>

        <div className="flex-1 md:flex-1 overflow-y-auto max-h-48 md:max-h-none">
          {filtered.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => navigate({ search: { edit: m.id } })}
              className={`w-full px-4 py-3 text-left border-b border-[var(--border-light)] transition-all hover:bg-[var(--bg-secondary)] ${
                selecionada?.id === m.id ? "bg-[var(--accent-primary)]/10 border-l-4 border-l-[var(--accent-primary)]" : ""
              }`}
            >
              <div className="font-bold text-body-sm text-[var(--text-primary)] truncate">{m.titulo || "Sem título"}</div>
              <div className="text-[10px] text-[var(--text-tertiary)] mt-1 capitalize">{m.status}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Workspace de Redação Principal */}
      <form onSubmit={handleSalvar} className="w-full flex-1 flex flex-col h-auto md:h-full bg-[var(--bg-secondary)] overflow-hidden">
        {/* Botão Nova Matéria em Mobile */}
        <div className="md:hidden p-4 bg-[var(--bg-primary)] border-b border-[var(--border-light)]">
          <button
            type="button"
            onClick={novaMateria}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white rounded-xl font-bold text-body-sm transition-all active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" /> Nova Matéria
          </button>
        </div>

        {/* Barra de Ferramentas Superior do Editor */}
        <div className="px-6 py-3.5 bg-[var(--bg-primary)] border-b border-[var(--border-light)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleUndo} disabled={indexHistorico <= 0} className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] disabled:opacity-30 disabled:hover:bg-transparent transition-all">
              <Undo2 className="h-4 w-4" />
            </button>
            <button type="button" onClick={handleRedo} disabled={indexHistorico >= historico.length - 1} className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] disabled:opacity-30 disabled:hover:bg-transparent transition-all">
              <Redo2 className="h-4 w-4" />
            </button>
            <div className="w-[1px] h-4 bg-[var(--border-light)] mx-1" />
          </div>

          <div className="flex items-center gap-3">
            <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className="px-3 py-1.5 text-body-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] font-medium">
              <option value="rascunho">📝 Rascunho</option>
              <option value="revisao">🧐 Revisão</option>
              <option value="publicado">🚀 Publicado</option>
            </select>
            <button type="submit" className="px-4 py-1.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white font-bold text-body-sm shadow-[var(--shadow-md)] transition-all active:scale-[0.98]">
              {selecionada ? "Atualizar Matéria" : "Salvar Matéria"}
            </button>
          </div>
        </div>

        {/* Corpo do Editor Dividido */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col items-center w-full">
          <div className="w-full max-w-5xl space-y-6">
          {/* Informações Básicas e Vínculo de Pauta */}
          <div className="grid grid-cols-3 gap-4 bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-light)] shadow-[var(--shadow-xs)]">
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Vincular a uma Pauta</label>
              <select value={pautaId} onChange={(e) => setPautaId(e.target.value)} className="w-full px-3 py-2 text-body-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all">
                <option value="">Matéria Avulsa (Sem pauta)</option>
                {pautas.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Crédito do Repórter</label>
              <input type="text" value={creditoReporter} onChange={(e) => setCreditoReporter(e.target.value)} placeholder="Ex: João Silva" className="w-full px-3 py-2 text-body-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-quaternary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all" />
            </div>
          </div>

          {/* Campo de Título Principal */}
          <input 
            type="text" 
            value={titulo} 
            onChange={(e) => setTitulo(e.target.value)} 
            onBlur={() => adicionarAoHistorico(titulo, corpo, estrutura)}
            placeholder="Título principal da matéria..." 
            className="w-full bg-transparent border-none text-[var(--text-primary)] placeholder-[var(--text-quaternary)] font-bold tracking-tight text-h1 focus:outline-none p-0 resize-none" 
            style={{ lineHeight: "1.2" }} 
          />

          {/* Grid de Metadados de TV / Espelho Técnico */}
          <div className="grid grid-cols-4 gap-4 bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-light)] shadow-[var(--shadow-xs)]">
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Deixa (Últimas palavras do VT)</label>
              <input type="text" value={deixa} onChange={(e) => setDeixa(e.target.value)} placeholder="...na reportagem de hoje." className="w-full px-3 py-2 text-body-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Tempo Cabeça</label>
              <input type="text" value={tempoCab} onChange={(e) => setTempoCab(e.target.value)} placeholder="0:15" className="w-full px-3 py-2 text-body-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] font-mono text-center focus:outline-none focus:border-[var(--accent-primary)] transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Tempo VT</label>
              <input type="text" value={tempoVt} onChange={(e) => setTempoVt(e.target.value)} placeholder="1:30" className="w-full px-3 py-2 text-body-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] font-mono text-center focus:outline-none focus:border-[var(--accent-primary)] transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Editor de Texto</label>
              <input type="text" value={editorTexto} onChange={(e) => setEditorTexto(e.target.value)} placeholder="Nome do editor" className="w-full px-3 py-2 text-body-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Editor de Imagem</label>
              <input type="text" value={editorImagem} onChange={(e) => setEditorImagem(e.target.value)} placeholder="Nome do editor" className="w-full px-3 py-2 text-body-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all" />
            </div>
          </div>

          {/* Campo de Texto da Cabeça do Apresentador */}
          <div className="space-y-2">
            <label className="inline-flex items-center gap-2 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider bg-[var(--bg-primary)] border border-[var(--border-light)] px-3 py-1 rounded-full shadow-[var(--shadow-xs)]">
              <MonitorPlay className="h-3.5 w-3.5 text-purple-500" /> Texto da Cabeça (Apresentador)
            </label>
            <textarea value={cabeca} onChange={(e) => setCabeca(e.target.value)} placeholder="Texto que o apresentador vai ler na abertura da matéria..." rows={3} className="w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-quaternary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300 resize-none text-body" />
          </div>

          {/* Estrutura do VT / Roteiro Decupado */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider bg-[var(--bg-primary)] border border-[var(--border-light)] px-3 py-1 rounded-full shadow-[var(--shadow-xs)]">
                <PenTool className="h-3.5 w-3.5 text-blue-500" /> Roteiro Técnico / Decupagem (VT)
              </label>
              <div className="flex flex-wrap gap-1 bg-[var(--bg-primary)] border border-[var(--border-light)] p-1 rounded-xl shadow-[var(--shadow-xs)]">
                <button type="button" onClick={() => inserirNoEstrutura("\n[OFF]\n")} className="px-2 py-1 rounded-lg text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all duration-200">
                  [OFF]
                </button>
                <button type="button" onClick={() => inserirNoEstrutura("\n[SONORA]\n(NOME DO ENTREVISTADO)\n(FUNÇÃO DO ENTREVISTADO)\n")} className="px-2 py-1 rounded-lg text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all duration-200">
                  [SONORA]
                </button>
                <button type="button" onClick={() => inserirNoEstrutura("\n[PASSAGEM]\n(NOME DO REPORTER)\n(LOCAL)\n")} className="px-2 py-1 rounded-lg text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all duration-200">
                  [PASSAGEM]
                </button>
                <button type="button" onClick={() => inserirNoEstrutura("\n[IMAGENS]\n(NOME DO CINEGRAFISTA)\n")} className="px-2 py-1 rounded-lg text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all duration-200">
                  [IMAGENS]
                </button>
                <button type="button" onClick={() => inserirNoEstrutura("\n[PRODUÇÃO]\n(NOME DO PRODUTOR)\n")} className="px-2 py-1 rounded-lg text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all duration-200">
                  [PRODUÇÃO]
                </button>
                <button type="button" onClick={() => inserirNoEstrutura("\n[ED. TEXTO]\n(EDITOR DE TEXTO)\n")} className="px-2 py-1 rounded-lg text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all duration-200">
                  [ED. TEXTO]
                </button>
                <button type="button" onClick={() => inserirNoEstrutura("\n[ED. IMAGENS]\n(EDITOR DE IMAGENS)\n")} className="px-2 py-1 rounded-lg text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all duration-200">
                  [ED. IMAGENS]
                </button>
              </div>
            </div>
            <textarea 
              ref={estruturaRef} 
              value={estrutura} 
              onChange={(e) => setEstrutura(e.target.value)} 
              onBlur={() => adicionarAoHistorico(titulo, corpo, estrutura)}
              rows={10}
              // CORREÇÃO: Formatação JSX correta para string literal multi-linha com quebras de linha reais
              placeholder={"OFF 1 / APRESENTADOR FAZ ABERTURA\n\n[SONORA] NOME / FUNÇÃO\n\nOFF 2 / CONTINUA COM MAIS INFORMAÇÕES\n\n[PASSAGEM] REPÓRTER // LOCAL"}
              className="w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-quaternary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300 resize-none whitespace-pre-wrap break-words text-body-sm leading-relaxed font-mono text-justify overflow-y-auto"
              style={{
                fontFamily: "'Segoe UI', 'Roboto Mono', 'Courier New', monospace",
                letterSpacing: '0.5px'
              }}
            />
          </div>

          {/* Corpo / Texto Corrido Web */}
          <div className="space-y-2">
            <label className="inline-flex items-center gap-2 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider bg-[var(--bg-primary)] border border-[var(--border-light)] px-3 py-1 rounded-full shadow-[var(--shadow-xs)]">
              <FileText className="h-3.5 w-3.5 text-emerald-500" /> Matéria Escrita / Texto Web Corrido
            </label>
            <textarea 
              value={corpo} 
              onChange={(e) => setCorpo(e.target.value)} 
              onBlur={() => adicionarAoHistorico(titulo, corpo, estrutura)}
              placeholder="Texto corrido / matéria web..." 
              rows={10}
              className="w-full px-4 py-3.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-quaternary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-4 focus:ring-[var(--accent-primary)]/10 transition-all duration-300 resize-none text-body"
            />
          </div>
        </div>
      </div>
    </form>
    </div>
  );
}