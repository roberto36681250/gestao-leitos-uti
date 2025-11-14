-- Seed inicial para Gestão de Leitos
-- Criar 20 leitos (21 a 40) com estado "Ocupado" e campos nulos

-- Limpar dados existentes (opcional, apenas para desenvolvimento)
-- DELETE FROM reservations;
-- DELETE FROM beds;

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

