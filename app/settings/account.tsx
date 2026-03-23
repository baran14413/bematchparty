import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Colors } from '@/src/theme';
import { useAppStore } from '@/src/utils/store';
import { translations } from '@/src/utils/i18n';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChevronLeft, LogOut, Trash2, PauseCircle, AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { signOutUser, freezeAccount, deleteAccount } from '@/src/utils/authService';

const { height } = Dimensions.get('window');

export default function AccountSettingsScreen() {
  const { language, user } = useAppStore();
  const t = translations[language] as any;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  const handleLogout = () => {
    Alert.alert(
      t.logoutOpt,
      t.confirmLogout || 'Çıkış yapmak istediğinize emin misiniz?',
      [
        { text: t.cancelBtn || 'İptal', style: 'cancel' },
        { 
          text: t.logoutOpt, 
          style: 'destructive', 
          onPress: async () => {
            try {
              setIsLoading(true);
              await signOutUser();
              // Auth listener redirects automatically
            } catch (error) {
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleFreeze = () => {
    Alert.alert(
      t.freezeAccountOpt,
      t.freezeAccountDesc || 'Hesabınız 15 gün boyunca gizlenecek. Giriş yapmazsanız silinecektir.',
      [
        { text: t.cancelBtn || 'İptal', style: 'cancel' },
        { 
          text: t.freezeAccountOpt, 
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            try {
              setIsLoading(true);
              await freezeAccount(user.uid);
              Alert.alert('Başarılı', 'Hesabınız donduruldu. Çıkış yapılıyor...', [
                  { text: 'Tamam', onPress: () => signOutUser() }
              ]);
            } catch (error) {
              Alert.alert('Hata', 'İşlem başarısız oldu.');
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const executeDelete = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setDeleteModalVisible(false);
      await deleteAccount(user.uid, deleteReason);
      Alert.alert('Başarılı', 'Hesabınız ve tüm verileriniz kalıcı olarak silindi.');
      // deleteUser logs the user out automatically
    } catch (error: any) {
      setIsLoading(false);
      if (error.code === 'auth/requires-recent-login') {
         Alert.alert('Güvenlik', 'Bu işlem için yakın zamanda giriş yapmış olmanız gerekiyor. Lütfen çıkış yapıp tekrar giriş yapın ve tekrar deneyin.');
      } else {
         Alert.alert('Hata', 'Hesap silinirken bir hata oluştu.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.dark.background, '#1e1b4b']} style={styles.gradient} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} disabled={isLoading}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.accountSettingsOpt}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <BlurView intensity={20} tint="dark" style={[styles.card, { borderColor: 'rgba(248, 113, 113, 0.2)', backgroundColor: 'rgba(248, 113, 113, 0.05)' }]}>
            
            {/* DONDUR BUTONU */}
            <TouchableOpacity style={styles.dangerBtn} onPress={handleFreeze} disabled={isLoading}>
                <View style={styles.btnIconWrap}><PauseCircle color="#FFF" size={22} /></View>
                <View style={styles.btnTextWrap}>
                    <Text style={styles.dangerTitle}>{t.freezeAccountOpt}</Text>
                    <Text style={styles.dangerDesc}>{t.freezeAccountDesc || '15 gün girmesen kalıcı silinir'}</Text>
                </View>
            </TouchableOpacity>
            
            {/* SİL BUTONU */}
            <TouchableOpacity style={styles.dangerBtn} onPress={() => setDeleteModalVisible(true)} disabled={isLoading}>
                <View style={styles.btnIconWrap}><Trash2 color="#F87171" size={22} /></View>
                <View style={styles.btnTextWrap}>
                    <Text style={[styles.dangerTitle, { color: '#F87171' }]}>{t.deleteAccountOpt}</Text>
                    <Text style={styles.dangerDesc}>{t.deleteAccountDesc || 'Kalıcı silme işlemi'}</Text>
                </View>
            </TouchableOpacity>

            {/* ÇIKIŞ BUTONU */}
            <TouchableOpacity style={[styles.dangerBtn, { borderBottomWidth: 0, justifyContent: 'center' }]} onPress={handleLogout} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#F87171" style={{ marginRight: 10 }} /> : <LogOut color="#F87171" size={22} style={{ marginRight: 10 }} />}
                <Text style={[styles.dangerTitle, { color: '#F87171', fontWeight: 'bold' }]}>
                    {isLoading ? 'İşlem yapılıyor...' : t.logoutOpt}
                </Text>
            </TouchableOpacity>

        </BlurView>
      </ScrollView>

      {/* SİLME NEDENİ MODALI */}
      <Modal visible={deleteModalVisible} animationType="slide" transparent={true}>
         <View style={styles.modalOverlay}>
            <BlurView intensity={60} tint="dark" style={styles.modalContent}>
               <View style={styles.modalHeader}>
                  <AlertTriangle color="#F87171" size={32} style={{ marginBottom: 15 }} />
                  <Text style={styles.modalTitle}>{t.deleteReasonTitle || 'Neden ayrılıyorsun?'}</Text>
                  <Text style={styles.modalSubtitle}>{t.deleteAccountDesc || 'Bu işlem geri alınamaz.'}</Text>
               </View>

               <TextInput
                  style={styles.reasonInput}
                  placeholder={t.deleteReasonPlaceholder || 'Bize kısaca anlat...'}
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  multiline
                  value={deleteReason}
                  onChangeText={setDeleteReason}
                  textAlignVertical="top"
               />

               <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setDeleteModalVisible(false)}>
                     <Text style={styles.modalCancelText}>{t.cancelBtn || 'İptal'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalDeleteBtn} onPress={executeDelete}>
                     <Text style={styles.modalDeleteText}>{t.deleteBtn || 'Kalıcı Olarak Sil'}</Text>
                  </TouchableOpacity>
               </View>
            </BlurView>
         </View>
      </Modal>

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
  
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(248, 113, 113, 0.15)',
  },
  btnIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(248, 113, 113, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  btnTextWrap: { flex: 1 },
  dangerTitle: { color: '#FFF', fontSize: 17, fontWeight: '600', marginBottom: 4 },
  dangerDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 18 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 30, overflow: 'hidden', padding: 25, borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.3)', backgroundColor: 'rgba(15, 23, 42, 0.9)' },
  modalHeader: { alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  modalSubtitle: { color: '#F87171', fontSize: 14, textAlign: 'center', paddingHorizontal: 10 },
  reasonInput: { height: 120, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 15, padding: 15, color: '#FFF', fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 25 },
  
  modalActions: { flexDirection: 'row', gap: 15 },
  modalCancelBtn: { flex: 1, padding: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, alignItems: 'center' },
  modalCancelText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  modalDeleteBtn: { flex: 1, padding: 16, backgroundColor: '#F87171', borderRadius: 15, alignItems: 'center', shadowColor: '#F87171', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  modalDeleteText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
