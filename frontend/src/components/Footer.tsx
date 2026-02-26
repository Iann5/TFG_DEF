export default function Footer() {
  return (
    // mt-auto empuja el footer siempre al final de la pantalla, aunque haya poco contenido
    <footer className="bg-black text-gray-300 py-8">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm font-bold tracking-widest uppercase">
                <div>Redes Sociales</div>
                <div className="mt-2 md:mt-0">Derechos de Autor</div>
            </div>
    </footer>
  );
}