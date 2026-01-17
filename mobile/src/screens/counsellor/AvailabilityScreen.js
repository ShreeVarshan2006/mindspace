import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Switch } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Calendar } from 'react-native-calendars';
import { spacing, theme } from '../../constants/theme';

const AvailabilityScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState('2025-12-19');
  const [recurringEnabled, setRecurringEnabled] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Time slots for availability
  const timeSlots = [
    { id: 1, time: '09:00 AM - 10:00 AM', selected: false },
    { id: 2, time: '10:00 AM - 11:00 AM', selected: true },
    { id: 3, time: '11:00 AM - 12:00 PM', selected: false, disabled: true },
    { id: 4, time: '01:00 PM - 02:00 PM', selected: false },
    { id: 5, time: '02:00 PM - 03:00 PM', selected: false },
    { id: 6, time: '03:00 PM - 04:00 PM', selected: false, disabled: true },
    { id: 7, time: '04:00 PM - 05:00 PM', selected: false },
  ];

  const [availability, setAvailability] = useState(timeSlots);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleSlot = (slotId) => {
    setAvailability(prev =>
      prev.map(slot =>
        slot.id === slotId && !slot.disabled
          ? { ...slot, selected: !slot.selected }
          : slot
      )
    );
  };

  const handleSaveChanges = () => {
    const selectedSlots = availability.filter(slot => slot.selected);
    Alert.alert(
      'Success',
      `Your availability has been saved!\n${selectedSlots.length} slots enabled for ${selectedDate}.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-left" size={28} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Availability</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.container}>
          {/* Calendar */}
          <View style={styles.calendarContainer}>
            <Calendar
              current={selectedDate}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  selectedColor: '#F09E54',
                },
              }}
              theme={{
                selectedDayBackgroundColor: '#F09E54',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: '#F09E54',
                arrowColor: '#000000',
                monthTextColor: '#000000',
                textMonthFontSize: 18,
                textMonthFontWeight: 'bold',
                textDayFontSize: 14,
                textDayHeaderFontSize: 12,
              }}
            />
          </View>

          {/* Available Slots */}
          <Text style={styles.sectionTitle}>Available Slots</Text>
          <View style={styles.slotsGrid}>
            {availability.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.slotButton,
                  slot.selected && styles.slotButtonSelected,
                  slot.disabled && styles.slotButtonDisabled,
                ]}
                onPress={() => toggleSlot(slot.id)}
                disabled={slot.disabled}
              >
                <Text
                  style={[
                    styles.slotText,
                    slot.selected && styles.slotTextSelected,
                    slot.disabled && styles.slotTextDisabled,
                  ]}
                >
                  {slot.time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recurring Availability */}
          <View style={styles.recurringSection}>
            <View style={styles.recurringTextContainer}>
              <Text style={styles.recurringTitle}>Recurring Availability</Text>
              <Text style={styles.recurringSubtitle}>Apply these slots to all future weeks.</Text>
            </View>
            <Switch
              value={recurringEnabled}
              onValueChange={setRecurringEnabled}
              trackColor={{ false: '#D1D1D1', true: '#F09E54' }}
              thumbColor={recurringEnabled ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  calendarContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  slotButton: {
    width: '47%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotButtonSelected: {
    backgroundColor: '#F09E54',
  },
  slotButtonDisabled: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  slotText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  slotTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  slotTextDisabled: {
    color: '#CCCCCC',
  },
  recurringSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 20,
  },
  recurringTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  recurringTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  recurringSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  saveButton: {
    backgroundColor: '#F09E54',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AvailabilityScreen;
