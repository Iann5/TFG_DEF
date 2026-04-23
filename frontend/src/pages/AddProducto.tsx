import FormLayout from '../components/FormLayout';
import FormImageUpload from '../components/FormImageUpload';
import FormPricing from '../components/FormPricing';
import FormSubmitButton from '../components/FormSubmitButton';
import { useAddProducto } from '../hooks/useAddProducto';

export default function AddProducto() {
    const {
        isEdit,
        loading,
        enviando,
        mensaje,
        formData,
        porcentajeDescuento,
        archivo,
        imagenPrevia,
        setArchivo,
        handleInputChange,
        handlePorcentajeChange,
        handleSubmit
    } = useAddProducto();

    return (
        <FormLayout
            titlePrefix={isEdit ? 'Editar' : 'Añadir'}
            titleHighlight="Producto"
            mensaje={mensaje}
            onSubmit={handleSubmit}
        >
            {loading ? (
                <p className="text-center animate-pulse text-primary font-headline uppercase tracking-wide">Cargando datos...</p>
            ) : (
                <>
                    <div className="space-y-2 relative group flex flex-col items-start block overflow-visible mt-2">
                        <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                             Nombre del Producto
                        </label>
                        <input
                            name="nombre"
                            type="text"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            className="w-full bg-surface-container border border-outline-variant/30 p-3 font-body text-base outline-none focus:border-primary transition-colors text-on-surface placeholder:text-outline-variant/50 rounded-sm"
                            required
                        />
                    </div>

                    <div className="space-y-2 relative group flex flex-col items-start block overflow-visible mt-6">
                        <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                            Descripción
                        </label>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleInputChange}
                            className="w-full bg-surface-container border border-outline-variant/30 p-3 font-body text-base outline-none focus:border-primary transition-colors h-32 resize-none text-on-surface placeholder:text-outline-variant/50 rounded-sm"
                            required
                        />
                    </div>

                    <div className="space-y-2 relative group flex flex-col items-start block overflow-visible mt-6 mb-6">
                        <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                            Stock Disponible
                        </label>
                        <input
                            name="stock"
                            type="number"
                            value={formData.stock}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full bg-surface-container border border-outline-variant/30 p-3 font-body text-base outline-none focus:border-primary transition-colors text-on-surface placeholder:text-outline-variant/50 rounded-sm"
                            required
                        />
                    </div>

                    <FormImageUpload
                        archivo={archivo}
                        imagenPrevia={imagenPrevia}
                        onChange={(e) => e.target.files && setArchivo(e.target.files[0])}
                        isRequired={!isEdit}
                        label="Imagen del Producto"
                    />

                    <FormPricing
                        precioOriginal={formData.precioOriginal}
                        precioOferta={formData.precioOferta}
                        porcentajeDescuento={porcentajeDescuento}
                        onPrecioOriginalChange={handleInputChange}
                        onPorcentajeChange={handlePorcentajeChange}
                    />

                    <FormSubmitButton
                        loading={enviando}
                        loadingText="Procesando..."
                        text={isEdit ? 'Actualizar Producto' : 'Publicar Producto'}
                    />
                </>
            )}
        </FormLayout>
    );
}