import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../constants';
import { formatCurrency } from '../utils';

interface CalendarFooterProps {
  monthlyTotal: number;
  currency?: string;
  onSearchPress?: () => void;
}

export function CalendarFooter({
  monthlyTotal,
  currency = 'USD',
  onSearchPress,
}: CalendarFooterProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tools}>
        <TouchableOpacity style={styles.toolButton} onPress={onSearchPress}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>MONTHLY TOTAL:</Text>
        <Text style={styles.totalAmount}>{formatCurrency(monthlyTotal, currency)}</Text>
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
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tools: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  toolButton: {
    padding: spacing.xs,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  totalLabel: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
});
