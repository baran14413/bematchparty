import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/src/utils/store';
import { translations } from '@/src/utils/i18n';
import { sendNotification } from '@/src/utils/notificationService';
import { getUserProfile, followUser, unfollowUser, checkFollowStatus, getUserStats, getUserPosts, recordProfileVisit } from '@/src/utils/userService';
import { PostItem } from '@/src/components/PostItem';
import { ActionSheet } from '@/src/components/ActionSheet';
import { ArrowLeft, MessageCircle, UserPlus, UserMinus, MoreHorizontal, MapPin, Sparkles, Layout, ThumbsDown, ShieldAlert } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const { user: currentUser, language, theme } = useAppStore();
  const t = translations[language];
  const isDark = theme === 'dark';
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [stats, setStats] = useState({ followers: 0, following: 0, visits: 0 });
  const [activeSegment, setActiveSegment] = useState('posts');
  const [posts, setPosts] = useState<any[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(true);

  // Action Sheet States
  const [showSheet, setShowSheet] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id]);

  const fetchProfile = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [data, followStatus, userStats, userPosts] = await Promise.all([
        getUserProfile(id as string),
        currentUser ? checkFollowStatus(id as string, currentUser.uid) : Promise.resolve(false),
        getUserStats(id as string),
        getUserPosts(id as string)
      ]);

      if (data) {
        setProfile(data);
        setIsFollowing(followStatus);
        setStats(userStats);
        setPosts(userPosts);
        setIsPostsLoading(false);
        
        // PROFİL ZİYARETİ KAYDI
        if (currentUser && currentUser.uid !== id) {
          recordProfileVisit(id as string, currentUser.uid);
          await sendNotification(
            id as string,
            currentUser.uid,
            currentUser.displayName || 'BeMatch User',
            currentUser.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg',
            'visit'
          );
        }
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const menuOptions = [
    { label: 'Beğenmedim', icon: ThumbsDown, onPress: () => console.log('Disliked') },
    { label: 'Şikayet Et', icon: ShieldAlert, color: '#ef4444', onPress: () => console.log('Reported') }
  ];

  const handleFollow = async () => {
    if (!currentUser || !profile || isFollowLoading) return;
    
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        const success = await unfollowUser(profile.uid, currentUser.uid);
        if (success) {
          setIsFollowing(false);
          setStats(prev => ({ ...prev, followers: Math.max(0, prev.followers - 1) }));
        }
      } else {
        const success = await followUser(
          profile.uid, 
          currentUser.uid, 
          currentUser.displayName || 'User', 
          currentUser.photoURL || ''
        );
        if (success) {
          setIsFollowing(true);
          setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
        }
      }
    } catch (error) {
      console.error("Follow error:", error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const navigateToStats = (type: 'followers' | 'following' | 'visits') => {
    if (!id) return;
    router.push({
      pathname: '/user/stats',
      params: { uid: id as string, type }
    } as any);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        {isDark && <LinearGradient colors={['#0f172a', '#1e1b4b']} style={StyleSheet.absoluteFillObject} />}
        <ActivityIndicator color="#a855f7" size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: isDark ? '#FFF' : '#000' }}>Kullanıcı bulunamadı.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isDark && <LinearGradient colors={['#0f172a', '#1e1b4b']} style={styles.gradient} />}
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        {/* COVER & HEADER */}
        <View style={styles.header}>
          <Image 
            source={{ uri: posts.find(p => p.imageUrl)?.imageUrl || profile.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg' }} 
            style={styles.coverImage}
            contentFit="cover"
          />
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
             <ArrowLeft color="#FFF" size={24} />
          </TouchableOpacity>

          <View style={styles.profileInfoOverlay}>
             <Image source={{ uri: profile.photoURL }} style={styles.mainAvatar} />
             <Text style={styles.profileName}>{profile.displayName}, {profile.age || '?'}</Text>
             <View style={styles.locationRow}>
                <MapPin size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.locationText}>İstanbul, TR</Text>
             </View>
          </View>
        </View>

        {/* ACTIONS */}
        <View style={styles.actionsRow}>
           <TouchableOpacity 
             style={[styles.actionBtn, isFollowing && styles.followingBtn, isFollowLoading && { opacity: 0.7 }]} 
             onPress={handleFollow}
             disabled={isFollowLoading}
           >
              {isFollowLoading ? (
                 <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  {isFollowing ? <UserMinus size={20} color="#FFF" /> : <UserPlus size={20} color="#FFF" />}
                  <Text style={styles.actionBtnText}>{isFollowing ? 'Takibi Bırak' : 'Takip Et'}</Text>
                </>
              )}
           </TouchableOpacity>
           <TouchableOpacity 
              style={styles.messageBtn} 
              onPress={() => router.push({
                pathname: '/chat/[id]',
                params: { id: profile.uid, name: profile.displayName, avatar: profile.photoURL }
              } as any)}
           >
              <MessageCircle size={20} color="#FFF" />
           </TouchableOpacity>
           <TouchableOpacity style={styles.moreBtn}>
              <MoreHorizontal size={20} color="#FFF" />
           </TouchableOpacity>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
           <TouchableOpacity style={styles.statItem} onPress={() => navigateToStats('followers')}>
              <Text style={styles.statValue}>{stats.followers}</Text>
              <Text style={styles.statLabel}>{language === 'tr' ? 'Takipçi' : 'Followers'}</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.statItem} onPress={() => navigateToStats('following')}>
              <Text style={styles.statValue}>{stats.following}</Text>
              <Text style={styles.statLabel}>{language === 'tr' ? 'Takip' : 'Following'}</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.statItem} onPress={() => navigateToStats('visits')}>
              <Text style={styles.statValue}>{stats.visits}</Text>
              <Text style={styles.statLabel}>{language === 'tr' ? 'Ziyaretler' : 'Visits'}</Text>
           </TouchableOpacity>
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
              {isPostsLoading ? (
                 <ActivityIndicator color="#a855f7" style={{ marginVertical: 35, width: '100%' }} />
              ) : (
                <>
                  {posts.map((post: any) => (
                    <PostItem 
                      key={post.id}
                      post={post}
                      userId={currentUser?.uid || ''}
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
                        <Text style={styles.emptyStateText}>Henüz hiç gönderi paylaşmamış.</Text>
                     </View>
                  )}
                </>
              )}
           </View>
        ) : (
           <View style={styles.section}>
              <Text style={[styles.sectionTitle, !isDark && { color: '#000' }]}>İlgi Alanları</Text>
              <View style={styles.interestsGrid}>
                 {(profile.interests || []).map((it: string, idx: number) => (
                   <View key={idx} style={styles.interestChip}>
                      <Text style={styles.interestText}>{it}</Text>
                   </View>
                 ))}
              </View>
              
              <Text style={[styles.sectionTitle, !isDark && { color: '#000' }, { marginTop: 30 }]}>Hakkımda</Text>
              <Text style={[styles.bioText, !isDark && { color: '#444' }]}>
                 {profile.bio || 'Merhaba! BeMatch dünyasına yeni katıldım.'}
              </Text>
           </View>
        )}
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
  container: { flex: 1, backgroundColor: '#FFF' },
  gradient: { ...StyleSheet.absoluteFillObject },
  header: { height: 400, position: 'relative' },
  coverImage: { width: '100%', height: '100%' },
  backBtn: { position: 'absolute', top: 50, left: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  profileInfoOverlay: { position: 'absolute', bottom: 30, left: 20 },
  mainAvatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#a855f7', marginBottom: 15 },
  profileName: { color: '#FFF', fontSize: 28, fontWeight: '900' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  locationText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600' },

  actionsRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 20, gap: 12 },
  actionBtn: { flex: 1, height: 50, borderRadius: 25, backgroundColor: '#a855f7', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  followingBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  actionBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  messageBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  moreBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, marginTop: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  statItem: { alignItems: 'center' },
  statValue: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600', marginTop: 4 },

  segmentControl: {
    flexDirection: 'row', marginHorizontal: 20, marginTop: 25, marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 5
  },
  segmentBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 16, gap: 8 },
  segmentBtnActive: { backgroundColor: '#a855f7' },
  segmentText: { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: '700' },
  segmentTextActive: { color: '#FFF' },

  postsContainer: { paddingHorizontal: 20 },
  emptyStateWrapper: { width: '100%', alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyStateText: { color: 'rgba(150,150,150,0.5)', fontSize: 13, marginTop: 10, fontWeight: '600', textAlign: 'center' },

  section: { paddingHorizontal: 20 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 15 },
  bioText: { color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 22 },
  
  interestsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  interestChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(168, 85, 247, 0.1)', borderWidth: 1, borderColor: 'rgba(168, 85, 247, 0.2)' },
  interestText: { color: '#a855f7', fontSize: 13, fontWeight: '700' },
});
