
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createProject } from '@/lib/projects';


interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  newProject: {
    name: string;
    description: string;
    label: string;
    customer_name: string;
    customer_address: string;
    customer_phone: string;
  };
  setNewProject: (project: { name: string; description: string; label: string; customer_name: string; customer_address: string; customer_phone: string }) => void;
  onCreateProject: () => void;
  onProjectCreated?: () => void;
}

const CreateProjectModal = ({
  isOpen,
  onClose,
  newProject,
  setNewProject,
  onCreateProject
}: CreateProjectModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50"
          style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900/95 backdrop-blur-xl border border-gray-800/50 rounded-t-xl sm:rounded-xl w-full max-w-md mx-auto flex flex-col"
            style={{
              height: 'min(80vh, 700px)',
              maxHeight: 'calc(100vh - env(safe-area-inset-top, 20px) - env(safe-area-inset-bottom, 20px) - 40px)',
            }}
          >
            <div className="p-4 flex-shrink-0 border-b border-gray-700/50">
              <h2 className="text-lg font-bold text-white truncate">Create New Project</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 overscroll-contain" 
              style={{ 
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
                minHeight: 0
              }}>
              <div className="space-y-4 pb-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Project Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 mobile-input-focus"
                    style={{ fontSize: '16px' }}
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none mobile-input-focus"
                    style={{ fontSize: '16px' }}
                    placeholder="Describe your project"
                  />
                </div>

                <div>
                  <label htmlFor="label" className="block text-sm font-medium text-gray-300 mb-2">
                    Project Type
                  </label>
                  <select
                    id="label"
                    value={newProject.label}
                    onChange={(e) => setNewProject({ ...newProject, label: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 mobile-input-focus"
                    style={{ fontSize: '16px' }}
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Infrastructure">Infrastructure</option>
                  </select>
                </div>

                <div className="border-t border-gray-700/50 pt-4">
                  <h3 className="text-base font-medium text-blue-400 mb-3">Customer Details</h3>
                  
                  <div className="space-y-4">
                     <div>
                       <label htmlFor="customer-name" className="block text-sm font-medium text-gray-300 mb-2">
                         Customer Name
                       </label>
                        <input
                          id="customer-name"
                          type="text"
                          value={newProject.customer_name}
                          onChange={(e) => setNewProject({ ...newProject, customer_name: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 mobile-input-focus"
                          style={{ fontSize: '16px' }}
                          placeholder="Enter customer name"
                        />
                     </div>

                     <div>
                       <label htmlFor="customer-address" className="block text-sm font-medium text-gray-300 mb-2">
                         Customer Address
                       </label>
                        <textarea
                          id="customer-address"
                          value={newProject.customer_address}
                          onChange={(e) => setNewProject({ ...newProject, customer_address: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none mobile-input-focus"
                          style={{ fontSize: '16px' }}
                          placeholder="Enter full address including postcode..."
                        />
                     </div>

                     <div>
                       <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-300 mb-2">
                         Customer Phone
                       </label>
                        <input
                          id="customer-phone"
                          type="tel"
                          value={newProject.customer_phone}
                          onChange={(e) => setNewProject({ ...newProject, customer_phone: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 mobile-input-focus"
                          style={{ fontSize: '16px' }}
                          placeholder="Enter UK phone number"
                        />
                     </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-700/50 flex-shrink-0 bg-gray-900/95"
              style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))' }}>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-800/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onCreateProject}
                  disabled={!newProject.name.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Project
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
