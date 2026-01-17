import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart } from 'react-native-chart-kit';
import { logMood, fetchMoods } from '../../redux/slices/moodSlice';
import { spacing, theme } from '../../constants/theme';

const MoodTrackerScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { moods = [] } = useSelector((state) => state.moods || {});
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');

  const moodOptions = [
    { key: 'sad', emoji: 'emoticon-sad-outline', color: '#000000', bgColor: '#FF6B6B' },
    { key: 'neutral', emoji: 'emoticon-neutral-outline', color: '#000000', bgColor: '#FFD93D' },
    { key: 'happy', emoji: 'emoticon-happy-outline', color: '#000000', bgColor: '#6BCF7F' },
    { key: 'excited', emoji: 'emoticon-excited-outline', color: '#FFFFFF', bgColor: '#6B8CFF' },
  ];

  useEffect(() => {
    dispatch(fetchMoods());
  }, [dispatch]);

  const getLast7DaysData = () => {
    const days = ['Tue', 'Thu', 'Fri', 'Sun'];
    const data = [2, 3.5, 4, 2.5, 4.5, 3, 3.5, 2.5];
    return { labels: days, datasets: [{ data }] };
  };

  const handleLogMood = async () => {
    if (!selectedMood) {
      alert('Please select a mood');
      return;
    }

    const moodData = {
      mood: selectedMood,
      intensity: 3,
      note,
      activities: [],
    };

    try {
      await dispatch(logMood(moodData)).unwrap();
      setSelectedMood(null);
      setNote('');
      alert('Mood logged successfully!');
    } catch (error) {
      alert('Failed to log mood');
    }
  };

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
        <Text style={styles.headerTitle}>Log Mood</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* How are you feeling today */}
        <View style={styles.section}>
          <Text style={styles.questionText}>How are you feeling today?</Text>
          <View style={styles.moodOptions}>
            {moodOptions.map((mood) => (
              <TouchableOpacity
                key={mood.key}
                style={[
                  styles.moodButton,
                  { backgroundColor: mood.bgColor },
                  selectedMood === mood.key && styles.moodButtonSelected,
                ]}
                onPress={() => setSelectedMood(mood.key)}
              >
                <Icon name={mood.emoji} size={40} color={mood.color} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Optional Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Optional Notes</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            mode="outlined"
            multiline
            numberOfLines={4}
            placeholder="What's on your mind? (e.g., 'Feeling stressed about exams.')"
            placeholderTextColor="#999999"
            style={styles.textInput}
            outlineColor="#E0E0E0"
            activeOutlineColor="#000000"
            theme={{
              colors: {
                text: '#666666',
                placeholder: '#999999',
              },
              roundness: 12,
            }}
          />
        </View>

        {/* Last 7 Days Mood Trend */}
        <View style={styles.section}>
          <Text style={styles.chartTitle}>Last 7 Days Mood Trend</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={getLast7DaysData()}
              width={screenWidth - 40}
              height={180}
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#FFFFFF',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(240, 158, 84, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '0',
                },
                propsForBackgroundLines: {
                  strokeWidth: 0,
                },
              }}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLines={false}
              withHorizontalLines={false}
              withVerticalLabels={true}
              withHorizontalLabels={false}
              fromZero={true}
            />
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleLogMood}
          >
            <Text style={styles.submitButtonText}>Submit Mood Log</Text>
          </TouchableOpacity>
        </View>
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
    alignItems: 'flex-start',
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
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
    letterSpacing: 0.1,
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  moodButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  moodButtonSelected: {
    transform: [{ scale: 1.1 }],
    elevation: 4,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    letterSpacing: 0.1,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    fontSize: 14,
    minHeight: 100,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    letterSpacing: 0.1,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  buttonSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  submitButton: {
    backgroundColor: '#F09E54',
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
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default MoodTrackerScreen;
