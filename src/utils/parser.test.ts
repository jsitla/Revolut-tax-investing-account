import { describe, it, expect } from 'vitest';
import { parseRevolutExport, filterByYear } from './parser';

const SAMPLE_CSV = `
Income from Sells
Date acquired,Date sold,Symbol,Security name,ISIN,Country,Quantity,Cost basis,Gross proceeds,Gross PnL,Currency
2020-04-09,2024-03-07,NVDA,NVIDIA,US67066G1040,US,4,"269.84","3,654.20","3,384.36",USD
2023-01-15 10:30:00,2023-12-01 14:20:00,MSFT,Microsoft,US5949181045,US,10,2500,2800,300,USD

Other income & fees
Date,Symbol,Security name,ISIN,Country,Gross amount,Withholding tax,Net Amount,Currency
2024-01-10,TSM,Taiwan Semiconductor dividend,US8740391003,US,16.92,"€3.55","€13.37",EUR
2024-02-15,AAPL,Apple Div,US0378331005,US,0.24,0.04,0.20,USD
2024-03-01,,,,-,,-0.01,,USD
`;

// Alternative format with "Dividends" header
const SAMPLE_CSV_ALT = `
Income from Sells,,,,,,,,,,
Date acquired,Date sold,Symbol,Security name,ISIN,Country,Quantity,Cost basis,Gross proceeds,Gross PnL,Currency
2024-01-15,2024-02-20,AAPL,Apple Inc.,US0378331005,US,10,1500.00,1800.00,300.00,EUR

Dividends,,,,,,,,,,
Date,Symbol,Security name,ISIN,Country,Gross amount,Withholding tax,Currency
2024-03-01,AAPL,Apple Inc.,US0378331005,US,5.00,0.75,EUR
`;

describe('parseRevolutExport', () => {
    it('should parse trades correctly', () => {
        const result = parseRevolutExport(SAMPLE_CSV);
        expect(result.trades).toHaveLength(2);

        const nvda = result.trades[0];
        expect(nvda.symbol).toBe('NVDA');
        expect(nvda.quantity).toBe(4);
        expect(nvda.grossProceeds).toBe(3654.20);
        expect(nvda.grossPnL).toBe(3384.36);
        expect(nvda.dateAcquired).toBe('2020-04-09');
        expect(nvda.dateSold).toBe('2024-03-07');
        expect(nvda.isin).toBe('US67066G1040');
    });

    it('should handle timestamp dates by taking only YYYY-MM-DD', () => {
        const result = parseRevolutExport(SAMPLE_CSV);
        const msft = result.trades[1];
        expect(msft.dateAcquired).toBe('2023-01-15');
        expect(msft.dateSold).toBe('2023-12-01');
    });

    it('should parse dividends correctly from Other income & fees', () => {
        const result = parseRevolutExport(SAMPLE_CSV);
        expect(result.dividends).toHaveLength(2);

        const tsm = result.dividends[0];
        expect(tsm.symbol).toBe('TSM');
        expect(tsm.grossAmount).toBe(16.92);
        expect(tsm.withholdingTax).toBe(3.55);
        expect(tsm.netAmount).toBe(13.37);
        expect(tsm.currency).toBe('EUR');
    });

    it('should parse dividends correctly from Dividends section', () => {
        const result = parseRevolutExport(SAMPLE_CSV_ALT);
        expect(result.dividends).toHaveLength(1);

        const aapl = result.dividends[0];
        expect(aapl.symbol).toBe('AAPL');
        expect(aapl.grossAmount).toBe(5.00);
        expect(aapl.withholdingTax).toBe(0.75);
        expect(aapl.isin).toBe('US0378331005');
    });

    it('should skip negative amounts (fees)', () => {
        const result = parseRevolutExport(SAMPLE_CSV);
        // The -0.01 fee row should be skipped
        const negativeAmounts = result.dividends.filter(d => d.grossAmount < 0);
        expect(negativeAmounts).toHaveLength(0);
    });

    it('should filter by year', () => {
        const result = parseRevolutExport(SAMPLE_CSV);

        const filtered2024 = filterByYear(result, 2024);
        expect(filtered2024.trades).toHaveLength(1);
        expect(filtered2024.trades[0].symbol).toBe('NVDA');
        expect(filtered2024.dividends).toHaveLength(2);

        const filtered2023 = filterByYear(result, 2023);
        expect(filtered2023.trades).toHaveLength(1);
        expect(filtered2023.trades[0].symbol).toBe('MSFT');
        expect(filtered2023.dividends).toHaveLength(0);
    });

    it('should return empty arrays for empty input', () => {
        const result = parseRevolutExport('');
        expect(result.trades).toEqual([]);
        expect(result.dividends).toEqual([]);
    });
});
