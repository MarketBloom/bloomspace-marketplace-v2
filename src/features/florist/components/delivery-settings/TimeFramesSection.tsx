import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimeFramesSectionProps {
  formData: {
    timeFrames: {
      morning: boolean;
      midday: boolean;
      afternoon: boolean;
    };
    timeFrameNames?: {
      morning?: string;
      midday?: string;
      afternoon?: string;
    };
    timeFrameHours?: {
      morning?: { start: string; end: string };
      midday?: { start: string; end: string };
      afternoon?: { start: string; end: string };
    };
  };
  setFormData: (data: any) => void;
}

const defaultTimeFrames = {
  morning: {
    label: "Morning",
    defaultTime: "09:00-12:00",
  },
  midday: {
    label: "Midday",
    defaultTime: "12:00-15:00",
  },
  afternoon: {
    label: "Afternoon",
    defaultTime: "15:00-18:00",
  },
};

const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

export const TimeFramesSection = ({ formData, setFormData }: TimeFramesSectionProps) => {
  const handleTimeFrameToggle = (frame: keyof typeof defaultTimeFrames) => {
    const newTimeFrames = {
      ...formData.timeFrames,
      [frame]: !formData.timeFrames[frame],
    };

    // Initialize default values when toggling on
    let newTimeFrameNames = { ...formData.timeFrameNames };
    let newTimeFrameHours = { ...formData.timeFrameHours };

    if (newTimeFrames[frame]) {
      // Set default values when enabling a time frame
      newTimeFrameNames = {
        ...newTimeFrameNames,
        [frame]: defaultTimeFrames[frame].label,
      };
      
      const [defaultStart, defaultEnd] = defaultTimeFrames[frame].defaultTime.split('-');
      newTimeFrameHours = {
        ...newTimeFrameHours,
        [frame]: { start: defaultStart, end: defaultEnd },
      };
    }

    setFormData({
      ...formData,
      timeFrames: newTimeFrames,
      timeFrameNames: newTimeFrameNames,
      timeFrameHours: newTimeFrameHours,
    });
  };

  const handleNameChange = (frame: keyof typeof defaultTimeFrames, name: string) => {
    setFormData({
      ...formData,
      timeFrameNames: {
        ...formData.timeFrameNames,
        [frame]: name,
      },
    });
  };

  const handleTimeChange = (
    frame: keyof typeof defaultTimeFrames,
    type: 'start' | 'end',
    time: string
  ) => {
    setFormData({
      ...formData,
      timeFrameHours: {
        ...formData.timeFrameHours,
        [frame]: {
          ...(formData.timeFrameHours?.[frame] || {}),
          [type]: time,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {(Object.keys(defaultTimeFrames) as Array<keyof typeof defaultTimeFrames>).map((frame) => (
        <div key={frame} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.timeFrames[frame]}
                onCheckedChange={() => handleTimeFrameToggle(frame)}
                id={`timeframe-${frame}`}
              />
              <Label htmlFor={`timeframe-${frame}`}>{defaultTimeFrames[frame].label}</Label>
            </div>
          </div>

          {formData.timeFrames[frame] && (
            <div className="ml-8 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Custom Name (optional)
                </Label>
                <Input
                  placeholder={`e.g., Early ${defaultTimeFrames[frame].label}`}
                  value={formData.timeFrameNames?.[frame] || ''}
                  onChange={(e) => handleNameChange(frame, e.target.value)}
                  className="max-w-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-xs">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Start Time</Label>
                  <Select
                    value={formData.timeFrameHours?.[frame]?.start || ''}
                    onValueChange={(value) => handleTimeChange(frame, 'start', value)}
                  >
                    <SelectTrigger>
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

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">End Time</Label>
                  <Select
                    value={formData.timeFrameHours?.[frame]?.end || ''}
                    onValueChange={(value) => handleTimeChange(frame, 'end', value)}
                  >
                    <SelectTrigger>
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
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};