/**
 * src/server/espelho.functions.ts
 *
 * Server functions do domínio "Espelho". Este arquivo é seguro de importar
 * em qualquer lugar — incluindo componentes client — porque o TanStack Start
 * substitui cada createServerFn por um stub RPC no bundle do client. O
 * corpo real (que importa db.server.ts) só existe no bundle do servidor.
 *
 * Convenção: toda mutação que altera o que aparece no Espelho termina
 * chamando notifyEspelhoAlterado() — é isso que substitui o polling de 4s
 * no frontend.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Lazy imports — carregados apenas no bundle do servidor.
// Importar db.server e realtime.server no topo causaria vazamento para o client.
const getDb = () => import("@/lib/db.server").then((m) => m.dbQuery);
const getRealtime = () =>
  import("@/server/realtime.server").then((m) => ({
    notifyEspelhoAlterado: m.notifyEspelhoAlterado,
    publishEvent: m.publishEvent,
    ESPELHO_CHANNEL: m.ESPELHO_CHANNEL,
  }));

// ───────────────────────── Schemas ─────────────────────────

const ItemStatusSchema = z.enum(["pendente", "pronto", "no_ar", "exibido", "cortado"]);

const LoadEspelhoSchema = z.object({
  date: z.string(),
  programa: z.string(),
});

const AddBlocoSchema = z.object({
  date: z.string(),
  nome: z.string(),
  ordem: z.number().int(),
  programa: z.string(),
});

const AddItemSchema = z.object({
  blocoId: z.string(),
  ordem: z.number().int(),
  assunto: z.string(),
  formato: z.string(),
  tempo: z.string(),
  tempoCab: z.string(),
});

const AddFromMateriaSchema = z.object({
  blocoId: z.string(),
  ordem: z.number().int(),
  assunto: z.string(),
  materiaId: z.string(),
  formato: z.string(),
  tempo: z.string(),
  tempoCab: z.string(),
  cabeca: z.string().nullable(),
});

const UpdateItemSchema = z.object({
  id: z.string(),
  patch: z
    .object({
      assunto: z.string(),
      formato: z.string().nullable(),
      tempo: z.string().nullable(),
      tempo_cab: z.string().nullable(),
      tempo_total: z.string().nullable(),
      status: ItemStatusSchema,
      materia_id: z.string().nullable(),
      editor_texto_id: z.string().nullable(),
      editor_imagem_id: z.string().nullable(),
      cabeca: z.string().nullable(),
      bloco_id: z.string(),
      ordem: z.number().int(),
    })
    .partial(),
});

const UpdateBlocoSchema = z.object({
  id: z.string(),
  patch: z
    .object({
      nome: z.string(),
      ordem: z.number().int(),
      apresentador: z.string().nullable(),
      programa: z.string(),
    })
    .partial(),
});

const DelByIdSchema = z.object({ id: z.string() });

const ReorderItemSchema = z.object({
  id: z.string(),
  ordem: z.number().int(),
  bloco_id: z.string(),
});
const ReorderSchema = z.object({ itens: z.array(ReorderItemSchema) });

const UpdateMateriaCabecaSchema = z.object({
  materiaId: z.string(),
  creditoReporter: z.string(),
  cabeca: z.string(),
  tempoCab: z.string(),
  tempoVt: z.string(),
});

const UpdateMateriaSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  titulo: z.string(),
  cabeca: z.string().nullable(),
  tempoVt: z.string().nullable(),
  tempoCab: z.string().nullable(),
  deixa: z.string().nullable(),
  estrutura: z.string().nullable(),
  corpo: z.string().nullable(),
  creditoReporter: z.string().nullable(),
});

// ───────────────────────── Leitura ─────────────────────────

export const loadEspelho = createServerFn({ method: "GET" })
  .validator(LoadEspelhoSchema)
  .handler(async ({ data }) => {
    const dbQuery = await getDb();
    const { date, programa } = data;

    let sql = `SELECT * FROM espelho_blocos WHERE data_edicao = $1`;
    const params: unknown[] = [date];
    if (programa !== "Todos") {
      sql += ` AND programa = $2`;
      params.push(programa);
    }
    sql += ` ORDER BY ordem`;

    const { rows: blocos, error: blocosError } = await dbQuery(sql, params);
    if (blocosError) throw new Error(blocosError.message);

    if (!blocos.length) {
      return { blocos: [], itens: [] };
    }

    const blocoIds: string[] = blocos.map((b) => b.id as string);
    const placeholders = blocoIds.map((_value: string, idx: number) => `$${idx + 1}`).join(", ");
    const { rows: itens, error: itensError } = await dbQuery(
      `SELECT * FROM espelho_itens WHERE bloco_id IN (${placeholders}) ORDER BY ordem`,
      blocoIds
    );
    if (itensError) throw new Error(itensError.message);

    return { blocos, itens };
  });

export const loadMaterias = createServerFn({ method: "GET" }).handler(async () => {
  const dbQuery = await getDb();
  const { rows, error } = await dbQuery(
    `SELECT id, titulo, status, cabeca, tempo_vt, tempo_cab, deixa, editor_texto, editor_imagem, credito_reporter, estrutura, corpo
     FROM materias
     WHERE status = $1
     ORDER BY created_at DESC`,
    ["publicado"]
  );
  if (error) throw new Error(error.message);
  return rows;
});

// ───────────────────────── Escrita ─────────────────────────

export const addBloco = createServerFn({ method: "POST" })
  .validator(AddBlocoSchema)
  .handler(async ({ data }) => {
    const dbQuery = await getDb();
    const { notifyEspelhoAlterado } = await getRealtime();
    const { error } = await dbQuery(
      `INSERT INTO espelho_blocos (data_edicao, nome, ordem, programa) VALUES ($1, $2, $3, $4)`,
      [data.date, data.nome, data.ordem, data.programa]
    );
    if (error) throw new Error(error.message);
    await notifyEspelhoAlterado("bloco_criado");
    return { success: true };
  });

export const addItem = createServerFn({ method: "POST" })
  .validator(AddItemSchema)
  .handler(async ({ data }) => {
    const dbQuery = await getDb();
    const { notifyEspelhoAlterado } = await getRealtime();
    const { error } = await dbQuery(
      `INSERT INTO espelho_itens (bloco_id, ordem, assunto, formato, tempo, tempo_cab)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [data.blocoId, data.ordem, data.assunto, data.formato, data.tempo, data.tempoCab]
    );
    if (error) throw new Error(error.message);
    await notifyEspelhoAlterado("item_criado");
    return { success: true };
  });

export const addFromMateria = createServerFn({ method: "POST" })
  .validator(AddFromMateriaSchema)
  .handler(async ({ data }) => {
    const dbQuery = await getDb();
    const { notifyEspelhoAlterado } = await getRealtime();
    const { error } = await dbQuery(
      `INSERT INTO espelho_itens (bloco_id, ordem, assunto, materia_id, formato, tempo, tempo_cab, cabeca)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        data.blocoId,
        data.ordem,
        data.assunto,
        data.materiaId,
        data.formato,
        data.tempo,
        data.tempoCab,
        data.cabeca,
      ]
    );
    if (error) throw new Error(error.message);
    await notifyEspelhoAlterado("item_criado_de_materia");
    return { success: true };
  });

export const addComercial = createServerFn({ method: "POST" })
  .validator(
    z.object({ blocoId: z.string(), ordem: z.number().int() })
  )
  .handler(async ({ data }) => {
    const dbQuery = await getDb();
    const { notifyEspelhoAlterado } = await getRealtime();
    const { error } = await dbQuery(
      `INSERT INTO espelho_itens (bloco_id, ordem, assunto, formato, tempo, tempo_cab, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [data.blocoId, data.ordem, "INTERVALO COMERCIAL", "Comercial", "3:00", "0:00", "pronto"]
    );
    if (error) throw new Error(error.message);
    await notifyEspelhoAlterado("comercial_criado");
    return { success: true };
  });

export const updateItem = createServerFn({ method: "POST" })
  .validator(UpdateItemSchema)
  .handler(async ({ data }) => {
    const dbQuery = await getDb();
    const { notifyEspelhoAlterado, publishEvent, ESPELHO_CHANNEL } = await getRealtime();
    const keys = Object.keys(data.patch);
    if (!keys.length) return { success: true };

    const setClause = keys.map((k, idx) => `"${k}" = $${idx + 1}`).join(", ");
    const values = keys.map((k) => (data.patch as Record<string, unknown>)[k]);

    const { error } = await dbQuery(
      `UPDATE espelho_itens SET ${setClause} WHERE id = $${keys.length + 1}`,
      [...values, data.id]
    );
    if (error) throw new Error(error.message);

    if (data.patch.status) {
      await publishEvent({
        channel: ESPELHO_CHANNEL,
        type: "ITEM_STATUS_ALTERADO",
        payload: { itemId: data.id, status: data.patch.status },
      });
    }
    await notifyEspelhoAlterado("item_atualizado");
    return { success: true };
  });

export const updateBloco = createServerFn({ method: "POST" })
  .validator(UpdateBlocoSchema)
  .handler(async ({ data }) => {
    const dbQuery = await getDb();
    const { notifyEspelhoAlterado } = await getRealtime();
    const keys = Object.keys(data.patch);
    if (!keys.length) return { success: true };

    const setClause = keys.map((k, idx) => `"${k}" = $${idx + 1}`).join(", ");
    const values = keys.map((k) => (data.patch as Record<string, unknown>)[k]);

    const { error } = await dbQuery(
      `UPDATE espelho_blocos SET ${setClause} WHERE id = $${keys.length + 1}`,
      [...values, data.id]
    );
    if (error) throw new Error(error.message);
    await notifyEspelhoAlterado("bloco_atualizado");
    return { success: true };
  });

export const delItem = createServerFn({ method: "POST" })
  .validator(DelByIdSchema)
  .handler(async ({ data }) => {
    const dbQuery = await getDb();
    const { notifyEspelhoAlterado } = await getRealtime();
    const { error } = await dbQuery(`DELETE FROM espelho_itens WHERE id = $1`, [data.id]);
    if (error) throw new Error(error.message);
    await notifyEspelhoAlterado("item_removido");
    return { success: true };
  });

export const delBloco = createServerFn({ method: "POST" })
  .validator(DelByIdSchema)
  .handler(async ({ data }) => {
    const dbQuery = await getDb();
    const { notifyEspelhoAlterado } = await getRealtime();
    const { error } = await dbQuery(`DELETE FROM espelho_blocos WHERE id = $1`, [data.id]);
    if (error) throw new Error(error.message);
    await notifyEspelhoAlterado("bloco_removido");
    return { success: true };
  });

/**
 * Reordenação em lote (drag-and-drop). Recebe a lista final de
 * {id, ordem, bloco_id} já calculada no client e persiste tudo de uma vez.
 * Um único publish ao final evita uma rajada de eventos durante o drag.
 */
