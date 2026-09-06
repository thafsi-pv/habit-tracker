export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  timezone: string;
  notificationsEnabled: boolean;
  notificationTime: string | null;
  whatsappNumber: string | null;
}

export type TrackerRole = 'MASTER' | 'MEMBER';

export interface Tracker {
  id: string;
  name: string;
  ownerId: string;
  myRole: TrackerRole;
  notifyOnActivityUpdate?: boolean;
  _count?: { members: number; habits: number };
}

export interface Subtask {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Habit {
  id: string;
  trackerId: string;
  name: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  subtasks: Subtask[];
}

export interface DashboardHabit {
  id: string;
  name: string;
  icon: string | null;
  completed: boolean;
  subtasks: { id: string; name: string; completed: boolean }[];
}

export interface DashboardResponse {
  date: string;
  userName: string;
  myProgress: { completed: number; total: number; percent: number };
  myHabits: DashboardHabit[];
  groupProgress: {
    userId: string;
    name: string;
    avatarUrl: string | null;
    completed: number;
    total: number;
    percent: number;
  }[];
}

export interface WeeklyProgress {
  days: string[];
  members: { userId: string; name: string; days: { date: string; completed: number; total: number; percent: number }[] }[];
}

export interface DailyHabitDetail {
  id: string;
  name: string;
  icon: string | null;
  completed: boolean;
  subtasks: { id: string; name: string; completed: boolean }[];
}

export interface DailyMemberProgress {
  userId: string;
  name: string;
  avatarUrl: string | null;
  completed: number;
  total: number;
  percent: number;
  habits: DailyHabitDetail[];
}

export interface DailyProgressResponse {
  date: string;
  members: DailyMemberProgress[];
}

export interface MonthlyHabitStat {
  habitId: string;
  name: string;
  icon: string | null;
  completionRate: number;
  completedDays: number;
  totalDays: number;
  currentStreak: number;
  bestStreak: number;
}

export interface MonthlyProgress {
  windowStart: string;
  windowEnd: string;
  habits: MonthlyHabitStat[];
  overallCompletionRate: number;
}

export interface Member {
  id: string;
  userId: string;
  role: TrackerRole;
  joinedAt: string;
  user: { id: string; name: string; email: string; avatarUrl: string | null };
}

export interface Invitation {
  id: string;
  email: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  tracker?: { id: string; name: string };
  invitedBy?: { name: string };
}

export type WhatsAppStatusValue = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

export interface WhatsAppStatus {
  status: WhatsAppStatusValue;
  phoneNumber?: string | null;
  qr?: string | null;
}
