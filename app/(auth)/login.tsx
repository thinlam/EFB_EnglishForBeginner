/**
 * Dự án: EFB - English For Beginners
 * LoginScreen.tsx (FULL)
 * - Đăng nhập email/username + password, Google OAuth
 * - Tự động "migrate" hồ sơ Firestore về đúng UID nếu doc bị lệch
 * - Chuẩn hoá input + thông báo lỗi rõ ràng
 */

import { styles } from '@/components/style/auth/LoginStyles';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { auth, db } from '@/scripts/firebase';
import { useGoogleLogin } from '@/scripts/googleAuth';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  where,
} from 'firebase/firestore';

import { saveSession } from '@/scripts/secureSession';

/* -------------------- Types -------------------- */
type Role = 'admin' | 'premium' | 'user' | string;

type UserDoc = {
  name?: string | null;
  usernameLower?: string | null;
  email?: string | null;
  number?: string | null;
  role?: Role;
  level?: number | null;
  startMode?: string | null;
  createdAt?: any;
};

/* ----------------- Helper functions ----------------- */

/** Chuẩn hoá email: trim + lowercase */
const normalizeEmail = (s: string) => s.trim().toLowerCase();

/**
 * Di trú/khởi tạo hồ sơ users/{uid}
 * - Nếu users/{uid} chưa có: tìm doc lạc theo email → migrate về {uid}
 * - Nếu không có doc nào: tạo mới khung hồ sơ
 * Trả về dữ liệu hồ sơ sau khi đảm bảo tồn tại.
 */
async function ensureUserProfile(uid: string, email: string | null, extra?: Partial<UserDoc>) {
  const uidRef = doc(db, 'users', uid);
  let snap = await getDoc(uidRef);

  if (!snap.exists()) {
    const emailNorm = email ? normalizeEmail(email) : '';

    // Tìm doc lạc UID theo email
    let migratedData: UserDoc | null = null;
    if (emailNorm) {
      const q = query(collection(db, 'users'), where('email', '==', emailNorm));
      const rs = await getDocs(q);
      if (!rs.empty) {
        const wrong = rs.docs[0];
        const data = wrong.data() as UserDoc;

        await runTransaction(db, async (tx) => {
          tx.set(uidRef, { ...data, ...extra }, { merge: true });
          tx.delete(doc(db, 'users', wrong.id)); // optional: xoá doc cũ để tránh nhầm
        });

        snap = await getDoc(uidRef);
        migratedData = snap.data() as UserDoc;
      }
    }

    if (!migratedData) {
      // Tạo mới
      const base: UserDoc = {
        name: '',
        email: emailNorm,
        number: '',
        role: 'user',
        level: null,
        startMode: null,
        createdAt: new Date(),
        ...extra,
      };
      await setDoc(uidRef, base, { merge: true });
      snap = await getDoc(uidRef);
    }
  }

  return (snap.data() || {}) as UserDoc;
}

/** Tra usernameLower → email. Yêu cầu field usernameLower đã chuẩn hoá lowercase & unique */
async function resolveEmailFromUsername(username: string) {
  const u = username.trim().toLowerCase();

  let q = query(collection(db, 'users'), where('usernameLower', '==', u));
  let rs = await getDocs(q);

  if (rs.empty) {
    // Không fallback sang "name" (vì name có dấu/chữ hoa sẽ không match)
    throw new Error('USERNAME_NOT_FOUND');
  }

  const data = rs.docs[0].data() as UserDoc;
  if (!data.email) throw new Error('USERNAME_HAS_NO_EMAIL');

  return normalizeEmail(data.email);
}

/* -------------------- Component -------------------- */

