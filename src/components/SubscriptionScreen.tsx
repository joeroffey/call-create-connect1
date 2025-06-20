import React from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Check, 
  Zap, 
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
  const { subscription, hasActiveSubscription, createDemoSubscription } = useSubscription(user?.id);

  const plans = [
    {
      name: 'Free',
      price: '£0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Basic chat functionality',
        'Limited messages per day',
        'Standard response time',
        'Community support'
      ],
      buttonText: 'Current Plan',
      disabled: true,
      current: !hasActiveSubscription
    },
    {
      name: 'Pro',
      price: '£14.99',
      period: 'per month',
      description: 'Ideal for professionals',
      features: [
        'Unlimited messages',
        'Priority response time',
        'Advanced features',
        'Email support',
        'Document upload',
        'Project management'
      ],
      buttonText: 'Choose Pro',
      popular: true,
      current: hasActiveSubscription && subscription?.plan_type === 'pro'
    },
    {
      name: 'ProMax',
      price: '£29.99',
      period: 'per month',
      description: 'For teams and enterprises',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Advanced analytics',
        'Custom integrations',
        'Priority support',
        'Advanced project features',
        'White-label options'
      ],
      buttonText: 'Choose ProMax',
      enterprise: true,
      current: hasActiveSubscription && subscription?.plan_type === 'enterprise'
    }
  ];

  const handlePlanSelection = async (planName: string) => {
    if (planName === 'Pro') {
      await createDemoSubscription();
    }
    // Other plan handling would go here
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
            <p className="text-gray-400">Upgrade your experience with premium features</p>
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
                  You're currently on the {subscription?.plan_type === 'enterprise' ? 'ProMax' : 'Pro'} plan
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
                onClick={() => handlePlanSelection(plan.name)}
                disabled={plan.disabled || plan.current}
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

        {/* Developer Demo Section */}
        {user?.email === 'josephh.roffey@gmail.com' && !hasActiveSubscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-gradient-to-r from-yellow-500/20 to-orange-600/20 rounded-2xl p-6 border border-yellow-500/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Developer Access</h3>
                  <p className="text-yellow-300">Get a free Pro demo for testing</p>
                </div>
              </div>
              <Button
                onClick={() => createDemoSubscription()}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
              >
                Activate Demo
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionScreen;
