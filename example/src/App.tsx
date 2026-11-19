import { useRef, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CalendarPicker,
  DatePicker,
  type DatePickerRef,
  DateRangePicker,
  type DateRangePickerRef,
  DateTimePicker,
  type DateTimePickerRef,
  formatDate,
  formatLocalized,
  MonthPicker,
  type ThemeMode,
  TimePicker,
  type TimePickerRef,
  TimeSlotPicker,
  useDateTimePicker,
  WheelPicker,
  YearPicker,
} from '@izonnet-web-solution/react-native-date-time-picker-kit';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'native' | 'components' | 'range' | 'slots'
  >('native');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [selectedLocale, setSelectedLocale] = useState<'en' | 'hi' | 'gu'>(
    'en'
  );

  // State for Native pickers
  const [nativeDate, setNativeDate] = useState<Date>(new Date());
  const [nativeTime, setNativeTime] = useState<Date>(new Date());
  const [nativeDateTime, setNativeDateTime] = useState<Date>(new Date());
  const [lastEvent, setLastEvent] = useState<string>('Ready');

  // State for JS Custom components
  const [inlineDate, setInlineDate] = useState<Date>(new Date());
  const [selectedRange, setSelectedRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: new Date(),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  });
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00');
  const [selectedMonthYear, setSelectedMonthYear] = useState<{
    year: number;
    month: number;
  }>({
    year: 2026,
    month: 10,
  });

  // Refs
  const nativeDatePickerRef = useRef<DateTimePickerRef>(null);
  const nativeTimePickerRef = useRef<DateTimePickerRef>(null);
  const nativeDateTimePickerRef = useRef<DateTimePickerRef>(null);
  const jsDatePickerRef = useRef<DatePickerRef>(null);
  const jsTimePickerRef = useRef<TimePickerRef>(null);
  const rangePickerRef = useRef<DateRangePickerRef>(null);

  // Hook demo
  const countdownHook = useDateTimePicker({ mode: 'countdown' });

  const isDark = themeMode === 'dark';
  const bgColor = isDark ? '#0F172A' : '#F8FAFC';
  const cardColor = isDark ? '#1E293B' : '#FFFFFF';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#334155' : '#E2E8F0';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title Header */}
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Date Time Picker Kit
        </Text>
        <Text style={[styles.subTitle, { color: subtextColor }]}>
          TurboModule Native + Custom UI Components
        </Text>

        {/* Global Controls: Theme & Locale Switcher */}
        <View
          style={[
            styles.controlsCard,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          <View style={styles.controlRow}>
            <Text style={[styles.controlLabel, { color: textColor }]}>
              Theme:
            </Text>
            <View style={styles.pillGroup}>
              {(['light', 'dark'] as ThemeMode[]).map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setThemeMode(m)}
                  style={[
                    styles.pillButton,
                    themeMode === m && styles.pillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      themeMode === m && styles.pillTextActive,
                    ]}
                  >
                    {m.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.controlRow}>
            <Text style={[styles.controlLabel, { color: textColor }]}>
              Locale:
            </Text>
            <View style={styles.pillGroup}>
              {(['en', 'hi', 'gu'] as const).map((loc) => (
                <TouchableOpacity
                  key={loc}
                  onPress={() => setSelectedLocale(loc)}
                  style={[
                    styles.pillButton,
                    selectedLocale === loc && styles.pillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      selectedLocale === loc && styles.pillTextActive,
                    ]}
                  >
                    {loc === 'en'
                      ? 'English'
                      : loc === 'hi'
                        ? 'हिंदी'
                        : 'ગુજરાતી'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Status Box */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
              borderColor: isDark ? '#334155' : '#BFDBFE',
            },
          ]}
        >
          <Text style={[styles.statusLabel, { color: '#2563EB' }]}>
            Last Event:
          </Text>
          <Text style={[styles.statusValue, { color: textColor }]}>
            {lastEvent}
          </Text>
        </View>

        {/* Section Navigation Tabs */}
        <View style={[styles.navTabs, { borderColor }]}>
          {(
            [
              { id: 'native', label: '1. Native Dialogs' },
              { id: 'components', label: '2. Custom Calendar' },
              { id: 'range', label: '3. Date Range' },
              { id: 'slots', label: '4. Slots & Wheel' },
            ] as const
          ).map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.tabButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === tab.id
                    ? styles.tabButtonTextActive
                    : { color: subtextColor },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TAB 1: NATIVE PICKERS */}
        {activeTab === 'native' && (
          <View>
            {/* Native Date Picker */}
            <View
              style={[
                styles.section,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Native Date Picker
              </Text>
              <Text style={[styles.valueText, { color: subtextColor }]}>
                Selected: {formatDate(nativeDate, 'YYYY-MM-DD (dddd)')}
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => nativeDatePickerRef.current?.open()}
                >
                  <Text style={styles.buttonText}>Open Native Date</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    const tmrw = new Date();
                    tmrw.setDate(tmrw.getDate() + 1);
                    nativeDatePickerRef.current?.setValue(tmrw);
                    setNativeDate(tmrw);
                  }}
                >
                  <Text style={styles.secondaryButtonText}>Set Tomorrow</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                ref={nativeDatePickerRef}
                mode="date"
                presentation="native"
                value={nativeDate}
                locale={selectedLocale}
                theme={themeMode}
                title="Select Date"
                onConfirm={(d) => {
                  setNativeDate(d);
                  setLastEvent(`Native Date: ${formatDate(d, 'YYYY-MM-DD')}`);
                }}
                onCancel={() => setLastEvent('Native Date Cancelled')}
                onDismiss={() => setLastEvent('Native Date Dismissed')}
              />
            </View>

            {/* Native Time Picker */}
            <View
              style={[
                styles.section,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Native Time Picker (12h/24h)
              </Text>
              <Text style={[styles.valueText, { color: subtextColor }]}>
                Selected: {formatDate(nativeTime, 'hh:mm A')} | 24h:{' '}
                {formatDate(nativeTime, 'HH:mm')}
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => nativeTimePickerRef.current?.open()}
              >
                <Text style={styles.buttonText}>Open Native Time</Text>
              </TouchableOpacity>
              <DateTimePicker
                ref={nativeTimePickerRef}
                mode="time"
                presentation="native"
                value={nativeTime}
                is24Hour={false}
                minuteInterval={5}
                locale={selectedLocale}
                theme={themeMode}
                title="Select Time"
                onConfirm={(t) => {
                  setNativeTime(t);
                  setLastEvent(`Native Time: ${formatDate(t, 'hh:mm A')}`);
                }}
                onCancel={() => setLastEvent('Native Time Cancelled')}
              />
            </View>

            {/* Native DateTime Picker */}
            <View
              style={[
                styles.section,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Native Combined DateTime (
                {Platform.OS === 'android' ? 'Sequential' : 'Combined'})
              </Text>
              <Text style={[styles.valueText, { color: subtextColor }]}>
                Selected: {formatDate(nativeDateTime, 'YYYY-MM-DD HH:mm')}
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => nativeDateTimePickerRef.current?.open()}
              >
                <Text style={styles.buttonText}>Open Native DateTime</Text>
              </TouchableOpacity>
              <DateTimePicker
                ref={nativeDateTimePickerRef}
                mode="datetime"
                presentation="native"
                value={nativeDateTime}
                locale={selectedLocale}
                theme={themeMode}
                title="Select Date & Time"
                onConfirm={(dt) => {
                  setNativeDateTime(dt);
                  setLastEvent(
                    `Native DateTime: ${formatDate(dt, 'YYYY-MM-DD HH:mm')}`
                  );
                }}
              />
            </View>

            {/* Native Countdown via Hook */}
            <View
              style={[
                styles.section,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Countdown via Hook
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={async () => {
                  try {
                    const res = await countdownHook.open();
                    if (res) setLastEvent(`Countdown: ${res.toISOString()}`);
                  } catch (err: any) {
                    Alert.alert('Notice', err.message);
                  }
                }}
              >
                <Text style={styles.buttonText}>Open Countdown Picker</Text>
              </TouchableOpacity>
              <DateTimePicker
                ref={countdownHook.ref}
                mode="countdown"
                title="Countdown Timer"
                onError={(e) => Alert.alert('Error', e.message)}
              />
            </View>
          </View>
        )}

        {/* TAB 2: CUSTOM CALENDAR & BOTTOM SHEET */}
        {activeTab === 'components' && (
          <View>
            {/* Inline Calendar */}
            <View
              style={[
                styles.section,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Inline Calendar Picker
              </Text>
              <Text style={[styles.valueText, { color: subtextColor }]}>
                Selected:{' '}
                {formatLocalized(inlineDate, 'DD MMMM YYYY (dddd)', undefined)}
              </Text>
              <CalendarPicker
                value={inlineDate}
                onChange={(d) => {
                  setInlineDate(d);
                  setLastEvent(
                    `Inline Calendar: ${formatDate(d, 'YYYY-MM-DD')}`
                  );
                }}
                firstDayOfWeek={0}
                theme={themeMode}
                locale={selectedLocale}
              />
            </View>

            {/* Bottom Sheet Date Picker */}
            <View
              style={[
                styles.section,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Bottom Sheet DatePicker
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => jsDatePickerRef.current?.open()}
              >
                <Text style={styles.buttonText}>Open Bottom Sheet Date</Text>
              </TouchableOpacity>
              <DatePicker
                ref={jsDatePickerRef}
                presentation="bottom-sheet"
                value={inlineDate}
                showPresets
                theme={themeMode}
                locale={selectedLocale}
                onConfirmDate={(d) => {
                  setInlineDate(d);
                  setLastEvent(
                    `Bottom Sheet Confirmed: ${formatDate(d, 'YYYY-MM-DD')}`
                  );
                }}
              />
            </View>

            {/* Modal Time Picker (Clock) */}
            <View
              style={[
                styles.section,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Modal Clock TimePicker
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => jsTimePickerRef.current?.open()}
              >
                <Text style={styles.buttonText}>Open Clock Picker</Text>
              </TouchableOpacity>
              <TimePicker
                ref={jsTimePickerRef}
                presentation="modal"
                value={nativeTime}
                is24Hour={false}
                minuteInterval={5}
                theme={themeMode}
                locale={selectedLocale}
                onConfirmTime={(t) => {
                  setNativeTime(t);
                  setLastEvent(
                    `Clock Time Confirmed: ${formatDate(t, 'hh:mm A')}`
                  );
                }}
              />
            </View>
          </View>
        )}

        {/* TAB 3: DATE RANGE PICKER */}
        {activeTab === 'range' && (
          <View>
            <View
              style={[
                styles.section,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Date Range Picker
              </Text>
              <Text style={[styles.valueText, { color: subtextColor }]}>
                Start:{' '}
                {selectedRange.startDate
                  ? formatDate(selectedRange.startDate, 'YYYY-MM-DD')
                  : 'None'}
              </Text>
              <Text style={[styles.valueText, { color: subtextColor }]}>
                End:{' '}
                {selectedRange.endDate
                  ? formatDate(selectedRange.endDate, 'YYYY-MM-DD')
                  : 'None'}
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => rangePickerRef.current?.open()}
              >
                <Text style={styles.buttonText}>Open Date Range Picker</Text>
              </TouchableOpacity>

              <DateRangePicker
                ref={rangePickerRef}
                presentation="bottom-sheet"
                showPresets
                startDate={selectedRange.startDate}
                endDate={selectedRange.endDate}
                theme={themeMode}
                locale={selectedLocale}
                onChange={(r) => setSelectedRange(r)}
                onConfirmRange={(r) => {
                  setSelectedRange(r);
                  setLastEvent(
                    `Range Confirmed: ${formatDate(r.startDate, 'YYYY-MM-DD')} to ${formatDate(r.endDate, 'YYYY-MM-DD')}`
                  );
                }}
              />
            </View>

            {/* Inline Range Calendar */}
            <View
              style={[
                styles.section,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Inline Range Calendar
              </Text>
              <CalendarPicker
                rangeMode
                startDate={selectedRange.startDate}
                endDate={selectedRange.endDate}
                onRangeChange={(r) => setSelectedRange(r)}
                theme={themeMode}
                locale={selectedLocale}
              />
            </View>
          </View>
        )}

        {/* TAB 4: TIME SLOTS, MONTH, YEAR & WHEEL */}
        {activeTab === 'slots' && (
          <View>
            {/* Appointment Time Slots */}
            <View
              style={[
                styles.section,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Appointment Time Slots
              </Text>
              <Text style={[styles.valueText, { color: subtextColor }]}>
                Selected Slot: {selectedSlot}
              </Text>
              <TimeSlotPicker
                startTime="09:00"
                endTime="17:00"
                intervalMinutes={30}
                disabledSlots={['12:00', '12:30', '13:00']}
                selectedSlotId={selectedSlot}
                theme={themeMode}
                onSelectSlot={(slot) => {
                  setSelectedSlot(slot.id);
                  setLastEvent(
                    `Slot Selected: ${slot.formattedStart} - ${slot.formattedEnd}`
                  );
                }}
              />
            </View>

            {/* Month & Year Selectors */}
            <View
              style={[
                styles.section,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Month & Year Picker
              </Text>
              <Text style={[styles.valueText, { color: subtextColor }]}>
                Year: {selectedMonthYear.year} | Month:{' '}
                {selectedMonthYear.month + 1}
              </Text>
              <MonthPicker
                value={selectedMonthYear}
                theme={themeMode}
                locale={selectedLocale}
                onChange={(res) => {
                  setSelectedMonthYear(res);
                  setLastEvent(`Month/Year: ${res.year}-${res.month + 1}`);
                }}
              />
            </View>

            {/* Year Grid */}
            <View
              style={[
                styles.section,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Year Picker Grid
              </Text>
              <YearPicker
                value={selectedMonthYear.year}
                theme={themeMode}
                locale={selectedLocale}
                onChange={(yr) => {
                  setSelectedMonthYear((prev) => ({ ...prev, year: yr }));
                  setLastEvent(`Year Selected: ${yr}`);
                }}
              />
            </View>

            {/* Wheel Picker */}
            <View
              style={[
                styles.section,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Wheel Picker
              </Text>
              <WheelPicker
                items={[
                  { label: 'Morning (09:00 AM)', value: 'morning' },
                  { label: 'Afternoon (01:00 PM)', value: 'afternoon' },
                  { label: 'Evening (05:00 PM)', value: 'evening' },
                  { label: 'Night (09:00 PM)', value: 'night' },
                ]}
                selectedValue="morning"
                theme={themeMode}
                onChange={(val) => setLastEvent(`Wheel Selected: ${val}`)}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  subTitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 2,
  },
  controlsCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 10,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  pillGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  pillButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  pillActive: {
    backgroundColor: '#2563EB',
  },
  pillText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statusCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  navTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  valueText: {
    fontSize: 13,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
});
