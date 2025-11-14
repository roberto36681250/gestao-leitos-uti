# 🔑 Atualizar Credenciais do Supabase

## Passo 1: Obter Credenciais no Supabase

1. No painel do Supabase, vá em **Settings** (⚙️) > **API**
2. Copie estas duas informações:
   - **Project URL**: `https://lhjepokggpfxsgzazgyf.supabase.co`
   - **anon public key**: (a chave longa que começa com `eyJ...`)

## Passo 2: Atualizar .env.local

Abra o arquivo `.env.local` na raiz do projeto e atualize estas linhas:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lhjepokggpfxsgzazgyf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=cole-aqui-a-chave-anon-completa
```

## Passo 3: Reiniciar o Servidor

1. Pare o servidor atual (Ctrl+C no terminal)
2. Inicie novamente:
   ```bash
   pnpm dev
   ```

## ✅ Pronto!

Acesse http://localhost:3000 e você deve ver os 20 leitos carregando!

