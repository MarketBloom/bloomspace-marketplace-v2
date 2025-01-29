import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, addDays, startOfToday, isToday, parse } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SearchFormProps {
  onSearch: (values: SearchFormValues) => void;
  defaultValues?: Partial<SearchFormValues>;
}

interface SearchFormValues {
  location: string;
  fulfillmentType: 'delivery' | 'pickup';
  deliveryDate?: Date;
  deliveryTime?: string;
  budget?: number;
}

const timeSlots = Array.from({ length: 24 * 2 }).map((_, index) => {
  const hour = Math.floor(index / 2);
  const minute = (index % 2) * 30;
  return format(new Date().setHours(hour, minute), 'HH:mm');
});

export function SearchForm({ onSearch, defaultValues }: SearchFormProps) {
  const [date, setDate] = useState<Date | undefined>(defaultValues?.deliveryDate);
  const { register, handleSubmit, watch } = useForm<SearchFormValues>({
    defaultValues: {
      location: defaultValues?.location || '',
      fulfillmentType: defaultValues?.fulfillmentType || 'delivery',
      budget: defaultValues?.budget,
    },
  });

  const fulfillmentType = watch('fulfillmentType');

  const onSubmit = (values: SearchFormValues) => {
    onSearch({
      ...values,
      deliveryDate: date,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="location">Suburb</Label>
        <Input
          id="location"
          placeholder="Enter suburb"
          {...register('location', { required: true })}
        />
      </div>

      <div>
        <Label>Fulfillment Type</Label>
        <RadioGroup
          defaultValue={defaultValues?.fulfillmentType || 'delivery'}
          {...register('fulfillmentType')}
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <RadioGroupItem value="delivery" id="delivery" />
            <Label htmlFor="delivery" className="ml-2">
              Delivery
            </Label>
          </div>
          <div>
            <RadioGroupItem value="pickup" id="pickup" />
            <Label htmlFor="pickup" className="ml-2">
              Pickup
            </Label>
          </div>
        </RadioGroup>
      </div>

      {fulfillmentType === 'delivery' && (
        <>
          <div>
            <Label>Delivery Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < startOfToday()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {date && (
            <div>
              <Label>Delivery Time</Label>
              <Select {...register('deliveryTime')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a time">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Select time</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => {
                    // If it's today, only show future time slots
                    if (isToday(date)) {
                      const now = new Date();
                      const [hour, minute] = time.split(':').map(Number);
                      const slotTime = new Date().setHours(hour, minute);
                      if (slotTime <= now.getTime()) return null;
                    }
                    
                    return (
                      <SelectItem key={time} value={time}>
                        {format(parse(time, 'HH:mm', new Date()), 'h:mm a')}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      )}

      <div>
        <Label htmlFor="budget">Maximum Budget (optional)</Label>
        <Input
          id="budget"
          type="number"
          min="0"
          step="10"
          placeholder="Enter maximum budget"
          {...register('budget', { min: 0 })}
        />
      </div>

      <Button type="submit" className="w-full">
        Search
      </Button>
    </form>
  );
} 