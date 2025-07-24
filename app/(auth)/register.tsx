  // app/(auth)/register.tsx
  import { FontAwesome5 } from '@expo/vector-icons';
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
import { styles } from '../../components/style/auth/RegisterStyles';

  export default function RegisterScreen() {
    const router = useRouter();
    const [number, setNumber] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async () => {
  if (!email || !password || !name || !number || !confirmPassword) {
    Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
    return;
  }

  if (password !== confirmPassword) {
    Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
    return;
  }

  try {
    const response = await fetch('http://10.0.2.2/efb_backend/register.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        number,
        password,
        role: 'user', // hoặc admin/premium tùy bạn
      }),
    });

    const json = await response.json();

    if (json.message) {
      Alert.alert('Thành công', 'Đăng ký thành công!');
      router.replace('/');
    } else {
      Alert.alert('Lỗi', json.error || 'Đăng ký thất bại!');
    }
  } catch (error) {
    Alert.alert('Lỗi', 'Không thể kết nối máy chủ.');
    console.log('Lỗi kết nối:', error);
  }
};


    return (
      <View style={styles.container}>
        <Text style={styles.title}>WELCOME{"\n"}EFB</Text>

        <Text style={styles.label}>NAME</Text>
        <TextInput
          placeholder="Full Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>EMAIL</Text>
        <TextInput
          placeholder="hello@gmail.com"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Text style={styles.label}>PHONE NUMBER</Text>
        <TextInput
          placeholder="0123456789"
          style={styles.input}
          value={number}
          onChangeText={setNumber}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>PASSWORD</Text>
        <TextInput
          placeholder="●●●●●●●●●●●●"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>CONFIRM PASSWORD</Text>
        <TextInput
          placeholder="●●●●●●●●●●●●●●"
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>

        <Text style={styles.switch} onPress={() => router.push('/login')}>
          đã có tài khoản? Đăng nhập
        </Text>

        <View style={{ marginTop: 30 }}>
          <TouchableOpacity style={styles.socialButtonWhite}>
          <Image
            source={require('@/assets/images/google-icon.png')} // đường dẫn ảnh biểu tượng "G"
            style={{ width: 20, height: 20, marginRight: 10 }}
          />
          <Text style={styles.googleText}>Google</Text>
        </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#1877F2' }]}>
            <FontAwesome5 name="facebook-f" size={20} color="#fff" style={styles.socialIcon} />
            <Text style={styles.socialText}>Facebook Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
