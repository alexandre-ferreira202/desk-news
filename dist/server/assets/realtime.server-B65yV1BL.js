function getCentrifugoConfig() {
  const apiUrl = process.env.CENTRIFUGO_API_URL;
  const apiKey = process.env.CENTRIFUGO_API_KEY;
  if (!apiUrl || !apiKey) {
    console.warn(
      "[realtime.server] CENTRIFUGO_API_URL ou CENTRIFUGO_API_KEY ausentes — publish ignorado silenciosamente. Defina ambos no .env para habilitar realtime."
    );
    return null;
  }
  return { apiUrl, apiKey };
}
async function publishEvent({ channel, type, payload }) {
  const config = getCentrifugoConfig();
  if (!config) return;
  try {
    const response = await fetch(`${config.apiUrl}/api/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `apikey ${config.apiKey}`
      },
      body: JSON.stringify({
        channel,
        data: { type, payload }
      })
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
const ESPELHO_CHANNEL = "playout_events";
async function notifyEspelhoAlterado(motivo) {
  await publishEvent({
    channel: ESPELHO_CHANNEL,
    type: "ESPELHO_ALTERADO",
    payload: { motivo, timestamp: (/* @__PURE__ */ new Date()).toISOString() }
  });
}
export {
  ESPELHO_CHANNEL,
  notifyEspelhoAlterado,
  publishEvent
};
