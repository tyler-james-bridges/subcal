import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { CalendarDay as CalendarDayType, DetectedSubscription, Subscription } from '../types';
import { colors } from '../constants';
import {
  CalendarHeader,
  CalendarGrid,
  CalendarLegend,
  CalendarFooter,
  StatsSection,
  AddSubscriptionModal,
  DayDetailModal,
  SearchFilterModal,
  StatementImportModal,
} from '../components';
import { useSubscriptions } from '../context/SubscriptionContext';
import {
  getCalendarDays,
  goToNextMonth,
  goToPreviousMonth,
  getSubscriptionStats,
  getSpendingStats,
  getNewSubscriptionsThisMonth,
  getNextBillingDate,
  getSubscriptionsForDay,
} from '../utils';

export function HomeScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<CalendarDayType | null>(null);
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    subscriptions,
    isLoading,
    addSubscription,
    addSubscriptions,
    updateSubscription,
    deleteSubscription,
    toggleSubscription,
    refreshSubscriptions,
  } = useSubscriptions();

  const calendarDays = useMemo(
    () => getCalendarDays(currentDate, subscriptions),
    [currentDate, subscriptions]
  );

  const stats = useMemo(() => getSubscriptionStats(subscriptions), [subscriptions]);
  const spendingStats = useMemo(() => getSpendingStats(subscriptions), [subscriptions]);
  const newThisMonth = useMemo(
    () => getNewSubscriptionsThisMonth(subscriptions, currentDate),
    [subscriptions, currentDate]
  );

  const handlePreviousMonth = useCallback(() => {
    setCurrentDate((prev) => goToPreviousMonth(prev));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate((prev) => goToNextMonth(prev));
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Trigger haptic feedback at the start of refresh
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await refreshSubscriptions();
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshSubscriptions]);

  const handleDayPress = useCallback((day: CalendarDayType) => {
    setSelectedDay(day);
    setShowDayDetail(true);
  }, []);

  const handleAddSubscription = useCallback(
    async (subscription: Parameters<typeof addSubscription>[0]) => {
      await addSubscription(subscription);
    },
    [addSubscription]
  );

  const handleDeleteSubscription = useCallback(
    async (id: string) => {
      await deleteSubscription(id);
      // Update selected day's subscriptions after delete
      if (selectedDay) {
        setSelectedDay((prev) =>
          prev
            ? {
                ...prev,
                subscriptions: prev.subscriptions.filter((s) => s.id !== id),
              }
            : null
        );
      }
    },
    [deleteSubscription, selectedDay]
  );

  const handleToggleSubscription = useCallback(
    async (id: string) => {
      await toggleSubscription(id);
      // Update selected day's subscriptions after toggle
      if (selectedDay) {
        setSelectedDay((prev) =>
          prev
            ? {
                ...prev,
                subscriptions: prev.subscriptions.map((s) =>
                  s.id === id ? { ...s, isActive: !s.isActive } : s
                ),
              }
            : null
        );
      }
    },
    [toggleSubscription, selectedDay]
  );

  const handleUpdateSubscription = useCallback(
    async (id: string, updates: Partial<Subscription>) => {
      await updateSubscription(id, updates);
      // Update selected day's subscriptions after update
      if (selectedDay) {
        setSelectedDay((prev) =>
          prev
            ? {
                ...prev,
                subscriptions: prev.subscriptions.map((s) =>
                  s.id === id ? { ...s, ...updates } : s
                ),
              }
            : null
        );
      }
    },
    [updateSubscription, selectedDay]
  );

  const handleImportSubscriptions = useCallback(
    async (detectedSubscriptions: DetectedSubscription[]) => {
      // Convert detected subscriptions to the format needed for adding
      const subscriptionsToAdd = detectedSubscriptions.map((sub) => ({
        name: sub.name,
        price: sub.price,
        currency: sub.currency,
        billingCycle: sub.billingCycle,
        billingDay: sub.billingDay,
        startDate: new Date().toISOString(),
        icon: sub.suggestedIcon,
        color: sub.suggestedColor,
        isActive: true,
      }));

      await addSubscriptions(subscriptionsToAdd);

      Alert.alert(
        'Import Complete',
        `Successfully imported ${subscriptionsToAdd.length} subscription${subscriptionsToAdd.length !== 1 ? 's' : ''}.`,
        [{ text: 'OK' }]
      );
    },
    [addSubscriptions]
  );

  const handleSearchSelectSubscription = useCallback(
    (subscription: Subscription) => {
      // Get the next billing date for the selected subscription
      const nextBillingDate = getNextBillingDate(subscription);

      // Navigate to the month containing the billing date
      setCurrentDate(nextBillingDate);

      // Close the search modal
      setShowSearchModal(false);

      // Get the subscriptions for that day to show in detail modal
      const daySubscriptions = getSubscriptionsForDay(nextBillingDate, subscriptions);

      // Create a CalendarDay object for the detail modal
      const calendarDay: CalendarDayType = {
        date: nextBillingDate,
        dayOfMonth: nextBillingDate.getDate(),
        isCurrentMonth: true,
        isToday: false,
        subscriptions: daySubscriptions,
      };

      // Show the day detail modal for the billing day
      setSelectedDay(calendarDay);
      setShowDayDetail(true);

      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [subscriptions]
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surface}
          />
        }
      >
        <View style={styles.card}>
          <CalendarHeader
            currentDate={currentDate}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
            onToday={handleToday}
            onAddPress={() => setShowAddModal(true)}
            onImportPress={() => setShowImportModal(true)}
          />

          <CalendarGrid
            days={calendarDays}
            onDayPress={handleDayPress}
            onSwipeLeft={handleNextMonth}
            onSwipeRight={handlePreviousMonth}
          />

          <CalendarLegend totalSubscriptions={stats.total} newThisMonth={newThisMonth} />

          <StatsSection
            weeklyTotal={spendingStats.weekly}
            monthlyTotal={spendingStats.monthly}
            yearlyTotal={spendingStats.yearly}
          />

          <CalendarFooter
            monthlyTotal={stats.monthlyTotal}
            onSearchPress={() => setShowSearchModal(true)}
          />
        </View>
      </ScrollView>

      <AddSubscriptionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSubscription}
      />

      <DayDetailModal
        visible={showDayDetail}
        day={selectedDay}
        onClose={() => setShowDayDetail(false)}
        onDeleteSubscription={handleDeleteSubscription}
        onToggleSubscription={handleToggleSubscription}
        onUpdateSubscription={handleUpdateSubscription}
      />

      <SearchFilterModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        subscriptions={subscriptions}
        onSelectSubscription={handleSearchSelectSubscription}
      />

      <StatementImportModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportSubscriptions}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    margin: 16,
    overflow: 'hidden',
  },
});
