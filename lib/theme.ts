import type { BedState } from './types';
import {
  CheckCircle2,
  Droplets,
  BedSingle,
  Flag,
  Bookmark,
  ShieldAlert,
  Truck,
  ShieldCheck,
  XCircle,
  User,
  UserCircle,
  Activity,
  AlertTriangle,
  Hand,
  Wind,
  CloudRain,
} from 'lucide-react';

// Mapa de cores por estado (base 600, hover 700, ghost 100)
export const stateColors: Record<BedState, { bg: string; hover: string; ghost: string; text: string }> = {
  Vago: {
    bg: 'bg-green-600',
    hover: 'hover:bg-green-700',
    ghost: 'bg-green-100',
    text: 'text-green-600',
  },
  Higienização: {
    bg: 'bg-yellow-600',
    hover: 'hover:bg-yellow-700',
    ghost: 'bg-yellow-100',
    text: 'text-yellow-600',
  },
  Ocupado: {
    bg: 'bg-zinc-600',
    hover: 'hover:bg-zinc-700',
    ghost: 'bg-zinc-100',
    text: 'text-zinc-600',
  },
  'Alta Sinalizada': {
    bg: 'bg-blue-600',
    hover: 'hover:bg-blue-700',
    ghost: 'bg-blue-100',
    text: 'text-blue-600',
  },
  Reservado: {
    bg: 'bg-purple-600',
    hover: 'hover:bg-purple-700',
    ghost: 'bg-purple-100',
    text: 'text-purple-600',
  },
  Interdição: {
    bg: 'bg-red-600',
    hover: 'hover:bg-red-700',
    ghost: 'bg-red-100',
    text: 'text-red-600',
  },
  Transferência: {
    bg: 'bg-orange-600',
    hover: 'hover:bg-orange-700',
    ghost: 'bg-orange-100',
    text: 'text-orange-600',
  },
  'Alta Efetivada': {
    bg: 'bg-emerald-700',
    hover: 'hover:bg-emerald-800',
    ghost: 'bg-emerald-100',
    text: 'text-emerald-700',
  },
  'Alta Cancelada': {
    bg: 'bg-rose-700',
    hover: 'hover:bg-rose-800',
    ghost: 'bg-rose-100',
    text: 'text-rose-700',
  },
};

// Mapa de ícones por estado
export const stateIcons: Record<BedState, typeof CheckCircle2> = {
  Vago: CheckCircle2,
  Higienização: Droplets,
  Ocupado: BedSingle,
  'Alta Sinalizada': Flag,
  Reservado: Bookmark,
  Interdição: ShieldAlert,
  Transferência: Truck,
  'Alta Efetivada': ShieldCheck,
  'Alta Cancelada': XCircle,
};

// Ícones de isolamento
export const isolationIcons: Record<string, typeof AlertTriangle> = {
  Vigilância: AlertTriangle,
  Contato: Hand,
  Respiratório: Wind,
  Gotículas: CloudRain,
};

// Ícones de sexo
export const sexIcons = {
  M: User,
  F: UserCircle,
};

// Helper para obter cor do estado
export function getStateColor(state: BedState) {
  return stateColors[state];
}

// Helper para obter ícone do estado
export function getStateIcon(state: BedState) {
  return stateIcons[state];
}

// Helper para obter badge do estado (quando precisa de selo)
export function getStateBadge(state: BedState): { show: boolean; label: string; color: string } {
  const badges: Record<BedState, { show: boolean; label: string; color: string }> = {
    Vago: { show: false, label: '', color: '' },
    Higienização: { show: false, label: '', color: '' },
    Ocupado: { show: false, label: '', color: '' },
    'Alta Sinalizada': { show: false, label: '', color: '' },
    Reservado: { show: true, label: 'RESERVADO', color: 'bg-purple-600' },
    Interdição: { show: true, label: 'INTERDITADO', color: 'bg-red-600' },
    Transferência: { show: false, label: '', color: '' },
    'Alta Efetivada': { show: false, label: '', color: '' },
    'Alta Cancelada': { show: false, label: '', color: '' },
  };
  return badges[state];
}

// Helper para obter ações disponíveis por estado
export function getNextActionsByState(state: BedState): string[] {
  const actions: Record<BedState, string[]> = {
    Ocupado: ['Alta Sinalizada', 'Transferência'],
    'Alta Sinalizada': ['Alta Efetivada', 'Cancelar Alta'],
    'Alta Efetivada': ['Iniciar Higienização'],
    Higienização: ['Finalizar Higienização'],
    Vago: ['Reservar', 'Entrada Confirmada', 'Interditar'],
    Reservado: ['Liberar', 'Entrada Confirmada'],
    Interdição: ['Liberar'],
    Transferência: ['Iniciar Higienização'],
    'Alta Cancelada': [],
  };
  return actions[state] || [];
}

// Helper para obter rótulo curto do plano
export function getPlanoLabel(plano: string | null): string {
  const labels: Record<string, string> = {
    SUS: 'SUS',
    Particular: 'PART',
    Convênio: 'CONV',
  };
  return plano ? labels[plano] || plano : '';
}

