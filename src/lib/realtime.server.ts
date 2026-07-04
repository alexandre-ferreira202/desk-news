/**
 * src/lib/realtime.server.ts
 *
 * ⚠️ ARQUIVO SERVER-ONLY (mesma regra do db.server.ts).
 *
 * Publica eventos no Centrifugo via API HTTP dele (endpoint /api/publish),
 * usando a API key de servidor. Isso é INTENCIONALMENTE simples: não usamos
 * o SDK Node do Centrifugo, só um fetch — é tudo que o publish precisa, e
 * evita mais uma dependência rodando dentro do Worker.
 *
 * Por que publicar aqui e não no client:
 * O evento só deve existir depois que o dado está confirmado no Postgres.
 * Se o client publicasse direto, dois editores poderiam gerar eventos que
 * descrevem um estado que nunca foi de fato persistido (ex: dois publishes
 * concorrentes de reordenação, um deles batido pelo outro no banco, mas o
 * client emite os dois mesmo assim). Centralizando aqui, o publish só
 * acontece se a escrita no banco teve sucesso.
 */

interface PublishOptions {
  channel: string;
  type: string;
  payload: Record<string, unknown>;
}

function getCentrifugoConfig() {
  const apiUrl = process.env.CENTRIFUGO_API_URL;
  const apiKey = process.env.CENTRIFUGO_API_KEY;

  if (!apiUrl || !apiKey) {
    console.warn(
      "[realtime.server] CENTRIFUGO_API_URL ou CENTRIFUGO_API_KEY ausentes — " +
        "publish ignorado silenciosamente. Defina ambos no .env para habilitar realtime."
    );
    return null;
  }
  return { apiUrl, apiKey };
}

/**
 * Publica um evento no Centrifugo. Falhas aqui NUNCA devem derrubar a
 * mutação principal (o INSERT/UPDATE já aconteceu) — por isso engolimos
 * o erro e só logamos. Pior caso: alguém vê o dado 4s depois via um
 * fallback de polling, em vez de instantaneamente.
 */
export async function publishEvent({ channel, type, payload }: PublishOptions): Promise<void> {
  const config = getCentrifugoConfig();
  if (!config) return;

  try {
    const response = await fetch(`${config.apiUrl}/api/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `apikey ${config.apiKey}`,
      },
      body: JSON.stringify({
        channel,
        data: { type, payload },
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error(
        `[realtime.server] Centrifugo respondeu ${response.status} ao publicar em "${channel}": ${text}`
      );
    }
  } catch (err) {
    console.error("[realtime.server] Falha ao publicar evento:", err);
  }
}

/** Canal único usado por toda a página do Espelho. */
export const ESPELHO_CHANNEL = "playout_events";

/**
 * Helper específico do domínio: avisa que o espelho mudou e os clients
 * devem recarregar a lista. Mantém o "type" como string literal pra
 * facilitar o autocomplete e evitar erros de digitação espalhados pelo código.
 */
export async function notifyEspelhoAlterado(motivo: string): Promise<void> {
  await publishEvent({
    channel: ESPELHO_CHANNEL,
    type: "ESPELHO_ALTERADO",
    payload: { motivo, timestamp: new Date().toISOString() },
  });
}
