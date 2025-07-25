import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NameInput } from "@/components/ui/name-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { AddressInput } from "@/components/ui/address-input";
import { Badge } from "@/components/ui/badge";
import { Star, Trash2 } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  label: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  pinned?: boolean;
  team_id?: string;
  team_name?: string;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
}

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdateProject: (projectId: string, updates: any) => Promise<void>;
  onDeleteProject: (projectId: string, projectName: string) => Promise<void>;
  onTogglePinProject: (projectId: string, currentPinned: boolean) => Promise<void>;
  onStatusChange: (projectId: string, newStatus: string) => Promise<void>;
}

const EditProjectModal = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
  onDeleteProject,
  onTogglePinProject,
  onStatusChange
}: EditProjectModalProps) => {
  const [editedProject, setEditedProject] = useState(project);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setEditedProject(project);
  }, [project]);

  const handleUpdateProject = async () => {
    if (!editedProject.name.trim()) return;
    
    setIsUpdating(true);
    try {
      await onUpdateProject(project.id, {
        name: editedProject.name,
        description: editedProject.description,
        label: editedProject.label,
        customer_name: editedProject.customer_name,
        customer_address: editedProject.customer_address,
        customer_phone: editedProject.customer_phone
      });
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await onDeleteProject(project.id, project.name);
      onClose();
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePin = async () => {
    try {
      await onTogglePinProject(project.id, !!project.pinned);
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await onStatusChange(project.id, newStatus);
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'on_hold': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning': return 'Planning';
      case 'active': return 'Active';
      case 'on_hold': return 'On Hold';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card/95 backdrop-blur-xl border border-border rounded-xl w-full max-w-2xl h-[90vh] flex flex-col"
          >
            <div className="p-6 pb-4 flex-shrink-0 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Edit Project</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${getStatusColor(project.status)} border`}>
                      {getStatusLabel(project.status)}
                    </Badge>
                    {project.pinned && (
                      <Badge variant="outline" className="text-yellow-500 border-yellow-500/20">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Starred
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTogglePin}
                    className={project.pinned ? "text-yellow-500 border-yellow-500/20" : ""}
                  >
                    <Star className={`w-4 h-4 ${project.pinned ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
            
            <ScrollArea className="flex-1 px-6 h-0">
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Project Name *</Label>
                    <Input
                      id="edit-name"
                      value={editedProject.name}
                      onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                      placeholder="Enter project name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-status">Status</Label>
                    <Select value={project.status} onValueChange={handleStatusChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <textarea
                    id="edit-description"
                    value={editedProject.description}
                    onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    placeholder="Describe your project"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-label">Project Type</Label>
                  <Select value={editedProject.label} onValueChange={(value) => setEditedProject({ ...editedProject, label: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Residential">Residential</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Industrial">Industrial</SelectItem>
                      <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="text-base font-medium text-foreground mb-4">Customer Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-customer-name">Customer Name</Label>
                      <NameInput
                        id="edit-customer-name"
                        value={editedProject.customer_name || ''}
                        onChange={(value) => setEditedProject({ ...editedProject, customer_name: value })}
                        placeholder="Customer name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-customer-phone">Customer Phone</Label>
                      <PhoneInput
                        id="edit-customer-phone"
                        value={editedProject.customer_phone || ''}
                        onChange={(value) => setEditedProject({ ...editedProject, customer_phone: value })}
                        placeholder="Customer phone"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="edit-customer-address">Customer Address</Label>
                    <AddressInput
                      value={editedProject.customer_address || ''}
                      onChange={(value) => setEditedProject({ ...editedProject, customer_address: value })}
                      placeholder="Customer address"
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="p-6 pt-4 border-t border-border flex-shrink-0">
              <div className="flex items-center justify-between">
                <Button
                  variant="destructive"
                  onClick={handleDeleteProject}
                  disabled={isDeleting || isUpdating}
                  className="px-4"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
                
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isUpdating || isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateProject}
                    disabled={!editedProject.name.trim() || isUpdating || isDeleting}
                  >
                    {isUpdating ? 'Updating...' : 'Update Project'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditProjectModal;