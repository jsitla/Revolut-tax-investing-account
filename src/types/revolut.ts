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
    // EUR converted values (for FURS XML)
    exchangeRateAcquired?: number; // ECB rate on acquisition date
    exchangeRateSold?: number;     // ECB rate on sale date
    costBasisEur?: number;
    grossProceedsEur?: number;
    grossPnLEur?: number;
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
    // EUR converted values (for FURS XML)
    exchangeRate?: number; // ECB rate on dividend date
    grossAmountEur?: number;
    withholdingTaxEur?: number;
}

export interface RevolutExport {
    trades: RevolutTrade[];
    dividends: RevolutDividend[];
    // Conversion metadata
    conversionApplied?: boolean;
    conversionErrors?: string[];
    missingRateDates?: string[];
}
