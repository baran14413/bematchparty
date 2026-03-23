import React from 'react';
import { View, Text, StyleSheet, Switch, Image } from 'react-native';
import { useAppStore } from '../utils/store';
import { Colors } from '../theme';

export default function ProfileScreen() {
  const { theme, setTheme } = useAppStore();
  const isDark = theme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder} />
        <Text style={[styles.name, { color: colors.text }]}>Guest User</Text>
      </View>
      
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
            trackColor={{ false: '#767577', true: colors.primary }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', padding: 20 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#3B82F6', marginBottom: 10 },
  name: { fontSize: 22, fontWeight: 'bold' },
  section: { margin: 20, padding: 20, borderRadius: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 16 }
});
