# NicaFlix

Plataforma de streaming con **web de descargas + monetización** y **app móvil** (Android/iOS).

## Recomendación de stack (máximo provecho)

| Capa | Tecnología | Por qué |
|------|------------|---------|
| Web landing | **Next.js 15** | SEO para que te encuentren en Google, carga rápida, fácil desplegar en Vercel |
| App móvil | **Expo (React Native)** | Un solo código → Android + iOS |
| Base de datos | **Firebase Firestore** | Panel desde PC, sync instantáneo a la app |
| Pagos Pro | **Stripe** ($5/mes) | Suscripciones recurrentes a tu LLC |
| Anuncios | **Monetag** | Native Banners + App Install Ads (CPM alto en deportes) |

## Estructura

```
nicaflix/
├── web/          → Landing: descargas, ads, SEO, CTA Pro
└── mobile/       → App: Inicio, En Vivo, Deportes, Perfil/Pro
```

## Requisitos

1. Instala **Node.js LTS**: https://nodejs.org
2. Cuenta **Firebase**: https://firebase.google.com
3. Cuenta **Stripe**: https://stripe.com
4. Cuenta **Monetag**: https://monetag.com
5. (Opcional) **TMDb API** para posters: https://www.themoviedb.org/settings/api
6. (Opcional) **YouTube Data API** para listar videos embeddables

## Web — arrancar

```powershell
cd web
copy .env.example .env.local
npm install
npm run dev
```

Abre http://localhost:3000

### Monetización web

La landing incluye **6 slots de anuncios nativos**:
- Banner superior (primer scroll)
- Nativo central
- 3 slots en sección Deportes (Resultados, Tabla, Próximos)
- Banner inferior

Configura `NEXT_PUBLIC_MONETAG_SITE_ID` en `.env.local`.

## App móvil — arrancar

```powershell
cd mobile
copy .env.example .env
npm install
npx expo start
```

Escanea el QR con **Expo Go** (Android/iOS).

## Contenido — fuentes legales

### Películas y series
- **YouTube embed**: solo videos donde el propietario permite incrustar (`embeddable: true` vía YouTube Data API).
- **TMDb**: metadatos, posters y sinopsis (gratis). El video sigue siendo de una fuente con derechos.
- **Internet Archive**: películas de dominio público con permiso de redistribución.

### En vivo
- Usa URLs de streams **con licencia** (contrato con el proveedor o tus propios streams).
- La app incluye `LicensedStreamPlayer` para HLS/DASH autorizados.
- Administra canales en Firebase → colección `lives`.

> **Importante:** No reempaquetar IPTV/listas de terceros ocultando el origen puede violar derechos de autor y términos de servicio. NicaFlix está preparada para fuentes **autorizadas**.

### Deportes
- Firebase → colección `deportes` con eventos del día.
- Anuncios Monetag en pausas para usuarios free (cada 2 min — implementar timer en producción).
- Usuarios Pro saltan ads vía `verificarAcceso()`.

## Firebase — estructura sugerida

```
peliculas/
series/
anime/
kids/
lives/
deportes/
users/{uid}/es_premium
```

Desde tu PC puedes usar Firebase Console o un panel admin (próximo paso).

## Plan Pro — flujo

1. Usuario paga en Stripe Checkout ($5/mes).
2. Webhook de Stripe marca `es_premium = true` en Firebase.
3. La app llama `verificarAcceso()` → salta ads y abre reproductor directo.

## Despliegue

- **Web**: Vercel (gratis) → conecta repo GitHub, carpeta `web`
- **Android**: `eas build --platform android` (Expo Application Services)
- **iOS**: `eas build --platform ios` + App Store Connect

## Próximos pasos

1. Instalar Node.js
2. Crear proyecto Firebase y pegar keys en `.env`
3. Registrar Monetag y Stripe
4. Rellenar URLs de descarga (APK + App Store)
5. Subir contenido real a Firestore
