import { 
  collection, 
  addDoc, 
  getDoc,
  query, 
  where,
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  setDoc,
  updateDoc,
  writeBatch,
  getDocs,
  limit,
  deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Platform } from 'react-native';
import { db, storage } from './firebase';

export type MessageType = 'text' | 'image' | 'voice' | 'system';

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
  time?: string;
  isMe?: boolean;
  type?: MessageType;
  imageUrl?: string;
  isRead?: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  reactions?: Record<string, string[]>; // emoji -> list of userIds
  replyTo?: {
    id: string;
    text: string;
    senderId: string;
    type?: MessageType;
    imageUrl?: string;
  } | null;
}

// Sohbet medyası (resim veya ses) yükle
export const uploadChatMedia = async (uri: string, type: MessageType = 'image'): Promise<string | null> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Klasör ve uzantı belirle
    const folder = type === 'image' ? 'chat_images' : 'chat_voices';
    const extension = type === 'image' ? 'jpg' : (Platform.OS === 'web' ? 'webm' : 'm4a');
    
    const filename = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error(`[uploadChatMedia] ERROR for ${type}:`, error);
    return null;
  }
};

// Mesaj gönder
export const sendMessage = async (
  chatId: string, 
  senderId: string, 
  text: string, 
  type: MessageType = 'text', 
  data?: { imageUrl?: string, replyTo?: any }
) => {
  try {
    console.log(`[sendMessage] Starting for chatId: ${chatId}, senderId: ${senderId}`);
    
    let finalImageUrl = data?.imageUrl || null;

    // Eğer bir görsel gönderiliyorsa ve URL yerelse (file://, content://, blob: veya data: gibi başlarsa) yükle
    const isLocalUri = finalImageUrl && (
      finalImageUrl.startsWith('file://') || 
      finalImageUrl.startsWith('content://') || 
      finalImageUrl.startsWith('ph://') || 
      finalImageUrl.startsWith('blob:') || 
      finalImageUrl.startsWith('data:')
    );

    if ((type === 'image' || type === 'voice') && isLocalUri) {
      console.log(`[sendMessage] Local URI detected for ${type}, uploading...`);
      const uploadedUrl = await uploadChatMedia(finalImageUrl as string, type);
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      } else {
        throw new Error("Upload failed");
      }
    }

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      text,
      senderId,
      type,
      imageUrl: finalImageUrl,
      replyTo: data?.replyTo || null,
      isRead: false,
      timestamp: serverTimestamp(),
      reactions: {}
    });

    const chatRef = doc(db, 'chats', chatId);
    await setDoc(chatRef, {
      lastMessage: type === 'image' ? '📷 Fotoğraf' : type === 'voice' ? '🎤 Sesli Mesaj' : text,
      lastMessageTime: serverTimestamp(),
      lastSenderId: senderId,
      unreadCount: 1 
    }, { merge: true });
    
    console.log(`[sendMessage] Success for chatId: ${chatId}`);
  } catch (error) {
    console.error(`[sendMessage] ERROR for chatId: ${chatId}:`, error);
  }
};

// Mesajları dinle
export const listenToMessages = (chatId: string, callback: (messages: Message[]) => void) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : null;
      messages.push({
        id: doc.id,
        text: data.text,
        senderId: data.senderId,
        timestamp: data.timestamp,
        type: data.type || 'text',
        imageUrl: data.imageUrl,
        isRead: data.isRead || false,
        isEdited: data.isEdited || false,
        isDeleted: data.isDeleted || false,
        reactions: data.reactions || {},
        replyTo: data.replyTo,
        time: timestamp ? timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...',
      });
    });
    callback(messages);
  }, (error) => {
    console.error(`[listenToMessages] ERROR for chatId: ${chatId}:`, error);
  });
};

// Mesajları okundu olarak işaretle
export const markMessagesAsRead = async (chatId: string, currentUid: string) => {
  if (!chatId || !currentUid) return;
  
  try {
    console.log(`[markMessagesAsRead] Starting for chatId: ${chatId}`);
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, where('isRead', '==', false));
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      const batch = writeBatch(db);
      let count = 0;
      snap.docs.forEach(d => {
        if (d.data().senderId !== currentUid) {
          batch.update(d.ref, { isRead: true });
          count++;
        }
      });
      
      if (count > 0) {
        await batch.commit();
        console.log(`[markMessagesAsRead] Batch update success: ${count} messages`);
      }
    }

    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, { unreadCount: 0 });
      console.log(`[markMessagesAsRead] unreadCount reset success`);
    } catch (chatError) {
      console.warn(`[markMessagesAsRead] Could not update unreadCount for chatId: ${chatId}:`, chatError);
    }
  } catch (error) {
    console.error(`[markMessagesAsRead] MAIN ERROR for chatId: ${chatId}:`, error);
  }
};

// Tepki işlemleri
export const addReaction = async (chatId: string, messageId: string, emoji: string, uid: string) => {
  try {
    const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
    const snap = await getDoc(msgRef);
    if (!snap.exists()) return;

    const reactions = snap.data().reactions || {};
    
    // Check if user already has THIS specific reaction
    const alreadyHasThis = reactions[emoji]?.includes(uid);

    // 1. Remove user from ALL existing reactions on this message
    Object.keys(reactions).forEach(e => {
      reactions[e] = (reactions[e] || []).filter((u: string) => u !== uid);
      if (reactions[e].length === 0) delete reactions[e];
    });

    // 2. Add the new reaction (unless they clicked the same one to remove it)
    if (!alreadyHasThis) {
      if (!reactions[emoji]) reactions[emoji] = [];
      reactions[emoji].push(uid);
    }

    await updateDoc(msgRef, { reactions });
  } catch (error) {
    console.error(`[addReaction] ERROR:`, error);
  }
};

