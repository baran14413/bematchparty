import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export interface DiscoveryUser {
  uid: string;
  displayName: string;
  age: string;
  photoURL: string;
  interests: string[];
  bio: string;
  location?: string;
  isOnline?: boolean;
}

// Keşfet ekranı için kullanıcıları getir
export const getDiscoveryUsers = async (currentUid: string, filters?: { gender?: string, minAge?: number, maxAge?: number }) => {
  try {
    const usersRef = collection(db, 'users');
    
    // Basit bir sorgu: Kendimiz hariç herkesi getir (Onboarding tamamlamış olanlar)
    // Not: Firestore'da '!=' operatörü bazen indeks gerektirir. 
    // Basitlik için tüm onboarded kullanıcıları çekip kod tarafında filtreleyeceğiz.
    const q = query(
      usersRef, 
      where('onboarded', '==', true),
      limit(20)
    );

    const querySnapshot = await getDocs(q);
    const users: DiscoveryUser[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (doc.id !== currentUid) {
        users.push({
          uid: doc.id,
          displayName: data.displayName || 'İsimsiz',
          age: data.age || '??',
          photoURL: data.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky',
          interests: data.interests || [],
          bio: data.bio || '',
          location: data.location || 'Yakınlarda',
          isOnline: Math.random() > 0.5, // Şimdilik online durumunu simüle ediyoruz
        });
      }
    });

    return users;
  } catch (error) {
    console.error('Fetch Discovery Users Error:', error);
    return [];
  }
};
