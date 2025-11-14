-- ============================================
-- MIGRAÇÃO: Adicionar Coluna Version
-- Execute este script se você já tem o banco configurado
-- ============================================

-- 1. Adicionar coluna version se não existir
ALTER TABLE beds 
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;

-- 2. Atualizar leitos existentes para version = 1 (se NULL)
UPDATE beds SET version = 1 WHERE version IS NULL;

-- 3. Substituir função e trigger antigo pelo novo
CREATE OR REPLACE FUNCTION bump_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version := COALESCE(OLD.version, 0) + 1;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover triggers antigos
DROP TRIGGER IF EXISTS set_updated_at ON beds;
DROP TRIGGER IF EXISTS beds_bump_version ON beds;

-- Criar novo trigger
CREATE TRIGGER beds_bump_version
  BEFORE UPDATE ON beds
  FOR EACH ROW
  EXECUTE FUNCTION bump_version();

-- Verificar se funcionou
SELECT 
  'Coluna version criada' as status,
  COUNT(*) as leitos_com_version
FROM beds 
WHERE version IS NOT NULL;

SELECT 
  'Trigger criado' as status,
  trigger_name
FROM information_schema.triggers
WHERE event_object_table = 'beds' 
  AND trigger_name = 'beds_bump_version';

