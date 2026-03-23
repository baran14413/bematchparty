import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/src/utils/store';
import { onAuthChanged, getUserProfile } from '@/src/utils/authService';
import { View, ActivityIndicator, StyleSheet, AppState, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { updatePresence } from '@/src/utils/userService';

export default function RootLayout() {
  const { user, setUser, isLoading, setLoading, isAuthReady, setAuthReady } = useAppStore();
  const segments = useSegments();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Mark as online immediately upon detection
        updatePresence(firebaseUser.uid, true);

        // Kullanıcı giriş yapmış, Firestore'dan profil bilgilerini çek
        const profile = await getUserProfile(firebaseUser.uid);
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: profile?.displayName || firebaseUser.displayName,
          photoURL: profile?.photoURL || firebaseUser.photoURL,
          onboarded: profile?.onboarded || false,
          age: profile?.age,
          interests: profile?.interests,
          bio: profile?.bio,
        });
      } else {
        // Kullanıcı çıkış yapmış
        setUser(null);
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Global Presence Tracker (AppState based)
  useEffect(() => {
    if (!user?.uid) return;

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        updatePresence(user.uid, true);
      } else if (nextAppState.match(/inactive|background/)) {
        updatePresence(user.uid, false);
      }
    });

    // Web için sekme değişimi takibi
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined') {
        updatePresence(user.uid, document.visibilityState === 'visible');
      }
    };

    if (Platform.OS === 'web') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // Cleanup: Mark offline when unmounting/closing if possible
    return () => {
      subscription.remove();
      if (Platform.OS === 'web') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      updatePresence(user.uid, false);
    };
  }, [user?.uid]);

  // Routing guard
  useEffect(() => {
    if (!isMounted || !isAuthReady) return;

    const inAuthGroup = segments[0] === 'login';
    const inOnboarding = segments[0] === 'onboarding';

    if (!user) {
      // Kullanıcı giriş yapmamış -> login sayfasına yönlendir
      if (!inAuthGroup) {
        router.replace('/login');
      }
    } else if (!user.onboarded) {
      // Kullanıcı giriş yapmış ama onboarding tamamlanmamış
      if (!inOnboarding) {
        router.replace('/onboarding');
      }
    } else {
      // Kullanıcı login olmuş ve onboarding tamamlanmış
      if (inAuthGroup || inOnboarding) {
        router.replace('/(tabs)');
      }
    }
  }, [user, segments, isAuthReady, isMounted]);

  // Firebase auth henüz hazır değilse loading göster
  if (!isAuthReady) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#0f172a', '#1e1b4b']} style={StyleSheet.absoluteFillObject} />
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="create-post" options={{ presentation: 'modal' }} />
      <Stack.Screen name="chat/[id]" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
});
