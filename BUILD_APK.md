# NicaFlix — Generar APK (Android)

## Requisitos

1. Cuenta gratis en **Expo**: https://expo.dev/signup
2. Node.js instalado
3. Proyecto web ya desplegado (hecho ✅)

---

## Paso 1 — Instalar dependencias

```powershell
cd C:\Users\diego\Projects\nicaflix\mobile
npm install
```

---

## Paso 2 — Configurar `.env`

Copia el ejemplo y edita:

```powershell
copy .env.example .env
```

Contenido mínimo:

```
EXPO_PUBLIC_API_URL=https://web-five-plum-og6kinpc9v.vercel.app
EXPO_PUBLIC_WEB_URL=https://web-five-plum-og6kinpc9v.vercel.app
EXPO_PUBLIC_MONETAG_ZONE_ID=
```

---

## Paso 3 — Iniciar sesión en Expo

```powershell
npx eas login
```

(O crea cuenta en https://expo.dev/signup y luego `eas login`)

---

## Paso 4 — Vincular proyecto EAS (solo una vez)

```powershell
npx eas init
```

- Confirma el slug: `nicaflix`
- Crea el proyecto en Expo cuando pregunte

---

## Paso 5 — Generar el APK

```powershell
npx eas build --platform android --profile production
```

- Tarda ~10–20 minutos (build en la nube de Expo)
- Al terminar recibes un **enlace de descarga del APK**

Descarga directa desde el dashboard: https://expo.dev/accounts/[tu-usuario]/projects/nicaflix/builds

---

## Paso 6 — APK de prueba rápida (sin Play Store)

Perfil `preview` (APK interno):

```powershell
npx eas build --platform android --profile preview
```

Instala el APK en tu Android:
1. Descarga el `.apk` al teléfono
2. Ajustes → Seguridad → permitir **Orígenes desconocidos**
3. Abre el archivo e instala

---

## Paso 7 — Publicar enlace de descarga en la web

Cuando tengas la URL del APK (Expo o tu hosting):

**Vercel → Environment Variables:**

```
NEXT_PUBLIC_ANDROID_APK_URL=https://url-de-tu-apk.apk
```

Redeploy. El botón **Android** en la web descargará la app.

---

## Script automático

```powershell
cd C:\Users\diego\Projects\nicaflix
.\scripts\build-apk.ps1
```

---

## Probar en desarrollo (sin APK)

```powershell
cd mobile
npm install
npx expo start
```

Escanea QR con **Expo Go** (Play Store).

---

## Notas

- **iOS** requiere Mac + cuenta Apple Developer ($99/año) — no genera APK
- El `package` Android es: `com.nicaflix.app`
- Logo e icono ya configurados en `assets/logo.png`
