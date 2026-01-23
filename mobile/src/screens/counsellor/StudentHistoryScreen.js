import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, Animated, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Chip, Searchbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchSessions } from '../../redux/slices/sessionSlice';
import { spacing, theme } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const StudentHistoryScreen = () => {
  const dispatch = useDispatch();
  const { sessions = [] } = useSelector((state) => state.sessions || {});
  const [searchQuery, setSearchQuery] = React.useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { colors } = useTheme();

  useEffect(() => {
    dispatch(fetchSessions());
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [dispatch]);

  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const filteredSessions = safeSessions.filter((s) =>
    s?.student?.anonymousUsername?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return '#F44336';
      case 'moderate':
        return '#FF9800';
      case 'low':
        return '#4CAF50';
      default:
        return theme.colors.disabled;
    }
  };

  const renderSession = ({ item }) => {
    if (!item) return null;

    return (
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.studentInfo}>
              <Icon name="shield-account" size={24} color="#F5A962" />
              <Text style={[styles.anonymousId, { color: colors.text }]}>{item.student?.anonymousUsername || 'Unknown'}</Text>
            </View>
            {item.severity && (
              <Chip
                mode="flat"
                style={{ backgroundColor: getSeverityColor(item.severity) + '20' }}
                textStyle={{ color: getSeverityColor(item.severity) }}
              >
                {item.severity}
              </Chip>
            )}
          </View>

          <View style={styles.detailsRow}>
            <Icon name="calendar" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{new Date(item.date).toLocaleDateString()}</Text>
          </View>

          <View style={styles.detailsRow}>
            <Icon name="clock-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.duration || '45 min'}</Text>
          </View>

          {item.notes && (
            <View style={[styles.notesContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.notesLabel, { color: colors.text }]}>Notes:</Text>
              <Text style={[styles.notesText, { color: colors.textSecondary }]} numberOfLines={3}>
                {item.notes}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar
        barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={styles.container}>
          <Searchbar
            placeholder="Search by anonymous ID"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[styles.searchbar, { backgroundColor: colors.surface }]}
            inputStyle={{ color: colors.text }}
            placeholderTextColor={colors.placeholder}
            iconColor={colors.text}
            icon="shield-search"
          />

          <FlatList
            data={filteredSessions}
            renderItem={renderSession}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="history" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No session history found</Text>
              </View>
            }
          />
        </View>
      </Animated.View>
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
  searchbar: {
    margin: spacing.md,
  },
  list: {
    padding: spacing.md,
    paddingTop: 0,
  },
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  anonymousId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
    fontFamily: 'monospace',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailText: {
    marginLeft: spacing.sm,
    fontSize: 14,
  },
  notesContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  notesText: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    marginTop: spacing.md,
  },
});

export default StudentHistoryScreen;
