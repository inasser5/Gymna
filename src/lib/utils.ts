import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWeight(weight: number | null, unit: "kg" | "lbs" = "kg"): string {
  if (weight == null) return "—";
  return `${weight % 1 === 0 ? weight.toFixed(0) : weight.toFixed(1)} ${unit}`;
}

export function formatVolume(volume: number): string {
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}k kg`;
  return `${volume.toFixed(0)} kg`;
}

export function getDayName(dayNumber: number): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[(dayNumber - 1) % 7] ?? `Day ${dayNumber}`;
}

export function getMonthName(month: number): string {
  return new Date(2000, month - 1).toLocaleString("default", { month: "long" });
}

// Timezone-safe: converts local Date to YYYY-MM-DD string
export function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Formats a YYYY-MM-DD string to "Sun, May 10"
export function formatCalendarDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

// Short format: "May 10"
export function formatShortDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });
}

export interface CalendarDay {
  date: Date;
  dayNumber: number; // 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat
}

export interface CalendarWeek {
  weekNumber: number;
  startDate: Date;
  days: CalendarDay[];
}

// Generates calendar weeks (Sun–Sat) for a given month, containing only days within the month.
export function getCalendarWeeks(year: number, month: number): CalendarWeek[] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const weeks: CalendarWeek[] = [];
  let currentDate = new Date(firstDay);
  let weekNumber = 1;
  let weekDays: CalendarDay[] = [];

  while (currentDate <= lastDay) {
    const jsDay = currentDate.getDay(); // 0=Sun, 6=Sat
    weekDays.push({ date: new Date(currentDate), dayNumber: jsDay + 1 });

    if (jsDay === 6 || currentDate.getTime() === lastDay.getTime()) {
      weeks.push({ weekNumber, startDate: new Date(weekDays[0].date), days: weekDays });
      weekNumber++;
      weekDays = [];
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return weeks;
}
