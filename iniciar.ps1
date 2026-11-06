Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  Iniciando Radar Vagas TI..." -ForegroundColor Green
Write-Host "  Abra no seu navegador: http://localhost:3000" -ForegroundColor Yellow
Write-Host "====================================================" -ForegroundColor Cyan

$env:PATH = "$PSScriptRoot\.bin;$env:PATH"
& "$PSScriptRoot\.bin\npm.cmd" run dev
