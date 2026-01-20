import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Subscription } from '../types';
import { formatCurrency, getTrialDaysRemaining, isInTrialPeriod } from '../utils';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  enabled: boolean;
  daysBefore: number; // How many days before renewal to notify
  notifyTime: { hour: number; minute: number }; // What time to send notification
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  daysBefore: 1,
  notifyTime: { hour: 9, minute: 0 },
};

/**
 * Request permission to send notifications
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Notifications only work on physical devices');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permissions not granted');
    return false;
  }

  // Set up notification channels for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('renewals', {
      name: 'Subscription Renewals',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B35',
    });

    await Notifications.setNotificationChannelAsync('trials', {
      name: 'Trial Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFA500',
    });
  }

  return true;
}

/**
 * Get the next renewal date for a subscription
 */
function getNextRenewalDate(subscription: Subscription): Date {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const billingDay = subscription.billingDay;

  let renewalDate: Date;

  if (subscription.billingCycle === 'monthly') {
    // Find the next monthly renewal
    renewalDate = new Date(currentYear, currentMonth, billingDay);
    if (renewalDate <= today) {
      renewalDate = new Date(currentYear, currentMonth + 1, billingDay);
    }
  } else {
    // Yearly - parse from startDate
    const startDate = new Date(subscription.startDate);
    renewalDate = new Date(currentYear, startDate.getMonth(), startDate.getDate());
    if (renewalDate <= today) {
      renewalDate = new Date(currentYear + 1, startDate.getMonth(), startDate.getDate());
    }
  }

  return renewalDate;
}

/**
 * Schedule a notification for a subscription renewal
 */
export async function scheduleRenewalNotification(
  subscription: Subscription,
  settings: NotificationSettings = DEFAULT_SETTINGS
): Promise<string | null> {
  if (!settings.enabled || !subscription.isActive) {
    return null;
  }

  const renewalDate = getNextRenewalDate(subscription);
  const notificationDate = new Date(renewalDate);
  notificationDate.setDate(notificationDate.getDate() - settings.daysBefore);
  notificationDate.setHours(settings.notifyTime.hour, settings.notifyTime.minute, 0, 0);

  // Don't schedule if the notification date has already passed
  if (notificationDate <= new Date()) {
    return null;
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: `${subscription.name} renews soon`,
      body: `Your ${subscription.name} subscription (${formatCurrency(subscription.price)}/${subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}) renews ${settings.daysBefore === 0 ? 'today' : settings.daysBefore === 1 ? 'tomorrow' : `in ${settings.daysBefore} days`}.`,
      data: { subscriptionId: subscription.id },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: notificationDate,
    },
  });

  return identifier;
}

/**
 * Cancel all scheduled notifications for a subscription
 */
