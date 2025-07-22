// app/(auth)/register.tsx
import { AntDesign, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from '../../components/style/RegisterStyles';

export default function RegisterScreen() {
  const router = useRouter();
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    if (!email || !password || !name || !number || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    // Sau này sẽ gọi API để xử lý đăng ký
    Alert.alert('Thành công', 'Đăng ký thành công!');
    router.replace('/');
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
        <TouchableOpacity style={styles.socialButton}>
          <AntDesign name="google" size={20} color="#fff" style={styles.socialIcon} />
          <Text style={styles.socialText}>Google Sign up</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#1877F2' }]}>
          <FontAwesome5 name="facebook-f" size={20} color="#fff" style={styles.socialIcon} />
          <Text style={styles.socialText}>Facebook Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
