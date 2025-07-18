import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationsScreen from '../components/NotificationsScreen';
import { Button } from '@/components/ui/button';

const NotificationsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="glass border-b border-white/5 px-4 sm:px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className="w-28 h-12 sm:w-32 sm:h-16 flex items-center">
              <img 
                src="/lovable-uploads/60efe7f3-1624-45e4-bea6-55cacb90fa21.png" 
                alt="EezyBuild Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-white text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            {/* Subscription Badge */}
            <motion.div 
              className="flex items-center space-x-3 bg-emerald-500/10 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-500/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <Crown className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300 font-medium">
                ProMax
              </span>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 min-h-0 w-full max-w-6xl mx-auto px-4">
          <NotificationsScreen />
      </div>
    </div>
  );
};

export default NotificationsPage;