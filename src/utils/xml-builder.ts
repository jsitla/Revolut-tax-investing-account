import { RevolutTrade, RevolutDividend } from '../types/revolut';

/**
 * Taxpayer configuration for FURS XML generation
 */
export interface TaxpayerConfig {
  taxNumber: string;        // Davčna številka (8 digits)
  name: string;             // Ime in priimek
  address: string;          // Naslov
  city: string;             // Kraj
  postNumber: string;       // Poštna številka
  postName: string;         // Pošta
  email?: string;           // Email (optional)
  telephoneNumber?: string; // Telefon (optional)
}

/**
 * Default taxpayer config - users should update this
 */
export const defaultTaxpayerConfig: TaxpayerConfig = {
  taxNumber: '',
  name: '',
  address: '',
  city: '',
  postNumber: '',
  postName: '',
  email: '',
  telephoneNumber: '',
};

/**
 * Decodes common HTML/XML entities back to their original characters.
 * This prevents double-encoding if input data already contains entities.
 */
const xmlDecode = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');
};

/**
 * Encodes a string for safe XML usage.
 * First decodes any existing entities to prevent double-encoding,
 * then properly encodes all special characters.
 */
const xmlEncode = (str: string): string => {
  if (!str) return '';
  // First decode any existing entities to prevent double-encoding
  const decoded = xmlDecode(str);
  // Then encode properly
  return decoded
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * Formats a number for FURS XML (specified decimal places).
 */
const formatNum = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals);
};

/**
 * Gets the ISO 2-letter country code from country name or code
 */
const getCountryCode = (country: string): string => {
  const countryMap: Record<string, string> = {
    'US': 'US',
    'USA': 'US',
    'United States': 'US',
    'GB': 'GB',
    'UK': 'GB',
    'United Kingdom': 'GB',
    'DE': 'DE',
    'Germany': 'DE',
    'FR': 'FR',
    'France': 'FR',
    'IE': 'IE',
    'Ireland': 'IE',
    'NL': 'NL',
    'Netherlands': 'NL',
    'CH': 'CH',
    'Switzerland': 'CH',
    'JP': 'JP',
    'Japan': 'JP',
    'CN': 'CN',
    'China': 'CN',
    'HK': 'HK',
    'Hong Kong': 'HK',
    'CA': 'CA',
    'Canada': 'CA',
    'AU': 'AU',
    'Australia': 'AU',
  };
  return countryMap[country] || country || 'US';
};

/**
 * Groups trades by ISIN/security for proper KDVP format
 */
const groupTradesBySecurity = (trades: RevolutTrade[]): Map<string, RevolutTrade[]> => {
  const grouped = new Map<string, RevolutTrade[]>();
  
  for (const trade of trades) {
    const key = trade.isin || trade.symbol;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(trade);
  }
  
  // Sort trades within each group by date
  for (const [, groupTrades] of grouped) {
    groupTrades.sort((a, b) => a.dateSold.localeCompare(b.dateSold));
  }
  
  return grouped;
};

/**
 * Generates the common XML envelope header according to EDP-Common-1.xsd
 */
