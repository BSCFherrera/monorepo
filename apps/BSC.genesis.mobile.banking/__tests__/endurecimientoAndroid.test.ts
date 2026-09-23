import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * El endurecimiento de la aplicación Android, fijado por prueba.
 *
 * Estas decisiones viven en XML y en Gradle, donde nadie las mira y nada las
 * comprueba: se pierden en un merge, al actualizar una plantilla de React
 * Native o al copiar un archivo de otro proyecto, y **el síntoma aparece en
 * producción o en una auditoría, no en el desarrollo**. Una aplicación que
 * permite copia de seguridad o que habla en claro funciona exactamente igual de
 * bien en el día a día.
 *
 * Por eso se prueban aquí, con la misma severidad que la huella de operación:
 * son propiedades que solo se notan cuando ya es tarde.
 */

const raizAndroid = join(__dirname, '..', 'android');

const leer = (ruta: string): string =>
  readFileSync(join(raizAndroid, ruta), 'utf8');

describe('AndroidManifest', () => {
  const manifiesto = leer('app/src/main/AndroidManifest.xml');

  it('prohíbe la copia de seguridad (T-12)', () => {
    // Con la copia activa, los tokens y el estado de enrolamiento salen del
    // teléfono hacia la nube del fabricante.
    expect(manifiesto).toContain('android:allowBackup="false"');
    expect(manifiesto).toContain('android:fullBackupContent="false"');
  });

  it('declara las reglas de extracción de Android 12 (T-12)', () => {
    /*
      `allowBackup="false"` no cubre la transferencia directa entre
      dispositivos, que es la vía por la que el `deviceInstallId` y la marca de
      enrolamiento llegarían a un teléfono nuevo **sin la llave**, que se queda
      en el Keystore del viejo. El cliente quedaría encerrado: la app creería
      poder firmar y el servidor rechazaría cada intento.
    */
    expect(manifiesto).toContain(
      'android:dataExtractionRules="@xml/reglas_de_extraccion"',
    );
  });

  it('declara la política de red (T-06)', () => {
    expect(manifiesto).toContain(
      'android:networkSecurityConfig="@xml/configuracion_de_red"',
    );
  });

  it('no declara ningún intent-filter de navegación (T-09)', () => {
    /*
      Sin una especificación de validación de enlaces, un `intent-filter` de
      `VIEW` convierte cualquier enlace de un mensaje en una entrada a la banca.
      El original tampoco declara ninguno.
    */
    expect(manifiesto).not.toContain('android.intent.action.VIEW');
  });

  it('el proveedor de archivos no está exportado', () => {
    // Es por donde sale el PDF del estado de cuenta. Exportado, cualquier
    // aplicación del teléfono podría leer los estados de cuenta del cliente.
    expect(manifiesto).toContain('android:exported="false"');
    expect(manifiesto).toContain('android:grantUriPermissions="true"');
  });
});

