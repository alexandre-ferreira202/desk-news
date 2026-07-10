import { c as createServerRpc } from "./createServerRpc-v8b6VE5V.js";
import { c as createServerFn } from "./server-BacCHfls.js";
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
  id: "43cce26e2d9c7d7236c79f7189b57e0301d0bfdf4db0018bb7aacebb767ee4ad",
  name: "loadEspelho",
  filename: "../../Downloads/desknews-main/src/functions/espelho.functions.ts"
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
  id: "ad2fc5518f7239326e3f3a0014c6f45b5ab402d4edc4959403c81d196c966beb",
  name: "loadMaterias",
  filename: "../../Downloads/desknews-main/src/functions/espelho.functions.ts"
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
  id: "6535f7b9b94bb8e973875c63a5ec85ddceca0579fc9e2286b926d6706e83f4e9",
  name: "addBloco",
  filename: "../../Downloads/desknews-main/src/functions/espelho.functions.ts"
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
  id: "c7b0f794176848649130066b4ca4f5e76b7ec7f2789bcea8c15d21d2fa33f465",
  name: "addItem",
  filename: "../../Downloads/desknews-main/src/functions/espelho.functions.ts"
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
  id: "569d48dd3002cdf42ee23072ec5c032b99dce65d5ab3b7541e5e35250267b272",
  name: "addFromMateria",
  filename: "../../Downloads/desknews-main/src/functions/espelho.functions.ts"
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
  id: "4c8755d3d99eca613e3e71e4d5b9474154e21982b56b52eedc1770c0fad09431",
  name: "addComercial",
  filename: "../../Downloads/desknews-main/src/functions/espelho.functions.ts"
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
  id: "884a019b0675dc4500b80314145702afebb87b89cb76241817016da28b5c01c2",
  name: "updateItem",
  filename: "../../Downloads/desknews-main/src/functions/espelho.functions.ts"
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
  id: "a96ac18cb419a723a0f4800ac8e5cc5974752c47500bbf49b78ca4e27297a018",
  name: "updateBloco",
  filename: "../../Downloads/desknews-main/src/functions/espelho.functions.ts"
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
  id: "750da42b80265ce82c347f2dd53a36328a71128f315f1e899f628d76f31910b4",
  name: "delItem",
  filename: "../../Downloads/desknews-main/src/functions/espelho.functions.ts"
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
  id: "d8ca7de4792b1cb7cb60e38e9707eb843bc68895044e007e4ef3707b9a9a7daa",
  name: "delBloco",
  filename: "../../Downloads/desknews-main/src/functions/espelho.functions.ts"
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
  id: "a16ed97afda1647cb228bc144676893695ecfa5039f79d6d0d6adb86d7254391",
  name: "reorderItens",
  filename: "../../Downloads/desknews-main/src/functions/espelho.functions.ts"
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
  id: "901abf35ed427a78ae718dbfcd63e1e3a16327ca38bc35011a0bd895f29fb182",
  name: "updateMateriaEItem",
  filename: "../../Downloads/desknews-main/src/functions/espelho.functions.ts"
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
  id: "c5fde7026c8577aec8eccb352826fea710d1f3ec475d04a5873672a718e0dee6",
  name: "updateMateriaCabeca",
  filename: "../../Downloads/desknews-main/src/functions/espelho.functions.ts"
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
  id: "c8f3229b6fc13b6377288ce4e334b48d97871bff593728663ba6244afcebfa9b",
  name: "broadcastEditando",
  filename: "../../Downloads/desknews-main/src/functions/espelho.functions.ts"
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
  id: "b7b6deffab0d610de331893c033da16fb3c7c1a93806f97cbefc567e0e8ca0a4",
  name: "broadcastProducao",
  filename: "../../Downloads/desknews-main/src/functions/espelho.functions.ts"
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
  id: "f45e228d1f674f40ad9099b74933bc7f0b19577f51673eacad4852455b9ed645",
  name: "broadcastMaster",
  filename: "../../Downloads/desknews-main/src/functions/espelho.functions.ts"
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
