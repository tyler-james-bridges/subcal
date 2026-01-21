import { v4 as uuidv4 } from 'uuid';
import * as FileSystem from 'expo-file-system';
import {
  DetectedSubscription,
  StatementParseResult,
  ParsedTransaction,
} from '../types';
import { ServiceIcon } from '../types/subscription';
import { serviceConfigs } from '../constants/services';

// Known subscription services and their common merchant names
const KNOWN_SERVICES: Record<string, { icon: ServiceIcon; names: string[] }> = {
  netflix: { icon: 'netflix', names: ['netflix', 'netflix.com'] },
  spotify: { icon: 'spotify', names: ['spotify', 'spotify usa', 'spotify ab'] },
  apple: {
    icon: 'apple',
    names: ['apple.com/bill', 'apple services', 'itunes', 'apple music', 'icloud', 'apple one', 'apple tv'],
  },
  amazon: {
    icon: 'amazon',
    names: ['amazon prime', 'prime video', 'amazon digital', 'amzn digital', 'kindle'],
  },
  google: {
    icon: 'google',
    names: ['google storage', 'google one', 'youtube premium', 'youtube music', 'google play'],
  },
  microsoft: {
    icon: 'microsoft',
    names: ['microsoft', 'xbox', 'microsoft 365', 'office 365', 'onedrive'],
  },
  adobe: { icon: 'adobe', names: ['adobe', 'adobe systems', 'creative cloud'] },
  dropbox: { icon: 'dropbox', names: ['dropbox'] },
  slack: { icon: 'slack', names: ['slack'] },
  notion: { icon: 'notion', names: ['notion', 'notion labs'] },
  figma: { icon: 'figma', names: ['figma'] },
  github: { icon: 'github', names: ['github', 'github inc'] },
  discord: { icon: 'discord', names: ['discord', 'discord nitro'] },
  zoom: { icon: 'zoom', names: ['zoom', 'zoom.us', 'zoom video'] },
  linear: { icon: 'linear', names: ['linear'] },
  vercel: { icon: 'vercel', names: ['vercel'] },
  openai: { icon: 'openai', names: ['openai', 'chatgpt'] },
};

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface AIDetectedSubscription {
  merchantName: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  billingDay: number;
  confidence: number;
  transactionDates: string[];
}

