import { calculateRoadDistance } from './distance';
import { Coordinates } from '../types/google-maps';
import { BusinessSettings } from '../types/database';

const SPECIAL_EVENT_DATES = {
  valentines_day: { month: 2, day: 14 },
  mothers_day: { month: 5, day: 14 }, // Second Sunday in May
};

const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export interface DeliveryLocation {
  coordinates: Coordinates;
  address: string;
}

export interface DeliveryTimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface DeliverySettings {
  radius: number;  // in kilometers
  minimumOrder: number;
  timeSlots: DeliveryTimeSlot[];
  blackoutDates?: Date[];
}

export interface DeliveryCheckParams {
  customerLocation: Coordinates;
  floristLocation: Coordinates;
  deliverySettings: DeliverySettings;
  orderAmount?: number;
  requestedDate?: Date;
}

export interface DeliveryAvailabilityResult {
  isAvailable: boolean;
  distance: number;
  estimatedDuration: number;
}

export interface BusinessDeliveryCheckParams {
  floristLocation: Coordinates;
  customerLocation: Coordinates;
  deliveryDate: Date;
  deliveryTime?: string;
  businessSettings: BusinessSettings;
}

export interface BusinessDeliveryCheckResult {
  canDeliver: boolean;
  reason?: string;
  estimatedDistance?: number;
  availableSlots?: string[];
  premiumFee?: number;
}

function getSpecialEvent(date: Date): keyof typeof SPECIAL_EVENT_DATES | null {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const [event, eventDate] of Object.entries(SPECIAL_EVENT_DATES)) {
    if (eventDate.month === month && eventDate.day === day) {
      return event as keyof typeof SPECIAL_EVENT_DATES;
    }
  }

  return null;
}

function checkSpecialEventDelivery(
  event: keyof typeof SPECIAL_EVENT_DATES,
  settings: BusinessSettings,
  date: Date,
  time?: string,
  distance?: number
): BusinessDeliveryCheckResult {
  const eventSettings = settings.delivery.special_events[event];
  if (!eventSettings.enabled) {
    return {
      canDeliver: false,
      reason: `Not accepting orders for ${event}`,
    };
  }

  // Check cutoff time
  const now = new Date();
  const [cutoffHour, cutoffMin] = eventSettings.cutoff_time.split(':').map(Number);
  const cutoffTime = new Date(date);
  cutoffTime.setHours(cutoffHour, cutoffMin);

  if (now > cutoffTime) {
    return {
      canDeliver: false,
      reason: `Past cutoff time for ${event} (${eventSettings.cutoff_time})`,
    };
  }

  const slots = settings.delivery_slots.special_events[event].slots;
  const availableSlots = slots.filter(slot => slot.enabled);

  if (availableSlots.length === 0) {
    return {
      canDeliver: false,
      reason: `No delivery slots available for ${event}`,
    };
  }

  if (time) {
    const slot = availableSlots.find(s => isTimeInSlot(time, s.start, s.end));
    if (!slot) {
      return {
        canDeliver: false,
        reason: 'Selected time is not in any available delivery slot',
        availableSlots: availableSlots.map(s => `${s.start}-${s.end}`),
      };
    }

    return {
      canDeliver: true,
      estimatedDistance: distance,
      premiumFee: slot.premium_fee,
    };
  }

  return {
    canDeliver: true,
    estimatedDistance: distance,
    availableSlots: availableSlots.map(s => `${s.start}-${s.end}`),
  };
}

/**
 * Convert time string to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Check if a time is within a time slot
 */
export function isWithinTimeSlot(time: string, start: string, end: string): boolean {
  const timeMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
}

export async function isDeliveryAvailable({
  customerLocation,
  floristLocation,
  deliverySettings,
  orderAmount,
  requestedDate
}: DeliveryCheckParams): Promise<DeliveryAvailabilityResult> {
  try {
    // Check if within delivery radius
    const distanceResult = await calculateRoadDistance(customerLocation, floristLocation);
    const distanceInKm = distanceResult.distance;
    const estimatedDuration = distanceResult.duration;
    
    const isWithinRange = distanceInKm <= deliverySettings.radius;

    if (!isWithinRange) {
      return {
        isAvailable: false,
        distance: distanceInKm,
        estimatedDuration
      };
    }

    // Check minimum order amount if specified
    if (orderAmount !== undefined && orderAmount < deliverySettings.minimumOrder) {
      return {
        isAvailable: false,
        distance: distanceInKm,
        estimatedDuration
      };
    }

    // Check if requested date is not in blackout dates
    if (requestedDate && deliverySettings.blackoutDates) {
      const isBlackoutDate = deliverySettings.blackoutDates.some(date => 
        date.toDateString() === requestedDate.toDateString()
      );
      if (isBlackoutDate) {
        return {
          isAvailable: false,
          distance: distanceInKm,
          estimatedDuration
        };
      }
    }

    return {
      isAvailable: true,
      distance: distanceInKm,
      estimatedDuration
    };
  } catch (error) {
    console.error('Error checking delivery availability:', error);
    return {
      isAvailable: false,
      distance: 0,
      estimatedDuration: 0
    };
  }
}

