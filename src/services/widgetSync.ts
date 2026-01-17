import { Platform, NativeModules } from 'react-native';
import { Subscription } from '../types';

// Widget data syncing for iOS
// This uses shared UserDefaults via App Groups to communicate with the widget

interface WidgetSubscriptionData {
  id: string;
  name: string;
  price: number;
  billingDay: number;
  icon: string;
  billingCycle: string;
}

/**
 * Sync subscription data to the iOS widget via shared UserDefaults
 * Note: This requires the react-native-shared-group-preferences package
 * or a custom native module to access App Group UserDefaults
 */
export async function syncWidgetData(
  subscriptions: Subscription[],
  monthlyTotal: number
): Promise<void> {
  if (Platform.OS !== 'ios') {
    return;
  }

  try {
    // Filter to active subscriptions only
    const activeSubscriptions = subscriptions.filter((s) => s.isActive);

    // Get upcoming subscriptions (billing day >= today)
    const today = new Date().getDate();
    const upcomingSubscriptions = activeSubscriptions
      .filter((s) => s.billingDay >= today)
      .sort((a, b) => a.billingDay - b.billingDay)
      .slice(0, 5);

    const widgetData: WidgetSubscriptionData[] = upcomingSubscriptions.map((s) => ({
      id: s.id,
      name: s.name,
      price: s.price,
      billingDay: s.billingDay,
      icon: s.icon,
      billingCycle: s.billingCycle,
    }));

    // Note: To actually write to shared UserDefaults, you need either:
    // 1. A native module that writes to the app group
    // 2. The expo-widgets package's built-in sync mechanism
    // 3. react-native-shared-group-preferences

    // For now, we'll use expo-widgets if available
    const ExpoWidgets = NativeModules.ExpoWidgets;
    if (ExpoWidgets?.setWidgetData) {
      await ExpoWidgets.setWidgetData(
        JSON.stringify(widgetData),
        'widgetSubscriptions'
      );
      await ExpoWidgets.setWidgetData(
        monthlyTotal.toString(),
        'monthlyTotal'
      );
      // Reload the widget timeline
      await ExpoWidgets.reloadAllTimelines?.();
    } else {
      console.log('Widget sync: Native module not available (expected in Expo Go)');
    }
  } catch (error) {
    console.log('Widget sync error:', error);
  }
}

/**
 * Request widget timeline reload
 */
export async function reloadWidgetTimeline(): Promise<void> {
  if (Platform.OS !== 'ios') {
    return;
  }

  try {
    const ExpoWidgets = NativeModules.ExpoWidgets;
    if (ExpoWidgets?.reloadAllTimelines) {
      await ExpoWidgets.reloadAllTimelines();
    }
  } catch (error) {
    console.log('Widget reload error:', error);
  }
}
