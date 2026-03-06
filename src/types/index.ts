export interface Prayer {
  id: string;
  title: string;
  body: string;
  tags: string[];
  isPreloaded: boolean;
  createdAt: number; // epoch ms
}

export interface Session {
  id: string;
  name: string;
  time: string;         // "HH:mm" 24h
  recurrence: 'once' | 'daily' | 'weekly' | 'custom';
  daysOfWeek: number[]; // 0=Sun … 6=Sat
  prayerIds: string[];  // ordered
  notificationId: string;
  isActive: boolean;
  createdAt: number;    // epoch ms
}

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  profilePicture: string | null;
  createdAt: number;
}
