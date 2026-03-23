import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { useAppStore, SupportedLanguage } from '@/src/utils/store';
import { translations } from '@/src/utils/i18n';
import { Colors, Typography } from '@/src/theme';
import { Chrome, Globe, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { signInWithGoogle } from '@/src/utils/authService';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { setUser, language, setLanguage } = useAppStore();
  const t = translations[language];
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const firebaseUser = await signInWithGoogle();
      // Auth state listener in _layout.tsx handles the rest
    } catch (err: any) {
      console.error('Login failed:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Giriş penceresi kapatıldı.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Pop-up engellendi. Lütfen tarayıcı ayarlarınızı kontrol edin.');
      } else {
        setError('Giriş sırasında bir hata oluştu. Tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageSwitch = () => {
    const langs: SupportedLanguage[] = ['tr', 'en', 'de'];
    const currentIndex = langs.indexOf(language);
    const nextLang = langs[(currentIndex + 1) % langs.length];
    setLanguage(nextLang);
  };

  return (
    <View style={styles.container}>
      {/* Premium Aurora Background */}
      <View style={styles.aurora1} />
      <View style={styles.aurora2} />
      <View style={styles.aurora3} />
      <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFillObject} />
      
      <View style={styles.noiseOverlay} />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoRingWrapper}>
             <LinearGradient colors={['#3b82f6', '#8b5cf6', '#ec4899']} style={styles.logoGradientRing} />
             <View style={styles.logoInner}>
                <Sparkles color="#FFF" size={32} style={{ position: 'absolute', top: 5, right: 5, opacity: 0.5 }} />
                <Text style={styles.logoText}>B</Text>
             </View>
          </View>
          <Text style={styles.appName}>BeMatch</Text>
          <Text style={styles.tagline}>{t.findMatch}</Text>
        </View>

        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.01)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardBorder}
          >
            <BlurView intensity={40} tint="dark" style={styles.card}>
              <Text style={styles.welcomeText}>{t.welcome}</Text>
              <Text style={styles.instructionText}>{t.loginToContinue}</Text>
              
              <TouchableOpacity 
                style={[styles.googleButton, isLoading && { opacity: 0.6 }]} 
                onPress={handleGoogleLogin}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.02)']}
                  start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                  style={styles.googleButtonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Chrome color="#FFF" size={24} style={styles.googleIcon} />
                      <Text style={styles.buttonText}>{t.continueWithGoogle}</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}
              
              <Text style={styles.footerNote}>
                By continuing, you agree to our Terms and Privacy Policy
              </Text>
            </BlurView>
          </LinearGradient>
        </View>
      </View>

      <TouchableOpacity style={styles.langSelector} onPress={handleLanguageSwitch} activeOpacity={0.7}>
        <BlurView intensity={20} tint="light" style={styles.langSelectorBlur}>
           <Globe color="#FFF" size={16} style={{ marginRight: 6 }} />
           <Text style={styles.langText}>{language.toUpperCase()}</Text>
        </BlurView>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // Slate 950 base
  },
  aurora1: {
    position: 'absolute', top: -height * 0.2, left: -width * 0.5,
    width: width * 1.5, height: width * 1.5,
    backgroundColor: 'rgba(139, 92, 246, 0.35)', // Purple
    borderRadius: width,
  },
  aurora2: {
    position: 'absolute', bottom: -height * 0.1, right: -width * 0.3,
    width: width * 1.2, height: width * 1.2,
    backgroundColor: 'rgba(14, 165, 233, 0.3)', // Sky Blue
    borderRadius: width,
  },
  aurora3: {
    position: 'absolute', top: height * 0.3, left: width * 0.2,
    width: width * 0.8, height: width * 0.8,
    backgroundColor: 'rgba(236, 72, 153, 0.2)', // Pink
    borderRadius: width,
  },
  noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    opacity: 0.05,
    // Note: React Native Web doesn't easily support noise filters without SVGs, but a subtle black overlay helps depth
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoRingWrapper: {
    width: 110, height: 110,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  logoGradientRing: {
    position: 'absolute',
    width: '100%', height: '100%',
    borderRadius: 55,
    opacity: 0.7,
  },
  logoInner: {
    width: 90, height: 90,
    borderRadius: 45,
    backgroundColor: '#0f172a',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    ...Platform.select({
      ios: { shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20 },
      android: { elevation: 15 },
      web: { boxShadow: '0px 10px 20px rgba(59, 130, 246, 0.5)' }
    }),
  },
  logoText: {
    color: '#FFF',
    fontSize: 48,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  appName: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '800',
    marginTop: 10,
    letterSpacing: 2,
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(255,255,255,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
      },
      android: {
        textShadowColor: 'rgba(255,255,255,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
      },
      web: {
        textShadow: '0px 2px 10px rgba(255,255,255,0.3)',
      }
    }),
  },
  tagline: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  cardWrapper: {
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
      },
      android: {
        elevation: 20,
      },
      web: {
        boxShadow: '0px 20px 30px rgba(0,0,0,0.5)',
      }
    }),
  },
  cardBorder: {
    width: '100%',
    borderRadius: 32,
    padding: 1, // Creates the 1px gradient border effect
  },
  card: {
    width: '100%',
    padding: 35,
    borderRadius: 31,
    backgroundColor: 'rgba(15, 23, 42, 0.4)', // Slate overlay
    alignItems: 'center',
    overflow: 'hidden',
  },
  welcomeText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  instructionText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    marginBottom: 35,
    textAlign: 'center',
    lineHeight: 22,
  },
  googleButton: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  googleButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    marginRight: 12,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '600',
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  footerNote: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 12,
    marginTop: 30,
    textAlign: 'center',
    lineHeight: 18,
  },
  langSelector: {
    position: 'absolute',
    top: 50,
    right: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  langSelectorBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  langText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  }
});
