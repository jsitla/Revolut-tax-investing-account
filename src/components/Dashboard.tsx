import { useState, useMemo, useEffect } from 'react';
import { RevolutExport } from '../types/revolut';
import { filterByYear } from '../utils/parser';
import { generateKDVPXml, generateDivXml } from '../utils/xml-builder';
import { saveAs } from 'file-saver';
import YearSelector from './YearSelector';
import SummaryCards from './SummaryCards';
import { TradesTable, DividendsTable } from './Tables';

interface DashboardProps {
    data: RevolutExport;
    onReset: () => void;
}

export default function Dashboard({ data, onReset }: DashboardProps) {
    // Extract available years from data
    const years = useMemo(() => {
        const tradeYears = data.trades.map(t => parseInt(t.dateSold.split('-')[0]));
        const divYears = data.dividends.map(d => parseInt(d.date.split('-')[0]));
        const uniqueYears = Array.from(new Set([...tradeYears, ...divYears])).sort((a, b) => b - a);
        return uniqueYears;
    }, [data]);

    // Default to most recent year, or first available
    const [selectedYear, setSelectedYear] = useState<number>(years[0] || new Date().getFullYear());

    // Update selected year if data changes and current selection is invalid
    useEffect(() => {
        if (years.length > 0 && !years.includes(selectedYear)) {
            setSelectedYear(years[0]);
        }
    }, [years, selectedYear]);

    // Filter data
    const filteredData = useMemo(() => {
        return filterByYear(data, selectedYear);
    }, [data, selectedYear]);

    // Calculate totals
    const totals = useMemo(() => {
        const totalPnL = filteredData.trades.reduce((sum, t) => sum + t.grossPnL, 0);
        const totalDividends = filteredData.dividends.reduce((sum, d) => sum + d.grossAmount, 0);
        const totalTax = filteredData.dividends.reduce((sum, d) => sum + d.withholdingTax, 0);
        // Find most common currency or use first found (assuming single currency for simplicity in summary)
        const currency = filteredData.trades[0]?.currency || filteredData.dividends[0]?.currency || 'EUR';

        return {
            totalPnL,
            totalDividends,
            totalTax,
            currency
        };
    }, [filteredData]);

    const handleDownloadKDVP = () => {
        const xml = generateKDVPXml(filteredData.trades, selectedYear);
        const blob = new Blob([xml], { type: 'text/xml;charset=utf-8' });
        saveAs(blob, `Doh-KDVP-${selectedYear}.xml`);
    };

    const handleDownloadDiv = () => {
        const xml = generateDivXml(filteredData.dividends, selectedYear);
        const blob = new Blob([xml], { type: 'text/xml;charset=utf-8' });
        saveAs(blob, `Doh-Div-${selectedYear}.xml`);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">Pregled leta {selectedYear}</h2>
                <button
                    onClick={onReset}
                    className="text-slate-400 hover:text-white hover:underline transition-colors text-sm"
                >
                    ← Naloži drugo datoteko
                </button>
            </div>

            <YearSelector
                years={years}
                selectedYear={selectedYear}
                onSelect={setSelectedYear}
            />

            <SummaryCards
                tradeCount={filteredData.trades.length}
                totalPnL={totals.totalPnL}
                dividendCount={filteredData.dividends.length}
                totalDividends={totals.totalDividends}
                totalTax={totals.totalTax}
                currency={totals.currency}
            />

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button
                    onClick={handleDownloadKDVP}
                    disabled={filteredData.trades.length === 0}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5M12 3v13.5" />
                    </svg>
                    Prenesi KDVP XML
                </button>
                <button
                    onClick={handleDownloadDiv}
                    disabled={filteredData.dividends.length === 0}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5M12 3v13.5" />
                    </svg>
                    Prenesi Dividende XML
                </button>
            </div>

            <TradesTable trades={filteredData.trades} />
            <div className="h-8"></div> {/* Spacer */}
            <DividendsTable dividends={filteredData.dividends} />
        </div>
    );
}
