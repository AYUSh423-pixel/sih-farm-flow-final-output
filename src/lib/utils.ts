import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function pad(n: number, size = 4) {
  return String(n).padStart(size, "0");
}

export function todayIso() {
  return "2026-09-11";
}

export function parseIso(iso: string) {
  return new Date(`${iso}T00:00:00`);
}

export function formatDate(iso: string, locale = "en-IN") {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
