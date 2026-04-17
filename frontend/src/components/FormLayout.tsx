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
        <div className="bg-background text-on-surface relative min-h-screen flex flex-col selection:bg-primary/30 selection:text-primary">
            {/* Texture overlay */}
            <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-20 z-0 bg-[url('/noise.svg')]"></div>

            <div className="relative z-10 flex flex-col flex-grow">
                <Navbar />

                <main className="flex-grow flex flex-col items-center pt-32 pb-20 px-6">
                    <div className="w-full max-w-3xl glass-panel p-8 sm:p-12 relative overflow-hidden">
                        
                        <header className="mb-10 relative">
                            <span className="font-label text-primary text-[10px] uppercase tracking-[0.3em] block mb-2">
                                PANEL DE ADMINISTRACIÓN
                            </span>
                            <h1 className="font-headline text-4xl sm:text-5xl tracking-wide uppercase flex items-center gap-4 border-b border-outline-variant/30 pb-6">
                                {titlePrefix} <span className="text-primary">{titleHighlight}</span>
                            </h1>
                        </header>

                        <form onSubmit={onSubmit} className="space-y-8 relative z-10">
                            {mensaje && (
                                <div className={`p-4 border font-body text-sm flex items-center gap-3 ${mensaje.tipo === 'exito' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-error/10 text-error border-error/30'}`}>
                                    <span className="material-symbols-outlined text-[20px]">
                                        {mensaje.tipo === 'exito' ? 'check_circle' : 'error'}
                                    </span>
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
