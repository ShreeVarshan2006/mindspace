import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, Chip, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { createJournal, updateJournal } from '../../redux/slices/journalSlice';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../constants/theme';

const JournalEditorScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const journal = route.params?.journal;

  const [title, setTitle] = useState(journal?.title || '');
  const [content, setContent] = useState(journal?.content || '');
  const [mood, setMood] = useState(journal?.mood || '');
  const [tags, setTags] = useState(journal?.tags || []);
  const [isSaving, setIsSaving] = useState(false);

  const moods = ['happy', 'calm', 'anxious', 'sad', 'neutral'];
  const commonTags = ['academic', 'social', 'achievement', 'stress', 'personal'];

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    setIsSaving(true);
    try {
      const journalData = {
        title: title.trim(),
        content: content.trim(),
        mood,
        tags,
      };

      if (journal) {
        await dispatch(updateJournal({ id: journal._id, data: journalData })).unwrap();
        Alert.alert('Success', 'Journal updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await dispatch(createJournal(journalData)).unwrap();
        Alert.alert('Success', 'Journal saved successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error || 'Failed to save journal');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <TextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Give your journal a title"
            placeholderTextColor={colors.placeholder || colors.textSecondary}
            outlineColor={colors.border}
            activeOutlineColor="#F5A962"
            theme={{
              colors: {
                text: colors.text,
                placeholder: colors.textSecondary,
              },
            }}
          />

          <TextInput
            label="What's on your mind?"
            value={content}
            onChangeText={setContent}
            mode="outlined"
            multiline
            numberOfLines={12}
            style={[styles.input, styles.contentInput, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Write your thoughts here..."
            placeholderTextColor={colors.placeholder || colors.textSecondary}
            textAlignVertical="top"
            outlineColor={colors.border}
            activeOutlineColor="#F5A962"
            theme={{
              colors: {
                text: colors.text,
                placeholder: colors.textSecondary,
              },
            }}
          />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>How are you feeling?</Text>
            <View style={styles.moodContainer}>
              {moods.map((m) => (
                <Chip
                  key={m}
                  selected={mood === m}
                  onPress={() => setMood(m)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: mood === m ? '#F5A962' : colors.surface,
                      borderColor: colors.border,
                      borderWidth: 1,
                    }
                  ]}
                  textStyle={{ color: mood === m ? '#FFFFFF' : colors.text }}
                >
                  {m}
                </Chip>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tags</Text>
            <View style={styles.tagsContainer}>
              {commonTags.map((tag) => (
                <Chip
                  key={tag}
                  selected={tags.includes(tag)}
                  onPress={() => toggleTag(tag)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: tags.includes(tag) ? '#6BCF7F' : colors.surface,
                      borderColor: colors.border,
                      borderWidth: 1,
                    }
                  ]}
                  textStyle={{ color: tags.includes(tag) ? '#FFFFFF' : colors.text }}
                >
                  {tag}
                </Chip>
              ))}
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleSave}
            loading={isSaving}
            disabled={isSaving}
            style={styles.saveButton}
            buttonColor="#F5A962"
            textColor="#FFFFFF"
          >
            {journal ? 'Update Journal' : 'Save Journal'}
          </Button>
        </View>
      </ScrollView>
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  input: {
    marginBottom: spacing.md,
    ...typography.body,
  },
  contentInput: {
    minHeight: 220,
    textAlignVertical: 'top',
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.sm,
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  saveButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
});

export default JournalEditorScreen;
