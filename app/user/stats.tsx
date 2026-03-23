import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, Dimensions, Pressable 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/src/utils/store';
import { translations } from '@/src/utils/i18n';
import { 
  getFollowers, getFollowingUsers, getProfileVisits, 
  followUser, unfollowUser, checkFollowStatus 
} from '@/src/utils/userService';
import { ChevronLeft, UserPlus, UserMinus, Search, Users, Eye } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
  const { uid, type } = useLocalSearchParams();
  const { user: currentUser, theme, language } = useAppStore();
  const t = translations[language] as any;
  const isDark = theme === 'dark';
  const router = useRouter();

  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, [uid, type]);

  const fetchData = async () => {
    if (!uid) return;
    setIsLoading(true);
    let results = [];
    
    try {
      if (type === 'followers') {
        results = await getFollowers(uid as string);
      } else if (type === 'following') {
        results = await getFollowingUsers(uid as string);
      } else if (type === 'visits') {
        results = await getProfileVisits(uid as string);
      }
      
      setData(results.filter(Boolean)); // Filter out any null profiles

      // Check follow status for all users in the list
      if (currentUser) {
        const statusMap: Record<string, boolean> = {};
        await Promise.all(results.map(async (u: any) => {
          if (u && u.uid !== currentUser.uid) {
            const isFollowing = await checkFollowStatus(u.uid, currentUser.uid);
            statusMap[u.uid] = isFollowing;
          }
        }));
        setFollowingMap(statusMap);
      }
    } catch (err) {
      console.error("Error fetching stats data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowToggle = async (targetUser: any) => {
    if (!currentUser || !targetUser) return;
    const targetUid = targetUser.uid;
    const isCurrentlyFollowing = followingMap[targetUid];

    try {
      if (isCurrentlyFollowing) {
        const success = await unfollowUser(targetUid, currentUser.uid);
        if (success) {
          setFollowingMap(prev => ({ ...prev, [targetUid]: false }));
        }
      } else {
        const success = await followUser(
          targetUid, 
          currentUser.uid, 
          currentUser.displayName || 'User', 
          currentUser.photoURL || ''
        );
        if (success) {
          setFollowingMap(prev => ({ ...prev, [targetUid]: true }));
        }
      }
    } catch (err) {
      console.error("Follow toggle error:", err);
    }
  };

  const getTitle = () => {
    if (type === 'followers') return language === 'tr' ? 'Takipçiler' : 'Followers';
    if (type === 'following') return language === 'tr' ? 'Takip Edilenler' : 'Following';
    if (type === 'visits') return language === 'tr' ? 'Ziyaretçiler' : 'Visitors';
    return '';
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.userItem}>
       <TouchableOpacity 
         style={styles.userInfo} 
         onPress={() => router.push(`/user/${item.uid}` as any)}
       >
          <Image source={{ uri: item.photoURL }} style={styles.avatar} />
          <View>
             <Text style={[styles.userName, !isDark && { color: '#000' }]}>{item.displayName}</Text>
             <Text style={styles.userBio} numberOfLines={1}>{item.bio || 'BeMatch User'}</Text>
          </View>
       </TouchableOpacity>

       {currentUser && item.uid !== currentUser.uid && (
          <TouchableOpacity 
            style={[styles.followBtn, followingMap[item.uid] && styles.followingBtn]} 
            onPress={() => handleFollowToggle(item)}
          >
             {followingMap[item.uid] ? (
                <UserMinus size={18} color="rgba(255,255,255,0.6)" />
             ) : (
                <UserPlus size={18} color="#FFF" />
             )}
          </TouchableOpacity>
       )}
    </View>
  );

  return (
    <View style={[styles.container, !isDark && { backgroundColor: '#FAFAFA' }]}>
      {isDark && <LinearGradient colors={['#0f172a', '#1e1b4b']} style={StyleSheet.absoluteFillObject} />}
      
      {/* HEADER */}
      <View style={[styles.header, !isDark && styles.headerLight]}>
         <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft color={isDark ? "#FFF" : "#000"} size={28} />
         </TouchableOpacity>
         <Text style={[styles.headerTitle, !isDark && { color: '#000' }]}>{getTitle()}</Text>
         <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
           <ActivityIndicator color="#a855f7" size="large" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.uid}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCenter}>
               {type === 'visits' ? <Eye size={64} color="rgba(150,150,150,0.2)" /> : <Users size={64} color="rgba(150,150,150,0.2)" />}
               <Text style={styles.emptyText}>{language === 'tr' ? 'Henüz kimse yok...' : 'No one here yet...'}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingTop: 60, paddingHorizontal: 15, paddingBottom: 15,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  headerLight: { backgroundColor: '#FFF', borderBottomColor: 'rgba(0,0,0,0.05)' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20, paddingBottom: 100 },
  
  userItem: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 15, flex: 1 },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(150,150,150,0.1)' },
  userName: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  userBio: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 },
  
  followBtn: { 
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#a855f7', 
    justifyContent: 'center', alignItems: 'center' 
  },
  followingBtn: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  
  emptyCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 150 },
  emptyText: { color: 'rgba(150,150,150,0.5)', fontSize: 16, marginTop: 15, fontWeight: '600' }
});
