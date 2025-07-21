import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

interface ProjectDetailProps {
  navigation: any;
  route: {
    params: {
      project: {
        id: string;
        name: string;
        description: string;
        status: string;
        progress: number;
        dueDate: string;
        teamMembers: number;
        documents: number;
      };
    };
  };
}

export default function ProjectDetailScreen({ navigation, route }: ProjectDetailProps) {
  const { project } = route.params;
  const [currentProgress, setCurrentProgress] = useState(project.progress);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'completed':
        return '#3b82f6';
      case 'on-hold':
        return '#f59e0b';
      case 'planning':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'on-hold':
        return 'On Hold';
      case 'planning':
        return 'Planning';
      default:
        return 'Unknown';
    }
  };

  const tasks = [
    { id: '1', title: 'Site preparation', completed: true, dueDate: '2024-01-15' },
    { id: '2', title: 'Foundation work', completed: true, dueDate: '2024-02-01' },
    { id: '3', title: 'Structural framework', completed: false, dueDate: '2024-03-15' },
    { id: '4', title: 'Electrical installation', completed: false, dueDate: '2024-04-01' },
    { id: '5', title: 'Plumbing systems', completed: false, dueDate: '2024-04-15' },
  ];

  const milestones = [
    { id: '1', title: 'Planning Phase Complete', date: '2024-01-01', completed: true },
    { id: '2', title: 'Foundation Complete', date: '2024-02-15', completed: true },
    { id: '3', title: 'Structure 50% Complete', date: '2024-03-30', completed: false },
    { id: '4', title: 'Systems Installation', date: '2024-05-01', completed: false },
  ];

  const handleStartChat = () => {
    Alert.alert(
      'Start Project Chat',
      'Would you like to start a chat session for this project?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Chat', onPress: () => {
          // Navigate to chat with project context
          navigation.navigate('Home');
        }},
      ]
    );
  };

  const TaskItem = ({ task }) => (
    <View style={styles.taskItem}>
      <View style={styles.taskHeader}>
        <Ionicons
          name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
          size={20}
          color={task.completed ? '#10b981' : '#6b7280'}
        />
        <Text style={[styles.taskTitle, task.completed && styles.taskCompleted]}>
          {task.title}
        </Text>
      </View>
      <Text style={styles.taskDate}>Due: {task.dueDate}</Text>
    </View>
  );

  const MilestoneItem = ({ milestone }) => (
    <View style={styles.milestoneItem}>
      <View style={styles.milestoneIndicator}>
        <View style={[
          styles.milestoneCircle,
          { backgroundColor: milestone.completed ? '#10b981' : '#6b7280' }
        ]} />
        {milestone.id !== '4' && <View style={styles.milestoneLine} />}
      </View>
      <View style={styles.milestoneContent}>
        <Text style={[styles.milestoneTitle, milestone.completed && styles.milestoneCompleted]}>
          {milestone.title}
        </Text>
        <Text style={styles.milestoneDate}>{milestone.date}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>{project.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(project.status) }]}>
                {getStatusText(project.status)}
              </Text>
            </View>
          </View>
          <Text style={styles.description}>{project.description}</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleStartChat}>
            <Ionicons name="chatbubbles" size={20} color="#10b981" />
            <Text style={styles.actionText}>Start Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Documents', { projectId: project.id })}
          >
            <Ionicons name="document-text" size={20} color="#10b981" />
            <Text style={styles.actionText}>Documents</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Team', { projectId: project.id })}
          >
            <Ionicons name="people" size={20} color="#10b981" />
            <Text style={styles.actionText}>Team</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Overview</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Overall Progress</Text>
              <Text style={styles.progressPercentage}>{currentProgress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${currentProgress}%`,
                    backgroundColor: getStatusColor(project.status),
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{project.teamMembers}</Text>
              <Text style={styles.statLabel}>Team Members</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{project.documents}</Text>
              <Text style={styles.statLabel}>Documents</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{tasks.filter(t => t.completed).length}/{tasks.length}</Text>
              <Text style={styles.statLabel}>Tasks Done</Text>
            </View>
          </View>
        </View>

        {/* Tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Tasks</Text>
          <View style={styles.tasksList}>
            {tasks.slice(0, 3).map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </View>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Tasks</Text>
            <Ionicons name="chevron-forward" size={16} color="#10b981" />
          </TouchableOpacity>
        </View>

        {/* Milestones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Milestones</Text>
          <View style={styles.milestonesList}>
            {milestones.map((milestone) => (
              <MilestoneItem key={milestone.id} milestone={milestone} />
            ))}
          </View>
        </View>

        {/* Project Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Information</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Due Date</Text>
              <Text style={styles.infoValue}>{project.dueDate}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Project ID</Text>
              <Text style={styles.infoValue}>{project.id}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Created</Text>
              <Text style={styles.infoValue}>2024-01-01</Text>
            </View>
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
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#d1d5db',
    lineHeight: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  actionText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  progressContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    color: '#d1d5db',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  tasksList: {
    gap: 12,
  },
  taskItem: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
    flex: 1,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  taskDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 32,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 12,
  },
  viewAllText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  milestonesList: {
    paddingLeft: 8,
  },
  milestoneItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  milestoneIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  milestoneCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  milestoneLine: {
    width: 2,
    height: 24,
    backgroundColor: '#374151',
    marginTop: 8,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  milestoneCompleted: {
    color: '#10b981',
  },
  milestoneDate: {
    fontSize: 14,
    color: '#9ca3af',
  },
  infoList: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  infoLabel: {
    fontSize: 16,
    color: '#9ca3af',
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});