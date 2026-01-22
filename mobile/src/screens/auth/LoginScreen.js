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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Text } from 'react-native-paper';
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Dual Logos */}
            <View style={styles.logosContainer}>
              <Image
                source={require('../../../assets/images/brain-logo.png')}
                style={styles.brainLogo}
                resizeMode="contain"
              />
              <View style={styles.logoSpacer} />
              <Image
                source={require('../../../assets/images/srm-logo.png')}
                style={styles.srmLogo}
                resizeMode="contain"
              />
            </View>

            {/* Title */}
            <Text style={styles.title}>Welcome to MindSpace</Text>
            <Text style={styles.subtitle}>
              Sign in or create an account to get started.
            </Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email ID</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                placeholder="john.doe@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor="#000000"
                placeholderTextColor="#999999"
                theme={{
                  colors: {
                    text: '#000000',
                    placeholder: '#999999',
                  },
                  roundness: 12,
                }}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor="#000000"
                placeholderTextColor="#999999"
                theme={{
                  colors: {
                    text: '#000000',
                    placeholder: '#999999',
                  },
                  roundness: 12,
                }}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                    color="#999999"
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
              style={styles.registerButton}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>Register</Text>
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
    backgroundColor: '#FFFFFF',
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
    height: 150,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  input: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: '#F5A962',
  },
  registerButtonText: {
    color: '#F5A962',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default LoginScreen;
