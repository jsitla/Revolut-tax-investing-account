import { useState } from 'react'
import FileUploader from './components/FileUploader'
import Dashboard from './components/Dashboard'
import { RevolutExport } from './types/revolut'
import * as Toast from '@radix-ui/react-toast'

function App() {
    const [data, setData] = useState<RevolutExport | null>(null)

    return (
        <Toast.Provider swipeDirection="right">
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white selection:bg-blue-500/30">
                <div className="container mx-auto px-4 py-8">
                    <header className="text-center mb-12">
                        <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-tighter">
                            🇸🇮 Revolut → FURS
                        </h1>
                        <p className="text-slate-400 mt-3 text-lg font-medium">
                            Avtomatska davčna poročila iz Revolut izpiskov.
                        </p>
                    </header>

                    <main className="max-w-5xl mx-auto">
                        {!data ? (
                            <FileUploader onUpload={setData} />
                        ) : (
                            <Dashboard data={data} onReset={() => setData(null)} />
                        )}
                    </main>

                </div>
            </div>
            <Toast.Viewport className="fixed bottom-0 right-0 flex flex-col p-6 gap-2 w-[390px] max-w-[100vw] m-0 list-none z-[2147483647] outline-none" />
        </Toast.Provider>
    )
}

export default App
