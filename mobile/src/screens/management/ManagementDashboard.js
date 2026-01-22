import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchSessions } from '../../redux/slices/sessionSlice';
import { spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const ManagementDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const sessions = useSelector((state) => state.sessions?.sessions || []);
  const [refreshing, setRefreshing] = React.useState(false);
  const { colors, isDarkMode, toggleDarkMode } = useTheme();

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchSessions());
    } catch (error) {
      console.log('Error fetching sessions:', error);
    }
    setRefreshing(false);
  }, [dispatch]);

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  // Calculate statistics
  const totalSessions = Array.isArray(sessions) ? sessions.length : 0;
  const avgSeverity = React.useMemo(() => {
    if (!Array.isArray(sessions) || sessions.length === 0) return 0;
    const severityMap = { low: 1, medium: 3, high: 5 };
    const total = sessions.reduce((sum, s) => sum + (severityMap[s?.severity] || 0), 0);
    return (total / sessions.length).toFixed(1);
  }, [sessions]);

  // Group sessions by counsellor
  const counsellorSessions = React.useMemo(() => {
    if (!Array.isArray(sessions)) return [];
    const grouped = sessions.reduce((acc, session) => {
      const name = session?.counsellor_name || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [sessions]);

  const maxCounsellorSessions = Math.max(...counsellorSessions.map(c => c.count), 1);

  const analytics = [
    {
      title: 'Department Analytics',
      subtitle: 'View session breakdown by academic department.',
      icon: 'chart-bar',
      screen: 'DepartmentAnalytics',
    },
    {
      title: 'Severity Analytics',
      subtitle: 'Analyze session data based on severity levels (coming soon).',
      icon: 'flask-outline',
      screen: 'SeverityAnalytics',
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <Image
            source={require('../../../assets/images/brain-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Management</Text>
          <TouchableOpacity
            style={styles.darkModeButton}
            onPress={toggleDarkMode}
          >
            <Icon
              name={isDarkMode ? "white-balance-sunny" : "moon-waning-crescent"}
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {/* Total Sessions */}
          <View style={[styles.statCard, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Sessions</Text>
            <Text style={styles.statValue}>{totalSessions.toLocaleString()}</Text>
            <View style={styles.statChange}>
              <Icon name="arrow-up" size={14} color="#4CAF50" />
              <Text style={styles.statChangeText}>+5% this month</Text>
            </View>
          </View>

          {/* Avg Severity */}
          <View style={[styles.statCard, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg. Severity</Text>
            <Text style={styles.statValue}>{avgSeverity}</Text>
            <View style={styles.statChange}>
              <Icon name="arrow-up" size={14} color="#F44336" />
              <Text style={[styles.statChangeText, { color: '#F44336' }]}>+0.1 (increase)</Text>
            </View>
            <Text style={[styles.statSubtext, { color: colors.textTertiary }]}>On a scale of 1-5</Text>
          </View>
        </View>

        {/* Sessions by Counsellor */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sessions by Counsellor</Text>
          {counsellorSessions.map((counsellor, index) => (
            <View key={index} style={styles.counsellorRow}>
              <Text style={[styles.counsellorName, { color: colors.text }]}>{counsellor.name}</Text>
              <View style={[styles.barContainer, { backgroundColor: colors.text === '#FFFFFF' ? '#3A3A3A' : '#FFE8D6' }]}>
                <View
                  style={[
                    styles.bar,
                    { width: `${(counsellor.count / maxCounsellorSessions) * 60}%` }
                  ]}
                />
              </View>
              <Text style={[styles.counsellorCount, { color: colors.text }]}>{counsellor.count}</Text>
            </View>
          ))}
        </View>

        {/* Analytics Reports */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Analytics Reports</Text>
          {analytics.map((item, index) => (
            <TouchableOpacity key={index} onPress={() => navigation.navigate(item.screen)}>
              <View style={styles.analyticsCard}>
                <View style={styles.analyticsContent}>
                  <Text style={styles.analyticsTitle}>{item.title}</Text>
                  <Text style={styles.analyticsSubtitle}>{item.subtitle}</Text>
                </View>
                <Icon name={item.icon} size={32} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  logo: {
    width: 48,
    height: 48,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.15,
    flex: 1,
    marginLeft: spacing.md,
  },
  darkModeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: spacing.md,
    minHeight: 120,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: spacing.xs,
    fontWeight: '400',
    letterSpacing: 0.25,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '600',
    color: '#F5A962',
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statChangeText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '400',
  },
  statSubtext: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '400',
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
    letterSpacing: 0.15,
  },
  counsellorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  counsellorName: {
    fontSize: 16,
    width: 140,
    fontWeight: '400',
  },
  barContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#F5A962',
    borderRadius: 4,
  },
  counsellorCount: {
    fontSize: 16,
    fontWeight: '600',
    width: 32,
    textAlign: 'right',
  },
  analyticsCard: {
    backgroundColor: '#F5A962',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  analyticsContent: {
    flex: 1,
    paddingRight: spacing.md,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    letterSpacing: 0.15,
  },
  analyticsSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 20,
    fontWeight: '400',
  },
});

export default ManagementDashboard;
