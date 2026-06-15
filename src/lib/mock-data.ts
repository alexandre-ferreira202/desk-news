// Mock Data para Desenvolvimento do Dashboard DeskNews

export const mockPautas = [
  {
    id: "pauta-001",
    titulo: "Alojamento em São Luís cria emprego",
    status: "publicado",
    turno: "Manhã",
    prioridade: "alta",
    reporter: "Eduardo Santos",
    produtor: "João Silva",
    data_pauta: "2024-05-30",
  },
  {
    id: "pauta-002",
    titulo: "Operação da Polícia Civil em Timon",
    status: "em_producao",
    turno: "Tarde",
    prioridade: "alta",
    reporter: "Maria Costa",
    produtor: "Carlos Oliveira",
    data_pauta: "2024-05-30",
  },
  {
    id: "pauta-003",
    titulo: "Turismo Centro Histórico em foco",
    status: "pendente",
    turno: "Noite",
    prioridade: "media",
    reporter: "João Silva",
    produtor: "Eduardo Santos",
    data_pauta: "2024-05-30",
  },
  {
    id: "pauta-004",
    titulo: "Cassação Vereador Nina Rodrigues",
    status: "publicado",
    turno: "Manhã",
    prioridade: "baixa",
    reporter: "Carlos Oliveira",
    produtor: "Maria Costa",
    data_pauta: "2024-05-30",
  },
  {
    id: "pauta-005",
    titulo: "Evento de tecnologia na capital",
    status: "em_producao",
    turno: "Tarde",
    prioridade: "media",
    reporter: "Ana Silva",
    produtor: "Pedro Santos",
    data_pauta: "2024-05-30",
  },
];

export const mockMaterias = [
  {
    id: "mat-001",
    titulo: "Desenvolvimento de São Luís",
    status: "publicado",
    autor_id: "Eduardo Santos",
    created_at: "2024-05-30T08:00:00",
    cliques: 1250,
    tempo_medio_seg: 120,
  },
  {
    id: "mat-002",
    titulo: "Segurança pública em foco",
    status: "publicado",
    autor_id: "Maria Costa",
    created_at: "2024-05-30T09:15:00",
    cliques: 890,
    tempo_medio_seg: 95,
  },
  {
    id: "mat-003",
    titulo: "História do Centro Histórico",
    status: "em_producao",
    autor_id: "João Silva",
    created_at: "2024-05-30T10:30:00",
    cliques: 450,
    tempo_medio_seg: 150,
  },
  {
    id: "mat-004",
    titulo: "Política em Timon",
    status: "publicado",
    autor_id: "Carlos Oliveira",
    created_at: "2024-05-30T11:45:00",
    cliques: 2100,
    tempo_medio_seg: 180,
  },
  {
    id: "mat-005",
    titulo: "Inovação tecnológica",
    status: "pendente",
    autor_id: "Ana Silva",
    created_at: "2024-05-30T13:00:00",
    cliques: 0,
    tempo_medio_seg: 0,
  },
  {
    id: "mat-006",
    titulo: "Educação em pauta",
    status: "publicado",
    autor_id: "Eduardo Santos",
    created_at: "2024-05-30T14:15:00",
    cliques: 1650,
    tempo_medio_seg: 110,
  },
  {
    id: "mat-007",
    titulo: "Saúde pública",
    status: "publicado",
    autor_id: "Maria Costa",
    created_at: "2024-05-30T15:30:00",
    cliques: 920,
    tempo_medio_seg: 125,
  },
  {
    id: "mat-008",
    titulo: "Meio ambiente",
    status: "em_producao",
    autor_id: "Pedro Santos",
    created_at: "2024-05-30T16:45:00",
    cliques: 320,
    tempo_medio_seg: 140,
  },
];

export const mockReporters = [
  {
    id: "user-001",
    full_name: "Eduardo Santos",
    email: "eduardo@desknews.com",
    role: "reporter",
    materias: 18,
  },
  {
    id: "user-002",
    full_name: "Maria Costa",
    email: "maria@desknews.com",
    role: "reporter",
    materias: 15,
  },
  {
    id: "user-003",
    full_name: "João Silva",
    email: "joao@desknews.com",
    role: "editor",
    materias: 11,
  },
  {
    id: "user-004",
    full_name: "Carlos Oliveira",
    email: "carlos@desknews.com",
    role: "reporter",
    materias: 8,
  },
  {
    id: "user-005",
    full_name: "Ana Silva",
    email: "ana@desknews.com",
    role: "reporter",
    materias: 6,
  },
  {
    id: "user-006",
    full_name: "Pedro Santos",
    email: "pedro@desknews.com",
    role: "chefe_redacao",
    materias: 12,
  },
];