const generateEnvelopeHeader = (
  schemaName: string,
  schemaVersion: number,
  taxpayer: TaxpayerConfig,
  isTest: boolean = false
): string => {
  const workflowId = isTest ? 'I' : 'O'; // I = informativni, O = original
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<Envelope xmlns="http://edavki.durs.si/Documents/Schemas/${schemaName}_${schemaVersion}.xsd" 
          xmlns:edp="http://edavki.durs.si/Documents/Schemas/EDP-Common-1.xsd">
  <edp:Header>
    <edp:taxpayer>
      <edp:taxNumber>${xmlEncode(taxpayer.taxNumber)}</edp:taxNumber>
      <edp:taxpayerType>FO</edp:taxpayerType>
      <edp:name>${xmlEncode(taxpayer.name)}</edp:name>
      <edp:address1>${xmlEncode(taxpayer.address)}</edp:address1>
      <edp:city>${xmlEncode(taxpayer.city)}</edp:city>
      <edp:postNumber>${xmlEncode(taxpayer.postNumber)}</edp:postNumber>
      <edp:postName>${xmlEncode(taxpayer.postName)}</edp:postName>
    </edp:taxpayer>
    <edp:Workflow>
      <edp:DocumentWorkflowID>${workflowId}</edp:DocumentWorkflowID>
    </edp:Workflow>
  </edp:Header>
  <edp:AttachmentList/>
  <edp:Signatures/>`;
};

/**
 * Generates Doh-KDVP XML for capital gains from securities trading.
 * Compliant with Doh_KDVP_9.xsd schema.
 * 
 * Structure:
 * - Envelope (root)
 *   - edp:Header (taxpayer info)
 *   - body
 *     - edp:bodyContent
 *     - Doh_KDVP
 *       - KDVP (header with metadata)
 *       - KDVPItem[] (one per security)
 *         - InventoryListType (PLVP for long positions)
 *         - Name, HasForeignTax, HasLossTransfer, ForeignTransfer, TaxDecreaseConformance
 *         - Securities
 *           - ISIN, Code, Name, IsFond
 *           - Row[] (transactions)
 *             - ID
 *             - Purchase: F1 (date), F2 (method), F3 (quantity), F4 (price per unit), F5 (inheritance tax)
 *             - Sale: F6 (date), F7 (quantity), F9 (price per unit)
 *             - F8 (running balance)
 */
export const generateKDVPXml = (
  trades: RevolutTrade[], 
  year: number,
  taxpayer: TaxpayerConfig = defaultTaxpayerConfig,
  isTest: boolean = false
): string => {
  const groupedTrades = groupTradesBySecurity(trades);
  const securityCount = groupedTrades.size;
  
  let xml = generateEnvelopeHeader('Doh_KDVP', 9, taxpayer, isTest);
  
  xml += `
  <body>
    <edp:bodyContent/>
    <Doh_KDVP>
      <KDVP>
        <DocumentWorkflowID>${isTest ? 'I' : 'O'}</DocumentWorkflowID>
        <Year>${year}</Year>
        <PeriodStart>${year}-01-01</PeriodStart>
        <PeriodEnd>${year}-12-31</PeriodEnd>
        <IsResident>true</IsResident>
        <TelephoneNumber>${xmlEncode(taxpayer.telephoneNumber || '')}</TelephoneNumber>
        <SecurityCount>${securityCount}</SecurityCount>
        <SecurityShortCount>0</SecurityShortCount>
        <SecurityWithContractCount>0</SecurityWithContractCount>
        <SecurityWithContractShortCount>0</SecurityWithContractShortCount>
        <ShareCount>0</ShareCount>
        <Email>${xmlEncode(taxpayer.email || '')}</Email>
      </KDVP>`;

  // Generate KDVPItem for each security
  for (const [, securityTrades] of groupedTrades) {
    const firstTrade = securityTrades[0];
    
    xml += `
      <KDVPItem>
        <InventoryListType>PLVP</InventoryListType>
        <Name>${xmlEncode(firstTrade.securityName || firstTrade.symbol)}</Name>
        <HasForeignTax>false</HasForeignTax>
        <HasLossTransfer>false</HasLossTransfer>
        <ForeignTransfer>false</ForeignTransfer>
        <TaxDecreaseConformance>false</TaxDecreaseConformance>
        <Securities>
          <ISIN>${xmlEncode(firstTrade.isin)}</ISIN>
          <Code>${xmlEncode((firstTrade.symbol || '').substring(0, 10))}</Code>
          <Name>${xmlEncode(firstTrade.securityName || firstTrade.symbol)}</Name>
          <IsFond>false</IsFond>`;
    
    let runningBalance = 0;
    let rowId = 0;
    
    // For each trade, we need to create both a Purchase row and a Sale row
    // Since Revolut provides closed positions (already matched buy/sell pairs)
    for (const trade of securityTrades) {
      // Purchase row (acquisition)
      rowId++;
      runningBalance += trade.quantity;
      const pricePerUnitAcquired = trade.quantity > 0 ? trade.costBasis / trade.quantity : 0;
      
      xml += `
          <Row>
            <ID>${rowId}</ID>
            <Purchase>
              <F1>${trade.dateAcquired}</F1>
              <F2>A</F2>
              <F3>${formatNum(trade.quantity, 4)}</F3>
              <F4>${formatNum(pricePerUnitAcquired, 4)}</F4>
              <F5>0.0000</F5>
            </Purchase>
            <F8>${formatNum(runningBalance, 4)}</F8>
          </Row>`;
      
      // Sale row (disposal)
      rowId++;
      runningBalance -= trade.quantity;
      const pricePerUnitSold = trade.quantity > 0 ? trade.grossProceeds / trade.quantity : 0;
      
      xml += `
          <Row>
            <ID>${rowId}</ID>
            <Sale>
              <F6>${trade.dateSold}</F6>
              <F7>${formatNum(trade.quantity, 4)}</F7>
              <F9>${formatNum(pricePerUnitSold, 4)}</F9>
            </Sale>
            <F8>${formatNum(runningBalance, 4)}</F8>
          </Row>`;
    }
    
    xml += `
        </Securities>
      </KDVPItem>`;
  }

  xml += `
    </Doh_KDVP>
  </body>
</Envelope>`;

  return xml;
};

/**
 * Generates Doh-Div XML for dividend income reporting.
 * Compliant with Doh_Div_3.xsd schema.
 * 
 * Structure:
 * - Envelope (root)
 *   - edp:Header (taxpayer info)
 *   - body
 *     - Doh_Div
 *       - Period (year)
 *       - EmailAddress, PhoneNumber, ResidentCountry, IsResident
 *     - Dividend[] (one per dividend payment)
 *       - Date, PayerIdentificationNumber, PayerName, PayerAddress, PayerCountry
 *       - Type (1 = dividend)
 *       - Value (gross amount in EUR)
 *       - ForeignTax (withholding tax in EUR)
 *       - SourceCountry
 *       - ReliefStatement (tax treaty reference, optional)
 */
export const generateDivXml = (
  dividends: RevolutDividend[], 
  year: number,
  taxpayer: TaxpayerConfig = defaultTaxpayerConfig,
  isTest: boolean = false
): string => {
  let xml = generateEnvelopeHeader('Doh_Div', 3, taxpayer, isTest);
  
  xml += `
  <body>
    <Doh_Div>
      <Period>${year}</Period>
      <EmailAddress>${xmlEncode(taxpayer.email || '')}</EmailAddress>
      <PhoneNumber>${xmlEncode(taxpayer.telephoneNumber || '')}</PhoneNumber>
      <ResidentCountry>SI</ResidentCountry>
      <IsResident>true</IsResident>
    </Doh_Div>`;

  // Sort dividends by date
  const sortedDividends = [...dividends].sort((a, b) => a.date.localeCompare(b.date));
  
  for (const div of sortedDividends) {
    // Skip zero or negative amounts
    if (div.grossAmount <= 0) continue;
    
    const countryCode = getCountryCode(div.country);
    
    // Build dividend element - only include optional fields if they have values
    // FURS schema doesn't allow empty elements for optional fields
    xml += `
    <Dividend>
      <Date>${div.date}</Date>`;
    
    // PayerIdentificationNumber is optional - only include if available
    // (Revolut doesn't provide company tax IDs)
    
    xml += `
      <PayerName>${xmlEncode(div.securityName || div.symbol)}</PayerName>`;
    
    // PayerAddress is optional - only include if available
    // (Revolut doesn't provide company addresses)
    
    if (countryCode) {
      xml += `
      <PayerCountry>${countryCode}</PayerCountry>`;
    }
    
    xml += `
      <Type>1</Type>
      <Value>${formatNum(div.grossAmount)}</Value>
      <ForeignTax>${formatNum(div.withholdingTax)}</ForeignTax>`;
    
    if (countryCode) {
      xml += `
      <SourceCountry>${countryCode}</SourceCountry>`;
    }
    
    // ReliefStatement - tax treaty reference, empty if no treaty applies
    xml += `
      <ReliefStatement></ReliefStatement>
    </Dividend>`;
  }

  xml += `
  </body>
</Envelope>`;

  return xml;
};

/**
 * Validates if taxpayer config has minimum required fields
 */
export const validateTaxpayerConfig = (config: TaxpayerConfig): string[] => {
  const errors: string[] = [];
  
  if (!config.taxNumber || config.taxNumber.length !== 8) {
    errors.push('Davčna številka mora imeti 8 znakov');
  }
  if (!config.name) {
    errors.push('Ime in priimek je obvezno polje');
  }
  if (!config.address) {
    errors.push('Naslov je obvezno polje');
  }
  if (!config.postNumber) {
    errors.push('Poštna številka je obvezno polje');
  }
  if (!config.postName) {
    errors.push('Pošta je obvezno polje');
  }
  if (!config.city) {
    errors.push('Kraj je obvezno polje');
  }
  
  return errors;
};

/**
 * Check if any trades have non-EUR currency that needs conversion warning
 */
export const hasNonEurCurrency = (trades: RevolutTrade[], dividends: RevolutDividend[]): boolean => {
  const tradeCurrencies = trades.map(t => t.currency);
  const dividendCurrencies = dividends.map(d => d.currency);
  const allCurrencies = [...tradeCurrencies, ...dividendCurrencies];
  
  return allCurrencies.some(c => c && c !== 'EUR');
};

/**
 * Escapes a string for safe CSV usage (handles semicolons, quotes, newlines)
 */
const csvEscape = (str: string): string => {
  if (!str) return '';
  // If string contains semicolon, quote, or newline, wrap in quotes and escape internal quotes
  if (str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
};

/**
 * Formats date from YYYY-MM-DD to DD.MM.YYYY format required by FURS
 */
const formatDateForFurs = (isoDate: string): string => {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
};

/**
 * Generates DOH-DIV CSV for dividend income reporting.
 * Compliant with FURS CSV format specification (doh_odm_div_csv).
 * 
 * CSV Structure:
 * - Line 1: Form header (#FormCode,Version,TaxPayerID,TaxPayerType,DocumentWorkflowID,...)
 * - Line 2: Data header with column names
 * - Lines 3+: Dividend data rows (semicolon-separated)
 * 
 * Fields per dividend:
 * - datum prejema dividende (DD.MM.YYYY)
 * - davčna številka izplačevalca dividend (empty for foreign)
 * - identifikacijska številka izplačevalca dividend (sequential for same-day)
 * - naziv izplačevalca dividend
 * - naslov izplačevalca dividend
 * - država izplačevalca dividend (2-letter code)
 * - vrsta dividende (1 = dividend)
 * - znesek dividend (gross amount in EUR)
 * - tuji davek (foreign tax in EUR, empty for SI)
 * - država vira (2-letter source country code)
 * - uveljavljam oprostitev po mednarodni pogodbi (treaty reference, optional)
 */
export const generateDivCsv = (
  dividends: RevolutDividend[], 
  _year: number,
  taxpayer: TaxpayerConfig = defaultTaxpayerConfig,
  isTest: boolean = false
): string => {
  const workflowId = isTest ? 'I' : 'O'; // O = original, I = informativni
  
  // Line 1: Form header
  // #FormCode,Version,TaxPayerID,TaxPayerType,DocumentWorkflowID,,,,,,
  let csv = `#FormCode;Version;TaxPayerID;TaxPayerType;DocumentWorkflowID;;;;;;\n`;
  csv += `DOH-DIV;3.9;${taxpayer.taxNumber};FO;${workflowId};;;;;;\n`;
  
  // Line 2: Column headers (starts with #)
  csv += `#datum prejema dividende;davčna številka izplačevalca dividend;identifikacijska številka izplačevalca dividend;naziv izplačevalca dividend;naslov izplačevalca dividend;država izplačevalca dividend;vrsta dividende;znesek dividend;tuji davek;država vira;uveljavljam oprostitev po mednarodni pogodbi\n`;
  
  // Sort dividends by date
  const sortedDividends = [...dividends].sort((a, b) => a.date.localeCompare(b.date));
  
  // Track same-day dividends for sequential numbering
  const sameDayCounter = new Map<string, number>();
  
  for (const div of sortedDividends) {
    // Skip zero or negative amounts
    if (div.grossAmount <= 0) continue;
    
    const countryCode = getCountryCode(div.country);
    const dateFormatted = formatDateForFurs(div.date);
    
    // For same-day dividends from same issuer, use sequential ID to avoid duplicates
    const dayKey = `${div.date}-${div.symbol}`;
    const currentCount = (sameDayCounter.get(dayKey) || 0) + 1;
    sameDayCounter.set(dayKey, currentCount);
    
    // Foreign payer ID: use sequential number if multiple dividends on same day
    const payerId = currentCount > 1 ? currentCount.toString() : '';
    
    // Payer name (security name or symbol)
    const payerName = csvEscape(div.securityName || div.symbol);
    
    // Payer address - use placeholder since Revolut doesn't provide addresses
    const payerAddress = csvEscape(countryCode === 'US' ? 'USA' : countryCode);
    
    // Dividend type: 1 = regular dividend
    const dividendType = '1';
    
    // Amount in EUR (2 decimal places)
    const amount = formatNum(div.grossAmount);
    
    // Foreign tax - only for non-SI dividends
    const foreignTax = countryCode !== 'SI' ? formatNum(div.withholdingTax) : '';
    
    // Source country (usually same as payer country)
    const sourceCountry = countryCode;
    
    // Treaty exemption - empty by default
    const treatyExemption = '';
    
    // Build CSV row (semicolon-separated)
    csv += `${dateFormatted};;${payerId};${payerName};${payerAddress};${countryCode};${dividendType};${amount};${foreignTax};${sourceCountry};${treatyExemption}\n`;
  }
  
  return csv;
};
