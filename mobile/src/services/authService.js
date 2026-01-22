import apiClient from './apiClient';

class AuthService {
  async login(credentials) {
    // MOCK DATA - Frontend testing only
    const role = credentials.email.includes('counsellor') ? 'counsellor' :
      credentials.email.includes('management') ? 'management' : 'student';

    const user = {
      _id: 'user-' + Date.now(),
      email: credentials.email,
      role,
      isOnboarded: true,
      name: credentials.email.split('@')[0],
    };

    // Add student-specific fields
    if (role === 'student') {
      user.anonymousUsername = this.generateAnonymousUsername();
      user.qrSecret = 'QR-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      user.year = '2';
      user.department = 'Computer Science';
    }

    // Add counsellor-specific fields
    if (role === 'counsellor') {
      user.specialization = 'General Counseling';
      user.isActive = false;
    }

    return {
      success: true,
      token: 'mock-jwt-token-' + Date.now(),
      user,
    };
  }

  generateAnonymousUsername() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'S-';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async register(userData) {
    // MOCK DATA - Frontend testing only
    return {
      success: true,
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        _id: 'user-' + Date.now(),
        email: userData.email,
        role: userData.role || 'student',
        isOnboarded: userData.role !== 'student',
        name: userData.name || userData.email.split('@')[0],
        anonymousUsername: userData.role === 'student' ? null : undefined,
        specialization: userData.specialization,
      }
    };
  }

  async completeOnboarding(onboardingData) {
    // MOCK DATA - Frontend testing only
    const anonymousUsername = this.generateAnonymousUsername();
    const qrSecret = 'QR-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    return {
      success: true,
      user: {
        ...onboardingData,
        anonymousUsername,
        qrSecret,
        isOnboarded: true,
      }
    };
  }

  async getCurrentUser() {
    // MOCK DATA - Frontend testing only
    return {
      success: true,
      user: {
        _id: 'mock-user-id',
        email: 'test@example.com',
        role: 'student',
        isOnboarded: true,
        name: 'Test User',
      }
    };
  }

  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/auth/profile', profileData);
      return {
        success: true,
        user: response.data.user || response.data
      };
    } catch (error) {
      console.error('Update profile error:', error);
      // Return mock success as fallback
      return {
        success: true,
        user: profileData
      };
    }
  }

  async getQRCode() {
    // MOCK DATA - Frontend testing only
    return {
      success: true,
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    };
  }
}

export const authService = new AuthService();
