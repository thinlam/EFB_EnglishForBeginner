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
 * RegisterScreen.tsx
 * -------------------------------------------------------------------
 * Màn hình đăng ký tài khoản với Email + Password (kèm Name, Phone),
 * có nút Sign up bằng Google (hook useGoogleLogin đã cấu hình ở ngoài).
 * Mục tiêu chú thích: rõ ràng, dễ sửa khi lỗi, nêu rủi ro thực tế.
 *
 * LƯU Ý QUAN TRỌNG CHO CODER:
 * 1) Tính duy nhất của username:
 *    - Ở luồng đăng nhập bạn đang tra theo field 'name' (lowercase).
 *    - Nếu muốn dùng 'name' như username để đăng nhập, HÃY lưu thêm
 *      'usernameLower' = name.toLowerCase() và đảm bảo unique trong DB.
 *    - Nếu 'name' chỉ là display name (không unique), KHÔNG nên dùng để login.
 *
 * 2) Xác thực dữ liệu đầu vào:
 *    - Email: nên chuẩn hoá và regex kiểm tra.
 *    - Password: nên có rule tối thiểu (độ dài, có số/ký tự đặc biệt...).
 *    - Phone: code hiện yêu cầu đúng 10 chữ số. Tùy quốc gia mà rule khác.
 *
 * 3) Tạo hồ sơ Firestore:
 *    - Sau createUserWithEmailAndPassword, tạo document tại 'users/{uid}'.
 *    - Bạn có thể bổ sung các field: level, startMode, role, createdAt...
 *    - Gợi ý: thêm 'usernameLower' nếu dùng username để login ở nơi khác.
 *
 * 4) Điều hướng sau đăng ký:
 *    - Hiện chuyển tới '/(onboarding)/SelectLevel'.
 *    - Có thể thay đổi theo flow (ví dụ: về /login, hoặc vào tabs...).
 *
 * 5) Google Sign up:
 *    - Nút Google đang gọi promptAsync() — hook ở ngoài chịu trách nhiệm.
 *    - Nếu muốn tự động tạo hồ sơ Firestore sau Google Sign up, đảm bảo
 *      luồng đó làm điều này (xem LoginScreen phần Google).
 *
 * 6) Thông báo lỗi:
 *    - Alert hiển thị error.message từ Firebase có thể thô với người dùng.
 *    - Có thể map error.code -> message Việt hoá thân thiện hơn.
 *
 * 7) Bảo mật:
 *    - Không log password, token, thông tin nhạy cảm.
 *    - Trên production, kiểm soát log và bật App Check nếu cần.
 * -------------------------------------------------------------------
 */

import { auth, db } from '@/scripts/firebase';
import { useGoogleLogin } from '@/scripts/googleAuth';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { styles } from '../../components/style/auth/RegisterStyles';

// --------- Helpers đơn giản cho validation/normalize ---------
const normalize = (s: string) => s?.trim();
const isEmail = (s: string) => /\S+@\S+\.\S+/.test(s);
const strongEnough = (s: string) => s.length >= 6; // tối thiểu, tùy policy

