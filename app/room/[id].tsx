import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { X, Mic, MicOff, Send, MessageCircle, Gift, Users } from 'lucide-react-native';
import { Colors } from '@/src/theme';

const { width, height } = Dimensions.get('window');

const SEATS = [
  { id: 1, name: 'Kaan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kaan', isMuted: false },
  { id: 2, name: 'Zeynep', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zeynep', isMuted: true },
  { id: 3, name: 'Burak', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Burak', isMuted: false },
  { id: 4, name: null, avatar: null, isMuted: true },
  { id: 5, name: null, avatar: null, isMuted: true },
  { id: 6, name: null, avatar: null, isMuted: true },
];

const CHAT_MESSAGES = [
  { id: '1', user: 'Ahmet', text: 'Selamlar herkese!' },
  { id: '2', user: 'Zeynep', text: 'Hoş geldin Ahmet 👋' },
  { id: '3', user: 'Kaan', text: 'Müzik çok iyi şu an' },
];

export default function RoomScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [isMuted, setIsMuted] = useState(true);
  const [message, setMessage] = useState('');
  
  // Use a fallback image if parameter is empty (for demo purposes)
  const bgImage = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=600&auto=format&fit=crop';

  return (
    <View style={styles.container}>
      <Image source={{ uri: bgImage }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
      <LinearGradient colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={styles.header}>
         <View style={styles.headerInfo}>
            <Text style={styles.roomName}>Gece Kuşları 🦉</Text>
            <View style={styles.listenerBadge}>
               <Users color="#cbd5e1" size={12} />
               <Text style={styles.listenerCount}>124 Dinleyici</Text>
            </View>
         </View>
         <TouchableOpacity onPress={() => router.back()} style={styles.exitBtn}>
            <X color="#FFF" size={24} />
         </TouchableOpacity>
      </View>

      {/* Seats Grid */}
      <View style={styles.seatsContainer}>
         {SEATS.map(seat => (
            <View key={seat.id} style={styles.seatWrap}>
               <TouchableOpacity style={[styles.seatBox, !seat.avatar && styles.emptySeatBox]}>
                  {seat.avatar ? (
                     <Image source={{ uri: seat.avatar }} style={styles.seatAvatar} />
                  ) : (
                     <Mic2Icon color="rgba(255,255,255,0.3)" size={24} /> // Add a generic icon
                  )}
                  {seat.avatar && (
                     <View style={[styles.micIndicator, seat.isMuted && styles.micIndicatorMuted]}>
                        {seat.isMuted ? <MicOff color="#FFF" size={10} /> : <Mic color="#FFF" size={10} />}
                     </View>
                  )}
               </TouchableOpacity>
               <Text style={styles.seatName}>{seat.name || 'Boş'}</Text>
            </View>
         ))}
      </View>

      {/* Bottom Chat Area */}
      <BlurView intensity={30} tint="dark" style={styles.bottomArea}>
         
         <ScrollView style={styles.chatScroll} showsVerticalScrollIndicator={false}>
            {CHAT_MESSAGES.map(msg => (
               <View key={msg.id} style={styles.chatBubble}>
                  <Text style={styles.chatUser}>{msg.user}: </Text>
                  <Text style={styles.chatText}>{msg.text}</Text>
               </View>
            ))}
         </ScrollView>

         <View style={styles.inputRow}>
            <TouchableOpacity 
               style={[styles.mainMicBtn, isMuted ? styles.micBtnMuted : styles.micBtnActive]}
               onPress={() => setIsMuted(!isMuted)}
            >
               {isMuted ? <MicOff color="#FFF" size={24} /> : <Mic color="#FFF" size={24} />}
            </TouchableOpacity>

            <View style={styles.inputBox}>
               <TextInput 
                  style={styles.input}
                  placeholder="Mesaj gönder..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={message}
                  onChangeText={setMessage}
               />
               <TouchableOpacity style={styles.sendBtn}>
                  <Send color={message.length > 0 ? '#6366f1' : 'rgba(255,255,255,0.3)'} size={20} />
               </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.giftBtn}>
               <Gift color="#f59e0b" size={24} />
            </TouchableOpacity>
         </View>

      </BlurView>
    </View>
  );
}

// Temporary icon component for empty seat
const Mic2Icon = ({ color, size }: { color: string, size: number }) => (
    <View style={{ width: size, height: size, borderRadius: size/2, backgroundColor: color }} />
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', 
    justifyContent: 'space-between', alignItems: 'flex-start',
  },
  headerInfo: { flex: 1 },
  roomName: { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  listenerBadge: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 6 
  },
  listenerCount: { color: '#cbd5e1', fontSize: 12, fontWeight: '600' },
  exitBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },

  seatsContainer: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20, 
    paddingHorizontal: 20, marginTop: 40
  },
  seatWrap: { alignItems: 'center', width: 80 },
  seatBox: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2, borderColor: '#FFF', position: 'relative', justifyContent: 'center', alignItems: 'center'
  },
  emptySeatBox: { borderColor: 'rgba(255,255,255,0.3)', borderStyle: 'dashed' },
  seatAvatar: { width: 60, height: 60, borderRadius: 30 },
  micIndicator: {
    position: 'absolute', bottom: -5, right: -5, width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#000'
  },
  micIndicatorMuted: { backgroundColor: '#ef4444' },
  seatName: { color: '#FFF', fontSize: 13, fontWeight: '600', marginTop: 10 },

  bottomArea: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: 30, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  chatScroll: { height: 150, paddingHorizontal: 20, paddingTop: 15 },
  chatBubble: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 8, maxWidth: '85%' },
  chatUser: { color: '#818cf8', fontWeight: '700', fontSize: 14 },
  chatText: { color: '#FFF', fontSize: 14, flexShrink: 1 },

  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingTop: 15, gap: 10 },
  mainMicBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  micBtnActive: { backgroundColor: '#10b981' },
  micBtnMuted: { backgroundColor: 'rgba(255,255,255,0.15)' },
  
  inputBox: { flex: 1, height: 48, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, flexDirection: 'row', alignItems: 'center', paddingLeft: 15, paddingRight: 5 },
  input: { flex: 1, color: '#FFF', fontSize: 15 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  
  giftBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' }
});
