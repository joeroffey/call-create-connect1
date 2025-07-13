
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { NameInput } from "@/components/ui/name-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { AddressInput } from "@/components/ui/address-input";

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
            className="bg-gray-900/95 backdrop-blur-xl border border-gray-800/50 rounded-xl w-full max-w-md h-[90vh] flex flex-col"
          >
            <div className="p-6 pb-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-white">Edit Project</h2>
            </div>
            
            <ScrollArea className="flex-1 px-6 h-0">
              <div className="space-y-4 pb-4">
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

                <div className="border-t border-gray-700/50 pt-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Customer Details</h3>
                  
                  <div className="space-y-4">
                     <div>
                       <Label htmlFor="edit-customer-name" className="text-sm font-medium text-gray-300 mb-2 block">
                         Customer Name
                       </Label>
                       <NameInput
                         id="edit-customer-name"
                         value={editingProject.customer_name || ''}
                         onChange={(value) => setEditingProject({ ...editingProject, customer_name: value })}
                         className="w-full bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-emerald-500/60 focus:ring-emerald-500/20"
                       />
                     </div>

                     <div>
                       <Label htmlFor="edit-customer-address" className="text-sm font-medium text-gray-300 mb-2 block">
                         Customer Address
                       </Label>
                       <AddressInput
                         value={editingProject.customer_address || ''}
                         onChange={(value) => setEditingProject({ ...editingProject, customer_address: value })}
                         className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                       />
                     </div>

                     <div>
                       <Label htmlFor="edit-customer-phone" className="text-sm font-medium text-gray-300 mb-2 block">
                         Customer Phone
                       </Label>
                       <PhoneInput
                         id="edit-customer-phone"
                         value={editingProject.customer_phone || ''}
                         onChange={(value) => setEditingProject({ ...editingProject, customer_phone: value })}
                         className="w-full bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-emerald-500/60 focus:ring-emerald-500/20"
                       />
                     </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="p-6 pt-4 border-t border-gray-700/50 flex-shrink-0">
              <div className="flex space-x-3">
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditProjectModal;
