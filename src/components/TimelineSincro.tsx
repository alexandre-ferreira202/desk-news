/**
 * TimelineSincro.tsx
 * 
 * Componente de timeline reutilizável para sincronização de créditos, legendas e eventos.
 * Suporta dois modos:
 * - readOnly=true: Modo visualização com playhead móvel (para estúdio)
 * - readOnly=false: Modo edição com drag/resize (para redação)
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ChevronRight, Trash2, Copy, AlertCircle } from "lucide-react";
import {
  TimelineEvent,
  TimelineSincroProps,
  DragState,
  CORES_EVENTO,
  formatarTempo,
  pixelsParaSegundos,
  segundosParaPixels,
  validarEvento,
  detectarConflitos,
} from "@/types/TimelineEvent";

const TimelineSincro = React.forwardRef<HTMLDivElement, TimelineSincroProps>(
  (
    {
      eventos,
      readOnly = true,
      currentTime = 0,
      onEventChange,
      duracao = 120,
      altura = 200,
      mostrarRegua = true,
      intervaloRegua = 5,
    },
    ref
  ) => {
    // ============================================================================
    // Estados
    // ============================================================================
    const [dragState, setDragState] = useState<DragState>({
      tipoOperacao: null,
      eventId: null,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
    });

    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [scale, setScale] = useState(4); // pixels por segundo
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // ============================================================================
    // Cálculos Derivados
    // ============================================================================
    const pixelsPorSegundo = useMemo(() => scale, [scale]);
    const larguraTimeline = useMemo(
      () => duracao * pixelsPorSegundo,
      [duracao, pixelsPorSegundo]
    );
    const posicaoPlayhead = useMemo(
      () => currentTime * pixelsPorSegundo,
      [currentTime, pixelsPorSegundo]
    );

    const conflitos = useMemo(() => detectarConflitos(eventos), [eventos]);
    const eventoComConflito = useMemo(
      () => conflitos.flatMap((c) => [c.evento1Id, c.evento2Id]),
      [conflitos]
    );

    // ============================================================================
    // Handlers - Edição (readOnly=false)
    // ============================================================================

    const handleMouseDown = useCallback(
      (e: React.MouseEvent<HTMLDivElement>, eventId: string, tipo: "move" | "resizeStart" | "resizeEnd") => {
        if (readOnly) return;

        e.preventDefault();
        e.stopPropagation();

        setSelectedEventId(eventId);
        setDragState({
          tipoOperacao: tipo,
          eventId,
          startX: e.clientX,
          startY: e.clientY,
          offsetX: 0,
          offsetY: 0,
        });
      },
      [readOnly]
    );

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (dragState.tipoOperacao === null || !scrollContainerRef.current) return;

        const offsetX = e.clientX - dragState.startX;
        setDragState((prev) => ({ ...prev, offsetX }));
      },
      [dragState]
    );

    const handleMouseUp = useCallback(() => {
      if (dragState.tipoOperacao === null || !dragState.eventId) {
        setDragState({
          tipoOperacao: null,
          eventId: null,
          startX: 0,
          startY: 0,
          offsetX: 0,
          offsetY: 0,
        });
        return;
      }

      const deltaPixels = dragState.offsetX;
      const deltaSegundos = pixelsParaSegundos(
        deltaPixels,
        pixelsPorSegundo
      );

      const eventoProcurado = eventos.find((e) => e.id === dragState.eventId);
      if (!eventoProcurado) {
        setDragState({
          tipoOperacao: null,
          eventId: null,
          startX: 0,
          startY: 0,
          offsetX: 0,
          offsetY: 0,
        });
        return;
      }

      const eventoAtualizado: TimelineEvent = { ...eventoProcurado };

      if (dragState.tipoOperacao === "move") {
        // Move o evento
        eventoAtualizado.inicio = Math.max(0, eventoAtualizado.inicio + deltaSegundos);
        eventoAtualizado.fim = eventoAtualizado.fim + deltaSegundos;

        // Limita ao final da timeline
        if (eventoAtualizado.fim > duracao) {
          const excesso = eventoAtualizado.fim - duracao;
          eventoAtualizado.inicio -= excesso;
          eventoAtualizado.fim = duracao;
        }
      } else if (dragState.tipoOperacao === "resizeStart") {
        // Redimensiona o início
        eventoAtualizado.inicio = Math.max(
          0,
          Math.min(
            eventoAtualizado.inicio + deltaSegundos,
            eventoAtualizado.fim - 0.1 // Mínimo 0.1 segundos
          )
        );
      } else if (dragState.tipoOperacao === "resizeEnd") {
        // Redimensiona o fim
        eventoAtualizado.fim = Math.min(
          duracao,
          Math.max(
            eventoAtualizado.fim + deltaSegundos,
            eventoAtualizado.inicio + 0.1 // Mínimo 0.1 segundos
          )
        );
      }

      // Valida e atualiza
      if (validarEvento(eventoAtualizado, duracao) && onEventChange) {
        const eventosAtualizados = eventos.map((e) =>
          e.id === eventoAtualizado.id ? eventoAtualizado : e
        );
        onEventChange(eventosAtualizados);
      }

      setDragState({
        tipoOperacao: null,
        eventId: null,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0,
      });
    }, [dragState, eventos, duracao, pixelsPorSegundo, onEventChange]);

    // Attach listeners
    useEffect(() => {
      if (dragState.tipoOperacao !== null) {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
          window.removeEventListener("mousemove", handleMouseMove);
          window.removeEventListener("mouseup", handleMouseUp);
        };
      }
    }, [dragState, handleMouseMove, handleMouseUp]);

    // ============================================================================
    // Handlers - Ações de Eventos
    // ============================================================================

    const handleDuplicarEvento = (id: string) => {
      const evento = eventos.find((e) => e.id === id);
      if (!evento || !onEventChange) return;

      const novoEvento: TimelineEvent = {
        ...evento,
        id: `${evento.id}_copy_${Date.now()}`,
        inicio: evento.fim + 0.5, // Coloca após o evento original
      };

      if (novoEvento.fim + (evento.fim - evento.inicio) > duracao) {
        novoEvento.inicio = duracao - (evento.fim - evento.inicio);
      }
      novoEvento.fim = novoEvento.inicio + (evento.fim - evento.inicio);

      if (validarEvento(novoEvento, duracao)) {
        onEventChange([...eventos, novoEvento]);
      }
    };

    const handleDeletarEvento = (id: string) => {
      if (!onEventChange) return;
      onEventChange(eventos.filter((e) => e.id !== id));
    };

    // ============================================================================
    // Renderização - Régua de Tempo
    // ============================================================================

    const renderRegua = () => {
      if (!mostrarRegua) return null;

      const marcas: React.ReactNode[] = [];

      for (let i = 0; i <= duracao; i += intervaloRegua) {
        const posX = segundosParaPixels(i, pixelsPorSegundo);

        marcas.push(
          <div
            key={`marca-${i}`}
            style={{ left: `${posX}px` }}
            className="absolute top-0 flex flex-col items-center"
          >
            <div className="w-px h-2 bg-gray-600" />
            <span className="text-xs text-gray-500 mt-1 select-none">
              {formatarTempo(i)}
            </span>
          </div>
        );
      }

      return (
        <div className="relative h-8 bg-gray-950 border-b border-gray-800 flex items-start">
          <div
            style={{ width: `${larguraTimeline}px` }}
            className="relative w-full"
          >
            {marcas}
          </div>
        </div>
      );
    };

    // ============================================================================
    // Renderização - Eventos
    // ============================================================================

    const renderEvento = (evento: TimelineEvent) => {
      const esquerda = segundosParaPixels(evento.inicio, pixelsPorSegundo);
      const largura = segundosParaPixels(
        evento.fim - evento.inicio,
        pixelsPorSegundo
      );
      const cores = CORES_EVENTO[evento.tipo];
      const temConflito = eventoComConflito.includes(evento.id);
      const estaMovendo =
        dragState.tipoOperacao === "move" && dragState.eventId === evento.id;
      const estaRedimensionando = dragState.eventId === evento.id && dragState.tipoOperacao !== null;

      const esquerdaAjustada = estaMovendo
        ? esquerda + dragState.offsetX
        : esquerda;
      const larguraAjustada = estaRedimensionando
        ? dragState.tipoOperacao === "resizeEnd"
          ? largura + dragState.offsetX
          : largura - dragState.offsetX
        : largura;

      return (
        <div
          key={evento.id}
          style={{
            left: `${Math.max(0, esquerdaAjustada)}px`,
            width: `${Math.max(40, larguraAjustada)}px`,
          }}
          className={`absolute top-4 h-20 rounded-lg border-2 transition-all cursor-move select-none
            ${cores.bg} ${cores.border}
            ${selectedEventId === evento.id ? "ring-2 ring-cyan-500" : ""}
            ${temConflito ? "ring-2 ring-red-500" : ""}
            ${!readOnly ? "hover:brightness-110" : ""}
          `}
        >
          {/* Handle para mover */}
          {!readOnly && (
            <div
              onMouseDown={(e) => handleMouseDown(e, evento.id, "move")}
              className="absolute inset-0 cursor-grab active:cursor-grabbing rounded-[5px]"
            />
          )}

          {/* Borda esquerda para resize */}
          {!readOnly && (
            <div
              onMouseDown={(e) => handleMouseDown(e, evento.id, "resizeStart")}
              className="absolute left-0 top-0 w-1 h-full bg-blue-500 hover:bg-blue-400 cursor-ew-resize opacity-0 hover:opacity-100 rounded-l-md"
            />
          )}

          {/* Borda direita para resize */}
          {!readOnly && (
            <div
              onMouseDown={(e) => handleMouseDown(e, evento.id, "resizeEnd")}
              className="absolute right-0 top-0 w-1 h-full bg-green-500 hover:bg-green-400 cursor-ew-resize opacity-0 hover:opacity-100 rounded-r-md"
            />
          )}

          {/* Conteúdo do evento */}
          <div
            className="p-2 h-full flex flex-col justify-between relative z-10 pointer-events-none"
            onClick={(e) => {
              e.stopPropagation();
              if (!readOnly) {
                setSelectedEventId(evento.id);
              }
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className={`text-xs font-bold uppercase tracking-wider ${cores.text}`}>
                  {evento.tipo}
                </div>
                <div className={`text-xs mt-1 line-clamp-2 ${cores.text}`}>
                  {evento.texto}
                </div>
              </div>
              {temConflito && (
                <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0 ml-1" />
              )}
            </div>

            <div className={`text-xs ${cores.text} opacity-75`}>
              {formatarTempo(evento.inicio)}
              {" – "}
              {formatarTempo(evento.fim)}
            </div>
          </div>
        </div>
      );
    };

    // ============================================================================
    // Renderização - Painel de Detalhes (Modo Edição)
    // ============================================================================

    const renderPainelDetalhes = () => {
      if (readOnly || !selectedEventId) return null;

      const evento = eventos.find((e) => e.id === selectedEventId);
      if (!evento) return null;

      return (
        <div className="border-t border-gray-800 bg-gray-950 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Detalhes do Evento
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleDuplicarEvento(evento.id)}
                className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                title="Duplicar evento"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeletarEvento(evento.id)}
                className="p-1.5 rounded hover:bg-red-950 text-gray-400 hover:text-red-400 transition-colors"
                title="Deletar evento"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Tipo</label>
              <div className="text-sm font-semibold text-gray-200 mt-1">
                {evento.tipo}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Início</label>
              <div className="text-sm font-semibold text-gray-200 mt-1">
                {formatarTempo(evento.inicio)}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Fim</label>
              <div className="text-sm font-semibold text-gray-200 mt-1">
                {formatarTempo(evento.fim)}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Duração</label>
              <div className="text-sm font-semibold text-gray-200 mt-1">
                {formatarTempo(evento.fim - evento.inicio)}
              </div>
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs text-gray-500 uppercase tracking-wider">Texto</label>
            <div className="text-sm text-gray-300 mt-1 p-2 bg-gray-900 rounded border border-gray-800">
              {evento.texto}
            </div>
          </div>

          {conflitos.length > 0 && (
            <div className="mt-3 p-2 bg-red-950/50 border border-red-700/50 rounded flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-300">
                Este evento sobrepõe outro evento de mesmo tipo. Considere ajustar os tempos.
              </div>
            </div>
          )}
        </div>
      );
    };

    // ============================================================================
    // Render Principal
    // ============================================================================

    return (
      <div
        ref={ref}
        className="flex flex-col h-full bg-black border border-gray-800 rounded-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Timeline de Sincronização
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {eventos.length} eventos • Duração: {formatarTempo(duracao)}
              {currentTime !== undefined && ` • Tempo: ${formatarTempo(currentTime)}`}
            </p>
          </div>

          {!readOnly && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Zoom</label>
              <input
                type="range"
                min="1"
                max="10"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-32 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-gray-400 w-8">{scale}px/s</span>
            </div>
          )}
        </div>

        {/* Régua */}
        {renderRegua()}

        {/* Timeline Container */}
        <div
          ref={scrollContainerRef}
          className="flex-1 relative overflow-x-auto overflow-y-hidden bg-gray-900 border-t border-gray-800"
          style={{ minHeight: `${altura - 40}px` }}
        >
          <div
            ref={containerRef}
            style={{
              width: `${larguraTimeline}px`,
              minHeight: "100%",
              position: "relative",
            }}
            className="relative bg-gradient-to-b from-gray-900 to-black"
          >
            {/* Grade de referência */}
            {!readOnly && (
              <>
                {Array.from({ length: Math.ceil(duracao / intervaloRegua) }).map(
                  (_, i) => (
                    <div
                      key={`grid-${i}`}
                      style={{
                        left: `${segundosParaPixels(
                          i * intervaloRegua,
                          pixelsPorSegundo
                        )}px`,
                      }}
                      className="absolute inset-y-0 w-px bg-gray-800/30"
                    />
                  )
                )}
              </>
            )}

            {/* Eventos */}
            {eventos.map(renderEvento)}

            {/* Playhead (Modo visualização) */}
            {readOnly && (
              <div
                style={{ left: `${posicaoPlayhead}px` }}
                className="absolute top-0 bottom-0 w-1 bg-red-500 shadow-lg shadow-red-500/50 pointer-events-none transition-all z-50"
              >
                <div className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 rounded-full shadow-lg shadow-red-500/50" />
              </div>
            )}

            {/* Placeholder para timeline vazia */}
            {eventos.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <ChevronRight className="w-12 h-12 text-gray-700 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    {readOnly
                      ? "Nenhum evento para exibir"
                      : "Adicione eventos à timeline"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Painel de Detalhes (Edição) */}
        {renderPainelDetalhes()}
      </div>
    );
  }
);

TimelineSincro.displayName = "TimelineSincro";

export default TimelineSincro;
