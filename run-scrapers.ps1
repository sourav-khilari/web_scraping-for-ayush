param(
  [Parameter(Mandatory = $true)]
  [string] $Token,                                   # ADMIN_TOKEN from your .env

  [string] $BaseUrl = "http://localhost:8080",       # change if the API runs elsewhere

  [string[]] $Sources = @(
    "yourstory","startupindia","birac","investindia","inc42","ayushmin"
  ),

  [string] $OutDir = ".\scrape-logs",                # where to store JSON logs
  [int] $DelaySeconds = 2                             # pause between requests (polite)
)

# Prepare
$headers = @{ "x-admin-token" = $Token }
if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }
$ts = Get-Date -Format "yyyyMMdd-HHmmss"

Write-Host "Starting scrape batch at $ts"
Write-Host "BaseUrl: $BaseUrl"
Write-Host "Sources: $($Sources -join ', ')"
Write-Host "Logs dir: $OutDir"
Write-Host ""

$summary = @()

foreach ($src in $Sources) {
  $uri = "$BaseUrl/api/jobs/run?source=$src"
  Write-Host "→ Running source: $src"

  try {
    $resp = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -ErrorAction Stop

    # Save raw JSON result
    $jsonPath = Join-Path $OutDir ("run-$($src)-$ts.json")
    ($resp | ConvertTo-Json -Depth 10) | Out-File -FilePath $jsonPath -Encoding utf8
    Write-Host "   Saved response to $jsonPath"

    # Try to extract counts for quick view
    $urls    = $resp.results[0].urls
    $saved   = $resp.results[0].saved
    $skipped = $resp.results[0].skipped
    $dup     = $resp.results[0].dup
    $errors  = $resp.results[0].errors
    Write-Host "   Stats: urls=$urls saved=$saved skipped=$skipped dup=$dup errors=$errors"

    $summary += [PSCustomObject]@{
      Source  = $src
      Urls    = $urls
      Saved   = $saved
      Skipped = $skipped
      Dup     = $dup
      Errors  = $errors
      Log     = $jsonPath
    }
  }
  catch {
      Write-Warning "   ERROR running $($src): $($_.Exception.Message)"
  $summary += [PSCustomObject]@{
    Source  = $src
    Urls    = $null
    Saved   = $null
    Skipped = $null
    Dup     = $null
    Errors  = 1
    Log     = $null
  }
  }

  Start-Sleep -Seconds $DelaySeconds
}

Write-Host "`nBatch summary:"
$summary | Format-Table -AutoSize

# Optional: pull a small sample of items after the run
try {
  $itemsUri = "$BaseUrl/api/items?limit=10&page=1"
  $items = Invoke-RestMethod -Uri $itemsUri -ErrorAction Stop
  $itemsPath = Join-Path $OutDir ("items-sample-$ts.json")
  ($items | ConvertTo-Json -Depth 10) | Out-File -FilePath $itemsPath -Encoding utf8
  Write-Host "`nSaved items sample to $itemsPath"
}
catch {
  Write-Warning "Could not fetch items sample: $($_.Exception.Message)"
}
