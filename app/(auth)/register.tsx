import { styles } from '@/components/style/auth/RegisterStyles';
import { useRegister } from '@/hooks/auth/useRegister';
import { useGoogleLogin } from '@/scripts/googleAuth';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const { promptAsync } = useGoogleLogin();

  const {
    name, setName,
    email, setEmail,
    number, setNumber,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword,
    handleRegister,
  } = useRegister({ onSuccess: () => router.replace('/(onboarding)/SelectLevel') });

  const phoneHint = useMemo(() => 'Số điện thoại 10 chữ số (VD: 0912345678)', []);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.container, { flexGrow: 1 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator>
        <Text style={styles.title}>WELCOME{"\n"}EFB</Text>

        <Text style={styles.label}>NAME</Text>
        <TextInput
          placeholder="Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholderTextColor="#888"
          autoCapitalize="words"
        />

        <Text style={styles.label}>EMAIL</Text>
        <TextInput
          placeholder="EnglishForBeginner@gmail.com"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#888"
          autoCapitalize="none"
        />

        <Text style={styles.label}>PHONE NUMBER</Text>
        <TextInput
          placeholder="0123456789"
          style={styles.input}
          value={number}
          onChangeText={(t) => setNumber(t.replace(/[^0-9]/g, ''))}
          keyboardType="phone-pad"
          placeholderTextColor="#888"
        />
        <Text style={{ color: '#999', marginBottom: 8 }}>{phoneHint}</Text>

        <Text style={styles.label}>PASSWORD</Text>
        <View style={{ position: 'relative' }}>
          <TextInput
            placeholder="••••••••••••••••••"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#888"
            autoCapitalize="none"
            textContentType="oneTimeCode"
          />
          <TouchableOpacity onPress={() => setShowPassword((s) => !s)} style={{ position: 'absolute', right: 12, top: 12 }}>
            <FontAwesome5 name={showPassword ? 'eye' : 'eye-slash'} size={18} color="#888" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>CONFIRM PASSWORD</Text>
        <View style={{ position: 'relative' }}>
          <TextInput
            placeholder="••••••••••••••••••"
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            placeholderTextColor="#888"
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword((s) => !s)} style={{ position: 'absolute', right: 12, top: 12 }}>
            <FontAwesome5 name={showConfirmPassword ? 'eye' : 'eye-slash'} size={18} color="#888" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>

        <Text style={styles.switch} onPress={() => router.push('/login')}>Account already exists ? sign in</Text>

        <View style={{ marginTop: 30 }}>
          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc' }]}
            onPress={() => promptAsync()}
          >
            <FontAwesome5 name="google" size={20} color="#DB4437" style={styles.socialIcon} />
            <Text style={[styles.socialText, { color: '#444' }]}>Google Sign up</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#1877F2' }]} disabled>
            <FontAwesome5 name="facebook-f" size={20} color="#fff" style={styles.socialIcon} />
            <Text style={styles.socialText}>Facebook Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
