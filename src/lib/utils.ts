import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatPrice, formatDate, formatCurrency, formatTime, formatPhoneNumber, formatDistance, formatAddressLine, formatAddress } from "@/utils/format";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export {
  formatPrice,
  formatDate,
  formatCurrency,
  formatTime,
  formatPhoneNumber,
  formatDistance,
  formatAddressLine,
  formatAddress,
};
