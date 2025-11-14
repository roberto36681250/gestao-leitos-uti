-- Migração: Alterar valores do campo plano de SUS/Particular/Convênio para Apartamento/Enfermaria
-- Data: 2024

-- PASSO 1: Remover constraint antigo (permite atualizar os dados)
ALTER TABLE beds DROP CONSTRAINT IF EXISTS valid_plano;

-- PASSO 2: Atualizar valores existentes para NULL (ou mapear conforme necessário)
-- Convertendo todos os valores antigos para NULL (você pode ajustar conforme necessário)
UPDATE beds 
SET plano = NULL 
WHERE plano IS NOT NULL 
  AND plano NOT IN ('Apartamento', 'Enfermaria');

-- PASSO 3: Agora adicionar o novo constraint com valores corretos
ALTER TABLE beds 
ADD CONSTRAINT valid_plano CHECK (plano IS NULL OR plano IN ('Apartamento', 'Enfermaria'));

