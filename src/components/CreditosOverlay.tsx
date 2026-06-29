/**
 * CreditosOverlay.tsx
 * ════════════════════════════════════════════════════════════════════════════
 * Componente que exibe créditos sincronizados com o vídeo em tempo real
 * ════════════════════════════════════════════════════════════════════════════
 */

import React from "react";
import { CreditoAtivo } from "./TimecodeSync";

interface CreditosOverlayProps {
  creditosAtivos: CreditoAtivo[];
  timecodeAtual: number;
  zIndex?: number;
  posicao?: "cima" | "centro" | "baixo";
  tamanho?: "pequeno" | "medio" | "grande";
  autoFade?: boolean;
}

export const CreditosOverlay: React.FC<CreditosOverlayProps> = ({
  creditosAtivos,
  timecodeAtual,
  zIndex = 100,
  posicao = "baixo",
  tamanho = "medio",
  autoFade = true,
}) => {
  const getTamanhoCss = () => {
    switch (tamanho) {
      case "pequeno":
        return {
          fontSize: "14px",
          padding: "8px 16px",
          gap: "8px",
        };
      case "grande":
        return {
          fontSize: "20px",
          padding: "16px 24px",
          gap: "12px",
        };
      default:
        return {
          fontSize: "16px",
          padding: "12px 20px",
          gap: "10px",
        };
    }
  };

  const getPosicaoCss = () => {
    switch (posicao) {
      case "cima":
        return {
          top: "20px",
          bottom: "auto",
        };
      case "centro":
        return {
          top: "50%",
          bottom: "auto",
          transform: "translateY(-50%)",
        };
      default:
        return {
          bottom: "20px",
          top: "auto",
        };
    }
  };

  const tamanhoCss = getTamanhoCss();
  const posicaoCss = getPosicaoCss();

  return (
    <div
      className="fixed left-1/2 pointer-events-none"
      style={{
        zIndex,
        transform: "translateX(-50%)",
        ...posicaoCss,
      }}
    >
      {creditosAtivos.length === 0 ? null : (
        <div className="flex flex-col gap-2">
          {creditosAtivos.map((ativo, idx) => {
            // Calcula opacidade com fade-in e fade-out
            let opacity = 1;
            if (autoFade) {
              const duracao = ativo.credito.duracaoEstimada || 4;
              const fadeDuration = 0.3; // 300ms para fade
              const tempoFadeIn = ativo.tempoDecorrido / fadeDuration;
              const tempoFadeOut =
                (duracao - ativo.tempoDecorrido) / fadeDuration;

              if (tempoFadeIn < 1) opacity = Math.min(tempoFadeIn, 1);
              if (tempoFadeOut < 1) opacity = Math.min(tempoFadeOut, opacity);
            }

            return (
              <div
                key={`${ativo.credito.nome}@${ativo.credito.timecodeInicio}`}
                className="backdrop-blur-sm bg-black/60 rounded-lg border border-white/20 text-white text-center whitespace-nowrap shadow-lg"
                style={{
                  ...tamanhoCss,
                  opacity: Math.max(0, Math.min(1, opacity)),
                  transition: "opacity 100ms ease-out",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div className="font-bold">
                  {ativo.credito.nome}
                </div>
                <div className="text-sm opacity-80">
                  {ativo.credito.funcao}
                </div>

                {/* Barra de progresso */}
                {ativo.credito.duracaoEstimada && ativo.credito.duracaoEstimada > 0 && (
                  <div className="w-32 h-0.5 bg-white/20 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-cyan-400"
                      style={{
                        width: `${ativo.percentualExibicao}%`,
                        transition: "width 100ms linear",
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Debug info (remover em produção) */}
      {process.env.NODE_ENV === "development" && (
        <div
          className="text-white text-[10px] mt-2 text-center font-mono"
          style={{ opacity: 0.5 }}
        >
          🎬 {creditosAtivos.length} créditos | ⏱️{" "}
          {Math.floor(timecodeAtual * 1000) / 1000}s
        </div>
      )}
    </div>
  );
};

/**
 * Variante alternativa: Créditos em overlay centralizado (mais cinematográfico)
 */
export const CreditosCinematografico: React.FC<CreditosOverlayProps> = ({
  creditosAtivos,
  timecodeAtual,
  zIndex = 100,
  autoFade = true,
}) => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex }}
    >
      {creditosAtivos.length === 0 ? null : (
        <div className="text-center space-y-4">
          {creditosAtivos.map((ativo, idx) => {
            let opacity = 1;
            if (autoFade) {
              const duracao = ativo.credito.duracaoEstimada || 4;
              const fadeDuration = 0.3;
              const tempoFadeIn = ativo.tempoDecorrido / fadeDuration;
              const tempoFadeOut =
                (duracao - ativo.tempoDecorrido) / fadeDuration;

              if (tempoFadeIn < 1) opacity = Math.min(tempoFadeIn, 1);
              if (tempoFadeOut < 1) opacity = Math.min(tempoFadeOut, opacity);
            }

            return (
              <div
                key={`${ativo.credito.nome}@${ativo.credito.timecodeInicio}`}
                className="text-white text-center"
                style={{
                  opacity: Math.max(0, Math.min(1, opacity)),
                  transition: "opacity 100ms ease-out",
                  textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                }}
              >
                <div className="text-2xl font-bold uppercase">
                  {ativo.credito.nome}
                </div>
                <div className="text-lg opacity-90 mt-1">
                  {ativo.credito.funcao}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * Variante para lista de créditos na lateral
 */
export const CreditosLateral: React.FC<CreditosOverlayProps & {
  maxWidth?: number;
}> = ({ creditosAtivos, timecodeAtual, zIndex = 100, maxWidth = 280 }) => {
  return (
    <div
      className="fixed right-4 top-20 rounded-lg border border-white/20 bg-black/70 backdrop-blur-sm p-4"
      style={{ zIndex, maxWidth, maxHeight: "400px", overflowY: "auto" }}
    >
      <div className="text-white text-sm space-y-2">
        <div className="font-bold uppercase text-xs opacity-60 mb-2">
          Créditos Ativos
        </div>

        {creditosAtivos.length === 0 ? (
          <div className="text-xs opacity-40">Nenhum crédito</div>
        ) : (
          creditosAtivos.map((ativo) => (
            <div
              key={`${ativo.credito.nome}@${ativo.credito.timecodeInicio}`}
              className="border-l-2 border-blue-400 pl-2 py-1"
            >
              <div className="font-semibold text-xs">{ativo.credito.nome}</div>
              <div className="text-[10px] opacity-70">
                {ativo.credito.funcao}
              </div>
              <div className="text-[9px] opacity-50 mt-0.5">
                {(ativo.percentualExibicao / 100).toFixed(0)}% •{" "}
                {ativo.tempoDecorrido.toFixed(1)}s
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
