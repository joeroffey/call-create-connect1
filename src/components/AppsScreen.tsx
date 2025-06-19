
import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, Ruler, HardHat, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AppsScreenProps {
  user: any;
}

const AppsScreen = ({ user }: AppsScreenProps) => {
  const apps = [
    {
      id: 'volumetric-calculator',
      title: 'Volumetric Calculator',
      description: 'Calculate volumes for concrete, excavation, and material quantities',
      icon: Calculator,
      comingSoon: true
    },
    {
      id: 'timber-calculator',
      title: 'Timber Calculator',
      description: 'Calculate timber requirements for construction projects',
      icon: Ruler,
      comingSoon: true
    },
    {
      id: 'cement-calculator',
      title: 'Cement Calculator',
      description: 'Calculate cement and mortar quantities for various applications',
      icon: HardHat,
      comingSoon: true
    },
    {
      id: 'ready-reckoner',
      title: 'Ready Reckoner',
      description: 'Quick reference for common building calculations and conversions',
      icon: Building2,
      comingSoon: true
    }
  ];

  const handleAppClick = (appId: string) => {
    // For now, just show that it's coming soon
    console.log(`Opening ${appId}`);
  };

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
        <div className="grid gap-4 md:grid-cols-2">
          {apps.map((app, index) => {
            const Icon = app.icon;
            
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
                          <Icon className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-white group-hover:text-emerald-300 transition-colors">
                            {app.title}
                          </CardTitle>
                          {app.comingSoon && (
                            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                              Coming Soon
                            </span>
                          )}
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
                      disabled={app.comingSoon}
                      className="w-full gradient-emerald hover:from-emerald-600 hover:to-green-600 text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {app.comingSoon ? 'Coming Soon' : 'Open App'}
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
              More Apps Coming Soon
            </h3>
            <p className="text-gray-400 mb-4">
              We're continuously developing new tools to help construction professionals with their daily calculations and project planning.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-emerald-400">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>In Development</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AppsScreen;
