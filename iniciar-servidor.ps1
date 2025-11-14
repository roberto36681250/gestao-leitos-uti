# Script para iniciar o servidor Next.js
# Execute: .\iniciar-servidor.ps1

Write-Host "🚀 Iniciando servidor Next.js..." -ForegroundColor Cyan

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: package.json não encontrado!" -ForegroundColor Red
    Write-Host "   Certifique-se de estar no diretório do projeto" -ForegroundColor Yellow
    exit 1
}

# Verificar se node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    pnpm install
}

# Iniciar servidor
Write-Host "✅ Iniciando servidor na porta 3000..." -ForegroundColor Green
pnpm dev

