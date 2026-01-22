import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Avatar, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchCounsellors } from '../../redux/slices/appointmentSlice';
import { useTheme } from '../../context/ThemeContext';
import { spacing, theme } from '../../constants/theme';

const CounsellorListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { counsellors = [], isLoading } = useSelector((state) => state.appointments || {});

  // Mock counsellors data if none available
  const mockCounsellors = [
    {
      _id: '1',
      name: 'Dr. Alice Chen',
      specialization: 'Cognitive Behavioral Therapy',
      avatar: 'https://via.placeholder.com/56',
      isActive: true,
      availableSlots: 5,
    },
    {
      _id: '2',
      name: 'Mr. David Lee',
      specialization: 'Mindfulness & Stress Management',
      avatar: 'https://via.placeholder.com/56',
      isActive: true,
      availableSlots: 3,
    },
    {
      _id: '3',
      name: 'Ms. Sarah Green',
      specialization: 'Relationship Counselling',
      avatar: 'https://via.placeholder.com/56',
      isActive: false,
      availableSlots: 0,
    },
  ];

  const displayCounsellors = counsellors.length > 0 ? counsellors : mockCounsellors;

  useEffect(() => {
    dispatch(fetchCounsellors());
  }, [dispatch]);

  const renderCounsellor = ({ item }) => {
    const isAvailable = item.availableSlots > 0;

    return (
      <TouchableOpacity
        style={[styles.counsellorCard, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
        onPress={() => navigation.navigate('BookAppointment', { counsellor: item })}
      >
        {item.avatar ? (
          <Image
            source={{ uri: item.avatar }}
            style={styles.avatarImage}
          />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '20' }]}>
            <Icon name="account" size={32} color="#F5A962" />
          </View>
        )}
        <View style={styles.counsellorInfo}>
          <Text style={[styles.counsellorName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.specialization, { color: colors.textSecondary }]}>{item.specialization || 'Counselling'}</Text>
          <Text style={[styles.availability, { color: colors.textSecondary }]}>
            {isAvailable ? 'Available' : 'Unavailable'}
          </Text>
          <View style={[styles.statusBadge, isAvailable ? styles.activeBadge : styles.inactiveBadge]}>
            <Text style={styles.statusText}>
              {isAvailable ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        <Icon name="chevron-right" size={28} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  if (isLoading) {
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
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Counsellors</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="tune" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayCounsellors}
        renderItem={renderCounsellor}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="account-search" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No counsellors found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
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
    letterSpacing: 0.2,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingVertical: 8,
  },
  counsellorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counsellorInfo: {
    flex: 1,
  },
  counsellorName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  specialization: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
  availability: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeBadge: {
    backgroundColor: '#6BCF7F',
  },
  inactiveBadge: {
    backgroundColor: '#FF6B6B',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});

export default CounsellorListScreen;
