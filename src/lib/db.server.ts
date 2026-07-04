/**
 * src/lib/db.server.ts
 *
 * ⚠️ ARQUIVO SERVER-ONLY. Nunca importe isto em:
 *   - componentes React (.tsx sem ser dentro de um .handler())
 *   - hooks que rodam no client
 *   - qualquer arquivo importado pela árvore de componentes
 *
 * Só pode ser importado dentro de:
 *   - .handler() de createServerFn (em arquivos *.functions.ts)
 *   - outros arquivos *.server.ts
 *
 * Por quê: este módulo importa @neondatabase/serverless, que abre conexões
 * TCP/TLS reais com o Postgres. Se isto for importado por engano em código
 * que o Vite bundla para o navegador, a connection string E o driver do
 * banco vazam para qualquer visitante da página (já aconteceu uma vez —
 * ver histórico do projeto).
 *
 * IMPORTANTE: process.env é lido DENTRO da função, nunca no topo do módulo.
 * Em runtimes de edge (Cloudflare Workers), variáveis de ambiente são
 * injetadas por requisição — uma leitura no nível do módulo aconteceria
 * antes do env existir e sempre retornaria undefined, mesmo no servidor.
 */
import "@tanstack/react-start/server-only";
import { Client } from "@neondatabase/serverless";

/**
 * Tipo serializável: o TanStack Start valida em tempo de compilação que
 * tudo que cruza a fronteira client/server pode ser serializado. `unknown`
 * falha essa checagem (poderia ser uma classe, função, etc), então usamos
 * um union explícito dos tipos que o driver do Postgres de fato retorna.
 */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type Row = Record<string, JsonValue>;

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL não definida no ambiente do servidor. " +
        "Verifique seu .env (dev) ou as variáveis de ambiente configuradas " +
        "no painel da plataforma de deploy (produção)."
    );
  }
  return url;
}

/**
 * Executa uma query parametrizada direto no Postgres (Neon).
 * Sempre abre e fecha a conexão por chamada — adequado para serverless/edge,
 * onde não há processo de longa duração para manter um pool persistente.
 */
export async function runQuery(q: string, params?: unknown[]): Promise<Row[]> {
  const client = new Client(getDatabaseUrl());
  await client.connect();
  try {
    const result = await client.query(q, params);
    return result.rows as Row[];
  } finally {
    await client.end();
  }
}

export async function dbQuery(
  queryStr: string,
  params?: unknown[]
): Promise<{ rows: Row[]; error: null | { message: string } }> {
  try {
    const rows = await runQuery(queryStr, params);
    return { rows, error: null };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[db.server] query error:", message);
    return { rows: [], error: { message } };
  }
}
