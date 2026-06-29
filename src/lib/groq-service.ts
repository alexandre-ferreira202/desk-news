export interface CreditoExtraido {
  nome: string;
  tipo: "SONORA" | "PASSAGEM" | "ED_TEXTO" | "ED_IMAGEM" | "REPÓRTER";
  funcao?: string;
}

export interface Legenda {
  offset_seconds: number;
  text: string;
}

export class GroqService {
  private apiKey: string;
  private baseURL = "https://api.groq.com/openai/v1";
  private requestTimeout = 10000; // 10s timeout

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("Groq API Key não configurada");
    this.apiKey = apiKey;
  }

  private async makeRequest(
    messages: Array<{ role: string; content: string }>,
    maxTokens: number = 500,
    temperature: number = 0.3
  ) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Groq API error: ${response.status} - ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Extrai créditos de uma lauda estruturada
   * Ideal para: SONORA, PASSAGEM, EDITOR TEXTO, REPÓRTER
   */
  async extractCreditsFromLauda(
    estrutura: string,
    editorTexto?: string,
    creditoReporter?: string
  ): Promise<CreditoExtraido[]> {
    if (!estrutura || estrutura.length < 10) {
      return [];
    }

    const prompt = `Você é assistente de edição de TV. Extraia NOMES PRÓPRIOS de pessoas desta LAUDA.

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
${estrutura}

${editorTexto ? `EDITOR TEXTO: ${editorTexto}` : ""}
${creditoReporter ? `CRÉDITO REPORTER: ${creditoReporter}` : ""}

RESPONDA APENAS COM O JSON, SEM OUTROS TEXTOS.`;

    try {
      const content = await this.makeRequest(
        [{ role: "user", content: prompt }],
        300,
        0.2
      );

      const cleanedContent = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleanedContent);

      if (!Array.isArray(parsed)) {
        return [];
      }

      // Validação e deduplicação
      const seen = new Set<string>();
      return parsed.filter((item) => {
        if (typeof item.nome !== "string" || item.nome.length < 2) {
          return false;
        }
        const key = item.nome.toUpperCase().trim();
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
    } catch (error) {
      console.error("Erro ao extrair créditos:", error);
      return [];
    }
  }

  /**
   * Gera legendas em tempo real baseado em texto
   */
  async generateCaptions(
    texto: string,
    duracao?: number
  ): Promise<Legenda[]> {
    if (!texto || texto.length < 10) {
      return [];
    }

    const prompt = `Gere legendas para TV em português baseado neste texto.

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
${texto}

Duração estimada: ${duracao || 30} segundos

RESPONDA APENAS COM O JSON.`;

    try {
      const content = await this.makeRequest(
        [{ role: "user", content: prompt }],
        500,
        0.3
      );

      const cleanedContent = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleanedContent);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(
        (item) =>
          typeof item.offset_seconds === "number" && typeof item.text === "string"
      );
    } catch (error) {
      console.error("Erro ao gerar legendas:", error);
      return [];
    }
  }

  /**
   * Sugestiona completamentos para um crédito parcial
   * Útil para autocomplete
   */
  async suggestCredit(
    contextText: string,
    userInput: string
  ): Promise<string[]> {
    if (!userInput || userInput.length < 1) {
      return [];
    }

    const prompt = `Contexto de TV: "${contextText}"
Usuário digitou: "${userInput}"

Sugira 3 completamentos CURTOS (máx 30 chars cada) que façam sentido.
Retorne APENAS um JSON array de strings:
["sugestão1", "sugestão2", "sugestão3"]`;

    try {
      const content = await this.makeRequest(
        [{ role: "user", content: prompt }],
        200,
        0.5
      );

      const cleanedContent = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleanedContent);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter((item) => typeof item === "string" && item.length > 0)
        .slice(0, 3);
    } catch (error) {
      console.error("Erro ao sugerir crédito:", error);
      return [];
    }
  }

  /**
   * Valida se um texto é um nome próprio válido para crédito
   */
  async validateCredit(text: string): Promise<{ isValid: boolean; suggestion?: string }> {
    const prompt = `É este um nome próprio válido para crédito de TV?
    
"${text}"

Responda APENAS com JSON:
{ "isValid": true/false, "suggestion": "nome corrigido se necessário" }`;

    try {
      const content = await this.makeRequest(
        [{ role: "user", content: prompt }],
        150,
        0.2
      );

      const cleanedContent = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      return JSON.parse(cleanedContent);
    } catch (error) {
      return { isValid: false };
    }
  }
}

// Export um singleton para reuso
export const createGroqService = (apiKey: string) => new GroqService(apiKey);
