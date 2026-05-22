export type Language = 'en' | 'np'

export interface NavTranslations {
  home: string
  features: string
  about: string
  emergency: string
  login: string
  register: string
}

export interface HeroTranslations {
  badge: string
  headline: string[]
  subheadline: string
  description: string
  ctaRegister: string
  ctaLogin: string
  ctaEmergency: string
}

export interface StatItem {
  value: string
  label: string
}

export interface StatsTranslations {
  heading: string
  items: StatItem[]
}

export interface FeatureItem {
  icon: string
  title: string
  description: string
}

export interface FeaturesTranslations {
  heading: string
  subheading: string
  items: FeatureItem[]
}

export interface AITranslations {
  heading: string
  subheading: string
  description: string
  steps: { title: string; description: string }[]
  badge: string
}

export interface QRTranslations {
  heading: string
  subheading: string
  description: string
  steps: string[]
  cta: string
}

export interface FooterTranslations {
  tagline: string
  copyright: string
  links: { label: string; href: string }[]
  contact: { email: string; phone: string }
}

export interface Translations {
  nav: NavTranslations
  hero: HeroTranslations
  stats: StatsTranslations
  features: FeaturesTranslations
  ai: AITranslations
  qr: QRTranslations
  footer: FooterTranslations
}
