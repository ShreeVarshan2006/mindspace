import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchSessions } from '../../redux/slices/sessionSlice';
import { spacing, theme } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const YearAnalyticsScreen = () => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const sessions = useSelector((state) => state.sessions?.sessions || []);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadSessions = async () => {
      try {
        await dispatch(fetchSessions());
      } catch (error) {
        console.log('Error loading sessions:', error);
      }
    };
    loadSessions();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [dispatch]);

  // Group sessions by year
  const yearData = (Array.isArray(sessions) ? sessions : []).reduce((acc, session) => {
    const year = session?.student?.year || 'Unknown';
    if (!acc[year]) {
      acc[year] = { total: 0, high: 0, moderate: 0, low: 0 };
    }
    acc[year].total++;
    if (session?.severity === 'high') acc[year].high++;
    else if (session?.severity === 'moderate') acc[year].moderate++;
    else if (session?.severity === 'low') acc[year].low++;
    return acc;
  }, {});

  const years = Object.keys(yearData)
    .sort()
    .map((year) => ({
      name: year,
      ...yearData[year],
    }));

  const maxSessions = Math.max(...years.map((y) => y.total), 1);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { backgroundColor: colors.background }]}>
            <Icon name="school" size={40} color="#F5A962" />
            <Text style={[styles.title, { color: colors.text }]}>Year-wise Analytics</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Session distribution by academic year</Text>
          </View>

          {years.length === 0 ? (
            <Card style={[styles.card, { backgroundColor: colors.surface }]}>
              <Card.Content style={styles.emptyState}>
                <Icon name="chart-line" size={64} color={colors.textTertiary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No data available</Text>
              </Card.Content>
            </Card>
          ) : (
            years.map((year, index) => (
              <Card key={index} style={[styles.card, { backgroundColor: colors.surface }]}>
                <Card.Content>
                  <View style={styles.yearHeader}>
                    <Text style={[styles.yearName, { color: colors.text }]}>Year {year.name}</Text>
                    <Text style={styles.yearTotal}>{year.total} sessions</Text>
                  </View>

                  <View style={[styles.barContainer, { backgroundColor: colors.card }]}>
                    <View
                      style={[
                        styles.bar,
                        { width: `${(year.total / maxSessions) * 100}%` },
                      ]}
                    />
                  </View>

                  <View style={styles.severityBreakdown}>
                    <View style={styles.severityItem}>
                      <View style={[styles.severityDot, { backgroundColor: '#FF6B6B' }]} />
                      <Text style={[styles.severityText, { color: colors.textSecondary }]}>High: {year.high}</Text>
                    </View>
                    <View style={styles.severityItem}>
                      <View style={[styles.severityDot, { backgroundColor: '#F5A962' }]} />
                      <Text style={[styles.severityText, { color: colors.textSecondary }]}>Moderate: {year.moderate}</Text>
                    </View>
                    <View style={styles.severityItem}>
                      <View style={[styles.severityDot, { backgroundColor: '#6BCF7F' }]} />
                      <Text style={[styles.severityText, { color: colors.textSecondary }]}>Low: {year.low}</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    marginTop: spacing.xs,
  },
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  yearHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  yearName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  yearTotal: {
    fontSize: 16,
    color: '#F5A962',
    fontWeight: '600',
  },
  barContainer: {
    height: 8,
    backgroundColor: '#EEEEEE',
    borderRadius: 4,
    marginBottom: spacing.md,
  },
  bar: {
    height: '100%',
    backgroundColor: '#F5A962',
    borderRadius: 4,
  },
  severityBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  severityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  severityText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    marginTop: spacing.md,
  },
});

export default YearAnalyticsScreen;
