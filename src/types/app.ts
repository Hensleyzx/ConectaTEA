export type Role = 'dependent' | 'guardian';
export type MoodId = 'very-happy' | 'happy' | 'neutral' | 'anxious' | 'sad';
export type HelpUrgency = 'support' | 'urgent';
export type HelpStatus = 'open' | 'acknowledged' | 'resolved';

export type Mood = {
  id: MoodId;
  label: string;
  emoji: string;
  color: string;
  score: number;
};

export type MoodEntry = {
  id: string;
  moodId: MoodId;
  reason: string;
  intensity: number;
  tags: string[];
  need: string | null;
  createdAt: string;
};

export type RoutineItem = {
  id: string;
  title: string;
  time: string;
  emoji: string;
  category: 'morning' | 'school' | 'health' | 'self-care' | 'leisure' | 'sleep' | 'other';
  active: boolean;
  completedDates: string[];
  reminderEnabled: boolean;
  transitionMinutes: number;
};

export type HelpRequest = {
  id: string;
  urgency: HelpUrgency;
  message: string;
  createdAt: string;
  status: HelpStatus;
  acknowledgedAt?: string;
  resolvedAt?: string;
};

export type RelaxSession = {
  id: string;
  tool: string;
  durationSeconds: number;
  createdAt: string;
};

export type SensoryPreferences = {
  reducedMotion: boolean;
  highContrast: boolean;
  largeControls: boolean;
  haptics: boolean;
  soundDefaultVolume: number;
  preferredCalmingTools: string[];
  avoidTriggers: string[];
};

export type AppSettings = {
  simpleMode: boolean;
  routineReminders: boolean;
  guardianAlerts: boolean;
  showCelebrations: boolean;
};

export type Profile = {
  id: string;
  name: string;
  avatar: string;
  birthDate?: string;
};

export type AppState = {
  dependent: Profile;
  guardian: Profile;
  linked: boolean;
  pairingCode: string;
  moods: MoodEntry[];
  routine: RoutineItem[];
  helpRequests: HelpRequest[];
  relaxSessions: RelaxSession[];
  sensory: SensoryPreferences;
  settings: AppSettings;
  lastRole: Role | null;
};

export type ScreenName =
  | 'welcome'
  | 'role'
  | 'auth'
  | 'dependent-home'
  | 'mood-checkin'
  | 'mood-history'
  | 'routine'
  | 'routine-editor'
  | 'relax'
  | 'breathing'
  | 'grounding'
  | 'first-then'
  | 'calm-plan'
  | 'timer'
  | 'communicate'
  | 'help'
  | 'more'
  | 'sensory'
  | 'settings'
  | 'guardian-home'
  | 'guardian-moods'
  | 'guardian-routine'
  | 'guardian-alerts'
  | 'guardian-reports'
  | 'pairing'
  | 'about';

export type Route = {
  name: ScreenName;
  params?: Record<string, string | number | boolean | undefined>;
};
