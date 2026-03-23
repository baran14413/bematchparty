import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, FlatList } from 'react-native';
import { Colors } from '@/src/theme';
import { useAppStore } from '@/src/utils/store';
import { translations } from '@/src/utils/i18n';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Search, Flame, Pin, Check, CheckCheck, SlidersHorizontal, Plus, MoreHorizontal } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { listenToConversations, Conversation } from '@/src/utils/chatService';
import { useEffect } from 'react';

const { width, height } = Dimensions.get('window');

const MOCK_STORIES = [
  { id: '1', name: 'Sen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default&backgroundColor=0f172a', hasStory: false, isUser: true },
  { id: '2', name: 'Alina', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alina&backgroundColor=ffb6c1', hasStory: true, isLive: true },
  { id: '3', name: 'Burak', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Burak&backgroundColor=b6e3ff', hasStory: true },
  { id: '4', name: 'Can', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Can&backgroundColor=fffb6c', hasStory: true },
  { id: '5', name: 'Zeynep', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zeynep&backgroundColor=b6ffc1', hasStory: true },
];

const MOCK_CHATS = [
  { 
     id: '1', name: 'Cansu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cansu&backgroundColor=e6b6ff', 
     lastMessage: 'Yarın kahve içmeye ne dersin? ☕', time: '12:45', unread: 2, isOnline: true, isPinned: true 
  },
  { 
     id: '2', name: 'Can', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Can&backgroundColor=b6e3ff', 
     lastMessage: 'Tamamdır, haberleşiriz dostum.', time: 'Dün', unread: 0, isOnline: false, isPinned: false, readReceipt: true
  },
  { 
     id: '3', name: 'Gizem (Yeni Eşleşme)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gizem&backgroundColor=ffcfc1', 
     lastMessage: 'Sohbeti başlat 👋', time: 'Prş', unread: 1, isOnline: true, isPinned: false, isNewMatch: true
  },
  { 
     id: '4', name: 'Efe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Efe&backgroundColor=ffffb6', 
     lastMessage: 'O maçı kesin biz alırız!', time: 'Pzt', unread: 0, isOnline: false, isPinned: false, readReceipt: false
  },
  { 
     id: '5', name: 'Zeynep', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zeynep&backgroundColor=b6ffc1', 
     lastMessage: 'Mükemmel bir fotoğraf 📸', time: '12 Haz', unread: 0, isOnline: false, isPinned: false, readReceipt: true
  },
];



export default function MessagesScreen() {
  const { user, theme, language } = useAppStore();
  const t = translations[language];
  const isDark = theme === 'dark';
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(language === 'tr' ? 'Tümü' : 'All');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = listenToConversations(user.uid, (data) => {
      if (data.length > 0) {
        setConversations(data);
      } else {
        // Fallback to mock for demo if no real chats exist
        setConversations(MOCK_CHATS as any);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const renderStory = ({ item }: { item: typeof MOCK_STORIES[0] }) => (
    <View style={styles.storyWrap}>
      <TouchableOpacity 
        style={[styles.storyRing, item.hasStory && styles.storyRingActive, item.isLive && styles.storyRingLive]}
        onPress={() => router.push(`/user/${item.id}` as any)}
      >
         <Image source={{ uri: item.avatar }} style={styles.storyAvatar} />
         {item.isUser && (
            <View style={styles.addStoryBadge}>
               <Plus color="#FFF" size={14} strokeWidth={3} />
            </View>
         )}
         {item.isLive && (
            <View style={styles.liveTagBadge}>
               <Text style={styles.liveTagText}>CANLI</Text>
            </View>
         )}
      </TouchableOpacity>
      <Text style={[styles.storyName, !isDark && { color: '#000' }]} numberOfLines={1}>
         {item.name}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {isDark && <LinearGradient colors={['#0f172a', '#1e1b4b']} style={styles.background} />}
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, !isDark && { color: '#000' }]}>{t.messagesTab || 'Mesajlar'}</Text>
        <TouchableOpacity style={styles.headerIconBtn}>
           <MoreHorizontal color={isDark ? "#FFF" : "#000"} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* SEARCH BAR (Glassmorphism) */}
        <View style={styles.searchContainer}>
           <BlurView intensity={isDark ? 30 : 60} tint={isDark ? "dark" : "light"} style={styles.searchBlur}>
              <Search color={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"} size={20} />
              <TextInput 
                 style={[styles.searchInput, !isDark && { color: '#000' }]}
                 placeholder="Sohbetlerde veya kişilerde ara..."
                 placeholderTextColor={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
                 value={searchQuery}
                 onChangeText={setSearchQuery}
              />
              <TouchableOpacity style={styles.filterBtn}>
                 <SlidersHorizontal color={isDark ? "#FFF" : "#000"} size={18} />
              </TouchableOpacity>
           </BlurView>
        </View>

        {/* HORIZONTAL MATCHES & STORIES */}
        <View style={styles.storiesSection}>
           <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={MOCK_STORIES}
              keyExtractor={i => i.id}
              renderItem={renderStory}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 15 }}
           />
        </View>

        {/* TABS (Segment Control) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
           {(language === 'tr' ? ['Tümü', 'Okunmamış', 'Eşleşmeler', 'Gruplar'] : ['All', 'Unread', 'Matches', 'Groups']).map(tab => (
              <TouchableOpacity 
                 key={tab} 
                 onPress={() => setActiveTab(tab)} 
                 style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive, !isDark && activeTab === tab && { backgroundColor: '#8b5cf6' }]}
              >
                 <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive, !isDark && { color: 'rgba(0,0,0,0.5)' }, activeTab === tab && !isDark && { color: '#FFF' }]}>
                    {tab}
                 </Text>
              </TouchableOpacity>
           ))}
        </ScrollView>

         <View style={styles.chatList}>
            {conversations.map((chat) => {
               const displayName = chat.otherUser?.displayName || (chat as any).name || 'Bilinmeyen';
               const avatarUrl = chat.otherUser?.photoURL || (chat as any).avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky';
               const time = chat.lastMessageTime?.toDate 
                 ? chat.lastMessageTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                 : ((chat as any).time || '...');
               
               const unread = chat.unreadCount !== undefined ? chat.unreadCount : (chat as any).unread || 0;
               const isOnline = chat.otherUser?.isOnline || (chat as any).isOnline || false;

               return (
               <TouchableOpacity 
                  key={chat.id} 
                  style={[styles.chatRow, !isDark && styles.chatRowLight]} 
                  activeOpacity={0.7}
                  onPress={() => router.push({ 
                    pathname: '/chat/[id]', 
                    params: { id: chat.otherUser?.uid || chat.id, name: displayName, avatar: avatarUrl }
                  })}
               >
                  
                  <TouchableOpacity 
                    style={styles.avatarWrap}
                    onPress={() => router.push(`/user/${chat.otherUser?.uid || chat.id}` as any)}
                  >
                     <Image source={{ uri: avatarUrl }} style={styles.chatAvatar} />
                     {isOnline && <View style={styles.onlineIndicator} />}
                  </TouchableOpacity>
 
                  <View style={styles.chatInfoWrap}>
                     <View style={styles.chatNameRow}>
                        <Text style={[styles.chatName, !isDark && { color: '#000' }]}>{displayName}</Text>
                        <Text style={[styles.chatTime, unread > 0 && { color: '#8b5cf6', fontWeight: '800' }]}>{time}</Text>
                     </View>
                     
                     <View style={styles.chatMsgRow}>
                        <Text 
                           style={[styles.lastMsg, !isDark && { color: 'rgba(0,0,0,0.6)' }, unread > 0 && { color: isDark ? '#FFF' : '#000', fontWeight: '700' }]} 
                           numberOfLines={1}
                        >
                           {(chat as any).isNewMatch && '🔥 '}{chat.lastMessage}
                        </Text>
                        
                        <View style={styles.chatRightIcons}>
                           {(chat as any).isPinned && <Pin color="rgba(150,150,150,0.8)" size={14} style={{ marginRight: 6, transform: [{rotate: '45deg'}] }} />}
                           
                           {unread > 0 ? (
                              <LinearGradient colors={['#a855f7', '#7e22ce']} style={styles.unreadBadge}>
                                 <Text style={styles.unreadText}>{unread}</Text>
                              </LinearGradient>
                           ) : (
                              (chat as any).lastSenderId === user?.uid && (
                                 <View style={{ marginLeft: 5 }}>
                                    {(chat as any).readReceipt || true // Mocking read receipts for existing chats
                                      ? <CheckCheck color="#3b82f6" size={16} /> 
                                      : <Check color="rgba(150,150,150,0.5)" size={16} />
                                    }
                                 </View>
                              )
                           )}
                        </View>
                     </View>
                  </View>
               </TouchableOpacity>
               );
            })}
         </View>

        <View style={{ height: 120 }} />
      </ScrollView>

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
  headerTitle: { color: '#FFF', fontSize: 32, fontWeight: '900', letterSpacing: -0.5 },
  headerIconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  
  scrollContent: { paddingTop: 10 },

  searchContainer: { paddingHorizontal: 20, marginBottom: 25 },
  searchBlur: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 15,
    height: 56, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden'
  },
  searchInput: { flex: 1, color: '#FFF', fontSize: 16, marginLeft: 12, height: '100%' },
  filterBtn: { padding: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10 },

  storiesSection: { marginBottom: 25 },
  storyWrap: { alignItems: 'center', width: 72 },
  storyRing: {
    width: 66, height: 66, borderRadius: 33, borderWidth: 2, borderColor: 'transparent',
    justifyContent: 'center', alignItems: 'center', padding: 3
  },
  storyRingActive: { borderColor: '#8b5cf6' },
  storyRingLive: { borderColor: '#e11d48', borderStyle: 'dashed' },
  storyAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(150,150,150,0.2)' },
  addStoryBadge: {
    position: 'absolute', bottom: 0, right: 0, backgroundColor: '#8b5cf6',
    width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#0f172a'
  },
  liveTagBadge: {
    position: 'absolute', bottom: -6, backgroundColor: '#e11d48',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 2, borderColor: '#0f172a'
  },
  liveTagText: { color: '#FFF', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  storyName: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', marginTop: 8 },

  tabsScroll: { paddingHorizontal: 20, gap: 10, marginBottom: 20, maxHeight: 40 },
  tabBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  tabBtnActive: { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' },
  tabText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '700' },
  tabTextActive: { color: '#FFF', fontWeight: '800' },

  chatList: { gap: 8, paddingHorizontal: 15 },
  chatRow: { 
     flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 15,
     backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  chatRowLight: { backgroundColor: '#FFF', borderColor: 'rgba(0,0,0,0.05)', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  
  avatarWrap: { marginRight: 15 },
  chatAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(150,150,150,0.2)' },
  onlineIndicator: {
    position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#10b981', borderWidth: 2, borderColor: '#0f172a'
  },
  
  chatInfoWrap: { flex: 1, justifyContent: 'center' },
  chatNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  chatName: { color: '#FFF', fontSize: 17, fontWeight: '800' },
  chatTime: { color: 'rgba(150,150,150,0.6)', fontSize: 12, fontWeight: '600' },
  
  chatMsgRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMsg: { flex: 1, color: 'rgba(255,255,255,0.6)', fontSize: 14, paddingRight: 10 },
  
  chatRightIcons: { flexDirection: 'row', alignItems: 'center' },
  unreadBadge: {
    paddingHorizontal: 8, minWidth: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', shadowColor: '#a855f7', shadowOpacity: 0.5, shadowRadius: 5
  },
  unreadText: { color: '#FFF', fontSize: 12, fontWeight: '800' }
});
