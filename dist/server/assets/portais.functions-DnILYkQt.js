import { T as TSS_SERVER_FUNCTION, c as createServerFn } from "./server-BDJWADlf.js";
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
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const PORTAIS = [{
  name: "G1 Maranhão",
  url: "https://g1.globo.com/rss/g1/ma/"
}, {
  name: "Imirante",
  url: "https://imirante.com/rss"
}, {
  name: "O Imparcial",
  url: "https://oimparcial.com.br/feed/"
}, {
  name: "Jornal Pequeno",
  url: "https://jornalpequeno.com.br/feed/"
}, {
  name: "Maranhão Hoje",
  url: "https://mahoje.com.br/feed/"
}, {
  name: "Atual7",
  url: "https://atual7.com/feed/"
}, {
  name: "Blog do Gilberto Léda",
  url: "https://gilbertoleda.com.br/feed/"
}, {
  name: "Maranhão de Verdade",
  url: "https://maranhaodeverdade.com.br/feed/"
}, {
  name: "O Informante",
  url: "https://oinformante.blog.br/feed/"
}, {
  name: "Diego Emir",
  url: "https://diegoemir.com.br/feed/"
}];
function decode(s) {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/<[^>]+>/g, "").trim();
}
function tag(block, name) {
  const re = new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i");
  const m = block.match(re);
  return m ? decode(m[1]) : null;
}
function parseRss(xml) {
  const items = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
  for (const b of blocks.slice(0, 12)) {
    const title = tag(b, "title") || "";
    let link = tag(b, "link") || "";
    if (!link || link.length < 5) {
      const m = b.match(/<link[^>]*href=["']([^"']+)["']/i) || b.match(/<link>([^<]+)/i);
      if (m) link = m[1].trim();
    }
    const pubDate = tag(b, "pubDate") || tag(b, "published") || tag(b, "updated");
    const description = tag(b, "description") || tag(b, "summary") || tag(b, "content");
    if (title) items.push({
      title,
      link,
      pubDate,
      description: description ? description.slice(0, 300) : null
    });
  }
  return items;
}
const fetchPortais_createServerFn_handler = createServerRpc({
  id: "5b84dd6bae09f625244fad5fee7756a6109e2c06693485ab5f78995fc67389e4",
  name: "fetchPortais",
  filename: "../../../Downloads/newsflow-studio/newsflow-studio-main/src/lib/portais.functions.ts"
}, (opts) => fetchPortais.__executeServer(opts));
const fetchPortais = createServerFn({
  method: "GET"
}).handler(fetchPortais_createServerFn_handler, async () => {
  const results = await Promise.all(PORTAIS.map(async (p) => {
    try {
      const res = await fetch(p.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 NewsdeskBot/1.0",
          Accept: "application/rss+xml, application/xml, text/xml, */*"
        },
        signal: AbortSignal.timeout(8e3)
      });
      if (!res.ok) return {
        portal: p.name,
        url: p.url,
        items: [],
        error: `HTTP ${res.status}`
      };
      const xml = await res.text();
      return {
        portal: p.name,
        url: p.url,
        items: parseRss(xml),
        error: null
      };
    } catch (e) {
      return {
        portal: p.name,
        url: p.url,
        items: [],
        error: e.message
      };
    }
  }));
  return results;
});
export {
  fetchPortais_createServerFn_handler
};
