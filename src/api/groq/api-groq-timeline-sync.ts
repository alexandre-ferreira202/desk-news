/**
 * API Route: /api/groq/timeline-sync
 * 
 * Endpoint para gerar timeline de sincronização usando a API Groq
 * Recebe texto da matéria e retorna eventos estruturados
 */

import Groq from "groq-sdk";
import { TimelineEvent } from "@/types/TimelineEvent";

// Inicializa cliente Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface TimelineSyncRequest {
  /** Texto completo da matéria */
  text: string;
  
  /** Duração estimada em segundos */
  duracao_estimada: number;
  
  /** Idioma do texto (padrão: pt-BR) */
  idioma?: string;
}

interface TimelineSyncResponse {
  eventos: TimelineEvent[];
  confianca: number;
  aviso?: string;
}

/**
 * Prompt para Groq gerar estrutura de timeline
 */
const PROMPT_TIMELINE = `
Você é um assistente especializado em produção de vídeo e jornalismo.
Analise o seguinte texto de matéria jornalística e identifique:
1. Legendas: Trechos importantes que devem aparecer como texto na tela
2. Créditos: Nomes e cargos de repórteres, fontes, editores
3. Pausas de sobe-som: Silêncios ou transições esperadas

Retorne APENAS um JSON válido com a seguinte estrutura (sem markdown):
{
  "eventos": [
    {
      "id": "legenda_1",
      "tipo": "legenda",
      "texto": "Texto da legenda",
      "inicio": 0.0,
      "fim": 5.2,
      "metadata": {"tom": "normal"}
    },
    {
      "id": "credito_1",
      "tipo": "credito",
      "texto": "Nome Completo / Cargo",
      "inicio": 10.5,
      "fim": 14.3,
      "metadata": {"repórter": "Nome", "cargo": "Cargo"}
    }
  ],
  "confianca": 0.85
}

Tempo estimado do vídeo: DURACAO_EST segundos

TEXTO DA MATÉRIA:
---
TEXTO_AQUI
---

INSTRUÇÕES:
- Cada evento deve ter duração recomendada baseada no comprimento do texto
- Legendas devem ter tempo suficiente para leitura (~0.1 segundos por letra)
- Créditos aparecem no final (~4-5 segundos)
- Espaços entre eventos representam "sobe-som"
- Todos os tempos em segundos (com uma casa decimal)
- ID deve ser único e descritivo
- Retorne APENAS JSON válido, sem explicações
`;

/**
 * Handler POST
 */
export async function POST(request: Request) {
  try {
    const body: TimelineSyncRequest = await request.json();

    if (!body.text) {
      return Response.json(
        { error: "Campo 'text' é obrigatório" },
        { status: 400 }
      );
    }

    if (body.text.trim().length < 50) {
      return Response.json(
        { error: "Texto muito curto para gerar timeline" },
        { status: 400 }
      );
    }

    const duracaoEst = body.duracao_estimada || 120;

    // Trunca texto se muito longo (Groq tem limite de tokens)
    const textoTruncado = body.text.substring(0, 3000);

    // Monta o prompt
    const prompt = PROMPT_TIMELINE.replace(
      "DURACAO_EST",
      duracaoEst.toString()
    ).replace("TEXTO_AQUI", textoTruncado);

    // Chama Groq API
    const message = await groq.messages.create({
      model: "mixtral-8x7b-32768", // Modelo rápido e capaz
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extrai conteúdo
    const conteudo = message.content[0];
    if (conteudo.type !== "text") {
      throw new Error("Resposta inesperada do Groq");
    }

    // Parseia JSON
    let timelineData: TimelineSyncResponse;
    try {
      // Remove possível markdown wrapper
      let jsonText = conteudo.text.trim();
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```\n?/, "").replace(/\n?```$/, "");
      }

      timelineData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Erro ao parsear resposta Groq:", conteudo.text);
      return Response.json(
        {
          error: "Falha ao processar resposta da IA",
          detalhes: "JSON inválido retornado",
        },
        { status: 500 }
      );
    }

    // Valida eventos
    if (!Array.isArray(timelineData.eventos)) {
      return Response.json(
        { error: "Estrutura de resposta inválida" },
        { status: 500 }
      );
    }

    // Filtra eventos válidos
    const eventosValidos = timelineData.eventos
      .filter((e) => {
        return (
          e.id &&
          e.tipo &&
          typeof e.texto === "string" &&
          typeof e.inicio === "number" &&
          typeof e.fim === "number" &&
          e.inicio >= 0 &&
          e.fim <= duracaoEst &&
          e.inicio < e.fim
        );
      })
      .map((e) => ({
        ...e,
        // Garante tipos corretos
        inicio: Number(e.inicio),
        fim: Number(e.fim),
      }));

    return Response.json({
      eventos: eventosValidos,
      confianca: timelineData.confianca || 0.7,
      aviso: eventosValidos.length === 0 ? "Nenhum evento foi identificado com confiança suficiente" : undefined,
    } as TimelineSyncResponse);
  } catch (error) {
    console.error("Erro na geração de timeline:", error);

    return Response.json(
      {
        error: "Erro ao gerar timeline",
        detalhes:
          error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

/**
 * Handler OPTIONS (para CORS)
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
