import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number) {
  return `${amount.toLocaleString("fr-MA")} MAD`;
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("fr-MA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function generatePublicUrl(token: string) {
  return `/c/${token}`;
}
