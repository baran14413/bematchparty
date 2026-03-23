import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Colors } from '@/src/theme';
import { useAppStore } from '@/src/utils/store';
import { translations } from '@/src/utils/i18n';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChevronLeft, ChevronRight, User, Image as ImageIcon, Heart, Map, Bell, Shield, Smartphone, Settings as SettingsIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { height } = Dimensions.get('window');

export default function SettingsScreen() {
  const { language } = useAppStore();
  const t = translations[language];
  const router = useRouter();

  const SETTINGS_CATEGORIES = [
    { id: 'personal', title: t.personalInfo || 'Kişisel Bilgiler', icon: <User color="#FFF" size={24} />, route: '/settings/personal' },
    { id: 'gallery', title: t.gallery || 'Galeri', icon: <ImageIcon color="#FFF" size={24} />, route: '/settings/gallery' },
    { id: 'interests', title: t.myInterests || 'İlgi Alanları', icon: <Heart color="#FFF" size={24} />, route: '/settings/interests' },
    { id: 'discovery', title: t.discoveryPrefs || 'Keşif Tercihleri', icon: <Map color="#FFF" size={24} />, route: '/settings/discovery' },
    { id: 'notifications', title: t.notificationsOpt || 'Bildirimler', icon: <Bell color="#FFF" size={24} />, route: '/settings/notifications' },
    { id: 'privacy', title: t.privacySecurityOpt || 'Gizlilik & Güvenlik', icon: <Shield color="#FFF" size={24} />, route: '/settings/privacy' },
    { id: 'system', title: t.systemOpt || 'Sistem', icon: <Smartphone color="#FFF" size={24} />, route: '/settings/system' },
    { id: 'account', title: t.accountSettingsOpt || 'Hesap Ayarları', icon: <SettingsIcon color="#F87171" size={24} />, route: '/settings/account', danger: true },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.dark.background, '#1e1b4b']} style={styles.gradient} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.settingsTitle || 'Ayarlar'}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <BlurView intensity={20} tint="dark" style={styles.card}>
            {SETTINGS_CATEGORIES.map((cat, idx) => (
                <View key={cat.id}>
                    <TouchableOpacity 
                        style={styles.categoryRow} 
                        onPress={() => router.push(cat.route as any)}
                    >
                        <View style={[styles.iconBox, cat.danger && { backgroundColor: 'rgba(248, 113, 113, 0.1)' }]}>
                            {cat.icon}
                        </View>
                        <Text style={[styles.categoryTitle, cat.danger && { color: '#F87171' }]}>
                            {cat.title}
                        </Text>
                        <ChevronRight color="rgba(255,255,255,0.3)" size={20} />
                    </TouchableOpacity>
                    {idx < SETTINGS_CATEGORIES.length - 1 && <View style={styles.divider} />}
                </View>
            ))}
        </BlurView>
        <View style={{ height: 60 }} />
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
  card: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  categoryRow: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  iconBox: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  categoryTitle: { flex: 1, color: '#FFF', fontSize: 17, fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: 80 },
});
