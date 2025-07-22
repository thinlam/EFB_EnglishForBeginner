import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Logo EFB */}
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Phần chữ và nút */}
      <View style={styles.content}>
        <Text style={styles.title}>WELCOME{"\n"}EFB</Text>
        <Text style={styles.subtitle}>ENGLISH FOR BEGINNER</Text>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
 logo: {
  width: 160,
  height: 160,
  borderRadius: 12, // bo nhẹ 12px
  marginBottom: 20,
}
,
  content: {
    marginTop: 20, // kéo cụm chữ + nút xuống
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4F46E5',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    letterSpacing: 1,
    color: '#999',
  },
  button: {
    marginTop: 30,
    width: 220,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
