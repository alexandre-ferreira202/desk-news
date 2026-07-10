import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback, memo } from "react";
import { db } from "@/lib/db";
import { toast } from "sonner";
import {
  MonitorPlay,
  RefreshCw,
  FileCheck,
  FileX,
  FolderOpen,
  Film,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Youtube,
  X,
  Link,
  Image as ImageIcon,
  Grid2X2,
  Volume2,
  VolumeX,
  PowerOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import GcPanel from "@/components/GcPanel";
import { useAutoCredits } from "@/hooks/useAutoCredits";

export const Route = createFileRoute("/playout")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      date: (search.date as string) || undefined,
      programa: (search.programa as string) || undefined,
    };
  },
  component: PlayoutPage,
  head: () => ({ meta: [{ title: "Exibição (PGM) — DeskNews" }] }),
});

interface PlayoutItem {
  id: string;
  assunto: string;
  cabeca: string | null;
  tempo: string | null;
  materia_id: string | null;
  ordem: number;
  formato: string | null;
}

interface LocalVideoFile {
  name: string;
  sizeMB: number;
  lastModified: string;
  codec: "H.264" | "H.265/HEVC" | "AV1" | "Outro" | "Verificando..." | "Erro";
  blobUrl: string;
  duration: number | null;
}

interface MateriaDB {
  id: string;
  titulo: string;
  editor_texto: string | null;
  editor_imagem: string | null;
  credito_reporter: string | null;
  estrutura: string | null;
}

interface Sonora {
  nome: string;
  funcao: string;
  texto?: string;
  duracaoEstimada?: number;
  timecodeInicio?: number;
}

interface Passagem {
  nome: string;
  local: string;
  texto?: string;
}

interface ItemLauda {
  tipo: "SONORA" | "PASSAGEM" | "IMAGENS" | "ED_TEXTO" | "ED_IMAGEM" | "PRODUÇÃO" | "REPÓRTER";
  nome: string;
  valor?: string;
  ordem: number;
}

interface MateriaComLauda extends MateriaDB {
  produção?: string | null;
  itensLauda: ItemLauda[];
}

declare global {
  interface Window {
    showDirectoryPicker?: (options?: {
      id?: string;
      startIn?: string;
      mode?: "read" | "readwrite";
    }) => Promise<FileSystemDirectoryHandle>;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

interface ParseResult {
  sonoras: Sonora[];
  passagens: Passagem[];
  producao: string | null;
  itensLauda: ItemLauda[];
}

function calcularDuracaoEstimada(texto: string | undefined): number {
  if (!texto) return 0;
  const palavras = texto.trim().split(/\s+/).length;
  return Math.ceil(palavras / 2.5);
}

// ════════════════════════════════════════════════════════════════════════════════
// 🎯 CÁLCULO AUTOMÁTICO DE TIMECODES BASEADO NA LAUDA
// ════════════════════════════════════════════════════════════════════════════════

interface ItemLaudaComPalavras extends ItemLauda {
  palavrasAcumuladas: number;
  posicaoRelativa: number; // 0 a 1 (onde aparece no vídeo)
  timecodeCalculado?: number; // em segundos
}

/**
 * 🎬 Calcula timecodes automáticos para SONORASEEPASSAGENS
 * baseado na duração total do VT e posição na lauda
 * 
 * LÓGICA:
 * - Se VT tem 120 segundos e lauda tem 1000 palavras
 * - Uma SONORA no meio da lauda (500 palavras) = 60 segundos
 */
function calcularTimecodesPorPosicaoNaLauda(
  itensLauda: ItemLauda[],
  duriacaoTotalVT: number // em segundos
): ItemLaudaComPalavras[] {
  if (!itensLauda.length || !duriacaoTotalVT) return itensLauda as any;

  // 1️⃣ Calcular total de palavras na lauda
  let totalPalavras = 0;
  const itensComPalavras: ItemLaudaComPalavras[] = itensLauda.map((item) => {
    const palavrasItem = item.valor ? item.valor.split(/\s+/).length : 0;
    totalPalavras += palavrasItem;
    return {
      ...item,
      palavrasAcumuladas: totalPalavras,
      posicaoRelativa: 0,
      timecodeCalculado: undefined,
    };
  });

  // 2️⃣ Calcular posição relativa de cada item (0 a 1)
  itensComPalavras.forEach((item) => {
    item.posicaoRelativa = totalPalavras > 0 ? item.palavrasAcumuladas / totalPalavras : 0;
    item.timecodeCalculado = Math.round(item.posicaoRelativa * duriacaoTotalVT);
  });

  console.log("📊 Timecodes calculados automaticamente:", {
    duracaoVT: duriacaoTotalVT,
    totalPalavras,
    itens: itensComPalavras
  });
  
  return itensComPalavras;
}

/**
 * 🎥 Extrai duração real do vídeo a partir de um arquivo
 */
async function extrairDuracaoDoVideo(file: File | Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      const duracao = Math.round(video.duration);
      console.log(`⏱️ Duração real do VT detectada: ${duracao}s`);
      resolve(duracao);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Erro ao ler duração do vídeo"));
    };

    video.src = url;
  });
}

/**
 * 🔄 Formata segundos para MM:SS
 */
function formatarTimecode(segundos: number): string {
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
}

// ── Normalizador de tags tolerante a acentos, espaços e variantes ──────────────
// Exemplos de entradas aceitas → tag canônica:
//   [SONORA]            → "SONORA"
//   [PASSAGEM]          → "PASSAGEM"
//   [IMAGENS]           → "IMAGENS"
//   [PRODUCAO] / [PRODUÇÃO] / [PRODUC AO] → "PRODUCAO"
//   [ED. TEXTO] / [ED_TEXTO] / [EDTEXTO]  → "EDTEXTO"
//   [ED. IMAGEM] / [ED_IMAGENS] / [ED IMAGEM] → "EDIMAGEM"
function normalizarTag(linha: string): string | null {
  const m = linha.match(/^\[(.+)\]$/);
  if (!m) return null;
  return m[1]
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")      // remove pontos, espaços, underscores, etc.
    .trim();
}

function parsarSonorasEPassagens(estrutura: string | null): ParseResult {
  const sonoras: Sonora[] = [];
  const passagens: Passagem[] = [];
  const itensLauda: ItemLauda[] = [];
  let producao: string | null = null;
  let ordem = 0;

  if (!estrutura) {
    console.log("⚠️ Estrutura vazia");
    return { sonoras, passagens, producao, itensLauda };
  }

  console.log("📖 Parseando estrutura com NOVO FORMATO:", estrutura);

  const linhas = estrutura.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  let i = 0;
  while (i < linhas.length) {
    const linha = linhas[i];
    const tag = normalizarTag(linha);

    // ════ [SONORA] COM CAPTURA DE TEXTO ════
    if (tag === "SONORA") {
      console.log("🎤 Encontrado [SONORA] (tag raw:", linha, "→", tag, ")");
      
      let nome = "";
      let funcao = "";
      let texto = "";

      // Próxima linha: (NOME DO ENTREVISTADO)
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          nome = nomeMatch[1].trim();
          i++;
          
          // Próxima linha: (FUNÇÃO DO ENTREVISTADO)
          if (i + 1 < linhas.length) {
            const funcaoLinha = linhas[i + 1];
            const funcaoMatch = funcaoLinha.match(/^\(([^)]+)\)$/);
            if (funcaoMatch) {
              funcao = funcaoMatch[1].trim();
              i++;
            }
          }
        }
      }

      // Próxima linha opcional: (MM:SS) — timecode manual
      let timecodeManual: number | undefined = undefined;
      if (i + 1 < linhas.length) {
        const tcLinha = linhas[i + 1];
        const tcMatch = tcLinha.match(/^\((\d{1,2}):(\d{2})\)$/);
        if (tcMatch) {
          timecodeManual = parseInt(tcMatch[1]) * 60 + parseInt(tcMatch[2]);
          i++;
          console.log(`⏱️ Timecode manual encontrado: ${timecodeManual}s`);
        }
      }

      // Coletar texto entre aspas até próximo [BLOCO]
      while (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        if (normalizarTag(proximaLinha) !== null) {
          break;
        }
        const textoMatch = proximaLinha.match(/^"(.+)"$/);
        if (textoMatch) {
          texto += (texto ? " " : "") + textoMatch[1];
          i++;
        } else {
          break;
        }
      }

      if (nome) {
        const duracaoEstimada = calcularDuracaoEstimada(texto);
        sonoras.push({ nome, funcao, texto, duracaoEstimada, timecodeInicio: timecodeManual });
        itensLauda.push({
          tipo: "SONORA",
          nome: "SONORA",
          valor: `${nome} - ${funcao}`,
          ordem: ordem++
        });
        console.log("✅ Sonora adicionada:", { nome, funcao, duracao: duracaoEstimada + "s", timecode: timecodeManual !== undefined ? timecodeManual + "s" : "automático" });
      }
    }

    // ════ [PASSAGEM] ════
    if (tag === "PASSAGEM") {
      console.log("🎥 Encontrado [PASSAGEM] (raw:", linha, "→", tag, ")");
      
      let nome = "";
      let local = "";

      // Próxima linha: (NOME DO REPORTER)
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          nome = nomeMatch[1].trim();
          i++;
          
          // Próxima linha: (LOCAL)
          if (i + 1 < linhas.length) {
            const localLinha = linhas[i + 1];
            const localMatch = localLinha.match(/^\(([^)]+)\)$/);
            if (localMatch) {
              local = localMatch[1].trim();
              i++;
            }
          }
        }
      }

      if (nome) {
        passagens.push({ nome, local });
        itensLauda.push({
          tipo: "PASSAGEM",
          nome: "PASSAGEM",
          valor: `${nome} - ${local}`,
          ordem: ordem++
        });
        console.log("✅ Passagem adicionada:", { nome, local });
      }
    }

    // ════ [IMAGENS] ════
    if (tag === "IMAGENS") {
      console.log("🎞️ Encontrado [IMAGENS] (raw:", linha, "→", tag, ")");
      
      let cinegrafista = "";

      // Próxima linha: (NOME DO CINEGRAFISTA)
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          cinegrafista = nomeMatch[1].trim();
          i++;
        }
      }

      itensLauda.push({
        tipo: "IMAGENS",
        nome: "IMAGENS",
        valor: cinegrafista,
        ordem: ordem++
      });
      console.log("✅ Imagens adicionado:", cinegrafista);
    }

    // ════ [PRODUÇÃO] ════
    if (tag === "PRODUCAO") {
      console.log("🎬 Encontrado [PRODUÇÃO] (raw:", linha, "→", tag, ")");
      
      // Próxima linha: (NOME DO PRODUTOR)
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          producao = nomeMatch[1].trim();
          i++;
          
          itensLauda.push({
            tipo: "PRODUÇÃO",
            nome: "PRODUÇÃO",
            valor: producao,
            ordem: ordem++
          });
          console.log("✅ Produção adicionada:", producao);
        }
      }
    }

    // ════ [ED. TEXTO] / [ED_TEXTO] / [EDTEXTO] ════
    if (tag === "EDTEXTO") {
      console.log("📝 Encontrado [ED. TEXTO] (raw:", linha, "→", tag, ")");
      
      // Próxima linha: (EDITOR DE TEXTO)
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          const edTexto = nomeMatch[1].trim();
          i++;
          
          itensLauda.push({
            tipo: "ED_TEXTO",
            nome: "ED_TEXTO",
            valor: edTexto,
            ordem: ordem++
          });
          console.log("✅ Ed. Texto adicionado:", edTexto);
        }
      }
    }

    // ════ [ED. IMAGEM] / [ED_IMAGENS] / [EDIMAGEM] ════
    if (tag === "EDIMAGEM" || tag === "EDIMAGENS") {
      console.log("🖼️ Encontrado [ED. IMAGEM] (raw:", linha, "→", tag, ")");
      
      // Próxima linha: (EDITOR DE IMAGENS)
      if (i + 1 < linhas.length) {
        const proximaLinha = linhas[i + 1];
        const nomeMatch = proximaLinha.match(/^\(([^)]+)\)$/);
        if (nomeMatch) {
          const edImagem = nomeMatch[1].trim();
          i++;
          
          itensLauda.push({
            tipo: "ED_IMAGEM",
            nome: "ED_IMAGEM",
            valor: edImagem,
            ordem: ordem++
          });
          console.log("✅ Ed. Imagens adicionado:", edImagem);
        }
      }
    }

    i++;
  }

  console.log("📋 Total de sonoras parseadas:", sonoras.length);
  console.log("📋 Total de passagens parseadas:", passagens.length);
  console.log("📋 Total de itens da lauda:", itensLauda.length);
  console.log("📊 Resultado final:", { sonoras, passagens, producao, itensLauda });

  return { sonoras, passagens, producao, itensLauda };
}

// ════════════════════════════════════════════════════════════════════════════════
// 🤖 CÁLCULO DE TIMECODES VIA API (Claude Sonnet)
// Envia o texto completo da lauda + duração real do VT para a IA calcular
// com precisão o momento exato de cada crédito, levando em conta:
//   - Ritmo de locução (aprox. 150 palavras/min em PT-BR)
//   - Pausas naturais entre blocos (SONORA, PASSAGEM, IMAGENS)
//   - Duração estimada de cada SONORA pelo texto entre aspas
//   - Posição relativa na estrutura narrativa
// ════════════════════════════════════════════════════════════════════════════════

interface TimecodeIA {
  creditKey: string; // "NOME|FUNCAO"
  inicio: number;    // segundos
  duracao: number;   // segundos visível
}

async function calcularTimecodesViaIA(
  estrutura: string,
  itensLauda: ItemLauda[],
  duracaoRealVT: number,
  sonorasManuais: Sonora[]
): Promise<CreditoTimeline[]> {

  // Monta lista de créditos que precisam de timecode
  const creditosParaCalcuar = itensLauda.filter((it) =>
    ["SONORA", "PASSAGEM", "ED_TEXTO", "ED_IMAGEM", "REPÓRTER"].includes(it.tipo)
  );
  if (!creditosParaCalcuar.length) return [];

  // Se houver timecodes manuais para TODAS as sonoras, não precisa da IA
  const todasSonorasTemManual = creditosParaCalcuar
    .filter((it) => it.tipo === "SONORA")
    .every((it) => {
      const sepIdx = it.valor?.indexOf(" - ") ?? -1;
      const nome = sepIdx >= 0 ? it.valor!.slice(0, sepIdx).trim() : (it.valor || "").trim();
      return sonorasManuais.some(
        (s) => s.nome.trim().toUpperCase() === nome.toUpperCase() && s.timecodeInicio !== undefined
      );
    });

  // Monta o prompt com contexto completo
  const creditosDescricao = creditosParaCalcuar.map((it, idx) => {
    const sepIdx = it.valor?.indexOf(" - ") ?? -1;
    const nome = sepIdx >= 0 ? it.valor!.slice(0, sepIdx).trim() : (it.valor || "").trim();
    const complemento = sepIdx >= 0 ? it.valor!.slice(sepIdx + 3).trim() : "";
    const manualSonora = it.tipo === "SONORA"
      ? sonorasManuais.find((s) => s.nome.trim().toUpperCase() === nome.toUpperCase())
      : undefined;
    const tcManual = manualSonora?.timecodeInicio !== undefined
      ? `timecode_manual=${manualSonora.timecodeInicio}s`
      : "sem_timecode_manual";
    return `${idx + 1}. tipo=${it.tipo} nome="${nome}" complemento="${complemento}" ${tcManual}`;
  }).join("\n");

  const prompt = `Você é um assistente de playout de telejornalismo. Analise a lauda abaixo e calcule o timecode exato (em segundos) em que cada crédito deve aparecer na tela durante a exibição do VT.

DURAÇÃO TOTAL DO VT: ${duracaoRealVT} segundos

LAUDA COMPLETA:
${estrutura}

CRÉDITOS QUE PRECISAM DE TIMECODE:
${creditosDescricao}

REGRAS PARA CALCULAR:
- Velocidade de locução em português brasileiro: ~150 palavras por minuto (2,5 palavras/segundo)
- Cada SONORA começa quando o texto antes dela termina de ser lido
- A duração de uma SONORA é estimada pelo número de palavras entre aspas (mesma taxa 2,5 p/s), mínimo 4s
- PASSAGEM: aparece quando o repórter entra em cena (após o off anterior terminar)
- ED_TEXTO e ED_IMAGEM: aparecem nos últimos 20% do VT, respeitando a ordem
- REPÓRTER: aparece nos primeiros 3 segundos do VT
- Se houver timecode_manual, USE EXATAMENTE esse valor para o início
- Todos os timecodes devem estar entre 1 e ${duracaoRealVT - 1} segundos
- Distribua os créditos de forma que não se sobreponham (respeite duracao + 1s de gap)

Responda APENAS com JSON válido, sem markdown, neste formato exato:
{
  "timecodes": [
    {"index": 1, "inicio": 12, "duracao": 8},
    {"index": 2, "inicio": 35, "duracao": 5}
  ]
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const text = data.content?.map((b: { type: string; text?: string }) => b.type === "text" ? b.text : "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean) as { timecodes: { index: number; inicio: number; duracao: number }[] };

    console.log("🤖 Timecodes calculados pela IA:", parsed.timecodes);

    // Reconstrói a CreditoTimeline com os timecodes da IA
    const timeline: CreditoTimeline[] = [];
    creditosParaCalcuar.forEach((it, idx) => {
      const tc = parsed.timecodes.find((t) => t.index === idx + 1);
      if (!tc) return;

      const sepIdx = it.valor?.indexOf(" - ") ?? -1;
      const nome = sepIdx >= 0 ? it.valor!.slice(0, sepIdx).trim() : (it.valor || "").trim();
      const complemento = sepIdx >= 0 ? it.valor!.slice(sepIdx + 3).trim() : "";

      let line1 = "";
      let line2 = "";

      if (it.tipo === "SONORA") {
        line1 = nome;
        line2 = complemento;
      } else if (it.tipo === "PASSAGEM") {
        line1 = nome;
        line2 = "REPÓRTER" + (complemento ? ` — ${complemento}` : "");
      } else if (it.tipo === "ED_TEXTO") {
        line1 = it.valor || "";
        line2 = "ED. TEXTO";
      } else if (it.tipo === "ED_IMAGEM") {
        line1 = it.valor || "";
        line2 = "ED. IMAGEM";
      } else if (it.tipo === "REPÓRTER") {
        line1 = it.valor || "";
        line2 = "REPÓRTER";
      }

      if (line1) {
        timeline.push({
          line1,
          line2,
          inicio: Math.max(1, Math.min(tc.inicio, duracaoRealVT - 1)),
          duracao: Math.max(3, tc.duracao),
        });
      }
    });

    return timeline.sort((a, b) => a.inicio - b.inicio);

  } catch (err) {
    console.error("⚠️ Erro na API de timecodes — fallback para contagem de palavras:", err);
    // Fallback: usa o método de contagem de palavras se a API falhar
    return construirTimelineFallback(itensLauda, duracaoRealVT, sonorasManuais);
  }
}

// Fallback: contagem de palavras (método anterior, mantido como segurança)
function construirTimelineFallback(
  itensLauda: ItemLauda[],
  duracaoRealVT: number,
  sonorasManuais: Sonora[]
): CreditoTimeline[] {
  if (!itensLauda.length || !duracaoRealVT) return [];

  const totalPalavras = itensLauda.reduce(
    (acc, it) => acc + (it.valor ? it.valor.split(/\s+/).length : 0), 0
  );

  let palavrasAcumuladas = 0;
  const timeline: CreditoTimeline[] = [];

  itensLauda.forEach((it) => {
    const palavrasItem = it.valor ? it.valor.split(/\s+/).length : 0;
    const posicaoAntes = totalPalavras > 0 ? palavrasAcumuladas / totalPalavras : 0;
    palavrasAcumuladas += palavrasItem;

    if (!["SONORA", "PASSAGEM", "ED_TEXTO", "ED_IMAGEM", "REPÓRTER"].includes(it.tipo)) return;

    let inicio = Math.min(Math.round(posicaoAntes * duracaoRealVT), Math.max(0, duracaoRealVT - 1));
    let duracao = 4;
    let line1 = "";
    let line2 = "";

    if (it.tipo === "SONORA") {
      const sepIdx = it.valor?.indexOf(" - ") ?? -1;
      line1 = sepIdx >= 0 ? it.valor!.slice(0, sepIdx).trim() : (it.valor || "").trim();
      line2 = sepIdx >= 0 ? it.valor!.slice(sepIdx + 3).trim() : "";
      const normLine1 = line1.toUpperCase().trim();
      const manual = sonorasManuais.find((s) => s.nome.trim().toUpperCase() === normLine1);
      if (manual?.timecodeInicio !== undefined) inicio = manual.timecodeInicio;
      if (manual?.duracaoEstimada) duracao = manual.duracaoEstimada;
    } else if (it.tipo === "PASSAGEM") {
      const sepIdx = it.valor?.indexOf(" - ") ?? -1;
      line1 = sepIdx >= 0 ? it.valor!.slice(0, sepIdx).trim() : (it.valor || "").trim();
      const local = sepIdx >= 0 ? it.valor!.slice(sepIdx + 3).trim() : "";
      line2 = "REPÓRTER" + (local ? ` — ${local}` : "");
    } else if (it.tipo === "ED_TEXTO") { line1 = it.valor || ""; line2 = "ED. TEXTO"; }
    else if (it.tipo === "ED_IMAGEM") { line1 = it.valor || ""; line2 = "ED. IMAGEM"; }
    else if (it.tipo === "REPÓRTER") { line1 = it.valor || ""; line2 = "REPÓRTER"; }

    if (line1) timeline.push({ line1, line2, inicio, duracao });
  });

  return timeline.sort((a, b) => a.inicio - b.inicio);
}

function construirTimelineAutoCreditos(
  itensLauda: ItemLauda[],
  duracaoRealVT: number,
  sonorasManuais: Sonora[]
): CreditoTimeline[] {
  // Mantido apenas para compatibilidade — o caminho principal agora é calcularTimecodesViaIA (async)
  return construirTimelineFallback(itensLauda, duracaoRealVT, sonorasManuais);
}

async function detectCodec(file: File): Promise<LocalVideoFile["codec"]> {
  try {
    const buffer = await file.slice(0, 512).arrayBuffer();
    const text = String.fromCharCode(...new Uint8Array(buffer));
    if (text.includes("avc1") || text.includes("avc3") || text.includes("h264")) return "H.264";
    if (text.includes("hvc1") || text.includes("hev1") || text.includes("hevc")) return "H.265/HEVC";
    if (text.includes("av01")) return "AV1";
    const blobUrl = URL.createObjectURL(file);
    return new Promise((resolve) => {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.muted = true;
      v.src = blobUrl;
      const t = setTimeout(() => {
        v.src = "";
        v.load();
        resolve("Outro");
      }, 3000);
      v.onloadedmetadata = () => {
        clearTimeout(t);
        v.src = "";
        v.load();
        resolve("H.264");
      };
      v.onerror = () => {
        clearTimeout(t);
        URL.revokeObjectURL(blobUrl);
        v.src = "";
        resolve("Erro");
      };
    });
  } catch {
    return "Erro";
  }
}

function getVideoDuration(blobUrl: string): Promise<number | null> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.src = blobUrl;
    const t = setTimeout(() => {
      v.src = "";
      resolve(null);
    }, 4000);
    v.onloadedmetadata = () => {
      clearTimeout(t);
      const d = isFinite(v.duration) ? v.duration : null;
      v.src = "";
      resolve(d);
    };
    v.onerror = () => {
      clearTimeout(t);
      v.src = "";
      resolve(null);
    };
  });
}

function formatDuration(secs: number | null): string {
  if (secs === null || isNaN(secs) || !isFinite(secs)) return "--:--";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// ── Monta a URL de embed de uma CAM (YouTube/etc) ──────────────────────────────
// `mute`: true para monitores de PREVIEW (evita áudio duplicado/"delay" no PGM)
// `enableApi`: true para o player do PGM, habilita controle de volume via postMessage
function buildCamEmbedUrl(
  rawUrl: string,
  opts: { mute: boolean; enableApi?: boolean } = { mute: true }
): { url: string; isYoutube: boolean } {
  const ytId = extractYoutubeId(rawUrl);
  if (ytId) {
    const params = new URLSearchParams({
      autoplay: "1",
      mute: opts.mute ? "1" : "0",
      rel: "0",
      playsinline: "1",
    });
    if (opts.enableApi) {
      params.set("enablejsapi", "1");
      if (typeof window !== "undefined") params.set("origin", window.location.origin);
    }
    return { url: `https://www.youtube.com/embed/${ytId}?${params.toString()}`, isYoutube: true };
  }
  return { url: rawUrl, isYoutube: false };
}

// ── Component ─────────────────────────────────────────────────────────────────

