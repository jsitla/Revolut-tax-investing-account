import { useState, useEffect } from 'react';
import { TaxpayerConfig, validateTaxpayerConfig, defaultTaxpayerConfig } from '../utils/xml-builder';
import { motion } from 'framer-motion';
import { User, Info, ShieldCheck, Lock, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { PrivacyModal, TermsModal } from './LegalModals';

interface TaxpayerOnboardingProps {
    onContinue: (config: TaxpayerConfig) => void;
    onBack: () => void;
    initialConfig?: TaxpayerConfig;
}

const STORAGE_KEY = 'furs-taxpayer-config';

const loadConfig = (): TaxpayerConfig => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Failed to load taxpayer config:', e);
    }
    return defaultTaxpayerConfig;
};

const saveConfig = (config: TaxpayerConfig): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
        console.warn('Failed to save taxpayer config:', e);
    }
};

export default function TaxpayerOnboarding({ onContinue, onBack, initialConfig }: TaxpayerOnboardingProps) {
    const [config, setConfig] = useState<TaxpayerConfig>(initialConfig || loadConfig());
    const [errors, setErrors] = useState<string[]>([]);
    const [hasConsented, setHasConsented] = useState(false);
    const [showConsentError, setShowConsentError] = useState(false);

    useEffect(() => {
        const validationErrors = validateTaxpayerConfig(config);
        setErrors(validationErrors);
    }, [config]);

    const handleChange = (field: keyof TaxpayerConfig, value: string) => {
        const newConfig = { ...config, [field]: value };
        setConfig(newConfig);
        saveConfig(newConfig);
    };

    const handleContinue = () => {
        if (!hasConsented) {
            setShowConsentError(true);
            return;
        }
        if (errors.length === 0) {
            onContinue(config);
        }
    };

    const isValid = errors.length === 0 && config.taxNumber.length === 8;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto"
        >
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-purple-500/25">
                    <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Podatki davčnega zavezanca</h2>
                <p className="text-slate-400">
                    Za generiranje XML dokumenta potrebujemo vaše osebne podatke, ki se vnesejo v napoved.
                </p>
            </div>

            {/* Info Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-indigo-300">Lokalna obdelava</p>
                        <p className="text-xs text-slate-400 mt-0.5">Podatki se obdelajo samo v vašem brskalniku in se nikoli ne pošljejo na strežnike.</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-emerald-300">Zahteva FURS</p>
                        <p className="text-xs text-slate-400 mt-0.5">Ti podatki so obvezni za pravilen uvoz XML v sistem eDavki.</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="glass-panel rounded-2xl p-6 space-y-5">
                {/* Davčna številka */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Davčna številka <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        value={config.taxNumber}
                        onChange={(e) => handleChange('taxNumber', e.target.value.replace(/\D/g, '').slice(0, 8))}
                        placeholder="12345678"
                        maxLength={8}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-mono text-lg tracking-wider"
                    />
                    <p className="text-xs text-slate-500 mt-1.5">8-mestna davčna številka brez SI predpone</p>
                </div>

                {/* Ime in priimek */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Ime in priimek <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        value={config.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Janez Novak"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                    />
                </div>

                {/* Naslov */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Naslov <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        value={config.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        placeholder="Slovenska cesta 1"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                    />
                </div>

                {/* Poštna številka in Pošta */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Poštna številka <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={config.postNumber}
                            onChange={(e) => handleChange('postNumber', e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="1000"
                            maxLength={4}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Pošta <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={config.postName}
                            onChange={(e) => handleChange('postName', e.target.value)}
                            placeholder="Ljubljana"
                            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                        />
                    </div>
                </div>

                {/* Kraj */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Kraj <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        value={config.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        placeholder="Ljubljana"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                    />
                </div>

                {/* Info box */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-amber-200">
                            Podatki se shranijo lokalno v vašem brskalniku in bodo ob naslednjem obisku že izpolnjeni.
                        </p>
                    </div>
                </div>

                {/* Consent Checkbox */}
                <div className="pt-2 border-t border-white/5">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative mt-0.5">
                            <input
                                type="checkbox"
                                checked={hasConsented}
                                onChange={(e) => {
                                    setHasConsented(e.target.checked);
                                    if (e.target.checked) setShowConsentError(false);
                                }}
                                className="sr-only peer"
                            />
                            <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                                hasConsented 
                                    ? 'bg-indigo-500 border-indigo-500' 
                                    : showConsentError 
                                        ? 'border-red-500 bg-red-500/10' 
                                        : 'border-slate-600 group-hover:border-slate-500'
                            }`}>
                                {hasConsented && <Check className="w-3 h-3 text-white" />}
                            </div>
                        </div>
                        <span className="text-sm text-slate-300">
                            Prebral/-a sem in se strinjam s{' '}
                            <TermsModal>
                                <button type="button" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 cursor-pointer">
                                    Pogoji uporabe
                                </button>
                            </TermsModal>
                            {' '}in{' '}
                            <PrivacyModal>
                                <button type="button" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 cursor-pointer">
                                    Politiko zasebnosti
                                </button>
                            </PrivacyModal>
                            .
                        </span>
                    </label>
                    {showConsentError && (
                        <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Za nadaljevanje se morate strinjati s pogoji uporabe.
                        </p>
                    )}
                </div>

                {/* Validation Errors */}
                {errors.length > 0 && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                        <p className="text-sm text-red-300 font-medium mb-1">Manjkajoči podatki:</p>
                        <ul className="text-xs text-red-400 list-disc list-inside space-y-0.5">
                            {errors.map((error, i) => (
                                <li key={i}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-6">
                <button
                    onClick={onBack}
                    className="px-5 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-sm font-medium"
                >
                    ← Nazaj
                </button>
                <button
                    onClick={handleContinue}
                    disabled={!isValid}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                        isValid
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02]'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                >
                    Nadaljuj na pregled
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}
