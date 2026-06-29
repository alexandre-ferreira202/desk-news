/**
 * src/lib/db.ts
 * Query builder compatível com a interface do Supabase,
 * mas executando no Neon via @neondatabase/serverless.
 */
import { Client } from "@neondatabase/serverless";

const DATABASE_URL = "postgresql://neondb_owner:npg_EzcoBs1MW0RG@ep-weathered-pine-ac2fsgd5-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require";

async function runQuery(q: string, params?: unknown[]): Promise<Row[]> {
  const client = new Client(DATABASE_URL);
  await client.connect();
  try {
    const result = await client.query(q, params);
    return result.rows as Row[];
  } finally {
    await client.end();
  }
}

type Row = Record<string, unknown>;
type FilterOp = { col: string; op: string; val: unknown };
type OrderSpec = { col: string; asc: boolean };

interface QueryResult<T> {
  data: T | null;
  error: { message: string } | null;
}

class QueryBuilder<T = Row> {
  private _table: string;
  private _columns = "*";
  private _filters: FilterOp[] = [];
  private _orders: OrderSpec[] = [];
  private _limit: number | null = null;
  private _single = false;
  private _mode: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private _payload: Row | Row[] | null = null;
  private _onConflict: string | null = null;

  constructor(table: string) {
    this._table = table;
  }

  select(columns = "*"): this {
    this._mode = "select";
    this._columns = columns;
    return this;
  }

  insert(payload: Row | Row[]): this {
    this._mode = "insert";
    this._payload = payload;
    return this;
  }

  update(payload: Row): this {
    this._mode = "update";
    this._payload = payload;
    return this;
  }

  delete(): this {
    this._mode = "delete";
    return this;
  }

  upsert(payload: Row | Row[], options?: { onConflict?: string }): this {
    this._mode = "upsert";
    this._payload = payload;
    this._onConflict = options?.onConflict ?? "id";
    return this;
  }

  eq(col: string, val: unknown): this { this._filters.push({ col, op: "=", val }); return this; }
  neq(col: string, val: unknown): this { this._filters.push({ col, op: "!=", val }); return this; }
  gt(col: string, val: unknown): this { this._filters.push({ col, op: ">", val }); return this; }
  gte(col: string, val: unknown): this { this._filters.push({ col, op: ">=", val }); return this; }
  lt(col: string, val: unknown): this { this._filters.push({ col, op: "<", val }); return this; }
  lte(col: string, val: unknown): this { this._filters.push({ col, op: "<=", val }); return this; }
  like(col: string, val: string): this { this._filters.push({ col, op: "LIKE", val }); return this; }
  ilike(col: string, val: string): this { this._filters.push({ col, op: "ILIKE", val }); return this; }
  is(col: string, val: null | boolean): this { this._filters.push({ col, op: "IS", val }); return this; }
  in(col: string, vals: unknown[]): this { this._filters.push({ col, op: "IN", val: vals }); return this; }
  contains(col: string, val: unknown): this { this._filters.push({ col, op: "@>", val: JSON.stringify(val) }); return this; }

  order(col: string, options?: { ascending?: boolean }): this {
    this._orders.push({ col, asc: options?.ascending ?? true });
    return this;
  }
  limit(n: number): this { this._limit = n; return this; }
  single(): this { this._single = true; this._limit = 1; return this; }

  then<R>(resolve: (value: QueryResult<T>) => R, reject?: (reason: unknown) => R): Promise<R> {
    return this._run().then(resolve, reject);
  }

