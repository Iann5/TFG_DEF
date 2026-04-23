import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCheckout } from '../hooks/useCheckout';

export default function Checkout() {
    const {
        cart,
        cartTotal,
        navigate,
        envio,
        handleChangeEnvio,
        metodoPago,
        setMetodoPago,
        tarjeta,
        handleTarjetaChange,
        bizum,
        handleBizumChange,
        payErrors,
        pagoReferencia,
        loading,
        success,
        error,
        handleComprar
    } = useCheckout();

    if (success) {
        return (
            <div className="min-h-screen bg-background text-on-surface flex flex-col relative selection:bg-primary/30 selection:text-primary">
                {/* Texture overlay */}
                <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-20 z-0 bg-[url('/noise.svg')]"></div>
                <div className="relative z-10 flex flex-col flex-1">
                    <Navbar />
                    <main className="flex-grow flex items-center justify-center p-4 relative z-10">
                        {/* Decorative background element */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

                        <div className="glass-panel p-12 max-w-lg w-full text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
                            
                            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8 border border-primary/30 relative z-10">
                                <span className="material-symbols-outlined text-[48px] text-primary">check_circle</span>
                            </div>
                            <h1 className="font-headline text-3xl md:text-4xl font-bold uppercase tracking-wide leading-none mb-4 relative z-10 text-on-surface">
                                ¡Gracias por tu compra!
                            </h1>
                            <p className="font-body text-sm text-on-surface-variant mb-6 leading-relaxed relative z-10">
                                Tu pedido se ha registrado correctamente y pronto nos pondremos manos a la obra para prepararlo. Recibirás un email de confirmación en breve.
                            </p>
                            {pagoReferencia && (
                                <p className="font-label text-[10px] uppercase tracking-widest text-outline flex items-center justify-center gap-2 mb-10 relative z-10">
                                    <span className="material-symbols-outlined text-[14px]">receipt</span>
                                    Referencia de pago: <span className="text-primary font-bold ml-1">{pagoReferencia}</span>
                                </p>
                            )}
                            <button
                                onClick={() => navigate('/')}
                                className="primary-gradient-cta w-full"
                            >
                                <div className="cta-content">
                                   <span>Volver a Inicio</span>
                                   <span className="material-symbols-outlined text-[16px]">home</span>
                                </div>
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-on-surface flex flex-col relative selection:bg-primary/30 selection:text-primary">
            {/* Texture overlay */}
            <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-20 z-0 bg-[url('/noise.svg')]"></div>
            <div className="relative z-10 flex flex-col flex-1">
                <Navbar />

                <main className="flex-grow pt-32 pb-20 relative z-10 px-4 md:px-8 max-w-[1200px] w-full mx-auto">
                    <button
                        onClick={() => navigate('/carrito')}
                        className="flex items-center gap-2 text-outline hover:text-primary font-label text-[10px] uppercase tracking-widest mb-10 transition-colors group w-fit"
                    >
                        <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        Volver al carrito
                    </button>

                    <div className="mb-12 flex items-end gap-6 border-b border-outline-variant/20 pb-8">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                           <span className="material-symbols-outlined text-primary text-3xl">shopping_cart_checkout</span>
                        </div>
                        <div>
                            <span className="font-label text-primary text-[10px] uppercase tracking-[0.3em] block mb-2">Último Paso</span>
                            <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-wide leading-none">
                                Finalizar Compra
                            </h1>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-error/10 text-error border border-error/30 font-label text-xs uppercase tracking-widest p-4 rounded-sm mb-8 flex items-center gap-3">
                            <span className="material-symbols-outlined">error</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleComprar} className="flex flex-col lg:flex-row gap-10 lg:gap-14">
                        {/* Columna Izquierda: Datos y Pago */}
                        <div className="lg:w-2/3 space-y-10">

                            {/* 1. Dirección de envío */}
                            <div className="glass-panel p-8 md:p-10 relative overflow-hidden">
                                {/* Decorator line */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-outline-variant/30"></div>
                                
                                <h2 className="font-headline text-2xl font-bold uppercase tracking-widest text-on-surface mb-8 flex items-center gap-3 pb-4 border-b border-outline-variant/20">
                                    <span className="material-symbols-outlined text-primary text-[24px]">local_shipping</span>
                                    1. Dirección de Entrega
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="font-label text-[10px] tracking-[0.2em] uppercase text-outline">Dirección Completa</label>
                                        <input type="text" name="direccion" value={envio.direccion} onChange={handleChangeEnvio} required
                                            className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary p-3 font-body text-sm text-on-surface rounded-sm transition-colors outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-label text-[10px] tracking-[0.2em] uppercase text-outline">Localidad</label>
                                        <input type="text" name="localidad" value={envio.localidad} onChange={handleChangeEnvio} required
                                            className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary p-3 font-body text-sm text-on-surface rounded-sm transition-colors outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-label text-[10px] tracking-[0.2em] uppercase text-outline">Provincia</label>
                                        <input type="text" name="provincia" value={envio.provincia} onChange={handleChangeEnvio} required
                                            className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary p-3 font-body text-sm text-on-surface rounded-sm transition-colors outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-label text-[10px] tracking-[0.2em] uppercase text-outline">País</label>
                                        <input type="text" name="pais" value={envio.pais} onChange={handleChangeEnvio} required
                                            className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary p-3 font-body text-sm text-on-surface rounded-sm transition-colors outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-label text-[10px] tracking-[0.2em] uppercase text-outline">Código Postal</label>
                                        <input type="text" name="cp" value={envio.cp} onChange={handleChangeEnvio} required
                                            className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary p-3 font-body text-sm text-on-surface rounded-sm transition-colors outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* 2. Método de pago */}
                            <div className="glass-panel p-8 md:p-10 relative overflow-hidden">
                                {/* Decorator line */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-outline-variant/30"></div>
                                
                                <h2 className="font-headline text-2xl font-bold uppercase tracking-widest text-on-surface mb-8 flex items-center gap-3 pb-4 border-b border-outline-variant/20">
                                    <span className="material-symbols-outlined text-primary text-[24px]">payments</span>
                                    2. Método de Pago
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    <button type="button" onClick={() => setMetodoPago('tarjeta')}
                                        className={`flex flex-col items-center justify-center gap-3 p-4 border rounded-sm transition-all duration-300 ${metodoPago === 'tarjeta' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-container border-outline-variant/30 text-outline hover:border-primary/50'}`}>
                                        <span className="material-symbols-outlined text-[32px]">credit_card</span>
                                        <span className="font-label text-[10px] tracking-widest uppercase">Tarjeta</span>
                                    </button>
                                    <button type="button" onClick={() => setMetodoPago('bizum')}
                                        className={`flex flex-col items-center justify-center gap-3 p-4 border rounded-sm transition-all duration-300 ${metodoPago === 'bizum' ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'bg-surface-container border-outline-variant/30 text-outline hover:border-blue-500/50'}`}>
                                        <span className="material-symbols-outlined text-[32px]">smartphone</span>
                                        <span className="font-label text-[10px] tracking-widest uppercase">Bizum</span>
                                    </button>
                                    <button type="button" onClick={() => setMetodoPago('efectivo')}
                                        className={`flex flex-col items-center justify-center gap-3 p-4 border rounded-sm transition-all duration-300 ${metodoPago === 'efectivo' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-surface-container border-outline-variant/30 text-outline hover:border-green-500/50'}`}>
                                        <span className="material-symbols-outlined text-[32px]">money</span>
                                        <span className="font-label text-[10px] tracking-widest uppercase">Efectivo</span>
                                    </button>
                                </div>

                                <div className="p-6 bg-surface-container border border-outline-variant/30 rounded-sm min-h-[220px] relative overflow-hidden">
                                     <div className="absolute inset-0 bg-halftone opacity-10 pointer-events-none mix-blend-overlay"></div>
                                    
                                    {/* ─── TARJETA DE CRÉDITO/DÉBITO ─── */}
                                    {metodoPago === 'tarjeta' && (
                                        <div className="space-y-4 animate-in fade-in relative z-10">

                                            {/* Número de tarjeta */}
                                            <div className="space-y-1">
                                                <label htmlFor="card-numero" className="font-label text-[10px] tracking-[0.2em] uppercase text-outline">
                                                    Número de la Tarjeta
                                                </label>
                                                <input
                                                    id="card-numero"
                                                    name="numero"
                                                    type="text"
                                                    inputMode="numeric"
                                                    placeholder="0000 0000 0000 0000"
                                                    value={tarjeta.numero}
                                                    onChange={handleTarjetaChange}
                                                    autoComplete="cc-number"
                                                    className={`w-full bg-surface-container-highest border rounded-sm p-3 font-body text-sm text-on-surface outline-none transition-colors tracking-widest ${
                                                        payErrors.numero
                                                            ? 'border-error focus:border-error'
                                                            : 'border-outline-variant/30 focus:border-primary'
                                                    }`}
                                                />
                                                {payErrors.numero && (
                                                    <p className="font-label text-[10px] text-error flex items-center gap-1 mt-1">
                                                        <span className="material-symbols-outlined text-[12px]">error</span>
                                                        {payErrors.numero}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                {/* Caducidad */}
                                                <div className="space-y-1">
                                                    <label htmlFor="card-caducidad" className="font-label text-[10px] tracking-[0.2em] uppercase text-outline">
                                                        Caducidad (MM/AA)
                                                    </label>
                                                    <input
                                                        id="card-caducidad"
                                                        name="caducidad"
                                                        type="text"
                                                        inputMode="numeric"
                                                        placeholder="MM/AA"
                                                        value={tarjeta.caducidad}
                                                        onChange={handleTarjetaChange}
                                                        autoComplete="cc-exp"
                                                        className={`w-full bg-surface-container-highest border rounded-sm p-3 font-body text-sm text-on-surface outline-none transition-colors ${
                                                            payErrors.caducidad
                                                                ? 'border-error focus:border-error'
                                                                : 'border-outline-variant/30 focus:border-primary'
                                                        }`}
                                                    />
                                                    {payErrors.caducidad && (
                                                        <p className="font-label text-[10px] text-error flex items-center gap-1 mt-1">
                                                            <span className="material-symbols-outlined text-[12px]">error</span>
                                                            {payErrors.caducidad}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* CVC */}
                                                <div className="space-y-1">
                                                    <label htmlFor="card-cvc" className="font-label text-[10px] tracking-[0.2em] uppercase text-outline">
                                                        CVC
                                                    </label>
                                                    <input
                                                        id="card-cvc"
                                                        name="cvc"
                                                        type="text"
                                                        inputMode="numeric"
                                                        placeholder="123"
                                                        value={tarjeta.cvc}
                                                        onChange={handleTarjetaChange}
                                                        autoComplete="cc-csc"
                                                        className={`w-full bg-surface-container-highest border rounded-sm p-3 font-body text-sm text-on-surface outline-none transition-colors ${
                                                            payErrors.cvc
                                                                ? 'border-error focus:border-error'
                                                                : 'border-outline-variant/30 focus:border-primary'
                                                        }`}
                                                    />
                                                    {payErrors.cvc && (
                                                        <p className="font-label text-[10px] text-error flex items-center gap-1 mt-1">
                                                            <span className="material-symbols-outlined text-[12px]">error</span>
                                                            {payErrors.cvc}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Titular */}
                                            <div className="space-y-1">
                                                <label htmlFor="card-titular" className="font-label text-[10px] tracking-[0.2em] uppercase text-outline">
                                                    Titular de la tarjeta
                                                </label>
                                                <input
                                                    id="card-titular"
                                                    name="titular"
                                                    type="text"
                                                    placeholder="Nombre completo"
                                                    value={tarjeta.titular}
                                                    onChange={handleTarjetaChange}
                                                    autoComplete="cc-name"
                                                    className={`w-full bg-surface-container-highest border rounded-sm p-3 font-body text-sm text-on-surface outline-none transition-colors uppercase ${
                                                        payErrors.titular
                                                            ? 'border-error focus:border-error'
                                                            : 'border-outline-variant/30 focus:border-primary'
                                                    }`}
                                                />
                                                {payErrors.titular && (
                                                    <p className="font-label text-[10px] text-error flex items-center gap-1 mt-1">
                                                        <span className="material-symbols-outlined text-[12px]">error</span>
                                                        {payErrors.titular}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* ─── BIZUM ─── */}
                                    {metodoPago === 'bizum' && (
                                        <div className="text-center space-y-6 animate-in fade-in py-4 relative z-10 flex flex-col items-center justify-center h-full">
                                            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
                                                <span className="material-symbols-outlined text-[32px] text-blue-500">smartphone</span>
                                            </div>
                                            <div>
                                                <p className="font-body text-sm text-on-surface-variant mb-4">Envía el importe al teléfono de nuestro estudio:</p>
                                                <p className="font-headline font-bold text-2xl md:text-3xl tracking-widest text-on-surface px-6 py-3 bg-surface-container-highest border border-outline-variant/30 rounded-sm inline-block select-all">+34 600 000 000</p>
                                            </div>

                                            {/* Tu número de teléfono */}
                                            <div className="text-left space-y-1 max-w-sm w-full">
                                                <label htmlFor="bizum-telefono" className="font-label text-[10px] tracking-[0.2em] uppercase text-outline block mb-2">
                                                    Tu número de móvil (confirmación)
                                                </label>
                                                <input
                                                    id="bizum-telefono"
                                                    name="telefono"
                                                    type="tel"
                                                    inputMode="numeric"
                                                    placeholder="612 345 678"
                                                    value={bizum.telefono}
                                                    onChange={handleBizumChange}
                                                    className={`w-full bg-surface-container-highest border rounded-sm p-3 font-body text-sm text-on-surface text-center outline-none transition-colors ${
                                                        payErrors.telefono
                                                            ? 'border-error focus:border-error'
                                                            : 'border-outline-variant/30 focus:border-blue-500'
                                                    }`}
                                                />
                                                {payErrors.telefono && (
                                                    <p className="font-label text-[10px] text-error flex items-center gap-1 justify-center mt-1">
                                                        <span className="material-symbols-outlined text-[12px]">error</span>
                                                        {payErrors.telefono}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Concepto */}
                                            <div className="text-left space-y-1 max-w-sm w-full">
                                                <label htmlFor="bizum-concepto" className="font-label text-[10px] tracking-[0.2em] uppercase text-outline block mb-2">
                                                    Concepto del Bizum
                                                </label>
                                                <input
                                                    id="bizum-concepto"
                                                    name="concepto"
                                                    type="text"
                                                    placeholder="Nombre + Pedido"
                                                    value={bizum.concepto}
                                                    onChange={handleBizumChange}
                                                    className={`w-full bg-surface-container-highest border rounded-sm p-3 font-body text-sm text-on-surface text-center outline-none transition-colors ${
                                                        payErrors.concepto
                                                            ? 'border-error focus:border-error'
                                                            : 'border-outline-variant/30 focus:border-blue-500'
                                                    }`}
                                                />
                                                {payErrors.concepto && (
                                                    <p className="font-label text-[10px] text-error flex items-center gap-1 justify-center mt-1">
                                                        <span className="material-symbols-outlined text-[12px]">error</span>
                                                        {payErrors.concepto}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* ─── EFECTIVO ─── */}
                                    {metodoPago === 'efectivo' && (
                                        <div className="text-center space-y-6 animate-in fade-in py-8 relative z-10 flex flex-col items-center justify-center h-full">
                                            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30">
                                                <span className="material-symbols-outlined text-[32px] text-green-500">local_shipping</span>
                                            </div>
                                            <h3 className="font-headline font-bold text-xl uppercase tracking-widest text-on-surface">Pagar al repartidor</h3>
                                            <p className="font-body text-sm text-on-surface-variant max-w-md leading-relaxed px-4">
                                                No necesitas adelantar el dinero. Abonarás tu compra en metálico directamente al transportista en el momento en que recibas el paquete en tu domicilio.
                                            </p>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* Columna Derecha: Resumen */}
                        <div className="lg:w-1/3">
                            <div className="glass-panel p-8 sticky top-32 flex flex-col h-fit">
                                <h3 className="font-headline text-xl font-bold uppercase tracking-widest text-on-surface mb-6 flex items-center gap-2 pb-4 border-b border-outline-variant/20">
                                   <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
                                   Resumen
                                </h3>

                                <div className="space-y-4 mb-8">
                                    {cart.map(item => (
                                        <div key={`${item.tipo}-${item.tipo === 'producto' ? item.producto?.id : item.pack?.id}`} className="flex gap-4 items-center bg-surface-container border border-outline-variant/30 rounded-sm p-2">
                                            <div className="w-16 h-16 bg-surface-container-highest border border-outline-variant/20 rounded-sm flex items-center justify-center shrink-0 overflow-hidden relative">
                                                <div className="absolute inset-0 bg-halftone opacity-20 top-0 left-0"></div>
                                                {(item.tipo === 'producto' ? item.producto?.imagen : item.pack?.imagen) ? (
                                                    <img
                                                      src={(item.tipo === 'producto' ? item.producto?.imagen : item.pack?.imagen) as string}
                                                      alt={(item.tipo === 'producto' ? item.producto?.nombre : item.pack?.titulo) as string}
                                                      className="w-full h-full object-contain filter grayscale relative z-10"
                                                    />
                                                ) : (
                                                  <span className="material-symbols-outlined text-outline-variant relative z-10">image</span>
                                                )}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <p className="font-headline font-bold text-sm uppercase tracking-wide text-on-surface truncate">
                                                  {item.tipo === 'producto'
                                                    ? (item.producto?.nombre ?? 'Producto')
                                                    : `PACK: ${item.pack?.titulo ?? 'Pack'}`}
                                                </p>
                                                <p className="font-label text-[10px] text-outline tracking-wider mt-1">Cant: x{item.cantidad}</p>
                                            </div>
                                            <p className="font-headline font-bold text-primary text-base pr-2 shrink-0">
                                                {(
                                                  (
                                                    item.tipo === 'producto'
                                                      ? (item.producto?.precioOferta ?? item.producto?.precio_oferta ?? item.producto?.precioOriginal ?? item.producto?.precio_original ?? 0)
                                                      : (item.pack?.precioOferta ?? item.pack?.precioOriginal ?? 0)
                                                  ) * item.cantidad
                                                ).toFixed(2)} €
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-outline-variant/20 mb-8 mt-auto">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="font-label text-[10px] text-outline uppercase tracking-[0.2em]">Total</span>
                                        <span className="font-headline font-bold text-3xl text-primary">{cartTotal.toFixed(2)} €</span>
                                    </div>
                                    <p className="font-body text-[10px] text-outline-variant text-right uppercase">Impuestos Incluidos</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full primary-gradient-cta group"
                                >
                                    <div className="cta-content">
                                        {loading ? (
                                            <><span className="material-symbols-outlined text-[16px] animate-spin">refresh</span> Procesando...</>
                                        ) : (
                                            <><span>Finalizar Pedido</span> <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">check_circle</span></>
                                        )}
                                    </div>
                                </button>
                                
                                <p className="font-label text-[9px] uppercase tracking-widest text-outline text-center mt-6 flex items-center justify-center gap-1.5 opacity-70">
                                    <span className="material-symbols-outlined text-[12px]">lock</span>
                                    Pago 100% Seguro.
                                </p>
                            </div>
                        </div>
                    </form>
                </main>

                <Footer />
            </div>
        </div>
    );
}
