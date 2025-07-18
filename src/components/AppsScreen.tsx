
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Ruler, Building2, ArrowRight, BookOpen, Hammer, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import VolumetricCalculator from './VolumetricCalculator';
import TimberCalculator from './TimberCalculator';
import ReadyReckoner from './ReadyReckoner';
import TimberGuide from './TimberGuide';
import RoofTilesCalculator from './RoofTilesCalculator';
import BrickCalculator from './BrickCalculator';
import DrawingScaler from './DrawingScaler';

interface AppsScreenProps {
  user: any;
  subscriptionTier?: string;
  onViewPlans?: () => void;
}

const AppsScreen = ({ user, subscriptionTier = 'none', onViewPlans }: AppsScreenProps) => {
  const [activeApp, setActiveApp] = useState<string | null>(null);

  const allApps = [
    {
      id: 'volumetric-calculator',
      title: 'Volumetric Calculator',
      description: 'Calculate volumes and material quantities for concrete, aggregates, and other building materials.',
      icon: '📐',
      category: 'Calculators',
      minTier: 'basic'
    },
    {
      id: 'timber-calculator',
      title: 'Timber Calculator',
      description: 'Calculate timber requirements for flooring, framing, and roofing projects with cost estimates.',
      icon: '🪵',
      category: 'Calculators',
      minTier: 'pro'
    },
    {
      id: 'ready-reckoner',
      title: 'Ready Reckoner',
      description: 'Quick reference tool for unit conversions, material densities, and standard calculations.',
      icon: '📋',
      category: 'Reference',
      minTier: 'pro'
    },
    {
      id: 'timber-guide',
      title: 'Timber Guide',
      description: 'Comprehensive guide to UK timber grades, species, and building regulations compliance.',
      icon: '📚',
      category: 'Reference',
      minTier: 'pro'
    },
    {
      id: 'roof-tiles-calculator',
      title: 'Roof Tiles Calculator',
      description: 'Calculate roof tile quantities, battens, and materials for UK roofing projects.',
      icon: '🏠',
      category: 'Calculators',
      minTier: 'pro'
    },
    {
      id: 'brick-calculator',
      title: 'Brick Calculator',
      description: 'Calculate brick quantities, mortar, and materials for UK masonry projects.',
      icon: '🧱',
      category: 'Calculators',
      minTier: 'pro'
    },
    {
      id: 'drawing-scaler',
      title: 'Drawing Scaler',
      description: 'AI-powered precision measurement tool for architectural drawings. Upload PDFs or images and get instant real-world measurements.',
      icon: '📐',
      category: 'AI Tools',
      minTier: 'basic'
    }
  ];

  // Filter apps based on subscription tier
  const getAvailableApps = () => {
    if (subscriptionTier === 'basic') {
      return allApps.filter(app => app.minTier === 'basic');
    } else if (subscriptionTier === 'pro' || subscriptionTier === 'enterprise') {
      return allApps;
    }
    return [];
  };

  const availableApps = getAvailableApps();
  const unavailableApps = allApps.filter(app => !availableApps.includes(app));

  const categories = ['All', ...Array.from(new Set(availableApps.map(app => app.category)))];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredApps = selectedCategory === 'All' 
    ? availableApps 
    : availableApps.filter(app => app.category === selectedCategory);

  const handleAppClick = (appId: string) => {
    setActiveApp(appId);
    // Scroll to top when opening a tool
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToApps = () => {
    setActiveApp(null);
    // Scroll to top when returning to apps list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show the specific app if one is active
  if (activeApp === 'timber-calculator') {
    return <TimberCalculator onBack={handleBackToApps} />;
  }
  
  if (activeApp === 'volumetric-calculator') {
    return <VolumetricCalculator onBack={handleBackToApps} />;
  }
  
  if (activeApp === 'ready-reckoner') {
    return <ReadyReckoner onBack={handleBackToApps} />;
  }

  if (activeApp === 'timber-guide') {
    return <TimberGuide onBack={handleBackToApps} />;
  }

  if (activeApp === 'roof-tiles-calculator') {
    return <RoofTilesCalculator onBack={handleBackToApps} />;
  }

  if (activeApp === 'brick-calculator') {
    return <BrickCalculator onBack={handleBackToApps} />;
  }

  if (activeApp === 'drawing-scaler') {
    return <DrawingScaler onBack={handleBackToApps} />;
  }

  return (
    <div className="h-full bg-gradient-to-br rounded-xl from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      <div className="p-4 sm:p-6 pb-32 space-y-6 min-h-full overflow-y-auto">{/* Added pb-32 for mobile nav spacing */}
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center sm:text-left"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500 bg-clip-text text-transparent">
            Construction Tools
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Professional tools to help with your building projects
          </p>
        </motion.div>

        {/* Category Filter */}
        {availableApps.length > 0 && (
          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`text-xs sm:text-sm ${selectedCategory === category 
                  ? "bg-emerald-600 hover:bg-emerald-700" 
                  : "border-gray-600 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        )}

        {/* Available Apps Grid */}
        {filteredApps.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredApps.map((app, index) => {
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="card-professional hover:border-emerald-500/40 transition-all duration-300 group cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center border border-emerald-500/20">
                            <span className="text-2xl">{app.icon}</span>
                          </div>
                          <div>
                            <CardTitle className="text-lg text-white group-hover:text-emerald-300 transition-colors">
                              {app.title}
                            </CardTitle>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-400 mb-4">
                        {app.description}
                      </CardDescription>
                      <Button
                        onClick={() => handleAppClick(app.id)}
                        className="w-full gradient-emerald hover:from-emerald-600 hover:to-green-600 text-black font-medium"
                      >
                        Open Tool
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Upgrade message for EezyBuild subscribers */}
        {subscriptionTier === 'basic' && unavailableApps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6 text-center"
          >
            <Crown className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Unlock More Tools</h3>
            <p className="text-gray-400 mb-4">
              Get access to {unavailableApps.length} more professional tools including timber calculators, ready reckoner, and building guides with Pro or ProMax
            </p>
            {onViewPlans && (
              <Button 
                onClick={onViewPlans}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            )}
          </motion.div>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-professional rounded-2xl p-6 mt-8"
        >
          <div className="text-center">
            <h3 className="text-xl font-semibold text-emerald-300 mb-2">
              Professional Construction Tools
            </h3>
            <p className="text-gray-400 mb-4">
              {subscriptionTier === 'basic' 
                ? "Your EezyBuild plan includes the volumetric calculator. Upgrade for more tools and features."
                : "All the essential calculators and references you need for accurate construction planning and material estimation."
              }
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-emerald-400">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>Always Updated</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AppsScreen;
