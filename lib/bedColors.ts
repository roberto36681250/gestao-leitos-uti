import type { BedState } from './types';

export const bedStateColors: Record<BedState, string> = {
  Vago: 'bg-green-500 text-white',
  Higienização: 'bg-yellow-500 text-white',
  Ocupado: 'bg-gray-500 text-white',
  'Alta Sinalizada': 'bg-blue-500 text-white',
  Reservado: 'bg-purple-500 text-white',
  Interdição: 'bg-red-500 text-white',
  Transferência: 'bg-orange-500 text-white',
  'Alta Efetivada': 'bg-green-700 text-white',
  'Alta Cancelada': 'bg-red-900 text-white',
};

export const bedStateBorderColors: Record<BedState, string> = {
  Vago: 'border-green-600',
  Higienização: 'border-yellow-600',
  Ocupado: 'border-gray-600',
  'Alta Sinalizada': 'border-blue-600',
  Reservado: 'border-purple-600',
  Interdição: 'border-red-600',
  Transferência: 'border-orange-600',
  'Alta Efetivada': 'border-green-800',
  'Alta Cancelada': 'border-red-950',
};

