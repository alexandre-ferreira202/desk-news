/**
 * 🎬 VT TIMECODE CALCULATOR
 * ═════════════════════════════════════════════════════════════════════════════
 * Sistema de cálculo automático de timecodes para inserção de créditos
 * baseado na sincronização entre duração do VT e contagem de palavras do roteiro
 */

// ────────────────────────────────────────────────────────────────────────────
// 📊 TIPOS E INTERFACES
// ────────────────────────────────────────────────────────────────────────────

export interface ElementoRoteiro {
  tipo: "OFF" | "SONORA" | "PASSAGEM" | "IMAGENS" | "PRODUÇÃO" | "ED_TEXTO" | "ED_IMAGEM";
  numero?: number;
  nome?: string;
  local?: string;
  texto?: string;
  palavras: number;
  linhaInicio: number;
  linhaFinal: number;
  posicaoRelativa: number; // 0 a 1
  timecode?: number; // em segundos
  timecodeFormatado?: string; // MM:SS
}

export interface AnaliseRoteiro {
  totalPalavras: number;
  totalLinhas: number;
  duracaoVTSegundos: number;
  duracaoVTFormatada: string;
  velocidadePalavrasSegundo: number;
  elementos: ElementoRoteiro[];
  creditsInsercao: CreditsInsercao;
}

export interface CreditsInsercao {
  tempoEntradaCreditos: number; // segundos
  tempoSaidaCreditos: number; // segundos
  tempoEntradaCreditsFormatado: string; // MM:SS
  tempoSaidaCreditsFormatado: string; // MM:SS
  duracacaoCredits: number; // segundos
  percentualEntrada: number; // % do VT
  percentualSaida: number; // % do VT
}

// ────────────────────────────────────────────────────────────────────────────
// ⏱️ CONVERSOR DE TEMPO
// ────────────────────────────────────────────────────────────────────────────

/**
 * Converte formato MM:SS ou M:SS para segundos
 * @param tempo - String no formato "1:30" ou "01:30"
 * @returns Número de segundos
 */
export function tempoParaSegundos(tempo: string): number {
  if (!tempo || typeof tempo !== "string") return 0;
  
  const partes = tempo.trim().split(":");
  if (partes.length !== 2) return 0;
  
  const minutos = parseInt(partes[0], 10) || 0;
  const segundos = parseInt(partes[1], 10) || 0;
  
  return minutos * 60 + segundos;
}

/**
 * Converte segundos para formato MM:SS
 * @param segundos - Número de segundos
 * @returns String no formato "1:30"
 */
export function segundosParaTempo(segundos: number): string {
  if (!segundos || segundos < 0) return "0:00";
  
  const minutos = Math.floor(segundos / 60);
  const segs = Math.round(segundos % 60);
  
  return `${minutos}:${segs.toString().padStart(2, "0")}`;
}

// ────────────────────────────────────────────────────────────────────────────
// 📝 CONTADOR DE PALAVRAS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Conta total de palavras em um texto
 * @param texto - Texto a ser contado
 * @returns Número de palavras
 */
export function contarPalavras(texto: string): number {
  if (!texto) return 0;
  
  return texto
    .trim()
    .split(/\s+/)
    .filter(palavra => palavra.length > 0).length;
}

/**
 * Conta palavras em cada linha
 * @param texto - Texto com quebras de linha
 * @returns Array com contagem por linha
 */
export function contarPalavrasPorLinha(texto: string): number[] {
  if (!texto) return [];
  
  return texto.split("\n").map(linha => contarPalavras(linha));
}

// ────────────────────────────────────────────────────────────────────────────
// 🎯 EXTRATOR DE ELEMENTOS DO ROTEIRO
// ────────────────────────────────────────────────────────────────────────────

/**
 * Extrai elementos do roteiro técnico
 * Procura por padrões como [OFF 1], [SONORA], [PASSAGEM], etc
 * 
 * @param estrutura - Texto do roteiro técnico/decupagem
 * @returns Array de elementos encontrados
 */
