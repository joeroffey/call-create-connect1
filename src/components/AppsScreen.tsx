
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Ruler, Building2, ArrowRight, BookOpen, Hammer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import VolumetricCalculator from './VolumetricCalculator';
import TimberCalculator from './TimberCalculator';
import ReadyReckoner from './ReadyReckoner';
import TimberGuide from './TimberGuide';
import RoofTilesCalculator from './RoofTilesCalculator';
import BrickCalculator from './BrickCalculator';

interface AppsScreenProps {
  user: any;
  subscriptionTier?: string;
}

const AppsScreen = ({ user, subscriptionTier = 'none' }: AppsScreenProps) => {
  const [activeApp, setActiveApp] = useState<string | null>(null);

  const apps = [
    {
      id: 'volumetric-calculator',
      title: 'Volumetric Calculator',
      description: 'Calculate volumes and material quantities for concrete, aggregates, and other building materials.',
      icon: '📐',
      category: 'Calculators',
      requiredTier: 'basic' // Available for EezyBuild Basic and above
    },
    {
      id: 'timber-calculator',
      title: 'Timber Calculator',
      description: 'Calculate timber requirements for flooring, framing, and roofing projects with cost estimates.',
      icon: '🪵',
      category: 'Calculators',
      requiredTier: 'pro' // Pro and ProMax only
    },
    {
      id: 'ready-reckoner',
      title: 'Ready Reckoner',
      description: 'Quick reference tool for unit conversions, material densities, and standard calculations.',
      icon: '📋',
      category: 'Reference',
      requiredTier: 'pro' // Pro and ProMax only
    },
    {
      id: 'timber-guide',
      title: 'Timber Guide',
      description: 'Comprehensive guide to UK timber grades, species, and building regulations compliance.',
      icon: '📚',
      category: 'Reference',
      requiredTier: 'pro' // Pro and ProMax only
    },
    {
      id: 'roof-tiles-calculator',
      title: 'Roof Tiles Calculator',
      description: 'Calculate roof tile quantities, battens, and materials for UK roofing projects.',
      icon: '🏠',
      category: 'Calculators',
      requiredTier: 'pro' // Pro and ProMax only
    },
    {
      id: 'brick-calculator',
      title: 'Brick Calculator',
      description: 'Calculate brick quantities, mortar, and materials for UK masonry projects.',
      icon: '🧱',
      category: 'Calculators',
      requiredTier: 'pro' // Pro and ProMax only
    }
  ];

  // Helper function to check if user has access to a tool
  const hasAccessToTool = (requiredTier: string) => {
    const tierHierarchy = ['none', 'basic', 'pro', 'enterprise'];
    const userTierIndex = tierHierarchy.indexOf(subscriptionTier);
    const requiredTierIndex = tierHierarchy.indexOf(requiredTier);
    return userTierIndex >= requiredTierIndex;
  };

  const categories = ['All', ...Array.from(new Set(apps.map(app => app.category)))];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredApps = selectedCategory === 'All' 
    ? apps 
    : apps.filter(app => app.category === selectedCategory);

  const handleAppClick = (appId: string) => {
    setActiveApp(appId);
  };

  const handleBackToApps = () => {
    setActiveApp(null);
  };

  // Show the specific app if one is active
  if (activeApp === 'timber-calculator') {
    return <TimberCalculator onBack={() => setActiveApp(null)} />;
  }
  
  if (activeApp === 'volumetric-calculator') {
    return <VolumetricCalculator onBack={() => setActiveApp(null)} />;
  }
  
  if (activeApp === 'ready-reckoner') {
    return <ReadyReckoner onBack={() => setActiveApp(null)} />;
  }

  if (activeApp === 'timber-guide') {
    return <TimberGuide onBack={() => setActiveApp(null)} />;
  }

  if (activeApp === 'roof-tiles-calculator') {
    return <RoofTilesCalculator onBack={() => setActiveApp(null)} />;
  }

  if (activeApp === 'brick-calculator') {
    return <BrickCalculator onBack={() => setActiveApp(null)} />;
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-y-auto">
      <div className="p-6 space-y-6 min-h-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500 bg-clip-text text-transparent">
            Construction Tools
          </h1>
          <p className="text-gray-400">
            Professional tools to help with your building projects
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex justify-center space-x-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category 
                ? "bg-emerald-600 hover:bg-emerald-700" 
                : "border-gray-600 text-gray-300 hover:bg-gray-700"
              }
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredApps.map((app, index) => {
            const hasAccess = hasAccessToTool(app.requiredTier);
            
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`card-professional transition-all duration-300 group cursor-pointer ${
                  hasAccess ? 'hover:border-emerald-500/40' : 'opacity-60'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center border border-emerald-500/20">
                          <span className="text-2xl">{app.icon}</span>
                        </div>
                        <div>
                          <CardTitle className={`text-lg group-hover:text-emerald-300 transition-colors ${
                            hasAccess ? 'text-white' : 'text-gray-400'
                          }`}>
                            {app.title}
                          </CardTitle>
                          {!hasAccess && (
                            <div className="text-xs text-orange-400 mt-1">
                              {app.requiredTier === 'pro' ? 'Pro Required' : 'ProMax Required'}
                            </div>
                          )}
                        </div>
                      </div>
                      <ArrowRight className={`w-5 h-5 transition-all duration-200 ${
                        hasAccess 
                          ? 'text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-1' 
                          : 'text-gray-600'
                      }`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400 mb-4">
                      {app.description}
                    </CardDescription>
                    <Button
                      onClick={() => hasAccess && handleAppClick(app.id)}
                      disabled={!hasAccess}
                      className={`w-full font-medium ${
                        hasAccess 
                          ? 'gradient-emerald hover:from-emerald-600 hover:to-green-600 text-black' 
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {hasAccess ? 'Open Tool' : 'Upgrade Required'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

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
              Essential calculators and references for accurate construction planning and material estimation.
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
