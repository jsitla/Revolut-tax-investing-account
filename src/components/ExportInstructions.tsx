import * as Dialog from '@radix-ui/react-dialog';
import { X, HelpCircle, FileText } from 'lucide-react';

export default function ExportInstructions() {
    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <button className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer mt-4 hover:underline underline-offset-4">
                    <HelpCircle className="w-4 h-4" />
                    Kako pridobim ustrezno datoteko?
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] animate-in fade-in duration-200" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-[101] w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] outline-none animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-indigo-400" />
                                    Navodila za izvoz (Revolut)
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Sledite korakom za pridobitev pravilne <span className="font-mono text-indigo-300 bg-indigo-500/10 px-1 rounded">.csv</span> datoteke.</p>
                            </div>
                            <Dialog.Close className="rounded-full p-2 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer">
                                <X className="w-5 h-5" />
                            </Dialog.Close>
                        </div>

                        {/* Steps */}
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                            
                            {/* Step 1 */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">1</div>
                                <div className="space-y-3 flex-1">
                                    <h3 className="font-semibold text-white">Odprite profil</h3>
                                    <p className="text-slate-400 text-sm">Na začetnem zaslonu aplikacije kliknite na <span className="text-white font-medium">krogec z vašimi inicialkami</span> v levem zgornjem kotu (označeno z rdečo).</p>
                                    <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg w-3/4 mx-auto">
                                        <img src="/Revo 1.jpg" alt="Korak 1 - Odprite profil" className="w-full h-auto" />
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">2</div>
                                <div className="space-y-3 flex-1">
                                    <h3 className="font-semibold text-white">Izberite "Documents & statements"</h3>
                                    <p className="text-slate-400 text-sm">V meniju poiščite in izberite opcijo <span className="text-white font-medium">Documents & statements</span> (označeno z rdečo).</p>
                                    <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg w-3/4 mx-auto">
                                        <img src="/Revo 2.jpg" alt="Korak 2 - Documents & statements" className="w-full h-auto" />
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">3</div>
                                <div className="space-y-3 flex-1">
                                    <h3 className="font-semibold text-white">Izberite Excel format in obdobje</h3>
                                    <p className="text-slate-400 text-sm">
                                        Obvezno izberite zavihek <span className="text-emerald-400 font-bold">Excel</span> (ne PDF!). 
                                        V meniju <span className="text-white font-medium">Period</span> izberite želeno obdobje.
                                    </p>
                                    <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg w-3/4 mx-auto">
                                        <img src="/Revo 3.jpg" alt="Korak 3 - Excel in obdobje" className="w-full h-auto" />
                                    </div>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">4</div>
                                <div className="space-y-3 flex-1">
                                    <h3 className="font-semibold text-white">Izberite "All time"</h3>
                                    <p className="text-slate-400 text-sm">Za celotno zgodovino izberite <span className="text-white font-medium">All time</span>. Lahko izberete tudi posamezno leto (Tax year).</p>
                                    <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg w-3/4 mx-auto">
                                        <img src="/Revo 4.jpg" alt="Korak 4 - All time" className="w-full h-auto" />
                                    </div>
                                </div>
                            </div>

                            {/* Step 5 */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">5</div>
                                <div className="space-y-3 flex-1">
                                    <h3 className="font-semibold text-white">Prenesite datoteko</h3>
                                    <p className="text-slate-400 text-sm">Kliknite gumb <span className="text-white font-medium bg-white/10 px-2 py-0.5 rounded">Get statement</span> za prenos datoteke.</p>
                                    <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg w-3/4 mx-auto">
                                        <img src="/Revo 5.jpg" alt="Korak 5 - Get statement" className="w-full h-auto" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/10 bg-slate-900/50 flex justify-end">
                            <Dialog.Close asChild>
                                <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium text-sm shadow-lg shadow-indigo-900/20 cursor-pointer">
                                    Razumem, imam datoteko
                                </button>
                            </Dialog.Close>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
