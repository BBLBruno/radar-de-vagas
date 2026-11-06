@echo off
title Radar Vagas TI - Crawler
echo ====================================================
echo   Executando Crawler de ATSs (QuintoAndar, VTEX, etc)...
echo ====================================================
set "PATH=%~dp0.bin;%PATH%"
cmd /c "%~dp0.bin\npm.cmd" run crawl
pause
