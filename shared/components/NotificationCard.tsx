import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Notification } from '../types';

interface NotificationCardProps {
  notification: Notification;
  onPress?: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress
}) => {
  return (
    <TouchableOpacity 
      style={[styles.card, styles[notification.type]]} 
      onPress={onPress}
    >
      <Text style={styles.title}>{notification.title}</Text>
      <Text style={styles.message}>{notification.message}</Text>
      <Text style={styles.time}>{notification.time}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  success: {
    backgroundColor: '#064e3b',
    borderLeftColor: '#10b981',
  },
  warning: {
    backgroundColor: '#451a03',
    borderLeftColor: '#f59e0b',
  },
  info: {
    backgroundColor: '#1e3a8a',
    borderLeftColor: '#3b82f6',
  },
  error: {
    backgroundColor: '#7f1d1d',
    borderLeftColor: '#ef4444',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
  },
});