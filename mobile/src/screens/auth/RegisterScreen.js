import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, Text, HelperText, RadioButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { register, clearError } from '../../redux/slices/authSlice';
import { spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Heading, BodySmall, Body, Label as TypographyLabel } from '../../components/Typography';
import { ROLES } from '../../constants';

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const role = ROLES.STUDENT; // Only students can register

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

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    const userData = {
      email,
      password,
      role: ROLES.STUDENT,
    };

    try {
      const response = await dispatch(register(userData)).unwrap();

      // Generate and store anonymous ID for students
      const anonymousId = 'STU' + Math.random().toString(36).substring(2, 8).toUpperCase();
      await AsyncStorage.setItem('anonymousStudentId', anonymousId);

      Alert.alert(
        '✅ Registration Successful',
        `Welcome! Your anonymous ID is: ${anonymousId}\n\nPlease save this ID. You'll use your email and password to sign in.`,
        [{ text: 'Continue', onPress: () => navigation.navigate('WelcomeOnboarding') }]
      );
    } catch (err) {
      Alert.alert('Registration Failed', err || 'Please try again');
    }
  };

  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar
        barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Heading level={2} style={styles.title}>Create Student Account</Heading>
            <BodySmall style={[styles.subtitle, { color: colors.textSecondary }]}>Join MindSpace - For Students Only</BodySmall>
            <BodySmall style={[styles.infoNote, { color: colors.textSecondary }]}>🔒 Your identity remains anonymous. You'll receive a unique student ID after registration.</BodySmall>
            <BodySmall style={[styles.counsellorNote, { color: colors.textSecondary }]}>💼 Counsellors and staff are pre-registered by administration.</BodySmall>

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errors.email}
              style={[styles.input, { color: colors.text }]}
              textColor={colors.text}
              outlineColor={colors.border}
              activeOutlineColor={colors.text}
              placeholderTextColor={colors.placeholder}
              theme={{ colors: { text: colors.text, placeholder: colors.placeholder, primary: '#F5A962' } }}
            />
            <HelperText type="error" visible={!!errors.email} style={{ color: colors.text }}>
              {errors.email}
            </HelperText>

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              error={!!errors.password}
              style={[styles.input, { color: colors.text }]}
              textColor={colors.text}
              outlineColor={colors.border}
              activeOutlineColor={colors.text}
              placeholderTextColor={colors.placeholder}
              theme={{ colors: { text: colors.text, placeholder: colors.placeholder, primary: '#F5A962' } }}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
            <HelperText type="error" visible={!!errors.password} style={{ color: colors.text }}>
              {errors.password}
            </HelperText>

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              error={!!errors.confirmPassword}
              style={[styles.input, { color: colors.text }]}
              textColor={colors.text}
              outlineColor={colors.border}
              activeOutlineColor={colors.text}
              placeholderTextColor={colors.placeholder}
              theme={{ colors: { text: colors.text, placeholder: colors.placeholder, primary: '#F5A962' } }}
            />
            <HelperText type="error" visible={!!errors.confirmPassword} style={{ color: colors.text }}>
              {errors.confirmPassword}
            </HelperText>

            {error && (
              <HelperText type="error" visible={true} style={styles.errorText}>
                {error}
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
            >
              Register
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.linkButton}
            >
              Already have an account? Login
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
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    textAlign: 'center',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  roleContainer: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.sm,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleNote: {
    marginTop: 12,
    paddingHorizontal: 8,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  infoNote: {
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  counsellorNote: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 16,
    paddingHorizontal: 16,
    fontStyle: 'italic',
  },
  input: {
    marginBottom: spacing.xs,
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: '#F5A962',
  },
  linkButton: {
    marginTop: spacing.md,
  },
  errorText: {
    textAlign: 'center',
  },
});

export default RegisterScreen;
