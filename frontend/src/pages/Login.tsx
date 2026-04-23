import { useLogin } from '../hooks/useLogin';

export default function LoginPage() {
    const {
        email,
        setEmail,
        password,
        setPassword,
        showPassword,
        setShowPassword,
        error,
        loading,
        navigate,
        handleSubmit
    } = useLogin();

    return (
        <div className="flex min-h-[100dvh] items-center justify-center px-4 bg-background bg-halftone relative py-20">
            {/* Elemento de diseño de fondo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
            
            {/* Contenedor del formulario */}
            <div className="w-full max-w-md bg-surface-container-low/80 backdrop-blur-xl p-10 rounded-lg border border-outline-variant/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative z-10 box-border">

                {/* Título */}
                <h2 className="text-4xl font-headline font-black text-center mb-8 text-on-surface uppercase tracking-tight">
                    Iniciar <span className="text-primary italic">Sesión</span>
                </h2>

                {/* Mensaje de Error */}
                {error && (
                    <div className="bg-error-container/20 border-l-4 border-error p-4 mb-6 shadow-md text-sm text-on-surface-variant font-body rounded-r-md" role="alert">
                        <p className="font-label text-xs uppercase tracking-widest text-error mb-1 font-bold">Error de Acceso</p>
                        <p>{error}</p>
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Campo Email */}
                    <div>
                        <label className="block text-xs font-label text-[#8c909f] mb-2 tracking-[0.2em] uppercase">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 bg-surface-container-highest border border-outline-variant/30 text-on-surface font-body rounded-sm placeholder-outline/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all disabled:opacity-50"
                            placeholder="tatuaje@paradise.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Campo Contraseña */}
                    <div>
                        <label className="block text-xs font-label text-[#8c909f] mb-2 tracking-[0.2em] uppercase">
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full px-4 py-3 pr-12 bg-surface-container-highest border border-outline-variant/30 text-on-surface font-body rounded-sm placeholder-outline/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all disabled:opacity-50"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                className="absolute inset-y-0 right-0 px-3 text-outline-variant hover:text-primary transition-colors"
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                disabled={loading}
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Botón Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 block text-center font-label tracking-widest text-sm font-bold uppercase transition-all duration-300 rounded-sm
                            ${loading
                                ? 'bg-surface-container-highest text-outline cursor-not-allowed shadow-none'
                                : 'primary-gradient-cta text-[#00285d] shadow-[0_5px_20px_rgba(173,198,255,0.15)] hover:shadow-[0_5px_30px_rgba(173,198,255,0.3)] hover:-translate-y-0.5'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center font-label tracking-widest">
                                <span className="material-symbols-outlined animate-spin mr-2 text-sm">refresh</span>
                                Autenticando...
                            </span>
                        ) : 'ACCEDER AL ESTUDIO'}
                    </button>
                </form>

                {/* Enlace a Registro */}
                <div className="mt-8 text-center border-t border-outline-variant/20 pt-8">
                    <p className="text-xs font-label tracking-widest text-outline uppercase mb-4">
                        ¿Nuevo en el estudio?
                    </p>
                    <button
                        onClick={() => navigate('/registro')}
                        className="w-full block text-center bg-transparent border border-outline-variant/40 text-on-surface font-label tracking-widest text-xs uppercase py-3 rounded-sm hover:border-primary hover:text-primary transition-all mb-6"
                    >
                        CREAR CUENTA
                    </button>
                    
                    <span onClick={() => navigate('/')}
                        className='text-on-surface-variant hover:text-primary cursor-pointer font-label transition-colors inline-flex items-center gap-1 uppercase text-[10px] tracking-widest'
                    >
                        <span className="material-symbols-outlined text-[10px]">arrow_back</span> Volver al inicio
                    </span>
                </div>
            </div>
        </div>
    );
}