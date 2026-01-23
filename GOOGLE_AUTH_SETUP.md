# Google Authentication Setup Guide for MindSpace

## Overview

This guide will help you set up Google OAuth authentication for both mobile (React Native/Expo) and backend (Supabase + Node.js) integration.

---

## Part 1: Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a Project** → **New Project**
3. Name: `MindSpace-Auth`
4. Click **Create**

### Step 2: Enable Google+ API

1. In the sidebar, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click **Enable**

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (for testing) or **Internal** (for organization)
3. Fill in the required fields:
   - **App name**: MindSpace
   - **User support email**: your-email@example.com
   - **Developer contact**: your-email@example.com
4. Click **Save and Continue**
5. **Scopes**: Add `email`, `profile`, `openid` (default scopes)
6. **Test users** (if External): Add your test email addresses
7. Click **Save and Continue**

### Step 4: Create OAuth 2.0 Credentials

#### For Web (Supabase)

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: `MindSpace-Web`
5. **Authorized JavaScript origins**:
   - `https://your-project-ref.supabase.co`
6. **Authorized redirect URIs**:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
7. Click **Create**
8. **SAVE** the Client ID and Client Secret

#### For Android

1. Click **Create Credentials** → **OAuth 2.0 Client ID**
2. Application type: **Android**
3. Name: `MindSpace-Android`
4. **Package name**: `com.mindspace` (from your app.json)
5. **SHA-1 certificate fingerprint**:

   Get debug SHA-1:

   ```bash
   cd d:\mindspace\mobile\android
   .\gradlew.bat signingReport
   ```

   Copy the SHA-1 from the output under "Variant: debug"

6. Click **Create**
7. **SAVE** the Client ID

#### For iOS (if needed)

1. Click **Create Credentials** → **OAuth 2.0 Client ID**
2. Application type: **iOS**
3. Name: `MindSpace-iOS`
4. **Bundle ID**: `com.mindspace`
5. Click **Create**

---

## Part 2: Supabase Setup

### Step 1: Configure Google Provider in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google** and click to expand
5. Enable **Google enabled**
6. Enter your credentials from Google Cloud Console:
   - **Client ID (for OAuth)**: Paste the Web Client ID
   - **Client Secret (for OAuth)**: Paste the Client Secret
7. Click **Save**

### Step 2: Get Supabase Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these values (you'll need them):
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon public key**: Your public anon key
   - **service_role key**: Your service role key (keep secret!)

### Step 3: Update Supabase Schema

Run this SQL in Supabase SQL Editor to support Google auth:

```sql
-- Add OAuth provider fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'email',
ADD COLUMN IF NOT EXISTS oauth_provider_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Create unique index for OAuth users
CREATE UNIQUE INDEX IF NOT EXISTS idx_oauth_provider_id
ON users(auth_provider, oauth_provider_id);

-- Update the users table to allow password to be nullable for OAuth users
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
```

---

## Part 3: Backend Setup

### Step 1: Install Dependencies

```bash
cd d:\mindspace\backend
npm install @supabase/supabase-js @react-native-google-signin/google-signin
```

### Step 2: Update Environment Variables

Edit `d:\mindspace\backend\.env`:

```env
# Existing variables
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3000

# Add these for Google Auth
GOOGLE_CLIENT_ID_WEB=your-web-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://your-project-ref.supabase.co/auth/v1/callback
```

### Step 3: Create Google Auth Routes

Create `d:\mindspace\backend\src\routes\googleAuthRoutes.js`:

```javascript
const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// Initiate Google OAuth flow
router.post("/google/login", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "ID token is required",
      });
    }

    // Verify and sign in with Google token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });

    if (error) throw error;

    // Extract user info from Google
    const googleUser = data.user;
    const email = googleUser.email;

    // Check if user exists in our users table
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    let user;

    if (existingUser) {
      // User exists, update last login
      user = existingUser;
    } else {
      // New user - only allow students to register via Google
      // Counsellors must be pre-registered by admin
      const anonymousUsername = generateAnonymousUsername();
      const qrSecret = generateQRSecret();

      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          email: email,
          role: "student",
          auth_provider: "google",
          oauth_provider_id: googleUser.id,
          profile_picture_url: googleUser.user_metadata?.avatar_url,
          anonymous_username: anonymousUsername,
          qr_secret: qrSecret,
          is_onboarded: false,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      user = newUser;
    }

    res.json({
      success: true,
      token: data.session.access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        anonymousUsername: user.anonymous_username,
        isOnboarded: user.is_onboarded,
        profilePicture: user.profile_picture_url,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Google authentication failed",
    });
  }
});

function generateAnonymousUsername() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "S-";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateQRSecret() {
  return "QR-" + Math.random().toString(36).substr(2, 9).toUpperCase();
}

module.exports = router;
```

### Step 4: Register Routes in Server

Edit `d:\mindspace\backend\src\server.js`:

```javascript
// Add this import
const googleAuthRoutes = require("./routes/googleAuthRoutes");

// Add this route (after other routes)
app.use("/api/auth/google", googleAuthRoutes);
```

---

## Part 4: Mobile App Setup

### Step 1: Install Dependencies

```bash
cd d:\mindspace\mobile
npx expo install expo-auth-session expo-crypto @react-native-google-signin/google-signin
```

