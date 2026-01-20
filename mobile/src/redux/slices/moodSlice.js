import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { moodService } from '../../services/moodService';

const initialState = {
  moods: [],
  currentMonthMoods: [],
  isLoading: false,
  error: null,
};

export const fetchMoods = createAsyncThunk(
  'moods/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await moodService.getMoods();
      return response.moods || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch moods');
    }
  }
);

export const logMood = createAsyncThunk(
  'moods/log',
  async (moodData, { rejectWithValue }) => {
    try {
      const response = await moodService.logMood(moodData);
      return response.mood || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to log mood');
    }
  }
);

export const fetchMonthMoods = createAsyncThunk(
  'moods/fetchMonth',
  async ({ year, month }, { rejectWithValue }) => {
    try {
      const response = await moodService.getMonthMoods(year, month);
      return response.moods || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch month moods');
    }
  }
);

const moodSlice = createSlice({
  name: 'moods',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch moods
      .addCase(fetchMoods.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMoods.fulfilled, (state, action) => {
        state.isLoading = false;
        state.moods = action.payload;
      })
      .addCase(fetchMoods.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Log mood
      .addCase(logMood.fulfilled, (state, action) => {
        const newMood = action.payload;
        // Normalize the createdAt field
        if (!newMood.createdAt && newMood.created_at) {
          newMood.createdAt = newMood.created_at;
        }
        // Check if mood already exists for this date
        const dateToCompare = newMood.date || newMood.createdAt;
        const index = state.moods.findIndex(
          m => {
            const mDate = m.date || m.createdAt;
            return mDate && dateToCompare &&
              new Date(mDate).toDateString() === new Date(dateToCompare).toDateString();
          }
        );
        if (index !== -1) {
          state.moods[index] = newMood;
        } else {
          state.moods.unshift(newMood);
        }
      })
      // Fetch month moods
      .addCase(fetchMonthMoods.fulfilled, (state, action) => {
        state.currentMonthMoods = action.payload;
      });
  },
});

export const { clearError } = moodSlice.actions;
export default moodSlice.reducer;