export function extrairElementosRoteiro(estrutura: string): ElementoRoteiro[] {
  if (!estrutura) return [];
  
  const linhas = estrutura.split("\n");
  const elementos: ElementoRoteiro[] = [];
  let palavrasAcumuladas = 0;
  const totalPalavras = contarPalavras(estrutura);
  
  let i = 0;
  
  while (i < linhas.length) {
    const linha = linhas[i];
    const trimmed = linha.trim().toUpperCase();
    
    // Padrão: [TIPO numero] ou [TIPO] ou [TIPO] NOME / FUNÇÃO
    const matchElemento = trimmed.match(/^\[(OFF|SONORA|PASSAGEM|IMAGENS|PRODUÇÃO|ED\s*(?:\/\/)?\s*TEXTO|ED\s*(?:\/\/)?\s*IMAGEM)\s*(\d+)?[\s\]]*/);
    
    if (matchElemento) {
      const tipo = matchElemento[1].replace(/\s*\/\/?\s*/g, "").replace("ED TEXTO", "ED_TEXTO").replace("ED IMAGEM", "ED_IMAGEM") as 
        | "OFF"
        | "SONORA"
        | "PASSAGEM"
        | "IMAGENS"
        | "PRODUÇÃO"
        | "ED_TEXTO"
        | "ED_IMAGEM";
      
      const numero = matchElemento[2] ? parseInt(matchElemento[2], 10) : undefined;
      
      let nome = "";
      let local = "";
      
      // Procura por NOME / FUNÇÃO ou NOME / LOCAL
      if (matchElemento[0].includes("/")) {
        const partes = linha.substring(linha.indexOf("/") + 1).split("/");
        nome = partes[0]?.trim() || "";
        local = partes[1]?.trim() || "";
      }
      
      // Coleta o texto até o próximo elemento ou fim
      let textoElemento = "";
      let linhaFinal = i;
      
      for (let j = i + 1; j < linhas.length; j++) {
        const proximaLinha = linhas[j].trim().toUpperCase();
        
        // Se encontrou outro elemento, para
        if (proximaLinha.match(/^\[(OFF|SONORA|PASSAGEM|IMAGENS|PRODUÇÃO|ED)/)) {
          break;
        }
        
        if (proximaLinha && !proximaLinha.startsWith("[")) {
          textoElemento += linhas[j] + "\n";
          linhaFinal = j;
        }
      }
      
      const palavrasElemento = contarPalavras(textoElemento);
      palavrasAcumuladas += palavrasElemento;
      
      const posicaoRelativa = totalPalavras > 0 ? palavrasAcumuladas / totalPalavras : 0;
      
      elementos.push({
        tipo,
        numero,
        nome,
        local,
        texto: textoElemento.trim(),
        palavras: palavrasElemento,
        linhaInicio: i,
        linhaFinal,
        posicaoRelativa,
        timecode: undefined,
        timecodeFormatado: undefined,
      });
      
      i = linhaFinal + 1;
    } else {
      i++;
    }
  }
  
  return elementos;
}

// ────────────────────────────────────────────────────────────────────────────
// 🎬 CÁLCULO DE TIMECODES
// ────────────────────────────────────────────────────────────────────────────

/**
 * Calcula timecodes para todos os elementos do roteiro
 * @param elementos - Elementos extraídos do roteiro
 * @param duracaoVTSegundos - Duração total do VT em segundos
 * @returns Elementos com timecodes calculados
 */
export function calcularTimecodesElementos(
  elementos: ElementoRoteiro[],
  duracaoVTSegundos: number
): ElementoRoteiro[] {
  return elementos.map(elemento => ({
    ...elemento,
    timecode: Math.round(elemento.posicaoRelativa * duracaoVTSegundos),
    timecodeFormatado: segundosParaTempo(Math.round(elemento.posicaoRelativa * duracaoVTSegundos)),
  }));
}

// ────────────────────────────────────────────────────────────────────────────
// 🎞️ CÁLCULO DE INSERÇÃO DE CRÉDITOS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Calcula quando os créditos devem entrar e sair no VT
 * 
 * LÓGICA:
 * - Entrada: 80% do VT (deixando espaço para a ação final)
 * - Saída: 95% do VT (deixando o final livre)
 * - Duração sugerida: 3 segundos para créditos
 * 
 * @param duracaoVTSegundos - Duração total do VT em segundos
 * @param percentualEntrada - Percentual de entrada (0-100, padrão 80)
 * @param percentualSaida - Percentual de saída (0-100, padrão 95)
 * @returns Objeto com timecodes de entrada/saída
 */
export function calcularInsercaoCreditos(
  duracaoVTSegundos: number,
  percentualEntrada: number = 80,
  percentualSaida: number = 95
): CreditsInsercao {
  if (!duracaoVTSegundos || duracaoVTSegundos <= 0) {
    return {
      tempoEntradaCreditos: 0,
      tempoSaidaCreditos: 3,
      tempoEntradaCreditsFormatado: "0:00",
      tempoSaidaCreditsFormatado: "0:03",
      duracacaoCredits: 3,
      percentualEntrada: 0,
      percentualSaida: 0,
    };
  }
  
  const tempoEntrada = Math.round((percentualEntrada / 100) * duracaoVTSegundos);
  const tempoSaida = Math.round((percentualSaida / 100) * duracaoVTSegundos);
  const duracao = tempoSaida - tempoEntrada;
  
  return {
    tempoEntradaCreditos: tempoEntrada,
    tempoSaidaCreditos: tempoSaida,
    tempoEntradaCreditsFormatado: segundosParaTempo(tempoEntrada),
    tempoSaidaCreditsFormatado: segundosParaTempo(tempoSaida),
    duracacaoCredits: duracao > 0 ? duracao : 3,
    percentualEntrada,
    percentualSaida,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// 📊 ANÁLISE COMPLETA DO ROTEIRO
// ────────────────────────────────────────────────────────────────────────────

/**
 * Realiza análise completa do roteiro técnico
 * Inclui contagem de palavras, extração de elementos, cálculo de timecodes
 * e sugestão de inserção de créditos
 * 
 * @param estrutura - Texto do roteiro técnico/decupagem
 * @param tempoVT - Tempo do VT em formato "MM:SS"
 * @returns Análise completa
 */
export function analisarRoteiro(
  estrutura: string,
  tempoVT: string
): AnaliseRoteiro {
  const duracaoVTSegundos = tempoParaSegundos(tempoVT);
  const totalPalavras = contarPalavras(estrutura);
  const totalLinhas = estrutura.split("\n").length;
  const velocidade = duracaoVTSegundos > 0 ? totalPalavras / duracaoVTSegundos : 0;
  
  let elementos = extrairElementosRoteiro(estrutura);
  elementos = calcularTimecodesElementos(elementos, duracaoVTSegundos);
  
  const creditsInsercao = calcularInsercaoCreditos(duracaoVTSegundos);
  
  return {
    totalPalavras,
    totalLinhas,
    duracaoVTSegundos,
    duracaoVTFormatada: tempoVT,
    velocidadePalavrasSegundo: parseFloat(velocidade.toFixed(2)),
    elementos,
    creditsInsercao,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// 🔍 FUNÇÕES AUXILIARES DE FORMATAÇÃO
// ────────────────────────────────────────────────────────────────────────────

/**
 * Gera relatório formatado da análise
 */
export function gerarRelatorioAnalise(analise: AnaliseRoteiro): string {
  let relatorio = `
╔════════════════════════════════════════════════════════════════╗
║              📊 ANÁLISE DO ROTEIRO TÉCNICO (VT)                ║
╚════════════════════════════════════════════════════════════════╝

⏱️  DURAÇÃO DO VT: ${analise.duracaoVTFormatada} (${analise.duracaoVTSegundos}s)
📝 TOTAL DE PALAVRAS: ${analise.totalPalavras}
📄 TOTAL DE LINHAS: ${analise.totalLinhas}
⚡ VELOCIDADE: ${analise.velocidadePalavrasSegundo} palavras/segundo

───────────────────────────────────────────────────────────────────
🎬 ELEMENTOS DO ROTEIRO:
───────────────────────────────────────────────────────────────────
`;
  
  analise.elementos.forEach((elem, idx) => {
    relatorio += `
${idx + 1}. [${elem.tipo}${elem.numero ? " " + elem.numero : ""}]
   Nome: ${elem.nome || "—"}
   Local: ${elem.local || "—"}
   Palavras: ${elem.palavras}
   Timecode: ${elem.timecodeFormatado} (${elem.posicaoRelativa * 100}%)
`;
  });
  
  relatorio += `
───────────────────────────────────────────────────────────────────
🎞️ SUGESTÃO DE INSERÇÃO DE CRÉDITOS:
───────────────────────────────────────────────────────────────────
📍 ENTRADA: ${analise.creditsInsercao.tempoEntradaCreditsFormatado} (${analise.creditsInsercao.percentualEntrada}%)
📍 SAÍDA: ${analise.creditsInsercao.tempoSaidaCreditsFormatado} (${analise.creditsInsercao.percentualSaida}%)
⏱️  DURAÇÃO: ${analise.creditsInsercao.duracacaoCredits}s
`;
  
  return relatorio;
}

/**
 * Exporta análise em formato JSON
 */
export function exportarAnaliseJSON(analise: AnaliseRoteiro): string {
  return JSON.stringify(analise, null, 2);
}

/**
 * Exporta análise em formato CSV
 */
export function exportarAnaliseCSV(analise: AnaliseRoteiro): string {
  let csv = "TIPO,NUMERO,NOME,LOCAL,PALAVRAS,TIMECODE,POSIÇÃO_RELATIVA\n";
  
  analise.elementos.forEach(elem => {
    csv += `${elem.tipo},"${elem.numero || ""}","${elem.nome || ""}","${elem.local || ""}",${elem.palavras},"${elem.timecodeFormatado}",${(elem.posicaoRelativa * 100).toFixed(1)}%\n`;
  });
  
  csv += `\n\nDURAÇÃO VT,TOTAL PALAVRAS,VELOCIDADE,ENTRADA CREDITS,SAÍDA CREDITS\n`;
  csv += `"${analise.duracaoVTFormatada}",${analise.totalPalavras},${analise.velocidadePalavrasSegundo},"${analise.creditsInsercao.tempoEntradaCreditsFormatado}","${analise.creditsInsercao.tempoSaidaCreditsFormatado}"\n`;
  
  return csv;
}
