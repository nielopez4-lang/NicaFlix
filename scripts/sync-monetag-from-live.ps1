# Extrae configuración Monetag de la web en producción y la muestra / opcionalmente actualiza defaults.
param(
  [string]$SiteUrl = "https://web-five-plum-og6kinpc9v.vercel.app"
)

Write-Host "Leyendo $SiteUrl ..."
$html = (Invoke-WebRequest -Uri $SiteUrl -UseBasicParsing).Content

function Get-Match($pattern) {
  if ($html -match $pattern) { return $Matches[1] }
  return $null
}

$config = [ordered]@{
  siteUrl = $SiteUrl
  verify = Get-Match 'meta name="monetag" content="([^"]+)"'
  zoneId = Get-Match 'monetag\.com/tag/(\d+)\.js'
  scriptSrc = if ($html -match '(https://s\.monetag\.com/tag/\d+\.js)') { $Matches[1] } else { $null }
  directLink = Get-Match 'https://omg10\.com/4/(\d+)'
  invokeScript = if ($html -match '(https://www\.highperformanceformat\.com/\d+/invoke\.js)') { $Matches[1] } else { $null }
  androidApk = Get-Match 'href="(https://expo\.dev/artifacts/eas/[^"]+\.apk)"'
}

$config.directLink = if ($config.directLink) { "https://omg10.com/4/$($config.directLink)" } else { $null }

Write-Host "`n=== Monetag detectado en vivo ===" -ForegroundColor Cyan
$config.GetEnumerator() | ForEach-Object { Write-Host ("  {0}: {1}" -f $_.Key, $_.Value) }

Write-Host "`nCopia estos valores a vercel.json / monetag-defaults.ts si cambian." -ForegroundColor Yellow
