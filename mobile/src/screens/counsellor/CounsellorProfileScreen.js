import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Switch, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Portal, Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../../redux/slices/authSlice';
import { spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const CounsellorProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const { isDarkMode, toggleDarkMode, colors } = useTheme();
  const [currentProfile, setCurrentProfile] = useState({
    name: user?.name || '',
    experience: user?.experience || '',
    designation: user?.designation || '',
    location: user?.location || '',
  });
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    experience: user?.experience || '',
    designation: user?.designation || '',
    location: user?.location || '',
  });

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!editForm.name.trim()) {
        Alert.alert('Error', 'Name is required');
        return;
      }

      const updatedProfile = {
        ...user,
        name: editForm.name.trim(),
        experience: editForm.experience.trim(),
        designation: editForm.designation.trim(),
        location: editForm.location.trim(),
        updatedAt: new Date().toISOString()
      };

      // Save to AsyncStorage first for immediate persistence
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));

      // Update current profile for immediate UI update
      setCurrentProfile({
        name: updatedProfile.name,
        experience: updatedProfile.experience,
        designation: updatedProfile.designation,
        location: updatedProfile.location,
      });

      // Update Redux state
      dispatch({
        type: 'auth/updateProfile',
        payload: updatedProfile
      });

      // Sync with backend
      try {
        const { authService } = require('../../services/authService');
        await authService.updateProfile(updatedProfile);
        console.log('Profile synced with backend:', updatedProfile);
      } catch (apiError) {
        console.log('Backend sync pending:', apiError);
        // Profile still saved locally, will sync later
      }

      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => dispatch(logout())
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar
        barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Counsellor Profile</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => setEditModalVisible(true)}>
            <Icon name="pencil" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Profile Image */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarCircle}>
                  <Icon name="account" size={60} color="#999999" />
                </View>
              )}
              <View style={styles.cameraIconContainer}>
                <Icon name="camera" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{currentProfile.name || user?.name || ''}</Text>
        </View>

        {/* Profile Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>Years of Experience (optional)</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{currentProfile.experience || 'Not set'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>Designation</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{currentProfile.designation || 'Not set'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.text + '80' }]}>Location</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{currentProfile.location || 'Not set'}</Text>
          </View>
        </View>

        {/* App Preferences */}
        <View style={styles.preferencesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>App Preferences</Text>

          <View style={[styles.preferenceItem, { borderBottomColor: colors.border }]}>
            <View style={styles.preferenceInfo}>
              <Text style={[styles.preferenceLabel, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[styles.preferenceDescription, { color: colors.text + '80' }]}>
                Enable dark theme for the app
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#D1D1D1', true: '#F5A962' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: colors.card }]}
        >
          <ScrollView style={styles.modalScroll}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              label="Name"
              value={editForm.name}
              onChangeText={(text) => setEditForm({ ...editForm, name: text })}
              mode="outlined"
              style={styles.input}
              theme={{ colors: { text: colors.text, placeholder: colors.text + '80', primary: '#F5A962' } }}
            />

            <TextInput
              label="Designation"
              value={editForm.designation}
              onChangeText={(text) => setEditForm({ ...editForm, designation: text })}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., Senior Counsellor"
              theme={{ colors: { text: colors.text, placeholder: colors.text + '80', primary: '#F5A962' } }}
            />

            <TextInput
              label="Experience (Optional)"
              value={editForm.experience}
              onChangeText={(text) => setEditForm({ ...editForm, experience: text })}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., 8 years"
              theme={{ colors: { text: colors.text, placeholder: colors.text + '80', primary: '#F5A962' } }}
            />

            <TextInput
              label="Location"
              value={editForm.location}
              onChangeText={(text) => setEditForm({ ...editForm, location: text })}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., Main Campus, University City"
              theme={{ colors: { text: colors.text, placeholder: colors.text + '80', primary: '#F5A962' } }}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0.3,
    flex: 1,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5A962',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.3,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  infoItem: {
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    letterSpacing: 0.2,
  },
  preferencesSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  preferenceDescription: {
    fontSize: 13,
    color: '#666666',
    letterSpacing: 0.1,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 30,
    backgroundColor: '#FF4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    maxHeight: '80%',
  },
  modalScroll: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.3,
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    letterSpacing: 0.2,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F5A962',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default CounsellorProfileScreen;
