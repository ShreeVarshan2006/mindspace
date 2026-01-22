import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { storageService } from '../../services/storageService';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isOnboarded: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      await storageService.setToken(response.token);
      await storageService.setUser(response.user);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      await storageService.setToken(response.token);
      await storageService.setUser(response.user);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const completeOnboarding = createAsyncThunk(
  'auth/completeOnboarding',
  async (onboardingData, { rejectWithValue }) => {
    try {
      const response = await authService.completeOnboarding(onboardingData);
      await storageService.setUser(response.user);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Onboarding failed');
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStored',
  async (_, { rejectWithValue }) => {
    try {
      const token = await storageService.getToken();
      const user = await storageService.getUser();

      if (token && user) {
        return { token, user };
      }
      return null;
    } catch (error) {
      return rejectWithValue('Failed to load stored authentication');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await storageService.removeToken();
    await storageService.removeUser();
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData);
      const updatedUser = { ...response.user };
      await storageService.setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isOnboarded = action.payload.user.isOnboarded;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isOnboarded = action.payload.user.isOnboarded;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Complete Onboarding
      .addCase(completeOnboarding.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeOnboarding.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isOnboarded = true;
      })
      .addCase(completeOnboarding.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Load stored auth
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isOnboarded = action.payload.user.isOnboarded;
        }
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isOnboarded = false;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
