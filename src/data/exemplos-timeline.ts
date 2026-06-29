/**
 * Exemplos de dados TimelineEvent para testes e demonstração
 * Use esses arquivos para mock data em desenvolvimento
 */

// ============================================================================
// EXEMPLO 1: Timeline Simples - Reportagem com Sonora
// ============================================================================

export const EXEMPLO_REPORTAGEM_SIMPLES = {
  eventos: [
    {
      id: "evt_001_abertura",
      tipo: "legenda",
      texto: "Mercado de Tecnologia em Expansão",
      inicio: 0.0,
      fim: 3.5,
      metadata: { tom: "normal" },
    },
    {
      id: "evt_002_pausa",
      tipo: "pausa",
      texto: "Sobe-som de transição",
      inicio: 3.5,
      fim: 5.0,
      metadata: {},
    },
    {
      id: "evt_003_corpo",
      tipo: "legenda",
      texto:
        "Segundo relatório do setor, investimentos cresceram 25% no semestre",
      inicio: 5.0,
      fim: 12.5,
      metadata: { tom: "normal" },
    },
    {
      id: "evt_004_sonora",
      tipo: "sobe-som",
      texto: "Entrevista com analista do mercado financeiro",
      inicio: 12.5,
      fim: 28.0,
      metadata: {},
    },
    {
      id: "evt_005_legenda_encerr",
      tipo: "legenda",
      texto: "Especialistas apontam IA como principal motor de crescimento",
      inicio: 28.0,
      fim: 35.0,
      metadata: { tom: "destaque" },
    },
    {
      id: "evt_006_credito_reporter",
      tipo: "credito",
      texto: "Maria Silva / Repórter Especial",
      inicio: 35.0,
      fim: 39.0,
      metadata: { repórter: "Maria Silva", cargo: "Repórter Especial" },
    },
    {
      id: "evt_007_credito_editor",
      tipo: "credito",
      texto: "João Santos / Editor de Imagem",
      inicio: 39.0,
      fim: 43.0,
      metadata: { cargo: "Editor de Imagem" },
    },
  ],
  duracao_total: 45,
  atualizado_em: new Date().toISOString(),
};

// ============================================================================
// EXEMPLO 2: Timeline Complexa - Múltiplos Créditos e Efeitos
// ============================================================================

export const EXEMPLO_TIMELINE_COMPLEXA = {
  eventos: [
    {
      id: "evt_100_abertura_fx",
      tipo: "transicao",
      texto: "Fade in",
      inicio: 0.0,
      fim: 1.0,
      metadata: {},
    },
    {
      id: "evt_101_lead",
      tipo: "legenda",
      texto: "DESEMPREGO CAI PARA MENOR PATAMAR EM 12 ANOS",
      inicio: 1.0,
      fim: 6.0,
      metadata: { tom: "destaque" },
    },
    {
      id: "evt_102_transicao",
      tipo: "transicao",
      texto: "Slide da direita",
      inicio: 6.0,
      fim: 7.0,
      metadata: {},
    },
    {
      id: "evt_103_corpo_1",
      tipo: "legenda",
      texto: "Segundo dados do Instituto Brasileiro de Estatística",
      inicio: 7.0,
      fim: 13.5,
      metadata: { tom: "normal" },
    },
    {
      id: "evt_104_corpo_2",
      tipo: "legenda",
      texto:
        "A taxa de desemprego atingiu 7,8% no trimestre, redução de 0,9 ponto percentual",
      inicio: 13.5,
      fim: 22.0,
      metadata: { tom: "normal" },
    },
    {
      id: "evt_105_efeito_zoom",
      tipo: "efeito",
      texto: "Zoom em gráfico",
      inicio: 22.0,
      fim: 24.0,
      metadata: { intensidade: 75 },
    },
    {
      id: "evt_106_sonora_1",
      tipo: "sobe-som",
      texto: "Economista comenta redução",
      inicio: 24.0,
      fim: 38.0,
      metadata: {},
    },
    {
      id: "evt_107_reacao",
      tipo: "legenda",
      texto: "Especialista aponta política monetária como fator determinante",
      inicio: 38.0,
      fim: 44.0,
      metadata: { tom: "normal" },
    },
    {
      id: "evt_108_encerramento",
      tipo: "legenda",
      texto: "Mercado reage positivamente aos dados",
      inicio: 44.0,
      fim: 50.0,
      metadata: { tom: "destaque" },
    },
    {
      id: "evt_109_credito_reporter",
      tipo: "credito",
      texto: "Carlos Mendes / Correspondente Especial",
      inicio: 50.0,
      fim: 54.0,
      metadata: {
        repórter: "Carlos Mendes",
        cargo: "Correspondente Especial",
      },
    },
    {
      id: "evt_110_credito_editor_txt",
      tipo: "credito",
      texto: "Ana Costa / Editora de Texto",
      inicio: 54.0,
      fim: 58.0,
      metadata: { cargo: "Editora de Texto" },
    },
    {
      id: "evt_111_credito_editor_img",
      tipo: "credito",
      texto: "Roberto Lima / Editor de Imagem",
      inicio: 58.0,
      fim: 62.0,
      metadata: { cargo: "Editor de Imagem" },
    },
    {
      id: "evt_112_fade_out",
      tipo: "transicao",
      texto: "Fade out",
      inicio: 62.0,
      fim: 63.0,
      metadata: {},
    },
  ],
  duracao_total: 63,
  atualizado_em: new Date().toISOString(),
};

