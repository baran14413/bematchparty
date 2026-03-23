import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, TextInput, 
  FlatList, KeyboardAvoidingView, Platform, Dimensions, 
  ActivityIndicator, Pressable, Alert, Keyboard, ScrollView 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ChevronLeft, Phone, MoreVertical, Plus, Send, 
  Mic, Image as ImageIcon, CheckCheck, Smile, 
  Reply, Edit, Trash2, X, ShieldAlert, Ban, StopCircle, Trash
} from 'lucide-react-native';
import { Audio } from 'expo-av';
import { VoicePlayer } from '@/src/components/VoicePlayer';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '@/src/utils/store';
import { translations } from '@/src/utils/i18n';
import { 
  sendMessage, listenToMessages, Message, 
  markMessagesAsRead, addReaction, deleteMessage, 
  editMessage, getOrCreateChat, setTypingStatus,
  listenToTypingStatus, listenToUserStatus
} from '@/src/utils/chatService';
import { getUserProfile } from '@/src/utils/userService';
import { ActionSheet } from '@/src/components/ActionSheet';

const { width } = Dimensions.get('window');

export default function ChatDetailScreen() {
  const { id, name, avatar } = useLocalSearchParams();
  const { user: currentUser, theme, language } = useAppStore();
  const t = translations[language] as any;
  const isDark = theme === 'dark';
  const router = useRouter();

  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [otherUser, setOtherUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  
  // Voice States
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef<any>(null);
  
  // Action Sheet / Menu States
  const [showHeaderSheet, setShowHeaderSheet] = useState(false);
  const [showMessageSheet, setShowMessageSheet] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<any>(null);
  const [showFullEmoji, setShowFullEmoji] = useState(false);

  useEffect(() => {
    if (id && currentUser) {
      initChat();
      const unsubUser = listenToUserStatus(id as string, (data: any) => {
        setOtherUser(data);
      });
      return () => unsubUser();
    }
  }, [id, currentUser]);

  useEffect(() => {
    if (chatId && id) {
      const unsubTyping = listenToTypingStatus(chatId, id as string, (isTyping: boolean) => {
        setIsOtherTyping(isTyping);
      });
      return () => unsubTyping();
    }
  }, [chatId, id]);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [recording]);

  const initChat = async () => {
    if (!currentUser || !id) return;
    const cid = await getOrCreateChat(currentUser.uid, id as string);
    if (cid) {
      setChatId(cid);
      const unsubscribeMessages = listenToMessages(cid, (msgData) => {
        setMessages(msgData);
        setIsLoading(false);
        markMessagesAsRead(cid, currentUser.uid).catch(() => {});
      });
      return () => unsubscribeMessages();
    }
  };

  const handleTextChange = (val: string) => {
     setText(val);
     if (!chatId || !currentUser) return;
     setTypingStatus(chatId, currentUser.uid, true);
     if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
     typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(chatId, currentUser.uid, false);
     }, 3000);
  };

  const handleSend = async () => {
    if (!chatId || !currentUser || (!text.trim() && !replyTo && !editingMessageId)) return;
    const msgText = text.trim();
    const replyData = replyTo ? { 
      id: replyTo.id, 
      text: replyTo.text, 
      senderId: replyTo.senderId,
      type: replyTo.type,
      imageUrl: replyTo.imageUrl
    } : null;
    setText('');
    setReplyTo(null);
    Keyboard.dismiss();
    if (editingMessageId) {
      await editMessage(chatId, editingMessageId, msgText);
      setEditingMessageId(null);
    } else {
      await sendMessage(chatId, currentUser.uid, msgText, 'text', { replyTo: replyData });
    }
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
       setPendingImage(result.assets[0].uri);
    }
  };

  const handleSendImage = async () => {
    if (!chatId || !currentUser || !pendingImage) return;
    const img = pendingImage;
    setPendingImage(null);
    const replyData = replyTo ? { 
      id: replyTo.id, 
      text: replyTo.text, 
      senderId: replyTo.senderId,
      type: replyTo.type,
      imageUrl: replyTo.imageUrl
    } : null;
    setReplyTo(null);
    await sendMessage(chatId, currentUser.uid, '', 'image', { imageUrl: img, replyTo: replyData });
  };

  const startRecording = async () => {
    try {
      console.log("[Voice] Manual Trigger Initiated");
      
      // Force user to give permission on Web if Audio wrapper fails
      if (Platform.OS === 'web') {
        try {
          console.log("[Voice] Trying navigator.mediaDevices approach...");
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // If we are here, permission is granted!
          stream.getTracks().forEach(track => track.stop()); // Stop immediate capture
          console.log("[Voice] Browser permission GIVEN manually");
        } catch (webErr: any) {
          console.error("[Voice] Manual browser permission failed:", webErr);
          const trMsg = `Mikrofon izni engellenmiş. Lütfen tarayıcı ayarlarından (adres çubuğundaki kilit simgesi) mikrofon iznini 'İzin Ver' olarak değiştirin.\n\nHata: ${webErr.message}`;
          const enMsg = `Microphone permission blocked. Please change microphone access to 'Allow' in your browser settings (lock icon in address bar).\n\nError: ${webErr.message}`;
          Alert.alert("Permission Blocked", language === 'tr' ? trMsg : enMsg);
          return;
        }
      }

      // If we are here or on native, try expo-av again
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert("Error", "Permission still denied. Check settings.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Platform.OS === 'web' 
        ? {
            android: Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
            ios: Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
            web: { mimeType: 'audio/webm;codecs=opus', bitsPerSecond: 128000 }
          }
        : Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      console.log("[Voice] Recording object created and started");
    } catch (err: any) {
      console.error('[Voice] Final catch block:', err);
      Alert.alert("Recording Error", err.message);
      setIsRecording(false);
      setRecording(null);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecording(null);
      console.log("[Voice] Recording finished, URI:", uri);
    } catch (err) {
      console.error('[Voice] Stop error:', err);
      setIsRecording(false);
      setRecording(null);
    }
  };

  const handleSendVoice = async () => {
    if (!chatId || !currentUser || !recordedUri) return;
    const uri = recordedUri;
    setRecordedUri(null);
    const replyData = replyTo ? { 
      id: replyTo.id, 
      text: replyTo.text, 
      senderId: replyTo.senderId,
      type: replyTo.type,
      imageUrl: replyTo.imageUrl
    } : null;
    setReplyTo(null);
    await sendMessage(chatId, currentUser.uid, '', 'voice', { imageUrl: uri, replyTo: replyData });
  };

  const cancelRecording = () => {
    setRecordedUri(null);
    setRecording(null);
    setIsRecording(false);
    clearInterval(recordingTimerRef.current);
  };

  const handleLongPress = (msg: Message) => {
    setSelectedMessage(msg);
    setShowMessageSheet(true);
  };

  const formatLastSeen = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const headerOptions = [
    { label: language === 'tr' ? 'Engelle' : 'Block', icon: Ban, color: '#ef4444', onPress: () => Alert.alert("Engellendi") },
    { label: language === 'tr' ? 'Şikayet Et' : 'Report', icon: ShieldAlert, color: '#ef4444', onPress: () => Alert.alert("Şikayet Edildi") }
  ];

  const messageOptions = useMemo(() => {
    if (!selectedMessage) return [];
    const opts: any[] = [
      { label: language === 'tr' ? 'Yanıtla' : 'Reply', icon: Reply, onPress: () => {
      setReplyTo(selectedMessage);
      setEditingMessageId(null);
      setShowMessageSheet(false);
    } },
    ];
    if (selectedMessage.senderId === currentUser?.uid) {
      if (selectedMessage.type === 'text') {
        opts.push({ label: language === 'tr' ? 'Düzenle' : 'Edit', icon: Edit, onPress: () => {
          setText(selectedMessage.text);
          setEditingMessageId(selectedMessage.id);
          setReplyTo(null);
          setShowMessageSheet(false);
        } });
      }
      opts.push({ label: language === 'tr' ? 'Sil' : 'Delete', icon: Trash2, color: '#ef4444', onPress: () => {
        if (chatId) deleteMessage(chatId, selectedMessage.id);
        setShowMessageSheet(false);
      } });
    }
    return opts;
  }, [selectedMessage, language, chatId, currentUser, name, text]);

  const renderMessage = ({ item }: { item: Message }) => {
    if ((item as any).isDeleted || (item.type === 'system' && !item.text)) return null;
    const isMe = item.senderId === currentUser?.uid;
    return (
      <Pressable 
        onLongPress={() => handleLongPress(item)}
        style={[styles.messageRow, isMe ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}
      >
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
            {item.replyTo && (
               <View style={[styles.replyPreviewInside, isMe ? styles.replyMe : styles.replyOther]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                     {item.replyTo.type === 'image' && item.replyTo.imageUrl && (
                        <Image source={{ uri: item.replyTo.imageUrl }} style={{ width: 24, height: 24, borderRadius: 4 }} />
                     )}
                     <View style={{ flex: 1 }}>
                        <Text style={styles.replyNameSmall}>{item.replyTo.senderId === currentUser?.uid ? 'Sen' : name}</Text>
                        <Text style={styles.replyTextSmall} numberOfLines={1}>{item.replyTo.text || (item.replyTo.type === 'image' ? (language === 'tr' ? 'Fotoğraf' : 'Photo') : '')}</Text>
                     </View>
                  </View>
               </View>
            )}
           
           {item.type === 'voice' ? (
              <VoicePlayer uri={item.imageUrl || ''} isMe={isMe} />
           ) : item.type === 'image' ? (
              <Image source={{ uri: item.imageUrl }} style={styles.messageImage} contentFit="cover" />
           ) : (
              <Text style={[styles.messageText, isMe ? styles.textMe : styles.textOther]}>
                {item.text}
                {item.isEdited && <Text style={styles.editedTag}> ({language === 'tr' ? 'Düzenlendi' : 'Edited'})</Text>}
              </Text>
           )}

            <View style={styles.messageFooter}>
               <Text style={styles.messageTime}>{item.time}</Text>
               {isMe && (
                  <View style={{ marginLeft: 6, alignSelf: 'center' }}>
                    <Text style={{ 
                      color: item.isRead ? '#3b82f6' : 'rgba(255,255,255,0.4)', 
                      fontSize: 14, 
                      fontWeight: '800',
                      letterSpacing: -2,
                      lineHeight: 16
                    }}>
                      {item.isRead ? '✓✓' : '✓'}
                    </Text>
                  </View>
               )}
            </View>
            {Object.keys(item.reactions || {}).length > 0 && (
              <View style={styles.reactionsContainer}>
                {Object.entries(item.reactions || {}).map(([emoji, userIds]) => {
                  const users = userIds as string[];
                  if (users.length === 0) return null;
                  return (
                    <View key={emoji} style={styles.reactionBadge}>
                        <Text style={styles.reactionEmoji}>{emoji}</Text>
                        <Text style={styles.reactionCount}>{users.length}</Text>
                    </View>
                  );
                })}
              </View>
            )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, !isDark && { backgroundColor: '#FAFAFA' }]}>
      {isDark && <LinearGradient colors={['#0f172a', '#1e1b4b']} style={StyleSheet.absoluteFillObject} />}
      
      {pendingImage && (
        <View style={styles.previewOverlay}>
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.previewContent}>
             <Image source={{ uri: pendingImage }} style={styles.previewImage} contentFit="contain" />
             <View style={styles.previewActions}>
                <TouchableOpacity style={styles.previewCancel} onPress={() => setPendingImage(null)}>
                   <X color="#FFF" size={24} />
                 </TouchableOpacity>
                <TouchableOpacity style={styles.previewSend} onPress={handleSendImage}>
                   <Send color="#FFF" size={24} />
                </TouchableOpacity>
             </View>
          </View>
        </View>
      )}

      {/* HEADER */}
      <View style={[styles.header, !isDark && styles.headerLight]}>
         <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft color={isDark ? "#FFF" : "#000"} size={28} />
         </TouchableOpacity>
         
         <TouchableOpacity style={styles.headerInfo} onPress={() => router.push(`/user/${id}` as any)}>
            <Image source={{ uri: avatar as string }} style={styles.headerAvatar} />
            <View>
               <Text style={[styles.headerName, !isDark && { color: '#000' }]}>{name}</Text>
               <Text style={[styles.headerStatus, (otherUser?.isOnline || isOtherTyping) && { color: '#10b981' }]}>
                  {isOtherTyping 
                    ? (language === 'tr' ? 'Yazıyor...' : 'Typing...')
                    : (otherUser?.isOnline 
                      ? (language === 'tr' ? 'Çevrimiçi' : 'Online') 
                      : (otherUser?.lastSeen 
                        ? `${language === 'tr' ? 'Son görülme' : 'Last seen'}: ${formatLastSeen(otherUser.lastSeen)}` 
                        : (language === 'tr' ? 'Çevrimdışı' : 'Offline')))
                  }
               </Text>
            </View>
         </TouchableOpacity>

         <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn}><Phone color={isDark ? "#FFF" : "#000"} size={22} /></TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={() => setShowHeaderSheet(true)}>
               <MoreVertical color={isDark ? "#FFF" : "#000"} size={22} />
            </TouchableOpacity>
         </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
           <View style={styles.center}><ActivityIndicator color="#a855f7" size="large" /></View>
        ) : (
           <FlatList 
             ref={flatListRef}
             data={messages}
             keyExtractor={item => item.id}
             renderItem={renderMessage}
             contentContainerStyle={styles.messageList}
             showsVerticalScrollIndicator={false}
           />
        )}

        <View style={[styles.inputContainer, !isDark && styles.inputContainerLight]}>
           {replyTo && (
              <View style={styles.replyNotice}>
                 <Reply size={14} color="#a855f7" />
                 {replyTo.type === 'image' && (
                   <Image source={{ uri: replyTo.imageUrl }} style={{ width: 24, height: 24, borderRadius: 4, marginRight: 8 }} />
                 )}
                 <Text style={styles.replyNoticeText} numberOfLines={1}>
                    {replyTo.senderId === currentUser?.uid ? 'Senin' : name} {language === 'tr' ? 'mesajına yanıt' : 'replying to'}
                 </Text>
                 <TouchableOpacity onPress={() => setReplyTo(null)}><X size={14} color="#a855f7" /></TouchableOpacity>
              </View>
           )}

           {editingMessageId && (
              <View style={styles.replyNotice}>
                 <Edit size={14} color="#a855f7" />
                 <Text style={[styles.replyNoticeText, { color: Colors.primary }]} numberOfLines={1}>
                    {language === 'tr' ? 'Mesajı Düzenle' : 'Edit Message'}
                 </Text>
                 <TouchableOpacity onPress={() => { setEditingMessageId(null); setText(''); }}><X size={14} color="#a855f7" /></TouchableOpacity>
              </View>
           )}

           {recordedUri ? (
              <View style={[styles.inputInner, { backgroundColor: 'rgba(168, 85, 247, 0.1)', paddingHorizontal: 10, borderRadius: 22 }]}>
                 <TouchableOpacity onPress={cancelRecording} style={{ padding: 10 }}>
                    <Trash size={20} color="#ef4444" />
                 </TouchableOpacity>
                 <View style={{ flex: 1 }}>
                    <VoicePlayer uri={recordedUri} isMe={true} />
                 </View>
                 <TouchableOpacity onPress={handleSendVoice} style={[styles.sendBtn, { width: 40, height: 40 }]}>
                    <Send size={18} color="#FFF" />
                 </TouchableOpacity>
              </View>
           ) : isRecording ? (
              <View style={[styles.inputInner, { backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 15, borderRadius: 22 }]}>
                 <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444', marginRight: 10 }} />
                 <Text style={{ color: '#ef4444', fontWeight: 'bold', flex: 1 }}>
                    {Math.floor(recordingDuration / 60)}:{String(recordingDuration % 60).padStart(2, '0')}
                 </Text>
                 <TouchableOpacity onPress={stopRecording}>
                    <StopCircle size={30} color="#ef4444" />
                 </TouchableOpacity>
              </View>
           ) : (
              <View style={styles.inputInner}>
                  <TouchableOpacity style={styles.plusBtn} onPress={handlePickImage} activeOpacity={0.7}>
                     <Plus color="#a855f7" size={24} />
                  </TouchableOpacity>
                  <TextInput 
                    style={[styles.textInput, !isDark && styles.textInputLight]}
                    placeholder={language === 'tr' ? 'Mesaj yaz...' : 'Write a message...'}
                    placeholderTextColor="rgba(150,150,150,0.5)"
                    value={text}
                    onChangeText={handleTextChange}
                    multiline
                  />
                  {text.trim() || replyTo ? (
                    <TouchableOpacity style={styles.sendBtn} activeOpacity={0.7} onPress={handleSend}>
                      <Send color="#FFF" size={20} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.sendBtn, styles.micBtn]} 
                      activeOpacity={0.7} 
                      onPress={startRecording}
                      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                      <Mic color="#FFF" size={20} />
                    </TouchableOpacity>
                  )}
               </View>
           )}
        </View>
      </KeyboardAvoidingView>

      <ActionSheet visible={showHeaderSheet} onClose={() => setShowHeaderSheet(false)} options={headerOptions} />
      <ActionSheet 
        visible={showMessageSheet} 
        onClose={() => { setShowMessageSheet(false); setShowFullEmoji(false); }} 
        options={messageOptions}
        header={(
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reactionBar}>
              {(showFullEmoji 
                ? ['❤️', '😂', '🔥', '😮', '👍', '🙏', '😢', '👏', '🎉', '💔', '🚀', '💯', '✨', '🤩', '🎯', '✅', '🌈', '🍦', '🎈', '🎁']
                : ['❤️', '😂', '🔥', '😮']
              ).map(emoji => (
                <TouchableOpacity 
                  key={emoji} 
                  style={styles.reactionBtn} 
                  onPress={() => {
                    if (chatId && selectedMessage && currentUser) {
                      addReaction(chatId, selectedMessage.id, emoji, currentUser.uid);
                      setShowMessageSheet(false);
                      setShowFullEmoji(false);
                    }
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
              {!showFullEmoji && (
                <TouchableOpacity style={styles.reactionBtn} onPress={() => setShowFullEmoji(true)}>
                  <Plus color="#FFF" size={24} />
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { 
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, 
    paddingTop: 60, paddingBottom: 15, backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  headerLight: { backgroundColor: '#FFF', borderBottomColor: 'rgba(0,0,0,0.05)' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  headerName: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  headerStatus: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  headerActions: { flexDirection: 'row', gap: 10 },
  headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messageList: { padding: 20, paddingBottom: 40 },
  messageRow: { flexDirection: 'row', marginBottom: 15 },
  bubble: { maxWidth: width * 0.75, padding: 12, borderRadius: 18, position: 'relative' },
  bubbleMe: { backgroundColor: '#8b5cf6', borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: 'rgba(255,255,255,0.05)', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  messageText: { fontSize: 15, lineHeight: 22 },
  textMe: { color: '#FFF' },
  textOther: { color: '#e5e7eb' },
  messageFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 4 },
  messageTime: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },
  messageImage: { width: 200, height: 200, borderRadius: 12, marginBottom: 5 },
  reactionsContainer: { 
    flexDirection: 'row', position: 'absolute', bottom: -12, right: 10, 
    gap: 4, backgroundColor: '#1e293b', padding: 2, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  reactionBadge: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' 
  },
  reactionEmoji: { fontSize: 12 },
  reactionCount: { color: '#FFF', fontSize: 10, marginLeft: 3, fontWeight: '700' },
  reactionBar: { 
    flexDirection: 'row', justifyContent: 'space-around', 
    paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.02)', paddingHorizontal: 10
  },
  reactionBtn: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
  replyPreviewInside: { padding: 8, borderRadius: 10, marginBottom: 8, borderLeftWidth: 3 },
  replyMe: { backgroundColor: 'rgba(0,0,0,0.1)', borderLeftColor: '#FFF' },
  replyOther: { backgroundColor: 'rgba(255,255,255,0.05)', borderLeftColor: '#a855f7' },
  replyNameSmall: { color: '#a855f7', fontSize: 11, fontWeight: '800' },
  replyTextSmall: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
  inputContainer: { padding: 15, paddingBottom: Platform.OS === 'ios' ? 35 : 15, backgroundColor: 'rgba(15, 23, 42, 0.9)' },
  inputContainerLight: { backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  inputInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  plusBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(168, 85, 247, 0.1)', justifyContent: 'center', alignItems: 'center' },
  textInput: { flex: 1, color: '#FFF', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 22, paddingHorizontal: 15, paddingVertical: 10, maxHeight: 100 },
  textInputLight: { color: '#000', backgroundColor: '#F3F4F6' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#8b5cf6', justifyContent: 'center', alignItems: 'center' },
  micBtn: { backgroundColor: '#475569' },
  replyNotice: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, paddingHorizontal: 10 },
  replyNoticeText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, flex: 1 },
  editedTag: { fontSize: 10, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' },
  previewOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 1000, justifyContent: 'center', alignItems: 'center' },
  previewContent: { width: '90%', height: '70%', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 20, overflow: 'hidden', padding: 20 },
  previewImage: { flex: 1, width: '100%', borderRadius: 12 },
  previewActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  previewCancel: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center' },
  previewSend: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' }
});

const Colors = { primary: '#a855f7' };
