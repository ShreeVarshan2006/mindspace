import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Avatar, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchMyAppointments } from '../../redux/slices/appointmentSlice';
import { spacing, theme } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const CounsellorAppointmentsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { appointments = [], isLoading } = useSelector((state) => state.appointments || {});
  const [refreshing, setRefreshing] = React.useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    dispatch(fetchMyAppointments());
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchMyAppointments());
    setRefreshing(false);
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'scheduled':
        return '#5CB85C'; // Green for confirmed
      case 'pending':
        return '#D9534F'; // Red for pending
      case 'completed':
        return '#5CB85C';
      case 'cancelled':
        return '#D9534F';
      default:
        return '#999999';
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'scheduled') return 'Confirmed';
    if (status === 'pending') return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const renderAppointment = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    const statusLabel = getStatusLabel(item.status);
    const appointmentDate = new Date(item.appointmentDate || item.date);
    const dateLabel = appointmentDate.toDateString() === new Date().toDateString()
      ? 'Today'
      : appointmentDate.toDateString() === new Date(Date.now() + 86400000).toDateString()
        ? 'Tomorrow'
        : appointmentDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Avatar.Image
            size={56}
            source={{ uri: item.student?.avatar || 'https://via.placeholder.com/56' }}
            style={styles.avatar}
          />
          <View style={styles.headerInfo}>
            <Text style={[styles.studentLabel, { color: colors.text + '80' }]}>Student ID:</Text>
            <Text style={[styles.studentId, { color: colors.text }]}>
              {item.student?.studentId || item.student?.anonymousUsername || '#CW876'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.infoText, { color: colors.text }]}>Date: {dateLabel}, {appointmentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>Time: {item.time || '10:00 AM - 11:00 AM'}</Text>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate('QRScanner', { mode: 'checkin', appointmentId: item._id })}
        >
          <Text style={styles.startButtonText}>Start Session</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
        <StatusBar
          barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F5A962" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar
        barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-left" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Appointments</Text>
          <View style={styles.headerRight} />
        </View>

        <FlatList
          data={appointments || []}
          renderItem={renderAppointment}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="calendar-blank" size={64} color="#CCCCCC" />
              <Text style={[styles.emptyText, { color: colors.text + '80' }]}>No appointments</Text>
            </View>
          }
        />
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 20,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  studentLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  studentId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 8,
    letterSpacing: 0.15,
  },
  startButton: {
    backgroundColor: '#F5A962',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.25,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginTop: 16,
  },
});

export default CounsellorAppointmentsScreen;
