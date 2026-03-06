export interface Prayer {
  id: string;
  title: string;
  body: string;
  tags: string[];
  isPreloaded: boolean;
  createdAt: number; // epoch ms
}

export interface PrayerItem {
  prayerId: string;
  quantity: number;
}

export type Recurrence = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
export type CustomUnit  = 'days' | 'weeks' | 'months' | 'years';

export interface Session {
  id: string;
  name: string;
  time: string;              // "HH:mm" 24h
  recurrence: Recurrence;
  customInterval: number;    // used when recurrence === 'custom'
  customUnit: CustomUnit;    // used when recurrence === 'custom'
  daysOfWeek: number[];      // 0=Sun … 6=Sat, used when recurrence === 'weekly'
  prayerItems: PrayerItem[]; // ordered, with quantity per prayer
  notificationId: string;
  isActive: boolean;
  createdAt: number;         // epoch ms
}

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  profilePicture: string | null;
  createdAt: number;
}
