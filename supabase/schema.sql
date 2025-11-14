-- Schema para Gestão de Leitos
-- Criar tabelas beds e reservations

-- Tabela de leitos
CREATE TABLE IF NOT EXISTS beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER UNIQUE NOT NULL,
  state TEXT NOT NULL DEFAULT 'Ocupado',
  sexo TEXT,
  plano TEXT,
  isolamento TEXT[] DEFAULT '{}',
  hd BOOLEAN DEFAULT false,
  observacao TEXT,
  alta_sinalizada_at TIMESTAMPTZ,
  alta_efetivada_at TIMESTAMPTZ,
  alta_cancelada_at TIMESTAMPTZ,
  previsao_alta_24h_at TIMESTAMPTZ,
  transfer_inicio_at TIMESTAMPTZ,
  higienizacao_inicio_at TIMESTAMPTZ,
  higienizacao_fim_at TIMESTAMPTZ,
  vago_since TIMESTAMPTZ,
  version INTEGER DEFAULT 1 NOT NULL,
  last_initials VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_state CHECK (
    state IN (
      'Vago',
      'Higienização',
      'Ocupado',
      'Alta Sinalizada',
      'Reservado',
      'Bloqueado',
      'Transferência',
      'Alta Efetivada',
      'Alta Cancelada',
      'Previsão de Alta em 24h'
    )
  ),
  CONSTRAINT valid_sexo CHECK (sexo IS NULL OR sexo IN ('M', 'F')),
  CONSTRAINT valid_plano CHECK (plano IS NULL OR plano IN ('Apartamento', 'Enfermaria'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_beds_state ON beds(state);
CREATE INDEX IF NOT EXISTS idx_beds_number ON beds(number);

-- Tabela de reservas
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bed_id UUID NOT NULL REFERENCES beds(id) ON DELETE CASCADE,
  iniciais TEXT NOT NULL,
  sexo TEXT,
  matricula TEXT NOT NULL,
  origem TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_sexo_reservation CHECK (sexo IS NULL OR sexo IN ('M', 'F'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_reservations_bed_id ON reservations(bed_id);
CREATE INDEX IF NOT EXISTS idx_reservations_is_active ON reservations(is_active);

