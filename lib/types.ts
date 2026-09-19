export type Locale = "en" | "fr" | "ar";
export type ML = { en: string; fr: string; ar: string };

export interface SiteSettings {
  siteName: string;
  tagline: ML;
  contactEmail: string;
  whatsapp: string;
  address: ML;
  footerNote: ML;
}

export interface NavItem {
  id: string;
  label: ML;
  href: string;
  order: number;
  active: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: ML;
  order: number;
  active: boolean;
}

export interface Automation {
  id: string;
  slug: string;
  title: ML;
  short: ML;
  description: ML;
  category: string; // category slug
  icon: string;
  benefits: ML[];
  workflow: ML[];
  integrations: string[];
  order: number;
  active: boolean;
}

export interface PackageFeature {
  id: string;
  text: ML;
  order: number;
}

export interface SocialPackage {
  id: string;
  slug: string;
  name: string;
  description: ML;
  price: number;
  currency: string;
  billingPeriod: ML;
  badge: ML;
  popular: boolean;
  visible: boolean;
  order: number;
  features: PackageFeature[];
  postsPerMonth: number;
  reelsPerMonth: number;
  storiesPerMonth: number;
  platforms: string[]; // platform ids
}

export interface SocialLink {
  id: string;
  platform: string; // instagram | facebook | whatsapp | linkedin | x | website
  name: string;
  username: string;
  description: ML;
  url: string;
  active: boolean;
  order: number;
}

export interface ServiceCard {
  id: string;
  icon: string;
  title: ML;
  description: ML;
  deliverables: ML[];
  order: number;
}

export interface SocialPageContent {
  heroBadge: ML;
  heroTitle: ML;
  heroDescription: ML;
  primaryCta: ML;
  secondaryCta: ML;
  servicesTitle: ML;
  servicesDescription: ML;
  services: ServiceCard[];
  platformsTitle: ML;
  platformsDescription: ML;
  platforms: string[];
  packagesTitle: ML;
  packagesDescription: ML;
  processTitle: ML;
  processDescription: ML;
  processSteps: { id: string; title: ML; description: ML }[];
  finalCtaTitle: ML;
  finalCtaDescription: ML;
  finalCtaPrimary: ML;
  finalCtaSecondary: ML;
}

export interface Faq {
  id: string;
  question: ML;
  answer: ML;
  order: number;
  visible: boolean;
}

export type RequestStatus =
  | "new"
  | "reviewing"
  | "contacted"
  | "in_progress"
  | "completed"
  | "archived";

export interface ServiceRequest {
  id: string;
  type: "automation" | "social_media";
  fullName: string;
  email: string;
  whatsapp: string;
  company: string;
  selectedId: string;
  selectedName: string;
  selectedPrice?: string;
  description: string;
  additional: string;
  platforms?: string[];
  goals?: string;
  brandInfo?: string;
  status: RequestStatus;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  company: string;
  message: string;
  status: "new" | "read" | "archived";
  createdAt: string;
}

export type PostStatus = "draft" | "review" | "approved" | "scheduled" | "published";

export interface SocialPost {
  id: string;
  client: string;
  platform: string;
  caption: string;
  media: string;
  contentType: string;
  campaign: string;
  status: PostStatus;
  scheduleDate: string; // YYYY-MM-DD
}

export interface InboxMessage {
  id: string;
  platform: string;
  author: string;
  handle: string;
  body: string;
  category: "lead" | "sales" | "support" | "question" | "spam";
  unread: boolean;
  createdAt: string;
  suggestedReply: string;
}

export interface SocialClient {
  id: string;
  name: string;
  industry: string;
  platforms: string[];
  packageSlug: string;
  since: string;
  status: "active" | "paused";
}

export interface SocialAccount {
  id: string;
  platform: string;
  handle: string;
  client: string;
  connected: boolean;
  note: string;
}

export interface Db {
  version: number;
  settings: SiteSettings;
  navigation: NavItem[];
  categories: Category[];
  automations: Automation[];
  socialPage: SocialPageContent;
  packages: SocialPackage[];
  socialLinks: SocialLink[];
  faqs: Faq[];
  requests: ServiceRequest[];
  messages: ContactMessage[];
  posts: SocialPost[];
  inbox: InboxMessage[];
  clients: SocialClient[];
  accounts: SocialAccount[];
}
