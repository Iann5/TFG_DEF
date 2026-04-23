import { useRegistro } from "../hooks/useRegistro";

export default function RegisterPage() {
  const {
    navigate,
    loading,
    error,
    showPassword,
    setShowPassword,
    handleFileChange,
    handleChange,
    handleSubmit
  } = useRegistro();

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4 py-20 bg-background bg-halftone relative">
      {/* Elemento de diseño de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-4xl bg-surface-container-low/80 backdrop-blur-xl p-10 rounded-lg border border-outline-variant/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative z-10 box-border">

        <h2 className="text-4xl font-headline font-black text-center mb-10 text-on-surface uppercase tracking-tight">
          Crear <span className="text-primary italic">Cuenta</span>
        </h2>

        {error && (
          <div className="bg-error-container/20 border-l-4 border-error p-4 mb-8 shadow-md text-sm text-on-surface-variant font-body rounded-r-md">
            <p className="font-label text-xs uppercase tracking-widest text-error mb-1 font-bold">Error de Registro</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* Datos de Cuenta */}
            <div className="space-y-5">
              <h3 className="font-label text-xs tracking-widest text-primary border-b border-outline-variant/30 pb-2 uppercase mb-4">Datos de Acceso</h3>
              <input
                type="email" name="email" placeholder="CORREO ELECTRÓNICO" required
                className="w-full p-3 bg-surface-container-highest border border-outline-variant/30 text-on-surface font-body rounded-sm placeholder-outline/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                onChange={handleChange}
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} name="password" placeholder="CONTRASEÑA" required
                  className="w-full p-3 pr-12 bg-surface-container-highest border border-outline-variant/30 text-on-surface font-body rounded-sm placeholder-outline/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 px-3 text-outline-variant hover:text-primary transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Datos Personales */}
            <div className="space-y-5">
              <h3 className="font-label text-xs tracking-widest text-primary border-b border-outline-variant/30 pb-2 uppercase mb-4">Datos Personales</h3>
              <input
                type="text" name="nombre" placeholder="NOMBRE" required
                className="w-full p-3 bg-surface-container-highest border border-outline-variant/30 text-on-surface font-body rounded-sm placeholder-outline/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                onChange={handleChange}
              />
              <input
                type="text" name="apellidos" placeholder="APELLIDOS" required
                className="w-full p-3 bg-surface-container-highest border border-outline-variant/30 text-on-surface font-body rounded-sm placeholder-outline/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                onChange={handleChange}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text" name="dni" placeholder="DNI" required
                  className="w-full p-3 bg-surface-container-highest border border-outline-variant/30 text-on-surface font-body rounded-sm placeholder-outline/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                  onChange={handleChange}
                />
                <input
                  type="tel" name="telefono" placeholder="TELÉFONO" required
                  className="w-full p-3 bg-surface-container-highest border border-outline-variant/30 text-on-surface font-body rounded-sm placeholder-outline/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Dirección */}
            <div className="col-span-1 md:col-span-2 space-y-5 mt-4">
              <h3 className="font-label text-xs tracking-widest text-primary border-b border-outline-variant/30 pb-2 uppercase mb-4">Dirección</h3>
              <input
                type="text" name="direccion" placeholder="DIRECCIÓN COMPLETA" required
                className="w-full p-3 bg-surface-container-highest border border-outline-variant/30 text-on-surface font-body rounded-sm placeholder-outline/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                onChange={handleChange}
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input type="text" name="pais" placeholder="PAÍS" required className="w-full p-3 bg-surface-container-highest border border-outline-variant/30 text-on-surface font-body rounded-sm placeholder-outline/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm" onChange={handleChange} />
                <input type="text" name="provincia" placeholder="PROVINCIA" required className="w-full p-3 bg-surface-container-highest border border-outline-variant/30 text-on-surface font-body rounded-sm placeholder-outline/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm" onChange={handleChange} />
                <input type="text" name="localidad" placeholder="LOCALIDAD" required className="w-full p-3 bg-surface-container-highest border border-outline-variant/30 text-on-surface font-body rounded-sm placeholder-outline/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm" onChange={handleChange} />
                <input
                  type="text" name="cp" placeholder="C.P." required
                  className="w-full p-3 bg-surface-container-highest border border-outline-variant/30 text-on-surface font-body rounded-sm placeholder-outline/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Foto de Perfil */}
            <div className="col-span-1 md:col-span-2 mt-4">
              <label className="block font-label text-[#8c909f] mb-3 tracking-[0.2em] text-xs uppercase">Foto de Perfil (Opcional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-label file:tracking-widest file:bg-surface-container-highest file:text-primary hover:file:bg-primary hover:file:text-[#00285d] file:transition-colors file:cursor-pointer cursor-pointer border border-outline-variant/30 p-2 rounded-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 mt-10 block text-center font-label tracking-widest text-sm font-bold uppercase transition-all duration-300 rounded-sm
                ${loading ? 'bg-surface-container-highest text-outline cursor-not-allowed shadow-none' : 'primary-gradient-cta text-[#00285d] shadow-[0_5px_20px_rgba(173,198,255,0.15)] hover:shadow-[0_5px_30px_rgba(173,198,255,0.3)] hover:-translate-y-0.5'}`}
          >
            {loading ? (
                <span className="flex items-center justify-center font-label tracking-widest">
                    <span className="material-symbols-outlined animate-spin mr-2 text-sm">refresh</span>
                    Registrando...
                </span>
            ) : 'COMPLETAR REGISTRO'}
          </button>

        </form>

        <div className="mt-8 text-center border-t border-outline-variant/20 pt-8">
          <p className="text-xs font-label tracking-widest text-outline uppercase mb-4">
            ¿Ya tienes cuenta en el estudio?
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full block text-center bg-transparent border border-outline-variant/40 text-on-surface font-label tracking-widest text-xs uppercase py-3 rounded-sm hover:border-primary hover:text-primary transition-all mb-6"
          >
            INICIA SESIÓN AQUÍ
          </button>
          
          <span onClick={() => navigate('/')} className='text-on-surface-variant hover:text-primary cursor-pointer font-label transition-colors inline-flex items-center gap-1 uppercase text-[10px] tracking-widest'>
            <span className="material-symbols-outlined text-[10px]">arrow_back</span> Volver al inicio
          </span>
        </div>
      </div>
    </div>
  );
}