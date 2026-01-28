
interface YearSelectorProps {
    years: number[];
    selectedYear: number;
    onSelect: (year: number) => void;
}

export default function YearSelector({ years, selectedYear, onSelect }: YearSelectorProps) {
    return (
        <div className="flex flex-wrap gap-2 justify-center mb-8">
            {years.map((year) => (
                <button
                    key={year}
                    onClick={() => onSelect(year)}
                    className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
            ${selectedYear === year
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 scale-105'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                        }
          `}
                >
                    {year}
                </button>
            ))}
        </div>
    );
}
