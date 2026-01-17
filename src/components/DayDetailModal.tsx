import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { CalendarDay, Subscription } from '../types';
import { colors, spacing, borderRadius, fontSize } from '../constants';
import { ServiceIcon } from './ServiceIcon';
import { formatCurrency } from '../utils';

interface DayDetailModalProps {
  visible: boolean;
  day: CalendarDay | null;
  onClose: () => void;
  onDeleteSubscription: (id: string) => void;
  onToggleSubscription: (id: string) => void;
}

export function DayDetailModal({
  visible,
  day,
  onClose,
  onDeleteSubscription,
  onToggleSubscription,
}: DayDetailModalProps) {
  if (!day) return null;

  const { date, subscriptions } = day;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{format(date, 'EEEE, MMMM d')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {subscriptions.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>No subscriptions due on this day</Text>
              </View>
            ) : (
              subscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onDelete={() => onDeleteSubscription(subscription.id)}
                  onToggle={() => onToggleSubscription(subscription.id)}
                />
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

interface SubscriptionCardProps {
  subscription: Subscription;
  onDelete: () => void;
  onToggle: () => void;
}

function SubscriptionCard({ subscription, onDelete, onToggle }: SubscriptionCardProps) {
  const { name, price, currency, billingCycle, icon, isActive } = subscription;

  return (
    <View style={[styles.card, !isActive && styles.cardInactive]}>
      <View style={styles.cardLeft}>
        <ServiceIcon service={icon} size={44} />
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, !isActive && styles.textInactive]}>{name}</Text>
          <View style={styles.cardMeta}>
            <View
              style={[
                styles.cycleBadge,
                billingCycle === 'monthly' ? styles.monthlyBadge : styles.yearlyBadge,
              ]}
            >
              <Text style={styles.cycleBadgeText}>
                {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
              </Text>
            </View>
            <Text style={styles.cardPrice}>
              {formatCurrency(price, currency)}
              {billingCycle === 'yearly' ? '/yr' : '/mo'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onToggle}>
          <Ionicons
            name={isActive ? 'pause-circle-outline' : 'play-circle-outline'}
            size={24}
            color={isActive ? colors.warning : colors.success}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={22} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
    minHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardInactive: {
    opacity: 0.6,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  cardName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  textInactive: {
    textDecorationLine: 'line-through',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cycleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  monthlyBadge: {
    backgroundColor: `${colors.monthly}33`,
  },
  yearlyBadge: {
    backgroundColor: `${colors.yearly}33`,
  },
  cycleBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
  },
  cardPrice: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.xs,
  },
});
