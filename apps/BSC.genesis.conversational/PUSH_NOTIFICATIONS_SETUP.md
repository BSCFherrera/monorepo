# Push Notifications Setup

La app ya incluye:

- Solicitud de permiso de notificaciones en Android 13+ al iniciar.
- Permiso nativo `POST_NOTIFICATIONS` en AndroidManifest.
- Servicio base `PushNotificationService` para centralizar inicializacion.

## Para habilitar push reales (FCM/APNs)

1. Crear proyecto en Firebase y registrar la app Android/iOS.
2. Android: colocar `google-services.json` en `android/app/`.
3. iOS: colocar `GoogleService-Info.plist` en proyecto iOS y habilitar Push Notifications + Background Modes.
4. Integrar proveedor de mensajeria (FCM o APNs) en backend para envio de mensajes.
5. Registrar token de dispositivo en backend durante login.

## Punto de extension recomendado

- Servicio: `src/services/push-notification.service.ts`
- Inicializacion global: `src/App.tsx`

Aqui puedes agregar:

- obtencion de token,
- listeners para notificacion en foreground/background,
- navegacion contextual desde notificaciones.
