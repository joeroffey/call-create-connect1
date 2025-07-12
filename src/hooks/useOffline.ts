import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface OfflineData {
  projects: any[];
  schedules: any[];
  conversations: any[];
  lastSync: string;
}

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    // Register service worker
    registerServiceWorker();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Syncing your latest changes...",
      });
      syncDataWhenOnline();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're Offline",
        description: "Don't worry, you can still view your projects and schedules.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for service worker messages
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);

    // Load cached offline data
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        
        // Register for background sync
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
          // Background sync will be handled by the service worker
          console.log('Background sync supported');
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  };

  const handleServiceWorkerMessage = (event: MessageEvent) => {
    const { data } = event;
    
    if (data.type === 'SYNC_OFFLINE_DATA') {
      // Handle syncing offline data
      console.log('Syncing offline data:', data.data);
      // Implement sync logic here
    }
  };

  const storeDataOffline = async (key: keyof OfflineData, data: any[]) => {
    try {
      const currentData = await getOfflineData();
      const updatedData = {
        ...currentData,
        [key]: data,
        lastSync: new Date().toISOString()
      };
      
      localStorage.setItem('eezybuild_offline_data', JSON.stringify(updatedData));
      setOfflineData(updatedData);
      setLastSyncTime(updatedData.lastSync);

      // Send to service worker for caching
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'STORE_OFFLINE_DATA',
          data: { key, data }
        });
      }
    } catch (error) {
      console.error('Failed to store offline data:', error);
    }
  };

  const getOfflineData = async (): Promise<OfflineData> => {
    try {
      const stored = localStorage.getItem('eezybuild_offline_data');
      return stored ? JSON.parse(stored) : {
        projects: [],
        schedules: [],
        conversations: [],
        lastSync: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return {
        projects: [],
        schedules: [],
        conversations: [],
        lastSync: new Date().toISOString()
      };
    }
  };

  const loadOfflineData = async () => {
    const data = await getOfflineData();
    setOfflineData(data);
    setLastSyncTime(data.lastSync);
  };

  const syncDataWhenOnline = async () => {
    if (!isOnline) return;

    try {
      // Trigger background sync if supported
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'TRIGGER_SYNC'
        });
      }
      
      setLastSyncTime(new Date().toISOString());
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const clearOfflineData = () => {
    localStorage.removeItem('eezybuild_offline_data');
    setOfflineData(null);
    setLastSyncTime(null);
  };

  return {
    isOnline,
    offlineData,
    lastSyncTime,
    storeDataOffline,
    getOfflineData,
    syncDataWhenOnline,
    clearOfflineData
  };
};