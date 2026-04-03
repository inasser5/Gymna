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
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return days[(dayNumber - 1) % 7] ?? `Day ${dayNumber}`;
}

export function getMonthName(month: number): string {
  return new Date(2000, month - 1).toLocaleString("default", { month: "long" });
}
