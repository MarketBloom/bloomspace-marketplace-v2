/**
 * Format a number as currency in AUD
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date to a human-readable string
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Format a time to 12-hour format
 * @param time - Time string in 24-hour format (HH:mm)
 * @returns Formatted time string in 12-hour format
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format a phone number to Australian format
 * @param phone - Phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a mobile number (starts with 04)
  if (cleaned.startsWith('04')) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  // Otherwise format as landline
  return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2 $3');
}

/**
 * Format a distance in kilometers
 * @param km - Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

/**
 * Format address components into a single line
 * @param address - Address components
 * @returns Formatted address string
 */
export function formatAddressLine({
  streetNumber,
  streetName,
  unitNumber,
  suburb,
  state,
  postcode,
}: {
  streetNumber?: string | null;
  streetName?: string | null;
  unitNumber?: string | null;
  suburb?: string | null;
  state?: string | null;
  postcode?: string | null;
}): string {
  const parts: string[] = [];

  // Add unit number if present
  if (unitNumber) {
    parts.push(`${unitNumber}/`);
  }

  // Add street address
  if (streetNumber && streetName) {
    parts.push(`${streetNumber} ${streetName}`);
  }

  // Add suburb
  if (suburb) {
    parts.push(suburb);
  }

  // Add state and postcode
  if (state || postcode) {
    const statePostcode = [state, postcode].filter(Boolean).join(' ');
    if (statePostcode) {
      parts.push(statePostcode);
    }
  }

  return parts.join(', ');
}
