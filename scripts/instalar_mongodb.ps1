param([string]$CacheDescargas = '')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$toolsRoot = Join-Path (Split-Path -Parent $projectRoot) 'Herramientas_MongoDB'
New-Item -ItemType Directory -Path $toolsRoot -Force | Out-Null
if (!$CacheDescargas) { $CacheDescargas = Join-Path $toolsRoot 'descargas' }
New-Item -ItemType Directory -Path $CacheDescargas -Force | Out-Null
$versions = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $projectRoot 'config\versiones.json') | ConvertFrom-Json
$paths = @{}
foreach ($name in @('servidor','shell')) {
    $spec = $versions.$name
    $archive = Join-Path $CacheDescargas $spec.archivo
    if (!(Test-Path -LiteralPath $archive)) {
        Write-Output ('Descargando ' + $name + ' ' + $spec.version)
        & curl.exe --fail --location --retry 3 --output $archive $spec.url
        if ($LASTEXITCODE -ne 0) { throw ('No se pudo descargar ' + $name) }
    }
    if ((Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant() -ne $spec.sha256) { throw ('La huella SHA256 no coincide: ' + $name) }
    $destination = Join-Path $toolsRoot $name
    $exeName = if ($name -eq 'servidor') { 'mongod.exe' } else { 'mongosh.exe' }
    $binary = Get-ChildItem -LiteralPath $destination -Filter $exeName -Recurse -File -ErrorAction SilentlyContinue | Select-Object -First 1
    if (!$binary) {
        Expand-Archive -LiteralPath $archive -DestinationPath $destination -Force
        $binary = Get-ChildItem -LiteralPath $destination -Filter $exeName -Recurse -File | Select-Object -First 1
    }
    if (!$binary) { throw ('No se encontró ' + $exeName) }
    $paths[$name] = $binary.FullName
}
$config = @{mongod=$paths.servidor; mongosh=$paths.shell; puerto=27017; base='soporte_kevin_125_20261119'}
$config | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $projectRoot 'config\local.json') -Encoding UTF8
& $config.mongod --version | Select-Object -First 1
& $config.mongosh --version
Write-Output 'MongoDB y mongosh preparados. Ambos archivos coinciden con sus huellas oficiales.'
