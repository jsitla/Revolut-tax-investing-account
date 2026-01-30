import { describe, it, expect } from 'vitest';
import { generateKDVPXml, generateDivXml, TaxpayerConfig, validateTaxpayerConfig, hasNonEurCurrency } from './xml-builder';
import { RevolutTrade, RevolutDividend } from '../types/revolut';

describe('xml-builder', () => {
    const sampleTaxpayer: TaxpayerConfig = {
        taxNumber: '12345678',
        name: 'Janez Novak',
        address: 'Slovenska 1',
        city: 'Ljubljana',
        postNumber: '1000',
        postName: 'Ljubljana',
        email: 'janez@test.si',
        telephoneNumber: '01 234 5678'
    };

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

    describe('generateKDVPXml', () => {
        it('should generate valid KDVP XML structure with proper schema', () => {
            const xml = generateKDVPXml([sampleTrade], 2024, sampleTaxpayer);
            
            // Check envelope and namespaces
            expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
            expect(xml).toContain('<Envelope xmlns="http://edavki.durs.si/Documents/Schemas/Doh_KDVP_9.xsd"');
            expect(xml).toContain('xmlns:edp="http://edavki.durs.si/Documents/Schemas/EDP-Common-1.xsd"');
            
            // Check header taxpayer info
            expect(xml).toContain('<edp:Header>');
            expect(xml).toContain('<edp:taxpayer>');
            expect(xml).toContain('<edp:taxNumber>12345678</edp:taxNumber>');
            expect(xml).toContain('<edp:taxpayerType>FO</edp:taxpayerType>');
            expect(xml).toContain('<edp:name>Janez Novak</edp:name>');
            
            // Check body structure
            expect(xml).toContain('<body>');
            expect(xml).toContain('<edp:bodyContent/>');
            expect(xml).toContain('<Doh_KDVP>');
            
            // Check KDVP header
            expect(xml).toContain('<KDVP>');
            expect(xml).toContain('<DocumentWorkflowID>O</DocumentWorkflowID>');
            expect(xml).toContain('<Year>2024</Year>');
            expect(xml).toContain('<PeriodStart>2024-01-01</PeriodStart>');
            expect(xml).toContain('<PeriodEnd>2024-12-31</PeriodEnd>');
            expect(xml).toContain('<IsResident>true</IsResident>');
            expect(xml).toContain('<SecurityCount>1</SecurityCount>');
        });

        it('should generate proper KDVPItem structure', () => {
            const xml = generateKDVPXml([sampleTrade], 2024, sampleTaxpayer);
            
            // Check KDVPItem structure
            expect(xml).toContain('<KDVPItem>');
            expect(xml).toContain('<InventoryListType>PLVP</InventoryListType>');
            expect(xml).toContain('<Name>NVIDIA</Name>');
            expect(xml).toContain('<HasForeignTax>false</HasForeignTax>');
            expect(xml).toContain('<HasLossTransfer>false</HasLossTransfer>');
            expect(xml).toContain('<ForeignTransfer>false</ForeignTransfer>');
            expect(xml).toContain('<TaxDecreaseConformance>false</TaxDecreaseConformance>');
            
            // Check Securities structure
            expect(xml).toContain('<Securities>');
            expect(xml).toContain('<ISIN>US67066G1040</ISIN>');
            expect(xml).toContain('<Code>NVDA</Code>');
            expect(xml).toContain('<IsFond>false</IsFond>');
        });

        it('should generate proper Row structure with F-fields', () => {
            const xml = generateKDVPXml([sampleTrade], 2024, sampleTaxpayer);
            
            // Check Purchase row (F1-F5)
            expect(xml).toContain('<Row>');
            expect(xml).toContain('<ID>1</ID>');
            expect(xml).toContain('<Purchase>');
            expect(xml).toContain('<F1>2020-04-09</F1>');  // Date acquired
            expect(xml).toContain('<F2>A</F2>');           // Acquisition method (A = purchase)
            expect(xml).toContain('<F3>4.0000</F3>');      // Quantity
            expect(xml).toContain('<F4>67.4600</F4>');     // Price per unit (269.84/4)
            expect(xml).toContain('<F5>0.0000</F5>');      // Inheritance tax
            
            // Check Sale row (F6, F7, F9)
            expect(xml).toContain('<Sale>');
            expect(xml).toContain('<F6>2024-03-07</F6>');  // Date sold
            expect(xml).toContain('<F7>4.0000</F7>');      // Quantity
            expect(xml).toContain('<F9>913.5500</F9>');    // Price per unit (3654.20/4)
            
            // Check running balance
            expect(xml).toContain('<F8>4.0000</F8>');      // After purchase
            expect(xml).toContain('<F8>0.0000</F8>');      // After sale
        });

        it('should set DocumentWorkflowID to I for test mode', () => {
            const xml = generateKDVPXml([sampleTrade], 2024, sampleTaxpayer, true);
            expect(xml).toContain('<DocumentWorkflowID>I</DocumentWorkflowID>');
        });

        it('should group multiple trades of same security', () => {
            const trades: RevolutTrade[] = [
                { ...sampleTrade, dateAcquired: '2024-01-01', dateSold: '2024-02-01' },
                { ...sampleTrade, dateAcquired: '2024-02-15', dateSold: '2024-03-15' }
            ];
            const xml = generateKDVPXml(trades, 2024, sampleTaxpayer);
            
            // Should have only one KDVPItem for NVIDIA but multiple rows
            const kdvpItemMatches = xml.match(/<KDVPItem>/g);
            expect(kdvpItemMatches).toHaveLength(1);
            
            // Should have 4 rows (2 purchases + 2 sales)
            const rowMatches = xml.match(/<Row>/g);
            expect(rowMatches).toHaveLength(4);
        });

        it('should encode special characters', () => {
            const specialTrade: RevolutTrade = {
                ...sampleTrade,
                securityName: 'Test & Co <Safe>'
            };
            const xml = generateKDVPXml([specialTrade], 2024, sampleTaxpayer);
            expect(xml).toContain('Test &amp; Co &lt;Safe&gt;');
        });
    });

    describe('generateDivXml', () => {
        it('should generate valid Doh-Div XML structure', () => {
            const xml = generateDivXml([sampleDiv], 2024, sampleTaxpayer);
            
            // Check envelope and namespaces
            expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
            expect(xml).toContain('<Envelope xmlns="http://edavki.durs.si/Documents/Schemas/Doh_Div_3.xsd"');
            expect(xml).toContain('xmlns:edp="http://edavki.durs.si/Documents/Schemas/EDP-Common-1.xsd"');
            
            // Check header
            expect(xml).toContain('<edp:Header>');
            expect(xml).toContain('<edp:taxpayer>');
            expect(xml).toContain('<edp:taxNumber>12345678</edp:taxNumber>');
        });

        it('should generate proper Doh_Div header', () => {
            const xml = generateDivXml([sampleDiv], 2024, sampleTaxpayer);
            
            expect(xml).toContain('<Doh_Div>');
            expect(xml).toContain('<Period>2024</Period>');
            expect(xml).toContain('<EmailAddress>janez@test.si</EmailAddress>');
            expect(xml).toContain('<PhoneNumber>01 234 5678</PhoneNumber>');
            expect(xml).toContain('<ResidentCountry>SI</ResidentCountry>');
            expect(xml).toContain('<IsResident>true</IsResident>');
        });

        it('should generate proper Dividend element structure', () => {
            const xml = generateDivXml([sampleDiv], 2024, sampleTaxpayer);
            
            expect(xml).toContain('<Dividend>');
            expect(xml).toContain('<Date>2024-01-10</Date>');
            expect(xml).toContain('<PayerName>Taiwan Semiconductor</PayerName>');
            expect(xml).toContain('<PayerCountry>US</PayerCountry>');
            expect(xml).toContain('<Type>1</Type>');
            expect(xml).toContain('<Value>16.92</Value>');
            expect(xml).toContain('<ForeignTax>3.55</ForeignTax>');
            expect(xml).toContain('<SourceCountry>US</SourceCountry>');
        });

        it('should skip dividends with zero or negative amounts', () => {
            const dividends: RevolutDividend[] = [
                sampleDiv,
                { ...sampleDiv, grossAmount: 0, symbol: 'ZERO' },
                { ...sampleDiv, grossAmount: -5, symbol: 'NEG' }
            ];
            const xml = generateDivXml(dividends, 2024, sampleTaxpayer);
            
            // Should only have one Dividend element
            const dividendMatches = xml.match(/<Dividend>/g);
            expect(dividendMatches).toHaveLength(1);
            expect(xml).not.toContain('ZERO');
            expect(xml).not.toContain('NEG');
        });

        it('should sort dividends by date', () => {
            const dividends: RevolutDividend[] = [
                { ...sampleDiv, date: '2024-06-15' },
                { ...sampleDiv, date: '2024-01-10' },
                { ...sampleDiv, date: '2024-03-20' }
            ];
            const xml = generateDivXml(dividends, 2024, sampleTaxpayer);
            
            const datePattern = /<Date>(\d{4}-\d{2}-\d{2})<\/Date>/g;
            const dates: string[] = [];
            let match;
            while ((match = datePattern.exec(xml)) !== null) {
                dates.push(match[1]);
            }
            
            expect(dates).toEqual(['2024-01-10', '2024-03-20', '2024-06-15']);
        });
    });

    describe('validateTaxpayerConfig', () => {
        it('should return no errors for valid config', () => {
            const errors = validateTaxpayerConfig(sampleTaxpayer);
            expect(errors).toHaveLength(0);
        });

        it('should return error for invalid tax number', () => {
            const invalidConfig = { ...sampleTaxpayer, taxNumber: '123' };
            const errors = validateTaxpayerConfig(invalidConfig);
            expect(errors).toContain('Davčna številka mora imeti 8 znakov');
        });

        it('should return errors for missing required fields', () => {
            const emptyConfig: TaxpayerConfig = {
                taxNumber: '',
                name: '',
                address: '',
                city: '',
                postNumber: '',
                postName: ''
            };
            const errors = validateTaxpayerConfig(emptyConfig);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors).toContain('Davčna številka mora imeti 8 znakov');
            expect(errors).toContain('Ime in priimek je obvezno polje');
        });
    });

    describe('hasNonEurCurrency', () => {
        it('should return true when trades have non-EUR currency', () => {
            const trades = [sampleTrade]; // USD currency
            const dividends: RevolutDividend[] = [];
            expect(hasNonEurCurrency(trades, dividends)).toBe(true);
        });

        it('should return false when all currencies are EUR', () => {
            const trades: RevolutTrade[] = [{ ...sampleTrade, currency: 'EUR' }];
            const dividends = [sampleDiv]; // EUR currency
            expect(hasNonEurCurrency(trades, dividends)).toBe(false);
        });

        it('should check both trades and dividends', () => {
            const trades: RevolutTrade[] = [{ ...sampleTrade, currency: 'EUR' }];
            const dividends: RevolutDividend[] = [{ ...sampleDiv, currency: 'USD' }];
            expect(hasNonEurCurrency(trades, dividends)).toBe(true);
        });
    });
});
