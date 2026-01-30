import { useState, useMemo, useEffect } from 'react';
import { RevolutExport } from '../types/revolut';
import { filterByYear } from '../utils/parser';
import { generateKDVPXml, generateDivXml } from '../utils/xml-builder';
import { saveAs } from 'file-saver';
import YearSelector from './YearSelector';
import SummaryCards from './SummaryCards';
import { TradesTable, DividendsTable } from './Tables';
import XMLPreview from './XMLPreview';
import * as Tabs from '@radix-ui/react-tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { FileDown, Table, PieChart } from 'lucide-react';

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

    const kdvpXml = useMemo(() => generateKDVPXml(filteredData.trades, selectedYear), [filteredData.trades, selectedYear]);
    const divXml = useMemo(() => generateDivXml(filteredData.dividends, selectedYear), [filteredData.dividends, selectedYear]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Pregled leta {selectedYear}</h2>
                    <p className="text-slate-400 text-sm mt-1">Preglejte transakcije pred izvozom za FURS.</p>
                </div>
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                    </svg>
                    Naloži drugo datoteko
                </button>
            </div>

            <YearSelector
                years={years}
                selectedYear={selectedYear}
                onSelect={setSelectedYear}
            />

            <Tabs.Root defaultValue="summary" className="w-full">
                <Tabs.List className="flex gap-2 p-1 bg-slate-800/50 rounded-xl border border-slate-700/50 mb-8 overflow-x-auto">
                    <Tabs.Trigger
                        value="summary"
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 hover:text-slate-200"
                    >
                        <PieChart className="w-4 h-4" />
                        Povzetek
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="trades"
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 hover:text-slate-200"
                    >
                        <Table className="w-4 h-4" />
                        Prodaje ({filteredData.trades.length})
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="dividends"
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 hover:text-slate-200"
                    >
                        <Table className="w-4 h-4" />
                        Dividende ({filteredData.dividends.length})
                    </Tabs.Trigger>
                </Tabs.List>

                <AnimatePresence mode="wait">
                    <Tabs.Content value="summary" key="summary">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-8"
                        >
                            <SummaryCards
                                tradeCount={filteredData.trades.length}
                                totalPnL={totals.totalPnL}
                                dividendCount={filteredData.dividends.length}
                                totalDividends={totals.totalDividends}
                                totalTax={totals.totalTax}
                                currency={totals.currency}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-800/40 rounded-2xl border border-slate-700/50 flex flex-col justify-between gap-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                            <FileDown className="w-5 h-5 text-emerald-400" />
                                            Doh-KDVP (Kapitalski dobički)
                                        </h3>
                                        <p className="text-sm text-slate-400">XML datoteka za prijavo dobičkov od prodaje delnic.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleDownloadKDVP}
                                            disabled={filteredData.trades.length === 0}
                                            className="grow bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-900/20"
                                        >
                                            Prenesi XML
                                        </button>
                                        <XMLPreview
                                            xml={kdvpXml}
                                            title={`Doh-KDVP ${selectedYear}`}
                                            onDownload={handleDownloadKDVP}
                                        />
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-800/40 rounded-2xl border border-slate-700/50 flex flex-col justify-between gap-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                            <FileDown className="w-5 h-5 text-indigo-400" />
                                            Doh-Div (Dividende)
                                        </h3>
                                        <p className="text-sm text-slate-400">XML datoteka za prijavo prejetih dividend.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleDownloadDiv}
                                            disabled={filteredData.dividends.length === 0}
                                            className="grow bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-900/20"
                                        >
                                            Prenesi XML
                                        </button>
                                        <XMLPreview
                                            xml={divXml}
                                            title={`Doh-Div ${selectedYear}`}
                                            onDownload={handleDownloadDiv}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </Tabs.Content>

                    <Tabs.Content value="trades" key="trades">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <TradesTable trades={filteredData.trades} />
                        </motion.div>
                    </Tabs.Content>

                    <Tabs.Content value="dividends" key="dividends">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <DividendsTable dividends={filteredData.dividends} />
                        </motion.div>
                    </Tabs.Content>
                </AnimatePresence>
            </Tabs.Root>
        </motion.div>
    );
}
