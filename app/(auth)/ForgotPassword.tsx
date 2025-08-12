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
 * ForgotPasswordScreen.tsx
 * -------------------------------------------------------------------
 * Màn hình: Gửi OTP về email và xác thực OTP trước khi cho người dùng
 * vào màn hình đặt lại mật khẩu (/reset-password).
 *
 * MỤC TIÊU: CHÚ THÍCH RẤT CHI TIẾT, để coder mới vào là hiểu ngay flow,
 * biết chỗ nào dễ lỗi, chỗ nào cần đổi khi lên production.
 *
 * 🔐 CẢNH BÁO BẢO MẬT (PRODUCTION MUST-DO):
 * - DEMO dưới đây có biến `serverOtp` giữ OTP do server trả về => KHÔNG AN TOÀN.
 * - Triển khai thật: server KHÔNG trả OTP về client.
 *   ✔ Server nên trả về `transactionId` (hoặc session token/ticket).
 *   ✔ Client lưu `transactionId` (KHÔNG lưu OTP).
 *   ✔ Khi user nhập OTP -> gọi API /verify-otp { email, transactionId, otp }.
 *   ✔ Server kiểm tra và trả { success: true } nếu đúng, KHÔNG gửi OTP thật ra ngoài.
 *
 * 🧪 KIỂM THỬ:
 * - Test email hợp lệ/không hợp lệ.
 * - Test gửi OTP thành công/thất bại (server down, timeout, 4xx/5xx).
 * - Test nhập OTP đúng/sai/hết hạn.
 * - Test ấn liên tục khi loading (double-tap).
 * - Test resend OTP (cooldown).
 *
 * ♿️ ACCESSIBILITY:
 * - Thêm các thuộc tính như accessibilityLabel cho buttons nếu cần.
 *
 * ⚙️ TUỲ CHỈNH NHANH:
 * - OTP_LENGTH: số ký tự OTP (phổ biến 6).
 * - COOLDOWN_SECONDS: thời gian khoá nút "Gửi lại OTP".
 * - API_BASE/ENDPOINTS: cấu hình endpoint. Đưa vào .env nếu có.
 * -------------------------------------------------------------------
 */

import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// =====================
// 1) HẰNG SỐ CẤU HÌNH
// =====================

// ĐỘ DÀI OTP (tuỳ server phát sinh mấy chữ số)
const OTP_LENGTH = 6;

// THỜI GIAN ĐẾM NGƯỢC CHO "GỬI LẠI OTP" (giây)
const COOLDOWN_SECONDS = 60;

// ⚠️ ĐƯA VÀO .env KHI LÊN PROD (ví dụ EXPO_PUBLIC_API_BASE)
// Ở đây để cứng cho dễ chạy demo.
const API_BASE = 'https://otp-server-production-6c26.up.railway.app';
const ENDPOINTS = {
  SEND_OTP: `${API_BASE}/send-otp`,
  // VERIFY_OTP: `${API_BASE}/verify-otp`, // 👉 PROD: bật endpoint này và dùng transactionId
};

// Regex email cơ bản (tốt hơn includes('@'))
const isEmail = (s: string) => /\S+@\S+\.\S+/.test(s);

