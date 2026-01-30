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

const getCommonHeader = (formName: string, version: number) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<edp:Envelope xmlns:edp="http://edavki.durs.si/Documents/Schemas/EDP-Common-1.xsd" xmlns="http://edavki.durs.si/Documents/Schemas/${formName}_${version}.xsd">
  <edp:Header>
    <edp:taxpayer>
      <!-- Informacije o zavezancu se običajno izpolnijo v eDavkih po uvozu -->
    </edp:taxpayer>
  </edp:Header>
  <edp:AttachmentList/>
  <edp:Signatures/>
  <edp:body>`;
};

export const generateKDVPXml = (trades: RevolutTrade[], year: number): string => {
  let xml = getCommonHeader('Doh_KDVP', 9);
  xml += `
    <Doh_KDVP>
      <KDVP>
        <LetoInventure>${year}</LetoInventure>
`;

  trades.forEach((trade, index) => {
    xml += `
        <KDVPItem>
          <ZapSt>${index + 1}</ZapSt>
          <ISIN>${xmlEncode(trade.isin)}</ISIN>
          <Naziv>${xmlEncode(trade.securityName)}</Naziv>
          <Kolicina>${trade.quantity}</Kolicina>
          <Nabava>
            <Datum>${trade.dateAcquired}</Datum>
            <Vrednost>${formatNum(trade.costBasis)}</Vrednost>
          </Nabava>
          <Odsvojitev>
            <Datum>${trade.dateSold}</Datum>
            <Vrednost>${formatNum(trade.grossProceeds)}</Vrednost>
          </Odsvojitev>
        </KDVPItem>`;
  });

  xml += `
      </KDVP>
    </Doh_KDVP>
  </edp:body>
</edp:Envelope>`;

  return xml;
};

export const generateDivXml = (dividends: RevolutDividend[], year: number): string => {
  let xml = getCommonHeader('Doh_Div', 3);
  xml += `
    <Doh_Div>
      <Leto>${year}</Leto>
`;

  dividends.forEach((div, index) => {
    xml += `
      <DividendItem>
        <ZapSt>${index + 1}</ZapSt>
        <Datum>${div.date}</Datum>
        <ISIN>${xmlEncode(div.isin)}</ISIN>
        <Naziv>${xmlEncode(div.securityName)}</Naziv>
        <ZnesekDividende>${formatNum(div.grossAmount)}</ZnesekDividende>
        <PlacanDavekIT>${formatNum(div.withholdingTax)}</PlacanDavekIT>
        <Drzava>${xmlEncode(div.country)}</Drzava>
      </DividendItem>`;
  });

  xml += `
    </Doh_Div>
  </edp:body>
</edp:Envelope>`;

  return xml;
};
