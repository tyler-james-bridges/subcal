import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { CalendarDay as CalendarDayType, DetectedSubscription } from '../types';
import { colors } from '../constants';
import {
  CalendarHeader,
  CalendarGrid,
  CalendarLegend,
  CalendarFooter,
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
} from '../utils';

export function HomeScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<CalendarDayType | null>(null);
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const {
    subscriptions,
    isLoading,
    addSubscription,
    addSubscriptions,
    deleteSubscription,
    toggleSubscription,
  } = useSubscriptions();

  const calendarDays = useMemo(
    () => getCalendarDays(currentDate, subscriptions),
    [currentDate, subscriptions]
  );

  const stats = useMemo(() => getSubscriptionStats(subscriptions), [subscriptions]);

  const handlePreviousMonth = useCallback(() => {
    setCurrentDate((prev) => goToPreviousMonth(prev));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate((prev) => goToNextMonth(prev));
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

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
      <View style={styles.card}>
        <CalendarHeader
          currentDate={currentDate}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
          onAddPress={() => setShowAddModal(true)}
          onImportPress={() => setShowImportModal(true)}
        />

        <CalendarGrid days={calendarDays} onDayPress={handleDayPress} />

        <CalendarLegend totalSubscriptions={stats.total} newThisMonth={0} />

        <CalendarFooter
          monthlyTotal={stats.monthlyTotal}
          onSearchPress={() => setShowSearchModal(true)}
        />
      </View>

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
      />

      <SearchFilterModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        subscriptions={subscriptions}
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
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    margin: 16,
    overflow: 'hidden',
  },
});
