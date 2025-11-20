// hooks/auth/useLogin.ts
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';

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

        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Đăng nhập thành công',
          text2: 'Bạn đã đăng nhập bằng Google.',
          visibilityTime: 8000,
          autoHide: true,
          topOffset: 60, // khoảng cách từ mép trên (status bar)
        });

        navigateByRole(role, startMode, level, router);
      } catch (err: any) {
        console.error('Google login error:', err?.code ?? err?.message ?? err);

        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Không thể đăng nhập bằng Google',
          text2: 'Vui lòng thử lại sau.',
          visibilityTime: 8000,
          autoHide: true,
          topOffset: 60,
        });
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
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Thiếu thông tin',
        text2: 'Vui lòng nhập email/tên đăng nhập và mật khẩu.',
        visibilityTime: 8000,
        autoHide: true,
        topOffset: 60,
      });
      return;
    }

    setLoading(true);
    try {
      const loginEmail = idTrim.includes('@')
        ? normalizeEmail(idTrim)
        : await resolveEmailFromUsername(idTrim);

      const cred = await signInWithEmailAndPassword(auth, loginEmail, pw);
      const user = cred.user;

      const profile = await ensureUserProfile(user.uid, user.email ?? loginEmail);
      const role: Role = (profile.role as Role) || 'user';
      const level = profile.level ?? null;
      const startMode = profile.startMode ?? null;

      await saveSession({ uid: user.uid, email: user.email ?? loginEmail, role });

      Toast.show({
        type: 'success',
        position: 'top',
        text1: 'Đăng nhập thành công',
        text2:
          role === 'admin'
            ? 'Chào mừng Quản trị viên quay lại.'
            : 'Chào mừng bạn quay lại EFB.',
        visibilityTime: 8000,
        autoHide: true,
        topOffset: 60,
      });

      navigateByRole(role, startMode, level, router);
    } catch (error: any) {
      const code = error?.code ?? null;
      const msg = error?.message ?? '';

      console.log('Firebase login error:', code, msg);

      let message = 'Đăng nhập thất bại. Vui lòng thử lại.';

      switch (code) {
        case 'auth/invalid-email':
          message = 'Email không hợp lệ.';
          break;
        case 'auth/user-not-found':
          message = 'Tài khoản không tồn tại.';
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          message = 'Mật khẩu không đúng.';
          break;
        case 'auth/too-many-requests':
          message = 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.';
          break;
        case 'auth/user-disabled':
          message = 'Tài khoản của bạn đã bị vô hiệu hóa.';
          break;
        case 'auth/network-request-failed':
          message = 'Lỗi mạng. Kiểm tra kết nối Internet của bạn.';
          break;
        case 'USERNAME_NOT_FOUND':
          message = 'Tên đăng nhập không tồn tại. Vui lòng kiểm tra lại.';
          break;
        case 'USERNAME_HAS_NO_EMAIL':
          message = 'Tài khoản này chưa liên kết email.';
          break;
        default:
          if (msg === 'USERNAME_NOT_FOUND') {
            message = 'Tên đăng nhập không tồn tại. Vui lòng kiểm tra lại.';
          } else if (msg === 'USERNAME_HAS_NO_EMAIL') {
            message = 'Tài khoản này chưa liên kết email.';
          }
      }

      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Đăng nhập thất bại',
        text2: message,
        visibilityTime: 8000,
        autoHide: true,
        topOffset: 60,
      });
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
  else if (role === 'premium') router.replace('/');
  else {
    if (startMode || level !== null) router.replace('/(tabs)');
    else router.replace('/(onboarding)/SelectLevel');
  }
}
