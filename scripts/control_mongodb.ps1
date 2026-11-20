param([ValidateSet('iniciar','estado','detener')][string]$Accion='estado')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$config = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $projectRoot 'config\local.json') | ConvertFrom-Json
$runtime = Join-Path $projectRoot 'runtime'
New-Item -ItemType Directory -Path $runtime -Force | Out-Null
$pidPath = Join-Path $runtime 'mongod.pid'
$dataPath = Join-Path $runtime 'db'
$logPath = Join-Path $runtime 'mongod.log'
function Port-Open {
    $client = [System.Net.Sockets.TcpClient]::new()
    try { $task = $client.ConnectAsync('127.0.0.1',[int]$config.puerto); return $task.Wait(500) -and $client.Connected }
    catch { return $false }
    finally { $client.Dispose() }
}
function Assert-Owned {
    if (!(Test-Path -LiteralPath $pidPath)) { throw 'No existe un PID propio del laboratorio. No se modificó el proceso del puerto.' }
    $mongoPid = [int](Get-Content -LiteralPath $pidPath)
    $processInfo = Get-CimInstance Win32_Process -Filter ('ProcessId = ' + $mongoPid)
    if (!$processInfo -or $processInfo.ExecutablePath -ne $config.mongod -or !$processInfo.CommandLine.Contains($dataPath)) { throw 'El PID no corresponde a este laboratorio.' }
    return $mongoPid
}
if ($Accion -eq 'iniciar') {
    if (Port-Open) { $null=Assert-Owned; Write-Output 'El MongoDB de este laboratorio ya está iniciado.' }
    else {
        New-Item -ItemType Directory -Path $dataPath -Force | Out-Null
        $arguments = @('--dbpath', ('"'+$dataPath+'"'), '--bind_ip','127.0.0.1','--port',[string]$config.puerto,'--logpath',('"'+$logPath+'"'),'--logappend','--wiredTigerCacheSizeGB','0.25')
        $mongoProcess = Start-Process -FilePath $config.mongod -ArgumentList $arguments -WindowStyle Hidden -PassThru
        $mongoProcess.Id | Set-Content -LiteralPath $pidPath -Encoding ASCII
        $ready = $false
        for ($attempt=0; $attempt -lt 45; $attempt++) {
            if (Port-Open) { $ready=$true; break }
            if ($mongoProcess.HasExited) { throw ('MongoDB terminó. Revisar ' + $logPath) }
            Start-Sleep -Seconds 1
        }
        if (!$ready) { throw ('MongoDB no respondió a tiempo. Revisar ' + $logPath) }
    }
}
if ($Accion -eq 'detener') {
    if (!(Port-Open)) { Write-Output 'MongoDB ya está detenido.'; return }
    $mongoPid = Assert-Owned
    & $config.mongosh ('mongodb://127.0.0.1:'+$config.puerto+'/admin?directConnection=true') --quiet --eval 'db.shutdownServer()'
    for ($attempt=0; $attempt -lt 20; $attempt++) { if (!(Get-Process -Id $mongoPid -ErrorAction SilentlyContinue)) { Write-Output 'MongoDB detenido.'; return }; Start-Sleep -Milliseconds 500 }
    throw 'El cierre sigue en curso. Revisar el registro; no se forzó el proceso.'
}
if ($Accion -in @('iniciar','estado')) {
    if (!(Port-Open)) { throw 'MongoDB está detenido. Ejecutar control_mongodb.ps1 iniciar.' }
    $null=Assert-Owned
    & $config.mongosh ('mongodb://127.0.0.1:'+$config.puerto+'/'+$config.base+'?directConnection=true') --quiet --eval 'printjson({conexion: db.runCommand({ping:1}), version:db.version(), base:db.getName()})'
    if ($LASTEXITCODE -ne 0) { throw 'Falló la comprobación de conexión.' }
}