describe('configuración de red', () => {
  const release = leer('app/src/main/res/xml/configuracion_de_red.xml');
  const depuracion = leer('app/src/debug/res/xml/configuracion_de_red.xml');

  const sinComentarios = (xml: string): string =>
    xml.replace(/<!--[\s\S]*?-->/gu, '');

  it('la de release no permite tráfico en claro contra nadie', () => {
    const limpio = sinComentarios(release);

    expect(limpio).toContain('<base-config cleartextTrafficPermitted="false">');
    // Ni una sola excepción: en release no hay dominio que hable en claro.
    expect(limpio).not.toContain('cleartextTrafficPermitted="true"');
    expect(limpio).not.toContain('<domain-config');
  });

  it('la de release no confía en certificados instalados por el usuario', () => {
    // Confiar en ellos permitiría a quien tenga el teléfono leer la sesión del
    // cliente instalando su propia autoridad.
    expect(sinComentarios(release)).not.toContain('src="user"');
  });

  it('la excepción del bucle local vive solo en la compilación de depuración', () => {
    /*
      Separarlo por tipo de compilación, en vez de meterlo en
      `debug-overrides`, hace que la excepción **no pueda** entrar en release:
      el archivo sencillamente no se compila. Es una garantía del sistema de
      construcción, no una convención que alguien tenga que recordar.
    */
    const limpio = sinComentarios(depuracion);

    expect(limpio).toContain(
      '<domain-config cleartextTrafficPermitted="true">',
    );
    expect(limpio).toContain('localhost');
    expect(sinComentarios(release)).not.toContain('localhost');
  });

  it('no anida domain-config dentro de debug-overrides', () => {
    /*
      Regresión de un defecto que **tumbaba la aplicación al arrancar**.

      Android rechaza esa anidación con «Nested domain-config not allowed in
      debug-overrides» y falla al instanciar `MainApplication`: pantalla de
      «la aplicación se ha detenido», sin llegar a dibujar nada. Gradle compila
      el XML sin una queja, así que ni la compilación ni la versión anterior de
      esta prueba —que solo miraba si el texto estaba presente— lo detectaron.
      Solo apareció al abrir la app en el teléfono.
    */
    for (const xml of [release, depuracion]) {
      // Los comentarios se quitan **antes** de localizar el bloque: el propio
      // comentario que explica este defecto nombra las dos etiquetas, y
      // buscándolas sobre el texto crudo la prueba se encuentra a sí misma.
      const limpio = sinComentarios(xml);
      const desde = limpio.indexOf('<debug-overrides>');
      if (desde === -1) continue;

      const bloque = limpio.slice(desde, limpio.indexOf('</debug-overrides>'));
      expect(bloque).not.toContain('<domain-config');
    }
  });

  it('ninguna de las dos declara una dirección del rango privado', () => {
    /*
      La app Flutter traía una dirección interna del banco escrita en el código
      (T-10). Una de ese rango aquí sería la misma fuga, con el agravante de
      que además la habilitaría en claro.

      Se miran **las directivas, no los comentarios**: la documentación tiene
      que poder citar el defecto que evita sin que la prueba la confunda con el
      defecto mismo. Lo descubrió esta misma prueba, fallando contra su propio
      comentario explicativo.
    */
    for (const xml of [release, depuracion]) {
      expect(sinComentarios(xml)).not.toMatch(
        /(?:10|172|192)\.\d{1,3}\.\d{1,3}\.\d{1,3}/u,
      );
    }
  });
});

describe('reglas de extracción', () => {
  const reglas = leer('app/src/main/res/xml/reglas_de_extraccion.xml');

  it('no deja salir nada, ni a la nube ni a otro teléfono', () => {
    for (const bloque of ['<cloud-backup>', '<device-transfer>'] as const) {
      const desde = reglas.indexOf(bloque);
      expect(desde).toBeGreaterThan(-1);

      const hasta = reglas.indexOf('</', desde);
      const contenido = reglas.slice(desde, hasta);

      // Ni una sola inclusión: lo que se transfiere es nada.
      expect(contenido).not.toContain('<include');
      expect(contenido).toContain('<exclude domain="sharedpref" />');
      expect(contenido).toContain('<exclude domain="database" />');
    }
  });
});

describe('reglas de R8', () => {
  const reglas = leer('app/proguard-rules.pro');

  it('conserva los módulos nativos propios', () => {
    /*
      Se resuelven por nombre desde JavaScript, así que R8 no ve quién los usa
      y los borraría. Son la llave de firma, el almacenamiento cifrado, la
      biometría, el bloqueo de capturas, la integridad y el PDF: la aplicación
      dejaría de arrancar **solo en release**.
    */
    expect(reglas).toContain('-keep class com.bsc.mobile.security.** { *; }');
  });

  it('conserva lo que React Native resuelve por reflexión', () => {
    expect(reglas).toContain('@com.facebook.react.bridge.ReactMethod');
    expect(reglas).toContain('com.facebook.proguard.annotations.DoNotStrip');
  });

  it('conserva las líneas de las trazas', () => {
    // Sin esto, una excepción en producción es ilegible y no se puede
    // diagnosticar nada.
    expect(reglas).toContain('-keepattributes SourceFile,LineNumberTable');
  });
});

describe('quitar los registros del paquete', () => {
  const babel = readFileSync(join(__dirname, '..', 'babel.config.js'), 'utf8');

  it('el plugin propio se aplica solo en producción', () => {
    /*
      En desarrollo y en las pruebas `console` es la herramienta de trabajo.
      Quitarlo allí también haría el proyecto incómodo sin ganar nada: lo que
      se protege es el paquete que llega al teléfono del cliente.
    */
    expect(babel).toContain('./scripts/babel-quitar-console.js');
    expect(babel).toContain('production');
  });
});

