
import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubscriptionPromptProps {
  onCreateDemo: () => void;
  onViewPlans: () => void;
  loading: boolean;
}

const SubscriptionPrompt = ({ onCreateDemo, onViewPlans, loading }: SubscriptionPromptProps) => {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto text-center"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-white" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">
          Subscription Required
        </h2>

        <p className="text-gray-400 mb-8 leading-relaxed">
          To access the UK Building Regulations AI assistant and save your chat history, 
          you'll need a subscription. Choose from our professional plans designed 
          for building industry professionals.
        </p>

        <div className="space-y-4">
          <Button
            onClick={onCreateDemo}
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
          >
            <Zap className="w-5 h-5 mr-2" />
            {loading ? 'Creating Demo...' : 'Start 30-Day Demo'}
          </Button>

          <Button
            onClick={onViewPlans}
            variant="outline"
            className="w-full h-12 border-gray-600 text-white hover:bg-gray-800"
          >
            <Crown className="w-5 h-5 mr-2" />
            View Subscription Plans
          </Button>
        </div>

        <div className="mt-8 p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg">
          <h3 className="text-sm font-medium text-blue-400 mb-2">Demo Includes:</h3>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• Full Pro features for 30 days</li>
            <li>• Unlimited AI queries</li>
            <li>• Complete chat history</li>
            <li>• All building regulation topics</li>
            <li>• No payment required</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionPrompt;
