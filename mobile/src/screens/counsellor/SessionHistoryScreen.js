import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator } from 'react-native-paper';
import { Heading, Body, BodySmall, Label as TypographyLabel } from '../../components/Typography';
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
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F5A962']} />
                }
            >
                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="chevron-left" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Heading level={3} style={styles.headerTitle}>Session History</Heading>
                    <TouchableOpacity style={styles.filterButton}>
                        <Icon name="tune" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: colors.card }]}>
                            <Icon name="chart-line" size={24} color="#F5A962" />
                        </View>
                        <Body style={[styles.statLabel, { color: colors.textSecondary }]}>Total sessions - {totalSessions}</Body>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: colors.card }]}>
                            <Icon name="calendar-account" size={24} color="#F5A962" />
                        </View>
                        <Body style={[styles.statLabel, { color: colors.textSecondary }]}>This week sessions - {thisWeekSessions}</Body>
                    </View>
                </View>

                {/* Sessions List */}
                {!sessions || sessions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Icon name="history" size={64} color={colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: colors.text }]}>No session history</Text>
                        <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
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
                                <View key={session._id || index} style={[styles.sessionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <View style={styles.sessionHeader}>
                                        <Heading level={4} style={[styles.sessionDate, { color: colors.text }]}>{formattedDate}</Heading>
                                        <View style={[
                                            styles.severityBadge,
                                            { backgroundColor: getSeverityColor(session.severity) }
                                        ]}>
                                            <Text style={styles.severityText}>
                                                {getSeverityLabel(session.severity)}
                                            </Text>
                                        </View>
                                    </View>

                                    <Body style={[styles.studentLabel, { color: colors.textSecondary }]}>
                                        Student: {session.student?.anonymousUsername || session.student?.name || 'Anonymous'}
                                    </Body>

                                    <TouchableOpacity
                                        style={[styles.notesButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                        onPress={() => navigation.navigate('SessionDetails', { sessionId: session._id })}
                                    >
                                        <Icon name="file-document-outline" size={20} color="#F5A962" />
                                        <Text style={[styles.notesButtonText, { color: colors.text }]}>
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

    },
    container: {
        flex: 1,

    },
    content: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxl,
        paddingTop: spacing.md,
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
        paddingHorizontal: 0,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 0.15,
    },
    filterButton: {
        padding: 4,
    },
    statsContainer: {
        paddingTop: spacing.md,
        gap: spacing.md,
    },
    statCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        padding: spacing.lg,
        gap: spacing.md,
        borderWidth: 1,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: 0.15,
    },
    sessionsList: {
        paddingTop: spacing.lg,
        gap: spacing.md,
    },
    sessionCard: {
        borderRadius: 16,
        padding: spacing.lg,
        marginBottom: spacing.sm,
        borderWidth: 1,
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
        marginBottom: spacing.md,
        fontWeight: '400',
    },
    notesButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 24,
        alignSelf: 'flex-end',
        gap: 8,
        borderWidth: 1,
    },
    notesButtonText: {
        fontSize: 15,
        fontWeight: '600',
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
        marginTop: spacing.md,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
});

export default SessionHistoryScreen;
