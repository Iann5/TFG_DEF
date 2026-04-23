import FormLayout from '../components/FormLayout';
import FormImageUpload from '../components/FormImageUpload';
import FormPricing from '../components/FormPricing';
import FormSubmitButton from '../components/FormSubmitButton';
import { useAddTatuaje } from '../hooks/useAddTatuaje';

export default function AddTatuaje() {
    const {
        isEdit,
        formData,
        archivo,
        setArchivo,
        imagenPrevia,
        loading,
        enviando,
        mensaje,
        porcentajeDescuento,
        estilos,
        loadingEstilos,
        handleSubmit,
        handleInputChange,
        handlePorcentajeChange
    } = useAddTatuaje();

    return (
        <FormLayout
            titlePrefix={isEdit ? 'Editar' : 'Añadir'}
            titleHighlight="Proyecto"
            mensaje={mensaje}
            onSubmit={handleSubmit}
        >
            {loading ? (
                <p className="text-center animate-pulse text-primary font-headline uppercase tracking-wide">Cargando datos...</p>
            ) : (
                <>
                    <div className="space-y-2 relative group flex flex-col items-start block overflow-visible">
                        <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                            Título del Proyecto
                        </label>
                        <input
                            type="text"
                            name="tituloTatuaje"
                            value={formData.tituloTatuaje}
                            placeholder="Ej: Dragón Japonés"
                            onChange={handleInputChange}
                            required
                            className="w-full bg-surface-container border border-outline-variant/30 p-3 font-body text-base outline-none focus:border-primary transition-colors text-on-surface placeholder:text-outline-variant/50 rounded-sm w-[99%]"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 relative group flex flex-col items-start block overflow-visible">
                            <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                                Estilo
                            </label>
                            <div className="relative w-[99%]">
                                <select
                                    name="estiloId"
                                    value={formData.estiloId}
                                    onChange={handleInputChange}
                                    disabled={loadingEstilos || estilos.length === 0}
                                    required
                                    className="w-full bg-surface-container border border-outline-variant/30 p-3 font-body text-base outline-none focus:border-primary transition-colors text-on-surface appearance-none cursor-pointer disabled:opacity-50 rounded-sm"
                                >
                                    <option value="" disabled>
                                        {loadingEstilos ? 'Cargando estilos...' : 'Selecciona un estilo'}
                                    </option>
                                    {estilos.map(estilo => (
                                        <option key={estilo.id} value={estilo.id.toString()}>
                                            {estilo.nombre}
                                        </option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline-variant">expand_more</span>
                            </div>
                        </div>

                        <div className="space-y-2 relative group flex flex-col items-start block overflow-visible z-10 w-[99%]">
                            <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                                Tipo
                            </label>
                            <div className="flex gap-6 p-3 bg-surface-container/50 border border-outline-variant/30 items-center justify-start rounded-sm z-0 relative">
                                {(['Tatuaje', 'Plantilla'] as const).map((t) => (
                                    <label key={t} className="flex items-center gap-3 cursor-pointer group/radio">
                                        <input
                                            type="radio"
                                            name="tipo"
                                            value={t}
                                            checked={formData.tipo === t}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 accent-primary cursor-pointer border-outline-variant"
                                        />
                                        <span className={`text-sm font-label tracking-wide uppercase transition-colors ${formData.tipo === t ? 'text-primary' : 'text-on-surface-variant group-hover/radio:text-on-surface'}`}>{t}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <FormImageUpload
                        archivo={archivo}
                        imagenPrevia={imagenPrevia}
                        onChange={(e) => e.target.files && setArchivo(e.target.files[0])}
                        isRequired={!isEdit}
                        label="Imagen del Proyecto"
                    />

                    <FormPricing
                        precioOriginal={formData.precioOriginal}
                        precioOferta={formData.precioOferta}
                        porcentajeDescuento={porcentajeDescuento}
                        onPrecioOriginalChange={handleInputChange}
                        onPorcentajeChange={handlePorcentajeChange}
                    />

                    {/* Descripción (si hay oferta, describe condiciones; si no, orienta tamaño/precio) */}
                    <div className="space-y-2 relative group flex flex-col items-start block overflow-visible">
                        <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                            {formData.precioOferta ? 'Descripción de la oferta' : 'Descripción (orientación tamaño/precio)'}
                        </label>
                        <input
                            type="text"
                            name="descripcionOferta"
                            value={formData.descripcionOferta}
                            onChange={handleInputChange}
                            placeholder={
                                formData.precioOferta
                                    ? 'Esa oferta se aplica a partir de 10cm de tamaño, si lo quieres más grande se te aplicará la misma oferta pero el precio sube'
                                    : 'Ej: El precio corresponde aprox. a 10cm. Para tamaños mayores el precio sube según el diseño.'
                            }
                            className="w-full bg-surface-container border border-outline-variant/30 p-3 font-body text-base outline-none focus:border-primary transition-colors text-on-surface placeholder:text-outline-variant/50 rounded-sm w-[99%]"
                        />
                    </div>

                    <FormSubmitButton
                        loading={enviando}
                        loadingText="Procesando..."
                        text={isEdit ? 'Actualizar Proyecto' : 'Crear Proyecto'}
                    />
                </>
            )}
        </FormLayout>
    );
}