// Mesaj düzenle
export const editMessage = async (chatId: string, messageId: string, newText: string) => {
  try {
    const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
    await updateDoc(msgRef, { 
       text: newText,
       isEdited: true 
    });
  } catch (error) {
    console.error(`[editMessage] ERROR:`, error);
  }
};

// Mesaj sil
export const deleteMessage = async (chatId: string, messageId: string) => {
  try {
    const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
    const snap = await getDoc(msgRef);
    
    if (snap.exists()) {
      const data = snap.data();
      // Eğer resim veya ses ise Storage'dan da sil
      if (data.imageUrl && (data.type === 'image' || data.type === 'voice')) {
        try {
          const fileRef = ref(storage, data.imageUrl);
          await deleteObject(fileRef);
          console.log(`[deleteMessage] Media file deleted from storage`);
        } catch (stErr) {
          console.warn(`[deleteMessage] Storage deletion failed:`, stErr);
        }
      }

      await updateDoc(msgRef, { 
         text: '',
         type: 'system',
         isDeleted: true,
         imageUrl: null
      });
    }
  } catch (error) {
    console.error(`[deleteMessage] ERROR:`, error);
  }
};

// Yazıyor durumunu güncelle
export const setTypingStatus = async (chatId: string, userId: string, isTyping: boolean) => {
  try {
    const typingRef = doc(db, 'chats', chatId, 'typing', userId);
    await setDoc(typingRef, {
      isTyping,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error(`[setTypingStatus] ERROR:`, error);
  }
};

// Yazıyor durumunu dinle
export const listenToTypingStatus = (chatId: string, otherUid: string, callback: (isTyping: boolean) => void) => {
  const typingRef = doc(db, 'chats', chatId, 'typing', otherUid);
  return onSnapshot(typingRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const isOld = data.timestamp?.toDate ? (Date.now() - data.timestamp.toDate().getTime() > 10000) : false;
      callback(data.isTyping && !isOld);
    } else {
      callback(false);
    }
  }, (error) => {
    console.error(`[listenToTypingStatus] ERROR:`, error);
  });
};

// Kullanıcı durumunu dinle
export const listenToUserStatus = (uid: string, callback: (userData: any) => void) => {
  const userRef = doc(db, 'users', uid);
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  }, (error) => {
    console.error(`[listenToUserStatus] ERROR for uid: ${uid}:`, error);
  });
};

export interface Conversation {
  id: string;
  lastMessage: string;
  lastMessageTime: any;
  participants: string[];
  lastSenderId?: string;
  unreadCount?: number;
  otherUser?: {
    uid: string;
    displayName: string;
    photoURL: string;
    isOnline: boolean;
    lastSeen: any;
  };
}

// Sohbet listesini dinle
export const listenToConversations = (currentUid: string, callback: (conversations: Conversation[]) => void) => {
  const chatsRef = collection(db, 'chats');
  const q = query(chatsRef, where('participants', 'array-contains', currentUid));

  return onSnapshot(q, async (snapshot) => {
    const convs: Conversation[] = [];
    
    for (const chatDoc of snapshot.docs) {
      const data = chatDoc.data();
      const participants = data.participants as string[];
      const otherUid = participants.find(uid => uid !== currentUid);
      
      let otherUserData = null;
      if (otherUid) {
        try {
          const userRef = doc(db, 'users', otherUid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const ud = userSnap.data();
            otherUserData = {
              uid: otherUid,
              displayName: ud.displayName || 'Bilinmeyen',
              photoURL: ud.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky',
              isOnline: ud.isOnline || false,
              lastSeen: ud.lastSeen
            };
          }
        } catch (err) {
          console.warn(`[listenToConversations] Could not fetch other user data:`, err);
        }
      }

      convs.push({
        id: chatDoc.id,
        lastMessage: data.lastMessage || 'Yeni bir mesajın var!',
        lastMessageTime: data.lastMessageTime,
        lastSenderId: data.lastSenderId,
        participants,
        unreadCount: data.unreadCount || 0,
        otherUser: otherUserData || undefined,
      });
    }
    
    convs.sort((a, b) => {
      const timeA = a.lastMessageTime?.toDate ? a.lastMessageTime.toDate().getTime() : 0;
      const timeB = b.lastMessageTime?.toDate ? b.lastMessageTime.toDate().getTime() : 0;
      return timeB - timeA;
    });

    callback(convs);
  });
};

// Sohbet oluştur veya getir
export const getOrCreateChat = async (uid1: string, uid2: string) => {
  try {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', uid1));
    const snap = await getDocs(q);
    
    const existing = snap.docs.find(d => {
      const parts = d.data().participants || [];
      return parts.includes(uid2);
    });
    
    if (existing) return existing.id;

    const newChat = await addDoc(chatsRef, {
      participants: [uid1, uid2],
      lastMessage: '',
      lastMessageTime: serverTimestamp(),
      createdAt: serverTimestamp(),
      unreadCount: 0
    });
    
    return newChat.id;
  } catch (error) {
    console.error(`[getOrCreateChat] ERROR:`, error);
    return null;
  }
};

/**
 * Update user's online status and last seen timestamp
 */
export const updatePresence = async (uid: string, isOnline: boolean) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      isOnline,
      lastSeen: serverTimestamp()
    });
  } catch (error) {
    console.error("[updatePresence] ERROR:", error);
  }
};
