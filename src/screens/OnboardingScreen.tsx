import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../constants';

interface OnboardingScreenProps {
  onComplete: (loadSampleData: boolean) => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.content}>
        {/* Icon/Logo Area */}
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="calendar" size={64} color={colors.primary} />
          </View>
        </View>

        {/* Welcome Text */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to SubCal</Text>
          <Text style={styles.subtitle}>
            Track your subscriptions, visualize your spending, and never miss a billing date.
          </Text>
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureRow}>
            <View style={[styles.featureDot, { backgroundColor: colors.monthly }]} />
            <Text style={styles.featureText}>Calendar view of all billing dates</Text>
          </View>
          <View style={styles.featureRow}>
            <View style={[styles.featureDot, { backgroundColor: colors.yearly }]} />
            <Text style={styles.featureText}>Track monthly and yearly subscriptions</Text>
          </View>
          <View style={styles.featureRow}>
            <View style={[styles.featureDot, { backgroundColor: colors.trial }]} />
            <Text style={styles.featureText}>Free trial expiration reminders</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => onComplete(false)}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.text} />
            <Text style={styles.primaryButtonText}>Start Fresh</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => onComplete(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="eye-outline" size={24} color={colors.secondary} />
            <Text style={styles.secondaryButtonText}>See Demo Data</Text>
          </TouchableOpacity>
        </View>

        {/* Footer hint */}
        <Text style={styles.footerHint}>
          You can always add or remove subscriptions later
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: spacing.xxl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  featuresContainer: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  featureDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
  },
  featureText: {
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primaryButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  secondaryButton: {
    backgroundColor: colors.cardBackground,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  secondaryButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.secondary,
  },
  footerHint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
});
