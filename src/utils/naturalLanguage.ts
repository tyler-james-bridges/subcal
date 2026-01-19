import { BillingCycle, ServiceIcon } from '../types';
import { serviceConfigs } from '../constants';

interface ParsedSubscription {
  name?: string;
  price?: number;
  billingCycle?: BillingCycle;
  billingDay?: number;
  icon?: ServiceIcon;
}

// Common service name patterns
const servicePatterns: { pattern: RegExp; icon: ServiceIcon }[] = [
  { pattern: /netflix/i, icon: 'netflix' },
  { pattern: /spotify/i, icon: 'spotify' },
  { pattern: /apple\s*(music|tv|one|arcade)?/i, icon: 'apple' },
  { pattern: /adobe|creative\s*cloud/i, icon: 'adobe' },
  { pattern: /figma/i, icon: 'figma' },
  { pattern: /slack/i, icon: 'slack' },
  { pattern: /notion/i, icon: 'notion' },
  { pattern: /github/i, icon: 'github' },
  { pattern: /dropbox/i, icon: 'dropbox' },
  { pattern: /google\s*(one|drive|workspace)?/i, icon: 'google' },
  { pattern: /microsoft\s*(365|office)?/i, icon: 'microsoft' },
  { pattern: /amazon|prime/i, icon: 'amazon' },
  { pattern: /discord/i, icon: 'discord' },
  { pattern: /zoom/i, icon: 'zoom' },
  { pattern: /linear/i, icon: 'linear' },
  { pattern: /vercel/i, icon: 'vercel' },
  { pattern: /openai|chatgpt|gpt/i, icon: 'openai' },
];

/**
 * Parse natural language input to extract subscription details
 *
 * Examples:
 * - "Netflix $15.99 monthly on the 15th"
 * - "Spotify 9.99 per month"
 * - "Adobe Creative Cloud $54.99/mo on day 1"
 * - "GitHub $4 yearly"
 */
export function parseNaturalLanguageSubscription(input: string): ParsedSubscription {
  const result: ParsedSubscription = {};

  // Extract price: matches $15.99, 15.99, $15, 15
  const priceMatch = input.match(/\$?\s*(\d+(?:\.\d{1,2})?)/);
  if (priceMatch) {
    result.price = parseFloat(priceMatch[1]);
  }

  // Extract billing cycle
  if (/yearly|annual|per\s*year|\/\s*yr|\/\s*year/i.test(input)) {
    result.billingCycle = 'yearly';
  } else if (/monthly|per\s*month|\/\s*mo|\/\s*month/i.test(input)) {
    result.billingCycle = 'monthly';
  }

  // Extract billing day: "on the 15th", "on day 1", "15th", "day 15"
  const dayMatch = input.match(/(?:on\s*(?:the\s*)?|day\s*)(\d{1,2})(?:st|nd|rd|th)?/i);
  if (dayMatch) {
    const day = parseInt(dayMatch[1], 10);
    if (day >= 1 && day <= 31) {
      result.billingDay = day;
    }
  }

  // Match known service names
  for (const { pattern, icon } of servicePatterns) {
    if (pattern.test(input)) {
      result.icon = icon;
      result.name = serviceConfigs[icon].name;
      break;
    }
  }

  // If no known service, try to extract a name (first word or quoted text)
  if (!result.name) {
    // Check for quoted text first
    const quotedMatch = input.match(/["']([^"']+)["']/);
    if (quotedMatch) {
      result.name = quotedMatch[1];
    } else {
      // Extract first word(s) before price or keywords
      const nameMatch = input.match(/^([A-Za-z\s]+?)(?:\s*\$|\s+\d|\s+(?:monthly|yearly|per|on))/i);
      if (nameMatch) {
        result.name = nameMatch[1].trim();
      }
    }
  }

  return result;
}

/**
 * Check if the input looks like a natural language subscription description
 */
export function isNaturalLanguageInput(input: string): boolean {
  // Contains price pattern or billing keywords
  const hasPricePattern = /\$?\s*\d+(?:\.\d{1,2})?/.test(input);
  const hasBillingKeyword = /monthly|yearly|annual|per\s*(month|year)|\/\s*(mo|yr)/i.test(input);

  return hasPricePattern || hasBillingKeyword;
}