export async function cancelSubscriptionNotifications(subscriptionId: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const notification of scheduled) {
    if (notification.content.data?.subscriptionId === subscriptionId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

/**
 * Schedule notifications for all active subscriptions
 */
export async function scheduleAllRenewalNotifications(
  subscriptions: Subscription[],
  settings: NotificationSettings = DEFAULT_SETTINGS
): Promise<void> {
  // Cancel all existing notifications first
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!settings.enabled) {
    return;
  }

  // Schedule notifications for active subscriptions
  const activeSubscriptions = subscriptions.filter((s) => s.isActive);

  for (const subscription of activeSubscriptions) {
    await scheduleRenewalNotification(subscription, settings);
  }

  console.log(`Scheduled notifications for ${activeSubscriptions.length} subscriptions`);
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Add listener for when a notification is received
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add listener for when user interacts with a notification
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// ============================================================
// Trial Notification Functions
// ============================================================

/**
 * Trial reminder intervals in days before trial ends
 */
const TRIAL_REMINDER_DAYS = [3, 1, 0] as const;

export interface TrialNotificationSettings {
  enabled: boolean;
  notifyTime: { hour: number; minute: number };
}

const DEFAULT_TRIAL_SETTINGS: TrialNotificationSettings = {
  enabled: true,
  notifyTime: { hour: 9, minute: 0 },
};

/**
 * Generate a unique notification identifier for a trial reminder
 */
function getTrialNotificationId(subscriptionId: string, daysBefore: number): string {
  return `trial-${subscriptionId}-${daysBefore}`;
}

/**
 * Get the notification message based on days remaining
 */
function getTrialNotificationMessage(subscriptionName: string, daysRemaining: number): { title: string; body: string } {
  if (daysRemaining === 0) {
    return {
      title: `${subscriptionName} trial ends today!`,
      body: `Your free trial for ${subscriptionName} ends today. Cancel now to avoid being charged.`,
    };
  } else if (daysRemaining === 1) {
    return {
      title: `${subscriptionName} trial ends tomorrow`,
      body: `Your free trial for ${subscriptionName} ends tomorrow. Cancel now if you don't want to continue.`,
    };
  } else {
    return {
      title: `${subscriptionName} trial ending soon`,
      body: `Your free trial for ${subscriptionName} ends in ${daysRemaining} days. Review and cancel if needed.`,
    };
  }
}

/**
 * Schedule trial reminder notifications for a subscription
 * Schedules notifications at 3 days, 1 day, and day of trial ending
 */
export async function scheduleTrialNotifications(
  subscription: Subscription,
  settings: TrialNotificationSettings = DEFAULT_TRIAL_SETTINGS
): Promise<string[]> {
  const scheduledIds: string[] = [];

  if (!settings.enabled || !subscription.isActive || !subscription.trialEndDate) {
    return scheduledIds;
  }

  // Check if subscription is currently in trial
  if (!isInTrialPeriod(subscription)) {
    return scheduledIds;
  }

  const trialEndDate = new Date(subscription.trialEndDate);
  trialEndDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const daysBefore of TRIAL_REMINDER_DAYS) {
    const notificationDate = new Date(trialEndDate);
    notificationDate.setDate(notificationDate.getDate() - daysBefore);
    notificationDate.setHours(settings.notifyTime.hour, settings.notifyTime.minute, 0, 0);

    // Don't schedule if the notification date has already passed
    if (notificationDate <= new Date()) {
      continue;
    }

    const { title, body } = getTrialNotificationMessage(subscription.name, daysBefore);
    const notificationId = getTrialNotificationId(subscription.id, daysBefore);

    try {
      // Cancel any existing notification with this ID first
      await Notifications.cancelScheduledNotificationAsync(notificationId).catch(() => {
        // Ignore error if notification doesn't exist
      });

      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title,
          body,
          data: {
            subscriptionId: subscription.id,
            type: 'trial_reminder',
            daysRemaining: daysBefore,
          },
          sound: true,
          ...(Platform.OS === 'android' && { channelId: 'trials' }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: notificationDate,
        },
      });

      scheduledIds.push(notificationId);
    } catch (error) {
      console.error(`Failed to schedule trial notification for ${subscription.name}:`, error);
    }
  }

  if (scheduledIds.length > 0) {
    console.log(`Scheduled ${scheduledIds.length} trial notifications for ${subscription.name}`);
  }

  return scheduledIds;
}

/**
 * Cancel all trial notifications for a subscription
 */
export async function cancelTrialNotifications(subscriptionId: string): Promise<void> {
  for (const daysBefore of TRIAL_REMINDER_DAYS) {
    const notificationId = getTrialNotificationId(subscriptionId, daysBefore);
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch {
      // Ignore errors - notification may not exist
    }
  }
}

/**
 * Schedule trial notifications for all subscriptions that have active trials
 */
export async function scheduleAllTrialNotifications(
  subscriptions: Subscription[],
  settings: TrialNotificationSettings = DEFAULT_TRIAL_SETTINGS
): Promise<void> {
  if (!settings.enabled) {
    return;
  }

  // Filter to only active subscriptions with trials
  const subscriptionsWithTrials = subscriptions.filter(
    (s) => s.isActive && s.trialEndDate && isInTrialPeriod(s)
  );

  let totalScheduled = 0;

  for (const subscription of subscriptionsWithTrials) {
    const scheduled = await scheduleTrialNotifications(subscription, settings);
    totalScheduled += scheduled.length;
  }

  console.log(`Scheduled ${totalScheduled} trial notifications for ${subscriptionsWithTrials.length} subscriptions`);
}
