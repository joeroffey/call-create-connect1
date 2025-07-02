
import React from 'react';
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
}

interface EditProjectModalProps {
  editingProject: Project | null;
  onClose: () => void;
  setEditingProject: (project: Project) => void;
  onUpdateProject: () => void;
}

const EditProjectModal = ({
  editingProject,
  onClose,
  setEditingProject,
  onUpdateProject
}: EditProjectModalProps) => {
  return (
    <AnimatePresence>
      {editingProject && (
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
            className="bg-gray-900/95 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-white mb-6">Edit Project</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-sm font-medium text-gray-300 mb-2 block">
                  Project Name *
                </Label>
                <Input
                  id="edit-name"
                  type="text"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  className="w-full bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-emerald-500/60 focus:ring-emerald-500/20"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <Label htmlFor="edit-description" className="text-sm font-medium text-gray-300 mb-2 block">
                  Description
                </Label>
                <textarea
                  id="edit-description"
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                  placeholder="Describe your project"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-300 mb-2 block">
                  Project Type
                </Label>
                <Select
                  value={editingProject.label}
                  onValueChange={(value) => setEditingProject({ ...editingProject, label: value })}
                >
                  <SelectTrigger className="w-full h-10 bg-gray-800/50 border-gray-700/50 text-white hover:bg-gray-800/70 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20">
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 text-white z-[60]">
                    <SelectItem 
                      value="Residential" 
                      className="hover:bg-emerald-500/10 focus:bg-emerald-500/10 hover:text-emerald-400 focus:text-emerald-400 cursor-pointer"
                    >
                      Residential
                    </SelectItem>
                    <SelectItem 
                      value="Commercial" 
                      className="hover:bg-emerald-500/10 focus:bg-emerald-500/10 hover:text-emerald-400 focus:text-emerald-400 cursor-pointer"
                    >
                      Commercial
                    </SelectItem>
                    <SelectItem 
                      value="Industrial" 
                      className="hover:bg-emerald-500/10 focus:bg-emerald-500/10 hover:text-emerald-400 focus:text-emerald-400 cursor-pointer"
                    >
                      Industrial
                    </SelectItem>
                    <SelectItem 
                      value="Infrastructure" 
                      className="hover:bg-emerald-500/10 focus:bg-emerald-500/10 hover:text-emerald-400 focus:text-emerald-400 cursor-pointer"
                    >
                      Infrastructure
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-300 mb-2 block">
                  Status
                </Label>
                <Select
                  value={editingProject.status}
                  onValueChange={(value) => setEditingProject({ ...editingProject, status: value })}
                >
                  <SelectTrigger className="w-full h-10 bg-gray-800/50 border-gray-700/50 text-white hover:bg-gray-800/70 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 text-white z-[60]">
                    <SelectItem 
                      value="setup" 
                      className="hover:bg-emerald-500/10 focus:bg-emerald-500/10 hover:text-emerald-400 focus:text-emerald-400 cursor-pointer"
                    >
                      Set-up
                    </SelectItem>
                    <SelectItem 
                      value="planning" 
                      className="hover:bg-emerald-500/10 focus:bg-emerald-500/10 hover:text-emerald-400 focus:text-emerald-400 cursor-pointer"
                    >
                      Planning
                    </SelectItem>
                    <SelectItem 
                      value="in-progress" 
                      className="hover:bg-emerald-500/10 focus:bg-emerald-500/10 hover:text-emerald-400 focus:text-emerald-400 cursor-pointer"
                    >
                      In Progress
                    </SelectItem>
                    <SelectItem 
                      value="completed" 
                      className="hover:bg-emerald-500/10 focus:bg-emerald-500/10 hover:text-emerald-400 focus:text-emerald-400 cursor-pointer"
                    >
                      Completed
                    </SelectItem>
                    <SelectItem 
                      value="on-hold" 
                      className="hover:bg-emerald-500/10 focus:bg-emerald-500/10 hover:text-emerald-400 focus:text-emerald-400 cursor-pointer"
                    >
                      On Hold
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 border-gray-700/50 text-gray-300 hover:bg-gray-800/50 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={onUpdateProject}
                disabled={!editingProject.name.trim()}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Project
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditProjectModal;
