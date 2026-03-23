import React from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { useAppStore } from '../utils/store';
import { Colors } from '../theme';
import { Heart, MessageCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const DUMMY_USERS = [
  { id: '1', name: 'Alice', age: 24, bio: 'Love to play Valorant!', image: 'https://i.pravatar.cc/300?img=1' },
  { id: '2', name: 'Mark', age: 26, bio: 'Music & chill.', image: 'https://i.pravatar.cc/300?img=11' },
  { id: '3', name: 'Sophie', age: 22, bio: 'Looking for duo.', image: 'https://i.pravatar.cc/300?img=5' },
  { id: '4', name: 'John', age: 28, bio: 'Gamer by night.', image: 'https://i.pravatar.cc/300?img=8' },
];

export default function HomeScreen() {
  const isDark = useAppStore(state => state.theme === 'dark');
  const colors = isDark ? Colors.dark : Colors.light;

  const renderCard = ({ item }: { item: typeof DUMMY_USERS[0] }) => (
    <TouchableOpacity activeOpacity={0.9} style={styles.cardContainer}>
      <ImageBackground source={{ uri: item.image }} style={styles.image} imageStyle={{ borderRadius: 20 }}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        >
          <View style={styles.cardContent}>
            <View>
              <Text style={styles.name}>{item.name}, {item.age}</Text>
              <Text style={styles.bio}>{item.bio}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn}>
                <MessageCircle color="#FFF" size={24} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.accent }]}>
                <Heart color="#FFF" size={24} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Discover</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Find your BeMatch!</Text>
      </View>
      
      <FlatList
        data={DUMMY_USERS}
        keyExtractor={item => item.id}
        renderItem={renderCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  title: { fontSize: 32, fontWeight: 'bold' },
  subtitle: { fontSize: 16, marginTop: 4 },
  cardContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    height: 400,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  gradient: {
    height: '50%',
    justifyContent: 'flex-end',
    borderRadius: 20,
    padding: 20,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  name: { color: '#FFF', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  bio: { color: '#E2E8F0', fontSize: 16 },
  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  }
});
