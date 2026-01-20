import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, Animated } from 'react-native';
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
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.studentInfo}>
              <Icon name="shield-account" size={24} color={theme.colors.primary} />
              <Text style={styles.anonymousId}>{item.student?.anonymousUsername || 'Unknown'}</Text>
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
            <Icon name="calendar" size={16} color={theme.colors.placeholder} />
            <Text style={styles.detailText}>{new Date(item.date).toLocaleDateString()}</Text>
          </View>

          <View style={styles.detailsRow}>
            <Icon name="clock-outline" size={16} color={theme.colors.placeholder} />
            <Text style={styles.detailText}>{item.duration || '45 min'}</Text>
          </View>

          {item.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText} numberOfLines={3}>
                {item.notes}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={styles.container}>
          <Searchbar
            placeholder="Search by anonymous ID"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            icon="shield-search"
          />

          <FlatList
            data={filteredSessions}
            renderItem={renderSession}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="history" size={64} color={theme.colors.disabled} />
                <Text style={styles.emptyText}>No session history found</Text>
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
    backgroundColor: theme.colors.background,
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
    color: theme.colors.text,
  },
  notesContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  notesText: {
    fontSize: 14,
    color: theme.colors.placeholder,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.disabled,
    marginTop: spacing.md,
  },
});

export default StudentHistoryScreen;
