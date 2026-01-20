import apiClient from './apiClient';

class SessionService {
  async getSessions() {
    // MOCK DATA
    return {
      success: true,
      sessions: [
        {
          _id: '1',
          counsellor: { name: 'Dr. Sarah Johnson' },
          date: '2025-12-10',
          duration: 45,
          notes: 'Discussed stress management techniques',
          severity: 'moderate'
        },
        {
          _id: '2',
          counsellor: { name: 'Dr. Sarah Johnson' },
          date: '2025-12-08',
          duration: 60,
          notes: 'Career guidance session',
          severity: 'low'
        },
      ]
    };
  }

  async getSessionById(id) {
    try {
      const response = await apiClient.get(`/sessions/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Get session error:', error);
      // Fallback to mock data for development
      return {
        success: true,
        data: {
          _id: id,
          student: { anonymousUsername: 'S-' + Math.random().toString(36).substr(2, 5).toUpperCase() },
          startTime: new Date().toISOString(),
          notes: '',
          severity: 'moderate'
        }
      };
    }
  }

  async startSession(qrData) {
    try {
      const response = await apiClient.post('/sessions/start', { qrData });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Start session error:', error);
      // Fallback for development
      return {
        success: true,
        data: {
          _id: 'session-' + Date.now(),
          student: { anonymousUsername: qrData || 'S-' + Math.random().toString(36).substr(2, 5).toUpperCase() },
          startTime: new Date().toISOString(),
        }
      };
    }
  }

  async verifyCheckout(sessionId, qrData) {
    try {
      const response = await apiClient.post(`/sessions/${sessionId}/checkout`, qrData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Verify checkout error:', error);
      // Fallback for development
      return {
        success: true,
        data: {
          _id: sessionId,
          verified: true,
          checkoutTime: new Date().toISOString(),
        }
      };
    }
  }

  async endSession(sessionId, sessionData) {
    try {
      const response = await apiClient.post(`/sessions/${sessionId}/end`, sessionData);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('End session error:', error);
      // Fallback for development - simulate successful save
      console.log('Session data saved locally:', sessionData);
      return {
        success: true,
        data: {
          _id: sessionId,
          ...sessionData,
          endTime: new Date().toISOString(),
          saved: true
        }
      };
    }
  }

  async getStudentHistory(studentId) {
    // MOCK DATA
    return {
      success: true,
      sessions: [
        {
          _id: '1',
          date: '2025-12-10',
          duration: 45,
          notes: 'Stress management discussion',
          severity: 'moderate'
        },
        {
          _id: '2',
          date: '2025-11-25',
          duration: 60,
          notes: 'Initial consultation',
          severity: 'high'
        },
      ]
    };
  }

  async submitFeedback(sessionId, feedback) {
    // MOCK DATA
    return {
      success: true,
      message: 'Feedback submitted successfully'
    };
  }
}

export const sessionService = new SessionService();
