
import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubscriptionPromptProps {
  onViewPlans: () => void;
}

const SubscriptionPrompt = ({ onViewPlans }: SubscriptionPromptProps) => {
  const handleViewPlans = () => {
    console.log('SubscriptionPrompt: View plans clicked - calling onViewPlans callback');
    onViewPlans();
  };

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

        <Button
          onClick={handleViewPlans}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
        >
          <Crown className="w-5 h-5 mr-2" />
          View Subscription Plans
        </Button>
      </motion.div>
    </div>
  );
};

export default SubscriptionPrompt;
