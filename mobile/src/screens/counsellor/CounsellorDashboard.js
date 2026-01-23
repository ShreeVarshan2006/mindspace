import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated, Alert, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Avatar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMyAppointments } from '../../redux/slices/appointmentSlice';
import { fetchSessions } from '../../redux/slices/sessionSlice';
import { spacing, theme } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const CounsellorDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { appointments = [] } = useSelector((state) => state.appointments || {});
  const { sessions = [] } = useSelector((state) => state.sessions || {});
  const { colors } = useTheme();
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

  // Students awaiting appointment bookings (pending status)
  const pendingAppointments = safeAppointments.filter(
    (apt) => apt.status === 'pending'
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

  const handleCheckOut = async () => {
    Alert.alert(
      'Check Out',
      'Are you sure you want to check out? This will mark you as unavailable.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Check Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('checkInDate');
              await AsyncStorage.removeItem('checkInTime');
              setCheckInTime(null);
              Alert.alert('✅ Checked Out', 'You are now marked as unavailable');
            } catch (error) {
              console.log('Error clearing check-out:', error);
              Alert.alert('Error', 'Failed to check out');
            }
          }
        }
      ]
    );
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar
        barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require('../../../assets/images/brain-logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>

          {/* Greeting */}
          <View style={styles.greetingSection}>
            <Text style={[styles.welcomeText, { color: colors.text }]}>Welcome, {user?.name || 'Dr. Chen'}!</Text>
            <Text style={[styles.dateText, { color: colors.text === '#FFFFFF' ? '#AAAAAA' : '#666666' }]}>
              Here's your overview for today, {formattedDate}.
            </Text>
          </View>

          {/* Today's Schedule Card */}
          <View style={[styles.scheduleCard, { backgroundColor: colors.text === '#FFFFFF' ? '#2C2C2C' : '#FFF5EB' }]}>
            <Text style={[styles.scheduleTitle, { color: colors.text }]}>Today's Schedule</Text>
            <Icon name="calendar" size={40} color="#F5A962" style={styles.scheduleIcon} />

            <Text style={[styles.upcomingTitle, { color: colors.text }]}>
              {todayAppointments.length} Upcoming Sessions
            </Text>
            {nextSession && (
              <Text style={[styles.nextSessionText, { color: colors.text + '80' }]}>
                Next session starts at {nextSession.time} with {nextSession.student}.
              </Text>
            )}
            <TouchableOpacity
              style={styles.viewScheduleButton}
              onPress={() => {
                // Navigate to Home stack, then to a new screen in that stack
                navigation.navigate('Home', {
                  screen: 'MyAppointments',
                  params: { from: 'dashboard' }
                });
              }}
            >
              <Text style={styles.viewScheduleLink}>View Full Schedule</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.card },
                checkInTime && styles.actionButtonCheckedIn
              ]}
              onPress={handleCheckIn}
              disabled={!!checkInTime}
            >
              <Icon
                name={checkInTime ? "check-circle" : "clock-outline"}
                size={40}
                color={checkInTime ? "#6BCF7F" : colors.text}
              />
              <Text style={[
                styles.actionButtonText,
                { color: colors.text },
                checkInTime && styles.actionButtonTextCheckedIn
              ]}>
                {checkInTime ? `Checked In at ${checkInTime}` : 'Daily Check-In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('QRScanner', { mode: 'checkin' })}
            >
              <Icon name="qrcode-scan" size={40} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Scan QR Code</Text>
            </TouchableOpacity>
          </View>

          {/* Check-Out Button */}
          {checkInTime && (
            <View style={styles.checkOutContainer}>
              <TouchableOpacity
                style={styles.checkOutButton}
                onPress={handleCheckOut}
              >
                <Icon name="logout" size={24} color="#FF6B6B" />
                <Text style={styles.checkOutButtonText}>Check Out</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Pending Check-ins Card */}
          <TouchableOpacity
            style={[styles.pendingCard, {
              backgroundColor: colors.text === '#FFFFFF' ? '#2D5F3E' : '#E8F5E9',
              borderColor: colors.text === '#FFFFFF' ? '#4A9B5A' : '#7FCA89',
              borderWidth: 2
            }]}
            onPress={() => navigation.navigate('PendingAppointments')}
            activeOpacity={0.8}
          >
            <Text style={[styles.pendingTitle, { color: colors.text === '#FFFFFF' ? '#FFFFFF' : '#1E5E2F' }]}>Pending Check-ins</Text>
            <Icon name="account-group" size={40} color={colors.text === '#FFFFFF' ? '#FFFFFF' : '#4A9B5A'} style={styles.pendingIcon} />

            <Text style={[styles.pendingCountText, { color: colors.text === '#FFFFFF' ? '#FFFFFF' : '#2D5F3E' }]}>
              {pendingAppointments.length} Students Awaiting Review
            </Text>
            <Text style={[styles.pendingSubtext, { color: colors.text === '#FFFFFF' ? 'rgba(255,255,255,0.9)' : '#4A9B5A' }]}>
              Quickly review and follow up on student mood logs.
            </Text>

            <View style={styles.reviewLinkContainer}>
              <Text style={[styles.reviewLink, { color: colors.text === '#FFFFFF' ? '#A5D6A7' : '#2D5F3E' }]}>Review Check-ins →</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerLogo: {
    width: 56,
    height: 56,
  },
  greetingSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  dateText: {
    fontSize: 14,
    lineHeight: 20,
  },
  scheduleCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  scheduleIcon: {
    marginBottom: 16,
  },
  upcomingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nextSessionText: {
    fontSize: 14,
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
    marginTop: 24,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    marginTop: 10,
    fontWeight: '500',
  },
  pendingCard: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
  },
  pendingTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  pendingIcon: {
    marginBottom: 20,
  },
  pendingCountText: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  pendingSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  reviewLinkContainer: {
    paddingTop: 4,
  },
  reviewLink: {
    fontSize: 15,
    fontWeight: '700',
  },
  actionButtonCheckedIn: {
    backgroundColor: '#F0FFF4',
    borderWidth: 2,
    borderColor: '#6BCF7F',
  },
  actionButtonTextCheckedIn: {
    color: '#2D7A3E',
    fontSize: 12,
  },
  viewScheduleButton: {
    paddingTop: 4,
  },
  checkOutContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  checkOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE5E5',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  checkOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    marginLeft: 8,
  },
});

export default CounsellorDashboard;
