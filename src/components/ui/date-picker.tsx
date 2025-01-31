import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from './button';
import { Calendar } from './calendar-rac';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { getLocalTimeZone, today, CalendarDate } from "@internationalized/date";
import type { DateValue } from "react-aria-components";

interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ value, onChange, placeholder, className = "" }: DatePickerProps) {
  const [date, setDate] = React.useState<DateValue | null>(
    value ? new CalendarDate(value.getFullYear(), value.getMonth() + 1, value.getDate()) : null
  );

  const handleSelect = (newDate: DateValue | null) => {
    setDate(newDate);
    onChange?.(newDate ? newDate.toDate(getLocalTimeZone()) : null);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start text-left font-normal ${className}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date.toDate(getLocalTimeZone()), 'PPP') : placeholder || 'Pick a date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 bg-[#E8E3DD] border border-[#4A4F41]/10 shadow-lg rounded-lg" align="start">
        <div className="p-2 border-b border-[#4A4F41]/10">
          <button 
            onClick={() => handleSelect(null)}
            className="w-full text-left px-2 py-1 text-sm text-[#4A4F41] rounded hover:bg-[#4A4F41]/10"
          >
            Any Date
          </button>
        </div>
        <Calendar
          value={date}
          onChange={handleSelect}
          className="p-2"
        />
      </PopoverContent>
    </Popover>
  );
} 