export async function parseStatementWithAI(
  statementText: string,
  apiKey: string
): Promise<StatementParseResult> {
  try {
    const systemPrompt = `You are a financial analysis AI that specializes in identifying recurring subscription charges from bank or credit card statements.

Analyze the provided statement text and identify all recurring subscription charges.

For each subscription found, provide:
1. merchantName: The name of the service/company
2. amount: The charge amount (number only, no currency symbol)
3. billingCycle: Either "monthly" or "yearly" based on the frequency
4. billingDay: The day of the month the charge typically occurs (1-31)
5. confidence: How confident you are this is a subscription (0.0 to 1.0)
6. transactionDates: Array of dates when this subscription was charged (ISO format YYYY-MM-DD)

Respond ONLY with a valid JSON object in this exact format:
{
  "subscriptions": [
    {
      "merchantName": "Netflix",
      "amount": 15.99,
      "billingCycle": "monthly",
      "billingDay": 15,
      "confidence": 0.95,
      "transactionDates": ["2024-01-15", "2024-02-15"]
    }
  ],
  "totalTransactionsAnalyzed": 50,
  "statementPeriod": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }
}

Focus on identifying:
- Streaming services (Netflix, Spotify, Disney+, HBO, Hulu, etc.)
- Software subscriptions (Adobe, Microsoft 365, etc.)
- Cloud storage (iCloud, Google One, Dropbox)
- Gaming subscriptions (Xbox, PlayStation, Nintendo)
- Productivity tools (Notion, Slack, Figma)
- Any other recurring monthly or yearly charges

Look for patterns in transaction amounts and dates to identify subscriptions.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Analyze this bank/credit card statement and identify all subscription charges:\n\n${statementText}`,
          },
        ] as OpenAIMessage[],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as OpenAIResponse;
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response as JSON');
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      subscriptions: AIDetectedSubscription[];
      totalTransactionsAnalyzed: number;
      statementPeriod?: { startDate: string; endDate: string };
    };

    // Convert AI results to our DetectedSubscription format
    const detectedSubscriptions: DetectedSubscription[] = parsed.subscriptions.map(
      (sub: AIDetectedSubscription) => {
        const { icon, color } = matchServiceIcon(sub.merchantName);
        const transactions: ParsedTransaction[] = sub.transactionDates.map((date) => ({
          id: uuidv4(),
          merchantName: sub.merchantName,
          amount: sub.amount,
          date,
          isRecurring: true,
          confidence: sub.confidence,
        }));

        return {
          id: uuidv4(),
          name: sub.merchantName,
          price: sub.amount,
          currency: 'USD',
          billingCycle: sub.billingCycle,
          billingDay: sub.billingDay,
          suggestedIcon: icon,
          suggestedColor: color,
          confidence: sub.confidence,
          transactions,
          selected: sub.confidence >= 0.7, // Auto-select high confidence ones
        };
      }
    );

    return {
      success: true,
      subscriptions: detectedSubscriptions,
      totalTransactionsAnalyzed: parsed.totalTransactionsAnalyzed,
      statementPeriod: parsed.statementPeriod,
    };
  } catch (error) {
    console.error('Statement parsing error:', error);
    return {
      success: false,
      subscriptions: [],
      totalTransactionsAnalyzed: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

function matchServiceIcon(merchantName: string): { icon: ServiceIcon; color: string } {
  const lowerName = merchantName.toLowerCase();

  // Check against known services
  for (const [_, config] of Object.entries(KNOWN_SERVICES)) {
    for (const name of config.names) {
      if (lowerName.includes(name.toLowerCase())) {
        const serviceConfig = serviceConfigs[config.icon];
        return {
          icon: config.icon,
          color: serviceConfig.color,
        };
      }
    }
  }

  // Default to custom icon
  return {
    icon: 'custom',
    color: serviceConfigs.custom.color,
  };
}

export async function readFileAsText(uri: string): Promise<string> {
  try {
    // For PDFs, we'll read as base64 and send to AI for extraction
    // For text files, read directly
    const fileInfo = await FileSystem.getInfoAsync(uri);

    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    const extension = uri.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') {
      // Read PDF as base64 - the AI will handle PDF content
      const base64Content = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      return `[PDF DOCUMENT - Base64 encoded]\n${base64Content}`;
    } else if (extension === 'csv' || extension === 'txt') {
      // Read text files directly
      return await FileSystem.readAsStringAsync(uri);
    } else {
      // Try to read as text
      return await FileSystem.readAsStringAsync(uri);
    }
  } catch (error) {
    console.error('File read error:', error);
    throw error;
  }
}

// Parse CSV statement format (common export format from banks)
export function parseCSVStatement(csvContent: string): string {
  // Convert CSV to a more readable format for the AI
  const lines = csvContent.split('\n');
  const headers = lines[0]?.split(',').map((h) => h.trim().replace(/"/g, ''));

  if (!headers) return csvContent;

  // Find relevant columns
  const dateIdx = headers.findIndex((h) =>
    /date|trans.*date|posted/i.test(h)
  );
  const descIdx = headers.findIndex((h) =>
    /desc|merchant|name|payee|memo/i.test(h)
  );
  const amountIdx = headers.findIndex((h) =>
    /amount|debit|credit|charge/i.test(h)
  );

  if (dateIdx === -1 || descIdx === -1 || amountIdx === -1) {
    // Couldn't identify columns, return raw CSV
    return csvContent;
  }

  // Format transactions for better AI parsing
  const transactions = lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim().replace(/"/g, ''));
    return {
      date: cols[dateIdx] || '',
      description: cols[descIdx] || '',
      amount: cols[amountIdx] || '',
    };
  });

  return (
    'Transaction List:\n' +
    transactions
      .filter((t) => t.date && t.description)
      .map((t) => `${t.date}: ${t.description} - ${t.amount}`)
      .join('\n')
  );
}

// Fallback local parsing when API is not available
export function parseStatementLocally(statementText: string): DetectedSubscription[] {
  const subscriptions: DetectedSubscription[] = [];
  const lines = statementText.split('\n');

  // Simple pattern matching for common subscription services
  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    for (const [serviceName, config] of Object.entries(KNOWN_SERVICES)) {
      for (const name of config.names) {
        if (lowerLine.includes(name.toLowerCase())) {
          // Try to extract amount
          const amountMatch = line.match(/\$?([\d,]+\.?\d{0,2})/);
          const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : 0;

          if (amount > 0 && amount < 500) {
            // Reasonable subscription amount
            const serviceConfig = serviceConfigs[config.icon];
            const existingIdx = subscriptions.findIndex(
              (s) => s.suggestedIcon === config.icon
            );

            if (existingIdx === -1) {
              subscriptions.push({
                id: uuidv4(),
                name: serviceConfig.name,
                price: amount,
                currency: 'USD',
                billingCycle: amount > 50 ? 'yearly' : 'monthly',
                billingDay: new Date().getDate(),
                suggestedIcon: config.icon,
                suggestedColor: serviceConfig.color,
                confidence: 0.6,
                transactions: [
                  {
                    id: uuidv4(),
                    merchantName: serviceConfig.name,
                    amount,
                    date: new Date().toISOString().split('T')[0],
                    isRecurring: true,
                    confidence: 0.6,
                  },
                ],
                selected: true,
              });
            }
          }
          break;
        }
      }
    }
  }

  return subscriptions;
}
