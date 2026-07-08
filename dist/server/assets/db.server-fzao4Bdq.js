import { Client } from "@neondatabase/serverless";
function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL não definida no ambiente do servidor. Verifique seu .env (dev) ou as variáveis de ambiente configuradas no painel da plataforma de deploy (produção)."
    );
  }
  return url;
}
async function runQuery(q, params) {
  const client = new Client(getDatabaseUrl());
  await client.connect();
  try {
    const result = await client.query(q, params);
    return result.rows;
  } finally {
    await client.end();
  }
}
async function dbQuery(queryStr, params) {
  try {
    const rows = await runQuery(queryStr, params);
    return { rows, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[db.server] query error:", message);
    return { rows: [], error: { message } };
  }
}
export {
  dbQuery,
  runQuery
};
