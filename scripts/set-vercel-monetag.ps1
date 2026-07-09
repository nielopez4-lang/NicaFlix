# Configura TODAS las variables Monetag en Vercel (ejecutar desde repo root)
# Requiere: npx vercel login

$vars = [ordered]@{
  "NEXT_PUBLIC_SITE_URL" = "https://web-five-plum-og6kinpc9v.vercel.app"
  "NEXT_PUBLIC_MONETAG_VERIFY" = "6c34729c43bee7297fd3f09cf22ea9ab"
  "NEXT_PUBLIC_MONETAG_ZONE_ID" = "11257226"
  "NEXT_PUBLIC_MONETAG_SCRIPT_SRC" = "https://s.monetag.com/tag/11257226.js"
  "NEXT_PUBLIC_MONETAG_DIRECT_LINK" = "https://omg10.com/4/11257226"
  "NEXT_PUBLIC_MONETAG_DIRECT_LINK_ZONE" = "11257226"
  "NEXT_PUBLIC_MONETAG_INVOKE_SCRIPT" = "https://www.highperformanceformat.com/11257226/invoke.js"
  "NEXT_PUBLIC_MONETAG_ZONE_BANNER" = "11257226"
  "NEXT_PUBLIC_MONETAG_ZONE_HOME_TOP" = "11257226"
  "NEXT_PUBLIC_MONETAG_ZONE_HOME_MID" = "11257226"
  "NEXT_PUBLIC_MONETAG_ZONE_HOME_FEATURE" = "11257226"
  "NEXT_PUBLIC_MONETAG_ZONE_HOME_BOTTOM" = "11257226"
  "NEXT_PUBLIC_MONETAG_ZONE_DEPORTES" = "11257226"
  "NEXT_PUBLIC_MONETAG_ZONE_DEPORTES_TOP" = "11257226"
  "NEXT_PUBLIC_MONETAG_ZONE_DEPORTES_MID" = "11257226"
  "NEXT_PUBLIC_MONETAG_ZONE_CATALOG" = "11257226"
  "NEXT_PUBLIC_MONETAG_ZONE_ENVIVO" = "11257226"
  "NEXT_PUBLIC_MONETAG_ZONE_PLAYER" = "11257226"
  "NEXT_PUBLIC_MONETAG_ZONE_ADGATE_TOP" = "11257226"
  "NEXT_PUBLIC_MONETAG_ZONE_ADGATE_MID" = "11257226"
  "NEXT_PUBLIC_MONETAG_ZONE_ADGATE_BOTTOM" = "11257226"
  "NEXT_PUBLIC_MONETAG_ZONE_PREROLL" = "11257226"
  "NEXT_PUBLIC_ANDROID_APK_URL" = "https://expo.dev/artifacts/eas/C0eyFiPrbZY3JAjItEdnfI8_qDmK2pbiXePmR-Lw0gA.apk"
}

Set-Location "$PSScriptRoot\..\web"
foreach ($entry in $vars.GetEnumerator()) {
  Write-Host "Setting $($entry.Key)..."
  $entry.Value | npx vercel env add $entry.Key production --force 2>$null
  $entry.Value | npx vercel env add $entry.Key preview --force 2>$null
}

Write-Host "Done. Redeploy: npx vercel deploy --prod --yes"
