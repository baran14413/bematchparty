import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Heart, MessageCircle, MoreHorizontal, CheckCircle2 } from 'lucide-react-native';
import { Post, voteOnPoll } from '../utils/postService';
import { translations } from '../utils/i18n';

const { width } = Dimensions.get('window');

interface PostItemProps {
  post: Post;
  userId: string;
  isDark: boolean;
  language: 'en' | 'tr' | 'de';
  onPress?: () => void;
  onUserPress?: (uid: string) => void;
  onHashtagPress?: (tag: string) => void;
  onMorePress?: () => void;
}

export const formatTime = (date: any) => {
  if (!date) return '...';
  const d = date.toDate ? date.toDate() : new Date(date);
  const diff = (new Date().getTime() - d.getTime()) / 1000;
  if (diff < 60) return 'Az önce';
  if (diff < 3600) return `${Math.floor(diff / 60)}dk`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}sa`;
  return `${Math.floor(diff / 86400)}g`;
};

export const PostItem: React.FC<PostItemProps> = ({ 
  post, 
  userId, 
  isDark, 
  language, 
  onPress, 
  onUserPress,
  onHashtagPress,
  onMorePress
}) => {
  const t = translations[language] as any;
  const isLiked = post.likedBy?.includes(userId);

  const renderRichText = (inputText: string) => {
    const parts = inputText.split(/(#[\w\u00C0-\u017F]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <Text 
            key={i} 
            style={styles.hashtagText} 
            onPress={() => onHashtagPress && onHashtagPress(part.substring(1))}
          >
            {part}
          </Text>
        );
      }
      return <Text key={i}>{part}</Text>;
    });
  };

  const handleVote = (idx: number) => {
    if (post.poll && !post.poll.options.some(opt => opt.votedBy.includes(userId))) {
      voteOnPoll(post.id, idx, userId);
    }
  };

  return (
    <Pressable style={[styles.postWrapper, isDark ? styles.postWrapperDark : styles.postWrapperLight]} onPress={onPress}>
      <View style={styles.postHeader}>
        <TouchableOpacity onPress={() => onUserPress && onUserPress(post.userId)}>
          <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => onUserPress && onUserPress(post.userId)}>
            <Text style={[styles.userName, !isDark && { color: '#000' }]}>{post.userName}</Text>
          </TouchableOpacity>
          <Text style={[styles.timeText, !isDark && { color: 'rgba(0,0,0,0.5)' }]}>{formatTime(post.createdAt)}</Text>
        </View>
        <TouchableOpacity onPress={onMorePress}>
          <MoreHorizontal color="rgba(255,255,255,0.4)" size={20} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.postText, !isDark && { color: '#1f2937' }]}>{renderRichText(post.text)}</Text>

      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} contentFit="cover" />
      )}

      {post.poll && (
        <View style={styles.pollCard}>
          <Text style={[styles.pollQuestion, !isDark && { color: '#000' }]}>{post.poll.question}</Text>
          <View style={styles.pollOptionsList}>
            {post.poll.options.map((opt, idx) => {
              const hasVoted = post.poll!.options.some(o => o.votedBy.includes(userId));
              const percentage = post.poll!.totalVotes > 0 ? Math.round((opt.votes / post.poll!.totalVotes) * 100) : 0;
              const userSelected = opt.votedBy.includes(userId);
              
              return (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.pollOption, hasVoted && styles.pollOptionVoted, !isDark && { backgroundColor: 'rgba(0,0,0,0.03)' }]} 
                  onPress={() => handleVote(idx)}
                  disabled={hasVoted}
                >
                  {hasVoted && (
                    <View style={[styles.pollProgress, { width: `${percentage}%` }]} />
                  )}
                  <View style={styles.pollOptionContent}>
                    <Text style={[styles.pollOptionText, !isDark && { color: '#000' }, userSelected && styles.pollOptionTextSelected]}>
                      {opt.text}
                    </Text>
                    {hasVoted && (
                       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                          {userSelected && <CheckCircle2 size={14} color="#a855f7" />}
                          <Text style={styles.pollPercentage}>{percentage}%</Text>
                       </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.postFooter}>
        <View style={styles.footerAction}>
          <Heart size={20} color={isLiked ? "#ef4444" : "rgba(255,255,255,0.4)"} fill={isLiked ? "#ef4444" : "transparent"} />
          <Text style={[styles.footerText, isLiked && { color: '#ef4444' }]}>{post.likedBy?.length || 0}</Text>
        </View>
        <View style={styles.footerAction}>
          <MessageCircle size={20} color="rgba(255,255,255,0.4)" />
          <Text style={styles.footerText}>{post.comments || 0}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  postWrapper: { padding: 15, borderRadius: 20, marginBottom: 15, borderWidth: 1 },
  postWrapperDark: { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)' },
  postWrapperLight: { backgroundColor: '#FFF', borderColor: '#F3F4F6', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  userName: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  timeText: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  postText: { color: '#FFF', fontSize: 15, lineHeight: 22, marginBottom: 12 },
  hashtagText: { color: '#a855f7', fontWeight: '600' },
  postImage: { width: '100%', height: 250, borderRadius: 15, marginBottom: 12 },
  
  pollCard: { backgroundColor: 'rgba(168, 85, 247, 0.05)', borderRadius: 15, padding: 15, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#a855f7' },
  pollQuestion: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 15 },
  pollOptionsList: { gap: 10 },
  pollOption: { height: 45, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden', justifyContent: 'center' },
  pollOptionVoted: { backgroundColor: 'rgba(255,255,255,0.02)' },
  pollProgress: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(168, 85, 247, 0.15)' },
  pollOptionContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15 },
  pollOptionText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  pollOptionTextSelected: { color: '#a855f7' },
  pollPercentage: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700' },

  postFooter: { flexDirection: 'row', alignItems: 'center', gap: 20, paddingTop: 10 },
  footerAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '600' }
});
