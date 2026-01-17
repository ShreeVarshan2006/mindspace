import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing, theme } from '../../constants/theme';
import { sessionService } from '../../services/sessionService';

const SessionDetailsScreen = ({ route, navigation }) => {
  const { sessionId } = route.params || {};
  const [sessionData, setSessionData] = useState(null);
  const [observations, setObservations] = useState('');
  const [actionItems, setActionItems] = useState('');
  const [severity, setSeverity] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessionData();
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
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load session data');
    } finally {
      setLoading(false);
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
      // Save as draft logic
      Alert.alert('Success', 'Draft saved successfully');
    } catch (error) {
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
      const response = await sessionService.endSession(sessionId, {
        notes: `Observations: ${observations.trim()}\nAction Items: ${actionItems.trim()}`,
        severity,
        observations: observations.trim(),
        actionItems: actionItems.trim()
      });

      if (response.success) {
        Alert.alert('Success', 'Session notes finalized successfully', [
          { text: 'OK', onPress: () => navigation.navigate('CounsellorDashboard') },
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to finalize session');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to finalize session notes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F09E54" />
          <Text style={styles.loadingText}>Loading session...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Session Notes</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Observations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Observations</Text>
          <TextInput
            value={observations}
            onChangeText={setObservations}
            mode="outlined"
            multiline
            numberOfLines={5}
            placeholder="Document your key observations during the session..."
            placeholderTextColor="#999999"
            style={styles.textInput}
            outlineColor="#E0E0E0"
            activeOutlineColor="#000000"
            theme={{
              colors: {
                text: '#000000',
                placeholder: '#999999',
              },
              roundness: 12,
            }}
          />
          <Text style={styles.helperText}>
            Focus on factual details and client expressions.
          </Text>
        </View>

        {/* Action Items Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Action Items</Text>
          <TextInput
            value={actionItems}
            onChangeText={setActionItems}
            mode="outlined"
            multiline
            numberOfLines={5}
            placeholder="List any agreed-upon actions, homework, or follow-ups..."
            placeholderTextColor="#999999"
            style={styles.textInput}
            outlineColor="#E0E0E0"
            activeOutlineColor="#000000"
            theme={{
              colors: {
                text: '#000000',
                placeholder: '#999999',
              },
              roundness: 12,
            }}
          />
          <Text style={styles.helperText}>
            Clearly define next steps for both counsellor and client.
          </Text>
        </View>

        {/* Severity Level Section */}
        <View style={styles.section}>
          <Text style={styles.severityTitle}>Severity Level</Text>
          <View style={styles.severityContainer}>
            {severityOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => setSeverity(option.key)}
                style={[
                  styles.severityButton,
                  severity === option.key && { backgroundColor: option.color },
                ]}
              >
                <Text
                  style={[
                    styles.severityButtonText,
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
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.saveDraftButton}
            onPress={handleSaveDraft}
            disabled={saving}
          >
            <Text style={styles.saveDraftButtonText}>Save Draft</Text>
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
