import { 
  collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, 
  doc, updateDoc, writeBatch, getDocs, limit 
} from 'firebase/firestore';
import { db } from './firebase';

export type NotificationType = 'like' | 'comment' | 'visit' | 'follow' | 'mention';

export interface Notification {
  id: string;
  toUid: string;
  fromUid: string;
  fromName: string;
  fromAvatar: string;
  type: NotificationType;
  postId?: string;
  commentId?: string;
  text?: string;
  isRead: boolean;
  createdAt: any;
}

// Bildirim Gönder
export const sendNotification = async (
  toUid: string, 
  fromUid: string, 
  fromName: string, 
  fromAvatar: string, 
  type: NotificationType,
  data?: { postId?: string, commentId?: string, text?: string }
) => {
  if (toUid === fromUid) return; // Kendi kendine bildirim gitmesin

  try {
    const notificationsRef = collection(db, 'notifications');
    
    // Aynı tipte aynı kişiden son 1 saat içinde bildirim varsa mükerrer olmasın (opsiyonel ama şimdilik direkt ekleyelim)
    await addDoc(notificationsRef, {
      toUid,
      fromUid,
      fromName,
      fromAvatar,
      type,
      postId: data?.postId || null,
      commentId: data?.commentId || null,
      text: data?.text || null,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

// Bildirimleri Dinle
export const subscribeToNotifications = (uid: string, callback: (notifications: Notification[]) => void) => {
  const q = query(
    collection(db, 'notifications'), 
    where('toUid', '==', uid),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications: Notification[] = [];
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() } as Notification);
    });
    
    // Sort in-memory to avoid mandatory composite index
    notifications.sort((a, b) => {
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return timeB - timeA;
    });

    callback(notifications);
  }, (error) => {
    console.error("subscribeToNotifications Error:", error);
  });
};

// Bildirimi Okundu Olarak İşaretle
export const markAsRead = async (notificationId: string) => {
  try {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { isRead: true });
  } catch (error) {
    console.error("Mark as read error:", error);
  }
};

// Tüm Bildirimleri Okundu Yap
export const markAllAsRead = async (uid: string) => {
  try {
    const q = query(
      collection(db, 'notifications'), 
      where('toUid', '==', uid), 
      where('isRead', '==', false)
    );
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    snapshot.forEach((doc) => {
      batch.update(doc.ref, { isRead: true });
    });
    await batch.commit();
  } catch (error) {
    console.error("Mark all as read error:", error);
  }
};
