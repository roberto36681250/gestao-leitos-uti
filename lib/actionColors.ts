import type { BedState } from './types';

/**
 * Mapeamento de ação para estado de destino e sua cor
 */
export const ACTION_TO_TARGET_STATE: Record<string, BedState> = {
  'Alta Sinalizada': 'Alta Sinalizada',
  'Alta Efetivada': 'Alta Efetivada',
  'Iniciar Higienização': 'Higienização',
  'Finalizar Higienização': 'Vago',
  'Transferência': 'Transferência',
  'Reservar': 'Reservado',
  'Entrada Confirmada': 'Ocupado',
  'Bloquear': 'Bloqueado',
  'Liberar': 'Vago',
};

/**
 * Cores dos estados para usar nos botões da ActionBar
 */
export const STATE_COLORS: Record<BedState, string> = {
  'Ocupado': 'bg-red-600',
  'Bloqueado': 'bg-zinc-600',
  'Higienização': 'bg-yellow-600',
  'Vago': 'bg-green-600',
  'Reservado': 'bg-purple-600',
  'Alta Sinalizada': 'bg-blue-600',
  'Transferência': 'bg-orange-600',
  'Alta Efetivada': 'bg-emerald-700',
  'Alta Cancelada': 'bg-rose-700',
};

/**
 * Retorna a cor do estado de destino de uma ação
 */
export function getActionTargetColor(action: string): string {
  const targetState = ACTION_TO_TARGET_STATE[action];
  if (!targetState) return 'bg-gray-600';
  
  // Ações especiais
  if (action === 'Cancelar Alta') return 'bg-zinc-600';
  if (action === 'Editar') return 'bg-gray-600';
  if (action === 'Liberar') return 'bg-zinc-600';
  
  return STATE_COLORS[targetState] || 'bg-gray-600';
}

/**
 * Retorna a cor do estado de destino formatada para texto
 */
export function getActionTargetTextColor(action: string): string {
  const targetState = ACTION_TO_TARGET_STATE[action];
  if (!targetState) return 'text-gray-600';
  
  if (action === 'Cancelar Alta') return 'text-zinc-700';
  if (action === 'Editar') return 'text-gray-700';
  if (action === 'Liberar') return 'text-zinc-700';
  
  const colorMap: Record<BedState, string> = {
    'Ocupado': 'text-red-700',
    'Bloqueado': 'text-zinc-700',
    'Higienização': 'text-yellow-700',
    'Vago': 'text-green-700',
    'Reservado': 'text-purple-700',
    'Alta Sinalizada': 'text-blue-700',
    'Transferência': 'text-orange-700',
    'Alta Efetivada': 'text-emerald-700',
    'Alta Cancelada': 'text-rose-700',
  };
  
  return colorMap[targetState] || 'text-gray-700';
}

