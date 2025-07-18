import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, BarChart3, ArrowLeft, Sparkles } from 'lucide-react';
import { GanttChart } from './GanttChart';
import { PhaseEditor } from './PhaseEditor';
import { useProjectPlan } from '@/hooks/useProjectPlan';
import { format, parseISO } from 'date-fns';

interface ProjectPlanViewProps {
  projectId: string;
  teamId: string;
  projectName: string;
  projectDescription?: string;
  onBack: () => void;
  hideHeader?: boolean;
}

export const ProjectPlanView: React.FC<ProjectPlanViewProps> = ({
  projectId,
  teamId,
  projectName,
  projectDescription,
  onBack,
  hideHeader = false,
}) => {
  const [showPhaseEditor, setShowPhaseEditor] = useState(false);
  const [editingPhase, setEditingPhase] = useState(null);
  const [view, setView] = useState<'timeline' | 'list'>('timeline');
  
  const { 
    phases, 
    loading, 
    saving, 
    createPhase, 
    updatePhase, 
    deletePhase, 
    generatePlan 
  } = useProjectPlan(projectId, teamId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'in_progress': return 'bg-warning text-warning-foreground';
      case 'delayed': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleGenerateAIPlan = async () => {
    const success = await generatePlan(projectName, projectDescription, 'Construction');
    if (success) {
      setView('timeline');
    }
  };

  const handlePhaseClick = (phase: any) => {
    setEditingPhase(phase);
    setShowPhaseEditor(true);
  };

  const handleSavePhase = async (phaseData: any) => {
    if (editingPhase) {
      await updatePhase(editingPhase.id, phaseData);
    } else {
      await createPhase(phaseData);
    }
    setShowPhaseEditor(false);
    setEditingPhase(null);
  };

  const handleDeletePhase = async (phaseId: string) => {
    await deletePhase(phaseId);
    setShowPhaseEditor(false);
    setEditingPhase(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading project plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {!hideHeader && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-foreground truncate">{projectName}</h2>
              <p className="text-sm text-muted-foreground">Project Plan & Timeline</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView(view === 'timeline' ? 'list' : 'timeline')}
              className="w-full sm:w-auto"
            >
              {view === 'timeline' ? <Calendar className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
              <span className="ml-2">{view === 'timeline' ? 'List View' : 'Timeline View'}</span>
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-2">
              {phases.length === 0 && (
                <Button onClick={handleGenerateAIPlan} disabled={saving} size="sm" className="w-full sm:w-auto">
                  <Sparkles className="h-4 w-4" />
                  <span className="ml-2 sm:inline">Generate AI Plan</span>
                </Button>
              )}
              
              <Button onClick={() => setShowPhaseEditor(true)} disabled={saving} size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                <span className="ml-2">Add Phase</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Toggle and Actions for when header is hidden */}
      {hideHeader && (
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView(view === 'timeline' ? 'list' : 'timeline')}
            className="w-full sm:w-auto"
          >
            {view === 'timeline' ? <Calendar className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
            <span className="ml-2">{view === 'timeline' ? 'List View' : 'Timeline View'}</span>
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {phases.length === 0 && (
              <Button onClick={handleGenerateAIPlan} disabled={saving} size="sm" className="w-full sm:w-auto">
                <Sparkles className="h-4 w-4" />
                <span className="ml-2 sm:inline">Generate AI Plan</span>
              </Button>
            )}
            
            <Button onClick={() => setShowPhaseEditor(true)} disabled={saving} size="sm" className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span className="ml-2">Add Phase</span>
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {phases.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">No Project Plan Yet</h3>
                <p className="text-muted-foreground">
                  Get started by generating an AI-powered project plan or creating phases manually
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                {!hideHeader && (
                  <>
                    <Button onClick={handleGenerateAIPlan} disabled={saving}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Plan
                    </Button>
                    <Button variant="outline" onClick={() => setShowPhaseEditor(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Phase Manually
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline View */}
      {phases.length > 0 && view === 'timeline' && (
        <GanttChart phases={phases} onPhaseClick={handlePhaseClick} />
      )}

      {/* List View */}
      {phases.length > 0 && view === 'list' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Project Phases</h3>
          <div className="grid gap-4">
            {phases.map((phase) => (
              <Card 
                key={phase.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handlePhaseClick(phase)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{phase.phase_name}</CardTitle>
                    <Badge className={getStatusColor(phase.status)}>
                      {getStatusLabel(phase.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {phase.description && (
                      <p className="text-muted-foreground">{phase.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Start: {format(parseISO(phase.start_date), 'MMM dd, yyyy')}
                      </span>
                      <span>
                        End: {format(parseISO(phase.end_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div 
                      className="w-full h-2 rounded-full"
                      style={{ backgroundColor: `${phase.color}20` }}
                    >
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          backgroundColor: phase.color,
                          width: phase.status === 'completed' ? '100%' : 
                                 phase.status === 'in_progress' ? '50%' : '0%'
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Phase Editor Modal */}
      {showPhaseEditor && (
        <PhaseEditor
          phase={editingPhase}
          onSave={handleSavePhase}
          onDelete={editingPhase ? () => handleDeletePhase(editingPhase.id) : undefined}
          onCancel={() => {
            setShowPhaseEditor(false);
            setEditingPhase(null);
          }}
          loading={saving}
        />
      )}
    </div>
  );
};