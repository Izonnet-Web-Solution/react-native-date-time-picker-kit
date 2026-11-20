package com.datetimepickerkit

import android.app.DatePickerDialog
import android.app.Dialog
import android.app.TimePickerDialog
import android.content.Context
import android.content.res.Configuration
import android.text.format.DateFormat
import android.widget.DatePicker
import android.widget.TimePicker
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import java.util.Calendar
import java.util.Locale
import java.util.TimeZone

class DateTimePickerHelper(
  private val context: Context,
  private val options: ReadableMap,
  private val promise: Promise,
  private val onDismissCallback: () -> Unit
) {
  private var isHandled = false
  private var isTransitioningToTime = false
  private var currentDialog: Dialog? = null
  private val calendar = Calendar.getInstance()
  private val initialTimestamp: Long

  init {
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
  }

  fun show(): Dialog {
    showDateStep()
    return currentDialog!!
  }

  private fun configureLocale() {
    if (options.hasKey("locale") && !options.isNull("locale")) {
      val localeStr = options.getString("locale")
      if (!localeStr.isNullOrEmpty()) {
        try {
          val loc = Locale.forLanguageTag(localeStr.replace('_', '-'))
          Locale.setDefault(loc)
          val config = Configuration(context.resources.configuration)
          config.setLocale(loc)
          @Suppress("DEPRECATION")
          context.resources.updateConfiguration(config, context.resources.displayMetrics)
        } catch (_: Exception) {}
      }
    }
  }

  private fun getThemeId(): Int {
    val isDark = (options.hasKey("isDarkModeEnabled") && options.getBoolean("isDarkModeEnabled")) ||
      (options.hasKey("theme") && options.getString("theme") == "dark")
    val display = if (options.hasKey("display") && !options.isNull("display")) options.getString("display") else "default"

    return when {
      isDark -> android.R.style.Theme_DeviceDefault_Dialog_Alert
      display == "spinner" -> android.R.style.Theme_DeviceDefault_Light_Dialog_Alert
      else -> 0
    }
  }

  private fun showDateStep() {
    configureLocale()
    val year = calendar.get(Calendar.YEAR)
    val month = calendar.get(Calendar.MONTH)
    val day = calendar.get(Calendar.DAY_OF_MONTH)
    val themeId = getThemeId()

    val dateSetListener = { _: DatePicker, selectedYear: Int, selectedMonth: Int, selectedDay: Int ->
      calendar.set(Calendar.YEAR, selectedYear)
      calendar.set(Calendar.MONTH, selectedMonth)
      calendar.set(Calendar.DAY_OF_MONTH, selectedDay)
      val hapticEnabled = if (options.hasKey("hapticFeedbackEnabled") && !options.isNull("hapticFeedbackEnabled")) {
        options.getBoolean("hapticFeedbackEnabled")
      } else true
      if (hapticEnabled) {
        try {
          (context as? android.app.Activity)?.window?.decorView?.performHapticFeedback(android.view.HapticFeedbackConstants.VIRTUAL_KEY)
        } catch (_: Exception) {}
      }
      isTransitioningToTime = true
      showTimeStep()
    }

    val dateDialog = if (themeId != 0) {
      DatePickerDialog(context, themeId, dateSetListener, year, month, day)
    } else {
      DatePickerDialog(context, dateSetListener, year, month, day)
    }

    val minDate = if (options.hasKey("minimumDate") && !options.isNull("minimumDate")) {
      options.getDouble("minimumDate").toLong()
    } else null

    val maxDate = if (options.hasKey("maximumDate") && !options.isNull("maximumDate")) {
      options.getDouble("maximumDate").toLong()
    } else null

    if (minDate != null && maxDate != null) {
      if (minDate <= maxDate) {
        dateDialog.datePicker.minDate = minDate
        dateDialog.datePicker.maxDate = maxDate
      }
    } else if (minDate != null) {
      dateDialog.datePicker.minDate = minDate
    } else if (maxDate != null) {
      dateDialog.datePicker.maxDate = maxDate
    }

    val title = if (options.hasKey("title") && !options.isNull("title")) {
      options.getString("title")
    } else {
      "Select Date"
    }
    if (!title.isNullOrEmpty()) {
      dateDialog.setTitle(title)
    }

    val cancelText = when {
      options.hasKey("cancelText") && !options.isNull("cancelText") -> options.getString("cancelText")
      options.hasKey("cancelTextIOS") && !options.isNull("cancelTextIOS") -> options.getString("cancelTextIOS")
      else -> null
    }
    if (!cancelText.isNullOrEmpty()) {
      dateDialog.setButton(DatePickerDialog.BUTTON_NEGATIVE, cancelText, dateDialog)
    }

    dateDialog.setOnCancelListener {
      if (!isHandled) {
        isHandled = true
        resolveSuccess("cancelled", initialTimestamp)
      }
    }

    dateDialog.setOnDismissListener {
      if (!isTransitioningToTime) {
        onDismissCallback()
        if (!isHandled) {
          isHandled = true
          resolveSuccess("dismissed", initialTimestamp)
        }
      }
    }

    currentDialog = dateDialog
    dateDialog.show()
  }

  private fun showTimeStep() {
    isTransitioningToTime = false

    val hour = calendar.get(Calendar.HOUR_OF_DAY)
    val minute = calendar.get(Calendar.MINUTE)
    val themeId = getThemeId()

    val minuteInterval = if (options.hasKey("minuteInterval") && !options.isNull("minuteInterval")) {
      options.getInt("minuteInterval")
    } else {
      1
    }

    val is24Hour = if (options.hasKey("is24Hour") && !options.isNull("is24Hour")) {
      options.getBoolean("is24Hour")
    } else {
      DateFormat.is24HourFormat(context)
    }

    val timeSetListener = { _: TimePicker, hourOfDay: Int, minuteOfHour: Int ->
      if (!isHandled) {
        isHandled = true
        val snappedMinute = snapMinute(minuteOfHour, minuteInterval)
        calendar.set(Calendar.HOUR_OF_DAY, hourOfDay)
        calendar.set(Calendar.MINUTE, snappedMinute)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        val hapticEnabled = if (options.hasKey("hapticFeedbackEnabled") && !options.isNull("hapticFeedbackEnabled")) {
          options.getBoolean("hapticFeedbackEnabled")
        } else true
        if (hapticEnabled) {
          try {
            (context as? android.app.Activity)?.window?.decorView?.performHapticFeedback(android.view.HapticFeedbackConstants.VIRTUAL_KEY)
          } catch (_: Exception) {}
        }
        resolveSuccess("confirmed", calendar.timeInMillis)
      }
    }

    val timeDialog = if (themeId != 0) {
      TimePickerDialog(context, themeId, timeSetListener, hour, minute, is24Hour)
    } else {
      TimePickerDialog(context, timeSetListener, hour, minute, is24Hour)
    }

    timeDialog.setTitle("Select Time")

    val confirmText = when {
      options.hasKey("confirmText") && !options.isNull("confirmText") -> options.getString("confirmText")
      options.hasKey("confirmTextIOS") && !options.isNull("confirmTextIOS") -> options.getString("confirmTextIOS")
      else -> null
    }
    if (!confirmText.isNullOrEmpty()) {
      timeDialog.setButton(TimePickerDialog.BUTTON_POSITIVE, confirmText, timeDialog)
    }

    val cancelText = when {
      options.hasKey("cancelText") && !options.isNull("cancelText") -> options.getString("cancelText")
      options.hasKey("cancelTextIOS") && !options.isNull("cancelTextIOS") -> options.getString("cancelTextIOS")
      else -> null
    }
    if (!cancelText.isNullOrEmpty()) {
      timeDialog.setButton(TimePickerDialog.BUTTON_NEGATIVE, cancelText, timeDialog)
    }

    timeDialog.setOnCancelListener {
      if (!isHandled) {
        isHandled = true
        resolveSuccess("cancelled", initialTimestamp)
      }
    }

    timeDialog.setOnDismissListener {
      onDismissCallback()
      if (!isHandled) {
        isHandled = true
        resolveSuccess("dismissed", initialTimestamp)
      }
    }

    currentDialog = timeDialog
    timeDialog.show()
  }

  fun confirmAndDismiss(): Long {
    val ts = getSelectedTimestamp()
    if (!isHandled) {
      isHandled = true
      currentDialog?.dismiss()
      currentDialog = null
      resolveSuccess("confirmed", ts)
    } else {
      currentDialog?.dismiss()
      currentDialog = null
    }
    return ts
  }

  fun cancelAndDismiss() {
    if (!isHandled) {
      isHandled = true
      currentDialog?.cancel()
      currentDialog = null
      resolveSuccess("cancelled", initialTimestamp)
    } else {
      currentDialog?.cancel()
      currentDialog = null
    }
  }

  fun updateSelectedDate(timestamp: Long) {
    calendar.timeInMillis = timestamp
  }

  fun getSelectedTimestamp(): Long {
    return calendar.timeInMillis
  }

  fun dismissCurrentDialog() {
    currentDialog?.dismiss()
    currentDialog = null
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
