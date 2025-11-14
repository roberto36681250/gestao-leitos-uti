-- Script para verificar se a coluna matricula existe
-- Execute este script no Supabase SQL Editor

-- Verificar se a coluna existe
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'beds' AND column_name = 'matricula';

-- Se não retornar nenhuma linha, a coluna não existe
-- Execute então: supabase/migracao-matricula.sql

