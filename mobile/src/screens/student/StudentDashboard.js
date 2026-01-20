import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Avatar, FAB } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMyAppointments } from '../../redux/slices/appointmentSlice';
import { fetchMoods } from '../../redux/slices/moodSlice';
import { useTheme } from '../../context/ThemeContext';
import { spacing, theme } from '../../constants/theme';

const StudentDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const { appointments = [] } = useSelector((state) => state.appointments || {});
  const { moods = [] } = useSelector((state) => state.moods || {});
  const [refreshing, setRefreshing] = React.useState(false);
  const [affirmations, setAffirmations] = useState([]);
  const [showAffirmation, setShowAffirmation] = useState(false);
  const [anonymousId, setAnonymousId] = useState('');

  const upcomingAppointment = (appointments || []).find(
    (apt) => apt.status === 'scheduled' && new Date(apt.appointmentDate || apt.date) >= new Date()
  );

  useEffect(() => {
    loadAffirmations();
    loadAnonymousId();
  }, []);

  const loadAnonymousId = async () => {
    try {
      let id = await AsyncStorage.getItem('anonymousStudentId');
      if (!id) {
        // Generate random 6-character alphanumeric ID
        id = 'STU' + Math.random().toString(36).substring(2, 8).toUpperCase();
        await AsyncStorage.setItem('anonymousStudentId', id);
      }
      setAnonymousId(id);
    } catch (error) {
      console.log('Error loading anonymous ID:', error);
    }
  };

  const loadAffirmations = async () => {
    try {
      // Check if student wants to receive affirmations
      const userProfile = await AsyncStorage.getItem('userProfile');
      const profile = userProfile ? JSON.parse(userProfile) : null;
      const wantsAffirmations = profile?.dailyAffirmations !== false;

      if (wantsAffirmations) {
        const storedAffirmations = await AsyncStorage.getItem('shared_affirmations');
        if (storedAffirmations) {
          const parsedAffirmations = JSON.parse(storedAffirmations);
          setAffirmations(parsedAffirmations);
          setShowAffirmation(parsedAffirmations.length > 0);
        }
      }
    } catch (error) {
      console.log('Error loading affirmations:', error);
    }
  };

  const getRandomAffirmation = () => {
    if (affirmations.length === 0) return null;
    return affirmations[Math.floor(Math.random() * affirmations.length)];
  };

  const getRecentMood = () => {
    if (!moods || moods.length === 0) return null;
    // Get the most recent mood
    const sortedMoods = [...moods].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    return sortedMoods[0];
  };

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      sad: '😢',
      neutral: '😐',
      happy: '�',
      excited: '😄',
    };
    return moodEmojis[mood] || '😊';
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchMyAppointments()),
      dispatch(fetchMoods()),
    ]);
    await loadAffirmations();
    setRefreshing(false);
  }, [dispatch]);

  useEffect(() => {
    onRefresh();
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Image
          source={require('../../../assets/images/brain-logo.png')}
          style={styles.brainLogo}
          resizeMode="contain"
        />
        <View style={{ flex: 1 }} />
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Greeting */}
        <View style={[styles.greetingSection, { backgroundColor: colors.background }]}>
          <Text style={[styles.greeting, { color: colors.text }]}>Hello, {user?.name || 'Alex'}!</Text>
          {anonymousId && (
            <Text style={[styles.anonymousId, { color: colors.textSecondary }]}>
              Your ID: {anonymousId}
            </Text>
          )}
        </View>

        {/* Recent Mood Card */}
        {getRecentMood() && (
          <View style={[styles.recentMoodCard, { backgroundColor: colors.surface }]}>
            <View style={styles.moodCardHeader}>
              <Icon name="emoticon-happy-outline" size={24} color="#F5A962" />
              <Text style={[styles.moodCardTitle, { color: colors.text }]}>Your Recent Mood</Text>
            </View>
            <View style={styles.moodCardContent}>
              <Text style={styles.moodEmoji}>{getMoodEmoji(getRecentMood().mood)}</Text>
              <View style={styles.moodCardDetails}>
                <Text style={[styles.moodType, { color: colors.text }]}>
                  {getRecentMood().mood.charAt(0).toUpperCase() + getRecentMood().mood.slice(1)}
                </Text>
                <Text style={[styles.moodDate, { color: colors.textSecondary }]}>
                  {new Date(getRecentMood().createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })} at {new Date(getRecentMood().createdAt).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Mood Section */}
        <View style={[styles.moodSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.moodQuestion, { color: colors.text }]}>
            How are you feeling today, {user?.name || 'Alex'}?
          </Text>
          <Text style={[styles.moodSubtitle, { color: colors.textSecondary }]}>
            Logging your mood regularly can help track your well-being.
          </Text>
          <TouchableOpacity
            style={styles.logMoodButton}
            onPress={() => navigation.navigate('MoodTracker')}
          >
            <Icon name="emoticon-happy-outline" size={20} color="#FFFFFF" />
            <Text style={styles.logMoodButtonText}>Log My Mood</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Appointment Card */}
        {upcomingAppointment ? (
          <View style={[styles.appointmentCard, { backgroundColor: colors.secondary }]}>
            <View style={styles.appointmentHeader}>
              <Icon name="calendar-blank" size={24} color="#F5A962" />
              <Text style={[styles.appointmentTitle, { color: colors.text }]}>Upcoming Appointment</Text>
            </View>
            <View style={styles.appointmentDetails}>
              <Avatar.Image
                size={48}
                source={{ uri: upcomingAppointment.counsellor?.avatar || 'https://via.placeholder.com/48' }}
                style={styles.avatar}
              />
              <View style={styles.appointmentInfo}>
                <Text style={[styles.counsellorName, { color: colors.text }]}>
                  {upcomingAppointment.counsellor?.name || 'Counsellor'}
                </Text>
                <Text style={[styles.appointmentDate, { color: colors.textSecondary }]}>
                  {new Date(upcomingAppointment.appointmentDate || upcomingAppointment.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })} at {upcomingAppointment.time || '09:00 – 09:40'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => navigation.navigate('Appointments')}
            >
              <Text style={styles.viewDetailsText}>View Details</Text>
              <Icon name="arrow-right" size={18} color="#F5A962" />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('CounsellorList')}
          >
            <Icon name="account-multiple" size={40} color="#F5A962" />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Book Session</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('JournalList')}
          >
            <Icon name="book-open-page-variant" size={40} color="#F5A962" />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Journaling</Text>
          </TouchableOpacity>
        </View>

        {/* Affirmation Section - Only show if student opted in and has affirmations */}
        {showAffirmation && affirmations.length > 0 && (
          <View style={[styles.affirmationSection, { backgroundColor: colors.card }]}>
            <Text style={[styles.affirmationTitle, { color: '#6B8CFF' }]}>Affirmation...</Text>
            <Text style={[styles.affirmationText, { color: colors.textSecondary }]}>
              {getRandomAffirmation()?.message || 'Affirmation Goes Here!!!'}
            </Text>
          </View>
        )}

        {/* Counsellors Available Now */}
        <View style={[styles.counsellorsSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.counsellorsTitle, { color: colors.text }]}>Counsellors Available Now</Text>
          <View style={styles.counsellorItem}>
            <Icon name="account-circle" size={22} color={colors.textSecondary} />
            <Text style={[styles.counsellorName2, { color: colors.text }]}>Dr. Emily White</Text>
          </View>
          <View style={styles.counsellorItem}>
            <Icon name="account-circle" size={22} color={colors.textSecondary} />
            <Text style={[styles.counsellorName2, { color: colors.text }]}>Mr. John Davis</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="qrcode"
        style={styles.fab}
        onPress={() => navigation.navigate('QRCode')}
        color="#FFFFFF"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0,
  },
  brainLogo: {
    width: 44,
    height: 44,
  },
  container: {
    flex: 1,
  },
  greetingSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  anonymousId: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  recentMoodCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  moodCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  moodCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  moodCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  moodCardDetails: {
    flex: 1,
  },
  moodType: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  moodDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  moodNote: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
  },
  moodSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  moodQuestion: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  moodSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  logMoodButton: {
    backgroundColor: '#F5A962',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#F5A962',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logMoodButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  appointmentCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  appointmentTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 12,
    letterSpacing: 0.2,
  },
  appointmentDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#E0E0E0',
  },
  appointmentInfo: {
    flex: 1,
    marginLeft: 16,
  },
  counsellorName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.15,
  },
  appointmentDate: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  viewDetailsText: {
    fontSize: 15,
    color: '#F5A962',
    fontWeight: '600',
    marginRight: 6,
    letterSpacing: 0.2,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    minHeight: 120,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
    letterSpacing: 0.2,
    textAlign: 'center',
    lineHeight: 20,
  },
  affirmationSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  affirmationTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  affirmationText: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  counsellorsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 100,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  counsellorsTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  counsellorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  counsellorName2: {
    fontSize: 15,
    marginLeft: 10,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#F5A962',
  },
});

export default StudentDashboard;
