import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Card, Avatar, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { logout } from '../../redux/slices/authSlice';
import { spacing, theme } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const ManagementProfileScreen = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [dailyAffirmations, setDailyAffirmations] = useState(true);

  const profileSections = [
    {
      title: 'Role',
      value: 'Management',
      icon: 'shield-account',
    },
    {
      title: 'Email',
      value: user?.email || 'Not available',
      icon: 'email',
    },
    {
      title: 'Access Level',
      value: 'Analytics & Reports',
      icon: 'lock-open',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container}>
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileHeader}>
            <Avatar.Icon
              size={80}
              icon="account-tie"
              style={styles.avatar}
            />
            <Text style={styles.name}>{user?.name || 'Manager'}</Text>
            <Text style={styles.role}>Management User</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            {profileSections.map((section, index) => (
              <View key={index}>
                <View style={styles.infoRow}>
                  <Icon name={section.icon} size={24} color="#F5A962" />
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>{section.title}</Text>
                    <Text style={styles.infoValue}>{section.value}</Text>
                  </View>
                </View>
                {index < profileSections.length - 1 && <Divider style={styles.divider} />}
              </View>
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>App Preferences</Text>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceLabel}>Daily Affirmations</Text>
                <Text style={styles.preferenceDescription}>
                  Receive daily motivational quotes
                </Text>
              </View>
              <Switch
                value={dailyAffirmations}
                onValueChange={setDailyAffirmations}
                trackColor={{ false: '#D1D1D1', true: '#F5A962' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceLabel}>Dark Mode</Text>
                <Text style={styles.preferenceDescription}>
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
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Settings</Text>
            <Button
              mode="outlined"
              icon="bell"
              style={styles.settingButton}
              contentStyle={styles.buttonContent}
            >
              Notification Settings
            </Button>
            <Button
              mode="outlined"
              icon="shield-lock"
              style={styles.settingButton}
              contentStyle={styles.buttonContent}
            >
              Privacy Settings
            </Button>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={() => dispatch(logout())}
          style={styles.logoutButton}
          icon="logout"
          buttonColor="#F44336"
        >
          Logout
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  profileCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    backgroundColor: '#F5A962',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: spacing.md,
    color: '#000000',
  },
  role: {
    fontSize: 14,
    color: '#666666',
    marginTop: spacing.xs,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: '#000000',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666666',
  },
  infoValue: {
    fontSize: 16,
    marginTop: 2,
    color: '#000000',
  },
  divider: {
    marginVertical: spacing.sm,
  },
  settingButton: {
    marginTop: spacing.sm,
    borderColor: '#F5A962',
  },
  buttonContent: {
    paddingVertical: spacing.xs,
    justifyContent: 'flex-start',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  preferenceInfo: {
    flex: 1,
    marginRight: spacing.md,
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
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});

export default ManagementProfileScreen;