describe('build.gradle', () => {
  const gradle = leer('app/build.gradle');

  it('la versión sale de package.json y no está escrita a mano', () => {
    /*
      Estuvieron desalineadas —la app decía «0.1.0» y el manifiesto «1.0»—, así
      que la aplicación se contradecía a sí misma y soporte no podía saber qué
      compilación tenía delante al recibir un reporte.
    */
    expect(gradle).toContain('versionName versionDeLaApp');
    expect(gradle).toContain('versionCode codigoDeVersion(versionDeLaApp)');
    expect(gradle).not.toMatch(/versionName\s+"[\d.]+"/u);
  });

  it('R8 está encendido en release (T-07)', () => {
    /*
      Reduce y ofusca el código Java/Kotlin, que es lo que encarece leer el APK
      con un descompilador. La plantilla de React Native lo trae apagado, así
      que es un cambio que se pierde con facilidad al regenerar el proyecto.
    */
    expect(gradle).toContain('def enableProguardInReleaseBuilds = true');
    expect(gradle).toContain('minifyEnabled enableProguardInReleaseBuilds');
  });

  it('Hermes está activo', () => {
    // Compila el JavaScript a bytecode, que es lo que protege el paquete de la
    // aplicación; R8 no lo toca.
    const propiedades = leer('gradle.properties');
    expect(propiedades).toContain('hermesEnabled=true');
  });

  it('solo se compila arm64 en desarrollo, pero no se fija para release', () => {
    // Compilar las cuatro arquitecturas agota la memoria de la laptop; el
    // paquete de la tienda sí tiene que llevarlas todas, así que la
    // restricción no puede estar escrita en el archivo.
    expect(gradle).not.toContain('abiFilters "arm64-v8a"');
  });
});

/**
 * El icono adaptativo (D-25).
 *
 * Es el caso exacto que esta suite existe para cubrir: **lo que se pierde al
 * actualizar la plantilla de React Native**. La plantilla trae sus propios
 * `ic_launcher.png` por densidad y no trae `mipmap-anydpi-v26`, así que una
 * actualización descuidada devuelve el icono a la plantilla sin romper nada —
 * la aplicación compila, arranca y funciona, y el único síntoma es que el
 * icono del banco desapareció de la pantalla de inicio.
 *
 * Las tres capas y los PNG por densidad los escribe `scripts/generar-iconos.mjs`
 * a partir del logotipo de marca, así que lo que se fija aquí no es el dibujo
 * —que solo se juzga en un teléfono— sino que sigan estando y que no hayan
 * vuelto a ser los de la plantilla. Ver `docs/migration/18-icono-de-la-aplicacion.md`.
 */
