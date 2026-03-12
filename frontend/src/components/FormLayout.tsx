import type { ReactNode, FormEvent } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface Mensaje {
    tipo: 'exito' | 'error';
    texto: string;
}

interface FormLayoutProps {
    titlePrefix: string;
    titleHighlight: string;
    mensaje: Mensaje | null;
    onSubmit: (e: FormEvent) => void;
    children: ReactNode;
}

export default function FormLayout({ titlePrefix, titleHighlight, mensaje, onSubmit, children }: FormLayoutProps) {
    return (
        <div className="bg-[#1C1B28] text-white relative min-h-screen flex flex-col font-sans">
            <div
                className="fixed inset-0 z-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: "url('/paneles.jpg')", backgroundSize: 'cover', filter: 'invert(1)' }}
            ></div>

            <div className="relative z-10 flex flex-col flex-grow">
                <Navbar />

                <main className="flex-grow flex flex-col items-center py-12 px-6">
                    <div className="w-full max-w-2xl bg-[#323444]/80 backdrop-blur-md border border-white/5 p-8 rounded-3xl shadow-2xl">

                        <header className="mb-8 text-center">
                            <h1 className="text-3xl font-light uppercase tracking-widest">
                                {titlePrefix} <span className="text-sky-500 font-bold">{titleHighlight}</span>
                            </h1>
                        </header>

                        <form onSubmit={onSubmit} className="space-y-6">
                            {mensaje && (
                                <div className={`p-4 rounded-xl text-center font-bold transition-all ${mensaje.tipo === 'exito' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
                                    {mensaje.texto}
                                </div>
                            )}

                            {children}
                        </form>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
}
