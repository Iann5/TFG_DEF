import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

export default function Reembolso() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col relative selection:bg-primary/30 selection:text-primary">
      {/* Texture overlay */}
      <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-20 z-0 bg-[url('/noise.svg')]"></div>

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />

        <main className="flex-grow pt-40 md:pt-48 pb-20 relative z-10 px-4 md:px-8 max-w-[1100px] w-full mx-auto">
          <div className="glass-panel p-8 md:p-12 relative overflow-hidden border border-outline-variant/30 rounded-sm space-y-10">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-outline hover:text-primary font-label text-[10px] uppercase tracking-widest transition-colors group w-fit"
            >
              <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
              Inicio
            </button>

            <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-wide leading-none">
              Política de Reembolso
            </h1>

            <div className="prose prose-invert max-w-none font-body text-on-surface-variant text-justify leading-relaxed">
              <p>
                En <strong>TATTOO PARADISE</strong> queremos que tengas una experiencia excelente. Esta Política de
                Reembolso describe las condiciones aplicables a devoluciones y reembolsos de productos y servicios
                contratados a través de la plataforma.
              </p>
              <br />

              <h2>1. Ámbito</h2>
              <br />
              <p>
                Esta política puede aplicarse, según corresponda, a:
              </p>
              <ul>
                <li>
                  <strong>Productos físicos</strong> (por ejemplo, merchandising).
                </li>
                <li>
                  <strong>Productos digitales</strong> (si aplica).
                </li>
                <li>
                  <strong>Servicios y reservas</strong> (por ejemplo, citas, señales o anticipos).
                </li>
              </ul>
              <br />

              <h2>2. Devoluciones de productos físicos</h2>
              <br />
              <p>
                Si has recibido un producto físico y deseas solicitar devolución, se aplicarán estas condiciones
                generales (salvo indicación distinta en la ficha del producto):
              </p>
              <ul>
                <li>• El producto debe devolverse en buen estado, sin uso indebido y con su embalaje original, cuando sea posible.</li>
                <li>• Podremos solicitar comprobante de compra (número de pedido o email asociado).</li>
                <li>• Los gastos de envío de devolución pueden correr a cargo del cliente, salvo que la devolución se deba a un error nuestro o producto defectuoso.</li>
              </ul>
              <br />

              <h2>3. Producto defectuoso o error en el pedido</h2>
              <br />
              <p>
                Si el producto llega defectuoso, dañado o no corresponde con el pedido, contacta con nosotros lo
                antes posible indicando el número de pedido y adjuntando, si puedes, fotografías del estado del
                producto y del embalaje. Te propondremos una solución: reemplazo, cupón o reembolso, según el caso.
              </p>
              <br />

              <h2>4. Reembolsos de servicios, reservas y citas</h2>
              <br />
              <p>
                Las reservas de citas y servicios pueden requerir señal/anticipo. En función del tipo de servicio y
                del estado de la reserva, el reembolso puede estar sujeto a condiciones específicas, como:
              </p>
              <ul>
                <li>• Plazos mínimos de cancelación para optar a reembolso total o parcial.</li>
                <li>• Reembolsos en forma de crédito para reprogramaciones, cuando sea aplicable.</li>
                <li>• No reembolso en cancelaciones tardías o ausencias (no-show), salvo causa justificada y aceptada.</li>
              </ul>
              <br />

              <h2>5. Plazos y método del reembolso</h2>
              <br />
              <p>
                Cuando proceda un reembolso, lo emitiremos por el mismo método de pago utilizado o por el medio
                acordado contigo. Los plazos pueden variar según la entidad bancaria o el proveedor de pago.
              </p>
              <br />

              <h2>6. Exclusiones</h2>
              <br />
              <p>
                Podrían existir exclusiones o limitaciones (según normativa aplicable y la naturaleza del producto o
                servicio), por ejemplo en productos personalizados, consumibles abiertos o servicios ya prestados.
              </p>
              <br />

              <h2>7. Contacto</h2>
              <br />
              <p>
                Para solicitar una devolución o reembolso, contáctanos indicando tu número de pedido y una breve
                descripción del caso:
              </p>
              <p>
                <strong>reembolsos@tatuoparadise.com</strong>
              </p>
              <br />

              <p>
                <strong>Nota:</strong> Este texto es una guía general. Para que refleje con precisión tu caso concreto,
                conviene revisarlo con asesoramiento legal.
              </p>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

