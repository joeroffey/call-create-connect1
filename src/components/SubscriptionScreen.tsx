import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
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
import { useInAppPurchases } from '@/hooks/useInAppPurchases';

interface SubscriptionScreenProps {
  user: any;
  onBack: () => void;
}

const SubscriptionScreen = ({ user, onBack }: SubscriptionScreenProps) => {
  const { subscription, hasActiveSubscription, hasUsedTrial, createCheckoutSession, openCustomerPortal } = useSubscription(user?.id);
  const { products, loading: iapLoading, isNative, purchaseProduct, restorePurchases } = useInAppPurchases(user?.id);
  const [loading, setLoading] = useState<string | null>(null);

  const tiers = [
    {
      name: 'EezyBuild Basic',
      price: '£15',
      period: 'per month',
      description: 'Essential building regulations assistant',
      features: [
        'Unlimited Building Regulation Chats',
        'Chat History',
        'Email Support',
        'Limited Advanced Tools'
      ],
      planType: 'basic',
      current: hasActiveSubscription && subscription?.plan_type === 'basic',
      colorScheme: 'amber'
    },
    {
      name: 'EezyBuild Pro',
      price: '£30',
      period: 'per month',
      description: 'Advanced features for professionals',
      features: [
        'Everything in EezyBuild Basic',
        'Advanced Building Tools',
        'Document upload',
        'Extended Chat History',
        'Priority response time'
      ],
      planType: 'pro',
      current: hasActiveSubscription && subscription?.plan_type === 'pro',
      colorScheme: 'cyan'
    },
    {
      name: 'EezyBuild Pro Max',
      price: '£60',
      period: 'per month',
      description: 'Complete solution for teams and enterprises',
      features: [
        'Everything in EezyBuild Pro',
        'Advanced Building regulation search',
        'Project Management',
        'Team collaboration',
        'Full catagory of Advanced Building Tools',
        'Advanced Analytics',
        'Project Plans'
      ],
      planType: 'enterprise',
      popular: true,
      current: hasActiveSubscription && subscription?.plan_type === 'enterprise',
      colorScheme: 'blue'
    },
    {
      name: 'EezyBuild Enterprise',
      price: 'Custom',
      period: '',
      description: 'Please Contact the EezyBuild team to see our competitive Enterprise subscription prices',
      features: [
        'Everything in EezyBuild Pro Max',
        'Custom integrations',
        'Dedicated support',
        'Custom pricing',
        'SLA guarantees'
      ],
      planType: 'custom',
      enterprise: true,
      isContactPlan: true,
      current: false,
      colorScheme: 'purple'
    }
  ];

  const handlePlanSelection = async (planType: string) => {
    console.log('🎯 Plan selection clicked:', { planType, user, isNative });
    
    // Handle Enterprise contact plan
    if (planType === 'custom') {
      window.open('mailto:support@eezybuild.com?subject=Enterprise Subscription Inquiry', '_blank');
      return;
    }
    
    if (!user?.id) {
      console.error('❌ No user found - cannot create checkout session');
      // Redirect to login
      window.location.href = '/';
      return;
    }
    
    setLoading(planType);
    try {
      if (isNative) {
        // Use in-app purchases on mobile
        const productId = `com.lovable.callcreateconnect.${planType}_monthly`;
        await purchaseProduct(productId);
      } else {
        // Use Stripe on web
        console.log('🔄 Calling createCheckoutSession...');
        const success = await createCheckoutSession(planType as 'basic' | 'pro' | 'enterprise');
        console.log('✅ Checkout session result:', success);
      }
    } catch (error) {
      console.error('Error with plan selection:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoading('manage');
    try {
      if (isNative) {
        await restorePurchases();
      } else {
        await openCustomerPortal();
      }
    } catch (error) {
      console.error('Error managing subscription:', error);
    } finally {
      setLoading(null);
    }
  };

  const getPlanDisplayName = () => {
    if (!hasActiveSubscription || !subscription) return 'No Plan';
    
    switch (subscription.plan_type) {
      case 'basic':
        return 'EezyBuild Basic';
      case 'pro':
        return 'EezyBuild Pro';
      case 'enterprise':
        return 'EezyBuild Pro Max';
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
      <div className="px-6 py-8 pb-32">{/* Added pb-32 for mobile nav spacing */}
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
            <h1 className="text-3xl font-bold text-white">Tiers</h1>
            <p className="text-gray-400">
              Professional building regulations tiers
              {!hasUsedTrial && !hasActiveSubscription && " with 7-day free trial"}
              {isNative && (
                <span className="block text-sm text-emerald-400 mt-1">
                  Payments processed through {Capacitor.getPlatform() === 'ios' ? 'App Store' : 'Google Play'}
                </span>
              )}
            </p>
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
                {/* Crown icon positioned at top-right */}
                <div className="absolute top-6 right-6">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full animate-pulse"></div>
                  </div>
                </div>

                <div className="flex flex-col gap-6 min-h-[200px]">
                  <div className="flex-1 pr-20">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-emerald-300 uppercase tracking-wider">Active Tier</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-6">
                      {getPlanDisplayName()} Plan
                    </h3>
                    <p className="text-gray-300 text-base mb-8 leading-relaxed">
                      Your tier is active with full access to all features.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-6 mb-6">
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
                  
                  <div className="flex justify-end pr-20">
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
                        'Manage Tier'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tiers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier, index) => (
             <motion.div
               key={tier.name}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 * (index + 1) }}
                className={`relative rounded-2xl p-6 border-2 backdrop-blur-sm ${
                  tier.current
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : tier.colorScheme === 'amber'
                    ? 'border-amber-500 bg-amber-500/10'
                    : tier.colorScheme === 'cyan'
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : tier.colorScheme === 'blue'
                    ? 'border-blue-500 bg-blue-500/10'
                    : tier.colorScheme === 'purple'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-600 bg-gray-900/50'
                }`}
             >
               {tier.popular && (
                 <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                   <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                     <Star className="w-3 h-3" />
                     <span>Most Popular</span>
                   </div>
                 </div>
               )}

               {tier.enterprise && (
                 <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                   <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                     <Building className="w-3 h-3" />
                     <span>Enterprise</span>
                   </div>
                 </div>
               )}

               <div className="text-center mb-6">
                 <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                 <div className="mb-2">
                   {isNative && products.length > 0 ? (
                     // Show native store prices if available
                     (() => {
                       const product = products.find(p => p.productId.includes(tier.planType));
                       return product ? (
                         <>
                           <span className="text-3xl font-bold text-white">{product.price}</span>
                           <span className="text-gray-400 ml-1">/{tier.period}</span>
                         </>
                       ) : (
                         <>
                           <span className="text-3xl font-bold text-white">{tier.price}</span>
                           <span className="text-gray-400 ml-1">/{tier.period}</span>
                         </>
                       );
                     })()
                   ) : (
                     <>
                       <span className="text-3xl font-bold text-white">{tier.price}</span>
                       <span className="text-gray-400 ml-1">/{tier.period}</span>
                     </>
                   )}
                 </div>
                 {/* Only show trial info if user hasn't used trial and doesn't have active subscription and not on native */}
                 {!hasUsedTrial && !hasActiveSubscription && !isNative && (
                   <div className="mb-2">
                     <span className="text-sm font-medium text-emerald-400">
                       7-day free trial
                     </span>
                   </div>
                 )}
                 <p className="text-gray-400 text-sm">{tier.description}</p>
               </div>

               <ul className="space-y-3 mb-8">
                 {tier.features.map((feature, featureIndex) => (
                   <li key={featureIndex} className="flex items-center space-x-3">
                     <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                     <span className="text-gray-300 text-sm">{feature}</span>
                   </li>
                 ))}
               </ul>

               <Button
                 onClick={() => handlePlanSelection(tier.planType)}
                 disabled={tier.current || loading === tier.planType || (isNative && iapLoading)}
                  className={`w-full h-12 rounded-xl font-medium ${
                    tier.current
                      ? 'bg-emerald-600 text-white cursor-default'
                      : tier.colorScheme === 'amber'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : tier.colorScheme === 'cyan'
                      ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                      : tier.colorScheme === 'blue'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : tier.colorScheme === 'purple'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
               >
                 {loading === tier.planType || (isNative && iapLoading) ? (
                   <Loader2 className="w-4 h-4 animate-spin mr-2" />
                 ) : null}
                 {tier.current 
                   ? 'Current Tier' 
                   : tier.isContactPlan
                     ? 'Contact Us'
                     : isNative 
                       ? 'Subscribe Now'
                       : !hasUsedTrial && !hasActiveSubscription 
                         ? 'Start Free Trial' 
                         : 'Subscribe Now'
                 }
               </Button>
             </motion.div>
          ))}
        </div>

        {/* Trial Information - Only show if user hasn't used trial and has no active subscription and not on native */}
        {!hasActiveSubscription && !hasUsedTrial && !isNative && (
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

        {/* No Trial Available Information - Show if user has used trial or has active subscription or on native */}
        {((hasUsedTrial || hasActiveSubscription) && !hasActiveSubscription) || isNative && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center bg-orange-500/10 rounded-2xl p-6 border border-orange-500/20"
          >
            <h3 className="text-lg font-semibold text-white mb-2">
              {isNative ? 'App Store Subscription' : 'No Free Trial Available'}
            </h3>
            <p className="text-gray-300 text-sm">
              {isNative 
                ? `Subscriptions are managed through your ${Capacitor.getPlatform() === 'ios' ? 'App Store' : 'Google Play'} account and will be charged immediately.`
                : 'You\'ve already used your 7-day free trial. All subscriptions will be charged immediately at the full monthly rate.'
              }
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
              Need to {isNative ? 'manage' : 'downgrade or cancel'} your subscription?
            </p>
            <Button
              onClick={handleManageSubscription}
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              {isNative ? 'Restore Purchases' : 'Manage Subscription & Billing'}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionScreen;
