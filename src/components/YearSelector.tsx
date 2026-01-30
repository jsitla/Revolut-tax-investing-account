
interface YearSelectorProps {
    years: number[];
    selectedYear: number;
    onSelect: (year: number) => void;
}

export default function YearSelector({ years, selectedYear, onSelect }: YearSelectorProps) {
    return (
        <div className="flex flex-wrap gap-2 justify-center mb-8 p-1.5 bg-slate-900/50 backdrop-blur-md rounded-full border border-white/5 inline-flex">
            {years.map((year) => (
                <button
                    key={year}
                    onClick={() => onSelect(year)}
                    className={`
            px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 relative overflow-hidden group
            ${selectedYear === year
                            ? 'text-white shadow-lg shadow-purple-500/25 ring-1 ring-white/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }
          `}
                >
                    {selectedYear === year && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 -z-10"></div>
                    )}
                    {year}
                </button>
            ))}
        </div>
    );
}
