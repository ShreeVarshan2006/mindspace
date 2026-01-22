import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Chip, Button, FAB, ActivityIndicator, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchMyAppointments, cancelAppointment } from '../../redux/slices/appointmentSlice';
import { useTheme } from '../../context/ThemeContext';
import { spacing, theme } from '../../constants/theme';

const AppointmentsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { appointments = [], isLoading } = useSelector((state) => state.appointments || {});
  const [refreshing, setRefreshing] = React.useState(false);

  // Filter to show only scheduled appointments
  const scheduledAppointments = appointments.filter(apt => apt.status === 'scheduled');

  useEffect(() => {
    dispatch(fetchMyAppointments());
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchMyAppointments());
    setRefreshing(false);
  }, [dispatch]);

  const handleCancelAppointment = (appointmentId) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(cancelAppointment(appointmentId)).unwrap();
              // Refresh the appointments list immediately
              await dispatch(fetchMyAppointments()).unwrap();
              Alert.alert('Success', 'Appointment cancelled successfully');
            } catch (error) {
              Alert.alert('Error', error || 'Failed to cancel appointment');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return '#F5A962';
      case 'completed':
        return '#6BCF7F';
      case 'cancelled':
        return '#FF6B6B';
      default:
        return '#CCCCCC';
    }
  };

  const renderAppointment = ({ item }) => (
    <Card style={[styles.card, { backgroundColor: colors.surface }]}>
      <Card.Content>
        <View style={styles.cardContent}>
          <View style={styles.mainInfo}>
            <Text style={[styles.counsellorName, { color: colors.text }]}>{item.counsellor?.name || 'Counsellor'}</Text>

            <View style={styles.dateTimeRow}>
              <Icon name="calendar" size={16} color="#F5A962" />
              <Text style={[styles.dateText, { color: colors.text }]}>
                {new Date(item.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </Text>
            </View>

            <View style={styles.dateTimeRow}>
              <Icon name="clock-outline" size={16} color="#F5A962" />
              <Text style={[styles.timeText, { color: colors.text }]}>{item.time || '2:00 PM'}</Text>
            </View>
          </View>

          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) }
            ]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        </View>
      </Card.Content>
      {item.status === 'scheduled' && (
        <Card.Actions style={styles.actions}>
          <Button
            onPress={() => handleCancelAppointment(item._id)}
            textColor="#FF6B6B"
            labelStyle={styles.cancelButtonLabel}
          >
            Cancel
          </Button>
        </Card.Actions>
      )}
    </Card>
  );

  if (isLoading && appointments.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.container}>
        <FlatList
          data={scheduledAppointments}
          renderItem={renderAppointment}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="calendar-blank" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No scheduled appointments</Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Home', { screen: 'CounsellorList' })}
                style={styles.emptyButton}
                buttonColor="#F5A962"
                textColor="#FFFFFF"
              >
                Book Appointment
              </Button>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
    elevation: 2,
    borderRadius: 16,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mainInfo: {
    flex: 1,
  },
  counsellorName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textTransform: 'capitalize',
  },
  actions: {
    paddingHorizontal: 8,
  },
  cancelButtonLabel: {
    fontWeight: '700',
    fontSize: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    marginTop: spacing.sm,
  },
});

export default AppointmentsScreen;
