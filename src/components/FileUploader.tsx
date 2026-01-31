import { useCallback, useState } from 'react';
import { parseRevolutExport, convertToEur } from '../utils/parser';
import { RevolutExport } from '../types/revolut';
import { UploadCloud, FileText, ShieldCheck, AlertTriangle, Building2, Lock, Loader2, XCircle } from 'lucide-react';
import { PrivacyModal, TermsModal } from './LegalModals';
import * as Dialog from '@radix-ui/react-dialog';

interface FileUploaderProps {
    onUpload: (data: RevolutExport) => void;
}

interface ConversionWarning {
    data: RevolutExport;
    missingDates: string[];
    errors: string[];
}

export default function FileUploader({ onUpload }: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [conversionWarning, setConversionWarning] = useState<ConversionWarning | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const processFile = async (file: File) => {
        // Basic check for CSV extension, though users might rename files
        if (!file.name.toLowerCase().endsWith('.csv')) {
            setError('Prosim naložite CSV datoteko (Profit and loss statement).');
            return;
        }

        setIsLoading(true);
        setError(null);
        setConversionWarning(null);

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string;
                const parsedData = parseRevolutExport(text);

                if (parsedData.trades.length === 0 && parsedData.dividends.length === 0) {
                    setError('Datoteka ne vsebuje prepoznanih transakcij. Preverite, da gre za "Profit and loss statement".');
                    setIsLoading(false);
                    return;
                }

                // Convert to EUR using ECB rates
                const convertedData = await convertToEur(parsedData);

                // Check if conversion had issues
                if (convertedData.missingRateDates && convertedData.missingRateDates.length > 0) {
                    // Show warning modal - let user decide
                    setConversionWarning({
                        data: convertedData,
                        missingDates: convertedData.missingRateDates,
                        errors: convertedData.conversionErrors || [],
                    });
                    setIsLoading(false);
                    return;
                }

                onUpload(convertedData);
                setError(null);
                setIsLoading(false);
            } catch (err) {
                console.error(err);
                setError('Napaka pri branju datoteke. Preverite format.');
                setIsLoading(false);
            }
        };
        reader.readAsText(file);
    };

    const handleProceedWithWarning = () => {
        if (conversionWarning) {
            onUpload(conversionWarning.data);
            setConversionWarning(null);
        }
    };

    const handleCancelWarning = () => {
        setConversionWarning(null);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="glass-card rounded-2xl p-8 md:p-12 text-center transition-all duration-300 relative overflow-hidden group">
                {/* Decoration Glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none"></div>

                <div 
                    className={`
                        relative border-2 border-dashed rounded-xl p-12 transition-all duration-300
                        ${isDragging 
                            ? 'border-primary bg-primary/5 scale-[1.01] shadow-[0_0_30px_rgba(124,58,237,0.1)]' 
                            : 'border-slate-700/50 hover:border-primary/50 hover:bg-slate-800/30'
                        }
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    <div className="flex flex-col items-center gap-6 pointer-events-none">
                        <div className={`p-5 rounded-2xl transition-all duration-500 ${isDragging ? 'bg-primary/20 text-primary scale-110' : isLoading ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800/80 text-slate-400'}`}>
                            {isLoading ? (
                                <Loader2 className="w-10 h-10 animate-spin" />
                            ) : (
                                <UploadCloud className="w-10 h-10" />
                            )}
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white tracking-tight">
                                {isLoading ? 'Pretvarjam valute...' : 'Naloži Revolut CSV'}
                            </h3>
                            <p className="text-slate-400 text-lg">
                                {isLoading ? 'Pridobivam ECB menjalniške tečaje' : 'Povleci datoteko sem ali klikni za iskanje'}
                            </p>
                        </div>

                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-sm text-slate-300">
                            <FileText className="w-4 h-4 text-emerald-400" />
                            Podprt format: <span className="text-white font-medium">Profit and loss statement</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-left animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                        <span className="text-red-200 text-sm">{error}</span>
                    </div>
                )}
            </div>

            {/* Currency Conversion Warning Modal */}
            <Dialog.Root open={conversionWarning !== null} onOpenChange={(open) => !open && handleCancelWarning()}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-in fade-in" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-xl translate-x-[-50%] translate-y-[-50%] rounded-2xl border-2 border-red-500/50 bg-slate-900 p-0 shadow-2xl shadow-red-500/10 animate-in fade-in zoom-in-95">
                        {/* Header - Red warning band */}
                        <div className="bg-red-500/20 border-b border-red-500/30 p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-500/30 rounded-xl">
                                    <XCircle className="w-8 h-8 text-red-500" />
                                </div>
                                <div>
                                    <Dialog.Title className="text-xl font-bold text-red-400">
                                        ⚠️ OPOZORILO: Manjkajoči menjalniški tečaji
                                    </Dialog.Title>
                                    <Dialog.Description className="text-red-300/80 text-sm mt-1">
                                        Ni mogoče pridobiti ECB tečajev za nekatere datume
                                    </Dialog.Description>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                <p className="text-red-200 font-semibold mb-2">
                                    🚫 TO NI SKLADNO S FURS ZAHTEVAMI
                                </p>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    FURS zahteva, da so vsi zneski pretvorjeni v EUR po uradnem tečaju ECB na dan transakcije.
                                    Če nadaljujete brez pretvorbe, bo XML vseboval <strong className="text-red-400">originalne vrednosti v USD</strong>, 
                                    kar <strong className="text-red-400">ni pravilno</strong> za davčno napoved.
                                </p>
                            </div>

                            {conversionWarning && conversionWarning.missingDates.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-slate-400 text-sm font-medium">Manjkajoči tečaji za datume:</p>
                                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                                        {conversionWarning.missingDates.map((date, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs font-mono text-slate-300">
                                                {date}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {conversionWarning && conversionWarning.errors.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-slate-400 text-sm font-medium">Napake:</p>
                                    <div className="space-y-1 text-xs text-red-300">
                                        {conversionWarning.errors.map((err, idx) => (
                                            <p key={idx}>• {err}</p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                                <p className="text-amber-300 text-sm">
                                    <strong>Priporočilo:</strong> Poskusite znova pozneje ali ročno preverite in popravite vrednosti pred oddajo na FURS.
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="border-t border-slate-700 p-6 flex gap-4 justify-end bg-slate-800/50">
                            <button
                                onClick={handleCancelWarning}
                                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
                            >
                                Prekliči
                            </button>
                            <button
                                onClick={handleProceedWithWarning}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                            >
                                <AlertTriangle className="w-4 h-4" />
                                Nadaljuj kljub temu (na lastno odgovornost)
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Legal & Info Section Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                 {/* Privacy & Provider */}
                 <div className="glass-panel p-6 rounded-xl space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h4 className="font-semibold text-white">Varnost in Zasebnost</h4>
                    </div>
                    <ul className="space-y-4 text-sm text-slate-400 leading-relaxed">
                        <li className="flex gap-3 items-start">
                             <Building2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                             <span>To je <strong>brezplačno orodje</strong>, ki ga omogoča <strong>M-AI d.o.o.</strong> za vse slovenske uporabnike Revolut Invest.</span>
                        </li>
                        <li className="flex gap-3 items-start">
                             <Lock className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                             <span><strong>Zasebnost zagotovljena:</strong> Ne zbiramo nobenih podatkov. Vsa pretvorba poteka izključno v vašem brskalniku.</span>
                        </li>
                    </ul>
                 </div>

                 {/* Liability & Terms */}
                 <div className="glass-panel p-6 rounded-xl space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h4 className="font-semibold text-white">Pogoji uporabe</h4>
                    </div>
                    <div className="text-sm text-slate-400 space-y-3 leading-relaxed">
                        <p>
                            Uporaba orodja je na <strong>lastno odgovornost</strong>. M-AI d.o.o. ne prevzema odgovornosti za točnost izračunov ali morebitne napake.
                        </p>
                        <p className="flex gap-2 items-start">
                             <span className="text-amber-500 font-bold">!</span>
                             <span>Uporabniki morajo pred oddajo na FURS <strong>preveriti pravilnost</strong> vseh pretvorjenih podatkov.</span>
                        </p>
                    </div>
                 </div>
            </div>

            {/* Footer Links */}
            <div className="text-center pt-8 border-t border-white/5">
                <p className="text-xs text-slate-500 flex justify-center gap-6">
                    <span>© {new Date().getFullYear()} M-AI d.o.o.</span>
                    <span className="w-px h-4 bg-slate-700"></span>
                    <PrivacyModal>
                        <button className="hover:text-primary transition-colors cursor-pointer outline-none">Politika zasebnosti</button>
                    </PrivacyModal>
                    <span className="w-px h-4 bg-slate-700"></span>
                    <TermsModal>
                        <button className="hover:text-primary transition-colors cursor-pointer outline-none">Pogoji uporabe</button>
                    </TermsModal>
                </p>
            </div>
        </div>
    );
}
