param([ValidateSet('todos','preparar','cargar','crud','filtros','joins','agregaciones','indices','integridad')][string]$Paso='todos', [string]$NombreBD='', [switch]$Capturas)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$config = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $projectRoot 'config\local.json') | ConvertFrom-Json
if (!$NombreBD) { $NombreBD=$config.base }
if ($NombreBD -notmatch '^soporte_kevin_125_[A-Za-z0-9_]+$') { throw 'Nombre de base fuera del laboratorio.' }
# Comprobar e iniciar el motor antes de enviar consultas, también tras reiniciar Windows.
& (Join-Path $PSScriptRoot 'control_mongodb.ps1') iniciar
if (!$?) { throw 'No se pudo iniciar el MongoDB del laboratorio.' }
if ($Capturas) {
    Write-Host 'CONEXION LISTA. Puedes tomar una captura del ok:1 y la version.' -ForegroundColor Green
    $null = Read-Host 'Pulsa Enter para comenzar las consultas'
}
$stamp = Get-Date -Format 'yyyyMMdd_HHmmss_fff'
$outputFolder = Join-Path $projectRoot ('evidencias\sesion_'+$stamp)
New-Item -ItemType Directory -Path $outputFolder -Force | Out-Null
$steps = [ordered]@{preparar='01_preparar.js'; cargar='02_cargar.js'; crud='03_crud.js'; filtros='04_filtros.js'; joins='05_joins.js'; agregaciones='06_agregaciones.js'; indices='07_indices.js'; integridad='08_integridad.js'}
$oldRoot = $env:TAREA4_RAIZ
$oldOutput = $env:TAREA4_SALIDA
$oldDatabase = $env:TAREA4_BD
$oldCapturas = $env:TAREA4_CAPTURAS
$env:TAREA4_RAIZ = $projectRoot
$env:TAREA4_SALIDA = $outputFolder
$env:TAREA4_BD = $NombreBD
$env:TAREA4_CAPTURAS = if ($Capturas) { '1' } else { '0' }
$captureNumber = 0
if ($Capturas) {
    Write-Host 'MODO CAPTURAS: toma la captura de cada resultado y pulsa Enter para mostrar el siguiente.' -ForegroundColor Cyan
    Write-Host 'Si el resultado es largo, puedes subir con la rueda del ratón antes de continuar.'
}
try {
    foreach ($name in $steps.Keys) {
        if ($Paso -ne 'todos' -and $Paso -ne $name) { continue }
        $scriptFile = Join-Path $projectRoot ('mongodb\'+$steps[$name])
        Write-Output ('EJECUTANDO: ' + $steps[$name])
        $logPath = Join-Path $outputFolder ($name+'.log')
        $logWriter = [System.IO.StreamWriter]::new($logPath,$false,[System.Text.UTF8Encoding]::new($false))
        try {
            & $config.mongosh ('mongodb://127.0.0.1:'+$config.puerto+'/'+$NombreBD+'?directConnection=true') --quiet --file $scriptFile 2>&1 | ForEach-Object {
                $line = [string]$_
                if ($Capturas -and $line -eq '__TAREA4_CAPTURA_LISTA_125__') {
                    $captureNumber++
                    Write-Host ''
                    Write-Host ('CAPTURA ' + $captureNumber + ' - El resultado queda visible hasta que pulses Enter.') -ForegroundColor Yellow
                    $null = Read-Host 'Toma la captura y pulsa Enter para continuar'
                } else {
                    $logWriter.WriteLine($line)
                    $logWriter.Flush()
                    Write-Output $line
                }
            }
        } finally { $logWriter.Dispose() }
        if ($LASTEXITCODE -ne 0) { throw ('Falló el paso ' + $name + '. Se conservaron el registro y la salida.') }
    }
    $outputFolder | Set-Content -LiteralPath (Join-Path $projectRoot 'evidencias\ultima_sesion.txt') -Encoding UTF8
    Write-Output ('FINALIZACIÓN CORRECTA. Evidencias: ' + $outputFolder)
} finally { $env:TAREA4_RAIZ=$oldRoot; $env:TAREA4_SALIDA=$oldOutput; $env:TAREA4_BD=$oldDatabase; $env:TAREA4_CAPTURAS=$oldCapturas }
