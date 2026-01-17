import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { CalendarDay as CalendarDayType } from '../types';
import { colors, spacing, fontSize } from '../constants';
import { CalendarDay } from './CalendarDay';

interface CalendarGridProps {
  days: CalendarDayType[];
  onDayPress?: (day: CalendarDayType) => void;
}

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export function CalendarGrid({ days, onDayPress }: CalendarGridProps) {
  const { width: screenWidth } = useWindowDimensions();

  // Calculate cell size based on screen width (7 cells + margins)
  const gridPadding = spacing.sm * 2;
  const cardMargin = 32; // 16 on each side
  const cellMargin = 4; // 2 on each side
  const availableWidth = screenWidth - cardMargin - gridPadding;
  const cellWidth = (availableWidth - (cellMargin * 7)) / 7;
  const cellHeight = cellWidth * 1.1; // Slightly taller than wide for content

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
          <View key={day} style={[styles.weekdayCell, { width: cellWidth + cellMargin }]}>
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
              cellHeight={cellHeight}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.sm,
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekdayCell: {
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
    flexDirection: 'row',
  },
});
