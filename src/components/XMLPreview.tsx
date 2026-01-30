import * as Dialog from '@radix-ui/react-dialog';
import * as Toast from '@radix-ui/react-toast';
import { X, Copy, Download, Check } from 'lucide-react';
import { useState } from 'react';

interface XMLPreviewProps {
    xml: string;
    title: string;
    onDownload: () => void;
}

export default function XMLPreview({ xml, title, onDownload }: XMLPreviewProps) {
    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(xml);
        setCopied(true);
        setOpen(true);
        setTimeout(() => {
            setCopied(false);
            setOpen(false);
        }, 3000);
    };

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                    Predogled XML
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-6 border-b border-slate-800">
                        <Dialog.Title className="text-xl font-bold text-white">
                            Predogled: {title}
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </Dialog.Close>
                    </div>

                    <div className="p-6">
                        <div className="relative group">
                            <pre className="p-4 bg-slate-950 rounded-xl overflow-auto max-h-[60vh] text-xs leading-relaxed font-mono text-emerald-400 border border-slate-800">
                                {xml}
                            </pre>

                            <button
                                onClick={handleCopy}
                                className="absolute top-4 right-4 p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-white transition-all opacity-0 group-hover:opacity-100"
                                title="Kopiraj v odložišče"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 p-6 bg-slate-800/30 border-t border-slate-800 rounded-b-2xl">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            Kopiraj
                        </button>
                        <button
                            onClick={onDownload}
                            className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-900/20"
                        >
                            <Download className="w-4 h-4" />
                            Prenesi XML
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>

            <Toast.Root
                className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-2xl flex items-center justify-between gap-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-out"
                open={open}
                onOpenChange={setOpen}
            >
                <Toast.Title className="text-sm font-bold text-white flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Kopirano v odložišče
                </Toast.Title>
                <Toast.Description className="text-xs text-slate-400">
                    XML koda je pripravljena za uporabo.
                </Toast.Description>
            </Toast.Root>
        </Dialog.Root>
    );
}
