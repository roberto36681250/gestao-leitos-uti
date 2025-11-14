-- Migração: Adicionar coluna last_initials na tabela beds
-- Data: 2024

-- Adicionar coluna last_initials (opcional, pode ser NULL)
ALTER TABLE beds 
ADD COLUMN IF NOT EXISTS last_initials VARCHAR(10);

-- Comentário explicativo
COMMENT ON COLUMN beds.last_initials IS 'Iniciais do último usuário que realizou uma ação no leito. Usado para exibição no hover do card.';

