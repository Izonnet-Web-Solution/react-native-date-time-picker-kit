#if __has_include(<DateTimePickerKitSpec/DateTimePickerKitSpec.h>)
#import <DateTimePickerKitSpec/DateTimePickerKitSpec.h>
#elif __has_include(<ReactCodegen/DateTimePickerKitSpec/DateTimePickerKitSpec.h>)
#import <ReactCodegen/DateTimePickerKitSpec/DateTimePickerKitSpec.h>
#else
#import "DateTimePickerKitSpec.h"
#endif

@interface DateTimePickerKit : NSObject <NativeDateTimePickerKitSpec>

@end
