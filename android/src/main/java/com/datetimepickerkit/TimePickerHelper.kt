package com.datetimepickerkit

import android.app.TimePickerDialog
import android.content.Context
import android.text.format.DateFormat
import android.widget.TimePicker
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import java.util.Calendar
import java.util.Locale
import java.util.TimeZone

class TimePickerHelper(
  private val context: Context,
  private val options: ReadableMap,
  private val promise: Promise,
  private val onDismissCallback: () -> Unit
) {
  private var isHandled = false
  private var timePickerDialog: TimePickerDialog? = null
  private val calendar = Calendar.getInstance()
  private var currentHour = 0
  private var currentMinute = 0
  private var initialTimestamp: Long = 0L

  fun show(): TimePickerDialog {
    initialTimestamp = if (options.hasKey("value") && !options.isNull("value")) {
      options.getDouble("value").toLong()
    } else {
      System.currentTimeMillis()
    }

    if (options.hasKey("timeZoneOffsetInMinutes") && !options.isNull("timeZoneOffsetInMinutes")) {
      val offsetMinutes = options.getInt("timeZoneOffsetInMinutes")
      val sign = if (offsetMinutes < 0) "-" else "+"
      val absOffset = Math.abs(offsetMinutes)
      val hours = absOffset / 60
      val minutes = absOffset % 60
      val tz = TimeZone.getTimeZone(String.format(Locale.US, "GMT%s%02d:%02d", sign, hours, minutes))
      calendar.timeZone = tz
    }

    calendar.timeInMillis = initialTimestamp

    currentHour = calendar.get(Calendar.HOUR_OF_DAY)
    currentMinute = calendar.get(Calendar.MINUTE)

    // Minute interval snapping
    val minuteInterval = if (options.hasKey("minuteInterval") && !options.isNull("minuteInterval")) {
      options.getInt("minuteInterval")
    } else {
      1
    }

    if (minuteInterval > 1) {
      val remainder = currentMinute % minuteInterval
      if (remainder != 0) {
        currentMinute = if (remainder >= minuteInterval / 2) {
          (currentMinute + (minuteInterval - remainder)).coerceAtMost(59)
        } else {
          currentMinute - remainder
        }
      }
    }

    val is24Hour = if (options.hasKey("is24Hour") && !options.isNull("is24Hour")) {
      options.getBoolean("is24Hour")
    } else {
      DateFormat.is24HourFormat(context)
    }

    val display = if (options.hasKey("display") && !options.isNull("display")) {
      options.getString("display")
    } else {
      "default"
    }

    val themeId = when (display) {
      "spinner" -> android.R.style.Theme_DeviceDefault_Dialog_Alert
      else -> 0
    }

    val dialog = if (themeId != 0) {
      TimePickerDialog(context, themeId, { _: TimePicker, hourOfDay: Int, minute: Int ->
        if (!isHandled) {
          isHandled = true
          currentHour = hourOfDay
          currentMinute = snapMinute(minute, minuteInterval)
          calendar.set(Calendar.HOUR_OF_DAY, currentHour)
          calendar.set(Calendar.MINUTE, currentMinute)
          calendar.set(Calendar.SECOND, 0)
          calendar.set(Calendar.MILLISECOND, 0)
          resolveSuccess("confirmed", calendar.timeInMillis)
        }
      }, currentHour, currentMinute, is24Hour)
    } else {
      TimePickerDialog(context, { _: TimePicker, hourOfDay: Int, minute: Int ->
        if (!isHandled) {
          isHandled = true
          currentHour = hourOfDay
          currentMinute = snapMinute(minute, minuteInterval)
          calendar.set(Calendar.HOUR_OF_DAY, currentHour)
          calendar.set(Calendar.MINUTE, currentMinute)
          calendar.set(Calendar.SECOND, 0)
          calendar.set(Calendar.MILLISECOND, 0)
          resolveSuccess("confirmed", calendar.timeInMillis)
        }
      }, currentHour, currentMinute, is24Hour)
    }

    // Custom title
    if (options.hasKey("title") && !options.isNull("title")) {
      val title = options.getString("title")
      if (!title.isNullOrEmpty()) {
        dialog.setTitle(title)
      }
    }

    // Custom buttons
    if (options.hasKey("confirmText") && !options.isNull("confirmText")) {
      val confirmText = options.getString("confirmText")
      if (!confirmText.isNullOrEmpty()) {
        dialog.setButton(TimePickerDialog.BUTTON_POSITIVE, confirmText, dialog)
      }
    }

    if (options.hasKey("cancelText") && !options.isNull("cancelText")) {
      val cancelText = options.getString("cancelText")
      if (!cancelText.isNullOrEmpty()) {
        dialog.setButton(TimePickerDialog.BUTTON_NEGATIVE, cancelText, dialog)
      }
    }

    dialog.setOnCancelListener {
      if (!isHandled) {
        isHandled = true
        resolveSuccess("cancelled", initialTimestamp)
      }
    }

    dialog.setOnDismissListener {
      onDismissCallback()
      if (!isHandled) {
        isHandled = true
        resolveSuccess("dismissed", initialTimestamp)
      }
    }

    timePickerDialog = dialog
    dialog.show()
    return dialog
  }

  fun updateSelectedTime(timestamp: Long) {
    calendar.timeInMillis = timestamp
    currentHour = calendar.get(Calendar.HOUR_OF_DAY)
    currentMinute = calendar.get(Calendar.MINUTE)
    timePickerDialog?.updateTime(currentHour, currentMinute)
  }

  fun confirmAndDismiss(): Long {
    val ts = getSelectedTimestamp()
    if (!isHandled) {
      isHandled = true
      timePickerDialog?.dismiss()
      resolveSuccess("confirmed", ts)
    } else {
      timePickerDialog?.dismiss()
    }
    return ts
  }

  fun cancelAndDismiss() {
    if (!isHandled) {
      isHandled = true
      timePickerDialog?.cancel()
      resolveSuccess("cancelled", initialTimestamp)
    } else {
      timePickerDialog?.cancel()
    }
  }

  fun getSelectedTimestamp(): Long {
    calendar.set(Calendar.HOUR_OF_DAY, currentHour)
    calendar.set(Calendar.MINUTE, currentMinute)
    return calendar.timeInMillis
  }

  private fun snapMinute(minute: Int, interval: Int): Int {
    if (interval <= 1) return minute
    val remainder = minute % interval
    return if (remainder == 0) {
      minute
    } else if (remainder >= interval / 2) {
      (minute + (interval - remainder)).coerceAtMost(59)
    } else {
      minute - remainder
    }
  }

  private fun resolveSuccess(action: String, timestamp: Long) {
    val map: WritableMap = Arguments.createMap()
    map.putString("action", action)
    map.putDouble("timestamp", timestamp.toDouble())
    promise.resolve(map)
  }
}
