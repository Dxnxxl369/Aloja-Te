@echo off
title Aloja-Te - App Movil (Expo React Native)
cd /d "%~dp0frontend\app-movil"

if not exist ".expo-home" mkdir ".expo-home"
set "__UNSAFE_EXPO_HOME_DIRECTORY=%~dp0frontend\app-movil\.expo-home"
set "EXPO_NO_TELEMETRY=true"

echo ===============================================================================
echo                ALOJA-TE: INICIANDO APLICACION MOVIL (EXPO)
echo ===============================================================================
echo.
echo  [1] Tu celular y la PC deben estar en la misma red Wi-Fi:
echo      IP del API Gateway: http://192.168.0.21:8080
echo.
echo  [2] Abre la aplicacion 'Expo Go' en tu telefono (Android o iOS)
echo      y escanea el codigo QR que se mostrara a continuacion.
echo      (O ingresa manualmente en Expo Go: exp://192.168.0.21:8081)
echo.
echo  [Atajos utiles en esta consola]:
echo      - 'w'  : Abrir en el navegador web de la PC
echo      - 'a'  : Abrir en celular Android (si esta conectado por USB)
echo      - 'r'  : Recargar la aplicacion
echo.
echo ===============================================================================
echo.
npx expo start
pause
