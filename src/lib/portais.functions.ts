import { createServerFn } from "@tanstack/react-start";

export interface PortalNews {
  title: string;
  link: string;
  pubDate: string | null;
  description: string | null;
}

export interface PortalFeed {
  portal: string;
  url: string;
  items: PortalNews[];
  error: string | null;
}

const PORTAIS: { name: string; url: string }[] = [
  { name: "G1 Maranhão", url: "https://g1.globo.com/rss/g1/ma/" },
  { name: "Imirante", url: "https://imirante.com/rss" },
  { name: "O Imparcial", url: "https://oimparcial.com.br/feed/" },
  { name: "Jornal Pequeno", url: "https://jornalpequeno.com.br/feed/" },
  { name: "Maranhão Hoje", url: "https://mahoje.com.br/feed/" },
  { name: "Atual7", url: "https://atual7.com/feed/" },
  { name: "Blog do Gilberto Léda", url: "https://gilbertoleda.com.br/feed/" },
  { name: "Maranhão de Verdade", url: "https://maranhaodeverdade.com.br/feed/" },
  { name: "O Informante", url: "https://oinformante.blog.br/feed/" },
  { name: "Diego Emir", url: "https://diegoemir.com.br/feed/" },
];

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function tag(block: string, name: string): string | null {
  const re = new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i");
  const m = block.match(re);
  return m ? decode(m[1]) : null;
}

function parseRss(xml: string): PortalNews[] {
  const items: PortalNews[] = [];
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
    if (title) items.push({ title, link, pubDate, description: description ? description.slice(0, 300) : null });
  }
  return items;
}

export const fetchPortais = createServerFn({ method: "GET" }).handler(async (): Promise<PortalFeed[]> => {
  const results = await Promise.all(
    PORTAIS.map(async (p): Promise<PortalFeed> => {
      try {
        const res = await fetch(p.url, {
          headers: { "User-Agent": "Mozilla/5.0 NewsdeskBot/1.0", Accept: "application/rss+xml, application/xml, text/xml, */*" },
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return { portal: p.name, url: p.url, items: [], error: `HTTP ${res.status}` };
        const xml = await res.text();
        return { portal: p.name, url: p.url, items: parseRss(xml), error: null };
      } catch (e) {
        return { portal: p.name, url: p.url, items: [], error: (e as Error).message };
      }
    })
  );
  return results;
});
