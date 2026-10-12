import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  inMemoryPersistence,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Attempt to set in-memory persistence to avoid cross-origin iframe storage restrictions
try {
  setPersistence(auth, inMemoryPersistence).catch(() => {
    // Gracefully handle if browser restricts persistence configuration
  });
} catch {
  // Ignore
}

const provider = new GoogleAuthProvider();
// Google Docs and Google Drive scopes
provider.addScope('https://www.googleapis.com/auth/documents.readonly');
provider.addScope('https://www.googleapis.com/auth/documents');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.setCustomParameters({
  prompt: 'select_account',
});

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

declare global {
  interface Window {
    google?: any;
  }
}

let isSigningIn = false;
// Token must strictly remain cached in-memory per security guidelines
let cachedAccessToken: string | null = null;
let cachedAppUser: AppUser | null = null;

export const initAuth = (
  onAuthSuccess?: (user: AppUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const appUser: AppUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };
      cachedAppUser = appUser;
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(appUser, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else if (!cachedAppUser) {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Google Identity Services (GIS) direct token client
 * Used as a zero-cookie, iframe-resilient authentication mechanism when
 * Firebase Auth encounters network/storage blocks (e.g. auth/network-request-failed).
 */
export const signInWithGoogleIdentityServices = (): Promise<{
  user: AppUser;
  accessToken: string;
}> => {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      return reject(
        new Error(
          'Google Identity Services is initializing. Please wait a moment and try again.'
        )
      );
    }

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: firebaseConfig.oAuthClientId,
        scope:
          'https://www.googleapis.com/auth/documents.readonly https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: async (resp: any) => {
          if (resp.error) {
            return reject(
              new Error(resp.error_description || `Google Sign-in failed: ${resp.error}`)
            );
          }
          if (!resp.access_token) {
            return reject(new Error('No access token returned from Google authorization.'));
          }

          const accessToken = resp.access_token;
          cachedAccessToken = accessToken;

          // Fetch user profile info with the token
          let appUser: AppUser = {
            uid: 'google-user',
            email: 'drboots@galactichq.org',
            displayName: 'Authorized User',
            photoURL: null,
          };

          try {
            const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (userRes.ok) {
              const uData = await userRes.json();
              appUser = {
                uid: uData.sub || 'google-user',
                email: uData.email || 'drboots@galactichq.org',
                displayName: uData.name || uData.email || 'Google User',
                photoURL: uData.picture || null,
              };
            }
          } catch (e) {
            console.warn('Could not fetch user profile details:', e);
          }

          cachedAppUser = appUser;
          resolve({ user: appUser, accessToken });
        },
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err: any) {
      reject(err);
    }
  });
};

export const googleSignIn = async (): Promise<{ user: AppUser; accessToken: string } | null> => {
  try {
    isSigningIn = true;

    // Strategy 1: Attempt standard Firebase Auth signInWithPopup
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        const appUser: AppUser = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        };
        cachedAppUser = appUser;
        return { user: appUser, accessToken: cachedAccessToken };
      }
    } catch (fbErr: any) {
      console.warn(
        'Firebase popup encountered an issue (e.g. auth/network-request-failed). Falling back to direct Google Identity Services...',
        fbErr
      );
      // If Firebase Auth failed due to network-request-failed or iframe restriction,
      // fallback to Google Identity Services token flow
      if (
        fbErr?.code === 'auth/network-request-failed' ||
        fbErr?.code === 'auth/internal-error' ||
        fbErr?.code === 'auth/popup-blocked' ||
        window.google?.accounts?.oauth2
      ) {
        return await signInWithGoogleIdentityServices();
      }
      throw fbErr;
    }

    // If result was missing token, try GIS
    return await signInWithGoogleIdentityServices();
  } catch (error: any) {
    console.error('Sign in error:', error);
    // If GIS is available as final fallback
    if (window.google?.accounts?.oauth2 && error?.code === 'auth/network-request-failed') {
      try {
        return await signInWithGoogleIdentityServices();
      } catch (gisErr) {
        throw gisErr;
      }
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setCachedTokenDirectly = (token: string | null) => {
  cachedAccessToken = token;
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch {
    // Ignore
  }
  cachedAccessToken = null;
  cachedAppUser = null;
};
