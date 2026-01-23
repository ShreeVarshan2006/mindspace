import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchSessions } from '../../redux/slices/sessionSlice';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../constants/theme';
import { Heading } from '../../components/Typography';

const SessionHistoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { sessions = [], isLoading } = useSelector((state) => state.sessions || {});
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      await dispatch(fetchSessions()).unwrap();
      setError(null);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err?.message || 'Failed to load sessions');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  // Group sessions by date
  const groupedSessions = React.useMemo(() => {
    const groups = {};
    (sessions || []).forEach(session => {
      if (!session || !session.date) return;
      try {
        const date = new Date(session.date).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(session);
      } catch (error) {
        console.error('Error parsing session date:', error);
      }
    });
    return groups;
  }, [sessions]);

  if (isLoading && (!sessions || sessions.length === 0)) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F5A962" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F5A962']} />}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={28} color={colors.text} />
          </TouchableOpacity>
          <Heading level={3} style={styles.headerTitle}>Session History</Heading>
          <View style={{ width: 28 }} />
        </View>

        {/* Error State */}
        {error ? (
          <View style={styles.emptyState}>
            <Icon name="alert-circle" size={64} color="#FF6B6B" />
            <Text style={[styles.emptyText, { color: colors.text }]}>{error}</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Pull down to retry</Text>
          </View>
        ) : (!sessions || sessions.length === 0) ? (
          <View style={styles.emptyState}>
            <Icon name="history" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No session history</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Your counselling session history will appear here
            </Text>
          </View>
        ) : (
          Object.entries(groupedSessions).map(([date, dateSessions]) => (
            <View key={date} style={styles.dateSection}>
              <View style={styles.dateHeader}>
                <Icon name="calendar" size={20} color={colors.textSecondary} style={styles.dateIcon} />
                <Text style={[styles.dateText, { color: colors.text }]}>{date}</Text>
              </View>
              {dateSessions.map((session) => (
                <View key={session._id} style={[styles.sessionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={[styles.avatar, { backgroundColor: colors.card }]}>
                    <Icon name="account" size={24} color={colors.textSecondary} />
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={[styles.counsellorName, { color: colors.text }]}>
                      {session.counsellor?.name || 'Counsellor'}
                    </Text>
                    <Text style={[styles.sessionType, { color: colors.textSecondary }]}>
                      {session.type || 'Session'} • {session.duration || '30'} mins
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView >
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dateSection: {
    marginTop: spacing.lg,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  counsellorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  sessionType: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 15,
    letterSpacing: 0.2,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

export default SessionHistoryScreen;