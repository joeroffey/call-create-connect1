import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Search, Wrench, FileText, Calculator, Building, Users, Settings, Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Team {
  id: string;
  name: string;
  logo_url?: string;
}

interface HomeScreenProps {
  user: any;
  subscriptionTier: string;
  teams?: Team[];
  onNavigateToChat: () => void;
  onNavigateToSearch: () => void;
  onNavigateToApps: () => void;
  onNavigateToPersonalWorkspace: () => void;
  onNavigateToTeamWorkspace: (teamId: string) => void;
  onNavigateToNotifications: () => void;
  onViewPlans: () => void;
}

const HomeScreen = ({ 
  user, 
  subscriptionTier,
  teams = [],
  onNavigateToChat, 
  onNavigateToSearch, 
  onNavigateToApps, 
  onNavigateToPersonalWorkspace,
  onNavigateToTeamWorkspace,
  onNavigateToNotifications,
  onViewPlans 
}: HomeScreenProps) => {
  // Get user's first name
  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  const quickActions = [
    {
      title: 'AI Chat Assistant',
      description: 'Get instant help with building regulations and planning questions',
      icon: MessageCircle,
      action: onNavigateToChat,
      available: true,
      gradient: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Advanced Search',
      description: 'Search through comprehensive building regulations database',
      icon: Search,
      action: onNavigateToSearch,
      available: subscriptionTier === 'enterprise',
      gradient: 'from-blue-500 to-blue-600',
      requiresUpgrade: subscriptionTier !== 'enterprise'
    },
    {
      title: 'Building Tools',
      description: 'Access calculators, ready reckoners, and professional tools',
      icon: Wrench,
      action: onNavigateToApps,
      available: subscriptionTier !== 'none',
      gradient: 'from-purple-500 to-purple-600',
      requiresUpgrade: subscriptionTier === 'none'
    },
    {
      title: 'Personal Workspace',
      description: 'Manage your personal projects and documents',
      icon: Building,
      action: onNavigateToPersonalWorkspace,
      available: true,
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  const recentActivities = [
    { 
      title: 'Recent project updates', 
      icon: Building, 
      count: 3, 
      action: onNavigateToPersonalWorkspace,
      clickable: true 
    },
    { 
      title: 'Team notifications', 
      icon: Bell, 
      count: 2, 
      action: onNavigateToNotifications,
      clickable: true 
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 pb-32 space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {firstName}! 
          <motion.span
            animate={{ 
              rotate: [0, 14, -8, 14, -4, 10, 0, 0] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
            className="inline-block ml-2 origin-bottom-right"
            style={{ transformOrigin: '70% 70%' }}
          >
            👋
          </motion.span>
        </h1>
        <p className="text-gray-400 text-lg">
          Your building regulations hub awaits
        </p>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card 
                  className={`
                    bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-200 cursor-pointer group
                    ${!action.available && action.requiresUpgrade ? 'opacity-60' : ''}
                  `}
                  onClick={action.requiresUpgrade ? onViewPlans : action.action}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${action.gradient} group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-2 flex items-center">
                          {action.title}
                          {action.requiresUpgrade && (
                            <span className="ml-2 text-xs bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-2 py-1 rounded-full">
                              Upgrade
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Team Workspaces */}
      {teams.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold text-white">Team Workspaces</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-200 cursor-pointer group"
                  onClick={() => onNavigateToTeamWorkspace(team.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 group-hover:scale-110 transition-transform duration-200">
                        {team.logo_url ? (
                          <img 
                            src={team.logo_url} 
                            alt={`${team.name} logo`}
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <Users className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-2">
                          {team.name}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Collaborate with your team members
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => {
            const Icon = activity.icon;
            
            return (
              <motion.div
                key={activity.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card 
                  className={`bg-gray-900/30 border-gray-800 transition-colors ${
                    activity.clickable ? 'hover:border-gray-700 cursor-pointer hover:bg-gray-900/50' : ''
                  }`}
                  onClick={activity.clickable ? activity.action : undefined}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-emerald-400" />
                        <span className="text-white">{activity.title}</span>
                      </div>
                      <span className="text-emerald-400 font-semibold">
                        {activity.count}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Subscription Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <Card className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white mb-2">
                  Current Plan: {subscriptionTier === 'none' ? 'Free Trial' : 
                    subscriptionTier === 'basic' ? 'EezyBuild' :
                    subscriptionTier === 'pro' ? 'Pro' :
                    subscriptionTier === 'enterprise' ? 'ProMax' : 'Free Trial'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {subscriptionTier === 'none' ? 'Upgrade to access more features' :
                   'Thank you for being a subscriber!'}
                </p>
              </div>
              {subscriptionTier === 'none' && (
                <button
                  onClick={onViewPlans}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200"
                >
                  Upgrade
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default HomeScreen;