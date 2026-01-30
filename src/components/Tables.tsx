import { RevolutTrade, RevolutDividend } from '../types/revolut';

interface TradesTableProps {
    trades: RevolutTrade[];
}

interface DividendsTableProps {
    dividends: RevolutDividend[];
}

export function TradesTable({ trades }: TradesTableProps) {
    if (trades.length === 0) return null;

    return (
        <div className="glass-panel rounded-2xl overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-white/5 bg-white/5">
                <h3 className="font-semibold text-white">Prodaje vrednostnih papirjev (Doh-KDVP)</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs uppercase bg-white/5 text-slate-400 font-semibold tracking-wider">
                        <tr>
                            <th className="px-6 py-3">Datum prodaje</th>
                            <th className="px-6 py-3">Simbol</th>
                            <th className="px-6 py-3 text-right">Količina</th>
                            <th className="px-6 py-3 text-right">Nabavna vred.</th>
                            <th className="px-6 py-3 text-right">Prodajna vred.</th>
                            <th className="px-6 py-3 text-right">Dobiček/Izguba</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {trades.map((trade, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs">{trade.dateSold}</td>
                                <td className="px-6 py-4 font-bold text-white">{trade.symbol}</td>
                                <td className="px-6 py-4 text-right">{trade.quantity}</td>
                                <td className="px-6 py-4 text-right">{trade.costBasis.toFixed(2)} {trade.currency}</td>
                                <td className="px-6 py-4 text-right">{trade.grossProceeds.toFixed(2)} {trade.currency}</td>
                                <td className={`px-6 py-4 text-right font-medium ${trade.grossPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {trade.grossPnL.toFixed(2)} {trade.currency}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function DividendsTable({ dividends }: DividendsTableProps) {
    if (dividends.length === 0) return null;

    return (
        <div className="glass-panel rounded-2xl overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-white/5 bg-white/5">
                <h3 className="font-semibold text-white">Prejete dividende (Doh-Div)</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs uppercase bg-white/5 text-slate-400 font-semibold tracking-wider">
                        <tr>
                            <th className="px-6 py-3">Datum</th>
                            <th className="px-6 py-3">Simbol</th>
                            <th className="px-6 py-3">Opis</th>
                            <th className="px-6 py-3 text-right">Bruto znesek</th>
                            <th className="px-6 py-3 text-right">Withholding Tax</th>
                            <th className="px-6 py-3 text-right">Neto znesek</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {dividends.map((dividend, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs">{dividend.date}</td>
                                <td className="px-6 py-4 font-bold text-white">{dividend.symbol}</td>
                                <td className="px-6 py-4 text-slate-400">{dividend.securityName}</td>
                                <td className="px-6 py-4 text-right">{dividend.grossAmount.toFixed(2)} {dividend.currency}</td>
                                <td className="px-6 py-4 text-right text-amber-400">-{dividend.withholdingTax.toFixed(2)} {dividend.currency}</td>
                                <td className="px-6 py-4 text-right font-bold text-emerald-400">
                                    {(dividend.grossAmount - dividend.withholdingTax).toFixed(2)} {dividend.currency}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


