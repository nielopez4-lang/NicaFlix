# Despliegue NicaFlix en Vercel

## Sitio en producción

**URL:** https://web-five-plum-og6kinpc9v.vercel.app

Panel Vercel: https://vercel.com/nielopez4-2754s-projects/web

## Paso 1 — Autenticarte en Vercel (solo una vez)

En PowerShell:

```powershell
cd C:\Users\diego\Projects\nicaflix\web
npx vercel login
```

Se abrirá el navegador. Inicia sesión con Google o GitHub (gratis).

## Paso 2 — Desplegar a producción

```powershell
cd C:\Users\diego\Projects\nicaflix\web
npx vercel deploy --prod --yes
```

Al terminar verás una URL como: `https://nicaflix-xxxxx.vercel.app`

## Paso 3 — Variable de entorno (importante)

En https://vercel.com → tu proyecto → **Settings → Environment Variables**:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_SITE_URL` | Tu URL de Vercel (ej. `https://nicaflix.vercel.app`) |

Redeploy: **Deployments → ⋯ → Redeploy**

## Paso 4 — Conectar la app móvil

En `mobile/.env`:

```
EXPO_PUBLIC_API_URL=https://TU-URL.vercel.app
EXPO_PUBLIC_WEB_URL=https://TU-URL.vercel.app
```

## Paso 5 — Monetag (cuando tengas cuenta)

Variable en Vercel:

```
NEXT_PUBLIC_MONETAG_SITE_ID=tu_id_de_monetag
```

## Script automático

Ejecuta desde la raíz del proyecto:

```powershell
.\scripts\deploy-vercel.ps1
```

## Root directory en Vercel (si importas desde GitHub)

- **Root Directory:** `web`
- **Framework:** Next.js (auto-detectado)
