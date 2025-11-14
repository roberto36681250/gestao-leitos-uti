# Migração: Adicionar Coluna Version

## ⚠️ AÇÃO NECESSÁRIA NO SUPABASE

Para que o controle de versão concorrente funcione, você precisa executar os seguintes scripts SQL no Supabase:

## ✅ SCRIPT PRONTO PARA COPIAR

**IMPORTANTE:** Copie o conteúdo do arquivo `supabase/migracao-version.sql` diretamente (SEM os ```sql do markdown).

Ou execute este SQL completo no SQL Editor do Supabase:

```sql
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
```

**⚠️ COPIE APENAS O SQL DE DENTRO DAS TRIPLAS ASPAS - SEM OS ```sql E SEM AS TRIPLAS ASPAS!**

### 3. Verificar se funcionou

Execute para testar:

```sql
-- Verificar se a coluna existe
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'beds' AND column_name = 'version';

-- Verificar se o trigger existe
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'beds' AND trigger_name = 'beds_bump_version';
```

## ✅ Após executar

1. Reinicie o servidor Next.js (`pnpm dev`)
2. Teste atualizando um leito - a versão deve incrementar automaticamente
3. Teste com dois navegadores abertos simultaneamente para ver o controle de versão concorrente

## 📝 Nota

Se você já tinha leitos no banco antes desta migração, todos terão `version = 1` por padrão, o que está correto.

