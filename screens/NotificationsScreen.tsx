import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NotificationCard } from '../shared/components';
import { Notification } from '../shared/types';

const notifications: Notification[] = [
  {
    id: '1',
    title: 'Project Update',
    message: 'Building permit approved for Project Alpha',
    time: '2 hours ago',
    type: 'success'
  },
  {
    id: '2',
    title: 'Document Review',
    message: 'New building code documents require review',
    time: '4 hours ago',
    type: 'warning'
  },
  {
    id: '3',
    title: 'Team Message',
    message: 'Sarah shared new blueprints',
    time: '1 day ago',
    type: 'info'
  },
  {
    id: '4',
    title: 'Compliance Alert',
    message: 'Part L energy efficiency requirements updated',
    time: '2 days ago',
    type: 'info'
  },
];

export default function NotificationsScreen() {
  const renderNotification = ({ item }: { item: Notification }) => (
    <NotificationCard notification={item} />
  );

  return (
    <LinearGradient 
      colors={['#0f172a', '#000000', '#0f172a']} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>Stay updated with your projects</Text>
        </View>
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '400',
  },
  list: {
    padding: 24,
    paddingTop: 8,
  },
});