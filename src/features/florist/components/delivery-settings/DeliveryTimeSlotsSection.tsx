import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Label } from "../../../../components/ui/label";
import { Input } from "../../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Switch } from "../../../../components/ui/switch";
import { BusinessSettings } from "../../../../types/database";

interface DeliveryTimeSlotsSectionProps {
  formData: {
    delivery_slots: BusinessSettings['delivery_slots'];
  };
  onChange: (type: 'weekdays' | 'weekends', slotIndex: number, field: string, value: any) => void;
}

const generateTimeOptions = () => {
  const times = [];
  for (let hour = 6; hour < 22; hour++) {
    for (let minute of ['00', '30']) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute}`;
      times.push(timeString);
    }
  }
  return times;
};

const timeOptions = generateTimeOptions();

export function DeliveryTimeSlotsSection({ formData, onChange }: DeliveryTimeSlotsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Time Slots</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weekday Slots */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Weekday Slots</h3>
          {formData.delivery_slots.weekdays.slots.map((slot, index) => (
            <div key={index} className="grid grid-cols-5 gap-2 items-center">
              <Input
                className="col-span-1"
                value={slot.name}
                onChange={(e) => onChange('weekdays', index, 'name', e.target.value)}
                placeholder="Slot name"
              />
              <Select
                value={slot.start}
                onValueChange={(value) => onChange('weekdays', index, 'start', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={slot.end}
                onValueChange={(value) => onChange('weekdays', index, 'end', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="End time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="1"
                value={slot.max_orders}
                onChange={(e) => onChange('weekdays', index, 'max_orders', parseInt(e.target.value))}
                placeholder="Max orders"
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={slot.enabled}
                  onCheckedChange={(checked) => onChange('weekdays', index, 'enabled', checked)}
                />
                <Label>Enabled</Label>
              </div>
            </div>
          ))}
        </div>

        {/* Weekend Slots */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Weekend Slots</h3>
          {formData.delivery_slots.weekends.slots.map((slot, index) => (
            <div key={index} className="grid grid-cols-5 gap-2 items-center">
              <Input
                className="col-span-1"
                value={slot.name}
                onChange={(e) => onChange('weekends', index, 'name', e.target.value)}
                placeholder="Slot name"
              />
              <Select
                value={slot.start}
                onValueChange={(value) => onChange('weekends', index, 'start', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={slot.end}
                onValueChange={(value) => onChange('weekends', index, 'end', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="End time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="1"
                value={slot.max_orders}
                onChange={(e) => onChange('weekends', index, 'max_orders', parseInt(e.target.value))}
                placeholder="Max orders"
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={slot.enabled}
                  onCheckedChange={(checked) => onChange('weekends', index, 'enabled', checked)}
                />
                <Label>Enabled</Label>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 