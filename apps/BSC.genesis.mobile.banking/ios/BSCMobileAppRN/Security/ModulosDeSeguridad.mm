/**
 * Los módulos de seguridad de iOS, expuestos como TurboModules.
 *
 * React Native genera las interfaces a partir de los archivos de `src/specs` en
 * Objective-C++ (`BscSecuritySpec.h`), y Swift no puede adoptarlas
 * directamente. Por eso la lógica vive en Swift (los archivos Swift de `Security`, según
 * ADR-0003) y aquí solo hay un envoltorio por módulo que traduce la llamada.
 * Si la interfaz de TypeScript cambia y esto no, **no compila**: es lo que se
 * quiere en la ruta por la que se firma el dinero.
 *
 * El nombre de cada clase se registra en `codegenConfig.ios.modulesProvider`
 * de `package.json`.
 */
#import <BscSecuritySpec/BscSecuritySpec.h>
#import <React/RCTBridgeModule.h>
// El encabezado generado de Swift también declara `ReactNativeDelegate` de
// AppDelegate.swift, así que necesita ver su superclase antes.
#import <React_RCTAppDelegate/RCTDefaultReactNativeFactoryDelegate.h>

#import "BSCMobileAppRN-Swift.h"

typedef void (^BscRechazoObjC)(NSString *, NSString *_Nullable);

/**
 * El resolver de React Native, con `nil` convertido en `null`.
 *
 * El puente de iOS entrega `nil` a JavaScript como `undefined`, y el de
 * Android entrega `null`. La capa de TypeScript compara con `null`
 * («`nombreRecordado !== null`», «`token !== null`»): con `undefined`, un
 * valor que no existe pasaría por uno guardado. `NSNull` llega como `null` y
 * deja las dos plataformas iguales.
 */
static RCTPromiseResolveBlock resolverDe(RCTPromiseResolveBlock resolve)
{
  return ^(id _Nullable resultado) {
    resolve(resultado ?: [NSNull null]);
  };
}

/** El rechazo de React Native, en la forma que reciben los módulos de Swift. */
static BscRechazoObjC rechazoDe(RCTPromiseRejectBlock reject)
{
  return ^(NSString *codigo, NSString *_Nullable mensaje) {
    reject(codigo, mensaje, nil);
  };
}

// ─── BiometricAuth ─────────────────────────────────────────────────────────

@interface BscBiometricAuthModule : NSObject <NativeBiometricSpec>
@end

@implementation BscBiometricAuthModule

+ (NSString *)moduleName { return @"BiometricAuth"; }
+ (BOOL)requiresMainQueueSetup { return NO; }

- (void)isAvailable:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BscBiometricAuth isAvailable:resolverDe(resolve) rechazar:rechazoDe(reject)];
}

- (void)hasFaceUnlock:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BscBiometricAuth hasFaceUnlock:resolverDe(resolve) rechazar:rechazoDe(reject)];
}

- (void)authenticate:(NSString *)reason
               title:(NSString *)title
         cancelLabel:(NSString *)cancelLabel
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject
{
  [BscBiometricAuth authenticate:reason
                          titulo:title
                        cancelar:cancelLabel
                        resolver:resolverDe(resolve)
                        rechazar:rechazoDe(reject)];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeBiometricSpecJSI>(params);
}

@end

// ─── DeviceKey ─────────────────────────────────────────────────────────────

@interface BscDeviceKeyModule : NSObject <NativeDeviceKeySpec>
@end

@implementation BscDeviceKeyModule

+ (NSString *)moduleName { return @"DeviceKey"; }
+ (BOOL)requiresMainQueueSetup { return NO; }

- (void)isSupported:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BscDeviceKey isSupported:resolverDe(resolve) rechazar:rechazoDe(reject)];
}

- (void)hasKey:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BscDeviceKey hasKey:resolverDe(resolve) rechazar:rechazoDe(reject)];
}

- (void)createKey:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BscDeviceKey createKey:resolverDe(resolve) rechazar:rechazoDe(reject)];
}

- (void)getPublicKey:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BscDeviceKey getPublicKey:resolverDe(resolve) rechazar:rechazoDe(reject)];
}

- (void)sign:(NSString *)payloadBase64 resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BscDeviceKey sign:payloadBase64 resolver:resolverDe(resolve) rechazar:rechazoDe(reject)];
}

- (void)deleteKey:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BscDeviceKey deleteKey:resolverDe(resolve) rechazar:rechazoDe(reject)];
}

