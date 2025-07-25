import React from 'react';
import { WidgetRegistry } from './types';
import { 
  FileText, 
  Calendar, 
  CheckSquare, 
  BarChart3,
  Clock,
  GitBranch,
  CalendarDays,
  Plus,
  Bookmark,
  TrendingUp,
  Activity,
  AlertCircle,
  Users,
  MessageSquare,
  StickyNote,
  Quote
} from 'lucide-react';

// Import widget components
import ProjectStatsWidget from './components/ProjectStatsWidget';
import TaskPerformanceWidget from './components/TaskPerformanceWidget';
import RecentActivityWidget from './components/RecentActivityWidget';
import QuickCreateWidget from './components/QuickCreateWidget';
import UpcomingDeadlinesWidget from './components/UpcomingDeadlinesWidget';
import TeamPerformanceWidget from './components/TeamPerformanceWidget';
import DocumentAnalyticsWidget from './components/DocumentAnalyticsWidget';
import CalendarViewWidget from './components/CalendarViewWidget';
import NavigationShortcutsWidget from './components/NavigationShortcutsWidget';
import ProjectProgressWidget from './components/ProjectProgressWidget';
import ProjectTimelineWidget from './components/ProjectTimelineWidget';
import StatusIndicatorsWidget from './components/StatusIndicatorsWidget';
import CollaborationStatsWidget from './components/CollaborationStatsWidget';
import CustomNotesWidget from './components/CustomNotesWidget';
import ProductivityMetricsWidget from './components/ProductivityMetricsWidget';


export const widgetRegistry: WidgetRegistry = {
  // Statistics & Metrics
  'project-stats': {
    name: 'Project Statistics',
    description: 'Overview of your projects with counts and status breakdown',
    category: 'statistics',
    defaultSize: 'medium',
    minSize: 'small',
    maxSize: 'large',
    component: ProjectStatsWidget
  },
  'task-performance': {
    name: 'Task Performance',
    description: 'Active tasks, completion rates, and overdue items',
    category: 'statistics',
    defaultSize: 'medium',
    minSize: 'small',
    maxSize: 'large',
    component: TaskPerformanceWidget
  },
  'document-analytics': {
    name: 'Document Analytics',
    description: 'Document uploads, types, and storage usage',
    category: 'statistics',
    defaultSize: 'medium',
    minSize: 'small',
    maxSize: 'large',
    component: DocumentAnalyticsWidget
  },
  'productivity-metrics': {
    name: 'Productivity Metrics',
    description: 'Time tracking, velocity, and productivity insights',
    category: 'statistics',
    defaultSize: 'large',
    minSize: 'medium',
    maxSize: 'large',
    component: ProductivityMetricsWidget
  },

  // Calendar & Timeline
  'upcoming-deadlines': {
    name: 'Upcoming Deadlines',
    description: 'Next deadlines and overdue tasks',
    category: 'calendar',
    defaultSize: 'medium',
    minSize: 'small',
    maxSize: 'large',
    component: UpcomingDeadlinesWidget
  },
  'project-timeline': {
    name: 'Project Timeline',
    description: 'Mini Gantt chart and milestone tracking',
    category: 'calendar',
    defaultSize: 'large',
    minSize: 'medium',
    maxSize: 'large',
    component: ProjectTimelineWidget
  },
  'calendar-view': {
    name: 'Calendar View',
    description: 'Mini calendar with tasks and events',
    category: 'calendar',
    defaultSize: 'medium',
    minSize: 'small',
    maxSize: 'medium',
    component: CalendarViewWidget
  },

  // Quick Actions
  'quick-create': {
    name: 'Quick Create',
    description: 'Fast access to create projects, tasks, and documents',
    category: 'actions',
    defaultSize: 'small',
    minSize: 'small',
    maxSize: 'medium',
    component: QuickCreateWidget
  },
  'navigation-shortcuts': {
    name: 'Navigation Shortcuts',
    description: 'Pinned projects and favorite actions',
    category: 'actions',
    defaultSize: 'medium',
    minSize: 'small',
    maxSize: 'medium',
    component: NavigationShortcutsWidget
  },

  // Progress & Status
  'project-progress': {
    name: 'Project Progress',
    description: 'Individual project completion percentages',
    category: 'progress',
    defaultSize: 'large',
    minSize: 'medium',
    maxSize: 'large',
    component: ProjectProgressWidget
  },
  'recent-activity': {
    name: 'Recent Activity',
    description: 'Latest actions, updates, and team activities',
    category: 'team',
    defaultSize: 'large',
    minSize: 'medium',
    maxSize: 'large',
    component: RecentActivityWidget
  },
  'status-indicators': {
    name: 'Status Indicators',
    description: 'Projects requiring attention and health scores',
    category: 'progress',
    defaultSize: 'medium',
    minSize: 'small',
    maxSize: 'medium',
    component: StatusIndicatorsWidget
  },

  // Team Specific
  'team-performance': {
    name: 'Team Performance',
    description: 'Member activity, task distribution, and collaboration metrics',
    category: 'team',
    defaultSize: 'wide',
    minSize: 'medium',
    maxSize: 'wide',
    component: TeamPerformanceWidget
  },
  'collaboration-stats': {
    name: 'Collaboration Stats',
    description: 'Comments, file shares, and team interactions',
    category: 'team',
    defaultSize: 'medium',
    minSize: 'small',
    maxSize: 'large',
    component: CollaborationStatsWidget
  },

  // Personal
  'custom-notes': {
    name: 'Custom Notes',
    description: 'Personal sticky notes and reminders',
    category: 'personal',
    defaultSize: 'medium',
    minSize: 'small',
    maxSize: 'large',
    component: CustomNotesWidget
  },
};

export const getWidgetIcon = (type: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'project-stats': FileText,
    'task-performance': CheckSquare,
    'document-analytics': BarChart3,
    'productivity-metrics': TrendingUp,
    'upcoming-deadlines': Clock,
    'project-timeline': GitBranch,
    'calendar-view': CalendarDays,
    'quick-create': Plus,
    'navigation-shortcuts': Bookmark,
    'project-progress': TrendingUp,
    'recent-activity': Activity,
    'status-indicators': AlertCircle,
    'team-performance': Users,
    'collaboration-stats': MessageSquare,
    'custom-notes': StickyNote,
    
  };
  
  return iconMap[type] || FileText;
};