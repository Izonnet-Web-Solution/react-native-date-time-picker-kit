package com.datetimepickerkit

import android.app.Dialog
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.bridge.WritableMap

class DateTimePickerKitModule(reactContext: ReactApplicationContext) :
  NativeDateTimePickerKitSpec(reactContext) {

  private var activeDialog: Dialog? = null
  private var activeDatePickerHelper: DatePickerHelper? = null
  private var activeTimePickerHelper: TimePickerHelper? = null
  private var activeDateTimePickerHelper: DateTimePickerHelper? = null
  private var isPickerOpen = false
  private var storedTimestamp: Long = System.currentTimeMillis()

  override fun openDatePicker(options: ReadableMap, promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null || activity.isFinishing || activity.isDestroyed) {
      promise.reject("ACTIVITY_UNAVAILABLE", "Current activity is unavailable.")
      return
    }

    if (isPickerOpen) {
      promise.reject("PICKER_ALREADY_OPEN", "A picker dialog is already open.")
      return
    }

    UiThreadUtil.runOnUiThread {
      try {
        isPickerOpen = true
        val helper = DatePickerHelper(activity, options, promise) {
          isPickerOpen = false
          activeDialog = null
          activeDatePickerHelper = null
        }
        activeDatePickerHelper = helper
        activeDialog = helper.show()
      } catch (e: Exception) {
        isPickerOpen = false
        activeDialog = null
        activeDatePickerHelper = null
        promise.reject("PRESENTATION_FAILED", e.message ?: "Failed to open date picker", e)
      }
    }
  }

  override fun openTimePicker(options: ReadableMap, promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null || activity.isFinishing || activity.isDestroyed) {
      promise.reject("ACTIVITY_UNAVAILABLE", "Current activity is unavailable.")
      return
    }

    if (isPickerOpen) {
      promise.reject("PICKER_ALREADY_OPEN", "A picker dialog is already open.")
      return
    }

    UiThreadUtil.runOnUiThread {
      try {
        isPickerOpen = true
        val helper = TimePickerHelper(activity, options, promise) {
          isPickerOpen = false
          activeDialog = null
          activeTimePickerHelper = null
        }
        activeTimePickerHelper = helper
        activeDialog = helper.show()
      } catch (e: Exception) {
        isPickerOpen = false
        activeDialog = null
        activeTimePickerHelper = null
        promise.reject("PRESENTATION_FAILED", e.message ?: "Failed to open time picker", e)
      }
    }
  }

  override fun openDateTimePicker(options: ReadableMap, promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null || activity.isFinishing || activity.isDestroyed) {
      promise.reject("ACTIVITY_UNAVAILABLE", "Current activity is unavailable.")
      return
    }

    if (isPickerOpen) {
      promise.reject("PICKER_ALREADY_OPEN", "A picker dialog is already open.")
      return
    }

    UiThreadUtil.runOnUiThread {
      try {
        isPickerOpen = true
        val helper = DateTimePickerHelper(activity, options, promise) {
          isPickerOpen = false
          activeDialog = null
          activeDateTimePickerHelper = null
        }
        activeDateTimePickerHelper = helper
        activeDialog = helper.show()
      } catch (e: Exception) {
        isPickerOpen = false
        activeDialog = null
        activeDateTimePickerHelper = null
        promise.reject("PRESENTATION_FAILED", e.message ?: "Failed to open datetime picker", e)
      }
    }
  }

  override fun openCountdownPicker(options: ReadableMap, promise: Promise) {
    // Android SDK does not natively offer a standard countdown timer dialog
    promise.reject(
      "UNSUPPORTED_FEATURE",
      "Countdown picker mode is not natively supported on Android."
    )
  }

  override fun closePicker(promise: Promise) {
    UiThreadUtil.runOnUiThread {
      try {
        if (!isPickerOpen || activeDialog == null) {
          promise.resolve(false)
          return@runOnUiThread
        }

        activeDialog?.dismiss()
        activeDateTimePickerHelper?.dismissCurrentDialog()
        activeDialog = null
        activeDatePickerHelper = null
        activeTimePickerHelper = null
        activeDateTimePickerHelper = null
        isPickerOpen = false
        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject("UNKNOWN_ERROR", e.message ?: "Failed to close picker", e)
      }
    }
  }

  override fun confirmPicker(promise: Promise) {
    UiThreadUtil.runOnUiThread {
      try {
        if (!isPickerOpen) {
          promise.reject("PICKER_NOT_OPEN", "Picker is not currently open.")
          return@runOnUiThread
        }

        val timestamp = when {
          activeDatePickerHelper != null -> activeDatePickerHelper!!.confirmAndDismiss()
          activeTimePickerHelper != null -> activeTimePickerHelper!!.confirmAndDismiss()
          activeDateTimePickerHelper != null -> activeDateTimePickerHelper!!.confirmAndDismiss()
          else -> {
            activeDialog?.dismiss()
            storedTimestamp
          }
        }

        storedTimestamp = timestamp
        activeDialog = null
        activeDatePickerHelper = null
        activeTimePickerHelper = null
        activeDateTimePickerHelper = null
        isPickerOpen = false

        val map: WritableMap = Arguments.createMap()
        map.putString("action", "confirmed")
        map.putDouble("timestamp", timestamp.toDouble())
        promise.resolve(map)
      } catch (e: Exception) {
        promise.reject("UNKNOWN_ERROR", e.message ?: "Failed to confirm picker", e)
      }
    }
  }

  override fun cancelPicker(promise: Promise) {
    UiThreadUtil.runOnUiThread {
      try {
        if (!isPickerOpen) {
          promise.reject("PICKER_NOT_OPEN", "Picker is not currently open.")
          return@runOnUiThread
        }

        when {
          activeDatePickerHelper != null -> activeDatePickerHelper!!.cancelAndDismiss()
          activeTimePickerHelper != null -> activeTimePickerHelper!!.cancelAndDismiss()
          activeDateTimePickerHelper != null -> activeDateTimePickerHelper!!.cancelAndDismiss()
          else -> activeDialog?.cancel()
        }

        activeDialog = null
        activeDatePickerHelper = null
        activeTimePickerHelper = null
        activeDateTimePickerHelper = null
        isPickerOpen = false
        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject("UNKNOWN_ERROR", e.message ?: "Failed to cancel picker", e)
      }
    }
  }

  override fun setSelectedDate(timestamp: Double, promise: Promise) {
    UiThreadUtil.runOnUiThread {
      try {
        val longTimestamp = timestamp.toLong()
        storedTimestamp = longTimestamp

        activeDatePickerHelper?.updateSelectedDate(longTimestamp)
        activeTimePickerHelper?.updateSelectedTime(longTimestamp)
        activeDateTimePickerHelper?.updateSelectedDate(longTimestamp)

        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject("UNKNOWN_ERROR", e.message ?: "Failed to set selected date", e)
      }
    }
  }

  override fun getSelectedDate(promise: Promise) {
    try {
      val timestamp = when {
        activeDatePickerHelper != null -> activeDatePickerHelper!!.getSelectedTimestamp()
        activeTimePickerHelper != null -> activeTimePickerHelper!!.getSelectedTimestamp()
        activeDateTimePickerHelper != null -> activeDateTimePickerHelper!!.getSelectedTimestamp()
        else -> storedTimestamp
      }

      val map: WritableMap = Arguments.createMap()
      map.putString("action", "confirmed")
      map.putDouble("timestamp", timestamp.toDouble())
      promise.resolve(map)
    } catch (e: Exception) {
      promise.reject("UNKNOWN_ERROR", e.message ?: "Failed to get selected date", e)
    }
  }

  override fun resetPicker(promise: Promise) {
    UiThreadUtil.runOnUiThread {
      try {
        storedTimestamp = System.currentTimeMillis()
        activeDatePickerHelper?.updateSelectedDate(storedTimestamp)
        activeTimePickerHelper?.updateSelectedTime(storedTimestamp)
        activeDateTimePickerHelper?.updateSelectedDate(storedTimestamp)
        promise.resolve(true)
      } catch (e: Exception) {
        promise.reject("UNKNOWN_ERROR", e.message ?: "Failed to reset picker", e)
      }
    }
  }

  companion object {
    const val NAME = NativeDateTimePickerKitSpec.NAME
  }
}
