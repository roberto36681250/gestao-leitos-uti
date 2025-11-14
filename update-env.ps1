# Script para atualizar .env.local com credenciais do Supabase
# Execute: .\update-env.ps1

$supabaseUrl = Read-Host "Cole a URL do projeto Supabase (ex: https://xxxxx.supabase.co)"
$supabaseKey = Read-Host "Cole a chave anon public key"

# Ler o arquivo atual
$envContent = Get-Content .env.local -Raw

# Atualizar as variáveis do Supabase
$envContent = $envContent -replace 'NEXT_PUBLIC_SUPABASE_URL=.*', "NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl"
$envContent = $envContent -replace 'NEXT_PUBLIC_SUPABASE_ANON_KEY=.*', "NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseKey"

# Salvar o arquivo
$envContent | Set-Content .env.local -Encoding UTF8

Write-Host "✅ Arquivo .env.local atualizado com sucesso!" -ForegroundColor Green
Write-Host "🔄 Reinicie o servidor Next.js para aplicar as mudanças" -ForegroundColor Yellow

