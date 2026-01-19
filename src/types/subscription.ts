export type BillingCycle = 'monthly' | 'yearly';

export type ServiceIcon =
  | 'netflix'
  | 'adobe'
  | 'apple'
  | 'spotify'
  | 'figma'
  | 'slack'
  | 'notion'
  | 'github'
  | 'dropbox'
  | 'google'
  | 'microsoft'
  | 'amazon'
  | 'discord'
  | 'zoom'
  | 'linear'
  | 'vercel'
  | 'openai'
  | 'custom';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  billingDay: number; // Day of month (1-31) for monthly, or day of year represented as month-day
  startDate: string; // ISO date string
  icon: ServiceIcon;
  color: string;
  notes?: string;
  isActive: boolean;
  trialEndDate?: string; // ISO date string for free trial end date
}

export interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  subscriptions: Subscription[];
}
