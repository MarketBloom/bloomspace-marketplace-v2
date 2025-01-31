declare module "@/lib/utils" {
  import { type ClassValue } from "clsx";
  
  export function cn(...inputs: ClassValue[]): string;
  export function formatPrice(price: number): string;
  export function formatDate(date: string | Date, formatString?: string): string;
  export function formatCurrency(amount: number | null | undefined): string;
  export function formatTime(time: string): string;
  export function formatPhoneNumber(phone: string): string;
  export function formatDistance(meters: number): string;
  export function formatAddressLine(address: {
    streetNumber?: string | null;
    streetName?: string | null;
    unitNumber?: string | null;
    suburb?: string | null;
    state?: string | null;
    postcode?: string | null;
  }): string;
  export function formatAddress(parts: string[]): string;
}

declare module "@/utils/format" {
  export function formatPrice(price: number): string;
  export function formatDate(date: string | Date, formatString?: string): string;
  export function formatCurrency(amount: number | null | undefined): string;
  export function formatTime(time: string): string;
  export function formatPhoneNumber(phone: string): string;
  export function formatDistance(meters: number): string;
  export function formatAddressLine(address: {
    streetNumber?: string | null;
    streetName?: string | null;
    unitNumber?: string | null;
    suburb?: string | null;
    state?: string | null;
    postcode?: string | null;
  }): string;
  export function formatAddress(parts: string[]): string;
} 