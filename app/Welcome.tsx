import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../components/style/WelcomStyles'; // Import styles from the WelcomeStyles file
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

