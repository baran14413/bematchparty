import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useAppStore } from '@/src/utils/store';
import { translations } from '@/src/utils/i18n';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Image as ImageIcon, Sparkles, CheckCircle, MapPin, Plus, Eye, Layout, Trash2, Edit } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { getUserStats, getUserPosts } from '@/src/utils/userService';
import { deletePost } from '@/src/utils/postService';
import { PostItem } from '@/src/components/PostItem';
import { ActionSheet } from '@/src/components/ActionSheet';
import { Post } from '@/src/utils/postService';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, theme, language } = useAppStore();
  const t = translations[language];
  const isDark = theme === 'dark';
  const router = useRouter();

  const [activeSegment, setActiveSegment] = useState('posts');
  const [stats, setStats] = useState({ followers: 0, following: 0, visits: 0 });
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Action Sheet States
  const [showSheet, setShowSheet] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  const refreshData = async () => {
    if (!user) return;
    getUserStats(user.uid).then(setStats);
    setIsLoading(true);
    const data = await getUserPosts(user.uid);
    setPosts(data);
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedPost) return;
    
    Alert.alert(
      language === 'tr' ? "Gönderiyi Sil" : "Delete Post",
      language === 'tr' ? "Bu gönderiyi kalıcı olarak silmek istediğine emin misin?" : "Are you sure you want to delete this post permanently?",
      [
        { text: language === 'tr' ? "İptal" : "Cancel", style: "cancel" },
        { 
          text: language === 'tr' ? "Sil" : "Delete", 
          style: "destructive", 
          onPress: async () => {
            const success = await deletePost(selectedPost.id);
            if (success) {
              setPosts(prev => prev.filter(p => p.id !== selectedPost.id));
              refreshData(); // Refresh stats too
            }
          }
        }
      ]
    );
  };

  const menuOptions = [
    { label: language === 'tr' ? 'Sil' : 'Delete', icon: Trash2, color: '#ef4444', onPress: handleDelete }
  ];

  const navigateToStats = (type: 'followers' | 'following' | 'visits') => {
    if (!user) return;
    router.push({
      pathname: '/user/stats',
      params: { uid: user.uid, type }
    } as any);
  };

  const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default&backgroundColor=0f172a';

  return (
    <View style={[styles.container, !isDark && { backgroundColor: '#FAFAFA' }]}>
      {isDark && <LinearGradient colors={['#0f172a', '#1e1b4b']} style={styles.background} />}
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* COVER PHOTO & HEADER */}
        <View style={styles.coverPhotoContainer}>
           <Image 
             source={{ uri: posts.find(p => p.imageUrl)?.imageUrl || user?.photoURL || defaultAvatar }} 
             style={styles.coverPhoto} 
             blurRadius={isDark ? 40 : 20} 
           />
           <LinearGradient colors={['rgba(0,0,0,0.3)', isDark ? '#0f172a' : '#FAFAFA']} style={styles.coverGradient} />
           
           <View style={styles.topNav}>
              <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/settings')}>
                 <Settings color={isDark ? "#FFF" : "#000"} size={22} />
              </TouchableOpacity>
           </View>

           <View style={styles.profileHeader}>
              <View style={styles.avatarWrapper}>
                 <Image source={{ uri: user?.photoURL || defaultAvatar }} style={styles.avatar} />
                 <View style={styles.onlineStatus} />
              </View>
              
              <Text style={[styles.userName, !isDark && { color: '#000' }]}>{user?.displayName}</Text>
              <View style={styles.locationRow}>
                 <MapPin color="#8b5cf6" size={14} />
                 <Text style={styles.locationText}>İstanbul, Türkiye</Text>
                 <CheckCircle color="#3b82f6" size={14} style={{ marginLeft: 5 }} />
              </View>
           </View>

           {/* STATS */}
           <View style={styles.statsRow}>
              <TouchableOpacity style={styles.statItem} onPress={() => navigateToStats('followers')}>
                 <Text style={[styles.statValue, !isDark && { color: '#000' }]}>{stats.followers}</Text>
                 <Text style={[styles.statLabel, !isDark && { color: 'rgba(0,0,0,0.5)' }]}>{language === 'tr' ? 'Takipçi' : 'Followers'}</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity style={styles.statItem} onPress={() => navigateToStats('following')}>
                 <Text style={[styles.statValue, !isDark && { color: '#000' }]}>{stats.following}</Text>
                 <Text style={[styles.statLabel, !isDark && { color: 'rgba(0,0,0,0.5)' }]}>{language === 'tr' ? 'Takip' : 'Following'}</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity style={[styles.statItem, { flexDirection: 'row', alignItems: 'center', gap: 6 }]} onPress={() => navigateToStats('visits')}>
                 <Eye color="#ec4899" size={18} />
                 <View>
                    <Text style={[styles.statValue, !isDark && { color: '#000' }]}>{stats.visits}</Text>
                    <Text style={[styles.statLabel, !isDark && { color: 'rgba(0,0,0,0.5)' }]}>{language === 'tr' ? 'Ziyaretler' : 'Visits'}</Text>
                 </View>
              </TouchableOpacity>
           </View>
        </View>

        {/* TABS */}
        <View style={styles.segmentControl}>
           <TouchableOpacity 
             style={[styles.segmentBtn, activeSegment === 'posts' && styles.segmentBtnActive]}
             onPress={() => setActiveSegment('posts')}
           >
              <Layout color={activeSegment === 'posts' ? '#FFF' : 'rgba(150,150,150,0.5)'} size={20} />
              <Text style={[styles.segmentText, activeSegment === 'posts' && styles.segmentTextActive]}>Gönderiler</Text>
           </TouchableOpacity>
           
           <TouchableOpacity 
             style={[styles.segmentBtn, activeSegment === 'interests' && styles.segmentBtnActive]}
             onPress={() => setActiveSegment('interests')}
           >
              <Sparkles color={activeSegment === 'interests' ? '#FFF' : 'rgba(150,150,150,0.5)'} size={20} />
              <Text style={[styles.segmentText, activeSegment === 'interests' && styles.segmentTextActive]}>Hakkımda</Text>
           </TouchableOpacity>
        </View>

        {/* CONTENT */}
        {activeSegment === 'posts' ? (
           <View style={styles.postsContainer}>
              {isLoading ? (
                 <ActivityIndicator color="#a855f7" style={{ marginVertical: 35, width: '100%' }} />
              ) : (
                <>
                  {posts.map((post) => (
                    <PostItem 
                      key={post.id}
                      post={post}
                      userId={user?.uid || ''}
                      isDark={isDark}
                      language={language as any}
                      onMorePress={() => {
                        setSelectedPost(post);
                        setShowSheet(true);
                      }}
                    />
                  ))}
                  {posts.length === 0 && (
                     <View style={styles.emptyStateWrapper}>
                        <Layout color="rgba(150,150,150,0.3)" size={48} />
                        <Text style={styles.emptyStateText}>Henüz hiç gönderi paylaşmamışsın.</Text>
                     </View>
                  )}
                </>
              )}
              <TouchableOpacity style={styles.addPostBtn} onPress={() => router.push('/create-post')}>
                 <LinearGradient colors={['#a855f7', '#8b5cf6']} style={styles.addPostGradient}>
                    <Plus color="#FFF" size={24} />
                    <Text style={styles.addPostBtnText}>Yeni Gönderi Paylaş</Text>
                 </LinearGradient>
              </TouchableOpacity>
           </View>
        ) : (
           <View style={styles.interestsContainer}>
               <Text style={[styles.sectionHeading, !isDark && { color: '#000' }]}>Nelerden Hoşlanırım?</Text>
               <View style={styles.interestChips}>
                  {(user?.interests?.length ? user.interests : ['🎵 Müzik', '✈️ Seyahat', '☕ Kahve', '🎮 Oyun', '📸 Fotoğrafçılık', '🍔 Gurme', '🎬 Sinema']).map((interest, idx) => (
                      <View key={idx} style={styles.interestChip}>
                          <LinearGradient colors={isDark ? ['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.05)'] : ['#f3e8ff', '#e9d5ff']} style={StyleSheet.absoluteFillObject} />
                          <Text style={[styles.interestText, !isDark && { color: '#7e22ce' }]}>{interest}</Text>
                      </View>
                  ))}
               </View>

               <Text style={[styles.sectionHeading, !isDark && { color: '#000' }, { marginTop: 30 }]}>Biyografi</Text>
               <Text style={[styles.bioText, !isDark && { color: '#444' }]}>
                 {user?.bio || 'Kendinden bahsetmek ister misin? Profilini düzenleyerek bir biyografi ekleyebilirsin.'}
               </Text>
           </View>
        )}
        
        <View style={{ height: 120 }} /> 
      </ScrollView>

      <ActionSheet 
        visible={showSheet} 
        onClose={() => setShowSheet(false)} 
        options={menuOptions} 
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  background: { ...StyleSheet.absoluteFillObject },
  scrollContent: { },
  
  coverPhotoContainer: { height: height * 0.5, justifyContent: 'flex-end', paddingBottom: 20 },
  coverPhoto: { ...StyleSheet.absoluteFillObject },
  coverGradient: { ...StyleSheet.absoluteFillObject },
  
  topNav: { position: 'absolute', top: 60, right: 20, flexDirection: 'row', gap: 12 },
  navBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },

  profileHeader: { alignItems: 'center' },
  avatarWrapper: {
    width: 120, height: 120, borderRadius: 60, padding: 4, 
    backgroundColor: 'rgba(139, 92, 246, 0.3)', marginBottom: 15,
    shadowColor: '#8b5cf6', shadowOpacity: 0.5, shadowRadius: 20, elevation: 10
  },
  avatar: { width: '100%', height: '100%', borderRadius: 60, borderWidth: 3, borderColor: '#FFF' },
  onlineStatus: {
    position: 'absolute', bottom: 5, right: 10, width: 22, height: 22, 
    borderRadius: 11, backgroundColor: '#10b981', borderWidth: 4, borderColor: '#0f172a'
  },
  
  userName: { color: '#FFF', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  locationText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600', marginLeft: 4 },

  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 25, backgroundColor: 'rgba(255,255,255,0.03)', alignSelf: 'center',
    paddingHorizontal: 25, paddingVertical: 15, borderRadius: 25, gap: 15,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  statItem: { alignItems: 'center' },
  statValue: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' },

  segmentControl: {
    flexDirection: 'row', marginHorizontal: 20, marginVertical: 25,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 5
  },
  segmentBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 16, gap: 8
  },
  segmentBtnActive: { backgroundColor: '#8b5cf6' },
  segmentText: { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: '700' },
  segmentTextActive: { color: '#FFF' },

  postsContainer: { paddingHorizontal: 20 },
  emptyStateWrapper: { width: '100%', alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyStateText: { color: 'rgba(150,150,150,0.5)', fontSize: 13, marginTop: 10, fontWeight: '600', textAlign: 'center' },

  addPostBtn: { marginTop: 10, borderRadius: 15, overflow: 'hidden' },
  addPostGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, gap: 10 },
  addPostBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  interestsContainer: { paddingHorizontal: 25 },
  sectionHeading: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 20 },
  interestChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  interestChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.3)'
  },
  interestText: { color: '#d8b4fe', fontSize: 14, fontWeight: '600' },
  bioText: { color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 24 }
});
