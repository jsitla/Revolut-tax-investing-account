export interface RevolutTrade {
    dateAcquired: string; // ISO date YYYY-MM-DD
    dateSold: string; // ISO date YYYY-MM-DD
    symbol: string;
    securityName: string;
    isin: string;
    country: string;
    quantity: number;
    costBasis: number;
    grossProceeds: number;
    grossPnL: number;
    currency: string;
}

export interface RevolutDividend {
    date: string; // ISO date YYYY-MM-DD
    symbol: string;
    securityName: string;
    isin: string;
    country: string;
    grossAmount: number;
    withholdingTax: number;
    netAmount?: number;
    currency: string;
}

export interface RevolutExport {
    trades: RevolutTrade[];
    dividends: RevolutDividend[];
}
