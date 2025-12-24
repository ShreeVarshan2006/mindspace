import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, Text, HelperText, Checkbox } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { login, clearError } from '../../redux/slices/authSlice';
import { spacing, theme } from '../../constants/theme';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!acceptedPrivacy) {
      newErrors.privacy = 'You must accept the Privacy Policy and Terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      await dispatch(login({ email, password })).unwrap();
      // Navigation handled by AppNavigator based on auth state
    } catch (err) {
      Alert.alert('Login Failed', err || 'Please check your credentials');
    }
  };

  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Dual Logos */}
            <View style={styles.logosContainer}>
              <View style={styles.logoCircle}>
                <Icon name="brain" size={50} color={theme.colors.primary} />
              </View>
              <View style={styles.logoSpacer} />
              <View style={styles.logoCircle}>
                <Icon name="school" size={50} color={theme.colors.secondary} />
              </View>
            </View>

            <Text style={styles.title}>Welcome to MindSpace</Text>
            <Text style={styles.subtitle}>Your safe space for mental wellness</Text>

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errors.email}
              style={styles.input}
            />
            <HelperText type="error" visible={!!errors.email}>
              {errors.email}
            </HelperText>

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              error={!!errors.password}
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
            <HelperText type="error" visible={!!errors.password}>
              {errors.password}
            </HelperText>

            {error && (
              <HelperText type="error" visible={true} style={styles.errorText}>
                {error}
              </HelperText>
            )}

            {/* Privacy Policy and Terms Acceptance */}
            <View style={styles.privacyContainer}>
              <Checkbox
                status={acceptedPrivacy ? 'checked' : 'unchecked'}
                onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}
                color={theme.colors.primary}
              />
              <View style={styles.privacyTextContainer}>
                <Text style={styles.privacyText}>
                  I accept the{' '}
                  <Text style={styles.privacyLink} onPress={() => Alert.alert('Privacy Policy', 'Your data is anonymized and encrypted. We never share your personal information.')}>
                    Privacy Policy
                  </Text>
                  {' '}and{' '}
                  <Text style={styles.privacyLink} onPress={() => Alert.alert('Terms & Conditions', 'By using MindSpace, you agree to maintain confidentiality and use the platform responsibly.')}>
                    Terms & Conditions
                  </Text>
                </Text>
              </View>
            </View>
            {errors.privacy && (
              <HelperText type="error" visible={true} style={styles.errorText}>
                {errors.privacy}
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading || !acceptedPrivacy}
              style={styles.button}
            >
              Login
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              style={styles.linkButton}
            >
              Don't have an account? Register
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: spacing.lg,
  },
  logosContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoSpacer: {
    width: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.placeholder,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  input: {
    marginBottom: spacing.xs,
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  privacyTextContainer: {
    flex: 1,
    marginLeft: spacing.xs,
  },
  privacyText: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 20,
  },
  privacyLink: {
    color: theme.colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  button: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    color: theme.colors.buttonclr,
  },
  linkButton: {
    marginTop: spacing.md,
  },
  errorText: {
    textAlign: 'center',
  },
});

export default LoginScreen;
