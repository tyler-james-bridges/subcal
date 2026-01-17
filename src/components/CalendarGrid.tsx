import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CalendarDay as CalendarDayType } from '../types';
import { colors, spacing, fontSize } from '../constants';
import { CalendarDay } from './CalendarDay';

interface CalendarGridProps {
  days: CalendarDayType[];
  onDayPress?: (day: CalendarDayType) => void;
}

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export function CalendarGrid({ days, onDayPress }: CalendarGridProps) {
  // Group days into weeks (7 days per row)
  const weeks: CalendarDayType[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <View style={styles.container}>
      {/* Weekday headers */}
      <View style={styles.weekdayHeader}>
        {WEEKDAYS.map((day) => (
          <View key={day} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar days */}
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {week.map((day, dayIndex) => (
            <CalendarDay
              key={`${weekIndex}-${dayIndex}`}
              day={day}
              onPress={onDayPress}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.sm,
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  weekdayText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  weekRow: {
    flex: 1,
    flexDirection: 'row',
  },
});
