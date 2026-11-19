export interface DatePreset {
  id: string;
  label: string;
  getValue: () => [Date, Date] | Date;
}

export function getStandardRangePresets(
  today: Date = new Date()
): DatePreset[] {
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const endOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  return [
    {
      id: 'today',
      label: 'Today',
      getValue: () => [startOfDay(today), endOfDay(today)],
    },
    {
      id: 'yesterday',
      label: 'Yesterday',
      getValue: () => {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        return [startOfDay(y), endOfDay(y)];
      },
    },
    {
      id: 'last7days',
      label: 'Last 7 Days',
      getValue: () => {
        const past = new Date(today);
        past.setDate(past.getDate() - 6);
        return [startOfDay(past), endOfDay(today)];
      },
    },
    {
      id: 'last30days',
      label: 'Last 30 Days',
      getValue: () => {
        const past = new Date(today);
        past.setDate(past.getDate() - 29);
        return [startOfDay(past), endOfDay(today)];
      },
    },
    {
      id: 'thisMonth',
      label: 'This Month',
      getValue: () => {
        const first = new Date(today.getFullYear(), today.getMonth(), 1);
        const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return [startOfDay(first), endOfDay(last)];
      },
    },
    {
      id: 'nextMonth',
      label: 'Next Month',
      getValue: () => {
        const first = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const last = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        return [startOfDay(first), endOfDay(last)];
      },
    },
  ];
}

export function getStandardSinglePresets(
  today: Date = new Date()
): DatePreset[] {
  return [
    {
      id: 'today',
      label: 'Today',
      getValue: () => new Date(today),
    },
    {
      id: 'tomorrow',
      label: 'Tomorrow',
      getValue: () => {
        const t = new Date(today);
        t.setDate(t.getDate() + 1);
        return t;
      },
    },
    {
      id: 'nextWeek',
      label: 'In 1 Week',
      getValue: () => {
        const w = new Date(today);
        w.setDate(w.getDate() + 7);
        return w;
      },
    },
  ];
}
