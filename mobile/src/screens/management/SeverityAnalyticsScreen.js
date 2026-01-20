import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchSessions } from '../../redux/slices/sessionSlice';
import { spacing, theme } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const SeverityAnalyticsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const sessions = useSelector((state) => state.sessions?.sessions || []);
  const { colors } = useTheme();
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedCalendarYear, setSelectedCalendarYear] = useState('All');
  const [showYearModal, setShowYearModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showSeverityModal, setShowSeverityModal] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showCalendarYearModal, setShowCalendarYearModal] = useState(false);

  const years = ['I', 'II', 'III', 'IV'];
  const departments = ['Cloud Computing', 'AIML', 'CSE', 'ECE', 'MECH', 'CIVIL', 'MBA'];
  const severityLevels = ['Mild', 'Moderate', 'Critical'];
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

  // Calculate severity data with filters
  const filteredSessions = React.useMemo(() => {
    return (Array.isArray(sessions) ? sessions : []).filter((session) => {
      const matchesYear = selectedYear === 'All' || session?.student?.year === selectedYear;
      const matchesDept = selectedDepartment === 'All' || session?.student?.department === selectedDepartment;

      let matchesSeverity = true;
      if (selectedSeverity !== 'All') {
        const severityMap = {
          'Mild': 'low',
          'Moderate': 'moderate',
          'Critical': 'high'
        };
        matchesSeverity = session?.severity === severityMap[selectedSeverity];
      }

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

      return matchesYear && matchesDept && matchesSeverity && matchesMonth && matchesCalendarYear;
    });
  }, [sessions, selectedYear, selectedDepartment, selectedSeverity, selectedMonth, selectedCalendarYear]);

  const totalSessions = filteredSessions.length;
  const mildCount = filteredSessions.filter((s) => s?.severity === 'low').length;
  const moderateCount = filteredSessions.filter((s) => s?.severity === 'moderate').length;
  const criticalCount = filteredSessions.filter((s) => s?.severity === 'critical' || s?.severity === 'high').length;

  const total = mildCount + moderateCount + criticalCount || 1;

  // Calculate percentages for bar chart
  const mildPercentage = total > 0 ? (mildCount / total) * 100 : 0;
  const moderatePercentage = total > 0 ? (moderateCount / total) * 100 : 0;
  const criticalPercentage = total > 0 ? (criticalCount / total) * 100 : 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Severity Trends</Text>
        <View style={styles.filterButton} />
      </View>

      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Section */}
        <View style={styles.filterSection}>
          {/* Year Filter */}
          <TouchableOpacity
            style={styles.filterDropdown}
            onPress={() => setShowYearModal(true)}
          >
            <Text style={styles.filterLabel}>Year of Study: </Text>
            <Text style={styles.filterValue}>{selectedYear}</Text>
            <Icon name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Department Filter */}
          <TouchableOpacity
            style={styles.filterDropdown}
            onPress={() => setShowDepartmentModal(true)}
          >
            <Text style={styles.filterLabel}>Dept: </Text>
            <Text style={styles.filterValue}>{selectedDepartment === 'All' ? 'All' : selectedDepartment.substring(0, 6)}</Text>
            <Icon name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Month and Calendar Year Filters */}
        <View style={styles.filterSection}>
          <TouchableOpacity
            style={styles.filterDropdown}
            onPress={() => setShowMonthModal(true)}
          >
            <Text style={styles.filterLabel}>Month: </Text>
            <Text style={styles.filterValue}>{selectedMonth === 'All' ? 'All' : selectedMonth.substring(0, 3)}</Text>
            <Icon name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterDropdown}
            onPress={() => setShowCalendarYearModal(true)}
          >
            <Text style={styles.filterLabel}>Calendar Year: </Text>
            <Text style={styles.filterValue}>{selectedCalendarYear}</Text>
            <Icon name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Severity Filter Button */}
        <View style={styles.severityFilterSection}>
          <TouchableOpacity
            style={styles.severityFilterButton}
            onPress={() => setShowSeverityModal(true)}
          >
            <Icon name="filter-variant" size={20} color="#F5A962" />
            <Text style={styles.severityFilterText}>
              {selectedSeverity === 'All' ? 'All Severities' : selectedSeverity}
            </Text>
            <Icon name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Severity Distribution</Text>

          {/* Single Horizontal Stacked Bar Chart */}
          <View style={styles.chartContainer}>
            <View style={styles.chartYAxis}>
              <Text style={styles.yAxisLabel}>Sessions</Text>
            </View>

            <View style={styles.barChartArea}>
              {/* Single Stacked Bar */}
              <View style={styles.stackedBar}>
                <View style={[styles.barSegment, { backgroundColor: '#6BCF7F', width: `${mildPercentage}%` }]} />
                <View style={[styles.barSegment, { backgroundColor: '#F5A962', width: `${moderatePercentage}%` }]} />
                <View style={[styles.barSegment, { backgroundColor: '#FF6B6B', width: `${criticalPercentage}%` }]} />
              </View>

              {/* X-Axis */}
              <View style={styles.xAxis}>
                <Text style={styles.xAxisLabel}>0</Text>
                <Text style={styles.xAxisLabel}>25</Text>
                <Text style={styles.xAxisLabel}>50</Text>
                <Text style={styles.xAxisLabel}>75</Text>
                <Text style={styles.xAxisLabel}>100</Text>
              </View>
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#6BCF7F' }]} />
              <Text style={styles.legendText}>Mild</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F5A962' }]} />
              <Text style={styles.legendText}>Moderate</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
              <Text style={styles.legendText}>Critical</Text>
            </View>
          </View>
        </View>
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
                <Icon name="close" size={24} color="#000000" />
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
                    selectedYear === year && styles.optionTextSelected
                  ]}>{year}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowYearModal(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filter</Text>
            </TouchableOpacity>

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
                <Icon name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Select Department</Text>

            <ScrollView style={styles.scrollableOptions}>
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
                      selectedDepartment === dept && styles.optionTextSelected
                    ]}>{dept}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowDepartmentModal(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filter</Text>
            </TouchableOpacity>

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

      {/* Severity Filter Modal */}
      <Modal
        visible={showSeverityModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSeverityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Options</Text>
              <TouchableOpacity onPress={() => setShowSeverityModal(false)}>
                <Icon name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Select Severity Level</Text>

            <View style={styles.severitySection}>
              <Text style={styles.severitySectionTitle}>Severity Level</Text>
              <View style={styles.severityOptionsRow}>
                <TouchableOpacity
                  style={[
                    styles.severityOption,
                    selectedSeverity === 'Mild' && styles.severityOptionMildSelected
                  ]}
                  onPress={() => setSelectedSeverity('Mild')}
                >
                  <Text style={[
                    styles.severityOptionText,
                    selectedSeverity === 'Mild' && styles.severityOptionTextSelected
                  ]}>Mild</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.severityOption,
                    selectedSeverity === 'Moderate' && styles.severityOptionModerateSelected
                  ]}
                  onPress={() => setSelectedSeverity('Moderate')}
                >
                  <Text style={[
                    styles.severityOptionText,
                    selectedSeverity === 'Moderate' && styles.severityOptionTextSelected
                  ]}>Moderate</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.severityOption,
                    selectedSeverity === 'Critical' && styles.severityOptionCriticalSelected
                  ]}
                  onPress={() => setSelectedSeverity('Critical')}
                >
                  <Text style={[
                    styles.severityOptionText,
                    selectedSeverity === 'Critical' && styles.severityOptionTextSelected
                  ]}>Critical</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowSeverityModal(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSelectedSeverity('All');
                setShowSeverityModal(false);
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
                <Icon name="close" size={24} color="#000000" />
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
                      selectedMonth === month && styles.optionTextSelected
                    ]}>{month}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowMonthModal(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filter</Text>
            </TouchableOpacity>

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
                <Icon name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Select Year</Text>

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
                    selectedCalendarYear === year && styles.optionTextSelected
                  ]}>{year}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowCalendarYearModal(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filter</Text>
            </TouchableOpacity>

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
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  filterSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4EC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F5A962',
    flex: 1,
  },
  severityFilterSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  severityFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4EC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F5A962',
    gap: 8,
  },
  severityFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666666',
    marginRight: 4,
  },
  filterValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginRight: 4,
  },
  chartSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 24,
    letterSpacing: 0.1,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  chartYAxis: {
    width: 50,
    justifyContent: 'space-between',
    paddingRight: 12,
    paddingVertical: 4,
  },
  yAxisLabel: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
    textAlign: 'right',
  },
  barChartArea: {
    flex: 1,
  },
  stackedBar: {
    flexDirection: 'row',
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  barSegment: {
    height: '100%',
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  xAxisLabel: {
    fontSize: 12,
    color: '#666666',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#000000',
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
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
  },
  scrollableOptions: {
    maxHeight: 300,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
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
    fontSize: 16,
    fontWeight: '500',
    color: '#4A4A4A',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  applyButton: {
    backgroundColor: '#F5A962',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  severitySection: {
    marginBottom: 24,
  },
  severitySectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  severityOptionsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  severityOption: {
    backgroundColor: '#E8E8E8',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 24,
    flex: 1,
    minWidth: '28%',
    alignItems: 'center',
  },
  severityOptionMildSelected: {
    backgroundColor: '#6BCF7F',
  },
  severityOptionModerateSelected: {
    backgroundColor: '#F5A962',
  },
  severityOptionCriticalSelected: {
    backgroundColor: '#FF6B6B',
  },
  severityOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A4A4A',
  },
  severityOptionTextSelected: {
    color: '#FFFFFF',
  },
});

export default SeverityAnalyticsScreen;
