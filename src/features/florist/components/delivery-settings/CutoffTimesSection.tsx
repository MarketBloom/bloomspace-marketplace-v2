import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Label } from "../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Switch } from "../../../../components/ui/switch";
import { BusinessSettings } from "../../../../types/database";

interface CutoffTimesSectionProps {
  formData: {
    delivery: BusinessSettings['delivery'];
  };
  onChange: (field: string, value: any) => void;
}

const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

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

export function CutoffTimesSection({ formData, onChange }: CutoffTimesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Cutoff Times</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Same Day Cutoff */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Same Day Delivery</h3>
          <div className="grid gap-4">
            <div className="flex items-center gap-4">
              <Label>Default Cutoff Time</Label>
              <Select
                value={formData.delivery.same_day_cutoff.default}
                onValueChange={(value) => onChange('same_day_cutoff.default', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time" />
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

            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="flex items-center gap-4">
                <Label className="w-32 capitalize">{day}</Label>
                <Select
                  value={formData.delivery.same_day_cutoff[day] || formData.delivery.same_day_cutoff.default}
                  onValueChange={(value) => onChange(`same_day_cutoff.${day}`, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Use Default</SelectItem>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>

        {/* Next Day Cutoff */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Next Day Delivery</h3>
            <Switch
              checked={formData.delivery.next_day_cutoff_enabled}
              onCheckedChange={(checked) => onChange('next_day_cutoff_enabled', checked)}
            />
          </div>

          {formData.delivery.next_day_cutoff_enabled && (
            <div className="grid gap-4 pl-4">
              <div className="flex items-center gap-4">
                <Label>Default Cutoff Time</Label>
                <Select
                  value={formData.delivery.next_day_cutoff.default}
                  onValueChange={(value) => onChange('next_day_cutoff.default', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time" />
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

              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="flex items-center gap-4">
                  <Label className="w-32 capitalize">{day}</Label>
                  <Select
                    value={formData.delivery.next_day_cutoff[day] || formData.delivery.next_day_cutoff.default}
                    onValueChange={(value) => onChange(`next_day_cutoff.${day}`, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Use Default</SelectItem>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 