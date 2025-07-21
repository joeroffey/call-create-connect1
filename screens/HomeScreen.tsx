import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ActionCard } from '../shared/components';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>EezyBuild</Text>
          <Text style={styles.subtitle}>Your Building Management Solution</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Welcome to EezyBuild</Text>
          <Text style={styles.sectionText}>
            Manage your building projects, track compliance, and collaborate with your team.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <ActionCard
              title="Projects"
              description="View and manage projects"
            />
            <ActionCard
              title="Documents"
              description="Access building documents"
            />
            <ActionCard
              title="Team"
              description="Collaborate with team members"
            />
            <ActionCard
              title="Notifications"
              description="View notifications and updates"
              onPress={() => navigation.navigate('Notifications')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#d1d5db',
    lineHeight: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});