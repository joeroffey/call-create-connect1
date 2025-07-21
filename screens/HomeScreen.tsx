import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ActionCard } from '../shared/components';

export default function HomeScreen({ navigation }) {
  return (
    <LinearGradient 
      colors={['#0f172a', '#000000', '#0f172a']} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>EezyBuild</Text>
            <Text style={styles.subtitle}>Your AI-Powered Building Regulations Assistant</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Welcome to EezyBuild</Text>
            <Text style={styles.sectionText}>
              Navigate UK building regulations with confidence. Get instant answers, manage documents, and ensure compliance with our intelligent AI assistant.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsContainer}>
              <ActionCard
                title="Projects"
                description="View and manage building projects"
                icon="🏗️"
              />
              <ActionCard
                title="Documents"
                description="Access building regulation documents"
                icon="📋"
              />
              <ActionCard
                title="Team"
                description="Collaborate with team members"
                icon="👥"
              />
              <ActionCard
                title="Notifications"
                description="View notifications and updates"
                icon="🔔"
                onPress={() => navigation.navigate('Notifications')}
              />
            </View>
          </View>

          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Why Choose EezyBuild?</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>⚡</Text>
                <Text style={styles.featureText}>Save hours of research time</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🛡️</Text>
                <Text style={styles.featureText}>Reduce compliance risks</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📱</Text>
                <Text style={styles.featureText}>Expert AI guidance 24/7</Text>
              </View>
            </View>
          </View>
        </ScrollView>
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
  content: {
    padding: 24,
    paddingTop: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  sectionText: {
    fontSize: 16,
    color: '#d1d5db',
    lineHeight: 24,
    fontWeight: '400',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#d1d5db',
    fontWeight: '500',
    flex: 1,
  },
});