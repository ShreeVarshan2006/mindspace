import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchSessions } from '../../redux/slices/sessionSlice';
import { spacing, theme } from '../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const SeverityAnalyticsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const sessions = useSelector((state) => state.sessions?.sessions || []);
  const [selectedYear, setSelectedYear] = useState('II');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

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

  // Calculate severity data
  const totalSessions = Array.isArray(sessions) ? sessions.length : 0;
  const mildCount = Array.isArray(sessions) ? sessions.filter((s) => s?.severity === 'low').length : 123;
  const moderateCount = Array.isArray(sessions) ? sessions.filter((s) => s?.severity === 'moderate').length : 85;
  const severeCount = Array.isArray(sessions) ? sessions.filter((s) => s?.severity === 'high').length : 42;
  const criticalCount = Array.isArray(sessions) ? sessions.filter((s) => s?.severity === 'critical').length : 15;

  const total = mildCount + moderateCount + severeCount + criticalCount;

  // Calculate percentages for bar chart
  const mildPercentage = total > 0 ? (mildCount / total) * 100 : 0;
  const moderatePercentage = total > 0 ? (moderateCount / total) * 100 : 0;
  const severePercentage = total > 0 ? (severeCount / total) * 100 : 0;
  const criticalPercentage = total > 0 ? (criticalCount / total) * 100 : 0;

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
        <Text style={styles.headerTitle}>Severity Trends</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="tune" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Section */}
        <View style={styles.filterSection}>
          {/* Year Filter */}
          <TouchableOpacity
            style={styles.filterDropdown}
            onPress={() => setShowYearDropdown(!showYearDropdown)}
          >
            <Text style={styles.filterLabel}>Year: </Text>
            <Text style={styles.filterValue}>{selectedYear}</Text>
            <Icon name="chevron-down" size={20} color="#666666" />
          </TouchableOpacity>

          {/* Department Filter */}
          <TouchableOpacity
            style={styles.filterDropdown}
            onPress={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
          >
            <Text style={styles.filterLabel}>Department: </Text>
            <Text style={styles.filterValue}>{selectedDepartment}</Text>
            <Icon name="chevron-down" size={20} color="#666666" />
          </TouchableOpacity>
        </View>

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Severity Distribution by Month</Text>

          {/* Stacked Bar Chart */}
          <View style={styles.chartContainer}>
            <View style={styles.chartYAxis}>
              <Text style={styles.yAxisLabel}>323</Text>
            </View>

            <View style={styles.barChartArea}>
              {/* Horizontal Stacked Bar */}
              <View style={styles.stackedBar}>
                {/* Mild */}
                <View
                  style={[
                    styles.barSegment,
                    {
                      backgroundColor: '#FF6B5A',
                      width: `${mildPercentage}%`
                    }
                  ]}
                />
                {/* Moderate */}
                <View
                  style={[
                    styles.barSegment,
                    {
                      backgroundColor: '#3D9B9B',
                      width: `${moderatePercentage}%`
                    }
                  ]}
                />
                {/* Severe */}
                <View
                  style={[
                    styles.barSegment,
                    {
                      backgroundColor: '#2C4A5A',
                      width: `${severePercentage}%`
                    }
                  ]}
                />
                {/* Critical */}
                <View
                  style={[
                    styles.barSegment,
                    {
                      backgroundColor: '#F5C563',
                      width: `${criticalPercentage}%`
                    }
                  ]}
                />
              </View>

              {/* X-Axis */}
              <View style={styles.xAxis}>
                <Text style={styles.xAxisLabel}>0</Text>
                <Text style={styles.xAxisLabel}>70</Text>
                <Text style={styles.xAxisLabel}>140</Text>
                <Text style={styles.xAxisLabel}>210</Text>
              </View>
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF6B5A' }]} />
              <Text style={styles.legendText}>Mild</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3D9B9B' }]} />
              <Text style={styles.legendText}>Moderate</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2C4A5A' }]} />
              <Text style={styles.legendText}>Severe</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F5C563' }]} />
              <Text style={styles.legendText}>Critical</Text>
            </View>
          </View>
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
    paddingVertical: 20,
    gap: 12,
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E8E5FF',
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
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 8,
  },
  yAxisLabel: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  barChartArea: {
    flex: 1,
  },
  stackedBar: {
    flexDirection: 'row',
    height: 140,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
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
});

export default SeverityAnalyticsScreen;
