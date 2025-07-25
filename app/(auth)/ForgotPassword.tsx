    import { styles } from '@/components/style/auth/LoginStyles';
import { auth } from '@/scripts/firebase';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import {
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

    export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');

    const handleResetPassword = async () => {
  if (!email.includes('@')) {
    Alert.alert('Lỗi', 'Vui lòng nhập email hợp lệ.');
    return;
  }

  console.log('Email gửi về:', email); // 👈 thêm dòng này để check

  try {
    await sendPasswordResetEmail(auth, email);
    Alert.alert('Thành công', 'Chúng tôi đã gửi link đặt lại mật khẩu vào Gmail của bạn.');
    router.replace('/login');
  } catch (error: any) {
  let message = 'Không thể gửi email đặt lại mật khẩu.';
  if (error.code === 'auth/user-not-found') {
    message = 'Email không tồn tại.';
  } else if (error.code === 'auth/too-many-requests') {
    message = 'Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau vài phút.';
  }

  Alert.alert('Lỗi', message);
  console.log('Password reset error:', error);
}

};


    return (
        <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Quên mật khẩu</Text>

        <Text style={styles.label}>Nhập email của bạn</Text>
        <TextInput
            placeholder="you@example.com"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
        />

        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Gửi link đặt lại mật khẩu</Text>
        </TouchableOpacity>
        </View>
    );
    }
