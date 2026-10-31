@echo off
title Aloja-Te - Iniciar Sistema Completo
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ===============================================================================
echo            ALOJA-TE: ORQUESTADOR MAESTRO DE MICROSERVICIOS Y FRONTENDS
echo ===============================================================================
echo.
echo Detectando rutas de interpretes y entornos...

set "PHP_PATH=%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
if not exist "%PHP_PATH%" set "PHP_PATH=php"

set "PYTHON_PATH=%~dp0backend\ms-ia-copiloto\.venv\Scripts\python.exe"
if not exist "%PYTHON_PATH%" set "PYTHON_PATH=python"

echo   [OK] PHP:    %PHP_PATH%
echo   [OK] Python: %PYTHON_PATH%
echo.

echo ===============================================================================
echo 1. LANZANDO MICROSERVICIOS BACKEND
echo ===============================================================================

echo [1/7] MS-01: Usuarios, Alojamientos y Valoraciones (Spring Boot :3001)...
start "Aloja-Te [1/7] MS-01 Usuarios y Alojamientos (:3001)" powershell -NoExit -Command "cd '%~dp0backend\ms-usuarios-alojamientos'; Write-Host '===================================================' -ForegroundColor Cyan; Write-Host '  MS-01: Usuarios, Alojamientos y Valoraciones (:3001)' -ForegroundColor Cyan; Write-Host '===================================================' -ForegroundColor Cyan; mvn spring-boot:run '-Dspring-boot.run.profiles=dev'"

echo [2/7] MS-02: Reservas y Estadias (NestJS DynamoDB :3002)...
start "Aloja-Te [2/7] MS-02 Reservas y Estadias (:3002)" powershell -NoExit -Command "cd '%~dp0backend\ms-reservas-estadias'; Write-Host '===================================================' -ForegroundColor Yellow; Write-Host '  MS-02: Reservas y Estadias (:3002)' -ForegroundColor Yellow; Write-Host '===================================================' -ForegroundColor Yellow; pnpm run start:dev"

echo [3/7] MS-03: Comercial y Financiero (Laravel DDD :3003)...
start "Aloja-Te [3/7] MS-03 Comercial y Financiero (:3003)" powershell -NoExit -Command "cd '%~dp0backend\ms-comercial-financiero'; Write-Host '===================================================' -ForegroundColor Green; Write-Host '  MS-03: Comercial y Financiero (:3003)' -ForegroundColor Green; Write-Host '===================================================' -ForegroundColor Green; & '%PHP_PATH%' artisan serve --port=3003"

echo [4/7] MS-04: IA y Copiloto (FastAPI :3004)...
start "Aloja-Te [4/7] MS-04 IA y Copiloto (:3004)" powershell -NoExit -Command "cd '%~dp0backend\ms-ia-copiloto'; Write-Host '===================================================' -ForegroundColor DarkYellow; Write-Host '  MS-04: IA y Copiloto (:3004)' -ForegroundColor DarkYellow; Write-Host '===================================================' -ForegroundColor DarkYellow; & '%PYTHON_PATH%' main.py"

echo [5/7] API Gateway Central (Express Proxy :8080)...
start "Aloja-Te [5/7] API Gateway Central (:8080)" powershell -NoExit -Command "cd '%~dp0backend\gateway-api'; Write-Host '===================================================' -ForegroundColor Magenta; Write-Host '  API Gateway Central (:8080)' -ForegroundColor Magenta; Write-Host '===================================================' -ForegroundColor Magenta; pnpm run dev"

echo.
echo ===============================================================================
echo 2. LANZANDO MICROFRONTENDS DE USUARIO Y ADMINISTRACION
echo ===============================================================================

echo [6/7] Frontend Clientes y Anfitriones (React Vite :3000)...
start "Aloja-Te [6/7] Portal Clientes (:3000)" powershell -NoExit -Command "cd '%~dp0frontend\portal-clientes'; Write-Host '===================================================' -ForegroundColor Blue; Write-Host '  Portal Clientes (:3000)' -ForegroundColor Blue; Write-Host '===================================================' -ForegroundColor Blue; pnpm run dev"

echo [7/7] Frontend Administracion y Gestion (Angular :4200)...
start "Aloja-Te [7/7] Portal Admin (:4200)" powershell -NoExit -Command "cd '%~dp0frontend\portal-admin'; Write-Host '===================================================' -ForegroundColor DarkCyan; Write-Host '  Portal Admin (:4200)' -ForegroundColor DarkCyan; Write-Host '===================================================' -ForegroundColor DarkCyan; pnpm run start"

echo.
echo ===============================================================================
echo                    ECOSISTEMA ALOJA-TE EN EJECUCION
echo ===============================================================================
echo   - Portal Clientes:      http://localhost:3000
echo   - Portal Admin:         http://localhost:4200
echo   - API Gateway:          http://localhost:8080
echo   - MS-01 (Usuarios/Aloj):http://localhost:3001
echo   - MS-02 (Reservas):     http://localhost:3002
echo   - MS-03 (Finanzas):     http://localhost:3003
echo   - MS-04 (IA Copiloto):  http://localhost:3004
echo ===============================================================================
echo.
echo Para detener todos los servicios usa: detener-todo.bat
echo.
pause
