import { create } from 'zustand';

export type SupportedLanguage = 'en' | 'tr' | 'de';

export type UserTheme = 'dark' | 'light';

export interface DiscoveryPrefs {
  locationName?: string;
  locationUpdatedAt?: string;
  gender?: 'female' | 'male' | 'everyone';
  minAge?: number;
  maxAge?: number;
  globalMode?: boolean;
}

export interface PrivacyPrefs {
  showProfile?: boolean;
  onlineStatus?: boolean;
  readReceipts?: boolean;
  distanceInfo?: boolean;
  incognitoMode?: boolean;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  onboarded: boolean;
  age?: string;
  interests?: string[];
  bio?: string;
  avatar?: string;
  gender?: 'male' | 'female' | '';
  discoveryPrefs?: DiscoveryPrefs;
  privacyPrefs?: PrivacyPrefs;
}

interface AppState {
  theme: UserTheme;
  user: User | null;
  isLoading: boolean;
  language: SupportedLanguage;
  isAuthReady: boolean;
  setTheme: (theme: UserTheme) => void;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setLanguage: (lang: SupportedLanguage) => void;
  setAuthReady: (ready: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark',
  user: null,
  isLoading: false,
  language: 'tr',
  isAuthReady: false,
  setTheme: (theme) => set({ theme }),
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setLanguage: (lang) => set({ language: lang }),
  setAuthReady: (ready) => set({ isAuthReady: ready }),
}));
