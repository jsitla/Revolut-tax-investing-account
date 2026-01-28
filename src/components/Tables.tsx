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
        <div className="overflow-hidden rounded-xl border border-slate-700/50 mb-8">
            <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700/50">
                <h3 className="font-semibold text-white">Prodaje vrednostnih papirjev (Doh-KDVP)</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs uppercase bg-slate-800/50 text-slate-400">
                        <tr>
                            <th className="px-6 py-3">Datum prodaje</th>
                            <th className="px-6 py-3">Simbol</th>
                            <th className="px-6 py-3 text-right">Količina</th>
                            <th className="px-6 py-3 text-right">Nabavna vred.</th>
                            <th className="px-6 py-3 text-right">Prodajna vred.</th>
                            <th className="px-6 py-3 text-right">Dobiček/Izguba</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50 bg-slate-900/50">
                        {trades.map((trade, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 font-mono">{trade.dateSold}</td>
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
        <div className="overflow-hidden rounded-xl border border-slate-700/50">
            <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700/50">
                <h3 className="font-semibold text-white">Dividende (Doh-Div)</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs uppercase bg-slate-800/50 text-slate-400">
                        <tr>
                            <th className="px-6 py-3">Datum</th>
                            <th className="px-6 py-3">Simbol</th>
                            <th className="px-6 py-3">Opis</th>
                            <th className="px-6 py-3 text-right">Bruto</th>
                            <th className="px-6 py-3 text-right">Davek</th>
                            <th className="px-6 py-3 text-right">Neto</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50 bg-slate-900/50">
                        {dividends.map((div, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 font-mono">{div.date}</td>
                                <td className="px-6 py-4 font-bold text-white">{div.symbol}</td>
                                <td className="px-6 py-4 text-slate-400">{div.securityName}</td>
                                <td className="px-6 py-4 text-right text-blue-300">{div.grossAmount.toFixed(2)} {div.currency}</td>
                                <td className="px-6 py-4 text-right text-amber-300">{div.withholdingTax.toFixed(2)} {div.currency}</td>
                                <td className="px-6 py-4 text-right">{div.netAmount?.toFixed(2)} {div.currency}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
