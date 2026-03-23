import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Dimensions, TouchableOpacity, Modal, TouchableWithoutFeedback, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/src/utils/store';
import { translations } from '@/src/utils/i18n';
import { Colors } from '@/src/theme';
import { SlidersHorizontal, Bell, Globe, Heart, MessageCircle, Phone, Mic2 } from 'lucide-react-native';
import { getDiscoveryUsers, DiscoveryUser } from '@/src/utils/discoverService';

const { width, height } = Dimensions.get('window');

const TOP_CARDS = [
  { id: '1', title: 'Sürpriz Sohbet', online: '27.6K', color: '#fbcfe8', iconColor: '#ec4899', icon: <MessageCircle color="#FFF" size={20} /> },
  { id: '2', title: 'Sesli Tanışma', online: '24.4K', color: '#dcfce7', iconColor: '#22c55e', icon: <Phone color="#FFF" size={20} /> },
  { id: '3', title: 'Grup Partisi', online: '11.0K', color: '#f3e8ff', iconColor: '#a855f7', icon: <Mic2 color="#FFF" size={20} /> },
];

const ONLINE_USERS = [
  { id: '1', name: 'Alina', age: 22, gender: 'female', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alina&backgroundColor=ffb6c1', status: 'sohbet etmek istiyorum...', isOnline: true },
  { id: '2', name: 'Can', age: 25, gender: 'male', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Can&backgroundColor=b6e3ff', status: 'Yeni podcast bölümü dinliyorum 🎧', isOnline: true },
  { id: '3', name: 'Zeynep', age: 21, gender: 'female', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zeynep&backgroundColor=b6ffc1', status: 'Sadece Türkçe Pop 👑', isOnline: true },
  { id: '4', name: 'Burak', age: 24, gender: 'male', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Burak&backgroundColor=ffffb6', status: 'Valorant dereceli girecek var mı?', isOnline: true },
  { id: '5', name: 'Gizem', age: 20, gender: 'female', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gizem&backgroundColor=e6b6ff', status: 'Nası yani burası bizim salih abiyle...', isOnline: false },
  { id: '6', name: 'Efe', age: 23, gender: 'male', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Efe&backgroundColor=ffc1b6', status: 'Galatasaray 💛❤️🦁', isOnline: true },
];

export default function DiscoverScreen() {
  const { user, language, theme } = useAppStore();
  const t = translations[language];
  const isDark = theme === 'dark';
  const router = useRouter();
  
  const [genderFilter, setGenderFilter] = useState('Everyone');
  const [ageFilter, setAgeFilter] = useState('18-24');
  const [distanceFilter, setDistanceFilter] = useState('25 km');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [discoverUsers, setDiscoverUsers] = useState<DiscoveryUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getDiscoveryUsers(user.uid);
      const filtered = data.filter(u => u.uid !== user.uid);
      if (filtered.length > 0) {
        setDiscoverUsers(filtered);
      } else {
        setDiscoverUsers(ONLINE_USERS.filter(u => u.id !== user.uid) as any);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      setDiscoverUsers(ONLINE_USERS.filter(u => u.id !== user?.uid) as any);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTopCard = (card: typeof TOP_CARDS[0]) => (
    <TouchableOpacity key={card.id} style={[styles.topCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : card.color }]} activeOpacity={0.8}>
       <View style={[styles.topCardIconWrap, { backgroundColor: card.iconColor }]}>
          {card.icon}
       </View>
       <Text style={[styles.topCardTitle, !isDark && { color: '#000' }]} numberOfLines={1}>{card.title}</Text>
       <View style={styles.topCardOnlineRow}>
          <View style={[styles.onlineDot, { backgroundColor: card.iconColor }]} />
          <Text style={[styles.topCardOnlineText, !isDark && { color: 'rgba(0,0,0,0.5)' }]}>{card.online}</Text>
       </View>
    </TouchableOpacity>
  );

  const renderUserItem = ({ item }: { item: DiscoveryUser }) => (
    <TouchableOpacity 
      style={[styles.userListItem, !isDark && styles.userListItemLight]} 
      activeOpacity={0.7}
      onPress={() => router.push(`/user/${item.uid || (item as any).id}` as any)}
    >
       <View style={styles.avatarWrap}>
          <Image source={{ uri: item.photoURL }} style={styles.userAvatar} />
          {item.isOnline && <View style={styles.userOnlineDot} />}
       </View>
       
       <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
             <Text style={[styles.userName, !isDark && { color: '#000' }]} numberOfLines={1}>{item.displayName}</Text>
             <View style={[styles.genderPill, styles.pillFemale]}>
                <Text style={styles.pillText}>
                   {item.age}
                </Text>
             </View>
          </View>
          <Text style={[styles.userStatus, !isDark && { color: '#666' }]} numberOfLines={1}>{item.bio || 'Merhaba! BeMatch kullanıyorum.'}</Text>
       </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {isDark && <LinearGradient colors={['#0f172a', '#1e1b4b']} style={styles.gradient} />}
      
      {/* HEADER */}
      <View style={[styles.header, !isDark && styles.headerLight]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setFilterModalVisible(true)}>
          <SlidersHorizontal color={isDark ? "#FFF" : "#000"} size={24} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, !isDark && { color: '#000' }]}>BeMatch</Text>
        
        <TouchableOpacity style={styles.iconBtn}>
          <Bell color={isDark ? "#FFF" : "#000"} size={24} />
          <View style={styles.bellBadge} />
        </TouchableOpacity>
      </View>

      <FlatList 
        data={discoverUsers}
        keyExtractor={item => (item.uid || (item as any).id)}
        renderItem={renderUserItem}
        onRefresh={fetchUsers}
        refreshing={isLoading}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={(
           <>
             {/* 3 TOP CARDS (RESIZED TO EXACTLY FIT) */}
             <View style={styles.topCardsRow}>
                {TOP_CARDS.map(renderTopCard)}
             </View>

             {/* GLOBAL MATCH BANNER */}
             <TouchableOpacity style={[styles.globalBanner, !isDark && styles.globalBannerLight]} activeOpacity={0.8}>
                <View style={styles.globalBannerLeft}>
                   <Globe color="#a855f7" size={36} />
                   <View style={styles.globalBannerTexts}>
                      <Text style={[styles.globalBannerTitle, !isDark && { color: '#000' }]}>Dünya çapında eşleşme ❯</Text>
                      <Text style={[styles.globalBannerSub, !isDark && { color: '#666' }]}>Dünyadan arkadaşları çevrimiçi eşleştir</Text>
                   </View>
                </View>
                <View style={styles.globalBannerRightPill}>
                   <Text style={styles.globalBannerRightText}>Yerli ⇌</Text>
                </View>
             </TouchableOpacity>
           </>
        )}
      />

      <Modal
        visible={isFilterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setFilterModalVisible(false)}>
            <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        
        <View style={styles.modalContent}>
          <BlurView intensity={40} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t.discoveryPrefs}</Text>
            
            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>{t.genderOpt}</Text>
              <View style={styles.filterChipRow}>
                {['Men', 'Women', 'Everyone'].map(f => (
                  <TouchableOpacity 
                    key={f} 
                    style={[styles.filterChip, genderFilter === f && styles.filterChipActive]}
                    onPress={() => setGenderFilter(f)}
                  >
                    <Text style={[styles.filterText, genderFilter === f && styles.filterTextActive]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>{t.ageRangeOpt}</Text>
              <View style={styles.filterChipRow}>
                {['18-24', '25-34', '35-44', '45+'].map(age => (
                  <TouchableOpacity 
                    key={age} 
                    style={[styles.filterChip, ageFilter === age && styles.filterChipActive]}
                    onPress={() => setAgeFilter(age)}
                  >
                    <Text style={[styles.filterText, ageFilter === age && styles.filterTextActive]}>{age}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>{t.locationOpt}</Text>
              <View style={styles.filterChipRow}>
                {['5 km', '15 km', '25 km', 'Global'].map(dist => (
                  <TouchableOpacity 
                    key={dist} 
                    style={[styles.filterChip, distanceFilter === dist && styles.filterChipActive]}
                    onPress={() => setDistanceFilter(dist)}
                  >
                    <Text style={[styles.filterText, distanceFilter === dist && styles.filterTextActive]}>{dist}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TouchableOpacity style={styles.applyBtn} onPress={() => setFilterModalVisible(false)}>
               <Text style={styles.applyBtnText}>Kaydet</Text>
            </TouchableOpacity>

          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' }, // Light mostly preferred based on screenshot, we adapt to dark via isDark
  gradient: { position: 'absolute', left: 0, right: 0, top: 0, height: height },
  
  header: {
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 15,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerLight: {
    backgroundColor: '#FFF', borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  iconBtn: { position: 'relative', padding: 5 },
  bellBadge: { position: 'absolute', top: 5, right: 5, width: 10, height: 10, borderRadius: 5, backgroundColor: '#ec4899', borderWidth: 2, borderColor: '#FFF' },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },

  listContainer: { paddingBottom: 120 },
  
  topCardsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: 15, paddingBottom: 20 },
  topCard: { width: (width - 46) / 3, paddingVertical: 14, paddingHorizontal: 4, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  topCardIconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  topCardTitle: { color: '#FFF', fontSize: 13, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  topCardOnlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  onlineDot: { width: 6, height: 6, borderRadius: 3 },
  topCardOnlineText: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '600' },

  globalBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 15, padding: 15, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 20
  },
  globalBannerLight: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
  globalBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  globalBannerTexts: { flex: 1 },
  globalBannerTitle: { color: '#FFF', fontSize: 16, fontWeight: '800', marginBottom: 2 },
  globalBannerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500' },
  globalBannerRightPill: { backgroundColor: '#e9d5ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  globalBannerRightText: { color: '#a855f7', fontSize: 11, fontWeight: '700' },

  userListItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  userListItemLight: { borderBottomColor: 'rgba(0,0,0,0.03)' },
  avatarWrap: { position: 'relative', marginRight: 15 },
  userAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.1)' },
  userOnlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10b981', borderWidth: 2, borderColor: '#FFF' },
  userInfo: { flex: 1, justifyContent: 'center' },
  userNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 8 },
  userName: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  genderPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  pillFemale: { backgroundColor: '#fbcfe8' },
  pillMale: { backgroundColor: '#bae6fd' },
  pillText: { fontSize: 11, fontWeight: '800', color: '#FFF' },
  userStatus: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '500' },

  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: {
    position: 'absolute', bottom: 0, width: '100%', height: height * 0.70,
    borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden', backgroundColor: Colors.dark.surface,
  },
  modalBlur: { flex: 1, padding: 24, paddingTop: 15 },
  modalHandle: { width: 40, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 20, alignSelf: 'center' },
  modalTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 30, textAlign: 'center' },
  modalSection: { width: '100%', marginBottom: 30 },
  sectionTitle: { color: 'rgba(255,255,255,0.6)', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15, fontWeight: '600' },
  filterChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  filterChip: {
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  filterChipActive: { backgroundColor: Colors.dark.primary, borderColor: Colors.dark.primary },
  filterText: { color: 'rgba(255,255,255,0.7)', fontWeight: '600', fontSize: 15 },
  filterTextActive: { color: '#FFF', fontWeight: '700' },
  applyBtn: { backgroundColor: Colors.dark.primary, paddingVertical: 16, borderRadius: 30, alignItems: 'center', marginTop: 'auto', marginBottom: 20 },
  applyBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});
