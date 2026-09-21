export interface CoupleData {
  brideName: string;
  groomName: string;
  weddingDate: string; // YYYY-MM-DD
  weddingTime: string; // HH:mm or text e.g. "5:00 PM onwards"
  venue: string;
  city: string;
  ceremonyType: string; // "Wedding Ceremony", "Engagement Ceremony", etc.
  parentsGroom: string;
  parentsBride: string;
  blessingHeader: string; // "|| Shree Ganeshay Namah ||" or "With Love & Joy"
  coupleQuote: string;
}

export interface SceneItem {
  id: number;
  tag: string; // "scene1" | "scene2" | "scene3" | "scene4"
  title: string;
  subtitle: string;
  actionText: string;
  imageUrl: string;
  duration: number; // in seconds
  soundEffect?: string;
  customOverlayText?: string;
}

export interface CaricatureAIProfile {
  groom: {
    features: string;
    expression: string;
  };
  bride: {
    features: string;
    expression: string;
  };
  vibe: string;
  romanticQuote?: string;
  scenePrompts?: {
    scene1?: string;
    scene2?: string;
    scene3?: string;
    scene4?: string;
  };
}

export interface SceneryOption {
  id: string;
  label: string;
  category: 'proposal' | 'dance' | 'attire' | 'mandap' | 'scenery' | 'ritual' | 'upload';
  imageUrl: string;
  description: string;
  themeName?: string;
}

export type AspectRatioType = '9:16' | '16:9';
export type MusicTheme = 'romantic-waltz' | 'fairytale-ballad' | 'celestial-piano' | 'festive-sangeet';
export type VideoQuality = '1080p' | '720p' | '4k';

export interface ExportedVideoData {
  blob: Blob;
  url: string;
  fileName: string;
  mimeType: string;
  extension: 'mp4' | 'webm';
  quality: VideoQuality;
  width: number;
  height: number;
  sizeBytes: number;
  durationSeconds: number;
}

export type IndianStateId =
  | 'punjab'
  | 'rajasthan'
  | 'south'
  | 'kerala'
  | 'maharashtra'
  | 'bengal'
  | 'gujarat'
  | 'kashmir'
  | 'awadh'
  | 'assam'
  | 'beach'
  | 'bollywood';

export interface IndianStateTheme {
  id: IndianStateId;
  name: string;
  stateLabel: string;
  region: string;
  blessingHeader: string;
  defaultVenue: string;
  defaultCity: string;
  ceremonyType: string;
  musicTheme: MusicTheme;
  brideAttire: string;
  groomAttire: string;
  culturalVibe: string;
  officialCoupleImage: string;
  accentColor: string;
  cardBorderColor: string;
  scenes: SceneItem[];
  sceneryOptions: SceneryOption[];
}

