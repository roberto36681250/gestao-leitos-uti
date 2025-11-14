-- Triggers para Gestão de Leitos

-- Função para incrementar version e atualizar updated_at
CREATE OR REPLACE FUNCTION bump_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version := COALESCE(OLD.version, 0) + 1;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para version e updated_at em beds
DROP TRIGGER IF EXISTS set_updated_at ON beds;
DROP TRIGGER IF EXISTS beds_bump_version ON beds;
CREATE TRIGGER beds_bump_version
  BEFORE UPDATE ON beds
  FOR EACH ROW
  EXECUTE FUNCTION bump_version();

-- Função para definir vago_since quando state muda para Vago após higienização
CREATE OR REPLACE FUNCTION set_vago_since()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o estado mudou para Vago e higienizacao_fim_at foi definido
  IF NEW.state = 'Vago' AND NEW.higienizacao_fim_at IS NOT NULL AND OLD.state != 'Vago' THEN
    NEW.vago_since = now();
  END IF;
  
  -- Se o estado mudou de Vago para outro, limpar vago_since
  IF OLD.state = 'Vago' AND NEW.state != 'Vago' THEN
    NEW.vago_since = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para vago_since em beds
DROP TRIGGER IF EXISTS set_vago_since_trigger ON beds;
CREATE TRIGGER set_vago_since_trigger
  BEFORE UPDATE ON beds
  FOR EACH ROW
  EXECUTE FUNCTION set_vago_since();

