/**
 * DADOS DAS MATÉRIAS — ESTRUTURA COMPLETA
 * 
 * Este arquivo contém todas as informações das matérias para o Playout:
 * - Cinegrafista (IMAGENS)
 * - Produtor (PRODUÇÃO)
 * - Editor de Texto (ED. TEXTO)
 * - Editor de Imagens (ED. IMAGENS)
 * - Sonoras (com nome, função)
 * - Passagens (com nome, local, texto)
 */

export interface Sonora {
  nome: string;
  funcao: string;
  texto?: string;
}

export interface Passagem {
  nome: string;
  local: string;
  texto?: string;
}

export interface MateriaCompleta {
  id: string;
  retranca: string;
  titulo: string;
  cinegrafista: string;      // [IMAGENS]
  produtor: string;          // [PRODUÇÃO]
  editor_texto: string;      // [ED. TEXTO]
  editor_imagem: string;     // [ED. IMAGENS]
  sonoras: Sonora[];
  passagens: Passagem[];
}

/**
 * BANCO DE DADOS DE MATÉRIAS
 * Organize por retranca/ID para que o playout busque facilmente
 */
export const MATERIAS_DB: Record<string, MateriaCompleta> = {
  // ============================================
  // EXEMPLOS SIMPLES PARA TESTE
  // ============================================
  "covid": {
    id: "covid",
    retranca: "COVID",
    titulo: "Pacientes na fila de espera e hospitais operando no limite",
    cinegrafista: "MIGUEL LINDOSO",
    produtor: "SILVA SANTOS",
    editor_texto: "ALEXANDRE FERREIRA",
    editor_imagem: "ALEXANDRE FERREIRA",
    sonoras: [
      {
        nome: "Dona Joana",
        funcao: "Dona de casa",
        texto: 'Só toque de recolher, só suspensão de festas.'
      },
      {
        nome: "José Alencar",
        funcao: "Especialista em Saúde",
        texto: "A situação é de extrema gravidade."
      }
    ],
    passagens: [
      {
        nome: "Sidney Pereira",
        local: "Hospital de Referência (São Luís)",
        texto: "O vai-vem das ambulâncias mostra a urgência."
      }
    ]
  },

  "educacao": {
    id: "educacao",
    retranca: "EDUCAÇÃO",
    titulo: "Escolas retomam aulas presenciais",
    cinegrafista: "CARLOS MENDES",
    produtor: "MARIA OLIVEIRA",
    editor_texto: "JOÃO SILVA",
    editor_imagem: "PEDRO COSTA",
    sonoras: [
      {
        nome: "Prof. Ana Silva",
        funcao: "Diretora de Escola",
        texto: "As crianças estão voltando com muita alegria."
      }
    ],
    passagens: [
      {
        nome: "Roberto Santos",
        local: "Escola Municipal Central",
        texto: "Os alunos retomam as atividades presenciais."
      }
    ]
  },

  "economia": {
    id: "economia",
    retranca: "ECONOMIA",
    titulo: "Inflação sobe e afeta orçamento das famílias",
    cinegrafista: "LUCAS FERREIRA",
    produtor: "FERNANDA COSTA",
    editor_texto: "PAULO BRASIL",
    editor_imagem: "ARTHUR LIMA",
    sonoras: [
      {
        nome: "Sr. Marcelo",
        funcao: "Comerciante",
        texto: "Os preços estão subindo muito."
      }
    ],
    passagens: [
      {
        nome: "Beatriz Torres",
        local: "Centro Comercial",
        texto: "Consumidores sentem os impactos da inflação."
      }
    ]
  },

  // ============================================
  // EXEMPLO 1: COVID-19 NO MARANHÃO (Original)
  // ============================================
  "covid-maranhao": {
    id: "covid-maranhao",
    retranca: "COVID-19",
    titulo: "Pacientes na fila de espera e hospitais operando no limite",
    cinegrafista: "MIGUEL LINDOSO",
    produtor: "SILVA SANTOS",
    editor_texto: "ALEXANDRE FERREIRA",
    editor_imagem: "ALEXANDRE FERREIRA",
    sonoras: [
      {
        nome: "Dona Joana",
        funcao: "Dona de casa",
        texto: 'Só toque de recolher, só suspensão de festas, isso não tem mais efetividade.'
      },
      {
        nome: "José Alencar",
        funcao: "Especialista em Saúde",
        texto: "A situação é de extrema gravidade."
      }
    ],
    passagens: [
      {
        nome: "Sidney Pereira",
        local: "Hospital de Referência (São Luís)",
        texto: "O vai-vem das ambulâncias mostra a urgência na busca por vagas."
      }
    ]
  },

  // ============================================
  // EXEMPLO 2: EDUCAÇÃO
  // ============================================
  "educacao-escola": {
    id: "educacao-escola",
    retranca: "EDUCAÇÃO",
    titulo: "Escolas retomam aulas presenciais após pandemia",
    cinegrafista: "CARLOS MENDES",
    produtor: "MARIA OLIVEIRA",
    editor_texto: "JOÃO SILVA",
    editor_imagem: "PEDRO COSTA",
    sonoras: [
      {
        nome: "Prof. Ana Silva",
        funcao: "Diretora de Escola",
        texto: "As crianças estão voltando com muita alegria."
      }
    ],
    passagens: [
      {
        nome: "Roberto Santos",
        local: "Escola Municipal Central",
        texto: "Os alunos retomam as atividades presenciais."
      }
    ]
  },

  // ============================================
  // EXEMPLO 3: ECONOMIA
  // ============================================
  "economia-inflacao": {
    id: "economia-inflacao",
    retranca: "ECONOMIA",
    titulo: "Inflação sobe e afeta orçamento das famílias",
    cinegrafista: "LUCAS FERREIRA",
    produtor: "FERNANDA COSTA",
    editor_texto: "PAULO BRASIL",
    editor_imagem: "ARTHUR LIMA",
    sonoras: [
      {
        nome: "Sr. Marcelo",
        funcao: "Comerciante",
        texto: "Os preços estão subindo muito."
      },
      {
        nome: "Dra. Carla",
        funcao: "Economista",
        texto: "A tendência é continuar subindo."
      }
    ],
    passagens: [
      {
        nome: "Beatriz Torres",
        local: "Centro Comercial",
        texto: "Consumidores sentem os impactos da inflação."
      }
    ]
  },

  // ============================================
  // ADICIONE SUAS MATÉRIAS AQUI
  // ============================================
};