describe('icono de la aplicación', () => {
  const icono = leer('app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml');

  it('es un icono adaptativo, con sus dos capas', () => {
    expect(icono).toContain('<adaptive-icon');
    expect(icono).toContain('@color/ic_launcher_background');
    expect(icono).toContain('@drawable/ic_launcher_foreground');
  });

  it('declara la variante monocroma que pide Android 13', () => {
    // Sin ella el icono se queda fuera de los iconos temáticos del sistema y
    // se ve como el único ajeno del cajón de aplicaciones.
    expect(icono).toContain('<monochrome');
    expect(icono).toContain('@drawable/ic_launcher_monochrome');
  });

  it('también cubre el lanzador que pide el icono redondo', () => {
    const redondo = leer(
      'app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml',
    );

    expect(redondo).toContain('<adaptive-icon');
    expect(redondo).toContain('<monochrome');
  });

  it('el color de fondo es un recurso propio, no un literal en el icono', () => {
    // Así el banco puede cambiarlo sin editar la composición de las capas.
    const colores = leer('app/src/main/res/values/ic_launcher_background.xml');

    expect(colores).toContain('name="ic_launcher_background"');
    expect(icono).not.toMatch(/android:drawable="#/);
  });

  it('las dos capas dibujan dentro de la zona segura de 72 dp', () => {
    // De los 108 dp de cada capa, solo los 72 centrales están garantizados:
    // el resto es zona de recorte y de parallax. El desplazamiento de 18
    // coloca el origen del dibujo justo donde empieza esa zona.
    for (const capa of ['ic_launcher_foreground', 'ic_launcher_monochrome']) {
      const vector = leer(`app/src/main/res/drawable/${capa}.xml`);

      expect(vector).toContain('android:viewportWidth="108"');
      expect(vector).toContain('android:viewportHeight="108"');
      expect(vector).toContain('android:translateX="18"');
      expect(vector).toContain('android:translateY="18"');
    }
  });

  it('la capa de frente es el isotipo del banco y no el marcador de posición', () => {
    const frente = leer('app/src/main/res/drawable/ic_launcher_foreground.xml');

    // Los dos colores del símbolo, tal como vienen en el archivo de marca. Si
    // alguien devolviera el marcador de posición —las iniciales dibujadas a
    // mano— o el icono de la plantilla, ninguno de los dos estaría.
    expect(frente).toContain('android:fillColor="#FF0961AD"');
    expect(frente).toContain('android:fillColor="#FF00A44F"');
  });

  it('el símbolo cabe holgado dentro de la máscara del lanzador', () => {
    /*
      **El defecto que esta prueba existe para evitar ya ocurrió**, el
      2026-09-18: el símbolo se dibujó a 65 dp y en la pantalla de inicio se
      veía desproporcionado al lado de los demás iconos. No llegaba a
      recortarse —la máscara mide 72 dp— pero la llenaba de borde a borde.

      Lo que se mide es el **círculo que envuelve al dibujo**, y no su caja,
      porque la máscara del lanzador es redonda: un símbolo puede caber en el
      cuadro de 72 dp y aun así asomar por las esquinas del círculo.

      El tope es la **línea maestra circular de Material, 66 dp**. Es un tope, no
      un objetivo: hoy el símbolo mide 52, que es donde se ven los iconos de
      marca del sector. La prueba deja margen a propósito para que un retoque de
      diseño no la rompa; lo que no permite es volver a llenar la máscara.

      Los números que se leen son los de `pathData`, que incluyen los puntos de
      control de las curvas. Esos puntos quedan **por fuera** de la curva que
      gobiernan, así que la medida es una cota superior: puede sobrestimar el
      radio, nunca subestimarlo, y por tanto no deja pasar un icono grande.
    */
    const frente = leer('app/src/main/res/drawable/ic_launcher_foreground.xml');
    const coordenadas = [...frente.matchAll(/pathData="([^"]*)"/g)]
      .flatMap(encontrado => encontrado[1].match(/-?\d+(?:\.\d+)?/g) ?? [])
      .map(Number);

    expect(coordenadas.length).toBeGreaterThan(100);

    // El centro de la zona segura, en las coordenadas del grupo desplazado 18.
    const CENTRO = 36;
    let radio = 0;
    for (let i = 0; i < coordenadas.length; i += 2) {
      radio = Math.max(
        radio,
        Math.hypot(
          (coordenadas[i] ?? CENTRO) - CENTRO,
          (coordenadas[i + 1] ?? CENTRO) - CENTRO,
        ),
      );
    }

    expect(radio * 2).toBeLessThanOrEqual(66);
  });

  it('el icono de Android 7 ya no es el de la plantilla de React Native', () => {
    /*
      Los `ic_launcher.png` por densidad son los únicos que ven los teléfonos
      anteriores a Android 8, que la aplicación todavía admite (minSdk 24). La
      plantilla de React Native trae los suyos, y son exactamente los mismos
      bytes en las cinco densidades porque se copian del proyecto de ejemplo; el
      del banco se genera por densidad, así que el de mdpi y el de xxxhdpi no
      pueden pesar lo mismo. Comparar los tamaños detecta la vuelta atrás sin
      tener que guardar una imagen de referencia en el repositorio.
    */
    const pesar = (densidad: string): number =>
      statSync(
        join(raizAndroid, `app/src/main/res/mipmap-${densidad}/ic_launcher.png`),
      ).size;

    expect(pesar('xxxhdpi')).toBeGreaterThan(pesar('mdpi'));
  });
});

/**
 * La pantalla de arranque nativa.
 *
 * Entre el toque en el icono y el primer render de React Native, Android ya ha
 * abierto la ventana y todavía no hay nada que pintar. Lo que se ve en ese
 * hueco es el `windowBackground` del tema: por defecto, un rectángulo blanco
 * que se lee como una aplicación colgada.
 *
 * Se prueba aquí porque son tres archivos que tienen que estar de acuerdo —el
 * manifiesto, los estilos y `MainActivity`— y porque el síntoma de que uno se
 * desalinee **solo aparece en un arranque en frío**: ni en el emulador con la
 * app ya cargada, ni al recargar desde Metro.
 */
describe('pantalla de arranque', () => {
  it('la actividad se lanza con el tema de arranque', () => {
    const manifiesto = leer('app/src/main/AndroidManifest.xml');

    expect(manifiesto).toContain('android:theme="@style/AppTheme.Arranque"');
  });

  it('el tema de arranque pinta el fondo de marca', () => {
    const estilos = leer('app/src/main/res/values/styles.xml');

    expect(estilos).toContain('name="AppTheme.Arranque"');
    expect(estilos).toContain(
      '<item name="android:windowBackground">@drawable/fondo_de_arranque</item>',
    );
  });

  it('la actividad vuelve a su tema normal al crearse', () => {
    /*
      Sin esto el dibujo del arranque se queda detrás de toda la aplicación: no
      se ve, porque las pantallas lo tapan, pero Android lo redibuja en cada
      cambio de tamaño y asoma por cualquier superficie transparente.
    */
    const actividad = leer('app/src/main/java/com/bsc/mobile/MainActivity.kt');

    expect(actividad).toContain('setTheme(R.style.AppTheme)');
    expect(actividad.indexOf('setTheme(R.style.AppTheme)')).toBeLessThan(
      actividad.indexOf('super.onCreate(null)'),
    );
  });

  it('el logotipo nativo y el de la aplicación miden lo mismo', () => {
    /*
      El arranque se dibuja dos veces: primero el `windowBackground` de Android
      y después `PantallaDeArranque`, ya con React Native. Son dos archivos
      distintos por fuerza —uno se pinta antes de que exista JavaScript— y el
      único punto donde se pueden desajustar es el tamaño del logotipo. Si se
      desajustan, el logotipo da un salto al entregarse el relevo, que es
      justamente el defecto que la pantalla existe para evitar.
    */
    const fondo = leer('app/src/main/res/drawable/fondo_de_arranque.xml');
    const pantalla = readFileSync(
      join(__dirname, '..', 'src/app/PantallaDeArranque.tsx'),
      'utf8',
    );

    const nativo = /android:height="(\d+)dp"/.exec(fondo)?.[1];
    const enLaApp = /ALTO_DEL_LOGOTIPO = (\d+)/.exec(pantalla)?.[1];

    expect(nativo).toBeDefined();
    expect(enLaApp).toBe(nativo);
  });
});

/**
 * El nombre de la aplicación (D-29).
 *
 * Hay **dos** y se parecen lo bastante como para que alguien los confunda al
 * renombrar: el que el cliente lee debajo del icono y el que React Native usa
 * para encontrar el componente raíz. Cambiar el primero es texto; cambiar el
 * segundo deja la aplicación con una pantalla roja al arrancar, y el error
 * —«Application BSCMobileAppRN has not been registered»— no menciona el archivo
 * donde está la causa.
 */
describe('nombre de la aplicación', () => {
  it('debajo del icono se lee la marca, no el nombre del proyecto', () => {
    const textos = leer('app/src/main/res/values/strings.xml');

    expect(textos).toContain('<string name="app_name">Banco Santa Cruz</string>');
  });

  it('el nombre con el que React Native registra la app no cambió', () => {
    const configuracion = JSON.parse(
      readFileSync(join(__dirname, '..', 'app.json'), 'utf8'),
    ) as { name: string };
    const actividad = leer('app/src/main/java/com/bsc/mobile/MainActivity.kt');

    // Los dos tienen que decir lo mismo: es el identificador con el que
    // `AppRegistry.registerComponent` publica la raíz en `index.js`.
    expect(actividad).toContain(
      `override fun getMainComponentName(): String = "${configuracion.name}"`,
    );
  });
});
