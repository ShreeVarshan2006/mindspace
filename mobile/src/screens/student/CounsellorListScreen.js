import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Avatar, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchCounsellors } from '../../redux/slices/appointmentSlice';
import { spacing, theme } from '../../constants/theme';

const CounsellorListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { counsellors = [], isLoading } = useSelector((state) => state.appointments || {});

  useEffect(() => {
    dispatch(fetchCounsellors());
  }, [dispatch]);

  const renderCounsellor = ({ item }) => {
    const isAvailable = !item.isActive && item.availableSlots > 0;

    return (
      <TouchableOpacity
        style={styles.counsellorCard}
        onPress={() => navigation.navigate('BookAppointment', { counsellor: item })}
      >        <Avatar.Image
          size={56}
          source={{ uri: item.avatar || 'https://via.placeholder.com/56' }}
          style={styles.avatar}
        />
        <View style={styles.counsellorInfo}>
          <Text style={styles.counsellorName}>{item.name}</Text>
          <Text style={styles.specialization}>{item.specialization || 'Counselling'}</Text>
          <Text style={styles.availability}>
            {isAvailable ? 'Available' : 'Unavailable'}
          </Text>
          <View style={[styles.statusBadge, isAvailable ? styles.activeBadge : styles.inactiveBadge]}>
            <Text style={styles.statusText}>
              {isAvailable ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        <Icon name="chevron-right" size={24} color="#CCCCCC" />
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F09E54" />
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Counsellors</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="tune" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={counsellors}
        renderItem={renderCounsellor}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="account-search" size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>No counsellors found</Text>
          </View>
        }
      />
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
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatar: {
    marginRight: 16,
  },
  counsellorInfo: {
    flex: 1,
  },
  counsellorName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  specialization: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    lineHeight: 18,
  },
  availability: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#5CB85C',
  },
  inactiveBadge: {
    backgroundColor: '#D9534F',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginTop: 16,
  },
});

export default CounsellorListScreen;
