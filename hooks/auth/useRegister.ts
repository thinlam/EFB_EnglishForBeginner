import { auth } from '@/scripts/firebase';
import { createUserDoc } from '@/services/auth/registerService';
import { isEmail, isVNPhone, normalize, strongEnough } from '@/utils/auth/validatorsRegister';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React from 'react';
import { Alert } from 'react-native';

type Opts = { onSuccess?: () => void };

export function useRegister({ onSuccess }: Opts = {}) {
  const [number, setNumber] = React.useState('');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleRegister = React.useCallback(async () => {
    const n = normalize(name);
    const e = normalize(email);
    const p = password;
    const cp = confirmPassword;
    const ph = number;

    if (!e || !p || !n || !ph || !cp) return Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
    if (!isEmail(e)) return Alert.alert('Lỗi', 'Email không hợp lệ.');
    if (!isVNPhone(ph)) return Alert.alert('Lỗi', 'Số điện thoại phải gồm đúng 10 chữ số.');
    if (!strongEnough(p)) return Alert.alert('Lỗi', 'Mật khẩu phải từ 6 ký tự trở lên.');
    if (p !== cp) return Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, e, p);
      const uid = userCredential.user.uid;

      await createUserDoc(uid, {
        name: n,
        email: e,
        number: ph,
        role: 'user',
        level: null,
        startMode: null,
        createdAt: new Date(),
        // usernameLower: n?.toLowerCase(), // 👉 bật nếu dùng name làm username & đảm bảo uniqueness
      });

      Alert.alert('Thành công', 'Đăng ký thành công!');
      onSuccess?.();
    } catch (error: any) {
      let message = 'Đăng ký thất bại!';
      switch (error?.code) {
        case 'auth/email-already-in-use': message = 'Email đã được sử dụng.'; break;
        case 'auth/invalid-email': message = 'Email không hợp lệ.'; break;
        case 'auth/weak-password': message = 'Mật khẩu quá yếu (ít nhất 6 ký tự).'; break;
        default: message = error?.message || message;
      }
      Alert.alert('Lỗi', message);
      console.error('[RegisterError]', error);
    }
  }, [name, email, number, password, confirmPassword, onSuccess]);

  return {
    // fields
    name, setName, email, setEmail, number, setNumber,
    password, setPassword, confirmPassword, setConfirmPassword,
    // visibility
    showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword,
    // action
    handleRegister,
  };
}
