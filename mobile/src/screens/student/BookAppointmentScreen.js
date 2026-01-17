import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Calendar } from 'react-native-calendars';
import { fetchTimeSlots, bookAppointment } from '../../redux/slices/appointmentSlice';
import { spacing, theme } from '../../constants/theme';

const BookAppointmentScreen = ({ route, navigation }) => {
  const { counsellor } = route.params;
  const dispatch = useDispatch();
  const { timeSlots = [], isLoading } = useSelector((state) => state.appointments || {});

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Mock time slots for demonstration (replace with actual API data)
  const mockTimeSlots = [
    { id: 1, time: '09:00 AM - 10:00 AM', available: true },
    { id: 2, time: '10:00 AM - 11:00 AM', available: true },
    { id: 3, time: '11:00 AM - 12:00 PM', available: false },
    { id: 4, time: '01:00 PM - 02:00 PM', available: true },
    { id: 5, time: '02:00 PM - 03:00 PM', available: true },
    { id: 6, time: '03:00 PM - 04:00 PM', available: false },
    { id: 7, time: '04:00 PM - 05:00 PM', available: true },
  ];

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
      await dispatch(bookAppointment({
        counsellorId: counsellor._id,
        date: selectedDate,
        time: selectedSlot.time,
        type: 'individual',
        reason: 'Session booking',
      })).unwrap();

      Alert.alert('Success', 'Appointment booked successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to book appointment');
    }
  };

  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: '#F09E54',
    },
  };

  const displaySlots = timeSlots.length > 0 ? timeSlots : mockTimeSlots;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={28} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Session</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Select a Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select a Date</Text>
          <Text style={styles.sectionSubtitle}>
            Choose your preferred session date from the calendar.
          </Text>

          {/* Calendar */}
          <View style={styles.calendarContainer}>
            <Calendar
              current={selectedDate}
              onDayPress={handleDateSelect}
              markedDates={markedDates}
              theme={{
                backgroundColor: '#FFFFFF',
                calendarBackground: '#FFFFFF',
                textSectionTitleColor: '#666666',
                selectedDayBackgroundColor: '#F09E54',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: '#F09E54',
                dayTextColor: '#000000',
                textDisabledColor: '#D3D3D3',
                dotColor: '#F09E54',
                selectedDotColor: '#FFFFFF',
                arrowColor: '#000000',
                monthTextColor: '#000000',
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
          <Text style={styles.sectionTitle}>Available Time Slots</Text>
          <Text style={styles.sectionSubtitle}>
            Slots for {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </Text>

          {/* Available Slots Heading */}
          <Text style={styles.slotsHeading}>Available Slots</Text>

          {/* Time Slots Grid */}
          {isLoading ? (
            <ActivityIndicator style={styles.loader} color="#F09E54" />
          ) : (
            <View style={styles.slotsGrid}>
              {displaySlots.map((slot) => (
                <TouchableOpacity
                  key={slot.id || slot._id}
                  disabled={!slot.available}
                  onPress={() => setSelectedSlot(slot)}
                  style={[
                    styles.slotButton,
                    selectedSlot?.id === slot.id && styles.slotButtonSelected,
                    !slot.available && styles.slotButtonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.slotText,
                      selectedSlot?.id === slot.id && styles.slotTextSelected,
                      !slot.available && styles.slotTextDisabled,
                    ]}
                  >
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              ))}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 0.2,
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  calendar: {
    borderRadius: 12,
  },
  slotsHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
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
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    minWidth: '47%',
    alignItems: 'center',
  },
  slotButtonSelected: {
    backgroundColor: '#F09E54',
  },
  slotButtonDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.5,
  },
  slotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.1,
  },
  slotTextSelected: {
    color: '#FFFFFF',
  },
  slotTextDisabled: {
    color: '#CCCCCC',
  },
  confirmButton: {
    backgroundColor: '#F09E54',
    marginHorizontal: 20,
    marginVertical: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#F09E54',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  loader: {
    marginVertical: 24,
  },
});

export default BookAppointmentScreen;
