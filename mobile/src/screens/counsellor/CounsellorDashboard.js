import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Avatar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMyAppointments } from '../../redux/slices/appointmentSlice';
import { fetchSessions } from '../../redux/slices/sessionSlice';
import { spacing, theme } from '../../constants/theme';

const CounsellorDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { appointments = [] } = useSelector((state) => state.appointments || {});
  const { sessions = [] } = useSelector((state) => state.sessions || {});
  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const [refreshing, setRefreshing] = React.useState(false);
  const [checkInTime, setCheckInTime] = React.useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const todayAppointments = safeAppointments.filter(
    (apt) =>
      apt.status === 'scheduled' &&
      new Date(apt.appointmentDate || apt.date).toDateString() === new Date().toDateString()
  );

  const pendingReviews = safeSessions.filter(
    (session) => session.status === 'pending' || !session.notes
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([dispatch(fetchMyAppointments()), dispatch(fetchSessions())]);
    setRefreshing(false);
  }, [dispatch]);

  useEffect(() => {
    onRefresh();
    // Animate on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Check if already checked in today
    const checkStoredCheckIn = async () => {
      try {
        const savedCheckIn = await AsyncStorage.getItem('checkInDate');
        const savedTime = await AsyncStorage.getItem('checkInTime');
        const today = new Date().toDateString();
        if (savedCheckIn === today && savedTime) {
          setCheckInTime(savedTime);
        }
      } catch (error) {
        console.log('Error loading check-in state:', error);
      }
    };
    checkStoredCheckIn();
  }, []);

  const handleCheckIn = async () => {
    const now = new Date();
    const today = now.toDateString();
    const time = now.toLocaleTimeString();

    try {
      await AsyncStorage.setItem('checkInDate', today);
      await AsyncStorage.setItem('checkInTime', time);

      setCheckInTime(time);

      Alert.alert('✅ Checked In', `You are now marked as available from ${time}`, [
        { text: 'OK' }
      ]);
    } catch (error) {
      console.log('Error saving check-in:', error);
      Alert.alert('Error', 'Failed to save check-in state');
    }
  };

  const getNextSessionInfo = () => {
    if (todayAppointments.length === 0) return null;
    const next = todayAppointments[0];
    return {
      time: next.time || '10:00 AM',
      student: next.student?.anonymousUsername || 'Student A',
    };
  };

  const nextSession = getNextSessionInfo();

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ScrollView
          style={styles.container}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Header */}
          <View style={styles.header}>
            <Avatar.Icon
              size={56}
              icon="brain"
              style={styles.headerIcon}
              color="#FFFFFF"
            />
          </View>

          {/* Greeting */}
          <View style={styles.greetingSection}>
            <Text style={styles.welcomeText}>Welcome, {user?.name || 'Dr. Chen'}!</Text>
            <Text style={styles.dateText}>
              Here's your overview for today, {formattedDate}.
            </Text>
          </View>

          {/* Today's Schedule Card */}
          <View style={styles.scheduleCard}>
            <Text style={styles.scheduleTitle}>Today's Schedule</Text>
            <Icon name="calendar" size={40} color="#F09E54" style={styles.scheduleIcon} />

            <Text style={styles.upcomingTitle}>
              {todayAppointments.length} Upcoming Sessions
            </Text>
            {nextSession && (
              <Text style={styles.nextSessionText}>
                Next session starts at {nextSession.time} with {nextSession.student}.
              </Text>
            )}
            <TouchableOpacity onPress={() => navigation.navigate('Appointments')}>
              <Text style={styles.viewScheduleLink}>View Full Schedule</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCheckIn}
            >
              <Icon name="clock-outline" size={40} color="#333333" />
              <Text style={styles.actionButtonText}>Daily Check-In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('QRScanner', { mode: 'checkin' })}
            >
              <Icon name="qrcode-scan" size={40} color="#333333" />
              <Text style={styles.actionButtonText}>Scan QR Code</Text>
            </TouchableOpacity>
          </View>

          {/* Pending Check-ins Card */}
          <View style={styles.pendingCard}>
            <Text style={styles.pendingTitle}>Pending Check-ins</Text>
            <Icon name="account-group" size={40} color="#FFFFFF" style={styles.pendingIcon} />

            <Text style={styles.pendingCountText}>
              {pendingReviews.length} Students Awaiting Review
            </Text>
            <Text style={styles.pendingSubtext}>
              Quickly review and follow up on student mood logs.
            </Text>

            <TouchableOpacity onPress={() => navigation.navigate('StudentHistory')}>
              <Text style={styles.reviewLink}>Review Check-ins</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerIcon: {
    backgroundColor: '#5B8DBE',
  },
  greetingSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  scheduleCard: {
    backgroundColor: '#FFF5EB',
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  scheduleIcon: {
    marginBottom: 16,
  },
  upcomingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  nextSessionText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  viewScheduleLink: {
    fontSize: 14,
    color: '#F09E54',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#333333',
    marginTop: 8,
    fontWeight: '500',
  },
  pendingCard: {
    backgroundColor: '#6BCF7F',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  pendingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  pendingIcon: {
    marginBottom: 16,
  },
  pendingCountText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  pendingSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
    opacity: 0.9,
  },
  reviewLink: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default CounsellorDashboard;
