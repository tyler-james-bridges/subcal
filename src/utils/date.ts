import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  addMonths,
  subMonths,
  getDate,
  getMonth,
  getYear,
  getDaysInMonth,
} from 'date-fns';
import { CalendarDay, Subscription } from '../types';

export function getCalendarDays(date: Date, subscriptions: Subscription[]): CalendarDay[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const today = new Date();

  return days.map((day) => ({
    date: day,
    dayOfMonth: getDate(day),
    isCurrentMonth: isSameMonth(day, date),
    isToday: isSameDay(day, today),
    subscriptions: getSubscriptionsForDay(day, subscriptions),
  }));
}

export function getSubscriptionsForDay(date: Date, subscriptions: Subscription[]): Subscription[] {
  const dayOfMonth = getDate(date);
  const month = getMonth(date);
  const year = getYear(date);
  const daysInMonth = getDaysInMonth(date);

  return subscriptions.filter((sub) => {
    if (!sub.isActive) return false;

    const startDate = new Date(sub.startDate);

    // Check if subscription has started
    if (date < startDate) return false;

    if (sub.billingCycle === 'monthly') {
      // For monthly subscriptions, check if the billing day matches
      // Handle edge case where billing day is greater than days in month
      const effectiveBillingDay = Math.min(sub.billingDay, daysInMonth);
      return dayOfMonth === effectiveBillingDay;
    } else {
      // For yearly subscriptions, check if month and day match the start date
      const startMonth = getMonth(startDate);
      const startDay = getDate(startDate);
      const effectiveDay = Math.min(startDay, daysInMonth);
      return month === startMonth && dayOfMonth === effectiveDay;
    }
  });
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM, yyyy');
}

export function goToNextMonth(date: Date): Date {
  return addMonths(date, 1);
}

export function goToPreviousMonth(date: Date): Date {
  return subMonths(date, 1);
}

export function getMonthlyTotal(subscriptions: Subscription[]): number {
  return subscriptions.reduce((total, sub) => {
    if (!sub.isActive) return total;

    if (sub.billingCycle === 'monthly') {
      return total + sub.price;
    } else {
      // Convert yearly to monthly
      return total + sub.price / 12;
    }
  }, 0);
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getSubscriptionStats(subscriptions: Subscription[]) {
  const active = subscriptions.filter((s) => s.isActive);
  const monthly = active.filter((s) => s.billingCycle === 'monthly');
  const yearly = active.filter((s) => s.billingCycle === 'yearly');

  return {
    total: active.length,
    monthly: monthly.length,
    yearly: yearly.length,
    monthlyTotal: getMonthlyTotal(active),
  };
}

/**
 * Calculate weekly spending based on billing cycles
 * Weekly = monthly / 4.33 (average weeks per month)
 */
export function getWeeklyTotal(subscriptions: Subscription[]): number {
  const monthlyTotal = getMonthlyTotal(subscriptions);
  return monthlyTotal / 4.33;
}

/**
 * Calculate yearly spending based on billing cycles
 */
export function getYearlyTotal(subscriptions: Subscription[]): number {
  return subscriptions.reduce((total, sub) => {
    if (!sub.isActive) return total;

    if (sub.billingCycle === 'yearly') {
      return total + sub.price;
    } else {
      // Convert monthly to yearly
      return total + sub.price * 12;
    }
  }, 0);
}

/**
 * Get comprehensive spending stats
 */
export function getSpendingStats(subscriptions: Subscription[]) {
  const active = subscriptions.filter((s) => s.isActive);

  return {
    weekly: getWeeklyTotal(active),
    monthly: getMonthlyTotal(active),
    yearly: getYearlyTotal(active),
  };
}

/**
 * Calculate the number of days remaining in a free trial
 * Returns null if no trial or trial has ended
 */
export function getTrialDaysRemaining(trialEndDate: string | undefined): number | null {
  if (!trialEndDate) return null;

  const endDate = new Date(trialEndDate);
  const today = new Date();

  // Reset to start of day for accurate comparison
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= 0 ? diffDays : null;
}

/**
 * Check if a subscription is currently in trial period
 */
export function isInTrialPeriod(subscription: Subscription): boolean {
  const daysRemaining = getTrialDaysRemaining(subscription.trialEndDate);
  return daysRemaining !== null && daysRemaining >= 0;
}
