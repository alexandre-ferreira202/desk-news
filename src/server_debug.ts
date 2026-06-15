import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(error?: Error): Response {
  const errorMessage = error?.message || "Erro desconhecido";
  const errorStack = error?.stack || "";
  
  console.error("🔴 ERRO SSR DETALHADO:");
  console.error("Mensagem:", errorMessage);
  console.error("Stack:", errorStack);
  
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { 
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-cache, no-store, must-revalidate"
    },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  const capturedError = consumeLastCapturedError();
  console.error("🔴 SSR Error capturado:", capturedError);
  console.error("🔴 Body:", body);
  
  return brandedErrorResponse(capturedError || undefined);
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);
    console.log(`📍 [SSR] ${request.method} ${url.pathname}`);
    
    try {
      const handler = await getServerEntry();
      console.log("✅ Handler carregado com sucesso");
      
      const response = await handler.fetch(request, env, ctx);
      console.log(`✅ Response: ${response.status}`);
      
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error("🔴 ERRO CRÍTICO NO SSR:");
      console.error(error);
      
      if (error instanceof Error) {
        console.error("Mensagem:", error.message);
        console.error("Stack:", error.stack);
      }
      
      return brandedErrorResponse(error instanceof Error ? error : new Error(String(error)));
    }
  },
};
