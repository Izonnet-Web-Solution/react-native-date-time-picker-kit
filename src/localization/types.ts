export interface LocaleData {
  code: string;
  isRTL: boolean;
  firstDayOfWeek: number; // 0 = Sunday, 1 = Monday
  months: string[]; // 12 full month names
  monthsShort: string[]; // 12 short month names
  weekdays: string[]; // 7 full weekday names (Sun-Sat)
  weekdaysShort: string[]; // 7 short weekday names (Sun-Sat)
  weekdaysMin: string[]; // 7 min weekday names (e.g. S, M, T or Su, Mo)
  am: string;
  pm: string;
  confirmText: string;
  cancelText: string;
  todayText: string;
  selectDateTitle: string;
  selectTimeTitle: string;
  selectDateTimeTitle: string;
  selectRangeTitle: string;
}

export type PartialLocaleData = Partial<LocaleData> & { code?: string };
