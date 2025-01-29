import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BusinessSettings } from "@/types/database";

interface SpecialEventsSectionProps {
  formData: {
    special_events: BusinessSettings['delivery']['special_events'];
    delivery_slots: BusinessSettings['delivery_slots'];
  };
  onChange: (event: string, field: string, value: any) => void;
}

const SPECIAL_EVENTS = [
  {
    id: 'valentines_day',
    name: "Valentine's Day",
    date: 'February 14',
  },
  {
    id: 'mothers_day',
    name: "Mother's Day",
    date: 'Second Sunday in May',
  },
];

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

export function SpecialEventsSection({ formData, onChange }: SpecialEventsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Special Event Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {SPECIAL_EVENTS.map((event) => (
          <div key={event.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">{event.name}</h3>
                <p className="text-sm text-muted-foreground">{event.date}</p>
              </div>
              <Switch
                checked={formData.special_events[event.id].enabled}
                onCheckedChange={(checked) => onChange(event.id, 'enabled', checked)}
              />
            </div>

            {formData.special_events[event.id].enabled && (
              <div className="grid gap-4 pl-4">
                <div>
                  <Label>Cutoff Time</Label>
                  <Select
                    value={formData.special_events[event.id].cutoff_time}
                    onValueChange={(value) => onChange(event.id, 'cutoff_time', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cutoff time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Delivery Fee Multiplier</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.special_events[event.id].delivery_fee_multiplier}
                    onChange={(e) => onChange(event.id, 'delivery_fee_multiplier', parseFloat(e.target.value))}
                  />
                </div>

                <div>
                  <Label>Minimum Order Multiplier</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.special_events[event.id].minimum_order_multiplier}
                    onChange={(e) => onChange(event.id, 'minimum_order_multiplier', parseFloat(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Delivery Slots</Label>
                  {formData.delivery_slots.special_events[event.id].slots.map((slot, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 items-center">
                      <Input
                        className="col-span-1"
                        value={slot.name}
                        onChange={(e) => onChange(event.id, `slots.${index}.name`, e.target.value)}
                      />
                      <Select
                        value={slot.start}
                        onValueChange={(value) => onChange(event.id, `slots.${index}.start`, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                        onValueChange={(value) => onChange(event.id, `slots.${index}.end`, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                        min="0"
                        placeholder="Premium Fee"
                        value={slot.premium_fee}
                        onChange={(e) => onChange(event.id, `slots.${index}.premium_fee`, parseFloat(e.target.value))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 