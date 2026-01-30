
interface SummaryCardsProps {
    tradeCount: number;
    totalPnL: number;
    dividendCount: number;
    totalDividends: number;
    totalTax: number;
    currency: string;
}

export default function SummaryCards({
    tradeCount,
    totalPnL,
    dividendCount,
    totalDividends,
    totalTax,
    currency
}: SummaryCardsProps) {
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('sl-SI', {
            style: 'currency',
            currency: currency || 'EUR'
        }).format(amount);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Sales Card */}
            <div className={`glass-card p-6 rounded-3xl transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-emerald-900/10 group relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <div className="w-24 h-24 bg-emerald-500 rounded-full blur-3xl"></div>
                </div>
                
                <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Prodaje delnic
                </h3>
                
                <div className="flex flex-col gap-1">
                    <div className={`text-3xl font-bold tracking-tight ${totalPnL >= 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300' : 'text-red-400'}`}>
                        {formatMoney(totalPnL)}
                    </div>
                    <div className="flex justify-between items-end mt-2">
                        <span className="text-xs text-slate-500 font-medium bg-slate-800/50 px-2 py-1 rounded-full border border-slate-700/50">Dobiček / Izguba</span>
                        <div className="text-right">
                            <span className="text-lg font-bold text-white block leading-none">{tradeCount}</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Transakcij</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dividends Card */}
            <div className={`glass-card p-6 rounded-3xl transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-blue-900/10 group relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <div className="w-24 h-24 bg-blue-500 rounded-full blur-3xl"></div>
                </div>

                <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Dividende (Bruto)
                </h3>

                <div className="flex flex-col gap-1">
                    <div className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                        {formatMoney(totalDividends)}
                    </div>
                    <div className="flex justify-between items-end mt-2">
                        <span className="text-xs text-slate-500 font-medium bg-slate-800/50 px-2 py-1 rounded-full border border-slate-700/50">Skupaj prejeto</span>
                        <div className="text-right">
                            <span className="text-lg font-bold text-white block leading-none">{dividendCount}</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Izplačil</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tax Card */}
            <div className={`glass-card p-6 rounded-3xl transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-amber-900/10 group relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <div className="w-24 h-24 bg-amber-500 rounded-full blur-3xl"></div>
                </div>

                <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Davek v tujini
                </h3>

                <div className="flex flex-col gap-1">
                    <div className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300">
                        {formatMoney(totalTax)}
                    </div>
                    <div className="flex justify-between items-end mt-2">
                        <span className="text-xs text-slate-500 font-medium bg-slate-800/50 px-2 py-1 rounded-full border border-slate-700/50">Withholding tax</span>
                        <div className="text-right">
                            <span className="text-lg font-bold text-white block leading-none">{((totalTax / totalDividends) * 100 || 0).toFixed(1)}%</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Efektivna stopnja</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
