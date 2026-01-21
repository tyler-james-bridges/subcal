import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { CalendarDay as CalendarDayType } from '../types';
import { colors, spacing, fontSize } from '../constants';
import { CalendarDay } from './CalendarDay';
import { lightHaptic } from '../utils/haptics';

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 0.3;

interface CalendarGridProps {
  days: CalendarDayType[];
  onDayPress?: (day: CalendarDayType) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export function CalendarGrid({
  days,
  onDayPress,
  onSwipeLeft,
  onSwipeRight,
}: CalendarGridProps) {
  const { width: screenWidth } = useWindowDimensions();
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Store callbacks in refs so panResponder always has fresh references
  const onSwipeLeftRef = useRef(onSwipeLeft);
  const onSwipeRightRef = useRef(onSwipeRight);
  onSwipeLeftRef.current = onSwipeLeft;
  onSwipeRightRef.current = onSwipeRight;

  // Calculate cell size based on screen width (7 cells + margins)
  const gridPadding = spacing.sm * 2;
  const cardMargin = 32; // 16 on each side
  const cellMargin = 4; // 2 on each side
  const availableWidth = screenWidth - cardMargin - gridPadding;
  const cellWidth = (availableWidth - cellMargin * 7) / 7;
  const cellHeight = cellWidth * 1.1; // Slightly taller than wide for content

  // Group days into weeks (7 days per row)
  const weeks: CalendarDayType[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const animateTransition = useCallback(
    (direction: 'left' | 'right', onComplete: () => void) => {
      const toValue = direction === 'left' ? -screenWidth : screenWidth;

      // Slide out
      Animated.parallel([
        Animated.timing(translateX, {
          toValue,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Reset position to opposite side instantly
        translateX.setValue(-toValue);
        onComplete();

        // Slide in
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    },
    [screenWidth, translateX, opacity]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes
        return (
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > 10
        );
      },
      onPanResponderMove: (_, gestureState) => {
        // Follow finger with resistance
        translateX.setValue(gestureState.dx * 0.5);
        // Fade based on swipe distance
        const fadeAmount = Math.min(Math.abs(gestureState.dx) / 200, 0.3);
        opacity.setValue(1 - fadeAmount);
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState;

        // Check if swipe exceeded threshold
        if (
          dx < -SWIPE_THRESHOLD ||
          (dx < 0 && vx < -SWIPE_VELOCITY_THRESHOLD)
        ) {
          // Swipe left - next month
          lightHaptic();
          animateTransition('left', () => {
            onSwipeLeftRef.current?.();
          });
        } else if (
          dx > SWIPE_THRESHOLD ||
          (dx > 0 && vx > SWIPE_VELOCITY_THRESHOLD)
        ) {
          // Swipe right - previous month
          lightHaptic();
          animateTransition('right', () => {
            onSwipeRightRef.current?.();
          });
        } else {
          // Spring back to original position
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 100,
              friction: 10,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
      onPanResponderTerminate: () => {
        // Reset if gesture is cancelled
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX }],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Weekday headers */}
      <View style={styles.weekdayHeader}>
        {WEEKDAYS.map((day) => (
          <View
            key={day}
            style={[styles.weekdayCell, { width: cellWidth + cellMargin }]}
          >
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
    </Animated.View>
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
