import { Stack } from 'expo-router';
import React from 'react';
import { useAppStore } from '@/src/utils/store';
import { Colors } from '@/src/theme';

export default function SettingsLayout() {
  const { theme } = useAppStore();
  const isDark = theme === 'dark';
  
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? '#0f172a' : '#FAFAFA' },
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="personal" />
      <Stack.Screen name="discovery" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="gallery" />
      <Stack.Screen name="account" />
      <Stack.Screen name="system" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
