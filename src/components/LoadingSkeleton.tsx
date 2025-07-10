import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export const AppLoadingSkeleton = () => {
  return (
    <div className="h-screen h-dvh bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white flex flex-col overflow-hidden font-inter fixed w-full top-0 left-0">
      {/* Header Skeleton */}
      <div className="glass border-b border-white/5 px-6 flex-shrink-0 safe-area-top">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Logo skeleton */}
            <div className="w-40 h-24 flex items-center z-50">
              <Skeleton className="w-32 h-12 bg-white/10" />
            </div>
            
            {/* Navigation skeleton */}
            <div 
              style={{ marginLeft: 'auto', marginRight: 'auto', zIndex: '1' }}
              className="hidden md:flex absolute border-b w-full border-white/5 px-6 py-3 backdrop-blur-md z-10"
            >
              <div className="flex w-full max-w-6xl mx-auto justify-center space-x-4">
                {[1, 2, 3, 4, 5].map((index) => (
                  <Skeleton 
                    key={index} 
                    className="h-10 w-20 bg-white/10 rounded-xl" 
                  />
                ))}
              </div>
            </div>
          </motion.div>

          <div className="flex items-center space-x-4 z-50">
            {/* Notification bell skeleton */}
            <Skeleton className="w-9 h-9 rounded-full bg-white/10" />
            {/* Subscription badge skeleton */}
            <Skeleton className="h-8 w-20 bg-white/10 rounded-full" />
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center space-y-4"
          >
            <Skeleton className="w-12 h-12 rounded-full bg-emerald-500/20 mx-auto" />
            <Skeleton className="h-6 w-32 bg-white/10 mx-auto" />
            <Skeleton className="h-4 w-48 bg-white/10 mx-auto" />
          </motion.div>
        </div>
      </div>

      {/* Mobile navigation skeleton */}
      <div className="md:hidden border-t border-white/5 px-4 py-2 flex-shrink-0 safe-area-bottom">
        <div className="flex justify-around">
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="flex flex-col items-center p-2">
              <Skeleton className="w-6 h-6 bg-white/10 rounded" />
              <Skeleton className="w-12 h-3 bg-white/10 mt-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SubscriptionLoadingSkeleton = () => {
  return (
    <div className="flex items-center space-x-2">
      <Skeleton className="h-6 w-16 bg-white/10 rounded-full" />
    </div>
  );
};