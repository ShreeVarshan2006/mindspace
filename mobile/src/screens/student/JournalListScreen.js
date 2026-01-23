import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, FAB } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchJournals, deleteJournal } from '../../redux/slices/journalSlice';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../constants/theme';

const JournalListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { journals = [] } = useSelector((state) => state.journals || {});
  const [searchQuery, setSearchQuery] = React.useState('');

  useEffect(() => {
    dispatch(fetchJournals());
  }, [dispatch]);

  const filteredJournals = (journals || []).filter((j) =>
    j.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Journal',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteJournal(id)),
        },
      ]
    );
  };

  const renderJournal = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('JournalEditor', { journal: item })}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {new Date(item.date).toISOString().split('T')[0]}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('JournalEditor', { journal: item })}>
          <Icon name="square-edit-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
      <Text style={[styles.content, { color: colors.textSecondary }]} numberOfLines={2}>{item.content}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{'Journal'}</Text>
          <TouchableOpacity>
            <Icon name="filter-variant" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Icon name="magnify" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            placeholder="Search journal entries..."
            placeholderTextColor={colors.placeholder || colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>

        <FlatList
          data={filteredJournals}
          renderItem={renderJournal}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="book-open-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No journal entries yet</Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Start writing to track your thoughts</Text>
            </View>
          }
        />
        <FAB
          style={[styles.fab, { backgroundColor: '#F5A962' }]}
          icon="plus"
          color="#FFFFFF"
          color="#FFFFFF"
          onPress={() => navigation.navigate('JournalEditor')}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.h3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.bodySmall,
    padding: 0,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  card: {
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm + 4,
  },
  date: {
    ...typography.caption,
  },
  title: {
    ...typography.h4,
    marginBottom: spacing.sm,
  },
  content: {
    ...typography.bodySmall,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  emptyText: {
    ...typography.bodyMedium,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 10,
    bottom: 10,
    borderRadius: 30,
  },
});

export default JournalListScreen;
