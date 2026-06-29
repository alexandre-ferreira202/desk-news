/**
 * CreditoParser.ts
 * ════════════════════════════════════════════════════════════════════════════
 * Parser que extrai créditos E timecodes da estrutura do VT
 * ════════════════════════════════════════════════════════════════════════════
 */

import { CreditoTimecode } from "./TimecodeSync";

export interface ParsedCredito {
  creditos: CreditoTimecode[];
  ultimoOffTimecode: number;
  debug: string[];
}

/**
 * Calcula duração estimada do texto (em segundos)
 * Usa taxa de 2.5 palavras por segundo para narração
 */
function calcularDuracao(texto: string | undefined): number {
  if (!texto) return 2; // mínimo 2 segundos

  const palavras = texto.trim().split(/\s+/).length;
  const duracao = palavras / 2.5; // 2.5 palavras/segundo

  return Math.max(2, Math.ceil(duracao)); // mínimo 2s
}

/**
 * Parser da estrutura do VT que extrai créditos com timecodes
 */
export function parseEstruturaPorCreditos(
  estrutura: string | null
): ParsedCredito {
  const debug: string[] = [];
  const creditos: CreditoTimecode[] = [];

  if (!estrutura) {
    debug.push("⚠️ Estrutura vazia");
    return { creditos, ultimoOffTimecode: 0, debug };
  }

  const linhas = estrutura
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let timecodeAcumulado = 0; // Tempo total acumulado até agora
  let ultimoOffTimecode = 0;

  debug.push(`📖 Parseando ${linhas.length} linhas`);

  let i = 0;
  while (i < linhas.length) {
    const linha = linhas[i];

    // ════ [OFF] - Narração ════
    const offMatch = linha.match(/^\[OFF\s*\d*\]?/i);
    if (offMatch) {
      let textoOff = "";
      let j = i + 1;

      // Coleta todas as linhas até próximo bloco
      while (j < linhas.length) {
        const proximaLinha = linhas[j];
        const ehProximoBloco =
          /^\[(OFF|SONORA|PASSAGEM|IMAGENS|ED_TEXTO|ED_IMAGEM|PRODUÇÃO)\]/i.test(
            proximaLinha
          );
        if (ehProximoBloco) break;

        // Remove aspas
        textoOff += proximaLinha.replace(/^"|"$/g, "") + " ";
        j++;
      }

      const duracao = calcularDuracao(textoOff);
      ultimoOffTimecode = timecodeAcumulado + duracao;

      debug.push(
        `📢 OFF em ${timecodeAcumulado}s - ${duracao}s - "${textoOff.substring(0, 50)}..."`
      );

      timecodeAcumulado += duracao;
      i = j;
      continue;
    }

    // ════ [SONORA] ════
    const sonoraMatch = linha.match(
      /^\[SONORA\]\s*([^-]+)\s*-\s*(.+)$/i
    );
    if (sonoraMatch) {
      const nome = sonoraMatch[1].trim();
      const funcao = sonoraMatch[2].trim();

      let textoSonora = "";
      let j = i + 1;

      while (j < linhas.length) {
        const proximaLinha = linhas[j];
        const ehProximoBloco = /^\[(OFF|SONORA|PASSAGEM|IMAGENS|ED_TEXTO|ED_IMAGEM|PRODUÇÃO)\]/i.test(
          proximaLinha
        );
        if (ehProximoBloco) break;

        textoSonora += proximaLinha.replace(/^"|"$/g, "") + " ";
        j++;
      }

      const duracao = calcularDuracao(textoSonora);

      const credito: CreditoTimecode = {
        nome,
        funcao,
        tipo: "SONORA",
        timecodeInicio: timecodeAcumulado,
        duracaoEstimada: duracao,
      };

      creditos.push(credito);

      debug.push(
        `🎤 SONORA "${nome}" em ${timecodeAcumulado}s - ${duracao}s`
      );

      timecodeAcumulado += duracao;
      i = j;
      continue;
    }

    // ════ [PASSAGEM] ════
    const passagemMatch = linha.match(
      /^\[PASSAGEM\]\s*([^/]+)\s*\/\/\s*(.+)$/i
    );
    if (passagemMatch) {
      const nome = passagemMatch[1].trim();
      const local = passagemMatch[2].trim();

      let textoPassagem = "";
      let j = i + 1;

      while (j < linhas.length) {
        const proximaLinha = linhas[j];
        const ehProximoBloco = /^\[(OFF|SONORA|PASSAGEM|IMAGENS|ED_TEXTO|ED_IMAGEM|PRODUÇÃO)\]/i.test(
          proximaLinha
        );
        if (ehProximoBloco) break;

        textoPassagem += proximaLinha.replace(/^"|"$/g, "") + " ";
        j++;
      }

      const duracao = calcularDuracao(textoPassagem);

      const credito: CreditoTimecode = {
        nome,
        funcao: local,
        tipo: "PASSAGEM",
        timecodeInicio: timecodeAcumulado,
        duracaoEstimada: duracao,
      };

      creditos.push(credito);

      debug.push(
        `👤 PASSAGEM "${nome}" em ${timecodeAcumulado}s - ${duracao}s`
      );

      timecodeAcumulado += duracao;
      i = j;
      continue;
    }

    // ════ [IMAGENS] ════
    const imagensMatch = linha.match(/^\[IMAGENS\]\s*(.+)$/i);
    if (imagensMatch) {
      debug.push(`🖼️ IMAGENS: ${imagensMatch[1]}`);
      i++;
      continue;
    }

    // ════ [ED_TEXTO] ════
    const edTextoMatch = linha.match(/^\[ED_TEXTO\]\s*(.+)$/i);
    if (edTextoMatch) {
      const nome = edTextoMatch[1].trim();
      debug.push(`📝 ED_TEXTO: ${nome} em ${timecodeAcumulado}s`);
      i++;
      continue;
    }

    // ════ [ED_IMAGEM] ════
    const edImagemMatch = linha.match(/^\[ED_IMAGEM\]\s*(.+)$/i);
    if (edImagemMatch) {
      const nome = edImagemMatch[1].trim();
      debug.push(`🖼️ ED_IMAGEM: ${nome} em ${timecodeAcumulado}s`);
      i++;
      continue;
    }

    // ════ [PRODUÇÃO] ════
    const producaoMatch = linha.match(/^\[PRODUÇÃO\]\s*(.+)$/i);
    if (producaoMatch) {
      debug.push(`🎬 PRODUÇÃO: ${producaoMatch[1]} em ${timecodeAcumulado}s`);
      i++;
      continue;
    }

    // Linha não identificada
    debug.push(`⚠️ Linha não parseada: "${linha}"`);
    i++;
  }

  debug.push(`\n📊 Total: ${creditos.length} créditos, duração ${timecodeAcumulado}s`);
  debug.push(`⏰ Último OFF em: ${ultimoOffTimecode}s`);

  return { creditos, ultimoOffTimecode, debug };
}

/**
 * Exibe debug no console
 */
export function exibirDebugParser(debug: string[]) {
  console.group("🎬 PARSER DE CRÉDITOS");
  debug.forEach((msg) => console.log(msg));
  console.groupEnd();
}
