# Monetag — Guía paso a paso (NicaFlix)

Tu web en producción: **https://web-five-plum-og6kinpc9v.vercel.app**

---

## Enlaces oficiales

| Paso | Enlace |
|------|--------|
| **1. Crear cuenta** | https://publishers.monetag.com/signUp |
| **2. Iniciar sesión** | https://publishers.monetag.com/signIn |
| **3. Agregar sitio** | https://publishers.monetag.com/sites/list |
| **4. Ayuda registro** | https://help.monetag.com/en/articles/6726305-how-do-i-get-started-as-a-publisher-signing-up |
| **5. Verificar sitio** | https://help.monetag.com/en/articles/6726312-how-do-i-get-started-as-a-publisher-add-and-verify-your-website-s |
| **6. Crear zonas (ads)** | https://help.monetag.com/en/articles/6726314-how-do-i-get-started-as-a-publisher-creating-ad-channels |

---

## Paso 1 — Crear cuenta (5 min)

1. Abre **https://publishers.monetag.com/signUp**
2. Elige **Individual** (persona) o **Company** (empresa/LLC)
3. Completa email, país, contraseña  
   - O usa **Continue with Google** (más rápido)
4. Revisa los [Términos](https://monetag.com/terms/#pterms) y pulsa **Sign Up**
5. Revisa tu correo → clic en **Activate account**
6. Crea y confirma tu contraseña

---

## Paso 2 — Agregar NicaFlix como sitio (3 min)

1. Entra a **Sites** → https://publishers.monetag.com/sites/list
2. Clic en **Add site**
3. Dominio (sin `https://`):
   ```
   web-five-plum-og6kinpc9v.vercel.app
   ```
4. Clic **Add site**

---

## Paso 3 — Verificar el sitio (elige UNA opción)

### Opción A — Meta tag (recomendada para Vercel)

1. En Monetag elige **Insert verification meta tag**
2. Copia la etiqueta `<meta name="..." content="...">`
3. En Vercel → tu proyecto **web** → **Settings → Environment Variables**:
   - Nombre: `NEXT_PUBLIC_MONETAG_VERIFY`
   - Valor: solo el `content="..."` (el código que te den)
4. Redeploy en Vercel
5. En Monetag clic **Verify**

### Opción B — Archivo sw.js (más ingresos en HTTPS)

1. En Monetag elige **Download sw.js**
2. Guarda el archivo en:
   ```
   C:\Users\diego\Projects\nicaflix\web\public\sw.js
   ```
3. Redeploy:
   ```powershell
   cd C:\Users\diego\Projects\nicaflix\web
   npx vercel deploy --prod --yes
   ```
4. Comprueba: https://web-five-plum-og6kinpc9v.vercel.app/sw.js
5. En Monetag clic **Verify**

---

## Paso 4 — Crear zona MultiTag (obtener ZONE ID)

> Monetag usa **Zone ID** (número), no “SITE_ID”. Es el ID de cada zona de anuncios.

1. Sitio verificado → clic en tu sitio
2. **Add zone**
3. Formato recomendado: **MultiTag** (5 formatos en 1 tag, +CPM)
4. Nombre sugerido: `nicaflix-multitag`
5. Clic **Get tag**
6. Copia el código. Verás algo como:
   ```html
   <script src="https://s.monetag.com/tag/12345678.js" ...></script>
   ```
7. El **ZONE ID** es el número en la URL: `12345678`

---

## Paso 5 — Zonas extra para deportes (máximo provecho)

Crea zonas adicionales en el mismo sitio:

| Zona | Formato | Dónde va en NicaFlix |
|------|---------|----------------------|
| MultiTag | MultiTag | Global (head) |
| Deportes IPP | In-Page Push | `/deportes` |
| OnClick | Popunder | Al abrir reproductor |

Anota cada **Zone ID** de la columna **ID** en el dashboard.

---

## Paso 6 — Configurar variables en Vercel

Vercel → **Settings → Environment Variables** → Production:

| Variable | Ejemplo | Obligatorio |
|----------|---------|-------------|
| `NEXT_PUBLIC_MONETAG_ZONE_ID` | `12345678` | Sí (MultiTag) |
| `NEXT_PUBLIC_MONETAG_ZONE_DEPORTES` | `87654321` | Opcional |
| `NEXT_PUBLIC_SITE_URL` | `https://web-five-plum-og6kinpc9v.vercel.app` | Sí |

**Redeploy** después de guardar.

---

## Paso 7 — App móvil (Monetag)

En `mobile/.env`:

```
EXPO_PUBLIC_MONETAG_ZONE_ID=12345678
EXPO_PUBLIC_MONETAG_DIRECT_LINK=https://tu-direct-link-de-monetag
```

Direct Link: en Monetag crea zona **Direct link** y copia la URL.

---

## Paso 8 — Comprobar que funciona

1. Dashboard Monetag → zona → debe decir **Installed correctly** (verde)
2. Abre tu web en incógnito — pueden tardar **3–7 días** en optimizar CPM
3. Activa **App Install Ads** en In-Page Push si está disponible (CPM alto)

---

## Soporte Monetag

- Help Center: https://help.monetag.com
- Email: contact.us@monetag.com
