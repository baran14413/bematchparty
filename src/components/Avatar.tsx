import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';
import { useAppStore } from '../utils/store';
import { Colors } from '../theme';
import { User } from 'lucide-react-native';

interface AvatarProps {
  uri?: string;
  size?: number;
  style?: ViewStyle;
}

export default function Avatar({ uri, size = 50, style }: AvatarProps) {
  const isDark = useAppStore(state => state.theme === 'dark');
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surface, borderColor: colors.border }, style]}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <User color={colors.textSecondary} size={size * 0.5} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  }
});
