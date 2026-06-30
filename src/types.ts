export interface Settings {
  id: string;
  company_name: string;
  logo_url: string;
  theme_color: string;
  accent_color: string;
  background_url: string;
  home_background_url: string;
  home_background_urls: string[];
  splash_image_urls: string[];
  whatsapp_number: string;
  default_language: string;
  tagline_id: string;
  tagline_en: string;
  tagline_zh: string;
  subtitle_id: string;
  subtitle_en: string;
  subtitle_zh: string;
  bokeh_theme_id?: string;
  bokeh_gradient?: string;
  map_image_url?: string;
  profile_logo_url?: string;
  profile_speech_text_id?: string;
  profile_speech_text_en?: string;
  profile_speech_text_zh?: string;
}

export interface TourPackage {
  id: string;
  name_id: string;
  name_en: string;
  name_zh: string;
  description_id: string;
  description_en: string;
  description_zh: string;
  cover_image_url: string;
  price_idr: number;
  duration_hours: number;
  category: string;
  is_active: boolean;
  sort_order: number;
  latitude: number | null;
  longitude: number | null;
  location_address: string | null;
  price_type: string;
  price_type_en?: string;
  price_type_zh?: string;
  min_pax: number;
}

export interface TourPackageOption {
  id: string;
  package_id: string;
  name: string;
  location_address: string;
  gmaps_url: string;
  description: string;
  sort_order: number;
}

export interface TourPoint {
  id: string;
  package_id: string;
  option_id: string;
  name_id: string;
  name_en: string;
  name_zh: string;
  description_id: string;
  description_en: string;
  description_zh: string;
  latitude: number;
  longitude: number;
  location_address: string;
  sequence_order: number;
  duration_minutes: number;
  cover_image_url: string;
}

export interface Activity {
  id: string;
  name_id: string;
  name_en: string;
  name_zh: string;
  description_id: string;
  description_en: string;
  description_zh: string;
  cover_image_url: string;
  price_per_person_idr: number;
  price_mode: string;
  rating: number;
  review_count: number;
  category: string;
  is_active: boolean;
  sort_order: number;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
}

export interface ActivityPackage {
  id: string;
  activity_id: string;
  name: string;
  name_id: string;
  name_en: string;
  name_zh: string;
  description: string;
  description_id: string;
  description_en: string;
  description_zh: string;
  duration_minutes: number;
  sort_order: number;
}

export interface ActivityPackagePrice {
  id: string;
  activity_package_id: string;
  label: string;
  label_id?: string;
  label_en?: string;
  label_zh?: string;
  price_idr: number;
  sort_order: number;
}

export interface ActivityGallery {
  id: string;
  image_url: string;
  activity_id: string | null;
  sort_order: number;
}

export interface Review {
  id: string;
  activity_id: string;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface VisitorLog {
  id: string;
  visitor_name: string;
  session_id: string;
  action_type: string; // 'visit', 'book_now', etc.
  action_details: string;
  is_active: boolean;
  created_at: string;
}

export interface HomeBanner {
  id: string;
  image_url: string;
  sort_order: number;
}
