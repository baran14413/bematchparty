import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, Pressable } from 'react-native';
import { useAppStore } from '@/src/utils/store';
import { translations } from '@/src/utils/i18n';
import { Colors } from '@/src/theme';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Heart, MessageCircle, User as UserIcon, AtSign, Eye, CheckCheck, Trash2, Bell } from 'lucide-react-native';
import { subscribeToNotifications, markAsRead, markAllAsRead, Notification, NotificationType } from '@/src/utils/notificationService';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const NotificationIcon = ({ type, color }: { type: NotificationType, color: string }) => {
  switch (type) {
    case 'like': return <Heart size={14} color={color} fill={color} />;
    case 'comment': return <MessageCircle size={14} color={color} fill={color} />;
    case 'visit': return <Eye size={14} color={color} fill={color} />;
    case 'mention': return <AtSign size={14} color={color} />;
    case 'follow': return <UserIcon size={14} color={color} fill={color} />;
    default: return <Bell size={14} color={color} />;
  }
};

export default function NotificationsScreen() {
  const { user, language, theme } = useAppStore();
  const t = translations[language] as any;
  const isDark = theme === 'dark';
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | NotificationType>('all');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: 'all', label: t.allNotif, icon: null },
    { id: 'like', label: t.likesNotif, icon: Heart },
    { id: 'comment', label: t.commentsNotif, icon: MessageCircle },
    { id: 'visit', label: t.visitorsNotif, icon: Eye },
    { id: 'mention', label: t.mentionsNotif, icon: AtSign },
    { id: 'follow', label: t.followsNotif, icon: UserIcon },
  ];

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    const unsubscribe = subscribeToNotifications(user.uid, (data) => {
      setNotifications(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const filteredNotifications = useMemo(() => {
    if (activeCategory === 'all') return notifications;
    return notifications.filter(n => n.type === activeCategory);
  }, [notifications, activeCategory]);

  const formatTime = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;

    if (diff < 60) return t.now || 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const getNotifMessage = (item: Notification) => {
    switch (item.type) {
      case 'like': return t.likedYourPost;
      case 'comment': return t.commentedOnYourPost;
      case 'visit': return t.visitedYourProfile;
      case 'mention': return t.mentionedYou;
      case 'follow': return t.startedFollowingYou;
      default: return '';
    }
  };

  const handleNotificationPress = (item: Notification) => {
    markAsRead(item.id);
    if (item.postId) {
       // Logic to open post detail or navigate
       // router.push({ pathname: '/(tabs)/feed', params: { postId: item.postId } });
    } else if (item.type === 'visit' || item.type === 'follow') {
       router.push(`/user/${item.fromUid}` as any);
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <View style={[styles.notifWrapper, !item.isRead && styles.notifUnread]}>
      <Pressable 
        style={({ pressed }) => [styles.notifItem, pressed && { backgroundColor: 'rgba(255,255,255,0.03)' }]}
        onPress={() => handleNotificationPress(item)}
      >
        <TouchableOpacity style={styles.avatarContainer} onPress={() => router.push(`/user/${item.fromUid}` as any)}>
          <Image source={{ uri: item.fromAvatar }} style={styles.avatar} />
          <View style={[styles.typeBadge, { backgroundColor: item.type === 'like' ? '#ec4899' : item.type === 'comment' ? '#a855f7' : '#3b82f6' }]}>
            <NotificationIcon type={item.type} color="#FFF" />
          </View>
        </TouchableOpacity>

        <View style={styles.notifContent}>
          <Text style={[styles.notifText, !isDark && { color: '#000' }]} numberOfLines={2}>
            <Text style={styles.userName}>{item.fromName} </Text>
            {getNotifMessage(item)}
          </Text>
          {item.text && (
             <Text style={styles.commentPreview} numberOfLines={1}>"{item.text}"</Text>
          )}
          <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
        </View>
        
        {!item.isRead && <View style={styles.unreadDot} />}
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      {isDark && <LinearGradient colors={['#0f172a', '#1e1b4b']} style={styles.gradient} />}
      
      {/* HEADER */}
      <View style={[styles.header, !isDark && styles.headerLight]}>
        <Text style={[styles.headerTitle, !isDark && { color: '#000' }]}>{t.notificationsTab}</Text>
        <TouchableOpacity style={styles.markReadBtn} onPress={() => user && markAllAsRead(user.uid)}>
           <CheckCheck color={isDark ? "#a855f7" : "#7c3aed"} size={20} />
           <Text style={styles.markReadText}>{t.markAllRead}</Text>
        </TouchableOpacity>
      </View>

      {/* CATEGORIES */}
      <View style={styles.categoryWrap}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.categoryBtn, activeCategory === item.id && styles.categoryBtnActive]}
              onPress={() => setActiveCategory(item.id as any)}
            >
              {item.icon && <item.icon size={16} color={activeCategory === item.id ? "#FFF" : "rgba(255,255,255,0.5)"} style={{ marginRight: 6 }} />}
              <Text style={[styles.categoryLabel, activeCategory === item.id && styles.categoryLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Bell size={64} color="rgba(255,255,255,0.05)" style={{ marginBottom: 20 }} />
              <Text style={styles.emptyText}>{t.noNotifications}</Text>
            </View>
          ) : (
            <ActivityIndicator color="#a855f7" size="large" style={{ marginTop: 50 }} />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  gradient: { ...StyleSheet.absoluteFillObject },
  
  header: {
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 15,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    zIndex: 10
  },
  headerLight: { backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  headerTitle: { color: '#FFF', fontSize: 26, fontWeight: '900' },
  markReadBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  markReadText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600' },

  categoryWrap: { paddingVertical: 10 },
  categoryList: { paddingHorizontal: 15, gap: 10 },
  categoryBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  categoryBtnActive: { backgroundColor: '#a855f7', borderColor: '#a855f7' },
  categoryLabel: { color: 'rgba(255,255,255,0.6)', fontWeight: '700', fontSize: 13 },
  categoryLabelActive: { color: '#FFF' },

  listContent: { paddingBottom: 100 },
  notifWrapper: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  notifUnread: { backgroundColor: 'rgba(168, 85, 247, 0.05)' },
  notifItem: { flexDirection: 'row', alignItems: 'center', padding: 15, gap: 12 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.1)' },
  typeBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#1e1b4b'
  },
  notifContent: { flex: 1 },
  notifText: { color: '#FFF', fontSize: 14, lineHeight: 20 },
  userName: { fontWeight: '800' },
  commentPreview: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4, fontStyle: 'italic' },
  timeText: { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#a855f7', marginLeft: 10 },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 16, fontWeight: '600' }
});
