import { useEffect, useRef, useState } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationData {
  title: string;
  body: string;
  data?: any;
  categoryIdentifier?: string;
}

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token || '');
    });

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listen for notification interactions
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      handleNotificationResponse(data);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const handleNotificationResponse = (data: any) => {
    // Handle notification tap actions
    if (data?.screen) {
      // Navigate to specific screen based on notification data
      console.log('Navigate to:', data.screen, data);
    }
  };

  return {
    expoPushToken,
    notification,
  };
};

export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  let token = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10b981',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert(
        'Notifications Disabled',
        'Enable notifications in settings to receive project updates and team messages.',
        [{ text: 'OK' }]
      );
      return null;
    }
    
    try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Replace with your actual project ID
      })).data;
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  } else {
    Alert.alert(
      'Simulator Detected',
      'Push notifications don\'t work on simulators. Please test on a physical device.'
    );
  }

  return token;
};

export const scheduleLocalNotification = async (notificationData: NotificationData, delay: number = 0) => {
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data || {},
        categoryIdentifier: notificationData.categoryIdentifier,
        sound: 'default',
      },
      trigger: delay > 0 ? { seconds: delay } : null,
    });
    
    return identifier;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

export const cancelNotification = async (identifier: string) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};

export const setBadgeCount = async (count: number) => {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
};

export const clearBadge = async () => {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error('Error clearing badge:', error);
  }
};

// Predefined notification categories for EezyBuild
export const setupNotificationCategories = async () => {
  try {
    await Notifications.setNotificationCategoryAsync('project_update', [
      {
        identifier: 'view_project',
        buttonTitle: 'View Project',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'dismiss',
        buttonTitle: 'Dismiss',
        options: { opensAppToForeground: false },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('team_message', [
      {
        identifier: 'reply',
        buttonTitle: 'Reply',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'view_chat',
        buttonTitle: 'View Chat',
        options: { opensAppToForeground: true },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('document_shared', [
      {
        identifier: 'view_document',
        buttonTitle: 'View Document',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'download',
        buttonTitle: 'Download',
        options: { opensAppToForeground: false },
      },
    ]);
  } catch (error) {
    console.error('Error setting up notification categories:', error);
  }
};

// Helper function to send push notifications to team members
export const sendNotificationToTeam = async (
  teamTokens: string[],
  notification: NotificationData
) => {
  // In a real app, this would send to your backend server
  // which would then use Expo's push notification service
  
  const messages = teamTokens.map(token => ({
    to: token,
    sound: 'default',
    title: notification.title,
    body: notification.body,
    data: notification.data,
    categoryId: notification.categoryIdentifier,
  }));

  try {
    // This would typically be sent to your backend
    console.log('Would send notifications:', messages);
    
    // For demo purposes, show a local notification instead
    await scheduleLocalNotification(notification);
  } catch (error) {
    console.error('Error sending team notifications:', error);
  }
};