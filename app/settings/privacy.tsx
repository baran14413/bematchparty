import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '@/src/theme';
import { useAppStore } from '@/src/utils/store';
import { translations } from '@/src/utils/i18n';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { updatePrivacyPrefs } from '@/src/utils/authService';

const { height } = Dimensions.get('window');

export default function PrivacySettingsScreen() {
  const { user, setUser, language } = useAppStore();
  const t = translations[language];
  const router = useRouter();

  const currentPrefs = user?.privacyPrefs || {};

  const [showProfile, setShowProfile] = useState(currentPrefs.showProfile ?? true);
  const [onlineStatus, setOnlineStatus] = useState(currentPrefs.onlineStatus ?? true);
  const [readReceipts, setReadReceipts] = useState(currentPrefs.readReceipts ?? true);
  const [distanceInfo, setDistanceInfo] = useState(currentPrefs.distanceInfo ?? true);
  const [incognitoMode, setIncognitoMode] = useState(currentPrefs.incognitoMode ?? false);
  
  const [isSaving, setIsSaving] = useState(false);

  const savePreferences = async () => {
      if (!user) return;
      setIsSaving(true);
      
      const newPrefs = {
          showProfile,
          onlineStatus,
          readReceipts,
          distanceInfo,
          incognitoMode
      };

      try {
          await updatePrivacyPrefs(user.uid, newPrefs);
          setUser({ ...user, privacyPrefs: newPrefs });
          Alert.alert('Başarılı', 'Gizlilik ayarların kaydedildi.');
          router.back();
      } catch (e) {
          Alert.alert('Hata', 'Kaydedilirken bir hata oluştu.');
      } finally {
          setIsSaving(false);
      }
  };

  const renderToggleRow = (label: string, value: boolean, onValueChange: (v: boolean) => void, desc?: string) => (
    <View style={styles.row}>
      <View style={styles.rowTextWrap}>
        <Text style={styles.rowTitle}>{label}</Text>
        {desc && <Text style={styles.rowDesc}>{desc}</Text>}
      </View>
      <Switch
        trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.dark.primary }}
        thumbColor="#FFF"
        ios_backgroundColor="rgba(255,255,255,0.1)"
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.dark.background, '#1e1b4b']} style={styles.gradient} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.privacySecurityOpt}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <BlurView intensity={20} tint="dark" style={styles.card}>
            {renderToggleRow(t.showProfileOpt, showProfile, setShowProfile, t.showProfileDesc)}
            <View style={styles.divider} />
            {renderToggleRow(t.onlineStatusOpt, onlineStatus, setOnlineStatus)}
            <View style={styles.divider} />
            {renderToggleRow(t.readReceiptsOpt, readReceipts, setReadReceipts)}
            <View style={styles.divider} />
            {renderToggleRow(t.distanceInfoOpt, distanceInfo, setDistanceInfo)}
            <View style={styles.divider} />
            {renderToggleRow(t.incognitoOpt, incognitoMode, setIncognitoMode, t.incognitoDesc)}
        </BlurView>
      </ScrollView>

      {/* FIXED BOTTOM SAVE BUTTON */}
      <View style={styles.bottomBar}>
         <TouchableOpacity 
            style={[styles.saveBtn, isSaving && { opacity: 0.6 }]} 
            onPress={savePreferences}
            disabled={isSaving}
         >
            {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>{t.savePrivacyBtn}</Text>}
         </TouchableOpacity>
      </View>
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
  scrollContent: { padding: 20, paddingBottom: 120 },
  card: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  rowTextWrap: { flex: 1, marginRight: 15 },
  rowTitle: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  rowDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4, lineHeight: 18 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: 20 },

  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)'
  },
  saveBtn: {
    backgroundColor: Colors.dark.primary, 
    borderRadius: 28, paddingVertical: 18,
    alignItems: 'center', width: '100%',
    shadowColor: Colors.dark.primary, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 8
  },
  saveBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
});
