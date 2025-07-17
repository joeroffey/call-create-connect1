import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock } from 'lucide-react';
import BaseWidget from '../BaseWidget';
import { BaseWidgetProps } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'task' | 'deadline';
}

const CalendarViewWidget: React.FC<BaseWidgetProps> = (props) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendarEvents();
  }, [currentDate]);

  const fetchCalendarEvents = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Get tasks with due dates
      const { data: tasks } = await supabase
        .from('project_schedule_of_works')
        .select('id, title, due_date')
        .gte('due_date', startOfMonth.toISOString().split('T')[0])
        .lte('due_date', endOfMonth.toISOString().split('T')[0])
        .eq('completed', false)
        .limit(20);

      const calendarEvents: CalendarEvent[] = [];

      tasks?.forEach(task => {
        if (task.due_date) {
          calendarEvents.push({
            id: task.id,
            title: task.title,
            date: task.due_date,
            type: 'deadline'
          });
        }
      });

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDay = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <BaseWidget
      {...props}
      title="Calendar View"
      icon={CalendarDays}
    >
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
              className="text-gray-400 hover:text-white"
            >
              ←
            </button>
            <h3 className="text-sm font-medium text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
              className="text-gray-400 hover:text-white"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs">
            {weekDays.map(day => (
              <div key={day} className="text-center text-gray-500 font-medium p-1">
                {day}
              </div>
            ))}
            
            {getDaysInMonth().map((day, index) => (
              <div
                key={index}
                className={`aspect-square flex flex-col items-center justify-center text-xs relative ${
                  day ? 'text-gray-300 hover:bg-gray-800/30 rounded' : ''
                }`}
              >
                {day && (
                  <>
                    <span className={`${
                      day === new Date().getDate() && 
                      currentDate.getMonth() === new Date().getMonth() &&
                      currentDate.getFullYear() === new Date().getFullYear()
                        ? 'bg-emerald-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs'
                        : ''
                    }`}>
                      {day}
                    </span>
                    {getEventsForDay(day).length > 0 && (
                      <div className="absolute bottom-0.5 right-0.5">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {events.length > 0 && (
            <div className="border-t border-gray-700 pt-2">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400">Upcoming</span>
              </div>
              <div className="space-y-1 max-h-16 overflow-y-auto">
                {events.slice(0, 3).map(event => (
                  <div key={event.id} className="text-xs text-gray-300 truncate">
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </BaseWidget>
  );
};

export default CalendarViewWidget;