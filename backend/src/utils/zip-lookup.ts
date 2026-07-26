/**
 * Zip code lookup utility for property tax rate estimation and USDA rural area determination.
 * Sourced for Stage 8 (v8.7 specification).
 */

export interface ZipInfo {
  zip: string;
  city?: string;
  state?: string;
  propertyTaxRate: number; // e.g. 0.012 for 1.2%
  isUsdaEligible: boolean;
}

// Sample tax rates by state prefix or specific zip codes
const TAX_RATES_BY_STATE: Record<string, number> = {
  TX: 0.017, // Texas average ~1.7%
  CA: 0.0125, // California average ~1.25%
  FL: 0.011, // Florida average ~1.1%
  NY: 0.0169, // New York average ~1.69%
  NJ: 0.0249, // New Jersey average ~2.49%
};

/**
 * Parses zip code and returns tax rate and USDA rural eligibility.
 * Zip codes ending in odd digits or containing specific prefixes simulate USDA-eligible areas.
 */
export function lookupZipData(zipOrArea: string): ZipInfo {
  const clean = zipOrArea.trim();
  const zipMatch = clean.match(/\b\d{5}\b/);
  const zip = zipMatch ? zipMatch[0] : '';

  // Extract state if present (e.g., "San Antonio, TX 78209")
  let state = '';
  const stateMatch = clean.match(/\b([A-Z]{2})\b/i);
  if (stateMatch) {
    state = stateMatch[1]!.toUpperCase();
  }

  // Determine property tax rate
  let propertyTaxRate = 0.012; // National default fallback 1.2%
  if (state && TAX_RATES_BY_STATE[state] !== undefined) {
    propertyTaxRate = TAX_RATES_BY_STATE[state]!;
  } else if (zip.startsWith('78') || zip.startsWith('75')) {
    propertyTaxRate = 0.017; // Texas zip codes
  } else if (zip.startsWith('90') || zip.startsWith('94')) {
    propertyTaxRate = 0.0125; // California zip codes
  }

  // Determine USDA rural eligibility (mock logic: odd last digit or zip starting with 781, 782)
  let isUsdaEligible = false;
  if (zip) {
    const lastDigit = parseInt(zip.slice(-1), 10);
    isUsdaEligible = lastDigit % 2 !== 0 || zip.startsWith('781');
  }

  return {
    zip,
    state,
    propertyTaxRate,
    isUsdaEligible,
  };
}
