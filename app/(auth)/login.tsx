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

import { auth, db } from '@/scripts/firebase';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

export default function LoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 👁️

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email hoặc tên đăng nhập và mật khẩu.');
      return;
    }

    let loginEmail = identifier;

    // Nếu người dùng nhập username
    if (!identifier.includes('@')) {
      try {
        const q = query(collection(db, 'users'), where('name', '==', identifier.toLowerCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          Alert.alert('Lỗi', 'Không tìm thấy tài khoản với username này.');
          return;
        }

        const userData = querySnapshot.docs[0].data();
        loginEmail = userData.email;
      } catch (err) {
        Alert.alert('Lỗi', 'Không thể truy vấn tài khoản.');
        console.error(err);
        return;
      }
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password);
      const user = userCredential.user;
      const uid = user.uid;

      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        Alert.alert('Lỗi', 'Không tìm thấy dữ liệu người dùng.');
        return;
      }

      const userData = userDoc.data();
      const role = userData.role || 'user';

      await AsyncStorage.setItem('user', JSON.stringify({
        uid,
        email: user.email,
        role,
      }));

      Alert.alert('Thành công', `Chào mừng ${role === 'admin' ? 'quản trị viên' : 'bạn'}!`);

      if (role === 'admin') {
        router.replace('/(admin)/home');
      } else if (role === 'premium') {
        router.replace('/premium-home');
      } else {
        router.replace('(tabs)');
      }
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

  const handleForgotPassword = async () => {
    if (!identifier.includes('@')) {
      Alert.alert('Lỗi', 'Vui lòng nhập email để đặt lại mật khẩu.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, identifier);
      Alert.alert('Đã gửi', 'Email đặt lại mật khẩu đã được gửi.');
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể gửi email đặt lại mật khẩu.');
      console.error('Password reset error:', error);
    }
  };

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

      <TouchableOpacity onPress={() => router.push('/ForgotPassword')}>
        <Text style={[styles.switch, { textAlign: 'right', marginTop: -10 }]}>
          Quên mật khẩu?
        </Text>
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
