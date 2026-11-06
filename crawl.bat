@echo off
title Radar Vagas TI - Discovery Engine
echo ====================================================
echo   Executando Discovery Engine de ATSs...
echo   Nicho: AI Ops, RevOps, N8N, CRM e Produto
echo   Filtro: Remoto ou Raio 150km de Muzambinho (<= 2d)
echo ====================================================
set "PATH=%~dp0.bin;%PATH%"
cmd /c "%~dp0.bin\npm.cmd" run discover
pause
