package com.datetimepickerkit

import android.app.TimePickerDialog
import android.content.Context
import android.content.res.Configuration
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

    val isDark = (options.hasKey("isDarkModeEnabled") && options.getBoolean("isDarkModeEnabled")) ||
      (options.hasKey("theme") && options.getString("theme") == "dark")

    val themeId = when {
      isDark -> android.R.style.Theme_DeviceDefault_Dialog_Alert
      display == "spinner" -> android.R.style.Theme_DeviceDefault_Light_Dialog_Alert
      else -> 0
    }

    // Locale configuration support
    val dialogContext = if (options.hasKey("locale") && !options.isNull("locale")) {
      val localeStr = options.getString("locale")
      if (!localeStr.isNullOrEmpty()) {
        try {
          val loc = Locale.forLanguageTag(localeStr.replace('_', '-'))
          val config = Configuration(context.resources.configuration)
          config.setLocale(loc)
          context.createConfigurationContext(config)
        } catch (_: Exception) {
          context
        }
      } else {
        context
      }
    } else {
      context
    }

    val hapticEnabled = if (options.hasKey("hapticFeedbackEnabled") && !options.isNull("hapticFeedbackEnabled")) {
      options.getBoolean("hapticFeedbackEnabled")
    } else true

    val timeSetListener = { _: TimePicker, hourOfDay: Int, minute: Int ->
      if (!isHandled) {
        isHandled = true
        currentHour = hourOfDay
        currentMinute = snapMinute(minute, minuteInterval)
        calendar.set(Calendar.HOUR_OF_DAY, currentHour)
        calendar.set(Calendar.MINUTE, currentMinute)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        if (hapticEnabled) {
          try {
            timePickerDialog?.window?.decorView?.performHapticFeedback(android.view.HapticFeedbackConstants.VIRTUAL_KEY)
          } catch (_: Exception) {}
        }
        resolveSuccess("confirmed", calendar.timeInMillis)
      }
    }

    val dialog = if (themeId != 0) {
      TimePickerDialog(dialogContext, themeId, timeSetListener, currentHour, currentMinute, is24Hour)
    } else {
      TimePickerDialog(dialogContext, timeSetListener, currentHour, currentMinute, is24Hour)
    }

    // Custom title
    if (options.hasKey("title") && !options.isNull("title")) {
      val title = options.getString("title")
      if (!title.isNullOrEmpty()) {
        dialog.setTitle(title)
      }
    }

    // Custom buttons (with iOS alias fallback)
    val confirmText = when {
      options.hasKey("confirmText") && !options.isNull("confirmText") -> options.getString("confirmText")
      options.hasKey("confirmTextIOS") && !options.isNull("confirmTextIOS") -> options.getString("confirmTextIOS")
      else -> null
    }
    if (!confirmText.isNullOrEmpty()) {
      dialog.setButton(TimePickerDialog.BUTTON_POSITIVE, confirmText, dialog)
    }

    val cancelText = when {
      options.hasKey("cancelText") && !options.isNull("cancelText") -> options.getString("cancelText")
      options.hasKey("cancelTextIOS") && !options.isNull("cancelTextIOS") -> options.getString("cancelTextIOS")
      else -> null
    }
    if (!cancelText.isNullOrEmpty()) {
      dialog.setButton(TimePickerDialog.BUTTON_NEGATIVE, cancelText, dialog)
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
