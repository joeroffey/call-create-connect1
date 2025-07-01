
import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubscriptionPromptProps {
  onViewPlans: () => void;
}

const SubscriptionPrompt = ({ onViewPlans }: SubscriptionPromptProps) => {
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
          you'll need a subscription. All plans include a 7-day free trial.
        </p>

        <div className="space-y-4">
          <Button
            onClick={onViewPlans}
            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold"
          >
            <Crown className="w-5 h-5 mr-2" />
            Start 7-Day Free Trial
          </Button>
        </div>

        <div className="mt-8 p-4 bg-emerald-600/10 border border-emerald-600/20 rounded-lg">
          <h3 className="text-sm font-medium text-emerald-400 mb-2">Free Trial Includes:</h3>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• 7 days of full access</li>
            <li>• Unlimited AI queries</li>
            <li>• Complete chat history</li>
            <li>• All building regulation topics</li>
            <li>• Cancel anytime during trial</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionPrompt;
