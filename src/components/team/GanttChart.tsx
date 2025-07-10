import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { format, parseISO, differenceInDays, startOfWeek, endOfWeek, addWeeks } from 'date-fns';
import { ProjectPhase } from '@/hooks/useProjectPlan';

interface GanttChartProps {
  phases: ProjectPhase[];
  onPhaseClick?: (phase: ProjectPhase) => void;
}

interface GanttData {
  phase_name: string;
  start: number;
  duration: number;
  color: string;
  status: string;
  phase: ProjectPhase;
}

export const GanttChart: React.FC<GanttChartProps> = ({ phases, onPhaseClick }) => {
  if (phases.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-border rounded-lg">
        <p className="text-muted-foreground">No project phases to display</p>
      </div>
    );
  }

  // Calculate project timeline bounds with validation
  const validPhases = phases.filter(phase => phase.start_date && phase.end_date);
  
  if (validPhases.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-border rounded-lg">
        <p className="text-muted-foreground">No valid project phases to display</p>
      </div>
    );
  }

  const allDates = validPhases.flatMap(phase => {
    try {
      return [parseISO(phase.start_date), parseISO(phase.end_date)];
    } catch {
      return [];
    }
  }).filter(date => !isNaN(date.getTime()));

  if (allDates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-border rounded-lg">
        <p className="text-muted-foreground">Invalid date data in project phases</p>
      </div>
    );
  }

  const projectStart = new Date(Math.min(...allDates.map(d => d.getTime())));
  const projectEnd = new Date(Math.max(...allDates.map(d => d.getTime())));

  // Extend timeline for better visualization
  const timelineStart = startOfWeek(projectStart);
  const timelineEnd = endOfWeek(projectEnd);

  // Prepare data for the Gantt chart with validation
  const ganttData: GanttData[] = validPhases.map(phase => {
    try {
      const phaseStart = parseISO(phase.start_date);
      const phaseEnd = parseISO(phase.end_date);
      const startOffset = Math.max(0, differenceInDays(phaseStart, timelineStart));
      const duration = Math.max(1, differenceInDays(phaseEnd, phaseStart) + 1);

      return {
        phase_name: phase.phase_name,
        start: startOffset,
        duration,
        color: phase.color || '#3b82f6',
        status: phase.status,
        phase,
      };
    } catch {
      // Fallback for invalid dates
      return {
        phase_name: phase.phase_name,
        start: 0,
        duration: 1,
        color: phase.color || '#3b82f6',
        status: phase.status,
        phase,
      };
    }
  }).filter(data => !isNaN(data.start) && !isNaN(data.duration));

  // Generate timeline labels
  const timelineLabels: string[] = [];
  let currentWeek = timelineStart;
  while (currentWeek <= timelineEnd) {
    timelineLabels.push(format(currentWeek, 'MMM dd'));
    currentWeek = addWeeks(currentWeek, 1);
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as GanttData;
      const phase = data.phase;
      
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <h4 className="font-semibold text-foreground">{phase.phase_name}</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {format(parseISO(phase.start_date), 'MMM dd, yyyy')} - {format(parseISO(phase.end_date), 'MMM dd, yyyy')}
          </p>
          <p className="text-sm text-muted-foreground">
            Duration: {data.duration} day{data.duration !== 1 ? 's' : ''}
          </p>
          <p className="text-sm text-muted-foreground capitalize">
            Status: {phase.status.replace('_', ' ')}
          </p>
          {phase.description && (
            <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const getStatusOpacity = (status: string) => {
    switch (status) {
      case 'completed': return 1;
      case 'in_progress': return 0.8;
      case 'delayed': return 0.9;
      default: return 0.6;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Project Timeline</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded opacity-60"></div>
            <span className="text-muted-foreground">Not Started</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-warning rounded opacity-80"></div>
            <span className="text-muted-foreground">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success rounded"></div>
            <span className="text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-destructive rounded opacity-90"></div>
            <span className="text-muted-foreground">Delayed</span>
          </div>
        </div>
      </div>

      <div className="border border-border rounded-lg p-4 bg-card overflow-x-auto">
        <ResponsiveContainer width="100%" height={Math.max(400, phases.length * 60)}>
          <BarChart
            data={ganttData}
            layout="horizontal"
            margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
          >
            <XAxis 
              type="number" 
              domain={[0, Math.max(1, differenceInDays(timelineEnd, timelineStart) || 1)]}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              type="category" 
              dataKey="phase_name"
              width={120}
              tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="duration" 
              fill="hsl(var(--primary))"
              onClick={(data) => onPhaseClick?.(data.phase)}
              cursor="pointer"
              radius={[0, 4, 4, 0]}
            >
              {ganttData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  fillOpacity={getStatusOpacity(entry.status)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-xs text-muted-foreground">
        Timeline: {format(projectStart, 'MMM dd, yyyy')} - {format(projectEnd, 'MMM dd, yyyy')}
        {' '}({Math.max(1, differenceInDays(projectEnd, projectStart) + 1)} days)
      </div>
    </div>
  );
};