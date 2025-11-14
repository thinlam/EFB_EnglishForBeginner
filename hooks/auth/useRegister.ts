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

    if (!e || !p || !n || !ph || !cp) {
      return Alert.alert('Error', 'Please fill in all required information.');
    }
    if (!isEmail(e)) return Alert.alert('Error', 'Invalid email address.');
    if (!isVNPhone(ph)) {
      return Alert.alert('Error', 'Phone number must contain exactly 10 digits.');
    }
    if (!strongEnough(p)) {
      return Alert.alert('Error', 'Password must be at least 6 characters long.');
    }
    if (p !== cp) {
      return Alert.alert('Error', 'Password confirmation does not match.');
    }

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
        // usernameLower: n?.toLowerCase(), // 👉 enable if you use name as username & ensure uniqueness
      });

      Alert.alert('Success', 'Registration successful!');
      onSuccess?.();
    } catch (error: any) {
      let message = 'Registration failed!';
      switch (error?.code) {
        case 'auth/email-already-in-use':
          message = 'This email is already in use.';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address.';
          break;
        case 'auth/weak-password':
          message = 'Weak password (at least 6 characters required).';
          break;
        default:
          message = error?.message || message;
      }
      Alert.alert('Error', message);
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
    // visibility
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    // action
    handleRegister,
  };
}
