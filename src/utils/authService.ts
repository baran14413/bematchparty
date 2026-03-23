import { auth, db, storage, googleProvider } from './firebase';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  deleteUser as firebaseDeleteUser,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updatePresence } from './userService';

// Google ile giriş yap (Web popup yöntemi)
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Güvenlik gereği: Kullanıcı "Kaydı Bitir" diyene kadar veritabanına kayıt atılmayacak.
    // Auth objesi başarılıysa direkt döndürülür. _layout.tsx içinde getUserProfile kontrolü ile onboarded durumu anlaşılır.
    return result.user;
  } catch (error: any) {
    console.error('Google Login Error:', error);
    throw error;
  }
};

// Çıkış yap
export const signOutUser = async () => {
  try {
    const uid = auth.currentUser?.uid;
    if (uid) {
      await updatePresence(uid, false);
    }
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
};

// Kullanıcı profil bilgilerini Firestore'a kaydet (onboarding sonrası)
export const saveUserProfile = async (uid: string, profileData: {
  email?: string | null;
  displayName: string;
  age: string;
  gender?: string;
  bio: string;
  photoURL: string;
  interests: string[];
  onboarded: boolean;
}) => {
  try {
    const userRef = doc(db, 'users', uid);
    // Eğer belge önceden yoksa tamamen yeni yaratır, varsa günceller.
    await setDoc(userRef, {
      uid,
      ...profileData,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(), // Eğer daha önceden eklendiyse bu merge ile üzerine yazılmaz. (Eksikse doc varsa sorun çıkarabilir ama onboarding sadece 1 kere yapılır)
    }, { merge: true });
  } catch (error) {
    console.error('Save Profile Error:', error);
    throw error;
  }
};

// Kullanıcı Firestore verisini çek
export const getUserProfile = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Get Profile Error:', error);
    return null;
  }
};

// Auth state dinleyici
export const onAuthChanged = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Avatar Güncelle
export const updateAvatar = async (uid: string, imageUri: string) => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // storageRef = avatars/{uid}_{timestamp}.jpg (cache sorununu önlemek için timestamp ekliyoruz)
    const filename = `avatars/${uid}_${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);
    
    const metadata = { contentType: 'image/jpeg' };
    await uploadBytes(storageRef, blob, metadata);
    const downloadURL = await getDownloadURL(storageRef);

    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      photoURL: downloadURL,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return downloadURL;
  } catch (error) {
    console.error('Update Avatar Error:', error);
    throw error;
  }
};

// Keşif Tercihlerini Güncelle
export const updateDiscoveryPrefs = async (uid: string, prefs: any) => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      discoveryPrefs: prefs,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Update Discovery Prefs Error:', error);
    throw error;
  }
};

// İlgi Alanlarını Güncelle
export const updateUserInterests = async (uid: string, interests: string[]) => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      interests,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Update Interests Error:', error);
    throw error;
  }
};

// Gizlilik Tercihlerini Güncelle
export const updatePrivacyPrefs = async (uid: string, prefs: any) => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      privacyPrefs: prefs,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Update Privacy Prefs Error:', error);
    throw error;
  }
};

// Hesabı Dondur (15 Gün)
export const freezeAccount = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    const fifteenDays = new Date();
    fifteenDays.setDate(fifteenDays.getDate() + 15);
    await setDoc(userRef, {
      accountStatus: 'frozen',
      frozenAt: serverTimestamp(),
      autoDeleteAt: fifteenDays.toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Freeze Account Error:', error);
    throw error;
  }
};

// Hesabı Tamamen Sil
export const deleteAccount = async (uid: string, reason: string) => {
  try {
    // Önce Feedback kaydet (Silinme Nedeni) - Bu saklanabilir anonim veridir
    const feedbackRef = doc(db, 'deletedFeedback', uid);
    await setDoc(feedbackRef, { uid, reason, deletedAt: serverTimestamp() });
    
    // 1. Ana Kullanıcı Dokümanını Sil
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);

    // 2. Client-Side Cascading Delete (Tüm İlişkili Verileri Best-Effort Yok Etme)
    // Not: Gerçek devasa projelerde bu işlem Firebase Cloud Functions 'Auth.onDelete' ucuyla yapılır.
    try {
       const batch = writeBatch(db);
       
       // Örn: Gelecekte/Şimdi eklenecek "Forum/Posts" içindeki tüm kendi gönderilerini sil
       const postsQuery = query(collection(db, 'posts'), where('authorId', '==', uid));
       const postsSnap = await getDocs(postsQuery);
       postsSnap.forEach(docSnap => batch.delete(docSnap.ref));
       
       // Örn: Açtığı parti/sesli odaları sil
       const roomsQuery = query(collection(db, 'rooms'), where('hostId', '==', uid));
       const roomsSnap = await getDocs(roomsQuery);
       roomsSnap.forEach(docSnap => batch.delete(docSnap.ref));

       // Örn: Ona ait mesajları içeren sohbet geçmişleri (Eğer chat yapısında saklanıyorsa)
       // NOT: Mesajlaşma entegre edildiğinde buraya conversations silme sorgusu eklenecek.

       await batch.commit();
    } catch (e) {
       console.log("Cascading delete (posts/rooms vb.) çalıştırılırken sorun çıktı (koleksiyon henüz kurulmamış olabilir):", e);
    }
    
    // 3. Auth'dan (Sistemden) Tamamen Giriş İzinlerini / Firebase Kimliğini Sil
    if (auth.currentUser) {
        await firebaseDeleteUser(auth.currentUser);
    }
  } catch (error) {
    console.error('Delete Account Error:', error);
    throw error; // If auth requires recent login, it throws error here
  }
};
