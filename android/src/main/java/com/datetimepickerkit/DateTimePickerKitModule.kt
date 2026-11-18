package com.datetimepickerkit

import com.facebook.react.bridge.ReactApplicationContext

class DateTimePickerKitModule(reactContext: ReactApplicationContext) :
  NativeDateTimePickerKitSpec(reactContext) {

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  companion object {
    const val NAME = NativeDateTimePickerKitSpec.NAME
  }
}
