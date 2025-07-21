import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold' | 'planning';
  progress: number;
  dueDate: string;
  teamMembers: number;
  documents: number;
}

export default function ProjectsScreen({ navigation }) {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Riverside Apartments',
      description: 'Modern residential complex with 50 units',
      status: 'active',
      progress: 65,
      dueDate: '2024-06-15',
      teamMembers: 8,
      documents: 24,
    },
    {
      id: '2',
      name: 'Downtown Office Tower',
      description: '25-story commercial building project',
      status: 'planning',
      progress: 15,
      dueDate: '2024-12-20',
      teamMembers: 12,
      documents: 8,
    },
    {
      id: '3',
      name: 'Green Valley Mall',
      description: 'Shopping center renovation and expansion',
      status: 'on-hold',
      progress: 40,
      dueDate: '2024-09-30',
      teamMembers: 6,
      documents: 18,
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    dueDate: '',
  });

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

  const handleCreateProject = () => {
    if (!newProject.name || !newProject.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      status: 'planning',
      progress: 0,
      dueDate: newProject.dueDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      teamMembers: 1,
      documents: 0,
    };

    setProjects([...projects, project]);
    setNewProject({ name: '', description: '', dueDate: '' });
    setShowCreateModal(false);
    Alert.alert('Success', 'Project created successfully!');
  };

  const ProjectCard = ({ project }: { project: Project }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => navigation.navigate('ProjectDetail', { project })}
    >
      <View style={styles.projectHeader}>
        <Text style={styles.projectName}>{project.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(project.status) }]}>
            {getStatusText(project.status)}
          </Text>
        </View>
      </View>

      <Text style={styles.projectDescription}>{project.description}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressPercentage}>{project.progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${project.progress}%`,
                backgroundColor: getStatusColor(project.status),
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.projectStats}>
        <View style={styles.statItem}>
          <Ionicons name="calendar" size={16} color="#9ca3af" />
          <Text style={styles.statText}>Due {project.dueDate}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="people" size={16} color="#9ca3af" />
          <Text style={styles.statText}>{project.teamMembers} members</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="document" size={16} color="#9ca3af" />
          <Text style={styles.statText}>{project.documents} docs</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Projects</Text>
          <Text style={styles.subtitle}>Manage your building projects</Text>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.createButtonText}>New Project</Text>
        </TouchableOpacity>

        <View style={styles.projectsList}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </View>

        {projects.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open" size={64} color="#6b7280" />
            <Text style={styles.emptyTitle}>No Projects Yet</Text>
            <Text style={styles.emptyDescription}>
              Create your first project to get started
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Create Project Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Project</Text>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Project Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newProject.name}
                  onChangeText={(text) => setNewProject({ ...newProject, name: text })}
                  placeholder="Enter project name"
                  placeholderTextColor="#6b7280"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newProject.description}
                  onChangeText={(text) => setNewProject({ ...newProject, description: text })}
                  placeholder="Enter project description"
                  placeholderTextColor="#6b7280"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Due Date (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={newProject.dueDate}
                  onChangeText={(text) => setNewProject({ ...newProject, dueDate: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#6b7280"
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateProject}
              >
                <Text style={styles.submitButtonText}>Create Project</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  projectsList: {
    gap: 16,
  },
  projectCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  projectDescription: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 16,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  projectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#d1d5db',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});