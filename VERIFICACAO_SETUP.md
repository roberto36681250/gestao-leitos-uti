# ✅ VERIFICAÇÃO DE SETUP - SISTEMA DE GESTÃO DE LEITOS

## 📋 Checklist de Configuração

### 1. ✅ Banco de Dados - Schema Principal

O arquivo `supabase/schema.sql` já está atualizado com:
- ✅ Tabela `beds` com todas as colunas necessárias
- ✅ Estados incluídos: `'Previsão de Alta em 24h'` e `'Bloqueado'`
- ✅ Coluna `previsao_alta_24h_at` 
- ✅ Coluna `matricula`
- ✅ Coluna `last_initials`
- ✅ Coluna `version` (controle de concorrência)

**Ação**: Se o banco foi criado antes, execute as migrações pendentes.

### 2. 🔄 Migrações Pendentes (se necessário)

Se o banco já existia antes, execute na seguinte ordem:

#### A. Migração: Previsão de Alta em 24h
```bash
# Execute no Supabase SQL Editor:
# Arquivo: supabase/migracao-previsao-alta-24h.sql
```

#### B. Migração: Bloqueado (renomear Interdição)
```bash
# Execute no Supabase SQL Editor:
# Arquivo: supabase/migracao-bloqueado.sql
```

#### C. Migração: Matrícula
```bash
# Execute no Supabase SQL Editor:
# Arquivo: supabase/migracao-matricula.sql
```

#### D. Migração: Last Initials
```bash
# Execute no Supabase SQL Editor:
# Arquivo: supabase/migracao-last-initials.sql
```

#### E. Migração: Version (controle de concorrência)
```bash
# Execute no Supabase SQL Editor:
# Arquivo: supabase/migracao-version.sql
```

### 3. ✅ Triggers

O arquivo `supabase/triggers.sql` já está atualizado com:
- ✅ Função `bump_version()` - incrementa versão automaticamente
- ✅ Trigger `beds_bump_version` - antes de cada UPDATE
- ✅ Função `set_vago_since()` - define timestamp quando fica vago

**Ação**: Execute se os triggers ainda não foram criados.

### 4. ✅ Políticas RLS

O arquivo `supabase/policies.sql` já está configurado com:
- ✅ SELECT público
- ✅ UPDATE público
- ✅ INSERT em reservations

**Ação**: Execute se as políticas ainda não foram criadas.

### 5. ✅ Realtime

O arquivo `supabase/enable-realtime.sql` deve ser executado para habilitar Realtime nas tabelas:
- ✅ Tabela `beds`
- ✅ Tabela `reservations`

**Ação**: Execute no Supabase SQL Editor OU habilite manualmente em:
- Database → Replication → Habilitar para `beds` e `reservations`

### 6. ✅ Variáveis de Ambiente

Verifique se o arquivo `.env.local` existe com:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 7. ✅ Instalação de Dependências

Execute no terminal:
```bash
pnpm install
```

### 8. ✅ Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev

# Build
pnpm build

# Produção
pnpm start

# Testes
pnpm test
```

## 🚀 Início Rápido

### Se o banco já existe:
1. Execute as migrações pendentes (se houver)
2. Verifique os triggers
3. Verifique as políticas RLS
4. Habilite Realtime

### Se o banco é novo:
1. Execute `supabase/schema.sql`
2. Execute `supabase/triggers.sql`
3. Execute `supabase/policies.sql`
4. Execute `supabase/enable-realtime.sql`
5. Execute `supabase/seed.sql` (opcional - dados de teste)

## ⚠️ Problemas Comuns

### Erro: "column does not exist"
**Solução**: Execute as migrações correspondentes ao erro.

### Erro: "state check constraint"
**Solução**: Execute `migracao-previsao-alta-24h.sql` e `migracao-bloqueado.sql`.

### Erro: Realtime não funciona
**Solução**: Habilite Realtime em Database → Replication.

### Erro: "JWT" ou autenticação
**Solução**: Verifique as variáveis de ambiente e as políticas RLS.

## 📊 Verificação Final

Após executar tudo, verifique:

1. ✅ Tabela `beds` existe com todas as colunas
2. ✅ Estado `'Previsão de Alta em 24h'` é válido
3. ✅ Estado `'Bloqueado'` é válido
4. ✅ Trigger `beds_bump_version` está ativo
5. ✅ Realtime está habilitado
6. ✅ Políticas RLS estão ativas
7. ✅ Variáveis de ambiente configuradas

## 🎯 Pronto para Usar!

Se tudo estiver configurado, execute:
```bash
pnpm dev
```

E acesse: `http://localhost:3000`