export default function LoginScreen() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState(''); // email hoặc username
  const [password, setPassword] = useState('');     // mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Google OAuth
  const { promptAsync, response } = useGoogleLogin();

  /* --------- Handle Google Login Response --------- */
  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (response?.type !== 'success') return;
      setLoading(true);
      try {
        const idToken = response.authentication?.idToken;
        if (!idToken) throw new Error('Missing idToken');
        const credential = GoogleAuthProvider.credential(idToken);

        const result = await signInWithCredential(auth, credential);
        const user = result.user;

        // Đảm bảo hồ sơ users/{uid} tồn tại & đúng UID
        const profile = await ensureUserProfile(user.uid, user.email ?? null, {
          name: user.displayName ?? '',
        });

        const role = (profile.role as Role) || 'user';
        const level = profile.level ?? null;
        const startMode = profile.startMode ?? null;

        // Lưu phiên
        await saveSession({ uid: user.uid, email: user.email ?? null, role });

        Alert.alert('Thành công', 'Đăng nhập bằng Google thành công!');
        // Điều hướng
        navigateByRole(role, startMode, level, router);
      } catch (err) {
        console.error('Google login error:', err);
        Alert.alert('Lỗi', 'Không thể đăng nhập bằng Google.');
      } finally {
        setLoading(false);
      }
    };

    handleGoogleResponse();
  }, [response]);

  /* ----------------- Email/Username + Password ----------------- */
  const handleLogin = async () => {
    const identifierTrimmed = identifier.trim();
    const passwordTrimmed = password.trim();

    if (!identifierTrimmed || !passwordTrimmed) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email/username và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      // 1) Xác định loginEmail: nếu nhập username → tra email; nếu có @ → dùng trực tiếp
      let loginEmail: string;
      if (identifierTrimmed.includes('@')) {
        loginEmail = normalizeEmail(identifierTrimmed);
      } else {
        loginEmail = await resolveEmailFromUsername(identifierTrimmed);
      }

      // 2) Auth: email/password
      const cred = await signInWithEmailAndPassword(auth, loginEmail, passwordTrimmed);
      const user = cred.user;

      // 3) Đảm bảo có hồ sơ users/{uid}, migrate nếu cần
      const profile = await ensureUserProfile(user.uid, user.email ?? loginEmail);

      const role = (profile.role as Role) || 'user';
      const level = profile.level ?? null;
      const startMode = profile.startMode ?? null;

      // 4) Lưu phiên
      await saveSession({ uid: user.uid, email: user.email ?? loginEmail, role });

      Alert.alert('Thành công', `Chào mừng ${role === 'admin' ? 'quản trị viên' : 'bạn'}!`);
      // 5) Điều hướng
      navigateByRole(role, startMode, level, router);
    } catch (error: any) {
      console.log('Firebase login error:', error?.code, error?.message);
      let message = 'Đăng nhập thất bại.';
      switch (error?.code) {
        case 'auth/invalid-email':
          message = 'Email không hợp lệ.'; break;
        case 'auth/user-not-found':
          message = 'Tài khoản không tồn tại.'; break;
        case 'auth/wrong-password':
          message = 'Sai mật khẩu.'; break;
        case 'auth/too-many-requests':
          message = 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.'; break;
        case 'auth/user-disabled':
          message = 'Tài khoản đã bị vô hiệu hoá.'; break;
        default:
          // Lỗi từ resolveEmailFromUsername
          if (error?.message === 'USERNAME_NOT_FOUND') {
            message = 'Username không tồn tại hoặc chưa thiết lập usernameLower.'; break;
          }
          if (error?.message === 'USERNAME_HAS_NO_EMAIL') {
            message = 'Tài khoản này chưa có email gắn với username.'; break;
          }
      }
      Alert.alert('Lỗi', message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    const email = identifier.includes('@') ? encodeURIComponent(identifier.trim()) : '';
    router.push(`/ForgotPassword${email ? `?email=${email}` : ''}`);
  };

  /* ----------------- Render ----------------- */
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/Welcome')}>
        <Text style={styles.backText}>⬅ Quay lại</Text>
      </TouchableOpacity>

      <Text style={styles.title}>WELCOME{"\n"}EFB</Text>

      <Text style={styles.label}>EMAIL HOẶC USERNAME</Text>
      <TextInput
        placeholder="your@gmail.com hoặc username"
        style={styles.input}
        value={identifier}
        onChangeText={setIdentifier}
        placeholderTextColor={'#888'}
        autoCapitalize="none"
      />

      <Text style={styles.label}>PASSWORD</Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          placeholder="••••••••••••••••••"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor={'#888'}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={{ position: 'absolute', right: 12, top: 12 }}
        >
          <FontAwesome5
            name={showPassword ? 'eye' : 'eye-slash'}
            size={18}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={[styles.switch, { textAlign: 'right', marginTop: -10 }]}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { opacity: loading ? 0.6 : 1 }]} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Đang xử lý...' : 'Sign in'}</Text>
      </TouchableOpacity>

      <Text style={styles.switch} onPress={() => router.push('/register')}>
        chưa có tài khoản? Đăng ký ngay
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
        <Text style={{ marginHorizontal: 10, color: '#999' }}>hoặc</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
      </View>

      <TouchableOpacity
        style={[styles.socialButton, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', opacity: loading ? 0.6 : 1 }]}
        onPress={() => !loading && promptAsync()}
        disabled={loading}
      >
        <FontAwesome5 name="google" size={20} color="#DB4437" style={styles.socialIcon} />
        <Text style={[styles.socialText, { color: '#444' }]}>Google Sign in</Text>
      </TouchableOpacity>

      {/* Placeholder FB */}
      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#1877F2', opacity: 0.6 }]} disabled>
        <FontAwesome5 name="facebook-f" size={20} color="#fff" style={styles.socialIcon} />
        <Text style={styles.socialText}>Facebook Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ----------------- navigation helper ----------------- */
function navigateByRole(role: Role, startMode: string | null, level: number | null, router: ReturnType<typeof useRouter>) {
  if (role === 'admin') {
    router.replace('/(admin)/home');
  } else if (role === 'premium') {
    router.replace('/premium-home');
  } else {
    if (startMode || level !== null) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(onboarding)/TestIntroScreen'); // <-- chuyển sang kiểm tra trình độ
    }
  }
}
