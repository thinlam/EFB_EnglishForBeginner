/**
 * Dự án: EFB - English For Beginners
 * \* Mục đích: Xây dựng ứng dụng học tiếng Anh cơ bản.
 * người dùng: Người mới bắt đầu học tiếng Anh.
 * Chức năng: Đăng nhập, đăng ký, học từ vựng, ngữ pháp, luyện nghe nói.
 * Công nghệ: React Native, Expo, Firebase.
 * \* Tác giả: [NHÓM EFB]
 * Ngày tạo: 01/06/2025
 */



/**
 * LoginScreen.tsx
 * -------------------------------------------------------------------
 * - Đăng nhập email/username + password, Google OAuth.
 * - Lưu phiên bằng SecureStore (an toàn hơn AsyncStorage).
 * - Có chú thích gọn để dễ bảo trì.
 * -------------------------------------------------------------------
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
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';

import { saveSession } from '@/scripts/secureSession';

// Kiểu dữ liệu user trong Firestore (tham khảo)
type UserDoc = {
  name?: string | null;
  usernameLower?: string | null;
  email?: string | null;
  number?: string | null;
  role?: 'admin' | 'premium' | 'user' | string;
  level?: number | null;
  startMode?: string | null;
  createdAt?: any;
};

export default function LoginScreen() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState(''); // email hoặc username
  const [password, setPassword] = useState('');     // mật khẩu raw (Firebase tự băm phía server)
  const [showPassword, setShowPassword] = useState(false);

  // Google OAuth
  const { promptAsync, response } = useGoogleLogin();

  // XỬ LÝ GOOGLE OAUTH
  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (response?.type !== 'success') return;

      try {
        const idToken = response.authentication?.idToken;
        if (!idToken) throw new Error('Missing idToken');
        const credential = GoogleAuthProvider.credential(idToken);

        const result = await signInWithCredential(auth, credential);
        const user = result.user;

        // users/{uid}
        const userRef = doc(db, 'users', user.uid);
        let snap = await getDoc(userRef);

        if (!snap.exists()) {
          await setDoc(userRef, {
            name: user.displayName ?? '',
            email: user.email ?? '',
            number: '',
            role: 'user',
            level: null,
            startMode: null,
            createdAt: new Date(),
          } as UserDoc);
          snap = await getDoc(userRef);
        }

        const data = (snap.data() || {}) as UserDoc;
        const role = (data.role as UserDoc['role']) || 'user';
        const level = data.level ?? null;
        const startMode = data.startMode ?? null;

        // LƯU PHIÊN BẰNG SECURESTORE
        await saveSession({ uid: user.uid, email: user.email ?? null, role });

        Alert.alert('Thành công', 'Đăng nhập bằng Google thành công!');

        // ĐIỀU HƯỚNG
        if (role === 'admin') {
          router.replace('/(admin)/home');
        } else if (role === 'premium') {
          router.replace('/premium-home');
        } else {
          if (startMode || level !== null) {
            router.replace('(tabs)');
          } else {
            router.replace('/(onboarding)/SelectLevel');
          }
        }
      } catch (err) {
        console.error('Google login error:', err);
        Alert.alert('Lỗi', 'Không thể đăng nhập bằng Google.');
      }
    };

    handleGoogleResponse();
  }, [response, router]);

  // ĐĂNG NHẬP EMAIL/USERNAME + PASSWORD
  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email hoặc tên đăng nhập và mật khẩu.');
      return;
    }

    let loginEmail = identifier;

    // Nếu là username (không có @) -> tra email
    if (!identifier.includes('@')) {
      try {
        // ƯU TIÊN: usernameLower (unique, lowercase)
        const u = identifier.toLowerCase();
        let q = query(collection(db, 'users'), where('usernameLower', '==', u));
        let rs = await getDocs(q);

        // Fallback sang field 'name' nếu chưa có usernameLower
        if (rs.empty) {
          q = query(collection(db, 'users'), where('name', '==', u));
          rs = await getDocs(q);
        }

        if (rs.empty) {
          Alert.alert('Lỗi', 'Không tìm thấy tài khoản với username này.');
          return;
        }

        const data = rs.docs[0].data() as UserDoc;
        if (!data.email) {
          Alert.alert('Lỗi', 'Tài khoản thiếu email.');
          return;
        }
        loginEmail = data.email;
      } catch (e) {
        console.error('Username lookup error:', e);
        Alert.alert('Lỗi', 'Không thể truy vấn tài khoản.');
        return;
      }
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, loginEmail, password);
      const user = cred.user;

      const snap = await getDoc(doc(db, 'users', user.uid));
      if (!snap.exists()) {
        Alert.alert('Lỗi', 'Không tìm thấy dữ liệu người dùng.');
        return;
      }

      const data = (snap.data() || {}) as UserDoc;
      const role = (data.role as UserDoc['role']) || 'user';
      const level = data.level ?? null;
      const startMode = data.startMode ?? null;

      // LƯU PHIÊN BẰNG SECURESTORE
      await saveSession({ uid: user.uid, email: user.email ?? null, role });

      Alert.alert('Thành công', `Chào mừng ${role === 'admin' ? 'quản trị viên' : 'bạn'}!`);

      if (role === 'admin') {
        router.replace('/(admin)/home');
      } else if (role === 'premium') {
        router.replace('/premium-home');
      } else {
        if (startMode || level !== null) {
          router.replace('(tabs)');
        } else {
          router.replace('/(onboarding)/SelectLevel');
        }
      }
    } catch (error: any) {
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
      }
      console.log('Firebase login error:', error);
      Alert.alert('Lỗi', message);
    }
  };

  // QUÊN MẬT KHẨU (yêu cầu nhập email)
  const handleForgotPassword = async () => {
    if (!identifier.includes('@')) {
      Alert.alert('Lỗi', 'Vui lòng nhập email để đặt lại mật khẩu.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, identifier);
      Alert.alert('Đã gửi', 'Email đặt lại mật khẩu đã được gửi.');
    } catch (e) {
      console.error('Password reset error:', e);
      Alert.alert('Lỗi', 'Không thể gửi email đặt lại mật khẩu.');
    }
  };

  // UI
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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign in</Text>
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
        style={[styles.socialButton, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc' }]}
        onPress={() => promptAsync()}
      >
        <FontAwesome5 name="google" size={20} color="#DB4437" style={styles.socialIcon} />
        <Text style={[styles.socialText, { color: '#444' }]}>Google Sign in</Text>
      </TouchableOpacity>

      {/* Placeholder FB */}
      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#1877F2' }]}>
        <FontAwesome5 name="facebook-f" size={20} color="#fff" style={styles.socialIcon} />
        <Text style={styles.socialText}>Facebook Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * GỢI Ý DEBUG & BEST PRACTICES:
 * - Nếu login Google báo lỗi:
 *   • Kiểm tra SHA-1/SHA-256 (Android), URL scheme (iOS), Authorized domains (Web).
 *   • Kiểm tra response từ useGoogleLogin có 'success' hay không.
 * - Nếu tra username không ra email:
 *   • Xác nhận DB lưu 'name' lowercase hay không.
 *   • Khuyến nghị thêm field 'usernameLower' và query theo field này.
 * - Nếu signInWithEmailAndPassword báo 'auth/user-not-found':
 *   • Kiểm tra user đã đăng ký đúng email.
 * - Nếu 'Không tìm thấy dữ liệu người dùng' sau khi auth thành công:
 *   • Có thể do bạn chưa tạo document Firestore tương ứng UID, hãy tạo hồ sơ khi đăng ký.
 * - Đảm bảo đồng bộ role/level/startMode trong Firestore để luồng điều hướng hoạt động đúng.
 */
