export interface TimeSlot {
  id: string;
  startTime: string; // "09:00"
  endTime: string; // "09:30"
  formattedStart: string; // "9:00 AM" or "09:00"
  formattedEnd: string; // "9:30 AM" or "09:30"
  available: boolean;
  label?: string;
}

export interface GenerateTimeSlotsOptions {
  startTime?: string; // "HH:mm", defaults to "09:00"
  endTime?: string; // "HH:mm", defaults to "18:00"
  intervalMinutes?: number; // defaults to 30
  disabledSlots?: string[]; // IDs or start times like ["12:00", "13:00"]
  is24Hour?: boolean;
}

function parseTimeToMinutes(timeStr: string): number {
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr || '0', 10);
  const m = parseInt(mStr || '0', 10);
  return h * 60 + m;
}

function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(h)}:${pad(m)}`;
}

function formatMinutesDisplay(minutes: number, is24Hour: boolean): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  if (is24Hour) {
    return `${pad(h)}:${pad(m)}`;
  }

  const h12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h12}:${pad(m)} ${ampm}`;
}

export function generateTimeSlots(
  options: GenerateTimeSlotsOptions = {}
): TimeSlot[] {
  const {
    startTime = '09:00',
    endTime = '18:00',
    intervalMinutes = 30,
    disabledSlots = [],
    is24Hour = false,
  } = options;

  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);

  if (startMin >= endMin || intervalMinutes <= 0) {
    return [];
  }

  const slots: TimeSlot[] = [];
  const disabledSet = new Set(disabledSlots);

  let current = startMin;
  while (current + intervalMinutes <= endMin) {
    const slotStartStr = minutesToTimeString(current);
    const slotEndStr = minutesToTimeString(current + intervalMinutes);
    const id = slotStartStr;

    const isAvailable = !disabledSet.has(id) && !disabledSet.has(slotStartStr);

    slots.push({
      id,
      startTime: slotStartStr,
      endTime: slotEndStr,
      formattedStart: formatMinutesDisplay(current, is24Hour),
      formattedEnd: formatMinutesDisplay(current + intervalMinutes, is24Hour),
      available: isAvailable,
    });

    current += intervalMinutes;
  }

  return slots;
}
