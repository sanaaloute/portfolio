export interface Profile {
  id: number;
  name: string;
  headline: string;
  tagline: string;
  bio: string;
  avatar_url: string | null;
  resume_url: string | null;
  location: string | null;
  email: string;
  github: string | null;
  linkedin: string | null;
  twitter: string | null;
  hero_stats: { label: string; value: string }[];
  focus_areas: { title: string; description: string }[];
  socials: { platform: string; url: string }[];
  updated_at?: string;
}

export interface Project {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string;
  period: string;
  location: string | null;
  stack: string[];
  cover_url: string | null;
  images: { url: string; caption?: string }[];
  featured: boolean;
  position: number;
  created_at?: string;
  updated_at?: string;
}

export interface Experience {
  id: number;
  slug: string;
  company: string;
  role: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  description: string;
  highlights: string[];
  stack: string[];
  logo_url: string | null;
  position: number;
  created_at?: string;
  updated_at?: string;
}

export interface Blog {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  cover_url: string | null;
  published: boolean;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface UploadedImage {
  url: string;
  filename: string;
}

export interface LoginCredentials {
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ChatQuery {
  query: string;
}

export interface ChatResponse {
  answer: string;
  confidence: number;
}
