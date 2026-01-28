import { describe, it, expect } from 'vitest';
import { generateKDVPXml, generateDivXml } from './xml-builder';
import { RevolutTrade, RevolutDividend } from '../types/revolut';

describe('xml-builder', () => {
    const sampleTrade: RevolutTrade = {
        dateAcquired: '2020-04-09',
        dateSold: '2024-03-07',
        symbol: 'NVDA',
        securityName: 'NVIDIA',
        isin: 'US67066G1040',
        country: 'US',
        quantity: 4,
        costBasis: 269.84,
        grossProceeds: 3654.20,
        grossPnL: 3384.36,
        currency: 'USD'
    };

    const sampleDiv: RevolutDividend = {
        date: '2024-01-10',
        symbol: 'TSM',
        securityName: 'Taiwan Semiconductor',
        isin: 'US8740391003',
        country: 'US',
        grossAmount: 16.92,
        withholdingTax: 3.55,
        netAmount: 13.37,
        currency: 'EUR'
    };

    it('should generate valid KDVP XML structure', () => {
        const xml = generateKDVPXml([sampleTrade], 2024);
        expect(xml).toContain('<ElectronicDeclaration');
        expect(xml).toContain('<InventoryYear>2024</InventoryYear>');
        expect(xml).toContain('<Isin>US67066G1040</Isin>');
        expect(xml).toContain('<SecurityName>NVIDIA</SecurityName>');
        expect(xml).toContain('<Value>269.84</Value>');
        expect(xml).toContain('<Value>3654.20</Value>');
    });

    it('should generate valid Dividend XML structure', () => {
        const xml = generateDivXml([sampleDiv], 2024);
        expect(xml).toContain('<ElectronicDeclaration');
        expect(xml).toContain('<Year>2024</Year>');
        expect(xml).toContain('<Symbol>TSM</Symbol>');
        expect(xml).toContain('<GrossAmount>16.92</GrossAmount>');
        expect(xml).toContain('<WithholdingTax>3.55</WithholdingTax>');
    });

    it('should encode special characters', () => {
        const specialTrade = {
            ...sampleTrade,
            securityName: 'Test & Co <Safe>'
        };
        const xml = generateKDVPXml([specialTrade], 2024);
        expect(xml).toContain('Test &amp; Co &lt;Safe&gt;');
    });
});
