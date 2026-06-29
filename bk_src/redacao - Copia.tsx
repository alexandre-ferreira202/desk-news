import { createFileRoute, ErrorComponent } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Plus, FileText, MonitorPlay, Search, PenTool, Undo2, Redo2 } from "lucide-react";

import { useAutosave, restoreDraft } from "@/lib/autosave";
import { AutosaveIndicator } from "@/components/protected-enhanced";

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

function RouteErrorComponent({ error }: { error: any }) {
  const isModuleError = 
    error instanceof Error && 
    (error.message.includes('Failed to fetch dynamically imported module') || 
     error.message.includes('Importing a module script failed') ||
     error.message.includes('error loading dynamically imported module'));

  if (isModuleError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#09090b] text-white p-6">
        <div className="bg-[#141416] p-8 rounded-2xl border border-[#22c55e]/20 shadow-xl max-w-md text-center border-l-[3px] border-l-[#22c55e]">
          <h2 className="text-h2 font-bold mb-3 text-white">ATUALIZAÇÃO DISPONÍVEL</h2>
          <p className="text-[#9ca3af] mb-6 text-body-sm">
            UMA NOVA VERSÃO DO DESKNEWS FOI DETECTADA OU HOUVE UMA INTERRUPÇÃO NA CONEXÃO// RECARREGUE A PÁGINA PARA CONTINUAR EDITANDO.
          </p>
          <button 
            type="button"
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-[#22c55e] hover:bg-[#22c55e]/90 text-black rounded-xl font-bold transition-all active:scale-[0.98]"
          >
            RECARREGAR PÁGINA
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

// Função utilitária para converter texto em CAIXA ALTA (sem substituir pontuação)
function formatarTextoRedacao(texto: string): string {
  return texto.toUpperCase();
}

// Função para inserir máscara no cursor
function inserirNoCursor(textareaRef: HTMLTextAreaElement | null, mascara: string) {
  if (!textareaRef) return;
  
  const inicio = textareaRef.selectionStart;
  const fim = textareaRef.selectionEnd;
  const texto = textareaRef.value;
  
  const novoTexto = texto.substring(0, inicio) + mascara + texto.substring(fim);
  
  return novoTexto;
}

function RedacaoPage() {
  const user: { id: string } | null = null;
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

  const cabecaRef = useRef<HTMLTextAreaElement>(null);
  const estruturaRef = useRef<HTMLTextAreaElement>(null);

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
      status
    },
    1500
  );

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
      const materia = materias.find(m => m.id === edit);
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

  function adicionarAoHistorico(novoTitulo: string, novoCorpo: string, novaEstrutura: string) {
    const novaEntrada: HistoricoEntry = {
      titulo: novoTitulo,
      corpo: novoCorpo,
      estrutura: novaEstrutura,
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

  async function salvarMateria(e: React.FormEvent) {
    e.preventDefault();

    if (!titulo.trim()) {
      toast.error("O título é obrigatório");
      return;
    }

    try {
      if (selecionada) {
        const { error } = await supabase
          .from("materias")
          .update({
            titulo,
            corpo,
            estrutura,
            cabeca,
            tempo_vt: tempoVt,
            tempo_cab: tempoCab,
            deixa,
            editor_texto: editorTexto,
            editor_imagem: editorImagem,
            credito_reporter: creditoReporter,
            pauta_id: pautaId || null,
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selecionada.id);

        if (error) throw error;
        toast.success("Matéria atualizada com sucesso!");
      } else {
        const { data, error } = await supabase
          .from("materias")
          .insert([
            {
              titulo,
              corpo,
              estrutura,
              cabeca,
              tempo_vt: tempoVt,
              tempo_cab: tempoCab,
              deixa,
              editor_texto: editorTexto,
              editor_imagem: editorImagem,
              credito_reporter: creditoReporter,
              pauta_id: pautaId || null,
              status,
              autor_id: user?.id,
            },
          ])
          .select();

        if (error) throw error;
        toast.success("Matéria criada com sucesso!");
        if (data && data[0]) setSelecionada(data[0]);
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
      const { error } = await supabase.from("materias").delete().eq("id", selecionada.id);
      if (error) throw error;
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

  // Handlers para inserir máscaras
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

  // Aplicar formatação ao perder foco
  const aplicarFormatacaoCabeca = () => {
    setCabeca(formatarTextoRedacao(cabeca));
  };

  const aplicarFormatacaoEstrutura = () => {
    setEstrutura(formatarTextoRedacao(estrutura));
  };

  return (
    <div className="flex h-screen bg-[#09090b]">
      <style>{`
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
      `}</style>

      {/* Sidebar esquerda */}
      <aside className="w-80 bg-[#141416] border-r border-[#22c55e]/20 overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-[#09090b] border-b border-[#22c55e]/20 p-4 space-y-3 z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/40">
              <PenTool className="h-5 w-5 text-[#22c55e]" />
            </div>
            <h1 className="text-2xl font-black tracking-tight font-mono uppercase text-white">REDAÇÃO</h1>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6b7280]" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="BUSCAR MATÉRIA..."
              className="w-full pl-9 pr-3 py-2 bg-[#141416] border border-[#22c55e]/20 rounded-xl text-white placeholder-[#4b5563] text-body-sm focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all"
            />
          </div>

          <button
            onClick={() => {
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
            }}
            className="w-full py-2 px-3 rounded-xl bg-[#22c55e] hover:bg-[#22c55e]/90 text-black font-bold text-body-sm transition-all active:scale-[0.98]"
          >
            + NOVA MATÉRIA
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {materias
            .filter(m => m.titulo?.toLowerCase().includes(busca.toLowerCase()))
            .map((materia) => (
              <div
                key={materia.id}
                onClick={() => {
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
                }}
                className={`p-3 rounded-lg cursor-pointer border transition-all border-l-[3px] ${
                  selecionada?.id === materia.id
                    ? "bg-[#22c55e]/10 border-[#22c55e]/50 border-l-[#22c55e]"
                    : "bg-[#141416] border-[#22c55e]/20 border-l-[#22c55e]/30 hover:border-[#22c55e]/40"
                }`}
              >
                <h3 className="font-bold text-white text-body-sm truncate">
                  {materia.titulo}
                </h3>
                <p className="text-[#6b7280] text-[11px] mt-1">
                  {materia.status.toUpperCase()}
                </p>
                <p className="text-[#4b5563] text-[10px] mt-0.5">
                  {new Date(materia.updated_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))}
        </div>
      </aside>

      {/* Editor Principal */}
      <form onSubmit={salvarMateria} className="flex-1 flex flex-col overflow-hidden">
        {/* Header fixo */}
        <div className="sticky top-0 z-20 bg-[#141416] border-b border-[#22c55e]/20 p-4 shadow-lg">
          <div className="flex items-center justify-between gap-3 max-w-5xl mx-auto">
            <div className="flex-1">
              <p className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1">
                {selecionada ? "Editando" : "Nova Matéria"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AutosaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
              <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className="px-3 py-1.5 rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 text-body-sm font-bold">
                <option value="rascunho">RASCUNHO</option>
                <option value="revisao">REVISÃO</option>
                <option value="publicado">PUBLICADO</option>
              </select>
              <button type="submit" className="px-4 py-1.5 rounded-xl bg-[#22c55e] hover:bg-[#22c55e]/90 text-black font-bold text-body-sm shadow-lg transition-all active:scale-[0.98]">
                {selecionada ? "ATUALIZAR" : "SALVAR"}
              </button>
              {selecionada && (
                <button
                  type="button"
                  onClick={deletarMateria}
                  className="px-4 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold text-body-sm transition-all"
                >
                  DELETAR
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Corpo do Editor Dividido */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl w-full mx-auto">
          {/* Informações Básicas e Vínculo de Pauta */}
          <div className="grid grid-cols-3 gap-4 bg-[#141416] p-4 rounded-lg border border-[#22c55e]/20 border-l-[3px] border-l-[#22c55e] shadow-lg">
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1.5">VINCULAR A UMA PAUTA</label>
              <select value={pautaId} onChange={(e) => setPautaId(e.target.value)} className="w-full px-3 py-2 text-body-sm rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all">
                <option value="">MATÉRIA AVULSA (SEM PAUTA)</option>
                {pautas.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1.5">CRÉDITO DO REPÓRTER</label>
              <input type="text" value={creditoReporter} onChange={(e) => setCreditoReporter(e.target.value)} placeholder="EX: JOÃO SILVA" className="w-full px-3 py-2 text-body-sm rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white placeholder-[#4b5563] focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all" />
            </div>
          </div>

          {/* Campo de Título Principal */}
          <input 
            type="text" 
            value={titulo} 
            onChange={(e) => setTitulo(e.target.value)} 
            onBlur={() => adicionarAoHistorico(titulo, corpo, estrutura)}
            placeholder="TÍTULO PRINCIPAL DA MATÉRIA..." 
            className="w-full bg-transparent border-none text-white placeholder-[#4b5563] font-bold tracking-tight text-h1 focus:outline-none p-0 resize-none" 
            style={{ lineHeight: "1.2" }} 
          />

          {/* Grid de Metadados de TV / Espelho Técnico */}
          <div className="grid grid-cols-4 gap-4 bg-[#141416] p-4 rounded-lg border border-[#22c55e]/20 border-l-[3px] border-l-[#22c55e] shadow-lg">
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1.5">DEIXA (ÚLTIMAS PALAVRAS DO VT)</label>
              <input type="text" value={deixa} onChange={(e) => setDeixa(e.target.value)} placeholder="///NA REPORTAGEM DE HOJE//" className="w-full px-3 py-2 text-body-sm rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1.5">TEMPO CABEÇA</label>
              <input type="text" value={tempoCab} onChange={(e) => setTempoCab(e.target.value)} placeholder="0:15" className="w-full px-3 py-2 text-body-sm rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white font-mono text-center focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1.5">TEMPO VT</label>
              <input type="text" value={tempoVt} onChange={(e) => setTempoVt(e.target.value)} placeholder="1:30" className="w-full px-3 py-2 text-body-sm rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white font-mono text-center focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1.5">EDITOR DE TEXTO</label>
              <input type="text" value={editorTexto} onChange={(e) => setEditorTexto(e.target.value)} placeholder="NOME DO EDITOR" className="w-full px-3 py-2 text-body-sm rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1.5">EDITOR DE IMAGEM</label>
              <input type="text" value={editorImagem} onChange={(e) => setEditorImagem(e.target.value)} placeholder="NOME DO EDITOR" className="w-full px-3 py-2 text-body-sm rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all" />
            </div>
          </div>

          {/* Campo de Texto da Cabeça do Apresentador */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider bg-[#141416] border border-[#22c55e]/20 px-3 py-1 rounded shadow-lg border-l-[3px] border-l-[#22c55e]">
                <MonitorPlay className="h-3.5 w-3.5 text-[#22c55e]" /> TEXTO DA CABEÇA (APRESENTADOR)
              </label>
              <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                <button type="button" onClick={inserirSonoraCapeca} className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200">
                  +SONORA
                </button>
                <button type="button" onClick={inserirPassagemCabeca} className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200">
                  +PASSAGEM
                </button>
                <button type="button" onClick={inserirOffCabeca} className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200">
                  +OFF
                </button>
                <button type="button" onClick={inserirProducaoCabeca} className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200">
                  +PRODUÇÃO
                </button>
                <button type="button" onClick={inserirEdTextoCabeca} className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200">
                  +ED// TEXTO
                </button>
                <button type="button" onClick={inserirEdImagensCabeca} className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200">
                  +ED// IMAGENS
                </button>
                <button type="button" onClick={inserirImagensCabeca} className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200">
                  +IMAGENS
                </button>
              </div>
            </div>
            <textarea 
              ref={cabecaRef}
              value={cabeca} 
              onChange={(e) => setCabeca(e.target.value)} 
              onBlur={aplicarFormatacaoCabeca}
              placeholder="TEXTO QUE O APRESENTADOR VAI LER NA ABERTURA DA MATÉRIA///" 
              rows={3} 
              className="w-full px-4 py-3.5 rounded-md bg-[#141416] border border-[#22c55e]/20 text-white placeholder-[#4b5563] focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all duration-300 resize-none text-body" 
            />
          </div>

          {/* Estrutura do VT / Roteiro Decupado */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider bg-[#141416] border border-[#22c55e]/20 px-3 py-1 rounded shadow-lg border-l-[3px] border-l-[#22c55e]">
                <PenTool className="h-3.5 w-3.5 text-[#22c55e]" /> ROTEIRO TÉCNICO // DECUPAGEM (VT)
              </label>
              <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                <button type="button" onClick={inserirSonora} className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200">
                  +SONORA
                </button>
                <button type="button" onClick={inserirPassagem} className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200">
                  +PASSAGEM
                </button>
                <button type="button" onClick={inserirOff} className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200">
                  +OFF
                </button>
                <button type="button" onClick={inserirProducao} className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200">
                  +PRODUÇÃO
                </button>
                <button type="button" onClick={inserirEdTexto} className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200">
                  +ED// TEXTO
                </button>
                <button type="button" onClick={inserirEdImagens} className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200">
                  +ED// IMAGENS
                </button>
                <button type="button" onClick={inserirImagens} className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200">
                  +IMAGENS
                </button>
              </div>
            </div>
            
            {/* Container com numeração de linhas */}
            <div className="relative rounded-lg overflow-hidden border border-[#22c55e]/20 bg-[#141416] border-l-[3px] border-l-[#22c55e]">
              <div className="flex">
                {/* Numeração das linhas */}
                <div className="bg-[#09090b] text-[#6b7280] text-[10px] font-mono p-3 select-none border-r border-[#22c55e]/20 text-right min-w-[3rem] overflow-hidden">
                  {estrutura.split('\n').map((_, idx) => (
                    <div key={idx} className="h-5 leading-5">{idx + 1}</div>
                  ))}
                </div>
                {/* Textarea */}
                <textarea 
                  ref={estruturaRef} 
                  value={estrutura} 
                  onChange={(e) => setEstrutura(e.target.value)} 
                  onBlur={aplicarFormatacaoEstrutura}
                  rows={10}
                  placeholder={"[OFF 1]\n///ABERTURA DO APRESENTADOR COM A NOTÍCIA PRINCIPAL///\n\n[SONORA] JOÃO SILVA / ESPECIALISTA\n///OPINIÃO DO ESPECIALISTA SOBRE O TEMA///\n\n[OFF 2]\n///CONTINUAÇÃO DA NARRAÇÃO COM MAIS DETALHES///\n\n[PASSAGEM] MARIA SANTOS // SÃO PAULO\n///POSICIONAMENTO DO REPÓRTER EM CAMPO///\n\n[OFF 3] FINAL\n///ENCERRAMENTO E DESPEDIDA///"}
                  className="flex-1 px-4 py-3.5 bg-[#141416] text-white placeholder-[#4b5563] focus:outline-none focus:ring-4 focus:ring-[#22c55e]/30 transition-all duration-300 resize-none whitespace-pre-wrap break-words text-body-sm leading-relaxed font-mono text-justify overflow-y-auto"
                  style={{
                    fontFamily: "'Segoe UI', 'Roboto Mono', 'Courier New', monospace",
                    letterSpacing: '0.5px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Corpo / Texto Corrido Web */}
          <div className="space-y-2">
            <label className="inline-flex items-center gap-2 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider bg-[#141416] border border-[#22c55e]/20 px-3 py-1 rounded shadow-lg border-l-[3px] border-l-[#22c55e]">
              <FileText className="h-3.5 w-3.5 text-[#22c55e]" /> MATÉRIA ESCRITA // TEXTO WEB CORRIDO
            </label>
            <textarea 
              value={corpo} 
              onChange={(e) => setCorpo(e.target.value)} 
              onBlur={() => adicionarAoHistorico(titulo, corpo, estrutura)}
              placeholder="TEXTO CORRIDO // MATÉRIA WEB///" 
              rows={10}
              className="w-full px-4 py-3.5 rounded-md bg-[#141416] border border-[#22c55e]/20 text-white placeholder-[#4b5563] focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all duration-300 resize-none text-body"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