- (void)describeKey:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BscDeviceKey describeKey:resolverDe(resolve) rechazar:rechazoDe(reject)];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeDeviceKeySpecJSI>(params);
}

@end

// ─── SecureStorage ─────────────────────────────────────────────────────────

@interface BscSecureStorageModule : NSObject <NativeSecureStorageSpec>
@end

@implementation BscSecureStorageModule

+ (NSString *)moduleName { return @"SecureStorage"; }
+ (BOOL)requiresMainQueueSetup { return NO; }

- (void)getItem:(NSString *)key resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BscSecureStorage getItem:key resolver:resolverDe(resolve) rechazar:rechazoDe(reject)];
}

- (void)setItem:(NSString *)key
          value:(NSString *)value
        resolve:(RCTPromiseResolveBlock)resolve
         reject:(RCTPromiseRejectBlock)reject
{
  [BscSecureStorage setItem:key valor:value ?: @"" resolver:resolverDe(resolve) rechazar:rechazoDe(reject)];
}

- (void)removeItem:(NSString *)key resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BscSecureStorage removeItem:key resolver:resolverDe(resolve) rechazar:rechazoDe(reject)];
}

- (void)removeItems:(NSArray *)keys resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  NSMutableArray<NSString *> *claves = [NSMutableArray arrayWithCapacity:keys.count];
  for (id clave in keys) {
    if ([clave isKindOfClass:[NSString class]]) [claves addObject:clave];
  }
  [BscSecureStorage removeItems:claves resolver:resolverDe(resolve) rechazar:rechazoDe(reject)];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeSecureStorageSpecJSI>(params);
}

@end

// ─── SecureScreen ──────────────────────────────────────────────────────────

@interface BscSecureScreenModule : NSObject <NativeSecureScreenSpec>
@end

@implementation BscSecureScreenModule

+ (NSString *)moduleName { return @"SecureScreen"; }
+ (BOOL)requiresMainQueueSetup { return NO; }

- (void)setSecure:(BOOL)secure resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BscSecureScreen setSecure:secure resolver:resolverDe(resolve) rechazar:rechazoDe(reject)];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeSecureScreenSpecJSI>(params);
}

@end

// ─── DeviceIntegrity ───────────────────────────────────────────────────────

@interface BscDeviceIntegrityModule : NSObject <NativeDeviceIntegritySpec>
@end

@implementation BscDeviceIntegrityModule

+ (NSString *)moduleName { return @"DeviceIntegrity"; }
+ (BOOL)requiresMainQueueSetup { return NO; }

- (facebook::react::ModuleConstants<JS::NativeDeviceIntegrity::Constants>)constantsToExport
{
  return [self getConstants];
}

- (facebook::react::ModuleConstants<JS::NativeDeviceIntegrity::Constants>)getConstants
{
  return facebook::react::typedConstants<JS::NativeDeviceIntegrity::Constants>({
    .baseUrl = [BscDeviceIntegrity baseUrl],
  });
}

- (void)isDeviceCompromised:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BscDeviceIntegrity isDeviceCompromised:resolverDe(resolve) rechazar:rechazoDe(reject)];
}

- (void)isDebuggerAttached:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BscDeviceIntegrity isDebuggerAttached:resolverDe(resolve) rechazar:rechazoDe(reject)];
}

- (void)getPackageName:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BscDeviceIntegrity getPackageName:resolverDe(resolve) rechazar:rechazoDe(reject)];
}

- (void)getAppVersion:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BscDeviceIntegrity getAppVersion:resolverDe(resolve) rechazar:rechazoDe(reject)];
}

- (void)getAppBuild:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject
{
  [BscDeviceIntegrity getAppBuild:resolverDe(resolve) rechazar:rechazoDe(reject)];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeDeviceIntegritySpecJSI>(params);
}

@end

// ─── StatementFile ─────────────────────────────────────────────────────────

@interface BscStatementFileModule : NSObject <NativeStatementFileSpec>
@end

@implementation BscStatementFileModule

+ (NSString *)moduleName { return @"StatementFile"; }
+ (BOOL)requiresMainQueueSetup { return NO; }

- (void)guardarYCompartir:(NSString *)pdfEnBase64
          nombreDeArchivo:(NSString *)nombreDeArchivo
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject
{
  [BscStatementFile guardarYCompartir:pdfEnBase64
                      nombreDeArchivo:nombreDeArchivo
                             resolver:resolverDe(resolve)
                             rechazar:rechazoDe(reject)];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeStatementFileSpecJSI>(params);
}

@end
