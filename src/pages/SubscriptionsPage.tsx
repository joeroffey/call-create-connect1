import React from "react";
import { useNavigate } from "react-router-dom";
import LandingLayout from "@/components/landing/LandingLayout";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const SubscriptionsPage = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Free",
      price: "£0",
      period: "forever",
      description: "Perfect for getting started with basic building regulations",
      features: [
        "Basic UK Building Regulations search",
        "Up to 10 searches per month",
        "Basic document access",
        "Community support"
      ],
      limitations: [
        "Limited AI chat sessions",
        "No team collaboration",
        "No project management",
        "No advanced calculators"
      ],
      buttonText: "Get Started",
      popular: false
    },
    {
      name: "Professional",
      price: "£29",
      period: "per month",
      description: "Ideal for professionals who need comprehensive tools",
      features: [
        "Unlimited Building Regulations search",
        "Advanced AI chat assistant",
        "Project management tools",
        "Team collaboration (up to 5 members)",
        "Building calculators",
        "Document management",
        "Priority support",
        "Export capabilities"
      ],
      limitations: [],
      buttonText: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "£99",
      period: "per month",
      description: "For large teams and organizations",
      features: [
        "Everything in Professional",
        "Unlimited team members",
        "Advanced analytics",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantees",
        "Custom training sessions",
        "White-label options",
        "Advanced security features"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative bg-black/40 backdrop-blur-sm border rounded-2xl p-8 ${
                  plan.popular 
                    ? "border-primary ring-2 ring-primary/20 scale-105" 
                    : "border-white/10"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">/{plan.period}</span>
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
                  
                  {plan.limitations.map((limitation, limitationIndex) => (
                    <div key={limitationIndex} className="flex items-start space-x-3">
                      <X className="text-red-500 mt-1 flex-shrink-0" size={16} />
                      <span className="text-muted-foreground line-through opacity-60">{limitation}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => navigate('/app')}
                  className={`w-full ${
                    plan.popular
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </div>
            ))}
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
                    Yes, we offer a 14-day free trial for the Professional plan with no credit card required.
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
                    Yes, save 20% when you choose annual billing. Contact us for custom enterprise pricing.
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
                onClick={() => navigate('/app')}
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