import { createFileRoute, ErrorComponent } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { db } from "@/lib/db";
import { toast } from "sonner";
import { Plus, FileText, MonitorPlay, Search, PenTool, Undo2, Redo2, Sparkles, Film, X, GripHorizontal, FolderOpen, Trash2 } from "lucide-react";

import { useAutosave, restoreDraft } from "@/lib/autosave";
import { AutosaveIndicator } from "@/components/protected-enhanced";
import { useAutoCredits } from "@/hooks/useAutoCredits";

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
  /** JSON de sincronização de timeline (sonoras + timecodes) */
  timeline_json?: string | null;
  /** Duração total estimada do VT em segundos */
  duracao_vt?: number | null;
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
  const [duracaoVt, setDuracaoVt] = useState<number | null>(null);
  const [timelineJson, setTimelineJson] = useState<string | null>(null);

  // ── MODAL REVISAR ──
  interface CreditoRevisao {
    id: string;
    tipo: string;
    valor: string;
    cor: string;
    icon: string;
    timecode: number; // segundos — editável pelo usuário
    duracao: number;
  }
  const [revisarOpen, setRevisarOpen] = useState(false);
  const [revisarVideoUrl, setRevisarVideoUrl] = useState<string | null>(null);
  const [revisarDirHandle, setRevisarDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [revisarCreditos, setRevisarCreditos] = useState<CreditoRevisao[]>([]);
  const [revisarDuracao, setRevisarDuracao] = useState<number>(120);
  const [revisarCurrentTime, setRevisarCurrentTime] = useState(0);
  const revisarVideoRef = useRef<HTMLVideoElement>(null);
  const revisarTimelineRef = useRef<HTMLDivElement>(null);
  const draggingCreditRef = useRef<{ id: string; startX: number; startTimecode: number } | null>(null);

  // Parseia créditos da estrutura atual para o modal
  const parsearCreditosRevisao = useCallback((estruturaAtual: string, dur: number): CreditoRevisao[] => {
    const linhas = estruturaAtual.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const items: { tipo: string; valor: string; palavras: number }[] = [];
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
    const creditos: CreditoRevisao[] = [];
    let acum = 0;
    const corMap: Record<string, string> = { SONORA: "#22c55e", PASSAGEM: "#f59e0b", ED_TEXTO: "#3b82f6", ED_IMAGEM: "#ec4899", REPÓRTER: "#06b6d4", IMAGENS: "#a855f7" };
    const iconMap: Record<string, string> = { SONORA: "🎤", PASSAGEM: "🎥", ED_TEXTO: "📝", ED_IMAGEM: "🖼️", REPÓRTER: "🎙️", IMAGENS: "📷" };
    items.forEach((it, idx) => {
      const pos = totalPalavras > 0 ? acum / totalPalavras : 0;
      if (it.tipo !== "OFF") {
        creditos.push({ id: `${it.tipo}-${idx}`, tipo: it.tipo, valor: it.valor, cor: corMap[it.tipo] || "#888", icon: iconMap[it.tipo] || "📌", timecode: Math.round(pos * dur), duracao: 5 });
      }
      acum += it.palavras;
    });
    // editor de texto e imagem fixos no final
    if (editorTexto) creditos.push({ id: "ED_TEXTO", tipo: "ED_TEXTO", valor: editorTexto, cor: corMap.ED_TEXTO, icon: "📝", timecode: Math.round(0.82 * dur), duracao: 5 });
    if (editorImagem) creditos.push({ id: "ED_IMAGEM", tipo: "ED_IMAGEM", valor: editorImagem, cor: corMap.ED_IMAGEM, icon: "🖼️", timecode: Math.round(0.88 * dur), duracao: 5 });
    // REPÓRTER não é adicionado automaticamente — já aparece via [PASSAGEM] no roteiro
    return creditos.sort((a, b) => a.timecode - b.timecode);
  }, [editorTexto, editorImagem, creditoReporter]);

  const abrirRevisar = async () => {
    if (!estrutura || estrutura.trim().length < 10) {
      toast.warning("Adicione a estrutura/lauda antes de revisar.");
      return;
    }
    // Pede pasta
    if (!window.showDirectoryPicker) {
      toast.error("Seu navegador não suporta seleção de pasta. Use Chrome/Edge.");
      return;
    }
    try {
      const handle = await (window as any).showDirectoryPicker({ mode: "read" });
      setRevisarDirHandle(handle);
      const dur = duracaoVt || 120;
      setRevisarDuracao(dur);
      setRevisarCreditos(parsearCreditosRevisao(estrutura, dur));
      setRevisarCurrentTime(0);
      setRevisarVideoUrl(null);
      // Tenta encontrar vídeo pelo título
      if (titulo) {
        const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
        const normTitulo = normalize(titulo);
        for await (const [name, entry] of (handle as any).entries()) {
          if (entry.kind === "file" && (name.endsWith(".mp4") || name.endsWith(".mov"))) {
            const normName = normalize(name.replace(/\.(mp4|mov)$/i, ""));
            if (normName === normTitulo || normName.includes(normTitulo.slice(0, 8))) {
              const fh = entry as FileSystemFileHandle;
              const file = await fh.getFile();
              const url = URL.createObjectURL(file);
              setRevisarVideoUrl(url);
              break;
            }
          }
        }
      }
      setRevisarOpen(true);
    } catch (err: any) {
      if (err.name !== "AbortError") toast.error("Erro ao abrir pasta");
    }
  };

  // Atualiza timecode via drag na timeline
  const handleTimelineDragStart = (e: React.MouseEvent, creditoId: string, timecodeAtual: number) => {
    e.preventDefault();
    draggingCreditRef.current = { id: creditoId, startX: e.clientX, startTimecode: timecodeAtual };
    const onMove = (ev: MouseEvent) => {
      if (!draggingCreditRef.current || !revisarTimelineRef.current) return;
      const rect = revisarTimelineRef.current.getBoundingClientRect();
      const dx = ev.clientX - draggingCreditRef.current.startX;
      const dSecs = (dx / rect.width) * revisarDuracao;
      const novoTc = Math.max(0, Math.min(revisarDuracao - 1, Math.round(draggingCreditRef.current.startTimecode + dSecs)));
      setRevisarCreditos(prev => prev.map(c => c.id === draggingCreditRef.current!.id ? { ...c, timecode: novoTc } : c));
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
    apiKey: import.meta.env.VITE_GROQ_API_KEY || "",
    autoPopulate: true,
    deduplicate: true,
  });

  async function sugerirCreditosComIA() {
    if (!estrutura || estrutura.length < 10) {
      toast.warning("Escreva a estrutura/lauda da matéria antes de sugerir créditos.");
      return;
    }
    try {
      const sugeridos = await extractCredits(estrutura, editorTexto || undefined, creditoReporter || undefined);
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
      status,
      duracao_vt: duracaoVt,
    },
    1500
  );

  async function carregarDados() {
    try {
      setLoading(true);
      const [mRes, pRes] = await Promise.all([
        db.query(`SELECT * FROM materias ORDER BY updated_at DESC`),
        db.query(`SELECT id, titulo FROM pautas ORDER BY created_at DESC`),
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
        await db.query(
          `UPDATE materias SET
             titulo = $1, corpo = $2, estrutura = $3, cabeca = $4,
             tempo_vt = $5, tempo_cab = $6, deixa = $7,
             editor_texto = $8, editor_imagem = $9, credito_reporter = $10,
             pauta_id = $11, status = $12, duracao_vt = $13, updated_at = $14
           WHERE id = $15`,
          [
            titulo, corpo, estrutura, cabeca,
            tempoVt, tempoCab, deixa,
            editorTexto, editorImagem, creditoReporter,
            pautaId || null, status, duracaoVt, new Date().toISOString(),
            selecionada.id,
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
            titulo, corpo, estrutura, cabeca, tempoVt, tempoCab, deixa,
            editorTexto, editorImagem, creditoReporter, pautaId || null, status, user?.id,
          ]
        );
        toast.success("Matéria criada com sucesso!");
        if (rows && rows[0]) setSelecionada(rows[0] as any);
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

  // Converte texto de CAIXA ALTA para formato normal (Title case para nomes próprios e início de frase)
  function normalizarCaixaAlta(texto: string): string {
    // Converte tudo para minúsculo primeiro
    let resultado = texto.toLowerCase();

    // Capitaliza início de cada frase (após . ! ? e no início do texto)
    resultado = resultado.replace(/(^|[.!?]\s+)([a-záàâãéêíóôõúüç])/g, (_, sep, letra) => sep + letra.toUpperCase());

    // Capitaliza nomes próprios comuns e siglas conhecidas (heurística simples)
    // Mantém maiúscula em palavras que estavam em caps no original e têm 2+ caracteres sem vogal (siglas)
    resultado = resultado.replace(/\b([a-z]{2,})\b/g, (palavra) => {
      // Detecta se parece sigla (consoantes dominantes, sem vogais ou muito curta como SP, RJ, etc.)
      const semVogais = palavra.replace(/[aeiouáàâãéêíóôõúüç]/g, "");
      if (semVogais.length === palavra.length && palavra.length <= 5) {
        return palavra.toUpperCase();
      }
      return palavra;
    });

    return resultado;
  }

  // Gerar sugestão de texto web via API do Gemini
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
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
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
              setTimelineJson(null);
              setDuracaoVt(null);
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
                  setDuracaoVt(materia.duracao_vt ?? null);
                  setTimelineJson(materia.timeline_json ?? null);
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

              <button
                type="button"
                onClick={abrirRevisar}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold text-body-sm transition-all active:scale-[0.98] border"
                style={{ backgroundColor: '#7c3aed20', borderColor: '#7c3aed50', color: '#c084fc' }}
              >
                <Film className="h-3.5 w-3.5" /> REVISAR
              </button>
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
              <div className="flex gap-2">
                <input type="text" value={creditoReporter} onChange={(e) => setCreditoReporter(e.target.value)} placeholder="EX: JOÃO SILVA" className="w-full px-3 py-2 text-body-sm rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white placeholder-[#4b5563] focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all" />
                <button type="button" onClick={sugerirCreditosComIA} disabled={isLoadingAutoCredits} title="Sugerir créditos com IA" className="shrink-0 px-3 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e]/20 disabled:opacity-50 transition-all flex items-center justify-center">
                  <Sparkles className={`w-4 h-4 ${isLoadingAutoCredits ? "animate-pulse" : ""}`} />
                </button>
              </div>
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
              {/* Toolbar undo/redo */}
              <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[#22c55e]/10 bg-[#09090b]">
                <button
                  type="button"
                  onClick={desfazer}
                  disabled={indexHistorico <= 0}
                  title="Desfazer (Ctrl+Z)"
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold text-[#6b7280] hover:text-[#22c55e] hover:bg-[#22c55e]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <Undo2 className="h-3 w-3" /> DESFAZER
                </button>
                <button
                  type="button"
                  onClick={refazer}
                  disabled={indexHistorico >= historico.length - 1}
                  title="Refazer (Ctrl+Shift+Z)"
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold text-[#6b7280] hover:text-[#22c55e] hover:bg-[#22c55e]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <Redo2 className="h-3 w-3" /> REFAZER
                </button>
              </div>
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
                  onKeyDown={(e) => {
                    if (e.ctrlKey && !e.shiftKey && e.key === 'z') { e.preventDefault(); desfazer(); }
                    if (e.ctrlKey && e.shiftKey && e.key === 'Z') { e.preventDefault(); refazer(); }
                  }}
                  rows={10}
                  placeholder={"[OFF 1]\n///ABERTURA DO APRESENTADOR COM A NOTÍCIA PRINCIPAL///\n\n[SONORA] JOÃO SILVA / ESPECIALISTA\n///OPINIÃO DO ESPECIALISTA SOBRE O TEMA///\n\n[OFF 2]\n///CONTINUAÇÃO DA NARRAÇÃO COM MAIS DETALHES///\n\n[PASSAGEM] MARIA SANTOS // SÃO PAULO\n///POSICIONAMENTO DO REPÓRTER EM CAMPO///\n\n[OFF 3] FINAL\n///ENCERRAMENTO E DESPEDIDA///"}
                  className="flex-1 px-4 py-3.5 bg-[#141416] text-white placeholder-[#4b5563] focus:outline-none focus:ring-4 focus:ring-[#22c55e]/30 transition-all duration-300 resize-none whitespace-pre-wrap break-words text-body-sm leading-relaxed font-mono text-justify overflow-y-auto"
                  style={{ fontFamily: "'Segoe UI', 'Roboto Mono', 'Courier New', monospace", letterSpacing: '0.5px' }}
                />
              </div>
            </div>
          </div>

          {/* Corpo / Texto Corrido Web */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider bg-[#141416] border border-[#22c55e]/20 px-3 py-1 rounded shadow-lg border-l-[3px] border-l-[#22c55e]">
                <FileText className="h-3.5 w-3.5 text-[#22c55e]" /> MATÉRIA ESCRITA // TEXTO WEB CORRIDO
              </label>
              <button
                type="button"
                onClick={gerarSugestaoWeb}
                disabled={gerandoSugestao}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e]/20 hover:border-[#22c55e]/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]"
              >
                {gerandoSugestao ? (
                  <>
                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    GERANDO...
                  </>
                ) : <>✦ SUGESTÃO</>}
              </button>
            </div>
            <textarea 
              value={corpo} 
              onChange={(e) => setCorpo(e.target.value)} 
              onBlur={() => adicionarAoHistorico(titulo, corpo, estrutura)}
              placeholder="TEXTO CORRIDO // MATÉRIA WEB///" 
              rows={10}
              className="w-full px-4 py-3.5 rounded-md bg-[#141416] border border-[#22c55e]/20 text-white placeholder-[#4b5563] focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all duration-300 resize-none text-body"
            />
          </div>

          {/* ── TIMELINE DE CRÉDITOS ── */}
          {estrutura && estrutura.trim().length > 10 && (
            <div className="space-y-3 border-t border-[#22c55e]/10 pt-6">
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider bg-[#141416] border border-[#22c55e]/20 px-3 py-1 rounded shadow-lg border-l-[3px] border-l-[#22c55e]">
                  📹 TIMELINE DE CRÉDITOS // SINCRONIZAÇÃO VT
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider">DURAÇÃO DO VT (s):</label>
                  <input
                    type="number"
                    min={0}
                    max={3600}
                    value={duracaoVt ?? ""}
                    onChange={(e) => setDuracaoVt(e.target.value ? Number(e.target.value) : null)}
                    placeholder="ex: 120"
                    className="w-20 px-2 py-1 text-body-sm rounded-lg bg-[#09090b] border border-[#22c55e]/20 text-white font-mono text-center focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all"
                  />
                </div>
              </div>

              {/* Mini-timeline visual */}
              {(() => {
                const duracao = duracaoVt || 120;
                type CreditoItem = { tipo: string; valor: string; cor: string; icon: string; posicao: number };
                const corMap: Record<string, string> = { SONORA: "#22c55e", PASSAGEM: "#f59e0b", IMAGENS: "#a855f7", ED_TEXTO: "#3b82f6", ED_IMAGEM: "#ec4899", REPÓRTER: "#06b6d4" };
                const iconMap: Record<string, string> = { SONORA: "🎤", PASSAGEM: "🎥", IMAGENS: "📷", ED_TEXTO: "📝", ED_IMAGEM: "🖼️", REPÓRTER: "🎙️" };

                let creditos: CreditoItem[] = [];

                // Se existe timeline_json salvo, usa ele
                if (timelineJson) {
                  try {
                    const saved = JSON.parse(timelineJson) as Array<{ tipo: string; valor: string; timecode: number }>;
                    creditos = saved.map(c => ({
                      tipo: c.tipo,
                      valor: c.valor,
                      cor: corMap[c.tipo] || "#888",
                      icon: iconMap[c.tipo] || "📌",
                      posicao: duracao > 0 ? c.timecode / duracao : 0,
                    }));
                  } catch {}
                }

                // Se não tem salvo, calcula pela estrutura
                if (creditos.length === 0) {
                  const linhas = estrutura.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                  let totalPalavras = 0;
                  const wordsPerItem: { tipo: string; valor: string; palavras: number }[] = [];

                  linhas.forEach((linha) => {
                    const upper = linha.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
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

                if (creditos.length === 0) return (
                  <div className="text-[#4b5563] text-[11px] italic text-center py-4">
                    Adicione [SONORA] ou [PASSAGEM] na estrutura para ver a timeline de créditos.
                  </div>
                );

                return (
                  <div className="bg-[#141416] border border-[#22c55e]/20 rounded-xl p-4 space-y-3">
                    {/* Barra de timeline */}
                    <div className="relative h-8 bg-[#09090b] rounded-lg overflow-visible border border-[#22c55e]/10">
                      {/* Marcadores de tempo */}
                      {[0.25, 0.5, 0.75].map((pos) => (
                        <div key={pos} className="absolute top-0 bottom-0 w-px bg-[#22c55e]/10"
                          style={{ left: `${pos * 100}%` }}>
                          <span className="absolute top-1 text-[8px] font-mono text-[#4b5563] -translate-x-1/2 whitespace-nowrap">
                            {Math.round(pos * duracao)}s
                          </span>
                        </div>
                      ))}
                      {/* Créditos na barra */}
                      {creditos.map((cred, idx) => (
                        <div
                          key={idx}
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
                          style={{ left: `${Math.min(95, Math.max(2, cred.posicao * 100))}%` }}
                          title={`${cred.tipo}: ${cred.valor} (~${Math.round(cred.posicao * duracao)}s)`}
                        >
                          <div
                            className="w-2 h-5 rounded-sm cursor-pointer transition-all hover:scale-110"
                            style={{ backgroundColor: cred.cor, boxShadow: `0 0 6px ${cred.cor}60` }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Lista de créditos com timecodes estimados */}
                    <div className="grid grid-cols-2 gap-2">
                      {creditos.map((cred, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-2 py-1.5 rounded-lg border"
                          style={{ backgroundColor: `${cred.cor}10`, borderColor: `${cred.cor}30` }}>
                          <span className="text-base shrink-0">{cred.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[8px] font-black uppercase tracking-widest" style={{ color: cred.cor }}>
                              {cred.tipo.replace("_", " ")}
                            </div>
                            <div className="text-[10px] font-bold text-white truncate">{cred.valor}</div>
                          </div>
                          <span className="text-[9px] font-mono shrink-0" style={{ color: cred.cor }}>
                            ~{Math.round(cred.posicao * duracao)}s
                          </span>
                        </div>
                      ))}
                    </div>

                    <p className="text-[9px] text-[#4b5563] text-center">
                      Timecodes estimados por posição na lauda. Duração do VT: <strong className="text-[#22c55e]">{duracao}s</strong>.
                      {!duracaoVt && " Defina a duração acima para maior precisão."}
                    </p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Botão DELETAR no final da página */}
          {selecionada && (
            <div className="border-t border-red-500/10 pt-6 pb-4 flex justify-end">
              <button
                type="button"
                onClick={deletarMateria}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 font-bold text-body-sm transition-all active:scale-[0.98]"
              >
                <Trash2 className="h-4 w-4" />
                DELETAR MATÉRIA
              </button>
            </div>
          )}
        </div>
      </form>

      {/* ══════════════════════════════════════════════
          MODAL FLUTUANTE — REVISAR VT + TIMECODES
      ══════════════════════════════════════════════ */}
      {revisarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <div
            className="flex flex-col rounded-2xl border shadow-2xl overflow-hidden"
            style={{ backgroundColor: '#0d0d0d', borderColor: '#7c3aed50', width: '860px', maxWidth: '95vw', maxHeight: '90vh' }}
          >
            {/* Header do modal */}
            <div className="flex items-center justify-between px-5 py-3 border-b shrink-0" style={{ borderColor: '#7c3aed30', backgroundColor: '#141416' }}>
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4" style={{ color: '#c084fc' }} />
                <span className="font-black uppercase tracking-widest text-sm" style={{ color: '#c084fc' }}>REVISAR VT</span>
                <span className="text-xs text-zinc-600 font-mono truncate max-w-xs">{titulo}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Trocar vídeo */}
                <button
                  type="button"
                  onClick={async () => {
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
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#3a3a3a', color: '#9ca3af' }}
                >
                  <FolderOpen className="h-3 w-3" /> Trocar VT
                </button>
                <button
                  type="button"
                  onClick={salvarTimecodes}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all active:scale-[0.97]"
                  style={{ backgroundColor: '#7c3aed20', borderColor: '#7c3aed50', color: '#c084fc' }}
                >
                  ✓ SALVAR TIMECODES
                </button>
                <button
                  type="button"
                  onClick={() => setRevisarOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col overflow-hidden flex-1 min-h-0">
              {/* Player de vídeo */}
              <div className="relative bg-black shrink-0" style={{ aspectRatio: '16/9', maxHeight: '320px' }}>
                {revisarVideoUrl ? (
                  <video
                    ref={revisarVideoRef}
                    src={revisarVideoUrl}
                    className="w-full h-full object-contain"
                    controls
                    onTimeUpdate={(e) => {
                      const t = e.currentTarget.currentTime;
                      setRevisarCurrentTime(t);
                      if (e.currentTarget.duration && !isNaN(e.currentTarget.duration)) {
                        setRevisarDuracao(Math.round(e.currentTarget.duration));
                      }
                    }}
                    onLoadedMetadata={(e) => {
                      const dur = Math.round(e.currentTarget.duration);
                      setRevisarDuracao(dur);
                      setRevisarCreditos(parsearCreditosRevisao(estrutura, dur));
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-700">
                    <Film className="h-10 w-10" />
                    <span className="text-xs uppercase tracking-widest">Nenhum VT encontrado na pasta</span>
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "video/mp4,video/quicktime";
                        input.onchange = () => {
                          const file = input.files?.[0];
                          if (!file) return;
                          setRevisarVideoUrl(URL.createObjectURL(file));
                        };
                        input.click();
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all"
                      style={{ backgroundColor: '#1a1a1a', borderColor: '#3a3a3a', color: '#9ca3af' }}
                    >
                      <FolderOpen className="h-4 w-4" /> Selecionar VT manualmente
                    </button>
                  </div>
                )}

                {/* GC Overlay — mostra crédito ativo */}
                {(() => {
                  const ativo = revisarCreditos.find(c => revisarCurrentTime >= c.timecode && revisarCurrentTime < c.timecode + c.duracao);
                  if (!ativo) return null;
                  return (
                    <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                      <div className="flex items-stretch overflow-hidden rounded-sm shadow-xl max-w-xs">
                        <div className="w-1 shrink-0" style={{ backgroundColor: ativo.cor }} />
                        <div className="px-3 py-1.5 flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}>
                          <div className="text-white font-bold text-xs uppercase tracking-wide">{ativo.valor}</div>
                          <div className="text-[10px] uppercase tracking-widest" style={{ color: ativo.cor }}>{ativo.tipo.replace("_", " ")}</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Área da timeline — scrollável */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

                {/* Barra de timeline interativa */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Timeline de Créditos</span>
                    <span className="text-[10px] font-mono text-zinc-600">
                      {String(Math.floor(revisarCurrentTime / 60)).padStart(2, "0")}:{String(Math.round(revisarCurrentTime % 60)).padStart(2, "0")}
                      {" / "}
                      {String(Math.floor(revisarDuracao / 60)).padStart(2, "0")}:{String(revisarDuracao % 60).padStart(2, "0")}
                    </span>
                  </div>

                  <div
                    ref={revisarTimelineRef}
                    className="relative rounded-xl overflow-visible"
                    style={{ height: '56px', backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a' }}
                    onClick={(e) => {
                      if (!revisarVideoRef.current || draggingCreditRef.current) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pct = (e.clientX - rect.left) / rect.width;
                      const t = Math.max(0, Math.min(revisarDuracao, pct * revisarDuracao));
                      revisarVideoRef.current.currentTime = t;
                      setRevisarCurrentTime(t);
                    }}
                  >
                    {/* Progresso */}
                    <div
                      className="absolute inset-y-0 left-0 rounded-l-xl"
                      style={{ width: `${(revisarCurrentTime / revisarDuracao) * 100}%`, backgroundColor: '#ffffff08' }}
                    />
                    {/* Marcadores de tempo */}
                    {[0.25, 0.5, 0.75].map(p => (
                      <div key={p} className="absolute inset-y-0 w-px" style={{ left: `${p * 100}%`, backgroundColor: '#2a2a2a' }}>
                        <span className="absolute bottom-1 text-[8px] font-mono text-zinc-700 -translate-x-1/2">
                          {Math.round(p * revisarDuracao)}s
                        </span>
                      </div>
                    ))}
                    {/* Playhead */}
                    <div
                      className="absolute inset-y-0 w-0.5 pointer-events-none"
                      style={{ left: `${(revisarCurrentTime / revisarDuracao) * 100}%`, backgroundColor: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.8)', zIndex: 20 }}
                    />
                    {/* Marcadores de crédito — arrastáveis */}
                    {revisarCreditos.map((cred) => {
                      const pct = Math.min(98, Math.max(1, (cred.timecode / revisarDuracao) * 100));
                      const ativo = revisarCurrentTime >= cred.timecode && revisarCurrentTime < cred.timecode + cred.duracao;
                      return (
                        <div
                          key={cred.id}
                          className="absolute top-0 bottom-0 flex flex-col items-center justify-center cursor-ew-resize select-none group"
                          style={{ left: `${pct}%`, transform: 'translateX(-50%)', zIndex: 10 }}
                          onMouseDown={(e) => handleTimelineDragStart(e, cred.id, cred.timecode)}
                          title={`${cred.icon} ${cred.valor} — ${cred.timecode}s  |  Arraste para ajustar`}
                        >
                          {/* Linha vertical */}
                          <div
                            className="absolute inset-y-0 w-0.5 transition-all"
                            style={{ backgroundColor: cred.cor, opacity: ativo ? 1 : 0.7, boxShadow: ativo ? `0 0 8px ${cred.cor}` : 'none' }}
                          />
                          {/* Badge */}
                          <div
                            className="relative px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest whitespace-nowrap shadow-lg border transition-all group-hover:scale-110"
                            style={{
                              backgroundColor: `${cred.cor}22`,
                              borderColor: cred.cor,
                              color: cred.cor,
                              fontSize: '7px',
                              marginTop: '-4px',
                            }}
                          >
                            <GripHorizontal className="inline h-2 w-2 mr-0.5 opacity-60" />
                            {cred.icon} {cred.timecode}s
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lista editável de créditos */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Ajuste Fino dos Timecodes</span>
                  <div className="grid grid-cols-2 gap-2">
                    {revisarCreditos.map((cred) => (
                      <div
                        key={cred.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all"
                        style={{ backgroundColor: `${cred.cor}0d`, borderColor: `${cred.cor}30` }}
                      >
                        <span className="text-base shrink-0">{cred.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[8px] font-black uppercase tracking-widest truncate" style={{ color: cred.cor }}>{cred.tipo.replace("_", " ")}</div>
                          <div className="text-[10px] font-bold text-white truncate">{cred.valor}</div>
                        </div>
                        {/* Input direto de timecode */}
                        <div className="flex items-center gap-1 shrink-0">
                          <input
                            type="number"
                            min={0}
                            max={revisarDuracao}
                            value={cred.timecode}
                            onChange={(e) => {
                              const v = Math.max(0, Math.min(revisarDuracao, Number(e.target.value)));
                              setRevisarCreditos(prev => prev.map(c => c.id === cred.id ? { ...c, timecode: v } : c));
                            }}
                            onClick={() => {
                              if (revisarVideoRef.current) {
                                revisarVideoRef.current.currentTime = cred.timecode;
                                setRevisarCurrentTime(cred.timecode);
                              }
                            }}
                            className="w-14 px-2 py-1 rounded-lg border text-[10px] font-mono text-center focus:outline-none transition-all"
                            style={{ backgroundColor: '#0a0a0a', borderColor: `${cred.cor}40`, color: cred.cor }}
                          />
                          <span className="text-[9px] text-zinc-600">s</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
