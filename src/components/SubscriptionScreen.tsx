import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Check, 
  ArrowLeft,
  Star,
  Building,
  Loader2,
  Calendar,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionScreenProps {
  user: any;
  onBack: () => void;
}

const SubscriptionScreen = ({ user, onBack }: SubscriptionScreenProps) => {
  const { subscription, hasActiveSubscription, createCheckoutSession, openCustomerPortal } = useSubscription(user?.id);
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      name: 'EezyBuild',
      price: '£14.99',
      period: 'per month',
      trial: '7-day free trial',
      description: 'Essential building regulations assistant',
      features: [
        'AI chat assistance',
        'Basic building regulations guidance',
        'Standard response time',
        'Email support',
        'Chat history'
      ],
      planType: 'basic',
      current: hasActiveSubscription && subscription?.plan_type === 'basic'
    },
    {
      name: 'Pro',
      price: '£29.99',
      period: 'per month',
      trial: '7-day free trial',
      description: 'Advanced features for professionals',
      features: [
        'Everything in EezyBuild',
        'Priority response time',
        'Advanced building tools',
        'Document upload',
        'Priority support',
        'Extended chat history'
      ],
      planType: 'pro',
      popular: true,
      current: hasActiveSubscription && subscription?.plan_type === 'pro'
    },
    {
      name: 'ProMax',
      price: '£59.99',
      period: 'per month',
      trial: '7-day free trial',
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
      planType: 'enterprise',
      enterprise: true,
      current: hasActiveSubscription && subscription?.plan_type === 'enterprise'
    }
  ];

  const handlePlanSelection = async (planType: string) => {
    setLoading(planType);
    try {
      await createCheckoutSession(planType as 'basic' | 'pro' | 'enterprise');
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoading('manage');
    try {
      await openCustomerPortal();
    } catch (error) {
      console.error('Error opening customer portal:', error);
    } finally {
      setLoading(null);
    }
  };

  const getPlanDisplayName = () => {
    if (!hasActiveSubscription || !subscription) return 'No Plan';
    
    switch (subscription.plan_type) {
      case 'basic':
        return 'EezyBuild';
      case 'pro':
        return 'Pro';
      case 'enterprise':
        return 'ProMax';
      default:
        return 'Unknown Plan';
    }
  };

  const getSubscriptionExpiration = () => {
    if (!hasActiveSubscription || !subscription?.current_period_end) {
      return 'N/A';
    }
    
    return new Date(subscription.current_period_end).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white">
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
            className="p-2 hover:bg-gray-800 rounded-xl mr-4 text-white hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Choose Your Plan</h1>
            <p className="text-gray-400">Professional building regulations assistance with 7-day free trial</p>
          </div>
        </motion.div>

        {/* Current Subscription Status - Always visible immediately */}
        {hasActiveSubscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="relative overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-emerald-950/50 via-gray-900/80 to-emerald-950/30 backdrop-blur-xl">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-start gap-6">
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                        <Crown className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full animate-pulse"></div>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-emerald-300 uppercase tracking-wider">Active Subscription</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">
                        {getPlanDisplayName()} Plan
                      </h3>
                      <p className="text-gray-300 text-base mb-4">
                        Your premium subscription is active and ready to use
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-300">
                            Renews {getSubscriptionExpiration()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                          <span className="text-emerald-300 font-medium text-base">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <Button
                      onClick={handleManageSubscription}
                      disabled={loading === 'manage'}
                      size="lg"
                      className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all duration-200 px-6 py-3 font-medium"
                    >
                      {loading === 'manage' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Loading...
                        </>
                      ) : (
                        'Manage Subscription'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
              className={`relative rounded-2xl p-6 border backdrop-blur-sm ${
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
                <div className="mb-2">
                  <span className="text-emerald-400 text-sm font-medium">{plan.trial}</span>
                </div>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePlanSelection(plan.planType)}
                disabled={plan.current || loading === plan.planType}
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
                {loading === plan.planType ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {plan.current ? 'Current Plan' : `Start Free Trial`}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Trial Information */}
        {!hasActiveSubscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center bg-emerald-500/10 rounded-2xl p-6 border border-emerald-500/20"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Start Your Free Trial</h3>
            <p className="text-gray-300 text-sm">
              Try any plan free for 7 days. No credit card required upfront. 
              Cancel anytime during your trial period with no charges.
            </p>
          </motion.div>
        )}

        {/* Downgrade/Cancel Information */}
        {hasActiveSubscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-400 text-sm mb-4">
              Need to downgrade or cancel your subscription?
            </p>
            <Button
              onClick={handleManageSubscription}
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              Manage Subscription & Billing
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionScreen;
