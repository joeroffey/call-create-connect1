import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface OfflineData {
  projects: any[];
  documents: any[];
  teamMembers: any[];
  notifications: any[];
  lastSync: string;
}

const STORAGE_KEYS = {
  PROJECTS: '@EezyBuild:projects',
  DOCUMENTS: '@EezyBuild:documents',
  TEAM_MEMBERS: '@EezyBuild:teamMembers',
  NOTIFICATIONS: '@EezyBuild:notifications',
  LAST_SYNC: '@EezyBuild:lastSync',
  OFFLINE_QUEUE: '@EezyBuild:offlineQueue',
};

class OfflineStorageService {
  // Save data to local storage
  async saveProjects(projects: any[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects offline:', error);
    }
  }

  async saveDocuments(documents: any[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    } catch (error) {
      console.error('Error saving documents offline:', error);
    }
  }

  async saveTeamMembers(teamMembers: any[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(teamMembers));
    } catch (error) {
      console.error('Error saving team members offline:', error);
    }
  }

  async saveNotifications(notifications: any[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications offline:', error);
    }
  }

  // Load data from local storage
  async loadProjects(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading projects offline:', error);
      return [];
    }
  }

  async loadDocuments(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading documents offline:', error);
      return [];
    }
  }

  async loadTeamMembers(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TEAM_MEMBERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading team members offline:', error);
      return [];
    }
  }

  async loadNotifications(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading notifications offline:', error);
      return [];
    }
  }

  // Offline queue for actions performed while offline
  async addToOfflineQueue(action: any) {
    try {
      const queue = await this.getOfflineQueue();
      queue.push({
        ...action,
        timestamp: new Date().toISOString(),
        id: Date.now().toString(),
      });
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.error('Error adding to offline queue:', error);
    }
  }

  async getOfflineQueue(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting offline queue:', error);
      return [];
    }
  }

  async clearOfflineQueue() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    } catch (error) {
      console.error('Error clearing offline queue:', error);
    }
  }

  // Sync management
  async setLastSyncTime(timestamp: string) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
    } catch (error) {
      console.error('Error setting last sync time:', error);
    }
  }

  async getLastSyncTime(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }

  // Process offline queue when back online
  async processOfflineQueue(onProcess: (action: any) => Promise<void>) {
    try {
      const queue = await this.getOfflineQueue();
      
      for (const action of queue) {
        try {
          await onProcess(action);
        } catch (error) {
          console.error('Error processing offline action:', error);
          // Keep failed actions in queue for retry
          continue;
        }
      }
      
      // Clear queue after successful processing
      await this.clearOfflineQueue();
    } catch (error) {
      console.error('Error processing offline queue:', error);
    }
  }

  // Full data sync
  async syncAllData(
    onlineData: {
      projects?: any[];
      documents?: any[];
      teamMembers?: any[];
      notifications?: any[];
    }
  ) {
    try {
      if (onlineData.projects) {
        await this.saveProjects(onlineData.projects);
      }
      if (onlineData.documents) {
        await this.saveDocuments(onlineData.documents);
      }
      if (onlineData.teamMembers) {
        await this.saveTeamMembers(onlineData.teamMembers);
      }
      if (onlineData.notifications) {
        await this.saveNotifications(onlineData.notifications);
      }
      
      await this.setLastSyncTime(new Date().toISOString());
    } catch (error) {
      console.error('Error syncing all data:', error);
    }
  }

  // Clear all offline data
  async clearAllData() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.PROJECTS,
        STORAGE_KEYS.DOCUMENTS,
        STORAGE_KEYS.TEAM_MEMBERS,
        STORAGE_KEYS.NOTIFICATIONS,
        STORAGE_KEYS.LAST_SYNC,
        STORAGE_KEYS.OFFLINE_QUEUE,
      ]);
    } catch (error) {
      console.error('Error clearing all offline data:', error);
    }
  }

  // Get storage info
  async getStorageInfo() {
    if (Platform.OS === 'ios') {
      // iOS doesn't provide storage info easily
      return {
        used: 'Unknown',
        available: 'Unknown',
      };
    }
    
    try {
      // For Android, we can get approximate info
      const keys = await AsyncStorage.getAllKeys();
      const eezybuildKeys = keys.filter(key => key.startsWith('@EezyBuild:'));
      
      let totalSize = 0;
      for (const key of eezybuildKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return {
        used: `${(totalSize / 1024).toFixed(2)} KB`,
        available: 'Available', // AsyncStorage doesn't have size limits
        itemCount: eezybuildKeys.length,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        used: 'Unknown',
        available: 'Unknown',
      };
    }
  }
}

export const offlineStorage = new OfflineStorageService();