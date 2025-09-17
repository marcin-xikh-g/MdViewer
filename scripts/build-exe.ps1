[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $repoRoot 'backend'

if (-not (Test-Path -LiteralPath $backendPath)) {
    throw "Backend directory not found at '$backendPath'."
}

$npm = Get-Command npm -ErrorAction Stop
$npmArgs = @('run', 'build:exe')

Write-Host "Running: npm $($npmArgs -join ' ') in $backendPath" -ForegroundColor Cyan

Push-Location -Path $backendPath
try {
    & $npm.Source @npmArgs
    if ($LASTEXITCODE -ne 0) {
        throw "npm run build:exe failed with exit code $LASTEXITCODE."
    }
    Write-Host "Executable build completed. Output in backend/dist." -ForegroundColor Green
}
finally {
    Pop-Location
}
