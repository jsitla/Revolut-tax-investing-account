import Papa from 'papaparse';
import { RevolutExport, RevolutTrade, RevolutDividend } from '../types/revolut';
import { getExchangeRates, convertUsdToEur, ConversionResult } from './currency-service';

interface RawRow {
    [key: string]: string;
}

const parseNumber = (value: string | undefined): number => {
    if (!value) return 0;
    // Remove currency symbols ($, €) and commas
    const clean = value.replace(/[€$£,]/g, '').trim();
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
};

/**
 * Finds the start index of a section in the CSV content.
 * Supports multiple possible section names.
 */
const findSectionIndex = (content: string, sectionNames: string[]): number => {
    for (const name of sectionNames) {
        const index = content.indexOf(name);
        if (index !== -1) {
            return index;
        }
    }
    return -1;
};

/**
 * Parses a CSV section and returns the data rows.
 */
const parseSection = <T>(
    content: string,
    startIndex: number,
    endIndex: number,
    mapper: (row: RawRow) => T | null
): T[] => {
    if (startIndex === -1) return [];
    
    const sectionBlock = content.slice(startIndex, endIndex).trim();
    // Remove the title line
    const csvStart = sectionBlock.indexOf('\n') + 1;
    if (csvStart <= 0) return [];
    
    const csvData = sectionBlock.slice(csvStart).trim();
    if (!csvData) return [];
    
    const parsed = Papa.parse<RawRow>(csvData, { header: true, skipEmptyLines: true });
    
    const results: T[] = [];
    for (const row of parsed.data) {
        const mapped = mapper(row);
        if (mapped !== null) {
            results.push(mapped);
        }
    }
    return results;
};

export const parseRevolutExport = (csvContent: string): RevolutExport => {
    // Normalize line endings
    const content = csvContent.replace(/\r\n/g, '\n');

    // Find sections - support multiple possible header names
    const sellsStartIndex = findSectionIndex(content, ['Income from Sells', 'Trades', 'Sales']);
    const dividendsStartIndex = findSectionIndex(content, ['Dividends', 'Other income & fees', 'Dividend income']);
    
    // Determine section boundaries
    const sellsEndIndex = dividendsStartIndex !== -1 ? dividendsStartIndex : content.length;
    const dividendsEndIndex = content.length;

    // Parse trades
    const trades = parseSection<RevolutTrade>(
        content,
        sellsStartIndex,
        sellsEndIndex,
        (row) => {
            // Must have Symbol and Date sold to be a valid trade
            if (!(row['Symbol'] || '') || !(row['Date sold'] || '')) {
                return null;
            }
            return {
                dateAcquired: (row['Date acquired'] || '').split(' ')[0],
                dateSold: (row['Date sold'] || '').split(' ')[0],
                symbol: row['Symbol'] || '',
                securityName: row['Security name'] || '',
                isin: row['ISIN'] || '',
                country: row['Country'] || '',
                quantity: parseNumber(row['Quantity']),
                costBasis: parseNumber(row['Cost basis']),
                grossProceeds: parseNumber(row['Gross proceeds']),
                grossPnL: parseNumber(row['Gross PnL']),
                currency: row['Currency'] || ''
            };
        }
    );

    // Parse dividends
    const dividends = parseSection<RevolutDividend>(
        content,
        dividendsStartIndex,
        dividendsEndIndex,
        (row) => {
            // Must have Symbol and either ISIN or Withholding tax to be a valid dividend
            // Skip rows that look like fees (negative amounts, no ISIN)
            const symbol = row['Symbol'] || '';
            const isin = row['ISIN'] || '';
            const grossAmount = parseNumber(row['Gross amount']);
            
            // Skip if no symbol or if gross amount is negative (likely a fee)
            if (!symbol || grossAmount <= 0) {
                return null;
            }
            
            // Skip if no ISIN (likely not a proper dividend)
            if (!isin) {
                return null;
            }
            
            return {
                date: (row['Date'] || '').split(' ')[0],
                symbol: symbol,
                securityName: row['Security name'] || '',
                isin: isin,
                country: row['Country'] || '',
                grossAmount: grossAmount,
                withholdingTax: parseNumber(row['Withholding tax']),
                netAmount: parseNumber(row['Net Amount'] || row['Net amount']),
                currency: row['Currency'] || ''
            };
        }
    );

    return { trades, dividends };
};

