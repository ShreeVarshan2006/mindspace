import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { logMood, fetchMoods } from '../../redux/slices/moodSlice';
import { useTheme } from '../../context/ThemeContext';
import { spacing, theme } from '../../constants/theme';

const screenWidth = Dimensions.get('window').width;

const MoodTrackerScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
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

  const getMoodEmoji = (mood) => {
    const emojis = {
      sad: '😢',
      neutral: '😐',
      happy: '😊',
      excited: '😄',
    };
    return emojis[mood] || '😊';
  };

  const getMoodColor = (mood) => {
    const colors = {
      sad: '#FF6B6B',
      neutral: '#FFD93D',
      happy: '#6BCF7F',
      excited: '#6B8CFF',
    };
    return colors[mood] || '#6BCF7F';
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get sorted moods (most recent first)
  const sortedMoods = [...moods].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  ).slice(0, 10); // Show last 10 moods

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
      // Immediately fetch updated moods to refresh the screen
      await dispatch(fetchMoods());
      setSelectedMood(null);
      setNote('');
      alert('Mood logged successfully!');
    } catch (error) {
      alert('Failed to log mood');
    }
  };

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Log Mood</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* How are you feeling today */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.questionText, { color: colors.text }]}>How are you feeling today?</Text>
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
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Optional Notes</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            mode="outlined"
            multiline
            numberOfLines={4}
            placeholder="What's on your mind? (e.g., 'Feeling stressed about exams.')"
            placeholderTextColor={colors.textSecondary}
            style={[styles.textInput, { backgroundColor: colors.card }]}
            textColor={colors.text}
            outlineColor={colors.border}
            activeOutlineColor="#F5A962"
            theme={{
              colors: {
                text: colors.text,
                placeholder: colors.textSecondary,
                onSurfaceVariant: colors.textSecondary,
              },
              roundness: 12,
            }}
          />
        </View>

        {/* Previous Moods */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Recent Mood History</Text>
          {sortedMoods.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No moods logged yet. Start by logging your first mood!
              </Text>
            </View>
          ) : (
            <View style={styles.moodHistoryContainer}>
              {sortedMoods.map((mood, index) => (
                <View
                  key={mood._id || index}
                  style={[
                    styles.moodHistoryItem,
                    {
                      backgroundColor: colors.card,
                      borderLeftColor: getMoodColor(mood.mood),
                    },
                  ]}
                >
                  <View style={styles.moodHistoryLeft}>
                    <Text style={styles.moodHistoryEmoji}>
                      {getMoodEmoji(mood.mood)}
                    </Text>
                    <View style={styles.moodHistoryDetails}>
                      <Text style={[styles.moodHistoryType, { color: colors.text }]}>
                        {mood.mood.charAt(0).toUpperCase() + mood.mood.slice(1)}
                      </Text>
                      <Text style={[styles.moodHistoryDate, { color: colors.textSecondary }]}>
                        {formatDateTime(mood.createdAt)}
                      </Text>
                    </View>
                  </View>
                  {mood.note && (
                    <Text
                      style={[styles.moodHistoryNote, { color: colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {mood.note}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
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
    letterSpacing: 0.2,
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
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
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
    marginBottom: 12,
    letterSpacing: 0.1,
  },
  textInput: {
    fontSize: 14,
    minHeight: 100,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    letterSpacing: 0.1,
  },
  moodHistoryContainer: {
    gap: 12,
    paddingBottom: 16,
  },
  moodHistoryItem: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  moodHistoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moodHistoryEmoji: {
    fontSize: 32,
  },
  moodHistoryDetails: {
    flex: 1,
  },
  moodHistoryType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  moodHistoryDate: {
    fontSize: 14,
  },
  moodHistoryNote: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  buttonSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  submitButton: {
    backgroundColor: '#F5A962',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#F5A962',
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
