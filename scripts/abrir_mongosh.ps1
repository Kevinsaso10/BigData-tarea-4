param([string]$NombreBD='')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$config = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $projectRoot 'config\local.json') | ConvertFrom-Json
if (!$NombreBD) { $NombreBD=$config.base }
if ($NombreBD -notmatch '^soporte_kevin_125_[A-Za-z0-9_]+$') { throw 'Nombre de base fuera del laboratorio.' }
& $config.mongosh ('mongodb://127.0.0.1:'+$config.puerto+'/'+$NombreBD+'?directConnection=true')
