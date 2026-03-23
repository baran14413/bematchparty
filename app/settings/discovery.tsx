import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '@/src/theme';
import { useAppStore } from '@/src/utils/store';
import { translations } from '@/src/utils/i18n';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChevronLeft, MapPin, RefreshCw, Minus, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { updateDiscoveryPrefs } from '@/src/utils/authService';

const { height } = Dimensions.get('window');

type GenderPref = 'everyone' | 'female' | 'male';

export default function DiscoverySettingsScreen() {
  const { user, setUser, language } = useAppStore();
  const t = translations[language] as any; // using any to bypass strict type checking for new keys
  const router = useRouter();

  const currentPrefs = user?.discoveryPrefs || {};

  const [globalMode, setGlobalMode] = useState(currentPrefs.globalMode || false);
  const [gender, setGender] = useState<GenderPref>(currentPrefs.gender || 'everyone');
  const [minAge, setMinAge] = useState(currentPrefs.minAge || 18);
  const [maxAge, setMaxAge] = useState(currentPrefs.maxAge || 40);
  
  const [locationName, setLocationName] = useState(currentPrefs.locationName || 'Bilinmeyen Konum');
  const [locationUpdatedAt, setLocationUpdatedAt] = useState(currentPrefs.locationUpdatedAt || '');
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [showAgeEditor, setShowAgeEditor] = useState(false);

  const handleUpdateLocation = async () => {
    setIsUpdatingLocation(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Hata', 'Konum izni reddedildi.');
      setIsUpdatingLocation(false);
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
       
       let newLocName = '';
       
       try {
           const reverseGeocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
           if (reverseGeocode && reverseGeocode.length > 0) {
               const place = reverseGeocode[0];
               const city = place.city || place.subregion || place.region || '';
               const country = place.country || place.isoCountryCode || '';
               if (city || country) {
                   newLocName = `${city}${city && country ? ', ' : ''}${country}`;
               }
           }
       } catch (e) {
           console.log("Expo geocode failed, trying fallback", e);
       }

       if (!newLocName) {
           try {
               const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`);
               const data = await res.json();
               if (data && data.address) {
                   const city = data.address.city || data.address.town || data.address.state || '';
                   const country = data.address.country || '';
                   newLocName = `${city}${city && country ? ', ' : ''}${country}`;
               }
           } catch (e) {}
       }
       
       setLocationName(newLocName || 'Bilinmeyen Konum');
       
       // Güncelleme zamanı
       const dateStr = new Date().toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
       setLocationUpdatedAt(dateStr);
       
    } catch (error) {
       Alert.alert('Hata', 'Konum alınamadı, lütfen tekrar deneyin.');
    } finally {
       setIsUpdatingLocation(false);
    }
  };

  const cycleGender = () => {
      if (gender === 'everyone') setGender('female');
      else if (gender === 'female') setGender('male');
      else setGender('everyone');
  };

  const getGenderLabel = () => {
      if (gender === 'female') return t.genderFemale;
      if (gender === 'male') return t.genderMale;
      return t.genderEveryone;
  };

  const savePreferences = async () => {
      if (!user) return;
      setIsSaving(true);
      
      const newPrefs = {
          locationName,
          locationUpdatedAt,
          gender,
          minAge,
          maxAge,
          globalMode
      };

      try {
          await updateDiscoveryPrefs(user.uid, newPrefs);
          setUser({
              ...user,
              discoveryPrefs: newPrefs
          });
          Alert.alert('Başarılı', 'Keşif tercihlerin kaydedildi.');
          router.back();
      } catch (e) {
          Alert.alert('Hata', 'Kaydedilirken bir hata oluştu.');
      } finally {
          setIsSaving(false);
      }
  };

  // UI Helpers
  const renderToggleRow = (label: string, value: boolean, onValueChange: (v: boolean) => void, desc?: string) => (
    <View style={styles.row}>
      <View style={styles.rowTextWrap}>
        <Text style={styles.rowTitle}>{label}</Text>
        {desc && <Text style={styles.rowDesc}>{desc}</Text>}
      </View>
      <Switch
        trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.dark.primary }}
        thumbColor="#FFF"
        ios_backgroundColor="rgba(255,255,255,0.1)"
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.dark.background, '#1e1b4b']} style={styles.gradient} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.discoveryPrefs || t.settingsTitle}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <BlurView intensity={20} tint="dark" style={styles.card}>
            
            {/* LOCATION ROW */}
            <View style={[styles.row, { flexDirection: 'column', alignItems: 'flex-start' }]}>
               <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Text style={styles.rowTitle}>{t.locationOpt}</Text>
                  <TouchableOpacity 
                     style={styles.locationBtn} 
                     onPress={handleUpdateLocation}
                     disabled={isUpdatingLocation}
                  >
                     {isUpdatingLocation ? <ActivityIndicator size="small" color="#FFF" /> : <RefreshCw size={16} color="#FFF" />}
                     <Text style={styles.locationBtnText}>{isUpdatingLocation ? t.locationUpdating : t.locationUpdateBtn}</Text>
                  </TouchableOpacity>
               </View>
               <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15, backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12, width: '100%' }}>
                  <MapPin color={Colors.dark.primary} size={20} style={{ marginRight: 10 }} />
                  <View>
                     <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}>{locationName}</Text>
                     {locationUpdatedAt ? <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>{t.lastUpdated}{locationUpdatedAt}</Text> : null}
                  </View>
               </View>
            </View>

            <View style={styles.divider} />

            {/* GENDER ROW */}
            <TouchableOpacity style={styles.row} onPress={cycleGender} activeOpacity={0.7}>
              <Text style={styles.rowTitle}>{t.genderOpt}</Text>
              <View style={styles.valueBadge}>
                 <Text style={styles.rowValue}>{getGenderLabel()}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* AGE RANGE ROW */}
            <View>
                <TouchableOpacity style={styles.row} onPress={() => setShowAgeEditor(!showAgeEditor)} activeOpacity={0.7}>
                  <Text style={styles.rowTitle}>{t.ageRangeOpt}</Text>
                  <View style={styles.valueBadge}>
                     <Text style={styles.rowValue}>{minAge} - {maxAge}</Text>
                  </View>
                </TouchableOpacity>
                
                {showAgeEditor && (
                    <View style={styles.ageEditorContainer}>
                        <View style={styles.ageCounter}>
                            <Text style={styles.ageCounterLabel}>Min</Text>
                            <View style={styles.ageControls}>
                                <TouchableOpacity onPress={() => setMinAge(Math.max(18, minAge - 1))} style={styles.ageBtn}><Minus size={16} color="#FFF" /></TouchableOpacity>
                                <Text style={styles.ageNumber}>{minAge}</Text>
                                <TouchableOpacity onPress={() => setMinAge(Math.min(maxAge - 1, minAge + 1))} style={styles.ageBtn}><Plus size={16} color="#FFF" /></TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.ageCounter}>
                            <Text style={styles.ageCounterLabel}>Max</Text>
                            <View style={styles.ageControls}>
                                <TouchableOpacity onPress={() => setMaxAge(Math.max(minAge + 1, maxAge - 1))} style={styles.ageBtn}><Minus size={16} color="#FFF" /></TouchableOpacity>
                                <Text style={styles.ageNumber}>{maxAge}</Text>
                                <TouchableOpacity onPress={() => setMaxAge(Math.min(99, maxAge + 1))} style={styles.ageBtn}><Plus size={16} color="#FFF" /></TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </View>

            <View style={styles.divider} />

            {/* GLOBAL MODE ROW */}
            {renderToggleRow(t.globalModeOpt || 'Global Mode', globalMode, setGlobalMode)}

        </BlurView>

        {/* SAVE BUTTON */}
        <TouchableOpacity 
            style={[styles.saveBtn, isSaving && { opacity: 0.7 }]} 
            onPress={savePreferences}
            disabled={isSaving}
        >
          {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>{t.saveDiscoveryBtn}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  gradient: { position: 'absolute', left: 0, right: 0, top: 0, height: height },
  header: {
    paddingTop: 60, paddingHorizontal: 10, paddingBottom: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: { padding: 10 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  card: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  rowTextWrap: { flex: 1, marginRight: 15 },
  rowTitle: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  rowDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 },
  rowValue: { color: Colors.dark.primary, fontSize: 16, fontWeight: '700' },
  valueBadge: { paddingHorizontal: 15, paddingVertical: 8, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginLeft: 20 },
  locationBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dark.primary, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, gap: 6 },
  locationBtnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  
  ageEditorContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 20, paddingTop: 10, backgroundColor: 'rgba(0,0,0,0.2)' },
  ageCounter: { alignItems: 'center' },
  ageCounterLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 8, fontWeight: '500' },
  ageControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 25, padding: 5 },
  ageBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  ageNumber: { color: '#FFF', fontSize: 18, fontWeight: '700', width: 40, textAlign: 'center' },

  saveBtn: {
    backgroundColor: Colors.dark.primary, borderRadius: 28, paddingVertical: 18,
    alignItems: 'center', marginTop: 30, shadowColor: Colors.dark.primary, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }
  },
  saveBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
});
