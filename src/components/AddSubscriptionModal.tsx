import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceIcon as ServiceIconType, BillingCycle, Subscription } from '../types';
import { colors, spacing, borderRadius, fontSize, availableServices, serviceConfigs } from '../constants';
import { ServiceIcon } from './ServiceIcon';
import { lightHaptic, parseNaturalLanguageSubscription, isNaturalLanguageInput } from '../utils';
import { addDays, format, differenceInDays } from 'date-fns';

interface AddSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (subscription: {
    name: string;
    price: number;
    currency: string;
    billingCycle: BillingCycle;
    billingDay: number;
    startDate: string;
    icon: ServiceIconType;
    color: string;
    isActive: boolean;
    trialEndDate?: string;
  }) => void;
  /** Optional subscription to edit - when provided, modal works in edit mode */
  subscription?: Subscription;
  /** Callback for updating an existing subscription */
  onUpdate?: (id: string, updates: Partial<Subscription>) => void;
}

export function AddSubscriptionModal({
  visible,
  onClose,
  onAdd,
  subscription,
  onUpdate,
}: AddSubscriptionModalProps) {
  const isEditMode = !!subscription;
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [billingDay, setBillingDay] = useState('1');
  const [selectedService, setSelectedService] = useState<ServiceIconType>('custom');
  const [quickInput, setQuickInput] = useState('');
  const [hasTrial, setHasTrial] = useState(false);
  const [trialDays, setTrialDays] = useState('7');

  // Pre-populate form when editing, or reset when modal closes
  useEffect(() => {
    if (visible && subscription) {
      // Edit mode: pre-populate with existing subscription data
      setName(subscription.name);
      setPrice(subscription.price.toString());
      setBillingCycle(subscription.billingCycle);
      setBillingDay(subscription.billingDay.toString());
      setSelectedService(subscription.icon);
      setQuickInput('');

      // Handle trial end date
      if (subscription.trialEndDate) {
        setHasTrial(true);
        const daysRemaining = differenceInDays(new Date(subscription.trialEndDate), new Date());
        setTrialDays(Math.max(1, daysRemaining).toString());
      } else {
        setHasTrial(false);
        setTrialDays('7');
      }
    } else if (!visible) {
      // Reset form when modal closes
      setName('');
      setPrice('');
      setBillingCycle('monthly');
      setBillingDay('1');
      setSelectedService('custom');
      setQuickInput('');
      setHasTrial(false);
      setTrialDays('7');
    }
  }, [visible, subscription]);

  // Parse natural language input
  useEffect(() => {
    if (quickInput && isNaturalLanguageInput(quickInput)) {
      const parsed = parseNaturalLanguageSubscription(quickInput);
      if (parsed.name) setName(parsed.name);
      if (parsed.price) setPrice(parsed.price.toString());
      if (parsed.billingCycle) setBillingCycle(parsed.billingCycle);
      if (parsed.billingDay) setBillingDay(parsed.billingDay.toString());
      if (parsed.icon) {
        setSelectedService(parsed.icon);
      }
      Keyboard.dismiss();
    }
  }, [quickInput]);

  const handleSubmit = () => {
    if (!name.trim() || !price.trim()) return;

    lightHaptic();
    const config = serviceConfigs[selectedService];
    const trialEndDate = hasTrial
      ? addDays(new Date(), parseInt(trialDays, 10) || 7).toISOString()
      : undefined;

    if (isEditMode && subscription && onUpdate) {
      // Update existing subscription
      onUpdate(subscription.id, {
        name: name.trim(),
        price: parseFloat(price),
        billingCycle,
        billingDay: parseInt(billingDay, 10) || 1,
        icon: selectedService,
        color: config.color,
        trialEndDate,
      });
    } else {
      // Add new subscription
      onAdd({
        name: name.trim(),
        price: parseFloat(price),
        currency: 'USD',
        billingCycle,
        billingDay: parseInt(billingDay, 10) || 1,
        startDate: new Date().toISOString(),
        icon: selectedService,
        color: config.color,
        isActive: true,
        trialEndDate,
      });
    }

    // Reset form
    setName('');
    setPrice('');
    setBillingCycle('monthly');
    setBillingDay('1');
    setSelectedService('custom');
    setQuickInput('');
    setHasTrial(false);
    setTrialDays('7');
    onClose();
  };

  const handleServiceSelect = (service: ServiceIconType) => {
    lightHaptic();
    setSelectedService(service);
    if (service !== 'custom') {
      setName(serviceConfigs[service].name);
    }
  };

  const handleCycleChange = (cycle: BillingCycle) => {
    lightHaptic();
    setBillingCycle(cycle);
  };

  const trialEndDatePreview = hasTrial
    ? format(addDays(new Date(), parseInt(trialDays, 10) || 7), 'MMM d, yyyy')
    : null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{isEditMode ? 'Edit Subscription' : 'Add Subscription'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityLabel="Close">
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Quick Natural Language Input - only show when adding */}
            {!isEditMode && (
              <>
                <Text style={styles.label}>Quick Add</Text>
                <TextInput
                  style={styles.input}
                  value={quickInput}
                  onChangeText={setQuickInput}
                  placeholder='e.g., "Netflix $15.99 monthly on the 15th"'
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={styles.hint}>
                  Type naturally and we will fill in the details below
                </Text>
              </>
            )}

            {/* Service Selection */}
            <Text style={styles.label}>Service</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.serviceList}>
              {availableServices.map((service) => (
                <TouchableOpacity
                  key={service}
                  style={[
                    styles.serviceOption,
                    selectedService === service && styles.serviceOptionSelected,
                  ]}
                  onPress={() => handleServiceSelect(service)}
                >
                  <ServiceIcon service={service} size={36} />
                  <Text style={styles.serviceName}>{serviceConfigs[service].name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Name Input */}
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Subscription name"
              placeholderTextColor={colors.textMuted}
            />

            {/* Price Input */}
            <Text style={styles.label}>Price</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />

            {/* Free Trial Toggle */}
            <View style={styles.trialRow}>
              <View style={styles.trialLabelContainer}>
                <Text style={styles.label}>Free Trial</Text>
                <Text style={styles.trialHint}>Track when your trial ends</Text>
              </View>
              <Switch
                value={hasTrial}
                onValueChange={(value) => {
                  lightHaptic();
                  setHasTrial(value);
                }}
                trackColor={{ false: colors.surface, true: colors.trial }}
                thumbColor={colors.text}
              />
            </View>

            {hasTrial && (
              <View style={styles.trialDaysContainer}>
                <Text style={styles.label}>Trial Length (days)</Text>
                <View style={styles.trialDaysRow}>
                  {['7', '14', '30'].map((days) => (
                    <TouchableOpacity
                      key={days}
                      style={[
                        styles.trialDayOption,
                        trialDays === days && styles.trialDayOptionSelected,
                      ]}
                      onPress={() => {
                        lightHaptic();
                        setTrialDays(days);
                      }}
                    >
                      <Text
                        style={[
                          styles.trialDayText,
                          trialDays === days && styles.trialDayTextSelected,
                        ]}
                      >
                        {days}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TextInput
                    style={[styles.trialDaysInput]}
                    value={trialDays}
                    onChangeText={setTrialDays}
                    keyboardType="number-pad"
                    placeholder="Custom"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                {trialEndDatePreview && (
                  <Text style={styles.trialEndPreview}>
                    Trial ends: {trialEndDatePreview}
                  </Text>
                )}
              </View>
            )}

            {/* Billing Cycle */}
            <Text style={styles.label}>Billing Cycle</Text>
            <View style={styles.cycleContainer}>
              <TouchableOpacity
                style={[
                  styles.cycleOption,
                  billingCycle === 'monthly' && styles.cycleOptionSelected,
                ]}
                onPress={() => handleCycleChange('monthly')}
              >
                <View style={[styles.cycleDot, styles.monthlyDot]} />
                <Text
                  style={[
                    styles.cycleText,
                    billingCycle === 'monthly' && styles.cycleTextSelected,
                  ]}
                >
                  Monthly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.cycleOption,
                  billingCycle === 'yearly' && styles.cycleOptionSelected,
                ]}
                onPress={() => handleCycleChange('yearly')}
              >
                <View style={[styles.cycleDot, styles.yearlyDot]} />
                <Text
                  style={[
                    styles.cycleText,
                    billingCycle === 'yearly' && styles.cycleTextSelected,
                  ]}
                >
                  Yearly
                </Text>
              </TouchableOpacity>
            </View>

            {/* Billing Day */}
            <Text style={styles.label}>
              {billingCycle === 'monthly' ? 'Billing Day (1-31)' : 'Billing Day of Year (1-31)'}
            </Text>
            <TextInput
              style={styles.input}
              value={billingDay}
              onChangeText={setBillingDay}
              placeholder="1"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
            />
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.addButton, (!name.trim() || !price.trim()) && styles.addButtonDisabled]}
            onPress={handleSubmit}
            disabled={!name.trim() || !price.trim()}
          >
            <Text style={styles.addButtonText}>
              {isEditMode ? 'Save Changes' : 'Add Subscription'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
    maxHeight: '90%',
    paddingBottom: spacing.xl,
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
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  serviceList: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  serviceOption: {
    alignItems: 'center',
    padding: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    minWidth: 70,
  },
  serviceOptionSelected: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  serviceName: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  trialLabelContainer: {
    flex: 1,
  },
  trialHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  trialDaysContainer: {
    marginTop: spacing.sm,
  },
  trialDaysRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  trialDayOption: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  trialDayOptionSelected: {
    borderColor: colors.trial,
    backgroundColor: `${colors.trial}22`,
  },
  trialDayText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  trialDayTextSelected: {
    color: colors.trial,
    fontWeight: '600',
  },
  trialDaysInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
  },
  trialEndPreview: {
    fontSize: fontSize.sm,
    color: colors.trial,
    marginTop: spacing.sm,
    fontWeight: '500',
  },
  cycleContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cycleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cycleOptionSelected: {
    borderColor: colors.primary,
  },
  cycleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  monthlyDot: {
    backgroundColor: colors.monthly,
  },
  yearlyDot: {
    backgroundColor: colors.yearly,
  },
  cycleText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  cycleTextSelected: {
    color: colors.text,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: colors.primary,
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
});
