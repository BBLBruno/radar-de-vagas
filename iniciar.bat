@echo off
title Radar Vagas TI - Dev Server
echo ====================================================
echo   Iniciando Radar Vagas TI...
echo   Abra no seu navegador: http://localhost:3000
echo ====================================================
set "PATH=%~dp0.bin;%PATH%"
cmd /c "%~dp0.bin\npm.cmd" run dev
pause
