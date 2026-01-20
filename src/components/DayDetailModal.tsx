import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { CalendarDay, Subscription } from '../types';
import { colors, spacing, borderRadius, fontSize } from '../constants';
import { ServiceIcon } from './ServiceIcon';
import { formatCurrency, getTrialDaysRemaining, mediumHaptic } from '../utils';
import { AddSubscriptionModal } from './AddSubscriptionModal';

interface DayDetailModalProps {
  visible: boolean;
  day: CalendarDay | null;
  onClose: () => void;
  onDeleteSubscription: (id: string) => void;
  onToggleSubscription: (id: string) => void;
  onUpdateSubscription: (id: string, updates: Partial<Subscription>) => void;
}

export function DayDetailModal({
  visible,
  day,
  onClose,
  onDeleteSubscription,
  onToggleSubscription,
  onUpdateSubscription,
}: DayDetailModalProps) {
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  if (!day) return null;

  const { date, subscriptions } = day;

  const handleDelete = (id: string) => {
    mediumHaptic();
    onDeleteSubscription(id);
  };

  const handleToggle = (id: string) => {
    mediumHaptic();
    onToggleSubscription(id);
  };

  const handleEdit = (subscription: Subscription) => {
    mediumHaptic();
    setEditingSubscription(subscription);
  };

  const handleEditClose = () => {
    setEditingSubscription(null);
  };

  const handleUpdate = (id: string, updates: Partial<Subscription>) => {
    onUpdateSubscription(id, updates);
    setEditingSubscription(null);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <View style={styles.handle} />
              <View style={styles.header}>
                <Text style={styles.title}>{format(date, 'EEEE, MMMM d')}</Text>
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
                      onDelete={() => handleDelete(subscription.id)}
                      onToggle={() => handleToggle(subscription.id)}
                      onEdit={() => handleEdit(subscription)}
                    />
                  ))
                )}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {/* Edit Subscription Modal */}
      <AddSubscriptionModal
        visible={!!editingSubscription}
        onClose={handleEditClose}
        onAdd={() => {}} // Not used in edit mode
        subscription={editingSubscription ?? undefined}
        onUpdate={handleUpdate}
      />
    </Modal>
  );
}

interface SubscriptionCardProps {
  subscription: Subscription;
  onDelete: () => void;
  onToggle: () => void;
  onEdit: () => void;
}

function SubscriptionCard({ subscription, onDelete, onToggle, onEdit }: SubscriptionCardProps) {
  const { name, price, currency, billingCycle, icon, isActive, trialEndDate } = subscription;
  const trialDaysRemaining = getTrialDaysRemaining(trialEndDate);

  return (
    <View style={[styles.card, !isActive && styles.cardInactive]}>
      <View style={styles.cardLeft}>
        <ServiceIcon service={icon} size={44} />
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, !isActive && styles.textInactive]}>{name}</Text>
          {trialDaysRemaining !== null && (
            <View style={styles.trialBanner}>
              <Ionicons name="time-outline" size={12} color={colors.trial} />
              <Text style={styles.trialText}>
                {trialDaysRemaining === 0
                  ? 'Trial ends today!'
                  : trialDaysRemaining === 1
                    ? 'Trial ends in 1 day'
                    : `Trial ends in ${trialDaysRemaining} days`}
              </Text>
            </View>
          )}
          <View style={styles.cardMeta}>
            <View
              style={[
                styles.cycleBadge,
                trialDaysRemaining !== null
                  ? styles.trialBadge
                  : billingCycle === 'monthly'
                    ? styles.monthlyBadge
                    : styles.yearlyBadge,
              ]}
            >
              <Text style={styles.cycleBadgeText}>
                {trialDaysRemaining !== null
                  ? 'Trial'
                  : billingCycle === 'monthly'
                    ? 'Monthly'
                    : 'Yearly'}
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
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onEdit}
          accessibilityLabel="Edit subscription"
        >
          <Ionicons name="pencil-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
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
    maxHeight: '60%',
  },
  handle: {
    width: 36,
    height: 5,
    backgroundColor: colors.textMuted,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
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
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.xs,
  },
  trialText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.trial,
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
  trialBadge: {
    backgroundColor: `${colors.trial}33`,
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
