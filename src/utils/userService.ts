import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore';
import { sendNotification } from './notificationService';

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  bio?: string;
  age?: string;
  location?: string;
  interests?: string[];
  followersCount?: number;
  followingCount?: number;
  isOnline?: boolean;
}

/**
 * Get a user's profile data from Firestore
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { uid, ...userSnap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

/**
 * Follow a user
 */
export const followUser = async (targetUid: string, followerUid: string, followerName: string, followerAvatar: string) => {
  try {
    const followId = `${followerUid}_${targetUid}`;
    const followRef = doc(db, 'follows', followId);
    
    await setDoc(followRef, {
      followerUid,
      targetUid,
      createdAt: serverTimestamp(),
    });

    // Send notification
    await sendNotification(targetUid, followerUid, followerName, followerAvatar, 'follow');
    
    return true;
  } catch (error) {
    console.error("Error following user:", error);
    return false;
  }
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (targetUid: string, followerUid: string) => {
  try {
    const followId = `${followerUid}_${targetUid}`;
    const followRef = doc(db, 'follows', followId);
    await deleteDoc(followRef);
    return true;
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return false;
  }
};

/**
 * Check if a user is following another
 */
export const checkFollowStatus = async (targetUid: string, followerUid: string): Promise<boolean> => {
  try {
    const followId = `${followerUid}_${targetUid}`;
    const followRef = doc(db, 'follows', followId);
    const followSnap = await getDoc(followRef);
    return followSnap.exists();
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
};

/**
 * Get follower/following and visit counts
 */
export const getUserStats = async (uid: string) => {
  try {
    const followersQuery = query(collection(db, 'follows'), where('targetUid', '==', uid));
    const followingQuery = query(collection(db, 'follows'), where('followerUid', '==', uid));
    const visitsQuery = query(collection(db, 'profile_visits'), where('targetUid', '==', uid));
    
    const [followersSnap, followingSnap, visitsSnap] = await Promise.all([
      getDocs(followersQuery),
      getDocs(followingQuery),
      getDocs(visitsQuery)
    ]);
    
    return {
      followers: followersSnap.size,
      following: followingSnap.size,
      visits: visitsSnap.size
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return { followers: 0, following: 0, visits: 0 };
  }
};

/**
 * Record a profile visit
 */
export const recordProfileVisit = async (targetUid: string, visitorUid: string) => {
  if (targetUid === visitorUid) return;
  try {
    const visitId = `${visitorUid}_${targetUid}`;
    const visitRef = doc(db, 'profile_visits', visitId);
    
    // Check if already visited in this session/day or just overwrite
    await setDoc(visitRef, {
      visitorUid,
      targetUid,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error recording profile visit:", error);
  }
};

/**
 * Get user's gallery from their posts (images only)
 */
export const getUserGallery = async (uid: string) => {
  try {
    // Basic query, no inequality to avoid index requirement for now
    const postsQuery = query(
      collection(db, 'posts'), 
      where('userId', '==', uid)
    );
    const snap = await getDocs(postsQuery);
    // Filter in-memory for posts that have images
    return snap.docs
      .map(doc => doc.data().imageUrl)
      .filter(url => !!url) as string[];
  } catch (error) {
    console.error("Error fetching user gallery:", error);
    return [];
  }
};

/**
 * Get ALL user's posts (text, image, poll)
 */
export const getUserPosts = async (uid: string) => {
  try {
    // Basic query to avoid composite index (userId + createdAt) requirement
    const postsQuery = query(
      collection(db, 'posts'), 
      where('userId', '==', uid)
    );
    const snap = await getDocs(postsQuery);
    
    // Sort in-memory instead of Firestore orderBy
    const posts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    return posts.sort((a, b) => {
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return [];
  }
};

/**
 * Get UIDs of users that the current user follows
 */
export const getFollowingUids = async (uid: string): Promise<string[]> => {
  try {
    const q = query(collection(db, 'follows'), where('followerUid', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data().targetUid);
  } catch (error) {
    console.error("Error fetching following UIDs:", error);
    return [];
  }
};

/**
 * Get profiles of all users following the specified UID
 */
export const getFollowers = async (uid: string): Promise<any[]> => {
  try {
    const q = query(collection(db, 'follows'), where('targetUid', '==', uid));
    const snap = await getDocs(q);
    const uids = snap.docs.map(doc => doc.data().followerUid);
    if (uids.length === 0) return [];
    return Promise.all(uids.map(id => getUserProfile(id)));
  } catch (error) {
    console.error("Error fetching followers:", error);
    return [];
  }
};

/**
 * Get profiles of all users followed by the specified UID
 */
export const getFollowingUsers = async (uid: string): Promise<any[]> => {
  try {
    const q = query(collection(db, 'follows'), where('followerUid', '==', uid));
    const snap = await getDocs(q);
    const uids = snap.docs.map(doc => doc.data().targetUid);
    if (uids.length === 0) return [];
    return Promise.all(uids.map(id => getUserProfile(id)));
  } catch (error) {
    console.error("Error fetching following users:", error);
    return [];
  }
};

/**
 * Get profiles of all users who visited the specified UID profile
 */
export const getProfileVisits = async (uid: string): Promise<any[]> => {
  try {
    // Unique visitors with simple query to avoid index issues
    const q = query(collection(db, 'profile_visits'), where('targetUid', '==', uid));
    const snap = await getDocs(q);
    const uids = [...new Set(snap.docs.map(doc => doc.data().visitorUid))];
    if (uids.length === 0) return [];
    return Promise.all(uids.map(id => getUserProfile(id)));
  } catch (error) {
    console.error("Error fetching profile visits:", error);
    return [];
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
    console.error("Error updating presence:", error);
  }
};


