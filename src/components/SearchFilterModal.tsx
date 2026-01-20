import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../constants';
import { Subscription, BillingCycle } from '../types';
import { ServiceIcon } from './ServiceIcon';
import { formatCurrency, getDaysUntilRenewal } from '../utils';

interface SearchFilterModalProps {
  visible: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
  onSelectSubscription?: (subscription: Subscription) => void;
}

type FilterType = 'all' | 'monthly' | 'yearly' | 'active' | 'inactive';

const FILTER_OPTIONS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
];

export function SearchFilterModal({
  visible,
  onClose,
  subscriptions,
  onSelectSubscription,
}: SearchFilterModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredSubscriptions = useMemo(() => {
    let filtered = subscriptions;

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (sub) =>
          sub.name.toLowerCase().includes(query) ||
          sub.icon.toLowerCase().includes(query)
      );
    }

    // Apply filter
    switch (activeFilter) {
      case 'monthly':
        filtered = filtered.filter((sub) => sub.billingCycle === 'monthly');
        break;
      case 'yearly':
        filtered = filtered.filter((sub) => sub.billingCycle === 'yearly');
        break;
      case 'active':
        filtered = filtered.filter((sub) => sub.isActive);
        break;
      case 'inactive':
        filtered = filtered.filter((sub) => !sub.isActive);
        break;
    }

    // Sort by name
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [subscriptions, searchQuery, activeFilter]);

  const totalFiltered = useMemo(() => {
    return filteredSubscriptions
      .filter((sub) => sub.isActive)
      .reduce((sum, sub) => {
        const amount = sub.billingCycle === 'yearly' ? sub.price / 12 : sub.price;
        return sum + amount;
      }, 0);
  }, [filteredSubscriptions]);

  const handleClose = () => {
    setSearchQuery('');
    setActiveFilter('all');
    onClose();
  };

  const renderSubscription = ({ item }: { item: Subscription }) => {
    const daysUntilRenewal = getDaysUntilRenewal(item);
    const renewalText = daysUntilRenewal !== null
      ? daysUntilRenewal === 0
        ? 'Renews today'
        : daysUntilRenewal === 1
          ? 'Renews in 1 day'
          : `Renews in ${daysUntilRenewal} days`
      : null;

    return (
      <TouchableOpacity
        style={[styles.subscriptionItem, !item.isActive && styles.inactiveItem]}
        onPress={() => onSelectSubscription?.(item)}
        activeOpacity={0.7}
      >
        <ServiceIcon service={item.icon} size={36} />
        <View style={styles.subscriptionInfo}>
          <Text style={styles.subscriptionName}>{item.name}</Text>
          <Text style={styles.subscriptionMeta}>
            {formatCurrency(item.price)} / {item.billingCycle === 'monthly' ? 'mo' : 'yr'}
            {!item.isActive && ' • Paused'}
          </Text>
          {renewalText && <Text style={styles.renewalText}>{renewalText}</Text>}
        </View>
        <View style={styles.billingBadge}>
        <View
          style={[
            styles.billingDot,
            item.billingCycle === 'monthly'
              ? styles.monthlyDot
              : styles.yearlyDot,
          ]}
        />
      </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Search Subscriptions</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterContainer}>
          {FILTER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterPill,
                activeFilter === option.key && styles.filterPillActive,
              ]}
              onPress={() => setActiveFilter(option.key)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  activeFilter === option.key && styles.filterPillTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredSubscriptions.length} subscription
            {filteredSubscriptions.length !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.resultsTotal}>
            {formatCurrency(totalFiltered)}/mo
          </Text>
        </View>

        {/* Results List */}
        <FlatList
          data={filteredSubscriptions}
          renderItem={renderSubscription}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No subscriptions found</Text>
            </View>
          }
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
  },
  filterPillText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    color: colors.text,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  resultsCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  resultsTotal: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  subscriptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  inactiveItem: {
    opacity: 0.5,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  subscriptionMeta: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  renewalText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  billingBadge: {
    padding: spacing.xs,
  },
  billingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  monthlyDot: {
    backgroundColor: colors.monthly,
  },
  yearlyDot: {
    backgroundColor: colors.yearly,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    gap: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
});