function PlayoutPage() {
  const { date, programa } = Route.useSearch();

  // Playlist (espelho)
  const [items, setItems] = useState<PlayoutItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // FIX 4: rastreia o item atual por ID para sobreviver a recargas em tempo real.
  // Quando o Supabase notifica uma mudança e load() é chamado de novo, a lista
  // é reconstruída — se usarmos só currentIndex, ele pode apontar para o item
  // errado. Com o ID, recalculamos o índice correto após cada recarga.
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  // Índice global de cada item (ex: item 1, item 2, item 3...) igual ao TP
  const [globalItemIndex, setGlobalItemIndex] = useState<Record<string, number>>({});
  const [fileStatus, setFileStatus] = useState<Record<string, boolean>>({});
  const [isVerifying, setIsVerifying] = useState(false);

  // ── TELEPROMPTER — acompanhamento do que está sendo lido no TP (tp.tsx) ──
  // Lê o estado publicado pelo TP (master) na tabela tp_master_state
  // e usa a lista `items` (mesmo espelho usado pelo TP) para achar a cabeça atual/próxima.
  const [tpSelectedId, setTpSelectedId] = useState<string | null>(null);
  const [tpConnected, setTpConnected] = useState(false);

  // Pasta local
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [isDirReady, setIsDirReady] = useState(false);
  const [localFiles, setLocalFiles] = useState<LocalVideoFile[]>([]);
  const [isScanningFiles, setIsScanningFiles] = useState(false);

  // Preview / PGM
  const [selectedFile, setSelectedFile] = useState<LocalVideoFile | null>(null);
  const [pgmFile, setPgmFile] = useState<LocalVideoFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pgmProgress, setPgmProgress] = useState(0);
  const [pgmCurrentTime, setPgmCurrentTime] = useState(0);

  // YouTube player
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeInput, setYoutubeInput] = useState("");
  const [youtubeVisible, setYoutubeVisible] = useState(false);
  const [multiviewActive, setMultiviewActive] = useState(false);
  const [activeCam, setActiveCam] = useState<number | null>(null);
  // URLs de vídeo carregados em cada quadrante CAM (índice 0=CAM1 ... 3=CAM4)
  const [camSources, setCamSources] = useState<(string | null)[]>([null, null, null, null]);
  // Tipo de source de cada cam: 'file' | 'url' (YouTube/stream)
  const [camSourceTypes, setCamSourceTypes] = useState<('file' | 'url' | null)[]>([null, null, null, null]);
  // Indica se o preview atual veio de uma CAM do multiview (não de arquivo da playlist)
  const [isCamPreview, setIsCamPreview] = useState(false);
  // Índice da cam que está no preview (0-3)
  const [previewCamIdx, setPreviewCamIdx] = useState<number | null>(null);
  // URL de stream que está no PGM (quando CAM é YouTube/etc)
  const [pgmCamUrl, setPgmCamUrl] = useState<string | null>(null);
  // Controle de áudio da CAM em PGM (mesmo sendo iframe, controlável via YouTube IFrame API)
  const [pgmCamVolume, setPgmCamVolume] = useState(100);
  const [pgmCamMuted, setPgmCamMuted] = useState(false);
  const [pgmCamIsYoutube, setPgmCamIsYoutube] = useState(false);

  // Matéria atual (com dados de profissionais e sonoras/passagens)
  const [materiaAtual, setMateriaAtual] = useState<{
    materia_id: string;
    titulo: string;
    editor_texto: string | null;
    editor_imagem: string | null;
    credito_reporter: string | null;
    sonoras: Sonora[];
    passagens: Passagem[];
    producao: string | null;
    itensLauda: ItemLauda[];
  } | null>(null);

  const sonorasMapRef = useRef<Map<string, { inicio: number; duracao: number }>>(new Map());
  const sonorasDisparadosRef = useRef<Set<string>>(new Set());
  const [sonorasTimeline, setSonorasTimeline] = useState<Array<{
    nome: string;
    funcao: string;
    timecodeInicio: number;
    duracao: number;
  }>>([]);

  // Modal de boas-vindas
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  // ── GC (Gerador de Caracteres) ──
  const [gcVisible, setGcVisible] = useState(false);
  const [gcLine1, setGcLine1] = useState("");
  const [gcLine2, setGcLine2] = useState("");
  const [gcCreditsQueue, setGcCreditsQueue] = useState<{ line1: string; line2: string }[]>([]);
  // Config de layer da tarja (PNG custom + posição/tamanho/fonte), controlada pelo GcPanel
  const [gcLayerConfig, setGcLayerConfig] = useState<{
    tarjaCustomPng: string | null;
    tarjaScaleX: number; tarjaScaleY: number;
    tarjaX: number; tarjaY: number;
    font1Size: number; font1X: number; font1Y: number;
    font2Size: number; font2X: number; font2Y: number;
  } | null>(null);
  const handleGcLayerChange = useCallback((config: typeof gcLayerConfig) => {
    setGcLayerConfig(config);
  }, []);
  const [gcDuration, setGcDuration] = useState(0); // 0 = manual, >0 = segundos até fade out
  const [gcHistory, setGcHistory] = useState<Array<{ line1: string; line2: string }>>([]);
  const [gcPresets, setGcPresets] = useState<Record<string, { line1: string; line2: string }>>({
    "Repórter em Campo": { line1: "", line2: "Repórter em Campo" },
    "Âncora": { line1: "", line2: "Âncora" },
    "Especialista": { line1: "", line2: "Especialista" },
  });


  // ── AUTO-CRÉDITOS (Groq) ──
  const { extractCredits, isLoading: isLoadingAutoCredits } = useAutoCredits({
    apiKey: import.meta.env.VITE_GROQ_API_KEY || "",
    autoPopulate: true,
    deduplicate: true,
  });

  // ── TARJA ──
  const [tarjaVisible, setTarjaVisible] = useState(false);

  // ── LEGENDAS AUTOMÁTICAS (Web Speech API) ──
  const [legendasAtivas, setLegendasAtivas] = useState(false);
  const [legendaTexto, setLegendaTexto] = useState("");
  const [legendaFinal, setLegendaFinal] = useState(""); // último texto confirmado
  const speechRecRef = useRef<any>(null);
  const whisperMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const whisperStreamDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const whisperIsRunningRef = useRef(false);
  const legendaTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── CC TELEPROMPTER — segmentos da lauda distribuídos no tempo do VT ──
  const [ccSegmentos, setCcSegmentos] = useState<{ texto: string; inicio: number; fim: number }[]>([]);
  const [ccTextoAtual, setCcTextoAtual] = useState("");
  const [tarjaPanelOpen, setTarjaPanelOpen] = useState(false);
  const [tarjaHue, setTarjaHue] = useState(0);
  const [tarjaSaturation, setTarjaSaturation] = useState(100);
  const [tarjaAlpha, setTarjaAlpha] = useState(90);
  const [tarjaX, setTarjaX] = useState(50); // % horizontal
  const [tarjaY, setTarjaY] = useState(85); // % vertical
  const [tarjaCustomPng, setTarjaCustomPng] = useState<string | null>(null); // base64 do PNG customizado
  // Escala independente
  const [tarjaScaleX, setTarjaScaleX] = useState(100); // %
  const [tarjaScaleY, setTarjaScaleY] = useState(100); // %
  const [tarjaScaleLock, setTarjaScaleLock] = useState(true);
  // Texto e tipografia
  const [tarjaText, setTarjaText] = useState("TARJA");
  const [tarjaFont, setTarjaFont] = useState("sans-serif");
  const [tarjaBold, setTarjaBold] = useState(true);
  const [tarjaItalic, setTarjaItalic] = useState(false);
  // Para arrastar o painel flutuante
  const [tarjaPanelPos, setTarjaPanelPos] = useState({ x: 200, y: 200 });
  const tarjaDragRef = useRef<{ startX: number; startY: number; startPX: number; startPY: number } | null>(null);
  const tarjaFileInputRef = useRef<HTMLInputElement>(null);

  // ── FRAMES & OVERLAY (Módulo ME — 4 botões) ──
  const [meFrames, setMeFrames] = useState<(string | null)[]>([null, null, null, null]);
  const [meActiveFrame, setMeActiveFrame] = useState<number | null>(null);
  const meFileInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);

  const handleMeFrameLoad = (id: number, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setMeFrames((prev) => {
        const next = [...prev];
        next[id] = reader.result as string;
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleMeFrameClick = (id: number) => {
    if (!meFrames[id]) {
      meFileInputRefs.current[id]?.click();
      return;
    }
    setMeActiveFrame((prev) => {
      const next = prev === id ? null : id;
      if (pgmChannelRef.current?.readyState === 1) {
        pgmChannelRef.current.send(JSON.stringify({
          type: next !== null ? "me_frame_show" : "me_frame_hide",
          frame: next !== null ? meFrames[id] : null,
        }));
      }
      return next;
    });
  };

  const handleMeFrameClear = (id: number, e: MouseEvent) => {
    e.stopPropagation();
    setMeFrames((prev) => {
      const next = [...prev];
      next[id] = null;
      return next;
    });
    if (meActiveFrame === id) {
      setMeActiveFrame(null);
      if (pgmChannelRef.current?.readyState === 1) {
        pgmChannelRef.current.send(JSON.stringify({ type: "me_frame_hide" }));
      }
    }
  };


  // VU meter usa refs + canvas — sem setState, sem re-renders no player
  const vuLevelLRef = useRef(0);
  const vuLevelRRef = useRef(0);
  const vuCanvasRef = useRef<HTMLCanvasElement>(null);
  const vuAudioCtxRef = useRef<AudioContext | null>(null);
  const vuSplitterRef = useRef<ChannelSplitterNode | null>(null);
  const vuAnalyserLRef = useRef<AnalyserNode | null>(null);
  const vuAnalyserRRef = useRef<AnalyserNode | null>(null);
  const vuRafRef = useRef<number | null>(null);
  // Stream compartilhado com o CC (Whisper) — criado junto com o VU meter
  const vuStreamDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  // ── TIMERS (Regressivas) ──
  const [blockRemainingTime, setBlockRemainingTime] = useState(0); // Regressiva do bloco
  const [generalJournalTime, setGeneralJournalTime] = useState(0); // Regressiva geral do jornal
  const [doubleClickCount, setDoubleClickCount] = useState(0); // Para double-click no GC ERASE ALL
  const [transValue, setTransValue] = useState(0); // 0 = PGM puro, 100 = Preview puro (fusão)
  const [transitionType, setTransitionType] = useState<"cut" | "dissolve" | "wipe">("cut");
  const [wipeDirIdx, setWipeDirIdx] = useState(0); // 0=→ 1=← 2=↓ 3=↑ 4=⬋ 5=⬊
  const [autoTransDur, setAutoTransDur] = useState(30); // frames simulados
  const [autoTransRunning, setAutoTransRunning] = useState(false);
  const autoTransRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [dskActive, setDskActive] = useState(false);
  const [dskOpacity, setDskOpacity] = useState(100);
  const [dskPng, setDskPng] = useState<string | null>(null);
  const dskFileInputRef = useRef<HTMLInputElement>(null);
  const [pgmBus, setPgmBus] = useState<"cam1"|"cam2"|"cam3"|"cam4"|"vt"|"black">("black");
  const [pvwBus, setPvwBus] = useState<"cam1"|"cam2"|"cam3"|"cam4"|"vt"|"black">("cam1");
  // Opacidade e z-index dos players via estado React (evita re-render sobrescrever inline style)
  const [playerAOpacity, setPlayerAOpacity] = useState(1);
  const [playerBOpacity, setPlayerBOpacity] = useState(0);
  const [playerAZ, setPlayerAZ] = useState(10);
  const [playerBZ, setPlayerBZ] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  // ── Rastreia itens da lauda removidos (para não voltar com reload do banco) ──
  // Chave: materia_id, Valor: Set de "ordens" já creditadas
  const [removedLaudaOrdens, setRemovedLaudaOrdens] = useState<Record<string, Set<number>>>({});

  // ── Dados do Espelho (Coluna Centro) ──
  // Removido - agora usando itensLauda diretamente

  const handleItemFinished = useCallback(() => {
    setIsPlaying(false);
    setPgmProgress(100);

    // 🧹 Limpa a TARJA ao final do VT — nunca deve "vazar" para o próximo item
    setTarjaVisible(false);
    if (pgmChannelRef.current?.readyState === 1) pgmChannelRef.current.send(JSON.stringify({ type: "tarja_hide" }));
    // 🧹 Limpa o GC (barra de créditos/legenda) também — mesma regra
    setGcVisible(false);
    if (pgmChannelRef.current?.readyState === 1) pgmChannelRef.current.send(JSON.stringify({ type: "gc_hide" }));

    setTimeout(() => {
      setItems((prev) => {
        const finishedIndex = currentIndex - 1;
        if (finishedIndex >= 0 && prev[finishedIndex]) {
          const itemToRemove = prev[finishedIndex];
          const newList = prev.filter((_, idx) => idx !== finishedIndex);

          const newIndex = Math.max(0, currentIndex - 1);
          setCurrentIndex(newIndex);
          // FIX 4: mantém rastreamento por ID após remoção
          setCurrentItemId(newList[newIndex]?.id ?? null);
          toast.success(`"${itemToRemove.assunto}" exibido e removido.`);
          return newList;
        }
        return prev;
      });
    }, 500);
  }, [items, currentIndex]);

  const pgmRemainingTime = pgmFile?.duration ? Math.max(0, pgmFile.duration - pgmCurrentTime) : 0;
  const isEom = pgmRemainingTime > 0 && pgmRemainingTime <= 10;

  // Relógio
  const [activePlayer, setActivePlayer] = useState<"A" | "B">("A");
  const [clock, setClock] = useState("--:--:--");

  // Refs
  const pvwRef = useRef<HTMLVideoElement>(null);
  const camVideoRefs = useRef<(HTMLVideoElement | null)[]>([null, null, null, null]);
  const pgmARef = useRef<HTMLVideoElement>(null);
  const pgmBRef = useRef<HTMLVideoElement>(null);
  const pgmCamIframeRef = useRef<HTMLIFrameElement>(null);
  const blobUrlsRef = useRef<Map<string, string>>(new Map());
  // ── WebSocket para PGM na TV (rede local) ──
  // Troque o IP abaixo pelo IP desta máquina na rede local (ex: 192.168.1.100)
  const WS_URL = "ws://localhost:4242";
  const pgmChannelRef = useRef<WebSocket | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressTimeRef = useRef<HTMLSpanElement>(null);
  const progressRafRef = useRef<number | null>(null);



  // Ref estável para removerItemDaLaudaPorNome — declarada junto à função abaixo

  // Ref com snapshot dos itens da lauda NO MOMENTO do carregamento da matéria.
  // Usado para calcular timecodes sem depender do itensLauda que encolhe ao remover créditos.
  const laudaSnapshotRef = useRef<ItemLauda[]>([]);
  const sonorasSnapshotRef = useRef<Sonora[]>([]);
  const estruturaSnapshotRef = useRef<string>("");
  // Timecodes salvos na Redação — quando presente, tem prioridade sobre IA/fallback
  const timelineJsonRef = useRef<Array<{ tipo: string; valor: string; timecode: number; duracao: number }> | null>(null);

  useEffect(() => {
    if (!materiaAtual?.materia_id || !pgmFile?.duration) {
      sonorasMapRef.current.clear();
      sonorasDisparadosRef.current.clear();
      setSonorasTimeline([]);
      timelineJsonRef.current = null;
      return;
    }

    // Salva snapshot no momento do carregamento (antes de qualquer remoção)
    laudaSnapshotRef.current = materiaAtual.itensLauda;
    sonorasSnapshotRef.current = materiaAtual.sonoras || [];
    estruturaSnapshotRef.current = (materiaAtual as any)._estrutura || "";

    // ── Se a Redação tem timecodes salvos, usa direto — sem IA nem fallback ──
    if (timelineJsonRef.current && timelineJsonRef.current.length > 0) {
      const map = new Map<string, { inicio: number; duracao: number }>();
      const timeline: typeof sonorasTimeline = [];
      timelineJsonRef.current.forEach((c) => {
        const funcao = c.tipo.replace("ED_TEXTO", "ED. TEXTO").replace("ED_IMAGEM", "ED. IMAGEM");
        const key = `${c.valor}|${funcao}`;
        map.set(key, { inicio: c.timecode, duracao: c.duracao ?? 5 });
        timeline.push({ nome: c.valor, funcao, timecodeInicio: c.timecode, duracao: c.duracao ?? 5 });
      });
      sonorasMapRef.current = map;
      sonorasDisparadosRef.current.clear();
      setSonorasTimeline(timeline);
      console.log(`⏱️ useEffect: ${timeline.length} timecode(s) do timeline_json aplicados (VT=${pgmFile.duration}s)`);
      return;
    }

    const aplicarTimeline = (creditosTimeline: CreditoTimeline[], resetDisparados = true) => {
      const map = new Map<string, { inicio: number; duracao: number }>();
      const timeline: typeof sonorasTimeline = [];

      creditosTimeline.forEach((cred) => {
        const key = `${cred.line1}|${cred.line2}`;
        map.set(key, { inicio: cred.inicio, duracao: cred.duracao });
        timeline.push({
          nome: cred.line1,
          funcao: cred.line2,
          timecodeInicio: cred.inicio,
          duracao: cred.duracao,
        });
        console.log(`⏱️ CRÉDITO (VT=${pgmFile.duration}s): ${cred.line1} → ${cred.inicio}s por ${cred.duracao}s`);
      });

      sonorasMapRef.current = map;
      // Só limpa disparados na troca de matéria/VT — não quando a IA refina durante o play
      if (resetDisparados) sonorasDisparadosRef.current.clear();
      setSonorasTimeline(timeline);
    };

    // Fallback imediato com snapshot
    const fallback = construirTimelineFallback(
      laudaSnapshotRef.current,
      pgmFile.duration,
      sonorasSnapshotRef.current
    );
    aplicarTimeline(fallback);

    // IA refina em paralelo
    if (estruturaSnapshotRef.current) {
      console.log("🤖 Calculando timecodes via IA...");
      calcularTimecodesViaIA(
        estruturaSnapshotRef.current,
        laudaSnapshotRef.current,
        pgmFile.duration,
        sonorasSnapshotRef.current
      ).then((creditosIA) => {
        if (creditosIA.length > 0) {
          console.log("✅ Timecodes da IA aplicados:", creditosIA);
          aplicarTimeline(creditosIA, false); // não reseta disparados — play pode estar rolando
          toast.success(`⏱ ${creditosIA.length} timecode(s) calculado(s) pela IA`, { duration: 2500 });
        }
      }).catch((err) => {
        console.warn("⚠️ IA de timecodes falhou, mantendo fallback:", err);
      });
    }
  // Depende SÓ de materia_id e duração — NÃO de itensLauda (que muda ao remover créditos)
  }, [materiaAtual?.materia_id, pgmFile?.duration]);


   useEffect(() => {
    if (!isPlaying || sonorasTimeline.length === 0) return;

    sonorasMapRef.current.forEach((timing, sonoraKey) => {
      if (sonorasDisparadosRef.current.has(sonoraKey)) return;

      if (pgmCurrentTime >= timing.inicio) {
        const pipeIdx = sonoraKey.indexOf('|');
        const nome = pipeIdx >= 0 ? sonoraKey.slice(0, pipeIdx) : sonoraKey;
        const funcao = pipeIdx >= 0 ? sonoraKey.slice(pipeIdx + 1) : "";
        console.log(`🎤 AUTO-CRÉDITO: ${nome} (${funcao}) | previsto=${timing.inicio}s | real=${pgmCurrentTime.toFixed(2)}s`);
        sonorasDisparadosRef.current.add(sonoraKey);
        handleGcTake(nome.trim(), funcao.trim(), timing.duracao);
      }
    });
  // Lê sonorasMapRef.current diretamente — NÃO depende de sonorasTimeline (state)
  // para evitar que a atualização da IA async resete sonorasDisparadosRef durante o play
  }, [pgmCurrentTime, isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      sonorasDisparadosRef.current.clear();
    }
  }, [isPlaying]);



  // ── Relógio ──
  useEffect(() => {
    const t = setInterval(() => setClock(new Date().toLocaleTimeString("pt-BR", { hour12: false })), 1000);
    return () => clearInterval(t);
  }, []);


  // ── VU Meter — analisa o áudio (L/R) do player ativo via Web Audio API ──
  useEffect(() => {
    const el = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!el) return;

    let ctx = vuAudioCtxRef.current;
    if (!ctx) {
      ctx = new AudioContext();
      vuAudioCtxRef.current = ctx;
    }

    let splitter = vuSplitterRef.current;
    let analyserL = vuAnalyserLRef.current;
    let analyserR = vuAnalyserRRef.current;
    if (!splitter || !analyserL || !analyserR) {
      splitter = ctx.createChannelSplitter(2);
      analyserL = ctx.createAnalyser();
      analyserR = ctx.createAnalyser();
      analyserL.fftSize = 256;
      analyserR.fftSize = 256;
      splitter.connect(analyserL, 0);
      splitter.connect(analyserR, 1);
      vuSplitterRef.current = splitter;
      vuAnalyserLRef.current = analyserL;
      vuAnalyserRRef.current = analyserR;
    }

    // Cria (ou reutiliza) o destino de stream compartilhado com o CC/Whisper
    if (!vuStreamDestRef.current) {
      vuStreamDestRef.current = ctx.createMediaStreamDestination();
    }
    const sharedDest = vuStreamDestRef.current;

    try {
      const source = ctx.createMediaElementSource(el);
      source.connect(splitter);
      source.connect(ctx.destination);
      source.connect(sharedDest); // alimenta o stream do Whisper
    } catch {
      // MediaElementSource já criado — grafo já está montado, sharedDest já conectado
    }

    const dataL = new Uint8Array(analyserL.frequencyBinCount);
    const dataR = new Uint8Array(analyserR.frequencyBinCount);
    const tick = () => {
      analyserL!.getByteFrequencyData(dataL);
      analyserR!.getByteFrequencyData(dataR);
      const avgL = dataL.reduce((a, b) => a + b, 0) / dataL.length;
      const avgR = dataR.reduce((a, b) => a + b, 0) / dataR.length;
      vuLevelLRef.current = Math.min(100, Math.round((avgL / 255) * 100));
      vuLevelRRef.current = Math.min(100, Math.round((avgR / 255) * 100));

      // Desenha direto no canvas — zero setState, zero re-render
      const canvas = vuCanvasRef.current;
      if (canvas) {
        const ctx2d = canvas.getContext("2d");
        if (ctx2d) {
          const W = canvas.width, H = canvas.height;
          const rowH = Math.floor(H / 2) - 2;
          const BARS = 50;
          const barW = Math.floor((W - (BARS - 1)) / BARS);
          ctx2d.clearRect(0, 0, W, H);
          [vuLevelLRef.current, vuLevelRRef.current].forEach((level, row) => {
            const yOff = row * (rowH + 4);
            const active = Math.round((level / 100) * BARS);
            for (let i = 0; i < BARS; i++) {
              const x = i * (barW + 1);
              ctx2d.fillStyle = i < active
                ? (i < 35 ? "#22c55e" : i < 45 ? "#eab308" : "#ef4444")
                : "rgba(255,255,255,0.08)";
              ctx2d.fillRect(x, yOff, barW, rowH);
            }
          });
        }
      }

      vuRafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      if (vuRafRef.current) cancelAnimationFrame(vuRafRef.current);
    };
  }, [activePlayer, pgmFile]);

  // ── Controle de áudio da CAM em PGM via YouTube IFrame postMessage API ──
  // Mesmo sendo um <iframe>, conseguimos enviar comandos de volume/mute
  // para o player do YouTube (requer enablejsapi=1 na URL do embed).
  const sendPgmCamCommand = useCallback((func: string, args: unknown[] = []) => {
    const win = pgmCamIframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(JSON.stringify({ event: "command", func, args }), "*");
  }, []);

  // Aplica volume/mute atuais sempre que a CAM em PGM mudar ou o usuário ajustar
  useEffect(() => {
    if (!pgmCamUrl || !pgmCamIsYoutube) return;
    // pequeno delay: o player do YouTube precisa terminar o "handshake" do iframe
    const t = setTimeout(() => {
      sendPgmCamCommand(pgmCamMuted ? "mute" : "unMute");
      sendPgmCamCommand("setVolume", [pgmCamVolume]);
    }, 350);
    return () => clearTimeout(t);
  }, [pgmCamUrl, pgmCamIsYoutube, pgmCamVolume, pgmCamMuted, sendPgmCamCommand]);

  // ── "Alavanca" de áudio da CAM: tira a CAM do ar — vídeo e áudio acabam ──
  const handleCamOffAir = useCallback(() => {
    if (!pgmCamUrl) return;
    // Pede ao player para parar antes de desmontar o iframe
    sendPgmCamCommand("stopVideo");
    setPgmCamUrl(null);
    setPgmCamIsYoutube(false);
    setPgmCamMuted(false);
    setPgmCamVolume(100);
    setPgmFile(null);
    setIsPlaying(false);
    if (pgmChannelRef.current?.readyState === 1)
      pgmChannelRef.current.send(JSON.stringify({ type: "cam_off" }));
    toast.info("CAM retirada do ar — vídeo e áudio encerrados");
  }, [pgmCamUrl, sendPgmCamCommand]);

  // ── WebSocket — conecta ao relay server ──
  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(WS_URL);
      pgmChannelRef.current = ws;
      ws.onopen = () => console.log("[WS] Conectado ao relay server");
      ws.onclose = () => {
        console.warn("[WS] Desconectado. Tentando reconectar em 3s...");
        setTimeout(connect, 3000);
      };
      ws.onerror = (err) => console.error("[WS] Erro:", err);
    };
    connect();
    return () => {
      pgmChannelRef.current?.close();
    };
  }, []);

  // Helper para emitir estado atual para a TV
  const broadcastPgmState = useCallback((overrides: Record<string, unknown> = {}) => {
    pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({ type: "pgm_state", ...overrides }));
  }, []);

  // Sync de currentTime para a TV a cada 2s (mantém sincronia fina)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPlaying) return;
      const activeEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
      if (!activeEl || !activeEl.src) return;
      if (pgmChannelRef.current?.readyState === 1)
        pgmChannelRef.current.send(JSON.stringify({ type: "pgm_sync", currentTime: activeEl.currentTime }));
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlaying, activePlayer]);

  // ── Cleanup blob URLs ──
  useEffect(() => () => {
    blobUrlsRef.current.forEach(URL.revokeObjectURL);
  }, []);

  // ── LAUDA: preenchida APENAS via drag & drop manual (não automaticamente) ──

  // ── GC Auto Fade Out ──
  useEffect(() => {
    if (!gcVisible || gcDuration === 0) return;
    const timer = setTimeout(() => setGcVisible(false), gcDuration * 1000);
    return () => clearTimeout(timer);
  }, [gcVisible, gcDuration]);

  // ── CC TELEPROMPTER: monta segmentos da lauda quando VT/matéria carrega ──────
  useEffect(() => {
    const estrutura = estruturaSnapshotRef.current || (materiaAtual as any)?._estrutura || "";
    const duracao = pgmFile?.duration;
    if (!estrutura || !duracao) { setCcSegmentos([]); setCcTextoAtual(""); return; }

    // ── 1. Coleta blocos de texto em ordem: OFF e SONORA (com texto entre aspas)
    const linhas = estrutura.split("\n").map((l: string) => l.trim()).filter((l: string) => l.length > 1);
    type Bloco = { tipo: "OFF" | "SONORA"; texto: string; nomeSonora?: string };
    const blocos: Bloco[] = [];
    let i = 0;
    while (i < linhas.length) {
      const linha = linhas[i];
      if (/^\[SONORA\]/i.test(linha) || /^\[SONORA\]/.test(linha.toUpperCase())) {
        // Coleta nome e texto da sonora nas linhas seguintes
        let nomeSonora = "";
        let textoSonora = "";
        i++;
        while (i < linhas.length && !/^\[/.test(linhas[i])) {
          if (/^\(.+\)$/.test(linhas[i])) {
            if (!nomeSonora) nomeSonora = linhas[i].slice(1, -1);
          } else if (/^".+"$/.test(linhas[i])) {
            textoSonora += (textoSonora ? " " : "") + linhas[i].slice(1, -1);
          }
          i++;
        }
        if (textoSonora) blocos.push({ tipo: "SONORA", texto: textoSonora, nomeSonora });
        continue;
      }
      if (/^\[.+\]$/.test(linha) || /^\(.+\)$/.test(linha)) { i++; continue; }
      if (linha.length > 3) blocos.push({ tipo: "OFF", texto: linha });
      i++;
    }

    // ── 2. Calcula duração de cada bloco pela contagem de palavras (2.5 p/s)
    const PALAVRAS_POR_SEG = 2.5;
    const MAX_PALAVRAS = 7;

    // Duração estimada de cada bloco
    const blocosDuracao = blocos.map((b) => {
      const palavras = b.texto.split(/\s+/).length;
      return Math.max(1, palavras / PALAVRAS_POR_SEG);
    });
    const totalEstimado = blocosDuracao.reduce((a, b) => a + b, 0);
    // Escala para caber na duração real do VT
    const escala = duracao / Math.max(totalEstimado, 1);

    // ── 3. Distribui no tempo e quebra em linhas de MAX_PALAVRAS
    const segmentos: { texto: string; inicio: number; fim: number }[] = [];
    let cursor = 0;

    blocos.forEach((bloco, idx) => {
      const duracaoBloco = blocosDuracao[idx] * escala;
      const palavras = bloco.texto.split(/\s+/).filter(Boolean);
      const totalPalavrasBloco = palavras.length;

      for (let w = 0; w < palavras.length; w += MAX_PALAVRAS) {
        const chunk = palavras.slice(w, w + MAX_PALAVRAS).join(" ");
        const posInicio = cursor + (w / totalPalavrasBloco) * duracaoBloco;
        const posFim = cursor + ((w + MAX_PALAVRAS) / totalPalavrasBloco) * duracaoBloco;
        segmentos.push({
          texto: chunk,
          inicio: Math.round(posInicio * 10) / 10,
          fim: Math.min(Math.round(posFim * 10) / 10, duracao),
        });
      }
      cursor += duracaoBloco;
    });

    setCcSegmentos(segmentos);
    setCcTextoAtual("");
    console.log(`[CC] ${segmentos.length} segmentos · escala=${escala.toFixed(2)}x · ${duracao}s`);
  }, [materiaAtual?.materia_id, pgmFile?.duration]);

  // ── CC TELEPROMPTER: atualiza texto conforme currentTime ────────────────────
  useEffect(() => {
    if (!legendasAtivas || !isPlaying || !ccSegmentos.length) return;
    // Pega o segmento cujo início já passou — mantém na tela até o próximo começar
    let atual: { texto: string; inicio: number; fim: number } | undefined;
    for (const s of ccSegmentos) {
      if (pgmCurrentTime >= s.inicio) atual = s;
      else break;
    }
    const texto = atual?.texto ?? "";
    setCcTextoAtual((prev) => prev !== texto ? texto : prev);
  }, [pgmCurrentTime, legendasAtivas, isPlaying, ccSegmentos]);

  // Limpa texto ao parar/desligar CC
  useEffect(() => {
    if (!legendasAtivas || !isPlaying) setCcTextoAtual("");
  }, [legendasAtivas, isPlaying]);

  // ── LEGENDAS AUTOMÁTICAS — Groq Whisper via captureStream() ────────────────
  // Usa videoEl.captureStream() para obter o áudio diretamente do elemento <video>
  // sem depender de Web Audio API / MediaElementSource já conectado.
  useEffect(() => {
    if (!legendasAtivas) {
      whisperIsRunningRef.current = false;
      if (whisperMediaRecorderRef.current && whisperMediaRecorderRef.current.state !== "inactive") {
        try { whisperMediaRecorderRef.current.stop(); } catch {}
      }
      whisperMediaRecorderRef.current = null;
      whisperStreamDestRef.current = null;
      setLegendaFinal("");
      if (legendaTimeoutRef.current) clearTimeout(legendaTimeoutRef.current);
      return;
    }

    const groqKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!groqKey) {
      console.warn("[CC] VITE_GROQ_API_KEY não definida");
      toast.error("CC: VITE_GROQ_API_KEY não configurada");
      return;
    }

    const videoEl = (activePlayer === "A" ? pgmARef.current : pgmBRef.current) as any;
    if (!videoEl) {
      console.warn("[CC] Nenhum elemento de vídeo disponível");
      return;
    }

    // captureStream() é suportado no Chrome/Edge — obtém stream direto do elemento
    let mediaStream: MediaStream;
    try {
      mediaStream = videoEl.captureStream ? videoEl.captureStream() : videoEl.mozCaptureStream?.();
      if (!mediaStream) throw new Error("captureStream não suportado");
    } catch (e) {
      console.warn("[CC] captureStream falhou:", e);
      toast.error("CC: browser não suporta captureStream");
      return;
    }

    // Filtra só as tracks de áudio
    const audioTracks = mediaStream.getAudioTracks();
    if (audioTracks.length === 0) {
      console.warn("[CC] Nenhuma track de áudio no stream — vídeo está tocando?");
      toast.error("CC: sem áudio no VT (está tocando?)");
      return;
    }

    const audioOnlyStream = new MediaStream(audioTracks);
    whisperIsRunningRef.current = true;
    console.log("[CC] captureStream OK —", audioTracks.length, "track(s) de áudio");

    const CHUNK_MS = 5000;

    const recordChunk = () => {
      if (!whisperIsRunningRef.current) return;

      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg"]
        .find(t => MediaRecorder.isTypeSupported(t)) ?? "audio/webm";

      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(audioOnlyStream, { mimeType });
      } catch (e) {
        console.warn("[CC] MediaRecorder falhou:", e);
        return;
      }
      whisperMediaRecorderRef.current = recorder;

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      recorder.onstop = async () => {
        if (!whisperIsRunningRef.current) return;

        const blob = new Blob(chunks, { type: mimeType });
        console.log("[CC] chunk:", blob.size, "bytes, mime:", mimeType);

        if (blob.size < 500) {
          console.log("[CC] chunk vazio/silêncio, pulando");
          recordChunk();
          return;
        }

        try {
          const formData = new FormData();
          formData.append("file", blob, "audio.webm");
          formData.append("model", "whisper-large-v3-turbo");
          formData.append("language", "pt");
          formData.append("response_format", "text");

          const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
            method: "POST",
            headers: { Authorization: `Bearer ${groqKey}` },
            body: formData,
          });

          if (res.ok) {
            const text = (await res.text()).trim();
            console.log("[CC] transcrição:", text);
            if (text && text.length > 2) {
              setLegendaFinal(text);
              if (legendaTimeoutRef.current) clearTimeout(legendaTimeoutRef.current);
              legendaTimeoutRef.current = setTimeout(() => setLegendaFinal(""), 5000);
            }
          } else {
            const err = await res.text().catch(() => "");
            console.warn("[CC] Groq erro", res.status, err);
          }
        } catch (err) {
          console.warn("[CC] fetch erro:", err);
        }

        if (whisperIsRunningRef.current) recordChunk();
      };

      recorder.start();
      setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, CHUNK_MS);
    };

    recordChunk();

    return () => {
      whisperIsRunningRef.current = false;
      if (whisperMediaRecorderRef.current && whisperMediaRecorderRef.current.state !== "inactive") {
        try { whisperMediaRecorderRef.current.stop(); } catch {}
      }
      whisperMediaRecorderRef.current = null;
      setLegendaFinal("");
      if (legendaTimeoutRef.current) clearTimeout(legendaTimeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [legendasAtivas, activePlayer, isPlaying]);

  // Normalizar texto para comparação
  const normalizeText = useCallback((text: string): string => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .trim();
  }, []);

  // ── Helpers ──
  // FIX: getFileName não deve GERAR nomes, apenas procurar pelos que existem
  // A normalização deve ser idêntica à do scanLocalFiles para matching correto
  const getFileName = useCallback((assunto: string | null | undefined) => {
    if (!assunto) return "";
    const normalized = normalizeText(assunto);
    // Procura no array de arquivos pelo nome normalizado
    const found = localFiles.find((f) => {
      const normalizedFile = normalizeText(f.name.replace(/\.(mp4|mov)$/i, ""));
      return normalizedFile === normalized;
    });
    return found?.name || "";  // Retorna o nome REAL do arquivo, não um gerado
  }, [normalizeText, localFiles]);

  const getFileUrl = useCallback(
    async (assunto: string | null | undefined): Promise<string | null> => {
      if (!assunto) return null;
      const fileName = getFileName(assunto);
      if (dirHandle) {
        if (blobUrlsRef.current.has(fileName)) return blobUrlsRef.current.get(fileName)!;
        try {
          const fh = await dirHandle.getFileHandle(fileName);
          const file = await fh.getFile();
          const url = URL.createObjectURL(file);
          blobUrlsRef.current.set(fileName, url);
          return url;
        } catch {
          return null;
        }
      }
      return `/materias/${fileName}`;
    },
    [dirHandle, getFileName]
  );

  // ── Verify files ──
  const verifyFiles = useCallback(
    async (itemsToVerify: PlayoutItem[], handle?: FileSystemDirectoryHandle | null) => {
      const h = handle ?? dirHandle;
      setIsVerifying(true);
      const upd: Record<string, boolean> = {};
      await Promise.all(
        itemsToVerify.map(async (item) => {
          const fn = getFileName(item.assunto);
          if (h) {
            try {
              await h.getFileHandle(fn);
              upd[item.id] = true;
            } catch {
              upd[item.id] = false;
            }
          } else {
            try {
              const r = await fetch(`/materias/${fn}`, { method: "HEAD" });
              upd[item.id] = r.ok;
            } catch {
              upd[item.id] = false;
            }
          }
        })
      );
      setFileStatus((prev) => ({ ...prev, ...upd }));
      setIsVerifying(false);
    },
    [dirHandle, getFileName]
  );

  // ── Auto-carrega o topo da fila no Preview ──
  useEffect(() => {
    const autoPreview = async () => {
      if (!selectedFile && items.length > 0 && currentIndex < items.length && items[currentIndex]?.assunto) {
        const url = await getFileUrl(items[currentIndex].assunto);
        if (url && pvwRef.current && pvwRef.current.src !== url) {
          pvwRef.current.src = url;
          pvwRef.current.load();
        }
      }
    };
    autoPreview();
  }, [currentIndex, items, getFileUrl, selectedFile]);

  useEffect(() => {
    if (items.length > 0) verifyFiles(items);
  }, [items, verifyFiles]);

  // Quando o espelho muda (realtime), reaplica a ordenação nos arquivos locais já carregados.
  // Sem isso, a pasta local fica estática enquanto o espelho muda ao vivo.
  useEffect(() => {
    if (localFiles.length === 0 || items.length === 0) return;

    const reordered = items
      .map((item) => {
        const normalizedItem = normalizeText(item.assunto);
        return localFiles.find((f) => {
          const normalizedFile = normalizeText(f.name.replace(/\.(mp4|mov)$/i, ""));
          return normalizedFile === normalizedItem;
        });
      })
      .filter((f): f is LocalVideoFile => f !== undefined);

    const used = new Set(reordered.map((f) => f.name));
    const remaining = localFiles.filter((f) => !used.has(f.name));
    setLocalFiles([...reordered, ...remaining]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, normalizeText]);

  // ── Load playlist COM SINCRONIZAÇÃO EM TEMPO REAL ──
  const load = useCallback(async () => {
    // FIX 1: usa .ilike() em vez de .eq() para comparação case-insensitive,
    //         igual ao TP — evita lista vazia por diferença de maiúsculas/minúsculas
    // FIX 3: .select("id, ordem") + .order("ordem") para garantir
    //         que os blocos venham na sequência correta do espelho
    const { rows: blocks } = await db.query(
      `SELECT id, ordem FROM espelho_blocos
       WHERE data_edicao = $1 AND programa ILIKE $2
       ORDER BY ordem`,
      [date || new Date().toISOString().slice(0, 10), programa || "Jornal da Manhã"]
    );

    if (blocks?.length) {
      const blocoIds = blocks.map((b: any) => b.id);
      const placeholders = blocoIds.map((_: any, idx: number) => `$${idx + 1}`).join(", ");
      const { rows: rawItens } = await db.query(
        `SELECT id, bloco_id, assunto, cabeca, tempo, materia_id, ordem, formato
         FROM espelho_itens
         WHERE bloco_id IN (${placeholders})`,
        blocoIds
      );

      // FIX 2: ordena os itens bloco a bloco, igual ao TP
      // .order("ordem") flat mistura itens de blocos diferentes quando têm a mesma ordem
      // A ordem correta é: todos os itens do bloco 1 em sequência, depois bloco 2, etc.
      const ordenado: PlayoutItem[] = [];
      blocks.forEach((bloco) => {
        const itensDoBloco = (rawItens || [])
          .filter((i) => String(i.bloco_id) === String(bloco.id))
          .sort((a, b) => a.ordem - b.ordem);
        ordenado.push(...(itensDoBloco as PlayoutItem[]));
      });

      setItems(ordenado);
      if (ordenado.length) verifyFiles(ordenado);
    } else {
      setItems([]);
    }
  }, [date, programa, verifyFiles]);

  useEffect(() => {
    load();
  }, [load]);

  // Calcula o índice global de cada item (como faz o TP)
  // Isso permite mostrar "1. ITEM 1", "2. ITEM 2" etc na mesma ordem do TP
  useEffect(() => {
    const indexMap: Record<string, number> = {};
    items.forEach((item, idx) => {
      indexMap[item.id] = idx + 1;  // +1 para começar em 1 ao invés de 0
    });
    setGlobalItemIndex(indexMap);
  }, [items]);

  // FIX 4 (cont.): quando a lista é recarregada pelo realtime, re-sincroniza
  // o currentIndex usando o ID do item que estava "NEXT", evitando salto de posição
  useEffect(() => {
    if (currentItemId) {
      const idx = items.findIndex((i) => i.id === currentItemId);
      if (idx !== -1 && idx !== currentIndex) {
        setCurrentIndex(idx);
      }
    }
  }, [items, currentItemId, currentIndex]);

  // ── TELEPROMPTER: descobre qual item está sendo lido agora no TP ──
  // Lê a mesma tabela que o tp.tsx usa para sincronizar Master → Câmera.
  // Assim o operador do playout acompanha exatamente o que o apresentador está lendo.
  // Mesma normalização usada no tp.tsx (trim + lowercase) — evita mismatch
  // por espaços extras ou diferença de maiúsculas/minúsculas entre as telas.
  const tpCanal = `tp-sync-${(programa || "geral").trim().toLowerCase()}`;
  const [tpSyncingNow, setTpSyncingNow] = useState(false);

  const pollTp = useCallback(async (opts?: { verbose?: boolean }) => {
    try {
      const { rows } = await db.query(
        `SELECT state, updated_at FROM tp_master_state WHERE canal = $1 LIMIT 1`,
        [tpCanal]
      );
      const row = rows?.[0];
      const state = row?.state as { selectedItemId?: string } | undefined;

      if (state?.selectedItemId) {
        setTpSelectedId(state.selectedItemId);
        setTpConnected(true);
        if (opts?.verbose) toast.success("Sincronizado! Item recebido do teleprompter.");
      } else if (opts?.verbose) {
        if (!row) {
          toast.warning(`Nenhum registro encontrado para o canal "${tpCanal}". Confirme se o tp.tsx está aberto com o mesmo programa/data.`);
        } else {
          toast.warning("Registro encontrado, mas sem item selecionado no teleprompter ainda.");
        }
      }
    } catch (err) {
      setTpConnected(false);
      if (opts?.verbose) toast.error("Erro ao consultar o teleprompter: " + (err as Error).message);
    }
  }, [tpCanal]);

  useEffect(() => {
    pollTp();
    const interval = setInterval(pollTp, 2000); // 2s — acompanhamento quase em tempo real
    return () => clearInterval(interval);
  }, [pollTp]);

  // Botão "🎙️ MASTER" do painel: manda um comando para a(s) aba(s) do tp.tsx
  // nesse canal virarem MASTER automaticamente (sem precisar mexer lá).
  // Usa jsonb_build_object + merge (||) para não apagar o que o master já gravou.
  const handleForceTpMaster = useCallback(async () => {
    try {
      await db.query(
        `INSERT INTO tp_master_state (canal, state, updated_at)
         VALUES ($1, jsonb_build_object('requestedMode', 'master'), now())
         ON CONFLICT (canal) DO UPDATE
           SET state = tp_master_state.state || jsonb_build_object('requestedMode', 'master'),
               updated_at = now()`,
        [tpCanal]
      );
      toast.success("Comando enviado: a tela do teleprompter deve virar MASTER em instantes.");
    } catch {
      toast.error("Não foi possível enviar o comando ao teleprompter.");
    }
  }, [tpCanal]);

  // Botão "🔄 SYNC" do painel: força reler o estado agora, sem esperar o intervalo.
  const handleManualTpSync = useCallback(async () => {
    setTpSyncingNow(true);
    await pollTp({ verbose: true });
    setTimeout(() => setTpSyncingNow(false), 400);
  }, [pollTp]);

  // Item atual (o que está no TP agora) e o próximo com cabeça na sequência
  const tpCurrentIndex = items.findIndex((i) => i.id === tpSelectedId);
  const tpCurrentItem = tpCurrentIndex >= 0 ? items[tpCurrentIndex] : null;
  const tpNextItem =
    tpCurrentIndex >= 0
      ? items.slice(tpCurrentIndex + 1).find((i) => !!i.cabeca) ?? items[tpCurrentIndex + 1] ?? null
      : null;

  // ── Sincroniza mudanças do espelho via POLLING (Neon não tem realtime nativo) ──
  useEffect(() => {
    const interval = setInterval(() => {
      load();
    }, 4000); // recarrega a cada 4s

    return () => {
      clearInterval(interval);
    };
  }, [load]);

  // 🧹 MONITORA LAUDA VAZIA E LIMPA CACHE DE CRÉDITOS
  useEffect(() => {
    if (materiaAtual?.itensLauda?.length === 0) {
      console.log("🧹 LAUDA VAZIA - Limpando cache de créditos...");
      setGcCreditsQueue([]);
      setGcLine1("");
      setGcLine2("");
      if (gcVisible) setGcVisible(false);
    }
  }, [materiaAtual?.itensLauda?.length]);

  // ── Scan local files ──
  const scanLocalFiles = useCallback(async (handle: FileSystemDirectoryHandle) => {
    setIsScanningFiles(true);
    setLocalFiles([]);
    const found: LocalVideoFile[] = [];

    for await (const [name, entry] of (handle as any).entries()) {
      if (entry.kind === "file" && (name.endsWith(".mp4") || name.endsWith(".mov"))) {
        const fileHandle = entry as FileSystemFileHandle;
        const file = await fileHandle.getFile();
        const codec = await detectCodec(file);
        const sizeMB = file.size / 1024 / 1024;
        const blobUrl = URL.createObjectURL(file);
        const duration = await getVideoDuration(blobUrl);

        found.push({
          name,
          codec,
          sizeMB: Math.round(sizeMB * 100) / 100,
          lastModified: new Date(file.lastModified).toLocaleString("pt-BR"),
          blobUrl,
          duration,
        });
      }
    }

    // Reordenar arquivos conforme a ordem do espelho
    if (items.length > 0) {
      const reordered = items
        .map(item => {
          const normalizedItem = normalizeText(item.assunto);
          return found.find(f => {
            const normalizedFile = normalizeText(f.name.replace(/\.(mp4|mov)$/i, ""));
            return normalizedFile === normalizedItem;
          });
        })
        .filter((f): f is LocalVideoFile => f !== undefined);

      // Adicionar arquivos que sobraram (não estão no espelho)
      const used = new Set(reordered.map(f => f.name));
      const remaining = found.filter(f => !used.has(f.name));

      setLocalFiles([...reordered, ...remaining]);
    } else {
      setLocalFiles(found);
    }

    setIsScanningFiles(false);
  }, [items, normalizeText]);

  // ── Handle select directory ──
  const handleSelectDir = async () => {
    // Verifica se a API existe no navegador
    if (typeof window === 'undefined' || !window.showDirectoryPicker) {
      toast.error(
        "Seu navegador não suporta a seleção de pastas ou o site não está em HTTPS. " +
        "Certifique-se de usar Chrome ou Edge e acessar via HTTPS ou localhost."
      );
      return;
    }

    try {
      const handle = await window.showDirectoryPicker({ mode: "read" });
      setDirHandle(handle);
      setIsDirReady(true);
      setShowWelcomeModal(false);
      await scanLocalFiles(handle);
      toast.success("Pasta vinculada com sucesso!");
    } catch (err: any) {
      if (err.name === 'AbortError') return; // Usuário cancelou a seleção
      
      console.error("Erro ao selecionar pasta:", err);
      toast.error("Erro ao selecionar pasta");
    }
  };

  // ── Pré-carrega player B no primeiro frame (sem tocar) para evitar black no TRANS ──
  // Pré-carrega o arquivo no player INATIVO (não no que está no ar)
  // Se activePlayer === "A", o inativo é B. Se for "B", o inativo é A.
  const preloadInactivePlayer = useCallback((blobUrl: string, currentActivePlayer: "A" | "B") => {
    const inactiveEl = currentActivePlayer === "A" ? pgmBRef.current : pgmARef.current;
    if (!inactiveEl) return;
    inactiveEl.pause();
    inactiveEl.src = blobUrl;
    inactiveEl.muted = true;
    inactiveEl.preload = "auto";
    const onReady = () => {
      inactiveEl.pause();
      inactiveEl.currentTime = 0;
      inactiveEl.muted = false;
      inactiveEl.removeEventListener("canplay", onReady);
    };
    inactiveEl.addEventListener("canplay", onReady);
    inactiveEl.load();
  }, []);

  // ── Supabase Broadcast: escuta RODA_VT do Teleponto (cross-machine) ────────
  // Refs espelham o estado mais recente — o canal subscreve apenas 1x no mount
  const itemsRef = useRef(items);
  const localFilesRef = useRef(localFiles);
  const activePlayerRef = useRef(activePlayer);
  const pgmCamUrlRef = useRef(pgmCamUrl);
  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { localFilesRef.current = localFiles; }, [localFiles]);
  useEffect(() => { activePlayerRef.current = activePlayer; }, [activePlayer]);
  useEffect(() => { pgmCamUrlRef.current = pgmCamUrl; }, [pgmCamUrl]);

  const getFileUrlRef = useRef(getFileUrl);
  const getFileNameRef = useRef(getFileName);
  const preloadInactivePlayerRef = useRef(preloadInactivePlayer);
  const sendPgmCamCommandRef = useRef(sendPgmCamCommand);
  useEffect(() => { getFileUrlRef.current = getFileUrl; }, [getFileUrl]);
  useEffect(() => { getFileNameRef.current = getFileName; }, [getFileName]);
  useEffect(() => { preloadInactivePlayerRef.current = preloadInactivePlayer; }, [preloadInactivePlayer]);
  useEffect(() => { sendPgmCamCommandRef.current = sendPgmCamCommand; }, [sendPgmCamCommand]);

  const processRodaVt = useCallback(async (payload: { materiaId?: string | null; assunto?: string; itemId?: string | null }) => {
      const { materiaId, assunto, itemId } = payload ?? {};
      console.log("[Playout] RODA_VT recebido →", { materiaId, assunto, itemId });

        // ── 1. Sincroniza posição na fila ─────────────────────────────────
        const currentItems = itemsRef.current;
        const targetItem = currentItems.find(
          (i) => i.id === itemId || (materiaId && i.materia_id === materiaId) || i.assunto === assunto
        );
        if (targetItem) {
          const idx = currentItems.findIndex((i) => i.id === targetItem.id);
          if (idx !== -1) {
            setCurrentIndex(idx);
            setCurrentItemId(targetItem.id);
          }
        }

        // ── 2. TAKE automático do vídeo ───────────────────────────────────
        const currentLocalFiles = localFilesRef.current;
        const currentActivePlayer = activePlayerRef.current;
        const currentPgmCamUrl = pgmCamUrlRef.current;

        const expectedFileName = getFileNameRef.current(assunto);
        const file = currentLocalFiles.find((f) => f.name === expectedFileName);
        const url = file?.blobUrl ?? (await getFileUrlRef.current(assunto));

        if (url && file) {
          if (pvwRef.current) { pvwRef.current.src = url; pvwRef.current.load(); }
          setSelectedFile(file);
          preloadInactivePlayerRef.current(file.blobUrl, currentActivePlayer);

          if (currentPgmCamUrl) sendPgmCamCommandRef.current("stopVideo");

          const aEl = pgmARef.current;
          const bEl = pgmBRef.current;
          if (bEl) { bEl.pause(); bEl.src = ""; }

          if (aEl) {
            aEl.pause();
            aEl.oncanplay = null;
            const rodaVtAC = new AbortController();

            const startPlay = () => {
              aEl.play()
                .then(() => {
                  setPgmCamUrl(null);
                  setPgmCamIsYoutube(false);
                  setPgmCamMuted(false);
                  setPgmCamVolume(100);
                  setPgmFile(file);
                  setIsPlaying(true);
                  setPlayerAOpacity(1); setPlayerAZ(10);
                  setPlayerBOpacity(0); setPlayerBZ(0);
                  setActivePlayer("A");
                  setPgmProgress(0);
                  setPgmCurrentTime(0);
                })
                .catch(() => {});
            };

            const isSameSrc = aEl.src === file.blobUrl;
            if (isSameSrc && aEl.readyState >= 3) {
              aEl.currentTime = 0;
              startPlay();
            } else {
              aEl.addEventListener("canplay", () => {
                rodaVtAC.abort();
                startPlay();
              }, { once: true, signal: rodaVtAC.signal });
              aEl.src = file.blobUrl;
              aEl.load();
            }
          }

          if (pgmChannelRef.current?.readyState === 1)
            pgmChannelRef.current.send(JSON.stringify({ type: "pgm_take", fileName: file.name }));

          toast.success(`▶ AUTO-PLAY: "${assunto}"`, { duration: 3000 });
        } else {
          console.warn("[Playout] RODA_VT: arquivo não encontrado →", assunto);
          toast.warning(`⚠ VT não encontrado na pasta: "${assunto}"`, { duration: 4000 });
        }

        // ── 3. Carrega Lauda + Créditos automaticamente ───────────────────
        if (materiaId) {
          try {
            // Busca matéria + tempo previsto do item no espelho (para calcular timecodes mesmo sem o VT carregado)
            const [{ rows }, { rows: itemRows }] = await Promise.all([
              db.query(
                `SELECT id, titulo, editor_texto, editor_imagem, credito_reporter, estrutura, timeline_json, duracao_vt
                 FROM materias WHERE id = $1`,
                [materiaId]
              ),
              itemId
                ? db.query(`SELECT tempo FROM espelho_itens WHERE id = $1`, [itemId])
                : Promise.resolve({ rows: [] }),
            ]);
            const data = rows?.[0];

            if (data) {
              const { sonoras, passagens, producao, itensLauda: itensEstrutura } = parsarSonorasEPassagens(data.estrutura);
              setGcLine1(""); setGcLine2(""); setGcCreditsQueue([]); setGcVisible(false);
              // 🧹 Limpa a TARJA do VT anterior — evita que fique "vazada" sobre o próximo VT
              setTarjaVisible(false);
              if (pgmChannelRef.current?.readyState === 1) pgmChannelRef.current.send(JSON.stringify({ type: "tarja_hide" }));
              setRemovedLaudaOrdens((prev) => { const n = { ...prev }; delete n[data.id]; return n; });

              // ── Prioriza timeline_json salvo na Redação ──
              let creditsList: { line1: string; line2: string }[] = [];
              let itensLauda = itensEstrutura;
              let timelineJsonParsed: Array<{ id: string; tipo: string; valor: string; timecode: number; duracao: number }> | null = null;
              if (data.timeline_json) {
                try { timelineJsonParsed = JSON.parse(data.timeline_json); } catch { timelineJsonParsed = null; }
              }

              if (timelineJsonParsed && timelineJsonParsed.length > 0) {
                timelineJsonRef.current = timelineJsonParsed;
                // Substitui completamente a lauda pelos créditos revisados na Redação
                itensLauda = timelineJsonParsed.map((c, idx) => ({
                  tipo: c.tipo as any,
                  nome: c.tipo,
                  valor: c.valor,
                  ordem: idx,
                }));
                creditsList = timelineJsonParsed.map((c) => ({
                  line1: c.valor,
                  line2: c.tipo.replace("ED_TEXTO", "ED. TEXTO").replace("ED_IMAGEM", "ED. IMAGEM"),
                }));
                console.log("[Playout] RODA_VT: usando timeline_json da Redação →", creditsList.length, "créditos");
              } else {
                // Fallback: campos simples da matéria
                if (data.editor_texto) creditsList.push({ line1: data.editor_texto, line2: "ED. TEXTO" });
                if (data.editor_imagem) creditsList.push({ line1: data.editor_imagem, line2: "ED. IMAGEM" });
                if (data.credito_reporter) creditsList.push({ line1: data.credito_reporter, line2: "REPÓRTER" });
                let laudaOrdem = itensLauda.length;
                if (data.editor_texto && !itensLauda.some((it) => it.tipo === "ED_TEXTO"))
                  itensLauda.push({ tipo: "ED_TEXTO", nome: "ED_TEXTO", valor: data.editor_texto, ordem: laudaOrdem++ });
                if (data.editor_imagem && !itensLauda.some((it) => it.tipo === "ED_IMAGEM"))
                  itensLauda.push({ tipo: "ED_IMAGEM", nome: "ED_IMAGEM", valor: data.editor_imagem, ordem: laudaOrdem++ });
                if (data.credito_reporter && !itensLauda.some((it) => it.tipo === "REPÓRTER"))
                  itensLauda.push({ tipo: "REPÓRTER", nome: "REPÓRTER", valor: data.credito_reporter, ordem: laudaOrdem++ });
                console.log("[Playout] RODA_VT: timeline_json ausente, usando campos da matéria →", creditsList.length, "créditos");
              }

              setGcCreditsQueue(creditsList);
              if (creditsList.length > 0) { setGcLine1(creditsList[0].line1); setGcLine2(creditsList[0].line2); }

              setMateriaAtual({
                materia_id: data.id, titulo: data.titulo,
                editor_texto: data.editor_texto, editor_imagem: data.editor_imagem,
                credito_reporter: data.credito_reporter,
                sonoras, passagens, producao, itensLauda,
                _estrutura: data.estrutura,
              } as any);
              console.log("[Playout] RODA_VT: lauda carregada →", data.titulo);

              // ── Timecodes: usa timeline_json salvo ou calcula via IA ──
              if (timelineJsonParsed && timelineJsonParsed.length > 0) {
                // Usa os timecodes exatos salvos na Redação — sem recalcular
                const map = new Map<string, { inicio: number; duracao: number }>();
                const tl: typeof sonorasTimeline = [];
                timelineJsonParsed.forEach((c) => {
                  const key = `${c.valor}|${c.tipo.replace("ED_TEXTO", "ED. TEXTO").replace("ED_IMAGEM", "ED. IMAGEM")}`;
                  map.set(key, { inicio: c.timecode, duracao: c.duracao ?? 5 });
                  tl.push({ nome: c.valor, funcao: c.tipo.replace("ED_TEXTO", "ED. TEXTO").replace("ED_IMAGEM", "ED. IMAGEM"), timecodeInicio: c.timecode, duracao: c.duracao ?? 5 });
                });
                laudaSnapshotRef.current = itensLauda;
                sonorasSnapshotRef.current = sonoras;
                estruturaSnapshotRef.current = data.estrutura;
                sonorasMapRef.current = map;
                sonorasDisparadosRef.current.clear();
                setSonorasTimeline(tl);
                console.log(`[Playout] RODA_VT: ${tl.length} timecode(s) do timeline_json aplicados diretamente`);
              } else if (data.estrutura && itensLauda.length > 0) {
                // Duração prevista: pega do item do espelho (ex: "1:30") ou fallback de 90s
                const tempoEspelho = itemRows?.[0]?.tempo as string | undefined;
                let duracaoPrevia = 90; // fallback
                if (tempoEspelho) {
                  const partes = tempoEspelho.split(":").map(Number);
                  if (partes.length === 2) duracaoPrevia = (partes[0] * 60) + partes[1];
                  else if (partes.length === 1) duracaoPrevia = partes[0];
                }

                console.log(`[Playout] RODA_VT: calculando timecodes via IA (duração prevista: ${duracaoPrevia}s)`);

                // Salva snapshot para o useEffect de timecodes não sobrescrever com duração errada
                laudaSnapshotRef.current = itensLauda;
                sonorasSnapshotRef.current = sonoras;
                estruturaSnapshotRef.current = data.estrutura;

                // Fallback imediato — não bloqueia o TAKE
                const timelineFallback = construirTimelineFallback(itensLauda, duracaoPrevia, sonoras);
                if (timelineFallback.length > 0) {
                  const map = new Map<string, { inicio: number; duracao: number }>();
                  const tl: typeof sonorasTimeline = [];
                  timelineFallback.forEach((cred) => {
                    map.set(`${cred.line1}|${cred.line2}`, { inicio: cred.inicio, duracao: cred.duracao });
                    tl.push({ nome: cred.line1, funcao: cred.line2, timecodeInicio: cred.inicio, duracao: cred.duracao });
                  });
                  sonorasMapRef.current = map;
                  sonorasDisparadosRef.current.clear();
                  setSonorasTimeline(tl);
                  console.log(`[Playout] RODA_VT: ${tl.length} crédito(s) posicionados (fallback) com ${duracaoPrevia}s`);
                }

                // IA refina em paralelo — aplica quando o VT real ainda não está rodando ou sobrescreve
                calcularTimecodesViaIA(data.estrutura, itensLauda, duracaoPrevia, sonoras)
                  .then((creditosIA) => {
                    if (creditosIA.length === 0) return;
                    const map = new Map<string, { inicio: number; duracao: number }>();
                    const tl: typeof sonorasTimeline = [];
                    creditosIA.forEach((cred) => {
                      map.set(`${cred.line1}|${cred.line2}`, { inicio: cred.inicio, duracao: cred.duracao });
                      tl.push({ nome: cred.line1, funcao: cred.line2, timecodeInicio: cred.inicio, duracao: cred.duracao });
                    });
                    sonorasMapRef.current = map;
                    // Não limpa disparados — pode estar no meio do VT
                    setSonorasTimeline(tl);
                    console.log(`[Playout] RODA_VT: ${tl.length} timecode(s) calculado(s) pela IA (${duracaoPrevia}s)`);
                    toast.success(`⏱ ${creditosIA.length} crédito(s) posicionados pela IA`, { duration: 2500 });
                  })
                  .catch((err) => console.warn("[Playout] RODA_VT: IA de timecodes falhou:", err));
              } // fecha else (sem timeline_json)

              if (data.estrutura) {
                extractCredits(data.estrutura, data.editor_texto || undefined, data.credito_reporter || undefined)
                  .then((autoCredits) => {
                    if (autoCredits.length === 0) return;
                    setGcCreditsQueue((prev) => {
                      const existing = new Set(prev.map((c) => c.line1.toUpperCase()));
                      const novos = autoCredits.filter((c) => !existing.has(c.line1.toUpperCase()));
                      if (novos.length === 0) return prev;
                      const novaFila = [...prev, ...novos];
                      if (prev.length === 0 && novaFila.length > 0) {
                        setGcLine1(novaFila[0].line1);
                        setGcLine2(novaFila[0].line2);
                      }
                      return novaFila;
                    });
                    toast.success(`+${autoCredits.length} créditos sugeridos pela IA`);
                  })
                  .catch((err) => console.error("[Playout] Groq auto-credits erro:", err));
              }
            }
          } catch (err) {
            console.error("[Playout] RODA_VT: erro ao carregar lauda →", err);
          }
        }
  // Refs usadas dentro da função são atualizadas via useEffect acima
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processRodaVtRef = useRef(processRodaVt);
  useEffect(() => { processRodaVtRef.current = processRodaVt; }, [processRodaVt]);

  // ── Escuta RODA_VT via BroadcastChannel (mesma máquina / mesma origem) ──
  useEffect(() => {
    const ch = new BroadcastChannel("desknews_playout_sync");
    ch.onmessage = (event: MessageEvent) => {
      if (event.data?.type !== "RODA_VT") return;
      processRodaVtRef.current(event.data?.payload ?? {});
    };
    return () => { ch.close(); };
  }, []);

  // ── Escuta RODA_VT via polling na tabela tp_playout_events (cross-machine) ──
  // O Teleponto (tp.tsx) grava o evento nessa tabela; aqui fazemos polling
  // porque o realtime do Supabase não está disponível neste projeto.
  useEffect(() => {
    const lastProcessedIdRef = { current: null as string | null };
    let cancelled = false;

    const poll = async () => {
      try {
        const { rows } = await db.query(
          `SELECT id, materia_id, assunto, item_id, created_at
           FROM tp_playout_events
           WHERE event = 'RODA_VT'
           ORDER BY created_at DESC
           LIMIT 1`
        );
        const latest = rows?.[0];
        if (!latest || cancelled) return;

        if (lastProcessedIdRef.current === null) {
          // Primeira leitura — apenas marca como visto, não dispara (evita
          // reprocessar um evento antigo ao abrir/recarregar a página).
          lastProcessedIdRef.current = latest.id;
          return;
        }

        if (latest.id !== lastProcessedIdRef.current) {
          lastProcessedIdRef.current = latest.id;
          processRodaVtRef.current({
            materiaId: latest.materia_id,
            assunto: latest.assunto,
            itemId: latest.item_id,
          });
        }
      } catch (err) {
        console.error("[Playout] Erro no polling de tp_playout_events:", err);
      }
    };

    poll();
    const interval = setInterval(poll, 1500);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // ── Handle select file from sidebar ──
  const handleSelectFile = (file: LocalVideoFile) => {
    setSelectedFile(file);
    if (pvwRef.current) {
      pvwRef.current.src = file.blobUrl;
      pvwRef.current.load();
    }
    // Pré-carrega no player INATIVO para TRANS sem black
    preloadInactivePlayer(file.blobUrl, activePlayer);
  };

  // ── Envia CAM X para o monitor PREVIEW sem reiniciar o vídeo ──
  const sendCamToPreview = (camIndex: number) => {
    const camEl = camVideoRefs.current[camIndex];
    const pvw = pvwRef.current;
    if (!pvw) return;
    // Se for URL (stream/YouTube), não há elemento de vídeo local — apenas registra a cam ativa
    if (!camEl || !camEl.src) {
      setIsCamPreview(true);
      setPreviewCamIdx(camIndex);
      setSelectedFile(null);
      return;
    }
    const src = camEl.src;
    const time = camEl.currentTime;
    if (pvw.src !== src) {
      pvw.src = src;
      pvw.load();
      pvw.addEventListener("loadedmetadata", () => {
        pvw.currentTime = time;
        pvw.play().catch(() => {});
      }, { once: true });
    } else {
      pvw.currentTime = time;
    }
    setIsCamPreview(true);
    setPreviewCamIdx(camIndex);
    setSelectedFile(null);
  };

  // ── Handle select from playlist ──
  const handleSelectFromPlaylist = async (assunto: string) => {
    const url = await getFileUrl(assunto);
    if (url && pvwRef.current && pvwRef.current.src !== url) {
      pvwRef.current.src = url;
      pvwRef.current.load();
    }

    const expectedFileName = getFileName(assunto);
    const file = localFiles.find((f) => f.name === expectedFileName);
    if (file) {
      setSelectedFile(file);
      // Pré-carrega B para que o TRANS não tenha black
      preloadInactivePlayer(file.blobUrl, activePlayer);
    }
  };

  // ── Drag & Drop LAUDA ──
  const [dragOverLauda, setDragOverLauda] = useState(false);
  const [draggedFromLauda, setDraggedFromLauda] = useState<ItemLauda | null>(null);
  const [draggedLaudaIndex, setDraggedLaudaIndex] = useState<number | null>(null);

  // 🔄 Função para reordenar itens da LAUDA
  const handleReorderLauda = (fromIndex: number, toIndex: number) => {
    if (!materiaAtual) return;
    
    const novaLauda = [...materiaAtual.itensLauda];
    const [removed] = novaLauda.splice(fromIndex, 1);
    novaLauda.splice(toIndex, 0, removed);
    
    setMateriaAtual((prev) => prev ? { ...prev, itensLauda: novaLauda } : null);
  };

  const handleDropNaLauda = async (item: PlayoutItem) => {
    setDragOverLauda(false);
    
    console.log("🎬 DEBUG: VT arrastado para LAUDA", { item, materia_id: item.materia_id });
    
    if (!item.materia_id) {
      toast.error("❌ Este item não tem matéria vinculada.");
      console.warn("⚠️ materia_id vazio:", item);
      return;
    }
    try {
      console.log("🔍 Buscando matéria com ID:", item.materia_id);
      
      const { rows: materiaRows } = await db.query(
        `SELECT id, titulo, editor_texto, editor_imagem, credito_reporter, estrutura, timeline_json, duracao_vt
         FROM materias WHERE id = $1`,
        [item.materia_id]
      );
      const data = materiaRows?.[0];

      if (!data) {
        console.error("❌ Matéria não encontrada com ID:", item.materia_id);
        toast.error("❌ Matéria não encontrada no banco.");
        return;
      }

      console.log("✅ Matéria encontrada:", data);
      console.log("📄 Estrutura/Lauda:", data.estrutura);

      const { sonoras, passagens, producao, itensLauda } = parsarSonorasEPassagens(data.estrutura);

      console.log("📋 Itens parseados:", { sonoras, passagens, producao, itensLauda });

      // 🆕 Limpar cache ao carregar nova matéria
      setGcLine1("");
      setGcLine2("");
      setGcCreditsQueue([]);
      setGcVisible(false);

      // 🧹 Limpa a TARJA do VT anterior — evita que fique "vazada" sobre o próximo VT
      setTarjaVisible(false);
      if (pgmChannelRef.current?.readyState === 1) pgmChannelRef.current.send(JSON.stringify({ type: "tarja_hide" }));

      // Limpa removedLaudaOrdens para essa matéria (nova carga intencional)
      setRemovedLaudaOrdens(prev => {
        const novo = { ...prev };
        delete novo[data.id];
        return novo;
      });

      // ── Prioriza timeline_json salvo na Redação ──
      let creditsList: { line1: string; line2: string }[] = [];
      let timelineJsonParsed: Array<{ id: string; tipo: string; valor: string; timecode: number; duracao: number }> | null = null;
      if (data.timeline_json) {
        try { timelineJsonParsed = JSON.parse(data.timeline_json); } catch { timelineJsonParsed = null; }
      }

      if (timelineJsonParsed && timelineJsonParsed.length > 0) {
        timelineJsonRef.current = timelineJsonParsed;
        // Substitui completamente a lauda pelos créditos revisados na Redação
        itensLauda.length = 0;
        timelineJsonParsed.forEach((c, idx) => {
          itensLauda.push({ tipo: c.tipo as any, nome: c.tipo, valor: c.valor, ordem: idx });
        });
        creditsList = timelineJsonParsed.map((c) => ({
          line1: c.valor,
          line2: c.tipo.replace("ED_TEXTO", "ED. TEXTO").replace("ED_IMAGEM", "ED. IMAGEM"),
        }));
        console.log("[Playout] Drag: usando timeline_json da Redação →", creditsList.length, "créditos");
      } else {
        timelineJsonRef.current = null;
        if (data.editor_texto) creditsList.push({ line1: data.editor_texto, line2: "ED. TEXTO" });
        if (data.editor_imagem) creditsList.push({ line1: data.editor_imagem, line2: "ED. IMAGEM" });
        if (data.credito_reporter) creditsList.push({ line1: data.credito_reporter, line2: "REPÓRTER" });
        let laudaOrdem = itensLauda.length;
        creditsList.forEach(cred => {
          itensLauda.push({ tipo: cred.line2.replace("ED. ", "ED_") as any, nome: cred.line2, valor: cred.line1, ordem: laudaOrdem++ });
        });
        console.log("[Playout] Drag: timeline_json ausente, usando campos da matéria →", creditsList.length, "créditos");
      }

      console.log("📋 Créditos carregados:", creditsList);

      // Popula a fila e pré-carrega o primeiro no input
      setGcCreditsQueue(creditsList);
      if (creditsList.length > 0) {
        setGcLine1(creditsList[0].line1);
        setGcLine2(creditsList[0].line2);
      }

      setMateriaAtual({
        materia_id: data.id,
        titulo: data.titulo,
        editor_texto: data.editor_texto,
        editor_imagem: data.editor_imagem,
        credito_reporter: data.credito_reporter,
        sonoras,
        passagens,
        producao,
        itensLauda,
        _estrutura: data.estrutura,
      } as any);
      
      console.log("✅ LAUDA carregada com", itensLauda.length, "itens");

      if (data.estrutura) {
        extractCredits(data.estrutura, data.editor_texto || undefined, data.credito_reporter || undefined)
          .then((autoCredits) => {
            if (autoCredits.length === 0) return;
            setGcCreditsQueue((prev) => {
              const existing = new Set(prev.map((c) => c.line1.toUpperCase()));
              const novos = autoCredits.filter((c) => !existing.has(c.line1.toUpperCase()));
              if (novos.length === 0) return prev;
              const novaFila = [...prev, ...novos];
              if (prev.length === 0 && novaFila.length > 0) {
                setGcLine1(novaFila[0].line1);
                setGcLine2(novaFila[0].line2);
              }
              return novaFila;
            });
            toast.success(`+${autoCredits.length} créditos sugeridos pela IA`);
          })
          .catch((err) => console.error("[Playout] Groq auto-credits erro:", err));
      }
      toast.success(`✅ Lauda carregada: ${data.titulo} (${itensLauda.length} itens)`);
    } catch (err) {
      console.error("❌ Erro ao carregar créditos:", err);
      toast.error(`❌ Erro: ${err instanceof Error ? err.message : "Desconhecido"}`);
    }
  };

  // ── Transport controls ──
  const handlePlayPausePgm = async () => {
    if (!pgmFile) return;
    const pgmVideoEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!pgmVideoEl) return;

    try {
      if (isPlaying) {
        pgmVideoEl.pause();
        setIsPlaying(false);
        pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({ type: "pgm_pause", currentTime: pgmVideoEl.currentTime }));
      } else {
        await pgmVideoEl.play();
        setIsPlaying(true);
        pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({ type: "pgm_play", currentTime: pgmVideoEl.currentTime }));
      }
    } catch (err) {
      toast.error("Erro ao reproduzir vídeo");
    }
  };

  const handleStop = () => {
    const pgmVideoEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!pgmVideoEl) return;
    pgmVideoEl.pause();
    pgmVideoEl.currentTime = 0;
    setIsPlaying(false);
    setPgmProgress(0);
    setPgmCurrentTime(0);
    pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({ type: "pgm_stop" }));
  };

  const handleCue = () => {
    const pgmVideoEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!pgmVideoEl) return;
    pgmVideoEl.currentTime = 0;
    setPgmProgress(0);
    setPgmCurrentTime(0);
  };

  const handleTake = () => {
    // 🧹 Limpa a TARJA do VT/CAM anterior — qualquer TAKE novo deve começar sem tarja "vazada"
    setTarjaVisible(false);
    if (pgmChannelRef.current?.readyState === 1) pgmChannelRef.current.send(JSON.stringify({ type: "tarja_hide" }));
    // 🧹 Limpa o GC (barra de créditos/legenda) do VT anterior — mesma regra
    setGcVisible(false);
    if (pgmChannelRef.current?.readyState === 1) pgmChannelRef.current.send(JSON.stringify({ type: "gc_hide" }));

    // ── TAKE de CAM do multiview ──
    if (isCamPreview && previewCamIdx !== null) {
      const srcType = camSourceTypes[previewCamIdx];
      const rawUrl = camSources[previewCamIdx];
      const camEl = camVideoRefs.current[previewCamIdx];
      const camNum = previewCamIdx + 1;

      if (srcType === 'url' && rawUrl) {
        // URL stream (YouTube/Instagram/etc) → mostra iframe no PGM
        // mute: false (áudio normal no PGM) + enableApi: true (permite controlar volume mesmo via iframe)
        const { url: embedUrl, isYoutube } = buildCamEmbedUrl(rawUrl, { mute: false, enableApi: true });
        // Encerra qualquer áudio/vídeo de uma CAM anterior antes de trocar
        if (pgmCamUrl) sendPgmCamCommand("stopVideo");
        setPgmCamUrl(embedUrl);
        setPgmCamIsYoutube(isYoutube);
        setPgmCamVolume(100);
        setPgmCamMuted(false);
        setIsPlaying(true);
        const camFile: LocalVideoFile = { name: `CAM ${camNum}`, sizeMB: 0, lastModified: "", codec: "H.264", blobUrl: "", duration: null };
        setPgmFile(camFile);
        toast.success(`CAM ${camNum} → PROGRAM`);
      } else if (srcType === 'file' && camEl && camEl.src) {
        // Arquivo local → copia para player A com currentTime preservado
        const src = camEl.src;
        const time = camEl.currentTime;
        const aEl = pgmARef.current;
        const bEl = pgmBRef.current;
        if (aEl) {
          // Se havia uma CAM via iframe no ar, encerra vídeo e áudio dela
          if (pgmCamUrl) sendPgmCamCommand("stopVideo");
          if (bEl) { bEl.pause(); bEl.src = ""; }
          setPgmCamUrl(null);
          setPgmCamIsYoutube(false);
          setPgmCamMuted(false);
          setPgmCamVolume(100);
          aEl.src = src;
          aEl.load();
          aEl.addEventListener("loadedmetadata", () => {
            aEl.currentTime = time;
            aEl.muted = false;
            aEl.volume = 1;
            aEl.play().catch(() => {});
          }, { once: true });
          setPlayerAOpacity(1); setPlayerAZ(10);
          setPlayerBOpacity(0); setPlayerBZ(0);
          setActivePlayer("A");
          setIsPlaying(true);
          const camFile: LocalVideoFile = { name: `CAM ${camNum}`, sizeMB: 0, lastModified: "", codec: "H.264", blobUrl: src, duration: camEl.duration || null };
          setPgmFile(camFile);
          toast.success(`CAM ${camNum} → PROGRAM`);
        }
      }
      if (pgmChannelRef.current?.readyState === 1)
        pgmChannelRef.current.send(JSON.stringify({ type: "cam_pgm", cam: camNum }));
      return;
    }

    // ── TAKE normal de arquivo ──
    if (!selectedFile) {
      toast.error("Selecione um arquivo no preview");
      return;
    }

    // Snapshot imutável ANTES de qualquer setState
    const aEl = pgmARef.current;
    const bEl = pgmBRef.current;
    const fileToPlay = selectedFile;

    if (!aEl) return;

    // Para player B imediatamente (DOM puro, sem setState)
    if (bEl) { bEl.pause(); bEl.src = ""; }

    // Para player A e limpa qualquer listener pendente
    aEl.pause();
    aEl.oncanplay = null;
    // Remove todos os listeners canplay anteriores trocando o nó (cloneNode não funciona com ref, então usamos flag)
    const canplayAC = new AbortController();

    const startPlay = () => {
      aEl.play()
        .then(() => {
          // TODOS os setState só aqui — após o play() confirmar
          setPgmFile(fileToPlay);
          setIsPlaying(true);
          setPgmCamUrl(null);
          setPgmCamIsYoutube(false);
          setPgmCamMuted(false);
          setPgmCamVolume(100);
          setPlayerAOpacity(1); setPlayerAZ(10);
          setPlayerBOpacity(0); setPlayerBZ(0);
          setActivePlayer("A");
          setPgmProgress(0);
          setPgmCurrentTime(0);
          if (progressBarRef.current) progressBarRef.current.style.width = "0%";
          if (progressTimeRef.current) progressTimeRef.current.textContent = "0:00";
        })
        .catch((err) => {
          console.error("Erro ao dar play no PGM:", err);
          toast.error("Erro ao reproduzir vídeo");
        });
    };

    // Encerra CAM (iframe) antes via DOM — sem setState ainda
    if (pgmCamUrl) sendPgmCamCommand("stopVideo");

    const isSameSrc = aEl.src === fileToPlay.blobUrl;
    if (isSameSrc && aEl.readyState >= 3) {
      aEl.currentTime = 0;
      startPlay();
    } else {
      aEl.addEventListener("canplay", () => {
        canplayAC.abort(); // garante que não dispara duas vezes
        startPlay();
      }, { once: true, signal: canplayAC.signal });
      aEl.src = fileToPlay.blobUrl;
      aEl.load();
    }

    if (pgmChannelRef.current?.readyState === 1)
      pgmChannelRef.current.send(JSON.stringify({ type: "pgm_take", fileName: fileToPlay.name }));
    toast.success(`"${fileToPlay.name}" enviado para o ar!`);
  };

  // Fusão suave: crossfade entre player ativo (sai) e inativo (entra)
  const applyTransOpacity = useCallback((value: number, currentActivePlayer: "A" | "B" = "A") => {
    const incomingOpacity = value / 100;
    const outgoingOpacity = 1 - incomingOpacity;
    if (currentActivePlayer === "A") {
      // A sai, B entra
      setPlayerAOpacity(outgoingOpacity);
      setPlayerBOpacity(incomingOpacity);
    } else {
      // B sai, A entra
      setPlayerBOpacity(outgoingOpacity);
      setPlayerAOpacity(incomingOpacity);
    }
  }, []);

  const handleTransition = () => {
    if (!selectedFile) {
      toast.error("Selecione um arquivo no preview");
      return;
    }
    // Usa o player INATIVO (oposto ao que está no ar) para a fusão
    const inactiveEl = activePlayer === "A" ? pgmBRef.current : pgmARef.current;
    if (inactiveEl) {
      if (!inactiveEl.src || inactiveEl.src === window.location.href) {
        inactiveEl.src = selectedFile.blobUrl;
        inactiveEl.load();
      }
      inactiveEl.currentTime = 0;
      // Garante que o inativo começa invisível
      if (activePlayer === "A") { setPlayerBOpacity(0); setPlayerBZ(0); }
      else { setPlayerAOpacity(0); setPlayerAZ(0); }
      inactiveEl.play().catch(() => {});
    }
  };

  // Chamado quando o slider TRANS chega em 100 — confirma a transição
  const handleTransComplete = () => {
    if (!selectedFile) return;
    setPgmFile(selectedFile);

    const activeEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    const inactiveEl = activePlayer === "A" ? pgmBRef.current : pgmARef.current;
    const nextPlayer = activePlayer === "A" ? "B" : "A";

    // Para o player que estava no ar
    if (activeEl) {
      activeEl.pause();
      activeEl.src = "";
    }

    // Inativo vira o ativo — via estado React (não inline style)
    if (nextPlayer === "B") {
      setPlayerAOpacity(0); setPlayerAZ(0);
      setPlayerBOpacity(1); setPlayerBZ(10);
    } else {
      setPlayerBOpacity(0); setPlayerBZ(0);
      setPlayerAOpacity(1); setPlayerAZ(10);
    }

    setActivePlayer(nextPlayer);
    setIsPlaying(true);
    setTransValue(0);

    // Notifica TV sobre a fusão concluída
    if (pgmChannelRef.current?.readyState === 1)
      pgmChannelRef.current.send(JSON.stringify({ type: "pgm_take", fileName: selectedFile.name }));

    toast.success(`Fusão concluída: "${selectedFile.name}"`);
  };

  // ── AUTO TRANS — executa dissolve automático em N frames simulados ──
  const handleAutoTrans = useCallback(() => {
    if (autoTransRunning) return;
    if (transitionType === "cut") { handleTransition(); handleTransComplete(); return; }
    handleTransition();
    setAutoTransRunning(true);
    const totalSteps = Math.max(10, autoTransDur);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const pct = Math.round((step / totalSteps) * 100);
      setTransValue(pct);
      applyTransOpacity(pct, activePlayer);
      if (step >= totalSteps) {
        clearInterval(interval);
        autoTransRef.current = null;
        setAutoTransRunning(false);
        handleTransComplete();
      }
    }, 16);
    autoTransRef.current = interval;
  }, [autoTransRunning, transitionType, autoTransDur, activePlayer]);

  // ── DSK FILE LOAD ──
  const handleDskLoad = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setDskPng(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSkip = () => {
    if (currentIndex < items.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      // FIX 4: mantém rastreamento por ID
      setCurrentItemId(items[nextIndex]?.id ?? null);
      // 🧹 Limpa a TARJA do item anterior
      setTarjaVisible(false);
      if (pgmChannelRef.current?.readyState === 1) pgmChannelRef.current.send(JSON.stringify({ type: "tarja_hide" }));
      // 🧹 Limpa o GC do item anterior
      setGcVisible(false);
      if (pgmChannelRef.current?.readyState === 1) pgmChannelRef.current.send(JSON.stringify({ type: "gc_hide" }));
    } else {
      toast.warning("Fim da playlist");
    }
  };

  const handleSeek = (e: MouseEvent & { currentTarget: HTMLDivElement }) => {
    const pgmVideoEl = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
    if (!pgmVideoEl || !pgmFile?.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * pgmFile.duration;

    pgmVideoEl.currentTime = time;
    setPgmCurrentTime(time);
    setPgmProgress((percent * 100) % 100);
  };

  // ── Stats ──
  const h264Count = localFiles.filter((f) => f.codec === "H.264").length;
  const otherCount = localFiles.filter((f) => f.codec !== "H.264").length;
  const totalSizeMB = localFiles.reduce((sum, f) => sum + f.sizeMB, 0);

  
  // Remove da lauda o item cujo line1 (nome) bate com o crédito que foi ao ar
  const removerItemDaLaudaPorNome = useCallback((nome: string) => {
    setMateriaAtual((prev) => {
      if (!prev) return null;
      const nomeLower = nome.trim().toUpperCase();
      const novaLauda = prev.itensLauda.filter((it) => {
        const sepIdx = it.valor?.indexOf(" - ") ?? -1;
        const itemNome = sepIdx >= 0
          ? it.valor!.slice(0, sepIdx).trim().toUpperCase()
          : (it.valor || "").trim().toUpperCase();
        // Mantém na lauda se o nome NÃO bater
        return itemNome !== nomeLower;
      });
      if (novaLauda.length === prev.itensLauda.length) return prev; // nada mudou
      return { ...prev, itensLauda: novaLauda };
    });
  }, []);

  // Ref estável — permite que handleGcTake (deps:[]) acesse sempre a versão atual
  const removerItemDaLaudaPorNomeRef = useRef(removerItemDaLaudaPorNome);
  useEffect(() => { removerItemDaLaudaPorNomeRef.current = removerItemDaLaudaPorNome; }, [removerItemDaLaudaPorNome]);

  const handleGcTake = useCallback(
  (nome: string, funcao: string, autoDuration?: number) => {
    setGcLine1(nome.toUpperCase());
    setGcLine2(funcao.toUpperCase());
    setGcVisible(true);

    // Remove da coluna LAUDA via ref estável (não recria handleGcTake ao mudar materiaAtual)
    removerItemDaLaudaPorNomeRef.current(nome);
    
    if (autoDuration && autoDuration > 0) {
      setGcDuration(autoDuration);
      console.log(`✅ GC: "${nome}" por ${autoDuration}s`);
      setTimeout(() => {
        setGcVisible(false);
      }, autoDuration * 1000);
    } else {
      setGcDuration(0);
    }
    
    setGcHistory((prev) => [...prev, { line1: nome, line2: funcao }]);
  },
  [] // deps vazio — usa refs para tudo que muda
);
  // ── Funções do GC ──
  const handleGcTakeQueue = () => {
    // Exibe na tela o que está atualmente nos inputs (gcLine1/gcLine2)
    setGcVisible(true);
    pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({
      type: "gc_show",
      line1: gcLine1,
      line2: gcLine2,
      ...(gcLayerConfig || {}),
    }));

    // Remove da coluna LAUDA o crédito que acabou de ir ao ar
    if (gcLine1) removerItemDaLaudaPorNome(gcLine1);

    if (gcLine1 || gcLine2) {
      setGcHistory((prev) => [{ line1: gcLine1, line2: gcLine2 }, ...prev].slice(0, 2));
    }

    // O crédito exibido agora é o índice 0 da fila.
    // Remove ele e pré-carrega o próximo nos inputs.
    if (gcCreditsQueue.length > 0) {
      const novaFila = gcCreditsQueue.slice(1); // descarta o que acabou de ir ao ar
      setGcCreditsQueue(novaFila);

      if (novaFila.length > 0) {
        // Pré-carrega o próximo nos inputs (vai ao ar no próximo TAKE)
        setGcLine1(novaFila[0].line1);
        setGcLine2(novaFila[0].line2);
      } else {
        // Era o último — limpa inputs; o GC ainda está visível na tela
        setGcLine1("");
        setGcLine2("");
        toast.success("✓ Todos os créditos foram exibidos!");
      }
    }
  };

  const handleGcClear = () => {
    setGcVisible(false);
    setGcLine1("");
    setGcLine2("");
    setGcCreditsQueue([]);
    pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({ type: "gc_hide" }));
  };

  // Pula o crédito do topo da fila sem exibi-lo na tela
  const handleGcSkip = () => {
    if (gcCreditsQueue.length === 0) return;
    const novaFila = gcCreditsQueue.slice(1);
    setGcCreditsQueue(novaFila);
    if (novaFila.length > 0) {
      setGcLine1(novaFila[0].line1);
      setGcLine2(novaFila[0].line2);
      toast("⏭ Crédito pulado");
    } else {
      setGcLine1("");
      setGcLine2("");
      toast("⏭ Fila de créditos esvaziada");
    }
  };

  const handleGcAutoFill = () => {
    // Auto-preencher com dados do item atual
    const currentItem = items[currentIndex];
    if (currentItem) {
      setGcLine1(currentItem.cabeca || currentItem.assunto || "");
      setGcLine2(currentItem.formato || "");
    }
  };

  const handleApplyPreset = (presetName: string) => {
    const preset = gcPresets[presetName];
    if (preset) {
      setGcLine1(preset.line1);
      setGcLine2(preset.line2);
    }
  };

  return (
    <div className="fixed inset-0 text-white flex flex-col overflow-hidden font-sans" style={{ backgroundColor: '#121212', color: 'white' }}>

      {/* ── Modal de boas-vindas — Vincular Pasta ── */}
      {showWelcomeModal && !isDirReady && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
          <div className="border rounded-2xl p-8 flex flex-col items-center gap-6 w-[420px]" style={{ backgroundColor: '#1a1a1a', borderColor: '#00E676' }}>
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#00E67620' }}>
              <MonitorPlay className="h-8 w-8" style={{ color: '#00E676' }} />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold tracking-tight text-white">DeskNews Exibição</h2>
              <p className="text-sm text-zinc-400 mt-2">Selecione a pasta onde estão os VTs para iniciar o playout.</p>
            </div>
            <button
              onClick={handleSelectDir}
              disabled={isScanningFiles}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-300 active:scale-[0.98] w-full justify-center text-black"
              style={{ backgroundColor: '#00E676' }}
            >
              <FolderOpen className="h-5 w-5" />
              Vincular Pasta de VTs
            </button>
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="text-xs text-zinc-500 hover:text-zinc-300 uppercase tracking-widest transition-colors"
            >
              Pular por agora
            </button>
          </div>
        </div>
      )}
      {/* ── Header ── */}
      <header className="h-14 border-b flex items-center justify-between px-4 shrink-0 relative z-30" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        {/* Logo + pasta */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#00E67615' }}>
            <MonitorPlay className="h-4 w-4" style={{ color: '#00E676' }} />
          </div>
          <h1 className="text-sm font-black tracking-[0.2em] uppercase" style={{ color: '#00E676' }}>
            DESKNEWS
          </h1>
          {isDirReady && dirHandle && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border ml-1" style={{ backgroundColor: '#00E67610', borderColor: '#00E67630' }}>
              <FolderOpen className="h-2.5 w-2.5" style={{ color: '#00E676' }} />
              <span className="text-[10px] font-mono uppercase font-semibold" style={{ color: '#00E676' }}>{dirHandle.name}</span>
            </div>
          )}
        </div>

        {/* Contadores Regressivos Centralizados */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-10 pointer-events-none">
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-0.5">Bloco</span>
            <div className="text-[28px] font-mono font-bold tabular-nums leading-none text-zinc-500">
              {formatDuration(blockRemainingTime)}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-0.5">VT</span>
            <div className={cn(
              "text-[28px] font-mono font-bold tabular-nums leading-none tracking-tighter transition-colors duration-300",
              pgmRemainingTime <= 5 ? "text-red-500 animate-pulse" : pgmRemainingTime <= 10 ? "text-red-500" : ""
            )} style={{ color: pgmRemainingTime > 10 ? '#00E676' : undefined }}>
              {formatDuration(pgmRemainingTime)}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-0.5">Jornal</span>
            <div className="text-[28px] font-mono font-bold tabular-nums leading-none text-zinc-500">
              {formatDuration(generalJournalTime)}
            </div>
          </div>
        </div>

        {/* Controles + Relógio */}
        <div className="flex items-center gap-2">
          <button onClick={handleSelectDir} disabled={isScanningFiles}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all active:scale-[0.98]",
              isDirReady
                ? "border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500"
                : "animate-pulse text-black font-bold"
            )}
            style={!isDirReady ? { backgroundColor: '#00E676', borderColor: '#00E676' } : { backgroundColor: 'transparent' }}
          >
            <FolderOpen className="h-3 w-3" />
            {isDirReady ? "TROCAR" : "VINCULAR"}
          </button>

          <button onClick={() => verifyFiles(items)} disabled={isVerifying}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-all active:scale-[0.98]">
            <RefreshCw className={cn("h-3 w-3", isVerifying && "animate-spin")} />
            IMP.
          </button>

          {isDirReady && dirHandle && (
            <button onClick={() => scanLocalFiles(dirHandle)} disabled={isScanningFiles}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all active:scale-[0.98]"
              style={{ borderColor: '#00E67640', color: '#00E676', backgroundColor: '#00E67610' }}>
              <Film className={cn("h-3 w-3", isScanningFiles && "animate-spin")} />
              {isScanningFiles ? "SCAN..." : "SCAN"}
            </button>
          )}

          <div className="pl-3 border-l border-zinc-800 ml-1">
            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest block">ON AIR</span>
            <span className="text-base font-mono font-bold tabular-nums leading-none" style={{ color: '#00E676' }}>{clock}</span>
          </div>
        </div>
      </header>

      {/* ── Layout principal: 3 colunas ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ════════════════════════════════════════
            COL ESQUERDA — Sidebar de Navegação
        ════════════════════════════════════════ */}
        <div className="w-[260px] shrink-0 border-r flex flex-col overflow-hidden" style={{ backgroundColor: '#181818', borderColor: '#2a2a2a' }}>
          {/* Cabeçalho da lista */}
          <div className="px-3 py-2.5 border-b flex items-center justify-between" style={{ backgroundColor: '#1f1f1f', borderColor: '#2a2a2a' }}>
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">VTs do Jornal</h2>
              <p className="text-[9px] text-zinc-600 mt-0.5">
                {items.length} matérias · {localFiles.length} arquivos
              </p>
            </div>
            {localFiles.length > 0 && (
              <div className="flex flex-col items-end gap-0.5 text-[9px] font-mono">
                <span className="flex items-center gap-1" style={{ color: '#00E676' }}>
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  {h264Count} H.264
                </span>
                <span className="text-zinc-600 flex items-center gap-1">
                  <HardDrive className="h-2.5 w-2.5" />
                  {(totalSizeMB / 1024).toFixed(1)}GB
                </span>
              </div>
            )}
          </div>



          {/* ── Seção 1: Arquivos locais ── */}
          {localFiles.length > 0 && (
            <div className="border-b" style={{ borderColor: '#2a2a2a' }}>
              <div className="px-3 py-1.5" style={{ backgroundColor: '#1f1f1f' }}>
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                  PASTA LOCAL
                </span>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: "36vh" }}>
                {localFiles.map((f) => {
                  const isSelected = selectedFile?.name === f.name;
                  const isOnAir = pgmFile?.name === f.name;
                  const isH264 = f.codec === "H.264";

                  return (
                    <button
                      key={f.name}
                      onClick={() => handleSelectFile(f)}
                      className={cn(
                        "w-full text-left px-3 py-2 border-b border-white/[0.03] transition-all flex items-center gap-2",
                        isOnAir ? "border-l-2" :
                        isSelected ? "border-l-2" :
                        "border-l-2 border-l-transparent"
                      )}
                      style={{
                        backgroundColor: isOnAir ? '#ff000015' : isSelected ? '#00E67610' : 'transparent',
                        borderLeftColor: isOnAir ? '#ef4444' : isSelected ? '#00E676' : 'transparent',
                      }}
                    >
                      <div className="shrink-0">
                        {isOnAir ? (
                          <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        ) : isSelected ? (
                          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#00E676' }} />
                        ) : (
                          <Film className={cn("h-3 w-3", isH264 ? "text-zinc-600" : "text-yellow-500")} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-mono truncate leading-tight"
                          style={{ color: isOnAir ? '#ef4444' : isSelected ? '#00E676' : '#e4e4e7' }}>
                          {f.name.replace(".mp4", "")}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={cn("text-[8px] px-1 py-0 rounded border font-bold uppercase", codecBadgeClass(f.codec))}>
                            {f.codec === "Verificando..." ? "..." : f.codec}
                          </span>
                          <span className="text-[9px] text-zinc-600 font-mono">
                            {formatDuration(f.duration)} · {f.sizeMB}MB
                          </span>
                        </div>
                      </div>
                      {isOnAir && (
                        <span className="shrink-0 text-[8px] text-red-500 font-bold uppercase animate-pulse">AR</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Seção 2: Espelho do dia ── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-3 py-1.5 border-b" style={{ backgroundColor: '#1f1f1f', borderColor: '#2a2a2a' }}>
              <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                ESPELHO — FILA DO DIA
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-zinc-400">
                <tbody className="text-xs font-mono divide-y divide-white/5">
                  {items.map((item, idx) => {
                    const isOnAir = idx === currentIndex - 1;
                    const isNext = idx === currentIndex;
                    const isDone = idx < currentIndex - 1;
                    const exists = fileStatus[item.id];
                    const expectedFileName = getFileName(item.assunto);
                    const localMatch = localFiles.find((f) => f.name === expectedFileName);

                    const handleDeleteItem = (e: MouseEvent) => {
                      e.stopPropagation();
                      setItems((prev) => prev.filter((_, i) => i !== idx));
                      if (currentIndex > idx) {
                        setCurrentIndex((prev) => Math.max(0, prev - 1));
                      }
                      toast.info(`"${item.assunto}" removido da fila`);
                    };

                    return (
                      <tr
                        key={item.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("materia_id", item.materia_id || "");
                          e.dataTransfer.setData("item_index", String(idx));
                          e.dataTransfer.setData("drag_source", "espelho");
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const source = e.dataTransfer.getData("drag_source");
                          if (source === "espelho") {
                            const fromIdx = Number(e.dataTransfer.getData("item_index"));
                            if (fromIdx !== idx) {
                              setItems((prevItems) => {
                                const novaOrdem = [...prevItems];
                                const [draggedItem] = novaOrdem.splice(fromIdx, 1);
                                novaOrdem.splice(idx, 0, draggedItem);
                                return novaOrdem;
                              });
                            }
                          }
                        }}
                        onClick={() => handleSelectFromPlaylist(item.assunto)}
                        className={cn(
                          "transition-colors duration-200 cursor-grab active:cursor-grabbing group",
                          isDone && "opacity-30"
                        )}
                        style={{ backgroundColor: isOnAir ? '#ff000010' : undefined }}
                      >
                        <td className="px-2 py-2 w-12 text-center font-bold">
                          {isOnAir ? (
                            <span className="text-red-500 animate-pulse text-[9px]">● AR</span>
                          ) : isNext ? (
                            <span className="text-[9px] font-bold" style={{ color: '#00E676' }}>NEXT</span>
                          ) : (
                            <span className="text-zinc-600 text-[9px]">{globalItemIndex[item.id] || idx + 1}</span>
                          )}
                        </td>
                        <td className="px-1 py-2 w-6 text-center">
                          {exists ? (
                            <FileCheck className="h-3 w-3 mx-auto" style={{ color: '#00E676' }} />
                          ) : (
                            <FileX className="h-3 w-3 text-red-500 mx-auto" />
                          )}
                        </td>
                        <td className={cn("px-2 py-2 font-bold text-[10px]", isOnAir ? "text-white" : "text-zinc-400")}>
                          {item.assunto}
                        </td>
                        <td className="px-2 py-2 text-right text-zinc-600 text-[9px]">{item.tempo || "0:00"}</td>
                        <td className="px-2 py-2 text-right text-[9px]">
                          <button
                            onClick={handleDeleteItem}
                            className="text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 font-bold"
                            title="Remover da fila"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {items.length === 0 && (
                <div className="px-3 py-8 text-center text-zinc-600 text-xs italic">
                  Nenhuma matéria publicada para hoje.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            COL CENTRO — Monitoramento + Controles
        ════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col overflow-y-auto p-3 gap-3" style={{ backgroundColor: '#121212' }}>

          {/* ── Linha de monitores PVW + PGM + YTB ── */}
          <div className="grid grid-cols-3 gap-3">
            {/* PREVIEW */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#00E676' }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#00E676' }}>Preview</span>
                </div>
                <span className="text-[9px] font-mono text-zinc-600 truncate max-w-[120px]">
                  {selectedFile ? selectedFile.name.replace(".mp4", "") : "Nenhum arquivo"}
                </span>
              </div>
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden border" style={{ borderColor: isCamPreview ? '#f97316' : '#00E67630' }}>
                {/* Vídeo local (arquivo ou cam de arquivo) */}
                <video
                  ref={pvwRef}
                  className="w-full h-full object-contain"
                  muted playsInline preload="metadata"
                  style={{ display: (isCamPreview && previewCamIdx !== null && camSourceTypes[previewCamIdx] === 'url') ? 'none' : 'block' }}
                />
                {/* Iframe quando a CAM selecionada tem URL (YouTube/Instagram/etc) */}
                {/* Sempre MUDO no PREVIEW — evita áudio duplicado/"delay" em relação ao PGM */}
                {isCamPreview && previewCamIdx !== null && camSourceTypes[previewCamIdx] === 'url' && camSources[previewCamIdx] && (() => {
                  const rawUrl = camSources[previewCamIdx]!;
                  const { url: embedUrl } = buildCamEmbedUrl(rawUrl, { mute: true });
                  return (
                    <iframe
                      key={embedUrl}
                      src={embedUrl}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ border: "none" }}
                    />
                  );
                })()}
                {/* Badge ÁUDIO MUDO no preview (áudio sai apenas pelo PGM) */}
                {isCamPreview && previewCamIdx !== null && camSourceTypes[previewCamIdx] === 'url' && (
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/70 text-zinc-400 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest z-10 pointer-events-none">
                    <VolumeX className="h-2.5 w-2.5" /> mudo
                  </div>
                )}
                {/* Badge CAM ativa */}
                {isCamPreview && previewCamIdx !== null && (
                  <div className="absolute top-1.5 left-1.5 bg-orange-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest z-10 pointer-events-none">
                    CAM {previewCamIdx + 1}
                  </div>
                )}
                {!selectedFile && !isCamPreview && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-700">
                    <Film className="h-7 w-7" />
                    <span className="text-[9px] uppercase tracking-widest">Clique em um VT H.264</span>
                  </div>
                )}
                {selectedFile && (
                  <div className="absolute top-1.5 left-1.5">
                    <span className={cn("text-[8px] font-bold px-1 py-0.5 rounded border uppercase", codecBadgeClass(selectedFile.codec))}>
                      {selectedFile.codec === "Verificando..." ? "..." : selectedFile.codec}
                    </span>
                  </div>
                )}
                {selectedFile?.duration && (
                  <div className="absolute bottom-1.5 right-1.5 text-[9px] font-mono text-zinc-400 bg-black/70 px-1 py-0.5 rounded">
                    {formatDuration(selectedFile.duration)}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 bg-black/50">
                  <button
                    onClick={handleTake}
                    className="text-black font-bold text-sm px-6 py-2 rounded-xl transition-all active:scale-[0.98]"
                    style={{ backgroundColor: '#00E676' }}
                  >
                    TAKE
                  </button>
                </div>
              </div>
            </div>

            {/* PROGRAM */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className={cn("h-1.5 w-1.5 rounded-full bg-red-500", isPlaying && "animate-pulse")} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Program</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Botão CC — Legendas via Groq Whisper */}
                  <button
                    onClick={() => setLegendasAtivas((v) => !v)}
                    title={legendasAtivas ? "Desligar legendas" : "Ligar legendas — teleprompter sincronizado com a lauda"}
                    className="flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest transition-all"
                    style={{
                      backgroundColor: legendasAtivas ? (ccTextoAtual ? '#00E67630' : '#1a3a1a') : '#252525',
                      borderColor: legendasAtivas ? (ccTextoAtual ? '#00E676' : '#00E67440') : '#3a3a3a',
                      color: legendasAtivas ? '#00E676' : '#52525b',
                    }}
                  >
                    {legendasAtivas
                      ? <span className={`h-1.5 w-1.5 rounded-full animate-pulse inline-block mr-0.5 ${ccTextoAtual ? 'bg-emerald-400' : 'bg-emerald-700'}`} />
                      : null}
                    CC
                    {legendasAtivas && <span className="text-[7px] opacity-60 ml-0.5">{ccTextoAtual ? 'AO VIVO' : 'LAUDA'}</span>}
                  </button>
                  <span className="text-[9px] font-mono text-zinc-600 truncate max-w-[120px]">
                    {pgmFile ? pgmFile.name.replace(".mp4", "") : "IDLE"}
                  </span>
                </div>
              </div>
              <div
                className="relative aspect-video bg-black rounded-lg overflow-hidden border-2"
                style={{
                  borderColor: meActiveFrame !== null ? '#00E676' : (isPlaying ? '#ef4444' : '#ef444430'),
                  boxShadow: meActiveFrame !== null ? "0 0 20px rgba(0,230,118,0.5)" : (isPlaying ? "0 0 20px rgba(239,68,68,0.2)" : "none"),
                }}
              >
                <video
                  ref={pgmARef}
                  className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
                  style={{ opacity: playerAOpacity, zIndex: playerAZ }}
                  playsInline preload="auto"
                  onTimeUpdate={(e) => {
                    if (activePlayer !== "A") return;
                    const el = e.currentTarget;
                    const t = el.currentTime;
                    const d = el.duration;
                    // Atualiza state para lógica de negócio (sonoras, EOM) — throttled via rAF
                    setPgmCurrentTime(t);
                    if (d) setPgmProgress((t / d) * 100);
                    // Atualiza DOM diretamente — sem re-render do componente pai
                    if (progressBarRef.current) progressBarRef.current.style.width = d ? `${(t / d) * 100}%` : "0%";
                    if (progressTimeRef.current) progressTimeRef.current.textContent = formatDuration(t);
                  }}
                  onEnded={handleItemFinished}
                />
                <video
                  ref={pgmBRef}
                  className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
                  style={{ opacity: playerBOpacity, zIndex: playerBZ }}
                  playsInline preload="auto"
                  onTimeUpdate={(e) => {
                    if (activePlayer !== "B") return;
                    const el = e.currentTarget;
                    const t = el.currentTime;
                    const d = el.duration;
                    setPgmCurrentTime(t);
                    if (d) setPgmProgress((t / d) * 100);
                    if (progressBarRef.current) progressBarRef.current.style.width = d ? `${(t / d) * 100}%` : "0%";
                    if (progressTimeRef.current) progressTimeRef.current.textContent = formatDuration(t);
                  }}
                  onEnded={() => { if (activePlayer !== "B") return; handleItemFinished(); }}
                />
                {/* Iframe para URL de cam (YouTube/stream) no PGM */}
                {pgmCamUrl && (
                  <iframe
                    ref={pgmCamIframeRef}
                    key={pgmCamUrl}
                    src={pgmCamUrl}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ border: "none", zIndex: 5 }}
                  />
                )}
                {!pgmFile && !pgmCamUrl && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-700">
                    <div className="h-2 w-2 rounded-full bg-red-900" />
                    <span className="text-[9px] uppercase tracking-widest">IDLE</span>
                  </div>
                )}
                {isPlaying && (
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase animate-pulse">
                    <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> NO AR
                  </div>
                )}
                {pgmFile && items[currentIndex - 1]?.cabeca && (
                  <div className="absolute bottom-4 left-4 right-4 z-30">
                    <div className="bg-black/90 border-l-4 border-red-600 px-3 py-1.5">
                     // 
                      <div className="text-[9px] text-zinc-400">{items[currentIndex - 1]?.assunto}</div>
                    </div>
                  </div>
                )}
                {/* LEGENDAS — CC Teleprompter (lauda sincronizada com o VT) */}
                {legendasAtivas && (
                  <div
                    className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none"
                    style={{ zIndex: 45 }}
                  >
                    {ccTextoAtual ? (
                      <div
                        className="w-full text-center px-4 py-2"
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.92)',
                          borderBottom: '3px solid #00E676',
                          borderTop: '1px solid rgba(0,230,118,0.2)',
                        }}
                      >
                        <span
                          className="text-white font-bold leading-snug block"
                          style={{ fontSize: '14px', letterSpacing: '0.02em', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
                        >
                          {ccTextoAtual}
                        </span>
                      </div>
                    ) : (
                      <div
                        className="px-4 py-1.5 flex items-center gap-2"
                        style={{
                          backgroundColor: 'rgba(0,18,6,0.93)',
                          borderBottom: '3px solid #00E676',
                          borderTop: '1px solid rgba(0,230,118,0.2)',
                          width: '100%',
                          justifyContent: 'center',
                        }}
                      >
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse inline-block shrink-0" />
                        <span
                          className="font-bold uppercase"
                          style={{ color: '#00E676', fontSize: '12px', letterSpacing: '0.14em' }}
                        >
                          CC — AGUARDANDO ÁUDIO...
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {/* GC Overlay */}
                {gcVisible && (gcLine1 || gcLine2) && (
                  gcLayerConfig?.tarjaCustomPng ? (
                    <div
                      className="absolute z-40"
                      style={{
                        left: `${gcLayerConfig.tarjaX}%`,
                        top: `${gcLayerConfig.tarjaY}%`,
                        transform: "translate(-50%, -50%)",
                        width: `${gcLayerConfig.tarjaScaleX}%`,
                      }}
                    >
                      <div style={{ position: "relative", lineHeight: 0 }}>
                        <img
                          src={gcLayerConfig.tarjaCustomPng}
                          alt="Tarja"
                          style={{ width: "100%", display: "block", height: "auto" }}
                        />
                        {gcLine1 && (
                          <div
                            style={{
                              position: "absolute",
                              left: `${gcLayerConfig.font1X}%`,
                              top: `${gcLayerConfig.font1Y}%`,
                              fontSize: gcLayerConfig.font1Size,
                              fontWeight: 900,
                              color: "#fff",
                              textTransform: "uppercase",
                              whiteSpace: "nowrap",
                              textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                              transform: "translateY(-50%)",
                              fontFamily: "sans-serif",
                            }}
                          >
                            {gcLine1}
                          </div>
                        )}
                        {gcLine2 && (
                          <div
                            style={{
                              position: "absolute",
                              left: `${gcLayerConfig.font2X}%`,
                              top: `${gcLayerConfig.font2Y}%`,
                              fontSize: gcLayerConfig.font2Size,
                              fontWeight: 500,
                              color: "#d4d4d8",
                              textTransform: "uppercase",
                              whiteSpace: "nowrap",
                              textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                              transform: "translateY(-50%)",
                              fontFamily: "sans-serif",
                            }}
                          >
                            {gcLine2}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="absolute bottom-0 left-0 right-0 z-40 px-2 pb-2 animate-in slide-in-from-bottom duration-300">
                      <div className="flex items-stretch overflow-hidden rounded">
                        <div className="w-1 bg-red-600 shrink-0" />
                        <div className="bg-black/90 px-2 py-1.5 flex-1 min-w-0">
                          {gcLine1 && <div className="text-white font-bold text-[10px] uppercase tracking-wide leading-tight truncate">{gcLine1}</div>}
                          {gcLine2 && <div className="text-zinc-400 text-[8px] uppercase tracking-widest truncate mt-0.5">{gcLine2}</div>}
                        </div>
                      </div>
                    </div>
                  )
                )}
                {/* TARJA Overlay */}
                {tarjaVisible && (
                  <div
                    className="absolute z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ left: `${tarjaX}%`, top: `${tarjaY}%` }}
                  >
                    {tarjaCustomPng ? (
                      <img src={tarjaCustomPng} alt="Tarja"
                        style={{ opacity: tarjaAlpha / 100, width: `${tarjaScaleX * 1.2}px`, height: `${tarjaScaleY * 0.4}px`, objectFit: "contain" }}
                      />
                    ) : (
                      <div className="px-3 py-1 rounded-sm shadow-lg"
                        style={{
                          backgroundColor: `hsla(${tarjaHue},${tarjaSaturation}%,35%,${tarjaAlpha/100})`,
                          borderLeft: `3px solid hsla(${tarjaHue},${tarjaSaturation}%,70%,0.9)`,
                          fontFamily: tarjaFont,
                          fontWeight: tarjaBold ? "bold" : "normal",
                          fontStyle: tarjaItalic ? "italic" : "normal",
                          fontSize: `${Math.round(tarjaScaleY * 0.12)}px`,
                          color: `hsl(${tarjaHue},${tarjaSaturation}%,88%)`,
                          whiteSpace: "nowrap",
                          transform: `scaleX(${tarjaScaleX / 100})`,
                          transformOrigin: "left center",
                        }}
                      >
                        {tarjaText || "TARJA"}
                      </div>
                    )}
                  </div>
                )}
                {/* FRAME / OVERLAY (Módulo ME) */}
                {meActiveFrame !== null && meFrames[meActiveFrame] && (
                  <img
                    src={meFrames[meActiveFrame] as string}
                    alt={`Frame ${meActiveFrame + 1}`}
                    className="absolute inset-0 w-full h-full object-contain z-50 pointer-events-none"
                  />
                )}
              </div>

              {/* ── Controle de áudio da CAM em PGM (mesmo via iframe) ── */}
              {pgmCamUrl && (
                <div className="flex items-center gap-1.5 mt-1 px-1.5 py-1 rounded-lg border border-red-600/30" style={{ backgroundColor: '#1a0a0a' }}>
                  <button
                    onClick={() => setPgmCamMuted((m) => !m)}
                    title={pgmCamMuted ? "Reativar áudio da CAM" : "Mutar áudio da CAM"}
                    className="text-zinc-400 hover:text-white transition-colors shrink-0"
                  >
                    {pgmCamMuted || pgmCamVolume === 0 ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={pgmCamMuted ? 0 : pgmCamVolume}
                    disabled={!pgmCamIsYoutube}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setPgmCamVolume(v);
                      setPgmCamMuted(v === 0);
                    }}
                    className="flex-1 h-1 accent-red-500 disabled:opacity-30"
                    title={pgmCamIsYoutube ? "Volume da CAM (PGM)" : "Volume controlado pela plataforma de origem"}
                  />
                  <span className="text-[8px] font-mono text-zinc-500 w-8 text-right shrink-0">
                    {pgmCamMuted ? "MUDO" : `${pgmCamVolume}%`}
                  </span>
                  <button
                    onClick={handleCamOffAir}
                    title="Tirar CAM do ar (encerra vídeo e áudio)"
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase text-red-400 border border-red-700/50 hover:bg-red-600/20 transition-all active:scale-[0.97] shrink-0"
                  >
                    <PowerOff className="h-2.5 w-2.5" /> off
                  </button>
                </div>
              )}

              {/* VU METER ESTÉREO (L/R) — canvas direto, sem re-renders */}
              <div className="flex flex-col gap-0.5 mt-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="flex flex-col gap-[3px] text-[8px] font-mono font-bold text-zinc-600">
                    <span>L</span>
                    <span>R</span>
                  </div>
                  <canvas
                    ref={vuCanvasRef}
                    width={200}
                    height={16}
                    className="flex-1 rounded-sm"
                    style={{ imageRendering: "pixelated", height: "16px", width: "100%" }}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Youtube className="h-3 w-3 text-red-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">{multiviewActive ? "MULTIVIEW" : "YouTube"}</span>
                </div>
                {youtubeVisible && (
                  <button
                    onClick={() => { setYoutubeVisible(false); setYoutubeUrl(""); setYoutubeInput(""); }}
                    className="text-[8px] font-bold uppercase text-zinc-600 hover:text-red-400 flex items-center gap-1"
                  >
                    <X className="h-2.5 w-2.5" /> Fechar
                  </button>
                )}
              </div>
              {multiviewActive ? (
                <div className="grid grid-cols-2 gap-1 aspect-video bg-black rounded-lg overflow-hidden border border-cyan-600/20">
                  {[1, 2, 3, 4].map((cam) => {
                    const idx = cam - 1;
                    const src = camSources[idx];
                    const srcType = camSourceTypes[idx];
                    const hasSrc = !!src;
                    const isActive = activeCam === cam;
                    const handleCamSelect = () => {
                      setActiveCam(cam);
                      sendCamToPreview(idx);
                      if (pgmChannelRef.current?.readyState === 1) {
                        pgmChannelRef.current.send(JSON.stringify({ type: "cam_take", cam }));
                      }
                      toast.success(`CAM ${cam} → PREVIEW`);
                    };
                    // Embed URL para streams (YouTube, Instagram etc) — sempre mudo nas thumbs do multiview
                    const getEmbedUrl = (rawUrl: string) => buildCamEmbedUrl(rawUrl, { mute: true }).url;
                    return (
                      <div
                        key={cam}
                        className="relative bg-black flex items-center justify-center cursor-pointer transition-all duration-150 group"
                        style={{ border: isActive ? '2px solid #f97316' : '1px solid rgba(8,145,178,0.3)' }}
                        onClick={handleCamSelect}
                        onDoubleClick={handleCamSelect}
                      >
                        {/* Vídeo local */}
                        {hasSrc && srcType === 'file' && (
                          <video
                            ref={(el) => { camVideoRefs.current[idx] = el; }}
                            src={src ?? undefined}
                            className="absolute inset-0 w-full h-full object-cover"
                            muted loop autoPlay playsInline preload="auto"
                          />
                        )}
                        {/* Stream/URL (YouTube, Instagram etc) via iframe */}
                        {hasSrc && srcType === 'url' && (
                          <iframe
                            key={src}
                            src={getEmbedUrl(src!)}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ border: "none", pointerEvents: "none" }}
                          />
                        )}
                        {/* Placeholder quando sem fonte */}
                        {!hasSrc && (
                          <div className="flex flex-col items-center gap-1.5 text-zinc-700 group-hover:text-zinc-500 transition-colors px-2 text-center">
                            <div className="text-[10px] font-bold">CAM {cam}</div>
                            <div className="text-[7px] opacity-60 leading-tight">📂 arquivo ou 🔗 link</div>
                          </div>
                        )}
                        {/* Badge PVW */}
                        {isActive && (
                          <div className="absolute top-1 left-1 bg-orange-500 text-black text-[7px] font-black px-1 py-0.5 rounded uppercase tracking-widest z-10 pointer-events-none">PVW</div>
                        )}
                        {/* Botões de carga: arquivo + link */}
                        <div className="absolute bottom-1 right-1 z-20 flex gap-0.5" onClick={(e) => e.stopPropagation()}>
                          {/* Arquivo local */}
                          <label
                            className="bg-black/80 border border-zinc-600 text-zinc-400 hover:text-white hover:border-zinc-300 rounded px-1 py-0.5 text-[7px] font-bold cursor-pointer transition-all"
                            title="Carregar arquivo de vídeo"
                          >
                            📂
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const url = URL.createObjectURL(file);
                                setCamSources((prev) => { const n = [...prev]; n[idx] = url; return n; });
                                setCamSourceTypes((prev) => { const n = [...prev]; n[idx] = 'file'; return n; });
                                e.target.value = "";
                              }}
                            />
                          </label>
                          {/* Link URL */}
                          <button
                            className="bg-black/80 border border-zinc-600 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500 rounded px-1 py-0.5 text-[7px] font-bold cursor-pointer transition-all"
                            title="Colar link (YouTube, Instagram, Facebook...)"
                            onClick={(e) => {
                              e.stopPropagation();
                              const link = window.prompt(`CAM ${cam} — cole o link (YouTube, Instagram, Facebook, etc):`);
                              if (!link?.trim()) return;
                              setCamSources((prev) => { const n = [...prev]; n[idx] = link.trim(); return n; });
                              setCamSourceTypes((prev) => { const n = [...prev]; n[idx] = 'url'; return n; });
                            }}
                          >
                            🔗
                          </button>
                          {/* Limpar */}
                          {hasSrc && (
                            <button
                              className="bg-black/80 border border-red-800 text-red-500 hover:text-red-300 hover:border-red-400 rounded px-1 py-0.5 text-[7px] font-bold cursor-pointer transition-all"
                              title="Remover fonte"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCamSources((prev) => { const n = [...prev]; n[idx] = null; return n; });
                                setCamSourceTypes((prev) => { const n = [...prev]; n[idx] = null; return n; });
                                if (activeCam === cam) { setActiveCam(null); setIsCamPreview(false); setPreviewCamIdx(null); }
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-red-600/20"
                  style={{ boxShadow: youtubeVisible ? "0 0 20px rgba(239,68,68,0.15)" : "none" }}>
                  {youtubeVisible && youtubeUrl ? (
                    <>
                      <iframe key={youtubeUrl} src={youtubeUrl}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen title="YouTube Monitor" style={{ border: "none" }}
                      />
                      <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-red-700/90 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase pointer-events-none z-10 animate-pulse">
                        <Youtube className="h-2.5 w-2.5 text-white" /> AO VIVO
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-700">
                      <Youtube className="h-7 w-7" />
                      <span className="text-[9px] uppercase tracking-widest text-center px-3">Cole o link e clique em Abrir</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center gap-1.5 mt-0.5">
                <input
                  type="text"
                  value={youtubeInput}
                  onChange={(e) => setYoutubeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (multiviewActive && activeCam !== null) {
                        // Link vai para a CAM selecionada no multiview
                        const idx = activeCam - 1;
                        setCamSources((prev) => { const n = [...prev]; n[idx] = youtubeInput.trim(); return n; });
                        setCamSourceTypes((prev) => { const n = [...prev]; n[idx] = 'url'; return n; });
                        toast.success(`Link → CAM ${activeCam}`);
                        setYoutubeInput("");
                      } else {
                        const id = extractYoutubeId(youtubeInput);
                        if (id) { setYoutubeUrl(`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`); setYoutubeVisible(true); }
                        else toast.error("Link do YouTube inválido.");
                      }
                    }
                  }}
                  placeholder={multiviewActive && activeCam !== null ? `Link para CAM ${activeCam}...` : "youtube.com/watch?v=..."}
                  className="flex-1 px-2 py-1.5 rounded-lg border text-[10px] text-zinc-300 placeholder-zinc-700 focus:outline-none transition-all"
                  style={{ backgroundColor: '#1a1a1a', borderColor: multiviewActive && activeCam !== null ? '#f97316' : '#2a2a2a' }}
                />
                <button
                  onClick={() => {
                    if (multiviewActive && activeCam !== null) {
                      // Link vai para a CAM selecionada
                      const idx = activeCam - 1;
                      const link = youtubeInput.trim();
                      if (!link) return;
                      setCamSources((prev) => { const n = [...prev]; n[idx] = link; return n; });
                      setCamSourceTypes((prev) => { const n = [...prev]; n[idx] = 'url'; return n; });
                      toast.success(`Link → CAM ${activeCam}`);
                      setYoutubeInput("");
                    } else {
                      const id = extractYoutubeId(youtubeInput);
                      if (id) { setYoutubeUrl(`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`); setYoutubeVisible(true); }
                      else toast.error("Link do YouTube inválido.");
                    }
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase text-white border border-red-600/50 transition-all active:scale-[0.98] shrink-0"
                  style={{ backgroundColor: multiviewActive && activeCam !== null ? '#f97316' : '#ef4444', borderColor: multiviewActive && activeCam !== null ? '#fb923c' : undefined }}
                >
                  <Play className="h-2.5 w-2.5" />{multiviewActive && activeCam !== null ? `CAM ${activeCam}` : 'Abrir'}
                </button>
                <button
                  onClick={() => { setMultiviewActive(!multiviewActive); if (multiviewActive) { setActiveCam(null); setIsCamPreview(false); setPreviewCamIdx(null); } }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase text-white border border-cyan-600/50 transition-all active:scale-[0.98] shrink-0"
                  style={{ backgroundColor: '#0891b2' }}
                  title="4 Câmeras"
                >
                  <Grid2X2 className="h-2.5 w-2.5" />Multi
                </button>
              </div>

            </div>
          </div>

          {/* ── LAUDA | Transport+GC | Teleprompter | Switcher (expandido) ── */}
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-0 flex-1 min-h-0">

            {/* ─ Col 1: LAUDA ─ */}
            <div
              className={cn(
                "border rounded-xl p-3 flex flex-col overflow-hidden transition-all duration-200",
                dragOverLauda ? "border-pink-500" : ""
              )}
              style={{ backgroundColor: '#1a1a1a', borderColor: dragOverLauda ? '#ec4899' : '#2a2a2a', boxShadow: dragOverLauda ? "0 0 16px rgba(236,72,153,0.2)" : "none" }}
              onDragOver={(e) => { e.preventDefault(); setDragOverLauda(true); }}
              onDragLeave={() => setDragOverLauda(false)}
              onDrop={(e) => {
                e.preventDefault();
                const idx = Number(e.dataTransfer.getData("item_index"));
                const droppedItem = items[idx];
                if (droppedItem) handleDropNaLauda(droppedItem);
                else setDragOverLauda(false);
              }}
            >
              <div className="pb-2 border-b-2 border-pink-500 mb-3 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400">📋 LAUDA</span>
                {dragOverLauda && <span className="text-[9px] font-bold text-pink-400 animate-pulse ml-1">⬇ Solte aqui</span>}
                <span className="text-[9px] font-bold bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded-full ml-auto border border-pink-500/20">
                  {materiaAtual?.itensLauda?.length ?? 0} ITENS
                </span>
              </div>
              <div className="flex flex-col gap-1 overflow-y-auto flex-1">
                {materiaAtual?.itensLauda && materiaAtual.itensLauda.length > 0 ? (
                  materiaAtual.itensLauda.map((item, idx) => {
                    let bgColor = "bg-zinc-700";
                    let borderColor = "border-zinc-600";
                    let textColor = "text-white";
                    let hoverColor = "hover:bg-zinc-600";
                    let icon = "📌";
                    switch (item.tipo) {
                      case "SONORA": bgColor = "bg-emerald-600"; borderColor = "border-emerald-500"; hoverColor = "hover:bg-emerald-700"; icon = "🎤"; break;
                      case "PASSAGEM": bgColor = "bg-amber-600"; borderColor = "border-amber-500"; hoverColor = "hover:bg-amber-700"; icon = "🎥"; break;
                      case "PRODUÇÃO": bgColor = "bg-orange-600"; borderColor = "border-orange-500"; hoverColor = "hover:bg-orange-700"; icon = "🎬"; break;
                      case "ED_TEXTO": bgColor = "bg-blue-600"; borderColor = "border-blue-500"; hoverColor = "hover:bg-blue-700"; icon = "📝"; break;
                      case "ED_IMAGEM": bgColor = "bg-pink-600"; borderColor = "border-pink-500"; hoverColor = "hover:bg-pink-700"; icon = "🖼️"; break;
                      case "REPÓRTER": bgColor = "bg-cyan-600"; borderColor = "border-cyan-500"; hoverColor = "hover:bg-cyan-700"; icon = "🎙️"; break;
                      case "IMAGENS": bgColor = "bg-purple-600"; borderColor = "border-purple-500"; hoverColor = "hover:bg-purple-700"; icon = "🎞️"; break;
                    }
                    return (
                      <button
                        key={idx}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("drag_source", "lauda");
                          e.dataTransfer.setData("lauda_index", String(idx));
                          e.dataTransfer.effectAllowed = "move";
                          setDraggedFromLauda(item);
                          setDraggedLaudaIndex(idx);
                        }}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const source = e.dataTransfer.getData("drag_source");
                          if (source === "lauda") {
                            const fromIdx = Number(e.dataTransfer.getData("lauda_index"));
                            if (fromIdx !== idx) handleReorderLauda(fromIdx, idx);
                          }
                          setDraggedFromLauda(null);
                          setDraggedLaudaIndex(null);
                        }}
                        onDragEnd={() => { setDraggedFromLauda(null); setDraggedLaudaIndex(null); }}
                        onClick={() => {
                          const valor = item.valor || "";
                          const novoCredito = { line1: "", line2: "" };
                          if ((item.tipo === "SONORA" || item.tipo === "PASSAGEM") && valor.includes(" - ")) {
                            const partes = valor.split(" - ");
                            novoCredito.line1 = partes[0]?.trim() || valor;
                            novoCredito.line2 = partes[1]?.trim() || "";
                          } else {
                            novoCredito.line1 = valor;
                            novoCredito.line2 = item.tipo?.replace("_", " ") || "";
                          }
                          setGcCreditsQueue((prev) => {
                            const novaFila = [...prev, novoCredito];
                            if (novaFila.length === 1) { setGcLine1(novoCredito.line1); setGcLine2(novoCredito.line2); }
                            return novaFila;
                          });
                          if (materiaAtual?.materia_id) {
                            setRemovedLaudaOrdens(prev => {
                              const novoSet = new Set(prev[materiaAtual.materia_id] || []);
                              novoSet.add(item.ordem);
                              return { ...prev, [materiaAtual.materia_id]: novoSet };
                            });
                            setMateriaAtual(prev => {
                              if (!prev) return null;
                              const novaLauda = prev.itensLauda.filter(it => it.ordem !== item.ordem);
                              return { ...prev, itensLauda: novaLauda };
                            });
                          }
                          toast.success(`"${valor}" → GC`);
                        }}
                        className={cn(
                          `${bgColor} ${hoverColor} border ${borderColor} rounded-lg px-2.5 py-2 transition-all flex items-center justify-between gap-2 min-w-0 cursor-grab active:cursor-grabbing font-bold text-xs uppercase tracking-wide`,
                          draggedLaudaIndex === idx && "opacity-50 scale-95",
                          `${textColor} shadow-md hover:shadow-lg`
                        )}
                        title={`Clique para enviar ao GC: ${item.valor}`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-base shrink-0">{icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[8px] font-black opacity-80 leading-none">[{item.tipo.replace("_", ". ")}]</div>
                            <div className="text-[10px] font-bold truncate text-white">{item.valor}</div>
                          </div>
                        </div>
                        <span className="shrink-0 text-[9px] font-black bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">GC</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-2 text-zinc-700 border-2 border-dashed border-white/5 rounded-xl">
                    <span className="text-2xl">🎬</span>
                    <span className="text-[10px] uppercase tracking-widest text-center px-3">Arraste uma matéria da fila aqui</span>
                  </div>
                )}
              </div>
            </div>

            {/* ─ Transport Controls + GC Panel (lado a lado) ─ */}
            <div className="flex flex-row gap-2 min-h-0 overflow-hidden">

            {/* Transport Controls */}
            <div className="border rounded-xl p-4 flex flex-col gap-3 shrink-0" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', width: 320 }}>
              {/* Barra de progresso */}
              <div className="flex items-center gap-2">
                <span ref={progressTimeRef} className="text-[9px] font-mono text-zinc-600 w-8 text-right tabular-nums">{formatDuration(pgmCurrentTime)}</span>
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full cursor-pointer relative overflow-hidden group" onClick={handleSeek}>
                  <div ref={progressBarRef} className="h-full rounded-full transition-none relative" style={{ width: `${pgmProgress}%`, backgroundColor: '#ef4444' }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-white rounded-full -mr-1 opacity-0 group-hover:opacity-100 transition-opacity shadow" />
                  </div>
                </div>
                <span className="text-[9px] font-mono text-zinc-600 w-8 tabular-nums">{formatDuration(pgmFile?.duration ?? null)}</span>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-mono text-zinc-600 truncate">{pgmFile?.name.replace(".mp4", "") || "Nenhum arquivo no PGM"}</p>
              </div>

              {/* Botões transport */}
              <div className="flex items-center justify-center gap-1.5">
                <button onClick={handleCue} title="CUE"
                  className="flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 transition-all active:scale-[0.98] group"
                  style={{ backgroundColor: '#1f1f1f' }}>
                  <SkipBack className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
                  <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400">CUE</span>
                </button>
                <button onClick={handleStop} title="STOP"
                  className="flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl border border-zinc-700 hover:border-red-500/30 transition-all active:scale-[0.98] group"
                  style={{ backgroundColor: '#1f1f1f' }}>
                  <Square className="h-4 w-4 text-zinc-500 group-hover:text-red-500 transition-colors" />
                  <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-red-400">STOP</span>
                </button>
                <button onClick={handlePlayPausePgm} title={isPlaying ? "PAUSE" : "PLAY"}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-5 py-2.5 rounded-xl border transition-all active:scale-[0.98]",
                    isPlaying
                      ? "border-yellow-500/30 text-yellow-400"
                      : "text-black font-bold border-transparent"
                  )}
                  style={{ backgroundColor: isPlaying ? '#78350f20' : '#00E676' }}>
                  {isPlaying ? <Pause className="h-4 w-4 text-yellow-400" /> : <Play className="h-4 w-4 text-black" />}
                  <span className={cn("text-[8px] font-bold uppercase tracking-widest", isPlaying ? "text-yellow-400" : "text-black")}>
                    {isPlaying ? "PAUSE" : "PLAY"}
                  </span>
                </button>
                <button onClick={handleTake} title="TAKE"
                  className="flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-xl border transition-all active:scale-[0.98]"
                  style={{ backgroundColor: '#00E676', borderColor: '#00E67650' }}>
                  <MonitorPlay className="h-4 w-4 text-black" />
                  <span className="text-[8px] font-bold uppercase tracking-widest text-black">TAKE</span>
                </button>
                <button onClick={handleSkip} title="SKIP"
                  className="flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 transition-all active:scale-[0.98] group"
                  style={{ backgroundColor: '#1f1f1f' }}>
                  <SkipForward className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
                  <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400">SKIP</span>
                </button>
              </div>



              {/* ── MONITOR DE TIMELINE DE CRÉDITOS ── */}
              {materiaAtual && sonorasTimeline.length > 0 && pgmFile?.duration && (
              <div className="border rounded-xl p-3 flex flex-col gap-2 mt-0" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
                <div className="flex items-center justify-between pb-1 border-b" style={{ borderColor: '#2a2a2a' }}>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#00E676' }}>⏱ TIMELINE VT</span>
                  <span className="text-[9px] font-mono text-zinc-600">{formatarTimecode(Math.round(pgmCurrentTime))} / {formatarTimecode(Math.round(pgmFile.duration))}</span>
                </div>

                {/* Barra de progresso com marcadores de crédito */}
                <div className="relative h-5 rounded-full overflow-hidden" style={{ backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a' }}>
                  {/* Progresso atual */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-none"
                    style={{
                      width: `${(pgmCurrentTime / pgmFile.duration) * 100}%`,
                      backgroundColor: isPlaying ? '#ef4444' : '#3f3f46',
                    }}
                  />
                  {/* Playhead */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5"
                    style={{
                      left: `${(pgmCurrentTime / pgmFile.duration) * 100}%`,
                      backgroundColor: '#ffffff',
                      boxShadow: '0 0 4px rgba(255,255,255,0.8)',
                    }}
                  />
                  {/* Marcadores de crédito */}
                  {sonorasTimeline.map((cr, idx) => {
                    const pct = Math.min(99, (cr.timecodeInicio / pgmFile.duration) * 100);
                    const jaPAssou = pgmCurrentTime >= cr.timecodeInicio;
                    return (
                      <div
                        key={idx}
                        className="absolute top-0 bottom-0 w-0.5 transition-colors"
                        style={{
                          left: `${pct}%`,
                          backgroundColor: jaPAssou ? '#22c55e' : '#facc15',
                          opacity: jaPAssou ? 0.5 : 1,
                        }}
                        title={`${cr.nome} (${cr.funcao}) — ${formatarTimecode(cr.timecodeInicio)}`}
                      />
                    );
                  })}
                </div>

                {/* Lista de créditos com status */}
                <div className="flex flex-col gap-1 max-h-28 overflow-y-auto">
                  {sonorasTimeline.map((cr, idx) => {
                    const jaPassou = pgmCurrentTime >= cr.timecodeInicio + cr.duracao;
                    const ativo = pgmCurrentTime >= cr.timecodeInicio && pgmCurrentTime < cr.timecodeInicio + cr.duracao;
                    const proximo = !jaPassou && !ativo && sonorasTimeline.findIndex(c => !( pgmCurrentTime >= c.timecodeInicio + c.duracao)) === idx;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-2 py-1 rounded-lg transition-all"
                        style={{
                          backgroundColor: ativo ? '#00E67615' : jaPassou ? '#1a1a1a' : '#252525',
                          border: `1px solid ${ativo ? '#00E676' : jaPassou ? '#2a2a2a' : proximo ? '#facc1550' : '#2a2a2a'}`,
                        }}
                      >
                        <div
                          className="h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: ativo ? '#00E676' : jaPassou ? '#3f3f46' : '#facc15' }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[9px] font-bold text-white truncate">{cr.nome}</div>
                          <div className="text-[8px] text-zinc-500 truncate">{cr.funcao}</div>
                        </div>
                        <span className="text-[8px] font-mono shrink-0" style={{ color: ativo ? '#00E676' : '#52525b' }}>
                          {formatarTimecode(cr.timecodeInicio)}
                        </span>
                        {ativo && (
                          <span className="text-[7px] font-black uppercase tracking-widest animate-pulse shrink-0" style={{ color: '#00E676' }}>NO AR</span>
                        )}
                        {jaPassou && (
                          <span className="text-[7px] font-bold uppercase tracking-widest shrink-0 text-zinc-600">✓</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            </div>{/* end Transport Controls */}

            {/* GC Panel — colado à direita do Transport */}
            <div className="flex flex-col gap-2 overflow-y-auto" style={{ backgroundColor: '#121212', width: 400, minWidth: 400 }}>
              {/* GC — Gerador de Caracteres (fixo, inline) */}
              <GcPanel
                gcLine1={gcLine1}
                setGcLine1={setGcLine1}
                gcLine2={gcLine2}
                setGcLine2={setGcLine2}
                gcDuration={gcDuration}
                setGcDuration={setGcDuration}
                gcVisible={gcVisible}
                setGcVisible={setGcVisible}
                gcCreditsQueue={gcCreditsQueue}
                onTake={handleGcTakeQueue}
                onClear={handleGcClear}
                onSkip={handleGcSkip}
                onLayerChange={handleGcLayerChange}
              />

          {/* ── AJUSTES & EFEITOS ── */}
          <div className="border rounded-xl p-3 flex flex-col gap-3" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">⚙️ AJUSTES & EFEITOS</span>

            <div className="flex gap-2">
              {/* GC ERASE ALL */}
              <button
                onClick={() => {
                  const now = Date.now();
                  if (now - lastClickTime < 300) {
                    if (materiaAtual?.materia_id) {
                      setMateriaAtual({ ...materiaAtual, itensLauda: [] });
                      toast.success("Lauda limpa!");
                    }
                    setDoubleClickCount(0);
                    setLastClickTime(0);
                  } else {
                    setDoubleClickCount(1);
                    setLastClickTime(now);
                  }
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl border border-red-500/20 text-[9px] font-bold uppercase text-red-400 transition-all active:scale-[0.98]"
                style={{ backgroundColor: '#7f1d1d30' }}
                title="Clique 2x para deletar toda a lauda">
                🗑️ ERASE
              </button>
            </div>
          </div>



            </div>{/* end GC Panel column */}
            </div>{/* end Transport+GC flex-row wrapper */}

            {/* ══════════════════════════════════════════
                 TELEPROMPTER — Acompanhamento de leitura (o que o TP está rodando)
                ══════════════════════════════════════════ */}
            <div
              className="border rounded-xl flex flex-col overflow-hidden ml-3"
              style={{ backgroundColor: '#111', borderColor: '#222', width: 280 }}
            >
              {/* ── CABEÇALHO ── */}
              <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: '#222', background: 'linear-gradient(90deg,#0a0a0a,#181818)' }}>
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#00E676' }}>📺 TELEPROMPTER</span>
                <div className="flex items-center gap-1">
                  <div className={cn("h-1.5 w-1.5 rounded-full", tpConnected ? "animate-pulse" : "")} style={{ backgroundColor: tpConnected ? '#00E676' : '#52525b' }} />
                  <span className="text-[8px] font-mono uppercase tracking-widest" style={{ color: tpConnected ? '#00E676' : '#52525b' }}>
                    {tpConnected ? "AO VIVO" : "SEM SINAL"}
                  </span>
                </div>
              </div>
              <div className="px-3 py-1 border-b" style={{ borderColor: '#1a1a1a' }}>
                <span className="text-[7px] font-mono text-zinc-700 truncate block" title="Canal de sincronização — precisa ser idêntico ao mostrado no tp.tsx">
                  canal: tp-sync-{(programa || "geral").trim().toLowerCase()}
                </span>
              </div>

              {/* ── CONTROLES MANUAIS — MASTER / SYNC ── */}
              <div className="flex items-center gap-1.5 px-3 py-2 border-b" style={{ borderColor: '#1a1a1a' }}>
                <button
                  onClick={handleForceTpMaster}
                  title="Manda a tela do teleprompter (tp.tsx) virar MASTER automaticamente"
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all active:scale-[0.97]"
                  style={{ backgroundColor: '#00E67615', borderColor: '#00E67640', color: '#00E676' }}
                >
                  🎙️ MASTER
                </button>
                <button
                  onClick={handleManualTpSync}
                  title="Reler o estado do teleprompter agora, sem esperar"
                  disabled={tpSyncingNow}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all active:scale-[0.97] disabled:opacity-50"
                  style={{ backgroundColor: '#3b82f615', borderColor: '#3b82f640', color: '#3b82f6' }}
                >
                  <RefreshCw className={cn("h-2.5 w-2.5", tpSyncingNow && "animate-spin")} /> SYNC
                </button>
              </div>

              {/* ── TEXTO DA CABEÇA ATUAL ── */}
              <div className="flex-1 min-h-0 flex flex-col p-3 gap-2">
                {tpCurrentItem?.assunto && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 truncate">
                    {tpCurrentItem.assunto}
                  </span>
                )}
                <div
                  className="flex-1 min-h-0 overflow-y-auto rounded-lg border px-3 py-2.5"
                  style={{ backgroundColor: '#0a0a0a', borderColor: '#222' }}
                >
                  {tpCurrentItem?.cabeca ? (
                    <p className="text-[13px] leading-relaxed text-zinc-200 whitespace-pre-wrap">
                      {tpCurrentItem.cabeca}
                    </p>
                  ) : (
                    <p className="text-[11px] italic text-zinc-700 text-center py-8">
                      {tpConnected ? "Sem texto de cabeça para este item." : "Aguardando conexão com o teleprompter…"}
                    </p>
                  )}
                </div>
              </div>

              {/* ── RODAPÉ — PRÓXIMA CABEÇA ── */}
              <div className="px-3 py-2 border-t flex flex-col gap-1" style={{ borderColor: '#222', background: '#0d0d0d' }}>
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">▶ Próxima cabeça</span>
                {tpNextItem ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-amber-400 truncate">
                      {tpNextItem.assunto || "Sem título"}
                    </span>
                    <span className="text-[10px] text-zinc-400 line-clamp-2">
                      {tpNextItem.cabeca ? tpNextItem.cabeca.slice(0, 90) + (tpNextItem.cabeca.length > 90 ? "…" : "") : "Sem texto de cabeça cadastrado."}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-zinc-700 italic">— fim da sequência —</span>
                )}
              </div>
            </div>{/* end TELEPROMPTER col */}

            {/* ══════════════════════════════════════════
                 SWITCHER / MESA DE CORTE — Painel Expandido (3 colunas)
                ══════════════════════════════════════════ */}
            <div
              className="border rounded-xl flex flex-col overflow-hidden ml-3"
              style={{ backgroundColor: '#111', borderColor: '#222', minWidth: 820, maxWidth: 960 }}
            >
              {/* ── CABEÇALHO ── */}
              <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: '#222', background: 'linear-gradient(90deg,#0a0a0a,#181818)' }}>
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#00E676' }}>⬡ SWITCHER</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: '#ef444420', color: '#ef4444', border: '1px solid #ef444440' }}>PGM</span>
                  <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f640' }}>PVW</span>
                </div>
              </div>

              <div className="grid grid-cols-[230px_1fr_1fr] gap-0 flex-1 min-h-0">

                {/* ── COLUNA 1 — TRANSIÇÃO / T-BAR / AUTO ── */}
                <div className="flex flex-col gap-0 px-3 py-3 border-r overflow-y-auto" style={{ borderColor: '#1e1e1e' }}>
                {/* ── 1. TRANSITION TYPE — CUT / DISSOLVE / WIPE ── */}
                <div className="flex flex-col gap-1 mb-2">
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 px-0.5">Tipo de Transição</span>
                  <div className="flex gap-1">
                    {([
                      { key: "cut",     label: "✂ CUT",      bg: '#facc15', fg: '#000', glow: 'rgba(250,204,21,0.35)' },
                      { key: "dissolve",label: "◎ MIX",      bg: '#8b5cf6', fg: '#fff', glow: 'rgba(139,92,246,0.35)' },
                      { key: "wipe",    label: "▷ WIPE",     bg: '#0ea5e9', fg: '#fff', glow: 'rgba(14,165,233,0.35)' },
                    ] as const).map(({ key, label, bg, fg, glow }) => (
                      <button
                        key={key}
                        onClick={() => setTransitionType(key)}
                        className="flex-1 py-1.5 rounded text-[8px] font-black uppercase tracking-widest border transition-all active:scale-[0.97]"
                        style={{
                          backgroundColor: transitionType === key ? bg : '#1a1a1a',
                          borderColor: transitionType === key ? bg : '#2a2a2a',
                          color: transitionType === key ? fg : '#52525b',
                          boxShadow: transitionType === key ? `0 0 8px ${glow}` : 'none',
                        }}
                      >{label}</button>
                    ))}
                  </div>

                  {/* WIPE directions */}
                  {transitionType === "wipe" && (
                    <div className="grid grid-cols-6 gap-0.5 mt-0.5">
                      {["→","←","↓","↑","⬋","⬊"].map((dir, i) => (
                        <button key={i} onClick={() => setWipeDirIdx(i)}
                          className="py-1 rounded text-[10px] font-black border transition-all"
                          style={{
                            backgroundColor: wipeDirIdx === i ? '#0ea5e9' : '#1a1a1a',
                            borderColor: wipeDirIdx === i ? '#0ea5e9' : '#2a2a2a',
                            color: wipeDirIdx === i ? '#fff' : '#52525b',
                          }}
                        >{dir}</button>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── 2. T-BAR + AUTO TRANS ── */}
                <div className="flex gap-2 items-stretch mb-2">

                  {/* T-BAR vertical */}
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[7px] font-black uppercase tracking-widest text-zinc-600">PVW</span>
                    <div
                      className="relative flex flex-col items-center select-none"
                      style={{ width: 48, height: 120, cursor: transitionType === "cut" ? "pointer" : "ns-resize" }}
                      title={transitionType === "cut" ? "Clique para CUT" : "Arraste — solte ≥95% para confirmar"}
                      onMouseDown={(e) => {
                        if (transitionType === "cut") { handleTransition(); handleTransComplete(); return; }
                        handleTransition();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const onMove = (ev: MouseEvent) => {
                          const pct = Math.min(100, Math.max(0, ((ev.clientY - rect.top) / rect.height) * 100));
                          setTransValue(Math.round(pct));
                          applyTransOpacity(Math.round(pct), activePlayer);
                        };
                        const onUp = (ev: MouseEvent) => {
                          const pct = Math.min(100, Math.max(0, ((ev.clientY - rect.top) / rect.height) * 100));
                          window.removeEventListener("mousemove", onMove);
                          window.removeEventListener("mouseup", onUp);
                          if (pct >= 95) { handleTransComplete(); }
                          else {
                            setTransValue(0);
                            setPlayerAOpacity(activePlayer === "A" ? 1 : 0); setPlayerAZ(activePlayer === "A" ? 10 : 0);
                            setPlayerBOpacity(activePlayer === "B" ? 1 : 0); setPlayerBZ(activePlayer === "B" ? 10 : 0);
                            const inactiveEl = activePlayer === "A" ? pgmBRef.current : pgmARef.current;
                            if (inactiveEl) { inactiveEl.pause(); inactiveEl.src = ""; }
                          }
                        };
                        window.addEventListener("mousemove", onMove);
                        window.addEventListener("mouseup", onUp);
                      }}
                    >
                      {/* chassis */}
                      <div className="absolute inset-x-0 rounded-lg" style={{ top:0, bottom:0, background:'linear-gradient(90deg,#0d0d0d,#1c1c1c,#0d0d0d)', border:'2px solid #2a2a2a', boxShadow:'inset 0 2px 8px rgba(0,0,0,0.9)' }} />
                      {/* groove */}
                      <div className="absolute rounded-full" style={{ left:'50%', transform:'translateX(-50%)', top:8, bottom:8, width:4, background:'linear-gradient(180deg,#050505,#1e1e1e 50%,#050505)', boxShadow:'inset 0 1px 4px rgba(0,0,0,1)' }} />
                      {/* fill */}
                      <div className="absolute rounded-full transition-none" style={{
                        left:'50%', transform:'translateX(-50%)', bottom:8, width:4,
                        height: transValue > 0 ? `calc(${transValue}% - 8px)` : 0,
                        background: transitionType==="dissolve" ? 'linear-gradient(0deg,#7c3aed,#c4b5fd)' : transitionType==="wipe" ? 'linear-gradient(0deg,#0284c7,#7dd3fc)' : 'linear-gradient(0deg,#facc15,#fef08a)',
                        boxShadow: transValue > 0 ? (transitionType==="dissolve" ? '0 0 6px rgba(139,92,246,0.8)' : transitionType==="wipe" ? '0 0 6px rgba(14,165,233,0.8)' : '0 0 6px rgba(250,204,21,0.8)') : 'none',
                      }} />
                      {/* ticks */}
                      {[25,50,75].map(t => (
                        <div key={t} className="absolute" style={{ left:'50%', transform:'translateX(-50%)', top:`${t}%`, width:14, height:1, background:'rgba(255,255,255,0.07)' }} />
                      ))}
                      {/* knob */}
                      <div className="absolute z-10" style={{
                        top:`calc(${transValue}% - 15px)`, left:'50%', transform:'translateX(-50%)',
                        width:40, height:30, borderRadius:5,
                        background:'linear-gradient(180deg,#4a4a4a 0%,#d6d6d6 30%,#a0a0a0 50%,#6a6a6a 70%,#333 100%)',
                        border:'1px solid #6a6a6a',
                        boxShadow:'0 3px 10px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.6)',
                      }}>
                        {[0,1,2,3].map(i => <div key={i} className="absolute" style={{ top:`${9+i*3}px`, left:5, right:5, height:1, background:'rgba(0,0,0,0.3)' }} />)}
                        <div className="absolute" style={{
                          top:'50%', left:7, right:7, height:2, transform:'translateY(-50%)', borderRadius:1,
                          background: transitionType==="dissolve" ? '#a78bfa' : transitionType==="wipe" ? '#7dd3fc' : '#facc15',
                          boxShadow: transitionType==="dissolve" ? '0 0 4px rgba(167,139,250,1)' : transitionType==="wipe" ? '0 0 4px rgba(125,211,252,1)' : '0 0 4px rgba(250,204,21,1)',
                        }} />
                      </div>
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-widest text-zinc-600">PGM</span>
                    <span className="text-[7px] font-mono text-center" style={{ color: transValue > 0 ? '#facc15' : '#3f3f46' }}>
                      {transValue > 0 ? (transValue >= 95 ? "✓ OK" : `${transValue}%`) : "—"}
                    </span>
                  </div>

                  {/* AUTO TRANS control */}
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[7px] font-black uppercase tracking-widest text-zinc-600">Duração Auto</span>
                      <div className="flex gap-1">
                        {[15, 30, 60, 90].map((f) => (
                          <button key={f} onClick={() => setAutoTransDur(f)}
                            className="flex-1 py-1 rounded text-[7px] font-black border transition-all"
                            style={{
                              backgroundColor: autoTransDur === f ? '#1d4ed8' : '#1a1a1a',
                              borderColor: autoTransDur === f ? '#3b82f6' : '#2a2a2a',
                              color: autoTransDur === f ? '#93c5fd' : '#52525b',
                            }}
                          >{f === 15 ? '½s' : f === 30 ? '1s' : f === 60 ? '2s' : '3s'}</button>
                        ))}
                      </div>
                    </div>

                    {/* AUTO button */}
                    <button
                      onClick={handleAutoTrans}
                      disabled={autoTransRunning}
                      className="w-full py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all active:scale-[0.97] disabled:opacity-50"
                      style={{
                        background: autoTransRunning
                          ? 'linear-gradient(135deg,#1d4ed8,#2563eb)'
                          : 'linear-gradient(135deg,#1e3a8a,#1d4ed8)',
                        borderColor: '#3b82f6',
                        color: '#93c5fd',
                        boxShadow: autoTransRunning ? '0 0 16px rgba(59,130,246,0.6)' : '0 0 8px rgba(59,130,246,0.2)',
                      }}
                    >
                      {autoTransRunning ? `⟳ ${transValue}%` : '▶ AUTO'}
                    </button>

                    {/* FTB — Fade to Black */}
                    <button
                      onClick={() => {
                        if (pgmChannelRef.current?.readyState === 1)
                          pgmChannelRef.current.send(JSON.stringify({ type: "ftb" }));
                        toast("⬛ Fade to Black");
                      }}
                      className="w-full py-1.5 rounded text-[8px] font-black uppercase tracking-widest border transition-all active:scale-[0.97]"
                      style={{ backgroundColor: '#0a0a0a', borderColor: '#3f3f46', color: '#71717a', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
                    >⬛ FTB</button>

                    {/* FREEZE */}
                    <button
                      onClick={() => {
                        const el = activePlayer === "A" ? pgmARef.current : pgmBRef.current;
                        if (el) { el.paused ? el.play() : el.pause(); }
                        toast("🧊 FREEZE");
                      }}
                      className="w-full py-1.5 rounded text-[8px] font-black uppercase tracking-widest border transition-all active:scale-[0.97]"
                      style={{ backgroundColor: '#0c1a2e', borderColor: '#1e3a5f', color: '#60a5fa' }}
                    >🧊 FREEZE</button>
                  </div>
                </div>
                </div>

                {/* ── COLUNA 2 — BUS DE CÂMERAS + DSK ── */}
                <div className="flex flex-col gap-0 px-3 py-3 border-r overflow-y-auto" style={{ borderColor: '#1e1e1e' }}>
                {/* ── 3. CAM BUS — PVW row + PGM row ── */}
                {multiviewActive && (
                <div className="flex flex-col gap-1.5 mb-3">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[7px] font-black uppercase tracking-widest text-zinc-600 flex-1">Bus de Câmeras</span>
                  </div>
                  {/* labels */}
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {["CAM 1","CAM 2","CAM 3","CAM 4","BLACK"].map((label) => (
                      <span key={label} className="text-[6px] font-black uppercase text-zinc-700 truncate">{label}</span>
                    ))}
                  </div>
                  {/* PVW row */}
                  <div className="grid grid-cols-5 gap-1">
                    {(["cam1","cam2","cam3","cam4","black"] as const).map((src, i) => (
                      <button key={src}
                        onClick={() => {
                          setPvwBus(src);
                          if (src !== "black") { sendCamToPreview(i); toast.success(`PVW → ${src.toUpperCase()}`); }
                        }}
                        className="py-1.5 rounded text-[7px] font-black border transition-all active:scale-[0.97]"
                        style={{
                          backgroundColor: pvwBus === src ? '#1d4ed8' : '#1a1a1a',
                          borderColor: pvwBus === src ? '#3b82f6' : '#2a2a2a',
                          color: pvwBus === src ? '#fff' : '#52525b',
                          boxShadow: pvwBus === src ? '0 0 6px rgba(59,130,246,0.5)' : 'none',
                        }}
                      >{src === "black" ? "⬛" : `${i+1}`}</button>
                    ))}
                  </div>
                  {/* PGM row */}
                  <div className="grid grid-cols-5 gap-1">
                    {(["cam1","cam2","cam3","cam4","black"] as const).map((src, i) => (
                      <button key={src}
                        onClick={() => {
                          setPgmBus(src);
                          setActiveCam(src !== "black" ? i + 1 : null);
                          if (src !== "black" && pgmChannelRef.current?.readyState === 1)
                            pgmChannelRef.current.send(JSON.stringify({ type: "cam_take", cam: i + 1 }));
                          toast.success(`PGM → ${src.toUpperCase()}`);
                        }}
                        className="py-1.5 rounded text-[7px] font-black border transition-all active:scale-[0.97]"
                        style={{
                          backgroundColor: pgmBus === src ? '#dc2626' : '#1a1a1a',
                          borderColor: pgmBus === src ? '#ef4444' : '#2a2a2a',
                          color: pgmBus === src ? '#fff' : '#52525b',
                          boxShadow: pgmBus === src ? '0 0 8px rgba(220,38,38,0.6)' : 'none',
                        }}
                      >{src === "black" ? "⬛" : `${i+1}`}</button>
                    ))}
                  </div>
                  <div className="flex justify-between px-0.5">
                    <span className="text-[6px] font-mono text-blue-500/60 uppercase">PVW</span>
                    <span className="text-[6px] font-mono text-red-500/60 uppercase">PGM</span>
                  </div>
                </div>
                )}

                  <div className="border-t pt-3 mt-1" style={{ borderColor: '#222' }}>
                {/* ── 4. DSK — Downstream Keyer ── */}
                <div className="flex flex-col gap-1 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 flex-1">DSK — Downstream Keyer</span>
                    <span className={cn("text-[7px] font-black uppercase px-1.5 py-0.5 rounded border", dskActive ? "text-green-400 border-green-500/40 bg-green-500/10 animate-pulse" : "text-zinc-700 border-zinc-800 bg-zinc-900")}>
                      {dskActive ? "ON AIR" : "OFF"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {/* Load PNG */}
                    <button
                      onClick={() => dskFileInputRef.current?.click()}
                      className="flex-1 py-1.5 rounded text-[8px] font-black uppercase border transition-all"
                      style={{ backgroundColor: dskPng ? '#14532d30' : '#1a1a1a', borderColor: dskPng ? '#16a34a50' : '#2a2a2a', color: dskPng ? '#4ade80' : '#52525b' }}
                    >{dskPng ? "✓ PNG" : "🖼 LOAD"}</button>
                    <input ref={dskFileInputRef} type="file" accept="image/png" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleDskLoad(f); e.target.value=""; }} />
                    {/* ON / OFF */}
                    <button
                      onClick={() => {
                        if (!dskPng) { toast.error("Carregue um PNG primeiro"); return; }
                        setDskActive(v => !v);
                        if (pgmChannelRef.current?.readyState === 1)
                          pgmChannelRef.current.send(JSON.stringify({ type: dskActive ? "dsk_off" : "dsk_on", png: dskPng, opacity: dskOpacity }));
                      }}
                      className="flex-1 py-1.5 rounded text-[8px] font-black uppercase border transition-all active:scale-[0.97]"
                      style={{
                        backgroundColor: dskActive ? '#14532d' : '#1a1a1a',
                        borderColor: dskActive ? '#22c55e' : '#3f3f46',
                        color: dskActive ? '#4ade80' : '#71717a',
                        boxShadow: dskActive ? '0 0 10px rgba(34,197,94,0.4)' : 'none',
                      }}
                    >{dskActive ? "▌▌ TAKE OFF" : "▶ TAKE ON"}</button>
                    {/* clear */}
                    {dskPng && (
                      <button onClick={() => { setDskPng(null); setDskActive(false); }}
                        className="px-2 rounded border border-red-500/20 text-red-500/60 text-[10px] transition-all hover:border-red-500/60 hover:text-red-400"
                        style={{ backgroundColor: '#1a1a1a' }}
                      ><X className="h-3 w-3" /></button>
                    )}
                  </div>
                  {/* Opacity */}
                  <div className="flex items-center gap-2">
                    <span className="text-[7px] font-black uppercase text-zinc-700 shrink-0">Opacidade</span>
                    <input type="range" min={0} max={100} value={dskOpacity}
                      onChange={(e) => { const v = Number(e.target.value); setDskOpacity(v); if (pgmChannelRef.current?.readyState===1) pgmChannelRef.current.send(JSON.stringify({ type:"dsk_opacity", opacity: v })); }}
                      className="flex-1 h-1 accent-green-500 cursor-pointer"
                    />
                    <span className="text-[7px] font-mono text-zinc-600 shrink-0 w-6 text-right">{dskOpacity}%</span>
                  </div>
                </div>
                  </div>
                </div>

                {/* ── COLUNA 3 — FRAMES & OVERLAY (área anteriormente livre) ── */}
                <div className="flex flex-col gap-0 px-3 py-3 overflow-y-auto">
                {/* ── 5. FRAMES & OVERLAY — 4×2 grid ── */}
                <div className="flex flex-col gap-1.5 mb-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">🖼 Frames & Overlay</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((id) => {
                      const realId = id % 4;
                      return (
                        <button
                          key={id}
                          onClick={() => { if (id < 4) handleMeFrameClick(id); else meFileInputRefs.current[realId]?.click(); }}
                          className={cn(
                            "aspect-square bg-[#0d0d0d] border-2 rounded-md flex flex-col items-center justify-center transition-all group overflow-hidden relative",
                            id < 4
                              ? (meActiveFrame === id ? "border-[#00E676] shadow-[0_0_8px_rgba(0,230,118,0.5)]" : "border-[#222] hover:border-[#00E67660]")
                              : "border-[#1e1e1e] hover:border-[#3f3f46]"
                          )}
                          title={id < 4 ? (meFrames[id] ? `FRAME ${id+1} — clique para ativar/desativar` : `F${id+1}: Carregar PNG`) : `Slot extra ${id+1}`}
                        >
                          {id < 4 && meFrames[id] ? (
                            <>
                              <img src={meFrames[id] as string} alt="" className="absolute inset-0 w-full h-full object-contain p-0.5" />
                              <button onClick={(e) => handleMeFrameClear(id, e)}
                                className="absolute top-0 right-0 z-20 flex items-center justify-center w-3.5 h-3.5 rounded-bl bg-black/80 text-zinc-500 hover:text-red-400 transition-all">
                                <X className="h-2 w-2" />
                              </button>
                            </>
                          ) : (
                            <ImageIcon className="text-zinc-800 group-hover:text-zinc-600 transition-colors" size={16} />
                          )}
                          <span className={cn(
                            "text-[8px] z-10 font-black",
                            id < 4 && meActiveFrame === id ? "text-[#00E676] bg-black/70 px-0.5 rounded" : "text-zinc-700"
                          )}>
                            {id < 4 ? `F${id+1}` : `S${id-3}`}
                          </span>
                          {id < 4 && (
                            <input ref={(el) => { meFileInputRefs.current[id] = el; }} type="file" accept="image/png" className="hidden"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMeFrameLoad(id, f); e.target.value=""; }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                  {/* espaço extra reaproveitado — resumo rápido do estado do switcher */}
                  <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t" style={{ borderColor: '#222' }}>
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Status</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="rounded-lg border px-2 py-1.5 flex flex-col gap-0.5" style={{ backgroundColor: '#0a0a0a', borderColor: '#222' }}>
                        <span className="text-[7px] font-black uppercase text-zinc-600">Transição</span>
                        <span className="text-[10px] font-black uppercase" style={{ color: transitionType === "dissolve" ? '#a78bfa' : transitionType === "wipe" ? '#7dd3fc' : '#facc15' }}>
                          {transitionType === "dissolve" ? "MIX" : transitionType === "wipe" ? "WIPE" : "CUT"}
                        </span>
                      </div>
                      <div className="rounded-lg border px-2 py-1.5 flex flex-col gap-0.5" style={{ backgroundColor: '#0a0a0a', borderColor: '#222' }}>
                        <span className="text-[7px] font-black uppercase text-zinc-600">DSK</span>
                        <span className="text-[10px] font-black uppercase" style={{ color: dskActive ? '#4ade80' : '#52525b' }}>
                          {dskActive ? "ON AIR" : "OFF"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>{/* end SWITCHER col */}

          </div>
        </div>

          {tarjaPanelOpen && (
            <div
              className="fixed z-[9999] border rounded-2xl shadow-2xl w-80 select-none"
              style={{ left: tarjaPanelPos.x, top: tarjaPanelPos.y, backgroundColor: '#1a1a1a', borderColor: '#3a3a3a' }}
            >
              {/* Header arrastável */}
              <div
                className="flex items-center justify-between px-4 py-3 rounded-t-2xl cursor-grab active:cursor-grabbing border-b"
                style={{ backgroundColor: '#252525', borderColor: '#333' }}
                onMouseDown={(e) => {
                  tarjaDragRef.current = { startX: e.clientX, startY: e.clientY, startPX: tarjaPanelPos.x, startPY: tarjaPanelPos.y };
                  const onMove = (ev: MouseEvent) => {
                    if (!tarjaDragRef.current) return;
                    setTarjaPanelPos({ x: tarjaDragRef.current.startPX + ev.clientX - tarjaDragRef.current.startX, y: tarjaDragRef.current.startPY + ev.clientY - tarjaDragRef.current.startY });
                  };
                  const onUp = () => {
                    tarjaDragRef.current = null;
                    window.removeEventListener("mousemove", onMove);
                    window.removeEventListener("mouseup", onUp);
                  };
                  window.addEventListener("mousemove", onMove);
                  window.addEventListener("mouseup", onUp);
                }}
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">🎞 Controles da Tarja</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const next = !tarjaVisible;
                      setTarjaVisible(next);
                      pgmChannelRef.current?.readyState === 1 && pgmChannelRef.current.send(JSON.stringify({ type: next ? "tarja_show" : "tarja_hide" }));
                    }}
                    className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border transition-all"
                    style={{
                      backgroundColor: tarjaVisible ? '#00E67620' : '#252525',
                      borderColor: tarjaVisible ? '#00E67640' : '#3f3f46',
                      color: tarjaVisible ? '#00E676' : '#71717a',
                    }}
                  >
                    {tarjaVisible ? "● ON" : "○ OFF"}
                  </button>
                  <button onClick={() => setTarjaPanelOpen(false)} className="text-zinc-500 hover:text-red-400 font-bold transition-colors">✕</button>
                </div>
              </div>

              <div className="p-4 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
                {/* TEXTO & TIPOGRAFIA */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Caractere / Texto</span>
                  <input type="text" value={tarjaText} onChange={(e) => setTarjaText(e.target.value)}
                    placeholder="Nome da tarja..."
                    className="w-full border rounded-lg px-3 py-2 text-[11px] font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none transition-all"
                    style={{ backgroundColor: '#252525', borderColor: '#3a3a3a' }}
                  />
                  <div className="flex gap-2 items-center">
                    <select value={tarjaFont} onChange={(e) => setTarjaFont(e.target.value)}
                      className="flex-1 border rounded-lg px-2 py-1.5 text-[10px] text-zinc-200 focus:outline-none transition-all"
                      style={{ backgroundColor: '#252525', borderColor: '#3a3a3a' }}>
                      <option value="sans-serif">Sans-Serif</option>
                      <option value="serif">Serif</option>
                      <option value="monospace">Monospace</option>
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="'Times New Roman', serif">Times New Roman</option>
                      <option value="'Courier New', monospace">Courier New</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="Impact, sans-serif">Impact</option>
                      <option value="Verdana, sans-serif">Verdana</option>
                    </select>
                    <button onClick={() => setTarjaBold((v) => !v)}
                      className="px-3 py-1.5 rounded-lg border text-[11px] font-black tracking-widest transition-all"
                      style={{ backgroundColor: tarjaBold ? '#00E67620' : '#252525', borderColor: tarjaBold ? '#00E67640' : '#3a3a3a', color: tarjaBold ? '#00E676' : '#71717a' }}>B</button>
                    <button onClick={() => setTarjaItalic((v) => !v)}
                      className="px-3 py-1.5 rounded-lg border text-[11px] italic font-bold tracking-widest transition-all"
                      style={{ backgroundColor: tarjaItalic ? '#00E67620' : '#252525', borderColor: tarjaItalic ? '#00E67640' : '#3a3a3a', color: tarjaItalic ? '#00E676' : '#71717a' }}>I</button>
                  </div>
                  <div className="w-full px-3 py-2 rounded-lg border text-center truncate text-[13px]"
                    style={{ backgroundColor: '#0a0a0a', borderColor: '#2a2a2a', fontFamily: tarjaFont, fontWeight: tarjaBold ? "bold" : "normal", fontStyle: tarjaItalic ? "italic" : "normal", color: `hsl(${tarjaHue}, ${tarjaSaturation}%, 80%)` }}>
                    {tarjaText || "Prévia do texto"}
                  </div>
                </div>

                {/* COR */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Cor da Tarja</span>
                  <div className="flex items-center gap-2">
                    <label className="text-[9px] text-zinc-500 w-16 shrink-0">Hue</label>
                    <input type="range" min={0} max={360} value={tarjaHue}
                      onChange={(e) => setTarjaHue(Number(e.target.value))}
                      className="flex-1 h-1.5 accent-pink-500"
                      style={{ background: `linear-gradient(to right,hsl(0,100%,50%),hsl(60,100%,50%),hsl(120,100%,50%),hsl(180,100%,50%),hsl(240,100%,50%),hsl(300,100%,50%),hsl(360,100%,50%))` }}
                    />
                    <span className="text-[9px] font-mono text-zinc-400 w-8 text-right">{tarjaHue}°</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[9px] text-zinc-500 w-16 shrink-0">Saturação</label>
                    <input type="range" min={0} max={100} value={tarjaSaturation}
                      onChange={(e) => setTarjaSaturation(Number(e.target.value))}
                      className="flex-1 h-1.5 accent-pink-500"
                    />
                    <span className="text-[9px] font-mono text-zinc-400 w-8 text-right">{tarjaSaturation}%</span>
                  </div>
                  <div className="w-full h-5 rounded-md border border-zinc-700"
                    style={{ backgroundColor: `hsla(${tarjaHue},${tarjaSaturation}%,40%,${tarjaAlpha/100})` }} />
                </div>

                {/* OPACIDADE */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Opacidade (Alpha)</span>
                  <div className="flex items-center gap-2">
                    <input type="range" min={0} max={100} value={tarjaAlpha}
                      onChange={(e) => setTarjaAlpha(Number(e.target.value))}
                      className="flex-1 h-1.5 accent-pink-500"
                    />
                    <span className="text-[9px] font-mono text-zinc-400 w-8 text-right">{tarjaAlpha}%</span>
                  </div>
                </div>

                {/* ESCALA */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Escala</span>
                    <button onClick={() => setTarjaScaleLock((v) => !v)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-widest transition-all"
                      style={{
                        backgroundColor: tarjaScaleLock ? '#00E67620' : '#252525',
                        borderColor: tarjaScaleLock ? '#00E67450' : '#3f3f46',
                        color: tarjaScaleLock ? '#00E676' : '#71717a',
                      }}>
                      {tarjaScaleLock ? "🔒 LOCK" : "🔓 FREE"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[9px] text-zinc-500 w-16 shrink-0">Largura X</label>
                    <input type="range" min={10} max={400} value={tarjaScaleX}
                      onChange={(e) => { const v = Number(e.target.value); if (tarjaScaleLock) { setTarjaScaleX(v); setTarjaScaleY(v); } else setTarjaScaleX(v); }}
                      className="flex-1 h-1.5 accent-pink-500"
                    />
                    <span className="text-[9px] font-mono text-zinc-400 w-8 text-right">{tarjaScaleX}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[9px] text-zinc-500 w-16 shrink-0">Altura Y</label>
                    <input type="range" min={10} max={400} value={tarjaScaleY}
                      onChange={(e) => { const v = Number(e.target.value); if (tarjaScaleLock) { setTarjaScaleX(v); setTarjaScaleY(v); } else setTarjaScaleY(v); }}
                      className="flex-1 h-1.5 accent-pink-500"
                    />
                    <span className="text-[9px] font-mono text-zinc-400 w-8 text-right">{tarjaScaleY}%</span>
                  </div>
                </div>

                {/* POSIÇÃO */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Posição na Tela</span>
                  <div className="flex items-center gap-2">
                    <label className="text-[9px] text-zinc-500 w-16 shrink-0">X (horiz.)</label>
                    <input type="range" min={0} max={100} value={tarjaX}
                      onChange={(e) => setTarjaX(Number(e.target.value))}
                      className="flex-1 h-1.5 accent-pink-500"
                    />
                    <span className="text-[9px] font-mono text-zinc-400 w-8 text-right">{tarjaX}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[9px] text-zinc-500 w-16 shrink-0">Y (vert.)</label>
                    <input type="range" min={0} max={100} value={tarjaY}
                      onChange={(e) => setTarjaY(Number(e.target.value))}
                      className="flex-1 h-1.5 accent-pink-500"
                    />
                    <span className="text-[9px] font-mono text-zinc-400 w-8 text-right">{tarjaY}%</span>
                  </div>
                  {/* Mini mapa */}
                  <div className="relative w-full h-14 rounded-lg border border-zinc-700 overflow-hidden" style={{ backgroundColor: '#252525' }}>
                    <div
                      className="absolute w-2.5 h-2.5 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 shadow-lg transition-all duration-75"
                      style={{ left: `${tarjaX}%`, top: `${tarjaY}%`, backgroundColor: `hsla(${tarjaHue},${tarjaSaturation}%,50%,0.8)` }}
                    />
                  </div>
                </div>

                {/* PNG PERSONALIZADO */}
                <div className="flex flex-col gap-2 border-t border-zinc-700 pt-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">PNG Personalizado</span>
                  <div className="flex gap-2">
                    <button onClick={() => tarjaFileInputRef.current?.click()}
                      className="flex-1 px-3 py-2 rounded-xl border text-[9px] font-bold uppercase tracking-widest text-zinc-200 transition-all active:scale-95"
                      style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
                      📁 PERSONALIZAR
                    </button>
                    {tarjaCustomPng && (
                      <button onClick={() => setTarjaCustomPng(null)}
                        className="px-3 py-2 rounded-xl border border-red-500/30 text-[9px] font-bold text-red-400 transition-all active:scale-95"
                        style={{ backgroundColor: '#7f1d1d40' }}>✕ Remover</button>
                    )}
                  </div>
                  {tarjaCustomPng && (
                    <div className="w-full overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 flex items-center justify-center"
                      style={{ aspectRatio: `${tarjaScaleX} / ${tarjaScaleY}` }}>
                      <img src={tarjaCustomPng} alt="Tarja custom" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <input ref={tarjaFileInputRef} type="file" accept="image/png" className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setTarjaCustomPng(reader.result as string);
                      reader.readAsDataURL(file);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
            </div>
          )}

      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #3a3a3a; }
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `,
        }}
      />

      {/* GcPanel agora embutido inline na coluna direita */}
    </div>
  );
}

function codecBadgeClass(codec: LocalVideoFile["codec"]): string {
  switch (codec) {
    case "H.264":
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    case "H.265/HEVC":
      return "text-blue-400 bg-blue-500/10 border-blue-500/30";
    case "AV1":
      return "text-purple-400 bg-purple-500/10 border-purple-500/30";
    case "Verificando...":
      return "text-zinc-400 bg-zinc-700/40 border-zinc-600/30";
    case "Erro":
      return "text-red-400 bg-red-500/10 border-red-500/30";
    default:
      return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
  }
}
