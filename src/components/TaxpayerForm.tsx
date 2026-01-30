import { useState, useEffect } from 'react';
import { TaxpayerConfig, validateTaxpayerConfig, defaultTaxpayerConfig } from '../utils/xml-builder';
import { motion } from 'framer-motion';
import { User, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface TaxpayerFormProps {
    config: TaxpayerConfig;
    onChange: (config: TaxpayerConfig) => void;
}

const STORAGE_KEY = 'furs-taxpayer-config';

export const loadTaxpayerConfig = (): TaxpayerConfig => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Failed to load taxpayer config from localStorage:', e);
    }
    return defaultTaxpayerConfig;
};

export const saveTaxpayerConfig = (config: TaxpayerConfig): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
        console.warn('Failed to save taxpayer config to localStorage:', e);
    }
};

export default function TaxpayerForm({ config, onChange }: TaxpayerFormProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [hasInteracted, setHasInteracted] = useState(false);

    useEffect(() => {
        if (hasInteracted) {
            const validationErrors = validateTaxpayerConfig(config);
            setErrors(validationErrors);
        }
    }, [config, hasInteracted]);

    const handleChange = (field: keyof TaxpayerConfig, value: string) => {
        setHasInteracted(true);
        const newConfig = { ...config, [field]: value };
        onChange(newConfig);
        saveTaxpayerConfig(newConfig);
    };

    const isValid = errors.length === 0 && config.taxNumber.length === 8;
    const isEmpty = !config.taxNumber && !config.name;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-panel rounded-3xl overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1 ring-purple-500/30 shadow-lg shadow-purple-900/10' : ''}`}
        >
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl transition-colors ${isValid ? 'bg-emerald-500/20 text-emerald-400 shadow-inner' : isEmpty ? 'bg-slate-800 text-slate-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-base tracking-tight">Podatki o zavezancu</h3>
                        <p className="text-slate-400 text-xs mt-1 font-medium tracking-wide">
                            {isValid ? (
                                <span className="text-emerald-400 flex items-center gap-1.5">
                                    <CheckCircle className="w-3.5 h-3.5" /> Podatki so izpolnjeni
                                </span>
                            ) : isEmpty ? (
                                'Kliknite za izpolnitev podatkov (obvezno za XML)'
                            ) : (
                                <span className="text-amber-400 flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5" /> Manjkajo nekateri podatki
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-purple-500/20 border-purple-500/30' : ''}`}>
                    <svg
                        className={`w-4 h-4 transition-colors ${isExpanded ? 'text-purple-300' : 'text-slate-400'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                    <div className="p-6 pt-2 border-t border-white/5">
                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 mb-6 flex gap-3 text-sm text-blue-200">
                            <Info className="w-5 h-5 text-blue-400 shrink-0" />
                            <p>Ti podatki se zapišejo v glavo XML datoteke. FURS jih potrebuje za identifikacijo zavezanca. Podatki se shranijo samo v vašem brskalniku.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label="Davčna številka"
                                value={config.taxNumber}
                                onChange={(val) => handleChange('taxNumber', val.replace(/\D/g, ''))}
                                placeholder="12345678"
                                maxLength={8}
                                hasError={!config.taxNumber || config.taxNumber.length !== 8}
                                required
                            />
                            <InputField
                                label="Ime in priimek"
                                value={config.name}
                                onChange={(val) => handleChange('name', val)}
                                placeholder="Janez Novak"
                                hasError={!config.name}
                                required
                            />
                            <InputField
                                label="Naslov"
                                value={config.address}
                                onChange={(val) => handleChange('address', val)}
                                placeholder="Slovenska cesta 1"
                                hasError={!config.address}
                                required
                            />
                            <InputField
                                label="Kraj"
                                value={config.city}
                                onChange={(val) => handleChange('city', val)}
                                placeholder="Ljubljana"
                                hasError={!config.city}
                                required
                            />
                            <InputField
                                label="Poštna številka"
                                value={config.postNumber}
                                onChange={(val) => handleChange('postNumber', val.replace(/\D/g, ''))}
                                placeholder="1000"
                                hasError={!config.postNumber}
                                required
                            />
                            <InputField
                                label="Pošta"
                                value={config.postName}
                                onChange={(val) => handleChange('postName', val)}
                                placeholder="Ljubljana"
                                hasError={!config.postName}
                                required
                            />
                            <InputField
                                label="Email (opcijsko)"
                                value={config.email || ''}
                                onChange={(val) => handleChange('email', val)}
                                placeholder="janez@example.com"
                            />
                            <InputField
                                label="Telefon (opcijsko)"
                                value={config.telephoneNumber || ''}
                                onChange={(val) => handleChange('telephoneNumber', val)}
                                placeholder="041 123 456"
                            />
                        </div>
                        
                        {hasInteracted && errors.length > 0 && (
                            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                <p className="text-amber-400 text-sm font-semibold mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Opozorila:
                                </p>
                                <ul className="text-amber-400/80 text-xs space-y-1 ml-6 list-disc">
                                    {errors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

interface InputFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    maxLength?: number;
    hasError?: boolean;
    required?: boolean;
}

function InputField({ label, value, onChange, placeholder, type = 'text', maxLength, hasError, required }: InputFieldProps) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
                {label} {required && <span className="text-rose-400">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                className={`w-full glass-input px-4 py-3 rounded-xl text-sm placeholder:text-slate-600
                ${hasError ? 'border-amber-500/50 focus:border-amber-500 focus:shadow-[0_0_0_2px_rgba(245,158,11,0.2)]' : ''}`}
            />
        </div>
    );
}
