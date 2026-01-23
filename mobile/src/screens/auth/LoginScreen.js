import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Text } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import { Heading, Body, BodySmall, Label as TypographyLabel } from '../../components/Typography';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { login, loginWithGoogle, clearError } from '../../redux/slices/authSlice';
import { spacing, theme } from '../../constants/theme';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [srmError, setSrmError] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await dispatch(login({ email, password })).unwrap();
      // Navigation handled by AppNavigator based on auth state
    } catch (err) {
      Alert.alert('Login Failed', err || 'Please check your credentials');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await dispatch(loginWithGoogle()).unwrap();
      // Navigation handled by AppNavigator based on auth state
    } catch (err) {
      Alert.alert('Google Sign-In Failed', err || 'Please try again');
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logosContainer}>
              <Image
                source={require('../../../assets/images/brain-logo.png')}
                style={styles.brainLogo}
                resizeMode="contain"
              />
              <View style={styles.logoSpacer} />
              {srmError ? (
                <View style={styles.srmFallback}>
                  <Text style={styles.srmFallbackText}>SRM</Text>
                </View>
              ) : (
                <Image
                  source={require('../../../assets/images/srm-logo.png')}
                  style={styles.srmLogo}
                  resizeMode="contain"
                  onError={() => setSrmError(true)}
                />
              )}
            </View>

            {/* Title */}
            <Heading level={3} style={[styles.title, { color: colors.text }]}>Welcome to MindSpace</Heading>
            <BodySmall style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign in with your email and password.
            </BodySmall>
            <BodySmall style={[styles.infoNote, { color: colors.textSecondary }]}>
              💡 Students: Use your email and password to sign in. Your anonymous ID will be displayed on your dashboard.
            </BodySmall>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <TypographyLabel style={[styles.label, { color: colors.textSecondary }]}>Email ID</TypographyLabel>
              <TextInput
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                placeholder="john.doe@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { color: colors.text }]}
                textColor={colors.text}
                outlineColor={colors.border}
                activeOutlineColor={colors.text}
                placeholderTextColor={colors.placeholder}
                theme={{
                  colors: {
                    text: colors.text,
                    placeholder: colors.placeholder,
                    primary: '#F5A962',
                  },
                  roundness: 12,
                }}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <TypographyLabel style={[styles.label, { color: colors.textSecondary }]}>Password</TypographyLabel>
              <TextInput
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                style={[styles.input, { color: colors.text }]}
                textColor={colors.text}
                outlineColor={colors.border}
                activeOutlineColor={colors.text}
                placeholderTextColor={colors.placeholder}
                theme={{
                  colors: {
                    text: colors.text,
                    placeholder: colors.placeholder,
                    primary: '#F5A962',
                  },
                  roundness: 12,
                }}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                    color={colors.textSecondary}
                  />
                }
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Loading...' : 'Login'}
              </Text>
            </TouchableOpacity>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, { backgroundColor: colors.surface }]}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.8}
            >
              <Text style={[styles.registerButtonText, { color: '#F5A962' }]}>Register</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <BodySmall style={[styles.dividerText, { color: colors.textSecondary }]}>OR</BodySmall>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>

            {/* Google Sign-In Button */}
            <TouchableOpacity
              style={[styles.googleButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleGoogleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Icon name="google" size={24} color="#DB4437" />
              <Body style={[styles.googleButtonText, { color: colors.text }]} weight="medium">Continue with Google</Body>
            </TouchableOpacity>
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
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  content: {
    paddingHorizontal: 32,
  },
  logosContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: spacing.lg,
  },
  brainLogo: {
    width: 150,
    height: 150,
  },
  logoSpacer: {
    width: 20,
  },
  srmLogo: {
    width: 150,
    height: 48,
  },
  srmFallback: {
    width: 150,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  srmFallbackText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#F5A962',
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  infoNote: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 18,
    paddingHorizontal: 16,
    fontStyle: 'italic',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'transparent',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#F5A962',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    elevation: 2,
    shadowColor: '#F5A962',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  registerButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: '#F5A962',
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  googleButtonText: {
    marginLeft: 12,
    letterSpacing: 0.3,
  },
});

export default LoginScreen;
