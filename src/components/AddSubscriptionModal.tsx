import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceIcon as ServiceIconType, BillingCycle } from '../types';
import { colors, spacing, borderRadius, fontSize, availableServices, serviceConfigs } from '../constants';
import { ServiceIcon } from './ServiceIcon';

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
  }) => void;
}

export function AddSubscriptionModal({ visible, onClose, onAdd }: AddSubscriptionModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [billingDay, setBillingDay] = useState('1');
  const [selectedService, setSelectedService] = useState<ServiceIconType>('custom');

  const handleAdd = () => {
    if (!name.trim() || !price.trim()) return;

    const config = serviceConfigs[selectedService];
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
    });

    // Reset form
    setName('');
    setPrice('');
    setBillingCycle('monthly');
    setBillingDay('1');
    setSelectedService('custom');
    onClose();
  };

  const handleServiceSelect = (service: ServiceIconType) => {
    setSelectedService(service);
    if (service !== 'custom') {
      setName(serviceConfigs[service].name);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Subscription</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

            {/* Billing Cycle */}
            <Text style={styles.label}>Billing Cycle</Text>
            <View style={styles.cycleContainer}>
              <TouchableOpacity
                style={[
                  styles.cycleOption,
                  billingCycle === 'monthly' && styles.cycleOptionSelected,
                ]}
                onPress={() => setBillingCycle('monthly')}
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
                onPress={() => setBillingCycle('yearly')}
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

          {/* Add Button */}
          <TouchableOpacity
            style={[styles.addButton, (!name.trim() || !price.trim()) && styles.addButtonDisabled]}
            onPress={handleAdd}
            disabled={!name.trim() || !price.trim()}
          >
            <Text style={styles.addButtonText}>Add Subscription</Text>
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
