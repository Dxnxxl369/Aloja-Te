@echo off
title Aloja-Te - Iniciar Solo Backends y Gateway
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ===============================================================================
echo            ALOJA-TE: INICIANDO ECOSISTEMA DE BACKENDS Y GATEWAY
echo ===============================================================================
echo.

set "PHP_PATH=%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
if not exist "%PHP_PATH%" set "PHP_PATH=php"

set "PYTHON_PATH=%~dp0backend\ms-ia-copiloto\.venv\Scripts\python.exe"
if not exist "%PYTHON_PATH%" set "PYTHON_PATH=python"

echo [1/5] MS-01: Usuarios, Alojamientos y Valoraciones (Spring Boot :3001)...
start "Aloja-Te [1/5] MS-01 Usuarios y Alojamientos (:3001)" powershell -NoExit -Command "cd '%~dp0backend\ms-usuarios-alojamientos'; Write-Host 'Iniciando Spring Boot con perfil DEV (H2)...' -ForegroundColor Cyan; mvn spring-boot:run '-Dspring-boot.run.profiles=dev'"

echo [2/5] MS-02: Reservas y Estadias (NestJS DynamoDB :3002)...
start "Aloja-Te [2/5] MS-02 Reservas y Estadias (:3002)" powershell -NoExit -Command "cd '%~dp0backend\ms-reservas-estadias'; Write-Host 'Iniciando NestJS...' -ForegroundColor Yellow; pnpm run start:dev"

echo [3/5] MS-03: Comercial y Financiero (Laravel DDD :3003)...
start "Aloja-Te [3/5] MS-03 Comercial y Financiero (:3003)" powershell -NoExit -Command "cd '%~dp0backend\ms-comercial-financiero'; Write-Host 'Iniciando Laravel DDD...' -ForegroundColor Green; & '%PHP_PATH%' artisan serve --port=3003"

echo [4/5] MS-04: IA y Copiloto (FastAPI :3004)...
start "Aloja-Te [4/5] MS-04 IA y Copiloto (:3004)" powershell -NoExit -Command "cd '%~dp0backend\ms-ia-copiloto'; Write-Host 'Iniciando FastAPI...' -ForegroundColor DarkYellow; & '%PYTHON_PATH%' main.py"

echo [5/5] API Gateway Central (Express Proxy :8080)...
start "Aloja-Te [5/5] API Gateway Central (:8080)" powershell -NoExit -Command "cd '%~dp0backend\gateway-api'; Write-Host 'Iniciando API Gateway...' -ForegroundColor Magenta; pnpm run dev"

echo.
echo ===============================================================================
echo   Backends y Gateway iniciados:
echo   - Gateway:    http://localhost:8080
echo   - MS-01:      http://localhost:3001
echo   - MS-02:      http://localhost:3002
echo   - MS-03:      http://localhost:3003
echo   - MS-04:      http://localhost:3004
echo ===============================================================================
echo.
pause