### Step 2: Update app.json

Edit `d:\mindspace\mobile\app.json`:

```json
{
  "expo": {
    "android": {
      "package": "com.mindspace",
      "googleServicesFile": "./google-services.json",
      "config": {
        "googleSignIn": {
          "apiKey": "YOUR_ANDROID_API_KEY",
          "certificateHash": "YOUR_SHA1_FINGERPRINT"
        }
      }
    },
    "plugins": ["@react-native-google-signin/google-signin"]
  }
}
```

### Step 3: Create Google Auth Service

Create `d:\mindspace\mobile\src\services\googleAuthService.js`:

```javascript
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import apiClient from "./apiClient";

class GoogleAuthService {
  constructor() {
    this.configureGoogleSignIn();
  }

  configureGoogleSignIn() {
    GoogleSignin.configure({
      webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com", // From Google Cloud Console
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }

  async signInWithGoogle() {
    try {
      // Check if device supports Google Play Services
      await GoogleSignin.hasPlayServices();

      // Get user info and ID token
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      // Send ID token to backend
      const response = await apiClient.post("/auth/google/google/login", {
        idToken: tokens.idToken,
      });

      if (response.data.success) {
        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
        };
      } else {
        throw new Error(response.data.message || "Google sign-in failed");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);

      if (error.code === "SIGN_IN_CANCELLED") {
        throw new Error("Sign-in cancelled");
      } else if (error.code === "IN_PROGRESS") {
        throw new Error("Sign-in already in progress");
      } else if (error.code === "PLAY_SERVICES_NOT_AVAILABLE") {
        throw new Error("Google Play Services not available");
      } else {
        throw new Error(error.message || "Google sign-in failed");
      }
    }
  }

  async signOut() {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error("Google sign-out error:", error);
    }
  }

  async isSignedIn() {
    return await GoogleSignin.isSignedIn();
  }

  async getCurrentUser() {
    return await GoogleSignin.getCurrentUser();
  }
}

export default new GoogleAuthService();
```

### Step 4: Update Auth Slice

Edit `d:\mindspace\mobile\src\redux\slices\authSlice.js`:

Add this new async thunk:

```javascript
export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (_, { rejectWithValue }) => {
    try {
      const googleAuthService =
        require("../../services/googleAuthService").default;
      const response = await googleAuthService.signInWithGoogle();

      await storageService.setToken(response.token);
      await storageService.setUser(response.user);

      // Generate and store anonymous ID if student
      if (
        response.user.role === "student" &&
        !response.user.anonymousUsername
      ) {
        const anonymousId =
          "STU" + Math.random().toString(36).substring(2, 8).toUpperCase();
        await AsyncStorage.setItem("anonymousStudentId", anonymousId);
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Google login failed");
    }
  },
);
```

Add to extraReducers:

```javascript
// Google Login
.addCase(loginWithGoogle.pending, (state) => {
  state.isLoading = true;
  state.error = null;
})
.addCase(loginWithGoogle.fulfilled, (state, action) => {
  state.isLoading = false;
  state.isAuthenticated = true;
  state.user = action.payload.user;
  state.token = action.payload.token;
  state.isOnboarded = action.payload.user.isOnboarded;
})
.addCase(loginWithGoogle.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
})
```

### Step 5: Update Login Screen

Add Google Sign-In button to `d:\mindspace\mobile\src\screens\auth\LoginScreen.js`.

---

## Part 5: Testing

### Test Flow:

1. **Start Backend**: `cd d:\mindspace\backend && npm start`
2. **Start Mobile**: `cd d:\mindspace\mobile && npm start`
3. Click "Sign in with Google"
4. Select Google account
5. Verify user is created in Supabase users table
6. Check that anonymous ID is generated for students

### Verify in Supabase:

```sql
SELECT email, role, auth_provider, anonymous_username, is_onboarded
FROM users
WHERE auth_provider = 'google';
```

---

## Security Notes

1. **Never commit** credentials to Git:
   - Add `.env` to `.gitignore`
   - Store secrets in environment variables
2. **Production Setup**:
   - Use environment-specific credentials
   - Enable OAuth consent screen for production
   - Use HTTPS for all endpoints
   - Implement rate limiting

3. **Token Security**:
   - Tokens stored in secure storage (expo-secure-store)
   - Refresh tokens for long sessions
   - Implement token expiration

---

## Troubleshooting

### Error: "Developer Error"

- Check SHA-1 fingerprint matches Google Console
- Verify package name matches

### Error: "Sign-in failed"

- Check backend is running
- Verify Supabase credentials
- Check network connectivity

### Error: "PLAY_SERVICES_NOT_AVAILABLE"

- Install Google Play Services on emulator/device
- Use physical device for testing

---

## Summary Checklist

- [ ] Google Cloud Project created
- [ ] OAuth credentials configured (Web + Android)
- [ ] Supabase Google provider enabled
- [ ] Database schema updated
- [ ] Backend routes created
- [ ] Environment variables set
- [ ] Mobile dependencies installed
- [ ] Google auth service created
- [ ] Redux slice updated
- [ ] Login screen updated with Google button
- [ ] Tested on device/emulator

---

**Need Help?** Check the logs in:

- Supabase Dashboard → Logs
- Backend terminal output
- Mobile: `npx react-native log-android`
