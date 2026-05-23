import type { Translations } from '@/types'

export const dashboardUI: Record<string, Record<'en' | 'np', string>> = {
  // Patient sidebar
  'Overview':         { en: 'Overview',       np: 'सारांश' },
  'My Profile':       { en: 'My Profile',      np: 'मेरो प्रोफाइल' },
  'Medical History':  { en: 'Medical History', np: 'चिकित्सा इतिहास' },
  'Prescriptions':    { en: 'Prescriptions',   np: 'प्रिस्क्रिप्सन' },
  'Lab Reports':      { en: 'Lab Reports',     np: 'ल्याब रिपोर्ट' },
  'Vaccinations':     { en: 'Vaccinations',    np: 'खोपहरू' },
  'QR Health Card':   { en: 'QR Health Card',  np: 'QR स्वास्थ्य कार्ड' },
  'AI Analysis':      { en: 'AI Analysis',     np: 'AI विश्लेषण' },
  'Privacy':          { en: 'Privacy',         np: 'गोपनीयता' },
  'Sign out':         { en: 'Sign out',        np: 'लग आउट' },
  // Doctor sidebar
  'Patients':         { en: 'Patients',        np: 'बिरामीहरू' },
  'Upload Report':    { en: 'Upload Report',   np: 'रिपोर्ट अपलोड' },
  'Disease Alerts':   { en: 'Disease Alerts',  np: 'रोग अलर्ट' },
  'Birth Records':    { en: 'Birth Records',   np: 'जन्म दर्ता' },
  'Death Records':    { en: 'Death Records',   np: 'मृत्यु दर्ता' },
  // Lab sidebar
  'Pending Orders':   { en: 'Pending Orders',  np: 'विचाराधीन अर्डर' },
  'All Reports':      { en: 'All Reports',     np: 'सबै रिपोर्ट' },
  // Pharmacy sidebar
  'Rx List':          { en: 'Rx List',         np: 'प्रिस्क्रिप्सन सूची' },
}

export function td(key: string, lang: 'en' | 'np'): string {
  return dashboardUI[key]?.[lang] ?? key
}

