// hooks/auth/useLogin.ts
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { auth } from '@/scripts/firebase';
import { useGoogleLogin } from '@/scripts/googleAuth';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { saveSession } from '@/scripts/secureSession';
import {
  ensureUserProfile,
  normalizeEmail,
  resolveEmailFromUsername,
} from '@/services/auth/userProfileService';
import type { Role } from '@/types/auth/user';

type Opts = { router: ReturnType<typeof useRouter> };

export function useLogin({ router }: Opts) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Google OAuth (already configured externally)
  const { promptAsync, response } = useGoogleLogin();

  // ==== Handle Google response ====
  useEffect(() => {
    (async () => {
      if (response?.type !== 'success') return;
      setLoading(true);
      try {
        const idToken = response.authentication?.idToken;
        if (!idToken) throw new Error('Missing idToken');
        const credential = GoogleAuthProvider.credential(idToken);

        const result = await signInWithCredential(auth, credential);
        const user = result.user;

        const profile = await ensureUserProfile(user.uid, user.email ?? null, {
          name: user.displayName ?? '',
        });

        const role: Role = (profile.role as Role) || 'user';
        const level = profile.level ?? null;
        const startMode = profile.startMode ?? null;

        await saveSession({ uid: user.uid, email: user.email ?? null, role });

        Alert.alert('Success', 'Signed in with Google successfully!');
        navigateByRole(role, startMode, level, router);
      } catch (err: any) {
        console.error('Google login error:', err?.code ?? err?.message ?? err);
        Alert.alert('Error', 'Cannot sign in with Google.');
      } finally {
        setLoading(false);
      }
    })();
  }, [response, router]);

  // ==== Email/Username + Password ====
  const handleLogin = async () => {
    const idTrim = identifier.trim();
    const pw = password.trim();

    if (!idTrim || !pw) {
      Alert.alert('Error', 'Please enter both email/username and password.');
      return;
    }

    setLoading(true);
    try {
      const loginEmail = idTrim.includes('@')
        ? normalizeEmail(idTrim)
        : await resolveEmailFromUsername(idTrim); // will throw an error with .code if it fails

      const cred = await signInWithEmailAndPassword(auth, loginEmail, pw);
      const user = cred.user;

      const profile = await ensureUserProfile(user.uid, user.email ?? loginEmail);
      const role: Role = (profile.role as Role) || 'user';
      const level = profile.level ?? null;
      const startMode = profile.startMode ?? null;

      await saveSession({ uid: user.uid, email: user.email ?? loginEmail, role });

      Alert.alert(
        'Success',
        `Congratulations ${role === 'admin' ? 'Administrator' : 'user'}!`
      );
      navigateByRole(role, startMode, level, router);
    } catch (error: any) {
      const code = error?.code ?? null;
      const msg = error?.message ?? '';

      console.log('Firebase login error:', code, msg);

      let message = 'Login failed.';
      switch (code) {
        // Firebase codes
        case 'auth/invalid-email':
          message = 'Invalid email.';
          break;
        case 'auth/user-not-found':
          message = 'Account not found.';
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          message = 'Incorrect password.';
          break;
        case 'auth/too-many-requests':
          message = 'Too many attempts. Please try again later.';
          break;
        case 'auth/user-disabled':
          message = 'This account has been disabled.';
          break;
        case 'auth/network-request-failed':
          message = 'Network error. Please check your connection.';
          break;

        // App-defined codes (from resolveEmailFromUsername)
        case 'USERNAME_NOT_FOUND':
          message = 'Username does not exist or usernameLower is not set.';
          break;
        case 'USERNAME_HAS_NO_EMAIL':
          message = 'This account has no email bound to the username.';
          break;

        default:
          // fallback using message (in case code is missing)
          if (msg === 'USERNAME_NOT_FOUND') {
            message = 'Username does not exist or usernameLower is not set.';
          } else if (msg === 'USERNAME_HAS_NO_EMAIL') {
            message = 'This account has no email bound to the username.';
          }
      }
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePress = () => {
    if (!loading) promptAsync();
  };

  const handleForgotPassword = () => {
    const email = identifier.includes('@') ? identifier.trim() : undefined;
    if (email) {
      router.push({ pathname: '/ForgotPassword', params: { email } });
    } else {
      router.push('/ForgotPassword');
    }
  };

  return {
    identifier,
    setIdentifier,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    handleLogin,
    handleGooglePress,
    handleForgotPassword,
  };
}

/* ===== navigation helper ===== */
function navigateByRole(
  role: Role,
  startMode: string | null,
  level: number | null,
  router: ReturnType<typeof useRouter>
) {
  if (role === 'admin') router.replace('/(admin)/home');
  else if (role === 'premium') router.replace('/'); // premium user → home (up to you)
  else {
    if (startMode || level !== null) router.replace('/(tabs)');
    else router.replace('/(onboarding)/SelectLevel');
  }
}
