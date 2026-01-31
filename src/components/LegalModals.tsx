import * as Dialog from '@radix-ui/react-dialog';
import { X, ShieldCheck, ScrollText, Lock, Building2, AlertTriangle } from 'lucide-react';
import React from 'react';

export const PrivacyModal = ({ children }: { children: React.ReactNode }) => (
  <Dialog.Root>
    <Dialog.Trigger asChild>
      {children}
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
      <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-700 bg-slate-900 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl">
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <Dialog.Title className="text-lg font-semibold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    Politika zasebnosti
                </Dialog.Title>
                <Dialog.Close className="rounded-full p-1.5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer">
                    <X className="w-4 h-4" />
                </Dialog.Close>
            </div>
            
            <div className="space-y-4 text-sm text-slate-300 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                    <p className="font-medium text-indigo-300 mb-1">Povzetek</p>
                    <p>Vaši podatki <strong>nikoli</strong> ne zapustijo vašega brskalnika. Aplikacija deluje popolnoma lokalno (client-side).</p>
                </div>

                <div className="space-y-2">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                        <Lock className="w-4 h-4 text-emerald-400" />
                        Obdelava podatkov
                    </h4>
                    <p>
                        Ko naložite CSV datoteko, se ta obdela izključno v pomnilniku vašega brskalnika. Nobena datoteka ali podatek se ne pošilja na zunanje strežnike.
                    </p>
                </div>

                <div className="space-y-2">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-400" />
                        Ponudnik
                    </h4>
                    <p>
                        Orodje zagotavlja podjetje M-AI d.o.o. z namenom lažjega davčnega poročanja za uporabnike Revolut Invest.
                    </p>
                </div>

                <div className="space-y-2">
                    <h4 className="font-semibold text-white">Piškotki in sledenje</h4>
                    <p>
                        Aplikacija ne uporablja piškotkov za sledenje ali analitiko.
                    </p>
                </div>
            </div>

            <div className="flex justify-end mt-2">
                 <Dialog.Close asChild>
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium cursor-pointer">
                        Zapri
                    </button>
                 </Dialog.Close>
            </div>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

export const TermsModal = ({ children }: { children: React.ReactNode }) => (
  <Dialog.Root>
    <Dialog.Trigger asChild>
      {children}
    </Dialog.Trigger>
    <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-700 bg-slate-900 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl">
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <Dialog.Title className="text-lg font-semibold text-white flex items-center gap-2">
                    <ScrollText className="w-5 h-5 text-amber-400" />
                    Pogoji uporabe
                </Dialog.Title>
                <Dialog.Close className="rounded-full p-1.5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer">
                    <X className="w-4 h-4" />
                </Dialog.Close>
            </div>
            
            <div className="space-y-4 text-sm text-slate-300 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-amber-300 mb-1">Omejitev odgovornosti</p>
                            <p>Orodje uporabljate na lastno odgovornost. M-AI d.o.o. ne jamči za pravilnost izračunov.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="font-semibold text-white">Namen orodja</h4>
                    <p>
                        To orodje je namenjeno pomoči pri pretvorbi podatkov iz Revolut formata v format, primeren za uvoz v eDavke (Doh-KDVP). 
                    </p>
                </div>

                <div className="space-y-2">
                    <h4 className="font-semibold text-white">Odgovornost uporabnika</h4>
                    <p>
                        Uporabnik je dolžan:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-400">
                        <li>Preveriti pravilnost vseh uvoženih podatkov.</li>
                        <li>Primerjati izračune z dejanskim stanjem.</li>
                        <li>Poskrbeti za oddajo napovedi v skladu z zakonodajo.</li>
                    </ul>
                </div>
            </div>

             <div className="flex justify-end mt-2">
                 <Dialog.Close asChild>
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium cursor-pointer">
                        Razumem
                    </button>
                 </Dialog.Close>
            </div>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
