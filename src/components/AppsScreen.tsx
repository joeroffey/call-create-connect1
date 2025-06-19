
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Ruler, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import VolumetricCalculator from './VolumetricCalculator';
import TimberCalculator from './TimberCalculator';
import ReadyReckoner from './ReadyReckoner';
import BuildingRegsScraper from './BuildingRegsScraper';

interface AppsScreenProps {
  user: any;
}

const AppsScreen = ({ user }: AppsScreenProps) => {
  const [activeApp, setActiveApp] = useState<string | null>(null);

  const apps = [
    {
      id: 'timber-calculator',
      title: 'Timber Calculator',
      description: 'Calculate timber requirements for flooring, framing, and roofing projects with cost estimates.',
      icon: '🪵',
      category: 'Calculators'
    },
    {
      id: 'volumetric-calculator',
      title: 'Volumetric Calculator',
      description: 'Calculate volumes and material quantities for concrete, aggregates, and other building materials.',
      icon: '📐',
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
      id: 'building-regs-scraper',
      title: 'Building Regs Scraper',
      description: 'Automated tool to scrape and update building regulations from gov.uk website.',
      icon: '🔄',
      category: 'Automation'
    }
  ];

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
  
  if (activeApp === 'building-regs-scraper') {
    return <BuildingRegsScraper onBack={() => setActiveApp(null)} />;
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
            Construction Apps
          </h1>
          <p className="text-gray-400">
            Professional tools to help with your building projects
          </p>
        </motion.div>

        {/* Apps Grid */}
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
                      Open App
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
              All the essential calculators and references you need for accurate construction planning and material estimation.
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
