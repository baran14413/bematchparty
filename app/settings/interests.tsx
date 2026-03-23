import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Colors } from '@/src/theme';
import { useAppStore } from '@/src/utils/store';
import { translations } from '@/src/utils/i18n';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { updateUserInterests } from '@/src/utils/authService';

const { height } = Dimensions.get('window');

export default function InterestsScreen() {
  const { user, setUser, language } = useAppStore();
  const t = translations[language] as any;
  const router = useRouter();

  // Initialize selected items from user's current interests, ensuring it's an array
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests || []);
  const [isSaving, setIsSaving] = useState(false);

  const availableInterests: string[] = t.interestsList || [];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(prev => prev.filter(i => i !== interest));
    } else {
      if (selectedInterests.length >= 6) {
        Alert.alert('Sınır Aşıldı', 'En fazla 6 adet ilgi alanı seçebilirsin.');
        return;
      }
      setSelectedInterests(prev => [...prev, interest]);
    }
  };

  const saveInterests = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateUserInterests(user.uid, selectedInterests);
      setUser({ ...user, interests: selectedInterests });
      Alert.alert('Başarılı', 'İlgi alanların güncellendi.');
      router.back();
    } catch (error) {
      Alert.alert('Hata', 'İlgi alanları güncellenirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.dark.background, '#1e1b4b']} style={styles.gradient} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.myInterests || 'İlgi Alanları'}</Text>
        <View style={{ width: 44 }}>
           <Text style={styles.counterText}>{selectedInterests.length}/6</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Kişiliğini yansıtan konuları seç. Seçimlerin, sana en uygun eşleşmeleri bulmamıza yardımcı olur.
        </Text>

        <View style={styles.interestsContainer}>
            {availableInterests.map((interest, idx) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                    <TouchableOpacity 
                        key={idx} 
                        style={[styles.interestChip, isSelected && styles.interestChipSelected]}
                        onPress={() => toggleInterest(interest)}
                        activeOpacity={0.7}
                    >
                        {isSelected && <Check color="#FFF" size={14} style={{ marginRight: 6 }} />}
                        <Text style={[styles.interestText, isSelected && styles.interestTextSelected]}>
                            {interest}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
      </ScrollView>

      {/* FIXED BOTTOM SAVE BUTTON */}
      <View style={styles.bottomBar}>
         <TouchableOpacity 
            style={[styles.saveBtn, (isSaving || selectedInterests.length === 0) && { opacity: 0.6 }]} 
            onPress={saveInterests}
            disabled={isSaving || selectedInterests.length === 0}
         >
            {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>{t.saveDiscoveryBtn || 'Kaydet'}</Text>}
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
  counterText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  
  scrollContent: { padding: 20, paddingBottom: 120 }, // Extra padding for bottom bar
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 25,
    textAlign: 'center'
  },
  
  interestsContainer: { 
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' 
  },
  interestChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 25,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  interestChipSelected: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
    shadowColor: Colors.dark.primary, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5
  },
  interestText: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '600' },
  interestTextSelected: { color: '#FFF', fontWeight: '700' },

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
