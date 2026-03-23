import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Colors } from '@/src/theme';
import { useAppStore } from '@/src/utils/store';
import { translations } from '@/src/utils/i18n';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Image as ImageIcon, X, BarChart2, Plus } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { createPost } from '@/src/utils/postService';

const { height } = Dimensions.get('window');

export default function CreatePostScreen() {
  const { user, theme, language } = useAppStore();
  const t = translations[language] as any;
  const isDark = theme === 'dark';
  const router = useRouter();
  const params = useLocalSearchParams();

  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Poll State
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  // Handle Edit Mode Pre-fill
  useEffect(() => {
    if (params.editMode === 'true') {
      if (params.initialText) setText(params.initialText as string);
      if (params.initialImage) setImageUri(params.initialImage as string);
      if (params.pollQuestion) {
        setShowPoll(true);
        setPollQuestion(params.pollQuestion as string);
        try {
          const options = JSON.parse(params.pollOptions as string);
          setPollOptions(options);
        } catch (e) {
          console.error("Error parsing poll options:", e);
        }
      }
    }
  }, [params]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const addOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const updateOption = (text: string, index: number) => {
    const newOptions = [...pollOptions];
    newOptions[index] = text;
    setPollOptions(newOptions);
  };

  const removeOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handlePublish = async () => {
    if (!text.trim() && !imageUri && !showPoll) return;
    if (!user) return;

    // Validate poll
    let finalPollData = undefined;
    if (showPoll) {
       if (!pollQuestion.trim() || pollOptions.some(opt => !opt.trim())) {
          Alert.alert(t.welcome, t.pollError);
          return;
       }
       finalPollData = { question: pollQuestion, options: pollOptions };
    }

    setIsPublishing(true);
    try {
      await createPost(
          user.uid,
          user.displayName || 'BeMatch User',
          user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg',
          text,
          imageUri,
          finalPollData
      );
      
      setIsPublishing(false);
      // Başarılı paylaşım sonrası profile git (düzenleme bittiği için)
      if (params.editMode === 'true') {
        router.replace('/(tabs)/profile');
      } else {
        router.replace('/(tabs)/feed');
      }
    } catch (error) {
      console.error("Publish Error:", error);
      Alert.alert('Hata', 'Gönderi paylaşılamadı. Lütfen tekrar deneyin.');
      setIsPublishing(false);
    }
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/feed');
    }
  };

  return (
    <View style={styles.container}>
      {isDark && <LinearGradient colors={['#0f172a', '#1e1b4b']} style={styles.background} />}

      {/* HEADER */}
      <View style={[styles.header, !isDark && styles.headerLight]}>
        <TouchableOpacity onPress={handleGoBack} disabled={isPublishing} style={styles.backBtn}>
          <ChevronLeft color={isDark ? "#FFF" : "#000"} size={28} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, !isDark && { color: '#000' }]}>
           {params.editMode === 'true' 
             ? (language === 'tr' ? 'Gönderiyi Düzenle' : 'Edit Post')
             : (language === 'tr' ? 'Gönderi Oluştur' : language === 'de' ? 'Beitrag erstellen' : 'Create Post')
           }
        </Text>
        
        <TouchableOpacity 
           style={[styles.publishBtn, (!text.trim() && !imageUri && !showPoll) && { opacity: 0.5 }]} 
           onPress={handlePublish}
           disabled={(!text.trim() && !imageUri && !showPoll) || isPublishing}
        >
          {isPublishing ? (
             <ActivityIndicator size="small" color="#FFF" />
          ) : (
             <Text style={styles.publishText}>
               {params.editMode === 'true' 
                 ? (language === 'tr' ? 'Güncelle' : 'Update') 
                 : (language === 'tr' ? 'Paylaş' : language === 'de' ? 'Teilen' : 'Post')
               }
             </Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
         behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
         style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
           <View style={styles.userInfo}>
              <Image source={{ uri: user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg' }} style={styles.avatar} />
              <View>
                 <Text style={[styles.userName, !isDark && { color: '#000' }]}>{user?.displayName || 'User'}</Text>
                 <Text style={[styles.privacyText, !isDark && { color: 'rgba(0,0,0,0.4)' }]}>{language === 'tr' ? 'Herkes görebilir' : 'Public'}</Text>
              </View>
           </View>

           <TextInput
             style={[styles.input, !isDark && { color: '#1f2937' }]}
             placeholder={language === 'tr' ? "Bugün neler hissediyorsun? #etiket" : language === 'de' ? "Was denkst du heute? #tag" : "What's on your mind? #hashtag"}
             placeholderTextColor={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
             multiline
             autoFocus
             value={text}
             onChangeText={setText}
           />

           {imageUri && (
              <View style={styles.imagePreviewContainer}>
                 <Image source={{ uri: imageUri }} style={styles.imagePreview} contentFit="cover" />
                 <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImageUri(null)}>
                    <X color="#FFF" size={20} />
                 </TouchableOpacity>
              </View>
           )}

           {showPoll && (
              <View style={[styles.pollContainer, !isDark && styles.pollContainerLight]}>
                 <View style={styles.pollHeader}>
                    <Text style={styles.pollTitle}>{t.createPoll}</Text>
                    <TouchableOpacity onPress={() => setShowPoll(false)}>
                       <X color="#ef4444" size={20} />
                    </TouchableOpacity>
                 </View>
                 
                 <TextInput 
                   style={[styles.pollInput, !isDark && styles.pollInputLight]}
                   placeholder={t.askQuestion}
                   placeholderTextColor="rgba(255,255,255,0.4)"
                   value={pollQuestion}
                   onChangeText={setPollQuestion}
                 />

                 {pollOptions.map((opt, idx) => (
                    <View key={idx} style={styles.optionRow}>
                       <TextInput 
                          style={[styles.pollInput, { flex: 1, marginBottom: 0 }, !isDark && styles.pollInputLight]}
                           placeholder={`${t.option} ${idx + 1}`}
                          placeholderTextColor="rgba(255,255,255,0.4)"
                          value={opt}
                          onChangeText={(t) => updateOption(t, idx)}
                       />
                       {pollOptions.length > 2 && (
                          <TouchableOpacity onPress={() => removeOption(idx)} style={styles.removeOptBtn}>
                             <X color="rgba(255,255,255,0.4)" size={16} />
                          </TouchableOpacity>
                       )}
                    </View>
                 ))}

                 {pollOptions.length < 4 && (
                    <TouchableOpacity style={styles.addOptionBtn} onPress={addOption}>
                       <Plus color="#a855f7" size={18} />
                       <Text style={styles.addOptionText}>{t.addOption}</Text>
                    </TouchableOpacity>
                 )}
              </View>
           )}
           <View style={{ height: 100 }} />
        </ScrollView>
        
        {/* BOTTOM TOOLBAR */}
        <View style={[styles.toolbar, !isDark && styles.toolbarLight]}>
           <TouchableOpacity style={styles.toolbarBtn} onPress={pickImage} disabled={isPublishing}>
              <ImageIcon color={isDark ? "#FFF" : "#000"} size={22} />
              <Text style={[styles.toolbarText, !isDark && { color: '#000' }]}>
                 {language === 'tr' ? 'Fotoğraf' : language === 'de' ? 'Foto' : 'Photo'}
              </Text>
           </TouchableOpacity>

           <TouchableOpacity 
             style={[styles.toolbarBtn, showPoll && styles.toolbarBtnActive]} 
             onPress={() => setShowPoll(!showPoll)} 
             disabled={isPublishing}
           >
              <BarChart2 color={showPoll ? "#FFF" : (isDark ? "#FFF" : "#000")} size={22} />
              <Text style={[styles.toolbarText, !isDark && { color: '#000' }, showPoll && { color: '#FFF' }]}>
                 {t.createPoll.split(' ')[0]}
              </Text>
           </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  background: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  
  header: {
    paddingTop: 60, paddingHorizontal: 15, paddingBottom: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerLight: { backgroundColor: '#FFF', borderBottomColor: 'rgba(0,0,0,0.05)' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  
  publishBtn: {
    backgroundColor: '#a855f7',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    minWidth: 70
  },
  publishText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  
  content: { flex: 1, padding: 20 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 25 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(150,150,150,0.2)' },
  userName: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  privacyText: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  
  input: {
    color: '#FFF', fontSize: 19, lineHeight: 28,
    minHeight: 120, textAlignVertical: 'top',
    marginBottom: 20
  },
  
  imagePreviewContainer: {
    width: '100%', aspectRatio: 1.2,
    borderRadius: 24, overflow: 'hidden',
    marginBottom: 30, position: 'relative'
  },
  imagePreview: { width: '100%', height: '100%' },
  removeImageBtn: {
    position: 'absolute', top: 15, right: 15,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center'
  },

  pollContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 30
  },
  pollContainerLight: { backgroundColor: '#F3F4F6', borderColor: 'rgba(0,0,0,0.05)' },
  pollHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  pollTitle: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  pollInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12,
    color: '#FFF', fontSize: 15, marginBottom: 15
  },
  pollInputLight: { backgroundColor: '#FFF', color: '#000' },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  removeOptBtn: { padding: 5 },
  addOptionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  addOptionText: { color: '#a855f7', fontWeight: '700', fontSize: 15 },

  toolbar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 15, paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)'
  },
  toolbarLight: { backgroundColor: '#FFF', borderTopColor: 'rgba(0,0,0,0.05)' },
  toolbarBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  toolbarBtnActive: { backgroundColor: '#a855f7' },
  toolbarText: { color: '#FFF', fontSize: 14, fontWeight: '700' }
});
