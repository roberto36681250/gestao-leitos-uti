# Migração: Adicionar Coluna Matrícula

Esta migração adiciona a coluna `matricula` na tabela `beds` para armazenar a matrícula do paciente quando o leito está ocupado.

## Arquivo SQL

O script de migração está em: `supabase/migracao-matricula.sql`

## Passos para Executar

### Via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Vá em **SQL Editor**
3. Copie o conteúdo do arquivo `supabase/migracao-matricula.sql`
4. Cole no editor e clique em **Run**

### Via CLI do Supabase

```bash
# Se você usa Supabase CLI localmente
supabase db push
# ou
psql -h <seu-host> -U postgres -d postgres -f supabase/migracao-matricula.sql
```

### O que a migração faz:

1. **Adiciona a coluna `matricula`** na tabela `beds`:
   - Tipo: `TEXT` (pode ser NULL)
   - A coluna é opcional porque:
     - Leitos vagos não têm matrícula
     - Leitos reservados podem ter a matrícula na tabela `reservations`

2. **Copia matrículas existentes**:
   - Para leitos que já têm uma `reservation` ativa, copia a matrícula da `reservation` para o `bed`

## Notas

- A matrícula é armazenada em dois lugares:
  - `beds.matricula`: quando o leito está ocupado
  - `reservations.matricula`: quando o leito está reservado
- O código prioriza `reservation.matricula` quando existe uma reserva ativa
- Se o leito estiver vago, a matrícula será `NULL`

## Verificação

Após executar a migração, verifique:

```sql
-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'beds' AND column_name = 'matricula';

-- Verificar alguns registros
SELECT id, number, state, matricula 
FROM beds 
LIMIT 10;
```