export const filterByYear = (data: RevolutExport, year: number | string): RevolutExport => {
    const yearStr = year.toString();
    return {
        trades: data.trades.filter(t => t.dateSold.startsWith(yearStr)),
        dividends: data.dividends.filter(d => d.date.startsWith(yearStr)),
        conversionApplied: data.conversionApplied,
        conversionErrors: data.conversionErrors,
        missingRateDates: data.missingRateDates,
    };
};

/**
 * Converts all USD amounts in the export to EUR using ECB rates.
 * Preserves original values and adds *Eur fields for FURS XML.
 * 
 * @param data Parsed Revolut export
 * @returns Export with EUR-converted values
 */
export const convertToEur = async (data: RevolutExport): Promise<RevolutExport> => {
    // Collect all unique dates that need conversion (non-EUR currencies only)
    const datesToConvert: string[] = [];
    
    for (const trade of data.trades) {
        if (trade.currency && trade.currency !== 'EUR') {
            if (trade.dateAcquired) datesToConvert.push(trade.dateAcquired);
            if (trade.dateSold) datesToConvert.push(trade.dateSold);
        }
    }
    
    for (const dividend of data.dividends) {
        if (dividend.currency && dividend.currency !== 'EUR') {
            if (dividend.date) datesToConvert.push(dividend.date);
        }
    }

    // If everything is already in EUR, no conversion needed
    if (datesToConvert.length === 0) {
        return {
            ...data,
            conversionApplied: false,
            conversionErrors: [],
            missingRateDates: [],
        };
    }

    // Fetch exchange rates
    const conversionResult: ConversionResult = await getExchangeRates(datesToConvert);
    const { rates, missingDates, errors } = conversionResult;

    // Convert trades
    const convertedTrades: RevolutTrade[] = data.trades.map(trade => {
        if (trade.currency === 'EUR') {
            // Already in EUR, copy values
            return {
                ...trade,
                exchangeRateAcquired: 1,
                exchangeRateSold: 1,
                costBasisEur: trade.costBasis,
                grossProceedsEur: trade.grossProceeds,
                grossPnLEur: trade.grossPnL,
            };
        }

        const rateAcquired = rates.get(trade.dateAcquired);
        const rateSold = rates.get(trade.dateSold);

        if (rateAcquired && rateSold) {
            return {
                ...trade,
                exchangeRateAcquired: rateAcquired,
                exchangeRateSold: rateSold,
                costBasisEur: convertUsdToEur(trade.costBasis, rateAcquired),
                grossProceedsEur: convertUsdToEur(trade.grossProceeds, rateSold),
                grossPnLEur: convertUsdToEur(trade.grossProceeds, rateSold) - convertUsdToEur(trade.costBasis, rateAcquired),
            };
        }

        // Rate not found - leave EUR fields undefined
        return trade;
    });

    // Convert dividends
    const convertedDividends: RevolutDividend[] = data.dividends.map(dividend => {
        if (dividend.currency === 'EUR') {
            // Already in EUR, copy values
            return {
                ...dividend,
                exchangeRate: 1,
                grossAmountEur: dividend.grossAmount,
                withholdingTaxEur: dividend.withholdingTax,
            };
        }

        const rate = rates.get(dividend.date);

        if (rate) {
            return {
                ...dividend,
                exchangeRate: rate,
                grossAmountEur: convertUsdToEur(dividend.grossAmount, rate),
                withholdingTaxEur: convertUsdToEur(dividend.withholdingTax, rate),
            };
        }

        // Rate not found - leave EUR fields undefined
        return dividend;
    });

    return {
        trades: convertedTrades,
        dividends: convertedDividends,
        conversionApplied: true,
        conversionErrors: errors,
        missingRateDates: missingDates,
    };
};
