import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
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
];

export default function NotificationsScreen() {
  const renderNotification = ({ item }: { item: Notification }) => (
    <NotificationCard notification={item} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
      </View>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  list: {
    padding: 20,
    paddingTop: 10,
  },
});