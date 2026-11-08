# ===============================================================
# Aloja-Te: Orquestador de Arranque de Backends en PowerShell
# ===============================================================

$ErrorActionPreference = "Continue"

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "       LEVANTANDO ECOSISTEMA BACKEND DE ALOJA-TE               " -ForegroundColor Yellow
Write-Host "===============================================================" -ForegroundColor Cyan

$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }

# Ruta de PHP detectada
$phpBin = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
if (-not (Test-Path $phpBin)) { $phpBin = "php" }

Write-Host "`n[1/4] Levantando MS-01: Usuarios y Alojamientos (Spring Boot :3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend\ms-usuarios-alojamientos'; Write-Host '--- MS-01: Usuarios y Alojamientos (:3001) ---' -ForegroundColor Cyan; mvn spring-boot:run '-Dspring-boot.run.profiles=dev'"

Write-Host "[2/4] Levantando MS-02: Reservas y Estadías (NestJS DynamoDB :3002)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend\ms-reservas-estadias'; Write-Host '--- MS-02: Reservas y Estadías (:3002) ---' -ForegroundColor Yellow; pnpm run start:dev"

Write-Host "[3/4] Levantando MS-03: Comercial y Financiero (Laravel DDD :3003)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend\ms-comercial-financiero'; Write-Host '--- MS-03: Comercial y Financiero (:3003) ---' -ForegroundColor Green; & '$phpBin' artisan serve --port=3003"

$pythonBin = "$root\backend\ms-ia-copiloto\.venv\Scripts\python.exe"
if (-not (Test-Path $pythonBin)) { $pythonBin = "python" }

Write-Host "[4/5] Levantando MS-04: IA y Copiloto (FastAPI NLP :3004)..." -ForegroundColor DarkYellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend\ms-ia-copiloto'; Write-Host '--- MS-04: IA, Copiloto y Clasificador NLP (:3004) ---' -ForegroundColor DarkYellow; & '$pythonBin' main.py"

Write-Host "[5/5] Levantando API Gateway (:8080)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend\gateway-api'; Write-Host '--- API Gateway (:8080) ---' -ForegroundColor Magenta; pnpm start"

Write-Host "`n===============================================================" -ForegroundColor Cyan
Write-Host "  ¡Las 5 ventanas de terminal han sido abiertas exitosamente! " -ForegroundColor Green
Write-Host "  - API Gateway: http://localhost:8080                         " -ForegroundColor White
Write-Host "  - MS-01:       http://localhost:3001                         " -ForegroundColor White
Write-Host "  - MS-02:       http://localhost:3002                         " -ForegroundColor White
Write-Host "  - MS-03:       http://localhost:3003                         " -ForegroundColor White
Write-Host "  - MS-04:       http://localhost:3004                         " -ForegroundColor White
Write-Host "===============================================================`n" -ForegroundColor Cyan
