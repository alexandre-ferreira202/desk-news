/**
 * DeskNews — WebSocket Relay Server
 * 
 * Roda no PC do operador. Retransmite mensagens do playout
 * para a página PGM aberta na TV (outro IP na rede local).
 * 
 * Uso:
 *   npm install ws
 *   node ws-server.js
 * 
 * Depois abra a página PGM na TV apontando para o IP deste PC:
 *   http://192.168.x.x:5173/playout-pgm
 * (substitua pelo IP real da máquina do operador)
 */

const { WebSocketServer } = require("ws");

const PORT = 4242;

const wss = new WebSocketServer({ port: PORT, host: "0.0.0.0" });
const clients = new Set();

wss.on("connection", (ws, req) => {
  clients.add(ws);
  const ip = req.socket.remoteAddress;
  console.log(`[+] Conectado: ${ip}  |  Total de clientes: ${clients.size}`);

  ws.on("message", (data) => {
    const raw = data.toString();

    // Log resumido (sem logar tudo para não poluir)
    try {
      const msg = JSON.parse(raw);
      if (msg.type !== "pgm_sync") {
        console.log(`[→] ${msg.type}  (de ${ip})`);
      }
    } catch {}

    // Rebroadcast para todos os outros clientes conectados
    for (const client of clients) {
      if (client !== ws && client.readyState === 1 /* OPEN */) {
        client.send(raw);
      }
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log(`[-] Desconectado: ${ip}  |  Total de clientes: ${clients.size}`);
  });

  ws.on("error", (err) => {
    console.error(`[!] Erro no cliente ${ip}:`, err.message);
  });
});

wss.on("listening", () => {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   DeskNews WebSocket Relay — RODANDO     ║");
  console.log(`║   ws://0.0.0.0:${PORT}                      ║`);
  console.log("║                                          ║");
  console.log("║   Abra a URL da TV apontando para o IP  ║");
  console.log("║   desta máquina na rede local.          ║");
  console.log("╚══════════════════════════════════════════╝");
});
