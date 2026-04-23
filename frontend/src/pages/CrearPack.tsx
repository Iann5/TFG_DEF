import { type ItemSelect, type PackType } from '../types/Pack';
import FormLayout from '../components/FormLayout';
import FormPricing from '../components/FormPricing';
import FormSubmitButton from '../components/FormSubmitButton';
import { useCrearPack } from '../hooks/useCrearPack';

export default function CrearPack() {
    const {
        isEdit,
        loading,
        enviando,
        mensaje,
        formData,
        handleInputChange,
        activedPackType,
        productosSeleccionados,
        plantillasSeleccionadas,
        tatuajesSeleccionados,
        porcentajeDescuento,
        handlePorcentajeChange,
        productosDisponibles,
        plantillasDisponibles,
        tatuajesDisponibles,
        galeriaImagenes,
        handleAddImagenes,
        removeImagen,
        esPackProducto,
        stockLabel,
        handleSubmit,
        toggleItem,
        multiInputRef
    } = useCrearPack();

    const renderSelectionSection = (
        title: string,
        category: PackType,
        items: ItemSelect[],
        selectedItems: ItemSelect[],
        colors: { label: string; bgActive: string; borderActive: string },
        emptyMessage: string
    ) => {
        const isDisabled = activedPackType && activedPackType !== category;
        return (
            <div className={`p-6 border border-outline-variant/30 relative transition-opacity bg-surface-container/20 rounded-sm mt-4 ${isDisabled ? 'opacity-40 pointer-events-none' : ''}`}>
                <label className={`${colors.label} absolute -top-3 left-4 px-2 bg-background font-label text-[10px] tracking-[0.2em] uppercase`}>{title}</label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {items.map(p => {
                        const isSelected = selectedItems.some(s => s.id === p.id);
                        return (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => toggleItem(p, category)}
                                className={`px-4 py-2 font-body text-xs tracking-wide uppercase transition-colors border rounded-none flex items-center gap-2 ${isSelected ? `${colors.bgActive} ${colors.borderActive} font-bold` : 'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:border-primary/50 hover:text-on-surface'}`}
                            >
                                {p.tituloTatuaje || p.nombre}
                                {isSelected ? (
                                    <span className="material-symbols-outlined text-[16px]">check</span>
                                ) : (
                                    <span className="material-symbols-outlined text-[16px] opacity-30">add</span>
                                )}
                            </button>
                        );
                    })}
                    {items.length === 0 && <span className="text-xs font-label text-outline uppercase tracking-widest">{emptyMessage}</span>}
                </div>
            </div>
        );
    };

    return (
        <FormLayout
            titlePrefix={isEdit ? 'Editar' : 'Crear'}
            titleHighlight="Pack"
            mensaje={mensaje}
            onSubmit={handleSubmit}
        >
            {loading ? (
                <p className="text-center animate-pulse text-primary font-headline uppercase tracking-wide">Cargando datos...</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-2 relative group flex flex-col items-start block overflow-visible">
                            <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                                Título del pack
                            </label>
                            <input name="nombrePack" value={formData.nombrePack} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant/30 p-3 font-body text-base outline-none focus:border-primary transition-colors text-on-surface placeholder:text-outline-variant/50 rounded-sm w-[99%]" required />
                        </div>
                        <div className="space-y-2 relative group flex flex-col items-start block overflow-visible">
                            <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                                Tipo de pack
                            </label>
                            <input name="tipoDePack" value={formData.tipoDePack} readOnly placeholder="Se autocompleta..." className="w-full bg-surface-container/50 border border-outline-variant/30 p-3 font-body text-base outline-none text-outline-variant cursor-not-allowed uppercase transition-colors rounded-sm w-[99%]" required />
                        </div>
                    </div>

                    <div className="space-y-3 relative group border border-outline-variant/30 p-6 bg-surface-container/30 transition-colors mb-8 rounded-sm">
                        <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-2">
                             Galería de Imágenes
                        </label>
                        <div className="flex items-center gap-4 overflow-x-auto pt-2 pb-2 scrollbar-hide">
                            <button
                                type="button"
                                onClick={() => multiInputRef.current?.click()}
                                className="w-24 h-24 shrink-0 border border-outline-variant/50 border-dashed flex flex-col items-center justify-center hover:border-primary/50 hover:text-primary transition-colors text-outline-variant/50 group/add rounded-sm bg-surface-container"
                            >
                                <span className="material-symbols-outlined text-3xl font-light">add_photo_alternate</span>
                            </button>
                            {galeriaImagenes.map((img, idx) => (
                                <div key={idx} className="relative w-24 h-24 shrink-0 border border-outline-variant/30 overflow-hidden group/img transition-transform hover:-translate-y-1 rounded-sm">
                                    <img src={img} className="w-full h-full object-cover transition-opacity opacity-80 group-hover/img:opacity-100" alt={`Pack ${idx}`} />
                                    <button
                                        type="button"
                                        onClick={() => removeImagen(idx)}
                                        className="absolute top-1 right-1 bg-error/90 w-6 h-6 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity rounded-sm"
                                    >
                                        <span className="material-symbols-outlined text-on-error text-[14px]">close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <input type="file" multiple ref={multiInputRef} className="hidden" accept="image/*" onChange={handleAddImagenes} />
                    </div>

                    <div className="grid grid-cols-1 gap-6 mb-8 border-t border-outline-variant/30 pt-6">
                        {renderSelectionSection("Incluir Productos", "producto", productosDisponibles, productosSeleccionados, { label: "text-primary", bgActive: "bg-primary/20 text-primary border-primary", borderActive: "" }, "No hay productos disponibles")}
                        {renderSelectionSection("Incluir Plantillas", "plantilla", plantillasDisponibles, plantillasSeleccionadas, { label: "text-secondary-container", bgActive: "bg-secondary-container/20 text-secondary-container border-secondary-container", borderActive: "" }, "No hay plantillas disponibles")}
                        {renderSelectionSection("Incluir Tatuajes", "tatuaje", tatuajesDisponibles, tatuajesSeleccionados, { label: "text-tertiary", bgActive: "bg-tertiary/20 text-tertiary border-tertiary", borderActive: "" }, "No hay tatuajes disponibles")}
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2 relative group flex flex-col items-start block overflow-visible">
                            <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                                Descripción del pack
                            </label>
                            <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant/30 p-3 font-body text-base outline-none focus:border-primary transition-colors h-32 resize-none text-on-surface placeholder:text-outline-variant/50 rounded-sm" required />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2 relative group flex flex-col items-start block overflow-visible">
                                <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                                    {stockLabel}
                                </label>
                                <input name="stock" type="number" min="0" value={formData.stock} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant/30 p-3 font-body text-base outline-none focus:border-primary transition-colors text-on-surface placeholder:text-outline-variant/50 rounded-sm" required />
                                {!esPackProducto && (
                                    <p className="text-outline-variant font-body text-xs">
                                        Este stock no se muestra a usuarios. Se descuenta 1 cada vez que reserven una cita de este pack.
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2 relative group flex flex-col items-start block overflow-visible">
                                <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                                    Artículos totales
                                </label>
                                <input name="cantidad" type="number" min="1" value={formData.cantidad} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant/30 p-3 font-body text-base outline-none focus:border-primary transition-colors text-on-surface placeholder:text-outline-variant/50 rounded-sm" required />
                            </div>
                        </div>
                        <FormPricing precioOriginal={formData.precioOriginal} precioOferta={formData.precioOferta} porcentajeDescuento={porcentajeDescuento} onPrecioOriginalChange={handleInputChange} onPorcentajeChange={handlePorcentajeChange} />
                    </div>

                    <FormSubmitButton loading={enviando} loadingText="Procesando..." text={isEdit ? 'Actualizar Pack' : 'Crear Pack'} />
                </>
            )}
        </FormLayout>
    );
}