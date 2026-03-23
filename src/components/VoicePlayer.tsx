import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { Play, Pause, FastForward, Activity } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface VoicePlayerProps {
  uri: string;
  isMe: boolean;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({ uri, isMe }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const loadSound = async () => {
    try {
      setIsLoading(true);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, rate: playbackSpeed, shouldCorrectPitch: true },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      setIsLoading(false);
      setIsPlaying(true);
    } catch (err) {
      console.error("Failed to load sound", err);
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  const handlePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } else {
      await loadSound();
    }
  };

  const toggleSpeed = async () => {
    const nextSpeed = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
    setPlaybackSpeed(nextSpeed);
    if (sound) {
      await sound.setRateAsync(nextSpeed, true);
    }
  };

  const formatTime = (millis: number) => {
    if (!millis || millis < 0) return '0:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progresses = [0.2, 0.5, 0.8, 0.4, 0.9, 0.3, 0.7, 0.5, 0.2, 0.6, 0.4, 0.8]; // Simulated waveforms

  return (
    <View style={[styles.container, isMe ? styles.containerMe : styles.containerOther]}>
      {/* Play/Pause Button */}
      <TouchableOpacity 
        onPress={handlePlayPause} 
        style={styles.playBtn}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        <LinearGradient
          colors={isMe ? ['#a855f7', '#8b5cf6'] : ['#475569', '#334155']}
          style={styles.btnGradient}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : isPlaying ? (
            <Pause size={18} color="#FFF" fill="#FFF" />
          ) : (
            <Play size={18} color="#FFF" fill="#FFF" style={{ marginLeft: 2 }} />
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Waveform Visualization (Simulated) */}
      <View style={styles.contentArea}>
        <View style={styles.waveContainer}>
          {progresses.map((h, i) => {
            const isActive = duration > 0 && (position / duration) >= (i / progresses.length);
            return (
              <View 
                key={i} 
                style={[
                  styles.waveBar, 
                  { height: h * 20 },
                  isActive && { backgroundColor: isMe ? '#FFF' : '#a855f7' }
                ]} 
              />
            );
          })}
        </View>
        <Text style={[styles.timeText, isMe ? styles.timeMe : styles.timeOther]}>
          {formatTime(isPlaying ? position : duration)}
        </Text>
      </View>

      {/* Speed Control */}
      <TouchableOpacity onPress={toggleSpeed} style={styles.speedBtn} activeOpacity={0.7}>
        <Text style={[styles.speedText, isMe ? styles.speedMe : styles.speedOther]}>{playbackSpeed}x</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 24,
    minWidth: 200,
    maxWidth: 240,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
      }
    }),
  },
  containerMe: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  containerOther: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  btnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 24,
  },
  waveBar: {
    width: 2.5,
    backgroundColor: 'rgba(150, 150, 150, 0.3)',
    borderRadius: 1,
  },
  timeText: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  timeMe: { color: 'rgba(255, 255, 255, 0.7)' },
  timeOther: { color: 'rgba(168, 85, 247, 0.8)' },
  speedBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  speedText: {
    fontSize: 10,
    fontWeight: '900',
  },
  speedMe: { color: '#FFF' },
  speedOther: { color: '#a855f7' },
});
