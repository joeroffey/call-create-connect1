// Widget system types and constants

export type WidgetSize = 'small' | 'medium' | 'large' | 'wide';
export type WorkspaceType = 'personal' | 'team';

export interface WidgetConfig {
  refreshRate?: 'realtime' | 'minute' | 'hour' | 'manual';
  dataRange?: 'week' | 'month' | 'all';
  showElements?: string[];
  colorTheme?: 'primary' | 'secondary' | 'accent';
}

export interface WidgetLayout {
  id: string;
  type: WidgetType;
  position: { x: number; y: number };
  size: WidgetSize;
  config: WidgetConfig;
}

export type WidgetType = 
  // Statistics & Metrics
  | 'project-stats'
  | 'task-performance'
  | 'document-analytics'
  | 'productivity-metrics'
  
  // Calendar & Timeline
  | 'upcoming-deadlines'
  | 'project-timeline'
  | 'calendar-view'
  
  // Quick Actions
  | 'quick-create'
  | 'navigation-shortcuts'
  
  // Progress & Status
  | 'project-progress'
  | 'recent-activity'
  | 'status-indicators'
  
  // Team Specific (for team workspace)
  | 'team-performance'
  | 'collaboration-stats'
  
  // Personal
  | 'custom-notes'
  | 'motivational-quotes';

export interface BaseWidgetProps {
  id: string;
  size: WidgetSize;
  config: WidgetConfig;
  onConfigChange?: (config: WidgetConfig) => void;
  onRemove?: () => void;
  isEditing?: boolean;
}

export type WidgetRegistry = {
  [key in WidgetType]: {
    name: string;
    description: string;
    category: 'statistics' | 'calendar' | 'actions' | 'progress' | 'team' | 'personal';
    defaultSize: WidgetSize;
    minSize: WidgetSize;
    maxSize: WidgetSize;
    component: React.ComponentType<BaseWidgetProps>;
  };
}

export interface DashboardData {
  userId: string;
  teamId?: string;
  workspaceType: WorkspaceType;
  widgets: WidgetLayout[];
}