# Google Authentication - Expo SDK 50 Compatible Setup

## ✅ Updated Implementation

The implementation has been updated to use **Expo AuthSession** instead of `@react-native-google-signin/google-signin` to be compatible with Expo SDK 50.

---

## 📦 Dependencies (Already Available)

These packages are already included in Expo SDK 50:

- ✅ `expo-auth-session`
- ✅ `expo-web-browser`
- ✅ `expo-crypto`

**No additional npm install needed!**

---

## 🚀 Quick Setup (30 minutes)

### STEP 1: Google Cloud Console (15 minutes)

#### 1. Create Project

- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create new project: **"MindSpace-Auth"**

#### 2. Enable Google+ API

- Navigate to **APIs & Services** → **Library**
- Search "Google+ API"
- Click **Enable**

#### 3. Configure OAuth Consent Screen

- Go to **APIs & Services** → **OAuth consent screen**
- Select **External**
- Fill in:
  - **App name**: MindSpace
  - **User support email**: your-email@example.com
  - **Developer contact**: your-email@example.com
- **Scopes**: Add `email`, `profile`, `openid`
- Click **Save and Continue**

#### 4. Create OAuth 2.0 Credentials

**Web Client (REQUIRED)**:

1. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
2. Application type: **Web application**
3. Name: `MindSpace-Web`
4. **Authorized JavaScript origins**:
   ```
   https://your-project-ref.supabase.co
   ```
5. **Authorized redirect URIs**:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   https://auth.expo.io/@your-expo-username/mindspace
   ```
6. Click **Create**
7. **SAVE Client ID and Client Secret** ⚠️

---

### STEP 2: Supabase Setup (10 minutes)

#### 1. Enable Google Provider

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. **Authentication** → **Providers**
4. Find **Google** → Enable it
5. Enter:
   - **Client ID**: Paste Web Client ID from Step 1
   - **Client Secret**: Paste Client Secret from Step 1
6. Click **Save**

#### 2. Update Database Schema

Go to **SQL Editor** and run:

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'email',
ADD COLUMN IF NOT EXISTS oauth_provider_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_oauth_provider_id
ON users(auth_provider, oauth_provider_id)
WHERE oauth_provider_id IS NOT NULL;

ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
```

---

### STEP 3: Configure Your App (5 minutes)

#### 1. Backend Configuration

Edit `d:\mindspace\backend\.env`:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
PORT=3000
```

#### 2. Mobile Configuration

Edit `d:\mindspace\mobile\src\services\googleAuthService.js` (line 13):

```javascript
this.clientId = "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com";
```

**Replace with your actual Web Client ID from Google Cloud Console**

---

### STEP 4: Test (5 minutes)

#### Start Backend:

```bash
cd d:\mindspace\backend
npm start
```

#### Start Mobile:

```bash
cd d:\mindspace\mobile
npm start
# Press 'a' for Android
```

#### Test Flow:

1. Open app
2. Click "Continue with Google"
3. Browser opens → Select Google account
4. Returns to app → Logged in!

---

## 📱 How It Works (Expo AuthSession)

### Flow:

```
Mobile App → Opens Browser (Expo AuthSession)
     ↓
Google Login Page (User signs in)
     ↓
Redirects back with ID Token
     ↓
Mobile sends token to Backend
     ↓
Backend verifies with Supabase
     ↓
Returns user data to Mobile
```

### Key Differences from React Native Google Sign-In:

- ✅ Uses web browser instead of native SDK
- ✅ Works with Expo Go (no need for custom dev client)
- ✅ No Google Play Services dependency
- ✅ Compatible with Expo SDK 50
- ✅ Works on iOS, Android, and Web

---

## 🔧 Important Configuration Notes

### Redirect URI

The app uses this redirect URI:

```
exp://YOUR_IP:8081/--/redirect
```

For production (EAS Build):

```
com.mindspace://redirect
```

### Expo Development

During development, Expo automatically handles the redirect URI. Just make sure to add the Expo auth redirect to Google Console:

```
https://auth.expo.io/@your-expo-username/mindspace
```

---

## ⚠️ Common Issues & Solutions

### Issue: "Invalid redirect URI"

**Solution**:

1. Check Google Console → Credentials → Your Web Client
2. Add both:
   - `https://auth.expo.io/@your-username/mindspace`
   - `https://your-project.supabase.co/auth/v1/callback`

### Issue: "No ID token received"

**Solution**:

- Verify Web Client ID is correct in `googleAuthService.js`
- Check that you're using the **Web** Client ID, not Android

### Issue: Browser doesn't close after login

**Solution**:

- Make sure `WebBrowser.maybeCompleteAuthSession()` is called
- Already included in the updated code

---

## 🎯 What You Need

### From Google Cloud Console:

- ✅ Web OAuth Client ID
- ✅ Web OAuth Client Secret

### From Supabase:

- ✅ Project URL
- ✅ Service Role Key

### No Need For:

- ❌ Android Client ID (not used with Expo AuthSession)
- ❌ SHA-1 fingerprint (not needed for web-based OAuth)
- ❌ google-services.json (not needed)

---

## ✅ Testing Checklist

- [ ] Backend `.env` configured with Supabase credentials
- [ ] Google Web Client ID added to `googleAuthService.js`
- [ ] Google OAuth consent screen configured
- [ ] Supabase Google provider enabled
- [ ] Database schema updated (SQL ran successfully)
- [ ] Backend running (`npm start`)
- [ ] Mobile app running (`npm start` → press 'a')
- [ ] "Continue with Google" button visible on login screen
- [ ] Clicking button opens browser
- [ ] Can select Google account
- [ ] Redirects back to app after login
- [ ] User logged in successfully

---

## 📖 Key Files Modified

1. **`mobile/src/services/googleAuthService.js`**
   - Updated to use Expo AuthSession
   - Removed react-native-google-signin dependency

2. **`mobile/app.json`**
   - Added `"scheme": "com.mindspace"` for deep linking

3. **All other files remain the same**:
   - Redux slice
   - Login screen
   - Backend routes
   - Database schema

---

## 🎉 Advantages of This Approach

1. **No dependency conflicts** - Uses built-in Expo packages
2. **Works with Expo Go** - No need for custom dev client
3. **Cross-platform** - Same code for iOS, Android, Web
4. **Simpler setup** - No native configuration needed
5. **Future-proof** - Compatible with future Expo versions

---

## 🚀 Ready to Test!

Just update:

1. Backend `.env` → Supabase credentials
2. `googleAuthService.js` → Web Client ID (line 13)
3. Run backend and mobile app
4. Click "Continue with Google"

That's it! 🎊
