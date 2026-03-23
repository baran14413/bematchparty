import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';

interface ActionSheetOption {
  label: string;
  icon: any;
  color?: string;
  onPress: () => void;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  options: ActionSheetOption[];
  cancelText?: string;
  header?: React.ReactNode;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({ 
  visible, 
  onClose, 
  options,
  cancelText = 'İptal',
  header
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.sheetOverlay} onPress={onClose}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.sheetContent}>
          <View style={styles.sheetHandle} />
          {header}
          {options.map((opt, i) => (
            <TouchableOpacity key={i} style={styles.sheetItem} onPress={() => { opt.onPress(); onClose(); }}>
              <opt.icon color={opt.color || "#FFF"} size={20} />
              <Text style={[styles.sheetLabel, { color: opt.color || "#FFF" }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.sheetItem, { marginTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }]} onPress={onClose}>
            <Text style={[styles.sheetLabel, { textAlign: 'center', width: '100%', color: 'rgba(255,255,255,0.5)' }]}>{cancelText}</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheetOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetContent: { 
    backgroundColor: '#1e293b', 
    borderTopLeftRadius: 25, 
    borderTopRightRadius: 25, 
    padding: 20, 
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  sheetHandle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, gap: 15 },
  sheetLabel: { color: '#FFF', fontSize: 16, fontWeight: '600' }
});
