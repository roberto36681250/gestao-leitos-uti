-- Migração: Renomear 'Interdição' para 'Bloqueado'
-- Execute este script no Supabase SQL Editor

-- Atualizar constraint valid_state
ALTER TABLE beds DROP CONSTRAINT IF EXISTS valid_state;

-- Atualizar registros existentes
UPDATE beds 
SET state = 'Bloqueado' 
WHERE state = 'Interdição';

-- Recriar constraint com o novo nome
ALTER TABLE beds 
ADD CONSTRAINT valid_state CHECK (
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
);

-- Comentário
COMMENT ON CONSTRAINT valid_state ON beds IS 'Estados válidos para um leito. Interdição foi renomeado para Bloqueado.';

