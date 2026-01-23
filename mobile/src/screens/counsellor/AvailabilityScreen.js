import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Switch } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Calendar } from 'react-native-calendars';
import { spacing, typography } from '../../constants/theme';
import { Heading, BodySmall } from '../../components/Typography';
import { useTheme } from '../../context/ThemeContext';

const AvailabilityScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState('2025-12-19');
  const [recurringEnabled, setRecurringEnabled] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { colors } = useTheme();

  // Time slots for availability
  const timeSlots = [
    { id: 1, time: '09:00 AM - 10:00 AM', selected: false },
    { id: 2, time: '10:00 AM - 11:00 AM', selected: true },
    { id: 3, time: '11:00 AM - 12:00 PM', selected: false, disabled: true, isLunch: true },
    { id: 4, time: '01:00 PM - 02:00 PM', selected: false },
    { id: 5, time: '02:00 PM - 03:00 PM', selected: false },
    { id: 6, time: '03:00 PM - 04:00 PM', selected: false },
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-left" size={28} color={colors.text} />
          </TouchableOpacity>
          <Heading level={3} style={styles.headerTitle}>Manage Availability</Heading>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, paddingTop: spacing.md }}
        >
          {/* Calendar */}
          <View style={styles.calendarContainer}>
            <Calendar
              current={selectedDate}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  selectedColor: '#F5A962',
                },
              }}
              theme={{
                calendarBackground: colors.surface,
                backgroundColor: colors.surface,
                selectedDayBackgroundColor: '#F5A962',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: '#F5A962',
                dayTextColor: colors.text,
                textSectionTitleColor: colors.textSecondary,
                arrowColor: colors.text,
                monthTextColor: colors.text,
                textMonthFontSize: typography.h3.fontSize,
                textMonthFontWeight: typography.h3.fontWeight,
                textDayFontSize: typography.caption.fontSize,
                textDayHeaderFontSize: typography.label.fontSize,
              }}
              style={{ backgroundColor: colors.surface, borderRadius: 12 }}
            />
          </View>

          {/* Available Slots */}
          <Heading level={3} style={styles.sectionTitle}>Available Slots</Heading>
          <View style={styles.slotsGrid}>
            {availability.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.slotButton,
                  { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                  slot.selected && { backgroundColor: '#F5A962', borderWidth: 0 },
                  slot.disabled && { backgroundColor: colors.background, opacity: 0.6 },
                ]}
                onPress={() => toggleSlot(slot.id)}
                disabled={slot.disabled}
              >
                <Text
                  style={[
                    styles.slotText,
                    { color: colors.text },
                    slot.selected && { color: '#FFFFFF' },
                    slot.disabled && { color: colors.disabled },
                  ]}
                >
                  {slot.time}
                </Text>
                {slot.isLunch && (
                  <BodySmall style={styles.lunchLabel}>Lunch Break</BodySmall>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Recurring Availability */}
          <View style={styles.recurringSection}>
            <View style={styles.recurringTextContainer}>
              <Heading level={4} style={styles.recurringTitle}>Recurring Availability</Heading>
              <BodySmall style={styles.recurringSubtitle}>Apply these slots to all future weeks.</BodySmall>
            </View>
            <Switch
              value={recurringEnabled}
              onValueChange={setRecurringEnabled}
              trackColor={{ false: '#D1D1D1', true: '#F09E54' }}
              thumbColor={recurringEnabled ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#F5A962' }]} onPress={handleSaveChanges}>
            <Text style={[styles.saveButtonText, { color: '#FFFFFF' }]}>Save Changes</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...typography.h3,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  calendarContainer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  slotButton: {
    width: '47%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotText: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  lunchLabel: {
    fontSize: typography.label.fontSize,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  recurringSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  recurringTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  recurringTitle: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  recurringSubtitle: {
    ...typography.bodySmall,
  },
  saveButton: {
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    ...typography.button,
  },
});

export default AvailabilityScreen;
