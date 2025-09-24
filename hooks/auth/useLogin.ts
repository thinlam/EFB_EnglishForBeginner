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

  // Google OAuth (đã config bên ngoài)
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

        Alert.alert('Thành công', 'Đăng nhập bằng Google thành công!');
        navigateByRole(role, startMode, level, router);
      } catch (err: any) {
        console.error('Google login error:', err?.code ?? err?.message ?? err);
        Alert.alert('Lỗi', 'Không thể đăng nhập bằng Google.');
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
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email/username và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const loginEmail = idTrim.includes('@')
        ? normalizeEmail(idTrim)
        : await resolveEmailFromUsername(idTrim); // sẽ ném lỗi có .code nếu fail

      const cred = await signInWithEmailAndPassword(auth, loginEmail, pw);
      const user = cred.user;

      const profile = await ensureUserProfile(user.uid, user.email ?? loginEmail);
      const role: Role = (profile.role as Role) || 'user';
      const level = profile.level ?? null;
      const startMode = profile.startMode ?? null;

      await saveSession({ uid: user.uid, email: user.email ?? loginEmail, role });

      Alert.alert('Thành công', `Chào mừng ${role === 'admin' ? 'quản trị viên' : 'bạn'}!`);
      navigateByRole(role, startMode, level, router);
    } catch (error: any) {
      const code = error?.code ?? null;
      const msg = error?.message ?? '';

      console.log('Firebase login error:', code, msg);

      let message = 'Đăng nhập thất bại.';
      switch (code) {
        // Firebase codes
        case 'auth/invalid-email': message = 'Email không hợp lệ.'; break;
        case 'auth/user-not-found': message = 'Tài khoản không tồn tại.'; break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          message = 'Sai mật khẩu.'; break;
        case 'auth/too-many-requests': message = 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.'; break;
        case 'auth/user-disabled': message = 'Tài khoản đã bị vô hiệu hoá.'; break;
        case 'auth/network-request-failed': message = 'Lỗi mạng. Vui lòng kiểm tra kết nối.'; break;

        // App-defined codes (từ resolveEmailFromUsername)
        case 'USERNAME_NOT_FOUND':
          message = 'Username không tồn tại hoặc chưa thiết lập usernameLower.'; break;
        case 'USERNAME_HAS_NO_EMAIL':
          message = 'Tài khoản này chưa có email gắn với username.'; break;

        default:
          // fallback theo message (phòng khi code không có)
          if (msg === 'USERNAME_NOT_FOUND') message = 'Username không tồn tại hoặc chưa thiết lập usernameLower.';
          else if (msg === 'USERNAME_HAS_NO_EMAIL') message = 'Tài khoản này chưa có email gắn với username.';
      }
      Alert.alert('Lỗi', message);
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePress = () => {
    if (!loading) promptAsync();
  };

  const handleForgotPassword = () => {
    const e = identifier.includes('@') ? encodeURIComponent(identifier.trim()) : '';
    router.push(`/ForgotPassword${e ? `?email=${e}` : ''}`);
  };

  return {
    identifier, setIdentifier,
    password, setPassword,
    showPassword, setShowPassword,
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
  else if (role === 'premium') router.replace('/'); // premium user → home (tuỳ bạn)
  else {
    if (startMode || level !== null) router.replace('/(tabs)');
    else router.replace('/(onboarding)/SelectLevel');
  }
}
