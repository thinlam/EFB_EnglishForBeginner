import { auth } from '@/scripts/firebase';
import { createUserDoc } from '@/services/auth/registerService';
import {
  isEmail,
  isVNPhone,
  normalize,
  strongEnough,
} from '@/utils/auth/validatorsRegister';

import { createUserWithEmailAndPassword } from 'firebase/auth';
import React from 'react';
import Toast from 'react-native-toast-message';

type Opts = { onSuccess?: () => void };

export function useRegister({ onSuccess }: Opts = {}) {
  const [number, setNumber] = React.useState('');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    React.useState(false);

  const showError = (title: string, message: string) => {
    Toast.show({
      type: 'error',
      position: 'top',
      text1: title,
      text2: message,
      visibilityTime: 8000,
      autoHide: true,
      topOffset: 60,
    });
  };

  const showSuccess = (title: string, message: string) => {
    Toast.show({
      type: 'success',
      position: 'top',
      text1: title,
      text2: message,
      visibilityTime: 8000,
      autoHide: true,
      topOffset: 60,
    });
  };

  const handleRegister = React.useCallback(async () => {
    const n = normalize(name);
    const e = normalize(email);
    const p = password;
    const cp = confirmPassword;
    const ph = number;

    if (!e || !p || !n || !ph || !cp) {
      return showError('Thiếu thông tin', 'Vui lòng nhập đầy đủ các trường.');
    }

    if (!isEmail(e)) {
      return showError('Email không hợp lệ', 'Vui lòng kiểm tra lại email.');
    }

    if (!isVNPhone(ph)) {
      return showError(
        'Số điện thoại không hợp lệ',
        'Số điện thoại phải có đúng 10 số.'
      );
    }

    if (!strongEnough(p)) {
      return showError(
        'Mật khẩu yếu',
        'Mật khẩu phải có ít nhất 6 ký tự.'
      );
    }

    if (p !== cp) {
      return showError(
        'Không khớp mật khẩu',
        'Mật khẩu xác nhận không trùng khớp.'
      );
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        e,
        p
      );
      const uid = userCredential.user.uid;

      await createUserDoc(uid, {
        name: n,
        email: e,
        number: ph,
        role: 'user',
        level: null,
        startMode: null,
        createdAt: new Date(),
      });

      showSuccess(
        'Đăng ký thành công',
        'Tài khoản của bạn đã được tạo.'
      );

      onSuccess?.();
    } catch (error: any) {
      let message = 'Đăng ký thất bại.';

      switch (error?.code) {
        case 'auth/email-already-in-use':
          message = 'Email này đã được sử dụng.';
          break;
        case 'auth/invalid-email':
          message = 'Email không hợp lệ.';
          break;
        case 'auth/weak-password':
          message = 'Mật khẩu quá yếu. (ít nhất 6 ký tự)';
          break;
        default:
          message = error?.message || message;
      }

      showError('Đăng ký thất bại', message);
      console.error('[RegisterError]', error);
    }
  }, [name, email, number, password, confirmPassword, onSuccess]);

  return {
    name,
    setName,
    email,
    setEmail,
    number,
    setNumber,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,

    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,

    handleRegister,
  };
}
