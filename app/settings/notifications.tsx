import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Dimensions } from 'react-native';
import { Colors } from '@/src/theme';
import { useAppStore } from '@/src/utils/store';
import { translations } from '@/src/utils/i18n';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { height } = Dimensions.get('window');

export default function NotificationsSettingsScreen() {
  const { language } = useAppStore();
  const t = translations[language];
  const router = useRouter();

  const [notifyMatch, setNotifyMatch] = useState(true);
  const [notifyMessage, setNotifyMessage] = useState(true);
  const [notifyLikes, setNotifyLikes] = useState(true);
  const [notifyApp, setNotifyApp] = useState(true);

  // Common UI helpers
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

  const renderSaveButton = (label: string) => (
    <TouchableOpacity style={styles.saveBtn} onPress={() => router.back()}>
      <Text style={styles.saveBtnText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.dark.background, '#1e1b4b']} style={styles.gradient} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.notificationsOpt}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <BlurView intensity={20} tint="dark" style={styles.card}>
            {renderToggleRow(t.newMatchOpt, notifyMatch, setNotifyMatch)}
            <View style={styles.divider} />
            {renderToggleRow(t.newMessageOpt, notifyMessage, setNotifyMessage)}
            <View style={styles.divider} />
            {renderToggleRow(t.likesOpt, notifyLikes, setNotifyLikes)}
            <View style={styles.divider} />
            {renderToggleRow(t.appNotificationsOpt, notifyApp, setNotifyApp)}
        </BlurView>
        {renderSaveButton(t.saveNotifyBtn)}
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
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingHorizontal: 20 },
  rowTextWrap: { flex: 1, marginRight: 15 },
  rowTitle: { color: '#FFF', fontSize: 16, fontWeight: '500' },
  rowDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: 20 },
  saveBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 25, paddingVertical: 14,
    alignItems: 'center', marginTop: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)'
  },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});