export default function RegisterScreen() {
  const router = useRouter();

  // Form state
  const [number, setNumber] = useState('');                // Số điện thoại (10 digits theo rule hiện tại)
  const [name, setName] = useState('');                    // Tên hiển thị hoặc username (tuỳ bạn định nghĩa)
  const [email, setEmail] = useState('');                  // Email đăng ký
  const [password, setPassword] = useState('');            // Mật khẩu
  const [confirmPassword, setConfirmPassword] = useState(''); // Nhập lại mật khẩu

  // Hiển thị/ẩn mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Google OAuth (đăng ký nhanh): luồng thực hiện trong hook
  const { promptAsync } = useGoogleLogin();

  // Có thể memoize rule/hint hiển thị (ví dụ hướng dẫn format)
  const phoneHint = useMemo(() => 'Số điện thoại 10 chữ số (VD: 0912345678)', []);

  /**
   * XỬ LÝ ĐĂNG KÝ EMAIL/PASSWORD
   * - Validate cơ bản: đủ trường, phone 10 số, email hợp lệ, password khớp.
   * - Tạo user trên Firebase Auth -> lấy uid -> setDoc vào Firestore.
   * - Điều hướng vào flow onboarding (chọn level).
   */
  const handleRegister = async () => {
    const n = normalize(name);
    const e = normalize(email);
    const p = password;          // giữ nguyên để không vô tình cắt ký tự
    const cp = confirmPassword;
    const ph = number;

    // Validate rỗng
    if (!e || !p || !n || !ph || !cp) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    // Validate email
    if (!isEmail(e)) {
      Alert.alert('Lỗi', 'Email không hợp lệ.');
      return;
    }

    // Validate phone (10 chữ số)
    if (ph.length !== 10 || !/^\d+$/.test(ph)) {
      Alert.alert('Lỗi', 'Số điện thoại phải gồm đúng 10 chữ số.');
      return;
    }

    // Validate password
    if (!strongEnough(p)) {
      Alert.alert('Lỗi', 'Mật khẩu phải từ 6 ký tự trở lên.');
      return;
    }

    // So khớp confirm
    if (p !== cp) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      // 1) Tạo user auth
      const userCredential = await createUserWithEmailAndPassword(auth, e, p);
      const uid = userCredential.user.uid;

      // 2) Tạo hồ sơ Firestore
      await setDoc(doc(db, 'users', uid), {
        name: n,
        email: e,
        number: ph,
        role: 'user',        // mặc định user; admin/premium gán sau trong admin panel
        level: null,         // chưa chọn level
        startMode: null,     // chưa chọn start mode / chưa qua onboarding
        createdAt: new Date(),
        // usernameLower: n.toLowerCase(), // 👉 Nếu dùng 'name' như username để login, bật dòng này và đảm bảo uniqueness
      });

      // 3) Thông báo + điều hướng
      Alert.alert('Thành công', 'Đăng ký thành công!');
      router.replace('/(onboarding)/SelectLevel');
    } catch (error: any) {
      // Map lỗi thân thiện hơn nếu muốn:
      // - auth/email-already-in-use
      // - auth/invalid-email
      // - auth/weak-password
      let message = 'Đăng ký thất bại!';
      switch (error?.code) {
        case 'auth/email-already-in-use':
          message = 'Email đã được sử dụng.';
          break;
        case 'auth/invalid-email':
          message = 'Email không hợp lệ.';
          break;
        case 'auth/weak-password':
          message = 'Mật khẩu quá yếu (ít nhất 6 ký tự).';
          break;
        default:
          // Giữ fallback để vẫn thấy chi tiết khi debug
          message = error?.message || message;
      }
      Alert.alert('Lỗi', message);
      console.error('[RegisterError]', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        {/* Tiêu đề chính */}
        <Text style={styles.title}>WELCOME{"\n"}EFB</Text>

        {/* Name (display/username) */}
        <Text style={styles.label}>NAME</Text>
        <TextInput
          placeholder="Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholderTextColor={'#888'}
          autoCapitalize="words" // Nếu đây là Display Name, dùng words; nếu là username, nên dùng "none"
        />

        {/* Email */}
        <Text style={styles.label}>EMAIL</Text>
        <TextInput
          placeholder="EnglishForBeginner@gmail.com"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor={'#888'}
          autoCapitalize="none"
        />

        {/* Phone */}
        <Text style={styles.label}>PHONE NUMBER</Text>
        <TextInput
          placeholder="0123456789"
          style={styles.input}
          value={number}
          onChangeText={(text) => setNumber(text.replace(/[^0-9]/g, ''))} // Chỉ giữ số
          keyboardType="phone-pad"
          placeholderTextColor={'#888'}
        />
        <Text style={{ color: '#999', marginBottom: 8 }}>{phoneHint}</Text>

        {/* Password */}
        <Text style={styles.label}>PASSWORD</Text>
        <View style={{ position: 'relative' }}>
          <TextInput
            placeholder="••••••••••••••••••"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor={'#888'}
            autoCapitalize="none"
            textContentType="oneTimeCode" // tránh gợi ý iOS autofill password cũ (tuỳ chọn)
          />
          <TouchableOpacity
            onPress={() => setShowPassword((s) => !s)}
            style={{ position: 'absolute', right: 12, top: 12 }}
          >
            <FontAwesome5
              name={showPassword ? 'eye' : 'eye-slash'}
              size={18}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <Text style={styles.label}>CONFIRM PASSWORD</Text>
        <View style={{ position: 'relative' }}>
          <TextInput
            placeholder="••••••••••••••••••"
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            placeholderTextColor={'#888'}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword((s) => !s)}
            style={{ position: 'absolute', right: 12, top: 12 }}
          >
            <FontAwesome5
              name={showConfirmPassword ? 'eye' : 'eye-slash'}
              size={18}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        {/* Nút Submit */}
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>

        {/* Chuyển qua Login */}
        <Text style={styles.switch} onPress={() => router.push('/login')}>
          đã có tài khoản? Đăng nhập
        </Text>

        {/* Social Sign up */}
        <View style={{ marginTop: 30 }}>
          {/* Google sign up:
              - promptAsync() sẽ mở Google OAuth.
              - HÃY đảm bảo luồng Google ở nơi khác tạo Firestore doc nếu user mới. */}
          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc' }]}
            onPress={() => promptAsync()}
          >
            <FontAwesome5 name="google" size={20} color="#DB4437" style={styles.socialIcon} />
            <Text style={[styles.socialText, { color: '#444' }]}>Google Sign up</Text>
          </TouchableOpacity>

          {/* Facebook sign up (chưa implement):
              - Cần expo-auth-session/providers/facebook hoặc react-native-fbsdk-next
              - Sau khi có accessToken => FacebookAuthProvider.credential(token) => create/sign in */}
          <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#1877F2' }]}>
            <FontAwesome5 name="facebook-f" size={20} color="#fff" style={styles.socialIcon} />
            <Text style={styles.socialText}>Facebook Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
