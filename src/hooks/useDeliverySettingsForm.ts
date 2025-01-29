import { useState, useCallback } from 'react';
import { BusinessSettings } from '../types/database';

interface UseDeliverySettingsFormProps {
  initialData?: Partial<BusinessSettings>;
  onSubmit: (data: BusinessSettings) => Promise<void>;
}

export function useDeliverySettingsForm({ initialData, onSubmit }: UseDeliverySettingsFormProps) {
  const [formData, setFormData] = useState<BusinessSettings>(() => ({
    delivery: {
      radius_km: initialData?.delivery?.radius_km ?? 5,
      fee: initialData?.delivery?.fee ?? 0,
      minimum_order: initialData?.delivery?.minimum_order ?? 0,
      same_day_cutoff: initialData?.delivery?.same_day_cutoff ?? {
        default: "14:00",
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null,
        sunday: null,
      },
      next_day_cutoff_enabled: initialData?.delivery?.next_day_cutoff_enabled ?? false,
      next_day_cutoff: initialData?.delivery?.next_day_cutoff ?? {
        default: "18:00",
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null,
        sunday: null,
      },
      special_events: initialData?.delivery?.special_events ?? {
        valentines_day: {
          enabled: false,
          cutoff_time: "12:00",
          delivery_fee_multiplier: 1.5,
          minimum_order_multiplier: 1.2,
        },
        mothers_day: {
          enabled: false,
          cutoff_time: "12:00",
          delivery_fee_multiplier: 1.5,
          minimum_order_multiplier: 1.2,
        },
      },
    },
    hours: initialData?.hours ?? {
      monday: { open: "09:00", close: "17:00", closed: false },
      tuesday: { open: "09:00", close: "17:00", closed: false },
      wednesday: { open: "09:00", close: "17:00", closed: false },
      thursday: { open: "09:00", close: "17:00", closed: false },
      friday: { open: "09:00", close: "17:00", closed: false },
      saturday: { open: "09:00", close: "17:00", closed: false },
      sunday: { open: "09:00", close: "17:00", closed: true },
    },
    delivery_slots: initialData?.delivery_slots ?? {
      weekdays: {
        slots: [
          { name: "morning", start: "09:00", end: "12:00", enabled: true, max_orders: 10, premium_fee: 0 },
          { name: "afternoon", start: "12:00", end: "15:00", enabled: true, max_orders: 10, premium_fee: 0 },
          { name: "evening", start: "15:00", end: "18:00", enabled: true, max_orders: 10, premium_fee: 0 },
        ],
      },
      weekends: {
        slots: [
          { name: "morning", start: "09:00", end: "12:00", enabled: true, max_orders: 8, premium_fee: 5 },
          { name: "afternoon", start: "12:00", end: "15:00", enabled: true, max_orders: 8, premium_fee: 5 },
          { name: "evening", start: "15:00", end: "18:00", enabled: true, max_orders: 8, premium_fee: 5 },
        ],
      },
      special_events: {
        valentines_day: {
          slots: [
            { name: "early_morning", start: "07:00", end: "10:00", enabled: true, max_orders: 5, premium_fee: 15 },
            { name: "morning", start: "10:00", end: "13:00", enabled: true, max_orders: 8, premium_fee: 10 },
            { name: "afternoon", start: "13:00", end: "16:00", enabled: true, max_orders: 8, premium_fee: 10 },
          ],
        },
        mothers_day: {
          slots: [
            { name: "early_morning", start: "07:00", end: "10:00", enabled: true, max_orders: 5, premium_fee: 15 },
            { name: "morning", start: "10:00", end: "13:00", enabled: true, max_orders: 8, premium_fee: 10 },
            { name: "afternoon", start: "13:00", end: "16:00", enabled: true, max_orders: 8, premium_fee: 10 },
          ],
        },
      },
    },
  }));

  const handleBasicSettingsChange = useCallback((field: keyof BusinessSettings['delivery'], value: any) => {
    setFormData(prev => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        [field]: value,
      },
    }));
  }, []);

  const handleSpecialEventChange = useCallback((event: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      delivery: {
        ...prev.delivery,
        special_events: {
          ...prev.delivery.special_events,
          [event]: {
            ...prev.delivery.special_events[event as keyof typeof prev.delivery.special_events],
            [field]: value,
          },
        },
      },
    }));
  }, []);

  const handleDeliverySlotChange = useCallback((
    type: 'weekdays' | 'weekends' | 'special_events',
    event: string | null,
    slotIndex: number,
    field: string,
    value: any
  ) => {
    setFormData(prev => {
      if (type === 'special_events' && event) {
        return {
          ...prev,
          delivery_slots: {
            ...prev.delivery_slots,
            special_events: {
              ...prev.delivery_slots.special_events,
              [event]: {
                ...prev.delivery_slots.special_events[event as keyof typeof prev.delivery_slots.special_events],
                slots: prev.delivery_slots.special_events[event as keyof typeof prev.delivery_slots.special_events].slots.map(
                  (slot, idx) => (idx === slotIndex ? { ...slot, [field]: value } : slot)
                ),
              },
            },
          },
        };
      }

      if (type === 'weekdays' || type === 'weekends') {
        return {
          ...prev,
          delivery_slots: {
            ...prev.delivery_slots,
            [type]: {
              ...prev.delivery_slots[type],
              slots: prev.delivery_slots[type].slots.map(
                (slot, idx) => (idx === slotIndex ? { ...slot, [field]: value } : slot)
              ),
            },
          },
        };
      }

      return prev;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to save delivery settings:', error);
      throw error;
    }
  }, [formData, onSubmit]);

  return {
    formData,
    handleBasicSettingsChange,
    handleSpecialEventChange,
    handleDeliverySlotChange,
    handleSubmit,
  };
} 