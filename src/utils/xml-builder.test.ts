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
        expect(xml).toContain('<edp:Envelope');
        expect(xml).toContain('<LetoInventure>2024</LetoInventure>');
        expect(xml).toContain('<ISIN>US67066G1040</ISIN>');
        expect(xml).toContain('<Naziv>NVIDIA</Naziv>');
        expect(xml).toContain('<Vrednost>269.84</Vrednost>');
        expect(xml).toContain('<Vrednost>3654.20</Vrednost>');
    });

    it('should generate valid Dividend XML structure', () => {
        const xml = generateDivXml([sampleDiv], 2024);
        expect(xml).toContain('<edp:Envelope');
        expect(xml).toContain('<Leto>2024</Leto>');
        expect(xml).toContain('<ISIN>US8740391003</ISIN>');
        expect(xml).toContain('<ZnesekDividende>16.92</ZnesekDividende>');
        expect(xml).toContain('<PlacanDavekIT>3.55</PlacanDavekIT>');
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
