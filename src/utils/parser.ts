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

export const parseRevolutExport = (csvContent: string): RevolutExport => {
    // Normalize line endings
    const content = csvContent.replace(/\r\n/g, '\n');

    const trades: RevolutTrade[] = [];
    const dividends: RevolutDividend[] = [];

    // Find sections
    const sellsStartIndex = content.indexOf('Income from Sells');
    const otherStartIndex = content.indexOf('Other income & fees');

    if (sellsStartIndex !== -1) {
        const sellsBlockEnd = otherStartIndex !== -1 ? otherStartIndex : content.length;
        const sellsBlock = content.slice(sellsStartIndex, sellsBlockEnd).trim();
        // Remove the title line "Income from Sells"
        const csvStart = sellsBlock.indexOf('\n') + 1;
        if (csvStart > 0) {
            const csvData = sellsBlock.slice(csvStart).trim();
            const parsed = Papa.parse<RawRow>(csvData, { header: true, skipEmptyLines: true });

            parsed.data.forEach(row => {
                // Map to RevolutTrade
                if ((row['Symbol'] || '') && (row['Date sold'] || '')) {
                    trades.push({
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
                    });
                }
            });
        }
    }

    if (otherStartIndex !== -1) {
        const otherBlock = content.slice(otherStartIndex).trim();
        // Remove title line
        const csvStart = otherBlock.indexOf('\n') + 1;
        if (csvStart > 0) {
            const csvData = otherBlock.slice(csvStart).trim();
            const parsed = Papa.parse<RawRow>(csvData, { header: true, skipEmptyLines: true });

            parsed.data.forEach(row => {
                // Filter dividend rows
                if ((row['Symbol'] || '') && (row['ISIN'] || '') && (row['Withholding tax'] || '')) {
                    dividends.push({
                        date: (row['Date'] || '').split(' ')[0],
                        symbol: row['Symbol'] || '',
                        securityName: row['Security name'] || '',
                        isin: row['ISIN'] || '',
                        country: row['Country'] || '',
                        grossAmount: parseNumber(row['Gross amount']),
                        withholdingTax: parseNumber(row['Withholding tax']),
                        netAmount: parseNumber(row['Net Amount']),
                        currency: row['Currency'] || ''
                    });
                }
            });
        }
    }

    return { trades, dividends };
};

export const filterByYear = (data: RevolutExport, year: number | string): RevolutExport => {
    const yearStr = year.toString();
    return {
        trades: data.trades.filter(t => t.dateSold.startsWith(yearStr)),
        dividends: data.dividends.filter(d => d.date.startsWith(yearStr)),
    };
};
