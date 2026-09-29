# Configuracion de PC de Desarrollo y Dependencias

Esta guia te deja el equipo listo para ejecutar App Conversacional BSC en Windows con Android.

## 1. Requisitos minimos

- Windows 10/11 (64-bit)
- Node.js 18 o superior
- Git
- Java JDK 17
- Android Studio (con SDK de Android)
- Un emulador Android o un dispositivo fisico con depuracion USB

## 2. Instalar herramientas

### 2.1 Node.js

1. Instala Node.js LTS desde https://nodejs.org/
2. Verifica:

```powershell
node -v
npm -v
```

### 2.2 Git

1. Instala Git desde https://git-scm.com/
2. Verifica:

```powershell
git --version
```

### 2.3 Java JDK 17

1. Instala JDK 17 (Temurin u Oracle).
2. Verifica:

```powershell
java -version
javac -version
```

### 2.4 Android Studio + SDK

1. Instala Android Studio.
2. En SDK Manager instala como minimo:
- Android SDK Platform 34
- Android SDK Build-Tools (ultima estable)
- Android SDK Platform-Tools
- Android Emulator
3. Crea y prueba un emulador (AVD) desde Device Manager.

## 3. Variables de entorno (Windows)

Configura estas variables en Variables de Entorno del sistema/usuario:

- ANDROID_HOME = C:\Users\TU_USUARIO\AppData\Local\Android\Sdk
- JAVA_HOME = C:\Program Files\Java\jdk-17

Agrega al Path:

- %ANDROID_HOME%\platform-tools
- %ANDROID_HOME%\emulator
- %JAVA_HOME%\bin

Cierra y abre terminal nueva, luego verifica:

```powershell
adb version
java -version
```

## 4. Clonar y preparar proyecto

Desde PowerShell:

```powershell
git clone https://github.com/JeisonVisbalBSC/AppConversacional-FrontEnd.git
cd AppConversacional-FrontEnd
npm install
```

## 5. Configuracion de entorno de la app

Crea archivo .env a partir de .env.example:

```powershell
Copy-Item .env.example .env
```

Valores sugeridos para WebSocket en desarrollo:

- Red local: ws://192.168.1.8:8080/ws
- WSL/red virtual: ws://172.26.1.81:8080/ws

Nota: el proyecto actualmente usa la URL WebSocket principal en la configuracion interna de la app, pero mantener .env actualizado ayuda a documentar el entorno y evita errores de equipo.

## 6. Ejecutar la app

1. Inicia Metro:

```powershell
npm start
```

2. En otra terminal, ejecuta Android:

```powershell
npm run android
```

## 7. Si usas dispositivo fisico (opcional)

1. Activa Opciones de desarrollador y Depuracion USB.
2. Conecta el telefono y autoriza el equipo.
3. Verifica conexion:

```powershell
adb devices
```

4. Asegura tunel con Metro:

```powershell
adb reverse tcp:8081 tcp:8081
```

## 8. Comandos utiles de calidad

```powershell
npm run lint
npm run type-check
npm test
```

## 9. Solucion de problemas comunes

### 9.1 Gradle o instalacion Android falla

```powershell
cd android
.\gradlew clean
cd ..
npm run android
```

### 9.2 Error de cache de Metro

```powershell
npm start -- --reset-cache
```

### 9.3 App no conecta a WebSocket

- Confirma que el backend este arriba en puerto 8080.
- Verifica que PC y dispositivo esten en la misma red (si aplica).
- Si es emulador Android, revisa reglas de red y firewall.

## 10. Credenciales de demo y sesion

- El clientId se maneja como variable global de sesion (no lo escribe el usuario).
- La clave de demo de login es 1234 para la POC actual.

## 11. Checklist rapido

- Node y npm instalados
- JDK 17 instalado
- Android Studio + SDK listos
- Variables ANDROID_HOME/JAVA_HOME y Path correctos
- npm install ejecutado
- Metro corriendo
- npm run android exitoso
