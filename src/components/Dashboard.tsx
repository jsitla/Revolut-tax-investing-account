import { useState, useMemo, useEffect } from 'react';
import { RevolutExport } from '../types/revolut';
import { filterByYear } from '../utils/parser';
import { generateKDVPXml, generateDivCsv, TaxpayerConfig, validateTaxpayerConfig } from '../utils/xml-builder';
import { saveAs } from 'file-saver';
import { TradesTable, DividendsTable } from './Tables';
import XMLPreview from './XMLPreview';
import TaxpayerForm, { loadTaxpayerConfig } from './TaxpayerForm';
import * as Tabs from '@radix-ui/react-tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileDown, 
    AlertTriangle, 
    Shield, 
    TrendingUp, 
    Wallet, 
    Landmark, 
    RefreshCw,
    Download,
    CheckCircle2,
    User
} from 'lucide-react';

interface DashboardProps {
    data: RevolutExport;
    onReset: () => void;
    initialTaxpayerConfig?: TaxpayerConfig;
}

export default function Dashboard({ data, onReset, initialTaxpayerConfig }: DashboardProps) {
    const [taxpayerConfig, setTaxpayerConfig] = useState<TaxpayerConfig>(() => initialTaxpayerConfig || loadTaxpayerConfig());
    
    const years = useMemo(() => {
        const tradeYears = data.trades.map(t => parseInt(t.dateSold.split('-')[0]));
        const divYears = data.dividends.map(d => parseInt(d.date.split('-')[0]));
        return Array.from(new Set([...tradeYears, ...divYears])).sort((a, b) => b - a);
    }, [data]);

    // Default to previous year (for tax reporting), or first available year
    const defaultYear = useMemo(() => {
        const lastYear = new Date().getFullYear() - 1;
        if (years.includes(lastYear)) return lastYear;
        return years[0] || new Date().getFullYear();
    }, [years]);

    const [selectedYear, setSelectedYear] = useState<number>(defaultYear);

    useEffect(() => {
        if (years.length > 0 && !years.includes(selectedYear)) {
            setSelectedYear(defaultYear);
        }
    }, [years, selectedYear, defaultYear]);

    const filteredData = useMemo(() => {
        return filterByYear(data, selectedYear);
    }, [data, selectedYear]);

    const totals = useMemo(() => {
        // Use EUR values if available (conversion was applied), otherwise original
        const totalPnL = filteredData.trades.reduce((sum, t) => sum + (t.grossPnLEur ?? t.grossPnL), 0);
        const totalDividends = filteredData.dividends.reduce((sum, d) => sum + (d.grossAmountEur ?? d.grossAmount), 0);
        const totalTax = filteredData.dividends.reduce((sum, d) => sum + (d.withholdingTaxEur ?? d.withholdingTax), 0);

        const currencies = new Set([
            ...filteredData.trades.map(t => t.currency),
            ...filteredData.dividends.map(d => d.currency)
        ]);
        const hasNonEur = Array.from(currencies).some(c => c && c !== 'EUR');
        
        // Check if conversion was successfully applied
        const conversionApplied = data.conversionApplied === true;
        const hasConversionErrors = (data.missingRateDates && data.missingRateDates.length > 0) || 
                                     (data.conversionErrors && data.conversionErrors.length > 0);
        
        // Display currency is EUR if conversion was applied, otherwise original
        const displayCurrency = conversionApplied ? 'EUR' : (filteredData.trades[0]?.currency || filteredData.dividends[0]?.currency || 'EUR');

        return {
            totalPnL,
            totalDividends,
            totalTax,
            currency: displayCurrency,
            hasNonEur,
            conversionApplied,
            hasConversionErrors
        };
    }, [filteredData, data]);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('sl-SI', {
            style: 'currency',
            currency: totals.currency || 'EUR'
        }).format(amount);
    };

    const taxpayerErrors = useMemo(() => validateTaxpayerConfig(taxpayerConfig), [taxpayerConfig]);
    const isTaxpayerValid = taxpayerErrors.length === 0;

    const handleDownloadKDVP = () => {
        if (!isTaxpayerValid) {
            alert('Prosim izpolnite vse obvezne podatke davčnega zavezanca v zavihku "Nastavitve".');
            return;
        }
        const xml = generateKDVPXml(filteredData.trades, selectedYear, taxpayerConfig);
        const blob = new Blob([xml], { type: 'text/xml;charset=utf-8' });
        saveAs(blob, `Doh-KDVP-${selectedYear}.xml`);
    };

    const handleDownloadDiv = () => {
        if (!isTaxpayerValid) {
            alert('Prosim izpolnite vse obvezne podatke davčnega zavezanca v zavihku "Nastavitve".');
            return;
        }
        const csv = generateDivCsv(filteredData.dividends, selectedYear, taxpayerConfig);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, `Doh-Div-${selectedYear}.csv`);
    };

    const kdvpXml = useMemo(() => generateKDVPXml(filteredData.trades, selectedYear, taxpayerConfig), [filteredData.trades, selectedYear, taxpayerConfig]);
    const divCsv = useMemo(() => generateDivCsv(filteredData.dividends, selectedYear, taxpayerConfig), [filteredData.dividends, selectedYear, taxpayerConfig]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-20">
            {/* Header */}
            <header className="sticky top-0 z-30 backdrop-blur-md border-b border-white/5 bg-[#0B0F19]/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg shadow-lg shadow-purple-500/20">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-white">
                            Revolut <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">FURS</span>
                        </h1>
                        <div className="hidden sm:flex ml-2 px-2 py-0.5 text-[10px] font-mono border border-emerald-500/30 text-emerald-400 rounded bg-emerald-500/10 items-center gap-1">
                            <Shield className="w-3 h-3" />
                            SECURE_ENV: LOCAL
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex p-1 bg-slate-800/50 rounded-lg border border-white/5">
                            {years.map(year => (
                                <button key={year} onClick={() => setSelectedYear(year)} className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${selectedYear === year ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>{year}</button>
                            ))}
                        </div>
                        <div className="w-px h-6 bg-white/10 mx-1"></div>
                        <button onClick={onReset} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/5">
                            <RefreshCw className="w-4 h-4" />
                            <span className="hidden sm:inline">Nova datoteka</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Hero Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full -mr-16 -mt-16 transition-colors duration-500 ${totals.totalPnL >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}></div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-lg ${totals.totalPnL >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <h3 className="text-slate-400 font-medium text-sm">Realiziran PnL</h3>
                        </div>
                        <div className={`text-3xl font-bold tracking-tight ${totals.totalPnL >= 0 ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]' : 'text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.3)]'}`}>
                            {formatMoney(totals.totalPnL)}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Dobiček / Izguba iz prodaj</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full -mr-16 -mt-16"></div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <h3 className="text-slate-400 font-medium text-sm">Dividende Bruto</h3>
                        </div>
                        <div className="text-3xl font-bold text-white tracking-tight">{formatMoney(totals.totalDividends)}</div>
                        <p className="text-xs text-slate-500 mt-2">{filteredData.dividends.length} izplačil</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[60px] rounded-full -mr-16 -mt-16"></div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                <Landmark className="w-5 h-5" />
                            </div>
                            <h3 className="text-slate-400 font-medium text-sm">Plačan Davek</h3>
                        </div>
                        <div className="text-3xl font-bold text-slate-200 tracking-tight">{formatMoney(totals.totalTax)}</div>
                        <p className="text-xs text-slate-500 mt-2">Davek odtegnjen v tujini</p>
                    </motion.div>
                </div>

                {totals.hasNonEur && totals.conversionApplied && !totals.hasConversionErrors && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-4 items-start">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                        <div>
                            <h4 className="text-emerald-400 font-bold text-sm">Valuta pretvorjena v EUR ✓</h4>
                            <p className="text-emerald-400/80 text-xs mt-1 leading-relaxed">Vsi zneski so bili samodejno pretvorjeni v EUR po uradnem ECB tečaju na dan transakcije. XML je skladen s FURS zahtevami.</p>
                        </div>
                    </motion.div>
                )}

                {totals.hasNonEur && totals.hasConversionErrors && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-4 items-start">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                            <h4 className="text-red-400 font-bold text-sm">⚠️ Nepopolna pretvorba valut</h4>
                            <p className="text-red-400/80 text-xs mt-1 leading-relaxed">Za nekatere transakcije ni bilo mogoče pridobiti ECB tečaja. XML morda ni skladen s FURS zahtevami. Preverite podatke pred oddajo!</p>
                        </div>
                    </motion.div>
                )}

                {totals.hasNonEur && !totals.conversionApplied && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-4 items-start">
                        <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                            <h4 className="text-amber-500 font-bold text-sm">Opozorilo o valuti ({totals.currency})</h4>
                            <p className="text-amber-500/80 text-xs mt-1 leading-relaxed">Zaznane so transakcije v tuji valuti. XML datoteka bo vsebovala originalne vrednosti.</p>
                        </div>
                    </motion.div>
                )}

                <Tabs.Root defaultValue="trades" className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-white/5 pb-1">
                        <Tabs.List className="flex p-1 bg-slate-900/40 rounded-full border border-white/5 backdrop-blur-sm">
                            <Tabs.Trigger value="trades" className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all text-slate-400 hover:text-slate-200 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20">
                                <TrendingUp className="w-4 h-4" /> Prodaje
                            </Tabs.Trigger>
                            <Tabs.Trigger value="dividends" className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all text-slate-400 hover:text-slate-200 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20">
                                <Wallet className="w-4 h-4" /> Dividende
                            </Tabs.Trigger>
                            <Tabs.Trigger value="settings" className="relative flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all text-slate-400 hover:text-slate-200 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                                <User className="w-4 h-4" /> Podatki o zavezancu
                                {!isTaxpayerValid && <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                            </Tabs.Trigger>
                        </Tabs.List>
                    </div>

                    <AnimatePresence mode="wait">
                        <Tabs.Content value="trades" key="trades" className="outline-none focus:outline-none">
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                                <div className="p-5 glass-panel rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-emerald-500/10 bg-emerald-500/5">
                                    <div>
                                        <h4 className="font-semibold text-white flex items-center gap-2"><FileDown className="w-4 h-4 text-emerald-400" /> Doh-KDVP XML</h4>
                                        <p className="text-xs text-slate-400 mt-1">Poročilo o kapitalskih dobičkih za eDavke</p>
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <XMLPreview xml={kdvpXml} title={`Doh-KDVP ${selectedYear}`} onDownload={handleDownloadKDVP} />
                                        <button onClick={handleDownloadKDVP} disabled={filteredData.trades.length === 0 || !isTaxpayerValid} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed">
                                            <Download className="w-4 h-4" /> Prenesi XML
                                        </button>
                                    </div>
                                </div>
                                <TradesTable trades={filteredData.trades} />
                            </motion.div>
                        </Tabs.Content>

                        <Tabs.Content value="dividends" key="dividends" className="outline-none focus:outline-none">
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                                <div className="p-5 glass-panel rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-indigo-500/10 bg-indigo-500/5">
                                    <div>
                                        <h4 className="font-semibold text-white flex items-center gap-2"><FileDown className="w-4 h-4 text-indigo-400" /> Doh-Div CSV</h4>
                                        <p className="text-xs text-slate-400 mt-1">Poročilo o dividendah za eDavke (CSV format)</p>
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <XMLPreview xml={divCsv} title={`Doh-Div ${selectedYear}`} onDownload={handleDownloadDiv} />
                                        <button onClick={handleDownloadDiv} disabled={filteredData.dividends.length === 0 || !isTaxpayerValid} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed">
                                            <Download className="w-4 h-4" /> Prenesi CSV
                                        </button>
                                    </div>
                                </div>
                                <DividendsTable dividends={filteredData.dividends} />
                            </motion.div>
                        </Tabs.Content>
                        
                        <Tabs.Content value="settings" key="settings" className="outline-none focus:outline-none">
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                <div className="max-w-2xl mx-auto">
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold text-white mb-2">Podatki davčnega zavezanca</h2>
                                        <p className="text-slate-400 text-sm">Ti podatki so obvezni za generiranje veljavnih datotek za eDavke.</p>
                                    </div>
                                    <TaxpayerForm config={taxpayerConfig} onChange={setTaxpayerConfig} />
                                    {!isTaxpayerValid && (
                                        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-red-200 font-medium text-sm">Manjkajoči podatki</p>
                                                <ul className="list-disc list-inside text-red-300/70 text-xs mt-1 space-y-1">
                                                    {taxpayerErrors.map((err, i) => <li key={i}>{err}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </Tabs.Content>
                    </AnimatePresence>
                </Tabs.Root>

                <div className="mt-16 p-6 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
                    <div className="flex flex-col md:flex-row gap-6 text-sm text-slate-400">
                        <div className="flex items-start gap-3 flex-1">
                            <div className="bg-emerald-500/20 p-2 rounded-lg shrink-0"><Shield className="w-4 h-4 text-emerald-400" /></div>
                            <div>
                                <h4 className="text-emerald-400 font-semibold mb-1">Zasebnost podatkov</h4>
                                <p className="leading-relaxed">Vsa obdelava poteka lokalno v vašem brskalniku. Vaši podatki se nikoli ne pošiljajo na naše strežnike.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 flex-1">
                            <div className="bg-amber-500/20 p-2 rounded-lg shrink-0"><AlertTriangle className="w-4 h-4 text-amber-400" /></div>
                            <div>
                                <h4 className="text-amber-400 font-semibold mb-1">Omejitev odgovornosti</h4>
                                <p className="leading-relaxed">Za vsebinske napake ne odgovarjamo. Pred oddajo na eDavke vedno preverite pravilnost podatkov. To orodje je v <strong className="text-amber-400">testni fazi</strong>.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </motion.div>
    );
}
