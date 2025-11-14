export const BED_STATES = {
  DISPONIVEL: 'Disponível',
  RESERVADO: 'Reservado',
  OCUPADO: 'Ocupado',
  HIGIENE: 'Higiene',
  MANUTENCAO: 'Manutenção',
  BLOQUEADO: 'Bloqueado',
  PREVISAO_ALTA: 'Previsão de Alta',
  ALTA_DADA: 'Alta Dada'
} as const

export type BedState = typeof BED_STATES[keyof typeof BED_STATES]

// Cores Neon para os estados
export const STATE_COLORS = {
  [BED_STATES.DISPONIVEL]: '#00ff88',      // Verde Neon
  [BED_STATES.RESERVADO]: '#ffff00',       // Amarelo Fluorescente
  [BED_STATES.OCUPADO]: '#ff3366',         // Vermelho Neon
  [BED_STATES.HIGIENE]: '#00ffff',         // Ciano
  [BED_STATES.MANUTENCAO]: '#ff0099',      // Rosa Neon
  [BED_STATES.BLOQUEADO]: '#bb00ff',       // Roxo Neon
  [BED_STATES.PREVISAO_ALTA]: '#ffff00',   // Amarelo Fluorescente
  [BED_STATES.ALTA_DADA]: '#00ff88'        // Verde Neon
} as const


