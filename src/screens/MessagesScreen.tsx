import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppStore } from '../utils/store';
import { Colors } from '../theme';

export default function MessagesScreen() {
  const isDark = useAppStore(state => state.theme === 'dark');
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.text }]}>Direct Messages</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 18, fontWeight: 'bold' }
});
