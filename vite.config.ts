import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    ssr: false,
  },
  define: {
    "import.meta.env.VITE_CENTRIFUGO_URL": JSON.stringify(
      "wss://centrifugo-production-449f.up.railway.app/connection/websocket"
    ),
  },
});
