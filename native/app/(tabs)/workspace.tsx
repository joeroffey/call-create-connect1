import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Project {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'completed' | 'draft';
  lastModified: string;
}

export default function WorkspaceScreen() {
  const [activeTab, setActiveTab] = useState<'projects' | 'documents' | 'team'>('projects');
  
  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'Kitchen Extension',
      type: 'Residential Extension',
      status: 'active',
      lastModified: '2 hours ago',
    },
    {
      id: '2',
      name: 'Office Renovation',
      type: 'Commercial Renovation',
      status: 'active',
      lastModified: '1 day ago',
    },
    {
      id: '3',
      name: 'Bathroom Upgrade',
      type: 'Residential Renovation',
      status: 'completed',
      lastModified: '1 week ago',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'completed':
        return '#3b82f6';
      case 'draft':
        return '#f59e0b';
      default:
        return '#9ca3af';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity style={styles.projectCard}>
      <View style={styles.projectHeader}>
        <Text style={styles.projectName}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      <Text style={styles.projectType}>{item.type}</Text>
      <Text style={styles.lastModified}>Last modified: {item.lastModified}</Text>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'projects':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Projects</Text>
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={20} color="#ffffff" />
                <Text style={styles.addButtonText}>New Project</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={projects}
              renderItem={renderProject}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        );
      
      case 'documents':
        return (
          <View style={styles.tabContent}>
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateTitle}>No Documents</Text>
              <Text style={styles.emptyStateText}>
                Your project documents will appear here
              </Text>
            </View>
          </View>
        );
      
      case 'team':
        return (
          <View style={styles.tabContent}>
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateTitle}>No Team Members</Text>
              <Text style={styles.emptyStateText}>
                Invite team members to collaborate on projects
              </Text>
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabBar}>
        {(['projects', 'documents', 'team'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {renderTabContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#10b981',
  },
  tabText: {
    color: '#9ca3af',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#ffffff',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
  projectCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  projectType: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  lastModified: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
  },
});