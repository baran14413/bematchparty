import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, FlatList, ScrollView, Dimensions, ActivityIndicator, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAppStore } from '@/src/utils/store';
import { translations } from '@/src/utils/i18n';
import { Colors, Typography } from '@/src/theme';
import { Check, ArrowRight, User, Heart, Info, Camera, ShieldCheck, MapPin, X, Users } from 'lucide-react-native';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { saveUserProfile } from '@/src/utils/authService';

const { width, height } = Dimensions.get('window');

const AVATARS = Array.from({ length: 50 }).map((_, idx) => 
  `https://api.dicebear.com/7.x/avataaars/svg?seed=PremiumAvatar${idx * 17}&backgroundColor=111827`
);

export default function OnboardingScreen() {
  const { user, setUser, language } = useAppStore();
  const t = translations[language];
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [about, setAbout] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [locationName, setLocationName] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showTermsModal, setShowTermsModal] = useState(false);

  const nextStep = () => setStep(prev => prev + 1);
  
  const finishOnboarding = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await saveUserProfile(user.uid, {
        email: user.email,
        displayName: fullName,
        age,
        gender,
        bio: about,
        photoURL: selectedAvatar,
        interests: selectedInterests,
        onboarded: true,
      });
      
      setUser({ 
        ...user, 
        onboarded: true, 
        displayName: fullName, 
        age, 
        gender,
        photoURL: selectedAvatar, 
        interests: selectedInterests, 
        bio: about 
      });
    } catch (error) {
      console.error('Onboarding save error:', error);
      Alert.alert('Hata', 'Profil kaydedilirken bir hata oluştu. Tekrar deneyin.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(prev => prev.filter(i => i !== interest));
    } else {
      setSelectedInterests(prev => [...prev, interest]);
    }
  };

  const getLocation = async () => {
    setLocationStatus('loading');
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Hata', 'Konum izni reddedildi, devam etmek için izne ihtiyacımız var.');
      setLocationStatus('idle');
      return;
    }
    
    try {
       const locationPromise = Location.getCurrentPositionAsync({});
       const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Location fetch timeout')), 6000)
       );
       const location: any = await Promise.race([locationPromise, timeoutPromise]);
       const lat = location.coords.latitude;
       const lng = location.coords.longitude;
       
       try {
           const reverseGeocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
           if (reverseGeocode && reverseGeocode.length > 0) {
               const place = reverseGeocode[0];
               const city = place.city || place.subregion || place.region || '';
               const country = place.country || place.isoCountryCode || '';
                if (city || country) {
                    setLocationName(`${city}${city && country ? ', ' : ''}${country}`);
                    setLocationStatus('success');
                    return;
                }
           }
       } catch (e) {
           console.log("Expo geocode failed, trying fallback", e);
       }

       try {
           const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`);
           const data = await res.json();
           if (data && data.address) {
               const city = data.address.city || data.address.town || data.address.state || '';
               const country = data.address.country || '';
               setLocationName(`${city}${city && country ? ', ' : ''}${country}`);
           } else {
               setLocationName('Bilinmeyen Şehir');
           }
       } catch (e) {
           setLocationName('Bilinmeyen Şehir');
       }
       
       setLocationStatus('success');
    } catch (error) {
       console.warn("Location error/timeout:", error);
       setLocationName('Bilinmeyen Konum');
       setLocationStatus('success');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: // Agreement
        return (
          <View style={styles.stepContainer}>
            <ShieldCheck color={Colors.dark.primary} size={60} style={styles.icon} />
            <Text style={styles.title}>{t.termsTitle}</Text>
            <Text style={styles.description}>{t.termsDesc}</Text>
            <View style={styles.agreementRow}>
              <TouchableOpacity 
                style={[styles.checkbox, agreed && styles.checkboxSelected]} 
                onPress={() => setAgreed(!agreed)}
                activeOpacity={0.7}
              >
                {agreed && <Check color="#FFF" size={16} />}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowTermsModal(true)} style={{ flex: 1 }}>
                 <Text style={[styles.agreementText, { textDecorationLine: 'underline', color: '#60a5fa' }]}>{t.acceptTerms}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
                style={[styles.nextButton, !agreed && styles.disabledButton]} 
                onPress={nextStep}
                disabled={!agreed}
            >
              <Text style={styles.nextButtonText}>{t.next}</Text>
              <ArrowRight color="#FFF" size={20} />
            </TouchableOpacity>
          </View>
        );
      case 2: // Name
        return (
          <View style={styles.stepContainer}>
            <User color={Colors.dark.primary} size={60} style={styles.icon} />
            <Text style={styles.title}>{t.whatIsYourName}</Text>
            <Text style={styles.description}>{t.nameDesc}</Text>
            <BlurView intensity={20} tint="dark" style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder={t.fullName}
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={fullName}
                onChangeText={setFullName}
                autoFocus
              />
            </BlurView>
            <TouchableOpacity 
                style={[styles.nextButton, fullName.length < 3 && styles.disabledButton]} 
                onPress={nextStep}
                disabled={fullName.length < 3}
            >
              <Text style={styles.nextButtonText}>{t.next}</Text>
              <ArrowRight color="#FFF" size={20} />
            </TouchableOpacity>
          </View>
        );
      case 3: // Age
        return (
          <View style={styles.stepContainer}>
            <Info color={Colors.dark.primary} size={60} style={styles.icon} />
            <Text style={styles.title}>{t.ageTitle}</Text>
            <Text style={styles.description}>{t.ageDesc}</Text>
            <BlurView intensity={20} tint="dark" style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder={t.agePlaceholder}
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                maxLength={2}
                autoFocus
              />
            </BlurView>
            <TouchableOpacity 
                style={[styles.nextButton, (!age || parseInt(age) < 18) && styles.disabledButton]} 
                onPress={nextStep}
                disabled={!age || parseInt(age) < 18}
            >
              <Text style={styles.nextButtonText}>{t.next}</Text>
              <ArrowRight color="#FFF" size={20} />
            </TouchableOpacity>
          </View>
        );
      case 4: // Gender selection
        return (
          <View style={styles.stepContainer}>
             <Users color={Colors.dark.primary} size={60} style={styles.icon} />
             <Text style={styles.title}>{(t as any).genderTitle}</Text>
             <Text style={styles.description}>{(t as any).genderDesc}</Text>
             
             <View style={styles.genderOptions}>
                <TouchableOpacity 
                   style={[styles.genderBtn, gender === 'female' && styles.genderBtnSelected]} 
                   onPress={() => setGender('female')}
                >
                   <Text style={[styles.genderBtnText, gender === 'female' && styles.genderBtnTextSelected]}>{t.genderFemale}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                   style={[styles.genderBtn, gender === 'male' && styles.genderBtnSelected]} 
                   onPress={() => setGender('male')}
                >
                   <Text style={[styles.genderBtnText, gender === 'male' && styles.genderBtnTextSelected]}>{t.genderMale}</Text>
                </TouchableOpacity>
             </View>

             <TouchableOpacity 
                 style={[styles.nextButton, !gender && styles.disabledButton]} 
                 onPress={nextStep}
                 disabled={!gender}
             >
               <Text style={styles.nextButtonText}>{t.next}</Text>
               <ArrowRight color="#FFF" size={20} />
             </TouchableOpacity>
          </View>
        );
      case 5: // Interests
        return (
          <View style={styles.stepContainer}>
            <Heart color={Colors.dark.primary} size={60} style={styles.icon} />
            <Text style={styles.title}>{t.interestsTitle}</Text>
            <Text style={styles.description}>{t.interestsDesc}</Text>
            <View style={styles.interestsGrid}>
              {t.interestsList.map(item => (
                <TouchableOpacity 
                  key={item} 
                  style={[styles.interestChip, selectedInterests.includes(item) && styles.interestChipSelected]}
                  onPress={() => toggleInterest(item)}
                >
                  <Text style={[styles.interestText, selectedInterests.includes(item) && styles.interestTextSelected]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity 
                style={[styles.nextButton, selectedInterests.length < 3 && styles.disabledButton]} 
                onPress={nextStep}
                disabled={selectedInterests.length < 3}
            >
              <Text style={styles.nextButtonText}>{t.next}</Text>
              <ArrowRight color="#FFF" size={20} />
            </TouchableOpacity>
          </View>
        );
      case 6: // About
        return (
          <View style={styles.stepContainer}>
            <Info color={Colors.dark.primary} size={60} style={styles.icon} />
            <Text style={styles.title}>{t.bioTitle}</Text>
            <Text style={styles.description}>{t.bioDesc}</Text>
            <BlurView intensity={20} tint="dark" style={[styles.inputWrapper, styles.bioWrapper]}>
              <TextInput
                style={[styles.input, styles.bioInput]}
                placeholder={t.bioPlaceholder}
                placeholderTextColor="rgba(255,255,255,0.4)"
                multiline
                maxLength={120}
                numberOfLines={4}
                value={about}
                onChangeText={setAbout}
              />
              <Text style={styles.charCounter}>{about.length}/120</Text>
            </BlurView>
            <TouchableOpacity 
                style={[styles.nextButton, about.length < 10 && styles.disabledButton]} 
                onPress={nextStep}
                disabled={about.length < 10}
            >
              <Text style={styles.nextButtonText}>{t.next}</Text>
              <ArrowRight color="#FFF" size={20} />
            </TouchableOpacity>
          </View>
        );
      case 7: // Avatar
        return (
          <View style={[styles.stepContainer, { flex: 1 }]}>
            <Camera color={Colors.dark.primary} size={60} style={styles.icon} />
            <Text style={styles.title}>{t.avatarTitle}</Text>
            <Text style={styles.description}>{t.avatarDesc}</Text>
            <ScrollView style={{ flex: 1, width: '100%', marginBottom: 20 }} showsVerticalScrollIndicator={false}>
              <View style={styles.avatarGrid}>
                {AVATARS.map((url, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.avatarWrapper, selectedAvatar === url && styles.avatarSelected]}
                    onPress={() => setSelectedAvatar(url)}
                  >
                    <Image source={{ uri: url }} style={styles.avatarImage} />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <TouchableOpacity 
                style={[styles.nextButton, !selectedAvatar && styles.disabledButton]} 
                onPress={nextStep}
                disabled={!selectedAvatar}
            >
              <Text style={styles.nextButtonText}>{t.next}</Text>
              <ArrowRight color="#FFF" size={20} />
            </TouchableOpacity>
          </View>
        );
      case 8: // Location
        return (
          <View style={styles.stepContainer}>
            <MapPin color={Colors.dark.primary} size={60} style={styles.icon} />
            <Text style={styles.title}>{t.locationTitle}</Text>
            <Text style={styles.description}>{t.locationDesc}</Text>
            
            <TouchableOpacity 
                style={[styles.nextButton, { marginBottom: 20 }, locationStatus === 'loading' && styles.disabledButton, locationStatus === 'success' && { backgroundColor: '#10B981' }]} 
                onPress={getLocation}
                disabled={locationStatus !== 'idle'}
            >
              <Text style={styles.nextButtonText}>
                {locationStatus === 'idle' ? t.getLocationBtn : locationStatus === 'loading' ? t.locationGetting : locationName}
              </Text>
              {locationStatus === 'success' && <Check color="#FFF" size={20} />}
            </TouchableOpacity>

            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center', marginBottom: 30, paddingHorizontal: 10, lineHeight: 20 }}>
               {t.locationWarning || 'Konumunuz sadece eşleşmeler için kullanılacaktır. Detaylı konumunuz kesinlikle kimseyle paylaşılmaz.'}
            </Text>

            {locationStatus === 'success' && (
                <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                   <Text style={styles.nextButtonText}>{t.next}</Text>
                   <ArrowRight color="#FFF" size={20} />
                </TouchableOpacity>
            )}
          </View>
        );
      case 9: // ReCaptcha
        return (
          <View style={styles.stepContainer}>
            <ShieldCheck color={Colors.dark.primary} size={60} style={styles.icon} />
            <Text style={styles.title}>{t.verifyTitle}</Text>
            <Text style={styles.description}>{t.verifyDesc}</Text>
            
            <TouchableOpacity 
               style={styles.captchaPlaceholder}
               activeOpacity={1}
               onPress={() => {
                  if(captchaVerified || captchaLoading) return;
                  setCaptchaLoading(true);
                  setTimeout(() => {
                     setCaptchaVerified(true);
                     setCaptchaLoading(false);
                  }, 2000); // 2 second mock verification
               }}
            >
               <View style={styles.captchaRow}>
                   <View style={[styles.captchaCheckbox, captchaVerified && styles.captchaCheckboxSelected]}>
                       {captchaLoading ? (
                           <ActivityIndicator color="#4A90E2" size="small" />
                       ) : captchaVerified ? (
                           <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Check_green_icon.svg/1200px-Check_green_icon.svg.png' }} style={{ width: 20, height: 20 }} contentFit="contain" />
                       ) : null}
                   </View>
                   <Text style={styles.captchaText}>
                     {t.acceptTerms.includes('okudum') ? "Ben robot değilim" : (t.acceptTerms.includes('Ich') ? 'Ich bin kein Roboter' : "I'm not a robot")}
                   </Text>
               </View>
               <View style={styles.captchaRight}>
                  <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/RecaptchaLogo.svg/1200px-RecaptchaLogo.svg.png' }} style={{ width: 30, height: 30, marginBottom: 2 }} contentFit="contain" />
                  <Text style={styles.captchaSmallText}>reCAPTCHA</Text>
                  <Text style={styles.captchaTinyText}>Privacy - Terms</Text>
               </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[styles.nextButton, (!captchaVerified || isSaving) && styles.disabledButton]} 
                onPress={finishOnboarding}
                disabled={!captchaVerified || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Text style={styles.nextButtonText}>{t.finish}</Text>
                  <Check color="#FFF" size={20} />
                </>
              )}
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.dark.background, '#111827']}
        style={styles.gradient}
      />
      <View style={styles.progressContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
              <View 
                key={i} 
                style={[styles.progressBar, i <= step && styles.progressBarActive]} 
              />
          ))}
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>

      {/* TERMS MODAL */}
      <Modal visible={showTermsModal} animationType="slide" transparent={true}>
         <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
               <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{(t as any).termsDetailedTitle || t.termsTitle}</Text>
                  <TouchableOpacity onPress={() => setShowTermsModal(false)} style={styles.modalCloseBtn}>
                     <X color="#FFF" size={24} />
                  </TouchableOpacity>
               </View>
               <ScrollView style={styles.modalScroll}>
                  <Text style={styles.modalText}>
                     {(t as any).termsDetailedContent || t.termsDesc}
                  </Text>
               </ScrollView>
               <TouchableOpacity style={styles.modalAcceptBtn} onPress={() => { setAgreed(true); setShowTermsModal(false); }}>
                  <Text style={styles.modalAcceptText}>{t.acceptTerms}</Text>
               </TouchableOpacity>
            </View>
         </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  gradient: { position: 'absolute', left: 0, right: 0, top: 0, height: height },
  progressContainer: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 60, gap: 8 },
  progressBar: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 },
  progressBarActive: { backgroundColor: Colors.dark.primary },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  stepContainer: { alignItems: 'center', flex: 1 },
  icon: { marginBottom: 20 },
  title: { color: '#FFF', fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  description: { color: Colors.dark.textSecondary, fontSize: 16, textAlign: 'center', marginBottom: 40, lineHeight: 22 },
  agreementRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 40, paddingHorizontal: 10 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: Colors.dark.primary, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkboxSelected: { backgroundColor: Colors.dark.primary },
  agreementText: { color: '#FFF', fontSize: 14, flex: 1 },
  inputWrapper: { width: '100%', height: 56, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', paddingHorizontal: 20, marginBottom: 40, overflow: 'hidden' },
  bioWrapper: { height: 120, paddingVertical: 15 },
  input: { color: '#FFF', fontSize: 18 },
  bioInput: { textAlignVertical: 'top', height: '100%' },
  charCounter: { position: 'absolute', bottom: 10, right: 15, color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  interestsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 40 },
  interestChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  interestChipSelected: { backgroundColor: Colors.dark.primary, borderColor: Colors.dark.primary },
  interestText: { color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  interestTextSelected: { color: '#FFF' },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, marginBottom: 40 },
  avatarWrapper: { width: (width - 120) / 4, height: (width - 120) / 4, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent', overflow: 'hidden' },
  avatarSelected: { borderColor: Colors.dark.primary },
  avatarImage: { width: '80%', height: '80%' },
  captchaPlaceholder: { width: '100%', height: 78, borderRadius: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 40, backgroundColor: '#FAFAFA', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 3, borderWidth: 1, borderColor: '#d3d3d3' },
  captchaRow: { flexDirection: 'row', alignItems: 'center' },
  captchaCheckbox: { width: 28, height: 28, borderRadius: 2, borderWidth: 2, borderColor: '#c1c1c1', backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  captchaCheckboxSelected: { borderColor: 'transparent' },
  captchaText: { color: '#000', fontSize: 14, fontWeight: '500' },
  captchaRight: { alignItems: 'center', justifyContent: 'center' },
  captchaSmallText: { color: '#555', fontSize: 10, fontWeight: '500' },
  captchaTinyText: { color: '#888', fontSize: 8 },
  nextButton: { flexDirection: 'row', backgroundColor: Colors.dark.primary, height: 56, borderRadius: 28, width: '100%', justifyContent: 'center', alignItems: 'center', gap: 10 },
  nextButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  disabledButton: { opacity: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#111827', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: height * 0.75, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  modalCloseBtn: { padding: 5, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20 },
  modalScroll: { flex: 1, marginBottom: 20 },
  modalText: { color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 24 },
  modalAcceptBtn: { backgroundColor: Colors.dark.primary, paddingVertical: 16, borderRadius: 25, alignItems: 'center' },
  modalAcceptText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  genderOptions: { flexDirection: 'row', gap: 20, width: '100%', marginBottom: 40 },
  genderBtn: { flex: 1, height: 70, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  genderBtnSelected: { backgroundColor: Colors.dark.primary, borderColor: Colors.dark.primary },
  genderBtnText: { color: 'rgba(255,255,255,0.6)', fontSize: 18, fontWeight: '700' },
  genderBtnTextSelected: { color: '#FFF' }
});
