export type LanguageCode = 'en' | 'tr' | 'de';

export const translations = {
  en: {
    // Login
    welcome: 'Welcome!',
    loginToContinue: 'Login to find your perfect match',
    continueWithGoogle: 'Continue with Google',
    
    // Onboarding
    termsTitle: 'Terms & Conditions',
    termsDesc: 'Please read and accept our community guidelines to proceed.',
    acceptTerms: 'I have read and agree to the Terms',
    termsDetailedTitle: 'BeMatch Community Guidelines & Terms',
    termsDetailedContent: `Welcome to BeMatch!\n\n1. About Us & Our Mission\nBeMatch is designed to help you find meaningful connections in a safe, authentic, and engaging environment. We believe in transparency and put your security first.\n\n2. Privacy & Data Protection\nYour trust is our priority. We do not sell your personal data. We use industry-standard encryption to protect your messages and profile info. Your exact location is never visible to anyone—we only use it to find people in your general area.\n\n3. Community Guidelines & Respect\nWe have a strictly enforced zero-tolerance policy for harassment, hate speech, bullying, and unsolicited explicit content. Treat everyone you meet here with kindness and respect.\n\n4. Authenticity & Fake Profiles\nWe require all users to be real. Using fake photos, impersonating someone else, or creating spam bot accounts will result in an immediate, permanent ban without appeal.\n\n5. Account Safety & Off-Platform Activity\nNever share your passwords, financial information, or personal addresses. We are not responsible for interactions that occur outside of the BeMatch platform.\n\n6. Account Termination\nYou can freeze or permanently delete your account at any time from Settings. When you delete your account, all your data, messages, and matches are permanently wiped from our servers.\n\nBy checking the agreement box, you legally confirm that you are at least 18 years old and agree to abide by these comprehensive terms and our commitment to a safe dating community.`,
    next: 'Next',
    
    // Name
    whatIsYourName: 'What is your name?',
    nameDesc: 'This is how you will appear to other users.',
    fullName: 'Full Name',
    
    // Interests
    interestsTitle: 'Your Interests',
    interestsDesc: 'Select topics you love. This helps us find better matches.',
    interestsList: [
      'Gaming', 'Music', 'Movies', 'Travel', 'Art', 'Fitness', 'Cooking', 'Tech', 'Nature', 'Photography',
      'Anime', 'Startups', 'Dancing', 'Reading', 'Writing', 'Sports', 'Fashion', 'Pets', 'DIY', 'Coffee',
      'Astrology', 'Blockchain', 'History', 'K-Pop', 'Languages', 'Memes'
    ],
    
    // Bio
    bioTitle: 'About You',
    bioDesc: 'Write a short and sweet bio.',
    bioPlaceholder: 'I love long walks on the beach...',
    
    // Age
    ageTitle: 'Your Age',
    ageDesc: 'Please enter your age. This cannot be changed later.',
    agePlaceholder: 'e.g. 24',
    
    // Gender
    genderTitle: 'What is your gender?',
    genderDesc: 'Select your gender. This cannot be changed later.',
    
    // Avatar
    avatarTitle: 'Choose Your Avatar',
    avatarDesc: 'Select an image that represents you.',
    
    // Recaptcha
    verifyTitle: 'Human Verification',
    verifyDesc: 'Complete the captcha to finish onboarding.',
    finish: 'Finish Setup',
    
    // Location
    locationTitle: 'Where are you?',
    locationDesc: 'We need your location to find matches near you.',
    getLocationBtn: 'Get My Location',
    locationGetting: 'Finding you...',
    locationFound: 'Location Found!',
    locationWarning: 'Your location is only used for matching. Your exact coordinates will never be shared with anyone.',
    
    // Profile
    personalInfo: 'Personal Information',
    gallery: 'Gallery',
    myInterests: 'Interests',
    ageReadOnly: 'Age (Cannot be changed)',
    
    // Settings
    settingsTitle: 'Settings',
    discoveryPrefs: 'Discovery Preferences',
    locationOpt: 'Location',
    locationUpdateBtn: 'Update Location',
    locationUpdating: 'Updating...',
    lastUpdated: 'Last Updated: ',
    genderOpt: 'I am looking for',
    genderFemale: 'Women',
    genderMale: 'Men',
    genderEveryone: 'Everyone',
    ageRangeOpt: 'Age Range',
    globalModeOpt: 'Global Mode',
    notificationsOpt: 'Notifications',
    newMatchOpt: 'New Match',
    newMessageOpt: 'New Message',
    likesOpt: 'Likes',
    appNotificationsOpt: 'App Notifications',
    saveNotifyBtn: 'Save Notification Preferences',
    privacySecurityOpt: 'Privacy & Security',
    showProfileOpt: 'Show My Profile',
    showProfileDesc: 'When off, no one can see you',
    onlineStatusOpt: 'Online Status',
    readReceiptsOpt: 'Read Receipts',
    distanceInfoOpt: 'Distance Info',
    incognitoOpt: 'Incognito Mode',
    incognitoDesc: 'You will only be visible to people you have liked.',
    savePrivacyBtn: 'Save Privacy Settings',
    saveDiscoveryBtn: 'Save Preferences',
    systemOpt: 'System',
    appLanguageOpt: 'App Language',
    storageOpt: 'Storage',
    clearBtn: 'Clear Cache',
    cacheClearedTitle: 'Success',
    cacheClearedDesc: 'Application cache has been cleared successfully.',
    activeSession: 'Active Session',
    deviceType: 'Device: ',
    accountSettingsOpt: 'Account Settings',
    freezeAccountOpt: 'Freeze Account',
    freezeAccountDesc: 'Your account will be hidden. If you do not login within 15 days, it will be deleted permanently.',
    deleteAccountOpt: 'Delete Account',
    deleteAccountDesc: 'This action is irreversible. All your data will be deleted.',
    deleteReasonTitle: 'Why are you leaving?',
    deleteReasonPlaceholder: 'Please tell us why... (Optional)',
    deleteBtn: 'Delete Permanently',
    cancelBtn: 'Cancel',
    logoutOpt: 'Log Out',
    confirmLogout: 'Are you sure you want to log out?',

    // App & Discovery
    discoverTab: 'Discover',
    partyTab: 'Party',
    messagesTab: 'Messages',
    profileTab: 'Profile',
    findMatch: 'Find your perfect match',
    greetingMorning: 'Good morning',
    greetingAfternoon: 'Good afternoon',
    greetingEvening: 'Good evening',
    greetingNight: 'Good night',
    filterNearby: 'Nearby',
    filterNew: 'New',
    filterOnline: 'Online',
    
    // Post Details
    details: 'Details',
    commentsTitle: 'Comments',
    likesTitle: 'Likes & Reactions',
    sayHi: 'Say Hi',
    follow: 'Follow',
    reply: 'Reply',
    report: 'Report',
    delete: 'Delete',
    cancel: 'Cancel',
    moreReplies: 'Show more (%d)',
    lessReplies: 'Show less',
    friendlyComment: 'Friendly Comment...',
    confirmDeleteComment: 'Are you sure you want to delete this comment?',
    noLikesYet: 'No likes yet.',
    noComments: 'No comments yet. Be the first!',
    
    // Polls & Hashtags
    createPoll: 'Create Poll',
    askQuestion: 'Ask a question...',
    option: 'Option',
    addOption: 'Add Option',
    votes: 'votes',
    pollError: 'Please fill poll question and all options.',
    noPostsFound: 'No posts found.',
    filteringBy: 'Filtering by',

    // Notifications
    notificationsTab: 'Notifications',
    allNotif: 'All',
    likesNotif: 'Likes',
    commentsNotif: 'Comments',
    visitorsNotif: 'Visitors',
    mentionsNotif: 'Mentions',
    followsNotif: 'Follows',
    noNotifications: 'No notifications yet.',
    likedYourPost: 'liked your post.',
    commentedOnYourPost: 'commented on your post:',
    visitedYourProfile: 'visited your profile.',
    mentionedYou: 'mentioned you in a post.',
    startedFollowingYou: 'started following you.',
    markAllRead: 'Mark all as read',
  },
  tr: {
    // Login
    welcome: 'Hoş Geldiniz!',
    loginToContinue: 'Mükemmel eşleşmeni bulmak için giriş yap',
    continueWithGoogle: 'Google ile Devam Et',
    
    // Onboarding
    termsTitle: 'Kullanım Şartları',
    termsDesc: 'İlerlemek için lütfen topluluk kurallarımızı okuyup kabul edin.',
    acceptTerms: 'BeMatch Kullanım Şartları\'nı okudum ve onaylıyorum',
    termsDetailedTitle: 'BeMatch Topluluk Kuralları',
    termsDetailedContent: `BeMatch Özel Topluluk Şartları ve Gizlilik Sözleşmesi\n\n1. Hakkımızda ve Vizyonumuz\nBeMatch, güvenli, samimi ve dürüst ilişkiler kurmanı sağlamak için geliştirilmiş yeni nesil bir eşleşme platformudur. Vizyonumuz, sahte profillerden uzak, gerçek insanların bir araya geldiği güvenilir bir ortam yaratmaktır.\n\n2. Veri Gizliliği ve Güvenliğiniz\nGüvenliğiniz bizim için her şeyden önemlidir. Kişisel verileriniz ve mesajlarınız üst düzey şifreleme yöntemleriyle korunur ve asla üçüncü şahıslara veya şirketlere satılmaz. Konum verileriniz sadece size yakın adayları bulmak için (yaklaşık olarak) kullanılır; tam noktasal konumunuz kimseyle paylaşılmaz.\n\n3. Topluluk Kuralları ve Saygı\nBeMatch'te saygı esastır. Taciz, nefret söylemi, zorbalık, tehdit veya istenmeyen cinsel içerikli mesajlar anında kalıcı uzaklaştırma (perma-ban) sebebidir. Lütfen konuştuğunuz her üyeye nezaketle yaklaşın.\n\n4. Özgünlük ve Sahte Profiller\nUygulamamız sadece gerçek insanlara hizmet vermektedir. Başkasının fotoğraflarını kullanmak, sahte kimlik oluşturmak veya bot/spam hesap açmak tespit edildiği an sistemden sınırsız olarak atılmanızla sonuçlanır.\n\n5. Hesap Feshi ve Veri Silme Politikası\nİstediğiniz zaman "Ayarlar" bölümünden hesabınızı dondurabilir veya kalıcı olarak silebilirsiniz. Hesabınızı sildiğiniz an itibarıyla; tüm mesajlarınız, fotoğraflarınız, eşleşmeleriniz ve profil bilgileriniz sunucularımızdan geri döndürülemez şekilde, anında ve tamamen silinir. Arkada hiçbir hayalet veri bırakılmaz.\n\nSözleşmeyi onayladığınızda, yasal olarak 18 yaşından büyük olduğunuzu ve topluluğumuzun bu güvenli alanını korumaya söz verdiğinizi kabul etmiş olursunuz.`,
    next: 'İleri',
    
    // Name
    whatIsYourName: 'Adın nedir?',
    nameDesc: 'Diğer kullanıcılara bu isimle görüneceksin.',
    fullName: 'Ad ve Soyad',
    
    // Interests
    interestsTitle: 'İlgi Alanların',
    interestsDesc: 'Seçtiğin konular sana daha iyi eşleşmeler bulmamızı sağlar.',
    interestsList: [
      'Oyun', 'Müzik', 'Filmler', 'Seyahat', 'Sanat', 'Fitness', 'Yemek Yapma', 'Teknoloji', 'Doğa', 'Fotoğrafçılık',
      'Anime', 'Girişimcilik', 'Dans', 'Okuma', 'Yazarlık', 'Spor', 'Moda', 'Evcil Hayvanlar', 'Kendin Yap', 'Kahve',
      'Astroloji', 'Blokzincir', 'Tarih', 'K-Pop', 'Diller', 'Mizah'
    ],
    
    // Bio
    bioTitle: 'Hakkında',
    bioDesc: 'Kendini kısaca tanıt.',
    bioPlaceholder: 'Sahilde uzun yürüyüşleri severim...',
    
    // Age
    ageTitle: 'Yaşın',
    ageDesc: 'Lütfen yaşını gir. Bu bilgi daha sonra değiştirilemez.',
    agePlaceholder: 'Örn. 24',
    
    // Gender
    genderTitle: 'Cinsiyetin nedir?',
    genderDesc: 'Lütfen cinsiyetini seç. Bu bilgi daha sonra değiştirilemez.',
    
    // Avatar
    avatarTitle: 'Avatarını Seç',
    avatarDesc: 'Seni yansıtacak bir görsel seç.',
    
    // Recaptcha
    verifyTitle: 'İnsan Doğrulaması',
    verifyDesc: 'Kayıt işlemini bitirmek için doğrulamayı tamamla.',
    finish: 'Kurulumu Bitir',
    
    // Location
    locationTitle: 'Neredesin?',
    locationDesc: 'Yakınındaki kişileri bulmak için konumuna ihtiyacımız var.',
    getLocationBtn: 'Konumumu Bul',
    locationGetting: 'Aranıyor...',
    locationFound: 'Konum Bulundu!',
    locationWarning: 'Konum bilginiz sadece eşleşmeler için kullanılacaktır. Detaylı konumunuz kesinlikle kimseyle paylaşılmaz.',

    // Profile
    personalInfo: 'Kişisel Bilgiler',
    gallery: 'Galeri',
    myInterests: 'İlgi Alanları',
    ageReadOnly: 'Yaş (Değiştirilemez)',
    
    // Settings
    settingsTitle: 'Ayarlar',
    discoveryPrefs: 'Keşif tercihleri',
    locationOpt: 'Konum',
    locationUpdateBtn: 'Konumu Güncelle',
    locationUpdating: 'Güncelleniyor...',
    lastUpdated: 'Son Günc: ',
    genderOpt: 'Aradığım Cinsiyet',
    genderFemale: 'Kadınlar',
    genderMale: 'Erkekler',
    genderEveryone: 'Herkes',
    ageRangeOpt: 'Yaş Aralığı',
    globalModeOpt: 'Global Mod',
    notificationsOpt: 'Bildirimler',
    newMatchOpt: 'Yeni Eşleşme',
    newMessageOpt: 'Yeni Mesaj',
    likesOpt: 'Beğeniler',
    appNotificationsOpt: 'Uygulama Bildirimleri',
    saveNotifyBtn: 'Bildirim Tercihlerini Kaydet',
    privacySecurityOpt: 'Gizlilik & Güvenlik',
    showProfileOpt: 'Profilimi Göster',
    showProfileDesc: 'Kapalıyken kimse seni göremez',
    onlineStatusOpt: 'Çevrimiçi Durumu',
    readReceiptsOpt: 'Okundu Bilgisi',
    distanceInfoOpt: 'Mesafe Bilgisi',
    incognitoOpt: 'Gizli Mod (Incognito)',
    incognitoDesc: 'Sadece beğendiğin kişilere görünür olursun.',
    savePrivacyBtn: 'Gizlilik Ayarlarını Kaydet',
    saveDiscoveryBtn: 'Tercihleri Kaydet',
    systemOpt: 'Sistem',
    appLanguageOpt: 'Uygulama Dili',
    storageOpt: 'Depolama',
    clearBtn: 'Önbelleği Temizle',
    cacheClearedTitle: 'Başarılı',
    cacheClearedDesc: 'Önbellek (Cache) temizlendi. Uygulama hızlandırıldı.',
    activeSession: 'Aktif Oturum',
    deviceType: 'Cihaz: ',
    accountSettingsOpt: 'Hesap Ayarları',
    freezeAccountOpt: 'Hesabı Dondur',
    freezeAccountDesc: 'Hesabınız gizlenecek. 15 gün içinde giriş yapmazsanız kalıcı olarak silinecektir.',
    deleteAccountOpt: 'Hesabı Sil',
    deleteAccountDesc: 'Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinir.',
    deleteReasonTitle: 'Neden ayrılıyorsun?',
    deleteReasonPlaceholder: 'Lütfen nedenini belirt... (İsteğe bağlı)',
    deleteBtn: 'Kalıcı Olarak Sil',
    cancelBtn: 'İptal',
    logoutOpt: 'Çıkış Yap',
    confirmLogout: 'Çıkış yapmak istediğinizden emin misiniz?',

    // App & Discovery
    discoverTab: 'Keşfet',
    partyTab: 'Oda',
    messagesTab: 'Mesajlar',
    profileTab: 'Profil',
    findMatch: 'Mükemmel eşini bul',
    greetingMorning: 'Günaydın',
    greetingAfternoon: 'Tünaydın',
    greetingEvening: 'İyi Akşamlar',
    greetingNight: 'İyi Geceler',
    filterNearby: 'Yakındakiler',
    filterNew: 'Yeni Üyeler',
    filterOnline: 'Çevrimiçi',

    // Post Details
    details: 'Detaylar',
    commentsTitle: 'Yorumlar',
    likesTitle: 'Beğeniler ve tepkiler',
    sayHi: 'Say Hi',
    follow: 'Takip et',
    reply: 'Yanıtla',
    report: 'Şikayet Et',
    delete: 'Sil',
    cancel: 'İptal',
    moreReplies: 'Daha fazla göster (%d)',
    lessReplies: 'Azalt',
    friendlyComment: 'Dostça Yorum...',
    confirmDeleteComment: 'Bu yorumu silmek istediğinize emin misiniz?',
    noLikesYet: 'Henüz beğeni yok.',
    noComments: 'Henüz yorum yok. İlk yorumu sen yap!',
    
    // Polls & Hashtags
    createPoll: 'Anket Oluştur',
    askQuestion: 'Bir soru sor...',
    option: 'Seçenek',
    addOption: 'Seçenek Ekle',
    votes: 'oy',
    pollError: 'Lütfen anket sorusunu ve tüm seçenekleri doldurun.',
    noPostsFound: 'Gönderi bulunamadı.',
    filteringBy: 'Filtreleniyor:',

    // Notifications
    notificationsTab: 'Bildirimler',
    allNotif: 'Tümü',
    likesNotif: 'Beğeniler',
    commentsNotif: 'Yorumlar',
    visitorsNotif: 'Ziyaretçiler',
    mentionsNotif: 'Bahsetmeler',
    followsNotif: 'Takipçiler',
    noNotifications: 'Henüz bildirim yok.',
    likedYourPost: 'gönderini beğendi.',
    commentedOnYourPost: 'gönderine yorum yaptı:',
    visitedYourProfile: 'profiline baktı.',
    mentionedYou: 'bir gönderide senden bahsetti.',
    startedFollowingYou: 'seni takip etmeye başladı.',
    markAllRead: 'Tümünü okundu yap',
  },
  de: {
    // Login
    welcome: 'Willkommen!',
    loginToContinue: 'Melden Sie sich an, um Ihr Match zu finden',
    continueWithGoogle: 'Mit Google fortfahren',
    
    // Onboarding
    termsTitle: 'Nutzungsbedingungen',
    termsDesc: 'Bitte lesen und akzeptieren Sie unsere Community-Richtlinien.',
    acceptTerms: 'Ich habe die BeMatch-Bedingungen gelesen und stimme zu',
    termsDetailedTitle: 'BeMatch Community-Richtlinien',
    termsDetailedContent: `BeMatch Community-Richtlinien und Datenschutzvereinbarung\n\n1. Über uns\nBeMatch wurde entwickelt, um Ihnen zu helfen, in einer sicheren und authentischen Umgebung sinnvolle Verbindungen zu finden. Ihre Sicherheit steht an erster Stelle.\n\n2. Datenschutz & Privatsphäre\nWir verkaufen Ihre persönlichen Daten nicht. Wir verwenden branchenübliche Verschlüsselungen. Ihr genauer Standort ist für niemanden sichtbar – wir verwenden ihn nur, um Personen in der Nähe zu finden.\n\n3. Community-Richtlinien & Respekt\nWir haben eine Null-Toleranz-Politik für Belästigung, Hassreden und Mobbing. Behandeln Sie alle mit Freundlichkeit.\n\n4. Echtheit\nWir verlangen, dass alle Benutzer echt sind. Gefälschte Profile oder das Hochladen falscher Fotos führen zu einer sofortigen und dauerhaften Sperre.\n\n5. Kontolöschung\nSie können Ihr Konto jederzeit in den Einstellungen dauerhaft löschen. Wenn Sie Ihr Konto löschen, werden alle Ihre Daten, Bilder und Nachrichten dauerhaft von unseren Servern gelöscht.\n\nDurch das Aktivieren des Kontrollkästchens bestätigen Sie, dass Sie mindestens 18 Jahre alt sind und diesen Richtlinien zustimmen.`,
    next: 'Weiter',
    
    // Name
    whatIsYourName: 'Wie heißt du?',
    nameDesc: 'So wirst du für andere Benutzer angezeigt.',
    fullName: 'Vollständiger Name',
    
    // Interests
    interestsTitle: 'Deine Interessen',
    interestsDesc: 'Wähle Themen aus, die du liebst.',
    interestsList: [
       'Spielen', 'Musik', 'Filme', 'Reisen', 'Kunst', 'Fitness', 'Kochen', 'Technik', 'Natur', 'Fotografie',
       'Anime', 'Startups', 'Tanzen', 'Lesen', 'Schreiben', 'Sport', 'Mode', 'Haustiere', 'DIY', 'Kaffee',
       'Astrologie', 'Blockchain', 'Geschichte', 'K-Pop', 'Sprachen', 'Memes'
    ],
    
    // Bio
    bioTitle: 'Über Dich',
    bioDesc: 'Schreibe eine kurze Biografie.',
    bioPlaceholder: 'Ich liebe lange Strandspaziergänge...',
    
    // Age
    ageTitle: 'Dein Alter',
    ageDesc: 'Bitte gib dein Alter ein. Dies kann später nicht mehr geändert werden.',
    agePlaceholder: 'z.B. 24',
    
    // Gender
    genderTitle: 'Was ist dein Geschlecht?',
    genderDesc: 'Wähle dein Geschlecht aus. Dies kann später nicht mehr geändert werden.',
    
    // Avatar
    avatarTitle: 'Wähle deinen Avatar',
    avatarDesc: 'Wähle ein Bild, das dich repräsentiert.',
    
    // Recaptcha
    verifyTitle: 'Menschliche Überprüfung',
    verifyDesc: 'Schließen Sie das Captcha ab, um die Einrichtung zu beenden.',
    finish: 'Einrichtung beenden',
    
    // Location
    locationTitle: 'Wo bist du?',
    locationDesc: 'Wir benötigen Ihren Standort, um Übereinstimmungen in Ihrer Nähe zu finden.',
    getLocationBtn: 'Standort abrufen',
    locationGetting: 'Suchen...',
    locationFound: 'Standort gefunden!',
    locationWarning: 'Ihr Standort wird nur für das Matching verwendet. Ihr genauer Standort wird niemals mit jemandem geteilt.',

    // Profile
    personalInfo: 'Persönliche Informationen',
    gallery: 'Galerie',
    myInterests: 'Interessen',
    ageReadOnly: 'Alter (Kann nicht geändert werden)',
    
    // Settings
    settingsTitle: 'Einstellungen',
    discoveryPrefs: 'Entdeckungspräferenzen',
    locationOpt: 'Standort',
    locationUpdateBtn: 'Standort aktualisieren',
    locationUpdating: 'Aktualisierung...',
    lastUpdated: 'Zuletzt aktualisiert: ',
    genderOpt: 'Ich suche nach',
    genderFemale: 'Frauen',
    genderMale: 'Männer',
    genderEveryone: 'Alle',
    ageRangeOpt: 'Altersgruppe',
    globalModeOpt: 'Globaler Modus',
    notificationsOpt: 'Benachrichtigungen',
    newMatchOpt: 'Neues Match',
    newMessageOpt: 'Neue Nachricht',
    likesOpt: 'Likes',
    appNotificationsOpt: 'App-Benachrichtigungen',
    saveNotifyBtn: 'Benachrichtigungseinstellungen speichern',
    privacySecurityOpt: 'Datenschutz & Sicherheit',
    showProfileOpt: 'Mein Profil anzeigen',
    showProfileDesc: 'Wenn deaktiviert, kann dich niemand sehen',
    onlineStatusOpt: 'Online-Status',
    readReceiptsOpt: 'Lesebestätigungen',
    distanceInfoOpt: 'Entfernungsinfo',
    incognitoOpt: 'Inkognito-Modus',
    incognitoDesc: 'Du bist nur für Personen sichtbar, die dir gefallen haben.',
    savePrivacyBtn: 'Datenschutzeinstellungen speichern',
    saveDiscoveryBtn: 'Einstellungen speichern',
    systemOpt: 'System',
    appLanguageOpt: 'App-Sprache',
    storageOpt: 'Speicher',
    clearBtn: 'Löschen',
    accountSettingsOpt: 'Kontoeinstellungen',
    freezeAccountOpt: 'Konto einfrieren',
    deleteAccountOpt: 'Konto löschen',
    logoutOpt: 'Abmelden',

    // App & Discovery
    discoverTab: 'Entdecken',
    partyTab: 'Party',
    messagesTab: 'Nachrichten',
    profileTab: 'Profil',
    findMatch: 'Finde dein perfektes Match',
    greetingMorning: 'Guten Morgen',
    greetingAfternoon: 'Guten Tag',
    greetingEvening: 'Guten Abend',
    greetingNight: 'Gute Nacht',
    filterNearby: 'In der Nähe',
    filterNew: 'Neu',
    filterOnline: 'Online',

    // Post Details
    details: 'Details',
    commentsTitle: 'Kommentare',
    likesTitle: 'Likes & Reaktionen',
    sayHi: 'Sag Hallo',
    follow: 'Folgen',
    reply: 'Antworten',
    report: 'Melden',
    delete: 'Löschen',
    cancel: 'Abbrechen',
    moreReplies: 'Mehr anzeigen (%d)',
    lessReplies: 'Weniger anzeigen',
    friendlyComment: 'Freundlicher Kommentar...',
    confirmDeleteComment: 'Sind Sie sicher, dass Sie diesen Kommentar löschen möchten?',
    noLikesYet: 'Noch keine Likes.',
    noComments: 'Noch keine Kommentare. Sei der Erste!',
    
    // Polls & Hashtags
    createPoll: 'Umfrage erstellen',
    askQuestion: 'Einfach mal was fragen...',
    option: 'Option',
    addOption: 'Option hinzufügen',
    votes: 'Stimmen',
    pollError: 'Bitte füllen Sie die Umfragefrage und alle Optionen aus.',
    noPostsFound: 'Keine Beiträge gefunden.',
    filteringBy: 'Filtern nach:',

    // Notifications
    notificationsTab: 'Benachrichtigungen',
    allNotif: 'Alle',
    likesNotif: 'Likes',
    commentsNotif: 'Kommentare',
    visitorsNotif: 'Besucher',
    mentionsNotif: 'Erwähnungen',
    followsNotif: 'Follower',
    noNotifications: 'Noch keine Benachrichtigungen.',
    likedYourPost: 'hat deinen Beitrag geliked.',
    commentedOnYourPost: 'hat deinen Beitrag kommentiert:',
    visitedYourProfile: 'hat dein Profil besucht.',
    mentionedYou: 'hat dich in einem Beitrag erwähnt.',
    startedFollowingYou: 'folgt dir jetzt.',
    markAllRead: 'Alle als gelesen markieren',
  }
};
