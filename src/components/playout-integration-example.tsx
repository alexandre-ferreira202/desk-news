/**
 * EXEMPLO DE INTEGRAÇÃO NO playout.tsx
 * 
 * Adicionar este código na página de controle de estúdio para exibir
 * a timeline de sincronização com playhead móvel em tempo real.
 * 
 * Este exemplo mostra como:
 * 1. Importar o componente TimelineSincro em modo readOnly
 * 2. Sincronizar currentTime com o player de vídeo
 * 3. Exibir o playhead móvel conforme o vídeo é reproduzido
 * 4. Atualizar em tempo real
 */

// ============================================================================
// IMPORTS (Adicionar ao topo do arquivo playout.tsx)
// ============================================================================

import TimelineSincro from "@/components/TimelineSincro";
import {
  TimelineEvent,
  TimelineState,
  formatarTempo,
} from "@/types/TimelineEvent";

// ============================================================================
// COMPONENTE: MONITOR DE TIMELINE NO STUDIO
// ============================================================================

/**
 * Componente para monitorar a timeline de sincronização durante a exibição
 * Atualiza o playhead em tempo real conforme o vídeo avança
 */
function PlayoutTimelineMonitor({
  materia,
  currentTime = 0,
  isPlaying = false,
}: {
  /** Dados da matéria com timeline JSON */
  materia: {
    id: string;
    titulo: string;
    timeline_json?: string | null;
    duracao_vt?: number | null;
  };
  
  /** Tempo atual do vídeo em segundos */
  currentTime: number;
  
  /** Se o vídeo está em reprodução */
  isPlaying: boolean;
}) {
  // ========================================================================
  // Estados e Refs
  // ========================================================================

  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(() => {
    if (materia.timeline_json) {
      try {
        const timelineState = JSON.parse(materia.timeline_json) as TimelineState;
        return timelineState.eventos || [];
      } catch {
        console.error("Erro ao parseear timeline JSON");
        return [];
      }
    }
    return [];
  });

  const [duracaoVT] = useState<number>(materia.duracao_vt || 120);

  // ========================================================================
  // Efeitos
  // ========================================================================

  /** Auto-scroll para manter playhead visível */
  useEffect(() => {
    if (timelineRef.current?.querySelector(".flex-1")) {
      const scrollContainer = timelineRef.current.querySelector(
        "[class*='overflow-x-auto']"
      ) as HTMLDivElement;

      if (scrollContainer) {
        const pixelsPorSegundo = 4; // padrão
        const posicaoPlayhead = currentTime * pixelsPorSegundo;

        // Mantém o playhead no meio da tela
        const scrollLeft = Math.max(
          0,
          posicaoPlayhead - scrollContainer.clientWidth / 2
        );

        scrollContainer.scrollLeft = scrollLeft;
      }
    }
  }, [currentTime]);

  // ========================================================================
  // Renderização de Overlay de Informações
  // ========================================================================

  /** Obtém eventos que estão acontecendo AGORA */
  const eventosAtivos = useMemo(() => {
    return timelineEvents.filter(
      (e) =>
        currentTime >= e.inicio &&
        currentTime < e.fim + 0.5 // Pequena margem
    );
  }, [timelineEvents, currentTime]);

  /** Próximo evento */
  const proximoEvento = useMemo(() => {
    return timelineEvents
      .filter((e) => e.inicio > currentTime)
      .sort((a, b) => a.inicio - b.inicio)[0];
  }, [timelineEvents, currentTime]);

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div ref={timelineRef} className="flex flex-col h-full space-y-4">
      {/* Header com Info do Tempo */}
      <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Monitor de Sincronização
          </h2>
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                isPlaying
                  ? "bg-green-950 border border-green-700"
                  : "bg-gray-800 border border-gray-700"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isPlaying ? "bg-green-500 animate-pulse" : "bg-gray-500"
                }`}
              />
              <span className="text-xs text-gray-300">
                {isPlaying ? "AO VIVO" : "PARADO"}
              </span>
            </div>
          </div>
        </div>

        {/* Display de Tempo Grande */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-900 p-3 rounded border border-gray-800">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Tempo Atual
            </div>
            <div className="text-2xl font-mono font-bold text-cyan-400">
              {formatarTempo(currentTime)}
            </div>
          </div>

          <div className="bg-gray-900 p-3 rounded border border-gray-800">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Duração Total
            </div>
            <div className="text-2xl font-mono font-bold text-gray-300">
              {formatarTempo(duracaoVT)}
            </div>
          </div>

          <div className="bg-gray-900 p-3 rounded border border-gray-800">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Restante
            </div>
            <div className="text-2xl font-mono font-bold text-yellow-400">
              {formatarTempo(Math.max(0, duracaoVT - currentTime))}
            </div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="mt-4">
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
            <div
              style={{ width: `${(currentTime / duracaoVT) * 100}%` }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Timeline Interativa */}
      <div className="flex-1 min-h-0">
        <TimelineSincro
          eventos={timelineEvents}
          readOnly={true}
          currentTime={currentTime}
          duracao={duracaoVT}
          altura={280}
          mostrarRegua={true}
          intervaloRegua={5}
        />
      </div>

      {/* Info de Eventos Ativos e Próximos */}
      <div className="grid grid-cols-2 gap-4">
        {/* Eventos Ativos */}
        <div className="bg-gray-950 border border-green-900/50 rounded-lg p-4">
          <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3">
            Eventos Ativos Agora
          </h3>

          {eventosAtivos.length > 0 ? (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {eventosAtivos.map((evento) => (
                <div
                  key={evento.id}
                  className="bg-green-950/40 border border-green-700/50 rounded p-2"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs font-bold uppercase text-green-300">
                      {evento.tipo}
                    </span>
                    <span className="text-xs text-green-400 font-mono">
                      -{formatarTempo(evento.fim - currentTime)}
                    </span>
                  </div>
                  <div className="text-xs text-green-200">
                    {evento.texto}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic">
              Nenhum evento ativo
            </div>
          )}
        </div>

        {/* Próximo Evento */}
        <div className="bg-gray-950 border border-blue-900/50 rounded-lg p-4">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
            Próximo Evento
          </h3>

          {proximoEvento ? (
            <div className="bg-blue-950/40 border border-blue-700/50 rounded p-3">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-bold uppercase text-blue-300">
                  {proximoEvento.tipo}
                </span>
                <span className="text-xs text-blue-400 font-mono">
                  +{formatarTempo(proximoEvento.inicio - currentTime)}
                </span>
              </div>
              <div className="text-xs text-blue-200 mb-2">
                {proximoEvento.texto}
              </div>
              <div className="text-xs text-blue-400">
                {formatarTempo(proximoEvento.inicio)} →{" "}
                {formatarTempo(proximoEvento.fim)}
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic">
              Nenhum evento próximo
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// INTEGRAÇÃO NA PÁGINA PLAYOUT
// ============================================================================

/**
 * INSTRUÇÕES DE INTEGRAÇÃO NO PlayoutPage:
 * 
 * 1. No hook useEffect que atualiza o tempo do vídeo, mantenha o state:
 * 
 *    useEffect(() => {
 *      const interval = setInterval(() => {
 *        if (videoRef.current) {
 *          setCurrentTime(videoRef.current.currentTime);
 *        }
 *      }, 100); // Atualiza 10x por segundo
 * 
 *      return () => clearInterval(interval);
 *    }, []);
 * 
 * 2. No render, adicione o componente antes ou após o player:
 * 
 *    {materiaCarregada && (
 *      <PlayoutTimelineMonitor
 *        materia={{
 *          id: materiaId,
 *          titulo: materia.titulo,
 *          timeline_json: materia.timeline_json,
 *          duracao_vt: materia.duracao_vt,
 *        }}
 *        currentTime={currentTime}
 *        isPlaying={isPlayingVideo}
 *      />
 *    )}
 * 
 * AVANÇADO: Para sincronizar com EventSource em tempo real:
 * 
 *    useEffect(() => {
 *      const eventSource = new EventSource(
 *        `/api/player-sync/${materiaId}`
 *      );
 * 
 *      eventSource.onmessage = (event) => {
 *        const data = JSON.parse(event.data);
 *        setCurrentTime(data.currentTime);
 *      };
 * 
 *      return () => eventSource.close();
 *    }, [materiaId]);
 */

export { PlayoutTimelineMonitor };
