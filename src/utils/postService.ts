import { 
  collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, 
  doc, updateDoc, arrayUnion, arrayRemove, increment, getDoc, deleteDoc, where 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { sendNotification } from './notificationService';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: any;
  replyToId?: string; // Id of the comment being replied to
}

export interface PollOption {
  text: string;
  votes: number;
  votedBy: string[];
}

export interface PostPoll {
  question: string;
  options: PollOption[];
  totalVotes: number;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  imageUrl: string | null;
  createdAt: any;
  likes: number;
  comments: number;
  likedBy: string[]; // Array of UIDs who liked the post
  hashtags: string[];
  poll?: PostPoll;
}

// Helper to extract hashtags
const extractHashtags = (text: string): string[] => {
  const hashtags = text.match(/#[\w\u00C0-\u017F]+/g);
  // Save without '#' and lowercase for consistent querying
  return hashtags ? hashtags.map(h => h.substring(1).toLowerCase()) : [];
};

// Helper to extract mentions
const extractMentions = (text: string): string[] => {
  const mentions = text.match(/@[\w]+/g);
  return mentions ? mentions.map(m => m.substring(1)) : [];
};

// Yeni gönderi oluştur
export const createPost = async (
  userId: string, 
  userName: string, 
  userAvatar: string, 
  text: string, 
  imageUri: string | null,
  pollData?: { question: string; options: string[] }
) => {
  try {
    let imageUrl = null;

    // Resim varsa Firebase Storage'a yükle
    if (imageUri) {
       const response = await fetch(imageUri);
       const blob = await response.blob();
       
       const filename = `posts/${userId}_${Date.now()}.jpg`;
       const storageRef = ref(storage, filename);
       
       const metadata = { contentType: 'image/jpeg' };
       await uploadBytes(storageRef, blob, metadata);
       imageUrl = await getDownloadURL(storageRef);
    }

    // Hashtagleri ayıkla
    const hashtags = extractHashtags(text);

    // Anket verisi varsa hazırla
    let poll = null;
    if (pollData && pollData.question && pollData.options.length >= 2) {
      poll = {
        question: pollData.question,
        options: pollData.options.map(opt => ({
          text: opt,
          votes: 0,
          votedBy: []
        })),
        totalVotes: 0
      };
    }

    // Gönderiyi Firestore'a kaydet
    const postRef = await addDoc(collection(db, 'posts'), {
       userId,
       userName,
       userAvatar,
       text,
       imageUrl,
       hashtags,
       poll,
       createdAt: serverTimestamp(),
       likes: 0,
       comments: 0,
       likedBy: []
    });

    // Bahsetmeleri kontrol et (Mentions)
    const mentions = extractMentions(text);
    if (mentions.length > 0) {
      // Not: Gerçekte mention bildirimlerini göndermek için 
      // kullanıcı adından UID'yi bulmak gerekir. 
      // Şimdilik sadece sistemi kuruyoruz, ilerde 'users' koleksiyonunda arama yapılacak.
    }

  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

// Ankete Oy Ver
export const voteOnPoll = async (postId: string, optionIndex: number, userId: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) return;

    const postData = postSnap.data() as Post;
    if (!postData.poll) return;

    // Kullanıcı zaten herhangi bir seçeneğe oy vermiş mi kontrol et
    const alreadyVoted = postData.poll.options.some(opt => opt.votedBy.includes(userId));
    if (alreadyVoted) return;

    const newOptions = [...postData.poll.options];
    newOptions[optionIndex].votes += 1;
    newOptions[optionIndex].votedBy.push(userId);

    await updateDoc(postRef, {
      'poll.options': newOptions,
      'poll.totalVotes': increment(1)
    });
  } catch (error) {
    console.error("Error voting on poll:", error);
  }
};

// Gönderileri Dinle (Gerçek Zamanlı)
export const subscribeToPosts = (callback: (posts: Post[]) => void, hashtag?: string) => {
  let q;
  if (hashtag) {
    q = query(
      collection(db, 'posts'), 
      where('hashtags', 'array-contains', hashtag.toLowerCase()),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  }
  
  return onSnapshot(q, (snapshot) => {
    const posts: Post[] = [];
    snapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post);
    });
    callback(posts);
  }, (error) => {
    console.error("subscribeToPosts Error:", error);
    if (error.message.includes("requires an index")) {
        console.warn("Firestore Index Required:", error.message);
    }
  });
};

// Beğen/Beğeniden Vazgeç
export const toggleLike = async (
  postId: string, 
  userId: string, 
  userName: string, 
  userAvatar: string
) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) return;

    const postData = postSnap.data() as Post;
    const likedBy = postData.likedBy || [];
    const isLiked = likedBy.includes(userId);

    if (isLiked) {
      await updateDoc(postRef, {
        likedBy: arrayRemove(userId),
        likes: increment(-1)
      });
    } else {
      await updateDoc(postRef, {
        likedBy: arrayUnion(userId),
        likes: increment(1)
      });

      // BİLDİRİM GÖNDER
      if (postData.userId !== userId) {
        await sendNotification(
          postData.userId,
          userId,
          userName,
          userAvatar,
          'like',
          { postId }
        );
      }
    }
  } catch (error) {
    console.error("Toggle Like Error:", error);
  }
};

// Yorum Ekle
export const addComment = async (
  postId: string, 
  userId: string, 
  userName: string, 
  userAvatar: string, 
  text: string,
  replyToId?: string
) => {
  try {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const commentDoc = await addDoc(commentsRef, {
      userId,
      userName,
      userAvatar,
      text,
      createdAt: serverTimestamp(),
      replyToId: replyToId || null
    });

    // Gönderideki yorum sayısını artır
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const postData = postSnap.data() as Post;
      await updateDoc(postRef, {
        comments: increment(1)
      });

      // BİLDİRİM GÖNDER (Gönderi Sahibine)
      if (postData.userId !== userId) {
        await sendNotification(
          postData.userId,
          userId,
          userName,
          userAvatar,
          'comment',
          { postId, commentId: commentDoc.id, text }
        );
      }
      
      // Eğer bir yanıtsa, yanıtlanan kişiye de bildirim gitmeli (Gelecek planlaması)
    }
  } catch (error) {
    console.error("Add Comment Error:", error);
  }
};

// Yorum Sil
export const deleteComment = async (postId: string, commentId: string) => {
  try {
    await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
    
    // Gönderideki yorum sayısını azalt
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      comments: increment(-1)
    });
  } catch (error) {
    console.error("Delete Comment Error:", error);
  }
};

// Yorumları Dinle
export const subscribeToComments = (postId: string, callback: (comments: Comment[]) => void) => {
  const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const comments: Comment[] = [];
    snapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() } as Comment);
    });
    callback(comments);
  });
};
// Gönderi Sil
export const deletePost = async (postId: string) => {
  try {
    await deleteDoc(doc(db, 'posts', postId));
    // Not: Alt koleksiyonlar (comments) admin panelinden veya cloud function ile silinmeli 
    // veya burada manuel silinebilir. Şimdilik gönderiyi siliyoruz.
    return true;
  } catch (error) {
    console.error("Delete Post Error:", error);
    return false;
  }
};
