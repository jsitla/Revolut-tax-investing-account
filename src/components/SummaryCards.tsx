
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                <h3 className="text-slate-400 text-sm font-medium mb-2">Prodaje delnic</h3>
                <div className="flex justify-between items-end">
                    <div>
                        <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {formatMoney(totalPnL)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Dobiček / Izguba</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold text-white">{tradeCount}</div>
                        <div className="text-xs text-slate-500">Transakcij</div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                <h3 className="text-slate-400 text-sm font-medium mb-2">Dividende (Bruto)</h3>
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-2xl font-bold text-blue-400">
                            {formatMoney(totalDividends)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Skupaj prejeto</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold text-white">{dividendCount}</div>
                        <div className="text-xs text-slate-500">Izplačil</div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                <h3 className="text-slate-400 text-sm font-medium mb-2">Davek v tujini</h3>
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-2xl font-bold text-amber-400">
                            {formatMoney(totalTax)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Plačano (Withholding)</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold text-white">{((totalTax / totalDividends) * 100 || 0).toFixed(1)}%</div>
                        <div className="text-xs text-slate-500">Efektivna stopnja</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
