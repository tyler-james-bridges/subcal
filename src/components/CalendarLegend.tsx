import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../constants';

interface CalendarLegendProps {
  totalSubscriptions: number;
  newThisMonth: number;
}

export function CalendarLegend({ totalSubscriptions, newThisMonth }: CalendarLegendProps) {
  return (
    <View style={styles.container}>
      <View style={styles.indicators}>
        <View style={styles.indicator}>
          <View style={[styles.dot, styles.monthlyDot]} />
          <Text style={styles.indicatorText}>MONTHLY</Text>
        </View>
        <View style={styles.indicator}>
          <View style={[styles.dot, styles.yearlyDot]} />
          <Text style={styles.indicatorText}>YEARLY</Text>
        </View>
      </View>
      <View style={styles.stats}>
        <Text style={styles.statsText}>
          <Text style={styles.statsNumber}>{totalSubscriptions}</Text>
          {' '}SUBSCRIPTIONS
          {newThisMonth > 0 && (
            <>
              {' / '}
              <Text style={styles.statsNumber}>{newThisMonth}</Text>
              {' '}NEW
            </>
          )}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  indicators: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  monthlyDot: {
    backgroundColor: colors.monthly,
  },
  yearlyDot: {
    backgroundColor: colors.yearly,
  },
  indicatorText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  stats: {
    flexDirection: 'row',
  },
  statsText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  statsNumber: {
    fontWeight: '700',
    color: colors.text,
  },
});
