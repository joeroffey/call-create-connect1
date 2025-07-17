import React, { useEffect, useState } from 'react';
import { GitBranch, Clock, CheckCircle } from 'lucide-react';
import BaseWidget from '../BaseWidget';
import { BaseWidgetProps } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface TimelinePhase {
  id: string;
  phase_name: string;
  start_date: string;
  end_date: string;
  status: string;
  color: string;
  project_name: string;
}

const ProjectTimelineWidget: React.FC<BaseWidgetProps> = (props) => {
  const [phases, setPhases] = useState<TimelinePhase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimelinePhases();
  }, []);

  const fetchTimelinePhases = async () => {
    try {
      const { data: phases } = await supabase
        .from('project_plan_phases')
        .select(`
          id,
          phase_name,
          start_date,
          end_date,
          status,
          color,
          projects!inner(name)
        `)
        .order('start_date', { ascending: true })
        .limit(6);

      if (phases) {
        const timelinePhases = phases.map(phase => ({
          id: phase.id,
          phase_name: phase.phase_name,
          start_date: phase.start_date,
          end_date: phase.end_date,
          status: phase.status,
          color: phase.color,
          project_name: phase.projects?.name || 'Unknown Project'
        }));

        setPhases(timelinePhases);
      }
    } catch (error) {
      console.error('Error fetching timeline phases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'in_progress': return <Clock className="w-3 h-3 text-blue-400" />;
      default: return <div className="w-3 h-3 rounded-full bg-gray-400" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDurationDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isCurrentPhase = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  };

  return (
    <BaseWidget
      {...props}
      title="Project Timeline"
      icon={GitBranch}
    >
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
        </div>
      ) : phases.length === 0 ? (
        <div className="text-center py-8">
          <GitBranch className="w-12 h-12 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No timeline phases</p>
        </div>
      ) : (
        <div className="space-y-3">
          {phases.map((phase, index) => (
            <div 
              key={phase.id} 
              className={`relative pl-6 ${isCurrentPhase(phase.start_date, phase.end_date) ? 'bg-blue-900/20 border border-blue-500/30 rounded p-2 -ml-2' : ''}`}
            >
              {/* Timeline line */}
              <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-600">
                {index === phases.length - 1 && <div className="absolute bottom-0 w-px h-3 bg-gradient-to-b from-gray-600 to-transparent" />}
              </div>
              
              {/* Status indicator */}
              <div className="absolute left-0.5 top-1 flex items-center justify-center">
                {getStatusIcon(phase.status)}
              </div>

              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-white text-sm leading-tight">
                    {phase.phase_name}
                  </h4>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {getDurationDays(phase.start_date, phase.end_date)}d
                  </span>
                </div>
                
                <p className="text-xs text-gray-400 truncate">
                  {phase.project_name}
                </p>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {formatDate(phase.start_date)} - {formatDate(phase.end_date)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    phase.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                    phase.status === 'in_progress' ? 'bg-blue-900/30 text-blue-400' :
                    'bg-gray-800/30 text-gray-400'
                  }`}>
                    {phase.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Timeline summary */}
          <div className="border-t border-gray-700 pt-3 mt-4">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Active phases: {phases.filter(p => p.status === 'in_progress').length}</span>
              <span>Completed: {phases.filter(p => p.status === 'completed').length}</span>
            </div>
          </div>
        </div>
      )}
    </BaseWidget>
  );
};

export default ProjectTimelineWidget;