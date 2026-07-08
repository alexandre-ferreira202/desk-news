import { c as createServerRpc } from "./createServerRpc-BJVsDShk.js";
import { a as createServerFn } from "./server-BA6c70hh.js";
import { z } from "zod";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
const getDb = () => import("./db.server-fzao4Bdq.js").then((m) => m.dbQuery);
const getRealtime = () => import("./realtime.server-B65yV1BL.js").then((m) => ({
  notifyEspelhoAlterado: m.notifyEspelhoAlterado,
  publishEvent: m.publishEvent,
  ESPELHO_CHANNEL: m.ESPELHO_CHANNEL
}));
const ItemStatusSchema = z.enum(["pendente", "pronto", "no_ar", "exibido", "cortado"]);
const LoadEspelhoSchema = z.object({
  date: z.string(),
  programa: z.string()
});
const AddBlocoSchema = z.object({
  date: z.string(),
  nome: z.string(),
  ordem: z.number().int(),
  programa: z.string()
});
const AddItemSchema = z.object({
  blocoId: z.string(),
  ordem: z.number().int(),
  assunto: z.string(),
  formato: z.string(),
  tempo: z.string(),
  tempoCab: z.string()
});
const AddFromMateriaSchema = z.object({
  blocoId: z.string(),
  ordem: z.number().int(),
  assunto: z.string(),
  materiaId: z.string(),
  formato: z.string(),
  tempo: z.string(),
  tempoCab: z.string(),
  cabeca: z.string().nullable()
});
const UpdateItemSchema = z.object({
  id: z.string(),
  patch: z.object({
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
    ordem: z.number().int()
  }).partial()
});
const UpdateBlocoSchema = z.object({
  id: z.string(),
  patch: z.object({
    nome: z.string(),
    ordem: z.number().int(),
    apresentador: z.string().nullable(),
    programa: z.string()
  }).partial()
});
const DelByIdSchema = z.object({
  id: z.string()
});
const ReorderItemSchema = z.object({
  id: z.string(),
  ordem: z.number().int(),
  bloco_id: z.string()
});
const ReorderSchema = z.object({
  itens: z.array(ReorderItemSchema)
});
const UpdateMateriaCabecaSchema = z.object({
  materiaId: z.string(),
  creditoReporter: z.string(),
  cabeca: z.string(),
  tempoCab: z.string(),
  tempoVt: z.string()
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
  creditoReporter: z.string().nullable()
});
const loadEspelho_createServerFn_handler = createServerRpc({
  id: "76697f6fd832e8c2a55dd188ccdf151da4738fe43ff84d5bcc9b0c49fd4b1d2e",
  name: "loadEspelho",
  filename: "src/functions/espelho.functions.ts"
}, (opts) => loadEspelho.__executeServer(opts));
const loadEspelho = createServerFn({
  method: "GET"
}).validator(LoadEspelhoSchema).handler(loadEspelho_createServerFn_handler, async ({
  data
}) => {
  const dbQuery = await getDb();
  const {
    date,
    programa
  } = data;
  let sql = `SELECT * FROM espelho_blocos WHERE data_edicao = $1`;
  const params = [date];
  if (programa !== "Todos") {
    sql += ` AND programa = $2`;
    params.push(programa);
  }
  sql += ` ORDER BY ordem`;
  const {
    rows: blocos,
    error: blocosError
  } = await dbQuery(sql, params);
  if (blocosError) throw new Error(blocosError.message);
  if (!blocos.length) {
    return {
      blocos: [],
      itens: []
    };
  }
  const blocoIds = blocos.map((b) => b.id);
  const placeholders = blocoIds.map((_value, idx) => `$${idx + 1}`).join(", ");
  const {
    rows: itens,
    error: itensError
  } = await dbQuery(`SELECT * FROM espelho_itens WHERE bloco_id IN (${placeholders}) ORDER BY ordem`, blocoIds);
  if (itensError) throw new Error(itensError.message);
  return {
    blocos,
    itens
  };
});
const loadMaterias_createServerFn_handler = createServerRpc({
  id: "02b340d196a1cac93179b621254e4b76fafbcb39c3d96087419ff1de604c3fe1",
  name: "loadMaterias",
  filename: "src/functions/espelho.functions.ts"
}, (opts) => loadMaterias.__executeServer(opts));
const loadMaterias = createServerFn({
  method: "GET"
}).handler(loadMaterias_createServerFn_handler, async () => {
  const dbQuery = await getDb();
  const {
    rows,
    error
  } = await dbQuery(`SELECT id, titulo, status, cabeca, tempo_vt, tempo_cab, deixa, editor_texto, editor_imagem, credito_reporter, estrutura, corpo
     FROM materias
     WHERE status = $1
     ORDER BY created_at DESC`, ["publicado"]);
  if (error) throw new Error(error.message);
  return rows;
});
const addBloco_createServerFn_handler = createServerRpc({
  id: "54ac081fb504d07b3a29cac2a582670dc34737ca258bb889caaeed7436f52cc5",
  name: "addBloco",
  filename: "src/functions/espelho.functions.ts"
}, (opts) => addBloco.__executeServer(opts));
const addBloco = createServerFn({
  method: "POST"
}).validator(AddBlocoSchema).handler(addBloco_createServerFn_handler, async ({
  data
}) => {
  const dbQuery = await getDb();
  const {
    notifyEspelhoAlterado
  } = await getRealtime();
  const {
    error
  } = await dbQuery(`INSERT INTO espelho_blocos (data_edicao, nome, ordem, programa) VALUES ($1, $2, $3, $4)`, [data.date, data.nome, data.ordem, data.programa]);
  if (error) throw new Error(error.message);
  await notifyEspelhoAlterado("bloco_criado");
  return {
    success: true
  };
});
const addItem_createServerFn_handler = createServerRpc({
  id: "05206c0ea5ee2dbef8f0e147d764c9a0a8647aed9ff6d01fb30f7ccb3a251f24",
  name: "addItem",
  filename: "src/functions/espelho.functions.ts"
}, (opts) => addItem.__executeServer(opts));
const addItem = createServerFn({
  method: "POST"
}).validator(AddItemSchema).handler(addItem_createServerFn_handler, async ({
  data
}) => {
  const dbQuery = await getDb();
  const {
    notifyEspelhoAlterado
  } = await getRealtime();
  const {
    error
  } = await dbQuery(`INSERT INTO espelho_itens (bloco_id, ordem, assunto, formato, tempo, tempo_cab)
       VALUES ($1, $2, $3, $4, $5, $6)`, [data.blocoId, data.ordem, data.assunto, data.formato, data.tempo, data.tempoCab]);
  if (error) throw new Error(error.message);
  await notifyEspelhoAlterado("item_criado");
  return {
    success: true
  };
});
const addFromMateria_createServerFn_handler = createServerRpc({
  id: "224d8c768f3347c3f92d8983ddcd1244e81d568dd276a4659cc8c39c1898b39e",
  name: "addFromMateria",
  filename: "src/functions/espelho.functions.ts"
}, (opts) => addFromMateria.__executeServer(opts));
const addFromMateria = createServerFn({
  method: "POST"
}).validator(AddFromMateriaSchema).handler(addFromMateria_createServerFn_handler, async ({
  data
}) => {
  const dbQuery = await getDb();
  const {
    notifyEspelhoAlterado
  } = await getRealtime();
  const {
    error
  } = await dbQuery(`INSERT INTO espelho_itens (bloco_id, ordem, assunto, materia_id, formato, tempo, tempo_cab, cabeca)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [data.blocoId, data.ordem, data.assunto, data.materiaId, data.formato, data.tempo, data.tempoCab, data.cabeca]);
  if (error) throw new Error(error.message);
  await notifyEspelhoAlterado("item_criado_de_materia");
  return {
    success: true
  };
});
const addComercial_createServerFn_handler = createServerRpc({
  id: "8df2436ef554a087e2de1c841e8ab42faaca65d80f6cdaeebd69c88fb358d5a7",
  name: "addComercial",
  filename: "src/functions/espelho.functions.ts"
}, (opts) => addComercial.__executeServer(opts));
const addComercial = createServerFn({
  method: "POST"
}).validator(z.object({
  blocoId: z.string(),
  ordem: z.number().int()
})).handler(addComercial_createServerFn_handler, async ({
  data
}) => {
  const dbQuery = await getDb();
  const {
    notifyEspelhoAlterado
  } = await getRealtime();
  const {
    error
  } = await dbQuery(`INSERT INTO espelho_itens (bloco_id, ordem, assunto, formato, tempo, tempo_cab, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`, [data.blocoId, data.ordem, "INTERVALO COMERCIAL", "Comercial", "3:00", "0:00", "pronto"]);
  if (error) throw new Error(error.message);
  await notifyEspelhoAlterado("comercial_criado");
  return {
    success: true
  };
});
const updateItem_createServerFn_handler = createServerRpc({
  id: "7f1d56274cffa9b6934a112fd197f1f53209925fa7eb845d0f1dc5d31956b016",
  name: "updateItem",
  filename: "src/functions/espelho.functions.ts"
}, (opts) => updateItem.__executeServer(opts));
const updateItem = createServerFn({
  method: "POST"
}).validator(UpdateItemSchema).handler(updateItem_createServerFn_handler, async ({
  data
}) => {
  const dbQuery = await getDb();
  const {
    notifyEspelhoAlterado,
    publishEvent,
    ESPELHO_CHANNEL
  } = await getRealtime();
  const keys = Object.keys(data.patch);
  if (!keys.length) return {
    success: true
  };
  const setClause = keys.map((k, idx) => `"${k}" = $${idx + 1}`).join(", ");
  const values = keys.map((k) => data.patch[k]);
  const {
    error
  } = await dbQuery(`UPDATE espelho_itens SET ${setClause} WHERE id = $${keys.length + 1}`, [...values, data.id]);
  if (error) throw new Error(error.message);
  if (data.patch.status) {
    await publishEvent({
      channel: ESPELHO_CHANNEL,
      type: "ITEM_STATUS_ALTERADO",
      payload: {
        itemId: data.id,
        status: data.patch.status
      }
    });
  }
  await notifyEspelhoAlterado("item_atualizado");
  return {
    success: true
  };
});
const updateBloco_createServerFn_handler = createServerRpc({
  id: "d5898cc85174aad5305ae6a9f622f5768735b9bb0fa71af69cfb51bcb0531269",
  name: "updateBloco",
  filename: "src/functions/espelho.functions.ts"
}, (opts) => updateBloco.__executeServer(opts));
const updateBloco = createServerFn({
  method: "POST"
}).validator(UpdateBlocoSchema).handler(updateBloco_createServerFn_handler, async ({
  data
}) => {
  const dbQuery = await getDb();
  const {
    notifyEspelhoAlterado
  } = await getRealtime();
  const keys = Object.keys(data.patch);
  if (!keys.length) return {
    success: true
  };
  const setClause = keys.map((k, idx) => `"${k}" = $${idx + 1}`).join(", ");
  const values = keys.map((k) => data.patch[k]);
  const {
    error
  } = await dbQuery(`UPDATE espelho_blocos SET ${setClause} WHERE id = $${keys.length + 1}`, [...values, data.id]);
  if (error) throw new Error(error.message);
  await notifyEspelhoAlterado("bloco_atualizado");
  return {
    success: true
  };
});
const delItem_createServerFn_handler = createServerRpc({
  id: "7657aadb3a18b1a18cb604d675a07f98629860ad77a46a46264defe4d5c76737",
  name: "delItem",
  filename: "src/functions/espelho.functions.ts"
}, (opts) => delItem.__executeServer(opts));
const delItem = createServerFn({
  method: "POST"
}).validator(DelByIdSchema).handler(delItem_createServerFn_handler, async ({
  data
}) => {
  const dbQuery = await getDb();
  const {
    notifyEspelhoAlterado
  } = await getRealtime();
  const {
    error
  } = await dbQuery(`DELETE FROM espelho_itens WHERE id = $1`, [data.id]);
  if (error) throw new Error(error.message);
  await notifyEspelhoAlterado("item_removido");
  return {
    success: true
  };
});
const delBloco_createServerFn_handler = createServerRpc({
  id: "982fe5ea074e7409ca8099d9e9fe41f7279adaee720fdc01dc861da661f741ce",
  name: "delBloco",
  filename: "src/functions/espelho.functions.ts"
}, (opts) => delBloco.__executeServer(opts));
const delBloco = createServerFn({
  method: "POST"
}).validator(DelByIdSchema).handler(delBloco_createServerFn_handler, async ({
  data
}) => {
  const dbQuery = await getDb();
  const {
    notifyEspelhoAlterado
  } = await getRealtime();
  const {
    error
  } = await dbQuery(`DELETE FROM espelho_blocos WHERE id = $1`, [data.id]);
  if (error) throw new Error(error.message);
  await notifyEspelhoAlterado("bloco_removido");
  return {
    success: true
  };
});
const reorderItens_createServerFn_handler = createServerRpc({
  id: "ae0445be6b84652a5b906effc406ba66ea85da15802c02a53a0a00b54a174e60",
  name: "reorderItens",
  filename: "src/functions/espelho.functions.ts"
}, (opts) => reorderItens.__executeServer(opts));
const reorderItens = createServerFn({
  method: "POST"
}).validator(ReorderSchema).handler(reorderItens_createServerFn_handler, async ({
  data
}) => {
  const dbQuery = await getDb();
  const {
    notifyEspelhoAlterado
  } = await getRealtime();
  for (const item of data.itens) {
    const {
      error
    } = await dbQuery(`UPDATE espelho_itens SET ordem = $1, bloco_id = $2 WHERE id = $3`, [item.ordem, item.bloco_id, item.id]);
    if (error) throw new Error(error.message);
  }
  await notifyEspelhoAlterado("itens_reordenados");
  return {
    success: true
  };
});
const updateMateriaEItem_createServerFn_handler = createServerRpc({
  id: "e85925fb0da56b65110381c18b0278fce387e431af975bab11c552a6178fa9fc",
  name: "updateMateriaEItem",
  filename: "src/functions/espelho.functions.ts"
}, (opts) => updateMateriaEItem.__executeServer(opts));
const updateMateriaEItem = createServerFn({
  method: "POST"
}).validator(UpdateMateriaSchema).handler(updateMateriaEItem_createServerFn_handler, async ({
  data
}) => {
  const dbQuery = await getDb();
  const {
    notifyEspelhoAlterado,
    publishEvent,
    ESPELHO_CHANNEL
  } = await getRealtime();
  const {
    error: materiaError
  } = await dbQuery(`UPDATE materias SET titulo = $1, cabeca = $2, tempo_vt = $3, tempo_cab = $4,
        deixa = $5, estrutura = $6, corpo = $7, credito_reporter = $8
       WHERE id = $9`, [data.titulo, data.cabeca, data.tempoVt, data.tempoCab, data.deixa, data.estrutura, data.corpo, data.creditoReporter, data.id]);
  if (materiaError) throw new Error(materiaError.message);
  const {
    error: itemError
  } = await dbQuery(`UPDATE espelho_itens SET assunto = $1, cabeca = $2, tempo_cab = $3, tempo = $4, status = $5 WHERE id = $6`, [data.titulo, data.cabeca, data.tempoCab, data.tempoVt, "pronto", data.itemId]);
  if (itemError) throw new Error(itemError.message);
  await publishEvent({
    channel: ESPELHO_CHANNEL,
    type: "CABECA_ATUALIZADA",
    payload: {
      itemId: data.itemId,
      cabeca: data.cabeca ?? "",
      assunto: data.titulo,
      tempo_cab: data.tempoCab ?? "0:00"
    }
  });
  await notifyEspelhoAlterado("materia_atualizada");
  return {
    success: true
  };
});
const updateMateriaCabeca_createServerFn_handler = createServerRpc({
  id: "d97694f4dec741742a883b467a95412cb79eedec23478a722759a5b004147a13",
  name: "updateMateriaCabeca",
  filename: "src/functions/espelho.functions.ts"
}, (opts) => updateMateriaCabeca.__executeServer(opts));
const updateMateriaCabeca = createServerFn({
  method: "POST"
}).validator(UpdateMateriaCabecaSchema).handler(updateMateriaCabeca_createServerFn_handler, async ({
  data
}) => {
  const dbQuery = await getDb();
  const {
    error
  } = await dbQuery(`UPDATE materias SET credito_reporter = $1, cabeca = $2, tempo_cab = $3, tempo_vt = $4 WHERE id = $5`, [data.creditoReporter, data.cabeca, data.tempoCab, data.tempoVt, data.materiaId]);
  if (error) throw new Error(error.message);
  return {
    success: true
  };
});
const broadcastEditando_createServerFn_handler = createServerRpc({
  id: "d97383b80276641d5a3ba2191809466e454aa6acf75bb376458ece566a1ac587",
  name: "broadcastEditando",
  filename: "src/functions/espelho.functions.ts"
}, (opts) => broadcastEditando.__executeServer(opts));
const broadcastEditando = createServerFn({
  method: "POST"
}).validator(z.object({
  itemId: z.string(),
  editando: z.boolean()
})).handler(broadcastEditando_createServerFn_handler, async ({
  data
}) => {
  const {
    publishEvent,
    ESPELHO_CHANNEL
  } = await getRealtime();
  await publishEvent({
    channel: ESPELHO_CHANNEL,
    type: "EDITANDO",
    payload: {
      itemId: data.itemId,
      editando: data.editando
    }
  });
  return {
    success: true
  };
});
const broadcastProducao_createServerFn_handler = createServerRpc({
  id: "0f3b8b65b3951001b4da7c739479f2f80ac1887d404fe1a9f850840fa06b658e",
  name: "broadcastProducao",
  filename: "src/functions/espelho.functions.ts"
}, (opts) => broadcastProducao.__executeServer(opts));
const broadcastProducao = createServerFn({
  method: "POST"
}).validator(z.object({
  valor: z.string()
})).handler(broadcastProducao_createServerFn_handler, async ({
  data
}) => {
  const {
    publishEvent,
    ESPELHO_CHANNEL
  } = await getRealtime();
  await publishEvent({
    channel: ESPELHO_CHANNEL,
    type: "PRODUCAO_ALTERADA",
    payload: {
      valor: data.valor
    }
  });
  return {
    success: true
  };
});
const broadcastMaster_createServerFn_handler = createServerRpc({
  id: "de3a2cccd4cb23d0e00573cf8246aee2749ee24ba85cd5e587bdd8ad6a06e866",
  name: "broadcastMaster",
  filename: "src/functions/espelho.functions.ts"
}, (opts) => broadcastMaster.__executeServer(opts));
const broadcastMaster = createServerFn({
  method: "POST"
}).validator(z.object({
  valor: z.string()
})).handler(broadcastMaster_createServerFn_handler, async ({
  data
}) => {
  const {
    publishEvent,
    ESPELHO_CHANNEL
  } = await getRealtime();
  await publishEvent({
    channel: ESPELHO_CHANNEL,
    type: "MASTER_ALTERADO",
    payload: {
      valor: data.valor
    }
  });
  return {
    success: true
  };
});
export {
  addBloco_createServerFn_handler,
  addComercial_createServerFn_handler,
  addFromMateria_createServerFn_handler,
  addItem_createServerFn_handler,
  broadcastEditando_createServerFn_handler,
  broadcastMaster_createServerFn_handler,
  broadcastProducao_createServerFn_handler,
  delBloco_createServerFn_handler,
  delItem_createServerFn_handler,
  loadEspelho_createServerFn_handler,
  loadMaterias_createServerFn_handler,
  reorderItens_createServerFn_handler,
  updateBloco_createServerFn_handler,
  updateItem_createServerFn_handler,
  updateMateriaCabeca_createServerFn_handler,
  updateMateriaEItem_createServerFn_handler
};
