import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member' | 'viewer';
  avatar: string;
  status: 'online' | 'offline' | 'away';
  joinDate: string;
  lastActive: string;
}

export default function TeamScreen({ navigation, route }) {
  const { projectId } = route?.params || {};
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      status: 'online',
      joinDate: '2024-01-01',
      lastActive: 'Now',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      status: 'online',
      joinDate: '2024-01-02',
      lastActive: '5 min ago',
    },
    {
      id: '3',
      name: 'Mike Davis',
      email: 'mike.davis@example.com',
      role: 'member',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      status: 'away',
      joinDate: '2024-01-05',
      lastActive: '2 hours ago',
    },
    {
      id: '4',
      name: 'Lisa Chen',
      email: 'lisa.chen@example.com',
      role: 'member',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
      status: 'offline',
      joinDate: '2024-01-08',
      lastActive: '1 day ago',
    },
    {
      id: '5',
      name: 'Alex Wilson',
      email: 'alex.wilson@example.com',
      role: 'viewer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      status: 'offline',
      joinDate: '2024-01-10',
      lastActive: '3 days ago',
    },
  ]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#ef4444';
      case 'manager':
        return '#f59e0b';
      case 'member':
        return '#10b981';
      case 'viewer':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'manager':
        return 'Manager';
      case 'member':
        return 'Member';
      case 'viewer':
        return 'Viewer';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return '#10b981';
      case 'away':
        return '#f59e0b';
      case 'offline':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const handleInviteMember = () => {
    if (!inviteEmail) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    // In a real app, you would send an invitation email
    Alert.alert(
      'Invitation Sent',
      `Invitation sent to ${inviteEmail} as ${getRoleLabel(inviteRole)}`,
      [{ text: 'OK' }]
    );

    setInviteEmail('');
    setInviteRole('member');
    setShowInviteModal(false);
  };

  const handleRemoveMember = (member: TeamMember) => {
    Alert.alert(
      'Remove Team Member',
      `Are you sure you want to remove ${member.name} from the team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setTeamMembers(teamMembers.filter(m => m.id !== member.id));
            Alert.alert('Success', `${member.name} has been removed from the team`);
          }
        },
      ]
    );
  };

  const handleStartChat = (member: TeamMember) => {
    Alert.alert(
      'Start Chat',
      `Start a private chat with ${member.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Chat', 
          onPress: () => {
            // Navigate to chat with this member
            navigation.navigate('Home');
          }
        },
      ]
    );
  };

  const TeamMemberCard = ({ member }: { member: TeamMember }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {member.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(member.status) }]} />
        </View>
        
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberEmail}>{member.email}</Text>
          <View style={styles.memberMeta}>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(member.role) + '20' }]}>
              <Text style={[styles.roleText, { color: getRoleColor(member.role) }]}>
                {getRoleLabel(member.role)}
              </Text>
            </View>
            <Text style={styles.lastActive}>Last active: {member.lastActive}</Text>
          </View>
        </View>

        <View style={styles.memberActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleStartChat(member)}
          >
            <Ionicons name="chatbubble" size={18} color="#10b981" />
          </TouchableOpacity>
          {member.role !== 'admin' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleRemoveMember(member)}
            >
              <Ionicons name="person-remove" size={18} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'member', label: 'Member' },
    { value: 'viewer', label: 'Viewer' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Team</Text>
          <Text style={styles.subtitle}>
            {projectId ? 'Project team members' : 'Manage your team members'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.inviteButton}
          onPress={() => setShowInviteModal(true)}
        >
          <Ionicons name="person-add" size={20} color="#fff" />
          <Text style={styles.inviteButtonText}>Invite Team Member</Text>
        </TouchableOpacity>

        {/* Team Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{teamMembers.length}</Text>
            <Text style={styles.statLabel}>Total Members</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{teamMembers.filter(m => m.status === 'online').length}</Text>
            <Text style={styles.statLabel}>Online Now</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{teamMembers.filter(m => m.role === 'admin' || m.role === 'manager').length}</Text>
            <Text style={styles.statLabel}>Admins/Managers</Text>
          </View>
        </View>

        {/* Team Members List */}
        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>Team Members</Text>
          <View style={styles.membersList}>
            {teamMembers.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </View>
        </View>

        {teamMembers.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#6b7280" />
            <Text style={styles.emptyTitle}>No Team Members Yet</Text>
            <Text style={styles.emptyDescription}>
              Invite your first team member to get started
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Invite Member Modal */}
      <Modal
        visible={showInviteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite Team Member</Text>
              <TouchableOpacity
                onPress={() => setShowInviteModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address *</Text>
                <TextInput
                  style={styles.input}
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  placeholder="Enter email address"
                  placeholderTextColor="#6b7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Role</Text>
                <View style={styles.roleSelector}>
                  {roleOptions.map((role) => (
                    <TouchableOpacity
                      key={role.value}
                      style={[
                        styles.roleOption,
                        inviteRole === role.value && styles.roleOptionSelected,
                      ]}
                      onPress={() => setInviteRole(role.value)}
                    >
                      <Text
                        style={[
                          styles.roleOptionText,
                          inviteRole === role.value && styles.roleOptionTextSelected,
                        ]}
                      >
                        {role.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleInviteMember}
              >
                <Text style={styles.submitButtonText}>Send Invitation</Text>
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
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  membersSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  membersList: {
    gap: 12,
  },
  memberCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  lastActive: {
    fontSize: 12,
    color: '#6b7280',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
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
  roleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  roleOptionSelected: {
    backgroundColor: '#10b981' + '20',
    borderColor: '#10b981',
  },
  roleOptionText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  roleOptionTextSelected: {
    color: '#10b981',
    fontWeight: '500',
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