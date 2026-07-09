# Configura TODAS las variables Monetag en Vercel (ejecutar desde repo root)
# Requiere: npx vercel login

$vars = [ordered]@{
  "NEXT_PUBLIC_SITE_URL" = "https://web-five-plum-og6kinpc9v.vercel.app"
  "NEXT_PUBLIC_MONETAG_VERIFY" = "6c34729c43bee7297fd3f09cf22ea9ab"
  "NEXT_PUBLIC_MONETAG_ZONE_ID" = "258015"
  "NEXT_PUBLIC_MONETAG_SCRIPT_SRC" = "https://quge5.com/88/tag.min.js"
  "NEXT_PUBLIC_MONETAG_DIRECT_LINK" = "https://quge5.com/4/258015"
  "NEXT_PUBLIC_MONETAG_DIRECT_LINK_ZONE" = "258015"
  "NEXT_PUBLIC_MONETAG_INVOKE_SCRIPT" = "https://www.highperformanceformat.com/258015/invoke.js"
  "NEXT_PUBLIC_MONETAG_ZONE_BANNER" = "258015"
  "NEXT_PUBLIC_MONETAG_ZONE_HOME_TOP" = "258015"
  "NEXT_PUBLIC_MONETAG_ZONE_HOME_MID" = "258015"
  "NEXT_PUBLIC_MONETAG_ZONE_HOME_FEATURE" = "258015"
  "NEXT_PUBLIC_MONETAG_ZONE_HOME_BOTTOM" = "258015"
  "NEXT_PUBLIC_MONETAG_ZONE_DEPORTES" = "258015"
  "NEXT_PUBLIC_MONETAG_ZONE_DEPORTES_TOP" = "258015"
  "NEXT_PUBLIC_MONETAG_ZONE_DEPORTES_MID" = "258015"
  "NEXT_PUBLIC_MONETAG_ZONE_CATALOG" = "258015"
  "NEXT_PUBLIC_MONETAG_ZONE_ENVIVO" = "258015"
  "NEXT_PUBLIC_MONETAG_ZONE_PLAYER" = "258015"
  "NEXT_PUBLIC_MONETAG_ZONE_ADGATE_TOP" = "258015"
  "NEXT_PUBLIC_MONETAG_ZONE_ADGATE_MID" = "258015"
  "NEXT_PUBLIC_MONETAG_ZONE_ADGATE_BOTTOM" = "258015"
  "NEXT_PUBLIC_MONETAG_ZONE_PREROLL" = "258015"
  "NEXT_PUBLIC_ANDROID_APK_URL" = "https://expo.dev/artifacts/eas/C0eyFiPrbZY3JAjItEdnfI8_qDmK2pbiXePmR-Lw0gA.apk"
}

Set-Location "$PSScriptRoot\..\web"
foreach ($entry in $vars.GetEnumerator()) {
  Write-Host "Setting $($entry.Key)..."
  $entry.Value | npx vercel env add $entry.Key production --force 2>$null
  $entry.Value | npx vercel env add $entry.Key preview --force 2>$null
}

Write-Host "Done. Redeploy: npx vercel deploy --prod --yes"
