const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Initiate Google OAuth flow
router.post('/login', async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: 'ID token is required'
            });
        }

        // Verify and sign in with Google token using Supabase
        const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: idToken,
        });

        if (error) throw error;

        // Extract user info from Google
        const googleUser = data.user;
        const email = googleUser.email;

        // Check if user exists in our users table
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        let user;

        if (existingUser) {
            // User exists - update last login and OAuth info if needed
            const { data: updatedUser, error: updateError } = await supabase
                .from('users')
                .update({
                    profile_picture_url: googleUser.user_metadata?.avatar_url,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existingUser.id)
                .select()
                .single();

            if (updateError) throw updateError;
            user = updatedUser;
        } else {
            // New user - only allow students to register via Google
            // Counsellors and management must be pre-registered by admin
            const anonymousUsername = generateAnonymousUsername();
            const qrSecret = generateQRSecret();

            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert({
                    email: email,
                    role: 'student',
                    auth_provider: 'google',
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

        // Return success response
        res.json({
            success: true,
            token: data.session.access_token,
            refreshToken: data.session.refresh_token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                anonymousUsername: user.anonymous_username,
                isOnboarded: user.is_onboarded,
                profilePicture: user.profile_picture_url,
                name: user.name,
                year: user.year,
                department: user.department,
                specialization: user.specialization,
                isActive: user.is_active,
            }
        });

    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Google authentication failed'
        });
    }
});

// Verify existing Google session
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const { data, error } = await supabase.auth.getUser(token);

        if (error) throw error;

        // Fetch full user profile from users table
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', data.user.email)
            .single();

        if (fetchError) throw fetchError;

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                anonymousUsername: user.anonymous_username,
                isOnboarded: user.is_onboarded,
                profilePicture: user.profile_picture_url,
                name: user.name,
            }
        });

    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
});

// Helper functions
function generateAnonymousUsername() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'S-';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function generateQRSecret() {
    return 'QR-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

module.exports = router;