export const mockPortals = [
  {
    id: "portal-001",
    name: "Sistema Core",
    status: "online",
    lastUpdate: new Date(Date.now() - 5 * 60000),
    uptime: 99.9,
  },
  {
    id: "portal-002",
    name: "Coletor de Notícias",
    status: "online",
    lastUpdate: new Date(Date.now() - 2 * 60000),
    uptime: 99.8,
  },
  {
    id: "portal-003",
    name: "Placar ao Vivo",
    status: "online",
    lastUpdate: new Date(Date.now() - 1 * 60000),
    uptime: 98.5,
  },
  {
    id: "portal-004",
    name: "Imparcial",
    status: "offline",
    lastUpdate: new Date(Date.now() - 2 * 3600000),
    uptime: 95.2,
  },
  {
    id: "portal-005",
    name: "Teleprompter",
    status: "online",
    lastUpdate: new Date(Date.now() - 3 * 60000),
    uptime: 99.7,
  },
  {
    id: "portal-006",
    name: "Banco de Dados",
    status: "online",
    lastUpdate: new Date(Date.now() - 10 * 1000),
    uptime: 100,
  },
];

export const mockTurnoData = [
  {
    turno: "Manhã",
    quantidade: 32,
    percentual: 48,
    producao: 320,
  },
  {
    turno: "Tarde",
    quantidade: 22,
    percentual: 33,
    producao: 280,
  },
  {
    turno: "Noite",
    quantidade: 16,
    percentual: 19,
    producao: 156,
  },
];

export const mockStatusData = [
  {
    name: "Publicado",
    value: 45,
    color: "#10b981",
  },
  {
    name: "Em Produção",
    value: 22,
    color: "#f59e0b",
  },
  {
    name: "Pendente",
    value: 12,
    color: "#3b82f6",
  },
  {
    name: "Arquivado",
    value: 8,
    color: "#6b7280",
  },
  {
    name: "Rejeitado",
    value: 3,
    color: "#ef4444",
  },
];

export const mockProductionData = [
  { day: "Seg", producao: 320 },
  { day: "Ter", producao: 380 },
  { day: "Qua", producao: 420 },
  { day: "Qui", producao: 480 },
  { day: "Sex", producao: 510 },
  { day: "Sab", producao: 520 },
  { day: "Dom", producao: 450 },
];

export const mockPlaylist = [
  {
    id: "video-001",
    title: "IVT Turismo Centro",
    type: "Matéria Pública",
    duration: "04:32",
    status: "ao_vivo",
    criado_em: "2024-05-30",
  },
  {
    id: "video-002",
    title: "IVT Escala",
    type: "Matéria Pública",
    duration: "03:15",
    status: "proximo",
    criado_em: "2024-05-30",
  },
  {
    id: "video-003",
    title: "Entrevista Especial",
    type: "Transmissão ao Vivo",
    duration: "em espera",
    status: "agendado",
    criado_em: "2024-05-30",
  },
  {
    id: "video-004",
    title: "Ação em Tempo Real",
    type: "Cobertura ao Vivo",
    duration: "02:48",
    status: "agendado",
    criado_em: "2024-05-30",
  },
];

export const mockMetrics = {
  pautas: 86,
  portais: 106,
  materias: 32,
  usuarios: 12,
  publicadas: 28,
  em_producao: 8,
  uptime_medio: 98.9,
  tempo_medio_pauta: 125,
};

export const mockRecentActivity = [
  {
    id: "activity-001",
    tipo: "pauta_criada",
    descricao: "Pauta 'Alojamento em São Luís' criada",
    usuario: "João Silva",
    timestamp: new Date(Date.now() - 5 * 60000),
  },
  {
    id: "activity-002",
    tipo: "materia_publicada",
    descricao: "Matéria 'Desenvolvimento de São Luís' publicada",
    usuario: "Eduardo Santos",
    timestamp: new Date(Date.now() - 15 * 60000),
  },
  {
    id: "activity-003",
    tipo: "pauta_atualizada",
    descricao: "Pauta 'Operação da Polícia Civil' atualizada",
    usuario: "Maria Costa",
    timestamp: new Date(Date.now() - 30 * 60000),
  },
  {
    id: "activity-004",
    tipo: "usuario_online",
    descricao: "Carlos Oliveira conectado",
    usuario: "Sistema",
    timestamp: new Date(Date.now() - 45 * 60000),
  },
  {
    id: "activity-005",
    tipo: "relatorio_gerado",
    descricao: "Relatório de métricas gerado",
    usuario: "Pedro Santos",
    timestamp: new Date(Date.now() - 60 * 60000),
  },
];

// Hook para usar dados mock no lugar de Supabase
export function useMockData() {
  return {
    pautas: mockPautas,
    materias: mockMaterias,
    reporters: mockReporters,
    portals: mockPortals,
    turnoData: mockTurnoData,
    statusData: mockStatusData,
    productionData: mockProductionData,
    playlist: mockPlaylist,
    metrics: mockMetrics,
    recentActivity: mockRecentActivity,
  };
}

// Função para gerar dados aleatórios para testes
export function generateRandomMetrics() {
  return {
    pautas: Math.floor(Math.random() * 100) + 50,
    portais: Math.floor(Math.random() * 150) + 80,
    materias: Math.floor(Math.random() * 60) + 20,
    usuarios: Math.floor(Math.random() * 20) + 5,
    publicadas: Math.floor(Math.random() * 40) + 10,
    em_producao: Math.floor(Math.random() * 20) + 5,
  };
}

// Para usar mock data no desenvolvimento, substitua a função fetchData por:
/*
import { useMockData } from "@/lib/mockData";

const mockData = useMockData();
setPautas(mockData.pautas);
setMaterias(mockData.materias);
setReporters(mockData.reporters);
// etc...
*/
