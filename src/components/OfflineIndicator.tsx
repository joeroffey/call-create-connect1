import React from 'react';
import { Wifi, WifiOff, Clock } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';
import { formatDistanceToNow } from 'date-fns';

export const OfflineIndicator = () => {
  const { isOnline, lastSyncTime } = useOffline();

  if (isOnline && !lastSyncTime) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
      isOnline 
        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
        : 'bg-amber-100 text-amber-800 border border-amber-200'
    }`}>
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>Online</span>
          {lastSyncTime && (
            <div className="flex items-center gap-1 text-xs opacity-70">
              <Clock className="w-3 h-3" />
              <span>
                Synced {formatDistanceToNow(new Date(lastSyncTime), { addSuffix: true })}
              </span>
            </div>
          )}
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Offline Mode</span>
          {lastSyncTime && (
            <div className="flex items-center gap-1 text-xs opacity-70">
              <Clock className="w-3 h-3" />
              <span>
                Last sync {formatDistanceToNow(new Date(lastSyncTime), { addSuffix: true })}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};