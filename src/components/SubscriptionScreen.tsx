
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, Zap, Star, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  icon: React.ComponentType<any>;
  popular?: boolean;
  gradient: string;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: '£9.99',
    period: '/month',
    description: 'Perfect for occasional queries',
    features: [
      '50 AI queries per month',
      'Basic Building Regulations search',
      'Email support',
      'Mobile app access'
    ],
    icon: Building2,
    gradient: 'from-gray-600 to-gray-800'
  },
  {
    id: 'pro',
    name: 'Professional',
    price: '£24.99',
    period: '/month',
    description: 'Ideal for architects & builders',
    features: [
      '500 AI queries per month',
      'Advanced regulation analysis',
      'Priority support',
      'Export to PDF/Word',
      'Project organization',
      'Offline access'
    ],
    icon: Zap,
    popular: true,
    gradient: 'from-blue-600 to-purple-600'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '£99.99',
    period: '/month',
    description: 'For large teams & organizations',
    features: [
      'Unlimited AI queries',
      'Custom AI model training',
      'Team collaboration tools',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced analytics'
    ],
    icon: Crown,
    gradient: 'from-yellow-500 to-orange-600'
  }
];

interface SubscriptionScreenProps {
  user: any;
}

const SubscriptionScreen = ({ user }: SubscriptionScreenProps) => {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="flex-1 overflow-y-auto bg-black text-white">
      <div className="px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-gray-400">Unlock the full power of AI-driven Building Regulations assistance</p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-gray-800 rounded-full p-1 flex">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-full font-medium transition-all relative ${
                billingPeriod === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-xs px-2 py-1 rounded-full text-white">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="space-y-4 mb-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`relative bg-gray-900/50 backdrop-blur-xl rounded-2xl border transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-600/10' 
                    : 'border-gray-800 hover:border-gray-700'
                } ${plan.popular ? 'ring-2 ring-blue-500/20' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1 rounded-full text-xs font-medium text-white flex items-center space-x-1">
                      <Star className="w-3 h-3" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${plan.gradient} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                        <p className="text-sm text-gray-400">{plan.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {billingPeriod === 'yearly' ? 
                          `£${(parseFloat(plan.price.replace('£', '')) * 12 * 0.8).toFixed(0)}` : 
                          plan.price
                        }
                      </div>
                      <div className="text-sm text-gray-400">
                        {billingPeriod === 'yearly' ? '/year' : plan.period}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-green-400" />
                        </div>
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-b-2xl"
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Subscribe button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl text-lg">
            <span>Subscribe to {plans.find(p => p.id === selectedPlan)?.name}</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>

        {/* Current plan info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 p-4 bg-green-600/10 border border-green-600/20 rounded-xl"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-400">Current Plan: Professional</p>
              <p className="text-xs text-gray-400">Next billing: March 15, 2024</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionScreen;
