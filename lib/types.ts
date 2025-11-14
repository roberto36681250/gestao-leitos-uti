export type BedState =
  | 'Vago'
  | 'Higienização'
  | 'Ocupado'
  | 'Alta Sinalizada'
  | 'Reservado'
  | 'Bloqueado'
  | 'Transferência'
  | 'Alta Efetivada'
  | 'Alta Cancelada'
  | 'Previsão de Alta em 24h';

export type Sexo = 'M' | 'F' | null;

export type Plano = 'Apartamento' | 'Enfermaria' | null;

export type Isolamento = 'Texto' | 'Vigilância' | 'Contato' | 'Respiratório' | 'Gotículas';

export interface Bed {
  id: string;
  number: number;
  state: BedState;
  sexo: Sexo;
  plano: Plano;
  isolamento: Isolamento[];
  hd: boolean;
  observacao: string | null;
  matricula: string | null;
  alta_sinalizada_at: string | null;
  alta_efetivada_at: string | null;
  alta_cancelada_at: string | null;
  previsao_alta_24h_at: string | null;
  transfer_inicio_at: string | null;
  higienizacao_inicio_at: string | null;
  higienizacao_fim_at: string | null;
  vago_since: string | null;
  version: number;
  last_initials: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  bed_id: string;
  iniciais: string;
  sexo: Sexo;
  matricula: string;
  origem: string;
  is_active: boolean;
  created_at: string;
}

export interface BedWithReservation extends Bed {
  reservation?: Reservation;
}

export interface FiltrosState {
  estado: BedState | 'Todos';
  sexo: Sexo | 'Todos';
  plano: Plano | 'Todos';
  isolamento: Isolamento | 'Todos';
}

