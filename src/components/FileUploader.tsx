import { useCallback, useState } from 'react';
import { parseRevolutExport } from '../utils/parser';
import { RevolutExport } from '../types/revolut';

interface FileUploaderProps {
    onUpload: (data: RevolutExport) => void;
}

export default function FileUploader({ onUpload }: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const processFile = (file: File) => {
        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            setError('Prosim naložite CSV datoteko.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                const data = parseRevolutExport(text);

                if (data.trades.length === 0 && data.dividends.length === 0) {
                    setError('Datoteka ne vsebuje prepoznanih transakcij. Preverite format datoteke.');
                    return;
                }

                onUpload(data);
                setError(null);
            } catch (err) {
                console.error(err);
                setError('Napaka pri branju datoteke.');
            }
        };
        reader.readAsText(file);
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
        <div className="w-full max-w-xl mx-auto">
            <div
                className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ease-in-out
          ${isDragging
                        ? 'border-blue-500 bg-blue-500/10 scale-102'
                        : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50 bg-slate-800/30'
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
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full bg-slate-700/50">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                        </svg>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-white mb-1">
                            Naloži Revolut CSV
                        </h3>
                        <p className="text-slate-400">
                            Povleci datoteko sem ali klikni za iskanje
                        </p>
                    </div>

                    <div className="text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
                        Podprta formata: Trading Statement, Account Statement
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}
        </div>
    );
}
