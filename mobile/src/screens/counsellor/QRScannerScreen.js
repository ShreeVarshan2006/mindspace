import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, TextInput, Card, IconButton } from 'react-native-paper';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import { startSession as startSessionAction } from '../../redux/slices/sessionSlice';
import { spacing, theme } from '../../constants/theme';
import { sessionService } from '../../services/sessionService';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const QRScannerScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { mode = 'checkin', sessionId = null } = route.params || {};
  const [studentCode, setStudentCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanMode, setScanMode] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const { colors } = useTheme();

  const handleStartSession = async (qrData = null) => {
    const codeToUse = qrData || studentCode.trim();

    if (!codeToUse) {
      Alert.alert('Error', 'Please enter student code or scan QR');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'checkout') {
        // End session with checkout scan
        const response = await sessionService.verifyCheckout(sessionId, { qrData: codeToUse });

        Alert.alert(
          'Session Checkout',
          'Student verified. Please add session notes.',
          [
            {
              text: 'Add Notes',
              onPress: () => navigation.navigate('SessionDetails', {
                sessionId: sessionId
              })
            }
          ]
        );
      } else {
        // Start session with checkin scan - dispatch to Redux
        const resultAction = await dispatch(startSessionAction({ qrData: codeToUse }));

        if (startSessionAction.fulfilled.match(resultAction)) {
          const sessionData = resultAction.payload;
          Alert.alert(
            'Session Started',
            `Session started successfully with ${sessionData.student?.anonymousUsername || 'student'}`,
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('Dashboard')
              }
            ]
          );
        } else {
          throw new Error(resultAction.payload || 'Failed to start session');
        }
      }
      setStudentCode('');
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || error.response?.data?.message || `Failed to ${mode === 'checkout' ? 'checkout' : 'start'} session`
      );
    } finally {
      setLoading(false);
      setScanned(false);
      setScanMode(false);
    }
  };

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;

    setScanned(true);
    setStudentCode(data);
    setScanMode(false);

    Alert.alert(
      'QR Code Scanned',
      `Student ID: ${data}`,
      [
        {
          text: 'Cancel',
          onPress: () => {
            setScanned(false);
            setStudentCode('');
          },
          style: 'cancel',
        },
        {
          text: 'Start Session',
          onPress: () => handleStartSession(data),
        },
      ]
    );
  };

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const startScanning = async () => {
    if (hasPermission === null) {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permission to scan QR codes'
        );
        return;
      }
    }

    if (hasPermission === false) {
      Alert.alert(
        'Camera Permission Denied',
        'Please enable camera permission in settings to scan QR codes',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Request Again',
            onPress: async () => {
              const { status } = await BarCodeScanner.requestPermissionsAsync();
              setHasPermission(status === 'granted');
            },
          },
        ]
      );
      return;
    }

    setScanned(false);
    setScanMode(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {scanMode ? (
          <View style={styles.cameraContainer}>
            <BarCodeScanner
              style={styles.camera}
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
            >
              <View style={styles.overlay}>
                <View style={styles.scanArea}>
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                </View>
                <Text style={styles.scanText}>Align QR code within frame</Text>
              </View>
            </BarCodeScanner>
            <IconButton
              icon="close"
              size={30}
              iconColor="#fff"
              style={styles.closeButton}
              onPress={() => {
                setScanMode(false);
                setScanned(false);
              }}
            />
          </View>
        ) : (
          <>
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Icon
                  name={mode === 'checkout' ? 'qrcode-remove' : 'qrcode-scan'}
                  size={80}
                  color={mode === 'checkout' ? '#FF5722' : theme.colors.primary}
                />
                <Text style={styles.title}>{mode === 'checkout' ? 'End Session' : 'Start Session'}</Text>
                <Text style={styles.subtitle}>
                  {mode === 'checkout'
                    ? 'Scan student\'s QR code to verify and end session'
                    : 'Scan student\'s QR code or enter their anonymous ID manually'
                  }
                </Text>
              </Card.Content>
            </Card>

            <Button
              mode="contained"
              onPress={startScanning}
              style={styles.scanButton}
              icon="camera"
              contentStyle={{ paddingVertical: spacing.sm, justifyContent: 'center', alignItems: 'center' }}
            >
              Scan QR Code
            </Button>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TextInput
              label="Student Anonymous ID"
              value={studentCode}
              onChangeText={setStudentCode}
              mode="outlined"
              style={styles.input}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="e.g., S-A12F9"
              left={<TextInput.Icon icon="shield-account" />}
            />

            <Button
              mode="contained"
              onPress={handleStartSession}
              loading={loading}
              disabled={loading || !studentCode.trim()}
              style={styles.button}
              icon={mode === 'checkout' ? 'logout' : 'play'}
              contentStyle={{ paddingVertical: spacing.xs, justifyContent: 'center', alignItems: 'center' }}
            >
              {mode === 'checkout' ? 'End Session' : 'Start Session'}
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            >
              Cancel
            </Button>

            <Card style={styles.infoCard}>
              <Card.Content>
                <Text style={styles.infoTitle}>📱 How to use:</Text>
                <Text style={styles.infoText}>1. Tap "Scan QR Code" to use camera</Text>
                <Text style={styles.infoText}>2. Or manually enter anonymous ID</Text>
                <Text style={styles.infoText}>3. Click "Start Session" to begin</Text>
                <Text style={styles.infoText}>
                  4. After session, add notes and severity
                </Text>
              </Card.Content>
            </Card>
          </>
        )}
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
  },
  cameraContainer: {
    flex: 1,
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#fff',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.xl * 2,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  card: {
    marginBottom: spacing.xl,
  },
  cardContent: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  scanButton: {
    marginBottom: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border || '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: theme.colors.placeholder,
    fontWeight: '600',
  },
  input: {
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.sm,
  },
  cancelButton: {
    marginTop: spacing.sm,
  },
  infoCard: {
    marginTop: spacing.xl,
    backgroundColor: theme.colors.surface,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
});

export default QRScannerScreen;
