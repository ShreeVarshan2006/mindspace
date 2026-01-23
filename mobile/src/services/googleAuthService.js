import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import apiClient from './apiClient';

// Required for web browser to close after authentication
WebBrowser.maybeCompleteAuthSession();

class GoogleAuthService {
    constructor() {
        // Google OAuth Configuration
        // Replace with your actual Web Client ID from Google Cloud Console
        this.clientId = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';

        // For Expo Go development, use the proxy redirect URI
        // For standalone builds, this will be automatically configured
        this.redirectUri = AuthSession.makeRedirectUri({
            scheme: 'com.mindspace',
            path: 'redirect'
        });

        console.log('Google Auth Redirect URI:', this.redirectUri);
    }

    async signInWithGoogle() {
        try {
            // Configure the authentication request
            const discovery = {
                authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
                tokenEndpoint: 'https://oauth2.googleapis.com/token',
                revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
            };

            // Create the auth request
            const authRequest = new AuthSession.AuthRequest({
                clientId: this.clientId,
                scopes: ['openid', 'profile', 'email'],
                redirectUri: this.redirectUri,
                responseType: AuthSession.ResponseType.IdToken,
                usePKCE: false,
            });

            // Load the request
            await authRequest.makeAuthUrlAsync(discovery);

            // Prompt the user to authenticate
            const result = await authRequest.promptAsync(discovery, {
                useProxy: true, // Use Expo's proxy for development
                showInRecents: true,
            });

            if (result.type === 'success') {
                // Extract ID token from the response
                const idToken = result.params.id_token;

                if (!idToken) {
                    throw new Error('No ID token received from Google');
                }

                console.log('Google sign-in successful, sending to backend...');

                // Send ID token to backend for verification and user creation/login
                const response = await apiClient.post('/auth/google/login', {
                    idToken: idToken,
                });

                if (response.data.success) {
                    return {
                        success: true,
                        user: response.data.user,
                        token: response.data.token,
                        refreshToken: response.data.refreshToken,
                    };
                } else {
                    throw new Error(response.data.message || 'Google sign-in failed');
                }
            } else if (result.type === 'cancel') {
                throw new Error('Sign-in was cancelled');
            } else {
                throw new Error('Sign-in failed');
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
            throw new Error(error.message || 'Google sign-in failed. Please try again.');
        }
    }

    async signOut() {
        try {
            // Revoke the authentication session
            await AuthSession.revokeAsync(
                {
                    token: '', // Add token if you store it
                    clientId: this.clientId,
                },
                {
                    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
                }
            );
            console.log('Google sign-out successful');
        } catch (error) {
            console.error('Google sign-out error:', error);
        }
    }

    getRedirectUri() {
        return this.redirectUri;
    }
}

export default new GoogleAuthService();
