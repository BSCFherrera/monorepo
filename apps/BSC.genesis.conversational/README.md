# App Conversacional - Banco Santa Cruz

Aplicación móvil conversacional para el Banco Santa Cruz desarrollada con React Native CLI (sin Expo). Permite a los clientes realizar transacciones, consultas y solicitudes de productos a través de un asistente virtual con IA que se comunica mediante WebSocket.

## Trazabilidad Jira + Azure DevOps

La guía operativa de trazabilidad (validación en PR, gate de producción y onboarding para nuevos proyectos) está en:

- docs/traceability/README.md

## 🧩 En el monorepo BSC Genesis

Esta app vive en `apps/BSC.genesis.conversational` del monorepo (Nx + pnpm), junto a mobile banking. **Esta sección reemplaza** a «Instalación», «Ejecución» y «Scripts disponibles» más abajo, que describen el repositorio independiente anterior (npm/bun).

Requisitos: Node ≥ 22.11, pnpm 9 (`corepack enable`), JDK 17 y Android SDK; Xcode y CocoaPods para iOS.

### Variables de entorno (no se versionan)

Copiar a mano, nunca commitear (el `.gitignore` los excluye):

| Archivo | Para qué | Plantilla |
|---|---|---|
| `.env` | Variables de la app vía `react-native-config` (WebSocket, API, FIDO, Autentikar) | `.env.example` |
| `android/.env` | Credenciales del Maven privado de Autentikar, solo en tiempo de compilación. **Sin él, Gradle no descarga el SDK y la compilación de Android falla** | `android/.env.example` |

### Arranque (desde la raíz del monorepo)

```bash
pnpm install                  # dependencias compartidas de todo el monorepo
pnpm conversational:start     # terminal 1: Metro
pnpm conversational:android   # terminal 2: compila e instala (o pnpm conversational:ios)
```

Dentro de esta carpeta también sirven `pnpm start|android|ios`. Los comandos están definidos una sola vez en [`project.json`](project.json); para cambiarlos se edita ese archivo. Otros: `pnpm nx run BSC.genesis.conversational:lint|typecheck|test`.

- El target `android` corre `react-native run-android --no-packager --active-arch-only`: Metro se arranca antes, en su propia terminal, y se compila solo la arquitectura del dispositivo conectado (ver el README de mobile banking para el porqué).
- Mobile banking también usa Metro en el puerto 8081: no se pueden correr los dos Metro a la vez sin cambiar el puerto de uno (`react-native start --port 8082`).
- iOS: `cd apps/BSC.genesis.conversational/ios && bundle install && bundle exec pod install` después de cada cambio de dependencias nativas.

### Dependencias

Las versiones viven en el catálogo de pnpm (`pnpm-workspace.yaml`) y las dos apps declaran el mismo conjunto: ver `docs/mobile/dependencias-compartidas.md`. Nunca escribir una versión en este `package.json`; `pnpm deps:check` lo verifica. Los parches de `react-native-tts` y `@react-native-voice/voice` están en `patches/` de la raíz.

## 🚀 Características

- **Chat con IA**: Asistente virtual para consultas y operaciones bancarias
- **Transacciones**: Visualización y gestión de transacciones
- **Productos**: Consulta y solicitud de productos bancarios
- **Perfil**: Gestión de información personal y configuración
- **WebSocket**: Comunicación en tiempo real con el servidor IA
- **TypeScript**: Type safety en todo el proyecto
- **Arquitectura limpia**: Separación de responsabilidades
- **Componentes reutilizables**: Sistema de diseño consistente
- **Navegación moderna**: React Navigation con tabs

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

### Para desarrollo en general:

- Node.js >= 18.x
- npm o yarn
- Git

### Para desarrollo Android:

- Java Development Kit (JDK) 17
- Android Studio con:
  - Android SDK
  - Android SDK Platform 34
  - Android Build Tools
  - Android Emulator (opcional, para testing)
- Variables de entorno configuradas:
  - `ANDROID_HOME`
  - `JAVA_HOME`

### Para desarrollo iOS (solo macOS):

- Xcode 14.0 o superior
- CocoaPods
- iOS Simulator
- Apple Developer Account (para dispositivos físicos)

## 🛠️ Instalación

### 1. Clonar o acceder al proyecto

```bash
cd "c:\Users\jessi\AppConversacional BSC"
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Android (si vas a desarrollar para Android)

Asegúrate de tener las variables de entorno configuradas:

```bash
# En Windows (PowerShell)
$env:ANDROID_HOME = "C:\Users\TuUsuario\AppData\Local\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"

# Agregar al PATH
$env:Path += ";$env:ANDROID_HOME\platform-tools"
$env:Path += ";$env:ANDROID_HOME\tools"
```

### 4. Configurar iOS (solo macOS)

```bash
cd ios
pod install
cd ..
```

## ▶️ Ejecución

### Iniciar Metro Bundler

```bash
npm start
```

### Ejecutar en Android

```bash
# En un emulador o dispositivo conectado
npm run android

