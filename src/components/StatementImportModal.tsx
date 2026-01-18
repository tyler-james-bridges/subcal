import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { colors, spacing, borderRadius, fontSize, serviceConfigs } from '../constants';
import { DetectedSubscription, StatementParseResult } from '../types';
import { ServiceIcon } from './ServiceIcon';
import {
  parseStatementWithAI,
  readFileAsText,
  parseCSVStatement,
  parseStatementLocally,
} from '../services/statementParser';

interface StatementImportModalProps {
  visible: boolean;
  onClose: () => void;
  onImport: (subscriptions: DetectedSubscription[]) => void;
}

type ImportStep = 'upload' | 'parsing' | 'preview';

export function StatementImportModal({
  visible,
  onClose,
  onImport,
}: StatementImportModalProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [apiKey, setApiKey] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    uri: string;
  } | null>(null);
  const [parseResult, setParseResult] = useState<StatementParseResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setStep('upload');
    setSelectedFile(null);
    setParseResult(null);
    setIsLoading(false);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const handlePickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'text/csv',
          'text/plain',
          'application/vnd.ms-excel',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile({
          name: result.assets[0].name,
          uri: result.assets[0].uri,
        });
        setError(null);
      }
    } catch (err) {
      console.error('Document picker error:', err);
      setError('Failed to pick document');
    }
  }, []);

  const handleParseStatement = useCallback(async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setStep('parsing');

    try {
      // Read file content
      let fileContent = await readFileAsText(selectedFile.uri);

      // If it's a CSV, format it better
      if (selectedFile.name.toLowerCase().endsWith('.csv')) {
        fileContent = parseCSVStatement(fileContent);
      }

      let result: StatementParseResult;

      if (apiKey.trim()) {
        // Use AI parsing
        result = await parseStatementWithAI(fileContent, apiKey.trim());
      } else {
        // Fall back to local parsing
        const localSubscriptions = parseStatementLocally(fileContent);
        result = {
          success: true,
          subscriptions: localSubscriptions,
          totalTransactionsAnalyzed: fileContent.split('\n').length,
        };

        if (localSubscriptions.length === 0) {
          result.error =
            'No subscriptions detected. Try adding an OpenAI API key for better results.';
        }
      }

      setParseResult(result);

      if (result.success && result.subscriptions.length > 0) {
        setStep('preview');
      } else {
        setStep('upload');
        setError(
          result.error || 'No subscriptions found in statement. Try a different file.'
        );
      }
    } catch (err) {
      console.error('Parse error:', err);
      setStep('upload');
      setError(err instanceof Error ? err.message : 'Failed to parse statement');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, apiKey]);

  const handleToggleSubscription = useCallback((id: string) => {
    setParseResult((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        subscriptions: prev.subscriptions.map((sub) =>
          sub.id === id ? { ...sub, selected: !sub.selected } : sub
        ),
      };
    });
  }, []);

  const handleConfirmImport = useCallback(() => {
    if (!parseResult) return;

    const selectedSubscriptions = parseResult.subscriptions.filter((s) => s.selected);
    if (selectedSubscriptions.length === 0) {
      Alert.alert('No Subscriptions Selected', 'Please select at least one subscription to import.');
      return;
    }

    onImport(selectedSubscriptions);
    handleClose();
  }, [parseResult, onImport, handleClose]);

  const selectedCount = parseResult?.subscriptions.filter((s) => s.selected).length || 0;
  const totalMonthly =
    parseResult?.subscriptions
      .filter((s) => s.selected)
      .reduce((sum, s) => {
        if (s.billingCycle === 'yearly') {
          return sum + s.price / 12;
        }
        return sum + s.price;
      }, 0) || 0;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {step === 'upload' && 'Import from Statement'}
              {step === 'parsing' && 'Analyzing Statement'}
              {step === 'preview' && 'Detected Subscriptions'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {step === 'upload' && (
              <View style={styles.uploadSection}>
                {/* Instructions */}
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color={colors.primary} />
                  <Text style={styles.infoText}>
                    Upload a bank or credit card statement (PDF, CSV, or TXT) to automatically detect your subscriptions.
                  </Text>
                </View>

                {/* File Picker */}
                <TouchableOpacity
                  style={styles.uploadBox}
                  onPress={handlePickDocument}
                >
                  {selectedFile ? (
                    <>
                      <MaterialCommunityIcons
                        name="file-check"
                        size={48}
                        color={colors.success}
                      />
                      <Text style={styles.fileName}>{selectedFile.name}</Text>
                      <Text style={styles.uploadHint}>Tap to change file</Text>
                    </>
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="file-upload"
                        size={48}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.uploadText}>Tap to select statement</Text>
                      <Text style={styles.uploadHint}>PDF, CSV, or TXT</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* API Key Input */}
                <View style={styles.apiKeySection}>
                  <View style={styles.apiKeyHeader}>
                    <Text style={styles.label}>OpenAI API Key (Optional)</Text>
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert(
                          'OpenAI API Key',
                          'Adding an API key enables AI-powered parsing for better subscription detection. Without it, basic pattern matching is used.\n\nGet your API key at: platform.openai.com'
                        )
                      }
                    >
                      <Ionicons
                        name="help-circle"
                        size={18}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={apiKey}
                    onChangeText={setApiKey}
                    placeholder="sk-..."
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Error Message */}
                {error && (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={20} color={colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}
              </View>
            )}

            {step === 'parsing' && (
              <View style={styles.parsingSection}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.parsingText}>Analyzing your statement...</Text>
                <Text style={styles.parsingSubtext}>
                  This may take a few seconds
                </Text>
              </View>
            )}

            {step === 'preview' && parseResult && (
              <View style={styles.previewSection}>
                {/* Summary */}
                <View style={styles.summaryBox}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{selectedCount}</Text>
                    <Text style={styles.summaryLabel}>Selected</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>
                      ${totalMonthly.toFixed(2)}
                    </Text>
                    <Text style={styles.summaryLabel}>Monthly</Text>
                  </View>
                </View>

                {/* Subscription List */}
                {parseResult.subscriptions.map((subscription) => (
                  <TouchableOpacity
                    key={subscription.id}
                    style={[
                      styles.subscriptionItem,
                      subscription.selected && styles.subscriptionItemSelected,
                    ]}
                    onPress={() => handleToggleSubscription(subscription.id)}
                  >
                    <View style={styles.subscriptionLeft}>
                      <ServiceIcon
                        service={subscription.suggestedIcon}
                        size={36}
                      />
                      <View style={styles.subscriptionInfo}>
                        <Text style={styles.subscriptionName}>
                          {subscription.name}
                        </Text>
                        <View style={styles.subscriptionMeta}>
                          <View
                            style={[
                              styles.cycleBadge,
                              subscription.billingCycle === 'monthly'
                                ? styles.monthlyBadge
                                : styles.yearlyBadge,
                            ]}
                          >
                            <Text style={styles.cycleBadgeText}>
                              {subscription.billingCycle}
                            </Text>
                          </View>
                          <Text style={styles.confidenceText}>
                            {Math.round(subscription.confidence * 100)}% confidence
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.subscriptionRight}>
                      <Text style={styles.subscriptionPrice}>
                        ${subscription.price.toFixed(2)}
                      </Text>
                      <Switch
                        value={subscription.selected}
                        onValueChange={() => handleToggleSubscription(subscription.id)}
                        trackColor={{
                          false: colors.surface,
                          true: colors.primary,
                        }}
                        thumbColor={colors.text}
                      />
                    </View>
                  </TouchableOpacity>
                ))}

                {parseResult.subscriptions.length === 0 && (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No subscriptions detected</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Footer Button */}
          {step === 'upload' && (
            <TouchableOpacity
              style={[styles.actionButton, !selectedFile && styles.actionButtonDisabled]}
              onPress={handleParseStatement}
              disabled={!selectedFile}
            >
              <Ionicons name="scan" size={20} color={colors.text} />
              <Text style={styles.actionButtonText}>Analyze Statement</Text>
            </TouchableOpacity>
          )}

          {step === 'preview' && (
            <View style={styles.previewFooter}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setStep('upload');
                  setParseResult(null);
                }}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  selectedCount === 0 && styles.actionButtonDisabled,
                ]}
                onPress={handleConfirmImport}
                disabled={selectedCount === 0}
              >
                <Ionicons name="checkmark" size={20} color={colors.text} />
                <Text style={styles.actionButtonText}>
                  Import {selectedCount} Subscription{selectedCount !== 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
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
    maxHeight: 500,
  },

  // Upload Section
  uploadSection: {
    gap: spacing.lg,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  uploadBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    gap: spacing.sm,
  },
  uploadText: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
  },
  uploadHint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  fileName: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  apiKeySection: {
    gap: spacing.sm,
  },
  apiKeyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  errorText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.error,
  },

  // Parsing Section
  parsingSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    gap: spacing.lg,
  },
  parsingText: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: '600',
  },
  parsingSubtext: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },

  // Preview Section
  previewSection: {
    gap: spacing.md,
  },
  summaryBox: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.primary,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  subscriptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subscriptionItemSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
  },
  subscriptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subscriptionMeta: {
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
    backgroundColor: colors.monthly,
  },
  yearlyBadge: {
    backgroundColor: colors.yearly,
  },
  cycleBadgeText: {
    fontSize: fontSize.xs,
    color: colors.text,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  confidenceText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  subscriptionRight: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  subscriptionPrice: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },

  // Footer
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  previewFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    width: 48,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.success,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
});
