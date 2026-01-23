-- Google OAuth Support Migration
-- Run this in Supabase SQL Editor to add Google authentication support

-- Add OAuth provider fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'email',
ADD COLUMN IF NOT EXISTS oauth_provider_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN users.auth_provider IS 'Authentication provider: email, google';
COMMENT ON COLUMN users.oauth_provider_id IS 'Unique ID from OAuth provider (Google user ID)';
COMMENT ON COLUMN users.profile_picture_url IS 'Profile picture URL from OAuth provider';

-- Create unique index for OAuth users to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_oauth_provider_id 
ON users(auth_provider, oauth_provider_id)
WHERE oauth_provider_id IS NOT NULL;

-- Make password nullable for OAuth users (they don't have passwords)
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Add check constraint for auth_provider values
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_auth_provider_check;
ALTER TABLE users ADD CONSTRAINT users_auth_provider_check 
CHECK (auth_provider IN ('email', 'google'));

-- Create index on auth_provider for faster queries
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Update existing users to have 'email' as auth_provider if NULL
UPDATE users 
SET auth_provider = 'email' 
WHERE auth_provider IS NULL;

-- View to check OAuth users
CREATE OR REPLACE VIEW oauth_users AS
SELECT 
  id,
  email,
  role,
  auth_provider,
  oauth_provider_id,
  profile_picture_url,
  anonymous_username,
  is_onboarded,
  created_at
FROM users
WHERE auth_provider != 'email';

-- Grant access to the view
GRANT SELECT ON oauth_users TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Google OAuth support added successfully!';
  RAISE NOTICE 'You can now:';
  RAISE NOTICE '1. Enable Google provider in Supabase Dashboard';
  RAISE NOTICE '2. Add your Google OAuth credentials';
  RAISE NOTICE '3. Test Google login in your app';
END $$;