  private async _run(): Promise<QueryResult<T>> {
    try {
      let rows: Row[] = [];
      if (this._mode === "select") rows = await this._execSelect();
      else if (this._mode === "insert") rows = await this._execInsert();
      else if (this._mode === "update") rows = await this._execUpdate();
      else if (this._mode === "delete") rows = await this._execDelete();
      else if (this._mode === "upsert") rows = await this._execUpsert();

      if (this._single) return { data: (rows[0] ?? null) as T, error: null };
      return { data: rows as unknown as T, error: null };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`[db] ${this._mode} ${this._table}:`, message);
      return { data: null, error: { message } };
    }
  }

  private _lit(v: unknown): string {
    if (v === null || v === undefined) return "NULL";
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    return `'${String(v).replace(/'/g, "''")}'`;
  }

  private _whereClause(): string {
    if (this._filters.length === 0) return "";
    const parts = this._filters.map((f) => {
      if (f.op === "IN") {
        const list = (f.val as unknown[]).map((v) => this._lit(v)).join(", ");
        return `"${f.col}" IN (${list})`;
      }
      if (f.op === "IS") return `"${f.col}" IS ${f.val === null ? "NULL" : f.val ? "TRUE" : "FALSE"}`;
      return `"${f.col}" ${f.op} ${this._lit(f.val)}`;
    });
    return "WHERE " + parts.join(" AND ");
  }

  private _orderClause(): string {
    if (this._orders.length === 0) return "";
    return "ORDER BY " + this._orders.map((o) => `"${o.col}" ${o.asc ? "ASC" : "DESC"}`).join(", ");
  }

  private _limitClause(): string {
    return this._limit !== null ? `LIMIT ${this._limit}` : "";
  }

  private async _execSelect(): Promise<Row[]> {
    const q = [`SELECT ${this._columns} FROM "${this._table}"`, this._whereClause(), this._orderClause(), this._limitClause()].filter(Boolean).join(" ");
    return runQuery(q);
  }

  private async _execInsert(): Promise<Row[]> {
    const rows = Array.isArray(this._payload) ? this._payload : [this._payload!];
    const cols = Object.keys(rows[0]);
    const colList = cols.map((c) => `"${c}"`).join(", ");
    const valRows = rows.map((r) => `(${cols.map((c) => this._lit(r[c])).join(", ")})`).join(", ");
    const q = `INSERT INTO "${this._table}" (${colList}) VALUES ${valRows} RETURNING *`;
    return runQuery(q);
  }

  private async _execUpdate(): Promise<Row[]> {
    const payload = this._payload as Row;
    const sets = Object.keys(payload).map((c) => `"${c}" = ${this._lit(payload[c])}`).join(", ");
    const q = [`UPDATE "${this._table}" SET ${sets}`, this._whereClause(), "RETURNING *"].filter(Boolean).join(" ");
    return runQuery(q);
  }

  private async _execDelete(): Promise<Row[]> {
    const q = [`DELETE FROM "${this._table}"`, this._whereClause(), "RETURNING *"].filter(Boolean).join(" ");
    return runQuery(q);
  }

  private async _execUpsert(): Promise<Row[]> {
    const rows = Array.isArray(this._payload) ? this._payload : [this._payload!];
    const cols = Object.keys(rows[0]);
    const colList = cols.map((c) => `"${c}"`).join(", ");
    const valRows = rows.map((r) => `(${cols.map((c) => this._lit(r[c])).join(", ")})`).join(", ");
    const conflict = this._onConflict ?? "id";
    const sets = cols.filter((c) => c !== conflict).map((c) => `"${c}" = EXCLUDED."${c}"`).join(", ");
    const q = `INSERT INTO "${this._table}" (${colList}) VALUES ${valRows} ON CONFLICT ("${conflict}") DO UPDATE SET ${sets} RETURNING *`;
    return runQuery(q);
  }
}

export const db = {
  from<T = Row>(table: string): QueryBuilder<T> {
    return new QueryBuilder<T>(table);
  },
  async query(
    queryStr: string,
    params?: unknown[]
  ): Promise<{ rows: Row[]; data: Row[]; error: null | { message: string } }> {
    try {
      const rows = await runQuery(queryStr, params);
      return { rows, data: rows, error: null };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("[db] query error:", message);
      return { rows: [], data: [], error: { message } };
    }
  },
};

export const supabase = db;
