import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert, ActivityIndicator, Platform } from 'react-native';
import { Colors } from '@/src/theme';
import { useAppStore } from '@/src/utils/store';
import { translations } from '@/src/utils/i18n';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChevronLeft, Smartphone, Chrome } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

const { height } = Dimensions.get('window');

export default function SystemSettingsScreen() {
  const { language, setLanguage, user } = useAppStore();
  const t = translations[language] as any;
  const router = useRouter();

  const [isClearing, setIsClearing] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState('Bilinmeyen Cihaz');
  const [sessionTime, setSessionTime] = useState('');

  useEffect(() => {
     // Format current device string
     let devName = 'Bilinmeyen Cihaz';
     if (Platform.OS === 'ios') devName = 'Apple iPhone / iPad';
     else if (Platform.OS === 'android') devName = 'Android Cihaz';
     else if (Platform.OS === 'web') {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('chrome')) devName = 'Web Tarayıcı (Chrome)';
        else if (ua.includes('safari')) devName = 'Web Tarayıcı (Safari)';
        else devName = 'Web Tarayıcı';
     }
     setDeviceInfo(devName);

     // Format Session Time (Using user creation/update time as proxy for active session start or just saying "Current")
     const dateStr = new Date().toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
     setSessionTime(dateStr);
  }, [language]);

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'tr' : language === 'tr' ? 'de' : 'en';
    setLanguage(nextLang);
  };

  const handleClearCache = async () => {
      setIsClearing(true);
      try {
          await Image.clearDiskCache();
          await Image.clearMemoryCache();
          
          // Yapay gecikme ekleyerek temizliğin süresini vurgula
          setTimeout(() => {
              setIsClearing(false);
              Alert.alert(t.cacheClearedTitle || 'Başarılı', t.cacheClearedDesc || 'Önbellek temizlendi.');
          }, 800);
      } catch (error) {
          setIsClearing(false);
          Alert.alert('Hata', 'Önbellek temizlenirken hata oluştu.');
      }
  };

  const renderButtonRow = (label: string, value?: string, onPress?: () => void, isDanger?: boolean, loading?: boolean) => (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={loading}>
      <Text style={[styles.rowTitle, isDanger && { color: '#ef4444' }]}>{label}</Text>
      {loading ? (
          <ActivityIndicator size="small" color="#ef4444" />
      ) : value ? (
          <Text style={styles.rowValue}>{value}</Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.dark.background, '#1e1b4b']} style={styles.gradient} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.systemOpt}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* APP SETTINGS CARD */}
        <BlurView intensity={20} tint="dark" style={styles.card}>
            {renderButtonRow(t.appLanguageOpt, language.toUpperCase(), toggleLanguage)}
            <View style={styles.divider} />
            {renderButtonRow(t.clearBtn, undefined, handleClearCache, true, isClearing)}
        </BlurView>

        {/* ACTIVE SESSION CARD */}
        <Text style={styles.sectionTitle}>{t.activeSession || 'Aktif Oturum'}</Text>
        <BlurView intensity={20} tint="dark" style={[styles.card, { marginTop: 10, padding: 20 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.deviceIconWrapper}>
                   {Platform.OS === 'web' ? <Chrome color="#3b82f6" size={24} /> : <Smartphone color="#3b82f6" size={24} />}
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.deviceTitle}>{t.deviceType || 'Cihaz: '}{deviceInfo}</Text>
                    <Text style={styles.deviceSubtitle}>IP: Gizli • {sessionTime}</Text>
                </View>
                <View style={styles.activeBadge}>
                    <View style={styles.activeDot} />
                    <Text style={styles.activeText}>Aktif</Text>
                </View>
            </View>
        </BlurView>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  gradient: { position: 'absolute', left: 0, right: 0, top: 0, height: height },
  header: {
    paddingTop: 60, paddingHorizontal: 10, paddingBottom: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: { padding: 10 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  card: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  rowTitle: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  rowValue: { color: Colors.dark.primary, fontSize: 16, fontWeight: '700' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: 20 },
  
  sectionTitle: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginTop: 30, marginLeft: 15, letterSpacing: 1 },
  
  deviceIconWrapper: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(59, 130, 246, 0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)' },
  deviceTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  deviceSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  activeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(34, 197, 94, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.3)' },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e', marginRight: 6 },
  activeText: { color: '#22c55e', fontSize: 12, fontWeight: '700' }
});
