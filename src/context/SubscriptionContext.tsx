import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Subscription } from '../types';
import { saveSubscriptions, loadSubscriptions } from '../utils/storage';
import { sampleSubscriptions } from '../data/sampleSubscriptions';
import {
  requestNotificationPermissions,
  scheduleAllRenewalNotifications,
  cancelSubscriptionNotifications,
  scheduleRenewalNotification,
} from '../services/notifications';
import { syncWidgetData } from '../services/widgetSync';
import { getSubscriptionStats } from '../utils';

interface SubscriptionContextType {
  subscriptions: Subscription[];
  isLoading: boolean;
  addSubscription: (subscription: Omit<Subscription, 'id'>) => Promise<void>;
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  toggleSubscription: (id: string) => Promise<void>;
  refreshSubscriptions: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSubscriptions = useCallback(async () => {
    try {
      const loaded = await loadSubscriptions();
      // If no subscriptions stored, load sample data
      if (loaded.length === 0) {
        setSubscriptions(sampleSubscriptions);
        await saveSubscriptions(sampleSubscriptions);
      } else {
        setSubscriptions(loaded);
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      // Fallback to sample data on error
      setSubscriptions(sampleSubscriptions);
    } finally {
      setIsLoading(false);
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
        await scheduleAllRenewalNotifications(subscriptions);
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
  };

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    const updated = subscriptions.map((sub) =>
      sub.id === id ? { ...sub, ...updates } : sub
    );
    setSubscriptions(updated);
    await saveSubscriptions(updated);
  };

  const deleteSubscription = async (id: string) => {
    const updated = subscriptions.filter((sub) => sub.id !== id);
    setSubscriptions(updated);
    await saveSubscriptions(updated);
  };

  const toggleSubscription = async (id: string) => {
    const updated = subscriptions.map((sub) =>
      sub.id === id ? { ...sub, isActive: !sub.isActive } : sub
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
        updateSubscription,
        deleteSubscription,
        toggleSubscription,
        refreshSubscriptions,
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