export async function checkBusinessDeliveryAvailability({
  floristLocation,
  customerLocation,
  deliveryDate,
  deliveryTime,
  businessSettings,
}: BusinessDeliveryCheckParams): Promise<BusinessDeliveryCheckResult> {
  // Check if within delivery radius
  const distanceResult = await calculateRoadDistance(floristLocation, customerLocation);
  const distanceInKm = distanceResult.distance;
  const isWithinRange = distanceInKm <= businessSettings.delivery.radius_km;

  if (!isWithinRange) {
    return {
      canDeliver: false,
      reason: `Outside delivery radius (${Math.round(distanceInKm)}km)`,
      estimatedDistance: distanceInKm,
    };
  }

  const dayOfWeek = DAYS_OF_WEEK[deliveryDate.getDay()];
  const isWeekend = dayOfWeek === 'saturday' || dayOfWeek === 'sunday';

  // Check business hours
  const businessHours = businessSettings.hours[dayOfWeek];
  if (businessHours.closed) {
    return {
      canDeliver: false,
      reason: `We are closed on ${dayOfWeek}`,
    };
  }

  // Check if it's a special event
  const specialEvent = getSpecialEvent(deliveryDate);
  if (specialEvent) {
    return checkSpecialEventDelivery(
      specialEvent,
      businessSettings,
      deliveryDate,
      deliveryTime,
      distanceInKm
    );
  }

  // Check if same day delivery
  const isSameDay = isSameDayDelivery(deliveryDate);
  if (isSameDay) {
    const cutoffResult = checkSameDayCutoff(businessSettings, dayOfWeek);
    if (!cutoffResult.canDeliver) {
      return cutoffResult;
    }
  }

  // Check if next day delivery
  const isNextDay = isNextDayDelivery(deliveryDate);
  if (isNextDay && businessSettings.delivery.next_day_cutoff_enabled) {
    const cutoffResult = checkNextDayCutoff(businessSettings, dayOfWeek);
    if (!cutoffResult.canDeliver) {
      return cutoffResult;
    }
  }

  // Get available slots
  const slots = isWeekend 
    ? businessSettings.delivery_slots.weekends.slots 
    : businessSettings.delivery_slots.weekdays.slots;

  // Filter slots based on current time for same day delivery
  const availableSlots = slots.filter(slot => {
    if (!slot.enabled) return false;
    if (isSameDay) {
      const [slotHour, slotMin] = slot.start.split(':').map(Number);
      const slotTime = new Date(deliveryDate);
      slotTime.setHours(slotHour, slotMin);
      return slotTime > new Date();
    }
    return true;
  });

  if (availableSlots.length === 0) {
    return {
      canDeliver: false,
      reason: 'No delivery slots available for the selected date',
    };
  }

  // If delivery time is specified, check if it's in an available slot
  if (deliveryTime) {
    const slot = availableSlots.find(s => isTimeInSlot(deliveryTime, s.start, s.end));
    if (!slot) {
      return {
        canDeliver: false,
        reason: 'Selected time is not in any available delivery slot',
        availableSlots: availableSlots.map(s => `${s.start}-${s.end}`),
      };
    }

    return {
      canDeliver: true,
      estimatedDistance: distanceInKm,
      premiumFee: slot.premium_fee,
    };
  }

  return {
    canDeliver: true,
    estimatedDistance: distanceInKm,
    availableSlots: availableSlots.map(s => `${s.start}-${s.end}`),
  };
}

function checkSameDayCutoff(settings: BusinessSettings, dayOfWeek: string): BusinessDeliveryCheckResult {
  const cutoffTime = settings.delivery.same_day_cutoff[dayOfWeek] || 
                    settings.delivery.same_day_cutoff.default;
  
  const now = new Date();
  const [cutoffHour, cutoffMin] = cutoffTime.split(':').map(Number);
  const cutoff = new Date();
  cutoff.setHours(cutoffHour, cutoffMin);

  if (now > cutoff) {
    return {
      canDeliver: false,
      reason: `Past same-day delivery cutoff (${cutoffTime})`,
    };
  }

  return { canDeliver: true };
}

function checkNextDayCutoff(settings: BusinessSettings, dayOfWeek: string): BusinessDeliveryCheckResult {
  const cutoffTime = settings.delivery.next_day_cutoff[dayOfWeek] || 
                    settings.delivery.next_day_cutoff.default;
  
  const now = new Date();
  const [cutoffHour, cutoffMin] = cutoffTime.split(':').map(Number);
  const cutoff = new Date();
  cutoff.setHours(cutoffHour, cutoffMin);

  if (now > cutoff) {
    return {
      canDeliver: false,
      reason: `Past next-day delivery cutoff (${cutoffTime})`,
    };
  }

  return { canDeliver: true };
}

function isSameDayDelivery(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isNextDayDelivery(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
}

function isTimeInSlot(time: string, start: string, end: string): boolean {
  const [timeHour, timeMin] = time.split(':').map(Number);
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);

  const timeMinutes = timeHour * 60 + timeMin;
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
}

// Helper function to calculate estimated delivery time based on distance
export function estimateDeliveryTime(distanceInKm: number): number {
  // Base time in minutes
  const baseTime = 30;
  // Additional time per km (assuming average speed of 30km/h in city traffic)
  const timePerKm = 2;
  
  return baseTime + (distanceInKm * timePerKm);
} 