import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

export function OperatingHours({ floristId }: { floristId: string }) {
  const [hours, setHours] = useState<{
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  }>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadOperatingHours();
  }, []);

  const loadOperatingHours = async () => {
    try {
      const { data, error } = await supabase
        .from('florist_profiles')
        .select('operating_hours')
        .eq('id', floristId)
        .single();

      if (error) throw error;

      // Initialize any missing days with default values
      const fullHours = DAYS.reduce((acc, day) => ({
        ...acc,
        [day]: data.operating_hours?.[day] || {
          open: '09:00',
          close: '17:00',
          closed: false
        }
      }), {});

      setHours(fullHours);
    } catch (error) {
      console.error('Error loading hours:', error);
      toast.error('Failed to load operating hours');
    }
  };

  const saveHours = async () => {
    try {
      setIsSaving(true);
      
      // Validate hours
      for (const day of DAYS) {
        if (!hours[day].closed) {
          const openTime = new Date(`2000-01-01 ${hours[day].open}`);
          const closeTime = new Date(`2000-01-01 ${hours[day].close}`);
          if (openTime >= closeTime) {
            throw new Error(`Invalid hours for ${day}: closing time must be after opening time`);
          }
        }
      }

      const { error } = await supabase
        .from('florist_profiles')
        .update({ operating_hours: hours })
        .eq('id', floristId);

      if (error) throw error;

      toast.success('Operating hours saved successfully');
    } catch (error) {
      console.error('Error saving hours:', error);
      toast.error(error.message || 'Failed to save operating hours');
    } finally {
      setIsSaving(false);
    }
  };

  const handleHourChange = (day: string, field: 'open' | 'close', value: string) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleDayToggle = (day: string, closed: boolean) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        closed
      }
    }));
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {DAYS.map(day => (
          <div key={day} className="grid grid-cols-4 gap-4 items-center">
            <div className="capitalize font-medium">{day}</div>
            
            <Switch
              checked={!hours[day]?.closed}
              onCheckedChange={(checked) => handleDayToggle(day, !checked)}
            />
            
            {!hours[day]?.closed && (
              <>
                <Select
                  value={hours[day]?.open}
                  onValueChange={(value) => handleHourChange(day, 'open', value)}
                >
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </Select>

                <Select
                  value={hours[day]?.close}
                  onValueChange={(value) => handleHourChange(day, 'close', value)}
                >
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </Select>
              </>
            )}
          </div>
        ))}

        <Button 
          onClick={saveHours} 
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? 'Saving...' : 'Save Operating Hours'}
        </Button>
      </div>
    </Card>
  );
} 