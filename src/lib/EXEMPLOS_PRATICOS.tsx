// ════════════════════════════════════════════════════════════════════════════════
// 📋 EXEMPLOS PRÁTICOS: Cálculo Automático de Timecodes
// ════════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// EXEMPLO 1: Uso Básico em React
// ═══════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';

function ExemploBasico() {
  const [duracaoVT, setDuracaoVT] = useState<number | null>(null);

  // Extrai duração do vídeo
  const handleVideoUpload = async (file: File) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      setDuracaoVT(Math.round(video.duration));
      console.log(`✅ VT carregado: ${video.duration}s`);
    };

    video.src = url;
  };

  return (
    <div>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleVideoUpload(file);
        }}
      />
      {duracaoVT && <p>Duração: {duracaoVT} segundos</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXEMPLO 2: Parsear Lauda com [SONORA] e [PASSAGEM]
// ═══════════════════════════════════════════════════════════════════════════════

interface ItemLauda {
  tipo: 'SONORA' | 'PASSAGEM';
  nome: string;
  posicaoPalavras: number;
  timecodeSegundos: number;
}

const exemploLauda = `
[SONORA]
(João Silva)
(Entrevistado)
"Aqui é o depoimento do João que dura alguns segundos"

[PASSAGEM]
(Repórter)
(Rua das Flores)
"Estou aqui no local dos fatos relatando a situação"

[SONORA]
(Maria Santos)
(Testemunha)
"Eu estava passando e vi tudo acontecer"
`;

function parsearLauda(texto: string): ItemLauda[] {
  const linhas = texto.split('\n').map((l) => l.trim()).filter((l) => l);
  const itens: ItemLauda[] = [];
  let posicaoAtual = 0;

  let i = 0;
  while (i < linhas.length) {
    const linha = linhas[i];

    // 🎤 SONORA
    if (linha === '[SONORA]') {
      let nome = '';
      let tipo = 'SONORA' as const;

      // Nome
      if (i + 1 < linhas.length && linhas[i + 1].startsWith('(')) {
        nome = linhas[i + 1].slice(1, -1);
        i++;
      }

      // Função (não usamos agora, mas poderia)
      if (i + 1 < linhas.length && linhas[i + 1].startsWith('(')) {
        i++; // Pula a função
      }

      if (nome) {
        itens.push({
          tipo,
          nome,
          posicaoPalavras: posicaoAtual,
          timecodeSegundos: 0, // Será calculado
        });
      }
    }

    // 📍 PASSAGEM
    if (linha === '[PASSAGEM]') {
      let nome = '';
      let tipo = 'PASSAGEM' as const;

      if (i + 1 < linhas.length && linhas[i + 1].startsWith('(')) {
        nome = linhas[i + 1].slice(1, -1);
        i++;
      }

      if (i + 1 < linhas.length && linhas[i + 1].startsWith('(')) {
        i++;
      }

      if (nome) {
        itens.push({
          tipo,
          nome,
          posicaoPalavras: posicaoAtual,
          timecodeSegundos: 0,
        });
      }
    }

    // Contar palavras
    if (!linha.startsWith('[') && !linha.startsWith('(') && !linha.startsWith('"')) {
      const palavras = linha.split(/\s+/).filter((p) => p).length;
      posicaoAtual += palavras;
    }

    i++;
  }

  return itens;
}

// Teste
const sonorasEPassagens = parsearLauda(exemploLauda);
console.log('Itens encontrados:', sonorasEPassagens);

// ═══════════════════════════════════════════════════════════════════════════════
// EXEMPLO 3: Calcular Timecodes Automaticamente
// ═══════════════════════════════════════════════════════════════════════════════

function calcularTimecodes(
  itens: ItemLauda[],
  duracaoVTSegundos: number,
  totalPalavrasLauda: number
): ItemLauda[] {
  return itens.map((item) => ({
    ...item,
    timecodeSegundos: Math.round(
      (item.posicaoPalavras / totalPalavrasLauda) * duracaoVTSegundos
    ),
  }));
}

// Exemplo:
// VT com 120 segundos
// Lauda com 1200 palavras
const duracaoVT = 120;
const totalPalavras = 1200;
const timecodes = calcularTimecodes(sonorasEPassagens, duracaoVT, totalPalavras);

console.log('Timecodes calculados:');
timecodes.forEach((item) => {
  const mm = Math.floor(item.timecodeSegundos / 60);
  const ss = item.timecodeSegundos % 60;
  console.log(
    `${item.tipo}: ${item.nome} → ${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// EXEMPLO 4: Formatador de Timecode
// ═══════════════════════════════════════════════════════════════════════════════

function formatarTimecode(segundos: number): string {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segs = segundos % 60;

  if (horas > 0) {
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
  }

  return `${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
}

console.log(formatarTimecode(5));        // 00:05
console.log(formatarTimecode(65));       // 01:05
console.log(formatarTimecode(3661));     // 01:01:01

// ═══════════════════════════════════════════════════════════════════════════════
// EXEMPLO 5: Componente React Completo
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';

interface TimecodeItem {
  tipo: 'SONORA' | 'PASSAGEM' | 'IMAGENS';
  nome: string;
  funcao?: string;
  posicaoPalavras: number;
  timecodeCalculado: string;
}

interface AnaliseCompleta {
  duracaoVT: number;
  totalPalavras: number;
  itens: TimecodeItem[];
}

function ComponenteCompleto() {
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [duracaoVT, setDuracaoVT] = React.useState<number | null>(null);
  const [laudaTexto, setLaudaTexto] = React.useState('');
  const [analise, setAnalise] = React.useState<AnaliseCompleta | null>(null);

  const extrairDuracao = async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(Math.round(video.duration));
      };

      video.onerror = () => reject(new Error('Erro ao ler vídeo'));
      video.src = url;
    });
  };

  const handleVideoChange = async (file: File) => {
    try {
      const duracao = await extrairDuracao(file);
      setVideoFile(file);
      setDuracaoVT(duracao);
    } catch (err) {
      console.error(err);
    }
  };

  const processar = () => {
    if (!duracaoVT) return;

    // Parser simplificado
    const itens: TimecodeItem[] = [];
    const linhas = laudaTexto.split('\n');
    let palavrasCont = 0;

    linhas.forEach((linha, idx) => {
      if (linha.includes('[SONORA]')) {
        const nome = linhas[idx + 1]?.replace(/[()]/g, '') || 'Sonora';
        itens.push({
          tipo: 'SONORA',
          nome,
          posicaoPalavras: palavrasCont,
          timecodeCalculado: formatarTimecode(
            Math.round((palavrasCont / laudaTexto.split(/\s+/).length) * duracaoVT)
          ),
        });
      }

      if (linha.includes('[PASSAGEM]')) {
        const nome = linhas[idx + 1]?.replace(/[()]/g, '') || 'Passagem';
        itens.push({
          tipo: 'PASSAGEM',
          nome,
          posicaoPalavras: palavrasCont,
          timecodeCalculado: formatarTimecode(
            Math.round((palavrasCont / laudaTexto.split(/\s+/).length) * duracaoVT)
          ),
        });
      }

      palavrasCont += linha.split(/\s+/).length;
    });

    setAnalise({
      duracaoVT,
      totalPalavras: laudaTexto.split(/\s+/).length,
      itens,
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🎬 Calculadora de Timecodes</h1>

      <div>
        <h2>VT</h2>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleVideoChange(file);
          }}
        />
        {duracaoVT && <p>✅ Duração: {formatarTimecode(duracaoVT)}</p>}
      </div>

      <div>
        <h2>Lauda</h2>
        <textarea
          value={laudaTexto}
          onChange={(e) => setLaudaTexto(e.target.value)}
          placeholder="Cole a lauda aqui..."
          style={{ width: '100%', height: '200px' }}
        />
      </div>

      <button onClick={processar} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Calcular
      </button>

      {analise && (
        <div>
          <h2>Resultados</h2>
          <p>Duração: {formatarTimecode(analise.duracaoVT)}</p>
          <p>Palavras: {analise.totalPalavras}</p>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <th>Tipo</th>
                <th>Nome</th>
                <th>Timecode</th>
              </tr>
            </thead>
            <tbody>
              {analise.itens.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.tipo}</td>
                  <td>{item.nome}</td>
                  <td>{item.timecodeCalculado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXEMPLO 6: Hook Customizado para Timecodes
// ═══════════════════════════════════════════════════════════════════════════════

function useTimecodeCalculator() {
  const [duracaoVT, setDuracaoVT] = React.useState<number | null>(null);
  const [timecodes, setTimecodes] = React.useState<TimecodeItem[]>([]);

  const extrairDuracao = async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        const duracao = Math.round(video.duration);
        setDuracaoVT(duracao);
        resolve(duracao);
      };

      video.onerror = () => reject(new Error('Erro ao ler vídeo'));
      video.src = url;
    });
  };

  const calcular = (lauda: string) => {
    if (!duracaoVT) return [];

    // Lógica de parser + cálculo
    const itens: TimecodeItem[] = [];
    // ... implementação
    setTimecodes(itens);
    return itens;
  };

  return { duracaoVT, timecodes, extrairDuracao, calcular };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXEMPLO 7: Exportar para JSON/CSV
// ═══════════════════════════════════════════════════════════════════════════════

function exportarTimecodes(itens: TimecodeItem[], formato: 'json' | 'csv') {
  if (formato === 'json') {
    const json = JSON.stringify(itens, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    downloadArquivo(blob, 'timecodes.json');
  }

  if (formato === 'csv') {
    const csv = [
      'Tipo,Nome,Timecode,Palavra',
      ...itens.map((i) => `${i.tipo},${i.nome},${i.timecodeCalculado},${i.posicaoPalavras}`),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    downloadArquivo(blob, 'timecodes.csv');
  }
}

function downloadArquivo(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXEMPLO 8: Validação de Lauda
// ═══════════════════════════════════════════════════════════════════════════════

interface ErroValidacao {
  linha: number;
  tipo: 'erro' | 'aviso';
  mensagem: string;
}

function validarLauda(texto: string): ErroValidacao[] {
  const erros: ErroValidacao[] = [];
  const linhas = texto.split('\n');

  linhas.forEach((linha, idx) => {
    // Verificar sonorasEPassagens sem nome
    if (linha.includes('[SONORA]') && !linhas[idx + 1]?.startsWith('(')) {
      erros.push({
        linha: idx + 1,
        tipo: 'erro',
        mensagem: 'SONORA sem nome na linha seguinte',
      });
    }

    // Verificar texto sem aspas
    if (
      (linha.includes('[SONORA]') || linha.includes('[PASSAGEM]')) &&
      !linhas.slice(idx + 3, idx + 6).some((l) => l.startsWith('"'))
    ) {
      erros.push({
        linha: idx + 1,
        tipo: 'aviso',
        mensagem: 'Verifique se há texto entre aspas',
      });
    }
  });

  return erros;
}

// Teste
const errosDaLauda = validarLauda(exemploLauda);
console.log('Erros encontrados:', errosDaLauda);

// ═══════════════════════════════════════════════════════════════════════════════
// EXEMPLO 9: Cache de Durações
// ═══════════════════════════════════════════════════════════════════════════════

class CacheTimecodes {
  private cache = new Map<string, { duracao: number; timestamp: number }>();
  private TTL = 1000 * 60 * 60; // 1 hora

  set(chave: string, duracao: number) {
    this.cache.set(chave, { duracao, timestamp: Date.now() });
  }

  get(chave: string): number | null {
    const valor = this.cache.get(chave);
    if (!valor) return null;

    if (Date.now() - valor.timestamp > this.TTL) {
      this.cache.delete(chave);
      return null;
    }

    return valor.duracao;
  }

  limpar() {
    this.cache.clear();
  }
}

const cache = new CacheTimecodes();
cache.set('vt_001', 120);
console.log(cache.get('vt_001')); // 120

// ═══════════════════════════════════════════════════════════════════════════════
// RESUMO: O que você tem agora
// ═══════════════════════════════════════════════════════════════════════════════

/*
✅ EXEMPLO 1: Upload básico de vídeo
✅ EXEMPLO 2: Parser de lauda com [SONORA]/[PASSAGEM]
✅ EXEMPLO 3: Cálculo proporcional de timecodes
✅ EXEMPLO 4: Formatação de timecodes (MM:SS)
✅ EXEMPLO 5: Componente React completo
✅ EXEMPLO 6: Hook customizado
✅ EXEMPLO 7: Exportar dados
✅ EXEMPLO 8: Validação de lauda
✅ EXEMPLO 9: Cache para performance

USE COMO BASE PARA SEU PLAYOUT!
*/

export {
  ExemploBasico,
  ComponenteCompleto,
  useTimecodeCalculator,
  parsearLauda,
  calcularTimecodes,
  formatarTimecode,
  exportarTimecodes,
  validarLauda,
  CacheTimecodes,
};
