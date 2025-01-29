import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { FloristFormData } from "@/pages/BecomeFlorist"

interface OperatingHoursFormProps {
  formData: FloristFormData
  setFormData: (data: FloristFormData) => void
  onNext: () => void
  onBack: () => void
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = i % 2 === 0 ? '00' : '30'
  return `${hour.toString().padStart(2, '0')}:${minute}`
})

export function OperatingHoursForm({ formData, setFormData, onNext, onBack }: OperatingHoursFormProps) {
  const handleHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: any) => {
    setFormData({
      ...formData,
      operating_hours: {
        ...formData.operating_hours,
        [day]: {
          ...formData.operating_hours?.[day],
          [field]: value
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-medium mb-4">Operating Hours</h3>
        
        {DAYS.map(day => (
          <div key={day} className="grid grid-cols-4 gap-4 items-center mb-4">
            <div className="capitalize">{day}</div>
            
            <Switch
              checked={!formData.operating_hours?.[day]?.closed}
              onCheckedChange={(checked) => handleHoursChange(day, 'closed', !checked)}
            />
            
            {!formData.operating_hours?.[day]?.closed && (
              <>
                <Select
                  value={formData.operating_hours?.[day]?.open || '09:00'}
                  onValueChange={(value) => handleHoursChange(day, 'open', value)}
                >
                  {TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </Select>

                <Select
                  value={formData.operating_hours?.[day]?.close || '17:00'}
                  onValueChange={(value) => handleHoursChange(day, 'close', value)}
                >
                  {TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </Select>
              </>
            )}
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-medium mb-4">Delivery Hours</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Start Time</label>
            <Select
              value={formData.delivery_start_time}
              onValueChange={(value) => setFormData({
                ...formData,
                delivery_start_time: value
              })}
            >
              {TIME_OPTIONS.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </Select>
          </div>

          <div>
            <label>End Time</label>
            <Select
              value={formData.delivery_end_time}
              onValueChange={(value) => setFormData({
                ...formData,
                delivery_end_time: value
              })}
            >
              {TIME_OPTIONS.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">Back</Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  )
}