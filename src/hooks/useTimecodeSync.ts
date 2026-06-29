/**
 * useTimecodeSync.ts
 * ════════════════════════════════════════════════════════════════════════════
 * Hook React para sincronização de créditos com vídeo
 * ════════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { TimecodeSync, CreditoTimecode, CreditoAtivo } from "@/lib/TimecodeSync";

export function useTimecodeSync(videoRef: React.RefObject<HTMLVideoElement>) {
  const syncRef = useRef<TimecodeSync | null>(null);
  const [creditosAtivos, setCreditosAtivos] = useState<CreditoAtivo[]>([]);
  const [timecodeAtual, setTimecodeAtual] = useState(0);

  // Inicializa o sincronizador
  useEffect(() => {
    if (!videoRef.current) return;

    syncRef.current = new TimecodeSync(videoRef.current);

    // Listener para atualizar créditos ativos
    const unsubscribe = syncRef.current.onCreditosAtivosChanged(
      (ativos) => {
        setCreditosAtivos(ativos);
        setTimecodeAtual(syncRef.current?.getTimecodeAtual() ?? 0);
      }
    );

    return () => {
      unsubscribe();
      syncRef.current?.destroy();
      syncRef.current = null;
    };
  }, [videoRef]);

  /**
   * Define os créditos a sincronizar
   */
  const setCreditos = useCallback((creditos: CreditoTimecode[]) => {
    if (syncRef.current) {
      syncRef.current.setCreditos(creditos);
    }
  }, []);

  /**
   * Obtém o timecode atual
   */
  const getTimecodeAtual = useCallback(() => {
    return syncRef.current?.getTimecodeAtual() ?? 0;
  }, []);

  /**
   * Formata timecode
   */
  const formatarTimecode = useCallback((segundos: number) => {
    return TimecodeSync.formatarTimecode(segundos);
  }, []);

  /**
   * Parseia timecode
   */
  const parseTimecode = useCallback((timecodeStr: string) => {
    return TimecodeSync.parseTimecode(timecodeStr);
  }, []);

  return {
    creditosAtivos,
    timecodeAtual,
    setCreditos,
    getTimecodeAtual,
    formatarTimecode,
    parseTimecode,
  };
}
