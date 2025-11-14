# 🚀 Guia de Configuração do Supabase

Este guia vai te ajudar a configurar o Supabase para o projeto Gestão de Leitos.

## 📋 Passo 1: Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em **"New Project"**
4. Preencha:
   - **Name**: `gestao-leitos` (ou outro nome de sua preferência)
   - **Database Password**: Crie uma senha forte (anote em local seguro!)
   - **Region**: Escolha a região mais próxima (ex: South America - São Paulo)
   - **Pricing Plan**: Free (suficiente para desenvolvimento)
5. Clique em **"Create new project"**
6. Aguarde alguns minutos enquanto o projeto é criado

## 📋 Passo 2: Obter Credenciais

1. No painel do projeto, vá em **Settings** (ícone de engrenagem) > **API**
2. Você verá duas informações importantes:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Uma chave longa começando com `eyJ...`
3. Copie essas informações

## 📋 Passo 3: Configurar Variáveis de Ambiente

1. No diretório do projeto, crie um arquivo `.env.local` (se ainda não existir)
2. Adicione as seguintes linhas:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

**⚠️ IMPORTANTE**: Substitua pelos valores reais que você copiou no Passo 2!

## 📋 Passo 4: Executar Scripts SQL

1. No painel do Supabase, vá em **SQL Editor** (ícone de banco de dados no menu lateral)
2. Execute os scripts **na ordem abaixo**, um de cada vez:

### 4.1. Executar schema.sql

1. Clique em **"New query"**
2. Copie e cole o conteúdo do arquivo `supabase/schema.sql`
3. Clique em **"Run"** (ou pressione Ctrl+Enter)
4. Aguarde a confirmação de sucesso

### 4.2. Executar triggers.sql

1. Clique em **"New query"** (ou limpe o editor)
2. Copie e cole o conteúdo do arquivo `supabase/triggers.sql`
3. Clique em **"Run"**
4. Aguarde a confirmação de sucesso

### 4.3. Executar policies.sql

1. Clique em **"New query"** (ou limpe o editor)
2. Copie e cole o conteúdo do arquivo `supabase/policies.sql`
3. Clique em **"Run"**
4. Aguarde a confirmação de sucesso

### 4.4. Executar seed.sql

1. Clique em **"New query"** (ou limpe o editor)
2. Copie e cole o conteúdo do arquivo `supabase/seed.sql`
3. Clique em **"Run"**
4. Aguarde a confirmação de sucesso

## 📋 Passo 5: Habilitar Realtime

1. No painel do Supabase, vá em **Database** > **Replication**
2. Você verá uma lista de tabelas
3. Procure pelas tabelas:
   - `beds`
   - `reservations`
4. Para cada uma delas, clique no **toggle/switch** para ativar a replicação
5. Aguarde alguns segundos para a configuração ser aplicada

## ✅ Verificação

Para verificar se tudo está configurado corretamente:

1. Vá em **Table Editor** no menu lateral
2. Você deve ver duas tabelas: `beds` e `reservations`
3. Clique na tabela `beds` - você deve ver 20 leitos (números 21 a 40)

## 🔄 Reiniciar o Servidor

Após configurar tudo:

1. Pare o servidor Next.js (Ctrl+C no terminal)
2. Reinicie com `pnpm dev`
3. Acesse http://localhost:3000

## 🆘 Problemas Comuns

### Erro: "Missing Supabase environment variables"
- Verifique se o arquivo `.env.local` existe na raiz do projeto
- Verifique se as variáveis estão corretas (sem espaços extras)
- Reinicie o servidor após criar/editar o `.env.local`

### Erro: "relation does not exist"
- Verifique se executou todos os scripts SQL na ordem correta
- Verifique se não houve erros ao executar os scripts

### Realtime não funciona
- Verifique se habilitou a replicação para ambas as tabelas
- Aguarde alguns minutos após habilitar (pode levar tempo para propagar)

## 📞 Precisa de Ajuda?

Se encontrar problemas, verifique:
1. Os logs do terminal do Next.js
2. O console do navegador (F12)
3. Os logs do Supabase (Settings > Logs)

