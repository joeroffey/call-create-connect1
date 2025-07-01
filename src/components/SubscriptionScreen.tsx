
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Check, 
  Users, 
  Building,
  ArrowLeft,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionScreenProps {
  user: any;
  onBack: () => void;
}

const SubscriptionScreen = ({ user, onBack }: SubscriptionScreenProps) => {
  const { subscription, hasActiveSubscription, createCheckoutSession } = useSubscription(user?.id);

  const plans = [
    {
      name: 'EezyBuild',
      price: '£14.99',
      period: 'per month',
      description: 'Essential building regulations assistant',
      features: [
        'AI chat assistance',
        'Basic building regulations guidance',
        'Standard response time',
        'Email support',
        'Chat history'
      ],
      buttonText: 'Choose EezyBuild',
      planType: 'basic',
      current: hasActiveSubscription && subscription?.plan_type === 'basic'
    },
    {
      name: 'Pro',
      price: '£29.99',
      period: 'per month',
      description: 'Advanced features for professionals',
      features: [
        'Everything in EezyBuild',
        'Priority response time',
        'Advanced building apps',
        'Document upload',
        'Priority support',
        'Extended chat history'
      ],
      buttonText: 'Choose Pro',
      planType: 'pro',
      popular: true,
      current: hasActiveSubscription && subscription?.plan_type === 'pro'
    },
    {
      name: 'ProMax',
      price: '£59.99',
      period: 'per month',
      description: 'Complete solution for teams and enterprises',
      features: [
        'Everything in Pro',
        'Advanced search capabilities',
        'Project management',
        'Team collaboration',
        'Advanced analytics',
        'Custom integrations',
        'White-label options',
        'Dedicated support'
      ],
      buttonText: 'Choose ProMax',
      planType: 'enterprise',
      enterprise: true,
      current: hasActiveSubscription && subscription?.plan_type === 'enterprise'
    }
  ];

  const handlePlanSelection = async (planType: string) => {
    await createCheckoutSession(planType as 'basic' | 'pro' | 'enterprise');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-black text-white">
      <div className="px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8"
        >
          <Button
            onClick={onBack}
            variant="ghost"
            className="p-2 hover:bg-gray-800 rounded-xl mr-4"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Choose Your Plan</h1>
            <p className="text-gray-400">Professional building regulations assistance</p>
          </div>
        </motion.div>

        {/* Current Subscription Status */}
        {hasActiveSubscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-emerald-500/20 to-blue-600/20 rounded-2xl p-6 mb-8 border border-emerald-500/30"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Active Subscription</h3>
                <p className="text-emerald-300">
                  You're currently on the {subscription?.plan_type === 'enterprise' ? 'ProMax' : 
                                           subscription?.plan_type === 'pro' ? 'Pro' : 'EezyBuild'} plan
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              className={`relative rounded-2xl p-6 border ${
                plan.current
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : plan.popular
                  ? 'border-blue-500 bg-blue-500/10'
                  : plan.enterprise
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 bg-gray-900/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              {plan.enterprise && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <Building className="w-3 h-3" />
                    <span>Enterprise</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-1">/{plan.period}</span>
                </div>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePlanSelection(plan.planType)}
                disabled={plan.current}
                className={`w-full h-12 rounded-xl font-medium ${
                  plan.current
                    ? 'bg-emerald-600 text-white cursor-default'
                    : plan.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : plan.enterprise
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {plan.current ? 'Current Plan' : plan.buttonText}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionScreen;
