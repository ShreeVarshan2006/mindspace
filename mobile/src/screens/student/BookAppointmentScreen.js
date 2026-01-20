import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Calendar } from 'react-native-calendars';
import { fetchTimeSlots, bookAppointment, fetchMyAppointments } from '../../redux/slices/appointmentSlice';
import { useTheme } from '../../context/ThemeContext';
import { spacing, theme } from '../../constants/theme';

const BookAppointmentScreen = ({ route, navigation }) => {
  const { counsellor } = route.params || {};
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { timeSlots = [], isLoading } = useSelector((state) => state.appointments || {});

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Default time slots in proper format (09:00 – 09:40)
  const defaultTimeSlots = [
    { id: 1, time: '09:00 – 09:40', startTime: '09:00', endTime: '09:40', available: true },
    { id: 2, time: '09:40 – 10:20', startTime: '09:40', endTime: '10:20', available: true },
    { id: 3, time: '10:20 – 11:00', startTime: '10:20', endTime: '11:00', available: true },
    { id: 4, time: '13:00 – 13:40', startTime: '13:00', endTime: '13:40', available: true },
    { id: 5, time: '13:40 – 14:20', startTime: '13:40', endTime: '14:20', available: true },
    { id: 6, time: '14:20 – 15:00', startTime: '14:20', endTime: '15:00', available: true },
    { id: 7, time: '15:00 – 15:40', startTime: '15:00', endTime: '15:40', available: true },
  ];

  // Redirect to counsellor list if no counsellor selected
  useEffect(() => {
    if (!counsellor) {
      Alert.alert(
        'Select Counsellor',
        'Please select a counsellor first',
        [{ text: 'OK', onPress: () => navigation.navigate('CounsellorList') }]
      );
    }
  }, [counsellor, navigation]);

  useEffect(() => {
    if (counsellor) {
      dispatch(fetchTimeSlots(counsellor._id));
    }
  }, [counsellor, dispatch]);

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    setSelectedSlot(null); // Reset slot selection when date changes
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    try {
      const bookingData = {
        counsellorId: counsellor.id || counsellor._id,
        date: selectedDate,
        time: selectedSlot.time,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        timeSlotId: selectedSlot.id,
        type: 'individual',
        reason: 'Session booking',
      };

      await dispatch(bookAppointment(bookingData)).unwrap();

      // Refresh appointments immediately so it appears on home screen
      await dispatch(fetchMyAppointments()).unwrap();

      Alert.alert('Success', 'Appointment booked successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('StudentDashboard') }
      ]);
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', error || 'Failed to book appointment');
    }
  };

  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: '#F5A962',
    },
  };

  const displaySlots = timeSlots.length > 0 ? timeSlots : defaultTimeSlots;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Book Session</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Select a Date Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select a Date</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Choose your preferred session date from the calendar.
          </Text>

          {/* Calendar */}
          <View style={[styles.calendarContainer, { backgroundColor: colors.surface }]}>
            <Calendar
              current={selectedDate}
              onDayPress={handleDateSelect}
              markedDates={markedDates}
              theme={{
                backgroundColor: colors.surface,
                calendarBackground: colors.surface,
                textSectionTitleColor: colors.textSecondary,
                selectedDayBackgroundColor: '#F5A962',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: '#F5A962',
                dayTextColor: colors.text,
                textDisabledColor: colors.textSecondary,
                dotColor: '#F5A962',
                selectedDotColor: '#FFFFFF',
                arrowColor: colors.text,
                monthTextColor: colors.text,
                textDayFontFamily: 'System',
                textMonthFontFamily: 'System',
                textDayHeaderFontFamily: 'System',
                textDayFontWeight: '400',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '400',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
              }}
              style={styles.calendar}
            />
          </View>
        </View>

        {/* Available Time Slots Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Time Slots</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Slots for {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>

          <Text style={[styles.availableSlotsHeading, { color: colors.text }]}>Available Slots</Text>

          {/* Time Slots Grid */}
          {isLoading ? (
            <ActivityIndicator style={styles.loader} color="#F5A962" />
          ) : (
            <View style={styles.slotsGrid}>
              {displaySlots.map((slot) => {
                const slotId = slot.id || slot._id;
                const selectedId = selectedSlot?.id || selectedSlot?._id;
                const isSelected = selectedId === slotId;
                const isAvailable = slot.available !== false;

                return (
                  <TouchableOpacity
                    key={slotId}
                    disabled={!isAvailable}
                    onPress={() => setSelectedSlot(slot)}
                    style={[
                      styles.slotButton,
                      isAvailable && !isSelected && { backgroundColor: colors.surface, borderColor: colors.border },
                      isSelected && styles.slotButtonSelected,
                      !isAvailable && styles.slotButtonDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        isAvailable && !isSelected && { color: colors.text },
                        isSelected && styles.slotTextSelected,
                        !isAvailable && styles.slotTextDisabled,
                      ]}
                    >
                      {slot.time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Confirm Booking Button */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!selectedSlot || isLoading) && styles.confirmButtonDisabled,
          ]}
          onPress={handleBookAppointment}
          disabled={!selectedSlot || isLoading}
        >
          <Text style={styles.confirmButtonText}>Confirm Booking</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  safeArea: {
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 15,
    marginBottom: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  availableSlotsHeading: {
    fontSize: 19,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  calendarContainer: {
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  calendar: {
    borderRadius: 12,
  },
  slotsHeading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 16,
    letterSpacing: 0.1,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  slotButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    minWidth: '47%',
    alignItems: 'center',
    borderWidth: 2,
  },
  slotButtonSelected: {
    backgroundColor: '#F5A962',
    borderColor: '#F5A962',
    elevation: 2,
    shadowColor: '#F5A962',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  slotButtonDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    opacity: 0.6,
  },
  slotText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  slotTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  slotTextDisabled: {
    color: '#999999',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#F5A962',
    marginHorizontal: 20,
    marginVertical: 24,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#F5A962',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  loader: {
    marginVertical: 24,
  },
});

export default BookAppointmentScreen;
