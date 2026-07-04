/**
 * src/hooks/useEspelhoRealtime.ts
 *
 * Hook client-side. Conecta ao Centrifugo e expõe os eventos do canal
 * "playout_events" já tipados para o domínio do Espelho.
 *
 * Substitui:
 *   - o polling de 4s (setInterval + load())
 *   - o broadcastChannelRef fantasma (useRef<null>(null) que nunca emitia nada)
 *
 * Uso no componente:
 *   const { editingItemIds } = useEspelhoRealtime({
 *     onEspelhoAlterado: () => load(),
 *     onCabecaAtualizada: (p) => { ... atualiza modal aberto, se houver ... },
 *     onProducaoAlterada: (p) => setPlannedEditorialDuration(p.valor),
 *     onMasterAlterado: (p) => setMasterDuration(p.valor),
 *   });
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { Centrifuge } from "centrifuge";

type EditandoPayload = { itemId: string; editando: boolean };
type CabecaAtualizadaPayload = {
  itemId: string;
  cabeca: string;
  assunto: string;
  tempo_cab: string;
};
type ProducaoPayload = { valor: string };
type MasterPayload = { valor: string };
type ItemStatusPayload = { itemId: string; status: string };

interface UseEspelhoRealtimeOptions {
  /** Disparado em qualquer mudança estrutural do espelho (criar/mover/excluir item ou bloco). */
  onEspelhoAlterado?: () => void;
  onCabecaAtualizada?: (payload: CabecaAtualizadaPayload) => void;
  onProducaoAlterada?: (payload: ProducaoPayload) => void;
  onMasterAlterado?: (payload: MasterPayload) => void;
  onItemStatusAlterado?: (payload: ItemStatusPayload) => void;
  /** URL pública do Centrifugo, ex: wss://realtime.seudominio.com/connection/websocket */
  url?: string;
  /** Token de conexão (JWT), se o Centrifugo estiver configurado com auth. */
  token?: string;
  debug?: boolean;
}

export function useEspelhoRealtime(options: UseEspelhoRealtimeOptions) {
  const {
    onEspelhoAlterado,
    onCabecaAtualizada,
    onProducaoAlterada,
    onMasterAlterado,
    onItemStatusAlterado,
    url,
    token,
    debug = false,
  } = options;

  const [editingItemIds, setEditingItemIds] = useState<Set<string>>(new Set());
  const [connected, setConnected] = useState(false);

  // Refs para sempre chamar a versão mais recente dos callbacks sem precisar
  // recriar a conexão Centrifugo a cada render (evita reconectar à toa).
  const callbacksRef = useRef(options);
  callbacksRef.current = options;

  const log = useCallback(
    (msg: string, data?: unknown) => {
      if (debug) console.log(`[Espelho Realtime] ${msg}`, data ?? "");
    },
    [debug]
  );

  useEffect(() => {
    if (!url) {
      log("URL do Centrifugo não fornecida — realtime desabilitado, espelho não atualizará sozinho.");
      return;
    }

    const centrifuge = new Centrifuge(url, { token, debug });
    const sub = centrifuge.newSubscription("playout_events");

    centrifuge.on("connected", () => {
      log("✅ Conectado");
      setConnected(true);
    });
    centrifuge.on("disconnected", (ctx) => {
      log("❌ Desconectado", ctx);
      setConnected(false);
    });
    centrifuge.on("error", (ctx) => {
      log("Erro de conexão", ctx);
    });

    sub.on("publication", (ctx) => {
      const { type, payload } = ctx.data as { type: string; payload: unknown };
      log(`Evento recebido: ${type}`, payload);

      switch (type) {
        case "ESPELHO_ALTERADO": {
          callbacksRef.current.onEspelhoAlterado?.();
          break;
        }
        case "CABECA_ATUALIZADA": {
          callbacksRef.current.onCabecaAtualizada?.(payload as CabecaAtualizadaPayload);
          break;
        }
        case "PRODUCAO_ALTERADA": {
          callbacksRef.current.onProducaoAlterada?.(payload as ProducaoPayload);
          break;
        }
        case "MASTER_ALTERADO": {
          callbacksRef.current.onMasterAlterado?.(payload as MasterPayload);
          break;
        }
        case "ITEM_STATUS_ALTERADO": {
          callbacksRef.current.onItemStatusAlterado?.(payload as ItemStatusPayload);
          break;
        }
        case "EDITANDO": {
          const { itemId, editando } = payload as EditandoPayload;
          setEditingItemIds((prev) => {
            const next = new Set(prev);
            if (editando) next.add(itemId);
            else next.delete(itemId);
            return next;
          });
          break;
        }
        default:
          log(`Tipo de evento desconhecido: ${type}`);
      }
    });

    sub.on("subscribed", () => log("📡 Inscrito em playout_events"));
    sub.on("error", (ctx) => log("Erro na subscrição", ctx));

    sub.subscribe();
    centrifuge.connect();

    return () => {
      sub.unsubscribe();
      centrifuge.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, token, debug]);

  return { editingItemIds, connected };
}
