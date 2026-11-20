package com.datetimepickerkit

import android.app.DatePickerDialog
import android.content.Context
import android.content.res.Configuration
import android.os.Build
import android.widget.DatePicker
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import java.util.Calendar
import java.util.Locale
import java.util.TimeZone

class DatePickerHelper(
  private val context: Context,
  private val options: ReadableMap,
  private val promise: Promise,
  private val onDismissCallback: () -> Unit
) {
  private var isHandled = false
  private var datePickerDialog: DatePickerDialog? = null
  private val calendar = Calendar.getInstance()
  private var initialTimestamp: Long = 0L

  fun show(): DatePickerDialog {
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

    val year = calendar.get(Calendar.YEAR)
    val month = calendar.get(Calendar.MONTH)
    val day = calendar.get(Calendar.DAY_OF_MONTH)

    val display = if (options.hasKey("display") && !options.isNull("display")) {
      options.getString("display")
    } else {
      "default"
    }

    // Determine theme based on isDarkModeEnabled, theme, or display options
    val isDark = (options.hasKey("isDarkModeEnabled") && options.getBoolean("isDarkModeEnabled")) ||
      (options.hasKey("theme") && options.getString("theme") == "dark")

    val themeId = when {
      isDark -> android.R.style.Theme_DeviceDefault_Dialog_Alert
      display == "spinner" -> android.R.style.Theme_DeviceDefault_Light_Dialog_Alert
      else -> 0 // default dialog theme
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

    val dateSetListener = { _: DatePicker, selectedYear: Int, selectedMonth: Int, selectedDay: Int ->
      if (!isHandled) {
        isHandled = true
        calendar.set(Calendar.YEAR, selectedYear)
        calendar.set(Calendar.MONTH, selectedMonth)
        calendar.set(Calendar.DAY_OF_MONTH, selectedDay)
        resolveSuccess("confirmed", calendar.timeInMillis)
      }
    }

    val dialog = if (themeId != 0) {
      DatePickerDialog(dialogContext, themeId, dateSetListener, year, month, day)
    } else {
      DatePickerDialog(dialogContext, dateSetListener, year, month, day)
    }

    val datePicker = dialog.datePicker

    // Minimum and Maximum date with boundary safety
    val minDate = if (options.hasKey("minimumDate") && !options.isNull("minimumDate")) {
      options.getDouble("minimumDate").toLong()
    } else null

    val maxDate = if (options.hasKey("maximumDate") && !options.isNull("maximumDate")) {
      options.getDouble("maximumDate").toLong()
    } else null

    if (minDate != null && maxDate != null) {
      if (minDate <= maxDate) {
        datePicker.minDate = minDate
        datePicker.maxDate = maxDate
      }
    } else if (minDate != null) {
      datePicker.minDate = minDate
    } else if (maxDate != null) {
      datePicker.maxDate = maxDate
    }

    // Custom title
    if (options.hasKey("title") && !options.isNull("title")) {
      val title = options.getString("title")
      if (!title.isNullOrEmpty()) {
        dialog.setTitle(title)
      }
    }

    // Custom button labels (with iOS alias fallback)
    val confirmText = when {
      options.hasKey("confirmText") && !options.isNull("confirmText") -> options.getString("confirmText")
      options.hasKey("confirmTextIOS") && !options.isNull("confirmTextIOS") -> options.getString("confirmTextIOS")
      else -> null
    }
    if (!confirmText.isNullOrEmpty()) {
      dialog.setButton(DatePickerDialog.BUTTON_POSITIVE, confirmText, dialog)
    }

    val cancelText = when {
      options.hasKey("cancelText") && !options.isNull("cancelText") -> options.getString("cancelText")
      options.hasKey("cancelTextIOS") && !options.isNull("cancelTextIOS") -> options.getString("cancelTextIOS")
      else -> null
    }
    if (!cancelText.isNullOrEmpty()) {
      dialog.setButton(DatePickerDialog.BUTTON_NEGATIVE, cancelText, dialog)
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

    datePickerDialog = dialog
    dialog.show()
    return dialog
  }

  fun updateSelectedDate(timestamp: Long) {
    calendar.timeInMillis = timestamp
    datePickerDialog?.datePicker?.updateDate(
      calendar.get(Calendar.YEAR),
      calendar.get(Calendar.MONTH),
      calendar.get(Calendar.DAY_OF_MONTH)
    )
  }

  fun confirmAndDismiss(): Long {
    val ts = getSelectedTimestamp()
    if (!isHandled) {
      isHandled = true
      datePickerDialog?.dismiss()
      resolveSuccess("confirmed", ts)
    } else {
      datePickerDialog?.dismiss()
    }
    return ts
  }

  fun cancelAndDismiss() {
    if (!isHandled) {
      isHandled = true
      datePickerDialog?.cancel()
      resolveSuccess("cancelled", initialTimestamp)
    } else {
      datePickerDialog?.cancel()
    }
  }

  fun getSelectedTimestamp(): Long {
    datePickerDialog?.datePicker?.let { dp ->
      val cal = Calendar.getInstance()
      cal.set(dp.year, dp.month, dp.dayOfMonth, calendar.get(Calendar.HOUR_OF_DAY), calendar.get(Calendar.MINUTE), calendar.get(Calendar.SECOND))
      return cal.timeInMillis
    }
    return calendar.timeInMillis
  }

  private fun resolveSuccess(action: String, timestamp: Long) {
    val map: WritableMap = Arguments.createMap()
    map.putString("action", action)
    map.putDouble("timestamp", timestamp.toDouble())
    promise.resolve(map)
  }
}
