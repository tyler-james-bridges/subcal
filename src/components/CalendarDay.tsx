import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CalendarDay as CalendarDayType } from '../types';
import { colors, spacing, borderRadius, fontSize } from '../constants';
import { ServiceIcon } from './ServiceIcon';
import { isInTrialPeriod, lightHaptic } from '../utils';

interface CalendarDayProps {
  day: CalendarDayType;
  onPress?: (day: CalendarDayType) => void;
  cellHeight?: number;
}

export function CalendarDay({ day, onPress, cellHeight }: CalendarDayProps) {
  const { date, dayOfMonth, isCurrentMonth, isToday, subscriptions } = day;

  const hasMonthly = subscriptions.some((s) => s.billingCycle === 'monthly');
  const hasYearly = subscriptions.some((s) => s.billingCycle === 'yearly');
  const hasTrial = subscriptions.some((s) => isInTrialPeriod(s));
  const displaySubscription = subscriptions[0];

  const handlePress = () => {
    lightHaptic();
    onPress?.(day);
  };

  const monthName = date.toLocaleDateString('en-US', { month: 'long' });
  const subCount = subscriptions.length;
  const subText = subCount === 0 ? 'no subscriptions' : `${subCount} subscription${subCount > 1 ? 's' : ''}`;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        cellHeight ? { height: cellHeight } : null,
        isToday && styles.todayContainer,
        !isCurrentMonth && styles.otherMonth,
        hasTrial && styles.trialContainer,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={`${monthName} ${dayOfMonth}, ${subText}`}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.dayNumber,
            isToday && styles.todayText,
            !isCurrentMonth && styles.otherMonthText,
          ]}
        >
          {dayOfMonth}
        </Text>
        {(hasMonthly || hasYearly || hasTrial) && (
          <View style={styles.indicators}>
            {hasTrial && <View style={[styles.indicator, styles.trialIndicator]} />}
            {hasMonthly && <View style={[styles.indicator, styles.monthlyIndicator]} />}
            {hasYearly && <View style={[styles.indicator, styles.yearlyIndicator]} />}
          </View>
        )}
      </View>

      {displaySubscription && (
        <View style={styles.subscriptionContainer}>
          <ServiceIcon service={displaySubscription.icon} size={28} />
          {subscriptions.length > 1 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>+{subscriptions.length - 1}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 2,
    padding: spacing.xs,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
  },
  todayContainer: {
    backgroundColor: colors.todayBackground,
    borderWidth: 1,
    borderColor: colors.today,
  },
  otherMonth: {
    backgroundColor: colors.surface,
    opacity: 0.5,
  },
  trialContainer: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.trial,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dayNumber: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
  },
  todayText: {
    color: colors.today,
    fontWeight: '700',
  },
  otherMonthText: {
    color: colors.textMuted,
  },
  indicators: {
    flexDirection: 'row',
    gap: 2,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  trialIndicator: {
    backgroundColor: colors.trial,
  },
  monthlyIndicator: {
    backgroundColor: colors.monthly,
  },
  yearlyIndicator: {
    backgroundColor: colors.yearly,
  },
  subscriptionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
  },
});
