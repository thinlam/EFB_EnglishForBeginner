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

    // Basic validations
    if (!e || !p || !n || !ph || !cp) {
      return showError(
        'Missing information',
        'Please fill in all required fields.'
      );
    }

    if (!isEmail(e)) {
      return showError(
        'Invalid email',
        'Please double-check your email address.'
      );
    }

    if (!isVNPhone(ph)) {
      return showError(
        'Invalid phone number',
        'Phone number must contain exactly 10 digits.'
      );
    }

    if (!strongEnough(p)) {
      return showError(
        'Weak password',
        'Password must be at least 6 characters long.'
      );
    }

    if (p !== cp) {
      return showError(
        'Password mismatch',
        'Password confirmation does not match.'
      );
    }

    // Create account
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
        'Registration successful',
        'Your account has been created.'
      );

      onSuccess?.();
    } catch (error: any) {
      let message = 'Registration failed.';

      switch (error?.code) {
        case 'auth/email-already-in-use':
          message = 'This email is already in use.';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address.';
          break;
        case 'auth/weak-password':
          message = 'Password is too weak. (At least 6 characters required.)';
          break;
        default:
          message = error?.message || message;
      }

      showError('Registration failed', message);
      console.error('[RegisterError]', error);
    }
  }, [name, email, number, password, confirmPassword, onSuccess]);

  return {
    // fields
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

    // visibility toggles
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,

    // action
    handleRegister,
  };
}
