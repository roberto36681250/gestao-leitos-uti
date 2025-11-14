import type { BedState } from './types';

/**
 * Regras de transição de estado
 * Determina quais estados podem ser alcançados a partir de cada estado via drag-and-drop
 */
export const STATE_TRANSITIONS: Record<BedState, BedState[]> = {
  'Ocupado': ['Alta Sinalizada', 'Previsão de Alta em 24h', 'Transferência'],
  'Previsão de Alta em 24h': ['Alta Sinalizada', 'Ocupado'],
  'Alta Sinalizada': ['Alta Efetivada', 'Alta Cancelada'],
  'Alta Efetivada': ['Higienização'],
  'Transferência': ['Higienização'],
  'Higienização': ['Vago'], // Único caminho para Vago
  'Vago': ['Ocupado', 'Reservado', 'Bloqueado'], // Pode ir para Ocupado, Reservado ou Bloqueado
  'Reservado': ['Ocupado'], // Via Entrada Confirmada
  'Bloqueado': ['Vago'],
  'Alta Cancelada': ['Ocupado'],
};

/**
 * Verifica se uma transição de estado é válida
 */
export function canTransitionTo(fromState: BedState, toState: BedState): boolean {
  // Regra especial: Vago só pode ser alcançado via Higienização
  if (toState === 'Vago' && fromState !== 'Higienização') {
    return false;
  }

  // Verificar se a transição está nas regras permitidas
  const allowedStates = STATE_TRANSITIONS[fromState] || [];
  return allowedStates.includes(toState);
}

/**
 * Retorna a ação necessária para fazer a transição
 */
export function getActionForTransition(fromState: BedState, toState: BedState): string | null {
  const actionMap: Record<string, Record<string, string>> = {
    'Ocupado': {
      'Alta Sinalizada': 'Alta Sinalizada',
      'Previsão de Alta em 24h': 'Previsão de Alta em 24h',
      'Transferência': 'Transferência',
    },
    'Previsão de Alta em 24h': {
      'Alta Sinalizada': 'Alta Sinalizada',
      'Ocupado': 'Cancelar Previsão',
    },
    'Alta Sinalizada': {
      'Alta Efetivada': 'Alta Efetivada',
      'Alta Cancelada': 'Cancelar Alta',
    },
    'Alta Efetivada': {
      'Higienização': 'Iniciar Higienização',
    },
    'Transferência': {
      'Higienização': 'Iniciar Higienização',
    },
    'Higienização': {
      'Vago': 'Finalizar Higienização',
    },
    'Reservado': {
      'Ocupado': 'Entrada Confirmada',
    },
    'Bloqueado': {
      'Vago': 'Liberar',
    },
    'Alta Cancelada': {
      'Ocupado': 'Voltar para Ocupado',
    },
    'Vago': {
      'Ocupado': 'Entrada Confirmada',
      'Reservado': 'Reservar',
      'Bloqueado': 'Bloquear',
    },
  };

  return actionMap[fromState]?.[toState] || null;
}

