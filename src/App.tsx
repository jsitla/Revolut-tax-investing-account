import { useState } from 'react'
import FileUploader from './components/FileUploader'
import Dashboard from './components/Dashboard'
import TaxpayerOnboarding from './components/TaxpayerOnboarding'
import { RevolutExport } from './types/revolut'
import { TaxpayerConfig } from './utils/xml-builder'
import * as Toast from '@radix-ui/react-toast'
import { AnimatePresence, motion } from 'framer-motion'
import { Upload, User, FileCheck } from 'lucide-react'

type AppStep = 'upload' | 'taxpayer' | 'dashboard'

function StepIndicator({ currentStep }: { currentStep: AppStep }) {
    const steps = [
        { key: 'upload', label: 'Naloži datoteko', icon: Upload },
        { key: 'taxpayer', label: 'Osebni podatki', icon: User },
        { key: 'dashboard', label: 'Pregled & Prenos', icon: FileCheck },
    ] as const;

    const currentIndex = steps.findIndex(s => s.key === currentStep);

    return (
        <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentIndex;
                const isCompleted = index < currentIndex;

                return (
                    <div key={step.key} className="flex items-center">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            isActive 
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                                : isCompleted 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-slate-800/50 text-slate-500 border border-white/5'
                        }`}>
                            <Icon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{step.label}</span>
                            <span className="sm:hidden">{index + 1}</span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`w-8 h-px mx-1 ${isCompleted ? 'bg-emerald-500/50' : 'bg-slate-700'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function App() {
    const [data, setData] = useState<RevolutExport | null>(null)
    const [step, setStep] = useState<AppStep>('upload')
    const [taxpayerConfig, setTaxpayerConfig] = useState<TaxpayerConfig | null>(null)

    const handleFileUpload = (uploadedData: RevolutExport) => {
        setData(uploadedData);
        setStep('taxpayer');
    };

    const handleTaxpayerComplete = (config: TaxpayerConfig) => {
        setTaxpayerConfig(config);
        setStep('dashboard');
    };

    const handleReset = () => {
        setData(null);
        setTaxpayerConfig(null);
        setStep('upload');
    };

    const handleBackToUpload = () => {
        setStep('upload');
    };

    return (
        <Toast.Provider swipeDirection="right">
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white selection:bg-blue-500/30">
                <div className="container mx-auto px-4 py-8">
                    <header className="text-center mb-8">
                        <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-tighter">
                            🇸🇮 Revolut → FURS
                        </h1>
                        <p className="text-slate-400 mt-4 text-base sm:text-lg font-medium max-w-xl mx-auto leading-relaxed">
                            Prvi <span className="text-emerald-400">brezplačni</span> pretvornik podatkov iz <span className="text-blue-400">Revolut</span> trgovalnega računa za slovenska davčna poročila.
                        </p>
                    </header>

                    <StepIndicator currentStep={step} />

                    <main className="max-w-5xl mx-auto">
                        <AnimatePresence mode="wait">
                            {step === 'upload' && (
                                <motion.div
                                    key="upload"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <FileUploader onUpload={handleFileUpload} />
                                </motion.div>
                            )}
                            {step === 'taxpayer' && data && (
                                <motion.div
                                    key="taxpayer"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <TaxpayerOnboarding
                                        onContinue={handleTaxpayerComplete}
                                        onBack={handleBackToUpload}
                                        initialConfig={taxpayerConfig || undefined}
                                    />
                                </motion.div>
                            )}
                            {step === 'dashboard' && data && (
                                <motion.div
                                    key="dashboard"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <Dashboard 
                                        data={data} 
                                        onReset={handleReset}
                                        initialTaxpayerConfig={taxpayerConfig || undefined}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>

                </div>
            </div>
            <Toast.Viewport className="fixed bottom-0 right-0 flex flex-col p-6 gap-2 w-[390px] max-w-[100vw] m-0 list-none z-[2147483647] outline-none" />
        </Toast.Provider>
    )
}

export default App
