-- Migração: Adicionar coluna previsao_alta_24h_at e estado "Previsão de Alta em 24h"
-- Data: 2024

-- Adicionar coluna previsao_alta_24h_at
ALTER TABLE beds 
ADD COLUMN IF NOT EXISTS previsao_alta_24h_at TIMESTAMPTZ;

-- Atualizar constraint para incluir novo estado
ALTER TABLE beds DROP CONSTRAINT IF EXISTS valid_state;
ALTER TABLE beds 
ADD CONSTRAINT valid_state CHECK (
  state IN (
    'Vago',
    'Higienização',
    'Ocupado',
    'Alta Sinalizada',
    'Reservado',
    'Interdição',
    'Transferência',
    'Alta Efetivada',
    'Alta Cancelada',
    'Previsão de Alta em 24h'
  )
);

-- Comentário explicativo
COMMENT ON COLUMN beds.previsao_alta_24h_at IS 'Data e hora em que foi registrada a previsão de alta em 24 horas.';

