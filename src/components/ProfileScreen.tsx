import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Crown, 
  Settings, 
  ArrowLeft,
  Zap,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';

interface ProfileScreenProps {
  user: any;
  onNavigateToSettings: () => void;
  onNavigateToAccountSettings: () => void;
}

const ProfileScreen = ({ user, onNavigateToSettings, onNavigateToAccountSettings }: ProfileScreenProps) => {
  const { subscription, hasActiveSubscription, createProMaxDemo } = useSubscription(user?.id);
  const [isActivatingDemo, setIsActivatingDemo] = useState(false);

  const handleActivateProMaxDemo = async () => {
    setIsActivatingDemo(true);
    try {
      await createProMaxDemo();
      // Refresh the page to see the changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } finally {
      setIsActivatingDemo(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-black text-white">
      <div className="px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{user?.name || 'User'}</h1>
          <p className="text-gray-400">{user?.email}</p>
        </motion.div>

        {/* Subscription Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                hasActiveSubscription ? 'bg-emerald-500' : 'bg-gray-600'
              }`}>
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Subscription Status</h3>
                <p className="text-sm text-gray-400">
                  {hasActiveSubscription 
                    ? `Active - ${subscription?.plan_type === 'basic' ? 'Basic' : 
                                   subscription?.plan_type === 'pro' ? 'Pro' : 
                                   subscription?.plan_type === 'enterprise' ? 'ProMax' : 'Unknown'}`
                    : 'Free Plan'
                  }
                </p>
              </div>
            </div>
            <Button
              onClick={onNavigateToSettings}
              variant="outline"
              size="sm"
              className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10"
            >
              {hasActiveSubscription ? 'Manage' : 'Upgrade'}
            </Button>
          </div>
          
          {/* Developer Demo Button */}
          {user?.email === 'josephh.roffey@gmail.com' && subscription?.plan_type !== 'enterprise' && (
            <div className="border-t border-gray-700 pt-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Developer Access</p>
                    <p className="text-xs text-gray-400">Activate ProMax demo for testing</p>
                  </div>
                </div>
                <Button
                  onClick={handleActivateProMaxDemo}
                  disabled={isActivatingDemo}
                  size="sm"
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
                >
                  {isActivatingDemo ? 'Activating...' : 'Activate ProMax'}
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* User Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
              <User className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm text-gray-400">Full Name</p>
                <p className="text-white">{user?.name || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm text-gray-400">Date of Birth</p>
                <p className="text-white">{user?.dateOfBirth || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm text-gray-400">Address</p>
                <p className="text-white">{user?.address || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm text-gray-400">Occupation</p>
                <p className="text-white">{user?.occupation || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={onNavigateToAccountSettings}
            variant="outline"
            className="w-full h-12 bg-gray-900/50 border-gray-700 hover:bg-gray-800/50 text-white"
          >
            <Settings className="w-5 h-5 mr-3" />
            Account Settings
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileScreen;
