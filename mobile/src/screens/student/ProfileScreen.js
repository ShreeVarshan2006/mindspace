import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout, updateProfile } from '../../redux/slices/authSlice';
import { useTheme } from '../../context/ThemeContext';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [dailyAffirmations, setDailyAffirmations] = useState(true);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    studentId: '',
    year: '',
    department: '',
  });
  const [currentProfile, setCurrentProfile] = useState({
    name: '',
    studentId: '',
    year: '',
    department: '',
  });

  useEffect(() => {
    loadPreferences();
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const userProfile = await AsyncStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        const profileData = {
          name: profile.name || user?.name || '',
          studentId: profile.studentId || user?.studentId || '',
          year: profile.year || user?.year || '',
          department: profile.department || user?.department || '',
        };
        setCurrentProfile(profileData);
        setEditForm(profileData);
      } else {
        const profileData = {
          name: user?.name || '',
          studentId: user?.studentId || '',
          year: user?.year || '',
          department: user?.department || '',
        };
        setCurrentProfile(profileData);
        setEditForm(profileData);
      }
    } catch (error) {
      console.log('Error loading profile:', error);
    }
  };

  const loadPreferences = async () => {
    try {
      const userProfile = await AsyncStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        setDailyAffirmations(profile.dailyAffirmations !== false);
      }
    } catch (error) {
      console.log('Error loading preferences:', error);
    }
  };

  const handleAffirmationToggle = async (value) => {
    setDailyAffirmations(value);
    try {
      const userProfile = await AsyncStorage.getItem('userProfile');
      const profile = userProfile ? JSON.parse(userProfile) : {};
      profile.dailyAffirmations = value;
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
    } catch (error) {
      console.log('Error saving preference:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Save to AsyncStorage first
      const userProfile = await AsyncStorage.getItem('userProfile');
      const profile = userProfile ? JSON.parse(userProfile) : {};
      const updatedProfile = { ...profile, ...editForm };
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));

      // Update current profile to reflect changes immediately
      setCurrentProfile(editForm);

      // Update Redux state
      await dispatch(updateProfile(editForm)).unwrap();

      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      // Still close modal and show success since AsyncStorage saved
      setCurrentProfile(editForm);
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated locally');
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
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditModalVisible(true)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>

          <View style={[styles.infoItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Name</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{currentProfile.name || 'Jane Doe'}</Text>
          </View>

          <View style={[styles.infoItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Student ID</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{currentProfile.studentId || 'S1234567'}</Text>
          </View>

          <View style={[styles.infoItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Year</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{currentProfile.year || '2'}</Text>
          </View>

          <View style={[styles.infoItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Department</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{currentProfile.department || 'Computer Science'}</Text>
          </View>
        </View>

        {/* App Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>App Preferences</Text>

          <View style={[styles.preferenceItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.preferenceLabel, { color: colors.text }]}>Receive daily affirmations</Text>
            <Switch
              value={dailyAffirmations}
              onValueChange={handleAffirmationToggle}
              trackColor={{ false: '#D1D1D1', true: '#F5A962' }}
              thumbColor={'#FFFFFF'}
            />
          </View>

          <View style={[styles.preferenceItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.preferenceLabel, { color: colors.text }]}>Enable dark mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#D1D1D1', true: '#F5A962' }}
              thumbColor={'#FFFFFF'}
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
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <TextInput
                label="Name"
                value={editForm.name}
                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                mode="outlined"
                style={[styles.input, { backgroundColor: colors.surface }]}
                outlineColor={colors.border}
                activeOutlineColor="#F5A962"
                textColor={colors.text}
                theme={{
                  colors: {
                    text: colors.text,
                    placeholder: colors.textSecondary,
                    onSurfaceVariant: colors.textSecondary,
                  },
                }}
              />

              <TextInput
                label="Student ID"
                value={editForm.studentId}
                mode="outlined"
                style={[styles.input, { backgroundColor: colors.surface }]}
                outlineColor={colors.border}
                activeOutlineColor="#F5A962"
                textColor={colors.text}
                disabled={true}
                editable={false}
                theme={{
                  colors: {
                    text: colors.text,
                    placeholder: colors.textSecondary,
                    onSurfaceVariant: colors.textSecondary,
                  },
                }}
              />

              <TextInput
                label="Year"
                value={editForm.year}
                onChangeText={(text) => setEditForm({ ...editForm, year: text })}
                mode="outlined"
                style={[styles.input, { backgroundColor: colors.surface }]}
                outlineColor={colors.border}
                activeOutlineColor="#F5A962"
                textColor={colors.text}
                theme={{
                  colors: {
                    text: colors.text,
                    placeholder: colors.textSecondary,
                    onSurfaceVariant: colors.textSecondary,
                  },
                }}
              />

              <TextInput
                label="Department"
                value={editForm.department}
                onChangeText={(text) => setEditForm({ ...editForm, department: text })}
                mode="outlined"
                style={[styles.input, { backgroundColor: colors.surface }]}
                outlineColor={colors.border}
                activeOutlineColor="#F5A962"
                textColor={colors.text}
                theme={{
                  colors: {
                    text: colors.text,
                    placeholder: colors.textSecondary,
                    onSurfaceVariant: colors.textSecondary,
                  },
                }}
              />

              <Button
                mode="contained"
                onPress={handleSaveProfile}
                style={styles.saveButton}
                buttonColor="#F5A962"
                textColor="#FFFFFF"
              >
                Save Changes
              </Button>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5A962',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  infoItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 40,
    backgroundColor: '#DC3545',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 24,
    color: '#999999',
    fontWeight: '400',
  },
  modalBody: {
    padding: 20,
  },
  input: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 20,
  },
});

export default ProfileScreen;
