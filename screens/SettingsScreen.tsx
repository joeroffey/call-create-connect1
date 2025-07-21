import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
}

export default function SettingsScreen({ navigation, user }) {
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || 'John Smith',
    email: user?.email || 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    company: 'ABC Construction',
    role: 'Project Manager',
  });

  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailNotifications: true,
    projectUpdates: true,
    teamMessages: true,
    documentSharing: false,
    weeklyDigest: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: true,
    activityStatus: true,
    shareAnalytics: false,
  });

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(profile);

  const handleSaveProfile = () => {
    setProfile(editingProfile);
    setShowEditProfile(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            // In a real app, you would clear authentication tokens and navigate to auth screen
            Alert.alert('Success', 'You have been signed out');
          }
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Account', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'Account deletion request submitted. You will receive an email confirmation.');
          }
        },
      ]
    );
  };

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const SettingItem = ({ 
    icon, 
    title, 
    description, 
    value, 
    onPress, 
    showToggle = false, 
    toggleValue = false, 
    onToggle,
    showChevron = true 
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={showToggle}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon} size={20} color="#10b981" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {description && <Text style={styles.settingDescription}>{description}</Text>}
          {value && <Text style={styles.settingValue}>{value}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {showToggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: '#374151', true: '#10b981' + '40' }}
            thumbColor={toggleValue ? '#10b981' : '#9ca3af'}
          />
        ) : showChevron ? (
          <Ionicons name="chevron-forward" size={20} color="#6b7280" />
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your account and preferences</Text>
        </View>

        {/* Profile Section */}
        <SettingSection title="Profile">
          <SettingItem
            icon="person"
            title="Personal Information"
            description="Update your profile details"
            onPress={() => setShowEditProfile(true)}
          />
          <SettingItem
            icon="business"
            title="Company"
            value={profile.company}
            onPress={() => Alert.alert('Company Settings', 'Company management features would be available here.')}
          />
          <SettingItem
            icon="card"
            title="Subscription"
            description="Manage your billing and subscription"
            onPress={() => Alert.alert('Subscription', 'Subscription management features would be available here.')}
          />
        </SettingSection>

        {/* Notifications Section */}
        <SettingSection title="Notifications">
          <SettingItem
            icon="notifications"
            title="Push Notifications"
            description="Receive notifications on your device"
            showToggle
            toggleValue={notifications.pushNotifications}
            onToggle={(value) => setNotifications({...notifications, pushNotifications: value})}
          />
          <SettingItem
            icon="mail"
            title="Email Notifications"
            description="Receive notifications via email"
            showToggle
            toggleValue={notifications.emailNotifications}
            onToggle={(value) => setNotifications({...notifications, emailNotifications: value})}
          />
          <SettingItem
            icon="refresh"
            title="Project Updates"
            description="Get notified about project changes"
            showToggle
            toggleValue={notifications.projectUpdates}
            onToggle={(value) => setNotifications({...notifications, projectUpdates: value})}
          />
          <SettingItem
            icon="chatbubbles"
            title="Team Messages"
            description="Notifications for team communications"
            showToggle
            toggleValue={notifications.teamMessages}
            onToggle={(value) => setNotifications({...notifications, teamMessages: value})}
          />
        </SettingSection>

        {/* Privacy Section */}
        <SettingSection title="Privacy & Security">
          <SettingItem
            icon="eye"
            title="Profile Visibility"
            description="Allow others to see your profile"
            showToggle
            toggleValue={privacy.profileVisibility}
            onToggle={(value) => setPrivacy({...privacy, profileVisibility: value})}
          />
          <SettingItem
            icon="time"
            title="Activity Status"
            description="Show when you're online"
            showToggle
            toggleValue={privacy.activityStatus}
            onToggle={(value) => setPrivacy({...privacy, activityStatus: value})}
          />
          <SettingItem
            icon="key"
            title="Change Password"
            description="Update your account password"
            onPress={() => Alert.alert('Change Password', 'Password change functionality would be implemented here.')}
          />
          <SettingItem
            icon="shield-checkmark"
            title="Two-Factor Authentication"
            description="Add an extra layer of security"
            onPress={() => Alert.alert('2FA', 'Two-factor authentication setup would be available here.')}
          />
        </SettingSection>

        {/* App Settings Section */}
        <SettingSection title="App Settings">
          <SettingItem
            icon="language"
            title="Language"
            value="English"
            onPress={() => Alert.alert('Language', 'Language selection would be available here.')}
          />
          <SettingItem
            icon="color-palette"
            title="Theme"
            value="Dark"
            onPress={() => Alert.alert('Theme', 'Theme selection would be available here.')}
          />
          <SettingItem
            icon="download"
            title="Auto-sync"
            description="Automatically sync data when connected"
            showToggle
            toggleValue={true}
            onToggle={() => {}}
          />
        </SettingSection>

        {/* Support Section */}
        <SettingSection title="Support">
          <SettingItem
            icon="help-circle"
            title="Help & Support"
            description="Get help and contact support"
            onPress={() => Alert.alert('Support', 'Help and support features would be available here.')}
          />
          <SettingItem
            icon="document-text"
            title="Terms & Privacy"
            description="Read our terms and privacy policy"
            onPress={() => Alert.alert('Legal', 'Terms and privacy policy would be displayed here.')}
          />
          <SettingItem
            icon="information-circle"
            title="About"
            value="Version 1.0.0"
            onPress={() => Alert.alert('About EezyBuild', 'EezyBuild v1.0.0\nBuilding Management Solution')}
          />
        </SettingSection>

        {/* Account Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out" size={20} color="#fff" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditProfile(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity
                onPress={() => setShowEditProfile(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={editingProfile.name}
                  onChangeText={(text) => setEditingProfile({...editingProfile, name: text})}
                  placeholder="Enter your full name"
                  placeholderTextColor="#6b7280"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={editingProfile.email}
                  onChangeText={(text) => setEditingProfile({...editingProfile, email: text})}
                  placeholder="Enter your email"
                  placeholderTextColor="#6b7280"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={editingProfile.phone}
                  onChangeText={(text) => setEditingProfile({...editingProfile, phone: text})}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#6b7280"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Company</Text>
                <TextInput
                  style={styles.input}
                  value={editingProfile.company}
                  onChangeText={(text) => setEditingProfile({...editingProfile, company: text})}
                  placeholder="Enter your company name"
                  placeholderTextColor="#6b7280"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Role</Text>
                <TextInput
                  style={styles.input}
                  value={editingProfile.role}
                  onChangeText={(text) => setEditingProfile({...editingProfile, role: text})}
                  placeholder="Enter your role"
                  placeholderTextColor="#6b7280"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEditProfile(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
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
    marginBottom: 32,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#9ca3af',
  },
  settingValue: {
    fontSize: 14,
    color: '#10b981',
  },
  settingRight: {
    marginLeft: 12,
  },
  actionsSection: {
    marginTop: 20,
    gap: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: {
    alignItems: 'center',
    padding: 16,
  },
  deleteText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '500',
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
    maxHeight: '80%',
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
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#374151',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});