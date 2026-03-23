import { Tabs } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Home, Globe, Mic2, MessageCircle, User, Bell } from 'lucide-react-native';
import { Colors } from '@/src/theme';
import { useAppStore } from '@/src/utils/store';
import { translations } from '@/src/utils/i18n';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { subscribeToNotifications } from '@/src/utils/notificationService';

export default function TabLayout() {
  const { theme, language, user } = useAppStore();
  const isDark = theme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const t = translations[language];

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Bildirimleri dinle
    const unsubscribeNotifications = subscribeToNotifications(user.uid, (data) => {
      const unread = data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    });

    // Kullanıcı durumunu çevrimiçi yap
    import('@/src/utils/userService').then(({ updatePresence }) => {
      updatePresence(user.uid, true);
    });

    // Uygulama kapandığında veya kullanıcı değiştiğinde çevrimdışı yap (basit versiyon)
    return () => {
      unsubscribeNotifications();
      import('@/src/utils/userService').then(({ updatePresence }) => {
        updatePresence(user.uid, false);
      });
    };
  }, [user]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + (Platform.OS === 'android' ? 10 : 0),
          paddingTop: 10,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={40}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t.discoverTab,
          tabBarIcon: ({ color }) => <Home color={color} size={26} />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          tabBarIcon: ({ color }) => <Globe color={color} size={26} />,
        }}
      />
      <Tabs.Screen
        name="party"
        options={{
          title: t.partyTab,
          tabBarIcon: ({ color }) => <Mic2 color={color} size={26} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: t.messagesTab,
          tabBarIcon: ({ color }) => <MessageCircle color={color} size={26} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t.profileTab,
          tabBarIcon: ({ color }) => <User color={color} size={26} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ec4899',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1e1b4b',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  }
});