// ============================================================================
// EXEMPLO 3: Timeline Mínima - Apenas Créditos
// ============================================================================

export const EXEMPLO_TIMELINE_MINIMA = {
  eventos: [
    {
      id: "evt_001",
      tipo: "credito",
      texto: "Produção / Maria Silva",
      inicio: 0.0,
      fim: 3.0,
      metadata: { cargo: "Produção" },
    },
    {
      id: "evt_002",
      tipo: "credito",
      texto: "Imagens / Arquivo TV",
      inicio: 3.0,
      fim: 6.0,
      metadata: { cargo: "Imagens" },
    },
    {
      id: "evt_003",
      tipo: "credito",
      texto: "Edição / João Pedro",
      inicio: 6.0,
      fim: 9.0,
      metadata: { cargo: "Edição" },
    },
  ],
  duracao_total: 10,
  atualizado_em: new Date().toISOString(),
};

// ============================================================================
// EXEMPLO 4: Timeline para Teste de Conflito
// ============================================================================

export const EXEMPLO_COM_CONFLITO = {
  eventos: [
    {
      id: "evt_conflito_1",
      tipo: "legenda",
      texto: "Primeiro evento",
      inicio: 0.0,
      fim: 5.0,
      metadata: { tom: "normal" },
    },
    {
      id: "evt_conflito_2",
      tipo: "legenda",
      texto: "Evento sobreposto (CONFLITO!)",
      inicio: 3.0, // Sobrepõe com evt_conflito_1
      fim: 8.0,
      metadata: { tom: "alerta" },
    },
    {
      id: "evt_ok",
      tipo: "credito",
      texto: "Evento sem conflito",
      inicio: 10.0,
      fim: 14.0,
      metadata: { cargo: "Teste" },
    },
  ],
  duracao_total: 20,
  atualizado_em: new Date().toISOString(),
};

// ============================================================================
// EXEMPLO 5: Timeline Longa - VT de 5 Minutos
// ============================================================================

export const EXEMPLO_VT_LONGO = {
  eventos: [
    {
      id: "seg1_abertura",
      tipo: "legenda",
      texto: "ESPECIAL: A HISTÓRIA DA INTELIGÊNCIA ARTIFICIAL",
      inicio: 0.0,
      fim: 5.0,
      metadata: { tom: "destaque" },
    },
    {
      id: "seg1_pausa",
      tipo: "pausa",
      texto: "Sobe-som",
      inicio: 5.0,
      fim: 8.0,
      metadata: {},
    },
    {
      id: "seg2_inicio",
      tipo: "legenda",
      texto: "Nos anos 1950, máquinas começaram a aprender sozinhas",
      inicio: 8.0,
      fim: 18.0,
      metadata: { tom: "normal" },
    },
    {
      id: "seg2_sonora",
      tipo: "sobe-som",
      texto: "Narração histórica",
      inicio: 18.0,
      fim: 45.0,
      metadata: {},
    },
    {
      id: "seg3_legenda",
      tipo: "legenda",
      texto: "Alan Turing formulou o teste que verificaria inteligência artificial",
      inicio: 45.0,
      fim: 55.0,
      metadata: { tom: "normal" },
    },
    {
      id: "seg4_pausa",
      tipo: "pausa",
      texto: "Transição",
      inicio: 55.0,
      fim: 58.0,
      metadata: {},
    },
    {
      id: "seg5_moderna",
      tipo: "legenda",
      texto: "Hoje, IA está em smartphones, carros e assistentes virtuais",
      inicio: 58.0,
      fim: 68.0,
      metadata: { tom: "normal" },
    },
    {
      id: "seg6_sonora",
      tipo: "sobe-som",
      texto: "Entrevista com especialista",
      inicio: 68.0,
      fim: 95.0,
      metadata: {},
    },
    {
      id: "seg7_impacto",
      tipo: "legenda",
      texto: "O impacto econômico já ultrapassa 1 trilhão de dólares",
      inicio: 95.0,
      fim: 105.0,
      metadata: { tom: "destaque" },
    },
    {
      id: "seg8_encerramento",
      tipo: "legenda",
      texto: "A revolução da IA está apenas começando",
      inicio: 105.0,
      fim: 112.0,
      metadata: { tom: "destaque" },
    },
    {
      id: "credito_reporter",
      tipo: "credito",
      texto: "Documentário realizado por Paulo Silva",
      inicio: 112.0,
      fim: 117.0,
      metadata: { cargo: "Documentarista" },
    },
    {
      id: "credito_pesquisa",
      tipo: "credito",
      texto: "Pesquisa: Instituto de Tecnologia",
      inicio: 117.0,
      fim: 121.0,
      metadata: { cargo: "Pesquisa" },
    },
    {
      id: "credito_final",
      tipo: "credito",
      texto: "Produção TV — 2024",
      inicio: 121.0,
      fim: 125.0,
      metadata: { cargo: "Produção" },
    },
  ],
  duracao_total: 125,
  atualizado_em: new Date().toISOString(),
};

