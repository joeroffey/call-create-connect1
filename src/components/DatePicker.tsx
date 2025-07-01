
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
            "w-full justify-between text-left font-normal h-12 bg-gray-800/50 border-emerald-500/30 hover:bg-gray-700/50 hover:border-emerald-400/50 transition-all duration-200",
            !date && "text-gray-400",
            date && "text-white",
            className
          )}
        >
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-5 w-5 text-emerald-400" />
            <span className="text-base">
              {date ? format(date, "MMMM dd, yyyy") : placeholder}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 bg-gray-800 border-emerald-500/30 shadow-2xl" 
        align="start"
        sideOffset={8}
      >
        <div className="p-4 bg-gray-800 rounded-lg">
          <div className="mb-4 text-center">
            <h3 className="text-lg font-semibold text-white mb-1">Select Date</h3>
            <p className="text-sm text-gray-400">Choose your date of birth</p>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
            initialFocus
            className="pointer-events-auto"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center text-white mb-4",
              caption_label: "text-lg font-semibold text-white",
              nav: "space-x-1 flex items-center",
              nav_button: cn(
                "h-8 w-8 bg-gray-700 hover:bg-emerald-600 p-0 opacity-80 hover:opacity-100 text-white rounded-md transition-all duration-200 border border-gray-600 hover:border-emerald-500"
              ),
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex mb-2",
              head_cell: "text-emerald-300 rounded-md w-10 font-medium text-sm uppercase tracking-wider",
              row: "flex w-full mt-2",
              cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-emerald-500/50 [&:has([aria-selected])]:bg-emerald-500/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: cn(
                "h-10 w-10 p-0 font-medium aria-selected:opacity-100 text-white hover:bg-emerald-500/30 rounded-md transition-all duration-200 border border-transparent hover:border-emerald-400/50"
              ),
              day_range_end: "day-range-end",
              day_selected: "bg-emerald-500 text-black hover:bg-emerald-600 hover:text-black focus:bg-emerald-500 focus:text-black border-emerald-400 font-bold shadow-lg",
              day_today: "bg-gray-700 text-emerald-400 border-emerald-400/50 font-semibold",
              day_outside: "day-outside text-gray-500 opacity-50 aria-selected:bg-emerald-500/50 aria-selected:text-gray-500 aria-selected:opacity-30",
              day_disabled: "text-gray-600 opacity-30 cursor-not-allowed",
              day_range_middle: "aria-selected:bg-emerald-500/20 aria-selected:text-white",
              day_hidden: "invisible",
            }}
          />
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-400 text-center">
              Select a date between 1900 and today
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
