# Quick Start: Google Authentication Implementation

## ✅ What Has Been Done

### 1. **Backend Files Created**

- ✅ `backend/src/routes/googleAuthRoutes.js` - Google OAuth routes with Supabase integration
- ✅ Updated `backend/src/server.js` - Registered Google auth routes

### 2. **Mobile Files Created/Updated**

- ✅ `mobile/src/services/googleAuthService.js` - Google Sign-In service
- ✅ Updated `mobile/src/redux/slices/authSlice.js` - Added `loginWithGoogle` action
- ✅ Updated `mobile/src/screens/auth/LoginScreen.js` - Added Google Sign-In button
- ✅ Updated `mobile/src/screens/auth/RegisterScreen.js` - Student-only registration

### 3. **Documentation Created**

- ✅ `GOOGLE_AUTH_SETUP.md` - Complete setup guide

---

## 🚀 Quick Implementation Steps

### STEP 1: Install Dependencies (5 minutes)

#### Backend:

```bash
cd d:\mindspace\backend
npm install @supabase/supabase-js
```

#### Mobile:

```bash
cd d:\mindspace\mobile
npx expo install @react-native-google-signin/google-signin
```

### STEP 2: Google Cloud Console (15 minutes)

1. **Create Project**: Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project: "MindSpace-Auth"

2. **Enable APIs**:
   - Enable "Google+ API"

3. **Configure OAuth Consent Screen**:
   - Choose "External"
   - App name: "MindSpace"
   - Add your email

4. **Create Credentials**:

   **Web Client** (for Supabase):
   - Type: Web application
   - Name: MindSpace-Web
   - Authorized redirect URIs: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
   - **SAVE Client ID and Secret**

   **Android Client**:
   - Type: Android
   - Package: `com.mindspace`
   - Get SHA-1:
     ```bash
     cd d:\mindspace\mobile\android
     .\gradlew.bat signingReport
     ```
   - Copy SHA-1 from debug variant
   - **SAVE Client ID**

### STEP 3: Supabase Setup (10 minutes)

1. **Enable Google Provider**:
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Google
   - Paste Web Client ID and Secret from Step 2
   - Save

2. **Update Database Schema**:
   - Go to SQL Editor
   - Run this:

   ```sql
   ALTER TABLE users
   ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'email',
   ADD COLUMN IF NOT EXISTS oauth_provider_id VARCHAR(255),
   ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

   CREATE UNIQUE INDEX IF NOT EXISTS idx_oauth_provider_id
   ON users(auth_provider, oauth_provider_id);

   ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
   ```

3. **Get Supabase Credentials**:
   - Settings → API
   - Copy: Project URL, anon key, service_role key

### STEP 4: Update Configuration Files (5 minutes)

#### 1. Backend `.env`:

```bash
# Edit: d:\mindspace\backend\.env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
PORT=3000
```

#### 2. Mobile `googleAuthService.js`:

```bash
# Edit: d:\mindspace\mobile\src\services\googleAuthService.js
# Line 13: Replace YOUR_WEB_CLIENT_ID with your actual Web Client ID
webClientId: 'XXXXX.apps.googleusercontent.com',
```

#### 3. Mobile `.env`:

```bash
# Create/Edit: d:\mindspace\mobile\.env
EXPO_PUBLIC_API_URL=http://YOUR_IP:3000/api
```

### STEP 5: Test (5 minutes)

#### Start Backend:

```bash
cd d:\mindspace\backend
npm start
```

#### Start Mobile:

```bash
cd d:\mindspace\mobile
npm start
# Then press 'a' for Android
```

#### Test Flow:

1. Open app
2. Click "Continue with Google"
3. Select Google account
4. Should see student dashboard with anonymous ID

---

## 🔧 Configuration Checklist

Before testing, ensure you have:

- [ ] Google Cloud project created
- [ ] Web OAuth Client ID and Secret obtained
- [ ] Android OAuth Client ID obtained (with correct SHA-1)
- [ ] Supabase Google provider enabled
- [ ] Supabase database schema updated
- [ ] Backend `.env` file configured
- [ ] Mobile `googleAuthService.js` updated with Web Client ID
- [ ] Dependencies installed (backend + mobile)

---

## 🎯 Expected Behavior

### For Students (Google Sign-In):

1. Click "Continue with Google"
2. Select Google account
3. **First time**: New student account created automatically
   - Anonymous ID generated (e.g., S-X7K9P)
   - Redirected to onboarding
4. **Returning**: Logs in directly to dashboard

### For Counsellors (Email/Password Only):

- Counsellors must be pre-registered by admin
- They cannot register via the app
- They login with email/password only

---

## 📝 Important Notes

### Security:

- Web Client ID is safe to expose (it's in client code)
- Keep Client Secret secure (backend only)
- Keep service_role key secure (backend only)

### Testing:

- Use real device or emulator with Google Play Services
- Debug SHA-1 is different from release SHA-1
- For production, generate release SHA-1

### Production:

- Get release SHA-1 fingerprint
- Create new Android OAuth client for release
- Update OAuth consent screen to "Published" status
- Use environment variables for all secrets

---

## 🐛 Common Issues

### "Developer Error" on Android:

- **Fix**: Check SHA-1 fingerprint matches Google Console
- **Fix**: Verify package name is `com.mindspace`

### "Sign-in failed":

- **Fix**: Check backend is running
- **Fix**: Verify Supabase credentials in `.env`
- **Fix**: Check network connectivity

### "PLAY_SERVICES_NOT_AVAILABLE":

- **Fix**: Install Google Play Services on emulator
- **Fix**: Use physical device

### Backend errors:

- Check Supabase URL and keys
- Verify database schema updated
- Check backend logs for details

---

## 📞 Next Steps

1. **Complete Step 1-5 above**
2. **Test on physical device** (recommended)
3. **Check logs** if issues occur:
   - Backend: Terminal output
   - Mobile: `npx react-native log-android`
   - Supabase: Dashboard → Logs

4. **For Production**:
   - Generate release keystore
   - Get release SHA-1
   - Create release OAuth credentials
   - Update environment configs

---

## 📚 Full Documentation

For detailed setup instructions, see: `GOOGLE_AUTH_SETUP.md`

For troubleshooting: Check Google Cloud Console, Supabase Dashboard, and application logs.