// Timeout cho fetch (RN không có sẵn) — tránh chờ vô hạn nếu server treo
async function fetchWithTimeout(resource: RequestInfo, options: RequestInit = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(resource, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export default function ForgotPasswordScreen() {
  // =====================
  // 2) STATE QUẢN LÝ FORM
  // =====================

  const [email, setEmail] = useState('');      // Email người dùng
  const [otp, setOtp] = useState('');          // OTP user nhập
  const [sentOtp, setSentOtp] = useState(false); // Đã gửi OTP thành công hay chưa (để hiện input OTP)
  const [loading, setLoading] = useState(false); // Loading chung (disable nút bấm)

  // ⚠️ DEMO ONLY: Server trả OTP về -> lưu vào client (KHÔNG làm khi lên PROD)
  const [serverOtp, setServerOtp] = useState('');

  // (PROD) Nếu server trả transactionId, lưu nó ở đây:
  // const [transactionId, setTransactionId] = useState<string | null>(null);

  // Resend cooldown
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();

  // Title có emoji cho thân thiện
  const titleText = useMemo(() => '🔐 Nhập Gmail để nhận mã OTP', []);

  // Cleanup interval khi unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  // Bắt đầu đếm ngược sau khi gửi OTP thành công
  const startCooldown = () => {
    setCooldown(COOLDOWN_SECONDS);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // =====================
  // 3) GỬI OTP TỚI EMAIL
  // =====================
  const sendOtp = async () => {
    // 3.1 Validate email
    if (!isEmail(email)) {
      Alert.alert('Lỗi', 'Vui lòng nhập email hợp lệ.');
      return;
    }

    // 3.2 Chặn spam khi đang loading hoặc trong thời gian cooldown
    if (loading || cooldown > 0) return;

    try {
      setLoading(true);

      // 3.3 Gọi API gửi OTP (POST JSON)
      const res = await fetchWithTimeout(
        ENDPOINTS.SEND_OTP,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Tuỳ server có thể cần thêm headers khác (Authorization, v.v.)
          body: JSON.stringify({ email }),
        },
        15000 // timeout 15s
      );

      // 3.4 Parse JSON và phân nhánh
      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.success) {
        setSentOtp(true);

        // ⚠️ DEMO ONLY: KHÔNG làm thế này trên production!
        // Server trả về `data.otp` => lưu vào state để so sánh ở client.
        // PROD: server chỉ trả `transactionId`, KHÔNG trả OTP.
        setServerOtp(data.otp ?? '');

        // (PROD) Ví dụ:
        // setTransactionId(data.transactionId);

        // 3.5 Bắt đầu cooldown resend
        startCooldown();

        Alert.alert('Thành công', 'OTP đã được gửi đến Gmail của bạn.');
      } else {
        // 3.6 Thất bại từ server: hiển thị message cụ thể nếu có
        const msg =
          data?.message ||
          (res.status === 429
            ? 'Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút.'
            : 'Không gửi được OTP, vui lòng thử lại.');
        Alert.alert('Lỗi', msg);
      }
    } catch (err: any) {
      // 3.7 Lỗi mạng, CORS, timeout, server treo...
      const aborted = err?.name === 'AbortError';
      console.error('Lỗi gửi OTP:', err);
      Alert.alert('Lỗi', aborted ? 'Hết thời gian chờ, vui lòng thử lại.' : 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // 4) XÁC THỰC OTP
  // =====================
  const verifyOtp = async () => {
    // 4.1 Chưa gửi OTP -> nhắc user gửi trước
    if (!sentOtp) {
      Alert.alert('Lỗi', 'Vui lòng gửi mã OTP trước.');
      return;
    }

    // 4.2 Validate độ dài OTP
    if (!otp || otp.length < OTP_LENGTH) {
      Alert.alert('Lỗi', `Vui lòng nhập đủ ${OTP_LENGTH} ký tự OTP.`);
      return;
    }

    // 4.3 DEMO: so sánh trực tiếp ở client (KHÔNG dùng khi lên PROD)
    if (otp === serverOtp) {
      // 4.4 Điều hướng sang màn reset password kèm email
      router.push({ pathname: '/reset-password', params: { email } });
      return;
    } else {
      Alert.alert('Sai mã', 'Mã OTP không đúng.');
      return;
    }

    /**
     * 4.x (PRODUCTION) — DÙNG VERIFY API:
     * if (loading) return;
     * try {
     *   setLoading(true);
     *   const res = await fetchWithTimeout(ENDPOINTS.VERIFY_OTP, {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify({ email, transactionId, otp }),
     *   }, 15000);
     *   const data = await res.json().catch(() => ({}));
     *   if (res.ok && data?.success) {
     *     router.push({ pathname: '/reset-password', params: { email } });
     *   } else {
     *     Alert.alert('Sai mã', data?.message || 'OTP không đúng hoặc đã hết hạn.');
     *   }
     * } catch (err: any) {
     *   const aborted = err?.name === 'AbortError';
     *   Alert.alert('Lỗi', aborted ? 'Hết thời gian chờ, vui lòng thử lại.' : 'Không thể kết nối đến máy chủ.');
     * } finally {
     *   setLoading(false);
     * }
     */
  };

  // =====================
  // 5) UI / RENDER
  // =====================
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} // iOS: đẩy nội dung lên khi bàn phím mở
      style={{
        flex: 1,
        backgroundColor: '#f8f9ff',
        padding: 24,
      }}
    >
      {/* Phần form đặt giữa màn hình */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {/* Tiêu đề */}
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>
          {titleText}
        </Text>

        {/* Ô nhập email */}
        <TextInput
          placeholder="example@gmail.com"
          value={email}
          onChangeText={(t) => setEmail(t.trim())} // Trim bớt khoảng trắng vô tình
          keyboardType="email-address"
          placeholderTextColor={'#888'}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading} // Khoá khi loading để tránh đổi input trong lúc gọi API
          style={{
            backgroundColor: '#fff',
            padding: 14,
            borderRadius: 10,
            fontSize: 16,
            shadowColor: '#ccc',
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 2,
            marginBottom: 12,
          }}
        />
        {/* Gợi ý nhỏ: format email đúng mới gửi được */}
        <Text style={{ color: '#888', marginBottom: 16, fontSize: 13 }}>
          Nhập email đã đăng ký để nhận mã OTP (mã có hiệu lực trong ít phút).
        </Text>

        {/* Khi đã gửi OTP, hiển thị ô nhập OTP */}
        {sentOtp && (
          <>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#444' }}>
              📩 Nhập mã OTP vừa nhận
            </Text>
            <TextInput
              placeholder={`Nhập ${OTP_LENGTH} số OTP`}
              value={otp}
              onChangeText={(t) => setOtp(t.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH))} // chỉ cho số & tối đa OTP_LENGTH
              keyboardType="numeric"
              placeholderTextColor={'#888'}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={OTP_LENGTH}
              editable={!loading}
              style={{
                backgroundColor: '#fff',
                padding: 14,
                borderRadius: 10,
                fontSize: 16,
                letterSpacing: 4, // nhìn như ô code
                shadowColor: '#ccc',
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 2,
                marginBottom: 20,
              }}
            />
          </>
        )}

        {/* Nút CHÍNH: nếu chưa gửi thì là Gửi OTP; đã gửi thì là Xác nhận OTP */}
        <TouchableOpacity
          onPress={sentOtp ? verifyOtp : sendOtp}
          disabled={loading}
          style={{
            backgroundColor: '#6C63FF',
            paddingVertical: 14,
            borderRadius: 10,
            shadowColor: '#6C63FF',
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
            elevation: 4,
            opacity: loading ? 0.7 : 1,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>
            {loading
              ? (sentOtp ? 'ĐANG XÁC NHẬN...' : 'ĐANG GỬI...')
              : (sentOtp ? 'XÁC NHẬN OTP' : 'GỬI MÃ VỀ GMAIL')}
          </Text>
        </TouchableOpacity>

        {/* Nút PHỤ: Gửi lại OTP (hiện khi đã gửi) + cooldown để tránh spam */}
        {sentOtp && (
          <TouchableOpacity
            onPress={sendOtp}
            disabled={loading || cooldown > 0}
            style={{ marginBottom: 16 }}
          >
            <Text style={{ textAlign: 'center', color: (loading || cooldown > 0) ? '#aaa' : '#6C63FF', fontWeight: '600' }}>
              {cooldown > 0 ? `Gửi lại OTP sau ${cooldown}s` : 'Gửi lại OTP'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Link quay về trang đăng nhập */}
        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text style={{ color: '#6C63FF', fontSize: 17, fontWeight: 'bold', textAlign: 'center' }}>
            ⬅ Quay lại trang đăng nhập
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
