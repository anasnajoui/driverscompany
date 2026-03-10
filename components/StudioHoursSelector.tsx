import React from 'react';
import { Checkbox } from './ui/checkbox';
import { StructuredHours, DaySchedule } from '../src/types/storage';

// Re-export types for convenience
export type { StructuredHours, DaySchedule };

interface StudioHoursSelectorProps {
  value: StructuredHours;
  onChange: (hours: StructuredHours) => void;
  error?: string;
}

const DAYS: Array<{ key: keyof StructuredHours; label: string; abbrev: string }> = [
  { key: 'lunedi', label: 'Lunedì', abbrev: 'Lun' },
  { key: 'martedi', label: 'Martedì', abbrev: 'Mar' },
  { key: 'mercoledi', label: 'Mercoledì', abbrev: 'Mer' },
  { key: 'giovedi', label: 'Giovedì', abbrev: 'Gio' },
  { key: 'venerdi', label: 'Venerdì', abbrev: 'Ven' },
  { key: 'sabato', label: 'Sabato', abbrev: 'Sab' },
  { key: 'domenica', label: 'Domenica', abbrev: 'Dom' },
];

// Generate 30-minute intervals from 06:00 to 22:00
const TIME_OPTIONS: string[] = [];
for (let h = 6; h <= 22; h++) {
  TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:00`);
  if (h < 22) {
    TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:30`);
  }
}

export const defaultStructuredHours: StructuredHours = {
  lunedi: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  martedi: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  mercoledi: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  giovedi: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  venerdi: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  sabato: { isOpen: false, openTime: '09:00', closeTime: '13:00' },
  domenica: { isOpen: false, openTime: '09:00', closeTime: '13:00' },
};

/**
 * Serialize structured hours into a readable Italian string.
 * Groups consecutive days with the same schedule.
 * Example: "Lun-Ven 09:00-18:00, Sab 09:00-13:00"
 */
export function serializeHours(hours: StructuredHours): string {
  // Build list of open days with their schedules
  const openDays: Array<{ abbrev: string; openTime: string; closeTime: string }> = [];
  for (const day of DAYS) {
    const schedule = hours[day.key];
    if (schedule.isOpen) {
      openDays.push({
        abbrev: day.abbrev,
        openTime: schedule.openTime,
        closeTime: schedule.closeTime,
      });
    }
  }

  if (openDays.length === 0) {
    return 'Sempre chiuso';
  }

  // Group consecutive days with same hours
  const groups: Array<{ abbrevs: string[]; openTime: string; closeTime: string }> = [];
  for (const day of openDays) {
    const lastGroup = groups[groups.length - 1];
    if (
      lastGroup &&
      lastGroup.openTime === day.openTime &&
      lastGroup.closeTime === day.closeTime
    ) {
      lastGroup.abbrevs.push(day.abbrev);
    } else {
      groups.push({
        abbrevs: [day.abbrev],
        openTime: day.openTime,
        closeTime: day.closeTime,
      });
    }
  }

  // Format each group
  return groups
    .map((group) => {
      const dayRange =
        group.abbrevs.length > 2
          ? `${group.abbrevs[0]}-${group.abbrevs[group.abbrevs.length - 1]}`
          : group.abbrevs.join(', ');
      return `${dayRange} ${group.openTime}-${group.closeTime}`;
    })
    .join(', ');
}

export const StudioHoursSelector: React.FC<StudioHoursSelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  const handleToggleDay = (dayKey: keyof StructuredHours, checked: boolean) => {
    onChange({
      ...value,
      [dayKey]: { ...value[dayKey], isOpen: checked },
    });
  };

  const handleTimeChange = (
    dayKey: keyof StructuredHours,
    field: 'openTime' | 'closeTime',
    newTime: string
  ) => {
    onChange({
      ...value,
      [dayKey]: { ...value[dayKey], [field]: newTime },
    });
  };

  const selectClassName = (disabled: boolean) =>
    `text-sm sm:text-base px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200 bg-white ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    }`;

  return (
    <div className="space-y-3">
      {DAYS.map((day) => {
        const schedule = value[day.key];
        return (
          <div
            key={day.key}
            className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border transition-all duration-200 ${
              error
                ? 'border-red-300'
                : schedule.isOpen
                  ? 'border-gray-200 bg-white'
                  : 'border-gray-200 bg-gray-50'
            }`}
          >
            <Checkbox
              checked={schedule.isOpen}
              onCheckedChange={(checked) =>
                handleToggleDay(day.key, checked === true)
              }
              className="h-5 w-5"
            />

            <span className="font-semibold text-gray-800 w-20 sm:w-24 text-sm sm:text-base">
              {day.label}
            </span>

            {schedule.isOpen ? (
              <div className="flex items-center gap-2">
                <select
                  value={schedule.openTime}
                  onChange={(e) =>
                    handleTimeChange(day.key, 'openTime', e.target.value)
                  }
                  className={selectClassName(false)}
                >
                  {TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>

                <span className="text-gray-400 font-medium">–</span>

                <select
                  value={schedule.closeTime}
                  onChange={(e) =>
                    handleTimeChange(day.key, 'closeTime', e.target.value)
                  }
                  className={selectClassName(false)}
                >
                  {TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <span className="text-gray-400 italic">Chiuso</span>
            )}
          </div>
        );
      })}

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};
