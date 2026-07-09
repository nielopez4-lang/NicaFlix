# Configura variables Monetag en Vercel (ejecutar desde web/)
# Requiere: npx vercel login

$vars = @{
  "NEXT_PUBLIC_SITE_URL" = "https://web-five-plum-og6kinpc9v.vercel.app"
  "NEXT_PUBLIC_MONETAG_ZONE_ID" = "11257226"
  "NEXT_PUBLIC_MONETAG_SCRIPT_SRC" = "https://s.monetag.com/tag/11257226.js"
  "NEXT_PUBLIC_MONETAG_DIRECT_LINK" = "https://omg10.com/4/11257226"
  "NEXT_PUBLIC_MONETAG_DIRECT_LINK_ZONE" = "11257226"
  "NEXT_PUBLIC_MONETAG_INVOKE_SCRIPT" = "https://www.highperformanceformat.com/11257226/invoke.js"
  "NEXT_PUBLIC_MONETAG_ZONE_BANNER" = "11257226"
  "NEXT_PUBLIC_MONETAG_ZONE_PREROLL" = "11257226"
  "NEXT_PUBLIC_MONETAG_ZONE_PLAYER" = "11257226"
}

Set-Location "$PSScriptRoot\..\web"
foreach ($entry in $vars.GetEnumerator()) {
  Write-Host "Setting $($entry.Key)..."
  $entry.Value | npx vercel env add $entry.Key production --force 2>$null
}

Write-Host "Done. Redeploy: npx vercel deploy --prod"
