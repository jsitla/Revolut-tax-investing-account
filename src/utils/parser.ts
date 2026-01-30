import Papa from 'papaparse';
import { RevolutExport, RevolutTrade, RevolutDividend } from '../types/revolut';

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
    };
};
