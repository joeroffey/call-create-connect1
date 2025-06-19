
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Crown, Mail, Calendar, Settings, LogOut, ChevronRight, Camera, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ProfileScreenProps {
  user: any;
  onNavigateToSettings?: () => void;
  onNavigateToAccountSettings?: () => void;
}

const ProfileScreen = ({ user, onNavigateToSettings, onNavigateToAccountSettings }: ProfileScreenProps) => {
  const { subscription, hasActiveSubscription } = useSubscription(user?.id);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Load existing profile image on component mount
  useEffect(() => {
    if (user?.id) {
      loadProfileImage();
    }
  }, [user?.id]);

  const loadProfileImage = async () => {
    if (!user?.id) return;

    try {
      // List files in the user's folder
      const { data, error } = await supabase.storage
        .from('avatars')
        .list(user.id, {
          limit: 1,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      if (data && data.length > 0) {
        // Get the public URL for the most recent avatar
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(`${user.id}/${data[0].name}`);
        
        setProfileImage(urlData.publicUrl);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Support Request');
    const body = encodeURIComponent(`Hello,

I need assistance with my EezyBuild account.

User ID: ${user?.id || 'N/A'}
Email: ${user?.email || 'N/A'}

Please describe your issue below:

`);
    window.location.href = `mailto:info@eezybuild.com?subject=${subject}&body=${body}`;
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setProfileImage(data.publicUrl);
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully"
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const menuItems = [
    {
      icon: Settings,
      label: 'Account Settings',
      description: 'Manage your account preferences',
      action: () => {
        console.log('Navigating to account settings');
        if (onNavigateToAccountSettings) {
          onNavigateToAccountSettings();
        } else {
          toast({
            title: "Coming Soon",
            description: "Account settings will be available soon",
          });
        }
      }
    },
    {
      icon: Crown,
      label: 'Subscription',
      description: 'Manage your subscription plan',
      action: () => {
        console.log('Navigating to subscription settings');
        if (onNavigateToSettings) {
          onNavigateToSettings();
        } else {
          toast({
            title: "Coming Soon",
            description: "Subscription management will be available soon",
          });
        }
      }
    },
    {
      icon: Mail,
      label: 'Contact Support',
      description: 'Get help from our team',
      action: handleContactSupport
    }
  ];

  // Calculate member since date - using created_at from auth.users
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  }) : 'Unknown';

  // Get subscription details
  const subscriptionTier = subscription?.plan_type 
    ? subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)
    : 'Free';

  const subscriptionEndDate = subscription?.current_period_end 
    ? new Date(subscription.current_period_end).toLocaleDateString()
    : null;

  // Get user initials for fallback
  const userInitials = user?.name 
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'U';

  // Check if email is verified
  const isEmailVerified = user?.email_confirmed_at !== null;

  return (
    <div className="flex-1 overflow-y-auto bg-black text-white">
      <div className="px-6 py-8">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="relative inline-block mb-4">
            <Avatar className="w-24 h-24">
              <AvatarImage 
                src={profileImage || undefined} 
                alt="Profile" 
              />
              <AvatarFallback className="bg-gray-800 text-white text-xl">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            
            {/* Upload button */}
            <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
            </label>
            
            {hasActiveSubscription && (
              <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold mb-1">{user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}</h1>
          <p className="text-gray-400 mb-2">{user?.email}</p>
          {hasActiveSubscription && (
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full px-4 py-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-500">{subscriptionTier} Plan</span>
            </div>
          )}
        </motion.div>

        {/* Stats - placeholder for now, will be updated with real data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 border border-gray-800">
            <div className="text-2xl font-bold text-blue-400 mb-1">0</div>
            <div className="text-sm text-gray-400">Queries This Month</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 border border-gray-800">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {hasActiveSubscription ? 'Unlimited' : '0'}
            </div>
            <div className="text-sm text-gray-400">Remaining Queries</div>
          </div>
        </motion.div>

        {/* Menu items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3 mb-8"
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={item.action}
                className="w-full bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 border border-gray-800 hover:border-gray-700 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                      <Icon className="w-6 h-6 text-gray-400 group-hover:text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-white">{item.label}</h3>
                      <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gray-300" />
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Account info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900/30 rounded-2xl p-4 border border-gray-800 mb-6"
        >
          <div className="flex items-center space-x-3 mb-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-400">Member since {memberSince}</span>
          </div>
          <div className="flex items-center space-x-3 mb-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-400">
              {isEmailVerified ? 'Verified account' : 'Account not verified'}
            </span>
          </div>
          {hasActiveSubscription && subscriptionEndDate && (
            <div className="flex items-center space-x-3">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-400">
                Subscription expires {subscriptionEndDate}
              </span>
            </div>
          )}
        </motion.div>

        {/* Sign out button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={handleSignOut}
            variant="outline" 
            className="w-full h-12 border-red-600/30 text-red-400 hover:bg-red-600/10 hover:border-red-500 rounded-xl"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileScreen;
