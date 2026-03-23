import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, TouchableOpacity, 
  Dimensions, ActivityIndicator, Pressable, TextInput, 
  KeyboardAvoidingView, Platform, Modal, Alert 
} from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/src/utils/store';
import { translations } from '@/src/utils/i18n';
import { 
  Search, Bell, MoreHorizontal, Heart, MessageCircle, 
  Send, X, Smile, AtSign, Flame, Clock, Users, ShieldAlert, ThumbsDown
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { 
  subscribeToPosts, Post, toggleLike, addComment, 
  subscribeToComments, Comment, deletePost
} from '@/src/utils/postService';
import { getFollowingUids } from '@/src/utils/userService';
import { PostItem } from '@/src/components/PostItem';
import { ActionSheet } from '@/src/components/ActionSheet';

const { width, height } = Dimensions.get('window');

export default function KeşfetScreen() {
  const { user, theme, language } = useAppStore();
  const t = translations[language] as any;
  const isDark = theme === 'dark';
  const router = useRouter();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [followingUids, setFollowingUids] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<'for_you' | 'following' | 'latest'>('for_you');
  const [activeHashtag, setActiveHashtag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Action Sheet States
  const [showSheet, setShowSheet] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToPosts((data) => {
      setPosts(data);
      setIsLoading(false);
    }, activeHashtag || undefined);

    if (user) {
      getFollowingUids(user.uid).then(setFollowingUids);
    }

    return () => unsubscribe();
  }, [activeHashtag, user]);

  const filteredPosts = useMemo(() => {
    // Kendi gönderilerini görmesin
    const otherPosts = posts.filter(p => p.userId !== user?.uid);

    if (activeCategory === 'following') {
      return otherPosts.filter(p => followingUids.includes(p.userId));
    }
    return otherPosts; // senin için ve en son aynı (en son zaten desc geliyor)
  }, [posts, activeCategory, followingUids, user?.uid]);

  const menuOptions = useMemo(() => {
    if (!selectedPost || !user) return [];
    
    if (selectedPost.userId === user.uid) {
      return [
        { 
          label: 'Düzenle', 
          icon: ShieldAlert, // Logic icon will be handled in profile, but good to have here
          onPress: () => {
             // Discover'da silme yetkisi kullanıcı isteğinde yoktu ama tutarlılık için eklenebilir
             // Şimdilik sadece profile yönlendiriyoruz veya profile'deki aynı mantığı kuruyoruz.
             Alert.alert("Profiline Git", "Gönderilerini profilinden düzenleyebilir veya silebilirsin.");
          }
        }
      ];
    }
    
    return [
      { label: 'Beğenmedim', icon: ThumbsDown, onPress: () => console.log('Disliked') },
      { label: 'Şikayet Et', icon: ShieldAlert, color: '#ef4444', onPress: () => console.log('Reported') }
    ];
  }, [selectedPost, user]);

  return (
    <View style={[styles.container, !isDark && { backgroundColor: '#FAFAFA' }]}>
      {isDark && <LinearGradient colors={['#0f172a', '#1e1b4b']} style={StyleSheet.absoluteFillObject} />}
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, !isDark && { color: '#000' }]}>Keşfet</Text>
          <Text style={styles.headerSubtitle}>BeMatch Dünyasını Keşfet</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notifications' as any)}>
           <Bell color={isDark ? "#FFF" : "#000"} size={24} />
           <View style={styles.notifBadge} />
        </TouchableOpacity>
      </View>

      {/* CATEGORIES */}
      <View style={styles.categoryBar}>
         <TouchableOpacity 
           style={[styles.catItem, activeCategory === 'for_you' && styles.catItemActive]}
           onPress={() => setActiveCategory('for_you')}
         >
            <Flame size={16} color={activeCategory === 'for_you' ? '#FFF' : 'rgba(150,150,150,0.6)'} />
            <Text style={[styles.catText, activeCategory === 'for_you' && styles.catTextActive]}>Senin İçin</Text>
         </TouchableOpacity>

         <TouchableOpacity 
           style={[styles.catItem, activeCategory === 'following' && styles.catItemActive]}
           onPress={() => setActiveCategory('following')}
         >
            <Users size={16} color={activeCategory === 'following' ? '#FFF' : 'rgba(150,150,150,0.6)'} />
            <Text style={[styles.catText, activeCategory === 'following' && styles.catTextActive]}>Takip Edilen</Text>
         </TouchableOpacity>

         <TouchableOpacity 
           style={[styles.catItem, activeCategory === 'latest' && styles.catItemActive]}
           onPress={() => setActiveCategory('latest')}
         >
            <Clock size={16} color={activeCategory === 'latest' ? '#FFF' : 'rgba(150,150,150,0.6)'} />
            <Text style={[styles.catText, activeCategory === 'latest' && styles.catTextActive]}>En Son</Text>
         </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeHashtag && (
          <View style={styles.hashtagHeader}>
            <Text style={styles.hashtagHeaderText}># {activeHashtag}</Text>
            <TouchableOpacity onPress={() => setActiveHashtag(null)}><X color="#a855f7" size={20} /></TouchableOpacity>
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator color="#a855f7" size="large" style={{ marginTop: 50 }} />
        ) : (
          filteredPosts.map((post) => (
            <PostItem 
              key={post.id}
              post={post}
              userId={user?.uid || ''}
              isDark={isDark}
              language={language as any}
              onUserPress={(uid) => router.push(`/user/${uid}` as any)}
              onHashtagPress={(tag) => setActiveHashtag(tag)}
              onMorePress={() => {
                setSelectedPost(post);
                setShowSheet(true);
              }}
            />
          ))
        )}

        {filteredPosts.length === 0 && !isLoading && (
          <View style={styles.emptyContainer}>
            <Search color="rgba(150,150,150,0.3)" size={64} />
            <Text style={styles.emptyText}>Henüz burada bir şey yok...</Text>
          </View>
        )}
        
        <View style={{ height: 100 }} />
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
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 
  },
  headerTitle: { color: '#FFF', fontSize: 28, fontWeight: '900' },
  headerSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600' },
  notifBtn: { 
    width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.05)', 
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' 
  },
  notifBadge: { 
    position: 'absolute', top: 12, right: 12, width: 10, height: 10, 
    borderRadius: 5, backgroundColor: '#ef4444', borderWidth: 2, borderColor: '#0f172a' 
  },

  categoryBar: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15, gap: 10 },
  catItem: { 
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, 
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' 
  },
  catItemActive: { backgroundColor: '#a855f7', borderColor: '#a855f7' },
  catText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '700' },
  catTextActive: { color: '#FFF' },

  scrollContent: { paddingHorizontal: 20 },
  hashtagHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: 'rgba(168, 85, 247, 0.1)', padding: 15, borderRadius: 15, marginBottom: 20 
  },
  hashtagHeaderText: { color: '#a855f7', fontSize: 18, fontWeight: '800' },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: 'rgba(150,150,150,0.5)', fontSize: 16, marginTop: 15, fontWeight: '600' }
});
