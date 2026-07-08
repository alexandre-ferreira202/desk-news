import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { c as createSsrRpc } from "./createSsrRpc-bvl1gotf.js";
import { a as createServerFn } from "./server-BA6c70hh.js";
import { z } from "zod";
import { Centrifuge } from "centrifuge";
import { toast } from "sonner";
import { f as formatSecondsToTime, p as parseTimeToSeconds } from "./time-Cm8BP1Rm.js";
import { MonitorPlay, Plus, Tv, Trash2, GripVertical, Pencil } from "lucide-react";
import { useSensors, useSensor, MouseSensor, TouchSensor, KeyboardSensor, DndContext, closestCorners } from "@dnd-kit/core";
import { sortableKeyboardCoordinates, SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { c as cn } from "./utils-H80jjgLf.js";
import { CSS } from "@dnd-kit/utilities";
import { c as Route } from "./router-NcdNWgek.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router";
import "@tanstack/react-router/ssr/server";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@neondatabase/serverless";
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
const loadEspelho = createServerFn({
  method: "GET"
}).validator(LoadEspelhoSchema).handler(createSsrRpc("76697f6fd832e8c2a55dd188ccdf151da4738fe43ff84d5bcc9b0c49fd4b1d2e"));
const loadMaterias = createServerFn({
  method: "GET"
}).handler(createSsrRpc("02b340d196a1cac93179b621254e4b76fafbcb39c3d96087419ff1de604c3fe1"));
const addBloco = createServerFn({
  method: "POST"
}).validator(AddBlocoSchema).handler(createSsrRpc("54ac081fb504d07b3a29cac2a582670dc34737ca258bb889caaeed7436f52cc5"));
const addItem = createServerFn({
  method: "POST"
}).validator(AddItemSchema).handler(createSsrRpc("05206c0ea5ee2dbef8f0e147d764c9a0a8647aed9ff6d01fb30f7ccb3a251f24"));
const addFromMateria = createServerFn({
  method: "POST"
}).validator(AddFromMateriaSchema).handler(createSsrRpc("224d8c768f3347c3f92d8983ddcd1244e81d568dd276a4659cc8c39c1898b39e"));
const addComercial = createServerFn({
  method: "POST"
}).validator(z.object({
  blocoId: z.string(),
  ordem: z.number().int()
})).handler(createSsrRpc("8df2436ef554a087e2de1c841e8ab42faaca65d80f6cdaeebd69c88fb358d5a7"));
const updateItem = createServerFn({
  method: "POST"
}).validator(UpdateItemSchema).handler(createSsrRpc("7f1d56274cffa9b6934a112fd197f1f53209925fa7eb845d0f1dc5d31956b016"));
const updateBloco = createServerFn({
  method: "POST"
}).validator(UpdateBlocoSchema).handler(createSsrRpc("d5898cc85174aad5305ae6a9f622f5768735b9bb0fa71af69cfb51bcb0531269"));
const delItem = createServerFn({
  method: "POST"
}).validator(DelByIdSchema).handler(createSsrRpc("7657aadb3a18b1a18cb604d675a07f98629860ad77a46a46264defe4d5c76737"));
const delBloco = createServerFn({
  method: "POST"
}).validator(DelByIdSchema).handler(createSsrRpc("982fe5ea074e7409ca8099d9e9fe41f7279adaee720fdc01dc861da661f741ce"));
const reorderItens = createServerFn({
  method: "POST"
}).validator(ReorderSchema).handler(createSsrRpc("ae0445be6b84652a5b906effc406ba66ea85da15802c02a53a0a00b54a174e60"));
const updateMateriaEItem = createServerFn({
  method: "POST"
}).validator(UpdateMateriaSchema).handler(createSsrRpc("e85925fb0da56b65110381c18b0278fce387e431af975bab11c552a6178fa9fc"));
const updateMateriaCabeca = createServerFn({
  method: "POST"
}).validator(UpdateMateriaCabecaSchema).handler(createSsrRpc("d97694f4dec741742a883b467a95412cb79eedec23478a722759a5b004147a13"));
const broadcastEditando = createServerFn({
  method: "POST"
}).validator(z.object({
  itemId: z.string(),
  editando: z.boolean()
})).handler(createSsrRpc("d97383b80276641d5a3ba2191809466e454aa6acf75bb376458ece566a1ac587"));
const broadcastProducao = createServerFn({
  method: "POST"
}).validator(z.object({
  valor: z.string()
})).handler(createSsrRpc("0f3b8b65b3951001b4da7c739479f2f80ac1887d404fe1a9f850840fa06b658e"));
const broadcastMaster = createServerFn({
  method: "POST"
}).validator(z.object({
  valor: z.string()
})).handler(createSsrRpc("de3a2cccd4cb23d0e00573cf8246aee2749ee24ba85cd5e587bdd8ad6a06e866"));
function useEspelhoRealtime(options) {
  const {
    onEspelhoAlterado,
    onCabecaAtualizada,
    onProducaoAlterada,
    onMasterAlterado,
    onItemStatusAlterado,
    url,
    token,
    debug = false
  } = options;
  const [editingItemIds, setEditingItemIds] = useState(/* @__PURE__ */ new Set());
  const [connected, setConnected] = useState(false);
  const callbacksRef = useRef(options);
  callbacksRef.current = options;
  const log = useCallback(
    (msg, data) => {
      if (debug) console.log(`[Espelho Realtime] ${msg}`, data ?? "");
    },
    [debug]
  );
  useEffect(() => {
    if (!url) {
      log("URL do Centrifugo não fornecida — realtime desabilitado, espelho não atualizará sozinho.");
      return;
    }
    const centrifuge = new Centrifuge(url, { token, debug });
    const sub = centrifuge.newSubscription("playout_events");
    centrifuge.on("connected", () => {
      log("✅ Conectado");
      setConnected(true);
    });
    centrifuge.on("disconnected", (ctx) => {
      log("❌ Desconectado", ctx);
      setConnected(false);
    });
    centrifuge.on("error", (ctx) => {
      log("Erro de conexão", ctx);
    });
    sub.on("publication", (ctx) => {
      const { type, payload } = ctx.data;
      log(`Evento recebido: ${type}`, payload);
      switch (type) {
        case "ESPELHO_ALTERADO": {
          callbacksRef.current.onEspelhoAlterado?.();
          break;
        }
        case "CABECA_ATUALIZADA": {
          callbacksRef.current.onCabecaAtualizada?.(payload);
          break;
        }
        case "PRODUCAO_ALTERADA": {
          callbacksRef.current.onProducaoAlterada?.(payload);
          break;
        }
        case "MASTER_ALTERADO": {
          callbacksRef.current.onMasterAlterado?.(payload);
          break;
        }
        case "ITEM_STATUS_ALTERADO": {
          callbacksRef.current.onItemStatusAlterado?.(payload);
          break;
        }
        case "EDITANDO": {
          const { itemId, editando } = payload;
          setEditingItemIds((prev) => {
            const next = new Set(prev);
            if (editando) next.add(itemId);
            else next.delete(itemId);
            return next;
          });
          break;
        }
        default:
          log(`Tipo de evento desconhecido: ${type}`);
      }
    });
    sub.on("subscribed", () => log("📡 Inscrito em playout_events"));
    sub.on("error", (ctx) => log("Erro na subscrição", ctx));
    sub.subscribe();
    centrifuge.connect();
    return () => {
      sub.unsubscribe();
      centrifuge.disconnect();
    };
  }, [url, token, debug]);
  return { editingItemIds, connected };
}
const PROGRAMAS = ["Jornal da Manhã", "Edição Meio-Dia", "Jornal da Noite"];
const FORMATOS = ["Nota Seca", "Nota Coberta", "VT", "Vivo", "Link", "Stand-up", "Estúdio", "Cabeça", "Gráfico", "Croma", "Comercial"];
const sanitize = (v) => v.replace(/<[^>]*>?/gm, "").trim();
function EspelhoPage() {
  const [date, setDate] = useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [programa, setPrograma] = useState("Todos");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("espelho_programa");
      if (saved) setPrograma(saved);
    }
  }, []);
  const [blocos, setBlocos] = useState([]);
  const [itens, setItens] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [modalMateria, setModalMateria] = useState(null);
  const [modalCabeca, setModalCabeca] = useState(null);
  const [plannedEditorialDuration, setPlannedEditorialDuration] = useState("00:00");
  const [masterDuration, setMasterDuration] = useState("00:00");
  const {
    editingItemIds,
    connected: realtimeConnected
  } = useEspelhoRealtime({
    url: "wss://centrifugo-production-449f.up.railway.app/connection/websocket",
    onEspelhoAlterado: () => load(),
    onCabecaAtualizada: (payload) => {
      setItens((prev) => prev.map((it) => it.id === payload.itemId ? {
        ...it,
        cabeca: payload.cabeca,
        assunto: payload.assunto,
        tempo_cab: payload.tempo_cab
      } : it));
    },
    onProducaoAlterada: (payload) => setPlannedEditorialDuration(payload.valor),
    onMasterAlterado: (payload) => setMasterDuration(payload.valor)
  });
  const broadcastEditing = useCallback((itemId, editando) => {
    broadcastEditando({
      data: {
        itemId,
        editando
      }
    }).catch((err) => console.error("Falha ao avisar edição em andamento:", err));
  }, []);
  const broadcastProducao$1 = useCallback((valor) => {
    broadcastProducao({
      data: {
        valor
      }
    }).catch((err) => console.error("Falha ao avisar mudança de produção:", err));
  }, []);
  const broadcastMaster$1 = useCallback((valor) => {
    broadcastMaster({
      data: {
        valor
      }
    }).catch((err) => console.error("Falha ao avisar mudança de master:", err));
  }, []);
  const sensors = useSensors(useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5
    }
  }), useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5
    }
  }), useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates
  }));
  const load = useCallback(async () => {
    try {
      const {
        blocos: loadedBlocos,
        itens: loadedItens
      } = await loadEspelho({
        data: {
          date,
          programa
        }
      });
      setBlocos(loadedBlocos);
      setItens(loadedItens);
    } catch (err) {
      toast.error(err.message);
    }
  }, [date, programa]);
  useEffect(() => {
    if (realtimeConnected) return;
    const interval = setInterval(() => {
      load();
    }, 15e3);
    return () => clearInterval(interval);
  }, [load, realtimeConnected]);
  useEffect(() => {
    loadMaterias().then((rows) => setMaterias(rows)).catch((err) => toast.error(err.message));
    setProfiles([]);
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const addBloco$1 = async () => {
    const prog = programa !== "Todos" ? programa : "Jornal da Manhã";
    const ordem = blocos.length + 1;
    try {
      await addBloco({
        data: {
          date,
          nome: `Bloco ${ordem}`,
          ordem,
          programa: prog
        }
      });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };
  const addItem$1 = async (bloco_id) => {
    const ordem = itens.filter((i) => i.bloco_id === bloco_id).length + 1;
    try {
      await addItem({
        data: {
          blocoId: bloco_id,
          ordem,
          assunto: "Novo item",
          formato: "VT",
          tempo: "1:30",
          tempoCab: "0:15"
        }
      });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };
  const addFromMateria$1 = async (bloco_id, materia_id) => {
    const m = materias.find((x) => x.id === materia_id);
    if (!m) return;
    const ordem = itens.filter((i) => i.bloco_id === bloco_id).length + 1;
    try {
      await addFromMateria({
        data: {
          blocoId: bloco_id,
          ordem,
          assunto: m.titulo,
          materiaId: materia_id,
          formato: "VT",
          tempo: m.tempo_vt ?? "1:30",
          tempoCab: m.tempo_cab ?? "0:15",
          cabeca: m.cabeca ?? null
        }
      });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };
  const addComercial$1 = async (bloco_id) => {
    const ordem = itens.filter((i) => i.bloco_id === bloco_id).length + 1;
    try {
      await addComercial({
        data: {
          blocoId: bloco_id,
          ordem
        }
      });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };
  const updateItem$1 = useCallback(async (id, patch) => {
    if (!Object.keys(patch).length) return;
    try {
      await updateItem({
        data: {
          id,
          patch
        }
      });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }, [load]);
  const updateBloco$1 = async (id, patch) => {
    if (!Object.keys(patch).length) return;
    try {
      await updateBloco({
        data: {
          id,
          patch
        }
      });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };
  const delItem$1 = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover este item do espelho?")) return;
    try {
      await delItem({
        data: {
          id
        }
      });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };
  const delBloco$1 = async (id) => {
    if (!window.confirm("Isso apagará o bloco e todos os itens dentro dele. Confirmar?")) return;
    try {
      await delBloco({
        data: {
          id
        }
      });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };
  const activeGlobalIndex = useMemo(() => {
    let counter = 0;
    let found = -1;
    blocos.forEach((block) => {
      itens.filter((i) => i.bloco_id === block.id).sort((a, b) => a.ordem - b.ordem).forEach((item) => {
        const s = String(item.status ?? "").toLowerCase();
        if (s === "no_ar" || s === "no ar") found = counter;
        counter++;
      });
    });
    return found;
  }, [itens, blocos]);
  const calcTotal = useCallback((i) => formatSecondsToTime(parseTimeToSeconds(i.tempo) + parseTimeToSeconds(i.tempo_cab)), []);
  const totalEditorialSec = useMemo(() => itens.filter((i) => i.formato !== "Comercial").reduce((a, i) => a + parseTimeToSeconds(i.tempo) + parseTimeToSeconds(i.tempo_cab), 0), [itens]);
  const totalGeralSec = useMemo(() => itens.reduce((acc, i) => acc + parseTimeToSeconds(i.tempo) + parseTimeToSeconds(i.tempo_cab), 0), [itens]);
  const plannedSec = useMemo(() => parseTimeToSeconds(plannedEditorialDuration), [plannedEditorialDuration]);
  const masterSec = useMemo(() => parseTimeToSeconds(masterDuration), [masterDuration]);
  const diffEditorial = useMemo(() => {
    const base = masterSec || totalEditorialSec;
    const diff = base - plannedSec;
    if (diff > 0) return {
      type: "estouro",
      value: diff
    };
    if (diff < 0) return {
      type: "sobra",
      value: Math.abs(diff)
    };
    return {
      type: "balanceado",
      value: 0
    };
  }, [masterSec, totalEditorialSec, plannedSec]);
  const profileName = useCallback((id) => id ? profiles.find((p) => p.id === id)?.display_name ?? "—" : "—", [profiles]);
  const handleDragEnd = async (event) => {
    const {
      active,
      over
    } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;
    const activeItem = itens.find((i) => i.id === activeId);
    if (!activeItem) return;
    const overItem = itens.find((i) => i.id === overId);
    const destinationBlocoId = overItem?.bloco_id ?? blocos.find((b) => b.id === overId)?.id ?? "";
    if (!destinationBlocoId) return;
    const sourceBlocoId = activeItem.bloco_id;
    let newItens = structuredClone(itens);
    const target = newItens.find((i) => i.id === activeId);
    if (sourceBlocoId === destinationBlocoId) {
      const blockItens = newItens.filter((i) => i.bloco_id === sourceBlocoId).sort((a, b) => a.ordem - b.ordem);
      const oldIdx = blockItens.findIndex((i) => i.id === activeId);
      const newIdx = blockItens.findIndex((i) => i.id === overId);
      const reordered = arrayMove(blockItens, oldIdx, newIdx);
      reordered.forEach((item, idx) => {
        const x = newItens.find((z2) => z2.id === item.id);
        if (x) x.ordem = idx + 1;
      });
    } else {
      target.bloco_id = destinationBlocoId;
      const sourceItens = newItens.filter((i) => i.bloco_id === sourceBlocoId && i.id !== activeId).sort((a, b) => a.ordem - b.ordem);
      sourceItens.forEach((item, idx) => {
        const x = newItens.find((z2) => z2.id === item.id);
        if (x) x.ordem = idx + 1;
      });
      const destItens = newItens.filter((i) => i.bloco_id === destinationBlocoId && i.id !== activeId).sort((a, b) => a.ordem - b.ordem);
      const overIdx = destItens.findIndex((i) => i.id === overId);
      overIdx >= 0 ? destItens.splice(overIdx, 0, target) : destItens.push(target);
      destItens.forEach((item, idx) => {
        const x = newItens.find((z2) => z2.id === item.id);
        if (x) {
          x.ordem = idx + 1;
          x.bloco_id = destinationBlocoId;
        }
      });
    }
    setItens(newItens);
    try {
      await reorderItens({
        data: {
          itens: newItens.map((item) => ({
            id: item.id,
            ordem: item.ordem,
            bloco_id: item.bloco_id
          }))
        }
      });
    } catch (err) {
      toast.error(err.message);
    }
    load();
  };
  const blockStartIndices = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    let counter = 0;
    blocos.forEach((b) => {
      map.set(b.id, counter);
      counter += itens.filter((i) => i.bloco_id === b.id).length;
    });
    return map;
  }, [blocos, itens]);
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 space-y-4 h-full flex flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border-b border-[#22c55e]/10 pb-3 shrink-0", children: [
      /* @__PURE__ */ jsx(MonitorPlay, { className: "h-5 w-5 text-[#22c55e]" }),
      /* @__PURE__ */ jsx("h1", { className: "text-h1 font-bold tracking-tight text-[#22c55e]", children: "ESPELHO" }),
      /* @__PURE__ */ jsx("span", { className: "text-label text-[#6b7280] hidden sm:inline", children: "Exibição · controle de tempo" }),
      /* @__PURE__ */ jsx("div", { className: "ml-auto flex items-center gap-2" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-6 flex-wrap gap-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 sm:gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsx("input", { type: "date", value: date, onChange: (e) => setDate(e.target.value), className: "px-4 py-3.5 rounded-md bg-[#141416] border border-[#22c55e]/20 text-body-sm text-[#ffffff] focus:outline-none focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10 transition-all duration-300" }),
      /* @__PURE__ */ jsxs("select", { value: programa, onChange: (e) => {
        setPrograma(e.target.value);
        try {
          localStorage.setItem("espelho_programa", e.target.value);
        } catch {
        }
      }, className: "px-4 py-3.5 rounded-md bg-[#141416] border border-[#22c55e]/20 text-body-sm font-bold text-[#ffffff] focus:outline-none focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10 transition-all duration-300 appearance-none cursor-pointer", children: [
        /* @__PURE__ */ jsx("option", { value: "Todos", children: "Todos os programas" }),
        PROGRAMAS.map((p) => /* @__PURE__ */ jsx("option", { value: p, className: "bg-[#141416] text-[#ffffff]", children: p }, p))
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "font-mono text-display-lg border border-[#22c55e]/20 rounded-lg px-8 py-4 bg-[#141416] backdrop-blur-xl shadow-xl flex flex-col items-center justify-center min-w-[160px]", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[#6b7280] text-label mb-1 font-black", children: "PRODUÇÃO" }),
        /* @__PURE__ */ jsx("input", { type: "text", value: plannedEditorialDuration, disabled: false, onChange: (e) => {
          if (/^\d{0,2}:?\d{0,2}$/.test(e.target.value) || e.target.value === "") {
            setPlannedEditorialDuration(e.target.value);
            broadcastProducao$1(e.target.value);
          }
        }, onBlur: () => {
          const formatted = formatSecondsToTime(plannedSec);
          setPlannedEditorialDuration(formatted);
          broadcastProducao$1(formatted);
        }, className: "bg-transparent text-[#ffffff] w-32 text-center focus:outline-none font-bold tracking-tighter text-h2", placeholder: "00:00" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "font-mono text-display-lg border border-[#22c55e]/20 rounded-lg px-8 py-4 bg-[#141416] backdrop-blur-xl shadow-xl flex flex-col items-center justify-center min-w-[160px]", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[#6b7280] text-label mb-1 font-black", children: "MASTER" }),
        /* @__PURE__ */ jsx("input", { type: "text", value: masterDuration, disabled: false, onChange: (e) => {
          if (/^\d{0,2}:?\d{0,2}$/.test(e.target.value) || e.target.value === "") {
            setMasterDuration(e.target.value);
            broadcastMaster$1(e.target.value);
          }
        }, onBlur: () => {
          const formatted = formatSecondsToTime(masterSec);
          setMasterDuration(formatted);
          broadcastMaster$1(formatted);
        }, className: "bg-transparent text-[#ffffff] w-32 text-center focus:outline-none font-bold tracking-tighter text-h2 tabular-nums", placeholder: "00:00" })
      ] }),
      diffEditorial.type !== "balanceado" && /* @__PURE__ */ jsxs("div", { className: cn("font-mono text-display-lg border rounded-lg px-8 py-4 flex flex-col items-center justify-center min-w-[160px] shadow-xl", diffEditorial.type === "estouro" ? "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30" : "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30"), children: [
        /* @__PURE__ */ jsx("span", { className: "text-label mb-1 font-black", children: diffEditorial.type === "estouro" ? "Estouro" : "Sobra" }),
        /* @__PURE__ */ jsx("span", { className: "font-bold text-h2 tabular-nums", children: formatSecondsToTime(diffEditorial.value) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "font-mono text-display-lg border border-[#22c55e]/20 rounded-lg px-8 py-4 bg-[#141416] backdrop-blur-xl flex flex-col items-center justify-center min-w-[160px] shadow-2xl", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[#6b7280] text-label mb-1 font-black", children: "TOTAL" }),
        /* @__PURE__ */ jsx("span", { className: "text-[#ffffff] font-bold tracking-tighter text-h2 tabular-nums", children: formatSecondsToTime(totalGeralSec) })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: addBloco$1, className: "inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#22c55e] text-white text-body-sm font-semibold uppercase tracking-widest shadow-lg transition-all duration-300 hover:shadow-xl active:scale-[0.98]", children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        " NOVO BLOCO"
      ] }),
      /* @__PURE__ */ jsxs("a", { href: `/tp?date=${date}&programa=${encodeURIComponent(programa ?? "")}`, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#141416] border border-[#22c55e]/20 text-white text-body-sm font-semibold uppercase tracking-wider hover:border-[#22c55e] hover:ring-4 hover:ring-[#22c55e]/10 transition-all duration-300 shadow-md active:scale-[0.98]", children: [
        /* @__PURE__ */ jsx(Tv, { className: "h-4 w-4 text-white" }),
        " TP"
      ] }),
      /* @__PURE__ */ jsxs("a", { href: `/playout?date=${date}&programa=${encodeURIComponent(programa ?? "")}`, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#141416] border border-[#22c55e]/20 text-white text-body-sm font-semibold uppercase tracking-wider hover:border-[#22c55e] hover:ring-4 hover:ring-[#22c55e]/10 transition-all duration-300 shadow-md active:scale-[0.98]", children: [
        /* @__PURE__ */ jsx(Tv, { className: "h-4 w-4 text-white" }),
        " PLAYOUT"
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(DndContext, { sensors, collisionDetection: closestCorners, onDragEnd: handleDragEnd, children: /* @__PURE__ */ jsxs("div", { className: "space-y-6 pb-12 overflow-y-auto flex-1", children: [
      blocos.length === 0 && /* @__PURE__ */ jsxs("div", { className: "bg-[#141416] border border-[#22c55e]/20 rounded-lg p-12 text-center text-[#6b7280] text-body-sm shadow-md", children: [
        "Nenhum bloco para esta data.",
        " Crie um bloco para começar."
      ] }),
      blocos.map((b) => {
        const itensB = itens.filter((i) => i.bloco_id === b.id).sort((a, b2) => a.ordem - b2.ordem);
        const tempoB = itensB.reduce((a, i) => a + parseTimeToSeconds(i.tempo) + parseTimeToSeconds(i.tempo_cab), 0);
        const startIdx = blockStartIndices.get(b.id) ?? 0;
        return /* @__PURE__ */ jsxs("div", { id: b.id, className: "group bg-[#141416] border border-[#22c55e]/20 rounded-lg overflow-hidden shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-5 py-4 bg-[#1c1c1f] border-b border-[#22c55e]/10 gap-3 flex-wrap", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
              /* @__PURE__ */ jsxs("span", { className: "font-mono text-xs px-2 py-0.5 bg-red-600 text-white rounded font-bold", children: [
                "B",
                String(b.ordem).padStart(2, "0")
              ] }),
              /* @__PURE__ */ jsx(BlockInput, { value: b.nome, onBlur: (v) => updateBloco$1(b.id, {
                nome: v
              }), className: "bg-transparent font-semibold focus:outline-none" }),
              /* @__PURE__ */ jsx("select", { value: b.programa, onChange: (e) => updateBloco$1(b.id, {
                programa: e.target.value
              }), className: "text-label bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20 rounded-full px-2.5 py-1 font-bold appearance-none cursor-pointer", children: PROGRAMAS.map((p) => /* @__PURE__ */ jsx("option", { value: p, className: "bg-[#141416] text-[#ffffff]", children: p }, p)) }),
              /* @__PURE__ */ jsx("span", { className: "text-label text-[#6b7280]", children: "Apresentador" }),
              /* @__PURE__ */ jsx(BlockInput, { value: b.apresentador ?? "", disabled: false, placeholder: "—", onBlur: (v) => updateBloco$1(b.id, {
                apresentador: v || null
              }), className: "bg-transparent text-body-sm focus:outline-none border-b border-transparent focus:border-[#22c55e] transition-colors duration-200" }),
              /* @__PURE__ */ jsx("span", { className: "font-mono text-caption text-[#6b7280] bg-[#09090b] px-2.5 py-1 rounded-md border border-[#22c55e]/10", children: formatSecondsToTime(tempoB) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxs("select", { onChange: (e) => {
                if (e.target.value) {
                  addFromMateria$1(b.id, e.target.value);
                  e.target.value = "";
                }
              }, className: "text-caption bg-[#141416] text-[#ffffff] border border-[#22c55e]/20 rounded-xl px-3 py-1.5 focus:outline-none appearance-none cursor-pointer transition-all duration-300 hover:border-[#22c55e]/30 min-w-[180px]", defaultValue: "", children: [
                /* @__PURE__ */ jsx("option", { value: "", className: "bg-[#141416] text-[#ffffff]", children: "+ Matéria publicada…" }),
                materias.map((m) => /* @__PURE__ */ jsx("option", { value: m.id, className: "bg-[#141416] text-[#ffffff]", children: m.titulo }, m.id))
              ] }),
              /* @__PURE__ */ jsx("button", { onClick: () => addItem$1(b.id), className: "text-caption px-3 py-1.5 rounded-xl border border-[#22c55e]/20 text-[#9ca3af] hover:bg-[#141416] hover:text-[#ffffff] transition-all duration-300 active:scale-[0.98]", children: "+ Item" }),
              /* @__PURE__ */ jsx("button", { onClick: () => addComercial$1(b.id), className: "text-caption px-3 py-1.5 rounded-xl border border-[#22c55e]/20 text-[#9ca3af] hover:bg-[#141416] hover:text-[#ffffff] transition-all duration-300 active:scale-[0.98]", children: "+ Comercial" }),
              /* @__PURE__ */ jsx("button", { onClick: () => delBloco$1(b.id), className: "text-caption px-3 py-1.5 rounded-md text-[#ef4444] hover:bg-[#ef4444]/10 transition-all duration-300 active:scale-[0.98] opacity-0 group-hover:opacity-100", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto text-[#9ca3af]", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm min-w-[1100px]", children: [
            /* @__PURE__ */ jsx("thead", { className: "text-[10px] uppercase tracking-widest text-[#6b7280]", children: /* @__PURE__ */ jsxs("tr", { className: "border-b [#22c55e]/10 bg-[#1c1c1f]", children: [
              /* @__PURE__ */ jsx("th", { className: "w-8" }),
              /* @__PURE__ */ jsx("th", { className: "text-center px-2 py-2 w-10", children: "Status" }),
              /* @__PURE__ */ jsx("th", { className: "text-left px-3 py-2 w-12", children: "#" }),
              /* @__PURE__ */ jsx("th", { className: "text-left px-3 py-2 min-w-[300px] w-[450px]", children: "Assunto / Cabeça" }),
              /* @__PURE__ */ jsx("th", { className: "text-left px-3 py-2 w-32", children: "Formato" }),
              /* @__PURE__ */ jsx("th", { className: "text-center px-3 py-2 w-20 font-mono", children: "Cab." }),
              /* @__PURE__ */ jsx("th", { className: "text-center px-3 py-2 w-20 font-mono", children: "VT" }),
              /* @__PURE__ */ jsx("th", { className: "text-center px-3 py-2 w-20 font-mono text-primary", children: "Total" }),
              /* @__PURE__ */ jsx("th", { className: "text-left px-3 py-2 w-40", children: "Editor texto" }),
              /* @__PURE__ */ jsx("th", { className: "text-left px-3 py-2 w-40", children: "Editor imagem" }),
              /* @__PURE__ */ jsx("th", { className: "text-left px-3 py-2 w-28", children: "Estado" }),
              /* @__PURE__ */ jsx("th", { className: "w-8" })
            ] }) }),
            /* @__PURE__ */ jsx(SortableContext, { items: itensB.map((i) => i.id), strategy: verticalListSortingStrategy, children: /* @__PURE__ */ jsxs("tbody", { children: [
              itensB.map((item, idx) => /* @__PURE__ */ jsx(SortableRow, { item, currentIndex: startIdx + idx, activeGlobalIndex, index: idx, canDelete: true, isEditing: editingItemIds.has(item.id), onUpdate: updateItem$1, onDelete: delItem$1, onSelectMateria: (m, i) => {
                broadcastEditing(i.id, true);
                setModalMateria({
                  materia: m,
                  item: i
                });
              }, onSelectCabeca: (i) => setModalCabeca(i), materias, profiles, profileName, calcTotal }, item.id)),
              itensB.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 12, className: "px-3 py-6 text-center text-xs text-[#6b7280]", children: "Sem itens. Adicione uma matéria publicada ou um item livre." }) })
            ] }) })
          ] }) })
        ] }, b.id);
      })
    ] }) }),
    modalMateria && /* @__PURE__ */ jsx(MateriaEditModal, { materia: modalMateria.materia, item: modalMateria.item, onClose: () => setModalMateria(null), onSave: async (updated) => {
      try {
        await updateMateriaEItem({
          data: {
            id: updated.id,
            itemId: modalMateria.item.id,
            titulo: updated.titulo,
            cabeca: updated.cabeca,
            tempoVt: updated.tempo_vt,
            tempoCab: updated.tempo_cab,
            deixa: updated.deixa,
            estrutura: updated.estrutura,
            corpo: updated.corpo,
            creditoReporter: updated.credito_reporter
          }
        });
        broadcastEditing(modalMateria.item.id, false);
        setModalMateria(null);
        toast.success("Matéria salva!");
      } catch (err) {
        toast.error(err.message);
      }
    } }),
    modalCabeca && /* @__PURE__ */ jsx(CabecaEditorModal, { item: modalCabeca, materia: materias.find((m) => m.id === modalCabeca.materia_id), onClose: () => setModalCabeca(null), onSave: async (id, assunto, cabeca, tempoCab, tempoVt, reporter) => {
      await updateItem$1(id, {
        assunto,
        cabeca,
        tempo_cab: tempoCab,
        tempo: tempoVt
      });
      if (modalCabeca.materia_id) {
        try {
          await updateMateriaCabeca({
            data: {
              materiaId: modalCabeca.materia_id,
              creditoReporter: reporter,
              cabeca,
              tempoCab,
              tempoVt
            }
          });
        } catch (err) {
          toast.error(err.message);
        }
      }
      setModalCabeca(null);
    } })
  ] });
}
function SortableRow({
  item,
  currentIndex,
  activeGlobalIndex,
  isEditing,
  onUpdate,
  onDelete,
  onSelectMateria,
  onSelectCabeca,
  materias,
  profileName,
  calcTotal
}) {
  const [assunto, setAssunto] = useState(item.assunto);
  const [tempoCab, setTempoCab] = useState(item.tempo_cab ?? "0:00");
  const [tempo, setTempo] = useState(item.tempo ?? "0:00");
  useEffect(() => {
    setAssunto(item.assunto);
    setTempoCab(item.tempo_cab ?? "0:00");
    setTempo(item.tempo ?? "0:00");
  }, [item.assunto, item.tempo_cab, item.tempo]);
  let dotColor = "bg-green-500";
  let rowOpacity = "opacity-100";
  if (item.status === "exibido") rowOpacity = "opacity-30 grayscale";
  let borderStyle = "border-l-4 border-transparent";
  if (item.status === "no_ar" || activeGlobalIndex !== -1 && currentIndex === activeGlobalIndex) {
    dotColor = "bg-red-600";
    borderStyle = "border-l-4 border-red-600";
  } else if (currentIndex < activeGlobalIndex) {
    dotColor = "bg-yellow-500";
  }
  const isLocked = item.status === "exibido" || item.status === "no_ar" || activeGlobalIndex !== -1 && currentIndex < activeGlobalIndex;
  const isCurrent = item.status === "no_ar" || activeGlobalIndex !== -1 && currentIndex === activeGlobalIndex;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: item.id,
    disabled: isLocked
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    position: "relative",
    pointerEvents: isLocked && !isCurrent ? "none" : "auto"
  };
  const linkedMateria = materias.find((x) => x.id === item.materia_id);
  return /* @__PURE__ */ jsxs("tr", { ref: setNodeRef, style, onDoubleClick: () => {
    if (isLocked && !isCurrent) return;
    if (item.materia_id) {
      if (linkedMateria) onSelectMateria(linkedMateria, item);
      else toast.info("Matéria não encontrada.");
    } else {
      toast.info("Item livre — vincule uma matéria publicada para ver a estrutura.");
    }
  }, className: cn("group border-b border-[#22c55e]/10 last:border-0 hover:bg-[#141416] transition-all duration-300", item.formato === "Comercial" && "bg-[#141416]", isDragging && "bg-[#1c1c1f] opacity-50 z-50 ring-2 ring-[#22c55e]/20", isCurrent && "bg-red-600/10 text-[#ffffff] font-bold", isEditing && !isCurrent && "border-l-4 border-yellow-400 bg-yellow-400/10", !isEditing && !isCurrent && borderStyle, item.status === "exibido" && "opacity-30 grayscale", rowOpacity), children: [
    /* @__PURE__ */ jsx("td", { className: cn("w-8 px-2 py-2 text-[#4b5563]", !isLocked && "cursor-grab active:cursor-grabbing hover:bg-[#22c55e]/10 transition-colors duration-200"), ...!isLocked ? attributes : {}, ...!isLocked ? listeners : {}, children: /* @__PURE__ */ jsx(GripVertical, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: cn("w-3 h-3 rounded-full border border-[#22c55e]/50 transition-all duration-200", isEditing && !isCurrent ? "bg-yellow-400 animate-pulse" : item.status === "cortado" ? "bg-gray-500" : dotColor) }) }) }),
    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-mono text-[10px] text-[#6b7280] font-bold", children: /* @__PURE__ */ jsx("span", { className: "text-[#6b7280]", children: String(currentIndex + 1).padStart(2, "0") }) }),
    /* @__PURE__ */ jsxs("td", { className: "px-3 py-2", children: [
      /* @__PURE__ */ jsx("input", { value: assunto, disabled: isLocked, onChange: (e) => setAssunto(e.target.value), onBlur: () => {
        const s = sanitize(assunto);
        setAssunto(s);
        onUpdate(item.id, {
          assunto: s
        });
      }, className: cn("w-full bg-transparent focus:outline-none font-medium text-[#ffffff]", isCurrent && "text-[#ffffff]") }),
      item.materia_id && linkedMateria && /* @__PURE__ */ jsxs("span", { className: cn("inline-block mt-1 text-[10px] uppercase tracking-widest font-bold", isCurrent ? "text-red-400" : "text-[#22c55e]"), children: [
        "● ",
        linkedMateria.titulo
      ] }),
      isEditing && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-1 mt-0.5 ml-2 text-[10px] uppercase tracking-widest font-bold text-yellow-500 animate-pulse", children: "✏ Editando" })
    ] }),
    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxs("select", { value: item.formato ?? "", disabled: isLocked, onChange: (e) => onUpdate(item.id, {
      formato: e.target.value || null
    }), className: "w-full text-caption bg-[#141416] border border-[#22c55e]/20 rounded-xl px-3 py-1.5 appearance-none cursor-pointer transition-all duration-300 hover:border-[#22c55e]/30", children: [
      /* @__PURE__ */ jsx("option", { value: "", className: "bg-[#141416] text-[#6b7280]", children: "—" }),
      FORMATOS.map((f) => /* @__PURE__ */ jsx("option", { value: f, children: f }, f))
    ] }) }),
    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: !isLocked ? /* @__PURE__ */ jsx("button", { type: "button", onClick: () => onSelectCabeca(item), className: "w-16 bg-transparent font-mono text-center text-[#6b7280] hover:bg-[#141416] hover:text-[#ffffff] rounded-md py-1 transition-all duration-300 border border-transparent hover:border-[#22c55e]/20 cursor-pointer focus:outline-none active:scale-[0.98]", title: "Editar texto da cabeça", children: /* @__PURE__ */ jsx("span", { className: "text-caption", children: tempoCab || "0:00" }) }) : /* @__PURE__ */ jsx("span", { className: "w-16 inline-block font-mono text-center text-[#6b7280]", children: tempoCab || "0:00" }) }),
    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: /* @__PURE__ */ jsx("input", { value: tempo, placeholder: "0:00", disabled: isLocked, onChange: (e) => setTempo(e.target.value), onBlur: () => onUpdate(item.id, {
      tempo: tempo || null
    }), className: "w-16 bg-transparent font-mono text-center focus:outline-none text-[#ffffff] text-caption" }) }),
    /* @__PURE__ */ jsx("td", { className: cn("px-3 py-2 text-center font-bold font-mono", isCurrent ? "text-[#ffffff]" : "text-[#22c55e]"), children: calcTotal(item) }),
    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsx("span", { className: "text-caption text-[#6b7280]", children: linkedMateria?.editor_texto ?? "—" }) }),
    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsx("span", { className: "text-caption text-[#6b7280]", children: linkedMateria?.editor_imagem ?? "—" }) }),
    /* @__PURE__ */ jsxs("td", { className: "px-3 py-2", children: [
      /* @__PURE__ */ jsxs("select", { value: item.status ?? "pendente", disabled: isLocked, onChange: (e) => onUpdate(item.id, {
        status: e.target.value
      }), className: "text-caption bg-[#141416] border border-[#22c55e]/20 rounded-md px-2 py-1 w-full appearance-none cursor-pointer transition-all duration-300 hover:border-[#22c55e]/30", children: [
        /* @__PURE__ */ jsx("option", { value: "pendente", children: "Pendente" }),
        /* @__PURE__ */ jsx("option", { value: "pronto", children: "Pronto" }),
        /* @__PURE__ */ jsx("option", { value: "no_ar", children: "🔴 No Ar" }),
        /* @__PURE__ */ jsx("option", { value: "exibido", children: "✅ Exibido" }),
        /* @__PURE__ */ jsx("option", { value: "cortado", children: "Cortado" })
      ] }),
      false
    ] }),
    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsx("button", { onClick: () => onDelete(item.id), className: "p-1.5 rounded-full text-[#6b7280] hover:bg-[#ef4444]/10 hover:text-[#ef4444] transition-all duration-300 active:scale-[0.98] opacity-0 group-hover:opacity-100", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }) }) })
  ] });
}
function BlockInput({
  value,
  onBlur,
  ...props
}) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return /* @__PURE__ */ jsx("input", { ...props, value: v, onChange: (e) => setV(e.target.value), onBlur: () => onBlur(v) });
}
function MateriaEditModal({
  materia,
  item,
  onClose,
  onSave
}) {
  const navigate = Route.useNavigate();
  const [titulo, setTitulo] = useState(materia.titulo);
  const [cabeca, setCabeca] = useState(materia.cabeca ?? "");
  const [tempoCab, setTempoCab] = useState(materia.tempo_cab ?? "0:00");
  const [tempoVt, setTempoVt] = useState(materia.tempo_vt ?? "0:00");
  const [deixa, setDeixa] = useState(materia.deixa ?? "");
  const [estrutura, setEstrutura] = useState(materia.estrutura ?? "");
  const [corpo, setCorpo] = useState(materia.corpo ?? "");
  const [reporter, setReporter] = useState(materia.credito_reporter ?? "");
  const wordCount = cabeca.trim().split(/\s+/).filter((w) => w.length > 0).length;
  const handleCabecaChange = (e) => {
    const v = e.target.value;
    setCabeca(v);
    const words = v.trim().split(/\s+/).filter((w) => w.length > 0).length;
    const sec = Math.ceil(words / 130 * 60);
    setTempoCab(`${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`);
  };
  const handleSave = () => onSave({
    ...materia,
    titulo,
    cabeca: cabeca || null,
    tempo_cab: tempoCab || null,
    tempo_vt: tempoVt || null,
    deixa: deixa || null,
    estrutura: estrutura || null,
    corpo: corpo || null,
    credito_reporter: reporter || null
  });
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-xl flex items-center justify-center p-4", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: "bg-[#141416] border border-yellow-400/30 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl flex flex-col", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-5 flex items-start justify-between gap-4 border-b border-yellow-400/20 sticky top-0 bg-[#141416] z-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-yellow-500 mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-yellow-400 animate-pulse inline-block" }),
          "Editando Matéria"
        ] }),
        /* @__PURE__ */ jsx("input", { value: titulo, onChange: (e) => setTitulo(e.target.value), className: "w-full bg-transparent text-h2 font-bold focus:outline-none border-b border-transparent focus:border-yellow-400/50 transition-colors text-[#ffffff]", placeholder: "TÍTULO DA MATÉRIA" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 shrink-0 mt-6", children: [
        /* @__PURE__ */ jsx("button", { type: "button", title: "Abrir lauda completa", onClick: () => navigate({
          to: "/redacao",
          search: {
            edit: materia.id
          }
        }), className: "p-2 rounded-xl text-[#6b7280] hover:bg-yellow-400/10 hover:text-yellow-400 transition-all duration-200 active:scale-[0.98]", children: /* @__PURE__ */ jsx(Pencil, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, title: "Fechar", className: "p-2 rounded-xl text-[#6b7280] hover:bg-[#141416] hover:text-[#ffffff] transition-all duration-200 active:scale-[0.98]", children: /* @__PURE__ */ jsx(Plus, { className: "h-6 w-6 rotate-45" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "border border-[#22c55e]/10 rounded-xl p-4 bg-[#141416]", children: [
          /* @__PURE__ */ jsx("div", { className: "text-label text-[#4b5563] mb-2", children: "Tempo Cabeça" }),
          /* @__PURE__ */ jsx("input", { value: tempoCab, onChange: (e) => setTempoCab(e.target.value), className: "w-full bg-transparent font-mono text-body text-center focus:outline-none border-b border-transparent focus:border-[#22c55e]/50 text-[#ffffff]" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border border-[#22c55e]/10 rounded-xl p-4 bg-[#141416]", children: [
          /* @__PURE__ */ jsx("div", { className: "text-label text-[#4b5563] mb-2", children: "Tempo VT" }),
          /* @__PURE__ */ jsx("input", { value: tempoVt, onChange: (e) => setTempoVt(e.target.value), className: "w-full bg-transparent font-mono text-body text-center focus:outline-none border-b border-transparent focus:border-[#22c55e]/50 text-[#ffffff]" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border border-[#22c55e]/10 rounded-xl p-4 bg-[#141416]", children: [
          /* @__PURE__ */ jsx("div", { className: "text-label text-[#4b5563] mb-2", children: "Repórter" }),
          /* @__PURE__ */ jsx("input", { value: reporter, onChange: (e) => setReporter(e.target.value), className: "w-full bg-transparent text-body focus:outline-none border-b border-transparent focus:border-[#22c55e]/50 text-[#ffffff]", placeholder: "Nome..." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsx("div", { className: "text-label text-[#4b5563]", children: "Cabeça do Âncora" }),
          /* @__PURE__ */ jsxs("div", { className: "text-label text-[#4b5563]", children: [
            "Palavras: ",
            /* @__PURE__ */ jsx("span", { className: "font-bold text-[#ffffff]", children: wordCount })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex", children: [
          /* @__PURE__ */ jsx("div", { className: "w-0.5 bg-[#22c55e] rounded-full mr-4 opacity-70 shrink-0" }),
          /* @__PURE__ */ jsx("textarea", { value: cabeca, onChange: handleCabecaChange, rows: 4, autoFocus: true, className: "w-full bg-transparent italic text-body focus:outline-none resize-none leading-relaxed text-[#ffffff] placeholder-[#4b5563]", placeholder: "Texto da cabeça do âncora..." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-label text-[#4b5563] mb-2", children: "Deixa (últimas palavras do VT)" }),
        /* @__PURE__ */ jsx("input", { value: deixa, onChange: (e) => setDeixa(e.target.value), className: "w-full px-3 py-2 rounded-xl bg-[#141416] border border-[#22c55e]/20 text-[#ffffff] focus:outline-none focus:border-[#22c55e] transition-all text-body-sm", placeholder: "...na reportagem de hoje." })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-label text-[#4b5563] mb-2", children: "Roteiro / Decupagem (VT)" }),
        /* @__PURE__ */ jsx("textarea", { value: estrutura, onChange: (e) => setEstrutura(e.target.value), rows: 7, className: "w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/20 text-[#ffffff] focus:outline-none focus:border-[#22c55e] transition-all resize-none font-mono text-caption leading-relaxed whitespace-pre-wrap placeholder-[#4b5563]", placeholder: "[OFF]\n\n[SONORA] NOME / FUNÇÃO\n\n[PASSAGEM] REPÓRTER // LOCAL" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-label text-[#4b5563] mb-2", children: "Matéria Web (texto corrido)" }),
        /* @__PURE__ */ jsx("textarea", { value: corpo, onChange: (e) => setCorpo(e.target.value), rows: 4, className: "w-full px-4 py-3 rounded-md bg-[#141416] border border-[#22c55e]/20 text-[#ffffff] focus:outline-none focus:border-[#22c55e] transition-all resize-none text-body-sm placeholder-[#4b5563]", placeholder: "Texto corrido para publicação web..." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-t border-[#22c55e]/10 flex justify-end sticky bottom-0 bg-[#141416]", children: /* @__PURE__ */ jsx("button", { type: "button", onClick: handleSave, className: "px-8 py-3 rounded-md text-body font-bold text-white bg-[#22c55e] shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98]", children: "SALVAR E FECHAR" }) })
  ] }) });
}
function CabecaEditorModal({
  item,
  materia,
  onClose,
  onSave
}) {
  const [assunto, setAssunto] = useState(item.assunto || "");
  const [text, setText] = useState(item.cabeca || "");
  const [tempoCab, setTempoCab] = useState(item.tempo_cab || "0:00");
  const [tempoVt, setTempoVt] = useState(item.tempo || "0:00");
  const [reporter, setReporter] = useState(materia?.credito_reporter || "");
  const wordCount = text.trim().split(/\s+/).filter((w) => w.length > 0).length;
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    const words = newText.trim().split(/\s+/).filter((w) => w.length > 0).length;
    const sec = Math.ceil(words / 130 * 60);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    setTempoCab(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-xl flex items-center justify-center p-4", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: "bg-[#141416] border border-[#22c55e]/20 rounded-lg max-w-2xl w-full shadow-2xl flex flex-col", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-5 flex items-start justify-between gap-4 border-b border-[#22c55e]/10", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("div", { className: "text-label text-[#22c55e] font-bold mb-1.5", children: "Estrutura da Matéria" }),
        /* @__PURE__ */ jsx("input", { value: assunto, onChange: (e) => setAssunto(e.target.value), className: "w-full bg-transparent text-h2 font-bold focus:outline-none uppercase border-b border-transparent focus:border-[#22c55e]/50 transition-colors duration-200 text-[#ffffff]", placeholder: "RETRANCA / ASSUNTO" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => onSave(item.id, assunto, text, tempoCab, tempoVt, reporter), className: "p-1.5 rounded-full text-[#6b7280] hover:bg-[#141416] hover:text-[#22c55e] transition-all duration-300 active:scale-[0.98]", title: "Salvar", children: /* @__PURE__ */ jsx(Pencil, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsx("button", { onClick: onClose, className: "p-1.5 rounded-full text-[#6b7280] hover:bg-[#141416] hover:text-[#ffffff] transition-all duration-300 active:scale-[0.98]", title: "Fechar", children: /* @__PURE__ */ jsx(Plus, { className: "h-6 w-6 rotate-45" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "border border-[#22c55e]/10 rounded-xl p-4 bg-[#141416]", children: [
          /* @__PURE__ */ jsx("div", { className: "text-label text-[#4b5563] mb-2", children: "Tempo (Cab + VT)" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center font-mono text-body-lg gap-2 text-[#ffffff]", children: [
            /* @__PURE__ */ jsx("input", { value: tempoCab, onChange: (e) => setTempoCab(e.target.value), className: "w-16 bg-transparent text-center focus:outline-none border-b border-transparent focus:border-[#22c55e]/50 transition-colors duration-200" }),
            /* @__PURE__ */ jsx("span", { className: "text-[#6b7280]", children: "+" }),
            /* @__PURE__ */ jsx("input", { value: tempoVt, onChange: (e) => setTempoVt(e.target.value), className: "w-16 bg-transparent text-center focus:outline-none border-b border-transparent focus:border-[#22c55e]/50 transition-colors duration-200" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border border-[#22c55e]/10 rounded-xl p-4 bg-[#141416]", children: [
          /* @__PURE__ */ jsx("div", { className: "text-label text-[#4b5563] mb-2", children: "Repórter" }),
          item.materia_id ? /* @__PURE__ */ jsx("input", { value: reporter, onChange: (e) => setReporter(e.target.value), className: "w-full bg-transparent text-body mt-1.5 focus:outline-none border-b border-transparent focus:border-[#22c55e]/50 transition-colors duration-200 text-[#ffffff]", placeholder: "Nome do repórter..." }) : /* @__PURE__ */ jsx("div", { className: "mt-1.5 text-body-sm text-[#6b7280]", children: "— (Item sem matéria)" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsx("div", { className: "text-label text-[#4b5563]", children: "Cabeça do Âncora" }),
          /* @__PURE__ */ jsxs("div", { className: "text-label text-[#4b5563]", children: [
            "Palavras:",
            " ",
            /* @__PURE__ */ jsx("span", { className: "font-bold text-[#ffffff]", children: wordCount })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex", children: [
          /* @__PURE__ */ jsx("div", { className: "w-0.5 bg-[#22c55e] rounded-l-sm mr-4 opacity-80" }),
          /* @__PURE__ */ jsx("textarea", { value: text, onChange: handleTextChange, className: "w-full h-32 bg-transparent italic text-body focus:outline-none resize-none leading-relaxed text-[#ffffff]", placeholder: "Digite a cabeça do âncora aqui...", autoFocus: true })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "pt-2 flex justify-end", children: /* @__PURE__ */ jsx("button", { onClick: () => onSave(item.id, assunto, text, tempoCab, tempoVt, reporter), className: "px-6 py-3 rounded-md text-body font-semibold text-white bg-[#22c55e] shadow-lg transition-all duration-300 hover:shadow-xl active:scale-[0.98]", children: "SALVAR E FECHAR" }) })
    ] })
  ] }) });
}
const SplitComponent = () => /* @__PURE__ */ jsx(EspelhoPage, {});
export {
  SplitComponent as component
};
