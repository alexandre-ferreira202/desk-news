import { useCallback, useRef, useState, useEffect } from "react";
import { GroqService, CreditoExtraido } from "@/lib/groq-service";
import { toast } from "sonner";

interface UseAutoCreditsOptions {
  apiKey: string;
  autoPopulate?: boolean; // Popular automaticamente ao carregar
  deduplicate?: boolean; // Remover créditos duplicados
}

interface GcCredit {
  line1: string;
  line2: string;
}

export const useAutoCredits = (options: UseAutoCreditsOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CreditoExtraido[]>([]);
  const groqRef = useRef<GroqService | null>(null);
  if (groqRef.current === null && options.apiKey) {
    try {
      groqRef.current = new GroqService(options.apiKey);
    } catch (err) {
      console.error("[useAutoCredits] Falha ao iniciar GroqService:", err);
    }
  }

  /**
   * Extrai créditos de uma estrutura/lauda
   */
  const extractCredits = useCallback(
    async (
      estrutura: string,
      editorTexto?: string,
      creditoReporter?: string
    ): Promise<GcCredit[]> => {
      if (!estrutura) return [];
      if (!groqRef.current) {
        console.warn("[useAutoCredits] VITE_GROQ_API_KEY ausente — pulando extração automática.");
        return [];
      }

      setIsLoading(true);
      try {
        const credits = await groqRef.current.extractCreditsFromLauda(
          estrutura,
          editorTexto,
          creditoReporter
        );

        setSuggestions(credits);

        // Converte para formato de GC
        const gcCredits: GcCredit[] = credits.map((c) => ({
          line1: c.nome.toUpperCase(),
          line2: [
            c.tipo === "SONORA"
              ? "🎤"
              : c.tipo === "PASSAGEM"
              ? "🎥"
              : c.tipo === "REPÓRTER"
              ? "🎙️"
              : "📝",
            c.funcao || "",
          ]
            .filter(Boolean)
            .join(" ")
            .trim(),
        }));

        if (options.deduplicate) {
          return gcCredits.filter(
            (item, idx, arr) =>
              arr.findIndex((x) => x.line1 === item.line1) === idx
          );
        }

        return gcCredits;
      } catch (error) {
        console.error("Erro ao extrair créditos:", error);
        toast.error("Erro ao processar créditos");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [options.deduplicate]
  );

  /**
   * Sugere completamentos enquanto o usuário digita
   */
  const suggestCredit = useCallback(
    async (contextText: string, userInput: string): Promise<string[]> => {
      if (!userInput || userInput.length < 2 || !groqRef.current) return [];

      try {
        return await groqRef.current.suggestCredit(contextText, userInput);
      } catch (error) {
        console.error("Erro ao sugerir crédito:", error);
        return [];
      }
    },
    []
  );

  /**
   * Valida um crédito digitado
   */
  const validateCredit = useCallback(async (text: string) => {
    if (!text || text.length < 2 || !groqRef.current) {
      return { isValid: false };
    }

    try {
      return await groqRef.current.validateCredit(text);
    } catch (error) {
      return { isValid: false };
    }
  }, []);

  return {
    isLoading,
    suggestions,
    extractCredits,
    suggestCredit,
    validateCredit,
  };
};
