-- Migração: Adicionar coluna matricula na tabela beds
-- Data: 2024

-- Adicionar coluna matricula (opcional, pode ser NULL)
ALTER TABLE beds 
ADD COLUMN IF NOT EXISTS matricula TEXT;

-- Comentário explicativo
COMMENT ON COLUMN beds.matricula IS 'Matrícula do paciente quando o leito está ocupado. Se vago, será NULL.';

-- Para leitos já existentes que têm reservation ativa, copiar a matrícula da reservation
UPDATE beds b
SET matricula = r.matricula
FROM reservations r
WHERE b.id = r.bed_id
  AND r.is_active = true
  AND b.matricula IS NULL;

