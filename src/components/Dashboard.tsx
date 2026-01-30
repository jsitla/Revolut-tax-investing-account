import { useState, useMemo, useEffect } from 'react';
import { RevolutExport } from '../types/revolut';
import { filterByYear } from '../utils/parser';
import { generateKDVPXml, generateDivCsv, TaxpayerConfig, validateTaxpayerConfig } from '../utils/xml-builder';
import { saveAs } from 'file-saver';
import YearSelector from './YearSelector';
import SummaryCards from './SummaryCards';
import { TradesTable, DividendsTable } from './Tables';
import XMLPreview from './XMLPreview';
import TaxpayerForm, { loadTaxpayerConfig } from './TaxpayerForm';
import * as Tabs from '@radix-ui/react-tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { FileDown, Table, PieChart, AlertTriangle, Shield, Info, FlaskConical } from 'lucide-react';

interface DashboardProps {
    data: RevolutExport;
    onReset: () => void;
}

export default function Dashboard({ data, onReset }: DashboardProps) {
    // Taxpayer configuration
    const [taxpayerConfig, setTaxpayerConfig] = useState<TaxpayerConfig>(() => loadTaxpayerConfig());

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

    const totals = useMemo(() => {
        const totalPnL = filteredData.trades.reduce((sum, t) => sum + t.grossPnL, 0);
        const totalDividends = filteredData.dividends.reduce((sum, d) => sum + d.grossAmount, 0);
        const totalTax = filteredData.dividends.reduce((sum, d) => sum + d.withholdingTax, 0);

        const currencies = new Set([
            ...filteredData.trades.map(t => t.currency),
            ...filteredData.dividends.map(d => d.currency)
        ]);
        const hasNonEur = Array.from(currencies).some(c => c && c !== 'EUR');
        const primaryCurrency = filteredData.trades[0]?.currency || filteredData.dividends[0]?.currency || 'EUR';

        return {
            totalPnL,
            totalDividends,
            totalTax,
            currency: primaryCurrency,
            hasNonEur
        };
    }, [filteredData]);

    // Validate taxpayer config
    const taxpayerErrors = useMemo(() => validateTaxpayerConfig(taxpayerConfig), [taxpayerConfig]);
    const isTaxpayerValid = taxpayerErrors.length === 0;

    const handleDownloadKDVP = () => {
        if (!isTaxpayerValid) {
            alert('Prosim izpolnite vse obvezne podatke davčnega zavezanca:\n\n' + taxpayerErrors.join('\n'));
            return;
        }
        const xml = generateKDVPXml(filteredData.trades, selectedYear, taxpayerConfig);
        const blob = new Blob([xml], { type: 'text/xml;charset=utf-8' });
        saveAs(blob, `Doh-KDVP-${selectedYear}.xml`);
    };

    const handleDownloadDiv = () => {
        if (!isTaxpayerValid) {
            alert('Prosim izpolnite vse obvezne podatke davčnega zavezanca:\n\n' + taxpayerErrors.join('\n'));
            return;
        }
        // FURS uses CSV format for dividend reporting (not XML)
        const csv = generateDivCsv(filteredData.dividends, selectedYear, taxpayerConfig);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, `Doh-Div-${selectedYear}.csv`);
    };

    const kdvpXml = useMemo(() => generateKDVPXml(filteredData.trades, selectedYear, taxpayerConfig), [filteredData.trades, selectedYear, taxpayerConfig]);
    // FURS uses CSV format for dividend reporting
    const divCsv = useMemo(() => generateDivCsv(filteredData.dividends, selectedYear, taxpayerConfig), [filteredData.dividends, selectedYear, taxpayerConfig]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
            {/* Hero Section */}
            <div className="relative py-10 md:py-16 text-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-500/20 rounded-full blur-[100px] -z-10"></div>
                
                <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-6">
                    Poročanje <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">FURS {selectedYear}</span>
                </h1>
                
                <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
                    Avtomatizirana priprava XML datotek za eDavke iz Revolut izpiskov.
                    Hitro, varno in zanesljivo.
                </p>

                <div className="flex justify-center gap-4">
                     <button
                        onClick={onReset}
                        className="group flex items-center gap-2 text-slate-300 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-6 py-2.5 rounded-full border border-white/10 backdrop-blur-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Naloži drugo datoteko
                    </button>
                </div>

                {/* Disclaimer badges */}
                <div className="flex flex-wrap justify-center gap-3 mt-8">
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 text-sm font-medium">Vsi podatki ostanejo v vašem brskalniku</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
                        <FlaskConical className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-400 text-sm font-medium">Beta verzija</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                 <YearSelector
                    years={years}
                    selectedYear={selectedYear}
                    onSelect={setSelectedYear}
                />
            </div>

            {/* Taxpayer Information Form */}
            <div className="max-w-3xl mx-auto">
                <TaxpayerForm
                    config={taxpayerConfig}
                    onChange={setTaxpayerConfig}
                />
            </div>


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
                            {totals.hasNonEur && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-4 items-start mb-8"
                                >
                                    <div className="bg-amber-500/20 p-2 rounded-lg">
                                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-amber-500 font-bold text-sm">Opozorilo o valuti ({totals.currency})</h4>
                                        <p className="text-amber-500/80 text-xs mt-1 leading-relaxed">
                                            Zaznane so transakcije v tuji valuti. FURS zahteva, da so vse vrednosti v XML datoteki preračunane v **EUR** po tečaju Banke Slovenije na dan posla.
                                            Ta aplikacija trenutno izvozi vrednosti neposredno iz Revolut izpiska. Pred oddajo vrednosti preverite in po potrebi ročno popravite v eDavkih.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            <SummaryCards
                                tradeCount={filteredData.trades.length}
                                totalPnL={totals.totalPnL}
                                dividendCount={filteredData.dividends.length}
                                totalDividends={totals.totalDividends}
                                totalTax={totals.totalTax}
                                currency={totals.currency}
                            />

                            {!isTaxpayerValid && (
                                <div className="p-4 bg-amber-900/30 border border-amber-600/50 rounded-xl flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-amber-200 font-medium">Manjkajoči podatki davčnega zavezanca</p>
                                        <p className="text-amber-300/70 text-sm mt-1">Prosim izpolnite obrazec "Podatki davčnega zavezanca" zgoraj, da boste lahko prenesli veljavne XML datoteke.</p>
                                    </div>
                                </div>
                            )}

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
                                            disabled={filteredData.trades.length === 0 || !isTaxpayerValid}
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
                                        <p className="text-sm text-slate-400">CSV datoteka za prijavo prejetih dividend.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleDownloadDiv}
                                            disabled={filteredData.dividends.length === 0 || !isTaxpayerValid}
                                            className="grow bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-900/20"
                                        >
                                            Prenesi CSV
                                        </button>
                                        <XMLPreview
                                            xml={divCsv}
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

            {/* Footer disclaimer */}
            <div className="mt-16 p-6 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
                <div className="flex flex-col md:flex-row gap-6 text-sm text-slate-400">
                    <div className="flex items-start gap-3 flex-1">
                        <div className="bg-emerald-500/20 p-2 rounded-lg shrink-0">
                            <Shield className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                            <h4 className="text-emerald-400 font-semibold mb-1">Zasebnost podatkov</h4>
                            <p className="leading-relaxed">Vsa obdelava poteka lokalno v vašem brskalniku. Vaši podatki se nikoli ne pošiljajo na naše strežnike - ne shranjujemo in ne obdelujemo vaših finančnih podatkov.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 flex-1">
                        <div className="bg-amber-500/20 p-2 rounded-lg shrink-0">
                            <Info className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                            <h4 className="text-amber-400 font-semibold mb-1">Omejitev odgovornosti</h4>
                            <p className="leading-relaxed">Za vsebinske napake ne odgovarjamo. Pred oddajo na eDavke vedno preverite pravilnost podatkov. To orodje je v <strong className="text-amber-400">testni fazi</strong> - uporaba na lastno odgovornost.</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
