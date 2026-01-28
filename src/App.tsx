import { useState } from 'react'
import FileUploader from './components/FileUploader'
import Dashboard from './components/Dashboard'
import { RevolutExport } from './types/revolut'

function App() {
    const [data, setData] = useState<RevolutExport | null>(null)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="container mx-auto px-4 py-8">
                <header className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                        🇸🇮 Revolut → FURS
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Pretvori Revolut izvoz v davčna poročila za FURS
                    </p>
                </header>

                <main className="max-w-4xl mx-auto">
                    {!data ? (
                        <FileUploader onUpload={setData} />
                    ) : (
                        <Dashboard data={data} onReset={() => setData(null)} />
                    )}
                </main>
            </div>
        </div>
    )
}

export default App
