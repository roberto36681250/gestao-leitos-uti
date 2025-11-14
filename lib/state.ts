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
  Clock,
} from 'lucide-react';

// Mapa de cores por estado - barra superior 12px
export const mapStateToColor = (state: BedState): { bg: string; border: string } => {
  switch (state) {
    case 'Ocupado':
      return { bg: 'bg-red-600', border: 'border-red-600' };
    case 'Bloqueado':
      return { bg: 'bg-zinc-600', border: 'border-zinc-600' };
    case 'Higienização':
      return { bg: 'bg-yellow-600', border: 'border-yellow-600' };
    case 'Vago':
      return { bg: 'bg-green-600', border: 'border-green-600' };
    case 'Reservado':
      return { bg: 'bg-purple-600', border: 'border-purple-600' };
    case 'Alta Sinalizada':
      return { bg: 'bg-blue-600', border: 'border-blue-600' };
    case 'Transferência':
      return { bg: 'bg-orange-600', border: 'border-orange-600' };
    case 'Alta Efetivada':
      return { bg: 'bg-emerald-700', border: 'border-emerald-700' };
    case 'Alta Cancelada':
      return { bg: 'bg-pink-500', border: 'border-pink-500' };
    case 'Previsão de Alta em 24h':
      return { bg: 'bg-indigo-600', border: 'border-indigo-600' };
    default:
      return { bg: 'bg-gray-500', border: 'border-gray-500' };
  }
};

// Mapa de ícones por estado
export const mapStateToIcon = (state: BedState) => {
  switch (state) {
    case 'Vago':
      return CheckCircle2;
    case 'Higienização':
      return Droplets;
    case 'Ocupado':
      return BedSingle;
    case 'Alta Sinalizada':
      return Flag;
    case 'Reservado':
      return Bookmark;
    case 'Bloqueado':
      return ShieldAlert;
    case 'Transferência':
      return Truck;
    case 'Alta Efetivada':
      return ShieldCheck;
    case 'Alta Cancelada':
      return XCircle;
    case 'Previsão de Alta em 24h':
      return Clock;
    default:
      return BedSingle;
  }
};

// Mapa de selos (badges) por estado
export const mapStateToBadge = (state: BedState): string | null => {
  switch (state) {
    case 'Reservado':
      return 'R';
    case 'Higienização':
      return 'H';
    case 'Transferência':
      return 'T';
    case 'Bloqueado':
      return 'I';
    case 'Alta Sinalizada':
      return 'A';
    case 'Previsão de Alta em 24h':
      return 'P';
    default:
      return null;
  }
};

// Ações disponíveis por estado
export const getNextActionsByState = (state: BedState): string[] => {
  switch (state) {
    case 'Ocupado':
      return ['Alta Sinalizada', 'Previsão de Alta em 24h', 'Transferência', 'Editar'];
    case 'Previsão de Alta em 24h':
      return ['Alta Sinalizada', 'Cancelar Previsão', 'Editar'];
    case 'Alta Sinalizada':
      return ['Alta Efetivada', 'Cancelar Alta', 'Editar'];
    case 'Transferência':
      return ['Iniciar Higienização', 'Editar'];
    case 'Higienização':
      return ['Finalizar Higienização', 'Editar'];
    case 'Vago':
      return ['Ocupado', 'Reservar', 'Bloquear', 'Editar'];
    case 'Reservado':
      return ['Liberar', 'Entrada Confirmada', 'Editar'];
    case 'Bloqueado':
      return ['Liberar', 'Editar'];
    case 'Alta Efetivada':
      return ['Iniciar Higienização'];
    case 'Alta Cancelada':
      return ['Voltar para Ocupado', 'Editar'];
    default:
      return ['Editar'];
  }
};

// Ação padrão por estado (primeira ação disponível)
export const getDefaultActionByState = (state: BedState): string | null => {
  const actions = getNextActionsByState(state);
  return actions.length > 0 ? actions[0] : null;
};

// Mapeamento de ação para letra de atalho
export const getActionShortcut = (action: string): string | null => {
  const shortcuts: Record<string, string> = {
    'Alta Sinalizada': 'A',
    'Alta Efetivada': 'E',
    'Cancelar Alta': 'C',
    'Previsão de Alta em 24h': 'P',
    'Cancelar Previsão': 'C',
    'Transferência': 'T',
    'Iniciar Higienização': 'H',
    'Finalizar Higienização': 'F',
    'Entrada Confirmada': 'E',
    'Reservar': 'R',
    'Liberar': 'L',
    'Bloquear': 'I',
  };
  return shortcuts[action] || null;
};

// Retorna um nome curto e delicado para o estado
export const getStateShortName = (state: BedState): string => {
  switch (state) {
    case 'Ocupado':
      return 'Ocupado';
    case 'Vago':
      return 'Vago';
    case 'Higienização':
      return 'Higienização';
    case 'Reservado':
      return 'Reservado';
    case 'Alta Sinalizada':
      return 'Alta Sinalizada';
    case 'Alta Efetivada':
      return 'Alta Efetivada';
    case 'Alta Cancelada':
      return 'Alta Cancelada';
    case 'Previsão de Alta em 24h':
      return 'Alta em 24h';
    case 'Transferência':
      return 'Transferência';
    case 'Bloqueado':
      return 'Bloqueado';
    default:
      return state;
  }
};
