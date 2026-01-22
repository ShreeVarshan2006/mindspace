import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sessionService } from '../../services/sessionService';

const initialState = {
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,
};

export const fetchSessions = createAsyncThunk(
  'sessions/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await sessionService.getSessions();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sessions');
    }
  }
);

export const startSession = createAsyncThunk(
  'sessions/start',
  async (qrData, { rejectWithValue }) => {
    try {
      return await sessionService.startSession(qrData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start session');
    }
  }
);

export const endSession = createAsyncThunk(
  'sessions/end',
  async ({ sessionId, sessionData }, { rejectWithValue }) => {
    try {
      return await sessionService.endSession(sessionId, sessionData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to end session');
    }
  }
);

export const submitFeedback = createAsyncThunk(
  'sessions/feedback',
  async ({ sessionId, feedback }, { rejectWithValue }) => {
    try {
      return await sessionService.submitFeedback(sessionId, feedback);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit feedback');
    }
  }
);

const sessionSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    clearCurrentSession: (state) => {
      state.currentSession = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sessions
      .addCase(fetchSessions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessions = action.payload.sessions || [];
        state.error = null;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Start session
      .addCase(startSession.fulfilled, (state, action) => {
        state.currentSession = action.payload;
      })
      // End session
      .addCase(endSession.fulfilled, (state, action) => {
        state.currentSession = null;
        // Update existing session or add new one
        const sessionData = action.payload.data || action.payload;
        const index = state.sessions.findIndex(s => s._id === sessionData._id);
        if (index !== -1) {
          // Update existing session with new data
          state.sessions[index] = {
            ...state.sessions[index],
            ...sessionData,
            isFinalized: true
          };
        } else {
          // Add new session to the beginning
          state.sessions.unshift(sessionData);
        }
      })
      // Submit feedback
      .addCase(submitFeedback.fulfilled, (state, action) => {
        const index = state.sessions.findIndex(s => s._id === action.payload.sessionId);
        if (index !== -1) {
          state.sessions[index].feedback = action.payload;
        }
      });
  },
});

export const { clearCurrentSession, clearError } = sessionSlice.actions;
export default sessionSlice.reducer;
