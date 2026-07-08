@echo off
title NicaFlix - Generar APK (v2)
cd /d C:\Users\diego\Projects\nicaflix\mobile
echo.
echo ========================================
echo   NicaFlix - Build APK corregido
echo ========================================
echo.
echo Verificando bundle JavaScript local...
call npx expo export --platform android
if errorlevel 1 (
  echo ERROR: El bundle fallo. Revisa arriba.
  pause
  exit /b 1
)
echo.
echo Bundle OK. Iniciando build en EAS (~15 min)...
echo.
call npx eas-cli build --platform android --profile production --non-interactive
echo.
echo Si termina bien, copia la URL del APK.
pause
