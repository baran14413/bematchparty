import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Modal, ScrollView } from 'react-native';
import { Colors } from '@/src/theme';
import { useAppStore } from '@/src/utils/store';
import { translations } from '@/src/utils/i18n';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChevronLeft, Edit2, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/utils/firebase';

const { width, height } = Dimensions.get('window');

const AVATARS = Array.from({ length: 50 }).map((_, idx) => 
  `https://api.dicebear.com/7.x/avataaars/svg?seed=PremiumAvatar${idx * 17}&backgroundColor=111827`
);

export default function PersonalInfoScreen() {
  const { user, setUser, language } = useAppStore();
  const t = translations[language];
  const router = useRouter();
  
  const [isUploading, setIsUploading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const handleSelectAvatar = async (url: string) => {
    if (!user) return;
    setIsUploading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { photoURL: url });
      
      setUser({ ...user, photoURL: url, avatar: url });
      setShowAvatarModal(false);
    } catch (error) {
      Alert.alert('Hata', 'Avatar güncellenemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.dark.background, '#1e1b4b']} style={styles.gradient} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} disabled={isUploading}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.personalInfo || 'Kişisel Bilgiler'}</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.avatarContainer} onPress={() => setShowAvatarModal(true)} disabled={isUploading}>
          <Image 
              source={{ uri: user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default&backgroundColor=111827' }} 
              style={styles.avatar} 
          />
          {isUploading ? (
             <View style={styles.editOverlay}>
                <ActivityIndicator color="#FFF" />
             </View>
          ) : (
             <View style={styles.editBadge}>
                 <Edit2 color="#FFF" size={18} />
             </View>
          )}
        </TouchableOpacity>
        <Text style={styles.name}>{user?.displayName || 'Explorer'}, {user?.age || '24'}</Text>
        {user?.bio ? <Text style={styles.bioText}>{user.bio}</Text> : null}
      </View>

      {/* AVATAR SELECTION MODAL */}
      <Modal visible={showAvatarModal} animationType="slide" transparent={true}>
         <View style={styles.modalOverlay}>
            <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.modalContent}>
               <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t.avatarTitle || 'Avatar Seç'}</Text>
                  <TouchableOpacity onPress={() => setShowAvatarModal(false)} style={styles.closeBtn}>
                     <X color="#FFF" size={24} />
                  </TouchableOpacity>
               </View>

               <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                  <View style={styles.avatarGrid}>
                     {AVATARS.map((url, idx) => (
                        <TouchableOpacity 
                           key={idx}
                           style={[styles.avatarWrapper, user?.photoURL === url && styles.avatarSelected]}
                           onPress={() => handleSelectAvatar(url)}
                        >
                           <Image source={{ uri: url }} style={styles.avatarImage} />
                        </TouchableOpacity>
                     ))}
                  </View>
               </ScrollView>

               {isUploading && (
                  <View style={styles.uploadingOverlay}>
                     <ActivityIndicator size="large" color="#a855f7" />
                  </View>
               )}
            </View>
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
  content: { alignItems: 'center', paddingTop: 40 },
  avatarContainer: {
    padding: 4, borderRadius: 70, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', marginBottom: 20,
    position: 'relative'
  },
  avatar: { width: 130, height: 130, borderRadius: 65, backgroundColor: '#111827' },
  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center'
  },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#3b82f6', width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#000'
  },
  name: { color: '#FFF', fontSize: 26, fontWeight: '800', marginBottom: 10 },
  bioText: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 16, textAlign: 'center', paddingHorizontal: 20, lineHeight: 24 },
  
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: {
    height: height * 0.8,
    backgroundColor: '#0f172a', borderTopLeftRadius: 30, borderTopRightRadius: 30,
    padding: 20, overflow: 'hidden'
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  modalTitle: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  closeBtn: { padding: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15 },
  
  avatarGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, paddingBottom: 40
  },
  avatarWrapper: {
    width: (width - 80) / 3, aspectRatio: 1,
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 2, borderColor: 'transparent',
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  avatarSelected: { borderColor: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.2)' },
  avatarImage: { width: '100%', height: '100%' },
  
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 10
  }
});
