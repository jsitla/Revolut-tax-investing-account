import { useState, useMemo, useEffect } from 'react';
import { RevolutExport } from '../types/revolut';
import { filterByYear } from '../utils/parser';
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

            <TradesTable trades={filteredData.trades} />
            <div className="h-8"></div> {/* Spacer */}
            <DividendsTable dividends={filteredData.dividends} />
        </div>
    );
}