export const translations: Record<'en' | 'np', Translations> = {
  en: {
    nav: {
      home: 'Home',
      features: 'Features',
      about: 'About',
      emergency: 'Emergency',
      login: 'Login',
      register: 'Register',
    },
    hero: {
      badge: "Nepal's #1 AI Health Platform",
      headline: ['Your AI-Powered', 'Health Companion', 'for Nepal'],
      subheadline: "Bridging Nepal's healthcare gap with technology",
      description:
        "Access intelligent health guidance, emergency services, and digital medical records — built for Nepal's unique healthcare landscape.",
      ctaRegister: 'Get Started Free',
      ctaLogin: 'Sign In',
      ctaEmergency: 'Emergency Access',
    },
    stats: {
      heading: 'Trusted by millions across Nepal',
      items: [
        { value: '10M+', label: 'Citizens Served' },
        { value: '500+', label: 'Partner Hospitals' },
        { value: '50K+', label: 'Daily Consultations' },
        { value: '98%', label: 'Diagnostic Accuracy' },
      ],
    },
    features: {
      heading: 'Everything you need for better health',
      subheading:
        "Comprehensive tools powered by AI, designed for Nepal's healthcare system",
      items: [
        {
          icon: '🧠',
          title: 'AI Symptom Analysis',
          description:
            'Describe your symptoms and receive instant AI-powered health guidance trained on Nepali medical data.',
        },
        {
          icon: '📋',
          title: 'Digital Health Records',
          description:
            'Securely store and access your complete medical history anytime, anywhere — even in remote areas.',
        },
        {
          icon: '📱',
          title: 'Telemedicine',
          description:
            'Connect with certified doctors via video or chat from your home, saving time and travel costs.',
        },
        {
          icon: '🚨',
          title: 'Emergency Response',
          description:
            '24/7 emergency dispatch with GPS location sharing and instant notification to nearby hospitals.',
        },
        {
          icon: '💊',
          title: 'Prescription Management',
          description:
            'Receive, store, and refill digital prescriptions with automated reminders for medications.',
        },
        {
          icon: '📊',
          title: 'Health Analytics',
          description:
            'Track your health trends over time with personalized insights and preventive care recommendations.',
        },
      ],
    },
    ai: {
      heading: 'How Our AI Works',
      subheading: 'Intelligent healthcare, powered by cutting-edge AI',
      description:
        'Our AI is trained on millions of anonymized Nepali health records and follows WHO guidelines — delivering accurate, culturally aware health guidance.',
      badge: 'Powered by Advanced AI',
      steps: [
        {
          title: 'Describe Your Symptoms',
          description:
            'Enter symptoms in English or Nepali. Our NLP engine understands local health terminology.',
        },
        {
          title: 'AI Analysis',
          description:
            'Our model cross-references your symptoms against Nepali disease patterns and WHO data.',
        },
        {
          title: 'Personalized Guidance',
          description:
            'Receive a report with possible conditions, urgency level, and recommended next steps.',
        },
      ],
    },
    qr: {
      heading: 'Emergency QR: Your Life-Saving Code',
      subheading: 'First responders get critical data in seconds',
      description:
        'Generate a personal Emergency QR code containing your blood type, allergies, medications, and emergency contacts. No internet required — just a quick scan saves lives.',
      steps: [
        'Create your health profile',
        'Generate your personal QR code',
        'Share or print — keep it anywhere',
        'Responders scan for instant access',
      ],
      cta: 'Generate My QR Code',
    },
    footer: {
      tagline: 'AI-powered healthcare for every Nepali',
      copyright: '© 2025 Swastha Nepal. All rights reserved.',
      links: [
        { label: 'Home', href: '#' },
        { label: 'Features', href: '#features' },
        { label: 'About', href: '#about' },
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
      ],
      contact: {
        email: 'kushal.upr@gmail.com',
        phone: '+977-9749231395',
      },
    },
  },

  np: {
    nav: {
      home: 'गृहपृष्ठ',
      features: 'विशेषताहरू',
      about: 'हाम्रोबारे',
      emergency: 'आपातकाल',
      login: 'लगइन',
      register: 'दर्ता',
    },
    hero: {
      badge: 'नेपालको नम्बर १ AI स्वास्थ्य मञ्च',
      headline: ['तपाईंको AI-संचालित', 'स्वास्थ्य साथी', 'नेपालका लागि'],
      subheadline: 'प्रविधिले नेपालको स्वास्थ्य सेवाको अन्तर पुर्दै',
      description:
        'बुद्धिमान स्वास्थ्य मार्गदर्शन, आपातकालीन सेवाहरू, र डिजिटल चिकित्सा अभिलेखहरूमा पहुँच — नेपालको अनुकूल।',
      ctaRegister: 'निःशुल्क सुरु गर्नुहोस्',
      ctaLogin: 'लगइन',
      ctaEmergency: 'आपातकालीन पहुँच',
    },
    stats: {
      heading: 'नेपालभरि लाखौंले विश्वास गरेको',
      items: [
        { value: '१०M+', label: 'नागरिक सेवित' },
        { value: '५००+', label: 'साझेदार अस्पताल' },
        { value: '५०K+', label: 'दैनिक परामर्श' },
        { value: '९८%', label: 'निदान सटीकता' },
      ],
    },
    features: {
      heading: 'राम्रो स्वास्थ्यका लागि सबै कुरा',
      subheading:
        'नेपालको स्वास्थ्य प्रणालीका लागि AI द्वारा संचालित व्यापक उपकरणहरू',
      items: [
        {
          icon: '🧠',
          title: 'AI लक्षण विश्लेषण',
          description:
            'आफ्नो लक्षणहरू वर्णन गर्नुहोस् र नेपाली चिकित्सा डेटामा प्रशिक्षित AI बाट तत्काल स्वास्थ्य मार्गदर्शन पाउनुहोस्।',
        },
        {
          icon: '📋',
          title: 'डिजिटल स्वास्थ्य अभिलेख',
          description:
            'आफ्नो सम्पूर्ण चिकित्सा इतिहास सुरक्षित रूपमा भण्डारण गर्नुहोस् र जहाँबाट पनि पहुँच गर्नुहोस्।',
        },
        {
          icon: '📱',
          title: 'टेलिमेडिसिन',
          description:
            'घरबाटै प्रमाणित डाक्टरसँग भिडियो वा च्याटमार्फत जडान हुनुहोस् — समय र यात्रा खर्च बचत गर्नुहोस्।',
        },
        {
          icon: '🚨',
          title: 'आपातकालीन प्रतिक्रिया',
          description:
            'GPS स्थान साझेदारी र नजिकका अस्पतालहरूमा तत्काल सूचनासहित २४/७ आपातकालीन प्रेषण।',
        },
        {
          icon: '💊',
          title: 'औषधि व्यवस्थापन',
          description:
            'डिजिटल प्रिस्क्रिप्सन प्राप्त गर्नुहोस्, भण्डारण गर्नुहोस् र औषधिको स्वचालित अनुस्मारकसहित रिफिल गर्नुहोस्।',
        },
        {
          icon: '📊',
          title: 'स्वास्थ्य विश्लेषण',
          description:
            'व्यक्तिगत अन्तर्दृष्टि र निवारक हेरचाह सिफारिसहरूसहित समयसँगै आफ्नो स्वास्थ्य प्रवृत्ति ट्र्याक गर्नुहोस्।',
        },
      ],
    },
    ai: {
      heading: 'हाम्रो AI कसरी काम गर्छ',
      subheading: 'अत्याधुनिक AI द्वारा संचालित बुद्धिमान स्वास्थ्य सेवा',
      description:
        'हाम्रो AI लाखौं गुमनाम नेपाली स्वास्थ्य अभिलेखहरूमा प्रशिक्षित छ र WHO दिशानिर्देशहरू पालन गर्दछ।',
      badge: 'उन्नत AI द्वारा संचालित',
      steps: [
        {
          title: 'आफ्नो लक्षणहरू वर्णन गर्नुहोस्',
          description:
            'अंग्रेजी वा नेपालीमा लक्षणहरू प्रविष्ट गर्नुहोस्। हाम्रो प्रणाली स्थानीय स्वास्थ्य शब्दावली बुझ्छ।',
        },
        {
          title: 'AI विश्लेषण',
          description:
            'हाम्रो मोडेलले नेपाली रोग ढाँचाहरू र WHO डेटाविरुद्ध तपाईंका लक्षणहरू तुलना गर्दछ।',
        },
        {
          title: 'व्यक्तिगत मार्गदर्शन',
          description:
            'सम्भावित अवस्थाहरू, जरुरीपन स्तर र सिफारिस गरिएका अर्को चरणहरूसहित प्रतिवेदन पाउनुहोस्।',
        },
      ],
    },
    qr: {
      heading: 'आपातकालीन QR: तपाईंको जीवन बचाउने कोड',
      subheading: 'प्राथमिक उपचारकर्ताहरूले सेकेन्डमा महत्वपूर्ण डेटा पाउँछन्',
      description:
        'तपाईंको रक्त समूह, एलर्जी, औषधिहरू र आपातकालीन सम्पर्कहरू समावेश गरिएको व्यक्तिगत आपातकालीन QR कोड उत्पन्न गर्नुहोस्। इन्टरनेट आवश्यक छैन।',
      steps: [
        'आफ्नो स्वास्थ्य प्रोफाइल सिर्जना गर्नुहोस्',
        'व्यक्तिगत QR कोड उत्पन्न गर्नुहोस्',
        'साझा गर्नुहोस् वा प्रिन्ट गर्नुहोस्',
        'उपचारकर्ताहरूले स्क्यान गरी तत्काल पहुँच पाउँछन्',
      ],
      cta: 'मेरो QR कोड उत्पन्न गर्नुहोस्',
    },
    footer: {
      tagline: 'हरेक नेपालीका लागि AI-संचालित स्वास्थ्य सेवा',
      copyright: '© २०२५ स्वस्थ नेपाल AI। सर्वाधिकार सुरक्षित।',
      links: [
        { label: 'गृहपृष्ठ', href: '#' },
        { label: 'विशेषताहरू', href: '#features' },
        { label: 'हाम्रोबारे', href: '#about' },
        { label: 'गोपनीयता नीति', href: '#' },
        { label: 'सेवा सर्तहरू', href: '#' },
      ],
      contact: {
        email: 'kushal.upr@gmail.com',
        phone: '+९७७-९७४९२३१३९५',
      },
    },
  },
}
