package com.datetimepickerkit

import android.app.DatePickerDialog
import android.content.Context
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

  fun show(): DatePickerDialog {
    val initialTimestamp = if (options.hasKey("value") && !options.isNull("value")) {
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

    // Determine theme based on display or theme options
    val themeId = when (display) {
      "spinner" -> android.R.style.Theme_DeviceDefault_Dialog_Alert
      else -> 0 // default dialog theme
    }

    val dialog = if (themeId != 0) {
      DatePickerDialog(context, themeId, { _: DatePicker, selectedYear: Int, selectedMonth: Int, selectedDay: Int ->
        if (!isHandled) {
          isHandled = true
          calendar.set(Calendar.YEAR, selectedYear)
          calendar.set(Calendar.MONTH, selectedMonth)
          calendar.set(Calendar.DAY_OF_MONTH, selectedDay)
          resolveSuccess("confirmed", calendar.timeInMillis)
        }
      }, year, month, day)
    } else {
      DatePickerDialog(context, { _: DatePicker, selectedYear: Int, selectedMonth: Int, selectedDay: Int ->
        if (!isHandled) {
          isHandled = true
          calendar.set(Calendar.YEAR, selectedYear)
          calendar.set(Calendar.MONTH, selectedMonth)
          calendar.set(Calendar.DAY_OF_MONTH, selectedDay)
          resolveSuccess("confirmed", calendar.timeInMillis)
        }
      }, year, month, day)
    }

    val datePicker = dialog.datePicker

    // Minimum date
    if (options.hasKey("minimumDate") && !options.isNull("minimumDate")) {
      val minDate = options.getDouble("minimumDate").toLong()
      datePicker.minDate = minDate
    }

    // Maximum date
    if (options.hasKey("maximumDate") && !options.isNull("maximumDate")) {
      val maxDate = options.getDouble("maximumDate").toLong()
      datePicker.maxDate = maxDate
    }

    // Custom title
    if (options.hasKey("title") && !options.isNull("title")) {
      val title = options.getString("title")
      if (!title.isNullOrEmpty()) {
        dialog.setTitle(title)
      }
    }

    // Custom button labels
    if (options.hasKey("confirmText") && !options.isNull("confirmText")) {
      val confirmText = options.getString("confirmText")
      if (!confirmText.isNullOrEmpty()) {
        dialog.setButton(DatePickerDialog.BUTTON_POSITIVE, confirmText, dialog)
      }
    }

    if (options.hasKey("cancelText") && !options.isNull("cancelText")) {
      val cancelText = options.getString("cancelText")
      if (!cancelText.isNullOrEmpty()) {
        dialog.setButton(DatePickerDialog.BUTTON_NEGATIVE, cancelText, dialog)
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
