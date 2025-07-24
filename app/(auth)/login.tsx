import { styles } from '@/components/style/auth/LoginStyles';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { auth } from '@/scripts/firebase'; // Đảm bảo đúng đường dẫn
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Lưu thông tin nếu cần
      await AsyncStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
      }));

      Alert.alert('Thành công', 'Đăng nhập thành công!');
      router.replace('(tabs)'); // hoặc trang chính
    } catch (error: any) {
      let message = 'Đăng nhập thất bại.';
      switch (error.code) {
        case 'auth/invalid-email':
          message = 'Email không hợp lệ.';
          break;
        case 'auth/user-not-found':
          message = 'Tài khoản không tồn tại.';
          break;
        case 'auth/wrong-password':
          message = 'Sai mật khẩu.';
          break;
      }

      Alert.alert('Lỗi', message);
      console.log('Firebase login error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/Welcome')}>
        <Text style={styles.backText}>← Quay lại</Text>
      </TouchableOpacity>

      <Text style={styles.title}>WELCOME{"\n"}EFB</Text>

      <Text style={styles.label}>EMAIL</Text>
      <TextInput
        placeholder="hello@reallygreatsite.com"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Text style={styles.label}>PASSWORD</Text>
      <TextInput
        placeholder="••••••••"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>

      <Text style={styles.switch} onPress={() => router.push('/register')}>
        chưa có tài khoản? Đăng ký ngay
      </Text>

      <View style={styles.separator} />

      <TouchableOpacity style={styles.socialButtonWhite}>
        <Image
          source={require('@/assets/images/google-icon.png')}
          style={{ width: 20, height: 20, marginRight: 10 }}
        />
        <Text style={styles.googleText}>Google Sign in</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#1877F2' }]}>
        <FontAwesome5 name="facebook-f" size={20} color="#fff" style={styles.socialIcon} />
        <Text style={styles.socialText}>Facebook Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}
