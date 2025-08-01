import { auth, db } from '@/scripts/firebase';
import { useGoogleLogin } from '@/scripts/googleAuth';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
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

export default function RegisterScreen() {
  const router = useRouter();
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { promptAsync } = useGoogleLogin();

  const handleRegister = async () => {
    if (!email || !password || !name || !number || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    if (number.length !== 10 || !/^\d+$/.test(number)) {
      Alert.alert('Lỗi', 'Số điện thoại phải gồm đúng 10 chữ số.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        name,
        email,
        number,
        role: 'user',
        createdAt: new Date(),
      });

      Alert.alert('Thành công', 'Đăng ký thành công!');
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đăng ký thất bại!');
      console.error(error);
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
        <Text style={styles.title}>WELCOME{"\n"}EFB</Text>

        <Text style={styles.label}>NAME</Text>
        <TextInput
          placeholder="Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
           placeholderTextColor={'#888'}
        />

        <Text style={styles.label}>EMAIL</Text>
        <TextInput
          placeholder="EnglishForBeginner@gmail.com"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
           placeholderTextColor={'#888'}
        />

        <Text style={styles.label}>PHONE NUMBER</Text>
        <TextInput
          placeholder="0123456789"
          style={styles.input}
          value={number}
          onChangeText={(text) => setNumber(text.replace(/[^0-9]/g, ''))}
          keyboardType="phone-pad"
           placeholderTextColor={'#888'}
        />

        <Text style={styles.label}>PASSWORD</Text>
        <View style={{ position: 'relative' }}>
          <TextInput
            placeholder="●●●●●●●●●●●●"
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

        <Text style={styles.label}>CONFIRM PASSWORD</Text>
        <View style={{ position: 'relative' }}>
          <TextInput
            placeholder="●●●●●●●●●●●●"
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
             placeholderTextColor={'#888'}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{ position: 'absolute', right: 12, top: 12 }}
          >
            <FontAwesome5
              name={showConfirmPassword ? 'eye' : 'eye-slash'}
              size={18}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>

        <Text style={styles.switch} onPress={() => router.push('/login')}>
          đã có tài khoản? Đăng nhập
        </Text>

        <View style={{ marginTop: 30 }}>
          <TouchableOpacity
  style={[styles.socialButton, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc' }]}
  onPress={() => promptAsync()}
>
  <FontAwesome5 name="google" size={20} color="#DB4437" style={styles.socialIcon} />
  <Text style={[styles.socialText, { color: '#444' }]}>Google Sign up</Text>
</TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#1877F2' }]}>
            <FontAwesome5 name="facebook-f" size={20} color="#fff" style={styles.socialIcon} />
            <Text style={styles.socialText}>Facebook Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
