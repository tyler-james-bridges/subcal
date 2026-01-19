import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback utilities for subtle, Apple-style polish
 */

// Light haptic for navigation/selection (day tap, month change, add button)
export function lightHaptic() {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } else {
    Haptics.selectionAsync();
  }
}

// Medium haptic for destructive/important actions (delete, toggle)
export function mediumHaptic() {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } else {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

// Success haptic for completed actions
export function successHaptic() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

// Error haptic for failed/error states
export function errorHaptic() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

// Selection haptic for subtle feedback (pull-to-refresh threshold)
export function selectionHaptic() {
  Haptics.selectionAsync();
}
