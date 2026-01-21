import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Subscription } from '../types';
import { saveSubscriptions, loadSubscriptions } from '../utils/storage';
import { sampleSubscriptions } from '../data/sampleSubscriptions';
import { successHaptic } from '../utils/haptics';
import {
  requestNotificationPermissions,
  scheduleAllRenewalNotifications,
  cancelSubscriptionNotifications,
  scheduleRenewalNotification,
  scheduleTrialNotifications,
  scheduleAllTrialNotifications,
  cancelTrialNotifications,
} from '../services/notifications';
import { syncWidgetData } from '../services/widgetSync';
import { getSubscriptionStats } from '../utils';

interface SubscriptionContextType {
  subscriptions: Subscription[];
  isLoading: boolean;
  addSubscription: (subscription: Omit<Subscription, 'id'>) => Promise<void>;
  addSubscriptions: (subscriptions: Omit<Subscription, 'id'>[]) => Promise<void>;
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  toggleSubscription: (id: string) => Promise<void>;
  refreshSubscriptions: () => Promise<void>;
  initializeWithSampleData: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSubscriptions = useCallback(async () => {
    try {
      const loaded = await loadSubscriptions();
      setSubscriptions(loaded);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      setSubscriptions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initializeWithSampleData = useCallback(async () => {
    try {
      setSubscriptions(sampleSubscriptions);
      await saveSubscriptions(sampleSubscriptions);
    } catch (error) {
      console.error('Failed to initialize with sample data:', error);
    }
  }, []);

  useEffect(() => {
    refreshSubscriptions();
  }, [refreshSubscriptions]);

  // Set up notifications and sync widget when subscriptions change
  useEffect(() => {
    const setupNotifications = async () => {
      const hasPermission = await requestNotificationPermissions();
      if (hasPermission && subscriptions.length > 0) {
        // Schedule both renewal and trial notifications
        await scheduleAllRenewalNotifications(subscriptions);
        await scheduleAllTrialNotifications(subscriptions);
      }
    };

    const syncWidget = async () => {
      const stats = getSubscriptionStats(subscriptions);
      await syncWidgetData(subscriptions, stats.monthlyTotal);
    };

    if (!isLoading) {
      setupNotifications();
      syncWidget();
    }
  }, [subscriptions, isLoading]);

  const addSubscription = async (subscription: Omit<Subscription, 'id'>) => {
    const newSubscription: Subscription = {
      ...subscription,
      id: uuidv4(),
    };
    const updated = [...subscriptions, newSubscription];
    setSubscriptions(updated);
    await saveSubscriptions(updated);
    successHaptic();
  };

  const addSubscriptions = async (newSubscriptions: Omit<Subscription, 'id'>[]) => {
    const subscriptionsWithIds: Subscription[] = newSubscriptions.map((sub) => ({
      ...sub,
      id: uuidv4(),
    }));
    const updated = [...subscriptions, ...subscriptionsWithIds];
    setSubscriptions(updated);
    await saveSubscriptions(updated);
  };

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    const updated = subscriptions.map((sub) =>
      sub.id === id ? { ...sub, ...updates } : sub
    );
    setSubscriptions(updated);
    await saveSubscriptions(updated);
  };

  const deleteSubscription = async (id: string) => {
    // Cancel any scheduled notifications (renewal and trial) for this subscription before deleting
    await cancelSubscriptionNotifications(id);
    await cancelTrialNotifications(id);
    const updated = subscriptions.filter((sub) => sub.id !== id);
    setSubscriptions(updated);
    await saveSubscriptions(updated);
    successHaptic();
  };

  const toggleSubscription = async (id: string) => {
    const subscription = subscriptions.find((sub) => sub.id === id);
    if (!subscription) return;

    const willBeActive = !subscription.isActive;

    if (willBeActive) {
      // Unpausing: re-schedule renewal and trial notifications
      await scheduleRenewalNotification({ ...subscription, isActive: true });
      await scheduleTrialNotifications({ ...subscription, isActive: true });
    } else {
      // Pausing: cancel all scheduled notifications (renewal and trial) for this subscription
      await cancelSubscriptionNotifications(id);
      await cancelTrialNotifications(id);
    }

    const updated = subscriptions.map((sub) =>
      sub.id === id ? { ...sub, isActive: willBeActive } : sub
    );
    setSubscriptions(updated);
    await saveSubscriptions(updated);
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptions,
        isLoading,
        addSubscription,
        addSubscriptions,
        updateSubscription,
        deleteSubscription,
        toggleSubscription,
        refreshSubscriptions,
        initializeWithSampleData,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptions must be used within a SubscriptionProvider');
  }
  return context;
}
