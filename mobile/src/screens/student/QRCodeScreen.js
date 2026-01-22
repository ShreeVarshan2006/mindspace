import React, { useMemo } from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { spacing, theme } from '../../constants/theme';

const QRCodeScreen = () => {
  const { colors } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [imageLoading, setImageLoading] = React.useState(true);

  // Debug: Log user data
  React.useEffect(() => {
    console.log('QR Screen - User data:', {
      hasUser: !!user,
      anonymousUsername: user?.anonymousUsername,
      _id: user?._id,
      qrSecret: user?.qrSecret,
    });
  }, [user]);

  const qrData = useMemo(() => {
    // Use simpler data - just the anonymous username
    if (!user?.anonymousUsername) return null;
    return user.anonymousUsername;
  }, [user]);

  const qrImageUrl = useMemo(() => {
    if (!qrData) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;
  }, [qrData]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Your Session QR Code</Text>
        <Text style={styles.subtitle}>
          Show this QR code to your counsellor at the start and end of each session
        </Text>

        <View style={styles.qrContainer}>
          {user?.anonymousUsername ? (
            <View style={styles.qrImageWrapper}>
              {imageLoading && (
                <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
              )}
              <Image
                source={{ uri: qrImageUrl }}
                style={styles.qrImage}
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={(e) => {
                  console.log('QR Image load error:', e.nativeEvent.error);
                  setImageLoading(false);
                }}
              />
            </View>
          ) : (
            <View style={styles.loadingBox}>
              <Icon name="qrcode" size={80} color={theme.colors.placeholder} />
              <Text style={styles.loadingText}>Waiting for user data...</Text>
              <Text style={styles.helperText}>
                User: {user ? 'Yes' : 'No'} | Username: {user?.anonymousUsername || 'Missing'}
              </Text>
              <Text style={styles.helperText}>Please re-login if this persists.</Text>
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.usernameCard}>
            <Icon name="shield-account" size={24} color={theme.colors.primary} />
            <Text style={styles.username}>{user?.anonymousUsername || 'Loading...'}</Text>
          </View>
          <Text style={styles.infoText}>
            🔒 This QR code contains your anonymous ID only.
          </Text>
          <Text style={styles.infoText}>
            Your counsellor will see only this username - your real identity remains private.
          </Text>
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsTitle}>How to use:</Text>
            <Text style={styles.instructionItem}>• Counsellor scans at session start</Text>
            <Text style={styles.instructionItem}>• System marks you present</Text>
            <Text style={styles.instructionItem}>• Counsellor scans again at session end</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.placeholder,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  qrContainer: {
    backgroundColor: theme.colors.surface,
    padding: spacing.xl,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  qrImageWrapper: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrImage: {
    width: 250,
    height: 250,
  },
  loader: {
    position: 'absolute',
  },
  infoContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  usernameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    elevation: 2,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  instructionsBox: {
    backgroundColor: theme.colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  instructionItem: {
    fontSize: 14,
    marginVertical: spacing.xs,
    color: theme.colors.text,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
    padding: spacing.lg,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.placeholder,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  debugText: {
    fontSize: 10,
    color: theme.colors.placeholder,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

export default QRCodeScreen;