# O manualmente:
npx react-native run-android
```

### Ejecutar en iOS (solo macOS)

```bash
# En el simulador
npm run ios

# O manualmente:
npx react-native run-ios

# Para un dispositivo específico:
npx react-native run-ios --device "Nombre del dispositivo"
```

## 📁 Estructura del Proyecto

```
AppConversacionalBSC/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── Header.tsx
│   │   └── index.ts
│   ├── screens/             # Pantallas de la aplicación
│   │   ├── ChatScreen.tsx
│   │   ├── TransactionsScreen.tsx
│   │   ├── ProductsScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── index.ts
│   ├── navigation/          # Configuración de navegación
│   │   ├── Navigation.tsx
│   │   └── index.ts
│   ├── services/            # Servicios (API, WebSocket)
│   │   ├── websocket.service.ts
│   │   └── index.ts
│   ├── hooks/               # Custom hooks
│   │   ├── useChat.ts
│   │   └── index.ts
│   ├── utils/               # Utilidades y helpers
│   │   ├── helpers.ts
│   │   └── index.ts
│   ├── types/               # Tipos TypeScript
│   │   └── index.ts
│   ├── constants/           # Constantes y configuración
│   │   ├── theme.ts
│   │   ├── config.ts
│   │   └── index.ts
│   ├── styles/              # Estilos globales
│   │   ├── global.styles.ts
│   │   └── index.ts
│   └── App.tsx              # Componente principal
├── android/                 # Proyecto Android nativo
├── ios/                     # Proyecto iOS nativo
├── index.js                 # Punto de entrada
├── app.json                 # Configuración de la app
├── package.json             # Dependencias
├── tsconfig.json            # Configuración TypeScript
├── babel.config.js          # Configuración Babel
├── metro.config.js          # Configuración Metro
└── README.md                # Este archivo
```

## 🎨 Características Técnicas

### WebSocket Service

- Reconexión automática
- Cola de mensajes pendientes
- Manejo de errores robusto
- Sistema de eventos para subscriptores

### Gestión de Estado

- React Hooks para estado local
- Custom hooks para lógica compartida
- Separación de concerns

### Sistema de Diseño

- Colores corporativos del Banco Santa Cruz
- Componentes consistentes y reutilizables
- Espaciados y tipografía estandarizados
- Modo claro (preparado para modo oscuro)

### TypeScript

- Tipado estricto
- Interfaces bien definidas
- Type safety en toda la aplicación

## ⚙️ Configuración

### WebSocket URL

Edita el archivo `src/constants/config.ts` para cambiar la URL del WebSocket:

```typescript
export const APP_CONFIG = {
  WEBSOCKET_URL: 'ws://192.168.1.8:8080/ws',
  // Alternativa: 'ws://172.26.1.81:8080/ws'
  // ... otras configuraciones
};
```

### Colores del Tema

Los colores se pueden personalizar en `src/constants/theme.ts`:

```typescript
export const COLORS = {
  primary: '#003D82', // Azul corporativo
  secondary: '#00A651', // Verde corporativo
  // ... otros colores
};
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Ejecutar tests con coverage
npm test -- --coverage

# Ejecutar tests en modo watch
npm test -- --watch
```

## 📝 Scripts Disponibles

- `npm start` - Inicia Metro Bundler
- `npm run android` - Ejecuta la app en Android
- `npm run ios` - Ejecuta la app en iOS
- `npm test` - Ejecuta los tests
- `npm run lint` - Ejecuta ESLint
- `npm run type-check` - Verifica tipos TypeScript

## 🔧 Solución de Problemas

### Error: "Command failed: gradlew.bat app:installDebug"

Asegúrate de tener Java JDK 17 instalado y configurado en JAVA_HOME.

### Error: "Unable to resolve module"

Limpia la cache de Metro:

```bash
npm start -- --reset-cache
```

### Error en iOS: "CocoaPods not installed"

Instala CocoaPods:

```bash
sudo gem install cocoapods
cd ios && pod install
```

### Problemas con WebSocket

Verifica que:

1. El servidor WebSocket esté ejecutándose
2. La URL en `config.ts` sea correcta
3. No haya firewalls bloqueando la conexión

## 📱 Próximas Funcionalidades

- [ ] Autenticación biométrica
- [ ] Push notifications
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)
- [ ] Caché offline
- [ ] Exportar transacciones a PDF
- [ ] Compartir comprobantes

## 🤝 Contribución

Para contribuir al proyecto:

1. Crea una rama para tu feature
2. Realiza tus cambios
3. Asegúrate de que los tests pasen
4. Crea un Pull Request

## 📄 Licencia

Este proyecto es propiedad del Banco Santa Cruz.

## 👥 Equipo de Desarrollo

Banco Santa Cruz - Equipo de Desarrollo Móvil

---

**Nota**: Esta es una aplicación en desarrollo. Para producción, asegúrate de configurar correctamente las variables de entorno, certificados de seguridad, y realizar pruebas exhaustivas.
