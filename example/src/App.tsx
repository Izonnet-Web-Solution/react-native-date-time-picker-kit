import { useRef, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePickerModal, {
  DateTimePicker,
  type DateTimePickerRef,
  openDateTimePickerModal,
  useDateTimePicker,
} from '@izonnet-web-solution/react-native-date-time-modal';

interface ActivePickerConfig {
  mode?: 'date' | 'time' | 'datetime' | 'countdown';
  display?: 'default' | 'spinner' | 'compact' | 'inline';
  is24Hour?: boolean;
  minuteInterval?: 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;
  minimumDate?: Date;
  maximumDate?: Date;
  isDarkModeEnabled?: boolean;
  accentColorIOS?: string;
  buttonTextColorIOS?: string;
  confirmTextIOS?: string;
  cancelTextIOS?: string;
  headerTextIOS?: string;
  title?: string;
  backdropOpacity?: number;
  cardBorderRadius?: number;
  hapticFeedbackEnabled?: boolean;
  locale?: string;
  timeZoneOffsetInMinutes?: number;
}

export default function App() {
  const isIOS = Platform.OS === 'ios';

  // Modal State
  const [isVisible, setIsVisible] = useState(false);
  const [pickerConfig, setPickerConfig] = useState<ActivePickerConfig>({
    mode: 'date',
  });

  // Diagnostics & Results
  const [currentTestName, setCurrentTestName] = useState<string>('None');
  const [lastAction, setLastAction] = useState<string>('Ready for testing');
  const [pickedResult, setPickedResult] =
    useState<string>('No date picked yet');
  const [rawTimestamp, setRawTimestamp] = useState<number | null>(null);

  // Hook Test Setup
  const hookPicker = useDateTimePicker({
    mode: 'date',
  });

  const handleHookTest = async () => {
    setCurrentTestName('useDateTimePicker Hook');
    setLastAction('Hook picker opened');
    const selected = await hookPicker.open();
    if (selected) {
      handlePicked('useDateTimePicker Hook', selected, 'Confirmed via Hook');
    } else {
      setLastAction('Hook picker cancelled');
    }
  };

  // Ref Component Setup
  const imperativePickerRef = useRef<DateTimePickerRef>(null);

  // Universal result handler
  const handlePicked = (testName: string, date: Date, actionText: string) => {
    setIsVisible(false);
    setCurrentTestName(testName);
    setLastAction(actionText);
    setRawTimestamp(date.getTime());

    const formatted = date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setPickedResult(formatted);
    console.log(`[TEST: ${testName}] Result:`, date);
  };

  // Launch modal with specific test configuration
  const runTest = (testTitle: string, config: ActivePickerConfig) => {
    setCurrentTestName(testTitle);
    setPickerConfig(config);
    setIsVisible(true);
  };

  // Run Async Promise Test
  const runAsyncTest = async () => {
    try {
      setCurrentTestName('Async openDateTimePickerModal()');
      setLastAction('Modal opened, waiting for user confirmation...');
      const date = await openDateTimePickerModal({
        mode: 'datetime',
        title: 'Promise-based Picker',
        confirmText: 'Done',
      });
      if (date) {
        handlePicked(
          'Async openDateTimePickerModal()',
          date,
          'Resolved via Promise'
        );
      }
    } catch {
      setLastAction('Promise Rejected: User cancelled picker');
    }
  };

  // Clear Output
  const clearResults = () => {
    setCurrentTestName('None');
    setLastAction('Cleared results');
    setPickedResult('No date picked yet');
    setRawTimestamp(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Date-Time-Modal Test Suite</Text>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Platform: {Platform.OS.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.badge, styles.badgeActive]}>
            <Text style={styles.badgeTextActive}>Zero Dependencies</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Output & Diagnostics Console */}
        <View style={styles.consoleCard}>
          <View style={styles.consoleHeader}>
            <Text style={styles.consoleTitle}>📊 Live Device Diagnostics</Text>
            <TouchableOpacity onPress={clearResults} activeOpacity={0.6}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.consoleRow}>
            <Text style={styles.consoleLabel}>Active Test:</Text>
            <Text style={styles.consoleValueHighlight}>{currentTestName}</Text>
          </View>

          <View style={styles.consoleRow}>
            <Text style={styles.consoleLabel}>Last Event:</Text>
            <Text style={styles.consoleValue}>{lastAction}</Text>
          </View>

          <View style={styles.consoleRow}>
            <Text style={styles.consoleLabel}>Picked Output:</Text>
            <Text style={styles.consoleValueDate}>{pickedResult}</Text>
          </View>

          {rawTimestamp ? (
            <View style={styles.consoleRow}>
              <Text style={styles.consoleLabel}>Epoch MS:</Text>
              <Text style={styles.consoleValueMono}>{rawTimestamp}</Text>
            </View>
          ) : null}
        </View>

        {/* 1. Core Pickers */}
        <Text style={styles.sectionTitle}>1. 📅 Core Picker Modes</Text>

        <TouchableOpacity
          style={styles.testButton}
          activeOpacity={0.7}
          onPress={() =>
            runTest('Date Picker (Native)', {
              mode: 'date',
              confirmTextIOS: 'Select Date',
            })
          }
        >
          <Text style={styles.testButtonText}>
            {isIOS ? 'Show Date Picker' : 'Show "date" picker'}
          </Text>
          <Text style={styles.testButtonSub}>
            Standard native date calendar dialog
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          activeOpacity={0.7}
          onPress={() =>
            runTest('Time Picker (12-Hour)', {
              mode: 'time',
              is24Hour: false,
              confirmTextIOS: 'Select Time',
            })
          }
        >
          <Text style={styles.testButtonText}>
            {isIOS ? 'Show Time Picker' : 'Show "time" picker'}
          </Text>
          <Text style={styles.testButtonSub}>
            12-Hour format with AM/PM toggle
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          activeOpacity={0.7}
          onPress={() =>
            runTest('Time Picker (24-Hour)', {
              mode: 'time',
              is24Hour: true,
              confirmTextIOS: 'Confirm 24H',
            })
          }
        >
          <Text style={styles.testButtonText}>Show 24-Hour Time Picker</Text>
          <Text style={styles.testButtonSub}>
            Enforces 24-hour military time
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          activeOpacity={0.7}
          onPress={() =>
            runTest('DateTime Picker (Combined)', {
              mode: 'datetime',
              confirmTextIOS: 'Confirm Both',
            })
          }
        >
          <Text style={styles.testButtonText}>Show DateTime Picker</Text>
          <Text style={styles.testButtonSub}>
            {isIOS
              ? 'Unified iOS wheels modal'
              : 'Sequential Date then Time flow'}
          </Text>
        </TouchableOpacity>

        {isIOS ? (
          <TouchableOpacity
            style={styles.testButton}
            activeOpacity={0.7}
            onPress={() =>
              runTest('Countdown Timer (iOS)', {
                mode: 'countdown',
                confirmTextIOS: 'Set Timer',
              })
            }
          >
            <Text style={styles.testButtonText}>
              Show Countdown Timer (iOS)
            </Text>
            <Text style={styles.testButtonSub}>
              UIDatePicker countdown mode
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* 2. Boundaries & Intervals */}
        <Text style={styles.sectionTitle}>2. 🔒 Boundaries & Intervals</Text>

        <TouchableOpacity
          style={styles.testButton}
          activeOpacity={0.7}
          onPress={() =>
            runTest('Future Dates Only (minDate=Today)', {
              mode: 'date',
              minimumDate: new Date(),
              headerTextIOS: 'Future Dates Only',
            })
          }
        >
          <Text style={styles.testButtonText}>Future Dates Only (minDate)</Text>
          <Text style={styles.testButtonSub}>
            Past dates are disabled and blocked
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          activeOpacity={0.7}
          onPress={() =>
            runTest('Past Dates Only (maxDate=Today)', {
              mode: 'date',
              maximumDate: new Date(),
              headerTextIOS: 'Past Dates Only',
            })
          }
        >
          <Text style={styles.testButtonText}>Past Dates Only (maxDate)</Text>
          <Text style={styles.testButtonSub}>
            Future dates are disabled and blocked
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          activeOpacity={0.7}
          onPress={() => {
            const min = new Date();
            const max = new Date();
            max.setDate(max.getDate() + 7);
            runTest('Next 7 Days Window', {
              mode: 'date',
              minimumDate: min,
              maximumDate: max,
              headerTextIOS: 'Next 7 Days Only',
            });
          }}
        >
          <Text style={styles.testButtonText}>Next 7 Days Window Range</Text>
          <Text style={styles.testButtonSub}>
            Restricted date window selection
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          activeOpacity={0.7}
          onPress={() =>
            runTest('15-Minute Snapping Interval', {
              mode: 'time',
              minuteInterval: 15,
              headerTextIOS: '15-Min Step Interval',
            })
          }
        >
          <Text style={styles.testButtonText}>15-Minute Snapping Interval</Text>
          <Text style={styles.testButtonSub}>
            Minute steps snapped to 00, 15, 30, 45
          </Text>
        </TouchableOpacity>

        {/* 3. Theming & Styling */}
        <Text style={styles.sectionTitle}>3. 🎨 Theming & Styling</Text>

        <TouchableOpacity
          style={styles.testButton}
          activeOpacity={0.7}
          onPress={() =>
            runTest('Dark Mode Theme', {
              mode: 'date',
              isDarkModeEnabled: true,
              headerTextIOS: 'Forced Dark Mode',
            })
          }
        >
          <Text style={styles.testButtonText}>Force Dark Mode Theme 🌙</Text>
          <Text style={styles.testButtonSub}>
            Renders modal with dark styling
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          activeOpacity={0.7}
          onPress={() =>
            runTest('Custom Purple Accent Color', {
              mode: 'date',
              accentColorIOS: '#8A2BE2',
              buttonTextColorIOS: '#8A2BE2',
              confirmTextIOS: 'Select Purple',
              headerTextIOS: 'Custom Purple Theme',
            })
          }
        >
          <Text style={styles.testButtonText}>Custom Color Theme 💜</Text>
          <Text style={styles.testButtonSub}>
            Purple buttons and accent color
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          activeOpacity={0.7}
          onPress={() =>
            runTest('Custom Card Radius & Dark Backdrop', {
              mode: 'datetime',
              cardBorderRadius: 26,
              backdropOpacity: 0.75,
              headerTextIOS: 'Custom Border Radius 26',
            })
          }
        >
          <Text style={styles.testButtonText}>Custom Modal Dimensions 🖼️</Text>
          <Text style={styles.testButtonSub}>
            Dark backdrop (0.75) and rounded cards (26pt)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          activeOpacity={0.7}
          onPress={() =>
            runTest('Haptic Feedback ON (Vibration Enabled)', {
              mode: 'date',
              hapticFeedbackEnabled: true,
              headerTextIOS: 'Haptic Feedback ON',
            })
          }
        >
          <Text style={styles.testButtonText}>Haptic Feedback: ON 📳</Text>
          <Text style={styles.testButtonSub}>
            Physical vibration pulse when scrolling wheels (iOS)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          activeOpacity={0.7}
          onPress={() =>
            runTest('Haptic Feedback OFF (Silent Mode)', {
              mode: 'date',
              hapticFeedbackEnabled: false,
              headerTextIOS: 'Haptic Feedback OFF',
            })
          }
        >
          <Text style={styles.testButtonText}>Haptic Feedback: OFF 🔕</Text>
          <Text style={styles.testButtonSub}>
            Disables physical vibration when scrolling wheels
          </Text>
        </TouchableOpacity>

        {/* 4. Localization */}
        <Text style={styles.sectionTitle}>4. 🌍 Localization & Language</Text>

        <TouchableOpacity
          style={styles.testButton}
          activeOpacity={0.7}
          onPress={() =>
            runTest('French Locale (fr_FR)', {
              mode: 'date',
              locale: 'fr_FR',
              confirmTextIOS: 'Confirmer',
              cancelTextIOS: 'Annuler',
              headerTextIOS: 'Calendrier Français',
            })
          }
        >
          <Text style={styles.testButtonText}>French Locale (fr_FR) 🇫🇷</Text>
          <Text style={styles.testButtonSub}>
            French month names and button labels
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          activeOpacity={0.7}
          onPress={() =>
            runTest('Spanish Locale (es_ES)', {
              mode: 'date',
              locale: 'es_ES',
              confirmTextIOS: 'Confirmar',
              cancelTextIOS: 'Cancelar',
              headerTextIOS: 'Calendario Español',
            })
          }
        >
          <Text style={styles.testButtonText}>Spanish Locale (es_ES) 🇪🇸</Text>
          <Text style={styles.testButtonSub}>
            Spanish days and month presentation
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          activeOpacity={0.7}
          onPress={() =>
            runTest('Hindi / Indian Locale (hi_IN)', {
              mode: 'date',
              locale: 'hi_IN',
              confirmTextIOS: 'पुष्टि करें',
              cancelTextIOS: 'रद्द करें',
              headerTextIOS: 'दिनांक चुनें',
            })
          }
        >
          <Text style={styles.testButtonText}>Hindi Locale (hi_IN) 🇮🇳</Text>
          <Text style={styles.testButtonSub}>
            Indian locale and regional calendar format
          </Text>
        </TouchableOpacity>

        {/* 5. Programmatic APIs */}
        <Text style={styles.sectionTitle}>5. ⚡ Programmatic APIs</Text>

        <TouchableOpacity
          style={styles.testButton}
          activeOpacity={0.7}
          onPress={handleHookTest}
        >
          <Text style={styles.testButtonText}>Test useDateTimePicker Hook</Text>
          <Text style={styles.testButtonSub}>
            Zero-state custom hook wrapper
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          activeOpacity={0.7}
          onPress={runAsyncTest}
        >
          <Text style={styles.testButtonText}>
            Test openDateTimePickerModal() Promise
          </Text>
          <Text style={styles.testButtonSub}>
            Direct async/await modal execution
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          activeOpacity={0.7}
          onPress={() => {
            setCurrentTestName('Imperative Ref pickerRef.current.open()');
            setLastAction('Ref modal opened');
            imperativePickerRef.current?.open();
          }}
        >
          <Text style={styles.testButtonText}>
            Test Imperative Ref Controller
          </Text>
          <Text style={styles.testButtonSub}>
            Programmatic ref.current.open() control
          </Text>
        </TouchableOpacity>

        {/* 6. Concurrency Safety */}
        <Text style={styles.sectionTitle}>6. 🛡️ Concurrency Guard</Text>

        <TouchableOpacity
          style={styles.testButton}
          activeOpacity={0.7}
          onPress={() => {
            runTest('Rapid Double-Tap Concurrency Test', {
              mode: 'date',
              headerTextIOS: 'Concurrency Guard Active',
            });
            setTimeout(() => {
              runTest('Second rapid trigger', { mode: 'date' });
            }, 50);
          }}
        >
          <Text style={styles.testButtonText}>
            Rapid Double-Tap Stress Test
          </Text>
          <Text style={styles.testButtonSub}>
            Verifies concurrency guard prevents duplicates
          </Text>
        </TouchableOpacity>

        <View style={styles.footerSpacing} />
      </ScrollView>

      {/* Main Test Modal */}
      <DateTimePickerModal
        isVisible={isVisible}
        mode={pickerConfig.mode ?? 'date'}
        display={pickerConfig.display}
        is24Hour={pickerConfig.is24Hour}
        minuteInterval={pickerConfig.minuteInterval}
        minimumDate={pickerConfig.minimumDate}
        maximumDate={pickerConfig.maximumDate}
        isDarkModeEnabled={pickerConfig.isDarkModeEnabled}
        accentColorIOS={pickerConfig.accentColorIOS}
        buttonTextColorIOS={pickerConfig.buttonTextColorIOS}
        confirmTextIOS={pickerConfig.confirmTextIOS}
        cancelTextIOS={pickerConfig.cancelTextIOS}
        headerTextIOS={pickerConfig.headerTextIOS}
        title={pickerConfig.title}
        backdropOpacity={pickerConfig.backdropOpacity}
        cardBorderRadius={pickerConfig.cardBorderRadius}
        hapticFeedbackEnabled={pickerConfig.hapticFeedbackEnabled}
        locale={pickerConfig.locale}
        timeZoneOffsetInMinutes={pickerConfig.timeZoneOffsetInMinutes}
        onConfirm={(date) =>
          handlePicked(currentTestName, date, 'Confirmed successfully')
        }
        onCancel={() => {
          setIsVisible(false);
          setLastAction('Picker cancelled by user');
          console.log(`[TEST: ${currentTestName}] Cancelled`);
        }}
        onHide={(confirmed, date) => {
          if (!confirmed) {
            setLastAction('Modal dismissed / hidden');
          }
          console.log(`[TEST: ${currentTestName}] onHide:`, confirmed, date);
        }}
        onError={(err) => {
          setIsVisible(false);
          setLastAction(`Error: ${err.message}`);
          Alert.alert('Picker Error', err.message);
        }}
      />

      {/* Hook Picker Modal */}
      <DateTimePicker
        ref={hookPicker.ref}
        mode="date"
        headerTextIOS="useDateTimePicker Hook"
        onConfirm={(date) =>
          handlePicked('useDateTimePicker Hook', date, 'Confirmed via Hook')
        }
        onCancel={() => setLastAction('Hook Picker Cancelled')}
      />

      {/* Ref-controlled Picker Component */}
      <DateTimePicker
        ref={imperativePickerRef}
        mode="datetime"
        headerTextIOS="Imperative Ref Picker"
        onConfirm={(date) =>
          handlePicked('Imperative Ref', date, 'Confirmed via Ref')
        }
        onCancel={() => setLastAction('Ref Picker Cancelled')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  badge: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  badgeActive: {
    backgroundColor: '#ECFDF5',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  badgeTextActive: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  consoleCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  consoleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 8,
  },
  consoleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearText: {
    fontSize: 13,
    color: '#38BDF8',
    fontWeight: '600',
  },
  consoleRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'baseline',
  },
  consoleLabel: {
    width: 105,
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  consoleValueHighlight: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#FDE047',
  },
  consoleValue: {
    flex: 1,
    fontSize: 13,
    color: '#E2E8F0',
  },
  consoleValueDate: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#4ADE80',
  },
  consoleValueMono: {
    flex: 1,
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginTop: 10,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  testButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  testButtonSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  footerSpacing: {
    height: 40,
  },
});
