import { RevolutTrade, RevolutDividend } from '../types/revolut';

/**
 * Encodes a string for safe XML usage.
 */
const xmlEncode = (str: string): string => {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

/**
 * Formats a number for FURS XML (usually 2 decimal places).
 */
const formatNum = (num: number): string => {
    return num.toFixed(2);
};

const getCommonHeader = (formName: string) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<ElectronicDeclaration xmlns="http://edavki.durs.si/Documents/Schemas/${formName}_9.xsd" xmlns:edp="http://edavki.durs.si/Documents/Schemas/EDP-Common-1.xsd">
  <edp:Header>
    <edp:taxpayer>
      <!-- Informacije o zavezancu se običajno izpolnijo v eDavkih po uvozu ali so del profila -->
    </edp:taxpayer>
  </edp:Header>`;
};

export const generateKDVPXml = (trades: RevolutTrade[], year: number): string => {
    let xml = getCommonHeader('Doh_KDVP');
    xml += `
  <Data>
    <KDVP>
      <InventoryYear>${year}</InventoryYear>
`;

    // Group trades by ISIN or process individually? 
    // FURS KDVP typically lists each disposal separately with its acquisition.
    // Revolut "Income from Sells" already provides the matched pairs.

    trades.forEach((trade, index) => {
        xml += `
      <KDVPItem>
        <SeqNum>${index + 1}</SeqNum>
        <Symbol>${xmlEncode(trade.symbol)}</Symbol>
        <Isin>${xmlEncode(trade.isin)}</Isin>
        <SecurityName>${xmlEncode(trade.securityName)}</SecurityName>
        <Quantity>${trade.quantity}</Quantity>
        <Purchase>
          <Date>${trade.dateAcquired}</Date>
          <Value>${formatNum(trade.costBasis)}</Value>
        </Purchase>
        <Sale>
          <Date>${trade.dateSold}</Date>
          <Value>${formatNum(trade.grossProceeds)}</Value>
        </Sale>
      </KDVPItem>`;
    });

    xml += `
    </KDVP>
  </Data>
</ElectronicDeclaration>`;

    return xml;
};

export const generateDivXml = (dividends: RevolutDividend[], year: number): string => {
    let xml = getCommonHeader('Doh_Div');
    xml += `
  <Data>
    <Doh_Div>
      <Year>${year}</Year>
`;

    dividends.forEach((div, index) => {
        xml += `
      <DividendItem>
        <SeqNum>${index + 1}</SeqNum>
        <Date>${div.date}</Date>
        <Symbol>${xmlEncode(div.symbol)}</Symbol>
        <Isin>${xmlEncode(div.isin)}</Isin>
        <SecurityName>${xmlEncode(div.securityName)}</SecurityName>
        <GrossAmount>${formatNum(div.grossAmount)}</GrossAmount>
        <WithholdingTax>${formatNum(div.withholdingTax)}</WithholdingTax>
        <CountryCode>${xmlEncode(div.country)}</CountryCode>
      </DividendItem>`;
    });

    xml += `
    </Doh_Div>
  </Data>
</ElectronicDeclaration>`;

    return xml;
};
