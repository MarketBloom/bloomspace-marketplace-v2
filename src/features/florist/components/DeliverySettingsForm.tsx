import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeliveryDaysSection } from "./delivery-settings/DeliveryDaysSection";
import { TimeFramesSection } from "./delivery-settings/TimeFramesSection";
import { OperatingHoursSection } from "./delivery-settings/OperatingHoursSection";
import { BasicDeliverySettings } from "./delivery-settings/BasicDeliverySettings";
import { SaveChangesButton } from "./delivery-settings/SaveChangesButton";
import { UnsavedChangesAlert } from "./delivery-settings/UnsavedChangesAlert";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { FloristFormData } from '@/pages/BecomeFlorist'
import { Checkbox } from '@/components/ui/checkbox'

interface DeliverySettingsFormProps {
  formData: FloristFormData
  setFormData: (data: FloristFormData) => void
  onNext: () => void
  onBack: () => void
}

interface FormErrors {
  radius_km?: string
  fee?: string
  minimum_order?: string
  same_day_cutoff?: string
}

export function DeliverySettingsForm({ formData, setFormData, onNext, onBack }: DeliverySettingsFormProps) {
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = () => {
    const newErrors: FormErrors = {}
    const delivery = formData.business_settings.delivery

    if (delivery.radius_km < 0) {
      newErrors.radius_km = 'Delivery radius cannot be negative'
    }
    if (delivery.fee < 0) {
      newErrors.fee = 'Delivery fee cannot be negative'
    }
    if (delivery.minimum_order < 0) {
      newErrors.minimum_order = 'Minimum order cannot be negative'
    }
    if (!delivery.same_day_cutoff) {
      newErrors.same_day_cutoff = 'Please set a same-day cutoff time'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onNext()
    }
  }

  const updateDeliverySetting = (key: keyof typeof formData.business_settings.delivery, value: any) => {
    setFormData({
      ...formData,
      business_settings: {
        ...formData.business_settings,
        delivery: {
          ...formData.business_settings.delivery,
          [key]: value
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <label>Delivery Distance (km)</label>
        <Input
          type="number"
          value={formData.delivery_distance_km}
          onChange={(e) => setFormData({
            ...formData,
            delivery_distance_km: parseFloat(e.target.value)
          })}
        />
      </div>

      <div>
        <label>Delivery Fee ($)</label>
        <Input
          type="number"
          value={formData.delivery_fee}
          onChange={(e) => setFormData({
            ...formData,
            delivery_fee: parseFloat(e.target.value)
          })}
        />
      </div>

      <div>
        <label>Minimum Order Amount ($)</label>
        <Input
          type="number"
          value={formData.minimum_order_amount}
          onChange={(e) => setFormData({
            ...formData,
            minimum_order_amount: parseFloat(e.target.value)
          })}
        />
      </div>

      <div>
        <label>Delivery Time Frames</label>
        <div className="space-y-2">
          {Object.entries({
            morning: 'Morning (9am - 12pm)',
            midday: 'Midday (12pm - 3pm)',
            afternoon: 'Afternoon (3pm - 6pm)'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center">
              <Checkbox
                checked={formData.delivery_time_frames[key]}
                onCheckedChange={(checked) => setFormData({
                  ...formData,
                  delivery_time_frames: {
                    ...formData.delivery_time_frames,
                    [key]: checked
                  }
                })}
              />
              <span className="ml-2">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label>Delivery Days</label>
        <div className="space-y-2">
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
            <div key={day} className="flex items-center">
              <Checkbox
                checked={formData.delivery_days.includes(day)}
                onCheckedChange={(checked) => {
                  const newDays = checked 
                    ? [...formData.delivery_days, day]
                    : formData.delivery_days.filter(d => d !== day);
                  setFormData({
                    ...formData,
                    delivery_days: newDays
                  });
                }}
              />
              <span className="ml-2 capitalize">{day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">Back</Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}