
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const DatePicker = ({ value, onChange, className, placeholder = "Select your date of birth" }: DatePickerProps) => {
  const [date, setDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      onChange(format(selectedDate, 'yyyy-MM-dd'));
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between text-left font-normal h-12",
            !date && "text-gray-500",
            className
          )}
        >
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-emerald-400" />
            <span>
              {date ? format(date, "PPP") : placeholder}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 bg-gray-800 border-emerald-500/30" 
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={(date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
          initialFocus
          className="p-3 pointer-events-auto bg-gray-800 text-white"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center text-white",
            caption_label: "text-sm font-medium text-white",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white hover:bg-emerald-500/20"
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-emerald-500/50 [&:has([aria-selected])]:bg-emerald-500/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: cn(
              "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-white hover:bg-emerald-500/20 rounded-md"
            ),
            day_range_end: "day-range-end",
            day_selected: "bg-emerald-500 text-black hover:bg-emerald-600 hover:text-black focus:bg-emerald-500 focus:text-black",
            day_today: "bg-gray-700 text-emerald-400",
            day_outside: "day-outside text-gray-600 opacity-50 aria-selected:bg-emerald-500/50 aria-selected:text-gray-600 aria-selected:opacity-30",
            day_disabled: "text-gray-600 opacity-50",
            day_range_middle: "aria-selected:bg-emerald-500/20 aria-selected:text-white",
            day_hidden: "invisible",
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
