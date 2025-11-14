export type BedState =
  | 'Disponível'
  | 'Reservado'
  | 'Ocupado'
  | 'Higiene'
  | 'Manutenção'
  | 'Bloqueado'
  | 'Previsão de Alta'
  | 'Alta Dada';

export interface Bed {
  id: string;
  bed_number: string;
  state: BedState;
  created_at: string;
  updated_at: string;
}

export interface BedWithReservation extends Bed {
  reservation?: any;
}

export interface FiltrosState {
  estado: BedState | 'Todos';
  sexo: 'M' | 'F' | 'Todos';
  plano: string | 'Todos';
  isolamento: string | 'Todos';
}