// ============================================================================
// EXEMPLO 6: Template Vazio (para novo projeto)
// ============================================================================

export const EXEMPLO_VAZIO = {
  eventos: [],
  duracao_total: 120, // 2 minutos padrão
  atualizado_em: new Date().toISOString(),
};

// ============================================================================
// UTILITÁRIO: Seletor de Exemplos
// ============================================================================

export type ExemploTimelineKey =
  | "simples"
  | "complexa"
  | "minima"
  | "conflito"
  | "longo"
  | "vazio";

export const EXEMPLOS_TIMELINE: Record<ExemploTimelineKey, typeof EXEMPLO_REPORTAGEM_SIMPLES> = {
  simples: EXEMPLO_REPORTAGEM_SIMPLES,
  complexa: EXEMPLO_TIMELINE_COMPLEXA,
  minima: EXEMPLO_TIMELINE_MINIMA,
  conflito: EXEMPLO_COM_CONFLITO,
  longo: EXEMPLO_VT_LONGO,
  vazio: EXEMPLO_VAZIO,
};

export function obterExemploTimeline(
  chave: ExemploTimelineKey = "simples"
) {
  return EXEMPLOS_TIMELINE[chave];
}

// ============================================================================
// RESPOSTA EXEMPLO DE API GROQ
// ============================================================================

export const EXEMPLO_RESPOSTA_GROQ = {
  eventos: [
    {
      id: "groq_legenda_1",
      tipo: "legenda",
      texto:
        "Inteligência Artificial revoluciona mercado de tecnologia brasileiro",
      inicio: 0.0,
      fim: 6.2,
      metadata: { tom: "normal" },
    },
    {
      id: "groq_pausa_1",
      tipo: "pausa",
      texto: "Transição com sobe-som",
      inicio: 6.2,
      fim: 8.5,
      metadata: {},
    },
    {
      id: "groq_legenda_2",
      tipo: "legenda",
      texto: "Segundo dados de mercado, setor cresceu 45% no último ano",
      inicio: 8.5,
      fim: 15.8,
      metadata: { ton: "normal" },
    },
    {
      id: "groq_sonora_1",
      tipo: "sobe-som",
      texto: "Entrevista com CEO de startup de IA",
      inicio: 15.8,
      fim: 38.0,
      metadata: {},
    },
    {
      id: "groq_credito_1",
      tipo: "credito",
      texto: "Carolina Martins / Repórter de Tecnologia",
      inicio: 38.0,
      fim: 42.5,
      metadata: {
        repórter: "Carolina Martins",
        cargo: "Repórter de Tecnologia",
      },
    },
    {
      id: "groq_credito_2",
      tipo: "credito",
      texto: "Lucas Ferreira / Editor de Vídeo",
      inicio: 42.5,
      fim: 47.0,
      metadata: { cargo: "Editor de Vídeo" },
    },
  ],
  confianca: 0.87,
  aviso: undefined,
};

/**
 * Hook customizado para carregar exemplo (útil para componentes de teste)
 */
export function useExemploTimeline(chave: ExemploTimelineKey = "simples") {
  const [timeline, setTimeline] = React.useState(() =>
    obterExemploTimeline(chave)
  );

  const alternarExemplo = (novaChave: ExemploTimelineKey) => {
    setTimeline(obterExemploTimeline(novaChave));
  };

  return {
    timeline,
    setTimeline,
    alternarExemplo,
  };
}
