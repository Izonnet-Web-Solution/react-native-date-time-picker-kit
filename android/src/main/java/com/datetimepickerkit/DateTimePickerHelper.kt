package com.datetimepickerkit

import android.app.DatePickerDialog
import android.app.Dialog
import android.app.TimePickerDialog
import android.content.Context
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

  private fun showDateStep() {
    val year = calendar.get(Calendar.YEAR)
    val month = calendar.get(Calendar.MONTH)
    val day = calendar.get(Calendar.DAY_OF_MONTH)

    val dateDialog = DatePickerDialog(context, { _: DatePicker, selectedYear: Int, selectedMonth: Int, selectedDay: Int ->
      calendar.set(Calendar.YEAR, selectedYear)
      calendar.set(Calendar.MONTH, selectedMonth)
      calendar.set(Calendar.DAY_OF_MONTH, selectedDay)
      isTransitioningToTime = true
      showTimeStep()
    }, year, month, day)

    if (options.hasKey("minimumDate") && !options.isNull("minimumDate")) {
      dateDialog.datePicker.minDate = options.getDouble("minimumDate").toLong()
    }

    if (options.hasKey("maximumDate") && !options.isNull("maximumDate")) {
      dateDialog.datePicker.maxDate = options.getDouble("maximumDate").toLong()
    }

    val title = if (options.hasKey("title") && !options.isNull("title")) {
      options.getString("title")
    } else {
      "Select Date"
    }
    if (!title.isNullOrEmpty()) {
      dateDialog.setTitle(title)
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

    val timeDialog = TimePickerDialog(context, { _: TimePicker, hourOfDay: Int, minuteOfHour: Int ->
      if (!isHandled) {
        isHandled = true
        val snappedMinute = snapMinute(minuteOfHour, minuteInterval)
        calendar.set(Calendar.HOUR_OF_DAY, hourOfDay)
        calendar.set(Calendar.MINUTE, snappedMinute)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        resolveSuccess("confirmed", calendar.timeInMillis)
      }
    }, hour, minute, is24Hour)

    timeDialog.setTitle("Select Time")

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