export const reorderItens = createServerFn({ method: "POST" })
  .validator(ReorderSchema)
  .handler(async ({ data }) => {
    const dbQuery = await getDb();
    const { notifyEspelhoAlterado } = await getRealtime();
    for (const item of data.itens) {
      const { error } = await dbQuery(
        `UPDATE espelho_itens SET ordem = $1, bloco_id = $2 WHERE id = $3`,
        [item.ordem, item.bloco_id, item.id]
      );
      if (error) throw new Error(error.message);
    }
    await notifyEspelhoAlterado("itens_reordenados");
    return { success: true };
  });

/**
 * Salva edição de Matéria + sincroniza o item do espelho correspondente.
 * Substitui o antigo broadcastChannelRef fantasma do evento "cabeca_atualizada":
 * agora o evento real só sai depois que as duas tabelas foram persistidas.
 */
export const updateMateriaEItem = createServerFn({ method: "POST" })
  .validator(UpdateMateriaSchema)
  .handler(async ({ data }) => {
    const dbQuery = await getDb();
    const { notifyEspelhoAlterado, publishEvent, ESPELHO_CHANNEL } = await getRealtime();
    const { error: materiaError } = await dbQuery(
      `UPDATE materias SET titulo = $1, cabeca = $2, tempo_vt = $3, tempo_cab = $4,
        deixa = $5, estrutura = $6, corpo = $7, credito_reporter = $8
       WHERE id = $9`,
      [
        data.titulo,
        data.cabeca,
        data.tempoVt,
        data.tempoCab,
        data.deixa,
        data.estrutura,
        data.corpo,
        data.creditoReporter,
        data.id,
      ]
    );
    if (materiaError) throw new Error(materiaError.message);

    const { error: itemError } = await dbQuery(
      `UPDATE espelho_itens SET assunto = $1, cabeca = $2, tempo_cab = $3, tempo = $4, status = $5 WHERE id = $6`,
      [data.titulo, data.cabeca, data.tempoCab, data.tempoVt, "pronto", data.itemId]
    );
    if (itemError) throw new Error(itemError.message);

    await publishEvent({
      channel: ESPELHO_CHANNEL,
      type: "CABECA_ATUALIZADA",
      payload: {
        itemId: data.itemId,
        cabeca: data.cabeca ?? "",
        assunto: data.titulo,
        tempo_cab: data.tempoCab ?? "0:00",
      },
    });
    await notifyEspelhoAlterado("materia_atualizada");
    return { success: true };
  });

