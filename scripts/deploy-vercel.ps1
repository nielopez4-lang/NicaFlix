# NicaFlix — Deploy a Vercel
$ErrorActionPreference = "Stop"
$env:Path = "C:\Program Files\nodejs;" + $env:Path

Write-Host "=== NicaFlix Deploy ===" -ForegroundColor Cyan
Set-Location "$PSScriptRoot\..\web"

Write-Host "Verificando build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build falló" }

Write-Host "Desplegando a Vercel (producción)..." -ForegroundColor Yellow
npx vercel deploy --prod --yes

Write-Host ""
Write-Host "Listo. Copia la URL de producción y configura:" -ForegroundColor Green
Write-Host "  Vercel → Settings → Environment Variables → NEXT_PUBLIC_SITE_URL"
Write-Host "  mobile/.env → EXPO_PUBLIC_API_URL y EXPO_PUBLIC_WEB_URL"
