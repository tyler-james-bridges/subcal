import { BillingCycle, ServiceIcon } from './subscription';

export interface ParsedTransaction {
  id: string;
  merchantName: string;
  amount: number;
  date: string;
  category?: string;
  isRecurring: boolean;
  confidence: number; // 0-1 confidence score
}

export interface DetectedSubscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  billingDay: number;
  suggestedIcon: ServiceIcon;
  suggestedColor: string;
  confidence: number;
  transactions: ParsedTransaction[];
  selected: boolean; // User can toggle which ones to import
}

export interface StatementParseResult {
  success: boolean;
  subscriptions: DetectedSubscription[];
  totalTransactionsAnalyzed: number;
  statementPeriod?: {
    startDate: string;
    endDate: string;
  };
  error?: string;
}

export interface StatementParserConfig {
  apiKey: string;
  minConfidence?: number; // Minimum confidence to include a subscription
}
