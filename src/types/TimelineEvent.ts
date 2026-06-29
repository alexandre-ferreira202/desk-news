/**
 * Tipos compartilhados para o sistema de Timeline de Sincronização
 * Sincroniza legendas, créditos, pausa de sobe-som e outros eventos de vídeo
 */

export type TipoEvento = "legenda" | "credito" | "pausa" | "sobe-som" | "efeito" | "transicao";

export interface TimelineEvent {
  /** ID único do evento */
  id: string;
  
  /** Tipo de evento (legenda, crédito, sobe-som, etc) */
  tipo: TipoEvento;
  
  /** Texto/conteúdo do evento */
  texto: string;
  
  /** Tempo de início em segundos */
  inicio: number;
  
  /** Tempo de fim em segundos */
  fim: number;
  
  /** Campos opcionais para metadados específicos */
  metadata?: {
    cargo?: string;          // Para créditos
    repórter?: string;       // Para créditos
    tom?: "normal" | "destaque" | "alerta"; // Para legendas
    intensidade?: number;     // Para efeitos (0-100)
  };
}

export interface TimelineState {
  /** Lista de eventos da timeline */
  eventos: TimelineEvent[];
  
  /** Duração total estimada em segundos */
  duracao_total: number;
  
  /** Data da última atualização */
  atualizado_em?: string;
}

/**
 * Props para o componente TimelineSincro
 */
export interface TimelineSincroProps {
  /** Lista de eventos a exibir na timeline */
  eventos: TimelineEvent[];
  
  /** Modo somente leitura (true = visualização, false = edição) */
  readOnly: boolean;
  
  /** Tempo atual do vídeo em segundos (para mode visualização com playhead) */
  currentTime?: number;
  
  /** Callback quando um evento é modificado (modo edição) */
  onEventChange?: (eventos: TimelineEvent[]) => void;
  
  /** Duração total da timeline em segundos */
  duracao?: number;
  
  /** Altura da timeline em pixels */
  altura?: number;
  
  /** Mostrar régua de tempo */
  mostrarRegua?: boolean;
  
  /** Intervalo da régua em segundos (ex: 5 = marca a cada 5s) */
  intervaloRegua?: number;
}

/**
 * Estrutura interna para controlar o estado do drag/resize
 */
export interface DragState {
  tipoOperacao: "move" | "resizeStart" | "resizeEnd" | null;
  eventId: string | null;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Cores e estilos para diferentes tipos de evento
 */
export const CORES_EVENTO: Record<TipoEvento, { bg: string; border: string; text: string }> = {
  legenda: {
    bg: "bg-blue-950/60",
    border: "border-blue-700/80",
    text: "text-blue-200",
  },
  credito: {
    bg: "bg-purple-950/60",
    border: "border-purple-700/80",
    text: "text-purple-200",
  },
  pausa: {
    bg: "bg-amber-950/60",
    border: "border-amber-700/80",
    text: "text-amber-200",
  },
  "sobe-som": {
    bg: "bg-green-950/60",
    border: "border-green-700/80",
    text: "text-green-200",
  },
  efeito: {
    bg: "bg-red-950/60",
    border: "border-red-700/80",
    text: "text-red-200",
  },
  transicao: {
    bg: "bg-indigo-950/60",
    border: "border-indigo-700/80",
    text: "text-indigo-200",
  },
};

/**
 * Funções utilitárias
 */

/** Formata segundos para formato MM:SS */
export function formatarTempo(segundos: number): string {
  const minutos = Math.floor(segundos / 60);
  const segs = Math.round((segundos % 60) * 10) / 10;
  return `${minutos.toString().padStart(2, "0")}:${segs.toFixed(1).padStart(4, "0")}`;
}

/** Converte pixels para segundos baseado na escala */
export function pixelsParaSegundos(
  pixels: number,
  pixelsPorSegundo: number
): number {
  return Math.round((pixels / pixelsPorSegundo) * 100) / 100;
}

/** Converte segundos para pixels baseado na escala */
export function segundosParaPixels(
  segundos: number,
  pixelsPorSegundo: number
): number {
  return segundos * pixelsPorSegundo;
}

/** Valida se um evento está dentro dos limites válidos */
export function validarEvento(evento: TimelineEvent, duracao: number): boolean {
  return (
    evento.inicio >= 0 &&
    evento.fim <= duracao &&
    evento.inicio < evento.fim &&
    evento.texto.trim().length > 0
  );
}

/** Detecta e retorna conflitos de sobreposição entre eventos */
export function detectarConflitos(
  eventos: TimelineEvent[]
): { evento1Id: string; evento2Id: string }[] {
  const conflitos: { evento1Id: string; evento2Id: string }[] = [];

  for (let i = 0; i < eventos.length; i++) {
    for (let j = i + 1; j < eventos.length; j++) {
      const e1 = eventos[i];
      const e2 = eventos[j];

      // Verifica se há sobreposição (apenas para tipos de evento que conflitam)
      if (
        !(e1.fim <= e2.inicio || e1.inicio >= e2.fim) &&
        ["legenda", "credito"].includes(e1.tipo) &&
        ["legenda", "credito"].includes(e2.tipo)
      ) {
        conflitos.push({ evento1Id: e1.id, evento2Id: e2.id });
      }
    }
  }

  return conflitos;
}
