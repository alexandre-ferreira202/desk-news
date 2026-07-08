import{c as A,r as d,t as O}from"./index-DQzgMyCS.js";const h=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],N=A("circle-check",h);const R=[["path",{d:"m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",key:"usdka0"}]],P=A("folder-open",R);class C{apiKey;baseURL="https://api.groq.com/openai/v1";requestTimeout=1e4;constructor(e){if(!e)throw new Error("Groq API Key não configurada");this.apiKey=e}async makeRequest(e,t=500,s=.3){const a=new AbortController,r=setTimeout(()=>a.abort(),this.requestTimeout);try{const o=await fetch(`${this.baseURL}/chat/completions`,{method:"POST",headers:{Authorization:`Bearer ${this.apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({model:"llama-3.3-70b-versatile",messages:e,temperature:s,max_tokens:t}),signal:a.signal});if(!o.ok){const u=await o.json().catch(()=>({}));throw new Error(`Groq API error: ${o.status} - ${u.error?.message||o.statusText}`)}return(await o.json()).choices[0]?.message?.content||""}finally{clearTimeout(r)}}async extractCreditsFromLauda(e,t,s){if(!e||e.length<10)return[];const a=`Você é assistente de edição de TV. Extraia NOMES PRÓPRIOS de pessoas desta LAUDA.

REGRAS ESTRITAS:
1. Retorne APENAS um JSON array válido
2. Inclua pessoas que têm nome próprio claramente identificável
3. Tipos: SONORA (entrevistado), PASSAGEM (repórter), ED_TEXTO (editor), REPÓRTER
4. Se não encontrar nomes, retorne: []
5. Deduplicar nomes automáticos

EXEMPLO DE SAÍDA:
[
  { "nome": "JOÃO SILVA", "tipo": "PASSAGEM", "funcao": "repórter" },
  { "nome": "MARIA SANTOS", "tipo": "SONORA", "funcao": "diretora" }
]

LAUDA A ANALISAR:
${e}

${t?`EDITOR TEXTO: ${t}`:""}
${s?`CRÉDITO REPORTER: ${s}`:""}

RESPONDA APENAS COM O JSON, SEM OUTROS TEXTOS.`;try{const o=(await this.makeRequest([{role:"user",content:a}],300,.2)).replace(/```json/g,"").replace(/```/g,"").trim(),c=JSON.parse(o);if(!Array.isArray(c))return[];const u=new Set;return c.filter(n=>{if(typeof n.nome!="string"||n.nome.length<2)return!1;const i=n.nome.toUpperCase().trim();return u.has(i)?!1:(u.add(i),!0)})}catch(r){return console.error("Erro ao extrair créditos:",r),[]}}async generateCaptions(e,t){if(!e||e.length<10)return[];const s=`Gere legendas para TV em português baseado neste texto.

REGRAS:
1. Máximo 42 caracteres por linha (TV 16:9)
2. Intervalo de 2-5 segundos entre legendas
3. Quebras naturais de frase
4. SEM pontuação final
5. Retorne APENAS um JSON array válido
6. Se não conseguir, retorne: []

FORMATO:
[
  { "offset_seconds": 0, "text": "primeira legenda" },
  { "offset_seconds": 3, "text": "segunda legenda" }
]

TEXTO:
${e}

Duração estimada: ${t||30} segundos

RESPONDA APENAS COM O JSON.`;try{const r=(await this.makeRequest([{role:"user",content:s}],500,.3)).replace(/```json/g,"").replace(/```/g,"").trim(),o=JSON.parse(r);return Array.isArray(o)?o.filter(c=>typeof c.offset_seconds=="number"&&typeof c.text=="string"):[]}catch(a){return console.error("Erro ao gerar legendas:",a),[]}}async suggestCredit(e,t){if(!t||t.length<1)return[];const s=`Contexto de TV: "${e}"
Usuário digitou: "${t}"

Sugira 3 completamentos CURTOS (máx 30 chars cada) que façam sentido.
Retorne APENAS um JSON array de strings:
["sugestão1", "sugestão2", "sugestão3"]`;try{const r=(await this.makeRequest([{role:"user",content:s}],200,.5)).replace(/```json/g,"").replace(/```/g,"").trim(),o=JSON.parse(r);return Array.isArray(o)?o.filter(c=>typeof c=="string"&&c.length>0).slice(0,3):[]}catch(a){return console.error("Erro ao sugerir crédito:",a),[]}}async validateCredit(e){const t=`É este um nome próprio válido para crédito de TV?
    
"${e}"

Responda APENAS com JSON:
{ "isValid": true/false, "suggestion": "nome corrigido se necessário" }`;try{const a=(await this.makeRequest([{role:"user",content:t}],150,.2)).replace(/```json/g,"").replace(/```/g,"").trim();return JSON.parse(a)}catch{return{isValid:!1}}}}const w=p=>{const[e,t]=d.useState(!1),[s,a]=d.useState([]),r=d.useRef(null);if(r.current===null&&p.apiKey)try{r.current=new C(p.apiKey)}catch(n){console.error("[useAutoCredits] Falha ao iniciar GroqService:",n)}const o=d.useCallback(async(n,i,m)=>{if(!n)return[];if(!r.current)return console.warn("[useAutoCredits] VITE_GROQ_API_KEY ausente — pulando extração automática."),[];t(!0);try{const g=await r.current.extractCreditsFromLauda(n,i,m);a(g);const f=g.map(l=>({line1:l.nome.toUpperCase(),line2:[l.tipo==="SONORA"?"🎤":l.tipo==="PASSAGEM"?"🎥":l.tipo==="REPÓRTER"?"🎙️":"📝",l.funcao||""].filter(Boolean).join(" ").trim()}));return p.deduplicate?f.filter((l,S,y)=>y.findIndex(E=>E.line1===l.line1)===S):f}catch(g){return console.error("Erro ao extrair créditos:",g),O.error("Erro ao processar créditos"),[]}finally{t(!1)}},[p.deduplicate]),c=d.useCallback(async(n,i)=>{if(!i||i.length<2||!r.current)return[];try{return await r.current.suggestCredit(n,i)}catch(m){return console.error("Erro ao sugerir crédito:",m),[]}},[]),u=d.useCallback(async n=>{if(!n||n.length<2||!r.current)return{isValid:!1};try{return await r.current.validateCredit(n)}catch{return{isValid:!1}}},[]);return{isLoading:e,suggestions:s,extractCredits:o,suggestCredit:c,validateCredit:u}};export{N as C,P as F,w as u};
