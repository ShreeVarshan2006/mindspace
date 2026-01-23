import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { Heading, BodySmall, Label as TypographyLabel } from '../../components/Typography';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchSessions } from '../../redux/slices/sessionSlice';
import { spacing, typography } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const DepartmentAnalyticsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const sessions = useSelector((state) => state.sessions?.sessions || []);
  const { colors } = useTheme();
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedCalendarYear, setSelectedCalendarYear] = useState('All');
  const [showYearModal, setShowYearModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showCalendarYearModal, setShowCalendarYearModal] = useState(false);

  const years = ['I', 'II', 'III', 'IV'];
  const departments = ['Cloud Computing', 'AIML', 'CSE', 'ECE', 'MECH', 'CIVIL', 'MBA'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const calendarYears = ['2024', '2025', '2026'];

  useEffect(() => {
    const loadSessions = async () => {
      try {
        await dispatch(fetchSessions());
      } catch (error) {
        console.log('Error loading sessions:', error);
      }
    };
    loadSessions();
  }, [dispatch]);

  // Group sessions by department with filters
  const departmentData = React.useMemo(() => {
    const data = {};
    const deptOrder = ['Cloud Computing', 'AIML', 'CSE', 'ECE', 'MECH', 'CIVIL', 'MBA'];

    // Filter sessions based on selected filters
    const filteredSessions = (Array.isArray(sessions) ? sessions : []).filter((session) => {
      const matchesYear = selectedYear === 'All' || session?.student?.year === selectedYear;
      const matchesDept = selectedDepartment === 'All' || session?.student?.department === selectedDepartment;

      let matchesMonth = true;
      if (selectedMonth !== 'All' && session?.date) {
        const sessionDate = new Date(session.date);
        const sessionMonth = sessionDate.toLocaleDateString('en-US', { month: 'long' });
        matchesMonth = sessionMonth === selectedMonth;
      }

      let matchesCalendarYear = true;
      if (selectedCalendarYear !== 'All' && session?.date) {
        const sessionDate = new Date(session.date);
        matchesCalendarYear = sessionDate.getFullYear().toString() === selectedCalendarYear;
      }

      return matchesYear && matchesDept && matchesMonth && matchesCalendarYear;
    });

    filteredSessions.forEach((session) => {
      const dept = session?.student?.department || 'Unknown';
      if (!data[dept]) {
        data[dept] = 0;
      }
      data[dept]++;
    });

    return deptOrder
      .filter(dept => data[dept])
      .map(dept => ({
        name: dept,
        count: data[dept] || 0,
      }));
  }, [sessions, selectedYear, selectedDepartment, selectedMonth, selectedCalendarYear]);

  const totalSessions = departmentData.reduce((sum, d) => sum + d.count, 0);
  const highestDept = departmentData.length > 0
    ? departmentData.reduce((max, d) => d.count > max.count ? d : max, departmentData[0])
    : null;
  const lowestDept = departmentData.length > 0
    ? departmentData.reduce((min, d) => d.count < min.count ? d : min, departmentData[0])
    : null;

  const maxCount = Math.max(...departmentData.map(d => d.count), 1);
  const chartHeight = 300;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-left" size={28} color={colors.text} />
          </TouchableOpacity>
          <Heading level={3} style={styles.headerTitle}>Department Analytics</Heading>
          <View style={styles.menuButton} />
        </View>

        {/* Filters Row 1 */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterPill, { backgroundColor: colors.surface, borderColor: '#F5A962' }]}
            onPress={() => setShowYearModal(true)}
          >
            <BodySmall style={styles.filterText}>Year of Study: {selectedYear}</BodySmall>
            <Icon name="chevron-down" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, { backgroundColor: colors.surface, borderColor: '#F5A962' }]}
            onPress={() => setShowDepartmentModal(true)}
          >
            <BodySmall style={styles.filterText}>Department: {selectedDepartment === 'All' ? 'All' : selectedDepartment}</BodySmall>
            <Icon name="chevron-down" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Filters Row 2 */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterPill, { backgroundColor: colors.surface, borderColor: '#F5A962' }]}
            onPress={() => setShowMonthModal(true)}
          >
            <BodySmall style={styles.filterText}>Month: {selectedMonth}</BodySmall>
            <Icon name="chevron-down" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, { backgroundColor: colors.surface, borderColor: '#F5A962' }]}
            onPress={() => setShowCalendarYearModal(true)}
          >
            <BodySmall style={styles.filterText}>Calendar Year: {selectedCalendarYear}</BodySmall>
            <Icon name="chevron-down" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Chart */}
        <View style={styles.chartSection}>
          <Heading level={3} style={styles.chartTitle}>Counselling Sessions by Department</Heading>

          <View style={styles.chart}>
            {/* Y-axis labels */}
            <View style={styles.yAxis}>
              <TypographyLabel style={styles.yAxisLabel}>200</TypographyLabel>
              <TypographyLabel style={styles.yAxisLabel}>150</TypographyLabel>
              <TypographyLabel style={styles.yAxisLabel}>100</TypographyLabel>
              <TypographyLabel style={styles.yAxisLabel}>50</TypographyLabel>
              <TypographyLabel style={styles.yAxisLabel}>0</TypographyLabel>
            </View>

            {/* Bars */}
            <View style={styles.barsContainer}>
              {departmentData.map((dept, index) => (
                <View key={index} style={styles.barWrapper}>
                  <View style={styles.barColumn}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: (dept.count / maxCount) * (chartHeight - 40),
                        }
                      ]}
                    />
                  </View>
                  <TypographyLabel style={styles.barLabel}>{dept.name}</TypographyLabel>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          {/* Total Sessions */}
          <View style={[styles.statCardHalf, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Icon name="chart-bar" size={24} color="#B8A8D8" />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Sessions</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalSessions.toLocaleString()}</Text>
          </View>

          {/* Highest Utilized */}
          <View style={[styles.statCardHalf, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Icon name="trending-up" size={24} color="#B8A8D8" />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Highest Utilized Dept</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {highestDept ? `${highestDept.name} (${highestDept.count})` : 'N/A'}
            </Text>
          </View>

          {/* Lowest Utilized */}
          <View style={[styles.statCardFull, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Icon name="trending-down" size={24} color="#B8A8D8" />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Lowest Utilized Dept</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {lowestDept ? `${lowestDept.name} (${lowestDept.count})` : 'N/A'}
            </Text>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Year Filter Modal */}
      <Modal
        visible={showYearModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowYearModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Options</Text>
              <TouchableOpacity onPress={() => setShowYearModal(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Select Year</Text>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  selectedYear === 'All' && styles.optionButtonSelected
                ]}
                onPress={() => {
                  setSelectedYear('All');
                  setShowYearModal(false);
                }}
              >
                <Text style={[
                  styles.optionText,
                  { color: colors.textSecondary },
                  selectedYear === 'All' && styles.optionTextSelected
                ]}>All</Text>
              </TouchableOpacity>
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.optionButton,
                    selectedYear === year && styles.optionButtonSelected
                  ]}
                  onPress={() => {
                    setSelectedYear(year);
                    setShowYearModal(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    { color: colors.textSecondary },
                    selectedYear === year && styles.optionTextSelected
                  ]}>{year}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSelectedYear('All');
                setShowYearModal(false);
              }}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Department Filter Modal */}
      <Modal
        visible={showDepartmentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDepartmentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Options</Text>
              <TouchableOpacity onPress={() => setShowDepartmentModal(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Select Department</Text>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  selectedDepartment === 'All' && styles.optionButtonSelected
                ]}
                onPress={() => {
                  setSelectedDepartment('All');
                  setShowDepartmentModal(false);
                }}
              >
                <Text style={[
                  styles.optionText,
                  { color: colors.textSecondary },
                  selectedDepartment === 'All' && styles.optionTextSelected
                ]}>All</Text>
              </TouchableOpacity>
              {departments.map((dept) => (
                <TouchableOpacity
                  key={dept}
                  style={[
                    styles.optionButton,
                    selectedDepartment === dept && styles.optionButtonSelected
                  ]}
                  onPress={() => {
                    setSelectedDepartment(dept);
                    setShowDepartmentModal(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    { color: colors.textSecondary },
                    selectedDepartment === dept && styles.optionTextSelected
                  ]}>{dept}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSelectedDepartment('All');
                setShowDepartmentModal(false);
              }}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Month Filter Modal */}
      <Modal
        visible={showMonthModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMonthModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Options</Text>
              <TouchableOpacity onPress={() => setShowMonthModal(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Select Month</Text>

            <ScrollView style={styles.scrollableOptions}>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    selectedMonth === 'All' && styles.optionButtonSelected
                  ]}
                  onPress={() => {
                    setSelectedMonth('All');
                    setShowMonthModal(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    { color: colors.textSecondary },
                    selectedMonth === 'All' && styles.optionTextSelected
                  ]}>All</Text>
                </TouchableOpacity>
                {months.map((month) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.optionButton,
                      selectedMonth === month && styles.optionButtonSelected
                    ]}
                    onPress={() => {
                      setSelectedMonth(month);
                      setShowMonthModal(false);
                    }}
                  >
                    <Text style={[
                      styles.optionText,
                      { color: colors.textSecondary },
                      selectedMonth === month && styles.optionTextSelected
                    ]}>{month}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSelectedMonth('All');
                setShowMonthModal(false);
              }}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Calendar Year Filter Modal */}
      <Modal
        visible={showCalendarYearModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalendarYearModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Options</Text>
              <TouchableOpacity onPress={() => setShowCalendarYearModal(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Select Calendar Year</Text>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  selectedCalendarYear === 'All' && styles.optionButtonSelected
                ]}
                onPress={() => {
                  setSelectedCalendarYear('All');
                  setShowCalendarYearModal(false);
                }}
              >
                <Text style={[
                  styles.optionText,
                  { color: colors.textSecondary },
                  selectedCalendarYear === 'All' && styles.optionTextSelected
                ]}>All</Text>
              </TouchableOpacity>
              {calendarYears.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.optionButton,
                    selectedCalendarYear === year && styles.optionButtonSelected
                  ]}
                  onPress={() => {
                    setSelectedCalendarYear(year);
                    setShowCalendarYearModal(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    { color: colors.textSecondary },
                    selectedCalendarYear === year && styles.optionTextSelected
                  ]}>{year}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSelectedCalendarYear('All');
                setShowCalendarYearModal(false);
              }}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    flex: 1,
    textAlign: 'center',
  },
  menuButton: {
    padding: spacing.xs,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4EC',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: '#F5A962',
  },
  filterText: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  chartSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  chartTitle: {
    ...typography.h3,
    marginBottom: spacing.lg,
  },
  chart: {
    flexDirection: 'row',
    height: 320,
    marginBottom: spacing.xl,
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    paddingRight: spacing.sm,
    paddingTop: 10,
    paddingBottom: 30,
  },
  yAxisLabel: {
    ...typography.label,
    textAlign: 'right',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    paddingBottom: 30,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  barColumn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 260,
  },
  bar: {
    width: '100%',
    backgroundColor: '#F5A962',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    ...typography.label,
    marginTop: spacing.sm,
    fontWeight: '400',
  },
  statsGrid: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCardHalf: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    minHeight: 120,
  },
  statCardFull: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    minHeight: 100,
  },
  statLabel: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    fontWeight: '400',
  },
  statValue: {
    ...typography.h2,
    letterSpacing: -0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    ...typography.h2,
  },
  modalSubtitle: {
    ...typography.bodySmall,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  scrollableOptions: {
    maxHeight: 300,
  },
  optionButton: {
    backgroundColor: '#E8E8E8',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#FF6B6B',
  },
  optionText: {
    ...typography.body,
    color: '#4A4A4A',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  clearButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  clearButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FF6B6B',
  },
});

export default DepartmentAnalyticsScreen;
