# Build APK NicaFlix
$ErrorActionPreference = "Stop"
$env:Path = "C:\Program Files\nodejs;" + $env:Path

Write-Host "=== NicaFlix APK Build ===" -ForegroundColor Cyan
Set-Location "$PSScriptRoot\..\mobile"

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Creado mobile/.env desde .env.example" -ForegroundColor Yellow
}

Write-Host "Instalando dependencias..." -ForegroundColor Yellow
npm install

Write-Host "Iniciando EAS Build (APK producción)..." -ForegroundColor Yellow
Write-Host "Si no has hecho login: npx eas login" -ForegroundColor Gray
Write-Host "Si es primera vez: npx eas init" -ForegroundColor Gray

npx eas-cli build --platform android --profile production

Write-Host ""
Write-Host "Cuando termine, copia la URL del APK a Vercel:" -ForegroundColor Green
Write-Host "  NEXT_PUBLIC_ANDROID_APK_URL"
