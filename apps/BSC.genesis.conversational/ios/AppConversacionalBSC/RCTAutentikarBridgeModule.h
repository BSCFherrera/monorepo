//
//  RCTAutentikarBridgeModule.h
//  AppConversacionalBSC
//
//  Puente nativo hacia el SDK de Autentikar (cédula dominicana + rostro). Puerto a iOS del
//  módulo Android RNAutentikarBridgeModule.kt: mismo nombre de módulo ("AutentikarBridge") y
//  mismo método `authenticate({link})`, para que el lado JS (AutentikarService) no necesite
//  distinguir plataforma.
//

#ifndef RCTAutentikarBridgeModule_h
#define RCTAutentikarBridgeModule_h

#import <React/RCTBridgeModule.h>
#import <UIKit/UIKit.h>


@protocol AutentikarBridgeProtocol <NSObject>
-(void) onResult:(BOOL)result;
@end

@class AutentikarBridgeViewController;
@interface AutentikarBridgeViewController : UIViewController
@property (nonatomic, strong) id<AutentikarBridgeProtocol> delegate;
- (instancetype)initWithDictionary:(NSDictionary *)dictionary;

@end

@interface RCTAutentikarBridgeModule : NSObject <RCTBridgeModule>
@end

#endif /* RCTAutentikarBridgeModule_h */
