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

// ErrorBoundary component specifically for chart rendering
interface ChartErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ChartErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ChartErrorBoundary extends React.Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ChartErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart rendering error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-64 border border-border rounded-lg">
          <div className="text-center">
            <p className="text-muted-foreground">Chart display error</p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Comprehensive data sanitization function
const sanitizeValue = (value: any, fallback: number = 0): number => {
  if (value === null || value === undefined) return fallback;
  
  const num = typeof value === 'number' ? value : Number(value);
  
  if (!Number.isFinite(num) || isNaN(num) || num < 0) {
    return fallback;
  }
  
  return Math.floor(num);
};

// Comprehensive data validation function
const validateChartData = (data: GanttData[]): GanttData[] => {
  return data.filter(item => {
    // Ensure all required properties exist and are valid
    if (!item || typeof item !== 'object') return false;
    if (!item.phase_name || typeof item.phase_name !== 'string') return false;
    if (!item.color || typeof item.color !== 'string') return false;
    if (!item.status || typeof item.status !== 'string') return false;
    if (!item.phase || typeof item.phase !== 'object') return false;
    
    // Sanitize and validate numerical values
    const sanitizedStart = sanitizeValue(item.start, 0);
    const sanitizedDuration = sanitizeValue(item.duration, 1);
    
    if (sanitizedStart < 0 || sanitizedDuration <= 0) return false;
    
    // Update the item with sanitized values
    item.start = sanitizedStart;
    item.duration = sanitizedDuration;
    
    return true;
  });
};

export const GanttChart: React.FC<GanttChartProps> = ({ phases, onPhaseClick }) => {
  // Early validation - must have phases with valid data
  if (!phases || phases.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-border rounded-lg">
        <p className="text-muted-foreground">No project phases to display</p>
      </div>
    );
  }

  // Filter and validate phases with comprehensive checks
  const validPhases = phases.filter(phase => {
    if (!phase || typeof phase !== 'object') return false;
    if (!phase.start_date || !phase.end_date || !phase.phase_name) return false;
    
    // Validate dates can be parsed
    const startTime = Date.parse(phase.start_date);
    const endTime = Date.parse(phase.end_date);
    
    if (isNaN(startTime) || isNaN(endTime)) return false;
    if (startTime > endTime) return false; // End must be after start
    
    return true;
  });
  
  if (validPhases.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-border rounded-lg">
        <p className="text-muted-foreground">No valid project phases to display</p>
      </div>
    );
  }

  // Safe date calculations with multiple fallbacks
  let projectStart: Date;
  let projectEnd: Date;
  let timelineStart: Date;
  let timelineEnd: Date;
  let timelineDuration: number;

  try {
    const allDates = validPhases.flatMap(phase => {
      const start = parseISO(phase.start_date);
      const end = parseISO(phase.end_date);
      return [start, end];
    });

    projectStart = new Date(Math.min(...allDates.map(d => d.getTime())));
    projectEnd = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    // Validate calculated dates
    if (isNaN(projectStart.getTime()) || isNaN(projectEnd.getTime())) {
      throw new Error('Invalid project dates');
    }

    timelineStart = startOfWeek(projectStart);
    timelineEnd = endOfWeek(projectEnd);
    
    // Validate timeline dates
    if (isNaN(timelineStart.getTime()) || isNaN(timelineEnd.getTime())) {
      throw new Error('Invalid timeline dates');
    }

    timelineDuration = differenceInDays(timelineEnd, timelineStart);
    
    // Validate duration
    if (isNaN(timelineDuration) || timelineDuration <= 0) {
      throw new Error('Invalid timeline duration');
    }
  } catch (error) {
    console.error('Date calculation error:', error);
    return (
      <div className="flex items-center justify-center h-64 border border-border rounded-lg">
        <p className="text-muted-foreground">Unable to calculate project timeline</p>
      </div>
    );
  }

  // Create chart data with absolute safety guarantees
  const ganttData: GanttData[] = [];
  
  for (const phase of validPhases) {
    try {
      const phaseStart = parseISO(phase.start_date);
      const phaseEnd = parseISO(phase.end_date);
      
      const startOffset = differenceInDays(phaseStart, timelineStart);
      const duration = differenceInDays(phaseEnd, phaseStart) + 1;
      
      // Multiple layers of sanitization
      const safeStart = sanitizeValue(startOffset, 0);
      const safeDuration = sanitizeValue(duration, 1);
      
      // Only add if all values are definitely valid and safe for Recharts
      if (safeStart >= 0 && safeDuration > 0) {
        ganttData.push({
          phase_name: String(phase.phase_name).slice(0, 50), // Limit length
          start: safeStart,
          duration: safeDuration,
          color: phase.color || '#3b82f6',
          status: phase.status || 'not_started',
          phase,
        });
      }
    } catch (error) {
      console.warn('Skipping invalid phase:', phase.phase_name, error);
      // Skip this phase instead of crashing
    }
  }

  // Validate and sanitize chart data
  const validatedData = validateChartData(ganttData);

  // Final safety check
  if (validatedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-border rounded-lg">
        <p className="text-muted-foreground">No valid chart data available</p>
      </div>
    );
  }

  // Safe chart configuration with validated values
  const safeHeight = sanitizeValue(Math.max(300, Math.min(800, validatedData.length * 60)), 300);
  
  // Extremely robust domain calculation to prevent NaN values
  let domainMax = 1; // Default fallback
  
  if (Number.isFinite(timelineDuration) && timelineDuration > 0) {
    const flooredDuration = Math.floor(timelineDuration);
    if (Number.isFinite(flooredDuration) && flooredDuration > 0) {
      domainMax = Math.max(1, flooredDuration);
    }
  }
  
  // Triple check domain values are absolutely safe for Recharts
  const safeDomain = [0, sanitizeValue(domainMax, 1)];
  
  // Final verification that domain values are valid numbers
  if (safeDomain[0] < 0 || safeDomain[1] <= 0 || safeDomain[1] <= safeDomain[0]) {
    return (
      <div className="flex items-center justify-center h-64 border border-border rounded-lg">
        <p className="text-muted-foreground">Invalid chart domain</p>
      </div>
    );
  }

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
    <ChartErrorBoundary>
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
          <ResponsiveContainer width="100%" height={safeHeight}>
            <BarChart
              data={validatedData}
              layout="horizontal"
              margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
            >
              <XAxis 
                type="number" 
                domain={safeDomain}
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
                {validatedData.map((entry, index) => (
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
    </ChartErrorBoundary>
  );
};