import React, { useState } from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ProjectPhase } from '@/hooks/useProjectPlan';

interface GanttChartProps {
  phases: ProjectPhase[];
  onPhaseClick?: (phase: ProjectPhase) => void;
}

interface SimpleGanttData {
  phase: ProjectPhase;
  startDays: number;
  duration: number;
  leftPercent: number;
  widthPercent: number;
}

export const GanttChart: React.FC<GanttChartProps> = ({ phases, onPhaseClick }) => {
  const [hoveredPhase, setHoveredPhase] = useState<string | null>(null);

  // Early validation
  if (!phases || phases.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-border rounded-lg">
        <p className="text-muted-foreground">No project phases to display</p>
      </div>
    );
  }

  // Filter valid phases
  const validPhases = phases.filter(phase => {
    if (!phase?.start_date || !phase?.end_date || !phase?.phase_name) return false;
    const startTime = Date.parse(phase.start_date);
    const endTime = Date.parse(phase.end_date);
    return !isNaN(startTime) && !isNaN(endTime) && startTime <= endTime;
  });

  if (validPhases.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-border rounded-lg">
        <p className="text-muted-foreground">No valid project phases to display</p>
      </div>
    );
  }

  // Calculate project timeline
  const allDates = validPhases.flatMap(phase => [
    parseISO(phase.start_date),
    parseISO(phase.end_date)
  ]);

  const projectStart = new Date(Math.min(...allDates.map(d => d.getTime())));
  const projectEnd = new Date(Math.max(...allDates.map(d => d.getTime())));
  const totalDays = differenceInDays(projectEnd, projectStart) + 1;

  // Debug timeline calculation
  console.log('Timeline Debug:', {
    allDates: allDates.map(d => format(d, 'yyyy-MM-dd')),
    projectStart: format(projectStart, 'yyyy-MM-dd'),
    projectEnd: format(projectEnd, 'yyyy-MM-dd'),
    totalDays,
    phases: validPhases.map(p => ({
      name: p.phase_name,
      start: p.start_date,
      end: p.end_date
    }))
  });

  // Create simple Gantt data
  const ganttData: SimpleGanttData[] = validPhases.map(phase => {
    const phaseStart = parseISO(phase.start_date);
    const phaseEnd = parseISO(phase.end_date);
    const startDays = differenceInDays(phaseStart, projectStart);
    const duration = differenceInDays(phaseEnd, phaseStart) + 1;
    
    const leftPercent = (startDays / totalDays) * 100;
    const widthPercent = (duration / totalDays) * 100;

    // Debug logging for positioning issues
    console.log(`Phase: ${phase.phase_name}`, {
      start_date: phase.start_date,
      end_date: phase.end_date,
      startDays,
      duration,
      leftPercent,
      widthPercent,
      projectStart: format(projectStart, 'yyyy-MM-dd'),
      totalDays
    });

    return {
      phase,
      startDays,
      duration,
      leftPercent: Math.max(0, leftPercent),
      widthPercent: Math.max(1, widthPercent)
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'delayed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusOpacity = (status: string) => {
    switch (status) {
      case 'completed': return 'opacity-100';
      case 'in_progress': return 'opacity-80';
      case 'delayed': return 'opacity-90';
      default: return 'opacity-60';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold text-foreground">Project Timeline</h3>
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded opacity-60"></div>
            <span className="text-muted-foreground">Not Started</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded opacity-80"></div>
            <span className="text-muted-foreground">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded opacity-90"></div>
            <span className="text-muted-foreground">Delayed</span>
          </div>
        </div>
      </div>

      {/* Simple Gantt Chart */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <div className="space-y-3">
          {/* Timeline header */}
          <div className="flex justify-between text-xs text-muted-foreground border-b pb-2">
            <span>{format(projectStart, 'MMM dd, yyyy')}</span>
            <span>{format(projectEnd, 'MMM dd, yyyy')}</span>
          </div>

          {/* Phase rows */}
          <div className="space-y-2">
            {ganttData.map((item, index) => (
              <div key={item.phase.id} className="space-y-1">
                {/* Phase name */}
                <div className="text-sm font-medium text-foreground">
                  {item.phase.phase_name}
                </div>
                
                {/* Timeline bar */}
                <div className="relative h-8 bg-muted rounded">
                                                        <div
                     className={`absolute top-0 h-full rounded cursor-pointer transition-all duration-200 ${getStatusColor(item.phase.status)} ${getStatusOpacity(item.phase.status)} hover:opacity-100`}
                     style={{
                       left: `${item.leftPercent}%`,
                       width: `${item.widthPercent}%`,
                       backgroundColor: item.phase.color || undefined
                     }}
                     onClick={() => onPhaseClick?.(item.phase)}
                     onMouseEnter={() => setHoveredPhase(item.phase.id)}
                     onMouseLeave={() => setHoveredPhase(null)}
                   >
                     {/* Duration label always inside bar */}
                     <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold drop-shadow-lg">
                       {item.duration}
                     </div>
                   </div>
                  
                  {/* Tooltip */}
                  {hoveredPhase === item.phase.id && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg min-w-48">
                        <h4 className="font-semibold text-foreground">{item.phase.phase_name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(parseISO(item.phase.start_date), 'MMM dd, yyyy')} - {format(parseISO(item.phase.end_date), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Duration: {item.duration} day{item.duration !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          Status: {item.phase.status.replace('_', ' ')}
                        </p>
                        {item.phase.description && (
                          <p className="text-sm text-muted-foreground mt-1">{item.phase.description}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Phase details */}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{format(parseISO(item.phase.start_date), 'MMM dd')}</span>
                  <span className="capitalize">{item.phase.status.replace('_', ' ')}</span>
                  <span>{format(parseISO(item.phase.end_date), 'MMM dd')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project summary */}
      <div className="text-xs text-muted-foreground">
        Timeline: {format(projectStart, 'MMM dd, yyyy')} - {format(projectEnd, 'MMM dd, yyyy')}
        {' '}({totalDays} days) • {validPhases.length} phases
      </div>
    </div>
  );
};