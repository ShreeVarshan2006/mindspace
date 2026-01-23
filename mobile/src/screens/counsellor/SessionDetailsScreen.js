import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing, theme } from '../../constants/theme';
import { sessionService } from '../../services/sessionService';
import { endSession } from '../../redux/slices/sessionSlice';
import { useTheme } from '../../context/ThemeContext';

const SessionDetailsScreen = ({ route, navigation }) => {
  const { sessionId } = route.params || {};
  const dispatch = useDispatch();
  const [sessionData, setSessionData] = useState(null);
  const [observations, setObservations] = useState('');
  const [actionItems, setActionItems] = useState('');
  const [severity, setSeverity] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFinalized, setIsFinalized] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    loadSessionData();
    loadDraft();
  }, []);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      const response = await sessionService.getSessionById(sessionId);
      if (response.success) {
        setSessionData(response.data);
        if (response.data.observations) setObservations(response.data.observations);
        if (response.data.actionItems) setActionItems(response.data.actionItems);
        if (response.data.severity) setSeverity(response.data.severity);
        if (response.data.isFinalized) setIsFinalized(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load session data');
    } finally {
      setLoading(false);
    }
  };

  const loadDraft = async () => {
    try {
      const draftKey = `session_draft_${sessionId}`;
      const draft = await AsyncStorage.getItem(draftKey);
      if (draft) {
        const parsed = JSON.parse(draft);
        setObservations(parsed.observations || '');
        setActionItems(parsed.actionItems || '');
        setSeverity(parsed.severity || '');
      }
    } catch (error) {
      console.log('Error loading draft:', error);
    }
  };

  const severityOptions = [
    { key: 'low', label: 'Mild', color: '#5CB85C' },
    { key: 'moderate', label: 'Moderate', color: '#F0AD4E' },
    { key: 'high', label: 'Critical', color: '#D9534F' },
  ];

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const draftKey = `session_draft_${sessionId}`;
      const draftData = {
        observations,
        actionItems,
        severity,
        savedAt: new Date().toISOString()
      };
      await AsyncStorage.setItem(draftKey, JSON.stringify(draftData));
      Alert.alert('✅ Draft Saved', 'Your notes have been saved and can be edited later.');
    } catch (error) {
      console.log('Error saving draft:', error);
      Alert.alert('Error', 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!observations.trim()) {
      Alert.alert('Error', 'Please add your observations');
      return;
    }
    if (!severity) {
      Alert.alert('Error', 'Please select severity level');
      return;
    }

    setSaving(true);
    try {
      // Prepare comprehensive session data
      const sessionData = {
        notes: `Observations: ${observations.trim()}\nAction Items: ${actionItems.trim()}`,
        severity,
        observations: observations.trim(),
        actionItems: actionItems.trim(),
        completedAt: new Date().toISOString(),
        isFinalized: true
      };

      const response = await sessionService.endSession(sessionId, sessionData);

      if (response.success || response.data) {
        // Clear draft after successful save
        const draftKey = `session_draft_${sessionId}`;
        await AsyncStorage.removeItem(draftKey);

        // Also save to local storage as backup
        await AsyncStorage.setItem(`session_finalized_${sessionId}`, JSON.stringify(sessionData));

        // Update Redux store with finalized session data
        dispatch(endSession({
          sessionId,
          sessionData: {
            _id: sessionId,
            ...sessionData,
            date: new Date().toISOString(),
            student: sessionData.student || { anonymousUsername: 'Anonymous' }
          }
        }));

        setIsFinalized(true);

        Alert.alert('✅ Session Completed', 'Session notes have been saved successfully.', [
          { text: 'OK', onPress: () => navigation.navigate('History') },
        ]);
      } else {
        // Even if backend fails, save locally
        await AsyncStorage.setItem(`session_finalized_${sessionId}`, JSON.stringify(sessionData));

        // Update Redux store even with local save
        dispatch(endSession({
          sessionId,
          sessionData: {
            _id: sessionId,
            ...sessionData,
            date: new Date().toISOString(),
            student: sessionData.student || { anonymousUsername: 'Anonymous' }
          }
        }));

        Alert.alert('⚠️ Saved Locally', 'Notes saved on device. Will sync when online.');
        setIsFinalized(true);
      }
    } catch (error) {
      console.error('Session finalize error:', error);
      // Save locally as fallback
      try {
        const fallbackData = {
          notes: `Observations: ${observations.trim()}\nAction Items: ${actionItems.trim()}`,
          severity,
          observations: observations.trim(),
          actionItems: actionItems.trim(),
          completedAt: new Date().toISOString(),
          isFinalized: true,
          pendingSync: true
        };
        await AsyncStorage.setItem(`session_finalized_${sessionId}`, JSON.stringify(fallbackData));

        // Update Redux store with fallback data
        dispatch(endSession({
          sessionId,
          sessionData: {
            _id: sessionId,
            ...fallbackData,
            date: new Date().toISOString(),
            student: fallbackData.student || { anonymousUsername: 'Anonymous' }
          }
        }));

        Alert.alert('⚠️ Saved Locally', 'Notes saved on device. Will sync when connection is restored.');
        setIsFinalized(true);
      } catch (storageError) {
        Alert.alert('Error', 'Failed to save session notes. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
        <StatusBar
          barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F5A962" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading session...</Text>
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
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Session Notes</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {isFinalized && (
          <View style={styles.finalizedBanner}>
            <Icon name="lock" size={20} color="#6BCF7F" />
            <Text style={styles.finalizedText}>Session Finalized - Notes are locked</Text>
          </View>
        )}

        {/* Observations Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Observations</Text>
          <TextInput
            value={observations}
            onChangeText={setObservations}
            mode="outlined"
            multiline
            numberOfLines={5}
            placeholder="Document your key observations during the session..."
            placeholderTextColor={colors.placeholder || colors.text + '80'}
            style={styles.textInput}
            outlineColor={colors.border}
            activeOutlineColor={colors.text}
            editable={!isFinalized}
            disabled={isFinalized}
            theme={{
              colors: {
                text: colors.text,
                placeholder: colors.placeholder || colors.text + '80',
              },
              roundness: 12,
            }}
          />
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            Focus on factual details and client expressions.
          </Text>
        </View>

        {/* Action Items Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Action Items</Text>
          <TextInput
            value={actionItems}
            onChangeText={setActionItems}
            mode="outlined"
            multiline
            numberOfLines={5}
            placeholder="List any agreed-upon actions, homework, or follow-ups..."
            placeholderTextColor={colors.placeholder || colors.text + '80'}
            style={styles.textInput}
            outlineColor={colors.border}
            activeOutlineColor={colors.text}
            editable={!isFinalized}
            disabled={isFinalized}
            theme={{
              colors: {
                text: colors.text,
                placeholder: colors.placeholder || colors.text + '80',
              },
              roundness: 12,
            }}
          />
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            Clearly define next steps for both counsellor and client.
          </Text>
        </View>

        {/* Severity Level Section */}
        <View style={styles.section}>
          <Text style={[styles.severityTitle, { color: colors.text }]}>Severity Level</Text>
          <View style={styles.severityContainer}>
            {severityOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => !isFinalized && setSeverity(option.key)}
                disabled={isFinalized}
                style={[
                  styles.severityButton,
                  severity === option.key && { backgroundColor: option.color },
                  isFinalized && styles.severityButtonDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.severityButtonText,
                    { color: colors.text },
                    severity === option.key && styles.severityButtonTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Buttons */}
        {!isFinalized && (
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={styles.saveDraftButton}
              onPress={handleSaveDraft}
              disabled={saving}
            >
              <Text style={[styles.saveDraftButtonText, { color: colors.text }]}>Save Draft</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.finalizeButton, saving && styles.finalizeButtonDisabled]}
              onPress={handleFinalize}
              disabled={saving}
            >
              <Text style={styles.finalizeButtonText}>
                {saving ? 'Saving...' : 'Finalize Notes'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  finalizedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FFF4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6BCF7F',
    gap: 8,
  },
  finalizedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D7A3E',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
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
    fontSize: 15,
    minHeight: 120,
  },
  helperText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 8,
    lineHeight: 16,
  },
  severityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    letterSpacing: 0.1,
  },
  severityContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  severityButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    minWidth: 100,
    alignItems: 'center',
  },
  severityButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  severityButtonTextSelected: {
    color: '#FFFFFF',
  },
  severityButtonDisabled: {
    opacity: 0.5,
  },
  buttonSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 12,
  },
  saveDraftButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDraftButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  finalizeButton: {
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
  finalizeButtonDisabled: {
    opacity: 0.6,
  },
  finalizeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default SessionDetailsScreen;
