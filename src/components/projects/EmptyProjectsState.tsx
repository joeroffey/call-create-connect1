
import React from 'react';
import { motion } from 'framer-motion';
import { FolderOpen } from 'lucide-react';

interface EmptyProjectsStateProps {
  onCreateProject: () => void;
}

const EmptyProjectsState = ({ onCreateProject }: EmptyProjectsStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-64 text-center"
    >
      <FolderOpen className="w-16 h-16 text-gray-600 mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
      <p className="text-gray-400 mb-6">Create your first project to get started with building regulations guidance.</p>
      <button
        onClick={onCreateProject}
        className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-6 py-3 rounded-lg transition-all duration-300"
      >
        Create Project
      </button>
    </motion.div>
  );
};

export default EmptyProjectsState;
