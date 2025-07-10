import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, Palette } from 'lucide-react';
import { ProjectPhase } from '@/hooks/useProjectPlan';

interface PhaseEditorProps {
  phase?: ProjectPhase | null;
  onSave: (data: any) => void;
  onDelete?: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const statusOptions = [
  { value: 'not_started', label: 'Not Started', color: 'bg-muted' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-warning' },
  { value: 'completed', label: 'Completed', color: 'bg-success' },
  { value: 'delayed', label: 'Delayed', color: 'bg-destructive' },
];

const predefinedColors = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
  '#ec4899', '#6366f1', '#14b8a6', '#eab308',
];

export const PhaseEditor: React.FC<PhaseEditorProps> = ({
  phase,
  onSave,
  onDelete,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<{
    phase_name: string;
    start_date: string;
    end_date: string;
    description: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
    color: string;
  }>({
    phase_name: '',
    start_date: '',
    end_date: '',
    description: '',
    status: 'not_started',
    color: '#3b82f6',
  });

  useEffect(() => {
    if (phase) {
      setFormData({
        phase_name: phase.phase_name,
        start_date: phase.start_date,
        end_date: phase.end_date,
        description: phase.description || '',
        status: phase.status,
        color: phase.color,
      });
    }
  }, [phase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleColorChange = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };

  const isEditing = !!phase;

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Project Phase' : 'Create New Phase'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phase_name">Phase Name</Label>
            <Input
              id="phase_name"
              value={formData.phase_name}
              onChange={(e) => setFormData(prev => ({ ...prev, phase_name: e.target.value }))}
              placeholder="e.g., Foundation Work"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                min={formData.start_date}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this phase..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${option.color}`} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Phase Color
            </Label>
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-md border border-border"
                style={{ backgroundColor: formData.color }}
              />
              <Input
                type="color"
                value={formData.color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-20 h-8"
              />
              <span className="text-sm text-muted-foreground">or choose:</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-6 h-6 rounded border-2 transition-all ${
                    formData.color === color ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between">
            <div>
              {isEditing && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={onDelete}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (isEditing ? 'Update Phase' : 'Create Phase')}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};