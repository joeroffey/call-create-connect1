import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, ArrowRight, Crown, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DemoAppsScreenProps {
  user: any;
  subscriptionTier?: string;
  onViewPlans?: () => void;
}

const DemoAppsScreen = ({ user, subscriptionTier = 'pro', onViewPlans }: DemoAppsScreenProps) => {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  const demoApps = [
    {
      id: 'volumetric-calculator',
      title: 'Volumetric Calculator',
      description: 'Calculate volumes and material quantities for concrete, aggregates, and other building materials.',
      icon: '📐',
      category: 'Calculators'
    },
    {
      id: 'timber-calculator',
      title: 'Timber Calculator',
      description: 'Calculate timber requirements for flooring, framing, and roofing projects with cost estimates.',
      icon: '🪵',
      category: 'Calculators'
    },
    {
      id: 'ready-reckoner',
      title: 'Ready Reckoner',
      description: 'Quick reference tool for unit conversions, material densities, and standard calculations.',
      icon: '📋',
      category: 'Reference'
    },
    {
      id: 'timber-guide',
      title: 'Timber Guide',
      description: 'Comprehensive guide to UK timber grades, species, and building regulations compliance.',
      icon: '📚',
      category: 'Reference'
    },
    {
      id: 'roof-tiles-calculator',
      title: 'Roof Tiles Calculator',
      description: 'Calculate roof tile quantities, battens, and materials for UK roofing projects.',
      icon: '🏠',
      category: 'Calculators'
    },
    {
      id: 'brick-calculator',
      title: 'Brick Calculator',
      description: 'Calculate brick quantities, mortar, and materials for UK masonry projects.',
      icon: '🧱',
      category: 'Calculators'
    }
  ];

  if (selectedApp) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-950 via-black to-gray-950 overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedApp(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="text-center py-8">
            <div className="text-6xl mb-4">
              {demoApps.find(app => app.id === selectedApp)?.icon}
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {demoApps.find(app => app.id === selectedApp)?.title}
            </h2>
            <p className="text-gray-400 mb-8">
              {demoApps.find(app => app.id === selectedApp)?.description}
            </p>
            
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Demo Tool Interface</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300">Length (m):</span>
                  <div className="w-20 h-8 bg-gray-700 rounded border"></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300">Width (m):</span>
                  <div className="w-20 h-8 bg-gray-700 rounded border"></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300">Height (m):</span>
                  <div className="w-20 h-8 bg-gray-700 rounded border"></div>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Calculate
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-950 via-black to-gray-950 overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-xl font-bold mb-2 bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500 bg-clip-text text-transparent">
            Construction Tools
          </h1>
          <p className="text-gray-400 text-sm">
            Professional tools for building projects
          </p>
        </motion.div>

        {/* Apps Grid */}
        <div className="space-y-3">
          {demoApps.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="bg-gray-900/40 border-gray-700 hover:border-emerald-500/40 transition-all duration-300 group cursor-pointer"
                onClick={() => setSelectedApp(app.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center border border-emerald-500/20">
                        <span className="text-lg">{app.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-sm group-hover:text-emerald-300 transition-colors">
                          {app.title}
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">
                          {app.category}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900/40 border border-gray-700 rounded-xl p-4 mt-6"
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-emerald-300 mb-2">
              Professional Tools
            </h3>
            <p className="text-gray-400 text-sm mb-3">
              All the essential calculators and references for accurate construction planning.
            </p>
            <div className="flex items-center justify-center space-x-2 text-xs text-emerald-400">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>Always Updated</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DemoAppsScreen;