import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { CalendarDay as CalendarDayType } from '../types';
import { colors } from '../constants';
import {
  CalendarHeader,
  CalendarGrid,
  CalendarLegend,
  CalendarFooter,
  AddSubscriptionModal,
  DayDetailModal,
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
  const [selectedDay, setSelectedDay] = useState<CalendarDayType | null>(null);
  const [showDayDetail, setShowDayDetail] = useState(false);

  const {
    subscriptions,
    isLoading,
    addSubscription,
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
        />

        <CalendarGrid days={calendarDays} onDayPress={handleDayPress} />

        <CalendarLegend totalSubscriptions={stats.total} newThisMonth={0} />

        <CalendarFooter monthlyTotal={stats.monthlyTotal} />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
});
