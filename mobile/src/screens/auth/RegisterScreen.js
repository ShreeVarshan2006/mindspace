import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, Text, HelperText, RadioButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../redux/slices/authSlice';
import { spacing, theme } from '../../constants/theme';
import { ROLES } from '../../constants';

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState(ROLES.STUDENT);
  const [specialization, setSpecialization] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (role !== ROLES.STUDENT && !name) {
      newErrors.name = 'Name is required';
    }

    if (role === ROLES.COUNSELLOR && !specialization) {
      newErrors.specialization = 'Specialization is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    const userData = {
      email,
      password,
      role,
    };

    if (role !== ROLES.STUDENT) {
      userData.name = name;
    }

    if (role === ROLES.COUNSELLOR) {
      userData.specialization = specialization;
    }

    try {
      await dispatch(register(userData)).unwrap();
      // Navigate to welcome onboarding for first-time users
      if (role === ROLES.STUDENT) {
        navigation.navigate('WelcomeOnboarding');
      }
      // Will navigate to main app if counsellor/management after registration
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join MindSpace today</Text>

            <View style={styles.roleContainer}>
              <Text style={styles.label}>I am a:</Text>
              <RadioButton.Group onValueChange={setRole} value={role}>
                <View style={styles.radioItem}>
                  <RadioButton value={ROLES.STUDENT} />
                  <Text>Student</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value={ROLES.COUNSELLOR} />
                  <Text>Counsellor</Text>
                </View>
              </RadioButton.Group>
            </View>

            {role !== ROLES.STUDENT && (
              <TextInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                error={!!errors.name}
                style={styles.input}
              />
            )}

            {role === ROLES.COUNSELLOR && (
              <TextInput
                label="Specialization"
                value={specialization}
                onChangeText={setSpecialization}
                mode="outlined"
                error={!!errors.specialization}
                style={styles.input}
              />
            )}

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

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              error={!!errors.confirmPassword}
              style={styles.input}
            />
            <HelperText type="error" visible={!!errors.confirmPassword}>
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
    backgroundColor: '#FFFFFF',
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F5A962',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  roleContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: '#000000',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    marginBottom: spacing.xs,
    backgroundColor: '#FFFFFF',
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
