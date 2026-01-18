import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../constants';
import { formatMonthYear } from '../utils';

interface CalendarHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onAddPress: () => void;
  onImportPress: () => void;
}

export function CalendarHeader({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
  onAddPress,
  onImportPress,
}: CalendarHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.monthText}>{formatMonthYear(currentDate)}</Text>
        <TouchableOpacity style={styles.todayButton} onPress={onToday}>
          <Text style={styles.todayText}>Today</Text>
        </TouchableOpacity>
        <View style={styles.navButtons}>
          <TouchableOpacity style={styles.navButton} onPress={onPreviousMonth} accessibilityLabel="Previous month">
            <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={onNextMonth} accessibilityLabel="Next month">
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.importButton} onPress={onImportPress}>
          <Ionicons name="document-text" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={onAddPress} accessibilityLabel="Add subscription">
          <Ionicons name="add" size={24} color={colors.text} />
        </TouchableOpacity>
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
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  monthText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  todayButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
  },
  todayText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  navButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  navButton: {
    padding: spacing.xs,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  importButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
