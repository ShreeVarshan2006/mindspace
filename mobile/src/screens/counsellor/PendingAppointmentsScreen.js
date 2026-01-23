import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Avatar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchMyAppointments } from '../../redux/slices/appointmentSlice';
import { appointmentService } from '../../services/appointmentService';
import { useTheme } from '../../context/ThemeContext';

const PendingAppointmentsScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { appointments = [] } = useSelector((state) => state.appointments || {});
    const [refreshing, setRefreshing] = React.useState(false);
    const { colors } = useTheme();

    const pendingAppointments = Array.isArray(appointments)
        ? appointments.filter((apt) => apt.status === 'pending')
        : [];

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            await dispatch(fetchMyAppointments()).unwrap();
        } catch (err) {
            console.error('Error fetching appointments:', err);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAppointments();
        setRefreshing(false);
    };

    const handleApprove = async (appointmentId) => {
        try {
            Alert.alert(
                'Approve Appointment',
                'Are you sure you want to approve this appointment?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Approve',
                        onPress: async () => {
                            const result = await appointmentService.approveAppointment(appointmentId);
                            if (result.success) {
                                Alert.alert('Success', result.message);
                                await loadAppointments();
                            } else {
                                Alert.alert('Error', 'Failed to approve appointment');
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Approve error:', error);
            Alert.alert('Error', 'Failed to approve appointment');
        }
    };

    const handleDecline = async (appointmentId) => {
        try {
            Alert.alert(
                'Decline Appointment',
                'Are you sure you want to decline this appointment?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Decline',
                        style: 'destructive',
                        onPress: async () => {
                            const result = await appointmentService.declineAppointment(appointmentId);
                            if (result.success) {
                                Alert.alert('Success', result.message);
                                await loadAppointments();
                            } else {
                                Alert.alert('Error', 'Failed to decline appointment');
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Decline error:', error);
            Alert.alert('Error', 'Failed to decline appointment');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        }
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="chevron-left" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Pending Appointments</Text>
                    <View style={styles.headerRight} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F5A962']} />}
                >
                    {/* Info Card */}
                    <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Icon name="information" size={24} color="#F5A962" style={styles.infoIcon} />
                        <Text style={[styles.infoText, { color: colors.text }]}>
                            These students have requested appointments and are awaiting your confirmation.
                        </Text>
                    </View>

                    {/* Pending Count */}
                    <View style={styles.countSection}>
                        <Text style={[styles.countText, { color: colors.text }]}>
                            {pendingAppointments.length} Pending {pendingAppointments.length === 1 ? 'Request' : 'Requests'}
                        </Text>
                    </View>

                    {/* Pending Appointments List */}
                    {pendingAppointments.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Icon name="calendar-check" size={64} color="#CCCCCC" />
                            <Text style={[styles.emptyText, { color: colors.text + '80' }]}>No pending appointments</Text>
                            <Text style={[styles.emptySubtext, { color: colors.text + '60' }]}>
                                All appointment requests have been reviewed
                            </Text>
                        </View>
                    ) : (
                        pendingAppointments.map((appointment) => (
                            <View key={appointment._id} style={[styles.appointmentCard, { backgroundColor: colors.card }]}>
                                <View style={styles.cardHeader}>
                                    <Avatar.Image
                                        size={56}
                                        source={{ uri: appointment.student?.avatar || 'https://via.placeholder.com/56' }}
                                        style={styles.avatar}
                                    />
                                    <View style={styles.studentInfo}>
                                        <Text style={[styles.studentLabel, { color: colors.text + '80' }]}>Student ID</Text>
                                        <Text style={[styles.studentId, { color: colors.text }]}>
                                            {appointment.student?.studentId || appointment.student?.anonymousUsername || 'Anonymous'}
                                        </Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: colors.surface }]}>
                                        <Icon name="clock-outline" size={16} color="#F5A962" />
                                        <Text style={[styles.statusText, { color: '#F5A962' }]}>Pending</Text>
                                    </View>
                                </View>

                                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                                <View style={styles.detailsSection}>
                                    <View style={styles.detailRow}>
                                        <Icon name="calendar" size={20} color={colors.text + '80'} />
                                        <Text style={[styles.detailText, { color: colors.text }]}>
                                            {formatDate(appointment.appointmentDate || appointment.date)}
                                        </Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Icon name="clock" size={20} color={colors.text + '80'} />
                                        <Text style={[styles.detailText, { color: colors.text }]}>
                                            {appointment.time || 'Time not specified'}
                                        </Text>
                                    </View>
                                    {appointment.reason && (
                                        <View style={styles.detailRow}>
                                            <Icon name="text" size={20} color={colors.text + '80'} />
                                            <Text style={[styles.detailText, { color: colors.text }]} numberOfLines={2}>
                                                {appointment.reason}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={styles.approveButton}
                                        onPress={() => handleApprove(appointment._id || appointment.id)}
                                    >
                                        <Icon name="check" size={20} color="#FFFFFF" />
                                        <Text style={styles.approveButtonText}>Approve</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.declineButton, { backgroundColor: colors.surface }]}
                                        onPress={() => handleDecline(appointment._id || appointment.id)}
                                    >
                                        <Icon name="close" size={20} color="#FF6B6B" />
                                        <Text style={[styles.declineButtonText, { color: '#FF6B6B' }]}>Decline</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
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
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
    },
    headerRight: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    infoCard: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        alignItems: 'flex-start',
        borderWidth: 1,
    },
    infoIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    countSection: {
        marginBottom: 20,
    },
    countText: {
        fontSize: 20,
        fontWeight: '700',
    },
    appointmentCard: {
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        marginRight: 16,
    },
    studentInfo: {
        flex: 1,
    },
    studentLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    studentId: {
        fontSize: 16,
        fontWeight: '600',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginBottom: 16,
    },
    detailsSection: {
        marginBottom: 16,
        gap: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    detailText: {
        fontSize: 14,
        flex: 1,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    approveButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6BCF7F',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    approveButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    declineButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
        borderWidth: 1,
        borderColor: '#FF6B6B',
    },
    declineButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
});

export default PendingAppointmentsScreen;
