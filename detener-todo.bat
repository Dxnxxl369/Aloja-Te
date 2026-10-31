@echo off
title Aloja-Te - Detener Todos los Servicios
echo ===============================================================================
echo            ALOJA-TE: DETENIENDO TODOS LOS SERVICIOS Y FRONTENDS
echo ===============================================================================
echo.
echo Liberando puertos: 3000, 3001, 3002, 3003, 3004, 4200, 8080...
echo.

powershell -Command ^
  "$ports = @(3000, 3001, 3002, 3003, 3004, 4200, 8080);" ^
  "foreach ($port in $ports) {" ^
  "  $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue;" ^
  "  if ($connections) {" ^
  "    foreach ($conn in $connections) {" ^
  "      $procId = $conn.OwningProcess;" ^
  "      if ($procId -gt 0) {" ^
  "        try {" ^
  "          Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue;" ^
  "          Write-Host ('  [OK] Proceso ' + $procId + ' detenido en puerto ' + $port) -ForegroundColor Green;" ^
  "        } catch {}" ^
  "      }" ^
  "    }" ^
  "  } else {" ^
  "    Write-Host ('  [-] Puerto ' + $port + ' ya estaba libre') -ForegroundColor DarkGray;" ^
  "  }" ^
  "}"

echo.
echo ===============================================================================
echo                     TODOS LOS SERVICIOS HAN SIDO DETENIDOS
echo ===============================================================================
echo.
pause
