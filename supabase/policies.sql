-- Políticas RLS para Gestão de Leitos

-- Habilitar RLS nas tabelas
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Políticas para beds

-- Permitir SELECT para usuários anônimos
DROP POLICY IF EXISTS "Permitir SELECT anon em beds" ON beds;
CREATE POLICY "Permitir SELECT anon em beds"
  ON beds
  FOR SELECT
  TO anon
  USING (true);

-- Permitir UPDATE para usuários anônimos (apenas campos de domínio)
DROP POLICY IF EXISTS "Permitir UPDATE anon em beds" ON beds;
CREATE POLICY "Permitir UPDATE anon em beds"
  ON beds
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Políticas para reservations

-- Permitir SELECT para usuários anônimos
DROP POLICY IF EXISTS "Permitir SELECT anon em reservations" ON reservations;
CREATE POLICY "Permitir SELECT anon em reservations"
  ON reservations
  FOR SELECT
  TO anon
  USING (true);

-- Permitir INSERT para usuários anônimos
DROP POLICY IF EXISTS "Permitir INSERT anon em reservations" ON reservations;
CREATE POLICY "Permitir INSERT anon em reservations"
  ON reservations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Permitir UPDATE para usuários anônimos (principalmente is_active)
DROP POLICY IF EXISTS "Permitir UPDATE anon em reservations" ON reservations;
CREATE POLICY "Permitir UPDATE anon em reservations"
  ON reservations
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

