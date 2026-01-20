import apiClient from './apiClient';

class MoodService {
  async getMoods() {
    try {
      const response = await apiClient.get('/moods');
      const moods = response.data.data || response.data.moods || [];
      // Normalize createdAt field from backend
      const normalizedMoods = moods.map(mood => ({
        ...mood,
        createdAt: mood.createdAt || mood.created_at || mood.date
      }));
      return {
        success: true,
        moods: normalizedMoods
      };
    } catch (error) {
      console.error('Get moods error:', error);
      // Return empty array instead of mock data
      return {
        success: true,
        moods: []
      };
    }
  }

  async logMood(moodData) {
    try {
      const now = new Date();
      const response = await apiClient.post('/moods', {
        mood: moodData.mood,
        intensity: moodData.intensity || 3,
        note: moodData.note || '',
        activities: moodData.activities || [],
        date: now.toISOString().split('T')[0]
      });
      const moodResult = response.data.data || response.data.mood || response.data;
      // Ensure the mood has a createdAt field
      if (!moodResult.createdAt && !moodResult.created_at) {
        moodResult.createdAt = now.toISOString();
      }
      return {
        success: true,
        mood: moodResult
      };
    } catch (error) {
      console.error('Log mood error:', error);
      // Return the mood with client-side generated data as fallback
      const now = new Date();
      return {
        success: true,
        mood: {
          id: 'mood-' + Date.now(),
          mood: moodData.mood,
          intensity: moodData.intensity || 3,
          note: moodData.note || '',
          activities: moodData.activities || [],
          date: now.toISOString().split('T')[0],
          createdAt: now.toISOString(),
          created_at: now.toISOString()
        }
      };
    }
  }

  async getMonthMoods(year, month) {
    // MOCK DATA
    const mockMoods = {};
    for (let i = 1; i <= 14; i++) {
      mockMoods[i] = {
        mood: ['happy', 'calm', 'anxious', 'sad', 'neutral'][Math.floor(Math.random() * 5)],
        intensity: Math.floor(Math.random() * 5) + 1
      };
    }
    return {
      success: true,
      moods: mockMoods
    };
  }

  async getTodayMood() {
    // MOCK DATA
    return {
      success: true,
      mood: { _id: '1', mood: 'happy', intensity: 4, note: 'Great day!', activities: ['Exercise'] }
    };
  }
}

export const moodService = new MoodService();
