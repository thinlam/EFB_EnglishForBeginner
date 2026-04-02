// import { makeRedirectUri } from 'expo-auth-session';
import * as AuthSession from 'expo-auth-session';
import { useAuthRequest } from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import { auth, db } from './firebase';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleLogin = () => {
  const router = useRouter();

  const [request, response, promptAsync] = useAuthRequest({
    clientId: '10598642218-8umi339c42ilv84eiu3u63lm1fv0d0th.apps.googleusercontent.com',
    androidClientId: '10598642218-odka0u7fl2pprj7qcqabuo6te79jnfo8.apps.googleusercontent.com',
    webClientId: '10598642218-8umi339c42ilv84eiu3u63lm1fv0d0th.apps.googleusercontent.com',
    // redirectUri: AuthSession.makeRedirectUri(
    // { scheme: 'myapp' }, // Only valid options here
    //   true // Use Expo proxy (true for Expo Go)
    // ),
  //   // ✅ Sử dụng proxy của Expo để xử lý redirect URL
   redirectUri: AuthSession.makeRedirectUri({
    // scheme: 'myapp', // 👈 giống với app.json
    // useProxy: true,  // 👈 bắt buộc khi test trên Expo Go
  }),
  });

  useEffect(() => {
    const loginWithGoogle = async () => {
      if (response?.type === 'success') {
        const { idToken } = response.authentication!;
        const credential = GoogleAuthProvider.credential(idToken);

        try {
          const userCred = await signInWithCredential(auth, credential);
          const user = userCred.user;
          const uid = user.uid;

          // Ghi thông tin user vào Firestore
          await setDoc(doc(db, 'users', uid), {
            name: user.displayName || '',
            email: user.email,
            number: '',
            role: 'user',
            createdAt: new Date(),
          });

          console.log('✅ Đăng nhập Google thành công:', user.email);
          router.replace('/');
        } catch (error) {
          console.error('❌ Lỗi đăng nhập Google:', error);
        }
      }
    };

    loginWithGoogle();
  }, [response]);

  return { promptAsync };
};
