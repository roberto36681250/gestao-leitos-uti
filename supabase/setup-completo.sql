-- ============================================
-- SCRIPT COMPLETO DE CONFIGURAÇÃO DO SUPABASE
-- Execute este script completo no SQL Editor
-- ============================================

-- ============================================
-- PARTE 1: SCHEMA (Tabelas)
-- ============================================

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
  transfer_inicio_at TIMESTAMPTZ,
  higienizacao_inicio_at TIMESTAMPTZ,
  higienizacao_fim_at TIMESTAMPTZ,
  vago_since TIMESTAMPTZ,
  version INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_state CHECK (
    state IN (
      'Vago',
      'Higienização',
      'Ocupado',
      'Alta Sinalizada',
      'Reservado',
      'Interdição',
      'Transferência',
      'Alta Efetivada',
      'Alta Cancelada'
    )
  ),
  CONSTRAINT valid_sexo CHECK (sexo IS NULL OR sexo IN ('M', 'F')),
  CONSTRAINT valid_plano CHECK (plano IS NULL OR plano IN ('SUS', 'Particular', 'Convênio'))
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

-- ============================================
-- PARTE 2: TRIGGERS
-- ============================================

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

-- ============================================
-- PARTE 3: POLÍTICAS RLS
-- ============================================

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

-- Permitir UPDATE para usuários anônimos
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

-- Permitir UPDATE para usuários anônimos
DROP POLICY IF EXISTS "Permitir UPDATE anon em reservations" ON reservations;
CREATE POLICY "Permitir UPDATE anon em reservations"
  ON reservations
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- ============================================
-- PARTE 4: SEED (Dados Iniciais)
-- ============================================

-- Inserir leitos 21 a 40
INSERT INTO beds (number, state, sexo, plano, isolamento, hd, observacao)
VALUES
  (21, 'Ocupado', NULL, NULL, '{}', false, NULL),
  (22, 'Ocupado', NULL, NULL, '{}', false, NULL),
  (23, 'Ocupado', NULL, NULL, '{}', false, NULL),
  (24, 'Ocupado', NULL, NULL, '{}', false, NULL),
  (25, 'Ocupado', NULL, NULL, '{}', false, NULL),
  (26, 'Ocupado', NULL, NULL, '{}', false, NULL),
  (27, 'Ocupado', NULL, NULL, '{}', false, NULL),
  (28, 'Ocupado', NULL, NULL, '{}', false, NULL),
  (29, 'Ocupado', NULL, NULL, '{}', false, NULL),
  (30, 'Ocupado', NULL, NULL, '{}', false, NULL),
  (31, 'Ocupado', NULL, NULL, '{}', false, NULL),
  (32, 'Ocupado', NULL, NULL, '{}', false, NULL),
  (33, 'Ocupado', NULL, NULL, '{}', false, NULL),
  (34, 'Ocupado', NULL, NULL, '{}', false, NULL),
  (35, 'Ocupado', NULL, NULL, '{}', false, NULL),
  (36, 'Ocupado', NULL, NULL, '{}', false, NULL),
  (37, 'Ocupado', NULL, NULL, '{}', false, NULL),
  (38, 'Ocupado', NULL, NULL, '{}', false, NULL),
  (39, 'Ocupado', NULL, NULL, '{}', false, NULL),
  (40, 'Ocupado', NULL, NULL, '{}', false, NULL)
ON CONFLICT (number) DO NOTHING;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- 
-- PRÓXIMOS PASSOS:
-- 1. Habilite o Realtime em Database > Replication
--    - Ative para a tabela 'beds'
--    - Ative para a tabela 'reservations'
-- 2. Configure as variáveis de ambiente no .env.local
-- 3. Reinicie o servidor Next.js

