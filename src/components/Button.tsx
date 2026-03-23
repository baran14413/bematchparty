import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useAppStore } from '../utils/store';
import { Colors } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({ title, onPress, variant = 'primary', loading, style, textStyle }: ButtonProps) {
  const isDark = useAppStore(state => state.theme === 'dark');
  const colors = isDark ? Colors.dark : Colors.light;

  const getBgColor = () => {
    if (variant === 'primary') return colors.primary;
    if (variant === 'secondary') return colors.surface;
    return 'transparent';
  };

  const getTextColor = () => {
    if (variant === 'primary') return '#FFFFFF';
    if (variant === 'secondary') return colors.text;
    return colors.primary;
  };

  const borderStyle = variant === 'outline' ? { borderWidth: 1, borderColor: colors.primary } : {};

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: getBgColor() },
        borderStyle,
        style
      ]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  }
});
