import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

export default function Carrito() {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col relative selection:bg-primary/30 selection:text-primary">
      {/* Texture overlay */}
      <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-20 z-0 bg-[url('/noise.svg')]"></div>

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />

        <main className="flex-grow pt-32 pb-20 relative z-10 px-4 md:px-8 max-w-[1200px] w-full mx-auto">
          {/* Header */}
          <div className="mb-12 flex items-end justify-between gap-6 border-b border-outline-variant/20 pb-8">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                   <span className="material-symbols-outlined text-primary text-3xl">local_mall</span>
                </div>
                <div>
                   <span className="font-label text-primary text-[10px] uppercase tracking-[0.3em] block mb-2">Completar Pedido</span>
                   <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-wide leading-none">Tu Carrito</h1>
                </div>
            </div>
            {cartCount > 0 && (
              <span className="bg-primary/10 text-primary border border-primary/30 font-label text-[10px] uppercase tracking-widest px-4 py-2 rounded-sm hidden md:inline-block">
                {cartCount} {cartCount === 1 ? 'ARTÍCULO' : 'ARTÍCULOS'}
              </span>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="glass-panel p-16 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-outline-variant text-[48px]">remove_shopping_cart</span>
              </div>
              <h2 className="font-headline text-2xl uppercase tracking-widest text-on-surface mb-2">Tu carrito está vacío</h2>
              <p className="font-body text-sm text-on-surface-variant max-w-md mb-8">Parece que aún no has añadido ningún producto a tu carrito. ¡Explora la colección!</p>
              <button
                onClick={() => navigate('/merchandising')}
                className="primary-gradient-cta px-8 py-3"
              >
                <div className="cta-content">
                  <span>Ver Merchandising</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </div>
              </button>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
              {/* Lista de productos */}
              <div className="lg:w-2/3 space-y-6">
                {cart.map((item) => {
                  const esProducto = item.tipo === 'producto';
                  const id = esProducto ? (item.producto?.id ?? -1) : (item.pack?.id ?? -1);
                  const nombre = esProducto ? (item.producto?.nombre ?? 'Producto') : (item.pack?.titulo ?? 'Pack');
                  const imagen = esProducto ? (item.producto?.imagen ?? '') : (item.pack?.imagen ?? '');
                  const stock = esProducto ? ((item.producto as any)?.stock ?? null) : (item.pack?.stock ?? null);
                  const sinMasStock = typeof stock === 'number' ? item.cantidad >= stock : false;
                  const precioUnidad = esProducto
                    ? (item.producto?.precioOferta ?? item.producto?.precio_oferta ?? item.producto?.precioOriginal ?? item.producto?.precio_original ?? 0)
                    : (item.pack?.precioOferta ?? item.pack?.precioOriginal ?? 0);
                  const subtotal = precioUnidad * item.cantidad;

                  return (
                    <div key={`${item.tipo}-${id}`} className="glass-panel p-4 flex flex-col sm:flex-row gap-6 items-center lg:items-stretch group transition-all duration-300 hover:border-primary/50 relative overflow-hidden">
                      {/* Decorative accent */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/0 group-hover:bg-primary/50 transition-colors"></div>

                      <div className="w-28 sm:w-32 aspect-square border border-outline-variant/20 bg-surface-container-highest overflow-hidden shrink-0 flex items-center justify-center p-2 relative rounded-sm">
                        <div className="absolute inset-0 bg-halftone opacity-20 Mix blend overlay pointer-events-none"></div>
                        {imagen ? (
                          <img src={imagen} alt={nombre} className="w-full h-full object-contain filter grayscale group-hover:filter-none transition-all duration-500 relative z-10" />
                        ) : (
                          <span className="material-symbols-outlined text-outline-variant text-4xl relative z-10">image</span>
                        )}
                      </div>

                      <div className="flex-grow flex flex-col justify-center gap-1 w-full text-center sm:text-left min-w-0">
                        <h3 className="font-headline font-bold text-lg md:text-xl uppercase tracking-wide text-on-surface truncate group-hover:text-primary transition-colors">
                          {esProducto ? nombre : `PACK: ${nombre}`}
                        </h3>
                        <p className="font-label text-primary text-xs uppercase tracking-widest">{precioUnidad.toFixed(2)} €</p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4 sm:gap-6 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-outline-variant/20 w-full sm:w-auto">
                        <div className="flex flex-col justify-center items-center sm:items-end gap-3 w-full sm:w-auto">
                           {/* Controles de cantidad */}
                           <div className="flex items-center bg-surface-container border border-outline-variant/30 rounded-sm">
                             <button
                               onClick={() => updateQuantity(id, item.cantidad - 1, item.tipo)}
                               className="w-8 h-8 flex items-center justify-center text-outline hover:text-primary transition-colors disabled:opacity-50"
                               disabled={item.cantidad <= 1}
                             >
                               <span className="material-symbols-outlined text-[16px]">remove</span>
                             </button>
                             <span className="w-8 text-center font-body text-sm font-semibold text-on-surface">{item.cantidad}</span>
                             <button
                               onClick={() => updateQuantity(id, item.cantidad + 1, item.tipo)}
                               className="w-8 h-8 flex items-center justify-center text-outline hover:text-primary transition-colors"
                               disabled={sinMasStock}
                             >
                               <span className="material-symbols-outlined text-[16px]">add</span>
                             </button>
                           </div>

                           <div className="text-center sm:text-right w-full">
                             <p className="font-headline font-bold text-xl text-on-surface">{subtotal.toFixed(2)} €</p>
                           </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(id, item.tipo)}
                          className="w-full sm:w-12 h-10 sm:h-auto flex items-center justify-center text-outline-variant hover:text-error hover:bg-error/10 border sm:border-0 sm:border-l border-outline-variant/20 transition-colors sm:pl-2 shrink-0"
                          title="Eliminar"
                        >
                          <span className="material-symbols-outlined text-[20px] sm:text-[24px]">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Resumen de pedido */}
              <div className="lg:w-1/3">
                <div className="glass-panel p-8 sticky top-32 flex flex-col h-fit">
                  <h3 className="font-headline text-xl font-bold uppercase tracking-widest text-on-surface mb-6 flex items-center gap-2 pb-4 border-b border-outline-variant/20">
                     <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
                     Resumen
                  </h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center font-body text-sm text-on-surface-variant">
                      <span>Subtotal ({cartCount} artículos)</span>
                      <span className="font-semibold text-on-surface">{cartTotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between items-center font-body text-sm text-on-surface-variant">
                      <span>Gastos de envío</span>
                      <span className="font-label text-[10px] text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-sm border border-primary/20">Gratis</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-outline-variant/20 mb-8 mt-auto">
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-label text-[10px] text-outline uppercase tracking-[0.2em]">Total</span>
                      <span className="font-headline font-bold text-3xl text-primary">{cartTotal.toFixed(2)} €</span>
                    </div>
                    <p className="font-body text-[10px] text-outline-variant text-right uppercase">Impuestos Incluidos</p>
                  </div>

                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full primary-gradient-cta group"
                  >
                    <div className="cta-content">
                      <span>Procesar Pago</span>
                      <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}
