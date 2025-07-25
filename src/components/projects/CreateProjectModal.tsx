import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from "@/components/ui/scroll-area";
import { NameInput } from "@/components/ui/name-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { AddressInput } from "@/components/ui/address-input";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: any) => Promise<void>;
  workspaceContext?: 'personal' | 'team' | 'all';
  teamName?: string;
}

const CreateProjectModal = ({
  isOpen,
  onClose,
  onCreateProject,
  workspaceContext,
  teamName
}: CreateProjectModalProps) => {
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    label: 'Residential',
    customer_name: '',
    customer_address: '',
    customer_phone: ''
  });

  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;
    
    setIsCreating(true);
    try {
      await onCreateProject(newProject);
      setNewProject({
        name: '',
        description: '',
        label: 'Residential',
        customer_name: '',
        customer_address: '',
        customer_phone: ''
      });
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto modal-overlay"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
            paddingTop: 'env(safe-area-inset-top, 1rem)',
            paddingBottom: 'env(safe-area-inset-bottom, 1rem)'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card/95 backdrop-blur-xl border border-border rounded-xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] flex flex-col mx-2 sm:mx-4 my-2 sm:my-auto overflow-hidden modal-content"
            style={{ 
              maxHeight: 'calc(100vh - env(safe-area-inset-top, 1rem) - env(safe-area-inset-bottom, 1rem) - 1rem)',
              height: 'auto'
            }}
          >
            <div className="p-4 sm:p-6 pb-3 sm:pb-4 flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">Create New Project</h2>
              {workspaceContext === 'team' && teamName && (
                <p className="text-sm text-muted-foreground mt-1">
                  Creating project for {teamName}
                </p>
              )}
            </div>
            
            <ScrollArea className="flex-1 px-4 sm:px-6 min-h-0 modal-scroll-area" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="space-y-4 pb-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Project Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="w-full px-3 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-base touch-manipulation"
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-base touch-manipulation"
                    placeholder="Describe your project"
                  />
                </div>

                <div>
                  <label htmlFor="label" className="block text-sm font-medium text-foreground mb-2">
                    Project Type
                  </label>
                  <select
                    id="label"
                    value={newProject.label}
                    onChange={(e) => setNewProject({ ...newProject, label: e.target.value })}
                    className="w-full px-3 py-3 bg-background border border-border rounded-lg text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-base touch-manipulation"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Infrastructure">Infrastructure</option>
                  </select>
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="text-base font-medium text-foreground mb-3">Customer Details</h3>
                  
                  <div className="space-y-4">
                     <div>
                       <label htmlFor="customer-name" className="block text-sm font-medium text-foreground mb-2">
                         Customer Name
                       </label>
                       <NameInput
                         id="customer-name"
                         value={newProject.customer_name}
                         onChange={(value) => setNewProject({ ...newProject, customer_name: value })}
                          className="w-full px-3 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-base touch-manipulation"
                       />
                     </div>

                     <div>
                       <label htmlFor="customer-address" className="block text-sm font-medium text-foreground mb-2">
                         Customer Address
                       </label>
                       <AddressInput
                         value={newProject.customer_address}
                         onChange={(value) => setNewProject({ ...newProject, customer_address: value })}
                          className="w-full px-3 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-base touch-manipulation"
                       />
                     </div>

                     <div>
                       <label htmlFor="customer-phone" className="block text-sm font-medium text-foreground mb-2">
                         Customer Phone
                       </label>
                       <PhoneInput
                         id="customer-phone"
                         value={newProject.customer_phone}
                         onChange={(value) => setNewProject({ ...newProject, customer_phone: value })}
                         className="w-full px-3 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-base touch-manipulation"
                       />
                     </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="p-4 sm:p-6 pt-4 border-t border-border flex-shrink-0 safe-area-bottom">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isCreating}
                  className="flex-1 px-4 py-3 border border-border text-foreground rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!newProject.name.trim() || isCreating}
                  className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation text-base"
                >
                  {isCreating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateProjectModal;