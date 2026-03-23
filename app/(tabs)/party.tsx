import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Colors } from '@/src/theme';
import { useAppStore } from '@/src/utils/store';
import { translations } from '@/src/utils/i18n';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Home, Plus, Users, Crown, Mic2, Flame, BarChart2, Radio } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const TOP_BANNERS = [
  { id: '1', title: 'Hafta Sonu Partisi', subtitle: 'Bu gece 22:00\'da başlıyor', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop' },
  { id: '2', title: 'Açık Mikrofon', subtitle: 'Şarkını Seç Sahne Senin', image: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=600&auto=format&fit=crop' }
];

const SPECIAL_CATEGORIES = [
  { id: 'vip', title: 'VIP', subtitle: 'Ayrıcalıklı Odalar', colors: ['#c084fc', '#9333ea'], icon: <Crown color="#FFF" size={24} />, avatars: ['https://api.dicebear.com/7.x/avataaars/svg?seed=A', 'https://api.dicebear.com/7.x/avataaars/svg?seed=B'] },
  { id: 'trend', title: 'Trend', subtitle: 'En Çok Konuşulanlar', colors: ['#f472b6', '#db2777'], icon: <Flame color="#FFF" size={24} />, avatars: ['https://api.dicebear.com/7.x/avataaars/svg?seed=C', 'https://api.dicebear.com/7.x/avataaars/svg?seed=D'] },
  { id: 'music', title: 'Müzik', subtitle: 'Sadece Türkçe Pop', colors: ['#60a5fa', '#2563eb'], icon: <Mic2 color="#FFF" size={24} />, avatars: ['https://api.dicebear.com/7.x/avataaars/svg?seed=E', 'https://api.dicebear.com/7.x/avataaars/svg?seed=F'] }
];

const TABS = ['Sana Özel', 'Popüler', 'Yakınında', 'Yeni Gelenler', 'Eğlence'];

const MOCK_ROOMS = [
  { id: '1', name: 'Gece Kuşları Sohbeti 🌙', host: 'Alina', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alina&backgroundColor=ffb6c1', age: 24, gender: 'female', listeners: 142, tags: ['Chill', 'Muhabbet'] },
  { id: '2', name: 'Canlı Performans & İstek 🎵', host: 'Burak', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Burak&backgroundColor=b6e3ff', age: 26, gender: 'male', listeners: 89, tags: ['Müzik', 'Canlı'] },
  { id: '3', name: 'Sadece CS:GO / Valorant Oyuncuları', host: 'Efe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Efe&backgroundColor=fffb6c', age: 21, gender: 'male', listeners: 12, tags: ['Oyun'] },
  { id: '4', name: 'Dertleşme & Kahve ☕', host: 'Cansu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cansu&backgroundColor=e6b6ff', age: 23, gender: 'female', listeners: 35, tags: ['Sohbet'] },
];

export default function PartyScreen() {
  const { theme, language } = useAppStore();
  const t = translations[language];
  const isDark = theme === 'dark';
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <View style={styles.container}>
      {isDark && <LinearGradient colors={['#0f172a', '#1e1b4b']} style={styles.background} />}
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, !isDark && { color: '#000' }]}>Yayınlar</Text>
          <View style={styles.liveBadge}>
             <Radio color="#FFF" size={12} strokeWidth={3} />
             <Text style={styles.liveBadgeText}>CANLI</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.searchBtn}>
           <Search color={isDark ? "#FFF" : "#000"} size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* TOP BANNERS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bannersScroll}>
           {TOP_BANNERS.map(banner => (
             <TouchableOpacity key={banner.id} style={styles.bannerCard} activeOpacity={0.9}>
                <Image source={{ uri: banner.image }} style={styles.bannerImg} />
                <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']} style={styles.bannerGradient}>
                   <Text style={styles.bannerTitle}>{banner.title}</Text>
                   <Text style={styles.bannerSub}>{banner.subtitle}</Text>
                </LinearGradient>
             </TouchableOpacity>
           ))}
        </ScrollView>

        {/* SPECIAL CATEGORIES (BeMatch Style) */}
        <View style={styles.specialCategories}>
           {SPECIAL_CATEGORIES.map(cat => (
              <TouchableOpacity key={cat.id} style={[styles.specialCatCard, !isDark && styles.catLight]} activeOpacity={0.9}>
                 <LinearGradient colors={isDark ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)'] : ['#FFF', '#f8fafc']} style={StyleSheet.absoluteFill} />
                 
                 <View style={[styles.catIconWrap, { backgroundColor: cat.colors[0] + '20' }]}>
                    {React.cloneElement(cat.icon, { color: cat.colors[0] })}
                 </View>
                 
                 <View style={styles.catInfo}>
                    <Text style={[styles.catTitle, !isDark && { color: '#000' }]}>{cat.title}</Text>
                    <Text style={styles.catSub}>{cat.subtitle}</Text>
                 </View>

                 <View style={styles.catAvatarsContainer}>
                     {cat.avatars.map((url, idx) => (
                        <Image key={idx} source={{ uri: url }} style={[styles.catAvatar, { zIndex: 2 - idx, marginLeft: idx > 0 ? -12 : 0 }]} />
                     ))}
                 </View>
              </TouchableOpacity>
           ))}
        </View>

        {/* HORIZONTAL TABS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
           {TABS.map(tab => (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={styles.tabBtn}>
                 <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive, !isDark && { color: 'rgba(0,0,0,0.5)' }, !isDark && activeTab === tab && { color: '#8b5cf6' }]}>
                    {tab}
                 </Text>
                 {activeTab === tab && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
           ))}
        </ScrollView>

        {/* ROOM LIST (BeMatch Card Style) */}
        <View style={styles.roomList}>
           {MOCK_ROOMS.map(room => (
              <TouchableOpacity key={room.id} style={[styles.roomCard, !isDark && styles.roomCardLight]} activeOpacity={0.95}>
                 <BlurView intensity={isDark ? 20 : 60} tint={isDark ? "dark" : "light"} style={styles.roomCardBlur}>
                 
                    <View style={styles.roomHeader}>
                       <View style={styles.roomAvatarContainer}>
                          <Image source={{ uri: room.avatar }} style={styles.roomAvatar} />
                          <View style={styles.liveRing} />
                       </View>
                       <View style={styles.roomInfo}>
                          <Text style={[styles.roomName, !isDark && { color: '#000' }]} numberOfLines={1}>{room.name}</Text>
                          <View style={styles.roomHostRow}>
                             <Text style={styles.roomHost}>Sunucu: {room.host}</Text>
                             <View style={[styles.genderPill, room.gender === 'female' ? styles.pillFemale : styles.pillMale]}>
                                <Text style={styles.pillText}>{room.gender === 'female' ? '♀' : '♂'} {room.age}</Text>
                             </View>
                          </View>
                       </View>
                    </View>

                    <View style={styles.roomFooter}>
                       <View style={styles.roomTags}>
                          {room.tags.map(tag => (
                             <View key={tag} style={styles.tagBadge}>
                                <Text style={styles.tagText}>{tag}</Text>
                             </View>
                          ))}
                       </View>
                       
                       <View style={styles.listenerBadge}>
                          <BarChart2 color="#FFF" size={14} />
                          <Text style={styles.listenerCount}>{room.listeners}</Text>
                       </View>
                    </View>
                 
                 </BlurView>
              </TouchableOpacity>
           ))}
        </View>

        <View style={{ height: 160 }} />
      </ScrollView>

      {/* FLOATING ACTION BAR (BeMatch Styling) */}
      <View style={styles.floatingBarContainer}>
        <BlurView intensity={isDark ? 50 : 80} tint={isDark ? "dark" : "light"} style={styles.floatingBar}>
           
           <TouchableOpacity style={styles.floatBtn}>
              <View style={[styles.floatIconBox, { backgroundColor: '#8b5cf6' }]}>
                 <Home color="#FFF" size={20} />
              </View>
              <Text style={[styles.floatBtnText, !isDark && { color: '#000' }]}>Kendi Odam</Text>
           </TouchableOpacity>
           
           <View style={styles.floatDivider} />

           <TouchableOpacity style={styles.floatBtn}>
              <View style={[styles.floatIconBox, { backgroundColor: '#db2777' }]}>
                 <Plus color="#FFF" size={20} />
              </View>
              <Text style={[styles.floatBtnText, !isDark && { color: '#000' }]}>Oda Oluştur</Text>
           </TouchableOpacity>
        </BlurView>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  background: { ...StyleSheet.absoluteFillObject },
  
  header: {
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  headerTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { color: '#FFF', fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  liveBadge: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#e11d48', 
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, gap: 4 
  },
  liveBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  searchBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  
  scrollContent: { paddingTop: 10 },
  
  bannersScroll: { paddingHorizontal: 20, gap: 15, paddingBottom: 25 },
  bannerCard: { width: width * 0.75, height: 140, borderRadius: 20, overflow: 'hidden' },
  bannerImg: { width: '100%', height: '100%' },
  bannerGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 15, paddingTop: 40 },
  bannerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 2 },
  bannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500' },

  specialCategories: { paddingHorizontal: 20, marginBottom: 25, gap: 12 },
  specialCatCard: { 
    flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden'
  },
  catLight: { borderColor: 'rgba(0,0,0,0.05)', shadowColor: '#000', shadowOffset: {width:0,height:2}, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  catIconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  catInfo: { flex: 1 },
  catTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 2 },
  catSub: { color: 'rgba(150,150,150,0.8)', fontSize: 13, fontWeight: '500' },
  catAvatarsContainer: { flexDirection: 'row', alignItems: 'center' },
  catAvatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#0f172a', backgroundColor: 'rgba(255,255,255,0.1)' },

  tabsScroll: { paddingHorizontal: 20, gap: 20, marginBottom: 20, maxHeight: 40 },
  tabBtn: { alignItems: 'center' },
  tabText: { color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: '700' },
  tabTextActive: { color: '#FFF', fontWeight: '800' },
  tabIndicator: { width: 20, height: 4, backgroundColor: '#8b5cf6', borderRadius: 2, marginTop: 4 },

  roomList: { paddingHorizontal: 20, gap: 15 },
  roomCard: { 
     borderRadius: 20, overflow: 'hidden',
     borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  roomCardLight: { 
     backgroundColor: '#FFF', borderColor: 'rgba(0,0,0,0.05)',
     shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 
  },
  roomCardBlur: { padding: 15 },
  
  roomHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  roomAvatarContainer: { marginRight: 15 },
  roomAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.1)' },
  liveRing: { position: 'absolute', top: -3, left: -3, right: -3, bottom: -3, borderRadius: 32, borderWidth: 2, borderColor: '#e11d48', borderStyle: 'dashed' },
  
  roomInfo: { flex: 1, justifyContent: 'center' },
  roomName: { color: '#FFF', fontSize: 17, fontWeight: '800', marginBottom: 6 },
  roomHostRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  roomHost: { color: 'rgba(150,150,150,0.8)', fontSize: 13, fontWeight: '600' },
  genderPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  pillFemale: { backgroundColor: '#fbcfe8' },
  pillMale: { backgroundColor: '#bae6fd' },
  pillText: { fontSize: 11, fontWeight: '800', color: '#FFF' },

  roomFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 12 },
  roomTags: { flexDirection: 'row', gap: 8 },
  tagBadge: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  tagText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
  listenerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e11d48', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 6 },
  listenerCount: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  floatingBarContainer: { position: 'absolute', bottom: 90, left: 30, right: 30, alignItems: 'center' },
  floatingBar: { 
     flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly',
     width: '100%', height: 60, borderRadius: 30, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
     backgroundColor: 'rgba(15, 23, 42, 0.4)'
  },
  floatBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  floatIconBox: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  floatBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  floatDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.1)' }
});
