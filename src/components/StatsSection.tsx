import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../constants';
import { formatCurrency } from '../utils';

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface StatsSectionProps {
  weeklyTotal: number;
  monthlyTotal: number;
  yearlyTotal: number;
  currency?: string;
}

export function StatsSection({
  weeklyTotal,
  monthlyTotal,
  yearlyTotal,
  currency = 'USD',
}: StatsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleExpanded = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);

    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, rotateAnim]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Toggle spending stats"
        accessibilityState={{ expanded: isExpanded }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerLabel}>SPENDING OVERVIEW</Text>
          <Text style={styles.headerAmount}>
            {formatCurrency(monthlyTotal, currency)}/mo
          </Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
          <Ionicons
            name="chevron-down"
            size={20}
            color={colors.textSecondary}
          />
        </Animated.View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>THIS WEEK</Text>
              <Text style={styles.statAmount}>
                {formatCurrency(weeklyTotal, currency)}
              </Text>
            </View>
            <View style={[styles.statItem, styles.statItemCenter]}>
              <Text style={styles.statLabel}>THIS MONTH</Text>
              <Text style={[styles.statAmount, styles.statAmountHighlight]}>
                {formatCurrency(monthlyTotal, currency)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>THIS YEAR</Text>
              <Text style={styles.statAmount}>
                {formatCurrency(yearlyTotal, currency)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  headerAmount: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  statsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemCenter: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  statAmount: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  statAmountHighlight: {
    color: colors.primary,
  },
});
