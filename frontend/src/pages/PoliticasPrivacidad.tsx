import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

export default function PoliticasPrivacidad() {
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
              Políticas de Privacidad
            </h1>

            <div className="prose prose-invert max-w-none font-body text-on-surface-variant text-justify leading-relaxed">
              <p>
                En <strong>TATTOO PARADISE</strong> (en adelante, la “Empresa”), valoramos tu privacidad.
                Esta Política de Privacidad describe cómo recopilamos, usamos y protegemos la información cuando
                navegas o utilizas nuestros servicios y contenidos a través de esta web.
              </p>
              <br />
              <h2>1. Información que podemos recopilar</h2>
              <br />
              <p>
                Podemos recopilar, entre otros, los siguientes tipos de información:
              </p>
              <ul>
                <li>
                  <strong>Información de identificación</strong>: por ejemplo, nombre, apellidos, email o datos de contacto
                  cuando te registras o interactúas con nosotros.
                </li>
                <li>
                  <strong>Información relacionada con tus solicitudes</strong>: por ejemplo, mensajes, consultas o
                  formularios que completes.
                </li>
                <li>
                  <strong>Datos de uso</strong>: como páginas visitadas, tiempo de navegación y eventos de interacción
                  con la plataforma, con fines de mejora y analítica.
                </li>
                <li>
                  <strong>Datos del carrito y/o procesos de compra</strong> (si aplica): información asociada a
                  productos seleccionados y el flujo de checkout.
                </li>
              </ul>
              <br />
              <h2>2. Para qué usamos tus datos</h2>
              <br />
              <p>
                Usamos la información para finalidades como:
              </p>
              
              <ul>
                <li>• Gestionar tu registro y tu acceso a las funcionalidades disponibles.</li>
                <li>• Responder a tus consultas y gestionar solicitudes o reservas.</li>
                <li>• Ofrecer, mantener y mejorar nuestros servicios y contenidos.</li>
                <li>• Realizar análisis agregados de uso y rendimiento de la web.</li>
                <li>• Gestionar operaciones relacionadas con compras, pedidos o confirmaciones (si aplica).</li>
                <li>• Garantizar la seguridad, prevenir fraudes y cumplir obligaciones legales.</li>
              </ul>
              <br />
              <h2>3. Base legal del tratamiento</h2>
              <br />
              <p>
                En la medida en que resulte aplicable, el tratamiento de datos se basará en una o varias de las
                siguientes bases legales: la ejecución de un contrato o medidas precontractuales; el cumplimiento
                de obligaciones legales; el interés legítimo; y/o tu consentimiento cuando este sea requerido.
              </p>
              <br />
              <h2>4. Conservación de los datos</h2>
              <br />
              <p>
                Conservamos los datos durante el tiempo necesario para cumplir con las finalidades descritas en esta
                Política de Privacidad. Posteriormente, los eliminamos o anonimizamos de forma segura, salvo que
                sea necesario conservarlos para atender reclamaciones o cumplir requisitos legales aplicables.
              </p>
              <br />
              <h2>5. Acceso, rectificación y otros derechos</h2>
              <br />
              <p>
                Dependiendo de la normativa aplicable, puedes solicitar el ejercicio de derechos como:
              </p>
              <ul>
                <li>• Acceso a tus datos.</li>
                <li>• Rectificación de datos inexactos o incompletos.</li>
                <li>• Supresión (eliminación) de tus datos, en determinados supuestos.</li>
                <li>• Oposición al tratamiento en ciertos casos.</li>
                <li>• Limitación del tratamiento en determinadas circunstancias.</li>
                <li>• Portabilidad de los datos, cuando sea aplicable.</li>
                <li>• Retirar el consentimiento cuando el tratamiento se base en el consentimiento (si aplica).</li>
              </ul>
              <br />
              <p>
                Para ejercer tus derechos, puedes contactarnos a través de la dirección de correo indicada en el apartado
                “Contacto”.
              </p>
              <br />
              <h2>6. Transferencias internacionales</h2>
              <br />
              <p>
                Si utilizamos proveedores que puedan tratar datos fuera del país donde te encuentres, lo haremos
                con las garantías exigidas por la normativa aplicable. Cuando proceda, aplicaremos mecanismos
                legales para asegurar un nivel de protección adecuado.
              </p>
              <br />
              <h2>7. Seguridad de la información</h2>
              <br />
              <p>
                Implementamos medidas técnicas y organizativas razonables para proteger los datos frente a accesos
                no autorizados, alteración, divulgación o destrucción. Aun así, ningún sistema es completamente
                seguro y no podemos garantizar una seguridad absoluta.
              </p>
              <br />
              <h2>8. Cookies y tecnologías similares</h2>
              <br />
              <p>
                Podemos utilizar cookies y tecnologías similares para recordar preferencias, analizar el uso del sitio
                y mejorar la experiencia de usuario. Puedes configurar tu navegador para limitar o bloquear cookies,
                aunque algunas funciones de la web podrían verse afectadas.
              </p>
              <br />
              <h2>9. Cambios en esta Política</h2>
              <br />
              <p>
                Podemos actualizar esta Política de Privacidad para reflejar cambios en nuestros servicios o en la
                normativa aplicable. Te recomendamos revisar esta sección periódicamente.
              </p>
              <br />
              <h2>10. Contacto</h2>
              <br />
              <p>
                Si tienes preguntas sobre esta Política de Privacidad o deseas ejercer tus derechos, puedes escribirnos
                a la siguiente dirección:
              </p>

              <p>
                <strong>privacidad@tatuoparadise.com</strong>
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