/**
 * Save específico do CabecaEditorModal: atualiza só os campos de
 * cabeça/crédito/tempo na matéria vinculada ao item (o item em si já
 * é atualizado separadamente via updateItem antes desta chamada).
 */
export const updateMateriaCabeca = createServerFn({ method: "POST" })
  .validator(UpdateMateriaCabecaSchema)
  .handler(async ({ data }) => {
    const dbQuery = await getDb();
    const { error } = await dbQuery(
      `UPDATE materias SET credito_reporter = $1, cabeca = $2, tempo_cab = $3, tempo_vt = $4 WHERE id = $5`,
      [data.creditoReporter, data.cabeca, data.tempoCab, data.tempoVt, data.materiaId]
    );
    if (error) throw new Error(error.message);
    return { success: true };
  });

/**
 * Avisa os outros clients que alguém está editando um item (cursor de
 * "edição em andamento"). Não toca o banco — é estado efêmero, então
 * publicamos direto sem persistir nada.
 */
export const broadcastEditando = createServerFn({ method: "POST" })
  .validator(z.object({ itemId: z.string(), editando: z.boolean() }))
  .handler(async ({ data }) => {
    const { publishEvent, ESPELHO_CHANNEL } = await getRealtime();
    await publishEvent({
      channel: ESPELHO_CHANNEL,
      type: "EDITANDO",
      payload: { itemId: data.itemId, editando: data.editando },
    });
    return { success: true };
  });

export const broadcastProducao = createServerFn({ method: "POST" })
  .validator(z.object({ valor: z.string() }))
  .handler(async ({ data }) => {
    const { publishEvent, ESPELHO_CHANNEL } = await getRealtime();
    await publishEvent({
      channel: ESPELHO_CHANNEL,
      type: "PRODUCAO_ALTERADA",
      payload: { valor: data.valor },
    });
    return { success: true };
  });

export const broadcastMaster = createServerFn({ method: "POST" })
  .validator(z.object({ valor: z.string() }))
  .handler(async ({ data }) => {
    const { publishEvent, ESPELHO_CHANNEL } = await getRealtime();
    await publishEvent({
      channel: ESPELHO_CHANNEL,
      type: "MASTER_ALTERADO",
      payload: { valor: data.valor },
    });
    return { success: true };
  });
