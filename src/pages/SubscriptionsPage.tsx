import React from "react";
import { useNavigate } from "react-router-dom";
import LandingLayout from "@/components/landing/LandingLayout";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const SubscriptionsPage = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "EezyBuild Basic",
      price: "£15",
      period: "per month",
      description: "Essential building regulations assistant",
      features: [
        "Unlimited Building Regulation Chats",
        "Chat History",
        "Email Support",
        "Limited Advanced Tools"
      ],
      limitations: [],
      buttonText: "Start Free Trial",
      popular: false
    },
    {
      name: "EezyBuild Pro",
      price: "£30",
      period: "per month",
      description: "Advanced features for professionals",
      features: [
        "Everything in EezyBuild Basic",
        "Advanced Building Tools",
        "Document upload",
        "Extended Chat History",
        "Priority response time"
      ],
      limitations: [],
      buttonText: "Start Free Trial",
      popular: false
    },
    {
      name: "EezyBuild Pro Max",
      price: "£60",
      period: "per month",
      description: "Complete solution for teams and enterprises",
      features: [
        "Everything in EezyBuild Pro",
        "Advanced Building regulation search",
        "Project Management",
        "Team collaboration",
        "Full category of Advanced Building Tools",
        "Advanced Analytics",
        "Project Plans"
      ],
      limitations: [],
      buttonText: "Start Free Trial",
      popular: true
    },
    {
      name: "EezyBuild Enterprise",
      price: "Custom",
      period: "",
      description: "Please Contact the EezyBuild team to see our competitive Enterprise subscription prices",
      features: [
        "Everything in EezyBuild Pro Max",
        "Custom integrations",
        "Dedicated support",
        "Custom pricing",
        "SLA guarantees"
      ],
      limitations: [],
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  return (
    <LandingLayout>
      <div className="min-h-screen pt-16 pb-20">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Choose Your Plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get access to comprehensive UK Building Regulations tools, AI assistance, and project management features
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => {
              // Define color scheme for each plan
              const getColorScheme = () => {
                switch(plan.name) {
                  case 'EezyBuild Basic':
                    return {
                      border: 'border-amber-500',
                      bg: 'bg-amber-500/10',
                      button: 'bg-amber-600 hover:bg-amber-700'
                    };
                  case 'EezyBuild Pro':
                    return {
                      border: 'border-cyan-500',
                      bg: 'bg-cyan-500/10',
                      button: 'bg-cyan-600 hover:bg-cyan-700'
                    };
                  case 'EezyBuild Pro Max':
                    return {
                      border: 'border-blue-500',
                      bg: 'bg-blue-500/10',
                      button: 'bg-blue-600 hover:bg-blue-700'
                    };
                  case 'EezyBuild Enterprise':
                    return {
                      border: 'border-purple-500',
                      bg: 'bg-purple-500/10',
                      button: 'bg-purple-600 hover:bg-purple-700'
                    };
                  default:
                    return {
                      border: 'border-white/10',
                      bg: 'bg-black/40',
                      button: 'bg-white/10 hover:bg-white/20'
                    };
                }
              };

              const colorScheme = getColorScheme();

              return (
                <div
                  key={plan.name}
                  className={`relative backdrop-blur-sm border-2 rounded-2xl p-8 ${colorScheme.border} ${colorScheme.bg}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                        <span>Most Popular</span>
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground ml-2">/{plan.period}</span>}
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <Check className="text-green-500 mt-1 flex-shrink-0" size={16} />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => {
                      // Navigate to app with signup intent for trial buttons
                      if (plan.buttonText === "Start Free Trial") {
                        navigate('/app?signup=true');
                      } else if (plan.buttonText === "Contact Sales") {
                        window.open('mailto:support@eezybuild.com?subject=Enterprise Subscription Inquiry', '_blank');
                      } else {
                        navigate('/app?signup=true');
                      }
                    }}
                    className={`w-full ${colorScheme.button} text-white`}
                  >
                    {plan.buttonText}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Free Trial Information */}
          <div className="mt-16 text-center">
            <div className="bg-emerald-500/10 rounded-2xl p-8 border border-emerald-500/20 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">
                7-Day Free Trial Available
              </h2>
              <p className="text-muted-foreground mb-6">
                Try any plan of your choice free for 7 days. Card details required to start your trial. Cancel anytime during your trial period and you won't be charged.
              </p>
              <Button
                onClick={() => navigate('/app?signup=true')}
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
              >
                Start Your Free Trial
              </Button>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Can I change plans anytime?
                  </h3>
                  <p className="text-muted-foreground">
                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Is there a free trial?
                  </h3>
                  <p className="text-muted-foreground">
                    Yes, we offer a 7-day free trial for any plan of your choice. Card details are required to start the trial, but you won't be charged if you cancel during the trial period.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    What payment methods do you accept?
                  </h3>
                  <p className="text-muted-foreground">
                    We accept all major credit cards, PayPal, and bank transfers for Enterprise customers.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Is my data secure?
                  </h3>
                  <p className="text-muted-foreground">
                    Absolutely. We use enterprise-grade security with end-to-end encryption and regular security audits.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Do you offer discounts for annual plans?
                  </h3>
                  <p className="text-muted-foreground">
                    Yes, save 20% when you choose annual billing. Contact us for custom Enterprise pricing.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Can I cancel anytime?
                  </h3>
                  <p className="text-muted-foreground">
                    Yes, you can cancel your subscription at any time. Your access continues until the end of your billing period.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-20 text-center">
            <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl p-8 border border-primary/20">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to streamline your building projects?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of professionals who trust EezyBuild for their UK Building Regulations needs
              </p>
              <Button
                onClick={() => navigate('/app?signup=true')}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
              >
                Start Your Free Trial
              </Button>
            </div>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
};

export default SubscriptionsPage;