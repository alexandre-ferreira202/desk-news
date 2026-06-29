/**
 * 📊 COMPONENTE: PAINEL DE ANÁLISE DO ROTEIRO
 * Exibe estatísticas, timecodes e sugestão de inserção de créditos
 * 
 * Uso no redacao.tsx:
 * <RoteiroAnalysisPanel 
 *   estrutura={estrutura} 
 *   tempoVt={tempoVt}
 * />
 */

import React, { useMemo } from "react";
import {
  analisarRoteiro,
  AnaliseRoteiro,
  segundosParaTempo,
  contarPalavras,
} from "./vt-timecode-calculator";
import { Clock, FileText, Zap, AlertCircle, CheckCircle2 } from "lucide-react";

interface RoteiroAnalysisPanelProps {
  estrutura: string;
  tempoVt: string;
  onAnalysisChange?: (analise: AnaliseRoteiro) => void;
}

export function RoteiroAnalysisPanel({
  estrutura,
  tempoVt,
  onAnalysisChange,
}: RoteiroAnalysisPanelProps) {
  // Realiza análise memoizada (recalcula apenas quando estrutura ou tempoVt mudam)
  const analise = useMemo(() => {
    const result = analisarRoteiro(estrutura, tempoVt);
    onAnalysisChange?.(result);
    return result;
  }, [estrutura, tempoVt, onAnalysisChange]);

  // Determina avisos
  const avisos: { tipo: "warning" | "error" | "info"; mensagem: string }[] = [];

  if (!tempoVt) {
    avisos.push({
      tipo: "warning",
      mensagem: "Informe o tempo do VT para cálculos precisos",
    });
  }

  if (analise.totalPalavras === 0) {
    avisos.push({
      tipo: "warning",
      mensagem: "Nenhuma palavra detectada no roteiro",
    });
  }

  // Velocidade de fala padrão: 2.5 palavras/segundo (com pausas)
  const velocidadeRecomendada = 2.5;
  if (
    analise.velocidadePalavrasSegundo > velocidadeRecomendada * 1.2
  ) {
    avisos.push({
      tipo: "warning",
      mensagem: `⚡ Velocidade alta (${analise.velocidadePalavrasSegundo.toFixed(1)} pal/s). Recomendado até ${velocidadeRecomendada} pal/s`,
    });
  }

  if (
    analise.velocidadePalavrasSegundo < velocidadeRecomendada * 0.7 &&
    analise.totalPalavras > 0
  ) {
    avisos.push({
      tipo: "info",
      mensagem: `🐌 Velocidade baixa. Conteúdo pode ficar arrastado`,
    });
  }

  return (
    <div className="bg-gradient-to-br from-[#141416] to-[#0a0a0a] border border-[#22c55e]/20 rounded-lg p-4 space-y-4 shadow-lg border-l-[3px] border-l-[#22c55e]">
      {/* HEADER */}
      <div className="flex items-center gap-2 border-b border-[#22c55e]/10 pb-3">
        <FileText className="h-4 w-4 text-[#22c55e]" />
        <h3 className="text-sm font-bold text-[#9ca3af] uppercase tracking-wider">
          📊 Análise do Roteiro Técnico
        </h3>
      </div>

      {/* GRID DE ESTATÍSTICAS PRINCIPAIS */}
      <div className="grid grid-cols-4 gap-2">
        {/* Duração VT */}
        <div className="bg-[#1a1a1d] border border-[#22c55e]/20 rounded-lg p-2.5">
          <div className="text-[9px] font-bold text-[#6b7280] uppercase mb-1">
            ⏱️ Duração VT
          </div>
          <div className="text-lg font-bold text-[#22c55e] font-mono">
            {analise.duracaoVTFormatada}
          </div>
          <div className="text-[9px] text-[#4b5563]">
            {analise.duracaoVTSegundos}s
          </div>
        </div>

        {/* Total de Palavras */}
        <div className="bg-[#1a1a1d] border border-[#22c55e]/20 rounded-lg p-2.5">
          <div className="text-[9px] font-bold text-[#6b7280] uppercase mb-1">
            📝 Palavras
          </div>
          <div className="text-lg font-bold text-[#22c55e] font-mono">
            {analise.totalPalavras}
          </div>
          <div className="text-[9px] text-[#4b5563]">
            {analise.totalLinhas} linhas
          </div>
        </div>

        {/* Velocidade de Fala */}
        <div className="bg-[#1a1a1d] border border-[#22c55e]/20 rounded-lg p-2.5">
          <div className="text-[9px] font-bold text-[#6b7280] uppercase mb-1">
            ⚡ Velocidade
          </div>
          <div className="text-lg font-bold text-[#22c55e] font-mono">
            {analise.velocidadePalavrasSegundo.toFixed(1)}
          </div>
          <div className="text-[9px] text-[#4b5563]">
            palavras/seg
          </div>
        </div>

        {/* Elementos */}
        <div className="bg-[#1a1a1d] border border-[#22c55e]/20 rounded-lg p-2.5">
          <div className="text-[9px] font-bold text-[#6b7280] uppercase mb-1">
            🎬 Elementos
          </div>
          <div className="text-lg font-bold text-[#22c55e] font-mono">
            {analise.elementos.length}
          </div>
          <div className="text-[9px] text-[#4b5563]">
            detectados
          </div>
        </div>
      </div>

      {/* AVISOS E ALERTAS */}
      {avisos.length > 0 && (
        <div className="space-y-2 border-t border-[#22c55e]/10 pt-3">
          {avisos.map((aviso, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 text-[11px] rounded-lg p-2 ${
                aviso.tipo === "error"
                  ? "bg-red-500/10 text-red-300 border border-red-500/20"
                  : aviso.tipo === "warning"
                    ? "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20"
                    : "bg-blue-500/10 text-blue-300 border border-blue-500/20"
              }`}
            >
              {aviso.tipo === "error" ? (
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              ) : aviso.tipo === "warning" ? (
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" />
              )}
              <span>{aviso.mensagem}</span>
            </div>
          ))}
        </div>
      )}

      {/* INSERÇÃO DE CRÉDITOS */}
      <div className="bg-[#1a1a1d] border border-[#22c55e]/20 rounded-lg p-3 border-l-[3px] border-l-[#22c55e]">
        <div className="text-[9px] font-bold text-[#6b7280] uppercase mb-3">
          🎞️ Sugestão de Inserção de Créditos
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Entrada */}
          <div>
            <div className="text-[8px] text-[#4b5563] mb-1">ENTRADA</div>
            <div className="bg-[#0a0a0a] border border-[#22c55e]/30 rounded p-2 text-center">
              <div className="font-mono font-bold text-[#22c55e] text-sm">
                {analise.creditsInsercao.tempoEntradaCreditsFormatado}
              </div>
              <div className="text-[8px] text-[#4b5563]">
                {analise.creditsInsercao.percentualEntrada}%
              </div>
            </div>
          </div>

          {/* Saída */}
          <div>
            <div className="text-[8px] text-[#4b5563] mb-1">SAÍDA</div>
            <div className="bg-[#0a0a0a] border border-[#22c55e]/30 rounded p-2 text-center">
              <div className="font-mono font-bold text-[#22c55e] text-sm">
                {analise.creditsInsercao.tempoSaidaCreditsFormatado}
              </div>
              <div className="text-[8px] text-[#4b5563]">
                {analise.creditsInsercao.percentualSaida}%
              </div>
            </div>
          </div>

          {/* Duração */}
          <div>
            <div className="text-[8px] text-[#4b5563] mb-1">DURAÇÃO</div>
            <div className="bg-[#0a0a0a] border border-[#22c55e]/30 rounded p-2 text-center">
              <div className="font-mono font-bold text-[#22c55e] text-sm">
                {analise.creditsInsercao.duracacaoCredits}s
              </div>
              <div className="text-[8px] text-[#4b5563]">créditos</div>
            </div>
          </div>
        </div>

        {/* Visualização da linha do tempo */}
        <div className="mt-3">
          <div className="text-[8px] text-[#4b5563] mb-1.5">LINHA DO TEMPO DO VT</div>
          <div className="relative h-6 bg-[#0a0a0a] border border-[#22c55e]/20 rounded overflow-hidden">
            {/* Barra de progresso */}
            <div
              className="absolute h-full bg-gradient-to-r from-[#22c55e]/20 via-[#22c55e]/50 to-[#22c55e]/20"
              style={{
                left: `${analise.creditsInsercao.percentualEntrada}%`,
                right: `${100 - analise.creditsInsercao.percentualSaida}%`,
              }}
            />
            
            {/* Marcadores */}
            <div className="absolute h-full flex items-center justify-between px-2">
              <div className="text-[7px] font-bold text-[#22c55e]">Início</div>
              <div className="text-[7px] font-bold text-[#22c55e]">Fim</div>
            </div>

            {/* Pontos de entrada e saída */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-[#22c55e] shadow-lg"
              style={{ left: `${analise.creditsInsercao.percentualEntrada}%` }}
              title={`Entrada: ${analise.creditsInsercao.tempoEntradaCreditsFormatado}`}
            />
            <div
              className="absolute top-0 bottom-0 w-1 bg-[#22c55e]"
              style={{ left: `${analise.creditsInsercao.percentualSaida}%` }}
              title={`Saída: ${analise.creditsInsercao.tempoSaidaCreditsFormatado}`}
            />
          </div>
        </div>
      </div>

      {/* LISTA DE ELEMENTOS */}
      {analise.elementos.length > 0 && (
        <div className="border-t border-[#22c55e]/10 pt-3">
          <div className="text-[9px] font-bold text-[#6b7280] uppercase mb-2">
            🎬 Elementos Detectados
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {analise.elementos.map((elem, idx) => (
              <div
                key={idx}
                className="bg-[#0a0a0a] border border-[#22c55e]/10 rounded px-2 py-1.5 flex items-center justify-between text-[10px]"
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-bold text-[#22c55e] min-w-fit">
                    [{elem.tipo}
                    {elem.numero && ` ${elem.numero}`}]
                  </span>
                  {elem.nome && (
                    <span className="text-[#9ca3af]">{elem.nome}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#4b5563] font-mono">
                    {elem.palavras}pal
                  </span>
                  <span className="text-[#22c55e] font-mono font-bold min-w-fit">
                    {elem.timecodeFormatado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INSTRUÇÕES */}
      <div className="bg-[#1a1a1d] border border-[#22c55e]/10 rounded p-2 text-[9px] text-[#6b7280]">
        <p>
          💡 <strong>DICA:</strong> Os timecodes são calculados automaticamente
          baseado na posição das palavras no roteiro. Créditos devem entrar
          quando o VT ainda tem ação para não competir com foco visual.
        </p>
      </div>
    </div>
  );
}

export default RoteiroAnalysisPanel;
