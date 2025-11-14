export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      beds: {
        Row: {
          id: string;
          number: number;
          state: string;
          sexo: string | null;
          plano: string | null;
          isolamento: string[];
          hd: boolean;
          observacao: string | null;
          alta_sinalizada_at: string | null;
          alta_efetivada_at: string | null;
          alta_cancelada_at: string | null;
          transfer_inicio_at: string | null;
          higienizacao_inicio_at: string | null;
          higienizacao_fim_at: string | null;
          vago_since: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          number: number;
          state?: string;
          sexo?: string | null;
          plano?: string | null;
          isolamento?: string[];
          hd?: boolean;
          observacao?: string | null;
          alta_sinalizada_at?: string | null;
          alta_efetivada_at?: string | null;
          alta_cancelada_at?: string | null;
          transfer_inicio_at?: string | null;
          higienizacao_inicio_at?: string | null;
          higienizacao_fim_at?: string | null;
          vago_since?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          number?: number;
          state?: string;
          sexo?: string | null;
          plano?: string | null;
          isolamento?: string[];
          hd?: boolean;
          observacao?: string | null;
          alta_sinalizada_at?: string | null;
          alta_efetivada_at?: string | null;
          alta_cancelada_at?: string | null;
          transfer_inicio_at?: string | null;
          higienizacao_inicio_at?: string | null;
          higienizacao_fim_at?: string | null;
          vago_since?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reservations: {
        Row: {
          id: string;
          bed_id: string;
          iniciais: string;
          sexo: string | null;
          matricula: string;
          origem: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          bed_id: string;
          iniciais: string;
          sexo?: string | null;
          matricula: string;
          origem: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          bed_id?: string;
          iniciais?: string;
          sexo?: string | null;
          matricula?: string;
          origem?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

