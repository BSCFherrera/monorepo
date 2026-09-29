# App Conversacional BSC - Guía Rápida

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Ejecutar la Aplicación

#### Opción A: Android (Recomendado para Windows)

```bash
# Terminal 1 - Iniciar Metro
npm start

# Terminal 2 - Ejecutar en Android
npm run android
```

#### Opción B: iOS (solo macOS)

```bash
# Instalar pods
cd ios && pod install && cd ..

# Terminal 1 - Iniciar Metro
npm start

# Terminal 2 - Ejecutar en iOS
npm run ios
```

## 📱 Características Principales

### Chat con IA

- Asistente virtual para consultas bancarias
- Comunicación en tiempo real vía WebSocket
- Historial de conversación

### Transacciones

- Visualización de movimientos
- Filtros y búsqueda
- Detalles de cada transacción

### Productos

- Cuentas de ahorro
- Tarjetas de crédito
- Préstamos
- Solicitud de nuevos productos

### Perfil

- Información personal
- Configuración de cuenta
- Opciones de seguridad

## 🎨 Pantallas Disponibles

1. **Chat** - Conversación con el asistente IA
2. **Transacciones** - Historial y detalles
3. **Productos** - Productos bancarios activos
4. **Perfil** - Información del usuario

## ⚙️ Configuración

### WebSocket

Editar `src/constants/config.ts`:

```typescript
WEBSOCKET_URL: 'ws://tu-servidor:8080';
```

### Colores Corporativos

Editar `src/constants/theme.ts` para personalizar colores

## 🔧 Scripts Útiles

```bash
npm start          # Iniciar Metro Bundler
npm run android    # Ejecutar en Android
npm run ios        # Ejecutar en iOS
npm test           # Ejecutar tests
npm run lint       # Linter
npm run type-check # Verificar TypeScript
```

## 📦 Estructura del Código

```
src/
├── components/    # Componentes reutilizables
├── screens/       # Pantallas de la app
├── navigation/    # Configuración de navegación
├── services/      # WebSocket y APIs
├── hooks/         # Custom React hooks
├── utils/         # Funciones helper
├── types/         # Tipos TypeScript
├── constants/     # Constantes y config
└── styles/        # Estilos globales
```

## 🐛 Solución Rápida de Problemas

### Limpiar Caché

```bash
npm start -- --reset-cache
```

### Reconstruir Android

```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Puerto Metro Ocupado

```bash
npx react-native start --port 8082
```

## 📝 Notas Importantes

- **Node >= 18** requerido
- **JDK 17** para Android
- **Xcode 14+** para iOS (macOS)
- WebSocket debe estar configurado correctamente

## 🔗 Enlaces Útiles

- [Documentación React Native](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript](https://www.typescriptlang.org/)

---

Desarrollado para **Banco Santa Cruz** 🏦
