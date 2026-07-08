import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from "react";
import { a as Route, d as db } from "./router-NcdNWgek.js";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Cloud, PenTool, Search, Film, Sparkles, MonitorPlay, Undo2, Redo2, FileText, Trash2, FolderOpen, X, GripHorizontal } from "lucide-react";
import { u as useAutoCredits } from "./useAutoCredits-sOhlO_wH.js";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "@neondatabase/serverless";
const DB_NAME = "desknews_drafts";
const STORE_NAME = "drafts";
const openDB = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});
async function autosave(id, feature, data) {
  const db2 = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db2.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(data, `${feature}_${id}`);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function restoreDraft(id, feature) {
  const db2 = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db2.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(`${feature}_${id}`);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function useAutosave(draftId, feature, data, delay = 1500) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const timeoutRef = useRef();
  useEffect(() => {
    if (!draftId) return;
    setIsSaving(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      await autosave(draftId, feature, data);
      setLastSaved(/* @__PURE__ */ new Date());
      setIsSaving(false);
    }, delay);
  }, [draftId, feature, JSON.stringify(data), delay]);
  return { isSaving, lastSaved };
}
function AutosaveIndicator({ isSaving, lastSaved }) {
  return /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 text-xs font-mono", children: isSaving ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-yellow-500", children: [
    /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }),
    "Salvando rascunho..."
  ] }) : lastSaved ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-emerald-500", children: [
    /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }),
    "Salvo localmente"
  ] }) : /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-[var(--text-tertiary)]", children: [
    /* @__PURE__ */ jsx(Cloud, { className: "h-3.5 w-3.5" }),
    "Nuvem"
  ] }) });
}
function formatarTextoRedacao(texto) {
  return texto.toUpperCase();
}
function inserirNoCursor(textareaRef, mascara) {
  if (!textareaRef) return;
  const inicio = textareaRef.selectionStart;
  const fim = textareaRef.selectionEnd;
  const texto = textareaRef.value;
  const novoTexto = texto.substring(0, inicio) + mascara + texto.substring(fim);
  return novoTexto;
}
function RedacaoPage() {
  const user = null;
  const {
    edit
  } = Route.useSearch();
  Route.useNavigate();
  const [materias, setMaterias] = useState([]);
  const [pautas, setPautas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [selecionada, setSelecionada] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [corpo, setCorpo] = useState("");
  const [estrutura, setEstrutura] = useState("");
  const [status, setStatus] = useState("rascunho");
  const [pautaId, setPautaId] = useState("");
  const [cabeca, setCabeca] = useState("");
  const [tempoVt, setTempoVt] = useState("");
  const [tempoCab, setTempoCab] = useState("");
  const [deixa, setDeixa] = useState("");
  const [editorTexto, setEditorTexto] = useState("");
  const [editorImagem, setEditorImagem] = useState("");
  const [creditoReporter, setCreditoReporter] = useState("");
  const [duracaoVt, setDuracaoVt] = useState(null);
  const [timelineJson, setTimelineJson] = useState(null);
  const [revisarOpen, setRevisarOpen] = useState(false);
  const [revisarVideoUrl, setRevisarVideoUrl] = useState(null);
  const [revisarDirHandle, setRevisarDirHandle] = useState(null);
  const [revisarCreditos, setRevisarCreditos] = useState([]);
  const [revisarDuracao, setRevisarDuracao] = useState(120);
  const [revisarCurrentTime, setRevisarCurrentTime] = useState(0);
  const revisarVideoRef = useRef(null);
  const revisarTimelineRef = useRef(null);
  const draggingCreditRef = useRef(null);
  const parsearCreditosRevisao = useCallback((estruturaAtual, dur) => {
    const linhas = estruturaAtual.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    const items = [];
    let totalPalavras = 0;
    linhas.forEach((linha) => {
      const upper = linha.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (upper.startsWith("[SONORA]")) {
        const v = linha.replace(/\[SONORA\]/i, "").trim();
        items.push({
          tipo: "SONORA",
          valor: v,
          palavras: 3
        });
        totalPalavras += 3;
      } else if (upper.startsWith("[PASSAGEM]")) {
        const v = linha.replace(/\[PASSAGEM\]/i, "").trim();
        items.push({
          tipo: "PASSAGEM",
          valor: v,
          palavras: 4
        });
        totalPalavras += 4;
      } else if (upper.startsWith("[IMAGENS]")) {
        const v = linha.replace(/\[IMAGENS\]/i, "").trim();
        items.push({
          tipo: "IMAGENS",
          valor: v,
          palavras: 3
        });
        totalPalavras += 3;
      } else if (!upper.startsWith("[")) {
        const p = linha.split(/\s+/).length;
        items.push({
          tipo: "OFF",
          valor: "",
          palavras: p
        });
        totalPalavras += p;
      }
    });
    const creditos = [];
    let acum = 0;
    const corMap = {
      SONORA: "#22c55e",
      PASSAGEM: "#f59e0b",
      ED_TEXTO: "#3b82f6",
      ED_IMAGEM: "#ec4899",
      REPÓRTER: "#06b6d4",
      IMAGENS: "#a855f7"
    };
    const iconMap = {
      SONORA: "🎤",
      PASSAGEM: "🎥",
      ED_TEXTO: "📝",
      ED_IMAGEM: "🖼️",
      REPÓRTER: "🎙️",
      IMAGENS: "📷"
    };
    items.forEach((it, idx) => {
      const pos = totalPalavras > 0 ? acum / totalPalavras : 0;
      if (it.tipo !== "OFF") {
        creditos.push({
          id: `${it.tipo}-${idx}`,
          tipo: it.tipo,
          valor: it.valor,
          cor: corMap[it.tipo] || "#888",
          icon: iconMap[it.tipo] || "📌",
          timecode: Math.round(pos * dur),
          duracao: 5
        });
      }
      acum += it.palavras;
    });
    if (editorTexto) creditos.push({
      id: "ED_TEXTO",
      tipo: "ED_TEXTO",
      valor: editorTexto,
      cor: corMap.ED_TEXTO,
      icon: "📝",
      timecode: Math.round(0.82 * dur),
      duracao: 5
    });
    if (editorImagem) creditos.push({
      id: "ED_IMAGEM",
      tipo: "ED_IMAGEM",
      valor: editorImagem,
      cor: corMap.ED_IMAGEM,
      icon: "🖼️",
      timecode: Math.round(0.88 * dur),
      duracao: 5
    });
    return creditos.sort((a, b) => a.timecode - b.timecode);
  }, [editorTexto, editorImagem, creditoReporter]);
  const abrirRevisar = async () => {
    if (!estrutura || estrutura.trim().length < 10) {
      toast.warning("Adicione a estrutura/lauda antes de revisar.");
      return;
    }
    if (!window.showDirectoryPicker) {
      toast.error("Seu navegador não suporta seleção de pasta. Use Chrome/Edge.");
      return;
    }
    try {
      const handle = await window.showDirectoryPicker({
        mode: "read"
      });
      setRevisarDirHandle(handle);
      const dur = duracaoVt || 120;
      setRevisarDuracao(dur);
      setRevisarCreditos(parsearCreditosRevisao(estrutura, dur));
      setRevisarCurrentTime(0);
      setRevisarVideoUrl(null);
      if (titulo) {
        const normalize = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
        const normTitulo = normalize(titulo);
        for await (const [name, entry] of handle.entries()) {
          if (entry.kind === "file" && (name.endsWith(".mp4") || name.endsWith(".mov"))) {
            const normName = normalize(name.replace(/\.(mp4|mov)$/i, ""));
            if (normName === normTitulo || normName.includes(normTitulo.slice(0, 8))) {
              const fh = entry;
              const file = await fh.getFile();
              const url = URL.createObjectURL(file);
              setRevisarVideoUrl(url);
              break;
            }
          }
        }
      }
      setRevisarOpen(true);
    } catch (err) {
      if (err.name !== "AbortError") toast.error("Erro ao abrir pasta");
    }
  };
  const handleTimelineDragStart = (e, creditoId, timecodeAtual) => {
    e.preventDefault();
    draggingCreditRef.current = {
      id: creditoId,
      startX: e.clientX,
      startTimecode: timecodeAtual
    };
    const onMove = (ev) => {
      if (!draggingCreditRef.current || !revisarTimelineRef.current) return;
      const rect = revisarTimelineRef.current.getBoundingClientRect();
      const dx = ev.clientX - draggingCreditRef.current.startX;
      const dSecs = dx / rect.width * revisarDuracao;
      const novoTc = Math.max(0, Math.min(revisarDuracao - 1, Math.round(draggingCreditRef.current.startTimecode + dSecs)));
      setRevisarCreditos((prev) => prev.map((c) => c.id === draggingCreditRef.current.id ? {
        ...c,
        timecode: novoTc
      } : c));
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
      await db.query(`UPDATE materias SET timeline_json = $1, duracao_vt = $2 WHERE id = $3`, [json, dur, selecionada.id]);
    }
    toast.success("Timecodes salvos!");
    setRevisarOpen(false);
  };
  const {
    extractCredits,
    isLoading: isLoadingAutoCredits
  } = useAutoCredits({
    apiKey: "gsk_RecCHZh5dHY6zNJLlTAWGyt3FYekwzlSYmsXzYIl8ZtKM0d9Zf7",
    autoPopulate: true,
    deduplicate: true
  });
  async function sugerirCreditosComIA() {
    if (!estrutura || estrutura.length < 10) {
      toast.warning("Escreva a estrutura/lauda da matéria antes de sugerir créditos.");
      return;
    }
    try {
      const sugeridos = await extractCredits(estrutura, editorTexto || void 0, creditoReporter || void 0);
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
  const [historico, setHistorico] = useState([]);
  const [indexHistorico, setIndexHistorico] = useState(-1);
  const cabecaRef = useRef(null);
  const estruturaRef = useRef(null);
  const draftId = selecionada ? selecionada.id : "nova-materia-temp";
  const {
    isSaving,
    lastSaved
  } = useAutosave(draftId, "redacao", {
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
    duracao_vt: duracaoVt
  }, 1500);
  async function carregarDados() {
    try {
      setLoading(true);
      const [mRes, pRes] = await Promise.all([db.query(`SELECT * FROM materias ORDER BY updated_at DESC`), db.query(`SELECT id, titulo FROM pautas ORDER BY created_at DESC`)]);
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
      const materia = materias.find((m) => m.id === edit);
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
  function adicionarAoHistorico(novoTitulo, novoCorpo, novaEstrutura) {
    const novaEntrada = {
      titulo: novoTitulo,
      corpo: novoCorpo,
      estrutura: novaEstrutura
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
  async function salvarMateria(e) {
    e.preventDefault();
    if (!titulo.trim()) {
      toast.error("O título é obrigatório");
      return;
    }
    try {
      if (selecionada) {
        await db.query(`UPDATE materias SET
             titulo = $1, corpo = $2, estrutura = $3, cabeca = $4,
             tempo_vt = $5, tempo_cab = $6, deixa = $7,
             editor_texto = $8, editor_imagem = $9, credito_reporter = $10,
             pauta_id = $11, status = $12, duracao_vt = $13, updated_at = $14
           WHERE id = $15`, [titulo, corpo, estrutura, cabeca, tempoVt, tempoCab, deixa, editorTexto, editorImagem, creditoReporter, pautaId || null, status, duracaoVt, (/* @__PURE__ */ new Date()).toISOString(), selecionada.id]);
        toast.success("Matéria atualizada com sucesso!");
      } else {
        const {
          rows
        } = await db.query(`INSERT INTO materias
             (titulo, corpo, estrutura, cabeca, tempo_vt, tempo_cab, deixa,
              editor_texto, editor_imagem, credito_reporter, pauta_id, status, autor_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING *`, [titulo, corpo, estrutura, cabeca, tempoVt, tempoCab, deixa, editorTexto, editorImagem, creditoReporter, pautaId || null, status, user?.id]);
        toast.success("Matéria criada com sucesso!");
        if (rows && rows[0]) setSelecionada(rows[0]);
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
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2e3,
          messages: [{
            role: "user",
            content: prompt
          }]
        })
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
  const aplicarFormatacaoCabeca = () => {
    setCabeca(formatarTextoRedacao(cabeca));
  };
  const aplicarFormatacaoEstrutura = () => {
    setEstrutura(formatarTextoRedacao(estrutura));
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex h-screen bg-[#09090b]", children: [
    /* @__PURE__ */ jsx("style", { children: `
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
      ` }),
    /* @__PURE__ */ jsxs("aside", { className: "w-80 bg-[#141416] border-r border-[#22c55e]/20 overflow-y-auto flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "sticky top-0 bg-[#09090b] border-b border-[#22c55e]/20 p-4 space-y-3 z-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-9 w-9 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/40", children: /* @__PURE__ */ jsx(PenTool, { className: "h-5 w-5 text-[#22c55e]" }) }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black tracking-tight font-mono uppercase text-white", children: "REDAÇÃO" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-[#6b7280]" }),
          /* @__PURE__ */ jsx("input", { type: "text", value: busca, onChange: (e) => setBusca(e.target.value), placeholder: "BUSCAR MATÉRIA...", className: "w-full pl-9 pr-3 py-2 bg-[#141416] border border-[#22c55e]/20 rounded-xl text-white placeholder-[#4b5563] text-body-sm focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all" })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => {
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
        }, className: "w-full py-2 px-3 rounded-xl bg-[#22c55e] hover:bg-[#22c55e]/90 text-black font-bold text-body-sm transition-all active:scale-[0.98]", children: "+ NOVA MATÉRIA" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto px-3 py-4 space-y-2", children: materias.filter((m) => m.titulo?.toLowerCase().includes(busca.toLowerCase())).map((materia) => /* @__PURE__ */ jsxs("div", { onClick: () => {
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
      }, className: `p-3 rounded-lg cursor-pointer border transition-all border-l-[3px] ${selecionada?.id === materia.id ? "bg-[#22c55e]/10 border-[#22c55e]/50 border-l-[#22c55e]" : "bg-[#141416] border-[#22c55e]/20 border-l-[#22c55e]/30 hover:border-[#22c55e]/40"}`, children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-white text-body-sm truncate", children: materia.titulo }),
        /* @__PURE__ */ jsx("p", { className: "text-[#6b7280] text-[11px] mt-1", children: materia.status.toUpperCase() }),
        /* @__PURE__ */ jsx("p", { className: "text-[#4b5563] text-[10px] mt-0.5", children: new Date(materia.updated_at).toLocaleDateString("pt-BR") })
      ] }, materia.id)) })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: salvarMateria, className: "flex-1 flex flex-col overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "sticky top-0 z-20 bg-[#141416] border-b border-[#22c55e]/20 p-4 shadow-lg", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 max-w-5xl mx-auto", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx("p", { className: "text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1", children: selecionada ? "Editando" : "Nova Matéria" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(AutosaveIndicator, { isSaving, lastSaved }),
          /* @__PURE__ */ jsxs("select", { value: status, onChange: (e) => setStatus(e.target.value), className: "px-3 py-1.5 rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 text-body-sm font-bold", children: [
            /* @__PURE__ */ jsx("option", { value: "rascunho", children: "RASCUNHO" }),
            /* @__PURE__ */ jsx("option", { value: "revisao", children: "REVISÃO" }),
            /* @__PURE__ */ jsx("option", { value: "publicado", children: "PUBLICADO" })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "px-4 py-1.5 rounded-xl bg-[#22c55e] hover:bg-[#22c55e]/90 text-black font-bold text-body-sm shadow-lg transition-all active:scale-[0.98]", children: selecionada ? "ATUALIZAR" : "SALVAR" }),
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: abrirRevisar, className: "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold text-body-sm transition-all active:scale-[0.98] border", style: {
            backgroundColor: "#7c3aed20",
            borderColor: "#7c3aed50",
            color: "#c084fc"
          }, children: [
            /* @__PURE__ */ jsx(Film, { className: "h-3.5 w-3.5" }),
            " REVISAR"
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl w-full mx-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4 bg-[#141416] p-4 rounded-lg border border-[#22c55e]/20 border-l-[3px] border-l-[#22c55e] shadow-lg", children: [
          /* @__PURE__ */ jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1.5", children: "VINCULAR A UMA PAUTA" }),
            /* @__PURE__ */ jsxs("select", { value: pautaId, onChange: (e) => setPautaId(e.target.value), className: "w-full px-3 py-2 text-body-sm rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all", children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "MATÉRIA AVULSA (SEM PAUTA)" }),
              pautas.map((p) => /* @__PURE__ */ jsx("option", { value: p.id, children: p.titulo }, p.id))
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1.5", children: "CRÉDITO DO REPÓRTER" }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx("input", { type: "text", value: creditoReporter, onChange: (e) => setCreditoReporter(e.target.value), placeholder: "EX: JOÃO SILVA", className: "w-full px-3 py-2 text-body-sm rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white placeholder-[#4b5563] focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: sugerirCreditosComIA, disabled: isLoadingAutoCredits, title: "Sugerir créditos com IA", className: "shrink-0 px-3 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e]/20 disabled:opacity-50 transition-all flex items-center justify-center", children: /* @__PURE__ */ jsx(Sparkles, { className: `w-4 h-4 ${isLoadingAutoCredits ? "animate-pulse" : ""}` }) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("input", { type: "text", value: titulo, onChange: (e) => setTitulo(e.target.value), onBlur: () => adicionarAoHistorico(titulo, corpo, estrutura), placeholder: "TÍTULO PRINCIPAL DA MATÉRIA...", className: "w-full bg-transparent border-none text-white placeholder-[#4b5563] font-bold tracking-tight text-h1 focus:outline-none p-0 resize-none", style: {
          lineHeight: "1.2"
        } }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-4 bg-[#141416] p-4 rounded-lg border border-[#22c55e]/20 border-l-[3px] border-l-[#22c55e] shadow-lg", children: [
          /* @__PURE__ */ jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1.5", children: "DEIXA (ÚLTIMAS PALAVRAS DO VT)" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: deixa, onChange: (e) => setDeixa(e.target.value), placeholder: "///NA REPORTAGEM DE HOJE//", className: "w-full px-3 py-2 text-body-sm rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1.5", children: "TEMPO CABEÇA" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: tempoCab, onChange: (e) => setTempoCab(e.target.value), placeholder: "0:15", className: "w-full px-3 py-2 text-body-sm rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white font-mono text-center focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1.5", children: "TEMPO VT" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: tempoVt, onChange: (e) => setTempoVt(e.target.value), placeholder: "1:30", className: "w-full px-3 py-2 text-body-sm rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white font-mono text-center focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1.5", children: "EDITOR DE TEXTO" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: editorTexto, onChange: (e) => setEditorTexto(e.target.value), placeholder: "NOME DO EDITOR", className: "w-full px-3 py-2 text-body-sm rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-1.5", children: "EDITOR DE IMAGEM" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: editorImagem, onChange: (e) => setEditorImagem(e.target.value), placeholder: "NOME DO EDITOR", className: "w-full px-3 py-2 text-body-sm rounded-xl bg-[#09090b] border border-[#22c55e]/20 text-white focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center gap-2 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider bg-[#141416] border border-[#22c55e]/20 px-3 py-1 rounded shadow-lg border-l-[3px] border-l-[#22c55e]", children: [
              /* @__PURE__ */ jsx(MonitorPlay, { className: "h-3.5 w-3.5 text-[#22c55e]" }),
              " TEXTO DA CABEÇA (APRESENTADOR)"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-1 opacity-0 hover:opacity-100 transition-opacity", children: [
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirSonoraCapeca, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+SONORA" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirPassagemCabeca, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+PASSAGEM" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirOffCabeca, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+OFF" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirProducaoCabeca, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+PRODUÇÃO" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirEdTextoCabeca, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+ED// TEXTO" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirEdImagensCabeca, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+ED// IMAGENS" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirImagensCabeca, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+IMAGENS" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("textarea", { ref: cabecaRef, value: cabeca, onChange: (e) => setCabeca(e.target.value), onBlur: aplicarFormatacaoCabeca, placeholder: "TEXTO QUE O APRESENTADOR VAI LER NA ABERTURA DA MATÉRIA///", rows: 3, className: "w-full px-4 py-3.5 rounded-md bg-[#141416] border border-[#22c55e]/20 text-white placeholder-[#4b5563] focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all duration-300 resize-none text-body" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center gap-2 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider bg-[#141416] border border-[#22c55e]/20 px-3 py-1 rounded shadow-lg border-l-[3px] border-l-[#22c55e]", children: [
              /* @__PURE__ */ jsx(PenTool, { className: "h-3.5 w-3.5 text-[#22c55e]" }),
              " ROTEIRO TÉCNICO // DECUPAGEM (VT)"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-1 opacity-0 hover:opacity-100 transition-opacity", children: [
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirSonora, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+SONORA" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirPassagem, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+PASSAGEM" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirOff, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+OFF" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirProducao, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+PRODUÇÃO" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirEdTexto, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+ED// TEXTO" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirEdImagens, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+ED// IMAGENS" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: inserirImagens, className: "px-2 py-1 rounded-lg text-[10px] font-bold text-[#9ca3af] hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-all duration-200", children: "+IMAGENS" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative rounded-lg overflow-hidden border border-[#22c55e]/20 bg-[#141416] border-l-[3px] border-l-[#22c55e]", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 px-3 py-1.5 border-b border-[#22c55e]/10 bg-[#09090b]", children: [
              /* @__PURE__ */ jsxs("button", { type: "button", onClick: desfazer, disabled: indexHistorico <= 0, title: "Desfazer (Ctrl+Z)", className: "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold text-[#6b7280] hover:text-[#22c55e] hover:bg-[#22c55e]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all", children: [
                /* @__PURE__ */ jsx(Undo2, { className: "h-3 w-3" }),
                " DESFAZER"
              ] }),
              /* @__PURE__ */ jsxs("button", { type: "button", onClick: refazer, disabled: indexHistorico >= historico.length - 1, title: "Refazer (Ctrl+Shift+Z)", className: "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold text-[#6b7280] hover:text-[#22c55e] hover:bg-[#22c55e]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all", children: [
                /* @__PURE__ */ jsx(Redo2, { className: "h-3 w-3" }),
                " REFAZER"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex", children: [
              /* @__PURE__ */ jsx("div", { className: "bg-[#09090b] text-[#6b7280] text-[10px] font-mono p-3 select-none border-r border-[#22c55e]/20 text-right min-w-[3rem] overflow-hidden", children: estrutura.split("\n").map((_, idx) => /* @__PURE__ */ jsx("div", { className: "h-5 leading-5", children: idx + 1 }, idx)) }),
              /* @__PURE__ */ jsx("textarea", { ref: estruturaRef, value: estrutura, onChange: (e) => setEstrutura(e.target.value), onBlur: aplicarFormatacaoEstrutura, onKeyDown: (e) => {
                if (e.ctrlKey && !e.shiftKey && e.key === "z") {
                  e.preventDefault();
                  desfazer();
                }
                if (e.ctrlKey && e.shiftKey && e.key === "Z") {
                  e.preventDefault();
                  refazer();
                }
              }, rows: 10, placeholder: "[OFF 1]\n///ABERTURA DO APRESENTADOR COM A NOTÍCIA PRINCIPAL///\n\n[SONORA] JOÃO SILVA / ESPECIALISTA\n///OPINIÃO DO ESPECIALISTA SOBRE O TEMA///\n\n[OFF 2]\n///CONTINUAÇÃO DA NARRAÇÃO COM MAIS DETALHES///\n\n[PASSAGEM] MARIA SANTOS // SÃO PAULO\n///POSICIONAMENTO DO REPÓRTER EM CAMPO///\n\n[OFF 3] FINAL\n///ENCERRAMENTO E DESPEDIDA///", className: "flex-1 px-4 py-3.5 bg-[#141416] text-white placeholder-[#4b5563] focus:outline-none focus:ring-4 focus:ring-[#22c55e]/30 transition-all duration-300 resize-none whitespace-pre-wrap break-words text-body-sm leading-relaxed font-mono text-justify overflow-y-auto", style: {
                fontFamily: "'Segoe UI', 'Roboto Mono', 'Courier New', monospace",
                letterSpacing: "0.5px"
              } })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center gap-2 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider bg-[#141416] border border-[#22c55e]/20 px-3 py-1 rounded shadow-lg border-l-[3px] border-l-[#22c55e]", children: [
              /* @__PURE__ */ jsx(FileText, { className: "h-3.5 w-3.5 text-[#22c55e]" }),
              " MATÉRIA ESCRITA // TEXTO WEB CORRIDO"
            ] }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: gerarSugestaoWeb, disabled: gerandoSugestao, className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e]/20 hover:border-[#22c55e]/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]", children: gerandoSugestao ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("svg", { className: "animate-spin h-3 w-3", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [
                /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8v8z" })
              ] }),
              "GERANDO..."
            ] }) : /* @__PURE__ */ jsx(Fragment, { children: "✦ SUGESTÃO" }) })
          ] }),
          /* @__PURE__ */ jsx("textarea", { value: corpo, onChange: (e) => setCorpo(e.target.value), onBlur: () => adicionarAoHistorico(titulo, corpo, estrutura), placeholder: "TEXTO CORRIDO // MATÉRIA WEB///", rows: 10, className: "w-full px-4 py-3.5 rounded-md bg-[#141416] border border-[#22c55e]/20 text-white placeholder-[#4b5563] focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all duration-300 resize-none text-body" })
        ] }),
        estrutura && estrutura.trim().length > 10 && /* @__PURE__ */ jsxs("div", { className: "space-y-3 border-t border-[#22c55e]/10 pt-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("label", { className: "inline-flex items-center gap-2 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider bg-[#141416] border border-[#22c55e]/20 px-3 py-1 rounded shadow-lg border-l-[3px] border-l-[#22c55e]", children: "📹 TIMELINE DE CRÉDITOS // SINCRONIZAÇÃO VT" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[11px] font-bold text-[#6b7280] uppercase tracking-wider", children: "DURAÇÃO DO VT (s):" }),
              /* @__PURE__ */ jsx("input", { type: "number", min: 0, max: 3600, value: duracaoVt ?? "", onChange: (e) => setDuracaoVt(e.target.value ? Number(e.target.value) : null), placeholder: "ex: 120", className: "w-20 px-2 py-1 text-body-sm rounded-lg bg-[#09090b] border border-[#22c55e]/20 text-white font-mono text-center focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition-all" })
            ] })
          ] }),
          (() => {
            const duracao = duracaoVt || 120;
            const corMap = {
              SONORA: "#22c55e",
              PASSAGEM: "#f59e0b",
              IMAGENS: "#a855f7",
              ED_TEXTO: "#3b82f6",
              ED_IMAGEM: "#ec4899",
              REPÓRTER: "#06b6d4"
            };
            const iconMap = {
              SONORA: "🎤",
              PASSAGEM: "🎥",
              IMAGENS: "📷",
              ED_TEXTO: "📝",
              ED_IMAGEM: "🖼️",
              REPÓRTER: "🎙️"
            };
            let creditos = [];
            if (timelineJson) {
              try {
                const saved = JSON.parse(timelineJson);
                creditos = saved.map((c) => ({
                  tipo: c.tipo,
                  valor: c.valor,
                  cor: corMap[c.tipo] || "#888",
                  icon: iconMap[c.tipo] || "📌",
                  posicao: duracao > 0 ? c.timecode / duracao : 0
                }));
              } catch {
              }
            }
            if (creditos.length === 0) {
              const linhas = estrutura.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
              let totalPalavras = 0;
              const wordsPerItem = [];
              linhas.forEach((linha) => {
                const upper = linha.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                if (upper.startsWith("[SONORA]")) {
                  const partes = linha.replace(/\[SONORA\]/i, "").trim();
                  const palavras = partes.split(/\s+/).length || 3;
                  totalPalavras += palavras;
                  wordsPerItem.push({
                    tipo: "SONORA",
                    valor: partes || "SONORA",
                    palavras
                  });
                } else if (upper.startsWith("[PASSAGEM]")) {
                  const partes = linha.replace(/\[PASSAGEM\]/i, "").trim();
                  totalPalavras += 4;
                  wordsPerItem.push({
                    tipo: "PASSAGEM",
                    valor: partes || "PASSAGEM",
                    palavras: 4
                  });
                } else if (upper.startsWith("[IMAGENS]")) {
                  const partes = linha.replace(/\[IMAGENS\]/i, "").trim();
                  totalPalavras += 3;
                  wordsPerItem.push({
                    tipo: "IMAGENS",
                    valor: partes || "CINEGRAFISTA",
                    palavras: 3
                  });
                } else if (!upper.startsWith("[")) {
                  const palavras = linha.split(/\s+/).length;
                  totalPalavras += palavras;
                  wordsPerItem.push({
                    tipo: "OFF",
                    valor: "",
                    palavras
                  });
                }
              });
              let acumulado = 0;
              wordsPerItem.forEach((item) => {
                const pos = totalPalavras > 0 ? acumulado / totalPalavras : 0;
                if (item.tipo !== "OFF") {
                  creditos.push({
                    tipo: item.tipo,
                    valor: item.valor,
                    cor: corMap[item.tipo] || "#888",
                    icon: iconMap[item.tipo] || "📌",
                    posicao: pos
                  });
                }
                acumulado += item.palavras;
              });
              if (editorTexto) creditos.push({
                tipo: "ED_TEXTO",
                valor: editorTexto,
                cor: "#3b82f6",
                icon: "📝",
                posicao: 0.82
              });
              if (editorImagem) creditos.push({
                tipo: "ED_IMAGEM",
                valor: editorImagem,
                cor: "#ec4899",
                icon: "🖼️",
                posicao: 0.88
              });
            }
            if (creditos.length === 0) return /* @__PURE__ */ jsx("div", { className: "text-[#4b5563] text-[11px] italic text-center py-4", children: "Adicione [SONORA] ou [PASSAGEM] na estrutura para ver a timeline de créditos." });
            return /* @__PURE__ */ jsxs("div", { className: "bg-[#141416] border border-[#22c55e]/20 rounded-xl p-4 space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative h-8 bg-[#09090b] rounded-lg overflow-visible border border-[#22c55e]/10", children: [
                [0.25, 0.5, 0.75].map((pos) => /* @__PURE__ */ jsx("div", { className: "absolute top-0 bottom-0 w-px bg-[#22c55e]/10", style: {
                  left: `${pos * 100}%`
                }, children: /* @__PURE__ */ jsxs("span", { className: "absolute top-1 text-[8px] font-mono text-[#4b5563] -translate-x-1/2 whitespace-nowrap", children: [
                  Math.round(pos * duracao),
                  "s"
                ] }) }, pos)),
                creditos.map((cred, idx) => /* @__PURE__ */ jsx("div", { className: "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center", style: {
                  left: `${Math.min(95, Math.max(2, cred.posicao * 100))}%`
                }, title: `${cred.tipo}: ${cred.valor} (~${Math.round(cred.posicao * duracao)}s)`, children: /* @__PURE__ */ jsx("div", { className: "w-2 h-5 rounded-sm cursor-pointer transition-all hover:scale-110", style: {
                  backgroundColor: cred.cor,
                  boxShadow: `0 0 6px ${cred.cor}60`
                } }) }, idx))
              ] }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: creditos.map((cred, idx) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-2 py-1.5 rounded-lg border", style: {
                backgroundColor: `${cred.cor}10`,
                borderColor: `${cred.cor}30`
              }, children: [
                /* @__PURE__ */ jsx("span", { className: "text-base shrink-0", children: cred.icon }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[8px] font-black uppercase tracking-widest", style: {
                    color: cred.cor
                  }, children: cred.tipo.replace("_", " ") }),
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] font-bold text-white truncate", children: cred.valor })
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-mono shrink-0", style: {
                  color: cred.cor
                }, children: [
                  "~",
                  Math.round(cred.posicao * duracao),
                  "s"
                ] })
              ] }, idx)) }),
              /* @__PURE__ */ jsxs("p", { className: "text-[9px] text-[#4b5563] text-center", children: [
                "Timecodes estimados por posição na lauda. Duração do VT: ",
                /* @__PURE__ */ jsxs("strong", { className: "text-[#22c55e]", children: [
                  duracao,
                  "s"
                ] }),
                ".",
                !duracaoVt && " Defina a duração acima para maior precisão."
              ] })
            ] });
          })()
        ] }),
        selecionada && /* @__PURE__ */ jsx("div", { className: "border-t border-red-500/10 pt-6 pb-4 flex justify-end", children: /* @__PURE__ */ jsxs("button", { type: "button", onClick: deletarMateria, className: "flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 font-bold text-body-sm transition-all active:scale-[0.98]", children: [
          /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
          "DELETAR MATÉRIA"
        ] }) })
      ] })
    ] }),
    revisarOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center", style: {
      backgroundColor: "rgba(0,0,0,0.85)"
    }, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col rounded-2xl border shadow-2xl overflow-hidden", style: {
      backgroundColor: "#0d0d0d",
      borderColor: "#7c3aed50",
      width: "860px",
      maxWidth: "95vw",
      maxHeight: "90vh"
    }, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-5 py-3 border-b shrink-0", style: {
        borderColor: "#7c3aed30",
        backgroundColor: "#141416"
      }, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Film, { className: "h-4 w-4", style: {
            color: "#c084fc"
          } }),
          /* @__PURE__ */ jsx("span", { className: "font-black uppercase tracking-widest text-sm", style: {
            color: "#c084fc"
          }, children: "REVISAR VT" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-zinc-600 font-mono truncate max-w-xs", children: titulo })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: async () => {
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
          }, className: "flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all", style: {
            backgroundColor: "#1a1a1a",
            borderColor: "#3a3a3a",
            color: "#9ca3af"
          }, children: [
            /* @__PURE__ */ jsx(FolderOpen, { className: "h-3 w-3" }),
            " Trocar VT"
          ] }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: salvarTimecodes, className: "flex items-center gap-1 px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all active:scale-[0.97]", style: {
            backgroundColor: "#7c3aed20",
            borderColor: "#7c3aed50",
            color: "#c084fc"
          }, children: "✓ SALVAR TIMECODES" }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setRevisarOpen(false), className: "p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col overflow-hidden flex-1 min-h-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative bg-black shrink-0", style: {
          aspectRatio: "16/9",
          maxHeight: "320px"
        }, children: [
          revisarVideoUrl ? /* @__PURE__ */ jsx("video", { ref: revisarVideoRef, src: revisarVideoUrl, className: "w-full h-full object-contain", controls: true, onTimeUpdate: (e) => {
            const t = e.currentTarget.currentTime;
            setRevisarCurrentTime(t);
            if (e.currentTarget.duration && !isNaN(e.currentTarget.duration)) {
              setRevisarDuracao(Math.round(e.currentTarget.duration));
            }
          }, onLoadedMetadata: (e) => {
            const dur = Math.round(e.currentTarget.duration);
            setRevisarDuracao(dur);
            setRevisarCreditos(parsearCreditosRevisao(estrutura, dur));
          } }) : /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-700", children: [
            /* @__PURE__ */ jsx(Film, { className: "h-10 w-10" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest", children: "Nenhum VT encontrado na pasta" }),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "video/mp4,video/quicktime";
              input.onchange = () => {
                const file = input.files?.[0];
                if (!file) return;
                setRevisarVideoUrl(URL.createObjectURL(file));
              };
              input.click();
            }, className: "flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all", style: {
              backgroundColor: "#1a1a1a",
              borderColor: "#3a3a3a",
              color: "#9ca3af"
            }, children: [
              /* @__PURE__ */ jsx(FolderOpen, { className: "h-4 w-4" }),
              " Selecionar VT manualmente"
            ] })
          ] }),
          (() => {
            const ativo = revisarCreditos.find((c) => revisarCurrentTime >= c.timecode && revisarCurrentTime < c.timecode + c.duracao);
            if (!ativo) return null;
            return /* @__PURE__ */ jsx("div", { className: "absolute bottom-3 left-3 right-3 pointer-events-none", children: /* @__PURE__ */ jsxs("div", { className: "flex items-stretch overflow-hidden rounded-sm shadow-xl max-w-xs", children: [
              /* @__PURE__ */ jsx("div", { className: "w-1 shrink-0", style: {
                backgroundColor: ativo.cor
              } }),
              /* @__PURE__ */ jsxs("div", { className: "px-3 py-1.5 flex-1", style: {
                backgroundColor: "rgba(0,0,0,0.92)"
              }, children: [
                /* @__PURE__ */ jsx("div", { className: "text-white font-bold text-xs uppercase tracking-wide", children: ativo.valor }),
                /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-widest", style: {
                  color: ativo.cor
                }, children: ativo.tipo.replace("_", " ") })
              ] })
            ] }) });
          })()
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto px-5 py-4 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-zinc-500", children: "Timeline de Créditos" }),
              /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-mono text-zinc-600", children: [
                String(Math.floor(revisarCurrentTime / 60)).padStart(2, "0"),
                ":",
                String(Math.round(revisarCurrentTime % 60)).padStart(2, "0"),
                " / ",
                String(Math.floor(revisarDuracao / 60)).padStart(2, "0"),
                ":",
                String(revisarDuracao % 60).padStart(2, "0")
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { ref: revisarTimelineRef, className: "relative rounded-xl overflow-visible", style: {
              height: "56px",
              backgroundColor: "#0a0a0a",
              border: "1px solid #2a2a2a"
            }, onClick: (e) => {
              if (!revisarVideoRef.current || draggingCreditRef.current) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              const t = Math.max(0, Math.min(revisarDuracao, pct * revisarDuracao));
              revisarVideoRef.current.currentTime = t;
              setRevisarCurrentTime(t);
            }, children: [
              /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 rounded-l-xl", style: {
                width: `${revisarCurrentTime / revisarDuracao * 100}%`,
                backgroundColor: "#ffffff08"
              } }),
              [0.25, 0.5, 0.75].map((p) => /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 w-px", style: {
                left: `${p * 100}%`,
                backgroundColor: "#2a2a2a"
              }, children: /* @__PURE__ */ jsxs("span", { className: "absolute bottom-1 text-[8px] font-mono text-zinc-700 -translate-x-1/2", children: [
                Math.round(p * revisarDuracao),
                "s"
              ] }) }, p)),
              /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 w-0.5 pointer-events-none", style: {
                left: `${revisarCurrentTime / revisarDuracao * 100}%`,
                backgroundColor: "#ef4444",
                boxShadow: "0 0 6px rgba(239,68,68,0.8)",
                zIndex: 20
              } }),
              revisarCreditos.map((cred) => {
                const pct = Math.min(98, Math.max(1, cred.timecode / revisarDuracao * 100));
                const ativo = revisarCurrentTime >= cred.timecode && revisarCurrentTime < cred.timecode + cred.duracao;
                return /* @__PURE__ */ jsxs("div", { className: "absolute top-0 bottom-0 flex flex-col items-center justify-center cursor-ew-resize select-none group", style: {
                  left: `${pct}%`,
                  transform: "translateX(-50%)",
                  zIndex: 10
                }, onMouseDown: (e) => handleTimelineDragStart(e, cred.id, cred.timecode), title: `${cred.icon} ${cred.valor} — ${cred.timecode}s  |  Arraste para ajustar`, children: [
                  /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 w-0.5 transition-all", style: {
                    backgroundColor: cred.cor,
                    opacity: ativo ? 1 : 0.7,
                    boxShadow: ativo ? `0 0 8px ${cred.cor}` : "none"
                  } }),
                  /* @__PURE__ */ jsxs("div", { className: "relative px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest whitespace-nowrap shadow-lg border transition-all group-hover:scale-110", style: {
                    backgroundColor: `${cred.cor}22`,
                    borderColor: cred.cor,
                    color: cred.cor,
                    fontSize: "7px",
                    marginTop: "-4px"
                  }, children: [
                    /* @__PURE__ */ jsx(GripHorizontal, { className: "inline h-2 w-2 mr-0.5 opacity-60" }),
                    cred.icon,
                    " ",
                    cred.timecode,
                    "s"
                  ] })
                ] }, cred.id);
              })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-zinc-500", children: "Ajuste Fino dos Timecodes" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: revisarCreditos.map((cred) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all", style: {
              backgroundColor: `${cred.cor}0d`,
              borderColor: `${cred.cor}30`
            }, children: [
              /* @__PURE__ */ jsx("span", { className: "text-base shrink-0", children: cred.icon }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx("div", { className: "text-[8px] font-black uppercase tracking-widest truncate", style: {
                  color: cred.cor
                }, children: cred.tipo.replace("_", " ") }),
                /* @__PURE__ */ jsx("div", { className: "text-[10px] font-bold text-white truncate", children: cred.valor })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
                /* @__PURE__ */ jsx("input", { type: "number", min: 0, max: revisarDuracao, value: cred.timecode, onChange: (e) => {
                  const v = Math.max(0, Math.min(revisarDuracao, Number(e.target.value)));
                  setRevisarCreditos((prev) => prev.map((c) => c.id === cred.id ? {
                    ...c,
                    timecode: v
                  } : c));
                }, onClick: () => {
                  if (revisarVideoRef.current) {
                    revisarVideoRef.current.currentTime = cred.timecode;
                    setRevisarCurrentTime(cred.timecode);
                  }
                }, className: "w-14 px-2 py-1 rounded-lg border text-[10px] font-mono text-center focus:outline-none transition-all", style: {
                  backgroundColor: "#0a0a0a",
                  borderColor: `${cred.cor}40`,
                  color: cred.cor
                } }),
                /* @__PURE__ */ jsx("span", { className: "text-[9px] text-zinc-600", children: "s" })
              ] })
            ] }, cred.id)) })
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsx(RedacaoPage, {});
export {
  SplitComponent as component
};
