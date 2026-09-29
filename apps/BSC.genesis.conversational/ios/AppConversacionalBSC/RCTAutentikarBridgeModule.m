//
//  RCTAutentikarBridgeModule.m
//  AppConversacionalBSC
//
//  Verificación de identidad (Autentikar): cédula dominicana + rostro.
//

#import "RCTAutentikarBridgeModule.h"

@interface RCTAutentikarBridgeModule () <AutentikarBridgeProtocol>
@property (nonatomic, copy) RCTPromiseResolveBlock resolveBlock;
@property (nonatomic, copy) RCTPromiseRejectBlock rejectBlock;
@property (nonatomic, strong) UINavigationController* navigationController;
@property (nonatomic, strong) UIViewController* rootController;
@end

@implementation RCTAutentikarBridgeModule

RCT_EXPORT_MODULE(AutentikarBridge);

RCT_EXPORT_METHOD(authenticate:(NSDictionary *)params resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  self.resolveBlock = resolve;
  self.rejectBlock = reject;

  dispatch_async(dispatch_get_main_queue(), ^{

    AutentikarBridgeViewController *ak = [[AutentikarBridgeViewController alloc] initWithDictionary:params];
    self.rootController = [[[[UIApplication sharedApplication] delegate] window] rootViewController];

    ak.delegate = self;

    self.navigationController = [[UINavigationController alloc] initWithRootViewController:ak];

    [[[UIApplication sharedApplication] delegate].window setRootViewController:self.navigationController];
    [[[UIApplication sharedApplication] delegate].window makeKeyAndVisible];

  });

}

- (void)onResult:(BOOL)result {
  self.resolveBlock(@(result));
  self.resolveBlock = nil;
  self.rejectBlock = nil;

  [self.navigationController popViewControllerAnimated:YES];
  [[[[UIApplication sharedApplication] delegate] window] setRootViewController:self.rootController];
}

@end