/**
 * FUNÇÃO AUXILIAR: Buscar matéria pelo ID/retranca
 */
export function buscarMateria(retrancaOuId: string): MateriaCompleta | null {
  if (!retrancaOuId) {
    console.warn("⚠️ buscarMateria chamado com valor vazio");
    return null;
  }
  
  const chave = retrancaOuId.toLowerCase().trim();
  console.log(`🔎 Buscando em MATERIAS_DB com chave: "${chave}"`);
  console.log("📋 Chaves disponíveis:", Object.keys(MATERIAS_DB));
  
  // Busca exata
  if (MATERIAS_DB[chave]) {
    console.log("✅ Encontrado por busca exata!");
    return MATERIAS_DB[chave];
  }
  
  // Busca parcial (se a chave contém o retranca)
  const resultado = Object.values(MATERIAS_DB).find(m => 
    m.retranca.toLowerCase().includes(chave) ||
    m.id.toLowerCase().includes(chave) ||
    m.titulo.toLowerCase().includes(chave)
  );
  
  if (resultado) {
    console.log("✅ Encontrado por busca parcial!", resultado);
    return resultado;
  }
  
  console.warn(`❌ Matéria não encontrada para: "${retrancaOuId}"`);
  return null;
}

/**
 * FUNÇÃO AUXILIAR: Listar todas as matérias
 */
export function listarMaterias(): MateriaCompleta[] {
  return Object.values(MATERIAS_DB);
}

/**
 * FUNÇÃO AUXILIAR: Adicionar nova matéria (útil se integrar com formulário)
 */
export function adicionarMateria(materia: MateriaCompleta): void {
  MATERIAS_DB[materia.id.toLowerCase()] = materia;
}
