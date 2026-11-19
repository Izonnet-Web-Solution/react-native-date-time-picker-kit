#import "DateTimePickerKit.h"

#if __has_include(<DateTimePickerKit/DateTimePickerKit-Swift.h>)
#import <DateTimePickerKit/DateTimePickerKit-Swift.h>
#elif __has_include("DateTimePickerKit-Swift.h")
#import "DateTimePickerKit-Swift.h"
#endif

@implementation DateTimePickerKit

RCT_EXPORT_MODULE(DateTimePickerKit)

- (void)openDatePicker:(NSDictionary *)options
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject
{
  [[DateTimePickerKitImpl shared] openDatePickerWithOptions:options resolve:resolve reject:reject];
}

- (void)openTimePicker:(NSDictionary *)options
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject
{
  [[DateTimePickerKitImpl shared] openTimePickerWithOptions:options resolve:resolve reject:reject];
}

- (void)openDateTimePicker:(NSDictionary *)options
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject
{
  [[DateTimePickerKitImpl shared] openDateTimePickerWithOptions:options resolve:resolve reject:reject];
}

- (void)openCountdownPicker:(NSDictionary *)options
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject
{
  [[DateTimePickerKitImpl shared] openCountdownPickerWithOptions:options resolve:resolve reject:reject];
}

- (void)closePicker:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject
{
  [[DateTimePickerKitImpl shared] closePickerWithResolve:resolve reject:reject];
}

- (void)confirmPicker:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject
{
  [[DateTimePickerKitImpl shared] confirmPickerWithResolve:resolve reject:reject];
}

- (void)cancelPicker:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject
{
  [[DateTimePickerKitImpl shared] cancelPickerWithResolve:resolve reject:reject];
}

- (void)setSelectedDate:(double)timestamp
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject
{
  [[DateTimePickerKitImpl shared] setSelectedDate:timestamp resolve:resolve reject:reject];
}

- (void)getSelectedDate:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject
{
  [[DateTimePickerKitImpl shared] getSelectedDateWithResolve:resolve reject:reject];
}

- (void)resetPicker:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject
{
  [[DateTimePickerKitImpl shared] resetPickerWithResolve:resolve reject:reject];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeDateTimePickerKitSpecJSI>(params);
}

@end
