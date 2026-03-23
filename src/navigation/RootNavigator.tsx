import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useAppStore } from '../utils/store';
import MainTabNavigator from './MainTabNavigator';
import { Colors } from '../theme';

export default function RootNavigator() {
  const isDark = useAppStore(state => state.theme === 'dark');
  const colors = isDark ? Colors.dark : Colors.light;

  const CustomTheme = {
    ... (isDark ? DarkTheme : DefaultTheme),
    colors: {
      ... (isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      text: colors.text,
    }
  };

  return (
    <NavigationContainer theme={CustomTheme}>
      <MainTabNavigator />
    </NavigationContainer>
  );
}
