/**
 * Currency Conversion Service
 * 
 * Provides EUR conversion using ECB exchange rates via Frankfurter API.
 * Includes localStorage caching and static fallback data.
 * 
 * ECB Rate Direction: Rates are quoted as "1 EUR = X USD"
 * To convert USD to EUR: EUR = USD / rate
 */

import staticRates from '../data/ecb-rates-usd.json';

const FRANKFURTER_API = 'https://api.frankfurter.dev/v1';
const CACHE_PREFIX = 'ecb-rates-';
const CACHE_TTL_CURRENT_YEAR = 24 * 60 * 60 * 1000; // 24 hours for current year
const CACHE_TTL_PAST_YEAR = Infinity; // Never expire for past years

interface CachedRates {
    rates: Record<string, number>;
    fetchedAt: number;
}

interface FrankfurterResponse {
    amount: number;
    base: string;
    start_date?: string;
    end_date?: string;
    date?: string;
    rates: Record<string, { USD: number } | number>;
}

export interface ConversionResult {
    success: boolean;
    rates: Map<string, number>;
    missingDates: string[];
    errors: string[];
}

/**
 * Gets the localStorage cache key for a given year
 */
const getCacheKey = (year: number): string => `${CACHE_PREFIX}${year}`;

/**
 * Loads cached rates from localStorage
 */
const loadCachedRates = (year: number): Record<string, number> | null => {
    try {
        const key = getCacheKey(year);
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const data: CachedRates = JSON.parse(cached);
        const now = Date.now();
        const currentYear = new Date().getFullYear();
        const ttl = year === currentYear ? CACHE_TTL_CURRENT_YEAR : CACHE_TTL_PAST_YEAR;

        if (now - data.fetchedAt > ttl) {
            localStorage.removeItem(key);
            return null;
        }

        return data.rates;
    } catch {
        return null;
    }
};

/**
 * Saves rates to localStorage cache
 */
const saveCachedRates = (year: number, rates: Record<string, number>): void => {
    try {
        const key = getCacheKey(year);
        const data: CachedRates = {
            rates,
            fetchedAt: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(data));
    } catch {
        // localStorage might be full or disabled, ignore
    }
};

/**
 * Fetches rates for a date range from Frankfurter API
 */
const fetchRatesFromApi = async (startDate: string, endDate: string): Promise<Record<string, number>> => {
    const url = `${FRANKFURTER_API}/${startDate}..${endDate}?base=EUR&symbols=USD`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: FrankfurterResponse = await response.json();
    const rates: Record<string, number> = {};

    // API returns { rates: { "2024-01-02": { USD: 1.0956 }, ... } }
    for (const [date, rateObj] of Object.entries(data.rates)) {
        if (typeof rateObj === 'object' && 'USD' in rateObj) {
            rates[date] = rateObj.USD;
        }
    }

    return rates;
};

/**
 * Gets the rate for a specific date, handling weekends/holidays
 * by looking for the most recent available rate
 */
const findRateForDate = (date: string, allRates: Map<string, number>): number | null => {
    // First try exact date
    if (allRates.has(date)) {
        return allRates.get(date)!;
    }

    // ECB doesn't publish rates on weekends/holidays
    // Look backwards up to 7 days for the last available rate
    const targetDate = new Date(date);
    for (let i = 1; i <= 7; i++) {
        const prevDate = new Date(targetDate);
        prevDate.setDate(prevDate.getDate() - i);
        const prevDateStr = prevDate.toISOString().split('T')[0];
        if (allRates.has(prevDateStr)) {
            return allRates.get(prevDateStr)!;
        }
    }

    return null;
};

/**
 * Loads static fallback rates from bundled JSON
 */
const loadStaticRates = (): Map<string, number> => {
    const rates = new Map<string, number>();
    for (const [date, rate] of Object.entries(staticRates as Record<string, number>)) {
        rates.set(date, rate);
    }
    return rates;
};

/**
 * Main function: Get exchange rates for a list of dates
 * 
 * Strategy:
 * 1. Check localStorage cache
 * 2. Fetch missing dates from Frankfurter API
 * 3. Fall back to static bundled rates if API fails
 * 
 * @param dates Array of ISO date strings (YYYY-MM-DD)
 * @returns ConversionResult with rates map and any missing dates
 */
export const getExchangeRates = async (dates: string[]): Promise<ConversionResult> => {
    if (dates.length === 0) {
        return { success: true, rates: new Map(), missingDates: [], errors: [] };
    }

    const uniqueDates = [...new Set(dates)].sort();
    const allRates = new Map<string, number>();
    const errors: string[] = [];

    // Group dates by year for efficient caching
    const datesByYear = new Map<number, string[]>();
    for (const date of uniqueDates) {
        const year = parseInt(date.split('-')[0]);
        if (!datesByYear.has(year)) {
            datesByYear.set(year, []);
        }
        datesByYear.get(year)!.push(date);
    }

    // Process each year
    for (const [year] of datesByYear) {
        // Check cache first
        const cached = loadCachedRates(year);
        if (cached) {
            for (const [date, rate] of Object.entries(cached)) {
                allRates.set(date, rate);
            }
            continue;
        }

        // Fetch from API for this year
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        try {
            const apiRates = await fetchRatesFromApi(startDate, endDate);
            saveCachedRates(year, apiRates);
            for (const [date, rate] of Object.entries(apiRates)) {
                allRates.set(date, rate);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            errors.push(`Napaka pri pridobivanju tečajev za leto ${year}: ${errorMessage}`);
        }
    }

    // If API failed for some years, try static fallback
    const staticRates = loadStaticRates();
    for (const date of uniqueDates) {
        if (!allRates.has(date)) {
            // Try to find rate in static data
            const staticRate = findRateForDate(date, staticRates);
            if (staticRate !== null) {
                allRates.set(date, staticRate);
            }
        }
    }

    // Build final rates map with weekend/holiday handling
    const finalRates = new Map<string, number>();
    const missingDates: string[] = [];

    // Combine all available rates for lookup
    const combinedRates = new Map([...staticRates, ...allRates]);

    for (const date of uniqueDates) {
        const rate = findRateForDate(date, combinedRates);
        if (rate !== null) {
            finalRates.set(date, rate);
        } else {
            missingDates.push(date);
        }
    }

    return {
        success: missingDates.length === 0,
        rates: finalRates,
        missingDates,
        errors
    };
};

/**
 * Converts an amount from USD to EUR using the given rate
 * 
 * @param usdAmount Amount in USD
 * @param rate ECB rate (1 EUR = X USD)
 * @returns Amount in EUR
 */
export const convertUsdToEur = (usdAmount: number, rate: number): number => {
    if (rate <= 0) return usdAmount;
    return usdAmount / rate;
};

/**
 * Formats exchange rate for display
 */
export const formatExchangeRate = (rate: number): string => {
    return rate.toFixed(4);
};
