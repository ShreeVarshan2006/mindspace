import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { fetchSessions } from '../../redux/slices/sessionSlice';
import { spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const SessionHistoryScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { sessions = [], isLoading } = useSelector((state) => state.sessions || {});
    const [refreshing, setRefreshing] = React.useState(false);
    const { colors } = useTheme();

    useEffect(() => {
        loadSessions();
    }, []);

    // Reload sessions when screen comes into focus (e.g., after saving notes)
    useFocusEffect(
        React.useCallback(() => {
            loadSessions();
        }, [])
    );

    const loadSessions = async () => {
        try {
            await dispatch(fetchSessions()).unwrap();
        } catch (err) {
            console.error('Error fetching sessions:', err);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadSessions();
        setRefreshing(false);
    };

    // Calculate stats
    const totalSessions = sessions?.length || 0;
    const thisWeekSessions = React.useMemo(() => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return (sessions || []).filter(session => {
            const sessionDate = new Date(session.date || session.createdAt);
            return sessionDate >= oneWeekAgo;
        }).length;
    }, [sessions]);

    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'low':
            case 'mild':
                return '#6BCF7F';
            case 'moderate':
                return '#F5A962';
            case 'high':
            case 'critical':
                return '#FF6B6B';
            default:
                return '#999999';
        }
    };

    const getSeverityLabel = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'low':
                return 'Mild';
            case 'moderate':
                return 'Moderate';
            case 'high':
            case 'critical':
                return 'Critical';
            default:
                return 'Unknown';
        }
    };

    if (isLoading && !sessions?.length) {
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
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F5A962']} />
                }
            >
                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="chevron-left" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Session History</Text>
                    <TouchableOpacity style={styles.filterButton}>
                        <Icon name="tune" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <View style={styles.statIconContainer}>
                            <Icon name="chart-line" size={24} color="#F5A962" />
                        </View>
                        <Text style={styles.statLabel}>Total sessions - {totalSessions}</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statIconContainer}>
                            <Icon name="calendar-account" size={24} color="#F5A962" />
                        </View>
                        <Text style={styles.statLabel}>This week sessions - {thisWeekSessions}</Text>
                    </View>
                </View>

                {/* Sessions List */}
                {!sessions || sessions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Icon name="history" size={64} color="#CCCCCC" />
                        <Text style={styles.emptyText}>No session history</Text>
                        <Text style={styles.emptySubtext}>
                            Your counselling session history will appear here
                        </Text>
                    </View>
                ) : (
                    <View style={styles.sessionsList}>
                        {sessions.map((session, index) => {
                            const sessionDate = new Date(session.date || session.createdAt);
                            const formattedDate = sessionDate.toISOString().split('T')[0];
                            const hasNotes = session.notes && session.notes.trim().length > 0;

                            return (
                                <View key={session._id || index} style={styles.sessionCard}>
                                    <View style={styles.sessionHeader}>
                                        <Text style={styles.sessionDate}>{formattedDate}</Text>
                                        <View style={[
                                            styles.severityBadge,
                                            { backgroundColor: getSeverityColor(session.severity) }
                                        ]}>
                                            <Text style={styles.severityText}>
                                                {getSeverityLabel(session.severity)}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={styles.studentLabel}>
                                        Student: {session.student?.anonymousUsername || session.student?.name || 'Anonymous'}
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.notesButton}
                                        onPress={() => navigation.navigate('SessionDetails', { sessionId: session._id })}
                                    >
                                        <Icon name="file-document-outline" size={20} color="#F5A962" />
                                        <Text style={styles.notesButtonText}>
                                            {hasNotes ? 'View Notes' : 'Add Notes'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                )}

                <View style={{ height: 80 }} />
            </ScrollView>
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
        backgroundColor: '#FFFFFF',
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
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        letterSpacing: 0.15,
    },
    filterButton: {
        padding: 4,
    },
    statsContainer: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        gap: spacing.md,
    },
    statCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF4EC',
        borderRadius: 16,
        padding: spacing.lg,
        gap: spacing.md,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#8B6F47',
        letterSpacing: 0.15,
    },
    sessionsList: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        gap: spacing.md,
    },
    sessionCard: {
        backgroundColor: '#FFF4EC',
        borderRadius: 16,
        padding: spacing.lg,
        marginBottom: spacing.sm,
    },
    sessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sessionDate: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
        letterSpacing: 0.15,
    },
    severityBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
    },
    severityText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.25,
    },
    studentLabel: {
        fontSize: 16,
        color: '#4A4A4A',
        marginBottom: spacing.md,
        fontWeight: '400',
    },
    notesButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 24,
        alignSelf: 'flex-end',
        gap: 8,
    },
    notesButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#F5A962',
        letterSpacing: 0.15,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: spacing.xl,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
        marginTop: spacing.md,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666666',
        marginTop: spacing.xs,
        textAlign: 'center',
    },
});

export default SessionHistoryScreen;
